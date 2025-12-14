======================================================
ESTRUCTURA DEL PROYECTO monitor-status-test (CORREGIDA)
======================================================

monitor-status-test/
├── index.html <-- Frontend HTML (Estructura principal del monitor)
├── leyenda.html <-- Página de leyenda de umbrales
├── package.json <-- Dependencias de Node (node-fetch, abort-controller)
├── netlify.toml <-- Configuración Netlify (funciones serverless)
├── README.md <-- Documentación principal del proyecto
|
├── data/ <-- Datos de configuración
│ └── webs.json <-- URLs a monitorizar
|
├── .vscode/ <-- Configuración de VS Code
│ └── settings.json <-- Configuración de cSpell (diccionario español)
|
├── js/ <-- Directorio de scripts JavaScript
│ ├── script.js <-- Lógica principal (Monitorización, Historial, Temas)
│ ├── config.js <-- Constantes de configuración (umbrales, temas, etc.)
│ ├── i18n.js <-- Lógica de internacionalización
│ └── leyenda_script.js <-- Lógica de la página de leyenda
|
├── lang/ <-- Archivos de traducción
│ ├── i18n_es.js <-- Textos en español
│ └── i18n_en.js <-- Textos en inglés
|
├── css/ <-- Directorio de estilos CSS
│ ├── styles_base.css <-- Estilos base compartidos
│ ├── styles_def.css <-- Tema estándar (default)
│ ├── styles_pro.css <-- Tema PRO (información avanzada)
│ ├── styles_min.css <-- Tema minimalista
│ ├── leyenda_base.css <-- Estilos base de la leyenda
│ ├── leyenda_def.css <-- Tema estándar para leyenda
│ ├── leyenda_pro.css <-- Tema PRO para leyenda
│ └── leyenda_min.css <-- Tema minimalista para leyenda
|
├── netlify/ <-- Carpeta de configuración de Netlify
│ └── functions/
│ └── check-status.js <-- Función Serverless (Proxy HTTP para verificación)
|
└── docs/ <-- Directorio de documentación
├── readme.md <-- Índice principal de documentación
├── arquitectura.md <-- Flujo de datos y arquitectura del sistema
├── estructura.md <-- Este archivo - estructura del proyecto
├── justificacion_rangos_latencia.md <-- Justificación de umbrales
└── resolución de problemas.md <-- Guía de troubleshooting
