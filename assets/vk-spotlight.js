/* VOLKARA — spotlight variant pills: update hidden id, price and ATC state */
(() => {
  'use strict';
  document.addEventListener('change', (e) => {
    const radio = e.target.closest('.vk-spotlight input[type="radio"]'); if (!radio) return;
    const root = radio.closest('.vk-spotlight'); const VK = window.VK;
    root.querySelector('[data-spotlight-id]').value = radio.value;
    const price = root.querySelector('[data-price-current]'); if (price && VK) price.textContent = VK.formatMoney(radio.dataset.price);
    const cmp = root.querySelector('[data-price-compare]'); if (cmp && VK && radio.dataset.compare) cmp.textContent = VK.formatMoney(radio.dataset.compare);
    const btn = root.querySelector('.vk-spotlight__atc'); const ok = radio.dataset.available === 'true';
    btn.disabled = !ok; const label = btn.querySelector('[data-atc-label]'); if (label && VK) label.textContent = ok ? VK.strings.addToCart : VK.strings.soldOut;
  });
})();
