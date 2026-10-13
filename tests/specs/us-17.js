/** Rellena el formulario. Los valores omitidos quedan vacíos. */
function fill(p, { nombre = '', email = '', tipo = '', mensaje = '' } = {}) {
  const f = p.$('#contact-form');
  p.type(f.nombre, nombre);
  p.type(f.email, email);
  f.tipo.value = tipo;
  f.tipo.dispatchEvent(new p.win.Event('change', { bubbles: true }));
  p.type(f.mensaje, mensaje);
  return f;
}

const errorOf = (p, id) => p.$(`#${id}`).closest('.field').querySelector('.field__error').textContent.trim();

const VALID = { nombre: 'Pedro Martínez', email: 'pedro@gmail.com', tipo: 'metricas', mensaje: 'Consulta sobre métricas.' };

export default {
  id: 'US-17',
  title: 'Formulario de Contacto',
  tests: [
    {
      name: 'Cada campo (input, select, textarea) tiene su <label> vinculado',
      async run(t) {
        const p = await t.page('contacto.html');
        for (const field of p.$$('#contact-form input, #contact-form select, #contact-form textarea')) {
          t.assert(field.labels?.length === 1, `El campo #${field.id} no tiene <label for>`);
        }
      },
    },
    {
      name: 'Frontera: enviar con todos los campos vacíos',
      async run(t) {
        const p = await t.page('contacto.html');
        fill(p).querySelector('[type=submit]').click();
        t.assert(errorOf(p, 'nombre'), 'Falta el error de Nombre');
        t.assert(errorOf(p, 'email'), 'Falta el error de Correo');
        t.assert(errorOf(p, 'tipo'), 'Falta el error de Tipo de consulta');
        t.equal(p.$('#nombre').getAttribute('aria-invalid'), 'true', 'aria-invalid en Nombre');
        t.assert(p.$('.form-status').textContent.includes('Revisa'), 'Falta el aviso general de error');
      },
    },
    {
      name: 'Frontera: correos con sintaxis inválida',
      async run(t) {
        const p = await t.page('contacto.html');
        for (const email of ['pedro', 'pedro@', 'pedro@gmail', '@gmail.com', 'pedro gmail.com', 'pe dro@gmail.com']) {
          fill(p, { ...VALID, email }).querySelector('[type=submit]').click();
          t.assert(!p.$('[type=submit]').disabled, `Con "${email}" el formulario no debe enviarse`);
          t.assert(errorOf(p, 'email').includes('válido'), `"${email}" debería ser inválido`);
        }
        fill(p, VALID).querySelector('[type=submit]').click();
        t.equal(errorOf(p, 'email'), '', 'Un correo válido no debe mostrar error');
      },
    },
    {
      name: 'Frontera: textos con caracteres especiales',
      async run(t) {
        const p = await t.page('contacto.html');
        // (se deja el correo inválido para que el formulario nunca llegue a enviarse)
        const NO_SEND = { ...VALID, email: 'invalido' };
        for (const nombre of ['<script>', 'Pedro123', 'Pedro_M', '{{nombre}}']) {
          fill(p, { ...NO_SEND, nombre }).querySelector('[type=submit]').click();
          t.assert(errorOf(p, 'nombre'), `El nombre "${nombre}" debería dar error`);
        }
        fill(p, { ...NO_SEND, nombre: 'José Ñúñez-Peña' }).querySelector('[type=submit]').click();
        t.equal(errorOf(p, 'nombre'), '', 'Tildes, ñ y guiones son válidos');

        for (const mensaje of ['<b>hola</b>', 'hola {{x}}', '<img src=x onerror=alert(1)>']) {
          fill(p, { ...NO_SEND, mensaje }).querySelector('[type=submit]').click();
          t.assert(errorOf(p, 'mensaje'), `El mensaje "${mensaje}" debería dar error`);
        }
        t.assert(!p.$('img[src="x"]'), 'El texto ingresado nunca debe insertarse como HTML');
      },
    },
    {
      name: 'Frontera: largo máximo de los campos',
      async run(t) {
        const p = await t.page('contacto.html');
        t.equal(p.$('#nombre').maxLength, 60, 'maxlength de Nombre');
        t.equal(p.$('#email').maxLength, 100, 'maxlength de Correo');
        t.equal(p.$('#mensaje').maxLength, 500, 'maxlength de Mensaje');
        fill(p, { ...VALID, mensaje: 'x'.repeat(500) });
        t.equal(p.$('.field__counter').textContent, '500 / 500', 'Contador de caracteres');
        fill(p, { ...VALID, nombre: 'Al' }).querySelector('[type=submit]').click();
        t.assert(errorOf(p, 'nombre').includes('corto'), 'Un nombre de 2 letras debe ser rechazado');
      },
    },
    {
      name: 'Datos válidos: mensaje de confirmación al presionar "Enviar"',
      async run(t) {
        const p = await t.page('contacto.html');
        const submit = p.$('#contact-form [type=submit]');
        t.equal(submit.textContent.trim(), 'Enviar', 'Texto del botón');
        fill(p, VALID);
        submit.click();
        await t.waitFor(() => p.$('.form-status').textContent.includes('Gracias'), 3000, 'mensaje de confirmación');
        t.assert(p.$('.form-status').classList.contains('form-status--ok'), 'El mensaje debe ser de éxito');
        t.equal(p.$('#nombre').value, '', 'El formulario se limpia después de enviar');
      },
    },
  ],
};
