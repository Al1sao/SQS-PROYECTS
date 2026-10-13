/**
 * Mini framework de pruebas en el navegador.
 * Cada prueba carga una página del sitio en un <iframe> con el ancho pedido
 * (así se prueban Desktop / Tablet / Mobile) y ejecuta aserciones.
 */

export const VIEWPORTS = { mobile: 375, tablet: 768, desktop: 1280 };

export const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** Espera hasta que fn() devuelva algo verdadero (o falla por timeout). */
export async function waitFor(fn, timeout = 3000, msg = 'condición') {
  const start = performance.now();
  while (performance.now() - start < timeout) {
    const value = fn();
    if (value) return value;
    await wait(40);
  }
  throw new Error(`Tiempo agotado esperando: ${msg}`);
}

export class AssertionError extends Error {}

/** Contexto que recibe cada prueba. */
export function createContext(sandbox) {
  const frames = [];

  return {
    wait,
    waitFor,

    assert(condition, message) {
      if (!condition) throw new AssertionError(message);
    },

    equal(actual, expected, message) {
      if (actual !== expected) throw new AssertionError(`${message} (esperado: ${expected}, obtenido: ${actual})`);
    },

    /** Carga una página y devuelve { win, doc, $, $$ }. */
    async page(path, width = VIEWPORTS.desktop, height = 900) {
      const frame = document.createElement('iframe');
      // visible (casi transparente) para que el navegador no pause su renderizado
      frame.style.cssText = `width:${width}px;height:${height}px;border:0;position:fixed;left:0;top:0;opacity:0.01;pointer-events:none;z-index:-1`;
      sandbox.append(frame);
      frames.push(frame);

      const t0 = performance.now();
      await new Promise((resolve, reject) => {
        frame.onload = resolve;
        frame.onerror = reject;
        frame.src = `../${path}${path.includes('?') ? '&' : '?'}test=${Date.now()}`;
      });
      const loadMs = performance.now() - t0;
      const win = frame.contentWindow;
      const doc = frame.contentDocument;
      // muestra el contenido animado sin esperar al scroll
      doc.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
      // carga inmediata de imágenes diferidas (loading="lazy")
      doc.querySelectorAll('img[loading="lazy"]').forEach((img) => (img.loading = 'eager'));
      await wait(150);

      return {
        win,
        doc,
        loadMs,
        $: (sel) => doc.querySelector(sel),
        $$: (sel) => [...doc.querySelectorAll(sel)],
        /** Escribe en un campo disparando el evento input. */
        type(el, value) {
          el.value = value;
          el.dispatchEvent(new win.Event('input', { bubbles: true }));
        },
        /** Termina al instante las animaciones/transiciones en curso. */
        settle(el = doc.documentElement) {
          el.getAnimations({ subtree: true }).forEach((a) => {
            try {
              a.finish();
            } catch {
              /* animaciones infinitas (ej. el logo flotante) no se pueden terminar */
            }
          });
        },
        key(el, key) {
          el.dispatchEvent(new win.KeyboardEvent('keydown', { key, bubbles: true }));
        },
      };
    },

    cleanup() {
      frames.forEach((f) => f.remove());
      frames.length = 0;
    },
  };
}
