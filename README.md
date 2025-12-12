# Monitor de Disponibilidad de Servicios

Este repositorio contiene un monitor sencillo de disponibilidad y latencia para una lista de URLs.

Resumen rápido:
- La app comprueba el código de estado y la latencia mediante un proxy Serverless (Netlify Functions).
- Los textos visibles al usuario (i18n) están centralizados en `js/i18n_es.js` y las demás traducciones usan el mismo patrón.
- La lógica de la página de Leyenda está en `js/leyenda_script.js`.
- Las constantes de configuración, incluyendo temas y umbrales, están en `js/config.js`.

Estructura y archivos principales
- `index.html`: Interfaz principal del monitor.
- `leyenda.html`: Documento con la leyenda y explicación de umbrales.
- `css/*`: Hojas de estilo base y por temas. `styles_base.css` centraliza variables.
- `js/config.js`: Constantes globales (umbrales, temas, rutas de i18n, etc.).
- `js/i18n_es.js`: Diccionario en español (TEXTOS_ES) con textos del monitor y la leyenda.
- `js/leyenda_script.js`: Lógica y carga de la página `leyenda.html`.
- `js/script.js`: Lógica principal del monitor de servicios (monitoreo, render, accesibilidad).
- `webs.json`: Lista de URLs a monitorear.
- `netlify/functions/check-status.js`: Función serverless que actúa como proxy para evitar CORS.

Principales cambios recientes
- Centralización de i18n: los textos de la leyenda fueron movidos a `js/i18n_es.js`.
- Separación de responsabilidades: la lógica de la leyenda fue movida a `js/leyenda_script.js`.
- Constantes: temas y leyenda temada ahora se definen en `js/config.js` como `TEMA_FILES` y `LEYENDA_TEMA_FILES`.
- Limpieza: se removieron archivos obsoletos y se añadieron shims menores para compatibilidad.

Desarrollo y pruebas locales
1. Clonar el repo y abrir la carpeta.
2. Abrir `index.html` en un navegador para ver la app estática.
3. Para ejecutar localmente con funciones serverless (recomendado):

```bash
npm install
npx netlify-cli dev
```

Agregar un nuevo idioma
1. Crear un archivo `js/i18n_xx.js` con la estructura `TEXTOS_ES` o el equivalente `TEXTOS_<code>`.
2. Añadir el archivo en `I18N_FILES` dentro de `js/config.js`.

Agregar o modificar un tema
1. Crear un nuevo archivo CSS en `css/` (basado en `styles_def.css` o `styles_pro.css`).
2. Añadir la ruta al mapa `TEMA_FILES` (para la página principal) y `LEYENDA_TEMA_FILES` (para la leyenda) en `js/config.js`.

Si necesitas ayuda con tests automáticos o un `stylelint`/CI básico, puedo agregar sugerencias y configuraciones.

-- Fin del README --
