const DIAGRAMS = ['#cascada', '#modelo-v', '#iterativo'];

export default {
  id: 'US-07',
  title: 'Ilustraciones de Modelos Tradicionales',
  tests: [
    {
      name: 'Diagramas en contenedores adaptables con pie de foto',
      async run(t) {
        for (const w of [1280, 375]) {
          const p = await t.page('procesos.html', w);
          for (const sel of DIAGRAMS) {
            const fig = p.$(sel);
            t.assert(fig?.tagName === 'FIGURE', `${sel} debe ser un <figure>`);
            t.assert(fig.querySelector(':scope > figcaption')?.textContent.trim(), `${sel} sin pie de foto`);
            t.assert(fig.getBoundingClientRect().width <= p.win.innerWidth, `${sel} más ancho que la pantalla a ${w}px`);
          }
        }
      },
    },
    {
      name: 'Formatos optimizados: sólo SVG o WebP',
      async run(t) {
        const p = await t.page('procesos.html');
        for (const img of p.$$('main img')) {
          t.assert(/\.(svg|webp)(\?|$)/.test(img.getAttribute('src')), `Formato no optimizado: ${img.getAttribute('src')}`);
        }
      },
    },
    {
      name: 'Atributo alt obligatorio y descriptivo en todas las imágenes (WCAG)',
      async run(t) {
        const p = await t.page('procesos.html');
        for (const img of p.$$('img')) {
          t.assert((img.getAttribute('alt') || '').trim().length >= 10, `Imagen sin alt descriptivo: ${img.getAttribute('src')}`);
        }
      },
    },
    {
      name: 'Lightbox: clic sobre cada diagrama lo abre en pantalla completa',
      async run(t) {
        const p = await t.page('procesos.html');
        for (const sel of DIAGRAMS) {
          p.$(sel).click();
          const dialog = await t.waitFor(() => p.$('dialog.lightbox[open]'), 2000, `lightbox de ${sel}`);
          // offsetWidth/Height ignoran la animación de entrada (scale)
          t.assert(dialog.offsetWidth >= p.win.innerWidth - 1 && dialog.offsetHeight >= p.win.innerHeight - 1, 'El lightbox debe ocupar toda la pantalla');
          t.assert(dialog.querySelector('.lightbox__body > *'), 'El lightbox no muestra el diagrama');
          p.$('.lightbox__close').click();
          t.assert(!p.$('dialog.lightbox[open]'), 'La X debe cerrar el lightbox');
        }
      },
    },
    {
      name: 'Lightbox: teclado (Enter abre, Escape cierra y devuelve el foco)',
      async run(t) {
        const p = await t.page('procesos.html');
        const fig = p.$('#modelo-v');
        fig.focus();
        p.key(fig, 'Enter');
        const dialog = await t.waitFor(() => p.$('dialog.lightbox[open]'), 2000, 'lightbox abierto con Enter');
        t.equal(p.$('.lightbox__counter').textContent, '2 / 3', 'Contador de la galería');
        p.key(dialog, 'ArrowRight');
        t.equal(p.$('.lightbox__counter').textContent, '3 / 3', 'ArrowRight pasa al siguiente diagrama');
        // Escape: el navegador dispara "cancel" y cierra el diálogo
        dialog.dispatchEvent(new p.win.Event('cancel'));
        dialog.close();
        t.assert(!p.$('dialog.lightbox[open]'), 'El lightbox debe cerrarse');
        t.equal(p.doc.activeElement, fig, 'El foco debe volver al diagrama');
        t.assert(!p.doc.documentElement.classList.contains('is-locked'), 'La página debe volver a tener scroll');
      },
    },
    {
      name: 'Las imágenes no se pueden arrastrar',
      async run(t) {
        const p = await t.page('procesos.html');
        p.$$('img').forEach((img) => t.equal(img.draggable, false, `draggable en ${img.getAttribute('src')}`));
      },
    },
    {
      name: 'Tiempos de carga rápidos (página < 1,5 s y peso de imágenes < 400 KB)',
      async run(t) {
        const p = await t.page('procesos.html');
        t.assert(p.loadMs < 1500, `La página tardó ${Math.round(p.loadMs)} ms`);
        let total = 0;
        for (const img of p.$$('img')) {
          const res = await fetch(img.src, { cache: 'no-store' });
          total += (await res.blob()).size;
        }
        t.assert(total < 400 * 1024, `Las imágenes pesan ${Math.round(total / 1024)} KB`);
      },
    },
  ],
};
