// app.js - Aplicación principal mejorada
import { StorageManager } from './modules/storage.js';
import { Analytics } from './modules/analytics.js';
import { UIManager } from './modules/ui.js';
import { MonitorService } from './modules/monitor.js';
import { FilterManager } from './modules/filters.js';
import { ExportManager } from './modules/export-manager.js';

class MonitorApp {
  constructor() {
    this.storage = new StorageManager();
    this.analytics = null; // Se inicializa cuando tengamos UMBRALES_LATENCIA
    this.ui = null; // Se inicializa cuando tengamos TEXTOS_ACTUAL
    this.monitor = null;
    this.filters = null;
    this.exportManager = null;

    this.websitesData = [];
    this.historialStatus = {};
    this.maxHistorialActual = MAX_HISTORIAL_ENTRIES;
    this.temaProActivo = false;
  }

  /**
   * Inicializa la aplicación
   */
  async inicializar() {
    try {
      // 1. Inicializar tema
      await this.inicializarTema();

      // 2. Cargar historial
      this.historialStatus = this.storage.cargarHistorial();

      // 3. Configurar enlace leyenda
      this.configurarEnlaceLeyenda();

      // 4. Cargar idioma
      await cargarIdioma();

      // 5. Inicializar módulos (ahora que tenemos textos)
      this.analytics = new Analytics(UMBRALES_LATENCIA);
      this.ui = new UIManager(window.TEXTOS_ACTUAL);
      this.monitor = new MonitorService({
        PROXY_ENDPOINT,
        UMBRALES: UMBRALES_LATENCIA,
        UMBRAL_FALLO_GLOBAL_MS,
        PORCENTAJE_FALLO_GLOBAL,
      });
      this.filters = new FilterManager(window.TEXTOS_ACTUAL);
      this.exportManager = new ExportManager(
        this.storage,
        window.TEXTOS_ACTUAL
      );

      // Hacer UI disponible globalmente para notificaciones
      window.uiManager = this.ui;

      // 6. Inicializar elementos de la UI
      this.inicializarEtiquetas();
      this.inicializarSelectorDuracion();

      // 7. Inicializar filtros y búsqueda
      const container = document.querySelector('.container');
      if (container) {
        this.filters.inicializarControles(container);
        this.filters.habilitarOrdenamiento();
      }

      // 8. Inicializar exportación
      this.exportManager.inicializarBotones();

      // 9. Registrar Service Worker (PWA)
      this.registrarServiceWorker();

      // 10. Verificar si iniciar monitoreo o mostrar datos guardados
      if (this.historialCompleto()) {
        console.log('Historial completo. Mostrando datos guardados.');
        await this.cargarYMostrarHistorialExistente();
        this.ui.mostrarNotificacion(
          'Mostrando datos guardados. El próximo monitoreo será en 5 minutos.',
          'info',
          5000
        );
      } else {
        await this.monitorearTodosWebsites();
      }
    } catch (error) {
      console.error('Error crítico al inicializar:', error);
      this.ui?.mostrarNotificacion(
        'Error al inicializar la aplicación. Revisa la consola.',
        'error',
        10000
      );
    }
  }

  /**
   * Registra Service Worker para PWA
   */
  async registrarServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register(
          '/service-worker.js'
        );
        console.log('[PWA] Service Worker registrado:', registration.scope);

        // Verificar actualizaciones
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              this.ui.mostrarNotificacion(
                'Nueva versión disponible. Recarga la página para actualizar.',
                'info',
                10000
              );
            }
          });
        });
      } catch (error) {
        console.warn('[PWA] Error al registrar Service Worker:', error);
      }
    }
  }

  /**
   * Monitorea todos los servicios
   */
  async monitorearTodosWebsites() {
    // Cancelar monitoreo anterior
    this.monitor.cancelarMonitoreo();

    // Cargar servicios
    try {
      const response = await fetch('data/webs.json');
      this.websitesData = await response.json();
    } catch (e) {
      console.error('Error al cargar webs.json:', e);
      this.ui.mostrarNotificacion(
        'Error al cargar lista de servicios',
        'error'
      );

      // Reintentar en 5 minutos
      this.monitor.programarProximoMonitoreo(
        () => this.monitorearTodosWebsites(),
        FRECUENCIA_MONITOREO_MS
      );
      return;
    }

    if (this.websitesData.length === 0) {
      this.ui.mostrarNotificacion('No hay servicios configurados', 'warning');
      return;
    }

    // Ordenar servicios
    this.websitesData = this.ordenarServiciosPersonalizado(this.websitesData);

    // Dibujar skeleton loaders
    this.dibujarSkeletonRows(this.websitesData);
    this.actualizarUltimaActualizacion(null);

    // Monitorear con barra de progreso
    const resultados = await this.monitor.monitorearServicios(
      this.websitesData,
      (actual, total) => {
        this.ui.actualizarProgreso(actual, total);
      }
    );

    // Procesar resultados
    await this.procesarResultados(resultados);

    // Aplicar filtros si hay activos
    if (this.filters) {
      this.filters.aplicarFiltros();
    }

    // Programar próximo monitoreo
    this.monitor.programarProximoMonitoreo(
      () => this.monitorearTodosWebsites(),
      FRECUENCIA_MONITOREO_MS
    );
  }

  /**
   * Dibuja skeleton loaders
   */
  dibujarSkeletonRows(servicios) {
    const tbody = document.getElementById('status-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    servicios.forEach((servicio) => {
      const row = this.ui.crearSkeletonRow();
      row.dataset.url = servicio.url;
      row.dataset.grupo = (servicio.grupo || '').toLowerCase();
      tbody.appendChild(row);
    });
  }

  /**
   * Procesa resultados del monitoreo
   */
  async procesarResultados(resultados) {
    const ahora = Date.now();

    // Guardar en historial
    resultados.forEach((resultado) => {
      if (!this.historialStatus[resultado.url]) {
        this.historialStatus[resultado.url] = [];
      }

      this.historialStatus[resultado.url].push({
        time: resultado.time,
        status: resultado.status,
        timestamp: ahora,
      });

      // Limitar tamaño del historial
      if (
        this.historialStatus[resultado.url].length > this.maxHistorialActual
      ) {
        this.historialStatus[resultado.url].shift();
      }
    });

    this.storage.guardarHistorial(this.historialStatus);

    // Actualizar UI
    this.actualizarTablaConResultados(resultados);
    this.actualizarUltimaActualizacion(new Date(ahora));

    // Detectar fallo global
    const falloGlobal = this.monitor.detectarFalloGlobal(
      this.websitesData,
      resultados
    );
    this.mostrarAdvertenciaGlobal(falloGlobal);

    // Mostrar estadísticas
    const stats = this.monitor.obtenerEstadisticasMonitoreo(resultados);
    console.log('📊 Estadísticas:', stats);

    // Notificación de resumen
    if (stats.fallidos > 0) {
      this.ui.mostrarNotificacion(
        `Monitoreo completado: ${stats.fallidos} servicio(s) con problemas`,
        'warning',
        5000
      );
    }
  }

  /**
   * Actualiza tabla con resultados
   */
  actualizarTablaConResultados(resultados) {
    const tbody = document.getElementById('status-table-body');
    if (!tbody) return;

    resultados.forEach((resultado) => {
      const row = tbody.querySelector(`tr[data-url="${resultado.url}"]`);
      if (!row) return;

      const servicio = this.websitesData.find((s) => s.url === resultado.url);
      if (!servicio) return;

      // Limpiar skeleton
      row.classList.remove('skeleton-row');
      row.innerHTML = '';

      // Calcular estadísticas
      const mediciones = this.historialStatus[resultado.url] || [];
      const stats = this.analytics.calcularEstadisticas(mediciones);
      const clasificacionActual = this.analytics.clasificarVelocidad(
        resultado.time,
        resultado.status
      );
      const clasificacionPromedio = this.analytics.clasificarVelocidad(
        stats.promedio,
        200
      );
      const salud = this.analytics.calcularPuntuacionSalud(mediciones);
      const sparklineData = this.analytics.generarSparklineData(mediciones);

      // Columna 1: Nombre con link
      const cellNombre = row.insertCell();
      cellNombre.innerHTML = `<a href="${this.ui.sanitizeHTML(
        resultado.url
      )}" target="_blank" rel="noopener noreferrer">${this.ui.sanitizeHTML(
        servicio.nombre
      )}</a>`;

      // Columna 2: URL (oculta)
      const cellURL = row.insertCell();
      cellURL.innerHTML = `<a href="${resultado.url}" target="_blank" rel="noopener noreferrer">${resultado.url}</a>`;

      // Columna 3: Latencia actual con sparkline
      const cellLatencia = row.insertCell();
      cellLatencia.innerHTML = `${resultado.time} ms ${this.ui.crearSparkline(
        sparklineData,
        80,
        25
      )}`;

      // Columna 4: Estado actual
      const cellEstadoActual = row.insertCell();
      cellEstadoActual.textContent =
        window.TEXTOS_ACTUAL.velocidad[
          clasificacionActual.nivel.toUpperCase().replace('-', '_')
        ] || clasificacionActual.nivel;
      cellEstadoActual.className = clasificacionActual.clase;

      // Columna 5: Promedio con badge de salud
      const cellPromedio = row.insertCell();
      const contadorErrores =
        stats.fallidas > 0 ? ` ⚠️ ${stats.fallidas}/${mediciones.length}` : '';
      cellPromedio.innerHTML = `${
        stats.promedio
      } ms${contadorErrores} ${this.ui.crearBadgeSalud(salud)}`;

      // Columna 6: Estado promedio
      const cellEstadoPromedio = row.insertCell();
      cellEstadoPromedio.textContent =
        window.TEXTOS_ACTUAL.velocidad[
          clasificacionPromedio.nivel.toUpperCase().replace('-', '_')
        ] || clasificacionPromedio.nivel;
      cellEstadoPromedio.className = clasificacionPromedio.clase;

      // Columna 7: Acciones
      const cellAcciones = row.insertCell();
      let accionesHTML = '';

      if (stats.fallidas > 0) {
        accionesHTML += `<button class="toggle-errors-button" onclick="window.app.toggleErroresDetalle('${resultado.url.replace(
          /'/g,
          "\\'"
        )}')">▼</button> `;
      }

      accionesHTML += `<button class="psi-button" onclick="window.open('https://pagespeed.web.dev/report?url=${resultado.url}', '_blank')">PSI</button>`;
      cellAcciones.innerHTML = accionesHTML;

      // Tooltip detallado
      this.ui.crearTooltipDetallado(row, {
        latencia: resultado.time,
        estadoHTTP: resultado.status,
        tasaExito: stats.tasaExito,
        ultimaActualizacion: this.ui.formatearTiempoRelativo(ahora),
      });
    });
  }

  /**
   * Toggle detalles de errores
   */
  toggleErroresDetalle(url) {
    // Implementación existente...
    console.log('Toggle errores para:', url);
  }

  /**
   * Muestra advertencia global
   */
  mostrarAdvertenciaGlobal(fallo) {
    const infoBar = document.getElementById('info-bar-msg');
    if (!infoBar) return;

    if (fallo.esFallo) {
      infoBar.innerHTML = `<strong>🚨 ${window.TEXTOS_ACTUAL.general.ADVERTENCIA_FALLO_GLOBAL_HTML}🚨</strong><br><small>${fallo.motivo}</small>`;
      infoBar.classList.add('error-critical');

      this.ui.mostrarNotificacion(
        `Fallo crítico detectado: ${fallo.motivo}`,
        'error',
        10000
      );
    } else {
      infoBar.textContent = window.TEXTOS_ACTUAL.general.INFO_BAR;
      infoBar.classList.remove('error-critical');
    }
  }

  // ... resto de métodos (ordenarServiciosPersonalizado, configurarEnlaceLeyenda, etc.)
  // Se mantienen las implementaciones existentes
}

// Iniciar aplicación cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.app = new MonitorApp();
    window.app.inicializar();
  });
} else {
  window.app = new MonitorApp();
  window.app.inicializar();
}

// Exportar para uso en consola
export default MonitorApp;
