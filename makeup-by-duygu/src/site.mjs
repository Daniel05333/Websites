// Makeup by Duygu: alle inhoud en gegevens op één plek.
// Bron: Instagram @makeupby.duygu (profiel, posts, highlights), zie bron/.
//
// Dit is een CONCEPT. Onbevestigde waarden staan als todo('…') en verschijnen
// op de site als "op aanvraag". Zolang draft: true staat krijgt de site
// noindex en blokkeert robots.txt alles.

export const todo = (label) => ({ todo: label });

export const site = {
  draft: true,
  name: 'Makeup by Duygu',
  role: 'Make-upartiest',
  region: 'Vaassen / Apeldoorn',
  url: todo('domeinnaam'),

  contact: {
    instagram: 'makeupby.duygu',
    tiktok: 'makeupby.duyguu',
    whatsapp: todo('WhatsApp-nummer'),
  },

  certified: 'Certified MUA by @burciimakeup',

  // Voorstel op basis van bio en posts; laat prijzen en duur bevestigen.
  services: [
    { name: 'Bruidsmake-up', desc: 'Je make-up voor de mooiste dag: stralend, langhoudend en helemaal jij. Ook voor henna, nikah of een tweede look.', price: todo('prijs bruid') },
    { name: 'Verloving', desc: 'Een zachte of juist uitgesproken look voor je verloving, die de hele avond blijft zitten.', price: todo('prijs verloving') },
    { name: 'Event & glam', desc: 'Voor een feest, Eid, een fotoshoot of een avond uit: glam make-up voor elke gelegenheid.', price: todo('prijs event') },
    { name: 'Gasten & familie', desc: 'Moeder van de bruid, zussen of vriendinnen: samen klaargemaakt op dezelfde dag.', price: todo('prijs per persoon') },
  ],

  work: [
    { img: 'bruid-kroon', label: 'Bruid met kroon', cat: 'bruid' },
    { img: 'glam-avond', label: 'Soft glam', cat: 'event' },
    { img: 'bruid-hijab', label: 'Bruid in hijab', cat: 'bruid' },
    { img: 'glam-rood-kant', label: 'Glam in rood', cat: 'event' },
    { img: 'bruid-henna', label: 'Henna-look', cat: 'bruid' },
    { img: 'glam-goud', label: 'Golden eyes', cat: 'event' },
    { img: 'bruid-tiara', label: 'Bruid met tiara', cat: 'bruid' },
    { img: 'verloving-groen', label: 'Verloving', cat: 'event' },
    { img: 'glam-hijab', label: 'Hijab glam', cat: 'event' },
    { img: 'bruid-sluier', label: 'Bruid met sluier', cat: 'bruid' },
    { img: 'glam-blond', label: 'Bronzed glam', cat: 'event' },
    { img: 'glam-rood', label: 'Avondlook', cat: 'event' },
    { img: 'glam-kort', label: 'Classic glam', cat: 'event' },
    { img: 'glam-bordeaux', label: 'Warm glam', cat: 'event' },
    { img: 'glam-hijab-roze', label: 'Soft hijab glam', cat: 'event' },
    { img: 'glam-golvend', label: 'Natural glow', cat: 'event' },
    { img: 'glam-bun', label: 'Cut crease', cat: 'event' },
    { img: 'glam-naturel', label: 'Fresh & pink', cat: 'event' },
  ],
  filters: [
    { id: 'alle', name: 'Alles' },
    { id: 'bruid', name: 'Bruid' },
    { id: 'event', name: 'Events & glam' },
  ],

  // Uit de highlight "Reviews"; namen en profielfoto's bewust weggelaten.
  reviews: [
    { text: 'Bedankt voor mijn engagement look! Je hebt een prachtige look gecreëerd, ik was er zo blij mee. Ik heb veel complimenten gehad over hoe mooi mijn make-up zat en het is de hele avond goed gebleven.', who: 'Klant, verloving' },
    { text: 'Heel erg bedankt voor de mooie make-up van gisteren. Het heeft de hele avond mooi gezeten en heb veel complimenten ontvangen. Super blij mee!', who: 'Klant, event' },
    { text: 'Jij bedankt met alles, is zóóó mooi! Ik krijg complimenten.', who: 'Klant' },
  ],

  steps: [
    { t: 'Aanvraag', d: 'Stuur je datum, gelegenheid en of je in de studio of op locatie klaargemaakt wilt worden.' },
    { t: 'Jouw look', d: 'We bespreken je wensen: soft glam, bold of juist naturel, passend bij je jurk en je dag.' },
    { t: 'De dag zelf', d: 'In de studio in de regio Vaassen/Apeldoorn, of op locatie.' },
    { t: 'Stralen', d: 'Make-up die de hele dag blijft zitten, en complimenten tot de laatste dans.' },
  ],
};
