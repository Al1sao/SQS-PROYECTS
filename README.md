# S.Q.S — Scrum Quality Service

Portal educativo sobre Gestión de Calidad de Software, maquetado a partir del diseño de Canva (`Scrum-4.pdf`).

## Abrir el sitio

El sitio ya está compilado: se puede abrir `index.html` directamente en el navegador.
Para trabajar con un servidor local:

```bash
npm install
npm run serve      # http://localhost:5500
```

## Estructura

```
scrum/
├── index.html, fundamentos.html, ...   ← páginas GENERADAS (no editar a mano)
├── src/
│   ├── partials/   head, header (nav + desplegable), hero, footer
│   └── pages/      contenido de cada página (+ bloque de config JSON)
├── scss/
│   ├── abstracts/  _variables (colores, fuentes, medidas), _mixins
│   ├── base/       _fonts, _reset, _base
│   ├── layout/     _header, _footer, _container
│   ├── components/ _hero, _button, _feature-card, _section-card, _concept,
│   │               _metric-card, _tabs, _tool-card, _resource-card, _team-card,
│   │               _form, _diagram, _illustration, _lightbox, _method-card,
│   │               _comparator
│   ├── pages/      ajustes por página
│   └── main.scss   punto de entrada
├── js/
│   ├── main.js     punto de entrada (inicializa cada módulo)
│   ├── modules/    navbar, reveal, tabs, contactForm, comparator, kanban,
│   │               toolsFilter, safeLinks, profileCards, lightbox
│   ├── data/       models.js (datos del comparador)
│   └── utils/      dom.js, validators.js
├── assets/         img/ (íconos WebP), img/tools/ (logos), img/diagrams/ (SVG), docs/ (guía PDF),
│                   fonts/ (Inter, Open Sauce One)
├── docs/           HISTORIAS.md (historia → implementación) y PLAN-DE-PRUEBAS.md (resultados)
├── tests/          pruebas funcionales por historia (tests/specs/us-XX.js)
├── dist/           css/main.css y js/bundle.js compilados
└── scripts/build-html.js
```

## Scripts

| Comando              | Qué hace                                             |
| -------------------- | ---------------------------------------------------- |
| `npm run build`      | Genera HTML + compila SCSS + empaqueta JS + corre los tests |
| `npm test`           | Validador de HTML + chequeos de QA                    |
| `npm run validate`   | Valida el HTML de todas las páginas (html-validate)   |
| `npm run test:e2e`   | 35 pruebas funcionales en un navegador sin ventana (Chrome/Brave/Edge) |
| `npm run test:all`   | Todo lo anterior                                       |
| `npm run qa`         | Chequea links, anclas, `alt`, `rel` seguros, `<h1>` y labels |
| `npm run build:html` | Une `src/partials` + `src/pages` → páginas en la raíz |
| `npm run build:css`  | `scss/main.scss` → `dist/css/main.css`                |
| `npm run build:js`   | `js/main.js` → `dist/js/bundle.js` (esbuild)          |
| `npm run watch:css` / `watch:js` | Recompila al guardar                     |

> El JS se empaqueta en un solo archivo para que funcione también abriendo el HTML con doble clic (los módulos ES nativos no cargan desde `file://`).

## Páginas

| Página               | Archivo             |
| -------------------- | ------------------- |
| Inicio               | `index.html`        |
| Gestión de calidad   | `fundamentos.html`  |
| Procesos (SDLC, Cascada, V) | `procesos.html` |
| Metodologías ágiles  | `metodologias.html` |
| Recursos             | `recursos.html`     |
| Comparador           | `comparador.html`   |
| Sobre nosotros       | `nosotros.html`     |
| Contacto             | `contacto.html`     |
