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

// Leyenda (translations centralized in i18n) - translations and data
TEXTOS_EN.leyenda = {
    title_browser: 'Status Monitor Legend',
    main_header: 'Latency Thresholds and Operational Justification',
    link_volver: 'Back to Application',
    intro: 'Colors and symbols reflect the measured response time (latency). The justification is based on Interaction Psychology and the Operational Meaning of performance.',
    umbrales: [
        { key: 'very_fast', className: 'status-very-fast', emoji: '🚀', label: 'VERY FAST', range_text: '< 300 ms', summary: 'Optimal Performance (Instantaneous to the User)', details: "Golden Standard. The human brain perceives responses under 100 ms as instant (Nielsen's guideline). Keeping the threshold up to 300 ms ensures a smooth experience. Operational Meaning: The system is operating in optimal conditions." },
        { key: 'fast', className: 'status-fast', emoji: '⭐', label: 'FAST', range_text: '300 ms ≤ Latency < 500 ms', summary: 'Fluid Interaction without Noticeable Wait', details: 'Limit of Unconscious Perception. The delay is noticeable but not perceived as a bothersome wait. Operational Meaning: Excellent performance; good control point for fast backend processes.' },
        { key: 'normal', className: 'status-normal', emoji: '✅', label: 'NORMAL', range_text: '500 ms ≤ Latency < 800 ms', summary: 'Acceptable Performance (User Maintains Focus)', details: 'Begin of Distraction. From 500 ms the user may start to divert attention, although they can maintain their thought flow. Operational Meaning: Acceptable performance but approaching where wait sensation consolidates.' },
        { key: 'slow', className: 'status-slow', emoji: '⚠️', label: 'SLOW', range_text: '800 ms ≤ Latency < 1500 ms', summary: 'Annoying Delay (Active Distractor / Early Alert)', details: '1 second limit. The delay becomes an active distractor. Experience is noticeably degraded. Operational Meaning: Early Alert. Server or network under stress; investigate.' },
        { key: 'critical', className: 'status-critical', emoji: '🐌', label: 'CRITICAL', range_text: '1500 ms ≤ Latency < 3000 ms', summary: 'Abandonment Risk (3 Seconds / Imminent Failure)', details: 'Loss of Focus and Frustration. The critical boundary (3 seconds) where users may abandon pages. Operational Meaning: Imminent Failure. Heavy load or severe bottlenecks.' },
        { key: 'risk', className: 'status-risk', emoji: '🚨', label: 'RISK', range_text: '3000 ms ≤ Latency < 5000 ms', summary: 'Functional Failure and Collapse (5 Seconds / Alarm)', details: 'Functional Failure. Delays longer than 5 seconds are often considered a functional failure. Operational Meaning: ALARM. Service near collapse or unreliable request handling.' },
        { key: 'extreme_risk', className: 'status-extreme-risk', emoji: '🔥', label: 'EXTREME RISK', range_text: '5000 ms ≤ Latency < 99999 ms', summary: 'Unacceptable Latency (Chaos / Guaranteed Abandonment)', details: 'Chaos/Limbo. Range before maximum timeout. The user likely abandoned the action. Operational Meaning: Server cannot process requests in reasonable time. Immediate attention required.' },
        { key: 'down', className: 'status-down', emoji: '❌', label: 'DOWN', range_text: '≥ 99999 ms', summary: 'Confirmed Outage (Timeout Exceeded)', details: 'Confirmed Outage. The PENALIZACION_FALLO value was exceeded. Operational Meaning: Service is down, route is unreachable, or server refused to respond.' }
    ],
    http_codes_title: 'HTTP Status Codes and System Failures',
    http_codes_description: 'When a service returns a status code outside the 2xx range (Success), the monitor visually classifies it as ❌ DOWN, but it displays the real status code (e.g., ❌ Down (404)).',
    codigos_error: [
        { code: '2xx', label: 'OK / Success', description: 'The connection and service responded correctly (latency measured).' },
        { code: '404', label: 'Not Found', description: 'The requested resource (the URL under monitoring) does not exist on the server.' },
        { code: '429', label: 'Too Many Requests', description: 'The API/service rate limit was exceeded.' },
        { code: '500', label: 'Internal Server Error', description: 'Generic backend error. Check backend logs for details.' },
        { code: '502', label: 'Bad Gateway', description: 'An intermediate server (proxy/CDN) received an invalid response from the origin server.' },
        { code: '503', label: 'Service Unavailable', description: 'The server is temporarily overloaded, under maintenance, or offline.' },
        { code: '0', label: 'Connection Error', description: 'Network failure, CORS blocking, or server did not respond. This maps to ESTADO_ERROR_CONEXION.' }
    ]
};

// i18n get() shim for compatibility with leyenda_script.js and other code that expects i18n.get()
window.i18n = {
    texts: TEXTOS_EN,
    get: function (key) {
        if (!key) return '';
        const parts = key.split('.');
        let cur = this.texts;
        for (const p of parts) {
            if (!cur.hasOwnProperty(p)) return `[TEXT NOT FOUND: ${key}]`;
            cur = cur[p];
        }
        return cur;
    }
};