import { site, engineStages, sectors, facts, problems, approach, process, packages, cases, team } from '../data/site.mjs';
import { services, serviceByKey } from '../data/services.mjs';
import { icon } from './icons.mjs';
import { btn, esc, euro, waHref, telHref, mailHref, stripTags } from './layout.mjs';

const ext = 'target="_blank" rel="noopener"';
const pad = (n) => String(n).padStart(2, '0');

/* ------------------------------------------------------------------ */
/* Conversion Engine: statische SVG-versie (fallback én eerste weergave) */
/* ------------------------------------------------------------------ */

// Deterministische pseudo-random zodat de build reproduceerbaar is.
const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

export const engineSvg = (id = 'eg') => {
  const r = rng(7);
  // Vijf kaders in 3/4-perspectief: elk kader is een vlak dat om de verticale as is gedraaid.
  const frames = [0, 1, 2, 3].map((i) => {
    const cx = 250 + i * 140;
    const h = 330 - i * 62;
    const w = 66 - i * 9;
    const cy = 330;
    const sk = h * 0.09;
    return { cx, h, w, cy, pts: `${cx - w},${cy - h / 2} ${cx + w},${cy - h / 2 + sk} ${cx + w},${cy + h / 2 - sk} ${cx - w},${cy + h / 2}` };
  });
  // Deeltjes: breed verspreid links, steeds minder en geconcentreerder richting de aanvraag.
  const dots = [];
  for (let k = 0; k < 230; k++) {
    const t = Math.pow(r(), 0.75);
    const x = 40 + t * 700;
    const spread = 210 * (1 - t) + 12;
    const y = 330 + (r() - 0.5) * 2 * spread;
    const survives = r() > t * 0.85;
    if (!survives && t > 0.25) continue;
    const warm = t > 0.62;
    dots.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1.3 + r() * 1.6).toFixed(1)}"${warm ? ' class="w"' : ''}/>`);
  }
  return `<svg class="engine-svg" viewBox="0 0 860 660" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
  <defs>
    <radialGradient id="${id}-glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="var(--signal)" stop-opacity=".55"/><stop offset="1" stop-color="var(--signal)" stop-opacity="0"/></radialGradient>
  </defs>
  <g class="engine-svg__grid">${[...Array(9)].map((_, i) => `<line x1="0" x2="860" y1="${520 + i * i * 3.2}" y2="${520 + i * i * 3.2}"/>`).join('')}</g>
  <g class="engine-svg__frames">${frames.map((f, i) => `<polygon points="${f.pts}" style="--i:${i}"/>`).join('')}</g>
  <g class="engine-svg__dots">${dots.join('')}</g>
  <circle cx="820" cy="330" r="90" fill="url(#${id}-glow)"/>
  <rect class="engine-svg__core" x="796" y="312" width="48" height="36" rx="3"/>
</svg>`;
};

/* ------------------------------------------------------------------ */
/* Homepage                                                            */
/* ------------------------------------------------------------------ */

export const homeHero = () => `
<section class="hero" data-hero aria-labelledby="hero-title">
  <div class="hero__stage" data-engine data-src="/assets/js/engine.js?v=__V__" aria-hidden="true">${engineSvg()}</div>
  <div class="container hero__inner">
    <p class="eyebrow eyebrow--on-dark">Websites voor legal &amp; finance</p>
    <h1 id="hero-title" class="hero__title">Je website moet meer doen dan er <em>goed uitzien.</em></h1>
    <div class="hero__bottom">
      <p class="hero__lead">We combineren strategie, design en techniek tot websites die duidelijk communiceren, vertrouwen opbouwen en bezoekers naar de juiste actie begeleiden. Voor advocaten, accountants en zakelijke dienstverleners.</p>
      <div class="hero__cta">
        <div class="hero__actions">
          ${btn({ href: '/contact/', label: 'Bespreek je website' })}
          ${btn({ href: '#werk', label: 'Bekijk ons werk', variant: 'ghost-dark', iconName: '' })}
        </div>
        <p class="hero__offer">Eerst vrijblijvend kijken? <a href="/contact/?project=${site.offer.key}">${site.offer.title}</a>: 3 concrete verbeterpunten.</p>
      </div>
    </div>
    <ol class="engine-stages" aria-label="Van bezoeker tot aanvraag">
      ${engineStages.map((s, i) => `<li><span>${pad(i + 1)}</span>${s}</li>`).join('')}
    </ol>
  </div>
</section>`;

export const trust = () => `
<section class="section trust" aria-labelledby="trust-title">
  <div class="container">
    <div class="trust__head reveal">
      <h2 id="trust-title" class="h2">Gespecialiseerd in dienstverleners waar <em>vertrouwen</em> de doorslag geeft.</h2>
      <p class="lede">Een cliënt kiest een advocaat of accountant op het gevoel dat je zijn vraag begrijpt. Daar ontwerpen we voor.</p>
    </div>
    <ul class="sectors">
      ${sectors.map((s, i) => `<li class="sector reveal" style="--d:${i}"><span class="sector__index">${pad(i + 1)}</span><h3 class="h4">${s.name}</h3><p>${s.text}</p></li>`).join('')}
    </ul>
    <dl class="facts reveal">
      ${facts.map((f) => `<div><dt>${f.label}</dt><dd>${f.value}</dd></div>`).join('')}
    </dl>
  </div>
</section>`;

export const problemSection = () => `
<section class="section problems" aria-labelledby="problems-title">
  <div class="container problems__grid">
    <div class="problems__head reveal">
      <p class="eyebrow">Herkenbaar?</p>
      <h2 id="problems-title" class="h2">De meeste websites verliezen bezoekers bij <em>de volgende stap.</em></h2>
      ${btn({ href: '/website-laten-optimaliseren/', label: 'Laat je website analyseren', variant: 'link' })}
    </div>
    <ol class="problem-list">
      ${problems.map((p, i) => `<li class="problem reveal"><span class="problem__n">${pad(i + 1)}</span><div><h3 class="h4">${p.title}</h3><p>${p.text}</p></div></li>`).join('')}
    </ol>
  </div>
</section>`;

// Elke laag krijgt een eigen mini-visual; samen vormen ze een werkende pagina.
const layerArt = {
  strategie: '<svg viewBox="0 0 120 80" aria-hidden="true"><circle cx="60" cy="40" r="30"/><circle cx="60" cy="40" r="18"/><circle cx="60" cy="40" r="6" class="f"/></svg>',
  structuur: '<svg viewBox="0 0 120 80" aria-hidden="true"><rect x="8" y="8" width="104" height="14"/><rect x="8" y="28" width="62" height="44"/><rect x="76" y="28" width="36" height="20"/><rect x="76" y="52" width="36" height="20"/></svg>',
  copy: '<svg viewBox="0 0 120 80" aria-hidden="true"><path d="M10 14h70M10 26h96M10 36h88M10 46h92M10 56h60"/><rect x="10" y="64" width="34" height="10" class="f"/></svg>',
  ontwikkeling: '<svg viewBox="0 0 120 80" aria-hidden="true"><path d="M38 24 22 40l16 16M82 24l16 16-16 16M66 18 54 62"/></svg>',
  lancering: '<svg viewBox="0 0 120 80" aria-hidden="true"><path d="M8 70h104M8 62l22-12 18 6 22-20 18 4 24-24"/><circle cx="112" cy="16" r="4" class="f"/></svg>',
  optimalisatie: '<svg viewBox="0 0 120 80" aria-hidden="true"><rect x="8" y="8" width="104" height="64"/><circle cx="40" cy="34" r="14" class="h1"/><circle cx="78" cy="50" r="10" class="h2"/><circle cx="88" cy="24" r="6" class="h3"/></svg>',
};

export const approachSection = () => `
<section class="section approach" id="aanpak" aria-labelledby="approach-title" data-approach>
  <div class="container">
    <div class="approach__head reveal">
      <p class="eyebrow eyebrow--on-dark">De NEXD-aanpak</p>
      <h2 id="approach-title" class="h2">Zes lagen. <em>Eén</em> website die werkt.</h2>
      <p class="lede">Een website die aanvragen oplevert is een stapel beslissingen die op elkaar moeten passen, van doelgroep tot meting.</p>
    </div>
    <div class="approach__grid">
      <div class="approach__visual" aria-hidden="true">
        <div class="stack" data-stack data-step="${approach.length}">
          ${approach.map((a, i) => `<div class="stack__layer" style="--i:${i}" data-layer="${i + 1}"><span class="stack__label">${pad(i + 1)} ${a.title}</span><div class="stack__art stack__art--${a.key}">${layerArt[a.key]}</div></div>`).join('')}
        </div>
      </div>
      <ol class="approach__steps">
        ${approach.map((a, i) => `<li class="approach__step" data-step-trigger="${i + 1}"><span class="approach__n">${pad(i + 1)}</span><h3 class="h3">${a.title}</h3><p>${a.text}</p></li>`).join('')}
      </ol>
    </div>
  </div>
</section>`;

export const servicesSection = () => {
  const extra = services.filter((s) => !packages.some((p) => p.key === s.key));
  return `
<section class="section services" id="diensten" aria-labelledby="services-title">
  <div class="container">
    <div class="section-head reveal">
      <p class="eyebrow">Diensten</p>
      <h2 id="services-title" class="h2">Van nieuwe website tot <em>betere resultaten</em> uit je huidige.</h2>
    </div>
    <ul class="routes">
      ${packages.map((p, i) => `
      <li class="route reveal${p.featured ? ' route--featured' : ''}">
        <a href="${p.href}" class="route__link">
          <span class="route__n">${pad(i + 1)}</span>
          <div class="route__body"><h3 class="h3">${p.name}</h3><p class="route__for">${p.for}</p></div>
          <span class="route__price"><small>${p.priceNote}</small>${euro(p.price)}</span>
          <span class="route__arrow">${icon('arrowUpRight', 28)}</span>
        </a>
      </li>`).join('')}
    </ul>
    <div class="services__extra reveal">
      <h3 class="h4">Ook bij ons in huis</h3>
      <ul class="pill-list">
        ${extra.map((s) => `<li><a href="${s.path}">${s.nav}${icon('arrow', 16)}</a></li>`).join('')}
      </ul>
    </div>
  </div>
</section>`;
};

const metricBars = (m) => {
  const max = Math.max(m.before, m.after);
  return `
  <figure class="metric">
    <figcaption>${m.label}</figcaption>
    <div class="metric__row"><span class="metric__key">Voorheen</span><span class="metric__bar"><span style="--w:${((m.before / max) * 100).toFixed(1)}%"></span></span><span class="metric__val">${m.beforeLabel ?? m.before}</span></div>
    <div class="metric__row metric__row--after"><span class="metric__key">Na NEXD</span><span class="metric__bar"><span style="--w:${((m.after / max) * 100).toFixed(1)}%"></span></span><span class="metric__val">${m.afterLabel ?? m.after}</span></div>
  </figure>`;
};

export const casesSection = () => `
<section class="section cases" id="werk" aria-labelledby="cases-title">
  <div class="container">
    <div class="section-head section-head--split reveal">
      <div>
        <p class="eyebrow">Werk &amp; resultaten</p>
        <h2 id="cases-title" class="h2">Wat klanten <em>zelf</em> zeggen dat het opleverde.</h2>
      </div>
      <p class="lede">We tonen alleen cijfers die onze klanten zelf hebben gedeeld. Geen gemiddelden, geen opgepoetste percentages.</p>
    </div>
    <div class="case-list">
      ${cases.map((c, i) => `
      <article class="case reveal" aria-labelledby="case-${c.key}">
        <header class="case__head">
          <span class="case__index">Case ${pad(i + 1)}</span>
          <p class="case__sector">${c.sector}${c.place ? ` · ${c.place}` : ''}</p>
          <h3 id="case-${c.key}" class="h3">${c.client}</h3>
        </header>
        <dl class="case__story">
          <div><dt>Uitdaging</dt><dd>${c.challenge}</dd></div>
          <div><dt>Aanpak</dt><dd>${c.approach}</dd></div>
        </dl>
        <div class="case__result">
          ${c.highlight ? `<p class="case__highlight"><strong>${c.highlight.value}</strong> ${c.highlight.label}</p>` : ''}
          ${c.metrics.map(metricBars).join('')}
          <blockquote class="case__quote"><p>“${c.quote}”</p><footer>${c.person}, ${c.client} · ${c.date}</footer></blockquote>
          ${c.url ? `<a class="link-arrow" href="${c.url}" ${ext}>Bekijk de website${icon('arrowUpRight', 16)}<span class="visually-hidden"> van ${c.client} (opent in nieuw tabblad)</span></a>` : ''}
        </div>
      </article>`).join('')}
    </div>
  </div>
</section>`;

export const chooser = () => `
<section class="section chooser" id="welke-oplossing" aria-labelledby="chooser-title">
  <div class="container">
    <div class="section-head reveal">
      <p class="eyebrow">Welke oplossing past bij jou?</p>
      <h2 id="chooser-title" class="h2">Kies op basis van je <em>situatie</em>, niet op prijs.</h2>
    </div>
    <div class="chooser__grid" data-chooser>
      <fieldset class="chooser__options">
        <legend class="visually-hidden">Wat past het best bij jouw situatie?</legend>
        ${packages.map((p, i) => `
        <label class="chooser__option">
          <input type="radio" name="situatie" value="${p.key}"${i === 0 ? ' checked' : ''}>
          <span class="chooser__n">${pad(i + 1)}</span><span class="chooser__text">${p.situation}</span>
        </label>`).join('')}
      </fieldset>
      <div class="chooser__panels">
        ${packages.map((p) => `
        <article class="plan${p.featured ? ' plan--featured' : ''}" data-plan="${p.key}" aria-labelledby="plan-${p.key}">
          <div class="plan__top">
            <h3 id="plan-${p.key}" class="h3">${p.name}</h3>
            <p class="plan__price"><span class="plan__note">${p.priceNote}</span><span class="plan__amount">${euro(p.price)}</span></p>
          </div>
          <p class="plan__for">${p.for}</p>
          <ul class="checklist">${p.features.map((f) => `<li>${icon('check', 18)}${f}</li>`).join('')}</ul>
          <p class="plan__time">${p.timeline}.</p>
          <div class="plan__actions">
            ${btn({ href: `/contact/?project=${p.key}`, label: p.cta })}
            <a class="link-arrow" href="${p.href}">Meer over ${p.name.toLowerCase()}${icon('arrow', 16)}</a>
          </div>
        </article>`).join('')}
      </div>
    </div>
  </div>
</section>`;

export const teamSection = (headingLevel = 'h2') => `
<section class="section team" id="team" aria-labelledby="team-title">
  <div class="container">
    <div class="section-head section-head--split reveal">
      <div>
        <p class="eyebrow">Het team</p>
        <${headingLevel} id="team-title" class="h2">Zes specialisten, <em>één</em> aanspreekpunt.</${headingLevel}>
      </div>
      <p class="lede">Strategie, copy, conversie, techniek en projectmanagement aan één tafel. Je praat met de mensen die je website ook echt maken.</p>
    </div>
    <ul class="team-grid">
      ${team.map((m, i) => `
      <li class="member reveal" style="--d:${i}">
        <div class="member__portrait${m.photo ? '' : ' member__portrait--initial'}">${m.photo ? `<img src="${m.photo}" alt="Portret van ${m.name}" width="256" height="256" loading="lazy">` : `<span aria-hidden="true">${m.short[0]}</span>`}</div>
        <div class="member__body">
          <h3 class="h4">${m.name}</h3>
          <p class="member__role">${m.role}</p>
          <p class="member__text">${m.text}</p>
          <ul class="member__skills">${m.skills.map((k) => `<li>${k}</li>`).join('')}</ul>
        </div>
      </li>`).join('')}
    </ul>
  </div>
</section>`;

export const processSection = () => `
<section class="section process" id="werkwijze" aria-labelledby="process-title">
  <div class="container">
    <div class="section-head reveal">
      <p class="eyebrow">Werkwijze</p>
      <h2 id="process-title" class="h2">Zo verloopt de <em>samenwerking</em>.</h2>
    </div>
    <ol class="timeline">
      ${process.map((p, i) => `<li class="timeline__item reveal" style="--d:${i}"><span class="timeline__n">${pad(i + 1)}</span><h3 class="h4">${p.title}</h3><p>${p.text}</p></li>`).join('')}
    </ol>
    <p class="process__note reveal">Een standaard website staat binnen 20 dagen online, een maatwerk website meestal binnen 4 tot 6 weken. De klok begint zodra je content en huisstijl compleet zijn.</p>
  </div>
</section>`;

export const faqSection = (items, { id = 'veelgestelde-vragen', title = 'Veelgestelde vragen' } = {}) => `
<section class="section faq" id="${id}" aria-labelledby="${id}-title">
  <div class="container faq__grid">
    <div class="faq__head reveal">
      <p class="eyebrow">FAQ</p>
      <h2 id="${id}-title" class="h2">${title}</h2>
      <p>Staat je vraag er niet bij? <a href="${mailHref('Vraag aan NEXD Media')}">Mail ons</a> of bel <a href="${telHref()}">${site.contact.phoneDisplay}</a>.</p>
    </div>
    <div class="faq__list">
      ${items.map((f) => `<details class="faq__item"><summary><span>${f.q}</span>${icon('plus', 20)}</summary><div class="faq__answer"><p>${f.a}</p></div></details>`).join('')}
    </div>
  </div>
</section>`;

export const finalCta = () => `
<section class="final-cta" aria-labelledby="final-cta-title">
  <div class="final-cta__art" aria-hidden="true">${engineSvg('eg-cta')}</div>
  <div class="container final-cta__inner">
    <h2 id="final-cta-title" class="display">Laten we kijken wat jouw website <em>beter</em> kan doen.</h2>
    <p class="lede">Vertel ons waar je tegenaan loopt. We bespreken welke aanpak bij jouw bedrijf past, zonder verplichtingen.</p>
    <div class="final-cta__actions">
      ${btn({ href: '/contact/', label: 'Plan een kennismaking' })}
      <a class="btn btn--ghost-dark" href="${waHref('Hoi NEXD Media, ik heb een vraag over mijn website.')}" ${ext}>${icon('whatsapp', 18)}<span>Stel je vraag via WhatsApp</span></a>
    </div>
  </div>
</section>`;

/* ------------------------------------------------------------------ */
/* Subpagina's                                                         */
/* ------------------------------------------------------------------ */

// Kleine abstracte motieven per dienst, afgeleid van het kadermotief.
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

export const pageHero = ({ eyebrow, h1, lead, motifName, actions = '', crumbs = [] }) => `
<section class="page-hero">
  <div class="container page-hero__grid">
    <div>
      ${crumbs.length ? `<nav class="crumbs" aria-label="Kruimelpad"><ol>${crumbs.map((c, i) => (i < crumbs.length - 1 ? `<li><a href="${c.path}">${c.name}</a></li>` : `<li aria-current="page">${c.name}</li>`)).join('')}</ol></nav>` : ''}
      <p class="eyebrow">${eyebrow}</p>
      <h1 class="page-hero__title">${h1}</h1>
      <p class="lede">${lead}</p>
      ${actions ? `<div class="page-hero__actions">${actions}</div>` : ''}
    </div>
    ${motifName ? `<div class="page-hero__motif">${motif(motifName)}</div>` : ''}
  </div>
</section>`;

export const servicePage = (s) => {
  const p = s.package;
  const priceBlock = p
    ? `
    <aside class="price-card" aria-labelledby="price-${s.key}">
      <p class="eyebrow">Investering</p>
      <h2 id="price-${s.key}" class="h3">${p.name}</h2>
      <p class="price-card__price"><span>${p.priceNote}</span>${euro(p.price)}</p>
      ${s.deliver.every((d) => !d.text) ? '' : `<ul class="checklist">${p.features.map((f) => `<li>${icon('check', 18)}${f}</li>`).join('')}</ul>`}
      <p class="price-card__time">${p.timeline}.</p>
      ${btn({ href: `/contact/?project=${s.key}`, label: p.cta, variant: 'primary btn--block' })}
    </aside>`
    : s.priceFrom
      ? `
    <aside class="price-card" aria-labelledby="price-${s.key}">
      <p class="eyebrow">Investering</p>
      <h2 id="price-${s.key}" class="h3">${s.priceFrom.label}</h2>
      <p class="price-card__price"><span>eenmalig, vanaf</span>${euro(s.priceFrom.price)}</p>
      <p>Maatwerk in WordPress? Je krijgt na de kennismaking een voorstel met een vaste prijs.</p>
      ${btn({ href: `/contact/?project=${s.key}`, label: 'Vraag een voorstel aan', variant: 'primary btn--block' })}
    </aside>`
      : `
    <aside class="price-card" aria-labelledby="price-${s.key}">
      <p class="eyebrow">Investering</p>
      <h2 id="price-${s.key}" class="h3">Op maat</h2>
      <p>De investering hangt af van de omvang. Na een korte kennismaking krijg je een voorstel met een vaste prijs, zonder verrassingen achteraf.</p>
      ${btn({ href: `/contact/?project=${s.key}`, label: 'Vraag een voorstel aan', variant: 'primary btn--block' })}
    </aside>`;

  return `
${pageHero({
  eyebrow: s.eyebrow,
  h1: s.h1,
  lead: s.lead,
  motifName: s.motif,
  crumbs: [{ name: 'Home', path: '/' }, ...(s.group === 'website' ? [{ name: 'Website laten maken', path: '/website-laten-maken.html' }] : []), { name: s.nav, path: s.path }],
  actions: `${btn({ href: `/contact/?project=${s.key}`, label: 'Bespreek je project' })}${btn({ href: '#aanbod', label: 'Wat je krijgt', variant: 'ghost', iconName: '' })}`,
})}
<section class="section svc-intro" aria-labelledby="voor-wie">
  <div class="container svc-intro__grid">
    <div class="reveal">
      <h2 id="voor-wie" class="h3">Voor wie?</h2>
      <ul class="checklist checklist--lg">${s.forWho.map((f) => `<li>${icon('check', 20)}${f}</li>`).join('')}</ul>
    </div>
    <div class="svc-problem reveal">
      <p class="eyebrow">Het probleem</p>
      <h2 class="h2">${s.problem.title}</h2>
      <p class="lede">${s.problem.text}</p>
    </div>
  </div>
</section>
<section class="section svc-offer" id="aanbod" aria-labelledby="aanbod-title">
  <div class="container svc-offer__grid">
    <div>
      <div class="section-head reveal">
        <p class="eyebrow">Wat je krijgt</p>
        <h2 id="aanbod-title" class="h2">${s.package ? 'Inbegrepen' : 'Wat we leveren'}</h2>
      </div>
      <ul class="deliver${s.deliver.every((d) => !d.text) ? ' deliver--compact' : ''}">
        ${s.deliver.map((d, i) => `<li class="reveal"><span class="deliver__n">${pad(i + 1)}</span><h3 class="h4">${d.title}</h3>${d.text ? `<p>${d.text}</p>` : ''}</li>`).join('')}
      </ul>
      ${s.measure ? `<div class="measure reveal"><h3 class="h4">${s.measure.title}</h3><ul class="pill-list pill-list--static">${s.measure.items.map((m) => `<li>${m}</li>`).join('')}</ul></div>` : ''}
    </div>
    ${priceBlock}
  </div>
</section>
<section class="section svc-steps" aria-labelledby="traject-title">
  <div class="container">
    <div class="section-head reveal"><p class="eyebrow">Het traject</p><h2 id="traject-title" class="h2">Hoe het werkt</h2></div>
    <ol class="steps-row">${s.steps.map((st, i) => `<li class="reveal" style="--d:${i}"><span>${pad(i + 1)}</span>${st}</li>`).join('')}</ol>
  </div>
</section>
${faqSection(s.faq, { id: 'vragen', title: `Vragen over ${s.nav.toLowerCase()}` })}
<section class="section related" aria-labelledby="related-title">
  <div class="container">
    <h2 id="related-title" class="h3">Ook interessant</h2>
    <ul class="related__list">
      ${s.related.map(serviceByKey).map((r) => `<li><a href="${r.path}"><span class="eyebrow">${stripTags(r.eyebrow)}</span><span class="related__title">${r.nav}</span>${icon('arrowUpRight', 24)}</a></li>`).join('')}
    </ul>
  </div>
</section>
${finalCta()}`;
};

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
    <button class="btn btn--primary btn--block" type="submit" data-submit><span>Verstuur je vraag</span>${icon('arrow', 18)}</button>
    <p class="form__req"><span aria-hidden="true">*</span> Verplicht veld</p>
  </form>
  <div class="form-result" data-form-result tabindex="-1" hidden aria-live="polite"></div>
</div>`;
