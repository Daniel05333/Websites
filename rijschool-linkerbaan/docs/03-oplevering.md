# 03 · Oplevering, tests en open punten

## Status in één oogopslag

- ✅ **Gebouwd:** een complete, werkende statische website in `public/`, te genereren met `npm run build`.
- ❌ **Niet gepubliceerd.** De site staat nergens live. `rijschoollinkerbaan.nl` resolvet momenteel niet (zie audit).
- ⚠️ **Formulier:** werkt volledig, maar is nog niet aan een backend gekoppeld (zie hieronder).
- ⚠️ **Inhoud:** alle prijzen en voorwaarden komen uit de opdrachtbeschrijving van de oude site en moeten nog bevestigd worden.

## Pagina's

| URL | Inhoud |
|---|---|
| `/` | Hero, introductie, waarom Linkerbaan, aanpak van Furkan, pakketten, stappenplan, werkgebied, FAQ (9 vragen), proeflesformulier |
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

**Browsertests** (`tests/e2e.mjs`): 42 controles ✅
- Geen horizontale overflow, consolefouten of kapotte requests op 7 pagina's × 5 breedtes (320, 375, 768, 1024, 1440 px).
- **axe-core WCAG 2.1 A/AA + best practices:** 0 overtredingen op alle 7 pagina's, op desktop én mobiel.
- Hoofdmenu (4 links, `aria-current`), skip-link en FAQ werken met het toetsenbord.
- Tel-, mailto- en WhatsApp-links zijn correct opgebouwd (nieuw tabblad met `noopener`).
- De CTA op een tariefkaart neemt het gekozen pakket mee naar het formulier.
- Prijzen zijn identiek op home, tarieven en in de vergelijkingstabel.
- Mobiel menu: openen, focus erin, Esc sluit, focus terug, links navigeren.
- De sticky CTA verdwijnt bij de hero-knoppen, het formulier en de footer.
- Touch targets zijn ≥ 44 px.
- Formulier: leeg versturen, ongeldige telefoon/e-mail, doorsturen zonder endpoint, gegevens aanpassen, honeypot, endpoint 200 (JSON-body gecontroleerd) en endpoint 500 (geen nepbevestiging), werking zonder JavaScript.

**Lighthouse 12.8** (mobiel profiel, lokale server zonder compressie):

| Pagina | Performance | Accessibility | Best Practices | SEO | LCP | CLS | Gewicht |
|---|---|---|---|---|---|---|---|
| `/` | 99 | 100 | 100 | 100 | 2,0 s | 0 | 190 KiB |
| `/tarieven/` | 100 | 100 | 100 | 100 | 1,8 s | 0 | 168 KiB |
| `/proefles/` | 100 | 100 | 100 | 100 | 1,8 s | 0 | 159 KiB |

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

## Ontbrekend materiaal
- Het **logo** (er staat nu een tijdelijk merkteken).
- **Foto's** van Furkan, de lesauto en echte lessituaties (de vakken staan klaar in `site.photos` en `site.owner.photo`).
- **Echte reviews**, met toestemming om te publiceren. Er zijn bewust geen reviews of slagingspercentages verzonnen.

## Publiceren
1. Zorg dat de DNS van `rijschoollinkerbaan.nl` weer werkt.
2. Bevestig de gegevens hierboven en pas `src/data/site.mjs` aan.
3. Koppel het formulier (`form.endpoint`).
4. Draai `npm run build` en upload de inhoud van `public/` naar de hosting. Elke statische host werkt (Apache/shared hosting, Netlify, Vercel, Cloudflare Pages). Voor Apache staat er een `.htaccess` met de 404-pagina en caching.
5. Meld `https://www.rijschoollinkerbaan.nl/sitemap.xml` aan in Google Search Console en vul het Google Bedrijfsprofiel aan.
