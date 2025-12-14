/**
 * Tests End-to-End: Flujo Completo de Monitoreo
 *
 * Simula el flujo completo:
 * 1. Cargar webs.json
 * 2. Verificar estado via función serverless
 * 3. Actualizar historial
 * 4. Calcular promedios
 * 5. Renderizar tabla
 */

const puppeteer = require('puppeteer');
const path = require('path');

describe('E2E: Flujo Completo de Monitoreo', () => {
  let browser;
  let page;
  const indexPath = `file://${path.join(__dirname, '../../index.html')}`;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }, 30000);

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.goto(indexPath, { waitUntil: 'networkidle0' });
  });

  afterEach(async () => {
    if (page) {
      await page.close();
    }
  });

  describe('Carga Inicial de la Página', () => {
    test('Debe cargar la página sin errores', async () => {
      const title = await page.title();
      expect(title).toContain('Monitor');
    });

    test('Debe mostrar el selector de duración', async () => {
      const selector = await page.$('#duracion-selector');
      expect(selector).not.toBeNull();
    });

    test('Debe mostrar el botón de reiniciar', async () => {
      const boton = await page.$('#btn-reiniciar');
      expect(boton).not.toBeNull();

      const textoBoton = await page.$eval('#btn-reiniciar', (el) =>
        el.textContent.trim()
      );
      expect(textoBoton).toContain('Reiniciar');
    });

    test('Debe mostrar la tabla de estado', async () => {
      const tabla = await page.$('#status-table-body');
      expect(tabla).not.toBeNull();
    });
  });

  describe('Carga de Idioma', () => {
    test('Debe cargar el idioma por defecto (español)', async () => {
      await page.waitForFunction(
        () => window.TEXTOS_ACTUAL && window.TEXTOS_ACTUAL.general
      );

      const textosDef = await page.evaluate(() => window.TEXTOS_ACTUAL.general);
      expect(textosDef).toBeDefined();
    });

    test('Debe cambiar a inglés con parámetro ?lang=en', async () => {
      await page.goto(`${indexPath}?lang=en`, { waitUntil: 'networkidle0' });

      await page.waitForFunction(
        () =>
          window.TEXTOS_ACTUAL &&
          window.TEXTOS_ACTUAL.general &&
          window.TEXTOS_ACTUAL.general.APP_TITLE
      );

      const titulo = await page.evaluate(
        () => window.TEXTOS_ACTUAL.general.APP_TITLE
      );
      expect(titulo).toContain('Status Monitor');
    });
  });

  describe('Selector de Duración', () => {
    test('Debe tener opciones de 1 a 9 horas', async () => {
      const opciones = await page.$$eval(
        '#duracion-selector option',
        (opts) => opts.length
      );
      expect(opciones).toBe(9);
    });

    test('Cambiar duración debe actualizar maxHistorialActual', async () => {
      await page.select('#duracion-selector', '3');

      const maxHistorial = await page.evaluate(() => window.maxHistorialActual);
      expect(maxHistorial).toBe(36);
    });
  });

  describe('Botón Reiniciar Monitoreo', () => {
    test('Debe limpiar el historial al hacer clic', async () => {
      await page.evaluate(() => {
        window.historialStatus = {
          'https://test.com': [{ status: 200, time: 500 }],
        };
      });

      await page.click('#btn-reiniciar');

      await page.waitForTimeout(500);

      const historial = await page.evaluate(() => window.historialStatus);
      expect(Object.keys(historial).length).toBe(0);
    });
  });

  describe('Aplicación de Temas', () => {
    test('Debe aplicar tema PRO con parámetro ?tema=pro', async () => {
      await page.goto(`${indexPath}?tema=pro`, { waitUntil: 'networkidle0' });

      const linkCSS = await page.$eval(
        'link[href*="styles_pro"]',
        (el) => el.href
      );
      expect(linkCSS).toContain('styles_pro.css');
    });

    test('Debe aplicar tema minimalista con parámetro ?tema=min', async () => {
      await page.goto(`${indexPath}?tema=min`, { waitUntil: 'networkidle0' });

      const linkCSS = await page.$eval(
        'link[href*="styles_min"]',
        (el) => el.href
      );
      expect(linkCSS).toContain('styles_min.css');
    });
  });

  describe('Enlace a Página de Leyenda', () => {
    test('El enlace debe incluir parámetros de tema e idioma', async () => {
      await page.goto(`${indexPath}?tema=pro&lang=en`, {
        waitUntil: 'networkidle0',
      });

      const href = await page.$eval('#enlace-leyenda', (el) => el.href);
      expect(href).toContain('leyenda.html');
      expect(href).toContain('tema=pro');
      expect(href).toContain('lang=en');
    });
  });

  describe('SessionStorage', () => {
    test('Historial debe guardarse en sessionStorage', async () => {
      await page.evaluate(() => {
        window.historialStatus = {
          'https://ejemplo.com': [
            { status: 200, time: 300 },
            { status: 200, time: 400 },
          ],
        };
        window.guardarHistorial();
      });

      const stored = await page.evaluate(() =>
        sessionStorage.getItem('latencyHistory')
      );
      expect(stored).toBeDefined();

      const parsed = JSON.parse(stored);
      expect(parsed['https://ejemplo.com']).toHaveLength(2);
    });

    test('Historial debe cargarse desde sessionStorage al recargar', async () => {
      await page.evaluate(() => {
        const historial = {
          'https://ejemplo.com': [{ status: 200, time: 500 }],
        };
        sessionStorage.setItem('latencyHistory', JSON.stringify(historial));
      });

      await page.reload({ waitUntil: 'networkidle0' });

      const cargado = await page.evaluate(() => window.historialStatus);
      expect(cargado['https://ejemplo.com']).toHaveLength(1);
      expect(cargado['https://ejemplo.com'][0].time).toBe(500);
    });
  });
});
