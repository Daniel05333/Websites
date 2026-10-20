// Gedeelde hulpjes voor de databestanden.
export const todo = (label) => ({ todo: true, label });
export const isTodo = (v) => v && typeof v === 'object' && v.todo === true;
export const SHOP = 'https://grillroomcamel.com';
/** Productpagina in de webshop. */
export const p = (slug) => `${SHOP}/product/${slug}/`;
