/**
 * TEXTOS_EN (English)
 * Centralized dictionary for all Frontend text strings.
 */
 const TEXTOS_EN = {
    general: { // <-- Group 1
        LAST_UPDATE: "Last Update:",
        LOADING: "Loading...",
        INFO_BAR: "Data is automatically updated every 5 minutes using a Serverless Proxy.",
    },
    velocidad: { // <-- Group 2
        VERY_FAST: "VERY FAST",
        FAST: "FAST",
        NORMAL: "NORMAL",
        SLOW: "SLOW",
        VERY_SLOW: "VERY SLOW",
    },
    estados: { // <-- Group 3
        DOWN: "DOWN",
        DOWN_ERROR: "DOWN/ERROR",
    },
    tabla: { // <-- Group 4
        HEADER_SERVICE: "Service",
        HEADER_URL: "URL",
        HEADER_LATENCY_ACTUAL: "Current Latency",
        HEADER_STATUS_ACTUAL: "Current Status",
        HEADER_PROMEDIO_MS: "Average",
        HEADER_PROMEDIO_STATUS: "Average Status",
        HEADER_ACTION: "Action",
    },
};

window.TEXTOS_ACTUAL = TEXTOS_EN;