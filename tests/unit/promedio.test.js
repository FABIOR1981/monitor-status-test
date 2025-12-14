/**
 * Tests Unitarios: Cálculo de Promedios de Latencia
 *
 * Verifica que calcularPromedio() funcione correctamente:
 * - Excluya errores del promedio
 * - Maneje historial vacío
 * - Calcule correctamente con mezcla de éxitos y fallos
 */

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

describe('Cálculo de Promedios', () => {
  let calcularPromedio;
  let historialStatus;
  let UMBRALES_LATENCIA;
  let window;

  beforeEach(() => {
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

    calcularPromedio = window.calcularPromedio;
    UMBRALES_LATENCIA = window.UMBRALES_LATENCIA;
    historialStatus = window.historialStatus;

    window.historialStatus = {};
  });

  describe('Historial Vacío', () => {
    test('URL sin historial debe retornar promedio 0', () => {
      window.historialStatus = {};
      const resultado = calcularPromedio('https://ejemplo.com');

      expect(resultado.promedio).toBe(0);
      expect(resultado.validCount).toBe(0);
      expect(resultado.historial.length).toBe(0);
    });
  });

  describe('Historial Solo con Éxitos', () => {
    test('Promedio de [300, 400, 500] debe ser 400', () => {
      window.historialStatus['https://test.com'] = [
        { status: 200, time: 300 },
        { status: 200, time: 400 },
        { status: 200, time: 500 },
      ];

      const resultado = calcularPromedio('https://test.com');

      expect(resultado.promedio).toBe(400);
      expect(resultado.validCount).toBe(3);
    });

    test('Promedio debe ser redondeado', () => {
      window.historialStatus['https://test.com'] = [
        { status: 200, time: 333 },
        { status: 200, time: 444 },
        { status: 200, time: 555 },
      ];

      const resultado = calcularPromedio('https://test.com');

      expect(resultado.promedio).toBe(444);
    });
  });

  describe('Exclusión de Errores del Promedio', () => {
    test('Errores HTTP no deben afectar el promedio', () => {
      window.historialStatus['https://test.com'] = [
        { status: 200, time: 300 },
        { status: 404, time: 500 },
        { status: 200, time: 500 },
        { status: 500, time: 1000 },
      ];

      const resultado = calcularPromedio('https://test.com');

      expect(resultado.promedio).toBe(400);
      expect(resultado.validCount).toBe(2);
    });

    test('Penalizaciones por timeout no deben sumarse al promedio', () => {
      window.historialStatus['https://test.com'] = [
        { status: 200, time: 400 },
        { status: 200, time: 99999 },
        { status: 200, time: 600 },
      ];

      const resultado = calcularPromedio('https://test.com');

      expect(resultado.promedio).toBe(500);
      expect(resultado.validCount).toBe(2);
    });
  });

  describe('Historial Solo con Fallos', () => {
    test('Solo errores HTTP debe retornar promedio 0 y estado de error', () => {
      window.historialStatus['https://test.com'] = [
        { status: 500, time: 500 },
        { status: 404, time: 300 },
        { status: 0, time: 0 },
      ];

      const resultado = calcularPromedio('https://test.com');

      expect(resultado.promedio).toBe(0);
      expect(resultado.validCount).toBe(0);
      expect(resultado.estadoPromedio.className).toBe('status-down');
    });
  });

  describe('Mezcla de Éxitos y Fallos', () => {
    test('Promedio debe calcularse solo con mediciones exitosas', () => {
      window.historialStatus['https://test.com'] = [
        { status: 200, time: 200 },
        { status: 404, time: 1000 },
        { status: 200, time: 400 },
        { status: 500, time: 2000 },
        { status: 200, time: 600 },
        { status: 0, time: 0 },
      ];

      const resultado = calcularPromedio('https://test.com');

      expect(resultado.promedio).toBe(400);
      expect(resultado.validCount).toBe(3);
    });
  });

  describe('Clasificación del Estado Promedio', () => {
    test('Promedio de 250ms debe clasificarse como MUY RÁPIDO', () => {
      window.historialStatus['https://test.com'] = [
        { status: 200, time: 200 },
        { status: 200, time: 300 },
      ];

      const resultado = calcularPromedio('https://test.com');

      expect(resultado.estadoPromedio.className).toBe('status-very-fast');
    });

    test('Promedio de 1500ms debe clasificarse como CRÍTICO', () => {
      window.historialStatus['https://test.com'] = [
        { status: 200, time: 1400 },
        { status: 200, time: 1600 },
      ];

      const resultado = calcularPromedio('https://test.com');

      expect(resultado.estadoPromedio.className).toBe('status-critical');
    });
  });

  describe('Casos Edge', () => {
    test('Un solo dato válido debe retornar ese valor como promedio', () => {
      window.historialStatus['https://test.com'] = [{ status: 200, time: 750 }];

      const resultado = calcularPromedio('https://test.com');

      expect(resultado.promedio).toBe(750);
      expect(resultado.validCount).toBe(1);
    });

    test('Latencias muy altas pero válidas deben promediarse', () => {
      window.historialStatus['https://test.com'] = [
        { status: 200, time: 8000 },
        { status: 200, time: 9000 },
      ];

      const resultado = calcularPromedio('https://test.com');

      expect(resultado.promedio).toBe(8500);
      expect(resultado.estadoPromedio.className).toBe('status-extreme-risk');
    });
  });
});
