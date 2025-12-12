/**
 * TEXTOS_ES (Español)
 * Diccionario centralizado para todas las cadenas de texto del Frontend.
 */
const TEXTOS_ES = {
    general: {
        PAGE_TITLE: "Monitor de Estado de Servicios",
        LAST_UPDATE: "Última actualización:",
        LOADING: "Cargando...",
        INFO_BAR: "Los datos se actualizan automáticamente cada 5 minutos usando un Proxy Serverless.",
		ADVERTENCIA_FALLO_GLOBAL_HTML: "Datos de monitoreo no disponibles/no confiables. Se detectó una latencia crítica generalizada, posiblemente debido a una sobrecarga del sistema de monitoreo. Por favor, espere el próximo ciclo o actualice la página.",
		
		// 🚨 NUEVO: Textos para el detalle del Fallo Global (Modo Pro)
        MOTIVO_FALLO_PRO: "Motivo Pro:",
        FALLO_CRITICO_GRUPO: "Falló el 100% del grupo crítico:",
        FALLO_CRITICO_LATENCIA_PARTE1: "% de los servicios superaron el umbral de",
        FALLO_CRITICO_RED: "No hay resultados disponibles (Fallo de red total)"
    },
    velocidad: { // <-- Grupo 2 (ACTUALIZADO)
        VERY_FAST: "MUY RÁPIDO", // <= 300ms
        FAST: "RÁPIDO", // <= 500ms
        NORMAL: "NORMAL", // <= 800ms
        SLOW: "LENTO", // <= 1500ms
        CRITICAL: "CRÍTICO", // <= 3000ms (NUEVO)
        RISK: "RIESGO", // <= 5000ms (NUEVO)
        EXTREME_RISK: "RIESGO EXTREMO", // > 5000ms (NUEVO - Caso por defecto)
    },
    estados: {
        DOWN: "CAÍDA",
        DOWN_ERROR: "CAÍDA/ERROR",
    },
    tabla: {
        HEADER_SERVICE: "Servicio",
        HEADER_URL: "URL",
        HEADER_LATENCY_ACTUAL: "Latencia Actual",
        HEADER_STATUS_ACTUAL: "Estado Actual",
        HEADER_PROMEDIO_MS: "Promedio ",
        HEADER_PROMEDIO_STATUS: "Estado Promedio",
        HEADER_ACTION: "Acción",
    },
};

window.TEXTOS_ACTUAL = TEXTOS_ES;