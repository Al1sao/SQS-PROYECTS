/**
 * Formulario de contacto: validación en vivo y mensaje de envío.
 * (No hay backend: el envío se simula.)
 */
import { $, $$, on } from '../utils/dom.js';
import { required, minLength, maxLength, email, personName, safeText, validate } from '../utils/validators.js';

const MAX_MESSAGE = 500;

// Reglas por campo (US-17): obligatorios, formato de email y
// casos de frontera (caracteres especiales, largo máximo).
const RULES = {
  nombre: [
    required('Ingresa tu nombre completo.'),
    minLength(3, 'El nombre es demasiado corto.'),
    maxLength(60, 'El nombre no puede superar los 60 caracteres.'),
    personName(),
  ],
  email: [required('Ingresa tu correo electrónico.'), maxLength(100), email()],
  tipo: [required('Selecciona un tipo de consulta.')],
  mensaje: [maxLength(MAX_MESSAGE), safeText()],
};

function showError(field, message) {
  const wrapper = field.closest('.field');
  const errorEl = $('.field__error', wrapper);
  wrapper.classList.toggle('has-error', Boolean(message));
  field.setAttribute('aria-invalid', String(Boolean(message)));
  if (errorEl) errorEl.textContent = message;
}

function checkField(field) {
  const error = validate(field.value, RULES[field.name] || []);
  showError(field, error);
  return !error;
}

/** Contador de caracteres del mensaje. */
function setupCounter(textarea) {
  const counter = $('.field__counter', textarea.closest('.field'));
  if (!counter) return () => {};
  const update = () => {
    const n = textarea.value.length;
    counter.textContent = `${n} / ${MAX_MESSAGE}`;
    counter.classList.toggle('is-limit', n >= MAX_MESSAGE);
  };
  on(textarea, 'input', update);
  update();
  return update;
}

function updateSelectPlaceholder(select) {
  select.classList.toggle('is-placeholder', !select.value);
}

export function initContactForm() {
  const form = $('#contact-form');
  if (!form) return;

  const fields = $$('.field__input', form);
  const status = $('.form-status', form);
  const submit = $('[type="submit"]', form);
  const select = $('select', form);

  const updateCounter = form.mensaje ? setupCounter(form.mensaje) : () => {};
  if (select) {
    updateSelectPlaceholder(select);
    on(select, 'change', () => updateSelectPlaceholder(select));
  }

  // al volver a escribir, se limpia el mensaje de éxito/error anterior
  on(form, 'input', () => {
    status.textContent = '';
    status.className = 'form-status';
  });

  fields.forEach((field) => {
    on(field, 'blur', () => checkField(field));
    on(field, 'input', () => field.closest('.field').classList.contains('has-error') && checkField(field));
  });

  on(form, 'submit', (e) => {
    e.preventDefault();
    const valid = fields.map(checkField).every(Boolean);

    if (!valid) {
      status.className = 'form-status form-status--error';
      status.textContent = 'Revisa los campos marcados en rojo.';
      $('.has-error .field__input', form)?.focus();
      return;
    }

    submit.disabled = true;
    submit.textContent = 'Enviando...';

    // Simulación de envío
    setTimeout(() => {
      const nombre = form.nombre.value.trim().split(' ')[0];
      status.className = 'form-status form-status--ok';
      status.textContent = `¡Gracias, ${nombre}! Recibimos tu consulta y te responderemos a la brevedad.`;
      form.reset();
      fields.forEach((f) => showError(f, ''));
      updateCounter();
      if (select) updateSelectPlaceholder(select);
      submit.disabled = false;
      submit.textContent = 'Enviar';
    }, 900);
  });
}
