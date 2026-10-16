# 03 · Oplevering, tests en open punten

## Status in één oogopslag

- ✅ **Gebouwd:** een complete, werkende statische website in `public/`, te genereren met `npm run build`.
- ❌ **Niet gepubliceerd.** De nieuwe site staat nog niet live; op `rijschoollinkerbaan.nl` staat nog de huidige site. Er is wel een privé-voorbeeld als Claude-artifact.
- ⚠️ **Formulier:** werkt volledig, maar is nog niet aan een backend gekoppeld (zie hieronder).
- ⚠️ **Inhoud:** alle prijzen en voorwaarden komen uit de opdrachtbeschrijving van de oude site en moeten nog bevestigd worden.

## Pagina's

| URL | Inhoud |
|---|---|
| `/` | Hero met foto van de lesauto, introductie, Plezier/Vertrouwen/Duidelijkheid, aanpak van Furkan, pakketten, stappenplan, Instagram-galerij, werkgebied, FAQ (9 vragen), proeflesformulier |
| `/tarieven/` | Drie tariefkaarten, vergelijkingstabel, "Twijfel je?"-band, uitleg over de proefles, pakket-FAQ |
| `/proefles/` | Gefocuste aanvraagpagina (zonder sticky balk) met een stappenplan in drie stappen |
| `/over-rijschool-linkerbaan/` | Kennismaking met Furkan, de betekenis van de naam, aanpak, "zo ziet een les eruit", formulier |
| `/contact/` | Formulier als hoofdactie, plus bellen, WhatsApp, e-mail en werkgebied |
| `/privacy/` | Privacyverklaring voor de formuliergegevens |
| `/404.html` | Foutpagina met de weg terug |

De URL's van de oude site (`/tarieven/`, `/over-rijschool-linkerbaan/`, `/contact/`) zijn behouden, zodat bestaande links en zoekresultaten blijven werken.

## Proeflesformulier: hoe het werkt

Velden: naam\* en telefoon\* (verplicht), e-mail, contactvoorkeur, pakketinteresse en woonplaats (optioneel), en op de meeste pagina's een vrij bericht. Er wordt niets gevoeligs gevraagd.

1. **Validatie** gebeurt in de browser, met een foutsamenvatting (krijgt de focus) en een foutmelding per veld (`aria-invalid` en `aria-describedby`).
2. **Zonder endpoint** (de huidige situatie): de site doet **niet** alsof er iets verstuurd is. De bezoeker krijgt "Nog één stap" te zien, met knoppen om de ingevulde aanvraag via **WhatsApp** of **e-mail** te versturen (het bericht staat al klaar). Dit werkt direct, zonder server.
3. **Met endpoint** (`form.endpoint` in `src/data/site.mjs`): de gegevens worden als JSON gePOST. Een bevestiging verschijnt **alleen bij HTTP 2xx**. Bij een fout ziet de bezoeker een eerlijke melding met WhatsApp en e-mail als alternatief.
4. Een honeypot-veld houdt simpele spambots tegen.

**Koppelen:** vul een endpoint in die JSON accepteert, bijvoorbeeld Formspree, Basin, Web3Forms, een PHP-script op de eigen hosting, of de API van het bestaande aanmeldsysteem. Draai daarna `npm run build`. Het bestaande aanmeldsysteem kon ik niet inzien, dus de koppeling daarmee is nog niet gemaakt.

## Uitgevoerde tests (16-10-2026)

Allemaal lokaal uitgevoerd met `npm test` (Chromium 1194 + axe-core 4.14).

**Statische controle** (`tests/check-static.mjs`) ✅
- Alle interne links en ankers bestaan; er zijn geen dubbele id's.
- Elke pagina heeft een unieke title en description, precies één `h1` en `lang="nl"`.
- Alle JSON-LD is geldig; sitemap, robots, OG-afbeelding en favicons zijn aanwezig.

**Browsertests** (`tests/e2e.mjs`): 43 controles ✅
- Geen horizontale overflow, consolefouten of kapotte requests op 7 pagina's × 5 breedtes (320, 375, 768, 1024, 1440 px).
- **axe-core WCAG 2.1 A/AA + best practices:** 0 overtredingen op alle 7 pagina's, op desktop én mobiel.
- Hoofdmenu (4 links, `aria-current`), skip-link en FAQ werken met het toetsenbord.
- Tel-, mailto- en WhatsApp-links zijn correct opgebouwd (nieuw tabblad met `noopener`).
- Alle afbeeldingen laden, ook de lazy geladen foto's.
- De CTA op een tariefkaart neemt het gekozen pakket mee naar het formulier.
- Prijzen zijn identiek op home, tarieven en in de vergelijkingstabel.
- Mobiel menu: openen, focus erin, Esc sluit, focus terug, links navigeren.
- De sticky CTA verdwijnt bij de hero-knoppen, het formulier en de footer.
- Touch targets zijn ≥ 44 px.
- Formulier: leeg versturen, ongeldige telefoon/e-mail, doorsturen zonder endpoint, gegevens aanpassen, honeypot, endpoint 200 (JSON-body gecontroleerd) en endpoint 500 (geen nepbevestiging), werking zonder JavaScript.

**Lighthouse 12.8** (mobiel profiel, lokale server zonder compressie):

| Pagina | Performance | Accessibility | Best Practices | SEO | LCP | CLS | Gewicht |
|---|---|---|---|---|---|---|---|
| `/` | 96 | 100 | 100 | 100 | 2,7 s | 0 | 285 KiB |
| `/tarieven/` | 99 | 100 | 100 | 100 | 2,0 s | 0 | 193 KiB |
| `/proefles/` | 99 | 100 | 100 | 100 | 2,0 s | 0 | 176 KiB |

Dit zijn labmetingen. Echte Core Web Vitals (veldgegevens) zijn pas na livegang te meten, bijvoorbeeld via Search Console.

**Visueel gecontroleerd** met screenshots op 1440 px en 390 px van alle hoofdpagina's.

### Niet uitgevoerd
- Testen in echte Safari/iOS en Firefox (alleen Chromium is getest; de CSS gebruikt breed ondersteunde features met fallbacks).
- Testen op echte toestellen.
- Echte verzending naar een backend (er is nog geen backend).
- Een test of het WhatsApp-nummer echt aan WhatsApp gekoppeld is.
- Een vergelijking met het oude ontwerp (dat was niet bereikbaar).

## Te bevestigen vóór livegang

Deze lijst staat ook in `src/data/site.mjs` (`VERIFY_BEFORE_LAUNCH`).

1. Prijzen, pakketnamen en inhoud van alle drie de pakketten.
2. De lesduur binnen het Spoed-pakket (nu "op aanvraag").
3. Welk examen precies bij Spoed is inbegrepen, en de voorwaarden (bijvoorbeeld bij een herexamen).
4. Of ophalen en afzetten aan huis ook voor Spoed geldt.
5. Of de proefles bij Ervaren en Spoed ook gratis is.
6. Of de prijzen inclusief btw zijn.
7. **Het WhatsApp-nummer** (nu het vaste nummer 085 060 8137).
8. Of het werkgebied nog alle acht plaatsen omvat.
9. De "Voor wie"-omschrijving per pakket (afgeleid van de pakketnamen).
10. **Conceptteksten over de lesaanpak** (homepage "Wat je van je lessen mag verwachten", "De persoonlijke aanpak", over-ons "Zo ziet een les eruit" en "Waarom de linkerbaan?"). Deze teksten volgen de merkpositionering uit de opdracht, maar Furkan moet ze herkennen als zijn werkwijze.
11. KvK-nummer en vestigingsgegevens, voor de footer en de privacyverklaring.

## Gebruikt materiaal van de huidige site en Instagram
- **Huisstijl:** kleuren, woordmerk, Poppins en het getekende logo van Furkan.
- **Teksten:** "Rij met plezier", de kernwaarden Plezier, Vertrouwen en Duidelijkheid, "je krijgt les van Furkan, die begrijpt hoe jij leert", de footertekst, en de Instagram-bio "Snel geslaagd, strak gedaan?".
- **Socials:** Instagram en TikTok, in de footer, de galerij en de gestructureerde data.
- **Foto's van Instagram:** de lesauto (hero), het zicht vanuit de lesauto (over ons) en zes foto's van leerlingen bij de lesauto (galerij). Tegels met tekst in beeld ("GEZAKT", "OOK €100 VERDIENEN?") zijn niet gebruikt.
- **Niet gebruikt:** de foto's van een man in een geruite jas. Waarschijnlijk is dat Furkan, maar dat is niet bevestigd. Is hij het, dan is een van die foto's een goede portretfoto.

## Ontbrekend materiaal
- **Originele bestanden** van het logo en de foto's. Het logo en de foto's zijn nu uit schermafbeeldingen geknipt (foto's: 630 px breed). Originelen geven een scherper beeld.
- **Toestemming** van de leerlingen op de foto's om ze ook op de website te tonen.
- **Echte reviews**, met toestemming om te publiceren.

## Publiceren
1. Bevestig de gegevens hierboven en pas `src/data/site.mjs` aan.
2. Koppel het formulier (`form.endpoint`).
3. Draai `npm run build` en upload de inhoud van `public/` naar de hosting. Elke statische host werkt (Apache/shared hosting, Netlify, Vercel, Cloudflare Pages). Voor Apache staat er een `.htaccess` met de 404-pagina en caching.
4. Meld `https://www.rijschoollinkerbaan.nl/sitemap.xml` aan in Google Search Console en vul het Google Bedrijfsprofiel aan.
