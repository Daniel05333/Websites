// Bouwt ./public uit src/site.mjs en assets/. Gebruik: npm run build
import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { site } from './src/site.mjs';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const C = site.contact;
const ig = `https://www.instagram.com/${C.instagram}/`;
const img = (n) => `/assets/img/${n}.webp`;
const pad = (n) => String(n).padStart(2, '0');
const eur = (n) => `€${n}`;

const I = {
  wa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.4-.3Z"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  ig: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor"/></svg>',
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.5-6-6.5-11.2A6.5 6.5 0 0 1 12 3.3a6.5 6.5 0 0 1 6.5 6.5C18.5 15 12 21 12 21Z" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="12" cy="10" r="2.3" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
  drag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 7-5 5 5 5M15 7l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};
// G-merk van Glowgarden, nagetekend als SVG (twee bogen en een blokje)
const G = (cls = '') => `<svg class="gmark ${cls}" viewBox="0 0 100 100" aria-hidden="true"><path d="M84 27A41 41 0 1 0 91 52H63" fill="none" stroke="currentColor" stroke-width="5.5"/><path d="M70 33A27 27 0 1 0 70 69" fill="none" stroke="currentColor" stroke-width="5.5"/><rect x="30" y="67" width="7" height="7" fill="currentColor"/></svg>`;
const cta = (label, cls = 'btn btn--gold', attrs = '') => `<a class="${cls}" href="#afspraak"${attrs}><span>${label}</span>${I.arrow}</a>`;

const head = (title) => `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<script>document.documentElement.classList.add('js')</script>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="Glowgarden in Enschede: laserontharing met de alexandrietlaser en Hydrafacial, voor vrouwen en mannen. Bekijk prijzen, acties en resultaten en plan je afspraak via WhatsApp.">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#1f1612">
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#1f1612"/><g transform="translate(12 12) scale(.76)"><path d="M84 27A41 41 0 1 0 91 52H63" fill="none" stroke="#d4b07a" stroke-width="7"/><path d="M70 33A27 27 0 1 0 70 69" fill="none" stroke="#d4b07a" stroke-width="7"/></g></svg>')}">
<link rel="preload" href="/assets/fonts/cormorant.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/main.css">
<script src="/assets/js/app.js" defer></script>
</head>`;

const nav = `<a class="skip" href="#main">Naar de inhoud</a>
<div class="progress" data-progress aria-hidden="true"></div>
<header class="nav" data-nav>
  <a class="nav__brand" href="#top">${G()}<span><b>Glowgarden</b><small>Skin &amp; Laser Removal</small></span></a>
  <nav class="nav__links" aria-label="Hoofdmenu"><a href="#behandelingen">Behandelingen</a><a href="#prijzen">Prijzen</a><a href="#resultaten">Resultaten</a><a href="#acties">Acties</a></nav>
  ${cta('Plan je afspraak', 'btn btn--gold btn--sm nav__cta')}
</header>`;

const hero = `<section class="hero" id="top" data-hero>
  <div class="hero__sticky">
    <div class="hero__glow" aria-hidden="true"></div>
    <canvas class="hero__gem" data-gem aria-hidden="true"></canvas>
    <div class="hero__fallback" aria-hidden="true">${G()}</div>
    <span class="hero__beam" aria-hidden="true" data-beam></span>
    <div class="hero__copy">
      <p class="eyebrow">${I.pin}Laserontharing · Hydrafacial · ${site.city}</p>
      <h1 class="hero__title"><span class="ln"><span>Zeg vaarwel tegen</span></span> <span class="ln"><span><em>eindeloos scheren.</em></span></span></h1>
      <p class="hero__lead">Laserontharing met de alexandrietlaser en Hydrafacial voor een stralende huid. Voor vrouwen én mannen, met persoonlijke aandacht bij elke afspraak.</p>
      <div class="hero__actions">${cta('Plan je afspraak', 'btn btn--gold magnetic')}<a class="btn btn--line magnetic" href="#prijzen"><span>Bekijk prijzen</span></a></div>
    </div>
    <p class="hero__gemcap" data-gemcap><i data-gemdot></i><span><b>Alexandriet</b> groen bij daglicht, rood bij kunstlicht. Het kristal in de laser.</span></p>
  </div>
</section>`;

const strip = (() => {
  const items = ['Hele lichaam + gezicht €100', 'Mini zone €50', 'Win 2 gratis laserbehandelingen', 'Voor vrouwen én mannen', 'Alexandrietlaser', 'Hydrafacial'];
  return `<a class="strip" href="#acties"><p class="sr-only">${items.join(' · ')}</p><span class="strip__track" aria-hidden="true">${[0, 1].map(() => `<span>${items.map((t) => `${t}${G('strip__g')}`).join('')}</span>`).join('')}</span></a>`;
})();

const treatments = `<section class="section treat" id="behandelingen" aria-labelledby="tr-h">
  <div class="wrap">
    <div class="head head--split"><div><p class="eyebrow">Behandelingen</p><h2 class="title" id="tr-h">Twee behandelingen, <em>één doel.</em></h2></div><p class="lead">Een gladde, stralende huid zonder gedoe. Bij Glowgarden kun je terecht voor laserontharing en Hydrafacial, als vrouw en als man.</p></div>
    <div class="cards">
      <article class="tcard tilt reveal" id="laser"><figure><img src="${img('laser-gezicht')}" alt="Laserbehandeling van het gezicht" loading="lazy"></figure>
        <div class="tcard__body"><p class="tcard__n">01</p><h3>Laserontharing</h3><p>Met de alexandrietlaser pak je ongewenste haargroei bij de wortel aan. Geen scheermesjes en stoppels meer, wel een huid die glad blijft.</p>
          <ul class="ticks">${site.laser.perks.map((p) => `<li>${I.check}${p}</li>`).join('')}</ul>${cta('Laser plannen', 'btn btn--line btn--sm', ' data-pick-treat="laser"')}</div></article>
      <article class="tcard tilt reveal" id="hydra" style="--d:.1s"><figure><img src="${img('hydrafacial')}" alt="Hydrafacial-behandeling van het gezicht" loading="lazy"></figure>
        <div class="tcard__body"><p class="tcard__n">02</p><h3>Hydrafacial</h3><p>Een diepe reiniging en hydratatie in één behandeling. Je huid voelt fris, zacht en ziet er direct stralend uit.</p>
          <ol class="hsteps">${site.hydra.steps.map((s, i) => `<li><span>${i + 1}</span>${s}</li>`).join('')}</ol>${cta('Hydrafacial plannen', 'btn btn--line btn--sm', ' data-pick-treat="hydra"')}</div></article>
    </div>
    <div class="how">
      <div class="how__img reveal"><img src="${img('salon-laser')}" alt="Glowgarden in de salon bij de alexandrietlaser" loading="lazy"><span class="how__tag">Alexandrietlaser</span></div>
      <div class="how__copy"><p class="eyebrow">Zo werkt laserontharing</p><h3 class="title title--sm">Een plan dat bij <em>jouw huid</em> past.</h3>
        <ol class="how__steps" data-how>${site.laser.steps.map((s, i) => `<li class="reveal" style="--d:${i * 0.1}s"><span>${pad(i + 1)}</span><div><h4>${s.t}</h4><p>${s.d}</p></div></li>`).join('')}</ol>
        <p class="tip"><b>Tip van Glowgarden</b>${site.laser.tip}</p></div>
    </div>
  </div>
</section>`;

const row = (name, price, was, treat) => `<li class="price"><span class="price__name">${esc(name)}</span><i></i><span class="price__val">${was ? `<s>${eur(was)}</s> ` : ''}${eur(price)}</span><button class="price__add" type="button" data-add="${esc(treat ?? name)}" data-price="${price}" aria-label="Voeg ${esc(name)} toe aan je afspraak" aria-pressed="false">${I.plus}</button></li>`;
const W = site.women;
const prices = `<section class="section prices" id="prijzen" aria-labelledby="pr-h">
  <div class="wrap">
    <div class="head head--center"><p class="eyebrow">Prijzen laserontharing</p><h2 class="title" id="pr-h">Voor vrouwen <em>én mannen.</em></h2></div>
    <div class="who" role="tablist" aria-label="Prijslijst voor"><span class="who__pill" aria-hidden="true"></span>
      <button type="button" role="tab" id="t-vrouw" aria-controls="p-vrouw" aria-selected="true" data-who="vrouw">Vrouw</button><button type="button" role="tab" id="t-man" aria-controls="p-man" aria-selected="false" tabindex="-1" data-who="man">Man</button></div>
    <div class="flip" data-flip>
      <div class="flip__face flip__front" role="tabpanel" id="p-vrouw" aria-labelledby="t-vrouw">
        <div class="pgrid">
          ${['mini', 'duo', 'xl'].map((k) => `<div class="pbox${k === 'mini' ? ' pbox--hot' : ''}"><h3>${W[k].note}</h3><ul>${W[k].items.map(([n, p, w]) => row(n, p, w, `${n} (${k === 'mini' ? 'mini zone' : k === 'duo' ? '2 zones' : 'XL'})`)).join('')}</ul></div>`).join('')}
          <div class="pbox pbox--wide"><h3>${W.single.note} <small>onder korting</small></h3><ul class="cols2">${W.single.items.map(([n, p]) => row(n, p)).join('')}</ul></div>
        </div>
      </div>
      <div class="flip__face flip__back" role="tabpanel" id="p-man" aria-labelledby="t-man">
        <div class="pgrid pgrid--man"><div class="pbox pbox--wide"><h3>Alexandrietlaser · man</h3><ul class="cols2">${site.men.map(([n, p]) => row(n, p, null, `${n} (man)`)).join('')}</ul></div>
          <div class="pbox pbox--photo"><img src="${img('rug-man-na')}" alt="" loading="lazy"><p>Rug, borst, kaaklijn of fullbody. Ook voor mannen een gladde huid zonder dagelijks scheren.</p></div></div>
      </div>
    </div>
    <p class="prices__note">Tik op <b>+</b> om een zone mee te nemen in je afspraak. Hydrafacial: prijs op aanvraag. Betalen gaat contant.</p>
  </div>
</section>`;

const results = `<section class="section results" id="resultaten" aria-labelledby="rs-h">
  <div class="wrap">
    <div class="head head--split"><div><p class="eyebrow">Resultaten</p><h2 class="title" id="rs-h">Voor <em>en na.</em></h2></div><p class="lead">Echte resultaten van klanten van Glowgarden. Sleep de lijn om het verschil te zien. Het resultaat verschilt per persoon.</p></div>
    <div class="filters" role="group" aria-label="Filter resultaten">${[['alle', 'Alles'], ['vrouw', 'Vrouw'], ['man', 'Man']].map(([k, l], i) => `<button type="button" class="chip" data-rf="${k}" aria-pressed="${!i}">${l}</button>`).join('')}</div>
    <ul class="ba-grid">${site.results.map(([n, label, who], i) => `<li class="ba reveal" data-who="${who}" style="--d:${(i % 3) * 0.08}s">
      <div class="ba__frame" data-ba style="--x:50%"><img src="${img(`${n}-na`)}" alt="Na de behandeling: ${label.toLowerCase()}" loading="lazy"><div class="ba__voor"><img src="${img(`${n}-voor`)}" alt="Voor de behandeling: ${label.toLowerCase()}" loading="lazy"></div>
        <span class="ba__lbl ba__lbl--l">Voor</span><span class="ba__lbl ba__lbl--r">Na</span><span class="ba__handle">${I.drag}</span>
        <input class="ba__range" type="range" min="0" max="100" value="50" aria-label="Vergelijk voor en na: ${label.toLowerCase()}"></div>
      <p class="ba__cap">${label}<span>${who === 'man' ? 'Man' : 'Vrouw'}</span></p></li>`).join('')}</ul>
  </div>
</section>`;

const now = new Date();
const deals = `<section class="section deals" id="acties" aria-labelledby="ac-h">
  <div class="wrap">
    <div class="head head--center"><p class="eyebrow">Acties</p><h2 class="title" id="ac-h">Nu bij <em>Glowgarden.</em></h2></div>
    <div class="deal-row">${site.deals.map((d, i) => `<article class="deal tilt reveal${i === 0 ? ' deal--main' : ''}" style="--d:${i * 0.08}s"><p class="deal__tag">${d.tag}</p><h3>${d.title}</h3><p class="deal__price">${d.was ? `<s>${eur(d.was)}</s>` : ''}<b>${eur(d.price)}</b></p><p class="deal__note">${d.note}</p>${cta('Claim deze actie', 'btn btn--sm ' + (i === 0 ? 'btn--dark' : 'btn--line'), ` data-add-deal="${esc(d.treat)}" data-price="${d.price}"`)}</article>`).join('')}</div>
    <article class="win reveal" aria-labelledby="win-h">
      <div class="win__prize"><span class="win__badge">Winactie</span><p class="win__big" id="win-h">${site.win.prize}</p><p>${site.win.value}</p><p class="win__days" data-days></p></div>
      <ol class="win__steps">${site.win.steps.map((s, i) => `<li><span>${i + 1}</span>${s}</li>`).join('')}</ol>
      <div class="win__foot"><p>${site.win.when}. Heel veel succes allemaal!</p><a class="btn btn--line btn--sm" href="${ig}" target="_blank" rel="noopener">${I.ig}<span>Doe mee op Instagram</span></a></div>
    </article>
  </div>
</section>`;

const reviews = `<section class="section reviews" aria-labelledby="rv-h">
  <div class="wrap reviews__grid">
    <div><p class="eyebrow">Reviews</p><h2 class="title" id="rv-h">Wat klanten <em>zeggen.</em></h2><p class="lead">Berichten die klanten na hun behandeling stuurden. Professioneel, hygiënisch en met prachtige resultaten.</p>
      <ul class="badges">${['Professionele behandeling', 'Veilig en hygiënisch', 'Prachtige resultaten'].map((b) => `<li>${I.check}${b}</li>`).join('')}</ul></div>
    <div class="phone" data-phone><div class="phone__screen"><p class="phone__top">${G()}<b>Glowgarden</b><small>Reviews van klanten</small></p>
      <ul class="chat" data-chat>${site.reviews.map((r, i) => `<li class="bubble${i % 3 === 2 ? ' bubble--me' : ''}" style="--i:${i}"><p>${esc(r)}</p><span>${['20:14', '19:32', '17:25', '18:40', '19:21', '21:18'][i]}</span></li>`).join('')}</ul></div></div>
  </div>
</section>`;

const rules = `<section class="section rules" aria-labelledby="ru-h">
  <div class="wrap">
    <div class="head head--split"><div><p class="eyebrow">Voorbereiding</p><h2 class="title" id="ru-h">Goed voorbereid <em>naar je afspraak.</em></h2></div><p class="lead">De huisregels van Glowgarden, voor een soepele en veilige behandeling.</p></div>
    <ol class="rule-grid">${site.rules.map(([t, d], i) => `<li class="rule reveal" style="--d:${(i % 4) * 0.06}s"><span>${pad(i + 1)}</span><h3>${t}</h3><p>${d}</p></li>`).join('')}</ol>
  </div>
</section>`;

const book = `<section class="section book" id="afspraak" aria-labelledby="bk-h">
  <div class="wrap book__grid">
    <div class="book__side"><p class="eyebrow">Afspraak</p><h2 class="title" id="bk-h">Plan je afspraak <em>via WhatsApp.</em></h2>
      <p class="lead">Kies je behandeling en je voorkeur. Je bericht staat meteen klaar in WhatsApp, zodat Glowgarden je snel een tijd kan geven.</p>
      <div class="sum" aria-live="polite"><p class="sum__h">Jouw afspraak</p><ul data-sum-list></ul><p class="sum__total"><span>Indicatie</span><b data-sum-total>€0</b></p><p class="sum__fine">Betalen gaat contant, in de salon.</p></div></div>
    <form class="form" data-form data-wa="${C.whatsapp}" novalidate>
      <fieldset class="field"><legend>Voor wie?</legend><div class="chips">${['Vrouw', 'Man'].map((v, i) => `<label><input type="radio" name="who" value="${v}"${i ? '' : ' checked'}><span>${v}</span></label>`).join('')}</div></fieldset>
      <fieldset class="field"><legend>Behandeling</legend><div class="chips">${[['laser', 'Laserontharing'], ['hydra', 'Hydrafacial'], ['intake', 'Eerst een intake']].map(([v, l], i) => `<label><input type="checkbox" name="treat" value="${v}"${i ? '' : ' checked'}><span>${l}</span></label>`).join('')}</div></fieldset>
      <div class="field" data-zones-field><span class="field__lbl">Zones of acties</span><div class="zones" data-zones><p class="zones__empty">Nog niets gekozen. Tik bij <a href="#prijzen">de prijzen</a> of <a href="#acties">acties</a> op +, of kies hier:</p></div>
        <select class="zones__quick" data-quick aria-label="Snel een zone kiezen"><option value="">+ Zone toevoegen…</option></select></div>
      <fieldset class="field"><legend>Voorkeur dag</legend><div class="chips chips--days">${['ma', 'di', 'wo', 'do', 'vr', 'za'].map((d) => `<label><input type="checkbox" name="days" value="${d}"><span>${d}</span></label>`).join('')}</div></fieldset>
      <fieldset class="field"><legend>Voorkeur dagdeel</legend><div class="chips">${['Ochtend', 'Middag', 'Avond', 'Maakt niet uit'].map((d, i) => `<label><input type="radio" name="part" value="${d}"${i === 3 ? ' checked' : ''}><span>${d}</span></label>`).join('')}</div></fieldset>
      <div class="field-row"><label class="field"><span class="field__lbl">Je naam</span><input name="name" autocomplete="name" required></label><label class="field"><span class="field__lbl">Eerste keer?</span><select name="first"><option>Ja, eerste keer</option><option>Nee, ik ben al klant</option></select></label></div>
      <div class="check-row"><label class="check"><input type="checkbox" name="rules" required><span>Ik heb de huisregels gelezen.</span></label><a href="#voorbereiding">Bekijk de huisregels</a></div>
      <div class="preview"><span>Je WhatsApp-bericht</span><p data-preview></p></div>
      <p class="error" data-error role="alert"></p>
      <button class="btn btn--wa btn--full" type="submit">${I.wa}<span>Verstuur via WhatsApp</span></button>
      <p class="fine">WhatsApp opent met je bericht al ingevuld. Je afspraak staat vast zodra Glowgarden een tijd bevestigt.</p>
    </form>
  </div>
</section>
<div class="toast" data-toast role="status" aria-live="polite"></div>`;

const footer = `<footer class="foot">
  <div class="wrap foot__in">
    <a class="foot__brand" href="#top">${G()}<span><b>Glowgarden.nl</b><small>Skin &amp; Hair Laser Removal</small></span></a>
    <p>Laserontharing · Hydrafacial<br>${site.city}, Nederland · <a href="tel:+${C.whatsapp}">${C.phone}</a></p>
    <nav aria-label="Footer"><a href="https://wa.me/${C.whatsapp}" target="_blank" rel="noopener">WhatsApp</a><a href="${ig}" target="_blank" rel="noopener">Instagram</a><a href="#prijzen">Prijzen</a><a href="#afspraak">Afspraak</a></nav>
    <p class="foot__fine">© ${now.getFullYear()} ${site.name} · Concept · Geen cookies, geen trackers.</p>
  </div>
</footer>
<a class="dock" data-dock href="#afspraak">${I.wa}<span>Plan je afspraak</span></a>`;

const zonesData = [
  ...site.deals.map((d) => [d.treat, d.price, 'Acties']),
  ...['mini', 'duo', 'xl'].flatMap((k) => W[k].items.map(([n, p]) => [`${n} (${k === 'mini' ? 'mini zone' : k === 'duo' ? '2 zones' : 'XL'})`, p, `Vrouw · ${W[k].note.split(' · ')[0]}`])),
  ...W.single.items.map(([n, p]) => [n, p, 'Vrouw · losse zones']),
  ...site.men.map(([n, p]) => [`${n} (man)`, p, 'Man']),
];
const index = `${head(`${site.name} · Laserontharing & Hydrafacial · ${site.city}`)}
<body>
${nav}
<main id="main">
${hero}
${strip}
${treatments}
${prices}
${results}
${deals}
${reviews}
<div id="voorbereiding">${rules}</div>
${book}
</main>
${footer}
<script type="application/json" id="gg-data">${JSON.stringify({ zones: zonesData }).replace(/</g, '\\u003c')}</script>
</body>
</html>
`;

await rm('public', { recursive: true, force: true });
await mkdir('public', { recursive: true });
await cp('assets', 'public/assets', { recursive: true });
await writeFile('public/index.html', index);
await writeFile('public/404.html', `${head('Pagina niet gevonden')}<body><main class="lost">${G()}<h1 class="title">Deze pagina <em>bestaat niet.</em></h1><a class="btn btn--gold" href="/"><span>Naar de homepage</span></a></main></body></html>\n`);
await writeFile('public/robots.txt', 'User-agent: *\nDisallow: /\n');
console.log('public/ gebouwd (concept: noindex)');
