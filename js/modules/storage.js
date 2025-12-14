// storage.js - Gestión de localStorage y historial
export class StorageManager {
  constructor() {
    this.HISTORIAL_KEY = 'historialStatus';
    this.DURACION_KEY = 'duracionMonitoreo';
    this.TEMA_KEY = 'temaPreferido';
    this.IDIOMA_KEY = 'idiomaPreferido';
  }

  // Historial
  cargarHistorial() {
    try {
      const guardado = localStorage.getItem(this.HISTORIAL_KEY);
      return guardado ? JSON.parse(guardado) : {};
    } catch (e) {
      console.error('Error al cargar historial:', e);
      return {};
    }
  }

  guardarHistorial(historial) {
    try {
      localStorage.setItem(this.HISTORIAL_KEY, JSON.stringify(historial));
      return true;
    } catch (e) {
      console.error('Error al guardar historial:', e);
      return false;
    }
  }

  limpiarHistorial() {
    localStorage.removeItem(this.HISTORIAL_KEY);
  }

  // Duración
  obtenerDuracion() {
    return localStorage.getItem(this.DURACION_KEY);
  }

  guardarDuracion(duracion) {
    localStorage.setItem(this.DURACION_KEY, duracion);
  }

  // Tema
  obtenerTema() {
    return localStorage.getItem(this.TEMA_KEY);
  }

  guardarTema(tema) {
    localStorage.setItem(this.TEMA_KEY, tema);
  }

  // Idioma
  obtenerIdioma() {
    return localStorage.getItem(this.IDIOMA_KEY);
  }

  guardarIdioma(idioma) {
    localStorage.setItem(this.IDIOMA_KEY, idioma);
  }

  // Exportar datos
  exportarDatos(formato = 'json') {
    const historial = this.cargarHistorial();
    const fecha = new Date().toISOString().split('T')[0];

    if (formato === 'json') {
      return {
        data: JSON.stringify(historial, null, 2),
        filename: `monitor-historial-${fecha}.json`,
        mimeType: 'application/json',
      };
    } else if (formato === 'csv') {
      let csv = 'URL,Fecha,Latencia(ms),Estado HTTP\n';

      Object.keys(historial).forEach((url) => {
        historial[url].forEach((medicion) => {
          const fecha = new Date(medicion.timestamp).toISOString();
          csv += `"${url}","${fecha}",${medicion.time},${medicion.status}\n`;
        });
      });

      return {
        data: csv,
        filename: `monitor-historial-${fecha}.csv`,
        mimeType: 'text/csv',
      };
    }
  }

  // Estadísticas de uso
  obtenerEstadisticas() {
    const historial = this.cargarHistorial();
    const stats = {
      totalServicios: Object.keys(historial).length,
      totalMediciones: 0,
      rangoFechas: { inicio: null, fin: null },
    };

    Object.values(historial).forEach((mediciones) => {
      stats.totalMediciones += mediciones.length;

      mediciones.forEach((m) => {
        if (
          !stats.rangoFechas.inicio ||
          m.timestamp < stats.rangoFechas.inicio
        ) {
          stats.rangoFechas.inicio = m.timestamp;
        }
        if (!stats.rangoFechas.fin || m.timestamp > stats.rangoFechas.fin) {
          stats.rangoFechas.fin = m.timestamp;
        }
      });
    });

    return stats;
  }
}
