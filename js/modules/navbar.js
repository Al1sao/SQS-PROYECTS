/**
 * Navbar: menú hamburguesa (mobile), desplegables accesibles
 * y marcado automático del link de la página actual.
 */
import { $, $$, on } from '../utils/dom.js';

const MOBILE_QUERY = window.matchMedia('(max-width: 1023.98px)');

/** Marca como activo el link cuyo data-page coincide con <body data-page>. */
function markActiveLink(nav) {
  const current = document.body.dataset.page;
  $$('.main-nav__link', nav).forEach((link) => {
    const isActive = link.dataset.page === current;
    link.classList.toggle('is-active', isActive);
    if (isActive) link.setAttribute('aria-current', 'page');
  });
}

/** Abre / cierra el panel mobile. */
function setupToggle(toggle, nav) {
  const close = () => {
    toggle.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
  };

  on(toggle, 'click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  });

  // cerrar con Escape o al pasar a escritorio
  on(document, 'keydown', (e) => e.key === 'Escape' && close());
  on(MOBILE_QUERY, 'change', (e) => !e.matches && close());

  return close;
}

/** Desplegables: en mobile se abren con el botón flecha; en desktop con hover/focus (CSS). */
function setupDropdowns(nav) {
  $$('.has-dropdown', nav).forEach((item) => {
    const btn = $(':scope > .submenu-toggle', item);
    if (!btn) return;

    on(btn, 'click', (e) => {
      e.preventDefault();
      const open = !item.classList.contains('is-open');
      item.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
  });

  // Escape cierra cualquier desplegable abierto en desktop
  on(nav, 'keydown', (e) => {
    if (e.key !== 'Escape') return;
    $$('.has-dropdown.is-open', nav).forEach((el) => el.classList.remove('is-open'));
    document.activeElement?.blur();
  });
}

export function initNavbar() {
  const nav = $('#main-nav');
  const toggle = $('.nav-toggle');
  if (!nav) return;

  markActiveLink(nav);
  setupDropdowns(nav);

  if (toggle) {
    const close = setupToggle(toggle, nav);
    // al elegir un link (que no sea un desplegable) se cierra el panel
    $$('a', nav).forEach((a) => on(a, 'click', () => MOBILE_QUERY.matches && close()));
  }
}
