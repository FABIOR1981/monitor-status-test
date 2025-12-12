======================================================
ARQUITECTURA Y FLUJO DE DATOS DEL MONITOR
======================================================

OBJETIVO:
Garantizar la disponibilidad del monitor y evitar fallos por
políticas de seguridad del navegador (CORS / Mixed Content)
al verificar URLs externas de terceros.

------------------------------------------------------
1. FLUJO DE DATOS DETALLADO (Ciclo de 5 minutos)
------------------------------------------------------

1. INICIO (script.js):
   La función 'monitorearTodosWebsites()' lee 'webs.json'
   y establece un bucle de verificación para cada URL.

2. INVOCACIÓN DEL PROXY (script.js):
   El frontend llama a la función Netlify Serverless:
   -> Endpoint: /.netlify/functions/check-status?url=[URL_DESTINO]

3. EJECUCIÓN SERVERLESS (check-status.js):
   a. El entorno Node.js ejecuta una petición HTTP **'HEAD'**
      (para solo pedir encabezados, es más rápido) a la URL
      de destino.
   b. **MIDE LA LATENCIA:** Registra el tiempo desde el
      inicio del 'fetch' hasta la recepción de los encabezados.
   c. **MANEJO DE TIMEOUT:** Si la petición supera los 8 segundos
      (8000 ms), la función Serverless devuelve un **'status: 0'**
      para marcar una caída sin exceder el límite de ejecución
      de Netlify (10s).

4. RESPUESTA SERVERLESS:
   La función siempre responde al frontend con un
   'statusCode: 200' (respuesta del proxy), pero el cuerpo JSON
   contiene los datos del sitio destino:
   -> Body: { status: [CÓDIGO_DESTINO], time: [LATENCIA_MS] }

5. PROCESAMIENTO FRONTEND (script.js):
   El frontend recibe el resultado y:
   a. Actualiza el Estado y la Latencia Actual.
   b. Almacena el resultado en el 'localStorage' (historial de
      12 puntos / 1 hora).
   c. Calcula el Promedio Histórico y el Estado Promedio
      (usando los umbrales de `JUSTIFICACION_RANGOS_LATENCIA.md`).
   d. Dibuja la Tabla con la clasificación visual.

------------------------------------------------------
2. JUSTIFICACIÓN DEL PROXY SERVERLESS (check-status.js)
------------------------------------------------------
La función Serverless es crucial para la estabilidad y seguridad:

* **Evitar CORS (Cross-Origin Resource Sharing):** El Serverless
  ejecuta la petición en un entorno Node.js, donde las
  restricciones CORS del navegador no aplican.
* **Evitar Mixed Content:** Permite al monitor, servido por
  HTTPS, verificar URLs de destino que usen HTTP (como se ve en
  `webs.json` con `http://www.exportafacil.com.uy`) sin que el
  navegador bloquee la petición.
* **Control de Timeout:** El timeout de 8 segundos protege los
  límites de ejecución de Netlify.