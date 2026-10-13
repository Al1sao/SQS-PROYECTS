const FIGS = ['#fig-sprint', '#fig-kanban', '#fig-xp'];

export default {
  id: 'US-09',
  title: 'Ilustraciones de Metodologías Ágiles',
  tests: [
    {
      name: 'Esquemas: ciclo del Sprint, flujo Kanban y bucle de XP',
      async run(t) {
        const p = await t.page('metodologias.html');
        for (const sel of FIGS) {
          const img = p.$(`${sel} img.illustration__img`);
          t.assert(img, `Falta la ilustración ${sel}`);
          await t.waitFor(() => img.complete && img.naturalWidth > 0, 3000, `carga de ${sel}`);
          t.assert(p.$(`${sel} figcaption`)?.textContent.trim(), `${sel} sin pie de foto`);
          t.assert(img.alt.length > 40, `${sel} sin alt descriptivo`);
        }
      },
    },
    {
      name: 'Reutiliza el Lightbox como galería modal (3 gráficos)',
      async run(t) {
        const p = await t.page('metodologias.html');
        p.$('#fig-sprint').click();
        const dialog = await t.waitFor(() => p.$('dialog.lightbox[open]'), 2000, 'lightbox abierto');
        t.equal(p.$('.lightbox__counter').textContent, '1 / 3', 'Contador inicial');
        p.$('.lightbox__nav--next').click();
        t.equal(p.$('.lightbox__counter').textContent, '2 / 3', 'Botón siguiente');
        p.$('.lightbox__nav--prev').click();
        p.$('.lightbox__nav--prev').click();
        t.equal(p.$('.lightbox__counter').textContent, '3 / 3', 'Botón anterior (vuelve al último)');
        t.assert(p.$('.lightbox__img')?.src.endsWith('.svg'), 'La galería debe mostrar el SVG');
        p.$('.lightbox__close').click();
      },
    },
    {
      name: 'Escalabilidad en pantallas Retina / Full HD (gráficos vectoriales)',
      async run(t) {
        const p = await t.page('metodologias.html', 1920, 1080);
        for (const sel of FIGS) {
          const img = p.$(`${sel} img.illustration__img`);
          t.assert(img.getAttribute('src').endsWith('.svg'), `${sel} debe ser SVG (vectorial)`);
          const res = await fetch(img.src, { cache: 'no-store' });
          const svg = await res.text();
          t.assert(/viewBox="/.test(svg), `${sel}: el SVG necesita viewBox para escalar`);
        }
        // los íconos rasterizados deben tener al menos el doble de resolución (2x Retina)
        for (const icon of p.$$('main img[src$=".webp"]')) {
          await t.waitFor(() => icon.complete, 2000, icon.getAttribute('src'));
          const shown = icon.getBoundingClientRect().width;
          if (shown) t.assert(icon.naturalWidth >= shown * 2, `${icon.getAttribute('src')}: ${icon.naturalWidth}px para ${Math.round(shown)}px mostrados (< 2x)`);
        }
      },
    },
  ],
};
