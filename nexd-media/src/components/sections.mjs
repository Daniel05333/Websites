import { site, engineStages, packages, cases, team, process } from '../data/site.mjs';
import { services, serviceByKey } from '../data/services.mjs';
import { routeStages } from '../data/route.mjs';
import { icon } from './icons.mjs';
import { btn, brackets, esc, euro, waHref, telHref, mailHref, stripTags } from './layout.mjs';

const ext = 'target="_blank" rel="noopener"';
const pad = (n) => String(n).padStart(2, '0');
const nl = (n) => n.toLocaleString('nl-NL');

/* ------------------------------------------------------------------ */
/* Conversion Engine: statische SVG-versie (fallback én eerste weergave) */
/* ------------------------------------------------------------------ */

const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

export const engineSvg = (id = 'eg') => {
  const r = rng(7);
  const frames = [0, 1, 2, 3].map((i) => {
    const cx = 250 + i * 140;
    const h = 330 - i * 62;
    const w = 66 - i * 9;
    const cy = 330;
    const sk = h * 0.09;
    return `${cx - w},${cy - h / 2} ${cx + w},${cy - h / 2 + sk} ${cx + w},${cy + h / 2 - sk} ${cx - w},${cy + h / 2}`;
  });
  const dots = [];
  for (let k = 0; k < 230; k++) {
    const t = Math.pow(r(), 0.75);
    const x = 40 + t * 700;
    const spread = 210 * (1 - t) + 12;
    const y = 330 + (r() - 0.5) * 2 * spread;
    if (!(r() > t * 0.85) && t > 0.25) continue;
    dots.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1.3 + r() * 1.6).toFixed(1)}"${t > 0.62 ? ' class="w"' : ''}/>`);
  }
  return `<svg class="engine-svg" viewBox="0 0 860 660" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
  <g class="engine-svg__frames">${frames.map((pts, i) => `<polygon points="${pts}" style="--i:${i}"/>`).join('')}</g>
  <g class="engine-svg__dots">${dots.join('')}</g>
  <rect class="engine-svg__core" x="796" y="312" width="48" height="36" rx="2" id="${id}-core"/>
</svg>`;
};

/* ------------------------------------------------------------------ */
/* Kleine bouwstenen                                                    */
/* ------------------------------------------------------------------ */

/** Een kop die per woord binnenkomt; regels als losse reveals, de punt apart in de accentkleur. */
const masthead = ({ id, lines, tag = 'h2', cls = '', dot = 'accent', delayStep = 130 }) => `
<${tag}${id ? ` id="${id}"` : ''} class="mast ${cls}">
  ${lines.map((l, i) => `<span class="mast__line" data-reveal="words" data-stagger="110" data-delay="${i * delayStep}">${l}${i === lines.length - 1 ? `<span class="mast__dot mast__dot--${dot}" data-reveal="fade" data-delay="${i * delayStep + 110}">.</span>` : ''}</span>`).join('')}
</${tag}>`;

const eyebrow = (text, dark = false) => `<p class="eyebrow${dark ? ' eyebrow--dark' : ''}">${text}</p>`;

/* ------------------------------------------------------------------ */
/* 1. Hero                                                              */
/* ------------------------------------------------------------------ */

export const homeHero = () => `
<section class="hero stack-layer" id="top" data-hero data-stack aria-labelledby="hero-title">
  <div class="stack-inner">
    <div class="hero__stage" data-engine data-src="/assets/js/engine.js?v=__V__" aria-hidden="true">
      <canvas class="contour-canvas hero__contours" data-contour="hero"></canvas>
      ${engineSvg()}
    </div>
    <div class="hero__ramp" aria-hidden="true"></div>
    <div class="hero__inner">
      <div class="hero__mid">
        <div class="hero__identity">
          <p class="hero__id" data-reveal="fade" data-delay="180" data-hero-reveal>nexd_media <span>/ legal &amp; finance</span></p>
          <h1 id="hero-title" class="hero__title" data-reveal="words" data-stagger="110" data-delay="180" data-hero-reveal>Je website moet meer doen dan er goed uitzien<span class="hero__dot">.</span></h1>
          <ul class="hero__meta">
            ${[
              ['scales', 'Specialist in advocatuur &amp; accountancy'],
              ['team', '6 specialisten in Oldenzaal'],
              ['clock', site.contact.responsePromise],
            ].map(([ic, label], i) => `<li data-reveal="rise" data-delay="${440 + i * 130}" data-hero-reveal>${metaIcon(ic)}<span>${label}</span></li>`).join('')}
          </ul>
        </div>
        <div class="hero__panels" data-reveal="rise" data-delay="900" data-hero-reveal>
          <div class="panel">
            ${brackets()}
            <p class="panel__eyebrow">${site.offer.title}</p>
            <dl class="panel__list">
              <dt>3 verbeterpunten</dt>
              <dd>voor je huidige website</dd>
              <dd><a href="/contact/?project=${site.offer.key}" class="panel__link" data-offer-link>Vraag hem aan →</a></dd>
            </dl>
          </div>
          <div class="panel">
            ${brackets()}
            <p class="panel__eyebrow">Pakketten vanaf</p>
            <dl class="panel__stats">
              ${packages.map((p, i) => `<div><dt>${p.key === 'optimaliseren' ? 'Optimaliseren' : p.key === 'standaard' ? 'Standaard' : 'Maatwerk'}</dt><dd><span class="panel__eur">€</span><span data-reveal="letters" data-stagger="26" data-delay="${900 + i * 90}" data-hero-reveal>${nl(p.price)}</span></dd></div>`).join('')}
            </dl>
          </div>
        </div>
      </div>
      <div class="hero__foot" data-reveal="rise" data-delay="1500" data-hero-reveal>
        <a class="hero__proof" href="#resultaten">${icon('arrowDown', 18)}<span><strong>Bekijk de resultaten</strong><small>3 klantcases</small></span></a>
        ${btn({ href: '/contact/', label: 'Bespreek je website' })}
        <ul class="hero__social">
          <li><a href="${site.social.linkedin}" ${ext}>LinkedIn</a></li>
          <li><a href="${waHref()}" ${ext}>WhatsApp</a></li>
          <li><a href="${telHref()}">Bel</a></li>
        </ul>
      </div>
    </div>
  </div>
  <div class="stack-shade" aria-hidden="true"></div>
</section>`;

function metaIcon(name) {
  const p = {
    scales: '<path d="M8 2v12M3 5h10M4 5 1.5 10h5zM12 5l-2.5 5h5zM5 14h6"/>',
    team: '<circle cx="5.5" cy="5" r="2.2"/><circle cx="11" cy="5.5" r="1.8"/><path d="M1.5 14c0-2.4 1.8-4 4-4s4 1.6 4 4M10 10.2c2 0 4.5 1.2 4.5 3.8"/>',
    clock: '<circle cx="8" cy="8" r="6.3"/><path d="M8 4.5V8l2.5 1.6"/>',
  }[name];
  return `<svg class="meta-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">${p}</svg>`;
}

/* ------------------------------------------------------------------ */
/* 2. Route: van bezoeker tot aanvraag (donker)                         */
/* ------------------------------------------------------------------ */

export const routeSection = () => {
  const proof = cases.map((c) => ({
    value: c.key === 'delta' ? '1 op 3' : c.key === 'countus' ? '124' : '+38%',
    label: c.key === 'delta' ? 'deals' : c.key === 'countus' ? 'aanvragen' : 'intakes',
    who: c.client.replace('Advocatenkantoor ', '').replace(' Accountants', '').replace('Consultancy Bureau ', ''),
  }));
  return `
<section class="route stack-layer" id="route" data-stack aria-labelledby="route-title">
  <div class="stack-inner">
    <canvas class="dissolve" data-dissolve="light" aria-hidden="true"></canvas>
    <div class="route__frame" aria-hidden="true"><div class="route__stage" data-route><canvas></canvas></div></div>
    <div class="route__copy">
      <div class="route__head">
        ${eyebrow('De NEXD-aanpak', true)}
        ${masthead({ id: 'route-title', lines: ['Van bezoeker', 'tot aanvraag'], cls: 'mast--accent', dot: 'white' })}
        <span class="rule" data-reveal="rule" data-delay="260"></span>
        <p class="route__intro" data-reveal="words" data-stagger="34" data-delay="350">Elke bezoeker legt een route af. Wij ontwerpen die route, zodat meer mensen de finish halen.</p>
      </div>
      <div class="route__foot">
        <ol class="route__stages">
          ${routeStages.map((s, i) => `<li data-reveal="rise" data-delay="${200 + i * 90}"><span class="route__n">${pad(i + 1)}</span><strong>${s.title}</strong><span>${s.text}</span></li>`).join('')}
        </ol>
        <div class="plate" data-reveal="rise" data-delay="260">
          <svg class="plate__frame" viewBox="0 0 277 78" preserveAspectRatio="none" aria-hidden="true"><path d="M0.5 0.5H276.5V69L268 77.5H0.5Z"/><path d="M83 0.5V77.5"/></svg>
          <div class="plate__badge"><img src="/assets/img/logo-x.png" alt="" width="30" height="24"><span><span data-reveal="letters" data-stagger="22" data-delay="430">NEXD</span> <em data-reveal="letters" data-stagger="22" data-delay="490">/ cases</em></span></div>
          <dl class="plate__stats">
            ${proof.map((p, i) => `<div><dt data-reveal="letters" data-stagger="22" data-delay="${430 + i * 110}">${p.value}</dt><dd data-reveal="letters" data-stagger="12" data-delay="${500 + i * 110}">${p.label} · ${p.who}</dd></div>`).join('')}
          </dl>
        </div>
      </div>
    </div>
  </div>
  <div class="stack-shade" aria-hidden="true"></div>
</section>`;
};

/* ------------------------------------------------------------------ */
/* 3. Werkwijze: tijdlijn met platen en rail (donker, laatste laag)      */
/* ------------------------------------------------------------------ */

const PLATE_OUTLINE =
  'M13.6168 0.497469H697.378C700.858 0.497469 704.195 1.38786 706.655 2.97277C709.115 4.55769 710.498 6.70729 710.498 8.94869V411.208C710.498 413.449 709.115 415.599 706.655 417.183C704.195 418.768 700.858 419.659 697.378 419.659H460.249C454.073 419.659 447.976 420.555 442.411 422.281C436.847 424.008 431.958 426.519 428.107 429.63L399.246 452.95C395.559 455.928 390.878 458.333 385.55 459.986C380.223 461.639 374.385 462.497 368.472 462.497H13.6168C10.1373 462.497 6.80038 461.607 4.34003 460.022C1.87968 458.437 0.497469 456.288 0.497469 454.046V8.94869C0.497469 6.70729 1.87968 4.55769 4.34003 2.97277C6.80038 1.38786 10.1373 0.497469 13.6168 0.497469Z';
const PLATE_CLIP =
  'M 0.01915,0.00107H 0.98085C 0.98574,0.00107 0.99044,0.00300 0.99390,0.00642C 0.99736,0.00984 0.99930,0.01449 0.99930,0.01933V 0.88815C 0.99930,0.89299 0.99736,0.89763 0.99390,0.90105C 0.99044,0.90448 0.98574,0.90640 0.98085,0.90640H 0.64733C 0.63864,0.90640 0.63007,0.90834 0.62224,0.91206C 0.61442,0.91579 0.60754,0.92122 0.60212,0.92794L 0.56153,0.97830C 0.55635,0.98474 0.54976,0.98993 0.54227,0.99350C 0.53478,0.99707 0.52656,0.99892 0.51825,0.99892H 0.01915C 0.01426,0.99892 0.00956,0.99700 0.00610,0.99358C 0.00264,0.99016 0.00070,0.98551 0.00070,0.98067V 0.01933C 0.00070,0.01449 0.00264,0.00984 0.00610,0.00642C 0.00956,0.00300 0.01426,0.00107 0.01915,0.00107Z';

const STEP_MOTIF = ['frame', 'heatmap', 'grid', 'blocks', 'lines', 'route', 'search'];

export const timelineSection = () => {
  // Centre, side, centre, side, … zoals de KIMI-tijdlijn; zijplaten wisselen links/rechts.
  const rows = process.map((p, i) => ({ ...p, n: i + 1, frame: i % 2 ? 'side' : 'centre', align: i % 4 === 1 ? 'right' : 'left' }));
  return `
<section class="timeline" id="werkwijze" data-stack-last aria-labelledby="werkwijze-title">
  <svg class="sr-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs><clipPath id="plate-clip" clipPathUnits="objectBoundingBox"><path d="${PLATE_CLIP}"/></clipPath></defs></svg>
  ${masthead({ id: 'werkwijze-title', lines: ['Van intake', 'tot livegang'], cls: 'mast--accent timeline__head', dot: 'white' })}
  <div class="timeline__rail" data-rail aria-hidden="true">
    <svg preserveAspectRatio="none"><line class="rail__solid"/><line class="rail__dash"/><rect class="rail__thread" x="7.5" width="1"/><rect class="rail__mark" width="9" height="9" x="-4.5" y="-4.5"/></svg>
  </div>
  <ol class="timeline__rows" data-rows>
    ${rows.map((r) => `
    <li class="tl-row tl-row--${r.frame}${r.frame === 'side' ? ` tl-row--${r.align}` : ''}" data-row>
      <div class="tl-layer" data-parallax="${r.frame === 'centre' ? 20 : 60}">
        <div class="tl-plate">
          <div class="tl-plate__fill">${motif(STEP_MOTIF[r.n - 1])}</div>
          <svg class="tl-plate__outline" viewBox="0 0 710.995 462.995" preserveAspectRatio="none" aria-hidden="true"><path d="${PLATE_OUTLINE}"/></svg>
        </div>
        <p class="tl-num" aria-hidden="true" data-reveal="letters" data-stagger="26" data-settle="${r.frame === 'centre' ? 1 : 0}">${pad(r.n)}</p>
      </div>
      <div class="tl-copy" data-parallax="${r.frame === 'centre' ? 110 : 40}">
        <h3><span class="visually-hidden">Stap ${r.n}: </span>${r.title}</h3>
        <p data-reveal="rise" data-delay="220">${r.text}</p>
      </div>
    </li>`).join('')}
  </ol>
  <p class="timeline__note">Een standaard website staat binnen 20 dagen online, een maatwerk website meestal binnen 4 tot 6 weken. De klok begint zodra je content en huisstijl compleet zijn.</p>
</section>`;
};

/* ------------------------------------------------------------------ */
/* 4. Cases: uit de praktijk (licht, kiesbare strip)                    */
/* ------------------------------------------------------------------ */

const caseFigure = (c) => {
  const m = c.metrics[0];
  const max = Math.max(m.before, m.after);
  return `
  <div class="score">
    <p class="score__figure"><span data-reveal="letters" data-stagger="40">${m.afterLabel ?? m.after}</span></p>
    <p class="score__label">${m.label}</p>
    <div class="score__bars" aria-hidden="true">
      <span class="score__bar" style="--w:${((m.before / max) * 100).toFixed(1)}%"><i></i><b>${m.beforeLabel ?? m.before}</b><em>voorheen</em></span>
      <span class="score__bar score__bar--after" style="--w:${((m.after / max) * 100).toFixed(1)}%"><i></i><b>${m.afterLabel ?? m.after}</b><em>na NEXD</em></span>
    </div>
    <p class="visually-hidden">Voorheen ${m.beforeLabel ?? m.before}, na NEXD ${m.afterLabel ?? m.after}.</p>
  </div>`;
};

export const casesSection = ({ headingLevel = 'h2' } = {}) => `
<section class="cases" id="resultaten" aria-labelledby="cases-title" data-cases>
  <canvas class="dissolve" data-dissolve="dark" aria-hidden="true"></canvas>
  <canvas class="contour-canvas" data-contour="light" aria-hidden="true"></canvas>
  <div class="cases__inner">
    ${masthead({ id: 'cases-title', tag: headingLevel, lines: ['Uit de', 'praktijk'], cls: 'mast--xl' })}
    <p class="cases__lede" data-reveal="words" data-stagger="30" data-delay="350">We tonen alleen cijfers die onze klanten zelf hebben gedeeld, met naam en datum.</p>
    <div class="cases__stage">
      ${cases.map((c, i) => `
      <article class="case" id="case-${c.key}" data-case="${c.key}" aria-labelledby="case-${c.key}-name"${i ? ' data-inactive' : ''}>
        <div class="case__copy">
          <blockquote class="case__quote"><p>“${c.quote}”</p><footer>${c.person}<br>${c.client} · ${c.date}</footer></blockquote>
          ${btn({ href: '/contact/', label: 'Bespreek jouw situatie' })}
        </div>
        ${caseFigure(c)}
        <div class="case__panels">
          <div class="panel panel--plain">
            ${brackets()}
            <h3 id="case-${c.key}-name" class="panel__title">${c.client}</h3>
            <p class="panel__sub">${c.sector}${c.place ? ` · ${c.place}` : ''}</p>
          </div>
          <dl class="panel panel--plain case__facts">
            ${brackets()}
            <div><dt>Uitdaging</dt><dd>${c.challenge}</dd></div>
            <div><dt>Aanpak</dt><dd>${c.approach}</dd></div>
            <div><dt>Resultaat</dt><dd><strong>${c.highlight.value}</strong> ${c.highlight.label}</dd></div>
          </dl>
          ${c.url ? `<a class="bracket-link" href="${c.url}" ${ext}><span aria-hidden="true">[ </span>Bekijk de website<span aria-hidden="true"> ↗ ]</span><span class="visually-hidden"> van ${c.client} (opent in nieuw tabblad)</span></a>` : ''}
        </div>
      </article>`).join('')}
    </div>
  </div>
  <div class="cases__band">
    <div class="strip" role="group" aria-label="Kies een case" data-strip>
      ${cases.map((c, i) => `
      <button type="button" class="strip__card${i === 0 ? ' is-live' : ''}" data-pick="${c.key}" aria-controls="case-${c.key}" aria-pressed="${i === 0}">
        <span class="strip__round">case ${pad(i + 1)} · ${c.sector}</span>
        <span class="strip__name">${c.client.replace('Advocatenkantoor ', '')}</span>
        <span class="strip__date">${c.date}</span>
        <span class="strip__mark" aria-hidden="true"></span>
      </button>`).join('<span class="strip__link" aria-hidden="true"></span>')}
      <span class="strip__bracket" aria-hidden="true">${brackets('bracket--accent')}</span>
    </div>
  </div>
</section>`;

/* ------------------------------------------------------------------ */
/* 5. Keuzehulp + diensten                                              */
/* ------------------------------------------------------------------ */

export const chooser = ({ withServices = true } = {}) => {
  const extra = services.filter((s) => !packages.some((p) => p.key === s.key));
  return `
<section class="section chooser" id="welke-oplossing" aria-labelledby="chooser-title">
  <canvas class="contour-canvas" data-contour="light" aria-hidden="true"></canvas>
  <div class="container">
    <div class="section-head">
      ${eyebrow('Welke oplossing past bij jou?')}
      ${masthead({ id: 'chooser-title', lines: ['Kies op situatie', 'niet op prijs'] })}
    </div>
    <div class="chooser__grid" data-chooser>
      <fieldset class="chooser__options">
        <legend class="visually-hidden">Wat past het best bij jouw situatie?</legend>
        ${packages.map((p, i) => `
        <label class="chooser__option">
          <input type="radio" name="situatie" value="${p.key}"${i === 0 ? ' checked' : ''}>
          ${brackets()}
          <span class="chooser__n">${pad(i + 1)}</span><span class="chooser__text">${p.situation}</span>
        </label>`).join('')}
      </fieldset>
      <div class="chooser__panels">
        ${packages.map((p) => `
        <article class="plan${p.featured ? ' plan--featured' : ''}" data-plan="${p.key}" aria-labelledby="plan-${p.key}">
          <div class="plan__top">
            <h3 id="plan-${p.key}" class="plan__name">${p.name}</h3>
            <p class="plan__price"><span class="plan__note">${p.priceNote}</span><span class="plan__amount">${euro(p.price)}</span></p>
          </div>
          <p class="plan__for">${p.for}</p>
          <ul class="checklist">${p.features.map((f) => `<li>${icon('check', 16)}${f}</li>`).join('')}</ul>
          <p class="plan__time">${p.timeline}.</p>
          <div class="plan__actions">
            ${btn({ href: `/contact/?project=${p.key}`, label: p.cta, variant: 'solid' })}
            ${btn({ href: p.href, label: `Meer over ${p.name.toLowerCase()}`, variant: 'ghost-dark' })}
          </div>
        </article>`).join('')}
      </div>
    </div>
    ${withServices ? `
    <div class="services-row">
      <h3 class="services-row__title">Ook bij ons in huis</h3>
      <ul class="pill-list">${extra.map((s) => `<li><a href="${s.path}">${s.nav}${icon('arrow', 14)}</a></li>`).join('')}</ul>
    </div>` : ''}
  </div>
</section>`;
};

/* ------------------------------------------------------------------ */
/* 6. Team                                                              */
/* ------------------------------------------------------------------ */

export const teamSection = (headingLevel = 'h2') => `
<section class="section team" id="team" aria-labelledby="team-title">
  <div class="container">
    <div class="section-head section-head--split">
      <div>
        ${eyebrow('Het team')}
        ${masthead({ id: 'team-title', tag: headingLevel, lines: ['Zes specialisten', 'één aanspreekpunt'] })}
      </div>
      <p class="lede" data-reveal="words" data-stagger="30" data-delay="300">Strategie, copy, conversie, techniek en projectmanagement aan één tafel. Je praat met de mensen die je website ook echt maken.</p>
    </div>
    <ul class="team-grid">
      ${team.map((m, i) => `
      <li class="member" data-reveal="rise" data-delay="${i * 70}">
        ${brackets()}
        <div class="member__portrait">${m.photo ? `<img src="${m.photo}" alt="Portret van ${m.name}" width="256" height="256" loading="lazy">` : `<span aria-hidden="true">${m.short[0]}</span>`}</div>
        <div class="member__body">
          <h3 class="member__name">${m.name}</h3>
          <p class="member__role">${m.role}</p>
          <p class="member__text">${m.text}</p>
          <ul class="member__skills">${m.skills.map((k) => `<li>${k}</li>`).join('')}</ul>
        </div>
      </li>`).join('')}
    </ul>
  </div>
</section>`;

/* ------------------------------------------------------------------ */
/* Werkwijze als strip (subpagina's)                                    */
/* ------------------------------------------------------------------ */

export const processSection = () => `
<section class="process-band" aria-labelledby="process-title">
  <div class="container">
    <h2 id="process-title" class="process-band__title">Zo verloopt de samenwerking</h2>
    <ol class="process-band__list">
      ${process.map((p, i) => `<li data-reveal="rise" data-delay="${i * 70}"${i === 0 ? ' class="is-live"' : ''}><span class="process-band__n">${i === 0 ? 'start hier' : `stap ${pad(i + 1)}`}</span><strong>${p.title}</strong><span>${p.text}</span></li>`).join('')}
    </ol>
  </div>
</section>`;

/* ------------------------------------------------------------------ */
/* FAQ                                                                  */
/* ------------------------------------------------------------------ */

export const faqSection = (items, { id = 'veelgestelde-vragen', title = ['Veelgestelde', 'vragen'] } = {}) => `
<section class="section faq" id="${id}" aria-labelledby="${id}-title">
  <div class="container faq__grid">
    <div class="faq__head">
      ${eyebrow('FAQ')}
      ${masthead({ id: `${id}-title`, lines: title })}
      <p class="faq__contact">Staat je vraag er niet bij? <a href="${mailHref('Vraag aan NEXD Media')}">Mail ons</a> of bel <a href="${telHref()}">${site.contact.phoneDisplay}</a>.</p>
    </div>
    <div class="faq__list">
      ${items.map((f) => `<details class="faq__item"><summary><span>${f.q}</span><span class="faq__plus" aria-hidden="true"></span></summary><div class="faq__answer"><p>${f.a}</p></div></details>`).join('')}
    </div>
  </div>
</section>`;

/* ------------------------------------------------------------------ */
/* Subpagina's                                                          */
/* ------------------------------------------------------------------ */

export const pageHero = ({ eyebrow: eb, h1, lead, motifName, actions = '', crumbs = [] }) => `
<section class="page-hero">
  <canvas class="contour-canvas" data-contour="hero" aria-hidden="true"></canvas>
  <div class="container page-hero__grid">
    <div>
      ${crumbs.length ? `<nav class="crumbs" aria-label="Kruimelpad"><ol>${crumbs.map((c, i) => (i < crumbs.length - 1 ? `<li><a href="${c.path}">${c.name}</a></li>` : `<li aria-current="page">${c.name}</li>`)).join('')}</ol></nav>` : ''}
      ${eyebrow(eb)}
      <h1 class="page-hero__title" data-reveal="words" data-stagger="90">${h1}</h1>
      <p class="lede" data-reveal="rise" data-delay="250">${lead}</p>
      ${actions ? `<div class="page-hero__actions" data-reveal="rise" data-delay="400">${actions}</div>` : ''}
    </div>
    ${motifName ? `<div class="page-hero__motif" data-reveal="rise" data-delay="300">${brackets()}${motif(motifName)}</div>` : ''}
  </div>
</section>`;

export const servicePage = (s) => {
  const p = s.package;
  const derived = s.deliver.every((d) => !d.text);
  const card = (title, price, note, body) => `
    <aside class="price-card" aria-labelledby="price-${s.key}">
      ${brackets()}
      <p class="eyebrow eyebrow--dark">Investering</p>
      <h2 id="price-${s.key}" class="price-card__name">${title}</h2>
      ${price ? `<p class="price-card__price"><span>${note}</span>${euro(price)}</p>` : ''}
      ${body}
    </aside>`;
  const priceBlock = p
    ? card(p.name, p.price, p.priceNote, `
      ${derived ? '' : `<ul class="checklist">${p.features.map((f) => `<li>${icon('check', 16)}${f}</li>`).join('')}</ul>`}
      <p class="price-card__time">${p.timeline}.</p>
      ${btn({ href: `/contact/?project=${s.key}`, label: p.cta, variant: 'solid cta--block' })}`)
    : s.priceFrom
      ? card(s.priceFrom.label, s.priceFrom.price, 'eenmalig, vanaf', `
      <p>Maatwerk in WordPress? Je krijgt na de kennismaking een voorstel met een vaste prijs.</p>
      ${btn({ href: `/contact/?project=${s.key}`, label: 'Vraag een voorstel aan', variant: 'solid cta--block' })}`)
      : card('Op maat', 0, '', `
      <p>De investering hangt af van de omvang. Na een korte kennismaking krijg je een voorstel met een vaste prijs, zonder verrassingen achteraf.</p>
      ${btn({ href: `/contact/?project=${s.key}`, label: 'Vraag een voorstel aan', variant: 'solid cta--block' })}`);

  return `
${pageHero({
  eyebrow: s.eyebrow,
  h1: s.h1,
  lead: s.lead,
  motifName: s.motif,
  crumbs: [{ name: 'Home', path: '/' }, ...(s.group === 'website' ? [{ name: 'Website laten maken', path: '/website-laten-maken.html' }] : []), { name: s.nav, path: s.path }],
  actions: `${btn({ href: `/contact/?project=${s.key}`, label: 'Bespreek je project' })}${btn({ href: '#aanbod', label: 'Wat je krijgt', variant: 'ghost' })}`,
})}
<section class="section svc-intro" aria-labelledby="voor-wie">
  <div class="container svc-intro__grid">
    <div class="panel panel--plain" data-reveal="rise">
      ${brackets()}
      <h2 id="voor-wie" class="panel__title">Voor wie?</h2>
      <ul class="checklist checklist--lg">${s.forWho.map((f) => `<li>${icon('check', 18)}${f}</li>`).join('')}</ul>
    </div>
    <div class="svc-problem">
      ${eyebrow('Het probleem')}
      <h2 class="mast mast--md" data-reveal="words" data-stagger="80">${s.problem.title}</h2>
      <p class="lede" data-reveal="rise" data-delay="200">${s.problem.text}</p>
    </div>
  </div>
</section>
<section class="section svc-offer" id="aanbod" aria-labelledby="aanbod-title">
  <div class="container svc-offer__grid">
    <div>
      <div class="section-head">
        ${eyebrow('Wat je krijgt')}
        <h2 id="aanbod-title" class="mast mast--md" data-reveal="words">${s.package ? 'Inbegrepen' : 'Wat we leveren'}</h2>
      </div>
      <ul class="deliver${derived ? ' deliver--compact' : ''}">
        ${s.deliver.map((d, i) => `<li data-reveal="rise" data-delay="${i * 60}"><span class="deliver__n">${pad(i + 1)}</span><h3 class="deliver__title">${d.title}</h3>${d.text ? `<p>${d.text}</p>` : ''}</li>`).join('')}
      </ul>
      ${s.measure ? `<div class="measure"><h3 class="deliver__title">${s.measure.title}</h3><ul class="pill-list pill-list--static">${s.measure.items.map((m) => `<li>${m}</li>`).join('')}</ul></div>` : ''}
    </div>
    ${priceBlock}
  </div>
</section>
<section class="steps-band" aria-labelledby="traject-title">
  <div class="container">
    <h2 id="traject-title" class="steps-band__title">Hoe het werkt</h2>
    <ol class="steps-band__list">${s.steps.map((st, i) => `<li data-reveal="rise" data-delay="${i * 70}"><span>${pad(i + 1)}</span>${st}</li>`).join('')}</ol>
  </div>
</section>
${faqSection(s.faq, { id: 'vragen', title: ['Vragen over', s.nav.toLowerCase()] })}
<section class="section related" aria-labelledby="related-title">
  <div class="container">
    <h2 id="related-title" class="related__title">Ook interessant</h2>
    <ul class="related__list">
      ${s.related.map(serviceByKey).map((r) => `<li><a href="${r.path}">${brackets()}<span class="eyebrow">${stripTags(r.eyebrow)}</span><span class="related__name">${r.nav}</span>${icon('arrowUpRight', 22)}</a></li>`).join('')}
    </ul>
  </div>
</section>`;
};

const motifs = {
  grid: '<g>' + [0, 1, 2].map((r) => [0, 1, 2].map((c) => `<rect x="${40 + c * 90}" y="${40 + r * 90}" width="70" height="70" rx="2"${r === 2 && c === 2 ? ' class="f"' : ''}/>`).join('')).join('') + '</g>',
  route: '<path d="M30 250C90 250 90 70 170 70s70 140 140 140 40-120 50-150"/><circle cx="30" cy="250" r="8"/><circle cx="170" cy="70" r="8"/><circle cx="310" cy="210" r="8"/><rect x="340" y="40" width="30" height="30" rx="2" class="f"/>',
  heatmap: '<rect x="30" y="30" width="340" height="240" rx="3"/><path d="M30 70h340"/><circle cx="130" cy="150" r="60" class="h1"/><circle cx="270" cy="200" r="40" class="h2"/><circle cx="300" cy="110" r="22" class="h3"/>',
  blocks: '<rect x="30" y="30" width="340" height="50" rx="2"/><rect x="30" y="95" width="160" height="175" rx="2"/><rect x="210" y="95" width="160" height="80" rx="2" class="f"/><rect x="210" y="190" width="160" height="80" rx="2"/>',
  lines: '<path d="M40 60h240M40 100h320M40 130h300M40 160h310M40 190h220"/><rect x="40" y="225" width="120" height="36" rx="2" class="f"/>',
  search: '<circle cx="170" cy="140" r="90"/><path d="M236 206l90 70"/><path d="M120 140h100M120 115h70M120 165h85"/><rect x="330" y="265" width="22" height="22" rx="2" class="f"/>',
  frame: '<rect x="70" y="30" width="260" height="240" rx="2"/><rect x="100" y="60" width="200" height="180" rx="2"/><circle cx="200" cy="130" r="38"/><path d="M130 240c10-50 130-50 140 0"/><rect x="306" y="16" width="34" height="22" rx="2" class="f"/>',
};
export const motif = (name) => `<svg class="motif" viewBox="0 0 400 300" aria-hidden="true" focusable="false">${motifs[name]}</svg>`;

export const contactForm = () => `
<div class="form-card" data-form-card>
  <form class="form" novalidate data-contact-form data-endpoint="${esc(site.form.endpoint)}" data-email="${site.contact.email}" data-whatsapp="${site.contact.whatsapp}">
    <div class="form__summary" data-error-summary tabindex="-1" role="alert" hidden></div>
    <div class="form__row">
      <div class="field">
        <label for="naam">Naam <span class="req" aria-hidden="true">*</span></label>
        <input id="naam" name="naam" type="text" autocomplete="name" required aria-describedby="naam-err">
        <p class="field__error" id="naam-err" data-error-for="naam"></p>
      </div>
      <div class="field">
        <label for="bedrijf">Bedrijfsnaam <span class="opt">(optioneel)</span></label>
        <input id="bedrijf" name="bedrijf" type="text" autocomplete="organization">
      </div>
    </div>
    <div class="form__row">
      <div class="field">
        <label for="email">E-mailadres <span class="req" aria-hidden="true">*</span></label>
        <input id="email" name="email" type="email" autocomplete="email" required aria-describedby="email-err">
        <p class="field__error" id="email-err" data-error-for="email"></p>
      </div>
      <div class="field">
        <label for="telefoon">Telefoonnummer <span class="opt">(optioneel)</span></label>
        <input id="telefoon" name="telefoon" type="tel" autocomplete="tel" aria-describedby="telefoon-err">
        <p class="field__error" id="telefoon-err" data-error-for="telefoon"></p>
      </div>
    </div>
    <div class="field">
      <label for="project">Waar kunnen we je mee helpen?</label>
      <select id="project" name="project">
        <option value="">Weet ik nog niet</option>
        <option value="${site.offer.key}">${site.offer.title}</option>
        ${services.map((s) => `<option value="${s.key}">${s.nav}</option>`).join('')}
        <option value="anders">Iets anders</option>
      </select>
    </div>
    <div class="field">
      <label for="bericht">Waar loop je tegenaan? <span class="req" aria-hidden="true">*</span></label>
      <textarea id="bericht" name="bericht" rows="5" required aria-describedby="bericht-hint bericht-err"></textarea>
      <p class="field__hint" id="bericht-hint">Bijvoorbeeld: je huidige website, je doelgroep, en wat de website moet opleveren.</p>
      <p class="field__error" id="bericht-err" data-error-for="bericht"></p>
    </div>
    <div class="hp" aria-hidden="true"><label for="website">Laat dit veld leeg</label><input id="website" name="website" type="text" tabindex="-1" autocomplete="off"></div>
    <p class="form__privacy">We gebruiken je gegevens alleen om op je vraag te reageren. Lees de <a href="/privacy/">privacyverklaring</a>.</p>
    <button class="cta cta--solid cta--block" type="submit" data-submit><span class="cta__label">Verstuur je vraag</span><svg class="cta__arrow" viewBox="0 0 13.7071 10.7071" aria-hidden="true" focusable="false"><path d="M0 5.35355H13M8 10.3536L13 5.35355L8 0.353553"/></svg></button>
    <p class="form__req"><span aria-hidden="true">*</span> Verplicht veld</p>
  </form>
  <div class="form-result" data-form-result tabindex="-1" hidden aria-live="polite"></div>
</div>`;
