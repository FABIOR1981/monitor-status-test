# Monitor de Disponibilidad de Servicios

La documentación principal del proyecto se encuentra en `docs/readme.md`.
Por favor, consulta la documentación ahí para instrucciones de desarrollo, despliegue y contribución.

Enlace rápido: [docs/readme.md](docs/readme.md)
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
- Limpieza: se removieron archivos obsoletos y se archivaron; algunos archivos anteriores se respaldaron para referencia.

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

Configuración de VS Code - Scripts
1. Para instalar extensiones recomendadas de VS Code (desde `.vscode/extensions.json`):
	- En PowerShell en la raíz del repo:
	  - `./VSC_scripts/install-vscode-extensions.ps1` (Ejecutar con `-ApplyConfig` para copiar también los archivos de configuración)
2. Para copiar las plantillas de configuración del directorio `VSC_extensions` al proyecto:
	- `./VSC_scripts/apply-vscode-config.ps1 -Force`
-- Fin del README --
Maintenance: limpieza de historial
1. Para eliminar archivos obsoletos del historial git (destructivo):
	- Revisa el script `VSC_scripts/remove-leyenda-history.ps1` y ejecútalo si necesitas borrar `js/leyenda_i18n_core.js` de la historia del repo.
	- IMPORTANTE: Este procedimiento reescribe la historia y requiere coordinación con colaboradores. Haz un backup antes de ejecutar.
