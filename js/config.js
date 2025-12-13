const UMBRALES_LATENCIA = {
  MUY_RAPIDO: 300,
  RAPIDO: 500,
  NORMAL: 800,
  LENTO: 1500,
  CRITICO: 3000,
  RIESGO: 5000,
  PENALIZACION_FALLO: 99999,
};

const TEMA_DEFAULT = 'def';
const TEMA_PRO = 'pro';
const TEMA_MIN = 'min';

const TEMA_FILES = {
  [TEMA_DEFAULT]: 'css/styles_def.css',
  [TEMA_PRO]: 'css/styles_pro.css',
  [TEMA_MIN]: 'css/styles_min.css',
};

const DEFAULT_LEYENDA_TEMA = 'def';
const LEYENDA_TEMA_FILES = {
  default: 'css/leyenda_def.css',
  def: 'css/leyenda_def.css',
  pro: 'css/leyenda_pro.css',
  min: 'css/leyenda_min.css',
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

const DURACION_OPCIONES = {};
HORAS_DISPONIBLES.forEach((horas) => {
  const key = `${horas}h`;
  DURACION_OPCIONES[key] = {
    mediciones: horas * 12,
    etiqueta: horas === 1 ? '1 hora' : `${horas} horas`,
  };
});

const DURACION_DEFAULT = '1h';

const MAX_HISTORIAL_ENTRIES = DURACION_OPCIONES[DURACION_DEFAULT].mediciones;
const PSI_BASE_URL = 'https://pagespeed.web.dev/report?url=';
const WEBSITES_FILE = 'webs.json';

const I18N_FILES = {
  es: 'js/i18n_es.js',
  en: 'js/i18n_en.js',
  fr: 'js/i18n_fr.js',
};

const DEFAULT_LANG = 'es';

const GRUPO_CRITICO_NOMBRE = 'CRITICO';
const UMBRAL_FALLO_GLOBAL_MS = 9000;
const PORCENTAJE_FALLO_GLOBAL = 0.8;
