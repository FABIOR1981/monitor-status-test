# Monitor de Disponibilidad de Servicios 🚀

> Actualización: La documentación principal se movió al README raíz. Ver [README.md](README.md) para la visión general y las instrucciones actualizadas.

## Cambios recientes
- Centralización de los textos (i18n) en `js/i18n_es.js`.
- La lógica de la Leyenda ahora está en `js/leyenda_script.js` y los temas/constantes en `js/config.js`.
- Se eliminaron archivos obsoletos (leyenda_i18n_core.js y leyenda_logic.js).

## Descripción
Este proyecto es un monitor de disponibilidad web diseñado para
verificar el estado (*status code*) y la latencia (tiempo de
respuesta) de una lista de URLs críticas. La aplicación utiliza
una arquitectura **Serverless** (Netlify Functions) para evadir
problemas de CORS y **Mixed Content** al realizar las peticiones.

**Frecuencia de Monitoreo:** Los datos se actualizan
automáticamente cada **5 minutos**.

## 🛠️ Estructura del Proyecto
El proyecto sigue una arquitectura de Frontend ligero que se
apoya en una función Serverless como proxy.

| Archivo/Directorio | Propósito |
| :--- | :--- |
| `index.html` | Estructura principal y contenedores del monitor. |
| `styles.css` | Estilos base del monitor (Tema Estándar). |
| `styles_pro.css` | Estilos para el Tema PRO. |
| `script.js` | Lógica de Frontend, historial, temas y llamadas al proxy. |
| `webs.json` | **Lista de URLs a monitorizar.** |
| `netlify/functions/check-status.js` | Función Serverless (Proxy) para verificar estado/latencia. |
| `JUSTIFICACION_RANGOS_LATENCIA.md` | Documento que justifica los umbrales de rendimiento. |
| `ARQUITECTURA.MD` | Explica el flujo de datos y el rol del proxy. |

## ⚙️ Configuración y Despliegue

### 1. Requisitos Previos
Solo necesita una cuenta en un repositorio Git (GitHub, GitLab, etc.) y una cuenta en Netlify.

### 2. Configuración de URLs
Edite el archivo webs.json para agregar o eliminar los servicios web que desea monitorizar.

Puede utilizar cualquier editor de texto o IDE (como VS Code o Notepad++) para modificar este archivo JSON:

``json
[
    { "nombre": "Nombre del Servicio", "url": "https://ejemplo.com" }
]
``

### 3. Despliegue del Monitor (Flujo Recomendado: Netlify Web)
El flujo más rápido no requiere ninguna instalación local:

1.  Suba este código a un repositorio de Git (GitHub, etc.).
2.  Vaya al panel de Netlify, seleccione **"Add new site"** y elija **"Import an existing project"**.
3.  Conecte su repositorio. Netlify detectará automáticamente todos los archivos.

**Netlify se encarga de:**
* **Instalación:** Detecta `package.json` y ejecuta `npm install` automáticamente.
* **Configuración:** Lee `netlify.toml` y despliega la función Serverless (`check-status.js`) desde la carpeta `netlify/functions`.

### 4. Ejecución y Pruebas Locales (Opcional - Requiere Instalación)
Si necesita desarrollar o depurar las funciones Serverless en su entorno:

1.  Instale **Node.js** y la **CLI de Netlify** (`npm install netlify-cli -g`).
2.  Instale las dependencias manualmente:
    ``bash
    npm install
    ``
3.  Desde la raíz del proyecto, ejecute el servidor de desarrollo:
    ``bash
    netlify dev
    ``

## 🎨 Temas
El monitor soporta dos temas visuales:

1.  **Estándar:** Se activa por defecto (`styles.css`).
2.  **Tema PRO:** Proporciona información avanzada (columna de URL
    visible, botón de PageSpeed Insights y código de error en la
    caída). Se activa añadiendo el parámetro a la URL:
    ``
    [TU_URL]/?tema=pro
    ``