import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import mongoose from 'mongoose';
import Airline from '../models/airlinesmodel.js';
import GroupTicket from '../models/groupticketmodel.js';
import GroupTicketCategory from '../models/groupticketcategorymodel.js';
import { TicketIntegration, TicketIntegrationKey } from '../models/ticketintegrationmodel.js';
import {
  decryptIntegrationKey,
  encryptIntegrationKey,
  fetchIntegrationTickets,
  normalizeIntegrationBaseUrl,
} from '../utils/ticketIntegration.js';

const syncIntervalMs = 15 * 60 * 1000;
const syncLockMs = 2 * 60 * 1000;
const fareFields = ['adultFare', 'childFare', 'infantFare'];
const keyHash = (value) => createHash('sha256').update(value).digest('hex');

const safeIntegration = (integration) => ({
  _id: integration._id,
  name: integration.name,
  baseUrl: integration.baseUrl,
  category: integration.category,
  sourceCategorySlug: integration.sourceCategorySlug || '',
  isActive: integration.isActive,
  hasApiKey: Boolean(integration.apiKeyEncrypted),
  lastSyncAt: integration.lastSyncAt,
  lastSyncError: integration.lastSyncError,
  lastSyncCount: integration.lastSyncCount,
  createdAt: integration.createdAt,
});

const applySourceTickets = async (integration, tickets) => {
  const existing = await GroupTicket.find({ sourceIntegration: integration._id })
    .select('sourceTicketId reservedBooking airlineId adultFare childFare infantFare priceOverrides currency currencyOverride')
    .lean();
  if (!(await GroupTicketCategory.exists({ _id: integration.category }))) {
    throw new Error('The local ticket category for this connection no longer exists.');
  }
  const existingBySourceId = new Map(existing.map((ticket) => [ticket.sourceTicketId, ticket]));
  const categories = await GroupTicketCategory.find().select('slug').lean();
  const categoryIdsBySlug = new Map(categories.map((category) => [category.slug.toLowerCase(), category._id]));
  const airlines = await Airline.find().select('name').lean();
  const airlineIds = new Map(airlines.map((airline) => [airline.name.trim().toLowerCase(), airline._id]));
  const receivedIds = new Set(tickets.map((ticket) => ticket.sourceId));
  const operations = tickets.map((ticket) => {
    const previous = existingBySourceId.get(ticket.sourceId);
    const priceOverrides = previous?.priceOverrides || {};
    const effectiveFares = Object.fromEntries(fareFields.map((field) => [
      field,
      priceOverrides[field] ? previous[field] : ticket.sourceFares[field],
    ]));
    const airlineId = airlineIds.get(ticket.airline.toLowerCase());
    const set = {
      sourceIntegration: integration._id,
      sourceTicketId: ticket.sourceId,
      category: categoryIdsBySlug.get(ticket.sourceCategorySlug.toLowerCase()) || integration.category,
      airline: ticket.airline,
      airlineLogo: ticket.airlineLogo,
      ...(airlineId ? { airlineId } : {}),
      groupName: ticket.groupName,
      departureDate: ticket.departureDate,
      segments: ticket.segments,
      baggage: ticket.baggage,
      mealAvailable: ticket.mealAvailable,
      infantPriceOnCall: ticket.infantPriceOnCall,
      currency: ticket.currency,
      sourceCurrency: ticket.currency,
      currencyOverride: Boolean(previous?.currencyOverride),
      sourceFares: ticket.sourceFares,
      sourceAvailable: ticket.sourceAvailable,
      isActive: true,
      isAvailable: ticket.sourceAvailable && !previous?.reservedBooking,
      ...effectiveFares,
      currency: previous?.currencyOverride ? previous.currency : ticket.currency,
      ...Object.fromEntries(fareFields.map((field) => [`priceOverrides.${field}`, Boolean(priceOverrides[field])])),
    };
    return {
      updateOne: {
        filter: { sourceIntegration: integration._id, sourceTicketId: ticket.sourceId },
        update: {
          $set: set,
          ...(!airlineId ? { $unset: { airlineId: 1 } } : {}),
        },
        upsert: true,
      },
    };
  });
  if (operations.length) await GroupTicket.bulkWrite(operations, { ordered: true });

  const missingIds = existing
    .filter((ticket) => !receivedIds.has(ticket.sourceTicketId))
    .map((ticket) => ticket._id);
  if (missingIds.length) {
    await GroupTicket.updateMany(
      { _id: { $in: missingIds } },
      { $set: { isActive: false, isAvailable: false, sourceAvailable: false } }
    );
  }
  return { imported: tickets.length, removed: missingIds.length };
};

const claimSyncLock = (id) => TicketIntegration.findOneAndUpdate(
  {
    _id: id,
    isActive: true,
    $or: [{ syncLockUntil: null }, { syncLockUntil: { $lt: new Date() } }],
  },
  { $set: { syncLockUntil: new Date(Date.now() + syncLockMs) } },
  { new: true }
);

const runIntegrationSync = async (integration) => {
  const tickets = await fetchIntegrationTickets(
    integration.baseUrl,
    decryptIntegrationKey(integration.apiKeyEncrypted),
    integration.sourceCategorySlug || ''
  );
  const result = await applySourceTickets(integration, tickets.tickets);
  await TicketIntegration.updateOne(
    { _id: integration._id },
    {
      $set: {
        lastSyncAt: new Date(),
        lastSyncError: '',
        lastSyncCount: result.imported,
      },
      $unset: { syncLockUntil: 1 },
    }
  );
  return result;
};

const syncWithLock = async (id) => {
  const integration = await claimSyncLock(id);
  if (!integration) {
    const exists = await TicketIntegration.exists({ _id: id, isActive: true });
    if (!exists) throw new Error('Connected website not found or disabled.');
    throw new Error('A sync for this website is already running.');
  }
  try {
    return await runIntegrationSync(integration);
  } catch (error) {
    await TicketIntegration.updateOne(
      { _id: integration._id },
      { $set: { lastSyncError: error.message }, $unset: { syncLockUntil: 1 } }
    );
    throw error;
  }
};

export const getTicketIntegrationKeys = async (_req, res) => {
  try {
    const keys = await TicketIntegrationKey.find().sort({ createdAt: -1 }).lean();
    res.json({
      success: true,
      data: keys.map(({ _id, name, keyPrefix, isActive, lastUsedAt, createdAt }) => ({
        _id, name, keyPrefix, isActive, lastUsedAt, createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTicketIntegrationKey = async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    if (!name || name.length > 80) {
      return res.status(400).json({ success: false, message: 'Enter a key name up to 80 characters.' });
    }
    const secret = randomBytes(32).toString('base64url');
    const key = await TicketIntegrationKey.create({
      name,
      keyHash: keyHash(secret),
      keyPrefix: secret.slice(0, 12),
    });
    res.status(201).json({
      success: true,
      message: 'Copy this API key now. It cannot be shown again.',
      data: { _id: key._id, name: key.name, key: secret, keyPrefix: key.keyPrefix },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const revokeTicketIntegrationKey = async (req, res) => {
  try {
    const key = await TicketIntegrationKey.findByIdAndUpdate(
      req.params.id,
      { $set: { isActive: false } },
      { new: true }
    );
    if (!key) return res.status(404).json({ success: false, message: 'API key not found.' });
    res.json({ success: true, message: 'API key revoked.' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const exportGroupTickets = async (req, res) => {
  try {
    const authorization = req.get('authorization') || '';
    const providedKey = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
    if (!providedKey) return res.status(401).json({ success: false, message: 'A valid API key is required.' });
    const prefix = providedKey.slice(0, 12);
    const candidates = await TicketIntegrationKey.find({ keyPrefix: prefix, isActive: true });
    const providedHash = Buffer.from(keyHash(providedKey), 'hex');
    const key = candidates.find((candidate) => {
      const savedHash = Buffer.from(candidate.keyHash, 'hex');
      return savedHash.length === providedHash.length && timingSafeEqual(savedHash, providedHash);
    });
    if (!key) return res.status(401).json({ success: false, message: 'A valid API key is required.' });
    key.lastUsedAt = new Date();
    await key.save();

    const categories = await GroupTicketCategory.find().select('name slug').sort({ name: 1 }).lean();
    const categoriesOnly = req.query.categoriesOnly === 'true';
    const filter = categoriesOnly ? null : {
      isActive: true,
      sourceIntegration: { $exists: false },
    };
    if (req.query.category) {
      const selectedCategory = categories.find((category) => category.slug === String(req.query.category).toLowerCase());
      if (!selectedCategory) {
        return res.status(400).json({ success: false, message: 'Source ticket category was not found.' });
      }
      if (filter) filter.category = selectedCategory._id;
    }
    const tickets = filter
      ? await GroupTicket.find(filter).select(
        'airline airlineLogo groupName departureDate segments baggage mealAvailable adultFare childFare infantFare infantPriceOnCall currency isAvailable'
      ).populate('category', 'name slug').lean()
      : [];
    res.set('Cache-Control', 'no-store');
    res.json({
      success: true,
      complete: true,
      categories: categories.map(({ name, slug }) => ({ name, slug })),
      data: tickets.map((ticket) => ({
        sourceId: String(ticket._id),
        category: ticket.category ? { name: ticket.category.name, slug: ticket.category.slug } : null,
        airline: ticket.airline,
        airlineLogo: ticket.airlineLogo,
        groupName: ticket.groupName,
        departureDate: ticket.departureDate,
        segments: ticket.segments,
        baggage: ticket.baggage,
        mealAvailable: ticket.mealAvailable,
        adultFare: ticket.adultFare,
        childFare: ticket.childFare,
        infantFare: ticket.infantFare,
        infantPriceOnCall: ticket.infantPriceOnCall,
        currency: ticket.currency,
        isAvailable: ticket.isAvailable,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const previewTicketIntegration = async (req, res) => {
  try {
    const baseUrl = String(req.body.baseUrl || '').trim().replace(/\/+$/, '');
    const apiKey = String(req.body.apiKey || '').trim();
    if (!apiKey || apiKey.length > 512) {
      return res.status(400).json({ success: false, message: 'Enter the source API key to load its categories.' });
    }
    const result = await fetchIntegrationTickets(baseUrl, apiKey, '', true);
    res.json({ success: true, data: result.categories });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getTicketIntegrations = async (_req, res) => {
  try {
    const integrations = await TicketIntegration.find().populate('category', 'name').sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: integrations.map(safeIntegration) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTicketIntegration = async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const baseUrl = String(req.body.baseUrl || '').trim().replace(/\/+$/, '');
    const apiKey = String(req.body.apiKey || '').trim();
    const categoryId = String(req.body.category || '');
    if (!name || name.length > 80) {
      return res.status(400).json({ success: false, message: 'Enter a website name up to 80 characters.' });
    }
    if (!apiKey || apiKey.length > 512) {
      return res.status(400).json({ success: false, message: 'Enter a valid source API key.' });
    }
    if (!mongoose.isValidObjectId(categoryId)
      || !(await GroupTicketCategory.exists({ _id: categoryId }))) {
      return res.status(400).json({ success: false, message: 'Select a valid local ticket category.' });
    }
    const sourceCategorySlug = String(req.body.sourceCategorySlug || '').trim().toLowerCase();
    const source = await fetchIntegrationTickets(baseUrl, apiKey, sourceCategorySlug);
    const integration = await TicketIntegration.create({
      name,
      baseUrl,
      apiKeyEncrypted: encryptIntegrationKey(apiKey),
      category: categoryId,
      sourceCategorySlug,
    });
    const result = await applySourceTickets(integration, source.tickets);
    integration.lastSyncAt = new Date();
    integration.lastSyncCount = result.imported;
    await integration.save();
    const populated = await integration.populate('category', 'name');
    res.status(201).json({
      success: true,
      message: `${result.imported} ticket(s) synced from ${name}.`,
      data: safeIntegration(populated),
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateTicketIntegration = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid connected website id.' });
    }
    const integration = await TicketIntegration.findById(id);
    if (!integration) return res.status(404).json({ success: false, message: 'Connected website not found.' });
    if (req.body.name !== undefined) {
      const name = String(req.body.name).trim();
      if (!name || name.length > 80) return res.status(400).json({ success: false, message: 'Enter a website name up to 80 characters.' });
      integration.name = name;
    }
    if (req.body.baseUrl !== undefined) {
      const baseUrl = String(req.body.baseUrl).trim().replace(/\/+$/, '');
      await normalizeIntegrationBaseUrl(baseUrl);
      integration.baseUrl = baseUrl;
    }
    if (req.body.category !== undefined) {
      if (!mongoose.isValidObjectId(req.body.category)
        || !(await GroupTicketCategory.exists({ _id: req.body.category }))) {
        return res.status(400).json({ success: false, message: 'Select a valid local ticket category.' });
      }
      integration.category = req.body.category;
    }
    if (req.body.sourceCategorySlug !== undefined) {
      const sourceCategorySlug = String(req.body.sourceCategorySlug || '').trim().toLowerCase();
      if (sourceCategorySlug.length > 120 || (sourceCategorySlug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(sourceCategorySlug))) {
        return res.status(400).json({ success: false, message: 'Select a valid source ticket category.' });
      }
      integration.sourceCategorySlug = sourceCategorySlug;
    }
    if (req.body.apiKey !== undefined) {
      const apiKey = String(req.body.apiKey).trim();
      if (!apiKey || apiKey.length > 512) return res.status(400).json({ success: false, message: 'Enter a valid source API key.' });
      integration.apiKeyEncrypted = encryptIntegrationKey(apiKey);
    }
    if (req.body.isActive !== undefined) integration.isActive = Boolean(req.body.isActive);
    await integration.save();
    const populated = await integration.populate('category', 'name');
    res.json({ success: true, data: safeIntegration(populated) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteTicketIntegration = async (req, res) => {
  try {
    const integration = await TicketIntegration.findByIdAndUpdate(
      req.params.id,
      { $set: { isActive: false, lastSyncError: 'Connection disabled by administrator.' } },
      { new: true }
    );
    if (!integration) return res.status(404).json({ success: false, message: 'Connected website not found.' });
    await GroupTicket.updateMany(
      { sourceIntegration: integration._id },
      { $set: { isActive: false, isAvailable: false, sourceAvailable: false } }
    );
    res.json({ success: true, message: 'Connection disabled and its tickets hidden.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const syncTicketIntegration = async (req, res) => {
  try {
    const result = await syncWithLock(req.params.id);
    res.json({ success: true, message: `Sync complete: ${result.imported} ticket(s) updated, ${result.removed} removed.`, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const syncDueTicketIntegrations = async (_req, res) => {
  try {
    const cutoff = new Date(Date.now() - syncIntervalMs);
    const integrations = await TicketIntegration.find({
      isActive: true,
      $or: [{ lastSyncAt: null }, { lastSyncAt: { $lte: cutoff } }],
    }).select('_id').lean();
    const results = [];
    for (const integration of integrations) {
      try {
        results.push({ id: String(integration._id), success: true, ...(await syncWithLock(integration._id)) });
      } catch (error) {
        results.push({ id: String(integration._id), success: false, message: error.message });
      }
    }
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const syncDueTicketIntegrationsCronAuth = (req, res, next) => {
  const secret = process.env.CRON_SECRET;
  if (!secret) return res.status(503).json({ success: false, message: 'CRON_SECRET is not configured.' });
  if (req.get('authorization') !== `Bearer ${secret}`) {
    return res.status(401).json({ success: false, message: 'Unauthorized.' });
  }
  return next();
};
