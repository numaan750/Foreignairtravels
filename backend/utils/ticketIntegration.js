import { createDecipheriv, createCipheriv, createHash, randomBytes } from 'node:crypto';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { request as httpsRequest } from 'node:https';

const apiPath = '/api/group-ticket-integrations/export';
const maxResponseBytes = 5 * 1024 * 1024;
const maxTicketCount = 500;

const getEncryptionKey = () => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required to encrypt ticket integration credentials.');
  return createHash('sha256').update(process.env.JWT_SECRET).digest();
};

export const encryptIntegrationKey = (value) => {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), ciphertext].map((part) => part.toString('base64url')).join('.');
};

export const decryptIntegrationKey = (value) => {
  const [iv, authTag, ciphertext] = value.split('.').map((part) => Buffer.from(part, 'base64url'));
  if (!iv || !authTag || !ciphertext) throw new Error('Stored ticket integration credential is invalid.');
  const decipher = createDecipheriv('aes-256-gcm', getEncryptionKey(), iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
};

const isPublicAddress = (address) => {
  if (isIP(address) === 4) {
    const [first, second] = address.split('.').map(Number);
    return !(
      first === 0 || first === 10 || first === 127 || first >= 224
      || (first === 100 && second >= 64 && second <= 127)
      || (first === 169 && second === 254)
      || (first === 172 && second >= 16 && second <= 31)
      || (first === 192 && second === 0)
      || (first === 192 && second === 168)
      || (first === 198 && (second === 18 || second === 19))
    );
  }
  if (isIP(address) === 6) {
    const normalized = address.toLowerCase();
    if (normalized.startsWith('::ffff:')) return isPublicAddress(normalized.slice(7));
    return (normalized.startsWith('2') || normalized.startsWith('3'))
      && !normalized.startsWith('2001:db8:');
  }
  return false;
};

export const normalizeIntegrationBaseUrl = async (value) => {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error('Enter a valid website URL.');
  }
  if (
    url.protocol !== 'https:'
    || url.username
    || url.password
    || url.pathname !== '/'
    || url.search
    || url.hash
  ) {
    throw new Error('Use an HTTPS website origin only, for example https://tickets.example.com.');
  }
  const hostname = url.hostname.replace(/^\[|\]$/g, '');
  const addresses = isIP(hostname)
    ? [{ address: hostname, family: isIP(hostname) }]
    : await lookup(hostname, { all: true, verbatim: true });
  if (!addresses.length || addresses.some(({ address }) => !isPublicAddress(address))) {
    throw new Error('The website URL must resolve only to public IP addresses.');
  }
  return { url, addresses };
};

export const normalizeIntegrationPayload = (payload, selectedCategorySlug = '') => {
  if (payload?.success !== true || payload.complete !== true || !Array.isArray(payload.data)) {
    throw new Error('Source API must return { success: true, complete: true, data: [...] }.');
  }
  if (!Array.isArray(payload.categories)) {
    throw new Error('Source API must return a categories array.');
  }
  if (payload.data.length > maxTicketCount) {
    throw new Error(`Source API returned more than ${maxTicketCount} tickets.`);
  }

  const seenCategorySlugs = new Set();
  const categories = payload.categories.map((category) => {
    const slug = String(category?.slug || '').trim().toLowerCase();
    const name = String(category?.name || '').trim();
    if (!slug || slug.length > 120 || !name || name.length > 120 || seenCategorySlugs.has(slug)) {
      throw new Error('Source categories must have unique slug and name values.');
    }
    seenCategorySlugs.add(slug);
    return { slug, name };
  });
  if (selectedCategorySlug && !seenCategorySlugs.has(selectedCategorySlug)) {
    throw new Error('The selected source category is no longer available.');
  }

  const seenIds = new Set();
  const text = (value, label, maxLength) => {
    const normalized = String(value ?? '').trim();
    if (!normalized || normalized.length > maxLength) {
      throw new Error(`Source ticket has an invalid ${label}.`);
    }
    return normalized;
  };
  const tickets = payload.data.map((ticket) => {
    const sourceId = text(ticket.sourceId || ticket._id, 'sourceId', 120);
    const departureDate = new Date(ticket.departureDate);
    if (!sourceId || seenIds.has(sourceId)) throw new Error('Source tickets must have unique sourceId values.');
    seenIds.add(sourceId);
    if (
      !ticket.airline
      || !ticket.groupName
      || Number.isNaN(departureDate.getTime())
      || !Array.isArray(ticket.segments)
      || ticket.segments.length === 0
      || !ticket.baggage
    ) {
      throw new Error(`Source ticket ${sourceId} is missing required flight details.`);
    }
    const segments = ticket.segments.map((segment) => {
      if (!segment.from || !segment.to || !segment.flightNumber) {
        throw new Error(`Source ticket ${sourceId} has an invalid flight segment.`);
      }
      return {
        from: text(segment.from, 'segment origin', 120),
        to: text(segment.to, 'segment destination', 120),
        flightNumber: text(segment.flightNumber, 'flight number', 80),
        departureTime: String(segment.departureTime || '').trim().slice(0, 30),
        arrivalTime: String(segment.arrivalTime || '').trim().slice(0, 30),
      };
    });
    const fares = {};
    for (const field of ['adultFare', 'childFare', 'infantFare']) {
      const amount = Number(ticket[field] ?? 0);
      if (!Number.isFinite(amount) || amount < 0) {
        throw new Error(`Source ticket ${sourceId} has an invalid ${field}.`);
      }
      fares[field] = amount;
    }
    if (
      (ticket.mealAvailable !== undefined && typeof ticket.mealAvailable !== 'boolean')
      || (ticket.infantPriceOnCall !== undefined && typeof ticket.infantPriceOnCall !== 'boolean')
      || (ticket.isAvailable !== undefined && typeof ticket.isAvailable !== 'boolean')
    ) {
      throw new Error(`Source ticket ${sourceId} has an invalid availability or meal flag.`);
    }
    const currency = text(ticket.currency || 'SAR', 'currency', 3).toUpperCase();
    return {
      sourceId,
      sourceCategorySlug: String(ticket.category?.slug || ticket.categorySlug || '').trim().toLowerCase(),
      airline: text(ticket.airline, 'airline name', 120),
      airlineLogo: String(ticket.airlineLogo || '').trim().slice(0, 2048),
      groupName: text(ticket.groupName, 'group name', 200),
      departureDate,
      segments,
      baggage: text(ticket.baggage, 'baggage', 200),
      mealAvailable: Boolean(ticket.mealAvailable),
      infantPriceOnCall: Boolean(ticket.infantPriceOnCall),
      currency,
      sourceAvailable: ticket.isAvailable !== false && ticket.isActive !== false,
      sourceFares: fares,
    };
  });
  if (selectedCategorySlug && tickets.some((ticket) => ticket.sourceCategorySlug !== selectedCategorySlug)) {
    throw new Error('Source API returned tickets outside the selected category.');
  }
  return {
    categories,
    tickets: selectedCategorySlug
      ? tickets.filter((ticket) => ticket.sourceCategorySlug === selectedCategorySlug)
      : tickets,
  };
};

export const fetchIntegrationTickets = async (
  baseUrl,
  apiKey,
  selectedCategorySlug = '',
  categoriesOnly = false
) => {
  const { url, addresses } = await normalizeIntegrationBaseUrl(baseUrl);
  url.pathname = apiPath;
  if (selectedCategorySlug) url.searchParams.set('category', selectedCategorySlug);
  if (categoriesOnly) url.searchParams.set('categoriesOnly', 'true');
  const responseBody = await new Promise((resolve, reject) => {
    const request = httpsRequest(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      lookup: (_hostname, options, callback) => {
        if (options?.all) callback(null, addresses);
        else callback(null, addresses[0].address, addresses[0].family);
      },
      timeout: 15000,
    }, (incoming) => {
      incoming.on('error', reject);
      if (incoming.statusCode !== 200) {
        incoming.resume();
        reject(new Error(`Source website returned HTTP ${incoming.statusCode || 'error'}.`));
        return;
      }
      const chunks = [];
      let totalBytes = 0;
      incoming.on('data', (chunk) => {
        totalBytes += chunk.length;
        if (totalBytes > maxResponseBytes) {
          incoming.destroy(new Error('Source ticket response exceeds the 5 MB limit.'));
          return;
        }
        chunks.push(chunk);
      });
      incoming.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
    request.on('timeout', () => request.destroy(new Error('Source website request timed out.')));
    request.on('error', reject);
    request.end();
  });

  let payload;
  try {
    payload = JSON.parse(responseBody);
  } catch {
    throw new Error('Source website returned invalid JSON.');
  }
  return normalizeIntegrationPayload(payload, selectedCategorySlug);
};
