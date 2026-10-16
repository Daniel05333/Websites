// Rijschool Linkerbaan — interacties. Geen dependencies; de site werkt ook zonder JS
// (links, FAQ via <details>, formulier valt terug op browservalidatie).
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* Header: rand/achtergrond na scrollen */
  const header = $('[data-header]');
  const onScroll = () => header?.classList.toggle('is-scrolled', window.scrollY > 12);
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
    menu.classList.toggle('is-open', open);
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
  window.matchMedia('(min-width: 1021px)').addEventListener('change', (e) => e.matches && setMenu(false));

  /* Secties verschijnen bij scrollen */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('is-visible');
            io.unobserve(en.target);
          }
        }),
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    reveals.forEach((el) => io.observe(el));
  } else reveals.forEach((el) => el.classList.add('is-visible'));

  /* Sticky mobiele CTA verbergen zodra een formulier of de footer in beeld is */
  const sticky = $('[data-sticky-cta]');
  const blockers = $$('[data-form-card], .site-footer, .hero__actions');
  if (sticky && blockers.length && 'IntersectionObserver' in window) {
    const visible = new Set();
    const io2 = new IntersectionObserver((entries) => {
      entries.forEach((en) => (en.isIntersecting ? visible.add(en.target) : visible.delete(en.target)));
      sticky.classList.toggle('is-hidden', visible.size > 0);
    });
    blockers.forEach((el) => io2.observe(el));
  }

  /* Proeflesformulier */
  const icons = {
    check: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
    send: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 3 10 14M21 3l-7 18-4-7-7-4z"/></svg>',
    alert: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/></svg>',
  };
  const escHtml = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  const rules = {
    naam: (v) => (v.trim().length < 2 ? 'Vul je naam in.' : ''),
    telefoon: (v) => {
      const digits = v.replace(/[^\d+]/g, '');
      if (!v.trim()) return 'Vul je telefoonnummer in, zodat Furkan je kan bereiken.';
      return /^(\+|00)?\d{9,14}$/.test(digits) ? '' : 'Dit lijkt geen geldig telefoonnummer. Bijvoorbeeld: 06 12345678.';
    },
    email: (v) => (v.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? 'Controleer je e-mailadres, bijvoorbeeld: naam@voorbeeld.nl.' : ''),
  };

  $$('[data-trial-form]').forEach((form) => {
    const card = form.closest('[data-form-card]');
    const result = $('[data-form-result]', card);
    const summary = $('[data-error-summary]', form);
    const submit = $('[data-submit]', form);

    // Pakketkeuze overnemen uit ?pakket=… (vanuit de tariefkaarten)
    const pkg = new URLSearchParams(location.search).get('pakket');
    if (pkg && form.pakket && [...form.pakket.options].some((o) => o.value === pkg)) form.pakket.value = pkg;

    const showError = (name, msg) => {
      const input = form.elements[name];
      const out = $(`[data-error-for="${name}"]`, form);
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (out) out.textContent = msg;
    };
    const validateField = (name) => {
      const msg = rules[name](form.elements[name].value);
      showError(name, msg);
      return msg;
    };
    Object.keys(rules).forEach((name) => {
      const input = form.elements[name];
      input.addEventListener('blur', () => input.value && validateField(name));
      input.addEventListener('input', () => input.getAttribute('aria-invalid') === 'true' && validateField(name));
    });

    const data = () => {
      const fd = new FormData(form);
      const pkgSel = form.pakket.selectedOptions[0];
      return {
        naam: fd.get('naam').trim(),
        telefoon: fd.get('telefoon').trim(),
        email: (fd.get('email') || '').trim(),
        contactvoorkeur: fd.get('contactvoorkeur'),
        pakket: fd.get('pakket') ? pkgSel.textContent : 'Weet ik nog niet',
        woonplaats: fd.get('woonplaats') || '',
        bericht: (fd.get('bericht') || '').trim(),
        pagina: location.pathname,
      };
    };
    const toText = (d) =>
      [
        'Proefles aanvraag',
        `Naam: ${d.naam}`,
        `Telefoon: ${d.telefoon}`,
        d.email && `E-mail: ${d.email}`,
        `Contactvoorkeur: ${d.contactvoorkeur}`,
        `Pakket: ${d.pakket}`,
        d.woonplaats && `Woonplaats: ${d.woonplaats}`,
        d.bericht && `Bericht: ${d.bericht}`,
      ]
        .filter(Boolean)
        .join('\n');

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

    // Zonder gekoppelde backend: de aanvraag eerlijk laten versturen via WhatsApp of e-mail.
    const showHandoff = (d) => {
      const text = toText(d);
      const wa = `https://wa.me/${form.dataset.whatsapp}?text=${encodeURIComponent(text)}`;
      const mail = `mailto:${form.dataset.email}?subject=${encodeURIComponent('Proefles aanvraag: ' + d.naam)}&body=${encodeURIComponent(text)}`;
      show(`
        <div class="form-result__icon">${icons.send}</div>
        <h3>Nog één stap: verstuur je aanvraag</h3>
        <p>Je gegevens zijn compleet. Kies hoe je ze naar Furkan stuurt; je bericht staat al klaar.</p>
        <div class="form-result__actions">
          <a class="btn btn--primary btn--block" href="${wa}" target="_blank" rel="noopener">Verstuur via WhatsApp</a>
          <a class="btn btn--ghost btn--block" href="${mail}">Verstuur via e-mail</a>
        </div>
        <p class="form-result__summary">${escHtml(text)}</p>
        <button type="button" class="form-result__back" data-back>Gegevens aanpassen</button>`);
    };

    const showSuccess = (d) =>
      show(`
        <div class="form-result__icon">${icons.check}</div>
        <h3>Bedankt, ${escHtml(d.naam.split(' ')[0])}!</h3>
        <p>Je aanvraag is verstuurd. Furkan neemt ${d.contactvoorkeur === 'E-mail' && d.email ? 'per e-mail' : d.contactvoorkeur === 'WhatsApp' ? 'via WhatsApp' : 'telefonisch'} contact met je op om je proefles te plannen.</p>
        <p>Intussen alvast rondkijken? <a href="/tarieven/">Bekijk de lespakketten</a>.</p>`);

    const showFailure = (d) => {
      const text = toText(d);
      show(
        `
        <div class="form-result__icon">${icons.alert}</div>
        <h3>Versturen is niet gelukt</h3>
        <p>Er ging iets mis aan onze kant, je aanvraag is <strong>niet</strong> aangekomen. Probeer het opnieuw, of stuur je aanvraag direct:</p>
        <div class="form-result__actions">
          <a class="btn btn--primary btn--block" href="https://wa.me/${form.dataset.whatsapp}?text=${encodeURIComponent(text)}" target="_blank" rel="noopener">Verstuur via WhatsApp</a>
          <a class="btn btn--ghost btn--block" href="mailto:${form.dataset.email}?subject=${encodeURIComponent('Proefles aanvraag: ' + d.naam)}&body=${encodeURIComponent(text)}">Verstuur via e-mail</a>
        </div>
        <button type="button" class="form-result__back" data-back>Terug naar het formulier</button>`,
        'form-result--error'
      );
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (form.website.value) return; // honeypot: stil negeren

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

      submit.setAttribute('aria-busy', 'true');
      submit.querySelector('span').textContent = 'Bezig met versturen…';
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
        submit.querySelector('span').textContent = 'Vraag je proefles aan';
      }
    });
  });
})();
