# 🧪 Prueba de la Función Update-Webs

## Prueba Local con Netlify CLI

1. Instala Netlify CLI si no lo tienes:

```bash
npm install -g netlify-cli
```

2. Ejecuta las funciones localmente:

```bash
netlify dev
```

3. Abre otro terminal y prueba la función:

```bash
curl -X POST http://localhost:8888/.netlify/functions/update-webs \
  -H "Content-Type: application/json" \
  -d '{
    "data": [
      {
        "nombre": "Test",
        "url": "https://test.com"
      }
    ]
  }'
```

## Configurar Variables de Entorno Localmente

Crea un archivo `.env` en la raíz del proyecto:

```env
GITHUB_TOKEN=ghp_tu_token_aqui
GITHUB_REPO=FABIOR1981/monitor-status-test
GITHUB_BRANCH=main
```

**⚠️ IMPORTANTE:** Asegúrate de que `.env` está en tu `.gitignore`

## Verificar .gitignore

Agrega esto a tu `.gitignore` si no está:

```
.env
.env.local
.env.*.local
node_modules/
.netlify/
```

## Prueba desde el Navegador

1. Ejecuta `netlify dev`
2. Abre http://localhost:8888/admin.html
3. Haz cambios y prueba el botón "Guardar en GitHub"

## Verificar que Funciona

1. La función debe devolver:

```json
{
  "success": true,
  "message": "Archivo actualizado correctamente en GitHub",
  "commit": "sha_del_commit"
}
```

2. Verifica en GitHub que se creó un nuevo commit
3. El archivo `data/webs.json` debe tener tus cambios
