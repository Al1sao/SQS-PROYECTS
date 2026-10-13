/**
 * Comparador interactivo: compara dos modelos criterio por criterio
 * y se actualiza en tiempo real al cambiar los selectores.
 */
import { $, on, escapeHTML } from '../utils/dom.js';
import { CRITERIA, MODELS } from '../data/models.js';

const pct = (score) => `${(score / 5) * 100}%`;

function fillSelect(select, selectedKey) {
  select.innerHTML = Object.entries(MODELS)
    .map(([key, m]) => `<option value="${key}" ${key === selectedKey ? 'selected' : ''}>${escapeHTML(m.name)}</option>`)
    .join('');
}

function rowTemplate(criterion, a, b) {
  const sa = a.scores[criterion.key];
  const sb = b.scores[criterion.key];
  return `
    <div class="comparator__row">
      <div class="comparator__cell comparator__cell--a">
        ${sa}/5
        <div class="comparator__bar"><span style="width:${pct(sa)}"></span></div>
      </div>
      <div class="comparator__label">${escapeHTML(criterion.label)}</div>
      <div class="comparator__cell comparator__cell--b">
        ${sb}/5
        <div class="comparator__bar"><span style="width:${pct(sb)}"></span></div>
      </div>
    </div>`;
}

function summary(a, b) {
  const total = (m) => Object.values(m.scores).reduce((acc, n) => acc + n, 0);
  const wins = (x, y) => CRITERIA.filter((c) => x.scores[c.key] > y.scores[c.key]).map((c) => c.label.toLowerCase());
  const winsA = wins(a, b);
  const winsB = wins(b, a);

  if (a === b) return `<strong>Elige dos modelos distintos</strong> para ver sus diferencias.`;

  return `
    <p><strong>${escapeHTML(a.name)}</strong> (${total(a)} pts) se destaca en: ${winsA.join(', ') || '—'}.</p>
    <p><strong>${escapeHTML(b.name)}</strong> (${total(b)} pts) se destaca en: ${winsB.join(', ') || '—'}.</p>
    <p style="margin-top:10px">💡 ${escapeHTML(a.name)} es ideal para ${escapeHTML(a.ideal)}
    ${escapeHTML(b.name)} es ideal para ${escapeHTML(b.ideal)}</p>`;
}

export function initComparator() {
  const root = $('[data-comparator]');
  if (!root) return;

  const selA = $('#model-a', root);
  const selB = $('#model-b', root);
  const table = $('.comparator__table', root);
  const winner = $('.comparator__winner', root);

  fillSelect(selA, 'cascada');
  fillSelect(selB, 'scrum');

  const render = () => {
    const a = MODELS[selA.value];
    const b = MODELS[selB.value];
    $('[data-name="a"]', root).textContent = a.name;
    $('[data-name="b"]', root).textContent = b.name;
    table.innerHTML = CRITERIA.map((c) => rowTemplate(c, a, b)).join('');
    winner.innerHTML = summary(a, b);
  };

  on(selA, 'change', render);
  on(selB, 'change', render);
  render();
}
