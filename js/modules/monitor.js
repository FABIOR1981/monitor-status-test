// monitor.js - Lógica de monitoreo y verificación de servicios
export class MonitorService {
  constructor(config) {
    this.config = config;
    this.isMonitoring = false;
    this.monitorTimeout = null;
    this.abortControllers = new Map();
  }

  /**
   * Verifica estado de una URL con timeout y retry
   */
  async verificarEstado(url, intentosRestantes = 2) {
    const controller = new AbortController();
    this.abortControllers.set(url, controller);

    try {
      const timeoutId = setTimeout(() => controller.abort(), 9000);

      const response = await fetch(
        `${this.config.PROXY_ENDPOINT}?url=${encodeURIComponent(url)}`,
        { signal: controller.signal }
      );

      clearTimeout(timeoutId);
      this.abortControllers.delete(url);

      if (!response.ok) {
        console.warn(
          `Error en función serverless para ${url}: ${response.status}`
        );

        // Retry si quedan intentos
        if (intentosRestantes > 0) {
          await this.esperar(1000); // Esperar 1 segundo antes de reintentar
          return this.verificarEstado(url, intentosRestantes - 1);
        }

        return {
          time: this.config.UMBRALES.PENALIZACION_FALLO,
          status: 0,
          error: `Error ${response.status}`,
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      this.abortControllers.delete(url);

      if (error.name === 'AbortError') {
        console.warn(`Timeout para ${url}`);
      } else {
        console.error(`Error al verificar ${url}:`, error);
      }

      // Retry si quedan intentos
      if (intentosRestantes > 0 && error.name !== 'AbortError') {
        await this.esperar(1000);
        return this.verificarEstado(url, intentosRestantes - 1);
      }

      return {
        time: this.config.UMBRALES.PENALIZACION_FALLO,
        status: 0,
        error: error.message,
      };
    }
  }

  /**
   * Monitorea todos los servicios con ejecución paralela limitada
   */
  async monitorearServicios(servicios, onProgress, maxConcurrentes = 5) {
    const resultados = [];
    const cola = [...servicios];
    let completados = 0;

    // Ejecutar en lotes para evitar saturar el servidor
    while (cola.length > 0) {
      const lote = cola.splice(0, maxConcurrentes);

      const promesas = lote.map(async (servicio) => {
        const resultado = await this.verificarEstado(servicio.url);
        completados++;

        if (onProgress) {
          onProgress(completados, servicios.length);
        }

        return {
          url: servicio.url,
          nombre: servicio.nombre,
          grupo: servicio.grupo,
          ...resultado,
        };
      });

      const resultadosLote = await Promise.allSettled(promesas);

      resultadosLote.forEach((result) => {
        if (result.status === 'fulfilled') {
          resultados.push(result.value);
        } else {
          console.error('Error en monitoreo:', result.reason);
        }
      });
    }

    return resultados;
  }

  /**
   * Cancela monitoreo en curso
   */
  cancelarMonitoreo() {
    if (this.monitorTimeout) {
      clearTimeout(this.monitorTimeout);
      this.monitorTimeout = null;
    }

    // Abortar todas las peticiones en curso
    this.abortControllers.forEach((controller) => controller.abort());
    this.abortControllers.clear();

    this.isMonitoring = false;
  }

  /**
   * Programa próximo monitoreo
   */
  programarProximoMonitoreo(callback, frecuencia) {
    this.monitorTimeout = setTimeout(() => {
      callback();
    }, frecuencia);
  }

  /**
   * Detecta fallo global en el sistema
   */
  detectarFalloGlobal(servicios, resultados) {
    if (!resultados || resultados.length === 0) {
      return {
        esFallo: true,
        motivo: 'No se obtuvieron resultados del monitoreo',
        criticidad: 'alta',
      };
    }

    const serviciosCriticos = servicios.filter((s) => s.grupo === 'CRITICO');
    const resultadosCriticos = resultados.filter((r) =>
      serviciosCriticos.some((s) => s.url === r.url)
    );

    // Fallo crítico: 100% de servicios críticos caídos
    const criticosCaidos = resultadosCriticos.filter(
      (r) => r.status !== 200 || r.time >= this.config.UMBRAL_FALLO_GLOBAL_MS
    );

    if (
      serviciosCriticos.length > 0 &&
      criticosCaidos.length === serviciosCriticos.length
    ) {
      return {
        esFallo: true,
        motivo: `Fallo total en grupo CRITICO (${criticosCaidos.length}/${serviciosCriticos.length})`,
        criticidad: 'critica',
      };
    }

    // Fallo alto: >80% de todos los servicios caídos
    const totalCaidos = resultados.filter(
      (r) => r.status !== 200 || r.time >= this.config.UMBRAL_FALLO_GLOBAL_MS
    );

    const porcentajeFallo = totalCaidos.length / resultados.length;

    if (porcentajeFallo >= this.config.PORCENTAJE_FALLO_GLOBAL) {
      return {
        esFallo: true,
        motivo: `${Math.round(
          porcentajeFallo * 100
        )}% de servicios con fallo o latencia >9s`,
        criticidad: 'alta',
      };
    }

    return { esFallo: false, motivo: '', criticidad: 'ninguna' };
  }

  /**
   * Espera promisificada
   */
  esperar(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Obtiene estadísticas del monitoreo
   */
  obtenerEstadisticasMonitoreo(resultados) {
    return {
      total: resultados.length,
      exitosos: resultados.filter((r) => r.status === 200).length,
      fallidos: resultados.filter((r) => r.status !== 200).length,
      lentos: resultados.filter((r) => r.time > this.config.UMBRALES.LENTO)
        .length,
      promedioLatencia: Math.round(
        resultados.reduce((sum, r) => sum + (r.time < 99999 ? r.time : 0), 0) /
          resultados.length
      ),
    };
  }
}
