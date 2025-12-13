/**
 * Archivo de configuración centralizada para el monitor de servicios.
 */

// =======================================================
// 1. UMBRALES DE LATENCIA
// =======================================================

const UMBRALES_LATENCIA = {
  MUY_RAPIDO: 300,
  RAPIDO: 500,
  NORMAL: 800,
  LENTO: 1500,
  CRITICO: 3000,
  RIESGO: 5000,
  PENALIZACION_FALLO: 99999,
};

// =======================================================
// 2. CONSTANTES DE TEMAS
// =======================================================

const TEMA_DEFAULT = 'def';
const TEMA_PRO = 'pro';
const TEMA_MIN = 'min';

// NUEVO MAPA DE ARCHIVOS CSS POR TEMA
const TEMA_FILES = {
  [TEMA_DEFAULT]: 'css/styles_def.css',
  [TEMA_PRO]: 'css/styles_pro.css',
  [TEMA_MIN]: 'css/styles_min.css',
};

// =======================================================
// 2.5. CONSTANTES ESPECÍFICAS PARA LA LEYENDA
// =======================================================
const DEFAULT_LEYENDA_TEMA = 'def';
const LEYENDA_TEMA_FILES = {
  default: 'css/leyenda_def.css',
  def: 'css/leyenda_def.css',
  pro: 'css/leyenda_pro.css',
  min: 'css/leyenda_min.css',
};

// =======================================================
// 3. CONSTANTES DE API Y MONITOREO
// =======================================================

const ESTADO_ERROR_CONEXION = 0;

// Códigos HTTP comunes (para referencia y manejo)
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  NOT_MODIFIED: 304,
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

// Horas disponibles para el selector de duración
const HORAS_DISPONIBLES = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// Generar opciones de duración automáticamente (cada hora = 12 mediciones, ya que se monitorea cada 5 min)
const DURACION_OPCIONES = {};
HORAS_DISPONIBLES.forEach((horas) => {
  const key = `${horas}h`;
  DURACION_OPCIONES[key] = {
    mediciones: horas * 12,
    etiqueta: horas === 1 ? '1 hora' : `${horas} horas`,
  };
});

const DURACION_DEFAULT = '1h'; // Duración por defecto

// MAX_HISTORIAL_ENTRIES será dinámico, pero guardamos un valor por defecto
const MAX_HISTORIAL_ENTRIES = DURACION_OPCIONES[DURACION_DEFAULT].mediciones;

const PSI_BASE_URL = 'https://pagespeed.web.dev/report?url=';

// =======================================================
// 4. REFERENCIAS A ARCHIVOS EXTERNOS (¡NUEVAS CONSTANTES!)
// =======================================================

const WEBSITES_FILE = 'webs.json';

// Mapa de archivos de idiomas
const I18N_FILES = {
  es: 'js/i18n_es.js',
  en: 'js/i18n_en.js',
  fr: 'js/i18n_fr.js',
};

// Idioma por defecto.
const DEFAULT_LANG = 'es';

// =======================================================
// 5. CONSTANTES DE RESILIENCIA Y ERRORES GLOBALES (NUEVO)
// =======================================================

/**
 * Nombre del grupo de URLs considerado "CRÍTICO" dentro de webs.json
 * (ej: 'interno', 'trabajo', etc.). El fallo de 100% de este grupo
 * desencadena una alerta global, independientemente de otros grupos.
 */
const GRUPO_CRITICO_NOMBRE = 'CRITICO'; // Define el nombre de tu grupo clave

/**
 * Umbral de latencia individual (en ms) que, si es superado por la MAYORÍA
 * de los servicios, marca la corrida como FALLO GLOBAL CRÍTICO.
 * Debe ser menor que el timeout de la función serverless (10s).
 */
const UMBRAL_FALLO_GLOBAL_MS = 9000;

/**
 * Porcentaje mínimo de servicios que deben superar UMBRAL_FALLO_GLOBAL_MS
 * para que se considere un fallo global (Ej: 0.8 significa 80%).
 * Se usará como FALLBACK si no hay fallo en el GRUPO_CRITICO_NOMBRE.
 */
const PORCENTAJE_FALLO_GLOBAL = 0.8; /*0.8*/
