# Historias de usuario implementadas

Historias elegidas del Product Backlog: **US-01, US-02, US-07, US-09, US-14, US-16 y US-17**.
Cada requerimiento del PDF ([Diseño/CSS], [JS] y [QA/Tester]) está implementado y tiene pruebas automáticas.

## Cómo correr las pruebas

| Comando | Qué prueba |
| --- | --- |
| `npm test` | Validador de HTML + chequeos estáticos (`scripts/qa-check.js`): enlaces, anclas, `alt`, `rel`, `<h1>`, labels |
| `npm run test:e2e` | Las **35 pruebas funcionales** de `tests/` en un navegador sin ventana (Chrome / Chromium / Brave / Edge) |
| `npm run serve` → abrir `http://localhost:5500/tests/` | Las mismas pruebas, viendo los resultados en pantalla |

Las pruebas funcionales están en `tests/specs/us-XX.js` (una por historia). Ver también el [plan de pruebas](PLAN-DE-PRUEBAS.md).

---

## US-01 · Página de Inicio e Introducción General — `index.html`

| Requerimiento | Implementación | Prueba |
| --- | --- | --- |
| [Diseño/CSS] Hero responsive (Flexbox/Grid), paleta coherente, cards de navegación | `_hero.scss` (Grid), `_feature-card.scss` (Grid 5 → 3 → 2 → 1), sección `.intro` con la breve introducción, colores en `abstracts/_variables.scss` | `us-01`: hero + intro + 5 cards; columnas por resolución |
| [JS] Menú hamburguesa y resaltado de la sección activa | `js/modules/navbar.js` | `us-01`: abre/cierra/Escape; link activo + `aria-current` en cada página |
| [QA] Enlaces internos sin URLs rotas; renderizado Desktop / Tablet / Mobile | `qa-check.js` + `us-01` | `us-01`: todos los enlaces y anclas responden; sin scroll horizontal en 1280 / 768 / 375 px en las 8 páginas |

## US-02 · Fundamentos de Calidad — `fundamentos.html`

| Requerimiento | Implementación | Prueba |
| --- | --- | --- |
| [Diseño/CSS] Texto estructurado, tipografía legible, listas, resaltado de conceptos e ISO | Tarjetas `concept` (Calidad, QA, QC) con `<mark>`; características ISO como lista resaltada (`_concept.scss`) | `us-02`: 3 conceptos, ≥3 resaltados, 6 + 8 características ISO |
| [JS] Pestañas ISO 9126 vs ISO 25000 | `js/modules/tabs.js` (patrón accesible WAI-ARIA) | `us-02`: clic y flechas ← → del teclado |
| [QA] Ortografía, jerarquía `<h1>`-`<h3>`, legibilidad | Revisión ortográfica de todo el sitio | `us-02`: un `<h1>`, sin saltos; texto ≥ 15 px en mobile y escritorio |

## US-07 · Ilustraciones de Modelos Tradicionales — `procesos.html`

| Requerimiento | Implementación | Prueba |
| --- | --- | --- |
| [Diseño/CSS] Formatos optimizados (SVG/WebP), contenedores adaptables con pie de foto | Diagramas en `<figure>` + `<figcaption>`; íconos en **WebP** (−37 % de peso), diagrama iterativo en **SVG** | `us-07`: sólo SVG/WebP; pie de foto; no se desbordan en 1280 y 375 px |
| [JS] Lightbox en pantalla completa al hacer clic sobre cualquier diagrama | `js/modules/lightbox.js`: clic o Enter abre; ajustado a la pantalla, **sin lupa ni arrastre**; Esc, X o clic en el fondo cierran | `us-07`: clic en los 3 diagramas, teclado, foco devuelto, scroll restaurado |
| [QA] `alt` obligatorio (WCAG) y tiempos de carga rápidos | `alt` descriptivo en todas las imágenes; `loading="lazy"` | `us-07`: alt ≥ 10 caracteres; página < 1,5 s; imágenes < 400 KB |

## US-09 · Ilustraciones de Metodologías Ágiles — `metodologias.html`

| Requerimiento | Implementación | Prueba |
| --- | --- | --- |
| [Diseño/CSS] Esquemas: ciclo del Sprint, flujo Kanban, bucle de XP | `assets/img/diagrams/sprint-scrum.svg`, `flujo-kanban.svg`, `bucle-xp.svg` | `us-09`: los 3 cargan, con pie de foto y alt |
| [JS] Reutilizar el Lightbox / galería modal | El mismo `lightbox.js` (galería con anterior/siguiente y contador) | `us-09`: navegación 1/3 → 2/3 → 3/3 |
| [QA] Escalabilidad en Retina / Full HD | Gráficos vectoriales (SVG con `viewBox`); íconos WebP a ≥ 2x | `us-09`: a 1920 × 1080, SVG con viewBox e íconos ≥ 2x |

## US-14 · Enlaces de Interés — `recursos.html`

| Requerimiento | Implementación | Prueba |
| --- | --- | --- |
| [Diseño/CSS] Tarjetas con ícono distinto por tipo (Web, PDF, Libro, Organización) | `_resource-card.scss`; el recurso PDF descarga una guía real (`assets/docs/guia-iso-25000.pdf`) | `us-14`: 4 tipos, 4 íconos distintos; el PDF existe y es válido |
| [JS] Apertura segura de enlaces | `js/modules/safeLinks.js` | `us-14`: el módulo corrige un enlace externo agregado sin `rel` |
| [QA] `target="_blank"` y `rel="noopener noreferrer"` | En el HTML de todos los enlaces externos | `us-14` + `qa-check.js` |

## US-16 · Sobre Nosotros — `nosotros.html`

| Requerimiento | Implementación | Prueba |
| --- | --- | --- |
| [Diseño/CSS] Tarjetas de perfil por rol con motivación e institución | `_team-card.scss` | `us-16`: 4 roles, cada uno con nombre, motivación e institución |
| [JS] Efectos al pasar el cursor | `js/modules/profileCards.js`: inclinación 3D + se revela la motivación (también con teclado; en táctil, botón “Ver motivación”) | `us-16`: mouseenter/mouseleave y foco |
| [QA] Alineación de elementos | Grilla de 2 columnas (1 en mobile) | `us-16`: filas, columnas y anchos alineados |

## US-17 · Formulario de Contacto — `contacto.html`

| Requerimiento | Implementación | Prueba |
| --- | --- | --- |
| [Diseño/CSS] `<label>` vinculado a cada campo | `for`/`id` en input, select y textarea | `us-17` + `qa-check.js` |
| [JS] Validación de obligatorios y formato de correo; confirmación al presionar “Enviar” | `js/modules/contactForm.js` + `js/utils/validators.js` | `us-17`: confirmación “¡Gracias…!” y limpieza del formulario |
| [QA] Pruebas de frontera: vacíos, correos inválidos, caracteres especiales | Reglas de nombre, correo, largo máximo (`maxlength` 60 / 100 / 500) y `< > { }` | `us-17`: 6 correos inválidos, nombres/mensajes con caracteres especiales, largos máximos |

---

## Extra: Herramientas de calidad con filtros — `fundamentos.html#herramientas`

Tarjetas con el logo oficial de cada herramienta, descripción y enlace “Ver más”, con filtros **Ver todas · Bug Trackers · Testing · Calidad de código** (`js/modules/toolsFilter.js`).
Logos de [Devicon](https://devicon.dev) (MIT) y [Simple Icons](https://simpleicons.org) (CC0).
