import { createDecipheriv, createCipheriv, createHash, randomBytes } from 'node:crypto';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { request as httpsRequest } from 'node:https';

const apiPath = '/api/group-ticket-integrations/export';
const maxResponseBytes = 5 * 1024 * 1024;
const maxTicketCount = 2000;

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

const redirectStatuses = new Set([301, 302, 303, 307, 308]);
const withoutWww = (hostname) => hostname.replace(/^www\./, '');

// One HTTPS request to a public source website. Returns { status, data } where data is parsed JSON or null.
// Only www <-> non-www redirects are followed, so credentials are never sent to another domain.
const requestSource = async (baseUrl, path, { method = 'GET', headers = {}, query = {}, form } = {}, redirectsLeft = 3) => {
  const { url, addresses } = await normalizeIntegrationBaseUrl(baseUrl);
  url.pathname = path;
  Object.entries(query).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });
  const body = form ? new URLSearchParams(form).toString() : '';
  const response = await new Promise((resolve, reject) => {
    const request = httpsRequest(url, {
      method,
      headers: {
        Accept: 'application/json',
        ...headers,
        ...(body ? { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) } : {}),
      },
      lookup: (_hostname, options, callback) => {
        if (options?.all) callback(null, addresses);
        else callback(null, addresses[0].address, addresses[0].family);
      },
      timeout: 15000,
    }, (incoming) => {
      incoming.on('error', reject);
      if (redirectStatuses.has(incoming.statusCode) && redirectsLeft > 0) {
        let next = null;
        try {
          next = new URL(incoming.headers.location || '', url);
        } catch {
          next = null;
        }
        if (next && next.origin !== url.origin && withoutWww(next.hostname) === withoutWww(url.hostname)) {
          incoming.resume();
          resolve({ redirectTo: next.origin });
          return;
        }
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
      incoming.on('end', () => {
        let data = null;
        try {
          data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        } catch {
          data = null;
        }
        resolve({ status: incoming.statusCode, data });
      });
    });
    request.on('timeout', () => request.destroy(new Error('Source website request timed out.')));
    request.on('error', reject);
    request.end(body || undefined);
  });
  return response.redirectTo
    ? requestSource(response.redirectTo, path, { method, headers, query, form }, redirectsLeft - 1)
    : response;
};

export const fetchIntegrationTickets = async (
  baseUrl,
  accessEmail,
  selectedCategorySlug = '',
  categoriesOnly = false
) => {
  const { status, data } = await requestSource(baseUrl, apiPath, {
    headers: { 'X-Access-Email': accessEmail },
    query: { category: selectedCategorySlug, categoriesOnly: categoriesOnly ? 'true' : '' },
  });
  if (status === 401 || status === 403) throw new Error('The source website has not given ticket access to this email.');
  if (status === 404) {
    throw new Error('Ticket sync was not found on this website (HTTP 404). For login websites like Al Haider, also enter the account password.');
  }
  if (status !== 200) throw new Error(`Source website returned HTTP ${status || 'error'}.`);
  if (!data) throw new Error('Source website returned invalid JSON.');
  return normalizeIntegrationPayload(data, selectedCategorySlug);
};

// ---------- Al Haider style websites (login with email + password, then Bearer token) ----------
const sourceMessage = (status, data) => String(data?.message || `HTTP ${status || 'error'}`).replace(/\.+$/, '').slice(0, 200);
const sourceNumber = (value) => Number(String(value ?? '').replace(/,/g, '').trim());
const sourceTime = (value) => String(value || '').trim().replace(/^(\d{1,2}:\d{2}):\d{2}$/, '$1');
const sourceAirlineName = (airline) => String(airline?.airline_name || '')
  .trim()
  .replace(/^\d+\.\s*/, '')
  .replace(/\s+[A-Z]{3}(?:-[A-Z]{3})+$/, '')
  .trim() || String(airline?.short_name || '').trim();

export const loginAlHaider = async (baseUrl, email, password) => {
  const { status, data } = await requestSource(baseUrl, '/api/login', { method: 'POST', form: { email, password } });
  const token = data?.token || data?.data?.token;
  if (status !== 200 || typeof token !== 'string' || !token) {
    throw new Error(`Login failed on the source website: ${sourceMessage(status, data)}.`);
  }
  const expiresAt = Number(data.expires_at ?? data.data?.expires_at);
  return {
    token,
    expiresAt: expiresAt > 0 ? new Date(expiresAt < 1e12 ? expiresAt * 1000 : expiresAt) : null,
  };
};

export const logoutAlHaider = (baseUrl, token) => requestSource(baseUrl, '/api/logout', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
});

export const fetchAlHaiderTickets = async (baseUrl, token, selectedCategorySlug = '') => {
  const headers = { Authorization: `Bearer ${token}` };
  const [airlinesResponse, groupsResponse] = await Promise.all([
    requestSource(baseUrl, '/api/available/airlines', { headers }),
    requestSource(baseUrl, '/api/available/groups', { headers }),
  ]);
  for (const { status, data } of [airlinesResponse, groupsResponse]) {
    if (status === 401) throw new Error('The saved login has expired. Edit this connection and enter the password again.');
    if (status !== 200 || !data) throw new Error(`Source website error: ${sourceMessage(status, data)}.`);
  }
  if (!Array.isArray(groupsResponse.data.groups)) throw new Error('Source website did not return a groups list.');
  const airlines = new Map(
    (Array.isArray(airlinesResponse.data.airlines) ? airlinesResponse.data.airlines : [])
      .map((airline) => [String(airline?.id), airline])
  );
  const categories = new Map();
  const data = [];
  for (const group of groupsResponse.data.groups) {
    const details = (Array.isArray(group?.details) ? group.details : [])
      .filter((detail) => detail?.origin && detail?.destination && detail?.flight_no)
      .sort((first, second) => Number(first.sr) - Number(second.sr));
    const airline = group?.airline || airlines.get(String(group?.airline_id));
    const airlineName = sourceAirlineName(airline).slice(0, 120);
    const price = sourceNumber(group?.price);
    if (
      !group?.id
      || Number.isNaN(new Date(group.dept_date).getTime())
      || !details.length
      || !airlineName
      || !(price > 0)
    ) continue;
    const type = String(group.type || '').trim().slice(0, 120);
    const categorySlug = type.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (categorySlug && !categories.has(categorySlug)) categories.set(categorySlug, { slug: categorySlug, name: type });
    const baggage = String(group.baggage || '').trim().slice(0, 190);
    data.push({
      sourceId: String(group.id),
      categorySlug,
      airline: airlineName,
      airlineLogo: String(airline?.logo_url || ''),
      groupName: ([group.sector, type].filter(Boolean).join(' · ') || `Group ${group.id}`).slice(0, 200),
      departureDate: group.dept_date,
      segments: details.map((detail) => ({
        from: detail.origin,
        to: detail.destination,
        flightNumber: detail.flight_no,
        departureTime: [detail.flight_date !== group.dept_date ? detail.flight_date : '', sourceTime(detail.dept_time)]
          .filter(Boolean).join(' '),
        arrivalTime: sourceTime(detail.arv_time),
      })),
      baggage: !baggage ? 'N/A' : /[a-z]/i.test(baggage) ? baggage : `${baggage} KG`,
      mealAvailable: /^y/i.test(String(group.meal || '').trim()),
      adultFare: price,
      childFare: price,
      infantFare: 0,
      infantPriceOnCall: true,
      currency: 'PKR',
      // Every group from /api/available/groups is bookable; a group that sells out leaves that list
      // and the next sync hides it. (Seats in the list can be empty, which must not mean "sold out".)
      isAvailable: true,
    });
  }
  return normalizeIntegrationPayload(
    { success: true, complete: true, categories: [...categories.values()], data },
    selectedCategorySlug
  );
};
