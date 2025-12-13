/**
 * TEXTOS_ES (Español)
 * Diccionario centralizado para todas las cadenas de texto del Frontend.
 */
const TEXTOS_ES = {
  general: {
    PAGE_TITLE: 'Monitor de Estado de Servicios',
    LAST_UPDATE: 'Última actualización:',
    LOADING: 'Cargando...',
    INFO_BAR:
      'Los datos se actualizan automáticamente cada 5 minutos usando un Proxy Serverless.',
    ADVERTENCIA_FALLO_GLOBAL_HTML:
      'Datos de monitoreo no disponibles/no confiables. Se detectó una latencia crítica generalizada, posiblemente debido a una sobrecarga del sistema de monitoreo. Por favor, espere el próximo ciclo o actualice la página.',

    // 🚨 NUEVO: Textos para el detalle del Fallo Global (Modo Pro)
    MOTIVO_FALLO_PRO: 'Motivo Pro:',
    FALLO_CRITICO_GRUPO: 'Falló el 100% del grupo crítico:',
    FALLO_CRITICO_LATENCIA_PARTE1: '% de los servicios superaron el umbral de',
    FALLO_CRITICO_RED: 'No hay resultados disponibles (Fallo de red total)',

    // Selector de duración
    DURACION_LABEL: 'Duración del historial:',
  },
  velocidad: {
    // <-- Grupo 2 (ACTUALIZADO)
    VERY_FAST: 'MUY RÁPIDO', // <= 300ms
    FAST: 'RÁPIDO', // <= 500ms
    NORMAL: 'NORMAL', // <= 800ms
    SLOW: 'LENTO', // <= 1500ms
    CRITICAL: 'CRÍTICO', // <= 3000ms (NUEVO)
    RISK: 'RIESGO', // <= 5000ms (NUEVO)
    EXTREME_RISK: 'RIESGO EXTREMO', // > 5000ms (NUEVO - Caso por defecto)
  },
  estados: {
    DOWN: 'CAÍDA',
    DOWN_ERROR: 'CAÍDA/ERROR',
  },
  tabla: {
    HEADER_SERVICE: 'Servicio',
    HEADER_URL: 'URL',
    HEADER_LATENCY_ACTUAL: 'Latencia Actual',
    HEADER_STATUS_ACTUAL: 'Estado Actual',
    HEADER_PROMEDIO_MS: 'Promedio ',
    HEADER_PROMEDIO_STATUS: 'Estado Promedio',
    HEADER_ACTION: 'Acción',
  },
};

// Textos de la Leyenda (migrados desde ubicación anterior, ya centralizados en i18n)
TEXTOS_ES.leyenda = {
  title_browser: 'Leyenda del Monitor de Estado',
  main_header: 'Umbrales de Latencia y Justificación Operacional',
  link_volver: 'Volver a la Aplicación',
  intro:
    'Los colores y símbolos reflejan el tiempo de respuesta (latencia) medido. La justificación se basa en la Psicología de la Interacción y el Significado Operacional del rendimiento.',
  umbrales: [
    {
      key: 'very_fast',
      className: 'status-very-fast',
      emoji: '🚀',
      label: 'MUY RÁPIDO',
      range_text: '< 300 ms',
      summary: 'Rendimiento Óptimo (Instantáneo para el Usuario)',
      details:
        'Estándar Dorado. El cerebro humano percibe cualquier respuesta por debajo de los 100 ms como instantánea (Regla de Nielsen). Mantener el umbral hasta 300 ms asegura una experiencia fluida. Significado Operacional: El sistema está operando en condiciones óptimas y con alta eficiencia.',
    },
    {
      key: 'fast',
      className: 'status-fast',
      emoji: '⭐',
      label: 'RÁPIDO',
      range_text: '300 ms ≤ Latencia < 500 ms',
      summary: 'Interacción Fluida sin Molestias (Percepción Inconsciente)',
      details:
        'Límite de la Percepción Inconsciente. La demora es notable pero el usuario no la percibe como una espera molesta. Significado Operacional: Rendimiento excelente, buen punto de control para procesos rápidos de backend.',
    },
    {
      key: 'normal',
      className: 'status-normal',
      emoji: '✅',
      label: 'NORMAL',
      range_text: '500 ms ≤ Latencia < 800 ms',
      summary: 'Rendimiento Aceptable (El Foco se Mantiene)',
      details:
        'La Distracción Comienza. A partir de 500 ms el usuario puede comenzar a desviarse, aunque puede mantener su hilo de pensamiento. Significado Operacional: Rendimiento aceptable, pero acercándose a donde la sensación de espera se consolida.',
    },
    {
      key: 'slow',
      className: 'status-slow',
      emoji: '⚠️',
      label: 'LENTO',
      range_text: '800 ms ≤ Latencia < 1500 ms',
      summary: 'Demora Molesta (Distractor Activo / Alerta Temprana)',
      details:
        'Límite del 1 Segundo. La demora se convierte en un distractor activo. La experiencia está notablemente degradada. Significado Operacional: Alerta Temprana. El servidor o la red experimentan estrés. Momento de investigar.',
    },
    {
      key: 'critical',
      className: 'status-critical',
      emoji: '🐌',
      label: 'CRÍTICO',
      range_text: '1500 ms ≤ Latencia < 3000 ms',
      summary: 'Riesgo de Abandono del Usuario (3 Segundos / Fallo Inminente)',
      details:
        'Pérdida de Foco y Frustración. El límite crítico (3 segundos) donde los usuarios abandonan una página web. Significado Operacional: Fallo Inminente. Indica carga extremadamente pesada o cuellos de botella severos.',
    },
    {
      key: 'risk',
      className: 'status-risk',
      emoji: '🚨',
      label: 'RIESGO',
      range_text: '3000 ms ≤ Latencia < 5000 ms',
      summary: 'Fallo Funcional y Colapso (5 Segundos / Alarma)',
      details:
        'Fallo Funcional. Las demoras superiores a 5 segundos son consideradas un fallo funcional en muchos sistemas. Significado Operacional: ALARMA. El servicio está al borde del colapso o no sirve peticiones de manera confiable.',
    },
    {
      key: 'extreme_risk',
      className: 'status-extreme-risk',
      emoji: '🔥',
      label: 'RIESGO EXTREMO',
      range_text: '5000 ms ≤ Latencia < 99999 ms',
      summary: 'Latencia Inaceptable (CAOS / Abandono Asegurado)',
      details:
        'CAOS/Limbo. Rango antes del timeout máximo. Es casi seguro que el usuario abandonó la acción. Significado Operacional: El servidor no puede procesar la solicitud en un tiempo razonable. Requiere atención INMEDIATA.',
    },
    {
      key: 'down',
      className: 'status-down',
      emoji: '❌',
      label: 'FALLO TOTAL',
      range_text: '≥ 99999 ms',
      summary: 'Caída Confirmada (Timeout Excedido)',
      details:
        'Caída Confirmada. El valor de PENALIZACION_FALLO ha sido superado. Significado Operacional: El servicio está caído, la ruta es inaccesible, o el servidor se negó a responder.',
    },
  ],
  http_codes_title: 'Códigos de Estado HTTP y Fallos del Sistema',
  http_codes_description:
    'Cuando un servicio devuelve un código de estado fuera del rango 2xx (Éxito), el monitor lo clasifica visualmente como ❌ FALLO TOTAL, pero muestra el código real entre paréntesis (ej: ❌ Caída (404)).',
  codigos_error: [
    {
      code: '2xx',
      label: 'OK / Éxito',
      description:
        'La conexión y el servicio respondieron correctamente (Latencia medida).',
    },
    {
      code: '404',
      label: 'Not Found',
      description:
        'El recurso solicitado (la URL que se está monitoreando) no existe en el servidor.',
    },
    {
      code: '429',
      label: 'Too Many Requests',
      description:
        'Se ha superado el límite de tasa (Rate Limit) de la API/Servicio.',
    },
    {
      code: '500',
      label: 'Internal Server Error',
      description:
        'Error interno genérico del servidor. Debe investigarse el log del backend.',
    },
    {
      code: '502',
      label: 'Bad Gateway',
      description:
        'Un servidor intermedio (proxy, CDN) recibió una respuesta inválida del servidor de origen.',
    },
    {
      code: '503',
      label: 'Service Unavailable',
      description:
        'El servidor está temporalmente sobrecargado, en mantenimiento o inactivo.',
    },
    {
      code: '0',
      label: 'Error de Conexión',
      description:
        'Fallo de red, bloqueo de CORS, o no respuesta del servidor. Es el código interno ESTADO_ERROR_CONEXION.',
    },
  ],
};

// Compatibilidad para la API i18n.get() usada por las páginas de la leyenda.
window.i18n = {
  texts: TEXTOS_ES,
  get: function (key) {
    if (!key) return '';
    const parts = key.split('.');
    let cur = this.texts;
    for (const p of parts) {
      if (!cur.hasOwnProperty(p)) {
        console.error(`I18n: Clave '${key}' no encontrada.`);
        return `[TEXTO NO ENCONTRADO: ${key}]`;
      }
      cur = cur[p];
    }
    return cur;
  },
};

window.TEXTOS_ACTUAL = TEXTOS_ES;
