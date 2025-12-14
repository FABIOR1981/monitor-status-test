# Monitor de Disponibilidad de Servicios 🚀

## ¿Qué es este proyecto?

Este es un monitor de disponibilidad web que verifica en tiempo real el **estado** y **latencia** (tiempo de respuesta) de servicios web críticos. La aplicación utiliza una arquitectura **Serverless** (Netlify Functions) para realizar las peticiones, evitando problemas de CORS y Mixed Content.

### Características principales

- ✅ **Monitoreo automático cada 5 minutos** de múltiples URLs
- 📊 **Clasificación inteligente de latencia** basada en 7 umbrales (de "Muy Rápido" a "Caída Total")
- 🎨 **3 temas visuales** (Estándar, Profesional, Minimalista, Oscuro)
- 🌍 **Soporte multiidioma** (Español e Inglés, extensible)
- 📈 **Historial configurable** (12 horas, 1 día, 3 días, 7 días)
- 🚨 **Detección de fallos globales** para evitar falsos positivos
- 🔍 **Análisis detallado de errores** con historial expandible
- 📱 **Diseño responsive** adaptable a diferentes pantallas

La aplicación realiza verificaciones automáticas cada **5 minutos** de una lista configurable de URLs. Utiliza una función serverless como proxy para realizar las peticiones de forma segura, evitando limitaciones del navegador (CORS y Mixed Content).

### ¿Para quién es útil?

- **Equipos de DevOps** que necesitan monitoreo 24/7 de servicios críticos
- **Administradores de sistemas** que requieren alertas tempranas de degradación
- **Desarrolladores** que validan el rendimiento post-deploy
- **Product Managers** que analizan disponibilidad y cumplimiento de SLA
- **Empresas** que comparan rendimiento entre diferentes proveedores de hosting

## � Umbrales de Latencia y Clasificación

El monitor clasifica automáticamente el rendimiento en 7 niveles basados en investigación en **Psicología de la Interacción Humano-Computadora**:

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

### Justificación Científica

Los umbrales están basados en **límites perceptivos del cerebro humano**:

- **<100 ms**: Percepción instantánea (Regla de Nielsen)
- **300 ms**: Límite de percepción inconsciente
- **1 segundo**: El usuario comienza a perder el foco
- **3 segundos**: Umbral crítico de abandono en páginas web
- **5 segundos**: Considerado fallo funcional
- **10+ segundos**: Timeout típico - usuario ya abandonó

> 📖 Para más detalles, consulta [justificacion_rangos_latencia.md](justificacion_rangos_latencia.md).

## 🔍 Códigos de Estado HTTP

El monitor interpreta automáticamente los códigos HTTP y los clasifica:

### Códigos de Éxito (2xx) ✅

**200-299**: Servicio respondió correctamente

### Códigos de Error Comunes ⚠️

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

**Nota:** Cualquier código fuera del rango 2xx se marca como **❌ CAÍDA/ERROR** con detalles descriptivos (ej: `❌ Caída (404 - No encontrado)`).

## 📊 Cómo Funciona el Monitoreo

### Arquitectura del Sistema

```
┌─────────────┐      ┌──────────────────┐      ┌──────────────┐
│  Navegador  │─────▶│ Netlify Function │─────▶│ Servicio Web │
│  (Cliente)  │◀─────│    (Proxy)       │◀─────│   Objetivo   │
└─────────────┘      └──────────────────┘      └──────────────┘
     ↓
     └──▶ Mide latencia total del ciclo completo
```

**Flujo de una medición:**

1. **Frontend** (navegador) registra tiempo de inicio
2. **Solicita al proxy** serverless de Netlify (`/.netlify/functions/check-status`)
3. **Proxy realiza petición** HTTP al servicio objetivo
4. **Proxy mide tiempo** de respuesta del servicio
5. **Proxy retorna** al frontend: `{status: código, time: milisegundos}`
6. **Frontend actualiza** tabla con latencia y estado clasificado

### Qué Incluye la Medición de Latencia

**La latencia medida incluye:**

- ✅ Resolución DNS (si aplica)
- ✅ Conexión TCP/SSL (handshake)
- ✅ Procesamiento del servidor remoto
- ✅ Transferencia de datos

**NO incluye:**

- ❌ Tiempo de renderizado en el navegador
- ❌ Descarga de recursos (imágenes, CSS, JS)

### Historial y Promedios

**Selector de duración:** El monitor permite elegir la ventana temporal del historial:

| Duración | Mediciones | Actualización cada |
| -------- | ---------- | ------------------ |
| 12 horas | 144        | 5 minutos          |
| 1 día    | 288        | 5 minutos          |
| 3 días   | 864        | 5 minutos          |
| 7 días   | 2016       | 5 minutos          |

**Cálculo del promedio:**

- Solo se promedian mediciones exitosas (código HTTP 200)
- Los fallos no inflan artificialmente el promedio
- Si >50% de mediciones fallan → Estado = "CAÍDA/ERROR"
- Si 100% fallan → Promedio = 0 ms, Estado = "CAÍDA/ERROR"

**Contador de errores:**
Muestra `⚠️ 3/12` donde:

- **3** = Cantidad de errores detectados
- **12** = Total de mediciones realizadas

Al hacer clic en el botón **▼**, se expande el historial detallado de los últimos 10 errores con:

- Fecha y hora
- Código HTTP con badge de color
- Mensaje descriptivo del error
- Latencia registrada

## 🛠️ Estructura del Proyecto

El proyecto sigue una arquitectura modular con separación clara de responsabilidades:

### Archivos Principales

| Archivo/Directorio                      | Descripción                                        |
| :-------------------------------------- | :------------------------------------------------- |
| `index.html`                            | Página principal del monitor                       |
| `leyenda.html`                          | Documentación de umbrales y códigos HTTP           |
| **CSS**                                 |                                                    |
| `css/monitor_base.css`                  | Variables y estilos compartidos                    |
| `css/monitor_def.css`                   | Tema estándar (por defecto)                        |
| `css/monitor_pro.css`                   | Tema profesional (información avanzada)            |
| `css/monitor_min.css`                   | Tema minimalista (dashboards)                      |
| `css/monitor_osc.css`                   | Tema oscuro (dark mode)                            |
| `css/leyenda_base.css`                  | Estilos base para página de leyenda                |
| `css/leyenda_def.css`                   | Tema estándar para leyenda                         |
| `css/leyenda_pro.css`                   | Tema profesional para leyenda                      |
| `css/leyenda_min.css`                   | Tema minimalista para leyenda                      |
| `css/leyenda_osc.css`                   | Tema oscuro para leyenda                           |
| **JavaScript**                          |                                                    |
| `js/config.js`                          | Configuración global (umbrales, temas, duraciones) |
| `js/script.js`                          | Lógica principal del monitor                       |
| `js/leyenda_script.js`                  | Lógica de la página de leyenda                     |
| `js/i18n.js`                            | Sistema de internacionalización                    |
| `lang/i18n_es.js`                       | Textos en español                                  |
| `lang/i18n_en.js`                       | Textos en inglés                                   |
| **Datos y Funciones**                   |                                                    |
| `data/webs.json`                        | Lista de URLs a monitorear                         |
| `netlify/functions/check-status.js`     | Función serverless (proxy para evitar CORS)        |
| **Documentación**                       |                                                    |
| `docs/justificacion_rangos_latencia.md` | Fundamento científico de los umbrales              |
| `docs/arquitectura.md`                  | Flujo de datos y arquitectura del sistema          |
| `docs/estructura.md`                    | Detalle de archivos del proyecto                   |
| `docs/resolución de problemas.md`       | Guía de troubleshooting                            |

### Archivos de Configuración Clave

**`js/config.js`** - Centraliza todas las constantes del sistema:

## 🚀 Inicio Rápido

### Despliegue en Netlify (Recomendado)

1. **Sube el código** a tu repositorio Git (GitHub, GitLab, etc.)
2. **Conecta con Netlify**:
   - Ve a [Netlify](https://netlify.com)
   - Selecciona "Add new site" → "Import an existing project"
   - Conecta tu repositorio
3. **Netlify se encarga del resto**:
   - Detecta `package.json` y ejecuta `npm install`
   - Lee `netlify.toml` y despliega las funciones serverless automáticamente

¡Listo! Tu monitor estará disponible en la URL proporcionada por Netlify.

### Configuración de servicios

Edita el archivo [data/webs.json](data/webs.json) para definir qué URLs monitorear:

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
  }
]
```

**Propiedades:**

- `nombre`: Nombre descriptivo del servicio
- `url`: URL completa a monitorear (debe ser públicamente accesible)
- `grupo`: Clasificación lógica (CRITICO, EXTERNO, INTERNO)
- `orden`: Posición en la tabla (1 = primero, números mayores = después)

## 🎨 Personalización Visual

El monitor incluye 4 temas predefinidos que puedes cambiar agregando el parámetro `?tema=` en la URL:

### Temas disponibles

```
https://tu-monitor.netlify.app/?tema=def  (Estándar - por defecto)
https://tu-monitor.netlify.app/?tema=pro  (Profesional)
https://tu-monitor.netlify.app/?tema=min  (Minimalista)
https://tu-monitor.netlify.app/?tema=osc  (Oscuro - Dark Mode)
```

**Comparación de temas:**

| Característica      | Estándar (def)  | Profesional (pro) | Minimalista (min) | Oscuro (osc)     |
| ------------------- | --------------- | ----------------- | ----------------- | ---------------- |
| Columna URL         | ❌ Oculta       | ✅ Visible        | ❌ Oculta         | ❌ Oculta        |
| Columna Status HTTP | ❌ Oculta       | ✅ Visible        | ❌ Oculta         | ❌ Oculta        |
| Botones PSI         | ✅ Visible      | ✅ Visible        | ✅ Visible        | ✅ Visible       |
| Toggle errores      | ✅ Visible      | ✅ Visible        | ✅ Visible        | ✅ Visible       |
| Emojis estado       | ✅ Completos    | ✅ Completos      | ⚠️ Limitados      | ✅ Completos     |
| Paleta de colores   | Azul claro      | Gris oscuro       | Blanco/Negro      | Negro/Azul       |
| Fondo principal     | Claro (#f4f7f9) | Claro (#f5f5f5)   | Blanco (#ffffff)  | Oscuro (#1a1a1a) |
| Bordes y sombras    | ✅ Suaves       | ✅ Prominentes    | ❌ Mínimos        | ✅ Intensas      |
| **Uso recomendado** | Vista general   | Análisis técnico  | Dashboards/TV     | Modo nocturno    |

### Internacionalización

Cambia el idioma agregando `?lang=` en la URL:

```
https://tu-monitor.netlify.app/?lang=es  (Español - por defecto)
https://tu-monitor.netlify.app/?lang=en  (English)
```

Puedes combinar tema e idioma: `?tema=pro&lang=en`

```javascript
// Umbrales de clasificación de latencia (en milisegundos)
UMBRALES_LATENCIA = {
  MUY_RAPIDO: 300, // Respuesta casi instantánea
  RAPIDO: 500, // Respuesta rápida perceptible
  NORMAL: 800, // Ligero retraso pero usable
  LENTO: 1500, // Retraso notable
  CRITICO: 3000, // Degradación significativa
  RIESGO: 5000, // Próximo a fallo
  PENALIZACION_FALLO: 99999, // Marcador para fallos
};

// Opciones de duración del historial
DURACION_OPCIONES = {
  '12h': { mediciones: 144, etiqueta: 'Últimas 12 horas' },
  '1d': { mediciones: 288, etiqueta: 'Último día' },
  '3d': { mediciones: 864, etiqueta: 'Últimos 3 días' },
  '7d': { mediciones: 2016, etiqueta: 'Últimos 7 días' },
};

// Configuración de detección de fallo global
UMBRAL_FALLO_GLOBAL_MS = 9000; // 9 segundos
PORCENTAJE_FALLO_GLOBAL = 0.8; // 80% de servicios
```

**`data/webs.json`** - Define servicios a monitorear:

```json
[
  {
    "nombre": "Nombre del Servicio",
    "url": "https://ejemplo.com",
    "grupo": "CRITICO",
    "orden": 1
  }
]
```

### Detección Inteligente de Fallos Globales

El sistema detecta automáticamente si los problemas son reales o causados por sobrecarga del monitoreo:

**Se activa alerta de fallo global cuando:**

- 100% de servicios CRÍTICOS fallan simultáneamente
- ≥80% de todos los servicios superan 9 segundos de latencia
- No hay resultados disponibles (fallo total de red)

**Comportamiento en fallo global:**

- 🚨 Muestra alerta visible en la interfaz
- ❌ NO actualiza la tabla con datos erróneos
- ⏸️ Descarta datos no confiables (evita falsos positivos)
- 🔄 Continúa monitoreando en el siguiente ciclo (5 min)

Esto ayuda a distinguir entre problemas reales del servicio vs. problemas del sistema de monitoreo.

## � Desarrollo Local

Para desarrollar o depurar el proyecto en tu entorno local:

**Requisitos:**

- Node.js instalado
- Netlify CLI: `npm install netlify-cli -g`

**Pasos:**

```bash
# 1. Clonar el repositorio
git clone <tu-repositorio>

# 2. Instalar dependencias
npm install

# 3. Ejecutar servidor de desarrollo
netlify dev
```

El servidor local estará disponible en `http://localhost:8888`

### Agregar Nuevo Idioma

1. Crear archivo `lang/i18n_XX.js` (donde XX = código de idioma)
2. Copiar estructura de `lang/i18n_es.js`
3. Traducir todos los textos
4. Registrar en `js/config.js`:

```javascript
const I18N_FILES = {
  es: 'lang/i18n_es.js',
  en: 'lang/i18n_en.js',
  fr: 'lang/i18n_fr.js', // Nuevo idioma
};
```

5. Usar con: `?lang=fr`

## 📚 Documentación Adicional

Para información más detallada sobre aspectos específicos del proyecto:

- **[arquitectura.md](arquitectura.md)** - Flujo de datos y arquitectura del sistema
- **[estructura.md](estructura.md)** - Detalle completo de archivos del proyecto
- **[justificacion_rangos_latencia.md](justificacion_rangos_latencia.md)** - Fundamento científico de los umbrales
- **[resolución de problemas.md](resolución%20de%20problemas.md)** - Guía de troubleshooting y soluciones comunes

## 📊 Casos de Uso

### Detección Temprana de Problemas

Identifica servicios degradados **antes** de la caída total mediante umbrales progresivos (LENTO → CRÍTICO → RIESGO).

### Monitoreo de SLA

Verifica cumplimiento de Acuerdos de Nivel de Servicio y analiza tendencias históricas.

### Validación Post-Deploy

Confirma que nuevos despliegues no degradan el rendimiento de los servicios.

### Comparación de Proveedores

Evalúa y compara rendimiento entre diferentes servicios de hosting.

### Diagnóstico de Problemas

- **Latencia alta + HTTP 200** → Problema de rendimiento del servidor
- **Latencia alta + HTTP 5xx** → Servidor sobrecargado
- **Latencia muy alta + timeout** → Problema de red o firewall

## ⚠️ Limitaciones

### Factores que Afectan la Precisión

La latencia medida puede variar según:

- **Ubicación geográfica** del servidor Netlify (puede estar en región diferente al servicio)
- **Cold start** del proxy serverless (primera ejecución vs. ejecuciones subsecuentes)
- **Congestión de red** entre Netlify y el servicio objetivo
- **CDN y caché** del servicio objetivo

### Recomendaciones para Medición Precisa

💡 Para producción crítica, considera complementar con:

- Servicios especializados (Pingdom, UptimeRobot, New Relic)
- Múltiples ubicaciones geográficas de monitoreo
- Alertas integradas con sistemas de notificación (Slack, PagerDuty)

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. **Fork** el repositorio
2. Crea una **rama** para tu característica (`git checkout -b feature/nueva-caracteristica`)
3. **Commit** tus cambios (`git commit -m 'feat: Agregar nueva característica'`)
4. **Push** a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un **Pull Request**

### Convenciones de Commits

```
feat: Nueva característica
fix: Corrección de bug
docs: Cambios en documentación
style: Cambios de formato (espacios, punto y coma, etc)
refactor: Refactorización de código
test: Agregar o modificar tests
chore: Cambios en configuración o dependencias
```

## 📄 Licencia

Este proyecto está bajo licencia MIT. Ver archivo LICENSE para más detalles.

---

**¿Necesitas ayuda?** Revisa la [documentación adicional](#-documentación-adicional) o abre un issue en el repositorio.
