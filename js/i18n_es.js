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

// Textos de la Leyenda (migrados desde leyenda_i18n_core.js)
TEXTOS_ES.leyenda = {
    title_browser: 'Leyenda del Monitor de Estado',
    main_header: 'Umbrales de Latencia y Justificación Operacional',
    link_volver: 'Volver a la Aplicación',
    content_html: `
            <div class="leyenda-section umbrales-latencia">
                <p>Los colores y símbolos reflejan el tiempo de respuesta (latencia) medido. La justificación se basa en la **Psicología de la Interacción** y el **Significado Operacional** del rendimiento. Haz clic en el resumen para expandir la justificación completa:</p>
                
                <table class="leyenda-tabla-umbrales">
                    <thead>
                        <tr>
                            <th>Estado / Nivel</th>
                            <th>Umbral de Latencia (ms)</th>
                            <th>Justificación de los Umbrales de Latencia</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="status-very-fast">🚀 MUY RÁPIDO</td>
                            <td>&lt; 300 ms</td>
                            <td>
                                <details>
                                    <summary>Rendimiento Óptimo (Instantáneo para el Usuario)</summary>
                                    <p><strong>Estándar Dorado.</strong> El cerebro humano percibe cualquier respuesta por debajo de los 100 ms como **instantánea** (Regla de Nielsen). Mantener el umbral hasta 300 ms asegura una experiencia fluida. <strong>Significado Operacional:</strong> El sistema está operando en condiciones óptimas y con alta eficiencia.</p>
                                </details>
                            </td>
                        </tr>
                        <tr>
                            <td class="status-fast">⭐ RÁPIDO</td>
                            <td>300 ms &le; Latencia &lt; 500 ms</td>
                            <td>
                                <details>
                                    <summary>Interacción Fluida sin Molestias (Percepción Inconsciente)</summary>
                                    <p><strong>Límite de la Percepción Inconsciente.</strong> La demora es notable pero el usuario no la percibe como una espera molesta. <strong>Significado Operacional:</strong> Rendimiento excelente, buen punto de control para procesos rápidos de backend.</p>
                                </details>
                            </td>
                        </tr>
                        <tr>
                            <td class="status-normal">✅ NORMAL</td>
                            <td>500 ms &le; Latencia &lt; 800 ms</td>
                            <td>
                                <details>
                                    <summary>Rendimiento Aceptable (El Foco se Mantiene)</summary>
                                    <p><strong>La Distracción Comienza.</strong> A partir de 500 ms el usuario puede comenzar a desviarse, aunque puede **mantener su hilo de pensamiento**. <strong>Significado Operacional:</strong> Rendimiento aceptable, pero acercándose a donde la sensación de espera se consolida.</p>
                                </details>
                            </td>
                        </tr>
                        <tr>
                            <td class="status-slow">⚠️ LENTO</td>
                            <td>800 ms &le; Latencia &lt; 1500 ms</td>
                            <td>
                                <details>
                                    <summary>Demora Molesta (Distractor Activo / Alerta Temprana)</summary>
                                    <p><strong>Límite del 1 Segundo.</strong> La demora se convierte en un **distractor activo**. La experiencia está notablemente degradada. <strong>Significado Operacional:</strong> **Alerta Temprana.** El servidor o la red experimentan estrés. Momento de investigar.</p>
                                </details>
                            </td>
                        </tr>
                        <tr>
                            <td class="status-critical">🐌 CRÍTICO</td>
                            <td>1500 ms &le; Latencia &lt; 3000 ms</td>
                            <td>
                                <details>
                                    <summary>Riesgo de Abandono del Usuario (3 Segundos / Fallo Inminente)</summary>
                                    <p><strong>Pérdida de Foco y Frustración.</strong> El límite crítico (3 segundos) donde los usuarios **abandonan una página web**. <strong>Significado Operacional:</strong> **Fallo Inminente.** Indica carga extremadamente pesada o cuellos de botella severos.</p>
                                </details>
                            </td>
                        </tr>
                        <tr>
                            <td class="status-risk">🚨 RIESGO</td>
                            <td>3000 ms &le; Latencia &lt; 5000 ms</td>
                            <td>
                                <details>
                                    <summary>Fallo Funcional y Colapso (5 Segundos / Alarma)</summary>
                                    <p><strong>Fallo Funcional.</strong> Las demoras superiores a 5 segundos son consideradas un fallo funcional en muchos sistemas. <strong>Significado Operacional:</strong> **ALARMA.** El servicio está al borde del colapso o no sirve peticiones de manera confiable.</p>
                                </details>
                            </td>
                        </tr>
                        <tr>
                            <td class="status-extreme-risk">🔥 RIESGO EXTREMO</td>
                            <td>5000 ms &le; Latencia &lt; 99999 ms</td>
                            <td>
                                <details>
                                    <summary>Latencia Inaceptable (CAOS / Abandono Asegurado)</summary>
                                    <p><strong>CAOS/Limbo.</strong> Rango antes del *timeout* máximo. Es casi seguro que el usuario abandonó la acción. <strong>Significado Operacional:</strong> El servidor no puede procesar la solicitud en un tiempo razonable. Requiere atención INMEDIATA.</p>
                                </details>
                            </td>
                        </tr>
                        <tr>
                            <td class="status-down">❌ FALLO TOTAL</td>
                            <td>&ge; 99999 ms</td>
                            <td>
                                <details>
                                    <summary>Caída Confirmada (Timeout Excedido)</summary>
                                    <p><strong>Caída Confirmada.</strong> El valor de **PENALIZACION_FALLO** ha sido superado. <strong>Significado Operacional:</strong> El servicio está caído, la ruta es inaccesible, o el servidor se negó a responder.</p>
                                </details>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <small>Nota: Estos valores se basan en la constante <code>UMBRALES_LATENCIA</code>, definidos en la configuración de la aplicación principal.</small>
            </div>

            <div class="leyenda-section codigos-error-section" style="margin-top: 30px;">
                <h3>Códigos de Estado HTTP y Fallos del Sistema</h3>
                <p>Cuando un servicio devuelve un código de estado fuera del rango 2xx (Éxito), el monitor lo clasifica visualmente como **❌ FALLO TOTAL**, pero muestra el código real entre paréntesis (ej: ❌ Caída (404)). Los códigos comunes que se pueden observar son:</p>
                
                <table class="leyenda-tabla-errores">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Rango/Nombre Común</th>
                            <th>Significado Operacional</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>2xx</td>
                            <td>OK / Éxito</td>
                            <td>La conexión y el servicio respondieron correctamente (Latencia medida).</td>
                        </tr>
                        <tr>
                            <td>404</td>
                            <td>Not Found</td>
                            <td>El recurso solicitado (la URL que se está monitoreando) no existe en el servidor.</td>
                        </tr>
                        <tr>
                            <td>429</td>
                            <td>Too Many Requests</td>
                            <td>Se ha superado el límite de tasa (Rate Limit) de la API/Servicio.</td>
                        </tr>
                        <tr>
                            <td>500</td>
                            <td>Internal Server Error</td>
                            <td>Error interno genérico del servidor. Debe investigarse el log del backend.</td>
                        </tr>
                        <tr>
                            <td>502</td>
                            <td>Bad Gateway</td>
                            <td>Un servidor intermedio (proxy, CDN) recibió una respuesta inválida del servidor de origen.</td>
                        </tr>
                        <tr>
                            <td>503</td>
                            <td>Service Unavailable</td>
                            <td>El servidor está temporalmente sobrecargado, en mantenimiento o inactivo.</td>
                        </tr>
                        <tr>
                            <td>0</td>
                            <td>Error de Conexión</td>
                            <td>Fallo de red, bloqueo de CORS, o no respuesta del servidor. Es el código interno <code>ESTADO_ERROR_CONEXION</code>.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `,
};

// Compatibilidad para la API i18n.get() usada por las páginas de la leyenda.
window.i18n = {
    texts: TEXTOS_ES,
    get: function(key) {
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
    }
};

window.TEXTOS_ACTUAL = TEXTOS_ES;