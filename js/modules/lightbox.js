/**
 * Lightbox / galería modal (US-07 y US-09).
 *
 * - Clic (o Enter / Espacio con teclado) sobre cualquier [data-lightbox]
 *   abre el diagrama en pantalla completa, ajustado al tamaño de la ventana.
 * - Sin botón de lupa y sin arrastre: el diagrama se muestra fijo.
 * - Galería: flechas ← → (teclado o botones) para pasar al siguiente.
 * - Esc, la X o un clic en el fondo cierran, y el foco vuelve al diagrama.
 */
import { $, $$, on, createEl } from '../utils/dom.js';

const ICONS = {
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
  next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
};

let dialog;
let items = [];
let current = 0;
let lastTrigger = null;

const titleOf = (el) => el.dataset.lightboxTitle || $('figcaption', el)?.textContent.trim() || 'Diagrama';

function iconButton(cls, icon, label) {
  const b = createEl('button', { class: `lightbox__btn ${cls}`, type: 'button', 'aria-label': label });
  b.innerHTML = icon;
  return b;
}

function buildDialog() {
  dialog = createEl('dialog', { class: 'lightbox', 'aria-labelledby': 'lightbox-title' });

  const bar = createEl('div', { class: 'lightbox__bar' }, [
    createEl('h2', { class: 'lightbox__title', id: 'lightbox-title' }),
    createEl('span', { class: 'lightbox__counter', 'aria-live': 'polite' }),
    iconButton('lightbox__close', ICONS.close, 'Cerrar pantalla completa'),
  ]);
  const stage = createEl('div', { class: 'lightbox__stage' }, [
    iconButton('lightbox__nav lightbox__nav--prev', ICONS.prev, 'Diagrama anterior'),
    createEl('div', { class: 'lightbox__body' }),
    iconButton('lightbox__nav lightbox__nav--next', ICONS.next, 'Diagrama siguiente'),
  ]);
  const caption = createEl('p', { class: 'lightbox__caption' });

  dialog.append(bar, stage, caption);
  document.body.append(dialog);

  on($('.lightbox__close', dialog), 'click', close);
  on($('.lightbox__nav--prev', dialog), 'click', () => show(current - 1));
  on($('.lightbox__nav--next', dialog), 'click', () => show(current + 1));
  on(dialog, 'click', (e) => {
    // clic en el fondo (fuera del diagrama) cierra
    if (e.target === dialog || e.target.classList.contains('lightbox__stage')) close();
  });
  on(dialog, 'keydown', (e) => {
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });
  // Escape dispara "cancel" (inmediato) y luego "close": ambos limpian
  on(dialog, 'cancel', cleanup);
  on(dialog, 'close', cleanup);
}

/**
 * Contenido ampliado:
 *  - imágenes (<img>): sólo la imagen, a máxima resolución.
 *  - diagramas HTML: una copia del diagrama sin ids ni elementos enfocables.
 */
function buildContent(el) {
  const img = $('.illustration__img', el);
  if (img) {
    return createEl('img', {
      class: 'lightbox__img',
      src: img.currentSrc || img.src,
      alt: img.alt,
      draggable: 'false',
    });
  }

  const clone = el.cloneNode(true);
  clone.classList.add('is-visible', 'lightbox__diagram');
  clone.removeAttribute('tabindex');
  clone.removeAttribute('role');
  [clone, ...$$('[id], [aria-labelledby], [tabindex]', clone)].forEach((n) => {
    n.removeAttribute('id');
    n.removeAttribute('aria-labelledby');
    if (n !== clone && n.hasAttribute('tabindex')) n.setAttribute('tabindex', '-1');
  });
  $$('.diagram__caption, .lightbox-hint', clone).forEach((n) => n.remove());
  return clone;
}

function show(index) {
  current = (index + items.length) % items.length;
  const el = items[current];
  $('.lightbox__body', dialog).replaceChildren(buildContent(el));
  $('.lightbox__title', dialog).textContent = titleOf(el);
  $('.lightbox__caption', dialog).textContent = $('figcaption', el)?.textContent.trim() || '';
  $('.lightbox__counter', dialog).textContent = items.length > 1 ? `${current + 1} / ${items.length}` : '';
  $$('.lightbox__nav', dialog).forEach((b) => (b.hidden = items.length < 2));
}

/** Restaura la página (scroll y foco). Se puede llamar más de una vez. */
function cleanup() {
  document.documentElement.classList.remove('is-locked');
  if (lastTrigger) {
    lastTrigger.focus({ preventScroll: true });
    lastTrigger = null;
  }
}

function close() {
  if (dialog?.open) dialog.close();
  cleanup();
}

function open(index, trigger) {
  if (!dialog) buildDialog();
  lastTrigger = trigger;
  show(index);
  document.documentElement.classList.add('is-locked');
  dialog.showModal();
  $('.lightbox__close', dialog).focus();
}

export function initLightbox() {
  items = $$('[data-lightbox]');
  if (!items.length || typeof HTMLDialogElement === 'undefined') return;

  items.forEach((el, i) => {
    // accesible con teclado: se puede enfocar y abrir con Enter / Espacio
    el.tabIndex = 0;
    el.setAttribute('aria-haspopup', 'dialog');
    const hint = createEl('span', { class: 'sr-only lightbox-hint', text: ' (Enter para ver en pantalla completa)' });
    ($('figcaption', el) || el).append(hint);

    on(el, 'click', (e) => {
      if (e.target.closest('a, button')) return;
      open(i, el);
    });
    on(el, 'keydown', (e) => {
      if (e.target !== el) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open(i, el);
      }
    });
  });
}
