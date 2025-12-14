// Script para la página de leyenda (leyenda.html)
// Carga el tema y el idioma según los parámetros de la URL
// y renderiza la tabla de umbrales dinámicamente
document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const temaParam = params.get('tema')
    ? params.get('tema').toLowerCase()
    : DEFAULT_LEYENDA_TEMA;
  const idioma = params.get('lang') || DEFAULT_LANG;

  // Cargar el CSS del tema seleccionado
  const temaBaseLink = document.getElementById('tema-base-css');
  const rutaCssTema =
    typeof LEYENDA_TEMA_FILES !== 'undefined'
      ? LEYENDA_TEMA_FILES[temaParam] ||
        LEYENDA_TEMA_FILES[DEFAULT_LEYENDA_TEMA]
      : null;

  if (temaBaseLink && rutaCssTema) {
    temaBaseLink.href = rutaCssTema;
    document.body.classList.add(`theme-${temaParam}`);
    console.log(`Tema aplicado (leyenda): ${temaParam} (${rutaCssTema})`);
  } else if (!temaBaseLink) {
    console.warn("Elemento con ID 'tema-base-css' no encontrado.");
  }

  // Cargar el archivo de traducción correspondiente al idioma seleccionado
  async function loadI18n(language) {
    const file =
      typeof I18N_FILES !== 'undefined' && I18N_FILES[language]
        ? I18N_FILES[language]
        : typeof I18N_FILES !== 'undefined'
        ? I18N_FILES[DEFAULT_LANG]
        : null;
    if (!file) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = file;
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error(`Failed to load i18n file: ${file}`));
      document.head.appendChild(script);
    });
  }

  try {
    await loadI18n(idioma);
  } catch (err) {
    console.warn(
      'Language script failed to load, falling back to default lang.',
      err
    );
    if (idioma !== DEFAULT_LANG) {
      try {
        await loadI18n(DEFAULT_LANG);
      } catch (e) {
        /* ignore */
      }
    }
  }
  // Renderiza la tabla de umbrales de latencia con detalles desplegables
  function renderLeyendaContent(container, leyendaData) {
    if (!container || !leyendaData) return;

    container.innerHTML = '';

    const introP = document.createElement('p');
    introP.textContent = leyendaData.intro || '';
    container.appendChild(introP);

    const umbralesSection = document.createElement('div');
    umbralesSection.className = 'leyenda-section umbrales-latencia';

    const table = document.createElement('table');
    table.className = 'leyenda-tabla-umbrales';
    const thead = document.createElement('thead');
    thead.innerHTML = `
            <tr>
                <th>Estado / Nivel</th>
                <th>Umbral de Latencia (ms)</th>
                <th>Justificación de los Umbrales de Latencia</th>
            </tr>`;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    (leyendaData.umbrales || []).forEach((u) => {
      const tr = document.createElement('tr');

      const tdStatus = document.createElement('td');
      tdStatus.className = u.className || '';
      tdStatus.textContent = `${u.emoji || ''} ${u.label || ''}`;
      tr.appendChild(tdStatus);

      const tdRange = document.createElement('td');
      tdRange.textContent = u.range_text || '';
      tr.appendChild(tdRange);

      const tdJustif = document.createElement('td');
      const details = document.createElement('details');
      const summary = document.createElement('summary');
      summary.textContent = u.summary || '';
      const p = document.createElement('p');
      p.textContent = u.details || '';
      details.appendChild(summary);
      details.appendChild(p);
      tdJustif.appendChild(details);
      tr.appendChild(tdJustif);

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    umbralesSection.appendChild(table);
    container.appendChild(umbralesSection);

    const codesSection = document.createElement('div');
    codesSection.className = 'leyenda-section codigos-error-section';
    codesSection.style.marginTop = '30px';

    const h3 = document.createElement('h3');
    h3.textContent = leyendaData.http_codes_title || '';
    codesSection.appendChild(h3);

    const pDesc = document.createElement('p');
    pDesc.textContent = leyendaData.http_codes_description || '';
    codesSection.appendChild(pDesc);

    const tableCodes = document.createElement('table');
    tableCodes.className = 'leyenda-tabla-errores';
    const theadCodes = document.createElement('thead');
    theadCodes.innerHTML = `
            <tr>
                <th>Código</th>
                <th>Rango/Nombre Común</th>
                <th>Significado Operacional</th>
            </tr>`;
    tableCodes.appendChild(theadCodes);

    const tbodyCodes = document.createElement('tbody');
    (leyendaData.codigos_error || []).forEach((c) => {
      const tr = document.createElement('tr');
      const tdCode = document.createElement('td');
      tdCode.textContent = c.code || '';
      tr.appendChild(tdCode);
      const tdLabel = document.createElement('td');
      tdLabel.textContent = c.label || '';
      tr.appendChild(tdLabel);
      const tdDesc = document.createElement('td');
      tdDesc.textContent = c.description || '';
      tr.appendChild(tdDesc);
      tbodyCodes.appendChild(tr);
    });
    tableCodes.appendChild(tbodyCodes);
    codesSection.appendChild(tableCodes);

    container.appendChild(codesSection);
  }

  if (typeof i18n !== 'undefined' && typeof i18n.get === 'function') {
    const titleEl = document.getElementById('leyenda-titulo');
    const headerEl = document.getElementById('titulo-leyenda');
    const contentEl = document.getElementById('contenido-leyenda');

    if (titleEl) titleEl.textContent = i18n.get('leyenda.title_browser');
    if (headerEl) headerEl.textContent = i18n.get('leyenda.main_header');
    if (contentEl) renderLeyendaContent(contentEl, i18n.get('leyenda'));
  } else if (typeof window.TEXTOS_ACTUAL !== 'undefined') {
    document.getElementById('leyenda-titulo').textContent =
      window.TEXTOS_ACTUAL.leyenda.title_browser;
    document.getElementById('titulo-leyenda').textContent =
      window.TEXTOS_ACTUAL.leyenda.main_header;
    renderLeyendaContent(
      document.getElementById('contenido-leyenda'),
      window.TEXTOS_ACTUAL.leyenda
    );
  } else {
    console.error('No se encontró ninguna fuente i18n para la Leyenda.');
  }
});
