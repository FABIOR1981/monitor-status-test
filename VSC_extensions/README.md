# VSC_extensions

Plantilla de archivos de configuración y extensiones recomendadas para VS Code.

- Copia los siguientes archivos de esta carpeta al raíz del proyecto (si quieres que las herramientas los detecten):
  - `.eslintrc.json`
  - `.prettierrc`
  - `.eslintignore`
  - `.vscode/extensions.json`
  - `.vscode/settings.json`

- También puedes usar el script `VSC_scripts/apply-vscode-config.ps1` para copiar automáticamente estos archivos al directorio del proyecto.

Uso recomendado:
1. Instala las extensiones con `VSC_scripts/install-vscode-extensions.ps1`.
2. Ejecuta `VSC_scripts/apply-vscode-config.ps1` para copiar estas configuraciones al root del proyecto.
