# 1. Audit van de huidige website (nexdmedia.com)

Uitgevoerd: oktober 2026.

## Hoe deze audit tot stand kwam (en wat de beperking is)

`nexdmedia.com` en `www.nexdmedia.com` waren vanuit de ontwikkelomgeving **niet bereikbaar** (DNS-fout bij elke poging; het webarchief was niet toegankelijk). Er was ook geen toegang tot de bestaande codebase, het CMS, analytics of de formulierkoppeling.

De audit is daarom gebaseerd op:

- zoekmachine-indexen van de huidige pagina's: titels, fragmenten en de URL-structuur;
- het KvK-register (via companyinfo.nl en transfirm.nl);
- de LinkedIn- en X-profielen van NEXD Media;
- de website van klant Advocatenkantoor Dresschers.

Dat betekent: **logo, exacte kleuren, typografie, beeldmateriaal, animaties, de mobiele ervaring en de technische performance van de huidige site zijn niet zelf geïnspecteerd.** Deze punten staan in [03-oplevering.md](03-oplevering.md) als open punten.

## Gevonden pagina's en URL-structuur

De site lijkt te zijn gemigreerd van WordPress (`www.nexdmedia.com/slug/`) naar losse `.html`-pagina's op `nexdmedia.com`. Beide varianten staan nog in de zoekindex.

| Huidige URL (geïndexeerd) | Oude URL (ook geïndexeerd) | Nieuwe site |
|---|---|---|
| `/` | `/` | `/` |
| `/website-laten-maken.html` | `/website-laten-maken/` | behouden + 301 |
| `/standaard-website.html` | `/website-laten-maken/standaard-website/` | behouden + 301 |
| `/maatwerk-website.html` | `/website-laten-maken/maatwerk-website/` | behouden + 301 |
| `/wordpress-webdesign.html` | `/wordpress-webdesign/` | behouden + 301 |
| `/website-laten-optimaliseren/` | – | behouden |
| `/blogs-laten-schrijven/` | – | behouden |
| `/fotografie-voor-websites.html` | – | behouden |
| `/seo-uitbesteden/` | `/seo-uitbesteden/` | behouden |
| `/over-ons/` | `/over-ons/` | behouden |
| – | `/contact/` | behouden |
| `/blogs.html` (± 8 pagina's artikelen) | `/blog/`, losse artikelen, `/knowledge-base/…` | **niet meegenomen**, zie open punten |

`/zoektermenonderzoek/` en `/doelgroepanalyse` worden in het menu genoemd, maar zijn in de nieuwe site onderdeel van de pagina's over SEO en maatwerk.

## Positionering

- **De homepage** richt zich nadrukkelijk op *legal & finance*: "conversiegerichte websites voor advocaten, accountants en zakelijke dienstverleners".
- **De dienstenpagina's** spreken breder: "ondernemers", "bedrijven".
- **Keuze voor de nieuwe site:** legal & finance blijft de specialisatie (hero, sectoren, cases, voorbeelden in de copy), met "zakelijke dienstverleners" als bredere doelgroep. De bedrijfsstrategie is dus niet veranderd, alleen consistent gemaakt.

## Diensten

Website laten maken (standaard, maatwerk), website optimaliseren, WordPress webdesign, blogs laten schrijven, zoektermenonderzoek, SEO uitbesteden, doelgroepanalyse en fotografie voor websites. CMS: WordPress, desgewenst met Elementor.

## Inconsistenties: cijfers, prijzen en claims

Dit is het belangrijkste resultaat van de audit. De huidige site spreekt zichzelf op meerdere punten tegen:

| Onderwerp | Gevonden waarden | Keuze in de nieuwe site |
|---|---|---|
| Standaard website | € 795 · € 1.495 · **€ 1.795** | € 1.795 (dienstpagina én homepage-index) – **bevestigen** |
| Maatwerk website | € 3.475 · € 3.795 · € 3.997 · **€ 4.495** | € 4.495 (huidige paginatitel) – **bevestigen** |
| Premium pakket | € 7.795 (één bron, incl. 12 mnd CRO) | niet getoond – **bevestigen of het nog bestaat** |
| Optimalisatie | € 1.395 startpakket | € 1.395 |
| Doorlooptijd standaard | 1–2 weken · 20 dagen · 4 weken | "in de regel binnen 4 weken, zodra content en huisstijl compleet zijn" |
| Doorlooptijd maatwerk | 4–6 weken | 4–6 weken |
| Ervaring | "26 jaar ervaring", "1500+ websites" | **niet getoond**: KvK-oprichting is 27-01-2023; LinkedIn noemt 2022, andere bronnen 2021 |
| Klanten | "200+ klanten geholpen" | **niet getoond** (niet te onderbouwen) |
| Resultaat | "gemiddeld +73% conversie binnen 90 dagen" | **niet getoond** (geen onderbouwing) |
| Case Dresschers | "+164% intakeaanvragen in 3 maanden" vs. testimonial "+38% in week 2; 61 i.p.v. 37 betaalde adviesgesprekken in Q2 2023" (= +65%) | alleen de testimonial-cijfers, met bronvermelding |
| "124 aanvragen i.p.v. 32" | toegeschreven aan Countus (Rick-Jan Lennep, juli 2024) én op een andere pagina aan Dresschers | Countus (de "Starterspakketten-module" past bij een accountant) – **bevestigen** |
| Consultancy Bureau Delta | testimonial over "qualified deals" zonder concrete gegevens | niet getoond |

Een onbevestigde of tegenstrijdige claim op een site die "conversie" verkoopt, is een vertrouwensrisico. De nieuwe site toont daarom alleen wat te herleiden is. De statische test (`tests/check-static.mjs`) blokkeert bovendien dat de genoemde claims per ongeluk terugkomen.

## Bedrijfsgegevens

- NEXD Media B.V., KvK 89065506, Oldenzaal.
- Postadres volgens de site: Postbus 146, 7577 AR Oldenzaal. Het KvK-vestigingsadres is bewust **niet** gepubliceerd, omdat het mogelijk een woonadres is.
- Contact: info@nexdmedia.com, 06 11 90 72 55.
- Social: LinkedIn (`company/nexdmediabv`), X (`@NexdMedia`).

## Team (volgens de huidige homepage)

- Maikel Latour: oprichter, strategie & fotografie.
- Bas: full-stack developer, 14+ jaar ervaring in B2B-webarchitectuur.
- Ron: contentspecialist.
- Sara: conversiespecialist.

Er zijn geen portretten beschikbaar gekomen.

## Conversie-observaties (uit de content)

- **Sterk:** er is een duidelijke specialisatie, er zijn concrete klantcases met namen, en de prijzen staan op de site.
- **Zwak:**
  - De prijzen en claims zijn tegenstrijdig.
  - De homepage noemt drie verschillende pakketprijzen voor hetzelfde product.
  - Er is geen keuzehulp tussen standaard, maatwerk en optimaliseren.
  - De positionering verschilt per pagina.
