// analytics.js - Cálculos y análisis de métricas
export class Analytics {
  constructor(umbrales) {
    this.UMBRALES = umbrales;
  }

  /**
   * Calcula estadísticas de un historial de mediciones
   */
  calcularEstadisticas(mediciones) {
    if (!mediciones || mediciones.length === 0) {
      return {
        promedio: 0,
        min: 0,
        max: 0,
        exitosas: 0,
        fallidas: 0,
        tasaExito: 0,
        tendencia: 'neutral',
      };
    }

    const exitosas = mediciones.filter(
      (m) => m.status === 200 && m.time < this.UMBRALES.PENALIZACION_FALLO
    );
    const fallidas = mediciones.filter(
      (m) => m.status !== 200 || m.time >= this.UMBRALES.PENALIZACION_FALLO
    );

    const tiemposExitosos = exitosas.map((m) => m.time);
    const promedio =
      tiemposExitosos.length > 0
        ? tiemposExitosos.reduce((a, b) => a + b, 0) / tiemposExitosos.length
        : 0;

    const min = tiemposExitosos.length > 0 ? Math.min(...tiemposExitosos) : 0;
    const max = tiemposExitosos.length > 0 ? Math.max(...tiemposExitosos) : 0;

    // Calcular tendencia (últimas 5 vs primeras 5 mediciones)
    let tendencia = 'neutral';
    if (exitosas.length >= 10) {
      const primeras5 =
        exitosas.slice(0, 5).reduce((a, b) => a + b.time, 0) / 5;
      const ultimas5 = exitosas.slice(-5).reduce((a, b) => a + b.time, 0) / 5;

      if (ultimas5 < primeras5 * 0.9) tendencia = 'mejorando';
      else if (ultimas5 > primeras5 * 1.1) tendencia = 'empeorando';
    }

    return {
      promedio: Math.round(promedio),
      min,
      max,
      exitosas: exitosas.length,
      fallidas: fallidas.length,
      tasaExito: ((exitosas.length / mediciones.length) * 100).toFixed(1),
      tendencia,
    };
  }

  /**
   * Obtiene clasificación de velocidad
   */
  clasificarVelocidad(tiempo, estado = 200) {
    if (estado !== 200 || tiempo >= this.UMBRALES.PENALIZACION_FALLO) {
      return { nivel: 'down', clase: 'status-down', urgencia: 10 };
    }

    const clasificaciones = [
      {
        umbral: this.UMBRALES.MUY_RAPIDO,
        nivel: 'very-fast',
        clase: 'status-very-fast',
        urgencia: 0,
      },
      {
        umbral: this.UMBRALES.RAPIDO,
        nivel: 'fast',
        clase: 'status-fast',
        urgencia: 1,
      },
      {
        umbral: this.UMBRALES.NORMAL,
        nivel: 'normal',
        clase: 'status-normal',
        urgencia: 2,
      },
      {
        umbral: this.UMBRALES.LENTO,
        nivel: 'slow',
        clase: 'status-slow',
        urgencia: 3,
      },
      {
        umbral: this.UMBRALES.CRITICO,
        nivel: 'critical',
        clase: 'status-critical',
        urgencia: 4,
      },
      {
        umbral: this.UMBRALES.RIESGO,
        nivel: 'risk',
        clase: 'status-risk',
        urgencia: 5,
      },
    ];

    for (const cls of clasificaciones) {
      if (tiempo <= cls.umbral) return cls;
    }

    return { nivel: 'extreme-risk', clase: 'status-extreme-risk', urgencia: 6 };
  }

  /**
   * Genera datos para sparkline (mini gráfico)
   */
  generarSparklineData(mediciones, maxPuntos = 20) {
    if (!mediciones || mediciones.length === 0) return [];

    const puntos = mediciones.slice(-maxPuntos);
    const tiempos = puntos.map((p) =>
      p.time < this.UMBRALES.PENALIZACION_FALLO ? p.time : 0
    );
    const max = Math.max(...tiempos, 1);

    return tiempos.map((t, i) => ({
      valor: t,
      normalizado: (t / max) * 100,
      timestamp: puntos[i].timestamp,
      estado: puntos[i].status,
    }));
  }

  /**
   * Detecta anomalías en el rendimiento
   */
  detectarAnomalias(mediciones) {
    const stats = this.calcularEstadisticas(mediciones);
    const anomalias = [];

    // Spike de latencia (>3x promedio)
    mediciones.forEach((m, i) => {
      if (m.status === 200 && m.time > stats.promedio * 3) {
        anomalias.push({
          tipo: 'spike',
          indice: i,
          valor: m.time,
          mensaje: `Latencia ${m.time}ms es 3x mayor que el promedio (${stats.promedio}ms)`,
        });
      }
    });

    // Racha de fallos (3+ consecutivos)
    let rachaFallos = 0;
    mediciones.forEach((m, i) => {
      if (m.status !== 200) {
        rachaFallos++;
        if (rachaFallos >= 3) {
          anomalias.push({
            tipo: 'racha-fallos',
            indice: i,
            valor: rachaFallos,
            mensaje: `${rachaFallos} fallos consecutivos detectados`,
          });
        }
      } else {
        rachaFallos = 0;
      }
    });

    return anomalias;
  }

  /**
   * Calcula puntuación de salud (0-100)
   */
  calcularPuntuacionSalud(mediciones) {
    const stats = this.calcularEstadisticas(mediciones);
    let puntuacion = 100;

    // Penalizar por fallos (-10 por cada 10% de fallos)
    puntuacion -= 100 - parseFloat(stats.tasaExito);

    // Penalizar por latencia alta
    if (stats.promedio > this.UMBRALES.CRITICO) puntuacion -= 30;
    else if (stats.promedio > this.UMBRALES.LENTO) puntuacion -= 20;
    else if (stats.promedio > this.UMBRALES.NORMAL) puntuacion -= 10;

    // Bonificar por tendencia positiva
    if (stats.tendencia === 'mejorando') puntuacion += 5;
    else if (stats.tendencia === 'empeorando') puntuacion -= 5;

    return Math.max(0, Math.min(100, Math.round(puntuacion)));
  }
}
