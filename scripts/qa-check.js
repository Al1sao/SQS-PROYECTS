/**
 * Chequeos automáticos de QA sobre las páginas generadas.
 *
 *  - US-01: todos los enlaces internos apuntan a páginas y anclas (#id) que existen.
 *  - US-07 / US-09: toda <img> tiene un atributo alt descriptivo (no vacío).
 *  - US-14: todo enlace externo tiene target="_blank" y rel="noopener noreferrer".
 *  - US-02: cada página tiene un único <h1> y no saltea niveles de encabezado.
 *  - US-17: cada campo del formulario tiene un <label for> vinculado.
 *
 * Uso: npm run qa
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const pages = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'));
const html = Object.fromEntries(pages.map((p) => [p, fs.readFileSync(path.join(ROOT, p), 'utf8')]));

const errors = [];
const fail = (page, msg) => errors.push(`✖ ${page}: ${msg}`);
let checks = 0;

const idsOf = (src) => new Set([...src.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
const attr = (tag, name) => (tag.match(new RegExp(`\\s${name}="([^"]*)"`)) || [])[1];

for (const [page, src] of Object.entries(html)) {
  // --- Enlaces ---
  for (const [tag] of src.matchAll(/<a\s[^>]*>/g)) {
    const href = attr(tag, 'href');
    if (!href) continue;
    checks++;

    // cualquier link que abra pestaña nueva debe protegerse (tabnabbing)
    if (attr(tag, 'target') === '_blank') {
      const rel = (attr(tag, 'rel') || '').split(/\s+/);
      if (!rel.includes('noopener') || !rel.includes('noreferrer')) fail(page, `target="_blank" sin rel="noopener noreferrer": ${href}`);
    }

    if (/^https?:\/\//.test(href)) {
      const rel = (attr(tag, 'rel') || '').split(/\s+/);
      if (attr(tag, 'target') !== '_blank') fail(page, `enlace externo sin target="_blank": ${href}`);
      if (!rel.includes('noopener') || !rel.includes('noreferrer')) fail(page, `enlace externo sin rel="noopener noreferrer": ${href}`);
      continue;
    }
    if (/^(mailto|tel):/.test(href)) continue;

    const [file, hash] = href.split('#');
    const target = file || page;
    // archivos que no son páginas (PDF, imágenes...): deben existir en disco
    if (!target.endsWith('.html')) {
      if (!fs.existsSync(path.join(ROOT, target))) fail(page, `archivo inexistente: ${href}`);
      continue;
    }
    if (!html[target]) {
      fail(page, `enlace roto a "${href}" (no existe ${target})`);
    } else if (hash && !idsOf(html[target]).has(hash)) {
      fail(page, `ancla inexistente "${href}" (falta id="${hash}" en ${target})`);
    }
  }

  // --- Imágenes con alt ---
  for (const [tag] of src.matchAll(/<img\s[^>]*>/g)) {
    checks++;
    const alt = attr(tag, 'alt');
    if (alt === undefined) fail(page, `imagen sin atributo alt: ${attr(tag, 'src')}`);
    else if (alt.trim().length < 5) fail(page, `imagen con alt vacío o no descriptivo: ${attr(tag, 'src')}`);
  }
  // Diagramas: deben tener alt descriptivo (no vacío)
  for (const [tag] of src.matchAll(/<img\s[^>]*assets\/img\/diagrams\/[^>]*>/g)) {
    checks++;
    if ((attr(tag, 'alt') || '').length < 20) fail(page, `diagrama sin alt descriptivo: ${attr(tag, 'src')}`);
  }

  // --- Jerarquía de encabezados ---
  const levels = [...src.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
  checks++;
  if (levels.filter((l) => l === 1).length !== 1) fail(page, `debe tener exactamente un <h1> (tiene ${levels.filter((l) => l === 1).length})`);
  levels.forEach((l, i) => {
    if (i > 0 && l > levels[i - 1] + 1) fail(page, `salto de encabezado: <h${levels[i - 1]}> → <h${l}>`);
  });

  // --- Labels de formulario ---
  const ids = idsOf(src);
  for (const [tag] of src.matchAll(/<(input|select|textarea)\s[^>]*>/g)) {
    checks++;
    const id = attr(tag, 'id');
    if (!id || !new RegExp(`<label[^>]*for="${id}"`).test(src)) fail(page, `campo sin <label for> vinculado: ${tag.slice(0, 60)}`);
    else if (!ids.has(id)) fail(page, `id duplicado o inexistente: ${id}`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  console.error(`\n${errors.length} problema(s) encontrados en ${checks} chequeos.`);
  process.exit(1);
}
console.log(`✔ QA OK: ${checks} chequeos en ${pages.length} páginas sin errores.`);
