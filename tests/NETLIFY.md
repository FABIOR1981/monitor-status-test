# Configuración de Tests en Netlify

Este documento explica cómo ejecutar los tests automáticamente en Netlify durante el despliegue.

## 🚀 Cómo Funciona

Netlify ejecutará los tests **antes** de desplegar tu aplicación:

1. **Push a GitHub** → Activa build en Netlify
2. **Netlify instala** → `npm install` (automático)
3. **Netlify ejecuta tests** → `npm run test:ci`
4. **Si tests pasan** ✅ → Despliega la aplicación
5. **Si tests fallan** ❌ → Cancela el despliegue

## ⚙️ Configuración Actual

### netlify.toml

```toml
[build]
  command = "npm run test:ci"  # Ejecuta tests antes de desplegar
  functions = "netlify/functions"
  publish = "."

[build.environment]
  NODE_VERSION = "18"
```

### package.json

```json
"test:ci": "jest tests/unit tests/integration --ci --coverage --maxWorkers=2"
```

**Nota:** Los tests E2E (Puppeteer) se **excluyen** en CI porque requieren navegador con display, que Netlify no provee.

## 📊 Tests que se Ejecutan en Netlify

✅ **Tests Unitarios** (`tests/unit/`)

- `latencia.test.js` - Clasificación de umbrales
- `promedio.test.js` - Cálculo de promedios

✅ **Tests de Integración** (`tests/integration/`)

- `serverless.test.js` - Función check-status

❌ **Tests E2E** (solo local)

- `flujo-completo.test.js` - Requiere navegador

## 🔍 Ver Resultados de Tests en Netlify

1. Ve a tu panel de Netlify
2. Selecciona tu sitio
3. Click en **"Deploys"**
4. Click en el deploy más reciente
5. Expande **"Deploy log"**
6. Busca la sección de tests:

```
10:45:23 AM: $ npm run test:ci
10:45:25 AM:
10:45:25 AM: > test:ci
10:45:25 AM: > jest tests/unit tests/integration --ci --coverage
10:45:25 AM:
10:45:27 AM: PASS tests/unit/latencia.test.js
10:45:28 AM: PASS tests/unit/promedio.test.js
10:45:30 AM: PASS tests/integration/serverless.test.js
10:45:30 AM:
10:45:30 AM: Test Suites: 3 passed, 3 total
10:45:30 AM: Tests:       43 passed, 43 total
```

## 🛑 Despliegue Bloqueado por Tests Fallidos

Si los tests fallan, verás:

```
10:45:30 AM: FAIL tests/unit/latencia.test.js
10:45:30 AM:   ● Clasificación de Latencia › debe ser MUY RÁPIDO
10:45:30 AM:
10:45:30 AM:     expect(received).toBe(expected)
10:45:30 AM:
10:45:30 AM:     Expected: "status-very-fast"
10:45:30 AM:     Received: "status-fast"
10:45:30 AM:
10:45:31 AM: Test Suites: 1 failed, 2 passed, 3 total
10:45:31 AM: ​
10:45:31 AM: ────────────────────────────────────────────────────────────────
10:45:31 AM:   "build.command" failed
10:45:31 AM: ────────────────────────────────────────────────────────────────
10:45:31 AM:
10:45:31 AM:   Error message
10:45:31 AM:   Command failed with exit code 1: npm run test:ci
```

**El despliegue se cancela** y la versión anterior sigue en producción.

## 🔧 Deshabilitar Tests Temporalmente

Si necesitas desplegar urgentemente sin tests:

### Opción 1: Modificar netlify.toml (temporal)

```toml
[build]
  command = "echo 'Tests deshabilitados temporalmente'"
  functions = "netlify/functions"
  publish = "."
```

### Opción 2: Variable de entorno en Netlify UI

1. Netlify Dashboard → Site settings
2. Build & deploy → Environment
3. Agregar: `SKIP_TESTS=true`
4. Modificar package.json:

```json
"test:ci": "if [ \"$SKIP_TESTS\" != \"true\" ]; then jest tests/unit tests/integration --ci; fi"
```

## 📈 Ver Cobertura de Código

La cobertura se genera pero no se publica automáticamente. Para publicarla:

### Opción: Codecov (gratis para repos públicos)

1. Ve a https://codecov.io/
2. Conecta tu repo de GitHub
3. Agrega a `netlify.toml`:

```toml
[build.environment]
  CODECOV_TOKEN = "tu-token-aqui"
```

4. Agrega a `package.json`:

```json
"test:ci": "jest tests/unit tests/integration --ci --coverage && npx codecov"
```

## 🏃 Ejecutar Tests Localmente (Simulando CI)

Para probar lo que Netlify ejecutará:

```bash
# Simular entorno CI
npm run test:ci

# Ver exactamente lo mismo que Netlify
CI=true npm run test:ci
```

## ⚠️ Limitaciones en Netlify Build

❌ **No disponible:**

- Navegadores (Chrome, Firefox)
- Display gráfico (X11)
- Tests E2E con Puppeteer
- Tests visuales de CSS

✅ **Disponible:**

- Node.js (v18)
- Funciones serverless
- Peticiones HTTP externas
- Tests unitarios
- Tests de integración

## 🔄 Workflow Recomendado

### Desarrollo Local

```bash
npm run test:watch    # Tests en modo watch
npm run test:e2e      # Ejecutar E2E manualmente
```

### Pre-commit

```bash
npm test              # Todos los tests (incluye E2E)
```

### CI/CD (Netlify)

```bash
npm run test:ci       # Solo unitarios + integración
```

## 📝 Mejores Prácticas

1. **Commits pequeños** - Tests más rápidos y fáciles de debuggear
2. **Branch protection** - Requiere tests pasados para merge
3. **Tests rápidos en CI** - Solo esenciales (< 2 minutos)
4. **E2E solo local** - O en CI especializado (GitHub Actions)
5. **Cobertura > 75%** - Configurado en jest.config.js

## 🆘 Troubleshooting

### "Tests se quedan colgados en Netlify"

- Reduce timeout en jest.config.js para CI
- Verifica que tests de integración no dependan de servicios lentos

### "Tests pasan local, fallan en Netlify"

- Diferencia de timezone (usa UTC en tests)
- Diferencia de versión de Node.js
- Dependencias faltantes en package.json

### "Build muy lento (> 5 minutos)"

- Usa `--maxWorkers=2` (ya configurado en test:ci)
- Excluye tests lentos con `--testPathIgnorePatterns`
- Mockea peticiones HTTP externas

## 📚 Referencias

- [Netlify Build Configuration](https://docs.netlify.com/configure-builds/overview/)
- [Jest CI Configuration](https://jestjs.io/docs/configuration#ci-boolean)
- [Testing Serverless Functions](https://docs.netlify.com/functions/test-functions/)
