# Monitor de Disponibilidad de Servicios 🚀

Este documento unifica la documentación del repositorio y contiene toda la información necesaria para desplegar, desarrollar y contribuir al proyecto.

## Resumen rápido

- Monitor de servicios que verifica código de estado y latencia de una lista de URLs.
- Utiliza una función serverless como proxy para esquivar CORS y permitir mediciones desde el navegador con seguridad.
- i18n centralizado en `lang/i18n_es.js` (y estructura para agregar más idiomas).
- Lógica de la leyenda en `js/leyenda_script.js` y constantes globales en `js/config.js`.

## Cambios recientes

- **Sistema de expansión de errores**: Botón toggle (▼) que muestra historial de últimos 10 errores por servicio.
- **Contador de errores**: Indicador visual `⚠️ 3/12` en columna promedio mostrando errores/total.
- **Selector de duración**: Permite elegir ventana de historial (12h, 1d, 3d, 7d) con mediciones cada 5 minutos.
- **3 temas visuales**: Default (def), Profesional (pro) y Minimalista (min) con estilos unificados.
- **Página de leyenda**: `leyenda.html` con documentación de umbrales, códigos HTTP y funcionamiento.
- **Centralización de textos (i18n)**: `js/i18n_es.js` y `js/i18n_en.js` con soporte multiidioma.
- **Separación de responsabilidades**: `js/leyenda_script.js` (leyenda) y `js/script.js` (monitor principal).
- **Configuración global**: `js/config.js` con todas las constantes (TEMA_FILES, DURACION_OPCIONES, UMBRALES_LATENCIA).
- **Botones mejorados**: Botones PSI y toggle de errores con estética unificada (mismo tamaño, bordes redondeados).

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

| Archivo/Directorio                      | Propósito                                                        |
| :-------------------------------------- | :--------------------------------------------------------------- |
| `index.html`                            | Estructura principal y contenedores del monitor.                 |
| `leyenda.html`                          | Página de leyenda con documentación de umbrales y códigos HTTP.  |
| `css/styles_base.css`                   | Variables y reglas base compartidas por temas.                   |
| `css/styles_def.css`                    | Tema estándar (default).                                         |
| `css/styles_pro.css`                    | Tema profesional con información avanzada.                       |
| `css/styles_min.css`                    | Tema minimalista para dashboards.                                |
| `css/leyenda_base.css`                  | Estilos base compartidos para la página de leyenda.              |
| `css/leyenda_def.css`                   | Tema estándar para leyenda.                                      |
| `css/leyenda_pro.css`                   | Tema profesional para leyenda.                                   |
| `css/leyenda_min.css`                   | Tema minimalista para leyenda.                                   |
| `js/config.js`                          | Configuración global (umbrales, temas, duraciones, constantes).  |
| `js/script.js`                          | Lógica principal del monitor (historial, temas, llamadas proxy). |
| `js/leyenda_script.js`                  | Lógica de la página de leyenda (carga de temas).                 |
| `js/i18n_es.js`                         | Textos en español (idioma por defecto).                          |
| `js/i18n_en.js`                         | Textos en inglés.                                                |
| `webs.json`                             | **Lista de URLs a monitorizar.**                                 |
| `netlify/functions/check-status.js`     | Función Serverless (Proxy) para verificar estado/latencia.       |
| `docs/justificacion_rangos_latencia.md` | Documento que justifica los umbrales de rendimiento.             |
| `docs/arquitectura.md`                  | Explica el flujo de datos y el rol del proxy.                    |
| `docs/estructura.md`                    | Detalle de la estructura de archivos del proyecto.               |
| `docs/resolución de problemas.md`       | Guía de troubleshooting y soluciones comunes.                    |

## ⚙️ Configuración, despliegue y ejecución local

### 1. Requisitos Previos

Solo necesita una cuenta en un repositorio Git (GitHub, GitLab, etc.) y una cuenta en Netlify.

### 2. Configuración de URLs

Edite el archivo data/webs.json para agregar o eliminar los servicios web que desea monitorizar.

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

El monitor soporta múltiples temas visuales tanto para el monitor principal como para la página de leyenda:

1.  **Tema Estándar (def):** Se activa por defecto
    - Monitor: `css/styles_def.css`
    - Leyenda: `css/leyenda_def.css`
2.  **Tema Profesional (pro):** Información avanzada - columna URL visible, botón PSI, códigos de error detallados
    - Monitor: `css/styles_pro.css`
    - Leyenda: `css/leyenda_pro.css`
3.  **Tema Minimalista (min):** Vista simplificada para dashboards
    - Monitor: `css/styles_min.css`
    - Leyenda: `css/leyenda_min.css`

### Cambiar Tema

Agrega el parámetro `tema` a la URL:

```
https://tu-monitor.netlify.app/?tema=pro
https://tu-monitor.netlify.app/?tema=min
https://tu-monitor.netlify.app/leyenda.html?tema=pro
```

### Características Visuales por Tema

| Característica      | Default (def) | Profesional (pro) | Minimalista (min) |
| ------------------- | ------------- | ----------------- | ----------------- |
| Columna URL         | ❌ Oculta     | ✅ Visible        | ❌ Oculta         |
| Columna Status HTTP | ❌ Oculta     | ✅ Visible        | ❌ Oculta         |
| Botón PSI           | ✅ Visible    | ✅ Visible        | ✅ Visible        |
| Toggle errores      | ✅ Visible    | ✅ Visible        | ✅ Visible        |
| Emojis estado       | ✅ Visible    | ✅ Visible        | ⚠️ Limitados      |
| Paleta de colores   | Azul claro    | Gris oscuro       | Blanco/Negro      |
| Bordes y sombras    | ✅ Suaves     | ✅ Prominentes    | ❌ Mínimos        |

## 📊 Historial y Promedios

### Selector de Duración del Historial

El monitor incluye un selector dinámico que permite elegir la ventana de tiempo del historial:

| Duración | Mediciones | Tiempo Total                        |
| -------- | ---------- | ----------------------------------- |
| 12 horas | 144        | 720 minutos (1 medición cada 5 min) |
| 1 día    | 288        | 1440 minutos (24 horas)             |
| 3 días   | 864        | 4320 minutos (72 horas)             |
| 7 días   | 2016       | 10080 minutos (1 semana)            |

**Uso del selector:**

```html
<select id="duracion-selector">
  <option value="12h">Últimas 12 horas</option>
  <option value="1d">Último día</option>
  <option value="3d">Últimos 3 días</option>
  <option value="7d">Últimos 7 días</option>
</select>
```

Al cambiar la duración:

1. El historial actual se **limpia automáticamente**
2. Se ajusta el **máximo de mediciones** según la duración elegida
3. El contador de progreso muestra `[0/288]` para 1 día, `[0/2016]` para 7 días, etc.

### Contador de Errores

En la columna de promedio, si hay errores detectados, se muestra un indicador:

```
⚠️ 3/12
```

- **Primer número**: Cantidad de errores detectados (status ≠ 200 o latencia ≥ 99999ms)
- **Segundo número**: Total de mediciones realizadas
- **Color**: Rojo (#c92a2a) para llamar la atención

### Expansión de Detalles de Errores

Al hacer clic en el botón **▼** (toggle), se expande una fila con los últimos 10 errores:

**Información mostrada por error:**

- 🕒 **Fecha y hora**: "14/12 10:45"
- 🔢 **Código HTTP**: Con badge de color (ej: `404`)
- 📝 **Mensaje**: Descripción del error en español
- ⏱️ **Latencia**: Tiempo de respuesta en ms

**Ejemplo visual:**

```
╔══════════════════════════════════════════════════╗
║ 📋 Historial de Errores                         ║
╠══════════════════════════════════════════════════╣
║ • 14/12 10:45 | 404 | No encontrado | 250 ms   ║
║ • 14/12 10:40 | 500 | Error del servidor | 0 ms║
║ • 14/12 10:35 | 0 | Sin conexión | 99999 ms    ║
╚══════════════════════════════════════════════════╝
Mostrando últimos 10 errores (Total: 12)
```

**Características:**

- Animación suave de expansión/colapso (300ms)
- Fondo rosa claro (#fff5f5) con borde rojo
- Fuente monoespaciada para mejor legibilidad
- Hover cambia fondo a rosa más oscuro
- Si hay más de 10 errores, muestra mensaje "Mostrando últimos 10 errores (Total: X)"

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

El sistema de traducción está centralizado en archivos por idioma:

- **Español** (por defecto): `js/i18n_es.js`
- **Inglés**: `js/i18n_en.js`

### Estructura de textos

```javascript
window.TEXTOS_ES = {
  general: {
    LOADING: 'Cargando...',
    DURATION_LABEL: 'Duración del historial:',
  },
  status: {
    MUY_RAPIDO: 'Muy Rápido',
    RAPIDO: 'Rápido',
    // ... más estados
  },
  errors: {
    NO_CONNECTION: 'Sin conexión',
    NOT_FOUND: 'No encontrado',
    // ... más errores HTTP
  },
};
```

### Agregar nuevo idioma

1. Crear archivo `js/i18n_XX.js` (XX = código de idioma)
2. Copiar estructura de `js/i18n_es.js`
3. Traducir todos los textos
4. Registrar en `js/config.js`:

```javascript
const I18N_FILES = {
  es: 'js/i18n_es.js',
  en: 'js/i18n_en.js',
  fr: 'js/i18n_fr.js', // Nuevo idioma
};
```

5. Usar parámetro URL: `?lang=fr`

### Detección automática de idioma

Si no se especifica idioma en la URL, se usa español por defecto. Para cambiar el idioma predeterminado, modificar `DEFAULT_IDIOMA` en `js/config.js`.

## 💻 Desarrollo y estructura

- Recomendado usar `netlify-cli` para desarrollar con la función serverless:

```bash
npm install
npx netlify-cli dev
```

### Archivos de configuración

- **`js/config.js`**: Constantes de configuración del sistema
  - `UMBRALES_LATENCIA`: Umbrales de latencia en milisegundos
    - `MUY_RAPIDO: 300` - Excelente: respuesta casi instantánea
    - `RAPIDO: 500` - Bueno: respuesta rápida perceptible
    - `NORMAL: 800` - Aceptable: ligero retraso pero usable
    - `LENTO: 1500` - Preocupante: retraso notable
    - `CRITICO: 3000` - Grave: degradación significativa
    - `RIESGO: 5000` - Muy grave: próximo a fallo
    - `PENALIZACION_FALLO: 99999` - Marcador especial para fallos
  - `TEMA_FILES`: Mapeo de temas CSS para el monitor principal
    - `def`: 'css/styles_def.css'
    - `pro`: 'css/styles_pro.css'
    - `min`: 'css/styles_min.css'
  - `LEYENDA_TEMA_FILES`: Mapeo de temas CSS para la página de leyenda
    - `def`: 'css/leyenda_def.css'
    - `pro`: 'css/leyenda_pro.css'
    - `min`: 'css/leyenda_min.css'
  - `PROXY_ENDPOINT`: Ruta de la función serverless (`/.netlify/functions/check-status`)
  - `FRECUENCIA_MONITOREO_MS`: Intervalo entre mediciones (5 minutos = 300,000 ms)
  - `DURACION_OPCIONES_DISPONIBLES`: Array con opciones de duración
  - `DURACION_OPCIONES`: Configuración de duraciones de historial
    - `'12h'`: { mediciones: 144, etiqueta: "Últimas 12 horas" }
    - `'1d'`: { mediciones: 288, etiqueta: "Último día" }
    - `'3d'`: { mediciones: 864, etiqueta: "Últimos 3 días" }
    - `'7d'`: { mediciones: 2016, etiqueta: "Últimos 7 días" }
  - `DURACION_DEFAULT`: Duración por defecto ('12h')
  - `I18N_FILES`: Mapeo de archivos de traducción por idioma
    - `es`: 'js/i18n_es.js'
    - `en`: 'js/i18n_en.js'
  - `DEFAULT_IDIOMA`: Idioma por defecto si no se especifica ninguno ('es')
  - `GRUPO_CRITICO_NOMBRE`: Nombre del grupo crítico para detección de fallos globales
  - `UMBRAL_FALLO_GLOBAL_MS`: Latencia que se considera fallo global (9000 ms)
  - `PORCENTAJE_FALLO_GLOBAL`: % de servicios que deben fallar para alerta global (80%)
  - `HTTP_STATUS_SUCCESS`: Códigos HTTP de éxito (200, 201, 204, 301, 302, 304)
  - `HTTP_STATUS_ERROR`: Códigos HTTP de error (0, 400, 401, 403, 404, 408, 429, 500, 502, 503, 504)

### Configuración de webs.json

El archivo `data/webs.json` define los servicios a monitorear:

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

Editar `webs.json`: agregar/editar objetos con `nombre`, `url`, `grupo` y `orden`.

**Ejemplo completo:**

```json
[
  {
    "nombre": "Google",
    "url": "https://www.google.com",
    "grupo": "EXTERNO",
    "orden": 2
  },
  {
    "nombre": "API Producción",
    "url": "https://api.miempresa.com/health",
    "grupo": "CRITICO",
    "orden": 1
  },
  {
    "nombre": "Panel Administrativo",
    "url": "https://admin.miempresa.com",
    "grupo": "INTERNO",
    "orden": 3
  }
]
```

**Propiedades:**

- `nombre`: Nombre descriptivo del servicio (aparece en la columna Nombre)
- `url`: URL completa incluyendo protocolo (https://)
- `grupo`: Grupo lógico (CRITICO, EXTERNO, INTERNO, etc.) - usado para detección de fallos globales
- `orden`: Número que define la posición en la tabla (1 = primero/arriba, mayor = abajo)

**Tips:**

- Agrupar servicios críticos con `"grupo": "CRITICO"` para aprovechar la detección de fallos globales
- Usar `orden` para priorizar visualmente los servicios más importantes
- La URL debe ser accesible públicamente (el proxy de Netlify la consultará)
- Evitar URLs que requieran autenticación compleja (OAuth, tokens dinámicos)

## 🙋 Contribuir y mantenimiento

### Validación de código

- Añadir `stylelint` para validar CSS:
  ```bash
  npm install --save-dev stylelint stylelint-config-standard
  ```
- Añadir `eslint` para validar JavaScript:
  ```bash
  npm install --save-dev eslint
  ```

### Pruebas automatizadas

- Crear pruebas end-to-end con Playwright o Puppeteer para:
  - Verificar que `index.html` carga correctamente
  - Verificar que `leyenda.html` carga con todos los temas
  - Comprobar que los textos i18n se muestran correctamente
  - Validar que el selector de duración funciona
  - Probar la expansión de detalles de errores

### Estructura recomendada de commits

```
feat: Agregar selector de duración de historial
fix: Corregir expansión de errores en tema minimalista
docs: Actualizar README con nuevas características
style: Mejorar espaciado de botones PSI y toggle
refactor: Extraer lógica de temas a archivo separado
```

### Checklist antes de hacer push

- [ ] Probar en los 3 temas (def, pro, min)
- [ ] Verificar que funciona en ambos idiomas (es, en)
- [ ] Comprobar expansión de errores
- [ ] Validar selector de duración
- [ ] Revisar que `leyenda.html` sigue funcionando
- [ ] Actualizar documentación si es necesario

## ❗ Notas finales y buenas prácticas

- Mantener los textos de la UI en archivos i18n por idioma.
- Mantener las constantes de configuración en `js/config.js` para evitar duplicidad.
- Separar lógica (JS) de la presentación (CSS/HTML) y centralizar variables.

---

Este archivo es el punto de referencia principal. Para documentación adicional, ver la carpeta `docs/`.
