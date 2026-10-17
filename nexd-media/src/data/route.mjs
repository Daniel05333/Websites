// De route "van bezoeker tot aanvraag": gedeeld door de HTML (de fasen als tekst) en de canvas
// (de lijn die eenmaal wordt afgelegd). Coördinaten in het 1440×800-tekenvlak van de sectie.

export const routeStages = [
  { title: 'Aandacht', text: 'Gevonden op de zoekvraag van je cliënt' },
  { title: 'Begrip', text: 'Binnen seconden duidelijk wat je doet' },
  { title: 'Vertrouwen', text: 'Gezichten, cases en een heldere werkwijze' },
  { title: 'Actie', text: 'Eén logische, laagdrempelige volgende stap' },
];

/** Controlepunten; de canvas trekt er een vloeiende Catmull-Rom-lijn doorheen. */
export const ROUTE_POINTS = [
  [96, 520], [210, 470], [300, 520], [372, 610], [470, 640], [560, 590], [600, 500],
  [640, 400], [720, 340], [820, 350], [880, 420], [930, 520], [1020, 560], [1110, 520],
  [1150, 430], [1130, 330], [1180, 250], [1290, 220], [1360, 260],
];

/** Waar op de route (als deel van de lengte) de vier fasen liggen. */
export const STAGE_AT = [0.2, 0.42, 0.64, 0.84];

/** Middelpunt van de ringen en het assenkruis. */
export const HUB = [760, 470];
