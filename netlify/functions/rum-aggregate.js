// Returns aggregated RUM metrics from in-memory cache (per-instance)
exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Use the same global cache used by rum-collect
  const cache = global.__rumCache || {};

  function percentile(arr, p) {
    if (!arr || arr.length === 0) return 0;
    const sorted = arr.slice().sort((a, b) => a - b);
    const idx = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(idx);
    const upper = Math.ceil(idx);
    if (lower === upper) return Math.round(sorted[lower]);
    const weight = idx - lower;
    return Math.round(sorted[lower] * (1 - weight) + sorted[upper] * weight);
  }

  const result = {};

  for (const url in cache) {
    const entries = cache[url] || [];
    const times = [];
    let failures = 0;

    entries.forEach((e) => {
      // Prefer paint FCP if available, else navigation.responseStart, else nav.load
      let t = null;
      try {
        if (e.paints && e.paints['first-contentful-paint']) {
          t = Number(e.paints['first-contentful-paint']);
        } else if (e.nav && e.nav.responseStart) {
          t = Number(e.nav.responseStart);
        } else if (e.nav && e.nav.load) {
          t = Number(e.nav.load);
        }
      } catch (ex) {
        t = null;
      }

      if (t && Number.isFinite(t) && t > 0) {
        times.push(t);
      } else {
        failures++;
      }
    });

    const count = entries.length;
    const p50 = percentile(times, 50);
    const p95 = percentile(times, 95);
    const failureRate = count > 0 ? Math.round((failures / count) * 100) : 0;

    result[url] = {
      count,
      p50,
      p95,
      failureRate,
    };
  }

  return { statusCode: 200, headers, body: JSON.stringify(result) };
};
