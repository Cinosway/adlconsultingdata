(function () {
  const raw = window.__DATA || {};
  const calcs = {};
  const handlers = [];
  const cache = {};
  function resolve(id) {
    if (cache[id]) return cache[id];
    if (raw[id]) {
      const rows = raw[id];
      return (cache[id] = {status: 'ok', data: rows, columns: rows.length ? Object.keys(rows[0]) : [], message: '', refreshing: false, meta: [], rows});
    }
    if (calcs[id]) {
      try {
        const args = calcs[id].inputs.map(i => resolve(i).data);
        const out = calcs[id].fn.apply(null, args);
        return (cache[id] = {status: 'ok', data: out, columns: Array.isArray(out) && out.length ? Object.keys(out[0]) : [], message: '', refreshing: false, meta: [], rows: out});
      } catch (e) {
        console.error('calc', id, e);
        return (cache[id] = {status: 'error', data: [], columns: [], message: String(e), refreshing: false, meta: []});
      }
    }
    return {status: 'missing', data: [], columns: [], message: '', refreshing: false, meta: []};
  }
  const css = getComputedStyle(document.documentElement);
  window.dash = {
    data: resolve,
    calc: (id, def) => { calcs[id] = def; },
    loader: () => {},
    onData: fn => { handlers.push(fn); },
    colors: ['--s0', '--s1', '--s2', '--s3', '--s4', '--s5', '--s6', '--s7'].map(v => css.getPropertyValue(v).trim()),
    refresh: () => {}, params: () => ({}), setParams: () => {}, resetParams: () => {},
    setLink: name => { try { history.replaceState(null, '', '#' + name); } catch (e) {} },
  };
  let t = null;
  const run = () => handlers.forEach(fn => { try { fn(); } catch (e) { console.error(e); } });
  window.addEventListener('load', run);
  window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(run, 150); });
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  if (mq.addEventListener) mq.addEventListener('change', () => location.reload());
})();
