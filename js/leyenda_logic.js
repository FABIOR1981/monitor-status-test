/**
 * js/leyenda_logic.js
 * Lógica principal para manejar parámetros de URL, aplicar tema y cargar contenido i18n.
 * REQUIERE: js/leyenda_i18n_core.js para la función i18n.get()
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Mapeo de Parámetros 'tema' a rutas de archivos CSS
    const TEMAS_MAP = {
    'default': 'css/leyenda_def.css', // Ahora apunta al CSS LIGERO de la leyenda
    'def': 'css/leyenda_def.css',     // Añadido 'def' para consistencia
    'pro': 'css/leyenda_pro.css',
    'min': 'css/leyenda_min.css'
};

    // 2. Obtener parámetros de la URL
    const params = new URLSearchParams(window.location.search);
    const temaParam = params.get('tema') ? params.get('tema').toLowerCase() : 'default'; 
    const idioma = params.get('lang') || 'es'; 

    // -----------------------------------------------------------
    // A. Lógica de Estilos (CSS)
    // -----------------------------------------------------------

    const temaBaseLink = document.getElementById('tema-base-css');
    const rutaCssTema = TEMAS_MAP[temaParam] || TEMAS_MAP['default'];

    if (temaBaseLink) {
        temaBaseLink.href = rutaCssTema;
        document.body.classList.add(`theme-${temaParam}`); 
        console.log(`Tema aplicado: ${temaParam} (${rutaCssTema})`);
    } else {
        console.warn("Elemento con ID 'tema-base-css' no encontrado.");
    }

    // -----------------------------------------------------------
    // B. Lógica de Internacionalización (I18n) en Español
    // -----------------------------------------------------------
    
    // 3. Cargar textos
    // Ahora, i18n.get debería existir gracias a leyenda_i18n_core.js
    if (typeof i18n !== 'undefined' && typeof i18n.get === 'function') {
        // Establecer el título del navegador
        document.getElementById('leyenda-titulo').textContent = i18n.get('leyenda.title_browser');

        // Establecer el encabezado principal
        document.getElementById('titulo-leyenda').textContent = i18n.get('leyenda.main_header');
        
        // Cargar el contenido de la leyenda (se usa innerHTML porque el texto puede contener etiquetas)
        document.getElementById('contenido-leyenda').innerHTML = i18n.get('leyenda.content_html');
    } else {
        console.error('El script de i18n (leyenda_i18n_core.js) no está cargado correctamente.');
    }


    // -----------------------------------------------------------
    // C. Lógica de Retorno
    // -----------------------------------------------------------

    // 4. Configurar el enlace de retorno a index.html con los parámetros originales
    const volverLink = document.getElementById('enlace-volver');
	if (volverLink) {
		// CORRECCIÓN CLAVE: Usar "/" en lugar de "index.html"
		volverLink.href = `/?${params.toString()}`; 
		console.log(`Enlace de retorno configurado a: ${volverLink.href}`);
	}
});