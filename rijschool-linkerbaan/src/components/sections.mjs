import { site, packages, serviceArea, steps, reasons, faq, formatPrice } from '../data/site.mjs';
import { icon } from './icons.mjs';
import { esc, btn, telHref, mailHref, waHref } from './layout.mjs';

// Wegillustratie in perspectief. Wordt gebruikt zolang er geen echte foto is.
const roadVisual = () => `
<svg class="road" viewBox="0 0 600 600" role="img" aria-labelledby="road-title" preserveAspectRatio="xMidYMid slice">
  <title id="road-title">Illustratie: een lesauto rijdt over een weg met twee rijstroken richting de zonsopgang</title>
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1B2A40"/><stop offset=".75" stop-color="#3A3F4A"/><stop offset="1" stop-color="#8A6A2A"/>
    </linearGradient>
    <radialGradient id="sun" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="#FFD04D"/><stop offset=".35" stop-color="#FFC21A" stop-opacity=".55"/><stop offset="1" stop-color="#FFC21A" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="asphalt" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2A3B55"/><stop offset="1" stop-color="#0B1422"/>
    </linearGradient>
    <linearGradient id="land" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1E2D44"/><stop offset="1" stop-color="#0F1B2D"/>
    </linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#sky)"/>
  <circle cx="300" cy="200" r="190" fill="url(#sun)"/>
  <circle cx="300" cy="205" r="46" fill="#FFD04D"/>
  <path d="M0 200 C90 186 160 196 230 192 S420 184 600 198 V600 H0Z" fill="#26324A"/>
  <path d="M0 214 C120 206 210 212 300 210 S480 204 600 214 V600 H0Z" fill="url(#land)"/>
  <path d="M288 210 L312 210 L600 600 L0 600 Z" fill="url(#asphalt)"/>
  <path d="M289 210 L20 600" stroke="#fff" stroke-width="6" stroke-opacity=".85"/>
  <path d="M311 210 L580 600" stroke="#fff" stroke-width="6" stroke-opacity=".85"/>
  <path class="road__dashes" d="M300 210 L300 600" stroke="#FFC21A" stroke-width="8" stroke-dasharray="24 28"/>
  <g class="road__car">
    <ellipse cx="190" cy="568" rx="64" ry="12" fill="#000" opacity=".35"/>
    <rect x="132" y="402" width="116" height="164" rx="34" fill="#F7F5F0"/>
    <rect x="148" y="432" width="84" height="40" rx="12" fill="#0F1B2D" opacity=".9"/>
    <rect x="148" y="496" width="84" height="44" rx="12" fill="#0F1B2D" opacity=".9"/>
    <rect x="160" y="384" width="60" height="24" rx="7" fill="#FFC21A"/>
    <text x="190" y="401.5" text-anchor="middle" font-family="Bricolage Grotesque, sans-serif" font-weight="800" font-size="15" fill="#0F1B2D">LES</text>
    <rect x="140" y="556" width="22" height="8" rx="4" fill="#E0483A"/>
    <rect x="218" y="556" width="22" height="8" rx="4" fill="#E0483A"/>
  </g>
</svg>`;

export const hero = () => {
  const photo = site.photos.hero;
  const visual = photo
    ? `<img src="${photo.src}" alt="${esc(photo.alt)}" width="${photo.width}" height="${photo.height}" fetchpriority="high">`
    : roadVisual();
  return `
<section class="hero" aria-labelledby="hero-title">
  <div class="container hero__grid">
    <div class="hero__copy">
      <p class="eyebrow eyebrow--light"><span class="eyebrow__dot"></span>Rijschool in ${site.contact.region}</p>
      <h1 id="hero-title" class="hero__title">Met vertrouwen <span class="hero__accent">de weg op.</span></h1>
      <p class="hero__lead">Persoonlijke rijlessen, duidelijke uitleg en begeleiding op jouw tempo. Zet vandaag de eerste stap naar jouw rijbewijs.</p>
      <div class="hero__actions">
        ${btn({ href: '/proefles/', label: 'Plan een proefles' })}
        ${btn({ href: '/tarieven/', label: 'Bekijk de tarieven', variant: 'outline-light', iconName: '' })}
      </div>
      <ul class="hero__facts" aria-label="In het kort">
        <li>${icon('check', 18)}Eigenaar ${site.owner.firstName} is zelf rijinstructeur</li>
        <li>${icon('check', 18)}Vaste pakketprijzen vanaf ${formatPrice(Math.min(...packages.map((p) => p.price)))}</li>
        <li>${icon('check', 18)}Ophalen en afzetten aan huis*</li>
      </ul>
      <p class="hero__note">* bij de pakketten Beginners en Ervaren</p>
    </div>
    <div class="hero__visual">
      <div class="hero__frame">${visual}</div>
      <div class="hero__chip hero__chip--a">${icon('pin', 18)}<span><strong>${serviceArea.length} plaatsen</strong> rond Enschede</span></div>
      <div class="hero__chip hero__chip--b">${icon('clock', 18)}<span><strong>60 minuten</strong> per les*</span></div>
    </div>
  </div>
</section>`;
};

export const sectionHead = ({ eyebrow, title, intro, id, align = '' }) => `
<div class="section-head ${align}">
  ${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}
  <h2 ${id ? `id="${id}"` : ''} class="section-title">${title}</h2>
  ${intro ? `<p class="section-intro">${intro}</p>` : ''}
</div>`;

export const intro = () => `
<section class="section intro" aria-labelledby="intro-title">
  <div class="container intro__grid reveal">
    <p class="eyebrow">Rijschool Linkerbaan</p>
    <div>
      <h2 id="intro-title" class="intro__statement">Leren rijden doe je niet in een keurslijf. Je doet het <mark>in jouw tempo</mark>, met iemand naast je die rustig uitlegt en eerlijk zegt waar je staat.</h2>
      <p class="intro__text">Bij Rijschool Linkerbaan krijg je les van ${site.owner.name}, eigenaar en rijinstructeur. Elke les sluit aan op wat jij al kunt, zodat je stap voor stap zelfverzekerder en zelfstandiger wordt in het verkeer.</p>
    </div>
  </div>
</section>`;

export const reasonsSection = () => `
<section class="section section--tint" aria-labelledby="reasons-title">
  <div class="container">
    ${sectionHead({ eyebrow: 'Waarom Linkerbaan', title: 'Wat je van je lessen mag verwachten', id: 'reasons-title' })}
    <ul class="reasons">
      ${reasons
        .map(
          (r, i) => `
      <li class="reason reveal" style="--d:${i * 70}ms">
        <span class="reason__icon">${icon(r.icon, 26)}</span>
        <h3>${r.title}</h3>
        <p>${r.text}</p>
      </li>`
        )
        .join('')}
    </ul>
  </div>
</section>`;

const ownerPortrait = () => {
  const o = site.owner;
  if (o.photo)
    return `<img class="owner__photo" src="${o.photo}" alt="${o.name}, ${o.role.toLowerCase()} bij ${site.name}" width="720" height="880" loading="lazy">`;
  return `
  <div class="owner__placeholder" role="img" aria-label="Naamkaart van ${o.name}, ${o.role.toLowerCase()}">
    <span class="owner__monogram" aria-hidden="true">${o.firstName[0]}</span>
    <span class="owner__lanes" aria-hidden="true"></span>
  </div>`;
};

export const ownerSection = ({ full = false } = {}) => `
<section class="section owner" aria-labelledby="owner-title">
  <div class="container owner__grid">
    <figure class="owner__media reveal">
      ${ownerPortrait()}
      <figcaption><strong>${site.owner.name}</strong><span>${site.owner.role}</span></figcaption>
    </figure>
    <div class="owner__copy reveal">
      <p class="eyebrow">De persoonlijke aanpak van ${site.owner.firstName}</p>
      <h2 id="owner-title" class="section-title">Je instructeur kent jou, niet alleen je lesnummer.</h2>
      <p>Bij Rijschool Linkerbaan staat de leerling centraal. ${site.owner.firstName} kijkt bij elke les naar wat jij nodig hebt: extra oefenen op rotondes, rustig wennen aan de snelweg of juist doorpakken als het goed gaat.</p>
      <ul class="owner__points">
        <li>${icon('route', 22)}<span><strong>Een lesplan dat bij je past.</strong> Je begint op jouw niveau en bouwt van daaruit op.</span></li>
        <li>${icon('chat', 22)}<span><strong>Duidelijke terugkoppeling.</strong> Na elke les weet je wat goed ging en waar je de volgende keer aan werkt.</span></li>
        <li>${icon('shield', 22)}<span><strong>Veilig en zelfstandig.</strong> Het doel is niet alleen het examen, maar dat je daarna met een gerust gevoel alleen de weg op gaat.</span></li>
      </ul>
      ${
        full
          ? ''
          : `<div class="owner__actions">${btn({ href: '/over-rijschool-linkerbaan/', label: `Meer over ${site.owner.firstName}`, variant: 'secondary' })}</div>`
      }
    </div>
  </div>
</section>`;

const priceCard = (p, { headingLevel = 3 } = {}) => {
  const h = `h${headingLevel}`;
  const meta = p.lessonMinutes ? `${p.lessons} lessen · ${p.lessonMinutes} min` : `${p.lessons} ${p.lessonLabel ?? 'lessen'}`;
  return `
<article class="price-card${p.highlight ? ' price-card--highlight' : ''} reveal" aria-labelledby="pkg-${p.id}">
  ${p.badge ? `<p class="price-card__badge">${p.badge}</p>` : ''}
  <header class="price-card__head">
    <p class="price-card__num">Pakket ${p.number}</p>
    <${h} id="pkg-${p.id}" class="price-card__name">${p.name}</${h}>
    <p class="price-card__meta">${meta}${p.duration ? ` · ${p.duration}` : ''}</p>
  </header>
  <p class="price-card__price"><span class="visually-hidden">Prijs: </span>${formatPrice(p.price)}<small>totaal</small></p>
  <p class="price-card__audience">${p.audience}</p>
  <ul class="price-card__features">
    ${p.features.map((f) => `<li>${icon('check', 18)}<span>${f}</span></li>`).join('')}
  </ul>
  <a class="btn ${p.highlight ? 'btn--primary' : 'btn--secondary'} btn--block" href="/proefles/?pakket=${p.id}"><span>Start met ${p.name}</span>${icon('arrow', 20)}</a>
</article>`;
};

export const pricingCards = (opts) => `<div class="pricing">${packages.map((p) => priceCard(p, opts)).join('')}</div>`;

export const pricesNote = () =>
  `<p class="fine-print">${icon('info', 18)}<span>Totaalprijzen per pakket. Tarieven en voorwaarden kunnen wijzigen; je hoort vooraf altijd de actuele prijs en wat er precies is inbegrepen.</span></p>`;

export const pricingSection = () => `
<section class="section section--tint" id="tarieven" aria-labelledby="pricing-title">
  <div class="container">
    ${sectionHead({
      eyebrow: 'Lespakketten',
      title: 'Drie pakketten, vaste prijzen',
      intro: 'Kies het pakket dat past bij je ervaring en je tempo. Weet je het nog niet? Na de proefles kijken we samen wat logisch is.',
      id: 'pricing-title',
    })}
    ${pricingCards()}
    ${pricesNote()}
    <div class="center-actions">${btn({ href: '/tarieven/', label: 'Vergelijk de pakketten', variant: 'secondary' })}</div>
  </div>
</section>`;

// Vergelijking: compacte tabel die ook op 320px past (korte waarden, geen horizontaal scrollen).
export const comparison = () => {
  const yes = `${icon('check', 20)}<span class="visually-hidden">Ja</span>`;
  const nm = `<span aria-hidden="true">–</span><span class="visually-hidden">Niet vermeld</span>`;
  const has = (p, needle) => p.features.some((f) => f.toLowerCase().includes(needle));
  const rows = [
    ['Aantal lessen', (p) => String(p.lessons)],
    ['Lesduur', (p) => (p.lessonMinutes ? `${p.lessonMinutes} min` : 'Op aanvraag')],
    ['Gratis proefles', (p) => (has(p, 'proefles') ? yes : nm)],
    ['Persoonlijk lesplan', (p) => (has(p, 'lesplan') ? yes : nm)],
    ['Ophalen aan huis', (p) => (has(p, 'ophalen') ? yes : nm)],
    ['Examen&shy;begeleiding', (p) => (has(p, 'examenbegeleiding') ? yes : nm)],
    ['Praktijk&shy;examen', (p) => (has(p, 'praktijkexamen') ? yes : nm)],
    ['Doorlooptijd', (p) => p.duration ?? 'In overleg'],
    ['Totaalprijs', (p) => `<strong>${formatPrice(p.price)}</strong>`],
  ];
  return `
<div class="compare reveal">
  <table>
    <caption class="visually-hidden">Vergelijking van de drie lespakketten</caption>
    <thead><tr><td></td>${packages.map((p) => `<th scope="col"><span class="compare__num">${p.number}</span>${p.name}</th>`).join('')}</tr></thead>
    <tbody>
      ${rows
        .map(([label, fn]) => `<tr><th scope="row">${label}</th>${packages.map((p) => `<td>${fn(p)}</td>`).join('')}</tr>`)
        .join('')}
    </tbody>
  </table>
  <p class="compare__legend"><span aria-hidden="true">–</span> = niet genoemd in de pakketomschrijving. Vraag gerust of het mogelijk is.</p>
</div>`;
};

export const stepsSection = () => `
<section class="section steps-section" aria-labelledby="steps-title">
  <div class="container">
    ${sectionHead({
      eyebrow: 'Zo werkt het',
      title: 'Van eerste les naar je eigen rijbewijs',
      intro: 'Geen verrassingen onderweg. Dit is de route die je samen met Furkan aflegt.',
      id: 'steps-title',
    })}
    <ol class="steps">
      ${steps
        .map(
          (s, i) => `
      <li class="step reveal" style="--d:${i * 80}ms">
        <span class="step__num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
        <div><h3>${s.title}</h3><p>${s.text}</p></div>
      </li>`
        )
        .join('')}
    </ol>
    <div class="center-actions">${btn({ href: '/proefles/', label: 'Vraag je proefles aan' })}</div>
  </div>
</section>`;

export const areaSection = () => `
<section class="section area" id="werkgebied" aria-labelledby="area-title">
  <div class="container area__grid">
    <div class="reveal">
      ${sectionHead({
        eyebrow: 'Werkgebied',
        title: 'Rijlessen in Enschede en omgeving',
        intro: 'Furkan geeft les in Twente, in en rond deze plaatsen. Woon je net daarbuiten? Vraag gerust of lessen bij jou mogelijk zijn.',
        id: 'area-title',
      })}
      ${btn({ href: waHref('Hoi Furkan, geven jullie ook les in mijn woonplaats? Ik woon in: '), label: 'Vraag het via WhatsApp', variant: 'secondary', iconName: 'whatsapp', iconFirst: true, attrs: 'target="_blank" rel="noopener"' })}
    </div>
    <ul class="area__list reveal" aria-label="Plaatsen in het werkgebied">
      ${serviceArea.map((c) => `<li>${icon('pin', 18)}${c}</li>`).join('')}
    </ul>
  </div>
</section>`;

export const faqSection = ({ items = faq, title = 'Veelgestelde vragen', id = 'veelgestelde-vragen' } = {}) => `
<section class="section section--tint" id="${id}" aria-labelledby="${id}-title">
  <div class="container faq__grid">
    <div class="faq__aside">
      ${sectionHead({ eyebrow: 'FAQ', title, id: `${id}-title` })}
      <p class="faq__more">Staat je vraag er niet tussen? <a href="/contact/">Neem contact op</a> of <a href="${waHref()}" target="_blank" rel="noopener">stuur een WhatsApp</a>.</p>
    </div>
    <div class="faq">
      ${items
        .map(
          (f) => `
      <details class="faq__item">
        <summary><span>${f.q}</span><span class="faq__toggle" aria-hidden="true"></span></summary>
        <div class="faq__answer"><p>${f.a}</p></div>
      </details>`
        )
        .join('')}
    </div>
  </div>
</section>`;

export const faqSchema = (items = faq) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
});

export const contactOptions = () => `
<ul class="contact-options">
  <li><a href="${telHref()}"><span class="contact-options__icon">${icon('phone', 22)}</span><span><strong>Bellen</strong>${site.contact.phoneDisplay}</span></a></li>
  <li><a href="${waHref()}" target="_blank" rel="noopener"><span class="contact-options__icon">${icon('whatsapp', 22)}</span><span><strong>WhatsApp</strong>Stel je vraag via een bericht</span></a></li>
  <li><a href="${mailHref('Vraag over rijlessen')}"><span class="contact-options__icon">${icon('mail', 22)}</span><span><strong>E-mail</strong>${site.contact.email}</span></a></li>
</ul>`;

const field = ({ id, label, type = 'text', required = false, autocomplete = '', hint = '', attrs = '' }) => `
<div class="field">
  <label for="${id}">${label}${required ? ' <span class="field__req" aria-hidden="true">*</span>' : ' <span class="field__opt">(optioneel)</span>'}</label>
  ${hint ? `<p class="field__hint" id="${id}-hint">${hint}</p>` : ''}
  <input id="${id}" name="${id}" type="${type}"${required ? ' required aria-required="true"' : ''}${autocomplete ? ` autocomplete="${autocomplete}"` : ''} aria-describedby="${hint ? `${id}-hint ` : ''}${id}-error" ${attrs}>
  <p class="field__error" id="${id}-error" data-error-for="${id}"></p>
</div>`;

export const trialForm = ({ headingId = 'form-title', compact = false } = {}) => `
<div class="form-card${compact ? ' form-card--compact' : ''}" data-form-card>
  <form class="trial-form" novalidate data-trial-form data-endpoint="${esc(site.form.endpoint)}" data-whatsapp="${site.contact.whatsapp}" data-email="${site.contact.email}" aria-labelledby="${headingId}">
    <div class="form-errors" role="alert" tabindex="-1" hidden data-error-summary></div>
    <div class="field-row">
      ${field({ id: 'naam', label: 'Je naam', required: true, autocomplete: 'name' })}
      ${field({ id: 'telefoon', label: 'Telefoonnummer', type: 'tel', required: true, autocomplete: 'tel', attrs: 'inputmode="tel"' })}
    </div>
    ${field({ id: 'email', label: 'E-mailadres', type: 'email', autocomplete: 'email', attrs: 'inputmode="email"' })}
    <fieldset class="field choice">
      <legend>Hoe wil je benaderd worden?</legend>
      <div class="choice__options">
        <label><input type="radio" name="contactvoorkeur" value="Bellen" checked><span>${icon('phone', 18)}Bellen</span></label>
        <label><input type="radio" name="contactvoorkeur" value="WhatsApp"><span>${icon('whatsapp', 18)}WhatsApp</span></label>
        <label><input type="radio" name="contactvoorkeur" value="E-mail"><span>${icon('mail', 18)}E-mail</span></label>
      </div>
    </fieldset>
    <div class="field-row">
      <div class="field">
        <label for="pakket">Interesse in <span class="field__opt">(optioneel)</span></label>
        <select id="pakket" name="pakket">
          <option value="">Weet ik nog niet</option>
          ${packages.map((p) => `<option value="${p.id}">Pakket ${p.number}: ${p.name}</option>`).join('')}
        </select>
      </div>
      <div class="field">
        <label for="woonplaats">Woonplaats <span class="field__opt">(optioneel)</span></label>
        <select id="woonplaats" name="woonplaats" autocomplete="address-level2">
          <option value="">Kies je woonplaats</option>
          ${serviceArea.map((c) => `<option>${c}</option>`).join('')}
          <option value="Anders">Andere plaats</option>
        </select>
      </div>
    </div>
    ${
      compact
        ? ''
        : `<div class="field">
      <label for="bericht">Wil je nog iets kwijt? <span class="field__opt">(optioneel)</span></label>
      <textarea id="bericht" name="bericht" rows="3" placeholder="Bijvoorbeeld: ik heb al eens gereden, of ik kan alleen in de avond."></textarea>
    </div>`
    }
    <div class="hp" aria-hidden="true"><label for="website">Laat dit veld leeg</label><input id="website" name="website" tabindex="-1" autocomplete="off"></div>
    <button class="btn btn--primary btn--block btn--lg" type="submit" data-submit><span>Vraag je proefles aan</span>${icon('arrow', 20)}</button>
    <p class="form-privacy">${icon('shield', 16)}<span>We gebruiken je gegevens alleen om contact met je op te nemen over je proefles. Lees de <a href="/privacy/">privacyverklaring</a>.</span></p>
  </form>
  <div class="form-result" hidden tabindex="-1" data-form-result></div>
</div>`;

export const trialSection = ({ title = 'Plan je proefles', intro } = {}) => `
<section class="section trial" id="proefles" aria-labelledby="trial-title">
  <div class="container trial__grid">
    <div class="trial__copy reveal">
      <p class="eyebrow eyebrow--light">Proefles aanvragen</p>
      <h2 id="trial-title" class="section-title">${title}</h2>
      <p>${intro ?? 'Laat je gegevens achter en Furkan neemt contact met je op om een moment te plannen. Een aanvraag is nog geen inschrijving: je spreekt eerst samen een moment af.'}</p>
      <ul class="trial__list">
        <li>${icon('check', 18)}Binnen een minuut ingevuld</li>
        <li>${icon('check', 18)}Persoonlijk contact over een geschikt moment</li>
        <li>${icon('check', 18)}Liever direct contact? Bel of app gerust</li>
      </ul>
      <div class="trial__direct">
        <a href="${telHref()}">${icon('phone', 20)}${site.contact.phoneDisplay}</a>
        <a href="${waHref()}" target="_blank" rel="noopener">${icon('whatsapp', 20)}WhatsApp</a>
      </div>
    </div>
    <div class="reveal">${trialForm({ headingId: 'trial-title' })}</div>
  </div>
</section>`;

export const pageHero = ({ eyebrow, title, intro, crumbs = [] }) => `
<section class="page-hero">
  <div class="container">
    ${
      crumbs.length
        ? `<nav class="crumbs" aria-label="Kruimelpad"><ol><li><a href="/">Home</a></li>${crumbs
            .map((c, i) => `<li>${i === crumbs.length - 1 ? `<span aria-current="page">${c.name}</span>` : `<a href="${c.path}">${c.name}</a>`}</li>`)
            .join('')}</ol></nav>`
        : ''
    }
    ${eyebrow ? `<p class="eyebrow eyebrow--light">${eyebrow}</p>` : ''}
    <h1 class="page-hero__title">${title}</h1>
    ${intro ? `<p class="page-hero__intro">${intro}</p>` : ''}
  </div>
  <div class="page-hero__lane" aria-hidden="true"></div>
</section>`;

export const doubtBand = () => `
<section class="doubt reveal" aria-labelledby="doubt-title">
  <div class="container doubt__inner">
    <div>
      <h2 id="doubt-title">Twijfel je welk pakket bij je past?</h2>
      <p>We helpen je graag om een goede start te maken. Na een proefles weet je precies waar je staat.</p>
    </div>
    <div class="doubt__actions">
      ${btn({ href: '/contact/', label: 'Bespreek jouw mogelijkheden' })}
      ${btn({ href: waHref('Hoi Furkan, ik twijfel welk lespakket bij mij past. Kun je me helpen?'), label: 'WhatsApp', variant: 'outline-light', iconName: 'whatsapp', iconFirst: true, attrs: 'target="_blank" rel="noopener"' })}
    </div>
  </div>
</section>`;
