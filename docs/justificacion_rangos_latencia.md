======================================================
JUSTIFICACIÓN DE UMBRALES DE LATENCIA (script.js)
======================================================

NOTA SOBRE EL FORMATO:
El texto se ha limitado a un ancho cómodo (aprox. 70-80
caracteres por línea) para optimizar la legibilidad
en la mayoría de los editores de texto y terminales.
Este ancho es un estándar de diseño para lectura
en pantalla, ya que reduce la fatiga visual.

------------------------------------------------------
CONSTANTE: UMBRALES_LATENCIA
------------------------------------------------------
// Umbrales de latencia para clasificar el rendimiento (en milisegundos)
const UMBRALES_LATENCIA = {
    MUY_RAPIDO: 300,
    RAPIDO: 500,
    NORMAL: 800,
    LENTO: 1500,
    PENALIZACION_FALLO: 99999
};

------------------------------------------------------
OBJETIVO DE LA ESCALA
------------------------------------------------------
La escala está diseñada para clasificar la respuesta
del servidor (TTFB) basándose en dos criterios: la
psicología de la experiencia del usuario (UX) y los
estándares de rendimiento web de la industria (Google
Core Web Vitals).

------------------------------------------------------
JUSTIFICACIÓN INDIVIDUAL DE LOS UMBRALES
------------------------------------------------------

1. MUY_RAPIDO: <= 300 ms
   ------------------------
   - CLASIFICACIÓN: EXCELENTE (Verde Intenso)
   - JUSTIFICACIÓN UX: Umbral agresivo que garantiza
     una respuesta percibida como INSTANTÁNEA, ya que
     está significativamente por debajo del Umbral de
     Doherty (400ms). Es el objetivo para APIs y
     servicios de alto rendimiento.

2. RAPIDO: <= 500 ms
   ------------------
   - CLASIFICACIÓN: BUENO (Verde Claro)
   - JUSTIFICACIÓN UX: Rendimiento excelente y totalmente
     aceptable. El usuario nota una pausa mínima,
     manteniendo su foco. Es un objetivo común en
     Acuerdos de Nivel de Servicio (SLA).

3. NORMAL: <= 800 ms
   -------------------
   - CLASIFICACIÓN: ACEPTABLE / NECESITA MONITOREO (Amarillo)
   - JUSTIFICACIÓN ESTÁNDAR: Se alinea con el criterio
     de "BUENO" para el TTFB, según las directrices de
     Google PageSpeed Insights. Superar este límite
     indica que el servidor está tardando demasiado en
     empezar a responder.

4. LENTO: <= 1500 ms (1.5 segundos)
   -------------------
   - CLASIFICACIÓN: ALERTA (Naranja)
   - JUSTIFICACIÓN OPERATIVA: Una latencia en este rango
     rompe el flujo de interacción y aumenta el riesgo
     de abandono. Excede el rango de TTFB "Bueno"
     y requiere investigación para evitar la degradación
     del rendimiento.

5. CRÍTICO: > 1500 ms
   -------------------
   - CLASIFICACIÓN: DEFICIENTE / CAÍDA (Rojo)
   - JUSTIFICACIÓN OPERATIVA: Cualquier respuesta del
     servidor que tarde más de 1.5 segundos se clasifica
     como un fallo crítico en la experiencia de
     rendimiento y exige una intervención urgente.

6. PENALIZACION_FALLO: 99999 ms
   ------------------------------
   - PROPÓSITO: CÁLCULO DE PENALIZACIÓN
   - JUSTIFICACIÓN TÉCNICA: Este valor no es una latencia
     real. Se utiliza para penalizar matemáticamente el
     promedio histórico cuando el servicio devuelve un
     código de error (4xx, 5xx) o un fallo de conexión.
     Esto asegura que los fallos, incluso intermitentes,
     degraden el estado promedio inmediatamente.