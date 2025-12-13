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
    // y devuelva un 503 al cliente si la web destino tarda mucho.
    const response = await fetch(targetUrl, {
      method: 'HEAD', // Usamos HEAD para solo pedir los encabezados, es más rápido.
      timeout: 9000,
      follow: 20,
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime; // Tiempo en milisegundos

    // 3. Devolver los datos al frontend
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: response.status, // Código de estado (200, 404, 500, etc.)
        time: responseTime, // Tiempo de respuesta en ms
      }),
    };
  } catch (error) {
    // 4. Manejar errores de conexión, DNS o Timeout.
    // El error 0 o 599 se utiliza en el frontend para marcar "CAÍDA".

    console.error(`Fallo de fetch para ${targetUrl}: ${error.message}`);

    return {
      statusCode: 200, // Devolver 200 para que el frontend pueda leer el body JSON
      headers,
      body: JSON.stringify({
        status: 0, // Usamos 0 para indicar error de conexión/timeout
        time: 0,
        error: 'Fallo de conexión, DNS o Timeout (9 segundos)',
      }),
    };
  }
};
