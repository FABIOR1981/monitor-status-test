/**
 * Tests Unitarios: Lógica de Clasificación de Latencia
 *
 * Estos tests verifican que la función obtenerEstadoVisual()
 * clasifique correctamente las latencias según los umbrales definidos.
 */

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

describe('Clasificación de Latencia', () => {
  let obtenerEstadoVisual;
  let UMBRALES_LATENCIA;
  let window;

  beforeAll(() => {
    const configJs = fs.readFileSync(
      path.join(__dirname, '../../js/config.js'),
      'utf8'
    );
    const scriptJs = fs.readFileSync(
      path.join(__dirname, '../../js/script.js'),
      'utf8'
    );
    const i18nEs = fs.readFileSync(
      path.join(__dirname, '../../js/i18n_es.js'),
      'utf8'
    );

    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      runScripts: 'dangerously',
    });
    window = dom.window;

    window.eval(configJs);
    window.eval(i18nEs);
    window.TEXTOS_ACTUAL = window.TEXTOS_ES;
    window.eval(scriptJs);

    obtenerEstadoVisual = window.obtenerEstadoVisual;
    UMBRALES_LATENCIA = window.UMBRALES_LATENCIA;
  });

  describe('Estados de Velocidad Normales (HTTP 200)', () => {
    test('Latencia 250ms debe ser MUY RÁPIDO', () => {
      const resultado = obtenerEstadoVisual(250, 200);
      expect(resultado.className).toBe('status-very-fast');
      expect(resultado.text).toContain('MUY RÁPIDO');
    });

    test('Latencia 400ms debe ser RÁPIDO', () => {
      const resultado = obtenerEstadoVisual(400, 200);
      expect(resultado.className).toBe('status-fast');
      expect(resultado.text).toContain('RÁPIDO');
    });

    test('Latencia 650ms debe ser NORMAL', () => {
      const resultado = obtenerEstadoVisual(650, 200);
      expect(resultado.className).toBe('status-normal');
      expect(resultado.text).toContain('NORMAL');
    });

    test('Latencia 1200ms debe ser LENTO', () => {
      const resultado = obtenerEstadoVisual(1200, 200);
      expect(resultado.className).toBe('status-slow');
      expect(resultado.text).toContain('LENTO');
    });

    test('Latencia 2500ms debe ser CRÍTICO', () => {
      const resultado = obtenerEstadoVisual(2500, 200);
      expect(resultado.className).toBe('status-critical');
      expect(resultado.text).toContain('CRÍTICO');
    });

    test('Latencia 4000ms debe ser RIESGO', () => {
      const resultado = obtenerEstadoVisual(4000, 200);
      expect(resultado.className).toBe('status-risk');
      expect(resultado.text).toContain('RIESGO');
    });

    test('Latencia 7000ms debe ser RIESGO EXTREMO', () => {
      const resultado = obtenerEstadoVisual(7000, 200);
      expect(resultado.className).toBe('status-extreme-risk');
      expect(resultado.text).toContain('RIESGO EXTREMO');
    });
  });

  describe('Umbrales Límite (Boundary Testing)', () => {
    test('Exactamente 300ms es el límite de MUY RÁPIDO', () => {
      const resultado = obtenerEstadoVisual(300, 200);
      expect(resultado.className).toBe('status-very-fast');
    });

    test('301ms debe pasar a RÁPIDO', () => {
      const resultado = obtenerEstadoVisual(301, 200);
      expect(resultado.className).toBe('status-fast');
    });

    test('Exactamente 5000ms es el límite de RIESGO', () => {
      const resultado = obtenerEstadoVisual(5000, 200);
      expect(resultado.className).toBe('status-risk');
    });

    test('5001ms debe ser RIESGO EXTREMO', () => {
      const resultado = obtenerEstadoVisual(5001, 200);
      expect(resultado.className).toBe('status-extreme-risk');
    });
  });

  describe('Códigos de Error HTTP', () => {
    test('HTTP 404 debe retornar CAÍDA/ERROR', () => {
      const resultado = obtenerEstadoVisual(500, 404);
      expect(resultado.className).toBe('status-down');
      expect(resultado.text).toContain('CAÍDA');
    });

    test('HTTP 500 debe retornar CAÍDA/ERROR', () => {
      const resultado = obtenerEstadoVisual(300, 500);
      expect(resultado.className).toBe('status-down');
      expect(resultado.text).toContain('500');
    });

    test('HTTP 0 (fallo de red) debe retornar CAÍDA/ERROR', () => {
      const resultado = obtenerEstadoVisual(0, 0);
      expect(resultado.className).toBe('status-down');
    });
  });

  describe('Penalización por Timeout', () => {
    test('Latencia >= 99999ms debe marcar como caída', () => {
      const resultado = obtenerEstadoVisual(99999, 200);
      expect(resultado.className).toBe('status-down');
    });

    test('Latencia de 98000ms (menos de penalización) debe clasificarse normalmente', () => {
      const resultado = obtenerEstadoVisual(8000, 200);
      expect(resultado.className).toBe('status-extreme-risk');
    });
  });

  describe('Casos Edge', () => {
    test('Latencia 0ms con HTTP 200 debe ser MUY RÁPIDO', () => {
      const resultado = obtenerEstadoVisual(0, 200);
      expect(resultado.className).toBe('status-very-fast');
    });

    test('Latencia negativa debe manejarse (edge case)', () => {
      const resultado = obtenerEstadoVisual(-100, 200);
      expect(resultado.className).toBe('status-very-fast');
    });

    test('String numérico debe parsearse correctamente', () => {
      const resultado = obtenerEstadoVisual('450', 200);
      expect(resultado.className).toBe('status-fast');
    });
  });
});
