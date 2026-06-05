const fetch = require('node-fetch');
const AbortController = require('abort-controller');
const https = require('https');
const http = require('http');

// Configurables vía ENV
const VERIFY_TLS = process.env.VERIFY_TLS !== 'false'; // por defecto true
const MAX_READ_BYTES = parseInt(process.env.MAX_READ_BYTES || '65536', 10); // 64KB
const REQUEST_TIMEOUT_MS = parseInt(process.env.REQUEST_TIMEOUT_MS || '9000', 10);

// Agents: mantener conexiones vivas mejora realismo (simula keep-alive de clientes)
const httpsAgent = new https.Agent({
  rejectUnauthorized: VERIFY_TLS,
  keepAlive: true,
});

const httpAgent = new http.Agent({
  keepAlive: true,
});

// Heurística simple para detectar cold-start aproximado (no 100% fiable en serverless)
if (typeof global._lastInvocationAt === 'undefined') {
  global._lastInvocationAt = 0;
}

exports.handler = async (event, context) => {
  const targetUrl = event.queryStringParameters?.url;

  if (!targetUrl) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Parámetro 'url' requerido." }),
    };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const invocationNow = Date.now();
  const coldStart = invocationNow - (global._lastInvocationAt || 0) > 5 * 60 * 1000; // 5 min
  global._lastInvocationAt = invocationNow;

  try {
    const startTime = Date.now();

    const response = await fetch(targetUrl, {
      method: 'GET',
      signal: controller.signal,
      redirect: 'follow',
      // Selección de agente según protocolo
      agent: (_parsedURL) => {
        if (_parsedURL.protocol === 'http:') {
          return httpAgent;
        } else {
          return httpsAgent;
        }
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Monitor-Status-Check)'
      },
    });

    const ttfb = Date.now() - startTime;

    // Intentamos leer hasta MAX_READ_BYTES para medir parte de la transferencia
    let bytesRead = 0;
    try {
      if (response.body && typeof response.body.on === 'function') {
        await new Promise((resolve) => {
          const stream = response.body;
          function cleanup() {
            stream.removeAllListeners('data');
            stream.removeAllListeners('end');
            stream.removeAllListeners('error');
          }

          stream.on('data', (chunk) => {
            try {
              bytesRead += chunk.length || chunk.byteLength || 0;
            } catch (e) {
              // ignore
            }
            if (bytesRead >= MAX_READ_BYTES) {
              try {
                stream.destroy();
              } catch (e) {
                // ignore
              }
              cleanup();
              resolve();
            }
          });

          stream.on('end', () => {
            cleanup();
            resolve();
          });

          stream.on('error', () => {
            cleanup();
            resolve();
          });
        });
      } else {
        // Fallback: leer todo (puede ser pesado)
        await response.arrayBuffer().then((b) => {
          bytesRead = b.byteLength || 0;
        });
      }
    } catch (e) {
      // No fallamos la función por errores de stream
    }

    clearTimeout(timeoutId);
    const endTime = Date.now();
    const totalTime = endTime - startTime;

    console.log(
      `URL: ${targetUrl} - Status: ${response.status} - TTFB: ${ttfb}ms - Total: ${totalTime}ms - BytesRead: ${bytesRead}`
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: response.status,
        ttfb: ttfb,
        totalTime: totalTime,
        bytesRead: bytesRead,
        protocol: response.url?.startsWith('https') ? 'https' : 'http',
        tlsVerified: VERIFY_TLS,
        coldStart: !!coldStart,
      }),
    };
  } catch (error) {
    clearTimeout(timeoutId);

    console.error(
      `Error de conexión para ${targetUrl}: ${error.name} - ${error.message}`
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 0,
        ttfb: null,
        totalTime: 99999,
        bytesRead: 0,
        error: `${error.name}: ${error.message}`,
        tlsVerified: VERIFY_TLS,
        coldStart: !!coldStart,
      }),
    };
  }
};
