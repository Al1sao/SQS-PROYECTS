/**
 * S.Q.S - Scrum Quality Service
 * Punto de entrada de JavaScript. Se empaqueta con esbuild en dist/js/bundle.js
 *
 * Cada módulo se inicializa sólo si encuentra sus elementos en la página,
 * así un único bundle sirve para todas las páginas.
 */
import { initNavbar } from './modules/navbar.js';
import { initReveal } from './modules/reveal.js';
import { initTabs } from './modules/tabs.js';
import { initContactForm } from './modules/contactForm.js';
import { initComparator } from './modules/comparator.js';
import { initKanban } from './modules/kanban.js';
import { initToolsFilter } from './modules/toolsFilter.js';
import { initSafeLinks } from './modules/safeLinks.js';
import { initProfileCards } from './modules/profileCards.js';
import { initLightbox } from './modules/lightbox.js';

const modules = [
  initNavbar, // US-01: menú hamburguesa + sección activa
  initSafeLinks, // US-14: apertura segura de enlaces externos
  initReveal,
  initTabs, // US-02: pestañas ISO 9126 / 25000
  initToolsFilter, // Herramientas: filtro por categoría
  initLightbox, // US-07 / US-09: diagramas en pantalla completa
  initProfileCards, // US-16: efectos hover en perfiles
  initContactForm, // US-17: validación del formulario
  initComparator,
  initKanban,
];

function boot() {
  document.documentElement.classList.remove('no-js');
  modules.forEach((init) => {
    try {
      init();
    } catch (err) {
      console.error(`[SQS] Error al iniciar ${init.name}:`, err);
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
