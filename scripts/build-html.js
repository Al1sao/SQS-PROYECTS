/**
 * Generador de HTML estático muy simple.
 *
 * Toma cada archivo de src/pages/*.html, lee su bloque de configuración
 * (JSON entre líneas "---"), reemplaza los parciales {{> nombre}} por
 * src/partials/nombre.html y las variables {{clave}} por sus valores.
 * El resultado se escribe en la raíz del proyecto (index.html, etc.).
 *
 * Uso: npm run build:html
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PAGES = path.join(ROOT, 'src/pages');
const PARTIALS = path.join(ROOT, 'src/partials');

const DEFAULTS = {
  description: 'Portal educativo sobre Gestión de Calidad de Software, SQA y metodologías ágiles.',
  footerHref: 'nosotros.html',
  footerLabel: 'Sobre Nosotros',
  // evita que el navegador use CSS/JS viejos de la caché
  version: Date.now().toString(36),
};

const readPartial = (name) => fs.readFileSync(path.join(PARTIALS, `${name}.html`), 'utf8');

function parse(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!match) return { data: {}, body: raw };
  return { data: JSON.parse(match[1]), body: raw.slice(match[0].length) };
}

function render(template, data, depth = 0) {
  if (depth > 5) throw new Error('Demasiados parciales anidados');
  const withPartials = template.replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (_, name) =>
    render(readPartial(name), data, depth + 1)
  );
  return withPartials.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => (key in data ? data[key] : ''));
}

const layout = (body) => `{{> head}}
<body class="{{bodyClass}}" data-page="{{page}}">
{{> header}}

<main id="contenido">
  <div class="container">
${body.replace(/^/gm, '    ').trimEnd()}
  </div>
</main>

{{> footer}}
</body>
</html>
`;

fs.readdirSync(PAGES)
  .filter((f) => f.endsWith('.html'))
  .forEach((file) => {
    const { data, body } = parse(path.join(PAGES, file));
    const html = render(layout(body), { ...DEFAULTS, ...data });
    // sin espacios al final de línea (los marca el validador de HTML)
    fs.writeFileSync(path.join(ROOT, file), html.replace(/[ \t]+$/gm, ''));
    console.log(`✔ ${file}`);
  });
