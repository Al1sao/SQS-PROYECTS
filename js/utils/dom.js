/**
 * Utilidades mínimas para trabajar con el DOM.
 */

/** Devuelve el primer elemento que coincide con el selector. */
export const $ = (selector, scope = document) => scope.querySelector(selector);

/** Devuelve un array con todos los elementos que coinciden. */
export const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

/** Atajo para addEventListener que devuelve una función para removerlo. */
export const on = (el, event, handler, options) => {
  el.addEventListener(event, handler, options);
  return () => el.removeEventListener(event, handler, options);
};

/** Crea un elemento con atributos e hijos. */
export const createEl = (tag, attrs = {}, children = []) => {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === 'class') el.className = value;
    else if (key === 'text') el.textContent = value;
    else el.setAttribute(key, value);
  });
  [].concat(children).forEach((child) => el.append(child));
  return el;
};

/** Escapa texto antes de insertarlo como HTML. */
export const escapeHTML = (str) =>
  String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
