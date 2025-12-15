// Umbrales de latencia en milisegundos
// Estos valores clasifican el   rendimiento del servicio
// Para más detalles ver docs/justificacion_rangos_latencia.md
const UMBRALES_LATENCIA = {
  MUY_RAPIDO: 300, // Excelente: respuesta casi instantánea
  RAPIDO: 500, // Bueno: respuesta rápida perceptible
  NORMAL: 800, // Aceptable: ligero retraso pero usable
  LENTO: 1500, // Preocupante: retraso notable
  CRITICO: 3000, // Grave: degradación significativa
  RIESGO: 5000, // Muy grave: próximo a fallo
  PENALIZACION_FALLO: 99999, // Marcador especial para fallos (no se suma al promedio)
};

const TEMA_DEFAULT = 'def';
const TEMA_PRO = 'pro';
const TEMA_MIN = 'min';
const TEMA_OSC = 'osc';

const TEMA_FILES = {
  [TEMA_DEFAULT]: 'css/monitor_def.css',
  [TEMA_PRO]: 'css/monitor_pro.css',
  [TEMA_MIN]: 'css/monitor_min.css',
  [TEMA_OSC]: 'css/monitor_osc.css',
};

// Configuración de pares de temas alternables con el botón toggle
// Si un tema no tiene pareja, el botón no aparecerá
const TEMA_TOGGLE_PAIRS = {
  [TEMA_DEFAULT]: TEMA_OSC, // def alterna con osc
  [TEMA_OSC]: TEMA_DEFAULT, // osc alterna con def
  // pro y min no tienen pareja, entonces el botón se oculta
};
// Temas que tienen sistema de expansión de errores (contador ⚠️ y click en badges)
const TEMAS_CON_EXPANSION_ERRORES = [TEMA_PRO, TEMA_MIN];
const DEFAULT_LEYENDA_TEMA = 'def';
const LEYENDA_TEMA_FILES = {
  default: 'css/leyenda_def.css',
  def: 'css/leyenda_def.css',
  pro: 'css/leyenda_pro.css',
  min: 'css/leyenda_min.css',
  osc: 'css/leyenda_osc.css',
};

const ESTADO_ERROR_CONEXION = 0;

const HTTP_STATUS_SUCCESS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  NOT_MODIFIED: 304,
};

const HTTP_STATUS_ERROR = {
  NO_CONNECTION: 0,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  IM_A_TEAPOT: 418,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
};

const PROXY_ENDPOINT = '/.netlify/functions/check-status';
const FRECUENCIA_MONITOREO_MS = 5 * 60 * 1000;

const HORAS_DISPONIBLES = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// Construir opciones de duración del historial dinámicamente
// Cada hora = 12 mediciones (una cada 5 minutos)
const DURACION_OPCIONES = {};
HORAS_DISPONIBLES.forEach((horas) => {
  const key = `${horas}h`;
  DURACION_OPCIONES[key] = {
    mediciones: horas * 12, // 12 mediciones por hora (cada 5 minutos)
    etiqueta: horas === 1 ? '1 hora' : `${horas} horas`,
  };
});

const DURACION_DEFAULT = '1h';

const MAX_HISTORIAL_ENTRIES = DURACION_OPCIONES[DURACION_DEFAULT].mediciones;
const PSI_BASE_URL = 'https://pagespeed.web.dev/report?url=';
const WEBSITES_FILE = 'data/webs.json';

// Archivos de traducción disponibles
// Se cargan dinámicamente según el parámetro ?lang=XX en la URL
const I18N_FILES = {
  es: 'lang/i18n_es.js',
  en: 'lang/i18n_en.js',
  fr: 'lang/i18n_fr.js',
};

const DEFAULT_LANG = 'es'; // Idioma por defecto si no se especifica ninguno

// Configuración de detección de fallo global
// Se activa cuando 80% o más de los servicios críticos fallan o superan 9 segundos
const GRUPO_CRITICO_NOMBRE = 'CRITICO'; // Nombre del grupo de servicios críticos
const UMBRAL_FALLO_GLOBAL_MS = 9000; // Latencia máxima antes de considerarse fallo (9 segundos)
const PORCENTAJE_FALLO_GLOBAL = 0.8; // 80% de servicios críticos deben fallar para activar alerta global
