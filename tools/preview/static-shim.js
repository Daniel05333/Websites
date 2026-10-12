/* VOLKARA static preview shim: replays harness responses recorded by export-static.mjs so the
   cart drawer, filters, predictive search and recommendations work without a server. Not part of the theme. */
(() => {
  const S = window.__VK_STATIC || { routes: {}, defaultSort: 'manual' };
  const fileToRoute = Object.fromEntries(Object.entries(S.routes).map(([r, f]) => [f, r]));
  const nativeFetch = window.fetch.bind(window);
  const stores = {};
  const bucket = (b) => (stores[b] ||= nativeFetch(`assets/vk-static-${b}.json`).then((r) => (r.ok ? r.json() : {})).catch(() => ({})));
  const keyOf = (u, defaultSort) => { const url = new URL(u, 'http://x'); url.searchParams.delete('section_id'); if (url.searchParams.get('sort_by') === defaultSort) url.searchParams.delete('sort_by'); url.searchParams.sort(); return `${url.pathname}?${url.searchParams}`; };
  const respond = (body, status = 200, type = 'text/html') => new Response(body, { status, headers: { 'Content-Type': type } });
  const json = (obj, status = 200) => respond(typeof obj === 'string' ? obj : JSON.stringify(obj), status, 'application/json');
  let lastAdd = null;

  function toast(msg) {
    let el = document.querySelector('.vk-preview-toast');
    if (!el) { el = document.createElement('div'); el.className = 'vk-preview-toast'; el.setAttribute('role', 'status'); document.body.append(el); }
    el.textContent = msg; el.classList.add('is-on'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('is-on'), 2600);
  }

  window.fetch = async (input, init = {}) => {
    const url = new URL(typeof input === 'string' ? input : input.url, location.href);
    const p = url.pathname;
    if (p.endsWith('/cart/add.js')) {
      const data = await bucket('cart');
      const b = init.body;
      let id = null;
      if (b instanceof FormData) id = b.get('id') || b.get('items[0][id]');
      else if (typeof b === 'string') { try { const j = JSON.parse(b); id = j.id || j.items?.[0]?.id; } catch (_) {} }
      const hit = data[`add|${id}`];
      if (!hit) return json({ status: 422, description: 'Dit product is niet opgenomen in de preview.' }, 422);
      lastAdd = hit; return json(hit);
    }
    if (p.endsWith('/cart/change.js')) {
      const data = await bucket('cart');
      let q = 0; try { q = Number(JSON.parse(init.body).quantity); } catch (_) {}
      return json(q === 0 || !lastAdd ? data['change|empty'] : lastAdd);
    }
    if (p.endsWith('/cart/update.js') || p.endsWith('/cart.js')) return json('{}');
    if (p.endsWith('/search/suggest')) {
      const data = await bucket('search');
      const q = (url.searchParams.get('q') || '').trim().toLowerCase();
      const terms = Object.keys(data).filter((k) => k.startsWith('search|')).map((k) => k.slice(7));
      const t = terms.find((x) => x === q) || terms.find((x) => x.startsWith(q)) || terms.filter((x) => q.startsWith(x)).sort((a, b) => b.length - a.length)[0];
      return respond(t ? data[`search|${t}`] : '<div data-predictive-search-results><p class="vk-muted" style="padding:1rem">Probeer in de preview: pan, wok, set, knife…</p></div>');
    }
    if (p.startsWith('/recommendations')) {
      const data = await bucket('recs');
      return respond(data[`|${keyOf(url.pathname + url.search, 'manual')}`] || '');
    }
    const sid = url.searchParams.get('section_id');
    if (sid) {
      const route = fileToRoute[p.split('/').pop()] || S.route;
      const data = await bucket(`facets-${route.split('/').pop()}`);
      const hit = data[`${sid}|${keyOf(route + url.search, S.defaultSort)}`];
      if (hit) return respond(hit);
      toast('Deze filtercombinatie zit niet in de preview. Probeer één filter tegelijk.');
      return respond('');
    }
    return nativeFetch(input, init);
  };

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href="#vk-preview-na"]');
    if (a && !e.defaultPrevented) { e.preventDefault(); toast('Deze pagina bestaat pas in de echte Shopify-winkel.'); }
  });
  document.addEventListener('submit', (e) => {
    if (e.defaultPrevented) return;
    const f = e.target; const action = f.getAttribute('action') || '';
    if ((f.method || 'get').toLowerCase() === 'get' && action.endsWith('.html')) return;
    e.preventDefault();
    const isCheckout = e.submitter && e.submitter.name === 'checkout';
    toast(isCheckout ? 'Afrekenen gebeurt straks in de Shopify-checkout.' : 'Formulieren werken pas in de echte Shopify-winkel.');
  });

  const css = document.createElement('style');
  css.textContent = `
    .vk-preview-bar { position: relative; z-index: 100; display: flex; flex-wrap: wrap; gap: .25rem 1rem; align-items: center; justify-content: center; padding: .5rem 1rem; background: #F7F5F2; color: #080808; font: 500 12px/1.4 "Inter", system-ui, sans-serif; text-align: center; }
    .vk-preview-bar strong { font-weight: 700; letter-spacing: .08em; text-transform: uppercase; font-size: 11px; }
    .vk-preview-bar select { font: inherit; padding: .3rem 1.6rem .3rem .6rem; border-radius: 999px; border: 1px solid rgba(8,8,8,.25); background: #fff; color: #080808; }
    .vk-preview-bar span { color: rgba(8,8,8,.65); }
    .vk-preview-toast { position: fixed; left: 50%; bottom: calc(1.5rem + env(safe-area-inset-bottom, 0px)); z-index: 200; max-width: calc(100% - 2rem); padding: .8rem 1.2rem; border-radius: 999px; background: #F7F5F2; color: #080808; font: 500 14px/1.4 "Inter", system-ui, sans-serif; box-shadow: 0 12px 40px -12px rgba(0,0,0,.6); transform: translate(-50%, 20px); opacity: 0; pointer-events: none; transition: opacity .3s, transform .3s; }
    .vk-preview-toast.is-on { opacity: 1; transform: translate(-50%, 0); }`;
  document.head.append(css);
})();
