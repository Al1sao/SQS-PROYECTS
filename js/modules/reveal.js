/**
 * Animación de aparición al hacer scroll usando IntersectionObserver.
 * Cualquier elemento con la clase .reveal (o [data-reveal]) se anima.
 */
import { $$ } from '../utils/dom.js';

export function initReveal() {
  const items = $$('.reveal, [data-reveal]');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  items.forEach((el, i) => {
    // pequeño escalonado para elementos dentro de una misma grilla
    el.style.transitionDelay = `${(i % 5) * 70}ms`;
    observer.observe(el);
  });
}
