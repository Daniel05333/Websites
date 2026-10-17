// NEXD Media — client. De site werkt volledig zonder JavaScript (alle inhoud staat in de HTML, de FAQ
// is <details>, alle pakketten en cases zijn zichtbaar, het formulier valt terug op mailto). Dit voegt
// beweging en interactie toe. Gebundeld met esbuild naar /assets/js/main.js.
import { initSmooth, initHeader, initMenu, initStickyCta, initCursor, initProgress, initVeil } from './chrome.js';
import { initReveals } from './reveal.js';
import { initCanvases } from './canvases.js';
import { initSections } from './sections.js';
import { initForms } from './form.js';
import { initEngine } from './engine-boot.js';

window.__nexdReady = true;

initSmooth();
initHeader();
initMenu();
initCursor();
initProgress();

// Paginagebonden delen; opnieuw aan te roepen (de voorbeeldweergave wisselt de inhoud van <main>).
let cleanups = [];
let first = true;
const initPage = (root = document) => {
  cleanups.forEach((fn) => fn());
  const engine = initEngine(root);
  const handover = first ? initVeil(engine.ready) : Promise.resolve();
  first = false;
  cleanups = [
    engine.dispose,
    initReveals(root, { handover }),
    initCanvases(document),
    initSections(root),
    initStickyCta(root),
    initForms(root),
  ];
};
window.nexdInitPage = initPage;
initPage();
