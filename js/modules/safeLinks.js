/**
 * Apertura segura de enlaces externos (US-14).
 * Todo link a otro dominio se abre en una pestaña nueva con
 * rel="noopener noreferrer" (evita tabnabbing) y se anuncia a
 * lectores de pantalla que abre una pestaña nueva.
 */
import { $$ } from '../utils/dom.js';

const isExternal = (a) => {
  try {
    const url = new URL(a.href, a.baseURI);
    return /^https?:$/.test(url.protocol) && url.host !== a.ownerDocument.location.host;
  } catch {
    return false;
  }
};

/** @param {Document|Element} root zona a revisar (por defecto, toda la página) */
export function initSafeLinks(root = document) {
  $$('a[href]', root)
    .filter(isExternal)
    .forEach((a) => {
      a.target = '_blank';
      const rel = new Set((a.rel || '').split(/\s+/).filter(Boolean));
      rel.add('noopener');
      rel.add('noreferrer');
      a.rel = [...rel].join(' ');

      if (!a.querySelector('.sr-only')) {
        const note = a.ownerDocument.createElement('span');
        note.className = 'sr-only';
        note.textContent = ' (se abre en una pestaña nueva)';
        a.append(note);
      }
    });
}
