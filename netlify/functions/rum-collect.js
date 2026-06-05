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
  }

  // Guarda en logs. Para producción reemplazar por almacenamiento persistente.
  try {
    console.log('RUM beacon:', JSON.stringify(payload).slice(0, 2000));
  } catch (e) {
    // ignore
  }

  // Devolvemos 204 No Content para beacons
  return {
    statusCode: 204,
    headers,
    body: '',
  };
};
