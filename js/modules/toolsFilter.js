/**
 * Filtro de herramientas por categoría (sin recargar la página).
 * Botones:  [data-filter="todas|bug|testing|codigo"]
 * Tarjetas: [data-category="bug|testing|codigo"]
 */
import { $, $$, on } from '../utils/dom.js';

const LABELS = {
  todas: 'herramientas',
  bug: 'bug trackers',
  testing: 'herramientas de testing',
  codigo: 'herramientas de calidad de código',
};

function applyFilter(root, filter) {
  const cards = $$('[data-category]', root);
  let visible = 0;

  cards.forEach((card) => {
    const show = filter === 'todas' || card.dataset.category === filter;
    card.classList.remove('is-entering');
    card.hidden = !show;
    if (show) {
      visible += 1;
      // reinicia la animación de entrada
      void card.offsetWidth;
      card.classList.add('is-entering');
    }
  });

  $$('[data-filter]', root).forEach((btn) => btn.setAttribute('aria-pressed', String(btn.dataset.filter === filter)));

  const status = $('.filter-status', root);
  if (status) status.textContent = `Mostrando ${visible} ${LABELS[filter] || 'herramientas'}`;

  const empty = $('.tool-empty', root);
  if (empty) empty.hidden = visible > 0;
}

/** Agrega a cada botón la cantidad de tarjetas de su categoría. */
function addCounts(root) {
  const cards = $$('[data-category]', root);
  $$('[data-filter]', root).forEach((btn) => {
    const f = btn.dataset.filter;
    const n = f === 'todas' ? cards.length : cards.filter((c) => c.dataset.category === f).length;
    const badge = document.createElement('span');
    badge.className = 'filter-btn__count';
    badge.textContent = `(${n})`;
    btn.append(badge);
  });
}

export function initToolsFilter() {
  $$('[data-tools]').forEach((root) => {
    addCounts(root);
    $$('[data-filter]', root).forEach((btn) => on(btn, 'click', () => applyFilter(root, btn.dataset.filter)));
    applyFilter(root, 'todas');
  });
}
