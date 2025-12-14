// ui.js - Manipulación del DOM y componentes visuales
export class UIManager {
  constructor(textos) {
    this.textos = textos;
  }

  /**
   * Crea skeleton loader para una fila
   */
  crearSkeletonRow() {
    const row = document.createElement('tr');
    row.className = 'skeleton-row';

    for (let i = 0; i < 7; i++) {
      const cell = row.insertCell();
      cell.innerHTML = '<div class="skeleton-box"></div>';
    }

    return row;
  }

  /**
   * Muestra notificación toast
   */
  mostrarNotificacion(mensaje, tipo = 'info', duracion = 3000) {
    const container =
      document.getElementById('toast-container') || this.crearToastContainer();

    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.innerHTML = `
      <span class="toast-icon">${this.getIconoToast(tipo)}</span>
      <span class="toast-mensaje">${mensaje}</span>
      <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(toast);

    // Animación de entrada
    setTimeout(() => toast.classList.add('toast-show'), 10);

    // Auto-cerrar
    if (duracion > 0) {
      setTimeout(() => {
        toast.classList.remove('toast-show');
        setTimeout(() => toast.remove(), 300);
      }, duracion);
    }

    return toast;
  }

  crearToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
  }

  getIconoToast(tipo) {
    const iconos = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ',
    };
    return iconos[tipo] || iconos.info;
  }

  /**
   * Crea sparkline SVG
   */
  crearSparkline(datos, width = 100, height = 30) {
    if (!datos || datos.length === 0) {
      return '<span class="sparkline-empty">—</span>';
    }

    const padding = 2;
    const efectiveHeight = height - padding * 2;
    const puntoWidth = width / Math.max(datos.length - 1, 1);

    let puntos = datos
      .map((d, i) => {
        const x = i * puntoWidth;
        const y = height - padding - (d.normalizado / 100) * efectiveHeight;
        return `${x},${y}`;
      })
      .join(' ');

    // Color según última medición
    const ultimoEstado =
      datos[datos.length - 1]?.estado === 200 ? 'success' : 'error';
    const color = ultimoEstado === 'success' ? '#4caf50' : '#f44336';

    return `
      <svg class="sparkline" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <polyline 
          points="${puntos}" 
          fill="none" 
          stroke="${color}" 
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    `;
  }

  /**
   * Crea badge de puntuación de salud
   */
  crearBadgeSalud(puntuacion) {
    let clase = 'badge-salud-excelente';
    let emoji = '🎯';

    if (puntuacion < 50) {
      clase = 'badge-salud-critico';
      emoji = '🔴';
    } else if (puntuacion < 70) {
      clase = 'badge-salud-advertencia';
      emoji = '⚠️';
    } else if (puntuacion < 90) {
      clase = 'badge-salud-bueno';
      emoji = '✓';
    }

    return `<span class="badge-salud ${clase}" title="Puntuación de salud">${emoji} ${puntuacion}</span>`;
  }

  /**
   * Actualiza barra de progreso
   */
  actualizarProgreso(actual, total) {
    let progressBar = document.getElementById('monitor-progress');

    if (!progressBar) {
      progressBar = document.createElement('div');
      progressBar.id = 'monitor-progress';
      progressBar.className = 'progress-bar';
      progressBar.innerHTML =
        '<div class="progress-fill"></div><span class="progress-text"></span>';

      const container = document.querySelector('.container');
      container.insertBefore(progressBar, container.firstChild);
    }

    const porcentaje = Math.round((actual / total) * 100);
    const fill = progressBar.querySelector('.progress-fill');
    const text = progressBar.querySelector('.progress-text');

    fill.style.width = `${porcentaje}%`;
    text.textContent = `Monitoreando ${actual}/${total} servicios...`;

    if (porcentaje >= 100) {
      setTimeout(() => {
        progressBar.classList.add('progress-complete');
        setTimeout(() => progressBar.remove(), 500);
      }, 500);
    }
  }

  /**
   * Sanitiza HTML para prevenir XSS
   */
  sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Valida URL
   */
  isValidURL(url) {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }

  /**
   * Formatea timestamp relativo
   */
  formatearTiempoRelativo(timestamp) {
    const ahora = Date.now();
    const diff = ahora - timestamp;
    const segundos = Math.floor(diff / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    if (dias > 0) return `hace ${dias}d`;
    if (horas > 0) return `hace ${horas}h`;
    if (minutos > 0) return `hace ${minutos}min`;
    return `hace ${segundos}s`;
  }

  /**
   * Crea modal genérico
   */
  crearModal(titulo, contenido, botones = []) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>${titulo}</h2>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
        </div>
        <div class="modal-body">${contenido}</div>
        <div class="modal-footer">
          ${botones
            .map(
              (btn) => `
            <button class="btn-${btn.tipo || 'secondary'}" onclick="${
                btn.onclick
              }">${btn.texto}</button>
          `
            )
            .join('')}
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('modal-show'), 10);

    return modal;
  }

  /**
   * Mejora tooltips con información detallada
   */
  crearTooltipDetallado(elemento, datos) {
    let tooltip = elemento.querySelector('.tooltip-detallado');

    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.className = 'tooltip-detallado';
      elemento.appendChild(tooltip);
    }

    tooltip.innerHTML = `
      <div class="tooltip-row"><strong>Latencia:</strong> ${datos.latencia}ms</div>
      <div class="tooltip-row"><strong>Estado:</strong> ${datos.estadoHTTP}</div>
      <div class="tooltip-row"><strong>Tasa éxito:</strong> ${datos.tasaExito}%</div>
      <div class="tooltip-row"><strong>Última actualización:</strong> ${datos.ultimaActualizacion}</div>
    `;

    elemento.addEventListener('mouseenter', () =>
      tooltip.classList.add('tooltip-visible')
    );
    elemento.addEventListener('mouseleave', () =>
      tooltip.classList.remove('tooltip-visible')
    );
  }
}
