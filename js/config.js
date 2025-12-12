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
    PENALIZACION_FALLO: 99999 
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
    'default': 'css/leyenda_def.css',
    'def': 'css/leyenda_def.css',
    'pro': 'css/leyenda_pro.css',
    'min': 'css/leyenda_min.css'
};

// =======================================================
// 3. CONSTANTES DE API Y MONITOREO
// =======================================================

const ESTADO_ERROR_CONEXION = 0; 
const PROXY_ENDPOINT = '/.netlify/functions/check-status';
const FRECUENCIA_MONITOREO_MS = 5 * 60 * 1000; 
const MAX_HISTORIAL_ENTRIES = 12; 
const PSI_BASE_URL = 'https://pagespeed.web.dev/report?url='; 


// =======================================================
// 4. REFERENCIAS A ARCHIVOS EXTERNOS (¡NUEVAS CONSTANTES!)
// =======================================================

const WEBSITES_FILE = 'webs.json'; 



// Mapa de archivos de idiomas 
const I18N_FILES = {
    'es': 'js/i18n_es.js',
    'en': 'js/i18n_en.js',
    'fr': 'js/i18n_fr.js',
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
 */
const UMBRAL_FALLO_GLOBAL_MS = 7000;/*7000*/ 

/**
 * Porcentaje mínimo de servicios que deben superar UMBRAL_FALLO_GLOBAL_MS 
 * para que se considere un fallo global (Ej: 0.8 significa 80%).
 * Se usará como FALLBACK si no hay fallo en el GRUPO_CRITICO_NOMBRE.
 */
const PORCENTAJE_FALLO_GLOBAL = 0.8;/*0.8*/