// filters.js - Sistema de filtrado y búsqueda
export class FilterManager {
  constructor(textos) {
    this.textos = textos;
    this.filtrosActivos = new Set(['todos']);
    this.terminoBusqueda = '';
    this.ordenActual = { columna: null, direccion: 'asc' };
  }

  /**
   * Inicializa controles de filtro y búsqueda
   */
  inicializarControles(contenedor) {
    const filterHTML = `
      <div class="filter-container">
        <div class="search-box">
          <input 
            type="text" 
            id="search-input" 
            placeholder="${this.textos.general.BUSCAR || 'Buscar servicios...'}"
            aria-label="Buscar servicios"
          />
          <span class="search-icon">🔍</span>
        </div>
        
        <div class="filter-buttons">
          <button class="filter-btn active" data-filter="todos">
            Todos
          </button>
          <button class="filter-btn" data-filter="criticos">
            Críticos
          </button>
          <button class="filter-btn" data-filter="activos">
            Activos
          </button>
          <button class="filter-btn" data-filter="lentos">
            Lentos
          </button>
          <button class="filter-btn" data-filter="error">
            Con Errores
          </button>
        </div>

        <div class="export-buttons">
          <button class="btn-export" id="export-json" title="Exportar como JSON">
            📥 JSON
          </button>
          <button class="btn-export" id="export-csv" title="Exportar como CSV">
            📥 CSV
          </button>
        </div>
      </div>
    `;

    contenedor.insertAdjacentHTML('afterbegin', filterHTML);
    this.attachEventListeners();
  }

  /**
   * Adjunta event listeners
   */
  attachEventListeners() {
    // Búsqueda con debounce
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      let debounceTimer;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          this.terminoBusqueda = e.target.value.toLowerCase();
          this.aplicarFiltros();
        }, 300);
      });
    }

    // Botones de filtro
    document.querySelectorAll('.filter-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const filtro = e.target.dataset.filter;

        if (filtro === 'todos') {
          // Todos: desactivar otros filtros
          this.filtrosActivos.clear();
          this.filtrosActivos.add('todos');
          document
            .querySelectorAll('.filter-btn')
            .forEach((b) => b.classList.remove('active'));
          e.target.classList.add('active');
        } else {
          // Quitar "todos" si se selecciona otro filtro
          this.filtrosActivos.delete('todos');
          document
            .querySelector('[data-filter="todos"]')
            .classList.remove('active');

          // Toggle filtro actual
          if (this.filtrosActivos.has(filtro)) {
            this.filtrosActivos.delete(filtro);
            e.target.classList.remove('active');
          } else {
            this.filtrosActivos.add(filtro);
            e.target.classList.add('active');
          }

          // Si no hay filtros activos, volver a "todos"
          if (this.filtrosActivos.size === 0) {
            this.filtrosActivos.add('todos');
            document
              .querySelector('[data-filter="todos"]')
              .classList.add('active');
          }
        }

        this.aplicarFiltros();
      });
    });
  }

  /**
   * Aplica filtros a la tabla
   */
  aplicarFiltros() {
    const tabla = document.getElementById('status-table-body');
    if (!tabla) return;

    const filas = Array.from(tabla.querySelectorAll('tr'));
    let visibles = 0;

    filas.forEach((fila) => {
      const nombre = fila.cells[0]?.textContent.toLowerCase() || '';
      const url = fila.dataset.url?.toLowerCase() || '';
      const grupo = fila.dataset.grupo?.toLowerCase() || '';

      // Búsqueda
      const matchBusqueda =
        !this.terminoBusqueda ||
        nombre.includes(this.terminoBusqueda) ||
        url.includes(this.terminoBusqueda);

      // Filtros
      let matchFiltro = this.filtrosActivos.has('todos');

      if (!matchFiltro) {
        if (this.filtrosActivos.has('criticos') && grupo === 'critico') {
          matchFiltro = true;
        }
        if (this.filtrosActivos.has('activos')) {
          const estadoCell = fila.cells[3];
          if (estadoCell && !estadoCell.classList.contains('status-down')) {
            matchFiltro = true;
          }
        }
        if (this.filtrosActivos.has('lentos')) {
          const latenciaText = fila.cells[2]?.textContent || '';
          const latencia = parseInt(latenciaText);
          if (latencia > 1500) {
            matchFiltro = true;
          }
        }
        if (this.filtrosActivos.has('error')) {
          const promedioText = fila.cells[4]?.textContent || '';
          if (promedioText.includes('⚠️')) {
            matchFiltro = true;
          }
        }
      }

      if (matchBusqueda && matchFiltro) {
        fila.style.display = '';
        visibles++;
      } else {
        fila.style.display = 'none';
      }
    });

    // Mostrar mensaje si no hay resultados
    this.mostrarMensajeSinResultados(visibles === 0);
  }

  /**
   * Muestra mensaje cuando no hay resultados
   */
  mostrarMensajeSinResultados(mostrar) {
    let mensaje = document.getElementById('no-results-message');

    if (mostrar) {
      if (!mensaje) {
        mensaje = document.createElement('div');
        mensaje.id = 'no-results-message';
        mensaje.className = 'no-results';
        mensaje.innerHTML = `
          <div style="text-align: center; padding: 40px; color: #999;">
            <div style="font-size: 48px; margin-bottom: 16px;">🔍</div>
            <p style="font-size: 18px; margin: 0;">No se encontraron servicios</p>
            <p style="font-size: 14px; margin: 8px 0 0 0;">Intenta ajustar los filtros o el término de búsqueda</p>
          </div>
        `;

        const tabla = document.getElementById('monitor-table');
        if (tabla) {
          tabla.insertAdjacentElement('afterend', mensaje);
        }
      }
      mensaje.style.display = 'block';
    } else {
      if (mensaje) {
        mensaje.style.display = 'none';
      }
    }
  }

  /**
   * Habilita ordenamiento de columnas
   */
  habilitarOrdenamiento() {
    const headers = document.querySelectorAll('#monitor-table th');
    const columnasOrdenables = [0, 2, 4]; // Nombre, Latencia Actual, Promedio

    headers.forEach((th, index) => {
      if (columnasOrdenables.includes(index)) {
        th.style.cursor = 'pointer';
        th.classList.add('sortable');
        th.setAttribute('role', 'button');
        th.setAttribute('aria-label', `Ordenar por ${th.textContent}`);

        // Añadir indicador visual
        const indicator = document.createElement('span');
        indicator.className = 'sort-indicator';
        indicator.innerHTML = ' ↕';
        th.appendChild(indicator);

        th.addEventListener('click', () => this.ordenarPorColumna(index));
      }
    });
  }

  /**
   * Ordena tabla por columna
   */
  ordenarPorColumna(columnaIndex) {
    const tabla = document.getElementById('status-table-body');
    if (!tabla) return;

    const filas = Array.from(tabla.querySelectorAll('tr'));

    // Determinar dirección
    let direccion = 'asc';
    if (this.ordenActual.columna === columnaIndex) {
      direccion = this.ordenActual.direccion === 'asc' ? 'desc' : 'asc';
    }
    this.ordenActual = { columna: columnaIndex, direccion };

    // Ordenar filas
    filas.sort((a, b) => {
      let aValue = a.cells[columnaIndex]?.textContent || '';
      let bValue = b.cells[columnaIndex]?.textContent || '';

      // Si es columna numérica (latencia), comparar como números
      if (columnaIndex === 2 || columnaIndex === 4) {
        aValue = parseInt(aValue) || 0;
        bValue = parseInt(bValue) || 0;
      }

      if (aValue < bValue) return direccion === 'asc' ? -1 : 1;
      if (aValue > bValue) return direccion === 'asc' ? 1 : -1;
      return 0;
    });

    // Reordenar en DOM
    filas.forEach((fila) => tabla.appendChild(fila));

    // Actualizar indicadores visuales
    this.actualizarIndicadoresOrden(columnaIndex, direccion);
  }

  /**
   * Actualiza indicadores de ordenamiento
   */
  actualizarIndicadoresOrden(columnaActiva, direccion) {
    document.querySelectorAll('.sort-indicator').forEach((ind, index) => {
      if (index === columnaActiva) {
        ind.innerHTML = direccion === 'asc' ? ' ↑' : ' ↓';
        ind.style.color = 'var(--accent, #007bff)';
      } else {
        ind.innerHTML = ' ↕';
        ind.style.color = '#999';
      }
    });
  }

  /**
   * Reset todos los filtros
   */
  resetFiltros() {
    this.filtrosActivos.clear();
    this.filtrosActivos.add('todos');
    this.terminoBusqueda = '';

    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';

    document.querySelectorAll('.filter-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.filter === 'todos');
    });

    this.aplicarFiltros();
  }
}
