# Monitor de Disponibilidad de Servicios 🚀

Este documento unifica la documentación del repositorio y contiene toda la información necesaria para desplegar, desarrollar y contribuir al proyecto.

## Resumen rápido

- Monitor de servicios que verifica código de estado y latencia de una lista de URLs.
- Utiliza una función serverless como proxy para esquivar CORS y permitir mediciones desde el navegador con seguridad.
- i18n centralizado en `js/i18n_es.js` (y estructura para agregar más idiomas).
- Lógica de la leyenda en `js/leyenda_script.js` y constantes globales en `js/config.js`.

## Cambios recientes

- Centralización de textos (i18n) en `js/i18n_es.js`.
- Separación de responsabilidades: `js/leyenda_script.js` (leyenda) y `js/script.js` (monitor principal).
- Definición de `TEMA_FILES` y `LEYENDA_TEMA_FILES` en `js/config.js`.
- Se eliminaron o archivaron archivos obsoletos relacionados con la leyenda.

## Descripción

Este proyecto es un monitor de disponibilidad web diseñado para
verificar el estado (_status code_) y la latencia (tiempo de
respuesta) de una lista de URLs críticas. La aplicación utiliza
una arquitectura **Serverless** (Netlify Functions) para evadir
problemas de CORS y **Mixed Content** al realizar las peticiones.

**Frecuencia de Monitoreo:** Los datos se actualizan
automáticamente cada **5 minutos**.

## 🛠️ Estructura del Proyecto y Archivos Principales

El proyecto sigue una arquitectura de Frontend ligero que se
apoya en una función Serverless como proxy.

| Archivo/Directorio                  | Propósito                                                  |
| :---------------------------------- | :--------------------------------------------------------- |
| `index.html`                        | Estructura principal y contenedores del monitor.           |
| `styles_base.css`                   | Variables y reglas base compartidas por temas.             |
| `styles_def.css`                    | Tema estándar.                                             |
| `styles_pro.css`                    | Tema PRO.                                                  |
| `js/script.js`                      | Lógica de Frontend, historial, temas y llamadas al proxy.  |
| `webs.json`                         | **Lista de URLs a monitorizar.**                           |
| `netlify/functions/check-status.js` | Función Serverless (Proxy) para verificar estado/latencia. |
| `JUSTIFICACION_RANGOS_LATENCIA.md`  | Documento que justifica los umbrales de rendimiento.       |
| `ARQUITECTURA.MD`                   | Explica el flujo de datos y el rol del proxy.              |

## ⚙️ Configuración, despliegue y ejecución local

### 1. Requisitos Previos

Solo necesita una cuenta en un repositorio Git (GitHub, GitLab, etc.) y una cuenta en Netlify.

### 2. Configuración de URLs

Edite el archivo webs.json para agregar o eliminar los servicios web que desea monitorizar.

Puede utilizar cualquier editor de texto o IDE (como VS Code o Notepad++) para modificar este archivo JSON:

`json
[
    { "nombre": "Nombre del Servicio", "url": "https://ejemplo.com" }
]
`

### 3. Despliegue del Monitor (Flujo Recomendado: Netlify Web)

El flujo más rápido no requiere ninguna instalación local:

1.  Suba este código a un repositorio de Git (GitHub, etc.).
2.  Vaya al panel de Netlify, seleccione **"Add new site"** y elija **"Import an existing project"**.
3.  Conecte su repositorio. Netlify detectará automáticamente todos los archivos.

**Netlify se encarga de:**

- **Instalación:** Detecta `package.json` y ejecuta `npm install` automáticamente.
- **Configuración:** Lee `netlify.toml` y despliega la función Serverless (`check-status.js`) desde la carpeta `netlify/functions`.

### 4. Ejecución y Pruebas Locales (Opcional - Requiere Instalación)

Si necesita desarrollar o depurar las funciones Serverless en su entorno:

1.  Instale **Node.js** y la **CLI de Netlify** (`npm install netlify-cli -g`).
2.  Instale las dependencias manualmente:
    `bash
npm install
`
3.  Desde la raíz del proyecto, ejecute el servidor de desarrollo:
    `bash
netlify dev
`

## 🎨 Temas y customización visual

El monitor soporta dos temas visuales:

1.  **Estándar:** Se activa por defecto (`css/styles_def.css`).

## 🔤 Internacionalización (i18n)

- Los textos se encuentran en `js/i18n_es.js` (archivo principal en Español), los demás idiomas siguen el mismo patrón (ej. `js/i18n_en.js`).
- Si se agreaga un idioma nuevo, incluir su entrada en `I18N_FILES` dentro de `js/config.js`.

## 💻 Desarrollo y estructura

- Recomendado usar `netlify-cli` para desarrollar con la función serverless:

```bash
npm install
npx netlify-cli dev
```

### Archivos de configuración

- `js/config.js`: constantes de configuración, umbrales `UMBRALES_LATENCIA`, `TEMA_FILES`, `LEYENDA_TEMA_FILES`, `PROXY_ENDPOINT`.

## 🧭 Agregar/Editar servicios a monitorear

- Editar `webs.json` en la raíz: agregar/editar objetos con `nombre`, `url` y `grupo`.

## 🙋 Contribuir y mantenimiento

- Añadir `stylelint` o `eslint` para validar código y estilos.
- Crear pruebas end-to-end (Playwright o Puppeteer) para asegurar que `index.html` y `leyenda.html` carguen y muestren los textos correctamente.

## ❗ Notas finales y buenas prácticas

- Mantener los textos de la UI en archivos i18n por idioma.
- Mantener las constantes de configuración en `js/config.js` para evitar duplicidad.
- Separar lógica (JS) de la presentación (CSS/HTML) y centralizar variables.

---

Este archivo es el punto de referencia principal. Para documentación adicional, ver la carpeta `docs/`. 2. **Tema PRO:** Proporciona información avanzada (columna de URL
visible, botón de PageSpeed Insights y código de error en la
caída). Se activa añadiendo el parámetro a la URL:
`    [TU_URL]/?tema=pro
   `
