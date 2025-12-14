======================================================
ARQUITECTURA Y FLUJO DE DATOS DEL MONITOR
======================================================

OBJETIVO:
Garantizar la disponibilidad del monitor y evitar fallos por
políticas de seguridad del navegador (CORS / Mixed Content)
al verificar URLs externas de terceros.

---

1. FLUJO DE DATOS DETALLADO (Ciclo de 5 minutos)

---

1. INICIO (script.js):
   La función 'monitorearTodosWebsites()' lee 'webs.json'
   y establece un bucle de verificación para cada URL.

2. INVOCACIÓN DEL PROXY (script.js):
   El frontend llama a la función Netlify Serverless:
   -> Endpoint: /.netlify/functions/check-status?url=[URL_DESTINO]

3. EJECUCIÓN SERVERLESS (check-status.js):
   a. El entorno Node.js ejecuta una petición HTTP **'GET'**
   completa a la URL de destino.
   b. **MIDE LA LATENCIA:** Registra el tiempo desde el
   inicio del 'fetch' hasta la recepción completa de la
   respuesta (incluye DNS, TCP, SSL y procesamiento).
   c. **MANEJO DE TIMEOUT:** Si la petición supera los 9 segundos
   (9000 ms), la función Serverless aborta la petición y
   devuelve un **'status: 0'** para marcar una caída sin
   exceder el límite de ejecución de Netlify (10s).
   d. **MANEJO DE SSL:** Utiliza agentes HTTP/HTTPS que ignoran
   certificados SSL inválidos para poder monitorear
   disponibilidad del servicio independientemente de la
   validez de sus certificados.

4. RESPUESTA SERVERLESS:
   La función siempre responde al frontend con un
   'statusCode: 200' (respuesta del proxy), pero el cuerpo JSON
   contiene los datos del sitio destino:
   -> Body: { status: [CÓDIGO_DESTINO], time: [LATENCIA_MS] }

5. PROCESAMIENTO FRONTEND (script.js):
   El frontend recibe el resultado y:
   a. Actualiza el Estado y la Latencia Actual.
   b. Almacena el resultado en el 'sessionStorage' (historial
   configurable de 12 a 108 puntos / 1 a 9 horas).
   c. Calcula el Promedio Histórico solo con mediciones exitosas
   (status 200) y el Estado Promedio (usando los umbrales de
   `justificacion_rangos_latencia.md`).
   d. Dibuja la Tabla con la clasificación visual.
   e. **CONTROL DE MÁXIMO:** Al alcanzar el límite de mediciones
   configurado, el monitoreo se pausa automáticamente hasta
   que el usuario presione el botón "Reiniciar Monitoreo".

---

2. JUSTIFICACIÓN DEL PROXY SERVERLESS (check-status.js)

---

La función Serverless es crucial para la estabilidad y seguridad:

- **Evitar CORS (Cross-Origin Resource Sharing):** El Serverless
  ejecuta la petición en un entorno Node.js, donde las
  restricciones CORS del navegador no aplican.
- **Evitar Mixed Content:** Permite al monitor, servido por
  HTTPS, verificar URLs de destino que usen HTTP (como se ve en
  `webs.json` con `http://www.exportafacil.com.uy`) sin que el
  navegador bloquee la petición.
- **Control de Timeout:** El timeout de 9 segundos protege los
  límites de ejecución de Netlify (máx. 10s para funciones gratuitas).
- **Manejo de Redirecciones:** Sigue automáticamente redirecciones
  HTTP y cambia de agente (HTTP/HTTPS) según sea necesario.
- **Resiliencia:** Retorna siempre HTTP 200 al frontend, con el
  status real del servicio en el body, diferenciando entre fallo
  de la función serverless vs. fallo del servicio monitoreado.
