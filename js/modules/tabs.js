/**
 * Pestañas accesibles (patrón WAI-ARIA Tabs).
 * Estructura esperada:
 *   [data-tabs] > [role=tablist] > [role=tab][aria-controls]
 *   [data-tabs] > [role=tabpanel][id]
 */
import { $, $$, on } from '../utils/dom.js';

function activate(tabs, tab) {
  tabs.forEach((t) => {
    const selected = t === tab;
    t.setAttribute('aria-selected', String(selected));
    t.tabIndex = selected ? 0 : -1;
    const panel = document.getElementById(t.getAttribute('aria-controls'));
    if (panel) panel.hidden = !selected;
  });
}

function setupTabs(root) {
  const tabs = $$('[role="tab"]', root);
  if (!tabs.length) return;

  tabs.forEach((tab, index) => {
    on(tab, 'click', () => activate(tabs, tab));

    // navegación con flechas del teclado
    on(tab, 'keydown', (e) => {
      const keys = { ArrowRight: 1, ArrowLeft: -1 };
      if (!(e.key in keys)) return;
      const next = tabs[(index + keys[e.key] + tabs.length) % tabs.length];
      next.focus();
      activate(tabs, next);
    });
  });

  activate(tabs, $('[aria-selected="true"]', root) || tabs[0]);
}

export function initTabs() {
  $$('[data-tabs]').forEach(setupTabs);
}
