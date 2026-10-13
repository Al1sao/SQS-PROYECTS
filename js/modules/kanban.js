/**
 * Tablero Kanban de ejemplo.
 * - Mouse: arrastrar y soltar (drag & drop HTML5).
 * - Táctil y teclado: tocar la tarjeta (o Enter / Espacio) la mueve a la
 *   columna siguiente; desde "Hecho" vuelve a "Por hacer".
 * Actualiza el contador de tarjetas de cada columna.
 */
import { $, $$, on } from '../utils/dom.js';

function updateCounts(board) {
  $$('.kanban__col', board).forEach((col) => {
    $('.kanban__count', col).textContent = $$('.kanban__card', col).length;
  });
}

export function initKanban() {
  const board = $('[data-kanban]');
  if (!board) return;

  let dragged = null;
  const cols = $$('.kanban__col', board);
  const live = $('.kanban__live'); // aviso para lectores de pantalla

  const moveNext = (card) => {
    const i = cols.indexOf(card.closest('.kanban__col'));
    const target = cols[(i + 1) % cols.length];
    target.append(card);
    updateCounts(board);
    card.focus();
    if (live) live.textContent = `"${card.textContent.trim()}" se movió a ${$('.kanban__title', target).textContent}`;
  };

  $$('.kanban__card', board).forEach((card) => {
    card.draggable = true;
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `${card.textContent.trim()}. Activar para mover a la columna siguiente`);
    on(card, 'click', () => moveNext(card));
    on(card, 'keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        moveNext(card);
      }
    });
    on(card, 'dragstart', (e) => {
      dragged = card;
      card.classList.add('is-dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    on(card, 'dragend', () => {
      card.classList.remove('is-dragging');
      dragged = null;
    });
  });

  $$('.kanban__col', board).forEach((col) => {
    on(col, 'dragover', (e) => {
      e.preventDefault();
      col.classList.add('is-over');
    });
    on(col, 'dragleave', () => col.classList.remove('is-over'));
    on(col, 'drop', (e) => {
      e.preventDefault();
      col.classList.remove('is-over');
      if (dragged) {
        col.append(dragged);
        updateCounts(board);
      }
    });
  });

  updateCounts(board);
}
