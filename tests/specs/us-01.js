import { VIEWPORTS } from '../lib/harness.js';
import { PAGES } from './_pages.js';

export default {
  id: 'US-01',
  title: 'Página de Inicio e Introducción General',
  tests: [
    {
      name: 'Tiene hero, introducción y 5 tarjetas de acceso rápido',
      async run(t) {
        const p = await t.page('index.html');
        t.assert(p.$('.hero h1'), 'Falta el título del hero');
        t.assert(p.$('.intro__text')?.textContent.trim().length > 50, 'Falta la breve introducción a los temas');
        t.equal(p.$$('.feature-card').length, 5, 'Cantidad de tarjetas de navegación');
        p.$$('.feature-card').forEach((c) => t.assert(c.querySelector('a.btn[href$=".html"]'), `Tarjeta sin acceso directo: ${c.textContent.trim().slice(0, 30)}`));
      },
    },
    {
      name: 'Layout responsive con Grid (5 → 3 → 2 → 1 columnas)',
      async run(t) {
        const expected = { 1280: 5, 1024: 3, 700: 2, 375: 1 };
        for (const [w, cols] of Object.entries(expected)) {
          const p = await t.page('index.html', Number(w));
          const grid = p.$('.feature-grid');
          t.equal(p.win.getComputedStyle(grid).display, 'grid', 'La grilla debe usar CSS Grid');
          const n = p.win.getComputedStyle(grid).gridTemplateColumns.split(' ').length;
          t.equal(n, cols, `Columnas a ${w}px`);
        }
      },
    },
    {
      name: 'Menú hamburguesa: abre, cierra con Escape y se oculta en escritorio',
      async run(t) {
        const m = await t.page('index.html', VIEWPORTS.mobile);
        const toggle = m.$('.nav-toggle');
        t.assert(m.win.getComputedStyle(toggle).display !== 'none', 'El botón hamburguesa debe verse en mobile');
        toggle.click();
        t.equal(toggle.getAttribute('aria-expanded'), 'true', 'aria-expanded al abrir');
        t.assert(m.$('#main-nav').classList.contains('is-open'), 'El menú debe abrirse');
        m.key(m.doc, 'Escape');
        t.equal(toggle.getAttribute('aria-expanded'), 'false', 'aria-expanded después de Escape');

        const d = await t.page('index.html', VIEWPORTS.desktop);
        t.equal(d.win.getComputedStyle(d.$('.nav-toggle')).display, 'none', 'El botón hamburguesa no debe verse en escritorio');
      },
    },
    {
      name: 'Resalta la sección activa en cada página del menú',
      async run(t) {
        const map = { 'index.html': 'inicio', 'fundamentos.html': 'gestion', 'procesos.html': 'procesos', 'metodologias.html': 'metodologias', 'recursos.html': 'recursos' };
        for (const [page, key] of Object.entries(map)) {
          const p = await t.page(page);
          const active = p.$$('.main-nav__link.is-active');
          t.equal(active.length, 1, `Links activos en ${page}`);
          t.equal(active[0].dataset.page, key, `Link activo en ${page}`);
          t.equal(active[0].getAttribute('aria-current'), 'page', `aria-current en ${page}`);
        }
      },
    },
    {
      name: 'Todos los enlaces internos responden (sin URLs rotas)',
      async run(t) {
        const checked = new Set();
        const idsCache = new Map(); // ids de cada página destino (se carga una sola vez)
        const idsOf = async (file) => {
          if (!idsCache.has(file)) {
            const html = await (await fetch(file, { cache: 'no-store' })).text();
            const doc = new DOMParser().parseFromString(html, 'text/html');
            idsCache.set(file, new Set([...doc.querySelectorAll('[id]')].map((el) => el.id)));
          }
          return idsCache.get(file);
        };
        for (const page of PAGES) {
          const p = await t.page(page);
          for (const a of p.$$('a[href]')) {
            const url = new URL(a.getAttribute('href'), p.win.location.href);
            if (url.origin !== location.origin) continue;
            const file = url.pathname;
            if (!checked.has(file)) {
              const res = await fetch(file, { method: 'HEAD', cache: 'no-store' });
              t.assert(res.ok, `${page}: enlace roto ${a.getAttribute('href')} (${res.status})`);
              checked.add(file);
            }
            if (url.hash && file.endsWith('.html')) {
              const ids = await idsOf(file);
              t.assert(ids.has(decodeURIComponent(url.hash.slice(1))), `${page}: ancla inexistente ${a.getAttribute('href')}`);
            }
          }
        }
      },
    },
    {
      name: 'Sin scroll horizontal en Desktop, Tablet y Mobile (8 páginas)',
      async run(t) {
        for (const [name, w] of Object.entries(VIEWPORTS)) {
          for (const page of PAGES) {
            const p = await t.page(page, w);
            const extra = p.doc.documentElement.scrollWidth - p.win.innerWidth;
            t.assert(extra <= 0, `${page} en ${name} (${w}px) se desborda ${extra}px`);
          }
        }
      },
    },
  ],
};
