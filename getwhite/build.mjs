// Bouwt ./public uit src/site.mjs en assets/. Gebruik: npm run build
import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { site } from './src/site.mjs';

const isTodo = (v) => v && typeof v === 'object' && 'todo' in v;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const euro = (n) => `€${n}`;
const { contact, prices: P } = site;
const wa = (text) => `https://wa.me/${contact.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
const ig = `https://www.instagram.com/${contact.instagram}/`;
const year = new Date().getFullYear();

const icon = {
  wa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.4-.3Z"/></svg>',
  ig: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17.4" cy="6.6" r="1.2" fill="currentColor"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  spark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0Z"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  cross: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7 7 17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
};

// Een eenvoudige kies-tand als SVG (fallback zonder WebGL en voor iconen).
const toothSvg = (cls = '') => `<svg class="${cls}" viewBox="0 0 120 140" aria-hidden="true"><path d="M60 22c-9-10-34-14-44 2-9 15-3 36 3 50 4 10 5 22 7 36 2 16 6 24 12 24 7 0 8-14 11-28 2-9 5-14 11-14s9 5 11 14c3 14 4 28 11 28 6 0 10-8 12-24 2-14 3-26 7-36 6-14 12-35 3-50-10-16-35-12-44-2Z" fill="currentColor"/></svg>`;

const head = ({ title, desc, path = '/' }) => `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<script>document.documentElement.classList.add('js')</script>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
${site.draft ? '<meta name="robots" content="noindex, nofollow">\n' : ''}${!isTodo(site.url) ? `<link rel="canonical" href="${site.url}${path}">\n` : ''}<meta name="theme-color" content="#070a0f">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="nl_NL">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/assets/fonts/manrope.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/instrument-serif-italic.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/main.css">
<script src="/assets/js/main.js" defer></script>
</head>`;

const logo = (cls = '') => `<span class="logo ${cls}" role="img" aria-label="GetWhite tandenbleken"></span>`;

const header = `<a class="skip" href="#main">Naar de inhoud</a>
<div class="progress" data-progress aria-hidden="true"></div>
<header class="masthead" data-masthead>
  <a class="masthead__brand" href="/#top" aria-label="GetWhite, naar boven">${logo()}</a>
  <nav class="masthead__nav" aria-label="Hoofdmenu">
    <a href="/#resultaten">Resultaten</a>
    <a href="/#werkwijze">Werkwijze</a>
    <a href="/#prijzen">Prijzen</a>
    <a href="/#nazorg">Nazorg</a>
    <a href="/#vragen">Vragen</a>
  </nav>
  <a class="btn btn--sm btn--light masthead__cta" href="${wa('Hoi GetWhite! Ik wil graag een afspraak maken.')}" target="_blank" rel="noopener">${icon.wa}<span>Afspraak</span></a>
</header>`;

const hero = `<section class="hero" id="top" data-hero>
  <div class="hero__sticky">
    <div class="hero__bg" aria-hidden="true"><span class="hero__beam"></span><span class="hero__grain"></span></div>
    <div class="hero__stage" data-stage aria-hidden="true">
      <canvas class="hero__canvas" data-tooth></canvas>
      ${toothSvg('hero__fallback')}
      <span class="hero__halo"></span>
      ${Array.from({ length: 7 }, (_, i) => `<span class="spark spark--${i + 1}">${icon.spark}</span>`).join('')}
    </div>
    <div class="hero__copy">
      <p class="eyebrow eyebrow--light"><span class="dot"></span>Tandenbleken in ${site.city}</p>
      <h1 class="hero__title"><span class="line"><span>Je glimlach,</span></span> <span class="line"><em>een paar tinten</em></span> <span class="line"><em>lichter.</em></span></h1>
      <p class="hero__lead">Professioneel tandenbleken met LED-licht. Elke sessie duurt ${site.minutes} minuten. Behandeling vanaf <strong>${euro(P.lines.basic.solo[2])}</strong>.</p>
      <div class="hero__actions">
        <a class="btn btn--light magnetic" href="${wa('Hoi GetWhite! Ik wil graag een afspraak maken.')}" target="_blank" rel="noopener">${icon.wa}<span>Afspraak via WhatsApp</span></a>
        <a class="btn btn--ghost magnetic" href="#prijzen"><span>Bekijk prijzen</span>${icon.arrow}</a>
      </div>
    </div>
    <div class="hero__after" aria-hidden="true">
      <p>Van <em>voor</em><br>naar <em>na.</em></p>
      <span>Bekijk echte resultaten ${icon.arrow}</span>
    </div>
    <div class="shade" aria-hidden="true">
      <span class="shade__label">Voor</span>
      <span class="shade__track">${Array.from({ length: 8 }, (_, i) => `<i style="--i:${i}"></i>`).join('')}<b class="shade__thumb" data-shade-thumb></b></span>
      <span class="shade__label">Na</span>
    </div>
    <p class="hero__scroll" aria-hidden="true"><span>Scroll</span><i></i></p>
  </div>
</section>`;

const marqueeItems = [`Vanaf ${euro(P.lines.basic.solo[2])}`, `${site.minutes} minuten per sessie`, 'Geen resultaat bij 5 sessies? Geld terug', 'Duo-behandeling', 'Officieel gecertificeerd', `${site.city}`];
const marquee = `<div class="marquee"><p class="sr-only">${esc(marqueeItems.join(' · '))}</p><div class="marquee__track" aria-hidden="true">${[0, 1].map(() => `<span>${marqueeItems.map((t) => `${t}<i>${icon.spark}</i>`).join('')}</span>`).join('')}</div></div>`;

const results = `<section class="section results" id="resultaten" aria-labelledby="resultaten-titel">
  <div class="wrap">
    <div class="section__head">
      <p class="eyebrow">Resultaten</p>
      <h2 class="title" id="resultaten-titel">Echt <em>voor &amp; na.</em></h2>
      <p class="section__lead">Sleep over de foto en zie het verschil. Allemaal klanten van GetWhite, zoals gedeeld op onze Instagram.</p>
    </div>
  </div>
  <div class="results__rail" data-rail tabindex="0" aria-label="Voor- en nafoto's, horizontaal scrollen">
    ${site.results.map((r, i) => `<figure class="compare tilt reveal" style="--d:${i * 0.06}s" data-compare>
      <div class="compare__media">
        <img src="/assets/img/resultaat-${r.n}-na.webp" alt="" width="960" height="720" loading="${i < 3 ? 'eager' : 'lazy'}" decoding="async">
        <div class="compare__before"><img src="/assets/img/resultaat-${r.n}-voor.webp" alt="" width="960" height="720" loading="${i < 3 ? 'eager' : 'lazy'}" decoding="async"></div>
        <span class="compare__tag compare__tag--voor">Voor</span><span class="compare__tag compare__tag--na">Na</span>
        <span class="compare__handle" aria-hidden="true"><i>${icon.arrow}${icon.arrow}</i></span>
        <input class="compare__range" type="range" min="0" max="100" value="50" aria-label="Vergelijk voor en na, resultaat ${i + 1}">
      </div>
      <figcaption class="sr-only">${esc(r.alt)}</figcaption>
    </figure>`).join('\n    ')}
  </div>
  <div class="wrap results__foot">
    <p class="note">${icon.spark} Niet iedereen krijgt hetzelfde resultaat: tandkleur, glazuur en de genen spelen mee.</p>
    <div class="rail-nav"><button class="rail-btn" type="button" data-rail-prev aria-label="Vorige">${icon.arrow}</button><button class="rail-btn" type="button" data-rail-next aria-label="Volgende">${icon.arrow}</button></div>
  </div>
</section>`;

const statement = `<section class="statement" aria-label="Over GetWhite">
  <div class="wrap">
    <p class="statement__text" data-words>Geen ingewikkelde trajecten. Twintig minuten in de stoel, het LED-licht aan, en je loopt naar buiten met een glimlach die je niet meer wilt verbergen.</p>
  </div>
</section>`;

const steps = `<section class="section steps" id="werkwijze" aria-labelledby="werkwijze-titel">
  <div class="wrap steps__grid">
    <div class="steps__aside">
      <p class="eyebrow">Werkwijze</p>
      <h2 class="title" id="werkwijze-titel">Zo werkt <em>het.</em></h2>
      <div class="steps__photos">
        <img class="reveal-img" data-parallax=".06" src="/assets/img/sfeer-kleurenwaaier.webp" alt="Klant met de kleurenwaaier in de GetWhite-studio" width="394" height="432" loading="lazy">
        <img class="reveal-img" data-parallax="-.05" src="/assets/img/sfeer-behandelstoel.webp" alt="Klant ontspant in de behandelstoel onder de LED-lamp" width="395" height="432" loading="lazy">
      </div>
    </div>
    <ol class="steps__list">
      ${site.steps.map((s, i) => `<li class="step reveal"><span class="step__n">0${i + 1}</span><div><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p></div></li>`).join('\n      ')}
    </ol>
  </div>
</section>`;

const sessionLabel = (n) => (n === P.popular ? 'Meest gekozen' : n === P.guarantee ? 'Geen resultaat, geld terug' : n === P.pack ? 'Pakket' : '');
const priceTable = (mode) => `<table class="ptable">
  <caption>${mode === 'solo' ? 'Prijs per persoon' : 'Duo: prijs voor 2 personen'}</caption>
  <thead><tr><th scope="col">Sessies</th><th scope="col">Basic</th><th scope="col">Ultra White</th></tr></thead>
  <tbody>${P.sessions.map((n) => `<tr><th scope="row">${n} sessies${sessionLabel(n) ? ` <small>${sessionLabel(n)}</small>` : ''}</th><td>${euro(P.lines.basic[mode][n])}</td><td>${euro(P.lines.ultra[mode][n])}</td></tr>`).join('')}</tbody>
</table>`;

const pricing = `<section class="section pricing" id="prijzen" aria-labelledby="prijzen-titel">
  <div class="wrap">
    <div class="section__head section__head--center">
      <p class="eyebrow eyebrow--light">Prijzen</p>
      <h2 class="title title--light" id="prijzen-titel">Stel je <em>behandeling</em> samen.</h2>
      <p class="section__lead">Kies, zie direct je prijs en stuur je aanvraag met één tik via WhatsApp.</p>
    </div>
    <form class="calc" data-calc data-prices='${JSON.stringify(P)}' data-wa="${contact.whatsapp}" onsubmit="return false">
      <div class="calc__controls">
        <fieldset class="seg">
          <legend>Met hoeveel personen?</legend>
          <label><input type="radio" name="mode" value="solo" checked><span>Alleen</span></label>
          <label><input type="radio" name="mode" value="duo"><span>Duo <small>met z’n tweeën</small></span></label>
        </fieldset>
        <fieldset class="lines">
          <legend>Kies je gel</legend>
          ${Object.entries(P.lines).map(([k, l], i) => `<label class="line-card"><input type="radio" name="line" value="${k}"${i === 0 ? ' checked' : ''}><span class="line-card__body"><b>${l.name}</b><small>${l.lead}</small><i class="line-card__from">vanaf ${euro(l.solo[2])}</i></span></label>`).join('\n          ')}
        </fieldset>
        <fieldset class="pills">
          <legend>Aantal sessies <small>(elk ${site.minutes} min)</small></legend>
          ${P.sessions.map((n) => `<label><input type="radio" name="sessions" value="${n}"${n === P.popular ? ' checked' : ''}><span>${n}${n === P.popular ? ' <i aria-hidden="true">★</i>' : ''}</span></label>`).join('')}
          <p class="pills__hint" data-hint aria-live="polite"></p>
        </fieldset>
        <label class="toggle">
          <input type="checkbox" name="polish">
          <span class="toggle__ui" aria-hidden="true"></span>
          <span><b>Polijsten</b> <span class="muted">+ ${euro(P.polish)}</span><small>Extra glans, langduriger resultaat en verwijdert oppervlakkige vlekken.</small></span>
        </label>
      </div>
      <div class="calc__ticket">
        <div class="ticket">
          <p class="ticket__label">Jouw behandeling</p>
          <p class="ticket__summary" data-summary>Basic · 4 sessies</p>
          <p class="ticket__price"><span class="sr-only">Totaal: </span><span data-price aria-live="polite">€60</span></p>
          <p class="ticket__per" data-per>€15 per sessie</p>
          <ul class="ticket__facts">
            <li>${icon.check}<span data-minutes>4 × ${site.minutes} minuten</span></li>
            <li>${icon.check}<span>Aanbetaling bij het boeken</span></li>
            <li>${icon.check}<span>Gratis verplaatsen tot 24 uur vooraf</span></li>
          </ul>
          <a class="btn btn--wa btn--block" data-wa-link href="${wa()}" target="_blank" rel="noopener">${icon.wa}<span>Vraag deze afspraak aan</span></a>
          <p class="ticket__fine">Je WhatsApp opent met je keuze al ingevuld.</p>
        </div>
      </div>
    </form>
    <details class="all-prices">
      <summary><span>Bekijk alle prijzen</span>${icon.arrow}</summary>
      <div class="all-prices__grid">${priceTable('solo')}${priceTable('duo')}</div>
      <p class="note note--light">Polijsten is een extra optie: + ${euro(P.polish)}. Elke sessie duurt ${site.minutes} minuten.</p>
    </details>
  </div>
</section>`;

const know = `<section class="section know" aria-labelledby="weten-titel">
  <div class="wrap">
    <div class="section__head">
      <p class="eyebrow">Goed om te weten</p>
      <h2 class="title" id="weten-titel">Eerlijk over <em>resultaat.</em></h2>
    </div>
    <div class="know__grid">
      <article class="card card--tall tilt reveal">
        <span class="card__n">01</span>
        <h3>Hoeveel sessies heb ik nodig?</h3>
        <p>Dat verschilt per persoon. Niet elk gebit reageert hetzelfde op bleken. Tandkleur, glazuur en de genen spelen een rol. Kort samengevat: voor iedereen is het anders, en dus ook het resultaat.</p>
        <p class="card__big">4<small>sessies kiezen de meeste klanten</small></p>
      </article>
      <article class="card tilt reveal" style="--d:.08s">
        <span class="card__n">02</span>
        <h3>Hoelang blijft het wit?</h3>
        <p>Je ziet direct verschil en het resultaat blijft maanden zichtbaar. Door eten en drinken kan de kleur langzaam vervagen. Daarom kiezen veel klanten na <strong>2–4 maanden</strong> voor een korte touch-up.</p>
        <ul class="chips">${site.lasting.factors.map((f) => `<li>${f}</li>`).join('')}</ul>
      </article>
      <article class="card card--photo reveal" style="--d:.16s">
        <img src="/assets/img/certificaat.webp" alt="Ingelijst certificaat Cursus Tandenbleken in de GetWhite-studio" width="931" height="787" loading="lazy">
        <div class="card__over">
          <span class="badge">${icon.check} Gecertificeerd</span>
          <h3>Officieel gecertificeerd</h3>
          <p>We krijgen vaak de vraag of GetWhite gecertificeerd is. Het antwoord: ja.</p>
        </div>
      </article>
    </div>
  </div>
</section>`;

const aftercare = `<section class="section care" id="nazorg" aria-labelledby="nazorg-titel">
  <div class="wrap">
    <div class="section__head section__head--split">
      <div>
        <p class="eyebrow">Na-zorg</p>
        <h2 class="title" id="nazorg-titel">Zo blijft het <em>stralend.</em></h2>
      </div>
      <p class="care__first reveal"><span class="care__clock" aria-hidden="true"><b>2</b>uur</span>${esc(site.aftercare.first)}</p>
    </div>
    <div class="care__grid">
      <div class="care__col care__col--do reveal">
        <h3>${icon.check} Wel doen</h3>
        <ul>${site.aftercare.do.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
      </div>
      <div class="care__col care__col--dont reveal" style="--d:.1s">
        <h3>${icon.cross} Liever even niet <small>24–48 uur</small></h3>
        <ul>${site.aftercare.dont.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
      </div>
    </div>
    <p class="note care__tip">${icon.spark} Tip: ${esc(site.aftercare.tip)}</p>
  </div>
</section>`;

const rules = `<section class="section rules" aria-labelledby="afspraken-titel">
  <div class="wrap">
    <div class="section__head">
      <p class="eyebrow">Afspraken</p>
      <h2 class="title" id="afspraken-titel">Fijn om te <em>weten.</em></h2>
    </div>
    <ul class="rules__grid">
      ${site.rules.map((r, i) => `<li class="rule reveal" style="--d:${(i % 4) * 0.06}s"><span>${String(i + 1).padStart(2, '0')}</span><h3>${esc(r.t)}</h3><p>${esc(r.d)}</p></li>`).join('\n      ')}
    </ul>
  </div>
</section>`;

const faq = `<section class="section faq" id="vragen" aria-labelledby="vragen-titel">
  <div class="wrap faq__grid">
    <div>
      <p class="eyebrow">Vragen</p>
      <h2 class="title" id="vragen-titel">Veel<em> gesteld.</em></h2>
      <figure class="faq__photo reveal"><img src="/assets/img/sfeer-eindresultaat.webp" alt="Blije klant laat haar eindresultaat zien" width="394" height="432" loading="lazy"><figcaption>Eindresultaat ✨</figcaption></figure>
    </div>
    <div class="faq__list">
      ${site.faq.map((f) => `<details class="qa"><summary>${esc(f.q)}<i aria-hidden="true"></i></summary><div class="qa__a"><p>${esc(f.a)}</p></div></details>`).join('\n      ')}
    </div>
  </div>
</section>`;

const cta = `<section class="cta" id="afspraak" aria-labelledby="cta-titel">
  <div class="cta__glow" aria-hidden="true"></div>
  ${toothSvg('cta__tooth')}
  <div class="wrap cta__inner">
    <p class="eyebrow eyebrow--light"><span class="dot"></span>${site.city}</p>
    <h2 class="title title--light title--xl" id="cta-titel">Klaar om te <em>stralen?</em></h2>
    <p class="section__lead">Stuur ons een bericht voor info of een afspraak. We reageren zo snel mogelijk.</p>
    <div class="cta__actions">
      <a class="btn btn--wa magnetic" href="${wa('Hoi GetWhite! Ik wil graag een afspraak maken.')}" target="_blank" rel="noopener">${icon.wa}<span>WhatsApp ${contact.whatsappLabel}</span></a>
      <a class="btn btn--ghost magnetic" href="${ig}" target="_blank" rel="noopener">${icon.ig}<span>DM @${contact.instagram}</span></a>
    </div>
  </div>
</section>`;

const footer = `<footer class="footer">
  <div class="wrap footer__inner">
    ${logo('logo--light')}
    <p>Tandenbleken in ${site.city}<br>Afspraak via WhatsApp of Instagram</p>
    <nav aria-label="Contact"><a href="${wa()}" target="_blank" rel="noopener">WhatsApp</a><a href="${ig}" target="_blank" rel="noopener">Instagram</a><a href="/#prijzen">Prijzen</a></nav>
    <p class="footer__fine">© ${year} ${site.name} · Geen cookies, geen trackers.</p>
  </div>
</footer>
<a class="dock" data-dock href="${wa('Hoi GetWhite! Ik wil graag een afspraak maken.')}" target="_blank" rel="noopener">${icon.wa}<span>Afspraak maken</span></a>`;

const index = `${head({ title: `${site.name} · Tandenbleken in ${site.city} vanaf €${P.lines.basic.solo[2]}`, desc: site.description })}
<body>
${header}
<main id="main">
${hero}
${marquee}
${results}
${statement}
${steps}
${pricing}
${know}
${aftercare}
${rules}
${faq}
${cta}
</main>
${footer}
</body>
</html>
`;

const notFound = `${head({ title: `Pagina niet gevonden · ${site.name}`, desc: site.description, path: '/404' })}
<body class="is-plain">
${header}
<main id="main" class="lost">
  ${toothSvg('lost__tooth')}
  <h1 class="title">Deze pagina is <em>weg gebleekt.</em></h1>
  <p class="section__lead">De pagina die je zoekt bestaat niet (meer).</p>
  <a class="btn btn--dark" href="/">Naar de homepage</a>
</main>
</body>
</html>
`;

await rm('public', { recursive: true, force: true });
await mkdir('public', { recursive: true });
await cp('assets', 'public/assets', { recursive: true });
await writeFile('public/index.html', index);
await writeFile('public/404.html', notFound);
await writeFile('public/robots.txt', site.draft || isTodo(site.url) ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`);
if (!site.draft && !isTodo(site.url))
  await writeFile('public/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${site.url}/</loc></url></urlset>\n`);
console.log(`public/ gebouwd${site.draft ? ' (concept: noindex)' : ''}`);
