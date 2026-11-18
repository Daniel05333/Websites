// Bouwt ./public uit src/site.mjs en assets/. Gebruik: npm run build
import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { site } from './src/site.mjs';

const isTodo = (v) => v && typeof v === 'object' && 'todo' in v;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const { contact: C } = site;
const ig = `https://www.instagram.com/${C.instagram}/`;
const wa = (t) => `https://wa.me/${C.whatsapp}${t ? `?text=${encodeURIComponent(t)}` : ''}`;
const year = new Date().getFullYear();
const price = (p) => (isTodo(p) ? '<span class="price price--todo" title="Prijs nog in te vullen">prijs op aanvraag</span>' : `<span class="price">${esc(p)}</span>`);

const icon = {
  wa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.4-.3Z"/></svg>',
  ig: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.5-6-6.5-11.2A6.5 6.5 0 0 1 12 3.3a6.5 6.5 0 0 1 6.5 6.5C18.5 15 12 21 12 21Z" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="10" r="2.3" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>',
  phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
  clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
  spark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0Z"/></svg>',
  heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 21s-8-5-9.6-10C1.2 7.2 3.6 4 7 4c2 0 3.8 1.2 5 3 1.2-1.8 3-3 5-3 3.4 0 5.8 3.2 4.6 7C20 16 12 21 12 21Z"/></svg>',
};

const ask = (label, cls = 'btn btn--pink', pre = '') => `<a class="${cls}" href="#aanvragen" data-ask${pre ? ` data-pre="${esc(pre)}"` : ''}><span>${label}</span>${icon.arrow}</a>`;
const logo = (cls = '') => `<img class="logo ${cls}" src="/assets/img/logo.png" alt="Feestje te Huur" width="560" height="560">`;

const head = `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<script>document.documentElement.classList.add('js')</script>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${site.name} · Kinderfeestjes op eigen locatie in ${site.city}</title>
<meta name="description" content="Feestje te Huur in Enschede: kinderfeestjes op onze eigen locatie. Princess Glam, Slime en Squishy Party, Hair Tinsel en Cake Bar. Plus candy bar, cake bar en popcornkar te huur.">
${site.draft ? '<meta name="robots" content="noindex, nofollow">\n' : ''}${!isTodo(site.url) ? `<link rel="canonical" href="${site.url}/">\n` : ''}<meta name="theme-color" content="#fbeef0">
<meta property="og:title" content="${site.name} · ${site.city}">
<meta property="og:type" content="website">
<meta property="og:locale" content="nl_NL">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/assets/fonts/fraunces.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/jost.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/main.css">
<script src="/assets/js/main.js" defer></script>
</head>
<body>`;

const header = `<a class="skip" href="#main">Naar de inhoud</a>
<div class="progress" data-progress aria-hidden="true"></div>
<header class="masthead" data-masthead>
  <a class="masthead__brand" href="#top" aria-label="Feestje te Huur, naar boven">${logo()}</a>
  <nav class="masthead__nav" aria-label="Hoofdmenu">
    <a href="#feestjes">Feestjes</a>
    <a href="#locatie">Locatie</a>
    <a href="#verhuur">Verhuur</a>
    <a href="#zo-werkt-het">Zo werkt het</a>
  </nav>
  ${ask('Datum aanvragen', 'btn btn--sm btn--pink masthead__cta')}
</header>`;

const confetti = Array.from({ length: 26 }, (_, i) => `<i style="--i:${i}"></i>`).join('');

const hero = `<section class="hero" id="top" data-hero>
  <div class="hero__sticky">
    <div class="hero__bg" aria-hidden="true"><span class="hero__glow"></span></div>
    <canvas class="hero__canvas" data-balloons aria-hidden="true"></canvas>
    <div class="hero__fallback" aria-hidden="true"><b></b><b></b><b></b></div>
    <div class="confetti" aria-hidden="true">${confetti}</div>
    <div class="hero__copy">
      <p class="eyebrow">${icon.pin}Kinderfeestjes op onze eigen locatie · ${site.city}</p>
      <h1 class="hero__title"><span class="line"><span>Maak van ieder</span></span> <span class="line"><span>feestje iets</span></span> <span class="line"><em>bijzonders!</em></span></h1>
      <p class="hero__lead">Glitter &amp; glam, slime en squishies, een cake bar of candy bar. Op onze feestlocatie in ${site.city}, of gehuurd voor jouw eigen feest.</p>
      <div class="hero__actions">${ask('Vraag een datum aan', 'btn btn--pink magnetic')}<a class="btn btn--line magnetic" href="#feestjes"><span>Bekijk de feestjes</span></a></div>
    </div>
    <p class="hero__script" aria-hidden="true">Party vibes</p>
  </div>
</section>`;

const mItems = ['Princess Glam', 'Slime Party', 'Squishy Party', 'Hair Tinsel', 'Cake Bar', 'Candy Bar', 'Popcorn', 'Glitter & Glam'];
const marquee = `<div class="marquee"><p class="sr-only">${mItems.join(' · ')}</p><div class="marquee__track" aria-hidden="true">${[0, 1].map(() => `<span>${mItems.map((t) => `${esc(t)}<i>${icon.spark}</i>`).join('')}</span>`).join('')}</div></div>`;

const parties = `<section class="section parties" id="feestjes" aria-labelledby="feestjes-titel">
  <div class="wrap">
    <div class="section__head section__head--center">
      <p class="eyebrow">De feestjes</p>
      <h2 class="title" id="feestjes-titel">Kies jullie <em>feestje.</em></h2>
      <p class="section__lead">Op onze eigen locatie in Enschede, met oog voor detail en plezier.</p>
    </div>
    <ul class="party-grid">
      ${site.parties.map((p, i) => `<li class="party tilt reveal" style="--d:${(i % 3) * 0.08}s">
        <div class="party__media"><img src="/assets/img/${p.img}.webp" alt="${esc(p.name)} bij Feestje te Huur" width="392" height="526" loading="${i < 3 ? 'eager' : 'lazy'}"><span class="party__tag">${esc(p.tag)}</span></div>
        <div class="party__body">
          <h3>${esc(p.name)}</h3>
          <p>${esc(p.desc)}</p>
          <div class="party__foot">${price(p.price)}${ask('Aanvragen', 'party__ask', p.name)}</div>
        </div>
      </li>`).join('\n      ')}
    </ul>
  </div>
</section>`;

const location = `<section class="section location" id="locatie" aria-labelledby="locatie-titel">
  <div class="wrap location__grid">
    <div class="location__stack" aria-hidden="true">
      <img class="reveal-img" data-parallax=".05" src="/assets/img/locatie-cake-bar.webp" alt="" loading="lazy">
      <img class="reveal-img" data-parallax="-.06" src="/assets/img/princess-glam.webp" alt="" loading="lazy">
      <span class="location__badge">${icon.heart}</span>
    </div>
    <div>
      <p class="eyebrow">Onze locatie</p>
      <h2 class="title" id="locatie-titel">Geen ruimte thuis? <em class="script">Wij hebben een locatie!</em></h2>
      <p class="section__lead">Een lichte, feestelijk aangeklede ruimte in ${site.city}, met glitterwand, parasol en bars. Jullie komen gezellig feesten, wij zorgen dat alles klaarstaat.</p>
      <ul class="facts">
        <li>${icon.pin}<span><b>${site.city}</b>${isTodo(C.address) ? 'Adres bij je aanvraag' : esc(C.address)}</span></li>
        <li>${icon.clock}<span><b>${esc(C.hours)}</b>Plan je feestje vooraf</span></li>
        <li>${icon.phone}<span><b>${esc(C.phone)}</b>Bellen of WhatsApp</span></li>
      </ul>
    </div>
  </div>
</section>`;

const rentals = `<section class="section rentals" id="verhuur" aria-labelledby="verhuur-titel">
  <div class="wrap">
    <div class="section__head section__head--split">
      <div>
        <p class="eyebrow eyebrow--light">Verhuur</p>
        <h2 class="title title--light" id="verhuur-titel">Alles voor jouw feestje <em>te huur.</em></h2>
      </div>
      <p class="section__lead">Van kinderfeestjes tot ${site.occasions.slice(1).join(' en ').toLowerCase()}: verhuur, aankleding en complete feestbelevingen.</p>
    </div>
  </div>
  <div class="rail" data-rail tabindex="0" role="region" aria-label="Verhuur, horizontaal scrollen">
    ${site.rentals.map((r, i) => `<article class="rent" style="--i:${i}">
      <img src="/assets/img/${r.img}.webp" alt="${esc(r.name)} te huur" width="392" height="526" loading="lazy">
      <div class="rent__body"><h3>${esc(r.name)}</h3><p>${esc(r.desc)}</p>${ask('Huren', 'rent__ask', `Huren: ${r.name}`)}</div>
    </article>`).join('\n    ')}
  </div>
</section>`;

const steps = `<section class="section steps" id="zo-werkt-het" aria-labelledby="stappen-titel">
  <div class="wrap">
    <div class="section__head section__head--center">
      <p class="eyebrow">Zo werkt het</p>
      <h2 class="title" id="stappen-titel">In vier stappen naar <em>feest.</em></h2>
    </div>
    <ol class="steps__row" data-steps>
      ${site.steps.map((s, i) => `<li class="step reveal" style="--d:${i * 0.1}s"><span class="step__n">${i + 1}</span><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p></li>`).join('\n      ')}
    </ol>
  </div>
</section>`;

const options = [...site.parties.map((p) => p.name), ...site.rentals.map((r) => `Huren: ${r.name}`), 'Iets anders / advies'];
const request = `<section class="section request" id="aanvragen" aria-labelledby="aanvragen-titel">
  <div class="wrap request__grid">
    <div>
      <p class="eyebrow">Aanvragen</p>
      <h2 class="title" id="aanvragen-titel">Vraag een <em>datum</em> aan.</h2>
      <p class="section__lead">Vul in wat je wilt. Je aanvraag gaat in één tik naar onze WhatsApp, en we laten zo snel mogelijk weten of de datum vrij is.</p>
      <p class="request__alt"><a class="link" href="tel:+${C.whatsapp}">${icon.phone}${esc(C.phone)}</a><a class="link" href="${ig}" target="_blank" rel="noopener">${icon.ig}@${C.instagram}</a></p>
    </div>
    <form class="card-form" data-form data-wa="${C.whatsapp}" novalidate>
      <label class="field"><span>Welk feestje?</span>
        <select name="party" required><option value="">Kies…</option>${options.map((o) => `<option>${esc(o)}</option>`).join('')}</select>
      </label>
      <div class="field-row">
        <label class="field"><span>Gewenste datum</span><input type="date" name="date" required></label>
        <label class="field"><span>Tijd <small>(optioneel)</small></span><select name="part"><option>Maakt niet uit</option><option>Ochtend</option><option>Middag</option><option>Eind van de middag</option></select></label>
      </div>
      <div class="field-row">
        <label class="field"><span>Aantal kinderen</span><input type="number" name="kids" min="1" max="40" inputmode="numeric" placeholder="Bijv. 8"></label>
        <label class="field"><span>Leeftijd jarige</span><input type="number" name="age" min="1" max="18" inputmode="numeric" placeholder="Bijv. 7"></label>
      </div>
      <label class="field"><span>Je naam</span><input name="name" autocomplete="name" required></label>
      <label class="field"><span>Wensen <small>(optioneel)</small></span><input name="note" placeholder="Bijv. thema, allergieën, cake bar erbij"></label>
      <div class="preview"><span>Je bericht</span><p data-preview>Kies een feestje…</p></div>
      <p class="form__error" data-error role="alert"></p>
      <button class="btn btn--wa btn--block" type="submit">${icon.wa}<span>Verstuur via WhatsApp</span></button>
      <p class="form__fine">WhatsApp opent met je aanvraag al ingevuld. Je feestje staat pas vast als wij het bevestigen.</p>
    </form>
  </div>
</section>`;

const footer = `<footer class="footer">
  <div class="wrap footer__inner">
    ${logo('logo--footer')}
    <div><p class="footer__h">${site.name}</p><p>Kinderfeestjes op eigen locatie<br>${site.city} · ${esc(C.hours.toLowerCase())}</p></div>
    <nav aria-label="Footer"><a href="${wa()}" target="_blank" rel="noopener">WhatsApp</a><a href="tel:+${C.whatsapp}">${esc(C.phone)}</a><a href="${ig}" target="_blank" rel="noopener">Instagram</a></nav>
    <p class="footer__fine">© ${year} ${site.name} · Geen cookies, geen trackers.</p>
  </div>
</footer>
<a class="dock" data-dock href="#aanvragen" data-ask>${icon.heart}<span>Datum aanvragen</span></a>`;

const index = `${head}
${header}
<main id="main">
${hero}
${marquee}
${parties}
${location}
${rentals}
${steps}
${request}
</main>
${footer}
</body>
</html>
`;

const notFound = `${head}
<main id="main" class="lost">
  ${logo('logo--lost')}
  <h1 class="title">Oeps, dit feestje <em>bestaat niet.</em></h1>
  <a class="btn btn--pink" href="/"><span>Naar de homepage</span>${icon.arrow}</a>
</main>
</body>
</html>
`;

await rm('public', { recursive: true, force: true });
await mkdir('public', { recursive: true });
await cp('assets', 'public/assets', { recursive: true });
await writeFile('public/index.html', index);
await writeFile('public/404.html', notFound);
await writeFile('public/robots.txt', site.draft || isTodo(site.url) ? 'User-agent: *\nDisallow: /\n' : 'User-agent: *\nAllow: /\n');
console.log(`public/ gebouwd${site.draft ? ' (concept: noindex)' : ''}`);
