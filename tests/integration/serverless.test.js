/**
 * Tests de Integración: Función Serverless check-status
 *
 * Verifica el comportamiento completo de la función Netlify:
 * - Manejo de timeouts
 * - Códigos de estado HTTP
 * - Redirecciones
 * - Errores de red
 */

const handler = require('../../netlify/functions/check-status').handler;

describe('Función Serverless: check-status', () => {
  describe('Parámetros de Entrada', () => {
    test('Debe retornar error si falta el parámetro URL', async () => {
      const event = {
        queryStringParameters: {},
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBeDefined();
    });

    test('Debe retornar error si URL es inválida', async () => {
      const event = {
        queryStringParameters: {
          url: 'url-invalida-sin-protocolo',
        },
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBeDefined();
    });
  });

  describe('Respuestas Exitosas', () => {
    test('Debe retornar status 200 y tiempo de latencia para URL válida', async () => {
      const event = {
        queryStringParameters: {
          url: 'https://www.google.com',
        },
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe(200);
      expect(body.time).toBeGreaterThan(0);
      expect(body.time).toBeLessThan(9000);
    }, 15000);

    test('Debe medir latencia correctamente', async () => {
      const event = {
        queryStringParameters: {
          url: 'https://httpbin.org/delay/1',
        },
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.time).toBeGreaterThanOrEqual(1000);
    }, 15000);
  });

  describe('Manejo de Errores HTTP', () => {
    test('Debe retornar status 404 para página inexistente', async () => {
      const event = {
        queryStringParameters: {
          url: 'https://httpbin.org/status/404',
        },
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe(404);
    }, 15000);

    test('Debe retornar status 500 para error del servidor', async () => {
      const event = {
        queryStringParameters: {
          url: 'https://httpbin.org/status/500',
        },
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe(500);
    }, 15000);
  });

  describe('Manejo de Timeout', () => {
    test('Debe retornar status 0 si timeout excede 9 segundos', async () => {
      const event = {
        queryStringParameters: {
          url: 'https://httpbin.org/delay/10',
        },
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe(0);
      expect(body.time).toBeGreaterThanOrEqual(9000);
    }, 15000);
  });

  describe('Manejo de Redirecciones', () => {
    test('Debe seguir redirecciones HTTP', async () => {
      const event = {
        queryStringParameters: {
          url: 'https://httpbin.org/redirect/2',
        },
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe(200);
    }, 15000);
  });

  describe('Protocolo HTTP vs HTTPS', () => {
    test('Debe manejar URLs HTTP', async () => {
      const event = {
        queryStringParameters: {
          url: 'http://httpbin.org/status/200',
        },
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe(200);
    }, 15000);

    test('Debe manejar URLs HTTPS', async () => {
      const event = {
        queryStringParameters: {
          url: 'https://httpbin.org/status/200',
        },
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe(200);
    }, 15000);
  });

  describe('Errores de Red', () => {
    test('Debe retornar status 0 para dominio inexistente', async () => {
      const event = {
        queryStringParameters: {
          url: 'https://dominio-que-no-existe-12345678.com',
        },
      };

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe(0);
    }, 15000);
  });
});
