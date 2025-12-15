# Configuración del Panel de Administración

## 🚀 Guardado Automático en GitHub

Para que el panel de administración pueda guardar cambios directamente en GitHub sin necesidad de descargar/subir archivos manualmente, sigue estos pasos:

### 1. Crear un Personal Access Token de GitHub

1. Ve a GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click en "Generate new token (classic)"
3. Dale un nombre descriptivo, por ejemplo: "Monitor Status Admin"
4. Selecciona los siguientes permisos:
   - ✅ **repo** (Full control of private repositories)
5. Click en "Generate token"
6. **¡IMPORTANTE!** Copia el token generado (lo verás solo una vez)

### 2. Configurar Variables de Entorno en Netlify

1. Ve a tu sitio en Netlify
2. Site settings → Environment variables
3. Agrega las siguientes variables:

   | Variable        | Valor                            | Descripción                             |
   | --------------- | -------------------------------- | --------------------------------------- |
   | `GITHUB_TOKEN`  | `ghp_xxxxx...`                   | Tu token de GitHub (pegalo aquí)        |
   | `GITHUB_REPO`   | `FABIOR1981/monitor-status-test` | Nombre del repositorio                  |
   | `GITHUB_BRANCH` | `main`                           | Rama principal (o `master` si usas esa) |

4. Guarda los cambios
5. **Redeploy** tu sitio para que tome las nuevas variables

### 3. ¡Listo! Ya puedes usar el guardado automático

- Ve a [admin.html](admin.html)
- Haz tus cambios (agregar, editar, eliminar sitios)
- Click en **"🚀 Guardar en GitHub"**
- Los cambios se aplicarán automáticamente al repositorio
- Netlify detectará el cambio y redesplegará el sitio

## 🔒 Seguridad

- El token de GitHub **NUNCA** se expone al cliente
- Solo la función serverless de Netlify tiene acceso al token
- Las variables de entorno están protegidas en Netlify
- La API de GitHub requiere autenticación para cualquier cambio

## 🔄 Flujo de Trabajo

```
Usuario edita en admin.html
    ↓
Datos se guardan en localStorage
    ↓
Usuario click "Guardar en GitHub"
    ↓
Netlify Function recibe los datos
    ↓
Function actualiza webs.json en GitHub
    ↓
GitHub webhook notifica a Netlify
    ↓
Netlify redespliega automáticamente
    ↓
Cambios visibles en index.html
```

## 📱 Opciones de Guardado

### 1. Guardar en GitHub (Recomendado)

- Actualización automática
- Sin pasos manuales
- Cambios inmediatos
- Requiere configuración inicial

### 2. Descargar JSON (Alternativa)

- No requiere configuración
- Requiere subir manualmente a GitHub
- Útil como backup
- Compatible con cualquier hosting

## ❌ Solución de Problemas

### "Token de GitHub no configurado"

→ Verifica que agregaste `GITHUB_TOKEN` en las variables de entorno de Netlify

### "Error al actualizar el archivo en GitHub"

→ Verifica que el token tiene permisos de `repo`
→ Verifica que `GITHUB_REPO` y `GITHUB_BRANCH` son correctos

### "404 Not Found"

→ Asegúrate de que el repositorio existe y el token tiene acceso
→ Verifica el nombre del repositorio (formato: `usuario/repo`)

### Los cambios no se ven reflejados

→ Netlify puede tardar 1-2 minutos en redesplegar
→ Limpia la caché del navegador (Ctrl+Shift+R)

## 🆘 Modo Emergencia

Si algo falla, siempre puedes:

1. Click en **"💾 Descargar JSON"**
2. Ve a GitHub → tu repositorio
3. Edita `data/webs.json` manualmente
4. Pega el contenido descargado
5. Commit los cambios

---

## 📝 Notas Adicionales

- Cada guardado crea un commit en GitHub con timestamp
- El historial de cambios queda registrado en Git
- Puedes revertir cambios usando el historial de GitHub
- Los cambios en localStorage se limpian después de un guardado exitoso
