// =======================================================
// 1. CONSTANTES Y CONFIGURACIÓN GLOBAL
// vienen de config.js

let temaProActivo = false; 
let websitesData = [];
let historialStatus = {}; 

//let TEXTOS_ACTUAL = null;

/**
 * Configura el enlace de la leyenda para copiar los parámetros de la URL actual
 * (ej: ?tema=pro) y anexarlos a la URL de destino (leyenda.html).
 */
function configurarEnlaceLeyenda() {
    const enlaceLeyenda = document.getElementById('enlace-leyenda');
    if (enlaceLeyenda) {
        // Usa window.location.search para obtener los parámetros de la URL actual
        const queryString = window.location.search; 
        
        // Adjunta los parámetros a la URL de la leyenda
        enlaceLeyenda.href = `leyenda.html${queryString}`;
    }
}


// =======================================================
// 2. FUNCIONES DE INTERNACIONALIZACIÓN (I18N) Y DOM
// =======================================================
//
 /* Carga dinámicamente el script de idioma. Intenta cargar el idioma de la URL.
 * Si falla (ej: archivo no existe), cae a DEFAULT_LANG.
 * Lanza un error solo si DEFAULT_LANG también falla.
 */
async function cargarIdioma() {
    // 1. Obtener el idioma que el usuario desea usar (desde URL o DEFAULT_LANG)
    const idiomaSolicitado = obtenerIdiomaSeleccionado();
    const idiomaDefault = DEFAULT_LANG; 
    
    // 2. Intentar cargar el idioma solicitado.
    try {
        await cargarIdiomaScript(idiomaSolicitado); 
        return; // Éxito, el idioma se cargó
    } catch (errorSolicitado) {
        
        // Fallo en la carga. Si el idioma solicitado NO ERA el por defecto, intentar el fallback.
        if (idiomaSolicitado !== idiomaDefault) {
            
            // 3. Intento de carga del idioma de reserva (DEFAULT_LANG)
            try {
                await cargarIdiomaScript(idiomaDefault);
                return; // Éxito con el idioma de reserva
            } catch (errorDefault) {
                // Si el idioma de reserva también falla, lanzamos el error crítico
                throw new Error(`Fallo crítico: El idioma solicitado (${idiomaSolicitado}) y el de reserva (${idiomaDefault}) fallaron en la carga.`);
            }
        }
        
        // 4. Si el idioma solicitado ERA el por defecto y falló, es un fallo crítico directo.
        throw new Error(`Fallo crítico: No se pudo cargar el idioma por defecto (${idiomaDefault}).`);
    }
}
/**
 * [NUEVA] Determina el idioma a cargar (es, en, etc.) priorizando el parámetro 'lang'
 * de la URL. Si no es válido, usa DEFAULT_LANG (config.js).
 * @returns {string} El código de idioma a usar (ej: 'es').
 */
function obtenerIdiomaSeleccionado() {
    const params = new URLSearchParams(window.location.search);
    const langUrl = params.get('lang');
    
    let idiomaACargar = DEFAULT_LANG; // Valor por defecto

    // Validar si el idioma de la URL es compatible (I18N_FILES desde config.js)
    if (langUrl && I18N_FILES[langUrl]) {
        idiomaACargar = langUrl;
    } 
    
    return idiomaACargar;
}

/**
 * [NUEVA] Carga dinámicamente el script de idioma y asigna los textos a window.TEXTOS_ACTUAL
 * @param {string} idiomaACargar El código de idioma ('es', 'en', etc.).
 * @returns {Promise<void>} Una promesa que se resuelve cuando el script ha terminado de cargar.
 */
function cargarIdiomaScript(idiomaACargar) {
    const filePath = I18N_FILES[idiomaACargar];
    
    if (!filePath) {
        return Promise.reject(new Error(`Error de configuración: Archivo de idioma no definido para ${idiomaACargar}`));
    }

    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = filePath;
        script.type = 'text/javascript';
        
        script.onload = () => {
            // Se asume que el script de idioma asigna window.TEXTOS_ACTUAL
            if (window.TEXTOS_ACTUAL) {
                resolve();
            } else {
                reject(new Error(`El archivo de idioma ${filePath} no asignó la variable TEXTOS_ACTUAL`));
            }
        };

        script.onerror = () => {
            reject(new Error(`Fallo al cargar el script de idioma: ${filePath}`));
        };

        document.head.appendChild(script);
    });
}

/**
 * Actualiza el texto del encabezado de la columna Promedio con el conteo del historial.
 * @param {number} count - Número de entradas recogidas.
 */
function actualizarEncabezadoPromedio(count) {
    const elemento = document.getElementById('header-promedio-ms');
    if (elemento) {
        // CORRECCIÓN CLS/SINTAXIS: Se añade el espacio y "(ms)" aquí.
        // Se asume que TEXTOS_ES.tabla.HEADER_PROMEDIO_MS ya NO tiene el espacio final.
        elemento.textContent = `${window.TEXTOS_ACTUAL.tabla.HEADER_PROMEDIO_MS} [${count}/${MAX_HISTORIAL_ENTRIES}]`;
    }
}

/**
 * Inicializa todas las cadenas de texto estáticas leyendo el diccionario TEXTOS_ES.
 */
function inicializarEtiquetas() {
	
	// 0. Inicializar Título Principal
    const tituloEl = document.getElementById('titulo-principal');
    if (tituloEl) tituloEl.textContent = window.TEXTOS_ACTUAL.general.PAGE_TITLE;
	
	
    // 1. Inyectar mensajes generales
    const infoBar = document.getElementById('info-bar-msg');
    if (infoBar) infoBar.textContent = window.TEXTOS_ACTUAL.general.INFO_BAR;
    
    // 2. Inyectar encabezados de la tabla (7 columnas, 1 nivel)
    const headers = [
        { id: 'header-service', text: window.TEXTOS_ACTUAL.tabla.HEADER_SERVICE },
        { id: 'header-url', text: window.TEXTOS_ACTUAL.tabla.HEADER_URL },
        { id: 'header-latency-actual', text: window.TEXTOS_ACTUAL.tabla.HEADER_LATENCY_ACTUAL },
        { id: 'header-status-actual', text: window.TEXTOS_ACTUAL.tabla.HEADER_STATUS_ACTUAL },
        // El encabezado de promedio se actualizará dinámicamente después de obtener los datos
        { id: 'header-promedio-ms', text: window.TEXTOS_ACTUAL.tabla.HEADER_PROMEDIO_MS }, 
        { id: 'header-promedio-status', text: window.TEXTOS_ACTUAL.tabla.HEADER_PROMEDIO_STATUS },
        { id: 'header-action', text: window.TEXTOS_ACTUAL.tabla.HEADER_ACTION },
    ];

    headers.forEach(h => {
        const element = document.getElementById(h.id);
        if (element) {
            element.textContent = h.text;
        }
    });

    // 3. Inicializar el mensaje de última actualización
    actualizarUltimaActualizacion(null);
}

/**
 * Actualiza el texto de la última actualización, mostrando un spinner mientras carga.
 * @param {Date | null} fecha - La fecha de la última actualización, o null si está cargando.
 */
function actualizarUltimaActualizacion(fecha) {
    const elemento = document.getElementById('ultima-actualizacion');
    if (!elemento) return;

    if (fecha) {
        // Muestra la hora de actualización
        const opciones = { 
            hour: '2-digit', minute: '2-digit', second: '2-digit', 
            day: '2-digit', month: '2-digit', year: 'numeric' 
        };
        const fechaFormateada = fecha.toLocaleTimeString('es-ES', opciones);
        elemento.innerHTML = `${window.TEXTOS_ACTUAL.general.LAST_UPDATE} <strong>${fechaFormateada}</strong>`;
    } else {
        // Muestra el spinner mientras carga (HTML COMPACTO)
        elemento.innerHTML = `
            ${window.TEXTOS_ACTUAL.general.LAST_UPDATE} 
            <span class="loading-text">${window.TEXTOS_ACTUAL.general.LOADING}</span><span class="spinner" title="${window.TEXTOS_ACTUAL.general.LOADING}"></span>
        `;
    }
}


// =======================================================
// 3. LÓGICA DE CLASIFICACIÓN Y CÁLCULOS
// =======================================================

/**
 * Determina el estado visual (texto y clase CSS) basado en un tiempo de latencia dado.
 */
function obtenerEstadoVisual(tiempo, estado = 200) {
    const tiempoNum = parseFloat(tiempo);

    // 🚨 MODIFICACIÓN CLAVE: Manejar CAÍDA y ERRORES
    // 1. Si el estado NO es 200 O la latencia es extremadamente alta (penalización por fallo)
    if (estado !== 200 || tiempoNum >= UMBRALES_LATENCIA.PENALIZACION_FALLO) {
        let textoFallo;
        
        if (estado === ESTADO_ERROR_CONEXION || tiempoNum >= UMBRALES_LATENCIA.PENALIZACION_FALLO) {
            // Error de conexión o timeout (usamos el texto genérico de error)
            textoFallo = window.TEXTOS_ACTUAL.estados.DOWN_ERROR; 
        } else {
            // Respuesta RÁPIDA con código NO-200
            textoFallo = `${window.TEXTOS_ACTUAL.estados.DOWN} (${estado})`; 
        }

        return { 
            text: textoFallo, 
            className: "status-down"
        };
    }
    // 2. Continuar con la clasificación normal (solo si el estado es 200)
    
    const estadosVelocidad = [
        { umbral: UMBRALES_LATENCIA.MUY_RAPIDO, text: window.TEXTOS_ACTUAL.velocidad.VERY_FAST, className: "status-very-fast" },
        { umbral: UMBRALES_LATENCIA.RAPIDO, text: window.TEXTOS_ACTUAL.velocidad.FAST, className: "status-fast" },
        { umbral: UMBRALES_LATENCIA.NORMAL, text: window.TEXTOS_ACTUAL.velocidad.NORMAL, className: "status-normal" },
        { umbral: UMBRALES_LATENCIA.LENTO, text: window.TEXTOS_ACTUAL.velocidad.SLOW, className: "status-slow" },
		{ umbral: UMBRALES_LATENCIA.CRITICO, text: window.TEXTOS_ACTUAL.velocidad.CRITICAL, className: "status-critical" }, // Nuevo
        { umbral: UMBRALES_LATENCIA.RIESGO, text: window.TEXTOS_ACTUAL.velocidad.RISK, className: "status-risk" },           // Nuevo
    ];

    for (const estadoVelocidad of estadosVelocidad) {
        if (tiempoNum <= estadoVelocidad.umbral) {
            return { text: estadoVelocidad.text, className: estadoVelocidad.className };
        }
    }

	return { text: window.TEXTOS_ACTUAL.velocidad.EXTREME_RISK, className: "status-extreme-risk" };
}
// =======================================================
// 3.5. LÓGICA DE ORDENAMIENTO PERSONALIZADO
// =======================================================
/**
 * Ordena la lista de servicios. Mantiene fijos aquellos con 'orden: 1'
 * y ordena el resto alfabéticamente por nombre.
 * @param {Array<Object>} servicios - Lista de servicios sin ordenar.
 * @returns {Array<Object>} Lista de servicios ordenada.
 */
function ordenarServiciosPersonalizado(servicios) {
    // 1. Separar los servicios: Fijos (orden: 1) y Ordenables.
    const fijos = servicios.filter(servicio => servicio.orden === 1);
    const ordenables = servicios.filter(servicio => servicio.orden !== 1);

    // 2. Ordenar el grupo de servicios ordenables alfabéticamente por 'nombre'.
    ordenables.sort((a, b) => {
        const nombreA = a.nombre.toUpperCase();
        const nombreB = b.nombre.toUpperCase();
        
        if (nombreA < nombreB) return -1;
        if (nombreA > nombreB) return 1;
        return 0; // nombres iguales
    });

    // 3. Combinar los arrays: Fijos primero (manteniendo su orden original), seguido de los ordenables.
    return fijos.concat(ordenables);
}


// =======================================================
// 4. LÓGICA DE HISTORIAL Y ALMACENAMIENTO LOCAL
// =======================================================

function cargarHistorial() {
    // USANDO sessionStorage para que los datos se borren al cerrar el navegador
    const data = sessionStorage.getItem('monitorStatusHistorial');
    if (data) {
        historialStatus = JSON.parse(data);
    }
}

function guardarHistorial() {
    // USANDO sessionStorage para que los datos se borren al cerrar el navegador
    sessionStorage.setItem('monitorStatusHistorial', JSON.stringify(historialStatus));
}

function actualizarHistorial(url, time, status) {
    
    if (!historialStatus[url]) {
        historialStatus[url] = [];
    }

    // El objeto guardado en el historial debe incluir 'time' y 'status'
    historialStatus[url].push({ time, status, timestamp: Date.now() });

    // Limitar el historial (Lógica FIFO: Mantiene los 12 más nuevos)
    if (historialStatus[url].length > MAX_HISTORIAL_ENTRIES) {
        historialStatus[url].shift(); // Elimina el elemento más antiguo (First-In)
    }
    
    guardarHistorial();
}

/**
 * Calcula el promedio histórico de latencia y el estado visual.
 * DEVUELVE: { promedio: number, estadoPromedio: object, validCount: number, historial: Array }
 */
function calcularPromedio(url) {
    const historial = historialStatus[url] || [];
    
    if (historial.length === 0) {
        return { promedio: 0, estadoPromedio: obtenerEstadoVisual(0, 200), validCount: 0, historial: historial };
    }

    let totalTime = 0;
    let validCount = 0;
    let fallos = 0;
    
    historial.forEach(entry => {
        if (entry.status !== 200 || entry.time >= UMBRALES_LATENCIA.PENALIZACION_FALLO) {
            fallos++;
        }
        
        totalTime += entry.time;
        validCount++;
    });

    const promedioMs = validCount > 0 ? Math.round(totalTime / validCount) : 0;
    
    // Si más del 50% de los puntos son fallos, se marca como estado crítico
    if (fallos / validCount > 0.5 && validCount > 3) {
        return { 
            promedio: promedioMs, 
            estadoPromedio: obtenerEstadoVisual(UMBRALES_LATENCIA.PENALIZACION_FALLO + 1, ESTADO_ERROR_CONEXION),
            validCount: validCount,
            historial: historial // <-- CLAVE: Devolver el historial completo
        };
    } else {
        return { 
            promedio: promedioMs, 
            estadoPromedio: obtenerEstadoVisual(promedioMs, 200),
            validCount: validCount,
            historial: historial // <-- CLAVE: Devolver el historial completo
        };
    }
}


// =======================================================
// 4.5. LÓGICA DE RESILIENCIA Y ERRORES GLOBALES (NUEVO)
// =======================================================
// Requiere constantes de config.js: GRUPO_CRITICO_NOMBRE, UMBRAL_FALLO_GLOBAL_MS, PORCENTAJE_FALLO_GLOBAL

/**
 * Muestra un mensaje de advertencia sobre el Fallo Global.
 * @param {boolean} esFalloCritico - Si es un fallo global.
 * @param {string} [motivoFallo=""] - El texto detallado de la razón del fallo (ej: "80% de los sitios cayeron").
 */
function mostrarAdvertenciaGlobal(esFalloCritico, motivoFallo = "") {
    const infoBar = document.getElementById('info-bar-msg');
    
    if (esFalloCritico) {
        let mensajeBase = window.TEXTOS_ACTUAL.general.ADVERTENCIA_FALLO_GLOBAL_HTML;

        // Si el tema 'pro' está activo, inyectamos el detalle del error
        if (temaProActivo && motivoFallo) { // 'temaProActivo' viene de script.js, línea 4
            // Usamos un <small> para diferenciarlo del mensaje base
            //mensajeBase += `<br><small class="motivo-fallo">Motivo Pro: ${motivoFallo}</small>`;
			mensajeBase += `<br><small class="motivo-fallo">${window.TEXTOS_ACTUAL.general.MOTIVO_FALLO_PRO} ${motivoFallo}</small>`;
        }
        
        infoBar.innerHTML = `<strong>🚨 ${mensajeBase}🚨</strong>`;
        infoBar.classList.add('error-critical');
        sessionStorage.setItem('LAST_RUN_CRITICAL', 'true'); 
    } else {
        infoBar.textContent = window.TEXTOS_ACTUAL.general.INFO_BAR;
        infoBar.classList.remove('error-critical');
        sessionStorage.removeItem('LAST_RUN_CRITICAL');
    }
}

/**
 * Determina si la corrida actual debe ser marcada como Fallo Global Crítico.
 * @param {Array} websitesData - Lista completa de sitios (cargada de webs.json).
 * @param {Array} resultados - Array de resultados de la API: [{url, time, status}, ...].
 * @returns {{esFallo: boolean, motivo: string}} - objeto con el resultado y la causa del fallo.
 */
function determinarFalloGlobal(websitesData, resultados) {
    /*if (resultados.length === 0 || websitesData.length === 0) return { esFallo: true, motivo: "No hay resultados disponibles
	(Fallo de red)" }; */
	if (resultados.length === 0 || websitesData.length === 0) return { esFallo: true, motivo: window.TEXTOS_ACTUAL.general.FALLO_CRITICO_RED };

    let totalSitios = websitesData.length;
    let sitiosEnFalloCritico = 0;
    let motivoFallo = "";

    // --- 1. Mapear resultados para fácil acceso ---
    const resultadosMap = resultados.reduce((map, item) => {
        map[item.url] = item;
        return map;
    }, {});

    // --- 2. Analizar el Grupo Crítico (si está definido) ---
    const sitiosCriticos = websitesData.filter(web => web.grupo === GRUPO_CRITICO_NOMBRE);
    let criticosConFalloExtremo = 0;

    if (sitiosCriticos.length > 0) {
        sitiosCriticos.forEach(web => {
            const res = resultadosMap[web.url];
            if (res && res.time > UMBRAL_FALLO_GLOBAL_MS) { 
                criticosConFalloExtremo++;
            }
        });

        if (criticosConFalloExtremo === sitiosCriticos.length && sitiosCriticos.length > 0) {
            console.warn(`Alerta Global: Fallo del 100% en el grupo crítico "${GRUPO_CRITICO_NOMBRE}".`);
            //motivoFallo = `Falló el 100% del grupo crítico: "${GRUPO_CRITICO_NOMBRE}".`;
			motivoFallo = `${window.TEXTOS_ACTUAL.general.FALLO_CRITICO_GRUPO} "${GRUPO_CRITICO_NOMBRE}".`;
            return { esFallo: true, motivo: motivoFallo };
        }
    }

    // --- 3. Analizar Fallo Global por Porcentaje (Fallback) ---
    resultados.forEach(res => {
        if (res.time > UMBRAL_FALLO_GLOBAL_MS) {
            sitiosEnFalloCritico++;
        }
    });

    const porcentajeFallo = sitiosEnFalloCritico / totalSitios;
    
    const falloPorPorcentaje = porcentajeFallo >= PORCENTAJE_FALLO_GLOBAL;
    
    if (falloPorPorcentaje) {
        const porcentaje = Math.round(porcentajeFallo * 100);
        console.warn(`Alerta Global: ${porcentaje}% de los servicios superaron el umbral de ${UMBRAL_FALLO_GLOBAL_MS}ms.`);
        //motivoFallo = `${porcentaje}% de los servicios superaron el umbral de ${UMBRAL_FALLO_GLOBAL_MS}ms.`;
        motivoFallo = `${porcentaje}${window.TEXTOS_ACTUAL.general.FALLO_CRITICO_LATENCIA_PARTE1} ${UMBRAL_FALLO_GLOBAL_MS}ms.`;
		return { esFallo: true, motivo: motivoFallo };
    }

    return { esFallo: false, motivo: "" };
}


// =======================================================
// 5. LÓGICA PRINCIPAL DE MONITOREO Y RENDERING ASÍNCRONO
// =======================================================

/**
 * Llama al proxy Netlify para obtener el estado y latencia de una URL.
 */
async function verificarEstado(url) {
    try {
        const response = await fetch(`${PROXY_ENDPOINT}?url=${encodeURIComponent(url)}`);
        
        if (!response.ok) {
            console.error(`${window.TEXTOS_ACTUAL.estados.DOWN_ERROR} en la función Serverless para ${url}: ${response.status}`);
            return { time: UMBRALES_LATENCIA.PENALIZACION_FALLO, status: ESTADO_ERROR_CONEXION };
        }

        const data = await response.json();
        return data; // Retorna {time, status}
        
    } catch (error) {
        console.error(`${window.TEXTOS_ACTUAL.estados.DOWN_ERROR} al conectar con el proxy para ${url}:`, error);
        return { time: UMBRALES_LATENCIA.PENALIZACION_FALLO, status: ESTADO_ERROR_CONEXION };
    }
}

/**
 * Dibuja las filas iniciales con placeholders de carga.
 */
function dibujarFilasIniciales(servicios) {
    const tbody = document.getElementById('status-table-body');
    tbody.innerHTML = ''; // Limpiar tabla
    
    // Calcular el conteo máximo del historial para actualizar el encabezado
    let maxValidCount = 0;
    servicios.forEach(web => {
        const { validCount } = calcularPromedio(web.url);
        maxValidCount = Math.max(maxValidCount, validCount);

        const row = tbody.insertRow();
        // ID que nos permite encontrar la fila para la actualización asíncrona
        row.dataset.url = web.url;
        
        // Columna 1: Servicio (AHORA CON HIPERVÍNCULO)
        row.insertCell().innerHTML = `<a href="${web.url}" target="_blank">${web.nombre}</a>`;
        
        // Columna 2: URL (Oculta en styles.css)
        row.insertCell().innerHTML = `<a href="${web.url}" target="_blank">${web.url}</a>`;
        
        // Columna 3: Latencia Actual (Placeholder)
        row.insertCell().textContent = window.TEXTOS_ACTUAL.general.LOADING;
        
        // Columna 4: Estado Actual (Placeholder)
        row.insertCell().textContent = window.TEXTOS_ACTUAL.general.LOADING;
        
        // Columna 5: Promedio (ms) - Placeholder
        row.insertCell().textContent = window.TEXTOS_ACTUAL.general.LOADING;
        
        // Columna 6: Estado Promedio (Placeholder)
        row.insertCell().textContent = window.TEXTOS_ACTUAL.general.LOADING;
        
        // Columna 7: Acción (Placeholder)
        row.insertCell().textContent = '';

        // Accesibilidad: añadir aria-label y role a las celdas de estado (placeholders)
        // (Es más robusto añadirlo aquí para que estén presentes antes de la actualización)
        // Aplicar atributos de accesibilidad a las celdas de estado en la fila
        aplicarAccesibilidadEstadoEnFila(row, { actual: window.TEXTOS_ACTUAL.general.LOADING, promedio: window.TEXTOS_ACTUAL.general.LOADING });
    });

    // Actualizar el encabezado una vez con el historial guardado (puede ser 0/12 si está vacío)
    actualizarEncabezadoPromedio(maxValidCount);
}

/**
 * [ACCESIBILIDAD] Añade roles y etiquetas ARIA a las celdas de estado de una fila.
 * @param {HTMLTableRowElement} row - Fila de la tabla con celdas de estados en índices 3 y 5.
 * @param {Object} labels - Opcional: {actual: string, promedio: string} con textos accesibles.
 */
function aplicarAccesibilidadEstadoEnFila(row, labels = {}) {
    if (!row) return;
    const statusActual = row.cells[3];
    const statusProm = row.cells[5];

    const actualText = (labels.actual !== undefined) ? labels.actual : (statusActual ? statusActual.textContent.trim() : '');
    const promText = (labels.promedio !== undefined) ? labels.promedio : (statusProm ? statusProm.textContent.trim() : '');

    if (statusActual) {
        statusActual.setAttribute('role', 'status');
        statusActual.setAttribute('aria-label', actualText || window.TEXTOS_ACTUAL.general.LOADING);
    }
    if (statusProm) {
        statusProm.setAttribute('role', 'status');
        statusProm.setAttribute('aria-label', promText || window.TEXTOS_ACTUAL.general.LOADING);
    }
}


/**
 * Actualiza una fila específica de la tabla con los datos reales.
 */
function actualizarFila(web, resultado) {
    const tbody = document.getElementById('status-table-body');
    // Escapar caracteres especiales en la URL para la selección del atributo data-url
    const row = tbody.querySelector(`tr[data-url="${CSS.escape(web.url)}"]`); 

    if (!row) return;

    // --- Lógica de cálculo y estado ---
    const estadoActual = obtenerEstadoVisual(resultado.time, resultado.status);
    // Nota: calcularPromedio() obtiene los datos del historial que ACABA de ser actualizado
    const { promedio, estadoPromedio } = calcularPromedio(web.url);
    
    // --- Actualización de celdas (Columnas 3 a 7) ---
    
    // Columna 3: Latencia Actual (índice 2)
    row.cells[2].textContent = `${resultado.time} ms`;
    
    // Columna 4: Estado Actual (índice 3)
    row.cells[3].textContent = estadoActual.text;
    row.cells[3].className = estadoActual.className;

    // Columna 5: Promedio (ms) (índice 4)
    row.cells[4].textContent = `${promedio} ms`;
    
    // Columna 6: Estado Promedio (índice 5)
    row.cells[5].textContent = estadoPromedio.text;
    row.cells[5].className = estadoPromedio.className;

    // Accesibilidad: actualizar atributos de forma consistente después de actualizar el texto
    aplicarAccesibilidadEstadoEnFila(row, {actual: estadoActual.text, promedio: estadoPromedio.text});
    
    // Columna 7: Acción (índice 6)
    row.cells[6].innerHTML = `<button class="psi-button" onclick="window.open('https://pagespeed.web.dev/report?url=${web.url}', '_blank')">PSI</button>`;
}

/**
 * Función principal que orquesta la solicitud a la API del Proxy,
 * procesa los resultados y gestiona la visualización/resiliencia.
 */
async function monitorearTodosWebsites() {
    
    // 0. Limpiar el temporizador anterior
    if (window.monitorTimeout) {
        clearTimeout(window.monitorTimeout);
        window.monitorTimeout = null;
    }

    // 1. Cargar la lista de websites desde webs.json y ordenar
    try {
        const response = await fetch('webs.json');
        websitesData = await response.json();
    } catch (e) {
        console.error("Error al cargar webs.json.", e);
        actualizarUltimaActualizacion(new Date());
        window.monitorTimeout = setTimeout(monitorearTodosWebsites, FRECUENCIA_MONITOREO_MS);
        return;
    }

    if (websitesData.length === 0) {
        actualizarUltimaActualizacion(new Date());
        window.monitorTimeout = setTimeout(monitorearTodosWebsites, FRECUENCIA_MONITOREO_MS);
        return;
    }
    
    // DIBUJAR PLACEHOLDERS y establecer 'Cargando...'
    websitesData = ordenarServiciosPersonalizado(websitesData);
    dibujarFilasIniciales(websitesData); 
    actualizarUltimaActualizacion(null); // Establecer 'Cargando...'

    // 2. LANZAR TODAS LAS PROMESAS Y RECOLECTAR RESULTADOS
    // Mapear llamadas a verificarEstado()
    const promesas = websitesData.map(web => verificarEstado(web.url));
    const allResults = await Promise.allSettled(promesas);

    // Mapear resultados finales a un formato simple para el análisis de Fallo Global
    const resultadosMonitoreo = [];
    allResults.forEach((result, index) => {
        const web = websitesData[index];
        let res;

        if (result.status === 'fulfilled') {
            res = result.value; // Resultado exitoso del proxy: {time, status}
        } else {
            // Error de promesa, se penaliza
            res = { time: UMBRALES_LATENCIA.PENALIZACION_FALLO, status: ESTADO_ERROR_CONEXION };
        }
        
        // Agregar al array para el análisis global
        resultadosMonitoreo.push({
            url: web.url,
            time: res.time,
            status: res.status
        });
    });

    // =======================================================
    // 3. LÓGICA DE FALLO GLOBAL
    // =======================================================
    //const esFalloCritico = determinarFalloGlobal(websitesData, resultadosMonitoreo);
	const { esFallo: esFalloCritico, motivo: motivoFallo } = determinarFalloGlobal(websitesData, resultadosMonitoreo);
    mostrarAdvertenciaGlobal(esFalloCritico); 

	if (allResults.every(r => r.status === 'rejected')) {
        mostrarAdvertenciaGlobal(true, "Fallo total de red: El proxy no respondió para ningún sitio.");
    } else {
        mostrarAdvertenciaGlobal(esFalloCritico, motivoFallo); 
    }


    if (esFalloCritico) {
        console.warn("Se detectó un Fallo Global Crítico. Se omite la actualización de la tabla y historial con estos datos. El usuario verá el aviso.");
        
        // Solo actualizamos el timestamp. La tabla mantiene los datos del historial ANTERIOR
        actualizarUltimaActualizacion(new Date()); 
        
        // Programar la próxima ejecución y retornar
        window.monitorTimeout = setTimeout(monitorearTodosWebsites, FRECUENCIA_MONITOREO_MS);
        return; 
    }
    
    // =======================================================
    // 4. SI NO ES CRÍTICO, APLICAR DATOS Y ACTUALIZAR UI NORMALMENTE
    // =======================================================
    let maxValidCount = 0;
    
    // Recorrer los resultados exitosos y actualizar el historial y la tabla
    resultadosMonitoreo.forEach(res => {
        const web = websitesData.find(w => w.url === res.url);
        
        // 4.1. Actualizar el historial
        actualizarHistorial(res.url, res.time, res.status);

        // 4.2. Actualizar la fila en la UI
        actualizarFila(web, res);

        // 4.3. Recalcular el conteo para el encabezado
        const { validCount } = calcularPromedio(res.url); 
        maxValidCount = Math.max(maxValidCount, validCount);
    });

    // 5. FINALIZAR Y PROGRAMAR LA PRÓXIMA EJECUCIÓN
    actualizarEncabezadoPromedio(maxValidCount); 
    actualizarUltimaActualizacion(new Date());
    window.monitorTimeout = setTimeout(monitorearTodosWebsites, FRECUENCIA_MONITOREO_MS);
}


// =======================================================
// 6. LÓGICA DE TEMAS E INICIALIZACIÓN
// =======================================================

/**
 * Obtiene el tema de los parámetros de la URL.
 * @returns {string | null} El nombre del tema o null.
 */
function obtenerTemaDeURL() {
    const params = new URLSearchParams(window.location.search);
    const tema = params.get('tema');
    if (tema === TEMA_PRO) return TEMA_PRO;
    if (tema === TEMA_MIN) return TEMA_MIN;
    return null;
}


/**
 * Lógica de cambio de tema: Prioriza la URL. Si no hay parámetro,
 * utiliza la preferencia guardada en sessionStorage para la sesión actual.
 */
function inicializarTema() {
    // Nota: TEMA_DEFAULT, TEMA_PRO, TEMA_MIN y TEMA_FILES ahora son globales desde config.js
    const estiloPrincipal = document.getElementById('estilo-principal');
    let temaFinal = TEMA_DEFAULT; // Inicializamos con el valor por defecto

    // 1. Intentar obtener el tema de la URL (MÁXIMA PRIORIDAD)
    const temaUrl = obtenerTemaDeURL();
    
    // Si hay un tema válido en la URL, lo usamos.
    if (temaUrl) {
        temaFinal = temaUrl;
    } 
    // Si no hay tema en la URL, temaFinal se mantiene como TEMA_DEFAULT.

    // 2. Aplicar el tema
    // Nos aseguramos de que el archivo CSS exista en el mapa TEMA_FILES.
    if (TEMA_FILES[temaFinal]) {
        estiloPrincipal.href = TEMA_FILES[temaFinal];
        // La variable temaProActivo se usa para lógica JS, no CSS
        // Asignamos 'true' solo si no estamos en el tema por defecto.
        temaProActivo = (temaFinal !== TEMA_DEFAULT); 
    } else {
        // Fallback de seguridad si el tema (incluso el default) falla la validación
        estiloPrincipal.href = TEMA_FILES[TEMA_DEFAULT];
        temaProActivo = false;
    }

    
}


// Punto de entrada principal al cargar el DOM
document.addEventListener('DOMContentLoaded', async () => {
    inicializarTema(); 
    cargarHistorial(); 
	configurarEnlaceLeyenda();
	
    try {
        // 1. Cargar dinámicamente el diccionario de idioma
        await cargarIdioma(); // ESPERA a que el script de idioma asigne window.TEXTOS_ACTUAL
        
        // 2. Inicializar elementos estáticos AHORA que TEXTOS_ACTUAL tiene valor
        
        inicializarEtiquetas(); 
        
        // 3. Iniciar el monitoreo
        monitorearTodosWebsites();

    } catch (e) {
        console.error("Fallo crítico: No se pudo cargar el idioma.", e);
        document.getElementById('info-bar-msg').textContent = `ERROR: No se pudo cargar el idioma. Verifique la consola.`;
    }
});