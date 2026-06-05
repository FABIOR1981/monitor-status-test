// RUM (Real User Monitoring) minimal client
(function () {
  const ENDPOINT = '/.netlify/functions/rum-collect';

  function collectAndSend(label) {
    try {
      const nav = (performance.getEntriesByType && performance.getEntriesByType('navigation') && performance.getEntriesByType('navigation')[0]) || {};
      const paints = {};
      if (performance.getEntriesByType) {
        performance.getEntriesByType('paint').forEach((p) => {
          paints[p.name] = Math.round(p.startTime);
        });
      }

      const resources = (performance.getEntriesByType
        ? performance.getEntriesByType('resource').slice(0, 10).map((r) => ({
            name: r.name,
            initiatorType: r.initiatorType,
            duration: Math.round(r.duration),
            transferSize: r.transferSize || null,
            responseStart: Math.round(r.responseStart || 0),
          }))
        : []);

      const connection = navigator.connection || {};

      const payload = {
        url: location.href,
        ts: Date.now(),
        label: label || null,
        nav: {
          responseStart: Math.round(nav.responseStart || 0),
          domContentLoaded: Math.round(nav.domContentLoadedEventEnd || 0),
          load: Math.round(nav.loadEventEnd || 0),
          fetchStart: Math.round(nav.fetchStart || 0),
        },
        paints: paints,
        resources: resources,
        connection: {
          effectiveType: connection.effectiveType || null,
          rtt: connection.rtt || null,
          downlink: connection.downlink || null,
        },
        ua: navigator.userAgent,
      };

      const body = JSON.stringify(payload);

      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: 'application/json' });
        navigator.sendBeacon(ENDPOINT, blob);
      } else {
        // fallback
        fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: body,
          keepalive: true,
        }).catch(() => {});
      }
    } catch (e) {
      // no-op
    }
  }

  window.addEventListener('load', function () {
    // Small delay to allow paint entries to settle
    setTimeout(function () {
      collectAndSend('load');
    }, 1200);
  });

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') {
      collectAndSend('hidden-unload');
    }
  });

  if (typeof PerformanceObserver !== 'undefined' && PerformanceObserver.supportedEntryTypes && PerformanceObserver.supportedEntryTypes.includes('paint')) {
    try {
      const obs = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            collectAndSend('fcp');
          }
        });
      });
      obs.observe({ type: 'paint', buffered: true });
    } catch (e) {
      // ignore
    }
  }
})();
