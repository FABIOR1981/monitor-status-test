/**
 * TEXTOS_EN (English)
 * Centralized dictionary for all Frontend text strings.
 */
const TEXTOS_EN = {
    general: {
        PAGE_TITLE: "Service Status Monitor",
        LAST_UPDATE: "Last Update:",
        LOADING: "Loading...",
        INFO_BAR: "Data is automatically updated every 5 minutes using a Serverless Proxy.",
        
        // --- UPDATED/NEW Critical Failure Texts ---
        ADVERTENCIA_FALLO_GLOBAL_HTML: "Monitoring data unavailable/unreliable. Widespread critical latency detected, possibly due to a monitoring system overload. Please wait for the next cycle or refresh the page.",
        
        // New: Texts for the Global Failure Detail (Pro Mode)
        MOTIVO_FALLO_PRO: "Pro Reason:",
        FALLO_CRITICO_GRUPO: "100% of the critical group failed:",
        FALLO_CRITICO_LATENCIA_PARTE1: "% of services exceeded the threshold of",
        FALLO_CRITICO_RED: "No results available (Total network failure)"
    },
    
    velocidad: { // <-- Speed Group (7 Levels)
        VERY_FAST: "VERY FAST", // <= 300ms
        FAST: "FAST", // <= 500ms
        NORMAL: "NORMAL", // <= 800ms
        SLOW: "SLOW", // <= 1500ms
        CRITICAL: "CRITICAL", // <= 3000ms
        RISK: "RISK", // <= 5000ms
        EXTREME_RISK: "EXTREME RISK", // > 5000ms (Default Case)
    },
    
    estados: {
        DOWN: "DOWN",
        DOWN_ERROR: "DOWN/ERROR",
    },
    
    tabla: {
        HEADER_SERVICE: "Service",
        HEADER_URL: "URL",
        HEADER_LATENCY_ACTUAL: "Current Latency",
        HEADER_STATUS_ACTUAL: "Current Status",
        HEADER_PROMEDIO_MS: "Average",
        HEADER_PROMEDIO_STATUS: "Average Status",
        HEADER_ACTION: "Action",
    },
};

// Asignar el objeto al contexto global para ser utilizado por script.js
window.TEXTOS_ACTUAL = TEXTOS_EN;