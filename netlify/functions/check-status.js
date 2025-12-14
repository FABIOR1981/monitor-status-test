const fetch = require('node-fetch');
const AbortController = require('abort-controller');
const https = require('https');
const http = require('http');
const crypto = require('crypto');

// Cache en memoria (se limpia cuando se reinicia la función)
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// Rate limiting por IP
const rateLimits = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const MAX_REQUESTS_PER_WINDOW = 50; // 50 requests por minuto

// Ignoramos certificados SSL inválidos porque necesitamos monitorear
// la disponibilidad del servicio, no la validez de sus certificados
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const httpAgent = new http.Agent({
  keepAlive: false,
});

// Validar URL
function isValidURL(url) {
  try {
    const parsed = new URL(url);
    // Solo permitir HTTP y HTTPS
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }
    // Prevenir SSRF - no permitir IPs privadas/localhost
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.')
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

// Rate limiting
function checkRateLimit(ip) {
  const now = Date.now();
  const clientData = rateLimits.get(ip) || { requests: [], blocked: false };

  // Limpiar requests antiguos
  clientData.requests = clientData.requests.filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW
  );

  if (clientData.requests.length >= MAX_REQUESTS_PER_WINDOW) {
    clientData.blocked = true;
    return false;
  }

  clientData.requests.push(now);
  rateLimits.set(ip, clientData);
  return true;
}

// Generar clave de caché
function getCacheKey(url) {
  return crypto.createHash('md5').update(url).digest('hex');
}

exports.handler = async (event, context) => {
  const targetUrl = event.queryStringParameters.url;

  if (!targetUrl) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Parámetro 'url' requerido." }),
    };
  }

  // Validar URL
  if (!isValidURL(targetUrl)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'URL no válida o no permitida.' }),
    };
  }

  // Rate limiting
  const clientIP =
    event.headers['client-ip'] || event.headers['x-forwarded-for'] || 'unknown';
  if (!checkRateLimit(clientIP)) {
    return {
      statusCode: 429,
      body: JSON.stringify({
        error: 'Demasiadas solicitudes. Intenta de nuevo más tarde.',
      }),
    };
  }

  // Verificar caché
  const cacheKey = getCacheKey(targetUrl);
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`[CACHE HIT] ${targetUrl}`);
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'X-Cache': 'HIT',
      },
      body: JSON.stringify(cached.data),
    };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'X-Cache': 'MISS',
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9000);

  try {
    const startTime = Date.now();

    const response = await fetch(targetUrl, {
      method: 'GET',
      signal: controller.signal,
      redirect: 'follow',
      // Agente dinámico: permite manejar redirecciones de HTTPS→HTTP automáticamente
      // sin fallar por cambio de protocolo
      agent: (_parsedURL) => {
        if (_parsedURL.protocol === 'http:') {
          return httpAgent;
        } else {
          return httpsAgent;
        }
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Monitor-Status-Check)',
      },
    });

    clearTimeout(timeoutId);
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    console.log(
      `URL: ${targetUrl} - Status: ${response.status} - Time: ${responseTime}ms`
    );

    const resultData = {
      status: response.status,
      time: responseTime,
    };

    // Guardar en caché
    cache.set(cacheKey, {
      data: resultData,
      timestamp: Date.now(),
    });

    // Limpiar caché antigua (cada 100 requests)
    if (cache.size > 100) {
      const now = Date.now();
      for (const [key, value] of cache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
          cache.delete(key);
        }
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(resultData),
    };
  } catch (error) {
    clearTimeout(timeoutId);

    console.error(
      `Error de conexión para ${targetUrl}: ${error.name} - ${error.message}`
    );

    // Retornamos HTTP 200 con status=0 para distinguir entre:
    // - Fallo de la función serverless (HTTP 500)
    // - Fallo del servicio monitoreado (status: 0)
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 0,
        time: 99999,
        error: `${error.name}: ${error.message}`,
      }),
    };
  }
};
