/**
 * js/leyenda_script.js
 * Lógica principal de la página de Leyenda.
 * - Usa las constantes definidas en `config.js` (LEYENDA_TEMA_FILES, DEFAULT_LEYENDA_TEMA)
 * - Usa la capa de i18n provista por `i18n_es.js` (i18n.get() y window.TEXTOS_ACTUAL)
 */

document.addEventListener('DOMContentLoaded', () => {
    // Obtener parámetros de la URL
    const params = new URLSearchParams(window.location.search);
    const temaParam = params.get('tema') ? params.get('tema').toLowerCase() : DEFAULT_LEYENDA_TEMA; 
    const idioma = params.get('lang') || DEFAULT_LANG;

    // -----------------------------------------------------------
    // A. Lógica de Estilos (usar constantes desde config.js)
    // -----------------------------------------------------------
    const temaBaseLink = document.getElementById('tema-base-css');
    const rutaCssTema = (typeof LEYENDA_TEMA_FILES !== 'undefined') ? (LEYENDA_TEMA_FILES[temaParam] || LEYENDA_TEMA_FILES[DEFAULT_LEYENDA_TEMA]) : null;

    if (temaBaseLink && rutaCssTema) {
        temaBaseLink.href = rutaCssTema;
        document.body.classList.add(`theme-${temaParam}`);
        console.log(`Tema aplicado (leyenda): ${temaParam} (${rutaCssTema})`);
    } else if (!temaBaseLink) {
        console.warn("Elemento con ID 'tema-base-css' no encontrado.");
    }

    // -----------------------------------------------------------
    // B. Lógica de Internacionalización (I18n)
    // -----------------------------------------------------------
    if (typeof i18n !== 'undefined' && typeof i18n.get === 'function') {
        const titleEl = document.getElementById('leyenda-titulo');
        const headerEl = document.getElementById('titulo-leyenda');
        const contentEl = document.getElementById('contenido-leyenda');
        const volverLink = document.getElementById('enlace-volver');

        if (titleEl) titleEl.textContent = i18n.get('leyenda.title_browser');
        if (headerEl) headerEl.textContent = i18n.get('leyenda.main_header');
        if (contentEl) contentEl.innerHTML = i18n.get('leyenda.content_html');
        if (volverLink) volverLink.textContent = i18n.get('leyenda.link_volver');

    } else if (typeof window.TEXTOS_ACTUAL !== 'undefined') {
        // Fallback: usar TEXTOS_ACTUAL como antes
        document.getElementById('leyenda-titulo').textContent = window.TEXTOS_ACTUAL.leyenda.title_browser;
        document.getElementById('titulo-leyenda').textContent = window.TEXTOS_ACTUAL.leyenda.main_header;
        document.getElementById('contenido-leyenda').innerHTML = window.TEXTOS_ACTUAL.leyenda.content_html;
        document.getElementById('enlace-volver').textContent = window.TEXTOS_ACTUAL.leyenda.link_volver;
    } else {
        console.error('No se encontró ninguna fuente i18n para la Leyenda.');
    }

    // -----------------------------------------------------------
    // C. Lógica de Retorno (conservar parámetros)
    // -----------------------------------------------------------
    const volverLink = document.getElementById('enlace-volver');
    if (volverLink) {
        volverLink.href = `/?${params.toString()}`;
    }
});
