/**
 * Efectos interactivos en las tarjetas de perfil del equipo (US-16).
 * - Inclinación 3D que sigue al cursor.
 * - Al pasar el cursor (o enfocar con teclado) se revela la motivación.
 * - En pantallas táctiles, el botón "Ver motivación" la abre/cierra.
 */
import { $, $$, on } from '../utils/dom.js';

const MAX_TILT = 6; // grados
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function setupCard(card) {
  const activate = () => card.classList.add('is-active');
  const reset = () => {
    card.classList.remove('is-active');
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
  };

  on(card, 'mouseenter', activate);
  on(card, 'mouseleave', reset);
  on(card, 'focusin', activate);
  on(card, 'focusout', reset);

  if (!reduceMotion) {
    on(card, 'mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5; // -0.5 .. 0.5
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty('--ry', `${(x * MAX_TILT * 2).toFixed(2)}deg`);
      card.style.setProperty('--rx', `${(-y * MAX_TILT * 2).toFixed(2)}deg`);
    });
  }

  const toggle = $('.team-card__toggle', card);
  if (toggle) {
    on(toggle, 'click', () => {
      const open = card.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Ocultar motivación' : 'Ver motivación';
    });
  }
}

export function initProfileCards() {
  $$('.team-card').forEach(setupCard);
}
