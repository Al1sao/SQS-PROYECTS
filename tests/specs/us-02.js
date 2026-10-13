import { VIEWPORTS } from '../lib/harness.js';

export default {
  id: 'US-02',
  title: 'Sección "Fundamentos de Calidad"',
  tests: [
    {
      name: 'Jerarquía de encabezados correcta (un <h1>, sin saltos)',
      async run(t) {
        const p = await t.page('fundamentos.html');
        const levels = p.$$('h1,h2,h3,h4,h5,h6').map((h) => Number(h.tagName[1]));
        t.equal(levels.filter((l) => l === 1).length, 1, 'Cantidad de <h1>');
        levels.forEach((l, i) => i && t.assert(l <= levels[i - 1] + 1, `Salto de <h${levels[i - 1]}> a <h${l}>`));
      },
    },
    {
      name: 'Conceptos clave e ISO resaltados visualmente',
      async run(t) {
        const p = await t.page('fundamentos.html');
        t.equal(p.$$('.concept').length, 3, 'Tarjetas de concepto (Calidad, QA, QC)');
        t.assert(p.$$('.concept mark').length >= 3, 'Faltan resaltados <mark> en los conceptos');
        t.equal(p.$$('#panel-9126 .iso-list li').length, 6, 'Características de ISO 9126');
        t.equal(p.$$('#panel-25000 .iso-list li').length, 8, 'Características de ISO 25010');
      },
    },
    {
      name: 'Pestañas ISO: clic cambia el panel sin recargar',
      async run(t) {
        const p = await t.page('fundamentos.html');
        const [tab1, tab2] = p.$$('[role="tab"]');
        t.assert(!p.$('#panel-9126').hidden && p.$('#panel-25000').hidden, 'Estado inicial: sólo ISO 9126 visible');
        tab2.click();
        t.equal(tab2.getAttribute('aria-selected'), 'true', 'aria-selected de ISO 25000');
        t.assert(p.$('#panel-9126').hidden && !p.$('#panel-25000').hidden, 'Después del clic se ve sólo ISO 25000');
        t.equal(tab1.getAttribute('aria-selected'), 'false', 'aria-selected de ISO 9126');
      },
    },
    {
      name: 'Pestañas ISO: navegación con flechas del teclado',
      async run(t) {
        const p = await t.page('fundamentos.html');
        const [tab1] = p.$$('[role="tab"]');
        p.key(tab1, 'ArrowRight');
        t.assert(!p.$('#panel-25000').hidden, 'ArrowRight debe mostrar ISO 25000');
        p.key(p.$('#tab-25000'), 'ArrowLeft');
        t.assert(!p.$('#panel-9126').hidden, 'ArrowLeft debe volver a ISO 9126');
      },
    },
    {
      name: 'Legibilidad: texto de al menos 15px en mobile y escritorio',
      async run(t) {
        for (const w of [VIEWPORTS.mobile, VIEWPORTS.desktop]) {
          const p = await t.page('fundamentos.html', w);
          for (const el of p.$$('.arrow-list li, .concept__def, .tabs__panel p, .metric-card__text')) {
            const size = parseFloat(p.win.getComputedStyle(el).fontSize);
            t.assert(size >= 15, `Texto de ${size}px a ${w}px: "${el.textContent.trim().slice(0, 30)}"`);
          }
        }
      },
    },
  ],
};
