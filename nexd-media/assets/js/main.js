// NEXD Media — interacties. De site werkt volledig zonder JavaScript: links, FAQ (<details>),
// alle pakketten zichtbaar, het formulier valt terug op browservalidatie. Dit script voegt toe.
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasIO = 'IntersectionObserver' in window;

  /* Header: achtergrond na scrollen */
  const header = $('[data-header]');
  const onScroll = () => header?.classList.toggle('is-scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Mobiel menu */
  const toggle = $('[data-menu-toggle]');
  const menu = $('[data-menu]');
  const label = $('[data-menu-label]');
  const setMenu = (open) => {
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', String(open));
    label.textContent = open ? 'Menu sluiten' : 'Menu openen';
    menu.hidden = !open;
    header.classList.toggle('menu-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) menu.querySelector('a')?.focus();
  };
  toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      toggle.focus();
    }
  });
  menu?.addEventListener('click', (e) => e.target.closest('a') && setMenu(false));
  window.matchMedia('(min-width: 1081px)').addEventListener('change', (e) => e.matches && setMenu(false));

  /* Secties verschijnen bij scrollen (één bewegingstaal: korte opwaartse fade) */
  const reveals = $$('.reveal');
  if (hasIO && !reduced) {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('is-visible');
            io.unobserve(en.target);
          }
        }),
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 }
    );
    reveals.forEach((el) => io.observe(el));
  } else reveals.forEach((el) => el.classList.add('is-visible'));

  /* Aanpak: de laag van de stap die in beeld is, schuift op zijn plek. Geen scrolljacking:
     de pagina scrollt normaal, de visual volgt alleen. */
  const stack = $('[data-stack]');
  if (stack && hasIO) {
    const steps = $$('[data-step-trigger]');
    const setStep = (n) => {
      stack.dataset.step = n;
      steps.forEach((s) => s.classList.toggle('is-active', Number(s.dataset.stepTrigger) === n));
    };
    setStep(1);
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => en.isIntersecting && setStep(Number(en.target.dataset.stepTrigger))),
      { rootMargin: '-45% 0px -45% 0px' }
    );
    steps.forEach((s) => io.observe(s));
  }

  /* Keuzehulp: toon het plan dat bij de gekozen situatie past */
  $$('[data-chooser]').forEach((ch) => {
    const panels = $$('[data-plan]', ch);
    const show = () => {
      const val = $('input:checked', ch)?.value;
      panels.forEach((p) => (p.hidden = p.dataset.plan !== val));
    };
    ch.classList.add('is-enhanced');
    ch.addEventListener('change', show);
    show();
  });

  /* Sticky mobiele CTA verbergen bij hero, formulier en footer */
  const sticky = $('[data-sticky-cta]');
  const blockers = $$('.hero, .page-hero, [data-form-card], .final-cta, .site-footer');
  if (sticky && hasIO) {
    const visible = new Set();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => (en.isIntersecting ? visible.add(en.target) : visible.delete(en.target)));
      sticky.classList.toggle('is-hidden', visible.size > 0);
    });
    blockers.forEach((el) => io.observe(el));
  }

  /* 3D-hero: alleen laden als het apparaat het aankan en de bezoeker geen beperkte beweging wil.
     Tot die tijd (en anders altijd) staat de statische SVG-compositie er. */
  const stage = $('[data-engine]');
  const webgl = () => {
    try {
      const c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
    } catch {
      return false;
    }
  };
  const saveData = navigator.connection?.saveData;
  if (stage && !reduced && !saveData && webgl()) {
    const lowPower = window.innerWidth < 768 || (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
    const boot = () =>
      import(stage.dataset.src)
        .then((m) => {
          m.mount(stage, { lowPower });
          requestAnimationFrame(() => stage.classList.add('is-live'));
        })
        .catch(() => {}); // fallback blijft gewoon staan
    const idle = () => (window.requestIdleCallback ? requestIdleCallback(boot, { timeout: 2500 }) : setTimeout(boot, 400));
    document.readyState === 'complete' ? idle() : window.addEventListener('load', idle, { once: true });
  }

  /* Contactformulier */
  const icons = {
    check: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
    send: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 3 10 14M21 3l-7 18-4-7-7-4z"/></svg>',
    alert: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/></svg>',
  };
  const escHtml = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const rules = {
    naam: (v) => (v.trim().length < 2 ? 'Vul je naam in.' : ''),
    email: (v) =>
      !v.trim() ? 'Vul je e-mailadres in, zodat we kunnen reageren.' : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Controleer je e-mailadres, bijvoorbeeld: naam@bedrijf.nl.',
    telefoon: (v) => (!v.trim() || /^(\+|00)?\d{9,14}$/.test(v.replace(/[\s\-()]/g, '')) ? '' : 'Dit lijkt geen geldig telefoonnummer. Bijvoorbeeld: 06 12345678.'),
    bericht: (v) => (v.trim().length < 10 ? 'Vertel kort waar je tegenaan loopt (minimaal 10 tekens).' : ''),
  };

  $$('[data-contact-form]').forEach((form) => {
    const card = form.closest('[data-form-card]');
    const result = $('[data-form-result]', card);
    const summary = $('[data-error-summary]', form);
    const submit = $('[data-submit]', form);

    // Projectkeuze overnemen uit ?project=… (vanuit pakketten en dienstenpagina's)
    const pre = new URLSearchParams(location.search).get('project');
    if (pre && [...form.project.options].some((o) => o.value === pre)) form.project.value = pre;

    const validateField = (name) => {
      const msg = rules[name](form.elements[name].value);
      form.elements[name].setAttribute('aria-invalid', msg ? 'true' : 'false');
      $(`[data-error-for="${name}"]`, form).textContent = msg;
      return msg;
    };
    Object.keys(rules).forEach((name) => {
      const input = form.elements[name];
      input.addEventListener('blur', () => input.value && validateField(name));
      input.addEventListener('input', () => input.getAttribute('aria-invalid') === 'true' && validateField(name));
    });

    const data = () => {
      const fd = new FormData(form);
      return {
        naam: fd.get('naam').trim(),
        bedrijf: (fd.get('bedrijf') || '').trim(),
        email: fd.get('email').trim(),
        telefoon: (fd.get('telefoon') || '').trim(),
        project: form.project.selectedOptions[0].textContent,
        bericht: fd.get('bericht').trim(),
        pagina: location.pathname,
      };
    };
    const toText = (d) =>
      [
        'Aanvraag via nexdmedia.com',
        `Naam: ${d.naam}`,
        d.bedrijf ? `Bedrijf: ${d.bedrijf}` : null,
        `E-mail: ${d.email}`,
        d.telefoon ? `Telefoon: ${d.telefoon}` : null,
        `Onderwerp: ${d.project}`,
        '',
        d.bericht,
      ]
        .filter((l) => l !== null)
        .join('\n');
    const handoffLinks = (d) => {
      const text = toText(d);
      return {
        mail: `mailto:${form.dataset.email}?subject=${encodeURIComponent('Aanvraag: ' + (d.bedrijf || d.naam))}&body=${encodeURIComponent(text)}`,
        wa: `https://wa.me/${form.dataset.whatsapp}?text=${encodeURIComponent(text)}`,
      };
    };

    const show = (html, variant = '') => {
      result.className = `form-result ${variant}`;
      result.innerHTML = html;
      form.hidden = true;
      result.hidden = false;
      result.focus();
      $('[data-back]', result)?.addEventListener('click', () => {
        result.hidden = true;
        form.hidden = false;
        form.elements.naam.focus();
      });
    };

    // Zonder gekoppelde backend: geen nepbevestiging, maar de bezoeker verstuurt het bericht zelf.
    const showHandoff = (d) => {
      const l = handoffLinks(d);
      show(`
        <div class="form-result__icon">${icons.send}</div>
        <h2 class="h3">Nog één stap: verstuur je bericht</h2>
        <p>Je bericht staat klaar. Kies hoe je het naar ons stuurt; je gegevens zijn al ingevuld.</p>
        <div class="form-result__actions">
          <a class="btn btn--primary btn--block" href="${l.mail}"><span>Verstuur via e-mail</span></a>
          <a class="btn btn--ghost btn--block" href="${l.wa}" target="_blank" rel="noopener"><span>Verstuur via WhatsApp</span></a>
        </div>
        <pre class="form-result__summary">${escHtml(toText(d))}</pre>
        <button type="button" class="form-result__back" data-back>Gegevens aanpassen</button>`);
    };
    const showSuccess = (d) =>
      show(`
        <div class="form-result__icon">${icons.check}</div>
        <h2 class="h3">Bedankt, ${escHtml(d.naam.split(' ')[0])}.</h2>
        <p>Je bericht is verstuurd. We nemen contact met je op via ${escHtml(d.email)}${d.telefoon ? ' of telefonisch' : ''} om een kennismaking te plannen.</p>`);
    const showFailure = (d) => {
      const l = handoffLinks(d);
      show(
        `
        <div class="form-result__icon">${icons.alert}</div>
        <h2 class="h3">Versturen is niet gelukt</h2>
        <p>Er ging iets mis; je bericht is <strong>niet</strong> aangekomen. Probeer het opnieuw, of stuur het direct:</p>
        <div class="form-result__actions">
          <a class="btn btn--primary btn--block" href="${l.mail}"><span>Verstuur via e-mail</span></a>
          <a class="btn btn--ghost btn--block" href="${l.wa}" target="_blank" rel="noopener"><span>Verstuur via WhatsApp</span></a>
        </div>
        <button type="button" class="form-result__back" data-back>Terug naar het formulier</button>`,
        'form-result--error'
      );
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (form.website.value) return; // honeypot
      const errors = Object.keys(rules)
        .map((name) => [name, validateField(name)])
        .filter(([, msg]) => msg);
      if (errors.length) {
        summary.innerHTML = `<strong>Controleer ${errors.length === 1 ? 'dit veld' : 'deze velden'}:</strong><ul>${errors
          .map(([name, msg]) => `<li><a href="#${form.elements[name].id}">${msg}</a></li>`)
          .join('')}</ul>`;
        summary.hidden = false;
        summary.focus();
        $$('a', summary).forEach((a) =>
          a.addEventListener('click', (ev) => {
            ev.preventDefault();
            form.querySelector(a.getAttribute('href')).focus();
          })
        );
        return;
      }
      summary.hidden = true;
      const d = data();
      const endpoint = form.dataset.endpoint;
      if (!endpoint) return showHandoff(d);

      const label = submit.querySelector('span');
      submit.setAttribute('aria-busy', 'true');
      submit.disabled = true;
      label.textContent = 'Bezig met versturen…';
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(d),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        form.reset();
        showSuccess(d);
      } catch {
        showFailure(d);
      } finally {
        submit.removeAttribute('aria-busy');
        submit.disabled = false;
        label.textContent = 'Verstuur je vraag';
      }
    });
  });
})();
