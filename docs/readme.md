# Monitor de Disponibilidad de Servicios 🚀

Este documento unifica la documentación del repositorio y contiene toda la información necesaria para desplegar, desarrollar y contribuir al proyecto.

## Resumen rápido

- Monitor de servicios que verifica código de estado y latencia de una lista de URLs.
- Utiliza una función serverless como proxy para esquivar CORS y permitir mediciones desde el navegador con seguridad.
- i18n centralizado en `js/i18n_es.js` (y estructura para agregar más idiomas).
- Lógica de la leyenda en `js/leyenda_script.js` y constantes globales en `js/config.js`.

## Cambios recientes

- Centralización de textos (i18n) en `js/i18n_es.js`.
- Separación de responsabilidades: `js/leyenda_script.js` (leyenda) y `js/script.js` (monitor principal).
- Definición de `TEMA_FILES` y `LEYENDA_TEMA_FILES` en `js/config.js`.
- Se eliminaron o archivaron archivos obsoletos relacionados con la leyenda.

## Descripción

Este proyecto es un monitor de disponibilidad web diseñado para
verificar el estado (_status code_) y la latencia (tiempo de
respuesta) de una lista de URLs críticas. La aplicación utiliza
una arquitectura **Serverless** (Netlify Functions) para evadir
problemas de CORS y **Mixed Content** al realizar las peticiones.

**Frecuencia de Monitoreo:** Los datos se actualizan
automáticamente cada **5 minutos**.

## 📊 Umbrales de Latencia y Estados

El monitor clasifica la latencia (tiempo de respuesta) en 7 niveles basados en la **Psicología de la Interacción Humano-Computadora**:

| Estado             | Rango de Latencia  | Emoji | Significado                                      |
| ------------------ | ------------------ | ----- | ------------------------------------------------ |
| **MUY RÁPIDO**     | < 300 ms           | 🚀    | Rendimiento óptimo - Instantáneo para el usuario |
| **RÁPIDO**         | 300-500 ms         | ⭐    | Interacción fluida sin molestias                 |
| **NORMAL**         | 500-800 ms         | ✅    | Rendimiento aceptable - El foco se mantiene      |
| **LENTO**          | 800-1500 ms        | ⚠️    | Demora molesta - Alerta temprana                 |
| **CRÍTICO**        | 1500-3000 ms       | 🐌    | Riesgo de abandono - Fallo inminente             |
| **RIESGO**         | 3000-5000 ms       | 🚨    | Fallo funcional - Alarma                         |
| **RIESGO EXTREMO** | 5000-99999 ms      | 🔥    | Latencia inaceptable - Abandono asegurado        |
| **CAÍDA TOTAL**    | ≥ 99999 ms o error | ❌    | Timeout excedido o servicio caído                |

### Justificación de los Umbrales

- **<100 ms**: El cerebro humano percibe la respuesta como instantánea (Regla de Nielsen)
- **300 ms**: Límite de la percepción inconsciente
- **1 segundo**: El usuario comienza a perder el foco
- **3 segundos**: Límite crítico donde los usuarios abandonan páginas web
- **5 segundos**: Considerado fallo funcional en la mayoría de sistemas
- **10+ segundos**: Timeout típico - El usuario ya abandonó la acción

Para más detalles, consulta [justificacion_rangos_latencia.md](justificacion_rangos_latencia.md).

## 🔍 Códigos de Estado HTTP y Errores

El monitor detecta y clasifica los siguientes códigos HTTP:

### ✅ Códigos de Éxito (2xx)

- **200-299**: OK - La conexión y el servicio respondieron correctamente

### ⚠️ Códigos de Error Comunes

| Código  | Nombre                        | Descripción                                  |
| ------- | ----------------------------- | -------------------------------------------- |
| **0**   | Sin conexión                  | Timeout, DNS, red o CORS bloqueó la petición |
| **301** | Redireccionamiento permanente | Recurso movido permanentemente               |
| **302** | Redireccionamiento temporal   | Recurso temporalmente en otra URL            |
| **400** | Solicitud incorrecta          | Petición mal formada o inválida              |
| **401** | No autorizado                 | Requiere autenticación                       |
| **403** | Acceso prohibido              | Prohibido incluso con autenticación válida   |
| **404** | No encontrado                 | El recurso no existe en el servidor          |
| **408** | Tiempo agotado                | El servidor agotó el tiempo de espera        |
| **429** | Demasiadas solicitudes        | Se superó el límite de tasa (Rate Limit)     |
| **500** | Error del servidor            | Error interno genérico del servidor          |
| **502** | Puerta de enlace incorrecta   | Gateway recibió respuesta inválida           |
| **503** | Servicio no disponible        | Servidor sobrecargado o en mantenimiento     |
| **504** | Timeout de gateway            | Gateway no recibió respuesta a tiempo        |

**Nota:** Cualquier código fuera del rango 2xx se marca visualmente como **❌ CAÍDA/ERROR** con el código entre paréntesis (ej: `❌ Caída (404 - No encontrado)`).

## ⏱️ Cómo se Mide la Latencia

### Metodología de Medición

La latencia se mide mediante un **ciclo completo de petición-respuesta**:

1. **Frontend** (JavaScript en el navegador) registra el tiempo de inicio
2. **Solicitud al Proxy Serverless** → `/.netlify/functions/check-status`
3. **Proxy realiza petición HTTP** al servicio objetivo
4. **Proxy registra el tiempo** de respuesta del servicio
5. **Proxy devuelve** al frontend: `{status: código, time: milisegundos}`
6. **Frontend actualiza** la tabla con latencia y estado

### Componentes del Tiempo Medido

La latencia incluye:

- ✅ **Tiempo de DNS lookup** (si aplica)
- ✅ **Tiempo de conexión TCP/SSL** (handshake)
- ✅ **Tiempo de procesamiento del servidor** remoto
- ✅ **Tiempo de transferencia de datos**
- ❌ **NO incluye**: Tiempo de renderizado en navegador

### Código de Medición

```javascript
// En el proxy serverless (check-status.js)
const startTime = Date.now();
const response = await fetch(targetUrl, {
  method: 'GET',
  signal: controller.signal,
  redirect: 'follow',
});
const endTime = Date.now();
const responseTime = endTime - startTime;
```

## 📈 Utilidad de la Medición

### Valor Operacional

1. **Detección Temprana de Problemas**

   - Alerta cuando servicios se degradan **antes** de caerse completamente
   - Los umbrales progresivos (LENTO → CRÍTICO → RIESGO) permiten acción preventiva

2. **Monitoreo de SLA**

   - Verifica cumplimiento de Acuerdos de Nivel de Servicio
   - Historial de latencias permite análisis de tendencias

3. **Priorización de Recursos**

   - Identifica servicios críticos que necesitan optimización
   - Compara rendimiento entre diferentes servicios

4. **Diagnóstico de Problemas**
   - Latencia alta + HTTP 200 → Problema de rendimiento del servidor
   - Latencia alta + HTTP 5xx → Servidor sobrecargado
   - Latencia muy alta + timeout → Problema de red o firewall

### Limitaciones de la Medición

⚠️ **La latencia puede variar según:**

- Ubicación geográfica del servidor Netlify (puede estar en región diferente)
- Carga del proxy serverless (cold start vs. warm)
- Congestión de red entre Netlify y el servicio objetivo
- Caché y CDN del servicio objetivo

💡 **Para medición más precisa:** Considera usar múltiples ubicaciones geográficas o servicios especializados como Pingdom, UptimeRobot, etc.

### Casos de Uso Prácticos

1. **Monitoreo 24/7**: Verifica disponibilidad continua sin intervención manual
2. **Alertas Proactivas**: Detecta degradación antes de que afecte usuarios finales
3. **Métricas de Rendimiento**: Genera reportes históricos de disponibilidad
4. **Validación Post-Deploy**: Verifica que despliegues no degraden rendimiento
5. **Comparación de Proveedores**: Evalúa diferentes servicios de hosting

## 🛠️ Estructura del Proyecto y Archivos Principales

El proyecto sigue una arquitectura de Frontend ligero que se
apoya en una función Serverless como proxy.

| Archivo/Directorio                  | Propósito                                                  |
| :---------------------------------- | :--------------------------------------------------------- |
| `index.html`                        | Estructura principal y contenedores del monitor.           |
| `styles_base.css`                   | Variables y reglas base compartidas por temas.             |
| `styles_def.css`                    | Tema estándar.                                             |
| `styles_pro.css`                    | Tema PRO.                                                  |
| `js/script.js`                      | Lógica de Frontend, historial, temas y llamadas al proxy.  |
| `webs.json`                         | **Lista de URLs a monitorizar.**                           |
| `netlify/functions/check-status.js` | Función Serverless (Proxy) para verificar estado/latencia. |
| `JUSTIFICACION_RANGOS_LATENCIA.md`  | Documento que justifica los umbrales de rendimiento.       |
| `ARQUITECTURA.MD`                   | Explica el flujo de datos y el rol del proxy.              |

## ⚙️ Configuración, despliegue y ejecución local

### 1. Requisitos Previos

Solo necesita una cuenta en un repositorio Git (GitHub, GitLab, etc.) y una cuenta en Netlify.

### 2. Configuración de URLs

Edite el archivo webs.json para agregar o eliminar los servicios web que desea monitorizar.

Puede utilizar cualquier editor de texto o IDE (como VS Code o Notepad++) para modificar este archivo JSON:

`json
[
    { "nombre": "Nombre del Servicio", "url": "https://ejemplo.com" }
]
`

### 3. Despliegue del Monitor (Flujo Recomendado: Netlify Web)

El flujo más rápido no requiere ninguna instalación local:

1.  Suba este código a un repositorio de Git (GitHub, etc.).
2.  Vaya al panel de Netlify, seleccione **"Add new site"** y elija **"Import an existing project"**.
3.  Conecte su repositorio. Netlify detectará automáticamente todos los archivos.

**Netlify se encarga de:**

- **Instalación:** Detecta `package.json` y ejecuta `npm install` automáticamente.
- **Configuración:** Lee `netlify.toml` y despliega la función Serverless (`check-status.js`) desde la carpeta `netlify/functions`.

### 4. Ejecución y Pruebas Locales (Opcional - Requiere Instalación)

Si necesita desarrollar o depurar las funciones Serverless en su entorno:

1.  Instale **Node.js** y la **CLI de Netlify** (`npm install netlify-cli -g`).
2.  Instale las dependencias manualmente:
    `bash
npm install
`
3.  Desde la raíz del proyecto, ejecute el servidor de desarrollo:
    `bash
netlify dev
`

## 🎨 Temas y customización visual

El monitor soporta múltiples temas visuales:

1.  **Tema Estándar (def):** Se activa por defecto (`css/styles_def.css`)
2.  **Tema PRO (pro):** Información avanzada - columna URL visible, botón PSI, códigos de error detallados
3.  **Tema Minimalista (min):** Vista simplificada para dashboards

### Cambiar Tema

Agrega el parámetro `tema` a la URL:

```
https://tu-monitor.netlify.app/?tema=pro
https://tu-monitor.netlify.app/?tema=min
```

## 📊 Historial y Promedios

### Duración del Historial

El monitor permite seleccionar la duración del historial de monitoreo:

| Duración | Mediciones | Tiempo Total                       |
| -------- | ---------- | ---------------------------------- |
| 1 hora   | 12         | 60 minutos (1 medición cada 5 min) |
| 2 horas  | 24         | 120 minutos                        |
| 3 horas  | 36         | 180 minutos                        |
| 4 horas  | 48         | 240 minutos                        |
| 5 horas  | 60         | 300 minutos                        |
| ...      | ...        | ...                                |
| 9 horas  | 108        | 540 minutos                        |

### Cálculo de Promedios

El promedio se calcula **solo con mediciones exitosas** (status 200):

```javascript
promedio = suma(latencias_exitosas) / cantidad_exitosas;
```

**Reglas especiales:**

- Si **>50% de mediciones fallan** → Estado promedio = "CAÍDA/ERROR"
- Si **100% de mediciones fallan** → Promedio = 0 ms, Estado = "CAÍDA/ERROR"
- Solo mediciones exitosas se suman (fallos no inflan el promedio)

### Comportamiento del Monitoreo

1. **Inicio**: Comienza a recolectar mediciones cada 5 minutos
2. **Progreso**: Muestra contador `PROMEDIO [6/12]` indicando mediciones acumuladas
3. **Máximo alcanzado**: Al llegar a 12/12, el monitoreo **se pausa automáticamente**
4. **F5 (Recargar)**: Si el historial está completo, muestra datos guardados **sin nuevas mediciones**
5. **Reiniciar**: Botón "🔄 Reiniciar Monitoreo" limpia historial y comienza desde cero

**Almacenamiento:** Los datos se guardan en `sessionStorage` (se pierden al cerrar la pestaña)

## 🚨 Detección de Fallos Globales

El monitor incluye un sistema inteligente para detectar si los problemas son reales o causados por sobrecarga del sistema de monitoreo:

### Criterios de Fallo Global

Se considera **Fallo Global Crítico** cuando:

1. **100% del grupo CRÍTICO falla** - Todos los servicios marcados como críticos están caídos
2. **≥80% de todos los servicios superan 9000ms** - Posible sobrecarga del proxy
3. **0 resultados disponibles** - Fallo total de red

### Comportamiento en Fallo Global

Cuando se detecta un fallo global:

- 🚨 **Alerta visible** en la barra de información
- ❌ **NO se actualiza la tabla** con datos erróneos (mantiene datos anteriores)
- ⏸️ **Datos no confiables se descartan** para evitar falsos positivos
- 🔄 **Monitoreo continúa** en el siguiente ciclo (5 min)

**Mensaje mostrado:**

> "Datos de monitoreo no disponibles/no confiables. Se detectó una latencia crítica generalizada, posiblemente debido a una sobrecarga del sistema de monitoreo. Por favor, espere el próximo ciclo o actualice la página."

### Modo PRO - Detalles del Fallo

En tema PRO (`?tema=pro`), se muestra el motivo específico:

- "Falló el 100% del grupo crítico: CRITICO"
- "80% de los servicios superaron el umbral de 9000ms"
- "No hay resultados disponibles (Fallo de red total)"

Esto ayuda a distinguir entre:

- ✅ Problema real del servicio monitoreado
- ⚠️ Problema del sistema de monitoreo (falso positivo)

## 🔤 Internacionalización (i18n)

- Los textos se encuentran en `js/i18n_es.js` (archivo principal en Español), los demás idiomas siguen el mismo patrón (ej. `js/i18n_en.js`).
- Si se agreaga un idioma nuevo, incluir su entrada en `I18N_FILES` dentro de `js/config.js`.

## 💻 Desarrollo y estructura

- Recomendado usar `netlify-cli` para desarrollar con la función serverless:

```bash
npm install
npx netlify-cli dev
```

### Archivos de configuración

- **`js/config.js`**: Constantes de configuración del sistema
  - `UMBRALES_LATENCIA`: Umbrales de latencia (MUY_RAPIDO: 300ms, RAPIDO: 500ms, etc.)
  - `TEMA_FILES`: Mapeo de temas CSS para el monitor principal
  - `LEYENDA_TEMA_FILES`: Mapeo de temas CSS para la página de leyenda
  - `PROXY_ENDPOINT`: Ruta de la función serverless (`/.netlify/functions/check-status`)
  - `FRECUENCIA_MONITOREO_MS`: Intervalo entre mediciones (5 minutos = 300,000 ms)
  - `DURACION_OPCIONES`: Configuración de duraciones de historial (1-9 horas)
  - `GRUPO_CRITICO_NOMBRE`: Nombre del grupo crítico para detección de fallos globales
  - `UMBRAL_FALLO_GLOBAL_MS`: Latencia que se considera fallo global (9000 ms)
  - `PORCENTAJE_FALLO_GLOBAL`: % de servicios que deben fallar para alerta global (80%)

### Configuración de webs.json

El archivo `webs.json` define los servicios a monitorear:

```json
[
  {
    "nombre": "Google",
    "url": "https://www.google.com",
    "grupo": "EXTERNO",
    "orden": 2
  },
  {
    "nombre": "Servicio Crítico",
    "url": "https://api.miempresa.com",
    "grupo": "CRITICO",
    "orden": 1
  }
]
```

**Propiedades:**

- `nombre`: Nombre descriptivo del servicio
- `url`: URL completa a monitorear
- `grupo`: Grupo lógico (CRITICO, EXTERNO, etc.)
- `orden`: Orden de visualización (1 = primero, aparece arriba)

## 🧭 Agregar/Editar servicios a monitorear

- Editar `webs.json` en la raíz: agregar/editar objetos con `nombre`, `url` y `grupo`.

## 🙋 Contribuir y mantenimiento

- Añadir `stylelint` o `eslint` para validar código y estilos.
- Crear pruebas end-to-end (Playwright o Puppeteer) para asegurar que `index.html` y `leyenda.html` carguen y muestren los textos correctamente.

## ❗ Notas finales y buenas prácticas

- Mantener los textos de la UI en archivos i18n por idioma.
- Mantener las constantes de configuración en `js/config.js` para evitar duplicidad.
- Separar lógica (JS) de la presentación (CSS/HTML) y centralizar variables.

---

Este archivo es el punto de referencia principal. Para documentación adicional, ver la carpeta `docs/`.
