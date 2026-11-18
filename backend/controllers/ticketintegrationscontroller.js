import mongoose from 'mongoose';
import Airline from '../models/airlinesmodel.js';
import GroupTicket from '../models/groupticketmodel.js';
import GroupTicketCategory from '../models/groupticketcategorymodel.js';
import { TicketIntegration, TicketIntegrationAccess } from '../models/ticketintegrationmodel.js';
import {
  decryptIntegrationKey,
  encryptIntegrationKey,
  fetchAlHaiderTickets,
  fetchIntegrationTickets,
  loginAlHaider,
  logoutAlHaider,
  normalizeIntegrationBaseUrl,
} from '../utils/ticketIntegration.js';

const syncIntervalMs = 15 * 60 * 1000;
const syncLockMs = 2 * 60 * 1000;
const fareFields = ['adultFare', 'childFare', 'infantFare'];
const normalizeEmail = (value) => {
  const email = String(value ?? '').trim().toLowerCase();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '';
};
// Words ignored when matching a source category (e.g. "KSA ONEWAY") to a local one (e.g. "PAK TO KSA").
const genericCategoryWords = new Set([
  'pak', 'pakistan', 'to', 'from', 'and', 'the', 'group', 'groups', 'ticket', 'tickets',
  'flight', 'flights', 'oneway', 'one', 'way', 'return',
]);
const categoryWords = (value) => String(value || '').toLowerCase().split(/[^a-z0-9]+/)
  .filter((word) => word && !genericCategoryWords.has(word));

const safeIntegration = (integration) => ({
  _id: integration._id,
  name: integration.name,
  baseUrl: integration.baseUrl,
  category: integration.category,
  sourceCategorySlug: integration.sourceCategorySlug || '',
  isActive: integration.isActive,
  accessEmail: integration.accessEmail || '',
  provider: integration.provider || 'foreignairtravel',
  loginExpiresAt: integration.sourceTokenExpiresAt || null,
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
  const categories = await GroupTicketCategory.find().select('name slug').lean();
  const categoryIdsBySlug = new Map(categories.map((category) => [category.slug.toLowerCase(), category._id]));
  const categoryWordSets = categories.map((category) => ({
    _id: category._id,
    words: new Set(categoryWords(`${category.slug} ${category.name}`)),
  }));
  const matchCategory = (slug) => {
    if (categoryIdsBySlug.has(slug)) return categoryIdsBySlug.get(slug);
    const words = categoryWords(slug);
    const matches = categoryWordSets.filter((category) => words.some((word) => category.words.has(word)));
    return matches.length === 1 ? matches[0]._id : integration.category;
  };
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
      category: matchCategory(ticket.sourceCategorySlug.toLowerCase()),
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
  let tickets;
  if (integration.provider === 'alhaider') {
    if (!integration.sourceTokenEncrypted) throw new Error('Edit this connection and enter the account password again.');
    let token;
    try {
      token = decryptIntegrationKey(integration.sourceTokenEncrypted);
    } catch {
      // Happens when this server's JWT_SECRET differs from the one that saved the login.
      throw new Error('The saved login cannot be read on this server. Edit this connection and enter the account password again.');
    }
    tickets = await fetchAlHaiderTickets(integration.baseUrl, token, integration.sourceCategorySlug || '');
  } else {
    if (!integration.accessEmail) throw new Error('Edit this connection and add the access email.');
    tickets = await fetchIntegrationTickets(
      integration.baseUrl,
      integration.accessEmail,
      integration.sourceCategorySlug || ''
    );
  }
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

export const getTicketAccessEmails = async (_req, res) => {
  try {
    const items = await TicketIntegrationAccess.find().sort({ createdAt: -1 }).lean();
    res.json({
      success: true,
      data: items.map(({ _id, email, isActive, lastUsedAt, createdAt }) => ({
        _id, email, isActive, lastUsedAt, createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const grantTicketAccessEmail = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!email) {
      return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
    }
    const access = await TicketIntegrationAccess.findOneAndUpdate(
      { email },
      { $set: { isActive: true } },
      { upsert: true, returnDocument: 'after' }
    );
    res.status(201).json({
      success: true,
      message: `Ticket access given to ${email}.`,
      data: { _id: access._id, email: access.email, isActive: access.isActive },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const revokeTicketAccessEmail = async (req, res) => {
  try {
    const access = await TicketIntegrationAccess.findByIdAndUpdate(
      req.params.id,
      { $set: { isActive: false } },
      { returnDocument: 'after' }
    );
    if (!access) return res.status(404).json({ success: false, message: 'Access email not found.' });
    res.json({ success: true, message: `Ticket access removed for ${access.email}.` });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const exportGroupTickets = async (req, res) => {
  try {
    const email = normalizeEmail(req.get('x-access-email'));
    if (!email) return res.status(401).json({ success: false, message: 'An email with ticket access is required.' });
    const access = await TicketIntegrationAccess.updateOne(
      { email, isActive: true },
      { $set: { lastUsedAt: new Date() } }
    );
    if (!access.matchedCount) {
      return res.status(403).json({ success: false, message: 'This email does not have ticket access.' });
    }

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
    const accessEmail = normalizeEmail(req.body.accessEmail);
    if (!accessEmail) {
      return res.status(400).json({ success: false, message: 'Enter the access email to load source categories.' });
    }
    const result = await fetchIntegrationTickets(baseUrl, accessEmail, '', true);
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
    const accessEmail = normalizeEmail(req.body.accessEmail);
    const categoryId = String(req.body.category || '');
    if (!name || name.length > 80) {
      return res.status(400).json({ success: false, message: 'Enter a website name up to 80 characters.' });
    }
    if (!accessEmail) {
      return res.status(400).json({ success: false, message: 'Enter the email that has ticket access on the source website.' });
    }
    if (!mongoose.isValidObjectId(categoryId)
      || !(await GroupTicketCategory.exists({ _id: categoryId }))) {
      return res.status(400).json({ success: false, message: 'Select a valid local ticket category.' });
    }
    const password = String(req.body.password || '');
    if (password) {
      // Login websites (Al Haider): log in once, keep only the encrypted token, never the password.
      if (password.length > 200) return res.status(400).json({ success: false, message: 'Enter a valid password.' });
      const login = await loginAlHaider(baseUrl, accessEmail, password);
      const integration = await TicketIntegration.create({
        name,
        baseUrl,
        accessEmail,
        category: categoryId,
        provider: 'alhaider',
        sourceTokenEncrypted: encryptIntegrationKey(login.token),
        sourceTokenExpiresAt: login.expiresAt,
      });
      let message;
      try {
        const result = await syncWithLock(integration._id);
        message = `${result.imported} ticket(s) synced from ${name}.`;
      } catch (error) {
        message = `${name} connected, but the first sync failed: ${error.message}`;
      }
      const saved = await TicketIntegration.findById(integration._id).populate('category', 'name');
      return res.status(201).json({ success: true, message, data: safeIntegration(saved) });
    }
    const sourceCategorySlug = String(req.body.sourceCategorySlug || '').trim().toLowerCase();
    const source = await fetchIntegrationTickets(baseUrl, accessEmail, sourceCategorySlug);
    const integration = await TicketIntegration.create({
      name,
      baseUrl,
      accessEmail,
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
    if (req.body.accessEmail !== undefined) {
      const accessEmail = normalizeEmail(req.body.accessEmail);
      if (!accessEmail) return res.status(400).json({ success: false, message: 'Enter a valid access email.' });
      integration.accessEmail = accessEmail;
    }
    const password = String(req.body.password || '');
    let oldToken = '';
    if (password) {
      if (password.length > 200) return res.status(400).json({ success: false, message: 'Enter a valid password.' });
      const login = await loginAlHaider(integration.baseUrl, integration.accessEmail, password);
      if (integration.provider === 'alhaider') oldToken = integration.sourceTokenEncrypted || '';
      integration.provider = 'alhaider';
      integration.sourceTokenEncrypted = encryptIntegrationKey(login.token);
      integration.sourceTokenExpiresAt = login.expiresAt;
    } else if (integration.provider === 'alhaider' && integration.isModified('accessEmail')) {
      return res.status(400).json({ success: false, message: 'Enter the account password again to change the login email.' });
    }
    if (req.body.isActive !== undefined) integration.isActive = Boolean(req.body.isActive);
    await integration.save();
    if (oldToken) {
      try {
        // Free the old token slot on the source website (best effort, after the new login is saved).
        await logoutAlHaider(integration.baseUrl, decryptIntegrationKey(oldToken));
      } catch {
        // An old token that cannot be revoked is not fatal.
      }
    }
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
