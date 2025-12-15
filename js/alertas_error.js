// alertas_error.js
// Muestra un alert en el frontend solo la primera vez que un sitio da error en una hora
// Requiere que se llame a window.registrarErrorSitio(nombre, url, latencia, codigo, descripcion) cuando se detecta un error

(function () {
  // Guarda el último error notificado por sitio y hora (en memoria, por sesión)
  const erroresNotificados = {};

  // Devuelve la clave de hora actual (ej: 2025-12-15-14)
  function horaActualClave() {
    const ahora = new Date();
    return (
      ahora.getFullYear() +
      '-' +
      (ahora.getMonth() + 1) +
      '-' +
      ahora.getDate() +
      '-' +
      ahora.getHours()
    );
  }

  // Función global para registrar un error y mostrar alert si corresponde
  window.registrarErrorSitio = function (
    nombre,
    url,
    latencia,
    codigo,
    descripcion
  ) {
    const clave = nombre + '|' + horaActualClave();
    if (erroresNotificados[clave]) return; // Ya se notificó este sitio en esta hora
    erroresNotificados[clave] = true;
    let mensaje = `ALERTA: Error detectado en "${nombre}"\n`;
    mensaje += `URL: ${url}\n`;
    if (latencia !== undefined) mensaje += `Latencia: ${latencia} ms\n`;
    mensaje += `Código: ${codigo}\n`;
    if (descripcion) mensaje += `Descripción: ${descripcion}`;
    alert(mensaje);
  };
})();
