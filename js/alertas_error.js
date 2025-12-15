// alertas_error.js
// Muestra un alert en el frontend solo la primera vez que un sitio da error en una hora
// Requiere que se llame a window.registrarErrorSitio(nombre, url, latencia, codigo, descripcion) cuando se detecta un error
(function () {
  // Guarda el último error notificado por sitio y hora (en memoria, por sesión)
  // Usa localStorage para persistir los errores notificados por sitio y hora
  // (Eliminada función duplicada getErroresNotificados)
  function getErroresNotificados() {
    try {
      return (
        JSON.parse(localStorage.getItem('erroresNotificadosMonitor')) || {}
      );
    } catch (e) {
      return {};
    }
  }
  function setErroresNotificados(obj) {
    try {
      localStorage.setItem('erroresNotificadosMonitor', JSON.stringify(obj));
    } catch (e) {}
  }

  // Función para limpiar el registro de error de un sitio (cuando se recupera)
  window.limpiarErrorSitio = function (nombre) {
    const erroresNotificados = getErroresNotificados();
    if (erroresNotificados[nombre]) {
      delete erroresNotificados[nombre];
      setErroresNotificados(erroresNotificados);
    }
  };
  // (Eliminado código suelto de ciclo y contador)

  // Función global para registrar un error y mostrar alert si corresponde
  window.registrarErrorSitio = function (
    nombre,
    url,
    latencia,
    codigo,
    descripcion
  ) {
    const clave = nombre;
    const erroresNotificados = getErroresNotificados();
    if (erroresNotificados[clave]) return; // Ya se notificó este sitio hasta que se recupere
    erroresNotificados[clave] = true;
    setErroresNotificados(erroresNotificados);
    let label = '',
      desc = '';
    if (
      window.TEXTOS_ACTUAL &&
      window.TEXTOS_ACTUAL.httpStatus &&
      window.TEXTOS_ACTUAL.httpCodes
    ) {
      const info = window.TEXTOS_ACTUAL.httpCodes.find(
        (e) => e.code === codigo
      );
      if (info) {
        label = info.label;
        desc = info.description;
      }
    }
    let mensaje = `ALERTA: Error detectado en "${nombre}"\n`;
    mensaje += `URL: ${url}\n`;
    if (latencia !== undefined) mensaje += `Latencia: ${latencia} ms\n`;
    mensaje += `Código: ${codigo}`;
    if (label) mensaje += ` - ${label}`;
    mensaje += `\n`;
    if (desc) mensaje += `Descripción: ${desc}`;
    else if (descripcion) mensaje += `Descripción: ${descripcion}`;
    mostrarNotificacionError(mensaje);
  };

  // Crea una notificación flotante con el mensaje y botón de copiar
  function mostrarNotificacionError(mensaje) {
    // Crear contenedor si no existe
    let contenedor = document.getElementById('notificaciones-errores');
    if (!contenedor) {
      contenedor = document.createElement('div');
      contenedor.id = 'notificaciones-errores';
      contenedor.style.position = 'fixed';
      contenedor.style.top = '20px';
      contenedor.style.right = '20px';
      contenedor.style.zIndex = '9999';
      contenedor.style.maxWidth = '400px';
      contenedor.style.fontFamily = 'monospace';
      document.body.appendChild(contenedor);
    }

    // Crear la notificación
    const notif = document.createElement('div');
    notif.style.background = '#fff3cd';
    notif.style.border = '1px solid #ffeeba';
    notif.style.color = '#856404';
    notif.style.padding = '12px 12px 8px 12px';
    notif.style.marginBottom = '10px';
    notif.style.borderRadius = '6px';
    notif.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
    notif.style.whiteSpace = 'pre-line';
    notif.style.position = 'relative';

    // Texto seleccionable
    const texto = document.createElement('div');
    texto.textContent = mensaje;
    texto.style.userSelect = 'text';
    notif.appendChild(texto);

    // Botón copiar
    const btnCopiar = document.createElement('button');
    btnCopiar.textContent = 'Copiar';
    btnCopiar.style.marginTop = '8px';
    btnCopiar.style.marginRight = '8px';
    btnCopiar.style.float = 'right';
    btnCopiar.onclick = function () {
      navigator.clipboard.writeText(mensaje);
      btnCopiar.textContent = '¡Copiado!';
      setTimeout(() => {
        btnCopiar.textContent = 'Copiar';
      }, 1500);
    };
    notif.appendChild(btnCopiar);

    // Botón cerrar
    const btnCerrar = document.createElement('button');
    btnCerrar.textContent = '×';
    btnCerrar.style.position = 'absolute';
    btnCerrar.style.top = '4px';
    btnCerrar.style.right = '6px';
    btnCerrar.style.background = 'none';
    btnCerrar.style.border = 'none';
    btnCerrar.style.fontSize = '18px';
    btnCerrar.style.cursor = 'pointer';
    btnCerrar.onclick = function () {
      contenedor.removeChild(notif);
    };
    notif.appendChild(btnCerrar);

    contenedor.appendChild(notif);
    // Auto-cerrar después de 30 segundos
    setTimeout(() => {
      if (contenedor.contains(notif)) contenedor.removeChild(notif);
    }, 30000);
  }
})();
