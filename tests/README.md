# Tests del Monitor de Disponibilidad

Este directorio contiene la suite completa de tests para el proyecto.

## 📁 Estructura

```
tests/
├── unit/                    # Tests unitarios (funciones aisladas)
│   ├── latencia.test.js    # Clasificación de umbrales
│   └── promedio.test.js    # Cálculo de promedios
├── integration/             # Tests de integración
│   └── serverless.test.js  # Función Netlify check-status
├── e2e/                     # Tests end-to-end
│   └── flujo-completo.test.js  # Simulación completa del frontend
└── README.md               # Este archivo
```

## 🧪 Tipos de Tests

### 1. **Tests Unitarios** (`unit/`)

Verifican funciones individuales de forma aislada.

**latencia.test.js**

- ✅ Clasificación correcta de latencias según umbrales
- ✅ Boundary testing (límites exactos)
- ✅ Manejo de códigos HTTP (200, 404, 500, 0)
- ✅ Penalización por timeout (>= 99999ms)
- ✅ Casos edge (latencia 0, negativos, strings)

**promedio.test.js**

- ✅ Cálculo de promedios con solo éxitos
- ✅ Exclusión de errores HTTP del promedio
- ✅ Exclusión de penalizaciones (99999ms)
- ✅ Manejo de historial vacío
- ✅ Historial mixto (éxitos + fallos)
- ✅ Clasificación del estado promedio

### 2. **Tests de Integración** (`integration/`)

Verifican el comportamiento completo de módulos integrados.

**serverless.test.js**

- ✅ Validación de parámetros de entrada
- ✅ Respuestas exitosas (status 200)
- ✅ Manejo de errores HTTP (404, 500)
- ✅ Timeout de 9 segundos
- ✅ Seguimiento de redirecciones
- ✅ Soporte HTTP y HTTPS
- ✅ Errores de red (DNS fallido)

### 3. **Tests End-to-End** (`e2e/`)

Simulan la interacción completa del usuario con la aplicación.

**flujo-completo.test.js**

- ✅ Carga inicial de la página
- ✅ Selector de duración (1-9 horas)
- ✅ Botón "Reiniciar Monitoreo"
- ✅ Aplicación de temas (default, pro, min)
- ✅ Cambio de idioma (es, en)
- ✅ Enlace a página de leyenda
- ✅ Persistencia en sessionStorage

## 🚀 Instalación

```bash
cd monitor-status-test
npm install --save-dev jest jsdom puppeteer
```

## ▶️ Ejecutar Tests

### Todos los tests

```bash
npm test
```

### Solo tests unitarios

```bash
npm run test:unit
```

### Solo tests de integración

```bash
npm run test:integration
```

### Solo tests E2E

```bash
npm run test:e2e
```

### Con cobertura de código

```bash
npm run test:coverage
```

### Modo watch (re-ejecuta al guardar)

```bash
npm run test:watch
```

## 📊 Cobertura Esperada

Los tests cubren:

- **Funciones críticas**: 100%
  - `obtenerEstadoVisual()`
  - `calcularPromedio()`
  - `guardarHistorial()` / `cargarHistorial()`
- **Función serverless**: 95%
  - Flujos principales y error handling
- **Frontend E2E**: 80%
  - Interacciones principales del usuario

## 🔧 Configuración

La configuración de Jest está en el archivo raíz `jest.config.js`.

Características:

- **testEnvironment**: jsdom para tests del DOM
- **coverageThreshold**: Mínimos de cobertura configurables
- **testMatch**: Detecta automáticamente archivos `*.test.js`

## 📝 Escribir Nuevos Tests

### Test Unitario

```javascript
describe('Mi Función', () => {
  test('Debe hacer X cuando Y', () => {
    const resultado = miFuncion(entrada);
    expect(resultado).toBe(valorEsperado);
  });
});
```

### Test de Integración

```javascript
describe('Módulo Completo', () => {
  test('Debe integrar A con B correctamente', async () => {
    const response = await moduloIntegrado();
    expect(response.statusCode).toBe(200);
  });
});
```

### Test E2E con Puppeteer

```javascript
test('Usuario puede hacer X', async () => {
  await page.goto('http://localhost:5500');
  await page.click('#mi-boton');
  const texto = await page.$eval('#resultado', (el) => el.textContent);
  expect(texto).toContain('Éxito');
});
```

## ⚠️ Limitaciones

### Tests de Integración

Los tests de `serverless.test.js` hacen peticiones HTTP reales:

- Dependen de conectividad a internet
- Usan `httpbin.org` como servicio de prueba
- Pueden fallar por latencia de red
- Se excluyen en CI con mocks (opcional)

### Tests E2E

Los tests E2E requieren:

- Navegador Chrome/Chromium instalado
- Archivo `index.html` accesible localmente
- No requieren servidor (usan `file://` protocol)

## 🐛 Debugging

### Ver salida detallada

```bash
npm test -- --verbose
```

### Ejecutar un solo archivo

```bash
npm test tests/unit/latencia.test.js
```

### Ver tests fallidos con detalles

```bash
npm test -- --no-coverage
```

## 📚 Referencias

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [JSDOM](https://github.com/jsdom/jsdom)
- [Puppeteer](https://pptr.dev/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
