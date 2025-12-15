# Monitor de Disponibilidad de Servicios 🚀

## ¿Qué hace este monitor?

Verifica automáticamente cada 5 minutos el **estado** y **tiempo de respuesta** de tus servicios web. Te alerta cuando algo va mal antes de que tus usuarios lo noten.

### Características principales

- ✅ Monitoreo automático cada 5 minutos
- 📊 7 niveles de clasificación (desde "Muy Rápido" hasta "Caído")
- 🎨 4 temas visuales (Estándar, Profesional, Minimalista, Oscuro)
- 🌍 Multiidioma (Español, Inglés)
- 📈 Historial configurable (12 horas hasta 7 días)
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
https://tu-monitor.netlify.app/           → Tema estándar
https://tu-monitor.netlify.app/?tema=pro  → Tema profesional
https://tu-monitor.netlify.app/?tema=osc  → Tema oscuro
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

> 💡 **¿Por qué estos umbrales?** Ver [justificacion_rangos_latencia.md](justificacion_rangos_latencia.md)

---

## 🎨 Temas Disponibles

Cambia el tema agregando `?tema=` a la URL:

| Tema                   | URL         | Uso recomendado      |
| ---------------------- | ----------- | -------------------- |
| Estándar (por defecto) | `?tema=def` | Vista general        |
| Profesional            | `?tema=pro` | Análisis técnico     |
| Minimalista            | `?tema=min` | Dashboards/Pantallas |
| Oscuro                 | `?tema=osc` | Modo nocturno        |

**Diferencias principales:**

- **PRO** muestra columnas adicionales (URL, Status HTTP)
- **MIN** reduce decoraciones al mínimo
- **OSC** usa fondo oscuro (#121212) con alto contraste

---

## 🌍 Cambiar Idioma

```
?lang=es  → Español (por defecto)
?lang=en  → English
```

Combina con temas: `?tema=pro&lang=en`

---

## 🔍 Ver Errores Detallados

Cuando hay errores, aparece un contador `⚠️ 3/12`:

- **3** = errores detectados
- **12** = total de mediciones

Haz click en el botón **▼** para ver:

- Fecha y hora del error
- Código HTTP
- Mensaje descriptivo
- Latencia registrada

---

## ⚙️ Configuración Avanzada

### Cambiar duración del historial

En el selector de la interfaz:

- **12 horas** → 144 mediciones
- **1 día** → 288 mediciones
- **3 días** → 864 mediciones
- **7 días** → 2016 mediciones

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

## 📚 Documentación Detallada

¿Necesitas más información? Consulta:

| Documento                                                            | Contenido                             |
| -------------------------------------------------------------------- | ------------------------------------- |
| [arquitectura.md](arquitectura.md)                                   | Cómo funciona internamente el sistema |
| [estructura.md](estructura.md)                                       | Descripción de archivos y carpetas    |
| [justificacion_rangos_latencia.md](justificacion_rangos_latencia.md) | Fundamento científico de los umbrales |
| [resolución de problemas.md](resolución%20de%20problemas.md)         | Soluciones a problemas comunes        |

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

💡 Complementa con servicios especializados:

- Pingdom, UptimeRobot, New Relic
- Múltiples ubicaciones de monitoreo
- Alertas integradas (Slack, PagerDuty)

---

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/nueva-caracteristica`
3. Commit: `git commit -m 'feat: Descripción'`
4. Push: `git push origin feature/nueva-caracteristica`
5. Abre un Pull Request

**Convenciones:**

- `feat:` Nueva característica
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `style:` Formato
- `refactor:` Refactorización

---

## 📄 Licencia

MIT License - Ver archivo LICENSE

---

**¿Problemas?** Consulta [resolución de problemas.md](resolución%20de%20problemas.md) o abre un issue.
