// Para usar 'fetch' en el entorno Node.js de Netlify.
const fetch = require('node-fetch');
const AbortController = require('abort-controller');
const https = require('https');
const http = require('http');

// Agentes HTTP/HTTPS que ignoran errores de certificado SSL
// Necesario para monitorear sitios con certificados mal configurados o redirecciones HTTP
const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // Ignorar errores de certificado SSL
});

const httpAgent = new http.Agent({
  keepAlive: false,
});

exports.handler = async (event, context) => {
  // Obtener la URL objetivo del parámetro de consulta
  const targetUrl = event.queryStringParameters.url;

  // 1. Manejo de error si falta la URL
  if (!targetUrl) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Parámetro 'url' requerido." }),
    };
  }

  // Configuración de encabezados para permitir CORS al frontend
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  // 2. Ejecutar la petición HTTP real y medir el tiempo
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9000); // Timeout de 9 segundos

  try {
    const startTime = Date.now();

    // Elegir el agente correcto según el protocolo
    const isHttps = targetUrl.startsWith('https');
    const agent = isHttps ? httpsAgent : httpAgent;

    const response = await fetch(targetUrl, {
      method: 'GET',
      signal: controller.signal,
      redirect: 'follow',
      agent: agent, // Usar agente según protocolo
      headers: {
        'User-Agent': 'Mozilla/5.0 (Monitor-Status-Check)',
      },
    });

    clearTimeout(timeoutId);
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // 3. IMPORTANTE: node-fetch NO lanza error para 404, 500, etc.
    // Solo devuelve la respuesta con response.status
    console.log(
      `URL: ${targetUrl} - Status: ${response.status} - Time: ${responseTime}ms`
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: response.status, // Todos los códigos: 200, 404, 500, etc.
        time: responseTime,
      }),
    };
  } catch (error) {
    clearTimeout(timeoutId);

    // 4. Solo errores de RED, DNS o TIMEOUT llegan aquí
    console.error(
      `Error de conexión para ${targetUrl}: ${error.name} - ${error.message}`
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 0, // Error de conexión/timeout
        time: 99999,
        error: `${error.name}: ${error.message}`,
      }),
    };
  }
};
