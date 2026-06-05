exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  let payload = null;
  try {
    if (event.body) {
      payload = JSON.parse(event.body);
    } else if (event.queryStringParameters) {
      payload = event.queryStringParameters;
    }
  } catch (e) {
    console.error('RUM parse error', e);
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  if (!payload || !payload.url) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'url required in payload' }) };
  }

  // Ensure global cache exists. In serverless this is ephemeral and per-instance.
  if (!global.__rumCache) global.__rumCache = {};

  const urlKey = payload.url;
  if (!Array.isArray(global.__rumCache[urlKey])) global.__rumCache[urlKey] = [];

  const entry = {
    ts: payload.ts || Date.now(),
    nav: payload.nav || null,
    paints: payload.paints || null,
    resources: (payload.resources || []).slice(0, 8),
    connection: payload.connection || null,
    ua: (payload.ua || '').slice(0, 256),
  };

  global.__rumCache[urlKey].push(entry);

  // Keep only recent entries to limit memory
  const MAX_PER_URL = 200;
  if (global.__rumCache[urlKey].length > MAX_PER_URL) {
    global.__rumCache[urlKey] = global.__rumCache[urlKey].slice(-MAX_PER_URL);
  }

  try {
    console.log('RUM cached for', urlKey, 'entries:', global.__rumCache[urlKey].length);
  } catch (e) {}

  return { statusCode: 204, headers, body: '' };
};
