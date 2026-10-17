// 3D-hero laden: alleen met WebGL, zonder databesparing en zonder beperkte beweging. Op de site komt de
// module via een lazy import; in de voorbeeldweergave staat hij al inline als window.NexdEngine.
// Resolvet de promise zodra het eerste frame staat (of meteen als er geen 3D komt): de laadsluier wacht hierop.
import { $, reduced } from './core.js';

const webgl = () => {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
};

export const initEngine = (root = document) => {
  const stage = $('[data-engine]', root);
  if (!stage || reduced || navigator.connection?.saveData || !webgl()) return { ready: Promise.resolve(false), dispose: () => {} };
  const lowPower = window.innerWidth < 768 || (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
  let engine = null;
  let cancelled = false;
  const load = () => (window.NexdEngine ? Promise.resolve(window.NexdEngine) : import(/* @vite-ignore */ stage.dataset.src));
  const ready = load()
    .then((m) => {
      if (cancelled || !stage.isConnected) return false;
      engine = m.mount(stage, { lowPower });
      return new Promise((r) => requestAnimationFrame(() => (stage.classList.add('is-live'), r(true))));
    })
    .catch(() => false); // de SVG-compositie blijft gewoon staan
  return {
    ready,
    dispose: () => {
      cancelled = true;
      engine?.dispose();
    },
  };
};
