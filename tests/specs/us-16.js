export default {
  id: 'US-16',
  title: 'Sección "Sobre Nosotros"',
  tests: [
    {
      name: 'Tarjeta de perfil por rol con nombre, motivación e institución',
      async run(t) {
        const p = await t.page('nosotros.html');
        const cards = p.$$('.team-card');
        t.equal(cards.length, 4, 'Cantidad de perfiles');
        const roles = cards.map((c) => c.querySelector('.team-card__role').textContent.trim().toLowerCase());
        ['scrum master', 'diseñador', 'programador', 'tester'].forEach((r) => t.assert(roles.some((x) => x.includes(r)), `Falta el rol ${r}`));
        cards.forEach((c) => {
          const who = c.querySelector('.team-card__name')?.textContent.trim();
          t.assert(who, 'Perfil sin nombre');
          t.assert(c.querySelector('.team-card__motivation')?.textContent.includes('Motivación'), `${who}: falta la motivación`);
          t.assert(c.querySelector('.team-card__inst')?.textContent.includes('Institución'), `${who}: falta la institución`);
        });
      },
    },
    {
      name: 'Hover: el perfil se destaca y revela la motivación',
      async run(t) {
        const p = await t.page('nosotros.html');
        const card = p.$('.team-card');
        const motivation = card.querySelector('.team-card__motivation');
        t.equal(p.win.getComputedStyle(motivation).opacity, '0', 'La motivación empieza oculta');
        card.dispatchEvent(new p.win.MouseEvent('mouseenter'));
        t.assert(card.classList.contains('is-active'), 'Al pasar el cursor la tarjeta debe activarse');
        p.settle(card);
        t.equal(p.win.getComputedStyle(motivation).opacity, '1', 'La motivación debe verse');
        card.dispatchEvent(new p.win.MouseEvent('mouseleave'));
        t.assert(!card.classList.contains('is-active'), 'Al salir el cursor vuelve a la normalidad');
      },
    },
    {
      name: 'Hover también accesible con teclado (foco)',
      async run(t) {
        const p = await t.page('nosotros.html');
        const card = p.$$('.team-card')[2];
        card.dispatchEvent(new p.win.FocusEvent('focusin', { bubbles: true }));
        t.assert(card.classList.contains('is-active'), 'Al enfocar con Tab la tarjeta debe activarse');
      },
    },
    {
      name: 'Alineación: tarjetas en 2 columnas parejas (escritorio) y 1 columna (mobile)',
      async run(t) {
        const d = await t.page('nosotros.html', 1280);
        const r = d.$$('.team-card').map((c) => c.getBoundingClientRect());
        t.assert(Math.abs(r[0].top - r[1].top) < 2 && Math.abs(r[2].top - r[3].top) < 2, 'Las filas deben estar alineadas');
        t.assert(Math.abs(r[0].left - r[2].left) < 2 && Math.abs(r[1].left - r[3].left) < 2, 'Las columnas deben estar alineadas');
        t.assert(Math.abs(r[0].width - r[1].width) < 2, 'Las tarjetas deben tener el mismo ancho');

        const m = await t.page('nosotros.html', 375);
        const rm = m.$$('.team-card').map((c) => c.getBoundingClientRect());
        rm.forEach((x, i) => i && t.assert(Math.abs(x.left - rm[0].left) < 2, 'En mobile van en una sola columna'));
      },
    },
  ],
};
