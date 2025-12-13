// Para usar 'fetch' en el entorno Node.js de Netlify.
const fetch = require('node-fetch');

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
  try {
    const startTime = Date.now();

    // **IMPORTANTE:** Timeout de la petición a 9 segundos (9000 ms).
    // Esto previene que la función Serverless exceda el timeout de Netlify (10s)
    const response = await fetch(targetUrl, {
      method: 'GET', // GET en lugar de HEAD para mejor compatibilidad
      timeout: 9000,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Monitor-Status-Check)',
      },
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime; // Tiempo en milisegundos

    // 3. Devolver los datos al frontend (TODOS los códigos HTTP, incluyendo 404, 500, etc.)
    // node-fetch NO lanza error para códigos 4xx/5xx, solo devuelve la respuesta
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: response.status, // Código de estado (200, 404, 500, etc.)
        time: responseTime, // Tiempo de respuesta en ms
      }),
    };
  } catch (error) {
    // 4. Solo llega aquí si hay error de RED, DNS o TIMEOUT (no para códigos HTTP)
    console.error(`Fallo de fetch para ${targetUrl}: ${error.message}`);

    return {
      statusCode: 200, // Devolver 200 para que el frontend pueda leer el body JSON
      headers,
      body: JSON.stringify({
        status: 0, // Usamos 0 para indicar error de conexión/timeout
        time: 99999, // Penalización alta para reflejar el fallo
        error: `Fallo de conexión, DNS o Timeout: ${error.message}`,
      }),
    };
  }
};
