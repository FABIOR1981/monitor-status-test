let temaProActivo = false;
let websitesData = [];
let historialStatus = {};
let maxHistorialActual = MAX_HISTORIAL_ENTRIES;

function configurarEnlaceLeyenda() {
  const enlaceLeyenda = document.getElementById('enlace-leyenda');
  if (enlaceLeyenda) {
    enlaceLeyenda.href = `leyenda.html${window.location.search}`;
  }
}

function obtenerDuracionSeleccionada() {
  const guardado = localStorage.getItem('duracionMonitoreo');
  return guardado && DURACION_OPCIONES[guardado] ? guardado : DURACION_DEFAULT;
}

function guardarDuracionSeleccionada(duracion) {
  localStorage.setItem('duracionMonitoreo', duracion);
}

function inicializarSelectorDuracion() {
  const selector = document.getElementById('duracion-selector');
  if (!selector) return;

  selector.innerHTML = '';

  Object.keys(DURACION_OPCIONES).forEach((key) => {
    const opcion = DURACION_OPCIONES[key];
    const option = document.createElement('option');
    option.value = key;

    const horas = parseInt(key);
    const textoHoras =
      horas === 1
        ? window.TEXTOS_ACTUAL.general.DURACION_HORA_SINGULAR
        : window.TEXTOS_ACTUAL.general.DURACION_HORA_PLURAL;

    option.textContent = `${horas} ${textoHoras} (${opcion.mediciones} ${window.TEXTOS_ACTUAL.general.DURACION_MEDICIONES})`;
    selector.appendChild(option);
  });

  const duracionGuardada = obtenerDuracionSeleccionada();
  selector.value = duracionGuardada;
  maxHistorialActual = DURACION_OPCIONES[duracionGuardada].mediciones;

  const label = document.getElementById('duracion-label');
  if (label && window.TEXTOS_ACTUAL) {
    label.textContent = window.TEXTOS_ACTUAL.general.DURACION_LABEL;
  }

  selector.addEventListener('change', (e) => {
    const nuevaDuracion = e.target.value;
    guardarDuracionSeleccionada(nuevaDuracion);
    maxHistorialActual = DURACION_OPCIONES[nuevaDuracion].mediciones;
    // Limpiamos el historial al cambiar duración porque las mediciones antiguas
    // podrían ser incompatibles con el nuevo tamaño de ventana
    historialStatus = {};
    guardarHistorial();
    monitorearTodosWebsites();
  });
}

// =======================================================
// 2. FUNCIONES DE INTERNACIONALIZACIÓN (I18N) Y DOM
// =======================================================
//
async function cargarIdioma() {
  const idiomaSolicitado = obtenerIdiomaSeleccionado();
  const idiomaDefault = DEFAULT_LANG;

  try {
    await cargarIdiomaScript(idiomaSolicitado);
    return;
  } catch (errorSolicitado) {
    if (idiomaSolicitado !== idiomaDefault) {
      try {
        await cargarIdiomaScript(idiomaDefault);
        return;
      } catch (errorDefault) {
        throw new Error(
          `Fallo crítico: El idioma solicitado (${idiomaSolicitado}) y el de reserva (${idiomaDefault}) fallaron en la carga.`
        );
      }
    }

    throw new Error(
      `Fallo crítico: No se pudo cargar el idioma por defecto (${idiomaDefault}).`
    );
  }
}
function obtenerIdiomaSeleccionado() {
  const params = new URLSearchParams(window.location.search);
  const langUrl = params.get('lang');

  if (langUrl && I18N_FILES[langUrl]) {
    return langUrl;
  }

  return DEFAULT_LANG;
}

function cargarIdiomaScript(idiomaACargar) {
  const filePath = I18N_FILES[idiomaACargar];

  if (!filePath) {
    return Promise.reject(
      new Error(
        `Error de configuración: Archivo de idioma no definido para ${idiomaACargar}`
      )
    );
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = filePath;
    script.type = 'text/javascript';

    script.onload = () => {
      if (window.TEXTOS_ACTUAL) {
        resolve();
      } else {
        reject(
          new Error(
            `El archivo de idioma ${filePath} no asignó la variable TEXTOS_ACTUAL`
          )
        );
      }
    };

    script.onerror = () => {
      reject(new Error(`Fallo al cargar el script de idioma: ${filePath}`));
    };

    document.head.appendChild(script);
  });
}

function actualizarEncabezadoPromedio(count) {
  const elemento = document.getElementById('header-promedio-ms');
  if (elemento) {
    elemento.textContent = `${window.TEXTOS_ACTUAL.tabla.HEADER_PROMEDIO_MS} [${count}/${maxHistorialActual}]`;
  }
}

function inicializarEtiquetas() {
  const tituloEl = document.getElementById('titulo-principal');
  if (tituloEl) tituloEl.textContent = window.TEXTOS_ACTUAL.general.PAGE_TITLE;

  const infoBar = document.getElementById('info-bar-msg');
  if (infoBar) infoBar.textContent = window.TEXTOS_ACTUAL.general.INFO_BAR;

  const headers = [
    { id: 'header-service', text: window.TEXTOS_ACTUAL.tabla.HEADER_SERVICE },
    { id: 'header-url', text: window.TEXTOS_ACTUAL.tabla.HEADER_URL },
    {
      id: 'header-latency-actual',
      text: window.TEXTOS_ACTUAL.tabla.HEADER_LATENCY_ACTUAL,
    },
    {
      id: 'header-status-actual',
      text: window.TEXTOS_ACTUAL.tabla.HEADER_STATUS_ACTUAL,
    },
    {
      id: 'header-promedio-ms',
      text: window.TEXTOS_ACTUAL.tabla.HEADER_PROMEDIO_MS,
    },
    {
      id: 'header-promedio-status',
      text: window.TEXTOS_ACTUAL.tabla.HEADER_PROMEDIO_STATUS,
    },
    { id: 'header-action', text: window.TEXTOS_ACTUAL.tabla.HEADER_ACTION },
  ];

  headers.forEach((h) => {
    const element = document.getElementById(h.id);
    if (element) element.textContent = h.text;
  });

  actualizarUltimaActualizacion(null);
}

function actualizarUltimaActualizacion(fecha) {
  const elemento = document.getElementById('ultima-actualizacion');
  if (!elemento) return;

  if (fecha) {
    const opciones = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    };
    const fechaFormateada = fecha.toLocaleTimeString('es-ES', opciones);
    elemento.innerHTML = `${window.TEXTOS_ACTUAL.general.LAST_UPDATE} <strong>${fechaFormateada}</strong>`;
  } else {
    elemento.innerHTML = `
      ${window.TEXTOS_ACTUAL.general.LAST_UPDATE} 
      <span class="loading-text">${window.TEXTOS_ACTUAL.general.LOADING}</span><span class="spinner" title="${window.TEXTOS_ACTUAL.general.LOADING}"></span>
    `;
  }
}

function obtenerEstadoVisual(tiempo, estado = 200) {
  const tiempoNum = parseFloat(tiempo);

  if (estado !== 200 || tiempoNum >= UMBRALES_LATENCIA.PENALIZACION_FALLO) {
    const descripcionEstado =
      window.TEXTOS_ACTUAL.httpStatus?.[estado] ||
      window.TEXTOS_ACTUAL.httpStatus?.GENERIC;

    const textoFallo =
      estado !== 200
        ? `${window.TEXTOS_ACTUAL.estados.DOWN_ERROR} (${estado} - ${descripcionEstado})`
        : window.TEXTOS_ACTUAL.estados.DOWN_ERROR;

    return {
      text: textoFallo,
      className: 'status-down',
    };
  }

  const estadosVelocidad = [
    {
      umbral: UMBRALES_LATENCIA.MUY_RAPIDO,
      text: window.TEXTOS_ACTUAL.velocidad.VERY_FAST,
      className: 'status-very-fast',
    },
    {
      umbral: UMBRALES_LATENCIA.RAPIDO,
      text: window.TEXTOS_ACTUAL.velocidad.FAST,
      className: 'status-fast',
    },
    {
      umbral: UMBRALES_LATENCIA.NORMAL,
      text: window.TEXTOS_ACTUAL.velocidad.NORMAL,
      className: 'status-normal',
    },
    {
      umbral: UMBRALES_LATENCIA.LENTO,
      text: window.TEXTOS_ACTUAL.velocidad.SLOW,
      className: 'status-slow',
    },
    {
      umbral: UMBRALES_LATENCIA.CRITICO,
      text: window.TEXTOS_ACTUAL.velocidad.CRITICAL,
      className: 'status-critical',
    },
    {
      umbral: UMBRALES_LATENCIA.RIESGO,
      text: window.TEXTOS_ACTUAL.velocidad.RISK,
      className: 'status-risk',
    },
  ];

  for (const estadoVelocidad of estadosVelocidad) {
    if (tiempoNum <= estadoVelocidad.umbral) {
      return {
        text: estadoVelocidad.text,
        className: estadoVelocidad.className,
      };
    }
  }

  return {
    text: window.TEXTOS_ACTUAL.velocidad.EXTREME_RISK,
    className: 'status-extreme-risk',
  };
}
function ordenarServiciosPersonalizado(servicios) {
  // Los servicios con orden=1 siempre aparecen primero (servicios críticos)
  // El resto se ordenan alfabéticamente para facilitar la búsqueda
  const fijos = servicios.filter((servicio) => servicio.orden === 1);
  const ordenables = servicios.filter((servicio) => servicio.orden !== 1);

  ordenables.sort((a, b) => {
    const nombreA = a.nombre.toUpperCase();
    const nombreB = b.nombre.toUpperCase();
    if (nombreA < nombreB) return -1;
    if (nombreA > nombreB) return 1;
    return 0;
  });

  return fijos.concat(ordenables);
}

function cargarHistorial() {
  const data = sessionStorage.getItem('monitorStatusHistorial');
  if (data) {
    historialStatus = JSON.parse(data);
  }
}

function guardarHistorial() {
  sessionStorage.setItem(
    'monitorStatusHistorial',
    JSON.stringify(historialStatus)
  );
}

function actualizarHistorial(url, time, status) {
  if (!historialStatus[url]) {
    historialStatus[url] = [];
  }

  historialStatus[url].push({ time, status, timestamp: Date.now() });

  if (historialStatus[url].length > maxHistorialActual) {
    historialStatus[url].shift();
  }

  guardarHistorial();
}

function calcularPromedio(url) {
  const historial = historialStatus[url] || [];

  if (historial.length === 0) {
    return {
      promedio: 0,
      estadoPromedio: obtenerEstadoVisual(0, 200),
      validCount: 0,
      historial: historial,
    };
  }

  let totalTime = 0;
  let validCount = 0;
  let fallos = 0;
  let ultimoCodigoError = 200;

  historial.forEach((entry) => {
    const esFallo =
      entry.status !== 200 ||
      entry.time >= UMBRALES_LATENCIA.PENALIZACION_FALLO;

    if (esFallo) {
      fallos++;
      ultimoCodigoError = entry.status;
      totalTime += UMBRALES_LATENCIA.PENALIZACION_FALLO;
    } else {
      totalTime += entry.time;
    }

    validCount++;
  });

  const promedioMs = validCount > 0 ? Math.round(totalTime / validCount) : 0;

  if (fallos / validCount > 0.5 && validCount > 3) {
    return {
      promedio: promedioMs,
      estadoPromedio: obtenerEstadoVisual(
        UMBRALES_LATENCIA.PENALIZACION_FALLO + 1,
        ultimoCodigoError
      ),
      validCount: validCount,
      historial: historial,
    };
  }

  return {
    promedio: promedioMs,
    estadoPromedio: obtenerEstadoVisual(promedioMs, 200),
    validCount: validCount,
    historial: historial,
  };
}

function mostrarAdvertenciaGlobal(esFalloCritico, motivoFallo = '') {
  const infoBar = document.getElementById('info-bar-msg');

  if (esFalloCritico) {
    let mensajeBase =
      window.TEXTOS_ACTUAL.general.ADVERTENCIA_FALLO_GLOBAL_HTML;

    if (temaProActivo && motivoFallo) {
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

function determinarFalloGlobal(websitesData, resultados) {
  if (resultados.length === 0 || websitesData.length === 0) {
    return {
      esFallo: true,
      motivo: window.TEXTOS_ACTUAL.general.FALLO_CRITICO_RED,
    };
  }

  let totalSitios = websitesData.length;
  let sitiosEnFalloCritico = 0;
  let motivoFallo = '';

  const resultadosMap = resultados.reduce((map, item) => {
    map[item.url] = item;
    return map;
  }, {});

  const sitiosCriticos = websitesData.filter(
    (web) => web.grupo === GRUPO_CRITICO_NOMBRE
  );
  let criticosConFalloExtremo = 0;

  if (sitiosCriticos.length > 0) {
    sitiosCriticos.forEach((web) => {
      const res = resultadosMap[web.url];
      if (res && res.time > UMBRAL_FALLO_GLOBAL_MS) {
        criticosConFalloExtremo++;
      }
    });

    if (
      criticosConFalloExtremo === sitiosCriticos.length &&
      sitiosCriticos.length > 0
    ) {
      console.warn(
        `Alerta Global: Fallo del 100% en el grupo crítico "${GRUPO_CRITICO_NOMBRE}".`
      );
      motivoFallo = `${window.TEXTOS_ACTUAL.general.FALLO_CRITICO_GRUPO} "${GRUPO_CRITICO_NOMBRE}".`;
      return { esFallo: true, motivo: motivoFallo };
    }
  }

  resultados.forEach((res) => {
    if (res.time > UMBRAL_FALLO_GLOBAL_MS) {
      sitiosEnFalloCritico++;
    }
  });

  const porcentajeFallo = sitiosEnFalloCritico / totalSitios;
  const falloPorPorcentaje = porcentajeFallo >= PORCENTAJE_FALLO_GLOBAL;

  if (falloPorPorcentaje) {
    const porcentaje = Math.round(porcentajeFallo * 100);
    console.warn(
      `Alerta Global: ${porcentaje}% de los servicios superaron el umbral de ${UMBRAL_FALLO_GLOBAL_MS}ms.`
    );
    motivoFallo = `${porcentaje}${window.TEXTOS_ACTUAL.general.FALLO_CRITICO_LATENCIA_PARTE1} ${UMBRAL_FALLO_GLOBAL_MS}ms.`;
    return { esFallo: true, motivo: motivoFallo };
  }

  return { esFallo: false, motivo: '' };
}

// =======================================================
// 5. LÓGICA PRINCIPAL DE MONITOREO Y RENDERING ASÍNCRONO
// =======================================================

/**
 * Llama al proxy Netlify para obtener el estado y latencia de una URL.
 */
async function verificarEstado(url) {
  try {
    const response = await fetch(
      `${PROXY_ENDPOINT}?url=${encodeURIComponent(url)}`
    );

    if (!response.ok) {
      console.error(
        `${window.TEXTOS_ACTUAL.estados.DOWN_ERROR} en la función Serverless para ${url}: ${response.status}`
      );
      // Retornamos un objeto en lugar de lanzar error para que Promise.allSettled
      // trate todos los servicios de forma consistente
      return {
        time: UMBRALES_LATENCIA.PENALIZACION_FALLO,
        status: ESTADO_ERROR_CONEXION,
      };
    }

    const data = await response.json();
    return data; // Retorna {time, status}
  } catch (error) {
    console.error(
      `${window.TEXTOS_ACTUAL.estados.DOWN_ERROR} al conectar con el proxy para ${url}:`,
      error
    );
    return {
      time: UMBRALES_LATENCIA.PENALIZACION_FALLO,
      status: ESTADO_ERROR_CONEXION,
    };
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
  servicios.forEach((web) => {
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
    aplicarAccesibilidadEstadoEnFila(row, {
      actual: window.TEXTOS_ACTUAL.general.LOADING,
      promedio: window.TEXTOS_ACTUAL.general.LOADING,
    });
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

  const actualText =
    labels.actual !== undefined
      ? labels.actual
      : statusActual
      ? statusActual.textContent.trim()
      : '';
  const promText =
    labels.promedio !== undefined
      ? labels.promedio
      : statusProm
      ? statusProm.textContent.trim()
      : '';

  if (statusActual) {
    statusActual.setAttribute('role', 'status');
    statusActual.setAttribute(
      'aria-label',
      actualText || window.TEXTOS_ACTUAL.general.LOADING
    );
  }
  if (statusProm) {
    statusProm.setAttribute('role', 'status');
    statusProm.setAttribute(
      'aria-label',
      promText || window.TEXTOS_ACTUAL.general.LOADING
    );
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
  aplicarAccesibilidadEstadoEnFila(row, {
    actual: estadoActual.text,
    promedio: estadoPromedio.text,
  });

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
    console.error('Error al cargar webs.json.', e);
    actualizarUltimaActualizacion(new Date());
    window.monitorTimeout = setTimeout(
      monitorearTodosWebsites,
      FRECUENCIA_MONITOREO_MS
    );
    return;
  }

  if (websitesData.length === 0) {
    actualizarUltimaActualizacion(new Date());
    window.monitorTimeout = setTimeout(
      monitorearTodosWebsites,
      FRECUENCIA_MONITOREO_MS
    );
    return;
  }

  // DIBUJAR PLACEHOLDERS y establecer 'Cargando...'
  websitesData = ordenarServiciosPersonalizado(websitesData);
  dibujarFilasIniciales(websitesData);
  actualizarUltimaActualizacion(null);

  // Usamos Promise.allSettled en lugar de Promise.all para que un servicio caído
  // no interrumpa el monitoreo de los demás servicios
  const promesas = websitesData.map((web) => verificarEstado(web.url));
  const allResults = await Promise.allSettled(promesas);

  // Mapear resultados finales a un formato simple para el análisis de Fallo Global
  const resultadosMonitoreo = [];
  allResults.forEach((result, index) => {
    const web = websitesData[index];
    let res;

    if (result.status === 'fulfilled') {
      res = result.value;
    } else {
      // Penalizamos con PENALIZACION_FALLO para que los errores de red
      // aparezcan claramente como servicios caídos en la UI
      res = {
        time: UMBRALES_LATENCIA.PENALIZACION_FALLO,
        status: ESTADO_ERROR_CONEXION,
      };
    }

    // Agregar al array para el análisis global
    resultadosMonitoreo.push({
      url: web.url,
      time: res.time,
      status: res.status,
    });
  });

  // =======================================================
  // 3. LÓGICA DE FALLO GLOBAL
  // =======================================================
  //const esFalloCritico = determinarFalloGlobal(websitesData, resultadosMonitoreo);
  const { esFallo: esFalloCritico, motivo: motivoFallo } =
    determinarFalloGlobal(websitesData, resultadosMonitoreo);
  mostrarAdvertenciaGlobal(esFalloCritico);

  if (allResults.every((r) => r.status === 'rejected')) {
    mostrarAdvertenciaGlobal(
      true,
      'Fallo total de red: El proxy no respondió para ningún sitio.'
    );
  } else {
    mostrarAdvertenciaGlobal(esFalloCritico, motivoFallo);
  }

  if (esFalloCritico) {
    console.warn(
      'Se detectó un Fallo Global Crítico. Se omite la actualización de la tabla y historial con estos datos. El usuario verá el aviso.'
    );

    // Solo actualizamos el timestamp. La tabla mantiene los datos del historial ANTERIOR
    actualizarUltimaActualizacion(new Date());

    // Programar la próxima ejecución y retornar
    window.monitorTimeout = setTimeout(
      monitorearTodosWebsites,
      FRECUENCIA_MONITOREO_MS
    );
    return;
  }

  // =======================================================
  // 4. SI NO ES CRÍTICO, APLICAR DATOS Y ACTUALIZAR UI NORMALMENTE
  // =======================================================
  let maxValidCount = 0;

  // Recorrer los resultados exitosos y actualizar el historial y la tabla
  resultadosMonitoreo.forEach((res) => {
    const web = websitesData.find((w) => w.url === res.url);

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
  window.monitorTimeout = setTimeout(
    monitorearTodosWebsites,
    FRECUENCIA_MONITOREO_MS
  );
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
    temaProActivo = temaFinal !== TEMA_DEFAULT;
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
    inicializarSelectorDuracion(); // Inicializar selector de duración

    // 3. Iniciar el monitoreo
    monitorearTodosWebsites();
  } catch (e) {
    console.error('Fallo crítico: No se pudo cargar el idioma.', e);
    document.getElementById(
      'info-bar-msg'
    ).textContent = `ERROR: No se pudo cargar el idioma. Verifique la consola.`;
  }
});
