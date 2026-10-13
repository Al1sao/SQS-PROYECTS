export default {
  id: 'US-14',
  title: 'Sección "Enlaces de Interés"',
  tests: [
    {
      name: 'Tarjetas con ícono distintivo por tipo (Web, PDF, Libro, Organización)',
      async run(t) {
        const p = await t.page('recursos.html');
        const cards = p.$$('.resource-card');
        t.equal(cards.length, 4, 'Cantidad de tarjetas');
        const types = cards.map((c) => c.querySelector('.resource-card__title span')?.textContent.trim());
        ['Sitio web', 'Documento PDF', 'Libro', 'Organización'].forEach((type) => t.assert(types.includes(type), `Falta el tipo "${type}"`));
        const icons = new Set(cards.map((c) => c.querySelector('.resource-card__icon')?.getAttribute('src')));
        t.equal(icons.size, 4, 'Cada tipo debe tener un ícono distinto');
      },
    },
    {
      name: 'Enlaces externos con target="_blank" y rel="noopener noreferrer"',
      async run(t) {
        for (const page of ['recursos.html', 'fundamentos.html']) {
          const p = await t.page(page);
          const external = p.$$('a[href^="http"]');
          t.assert(external.length > 0, `No hay enlaces externos en ${page}`);
          for (const a of external) {
            t.equal(a.target, '_blank', `target de ${a.href}`);
            t.assert(a.relList.contains('noopener') && a.relList.contains('noreferrer'), `rel de ${a.href}`);
          }
        }
      },
    },
    {
      name: 'JS de apertura segura: corrige un enlace externo agregado sin rel',
      async run(t) {
        const p = await t.page('recursos.html');
        const a = p.doc.createElement('a');
        a.href = 'https://example.com/';
        p.doc.body.append(a);
        // se vuelve a ejecutar el módulo sobre la página
        const { initSafeLinks } = await import('../../js/modules/safeLinks.js');
        initSafeLinks(p.doc);
        t.equal(a.target, '_blank', 'target agregado por JS');
        t.assert(a.relList.contains('noopener') && a.relList.contains('noreferrer'), 'rel agregado por JS');
      },
    },
    {
      name: 'El recurso PDF descarga un PDF real',
      async run(t) {
        const p = await t.page('recursos.html');
        const link = p.$('a[href$=".pdf"]');
        t.assert(link, 'No hay enlace a un PDF');
        t.assert(link.hasAttribute('download'), 'El enlace debe tener el atributo download');
        const res = await fetch(link.href, { cache: 'no-store' });
        t.assert(res.ok, `El PDF no existe (${res.status})`);
        const head = new TextDecoder().decode((await res.arrayBuffer()).slice(0, 5));
        t.equal(head, '%PDF-', 'El archivo debe ser un PDF válido');
      },
    },
  ],
};
