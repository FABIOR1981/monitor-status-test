# Monitor de Disponibilidad de Servicios 🚀

## ¿Qué hace este monitor?

Verifica automáticamente cada 5 minutos el **estado** y **tiempo de respuesta** de tus servicios web. Te alerta cuando algo va mal antes de que tus usuarios lo noten.

### Características principales

- ✅ Monitoreo automático cada 5 minutos
- 📊 7 niveles de clasificación (desde "Muy Rápido" hasta "Caído")
- 🎨 5 temas visuales con alternancia claro/oscuro
- 🌍 Multiidioma (Español, Inglés)
- 📈 Historial configurable (1 a 9 horas)
- 🚨 Detección inteligente de fallos
- 📱 Diseño responsive

---

## 🚀 Inicio Rápido

### 1️⃣ Desplegar en Netlify

1. Sube el código a tu repositorio (GitHub, GitLab)
2. Conecta con [Netlify](https://netlify.com)
3. Netlify detecta la configuración automáticamente

¡Listo! Tu monitor estará online en minutos.

### 2️⃣ Configurar servicios a monitorear

Edita `data/webs.json`:

```json
[
  {
    "nombre": "Mi API",
    "url": "https://api.miempresa.com/health",
    "grupo": "CRITICO",
    "orden": 1
  }
]
```

### 3️⃣ Acceder al monitor

```
https://tu-monitor.netlify.app/              → Tema estándar
https://tu-monitor.netlify.app/?tema=pro     → Tema profesional oscuro
https://tu-monitor.netlify.app/?tema=pro2    → Tema profesional claro
```

---

## 📊 ¿Cómo Clasifica el Monitor?

El monitor asigna un estado según el tiempo de respuesta:

| Estado         | Tiempo        | Significado          |
| -------------- | ------------- | -------------------- |
| 🚀 Muy Rápido  | < 300 ms      | Rendimiento óptimo   |
| ⭐ Rápido      | 300-500 ms    | Interacción fluida   |
| ✅ Normal      | 500-800 ms    | Aceptable            |
| ⚠️ Lento       | 800-1500 ms   | Alerta temprana      |
| 🐌 Crítico     | 1500-3000 ms  | Riesgo de abandono   |
| 🚨 Riesgo      | 3000-5000 ms  | Fallo inminente      |
| 🔥 Riesgo Ext. | 5000-99999 ms | Abandono seguro      |
| ❌ Caída       | Error/Timeout | Servicio no responde |

---

## 🎨 Temas Disponibles

Cambia el tema agregando `?tema=` a la URL:

| Tema              | URL          | Descripción                |
| ----------------- | ------------ | -------------------------- |
| Estándar          | `?tema=def`  | Vista clara y simple       |
| Oscuro            | `?tema=osc`  | Modo nocturno del estándar |
| Profesional       | `?tema=pro`  | Análisis técnico (oscuro)  |
| Profesional Claro | `?tema=pro2` | Análisis técnico (claro)   |
| Minimalista       | `?tema=min`  | Dashboard sin decoraciones |

**Botón de alternancia:** Los temas DEF↔OSC y PRO↔PRO2 incluyen un botón 🌙/☀️ para alternar entre modo claro y oscuro.

**Funcionalidades por tema:**

- **Básicos (DEF/OSC)**: Vista simple, solo botón PSI visible
- **Avanzados (PRO/PRO2/MIN)**: Expansión de errores clickeando badges + botón PSI

---

## 🌍 Cambiar Idioma

```
?lang=es  → Español (por defecto)
?lang=en  → English
```

Combina con temas: `?tema=pro&lang=en`

---

## 🔍 Ver Errores Detallados

**Solo en temas avanzados (PRO, PRO2, MIN):**

Cuando hay errores, aparece un contador `⚠️ 3/12` en la columna de promedio.

Haz **click en el badge de error** (ej: "CAÍDA/ERROR") para expandir el detalle:

- Fecha y hora del error
- Código HTTP
- Mensaje descriptivo
- Latencia registrada

---

## ⚙️ Configuración Avanzada

### Cambiar duración del historial

En el selector de la interfaz puedes elegir de **1 a 9 horas** (12 mediciones por hora).

### Ajustar umbrales de latencia

Edita `js/config.js`:

```javascript
const UMBRALES_LATENCIA = {
  MUY_RAPIDO: 300,
  RAPIDO: 500,
  NORMAL: 800,
  LENTO: 1500,
  CRITICO: 3000,
  RIESGO: 5000,
};
```

### Agregar nuevo idioma

1. Copia `lang/i18n_es.js` a `lang/i18n_XX.js`
2. Traduce los textos
3. Registra en `js/config.js`:

```javascript
const I18N_FILES = {
  es: 'lang/i18n_es.js',
  en: 'lang/i18n_en.js',
  fr: 'lang/i18n_fr.js', // Nuevo
};
```

---

## 🛠️ Desarrollo Local

```bash
# Instalar dependencias
npm install

# Ejecutar servidor local
netlify dev
```

Accede en: `http://localhost:8888`

---

## 📚 Documentación Completa

Si necesitas información más detallada, consulta estos documentos:

### 📖 Fundamentos

- **[justificacion_rangos_latencia.md](justificacion_rangos_latencia.md)** - Base científica de los umbrales de respuesta

### 🏗️ Arquitectura y Código

- **[arquitectura.md](arquitectura.md)** - Funcionamiento interno del sistema
- **[estructura.md](estructura.md)** - Organización de archivos y carpetas

### 🔧 Solución de Problemas

- **[resolución de problemas.md](resolución%20de%20problemas.md)** - Errores comunes y soluciones

---

## 🚨 Detección de Fallos Globales

El sistema detecta automáticamente si hay un problema general (red caída, sobrecarga):

**Se activa cuando:**

- 100% de servicios CRÍTICOS fallan
- ≥80% de servicios superan 9 segundos

**Comportamiento:**

- 🚨 Muestra alerta visible
- ⏸️ Descarta datos erróneos
- 🔄 Sigue intentando en el próximo ciclo

Esto evita **falsos positivos** cuando el problema es del monitoreo, no de tus servicios.

---

## ⚠️ Limitaciones y Recomendaciones

### Factores que afectan la medición

- Ubicación geográfica del servidor Netlify
- "Cold start" de funciones serverless
- Congestión de red temporal
- CDN y caché del servicio

### Para producción crítica

💡 Complementa con servicios especializados (Pingdom, UptimeRobot, New Relic) que ofrecen múltiples ubicaciones y alertas integradas.

---

## 📄 Licencia

MIT License - Ver archivo LICENSE

---

**¿Tienes dudas?** Consulta la [documentación completa](#-documentación-completa) o abre un issue en GitHub.
