======================================================
GUÍA DE SOLUCIÓN DE PROBLEMAS (TROUBLESHOOTING.md)
======================================================

Este documento cubre los problemas más comunes encontrados durante
el despliegue y la operación del monitor de disponibilidad.

------------------------------------------------------
1. PROBLEMAS DE DESPLIEGUE Y CONFIGURACIÓN
------------------------------------------------------

### Problema 1.1: El sitio web está en blanco tras el despliegue.

**Causa:** Netlify no encontró los archivos del frontend o
no ejecutó correctamente la función Serverless.

**Verificación y Solución:**
1.  **Revisar Netlify Logs:** Vaya al panel de Netlify, sección
    **Deploys**. Busque el último despliegue y asegúrese de que
    no hay errores en la fase de "Building" o "Deploying".
2.  **Verificar netlify.toml:** Confirme que el archivo
    `netlify.toml` exista y apunte correctamente:
    `functions = "netlify/functions"`
3.  **Verificar package.json:** Asegúrese de que `package.json`
    contenga la dependencia `node-fetch`.

### Problema 1.2: La tabla se carga, pero aparece un error 404/500
en la consola al intentar verificar una URL.

**Causa:** La función Serverless no está desplegada correctamente
o la ruta de invocación es incorrecta.

**Verificación y Solución:**
1.  **Ruta de la Función:** Confirme que el archivo
    `check-status.js` está en la ruta exacta:
    `monitor-status-test/netlify/functions/check-status.js`
2.  **Ruta de Llamada (script.js):** Verifique que la constante
    `PROXY_URL_BASE` en `script.js` esté configurada
    correctamente:
    > const PROXY_URL_BASE = "/.netlify/functions/check-status?url=";

------------------------------------------------------
2. PROBLEMAS DE DISPONIBILIDAD Y LATENCIA
------------------------------------------------------

### Problema 2.1: Un sitio reporta "CAÍDA 🔴" (Estado 0 o 599)
aunque sé que está en línea.

**Causa A: Fallo de Conexión / DNS.**
* **Diagnóstico:** El entorno Node.js del Serverless no pudo
    resolver el nombre de host o establecer la conexión.
* **Solución:** Revise el archivo `webs.json` y confirme que
    la URL esté escrita perfectamente (incluyendo `http://` o
    `https://`).

**Causa B: Timeout del Proxy.**
* **Diagnóstico:** La función Serverless (`check-status.js`)
    tiene un límite de 8 segundos (8000 ms) antes de que se
    cierre la conexión. Si el servidor de destino tarda más
    de ese tiempo en enviar los encabezados, la función devuelve
    un `status: 0`.
* **Solución:** Es una **caída por rendimiento**. El servidor
    está demasiado lento. La solución es optimizar el
    servidor de destino.

**Causa C: Demasiados Redirects (Redirecciones).**
* **Diagnóstico:** El `check-status.js` tiene un límite de
    seguimiento de redirecciones (`follow: 20`). Si la URL
    supera ese número de saltos, fallará.
* **Solución:** Utilice la URL de destino final en `webs.json`.

### Problema 2.2: El estado de latencia siempre es 'LENTO' o 'CRÍTICO'.

**Causa:** La constante `UMBRALES_LATENCIA` está demasiado
ajustada o el servidor está bajo carga.

**Solución:**
1.  **Revisar Justificación:** Consulte `JUSTIFICACION_RANGOS_LATENCIA.md`
    para entender los umbrales (300ms, 500ms, etc.).
2.  **Ajuste:** Si el rendimiento del servidor no puede mejorar,
    considere ajustar los valores en `script.js` (si no están
    centralizados) para que se adapten a la realidad operativa.

------------------------------------------------------
3. PROBLEMAS DEL FRONTEND Y DATOS
------------------------------------------------------

### Problema 3.1: Los promedios históricos no se reinician
después de cambiar una URL o arreglar un sitio.

**Causa:** El historial de latencia se almacena en el
navegador local (`localStorage`) y no en el servidor.
El promedio se sigue calculando con los datos antiguos.

**Solución:**
1.  **Abrir Consola:** Vaya a las herramientas de desarrollo
    (F12), pestaña **Application** (Aplicación) o **Storage**
    (Almacenamiento).
2.  **Limpiar:** En `Local Storage`, busque la clave
    `latencyHistory` (definida en `script.js`) y bórrela.
    Esto forzará al monitor a empezar a calcular los promedios
    desde cero en la siguiente ejecución.

### Problema 3.2: El Tema PRO (`styles_pro.css`) no se aplica.

**Causa:** El parámetro de la URL está mal escrito o el archivo
no se carga.

**Solución:**
1.  **Verificar URL:** Asegúrese de que la URL termine exactamente
    con **`/?tema=pro`**.
2.  **Verificar Archivo:** Confirme que el archivo `styles_pro.css`
    existe en la carpeta raíz del proyecto.
3.  **Verificar script.js:** La función `aplicarTemaDesdeURL()`
    en `script.js` es sensible a mayúsculas y minúsculas;
    confirme que `parametros.get('tema') === 'pro'` es correcto.