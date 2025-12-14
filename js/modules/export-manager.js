// export-manager.js - Gestión de exportación de datos
export class ExportManager {
  constructor(storageManager, textos) {
    this.storage = storageManager;
    this.textos = textos;
  }

  /**
   * Inicializa botones de exportación
   */
  inicializarBotones() {
    const btnJSON = document.getElementById('export-json');
    const btnCSV = document.getElementById('export-csv');

    if (btnJSON) {
      btnJSON.addEventListener('click', () => this.exportar('json'));
    }

    if (btnCSV) {
      btnCSV.addEventListener('click', () => this.exportar('csv'));
    }
  }

  /**
   * Exporta datos en el formato especificado
   */
  exportar(formato) {
    const datos = this.storage.exportarDatos(formato);

    if (!datos) {
      this.mostrarError('No hay datos para exportar');
      return;
    }

    this.descargarArchivo(datos.data, datos.filename, datos.mimeType);
    this.mostrarExito(
      `Archivo ${formato.toUpperCase()} descargado correctamente`
    );
  }

  /**
   * Exporta datos con filtros aplicados
   */
  exportarConFiltros(serviciosFiltrados, formato = 'json') {
    const historial = this.storage.cargarHistorial();
    const datosFiltrados = {};

    serviciosFiltrados.forEach((servicio) => {
      if (historial[servicio.url]) {
        datosFiltrados[servicio.url] = historial[servicio.url];
      }
    });

    const fecha = new Date().toISOString().split('T')[0];

    if (formato === 'json') {
      const data = JSON.stringify(datosFiltrados, null, 2);
      this.descargarArchivo(
        data,
        `monitor-filtrado-${fecha}.json`,
        'application/json'
      );
    } else if (formato === 'csv') {
      let csv = 'URL,Nombre,Fecha,Latencia(ms),Estado HTTP,Grupo\n';

      serviciosFiltrados.forEach((servicio) => {
        const mediciones = datosFiltrados[servicio.url] || [];
        mediciones.forEach((m) => {
          const fechaMed = new Date(m.timestamp).toISOString();
          csv += `"${servicio.url}","${servicio.nombre}","${fechaMed}",${
            m.time
          },${m.status},"${servicio.grupo || ''}"\n`;
        });
      });

      this.descargarArchivo(csv, `monitor-filtrado-${fecha}.csv`, 'text/csv');
    }
  }

  /**
   * Genera reporte de estadísticas
   */
  exportarReporteEstadisticas(analytics, servicios, historial) {
    const reporte = {
      generado: new Date().toISOString(),
      resumen: {
        totalServicios: servicios.length,
        serviciosCriticos: servicios.filter((s) => s.grupo === 'CRITICO')
          .length,
        periodo: this.calcularPeriodo(historial),
      },
      servicios: [],
    };

    servicios.forEach((servicio) => {
      const mediciones = historial[servicio.url] || [];
      const stats = analytics.calcularEstadisticas(mediciones);
      const salud = analytics.calcularPuntuacionSalud(mediciones);

      reporte.servicios.push({
        nombre: servicio.nombre,
        url: servicio.url,
        grupo: servicio.grupo || 'NORMAL',
        puntuacionSalud: salud,
        estadisticas: {
          promedioLatencia: stats.promedio,
          latenciaMin: stats.min,
          latenciaMax: stats.max,
          medicionesExitosas: stats.exitosas,
          medicionesFallidas: stats.fallidas,
          tasaExito: stats.tasaExito + '%',
          tendencia: stats.tendencia,
        },
        totalMediciones: mediciones.length,
      });
    });

    const fecha = new Date().toISOString().split('T')[0];
    const data = JSON.stringify(reporte, null, 2);

    this.descargarArchivo(
      data,
      `reporte-monitor-${fecha}.json`,
      'application/json'
    );

    this.mostrarExito('Reporte de estadísticas generado');
  }

  /**
   * Exporta solo errores
   */
  exportarErrores(historial, formato = 'csv') {
    const errores = [];

    Object.keys(historial).forEach((url) => {
      historial[url].forEach((medicion) => {
        if (medicion.status !== 200) {
          errores.push({
            url,
            fecha: new Date(medicion.timestamp).toISOString(),
            latencia: medicion.time,
            estadoHTTP: medicion.status,
          });
        }
      });
    });

    if (errores.length === 0) {
      this.mostrarError('No se encontraron errores en el historial');
      return;
    }

    const fecha = new Date().toISOString().split('T')[0];

    if (formato === 'csv') {
      let csv = 'URL,Fecha,Latencia(ms),Estado HTTP\n';
      errores.forEach((e) => {
        csv += `"${e.url}","${e.fecha}",${e.latencia},${e.estadoHTTP}\n`;
      });

      this.descargarArchivo(csv, `monitor-errores-${fecha}.csv`, 'text/csv');
    } else {
      const data = JSON.stringify(errores, null, 2);
      this.descargarArchivo(
        data,
        `monitor-errores-${fecha}.json`,
        'application/json'
      );
    }

    this.mostrarExito(`${errores.length} errores exportados`);
  }

  /**
   * Descarga archivo
   */
  descargarArchivo(contenido, nombreArchivo, tipoMIME) {
    const blob = new Blob([contenido], { type: tipoMIME });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Liberar memoria
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  /**
   * Calcula período de datos
   */
  calcularPeriodo(historial) {
    let min = null;
    let max = null;

    Object.values(historial).forEach((mediciones) => {
      mediciones.forEach((m) => {
        if (!min || m.timestamp < min) min = m.timestamp;
        if (!max || m.timestamp > max) max = m.timestamp;
      });
    });

    return {
      inicio: min ? new Date(min).toISOString() : null,
      fin: max ? new Date(max).toISOString() : null,
    };
  }

  /**
   * Muestra mensaje de éxito
   */
  mostrarExito(mensaje) {
    // Usar sistema de notificaciones si está disponible
    if (window.uiManager && window.uiManager.mostrarNotificacion) {
      window.uiManager.mostrarNotificacion(mensaje, 'success');
    } else {
      console.log('✓ ' + mensaje);
    }
  }

  /**
   * Muestra mensaje de error
   */
  mostrarError(mensaje) {
    if (window.uiManager && window.uiManager.mostrarNotificacion) {
      window.uiManager.mostrarNotificacion(mensaje, 'error');
    } else {
      console.error('✗ ' + mensaje);
    }
  }
}
