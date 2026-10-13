# Plan y resultado de pruebas

**Fecha de ejecución:** 13/10/2026 · **Versión:** build actual · **Resultado:** ✅ 35/35 pruebas funcionales + validador HTML + 238 chequeos estáticos

Cada caso está automatizado en `tests/specs/us-XX.js`. Para repetirlos:

```bash
npm run test:all
```

| ID | Caso de prueba | Procedimiento | Resultado esperado | Resultado obtenido | ¿Pasa? |
| --- | --- | --- | --- | --- | --- |
| US01-1 | Portada completa | Abrir `index.html` | Hero, breve introducción y 5 tarjetas con acceso directo | Hero, introducción y 5 tarjetas con link a su sección | Sí |
| US01-2 | Layout responsive | Ver el inicio a 1280, 1024, 700 y 375 px | Tarjetas en 5 → 3 → 2 → 1 columnas (CSS Grid) | 5, 3, 2 y 1 columnas | Sí |
| US01-3 | Menú hamburguesa | En 375 px tocar ☰, luego Escape; ver en 1280 px | Abre/cierra, `aria-expanded` cambia; en escritorio no aparece | Funciona; oculto en escritorio | Sí |
| US01-4 | Sección activa | Recorrer las 5 secciones del menú | Un solo link resaltado con `aria-current="page"` | Correcto en las 5 | Sí |
| US01-5 | Enlaces internos | Seguir todos los links y anclas de las 8 páginas | Ningún 404 ni ancla inexistente | 0 enlaces rotos | Sí |
| US01-6 | Resoluciones | Las 8 páginas en Desktop (1280), Tablet (768) y Mobile (375) | Sin scroll horizontal | 24/24 sin desborde | Sí |
| US02-1 | Jerarquía de encabezados | Inspeccionar `<h1>`–`<h6>` de Fundamentos | Un `<h1>` y sin saltos de nivel | Correcto | Sí |
| US02-2 | Resaltado de conceptos | Ver Conceptos y Estándares ISO | Calidad, QA y QC resaltados; 6 y 8 características ISO | Correcto | Sí |
| US02-3 | Pestañas ISO (mouse) | Clic en “ISO/IEC 25000” | Cambia el panel sin recargar | Correcto | Sí |
| US02-4 | Pestañas ISO (teclado) | Flechas ← → sobre las pestañas | Cambia de pestaña | Correcto | Sí |
| US02-5 | Legibilidad y ortografía | Medir textos en 375 y 1280 px; revisión ortográfica | Texto ≥ 15 px; sin faltas | ≥ 15 px; ortografía corregida en todo el sitio | Sí |
| US07-1 | Contenedores con pie de foto | Ver los 3 diagramas en 1280 y 375 px | `<figure>` + `<figcaption>`, sin desbordar | Correcto | Sí |
| US07-2 | Atributo `alt` (WCAG) | Inspeccionar todas las `<img>` de Modelos | Todas con `alt` descriptivo | 100 % con `alt` descriptivo | Sí |
| US07-3 | Formatos optimizados | Revisar el formato de las imágenes | Sólo SVG o WebP | SVG + WebP | Sí |
| US07-4 | Lightbox (clic) | Clic sobre cada diagrama | Se abre en pantalla completa; la X lo cierra | Correcto en los 3 | Sí |
| US07-5 | Lightbox (teclado) | Tab hasta un diagrama, Enter, →, Escape | Abre, navega 2/3 → 3/3, cierra y devuelve el foco y el scroll | Correcto | Sí |
| US07-6 | Sin arrastre | Intentar arrastrar imágenes | No se pueden arrastrar | `draggable="false"` | Sí |
| US07-7 | Tiempos de carga | Medir carga de `procesos.html` y peso de imágenes | < 1,5 s y < 400 KB | Dentro del límite | Sí |
| US09-1 | Esquemas ágiles | Ver Metodologías | Ciclo del Sprint, flujo Kanban y bucle de XP con pie y `alt` | Los 3 presentes | Sí |
| US09-2 | Reutilización del Lightbox | Abrir un gráfico y usar ‹ › | Galería 1/3 → 2/3 → 3/3 | Correcto | Sí |
| US09-3 | Retina / Full HD | Ver a 1920 × 1080; revisar formato | SVG con `viewBox`; íconos ≥ 2x | Correcto | Sí |
| US14-1 | Íconos por tipo | Ver Recursos | 4 tipos (Web, PDF, Libro, Organización) con íconos distintos | Correcto | Sí |
| US14-2 | Seguridad en enlaces externos | Inspeccionar enlaces externos | `target="_blank"` y `rel="noopener noreferrer"` en todos | 16/16 correctos | Sí |
| US14-3 | Apertura segura por JS | Agregar un link externo sin `rel` | El módulo JS lo corrige | Correcto | Sí |
| US14-4 | Recurso PDF | Clic en “Descargar PDF” | Descarga un PDF real | PDF válido de 3 páginas | Sí |
| US16-1 | Tarjetas de perfil | Ver Sobre Nosotros | 4 roles con nombre, motivación e institución | Correcto | Sí |
| US16-2 | Hover | Pasar el cursor por un perfil | Se destaca y muestra la motivación; vuelve al salir | Correcto | Sí |
| US16-3 | Hover con teclado | Tab hasta un perfil | Mismo efecto que el hover | Correcto | Sí |
| US16-4 | Alineación | Ver en 1280 y 375 px | 2 columnas alineadas / 1 columna | Correcto | Sí |
| US17-1 | Labels | Inspeccionar el formulario | Cada campo con `<label for>` | 4/4 | Sí |
| US17-2 | Campos vacíos | Presionar “Enviar” sin completar | Error en Nombre, Correo y Tipo | Correcto | Sí |
| US17-3 | Correos inválidos | Probar `pedro`, `pedro@`, `pedro@gmail`, `@gmail.com`, con espacios | Error de formato y no se envía | 6/6 rechazados | Sí |
| US17-4 | Caracteres especiales | Nombres `<script>`, `Pedro123`, `{{nombre}}`; mensajes con `< > { }` | Mensajes de error; nunca se inserta HTML | Correcto; `José Ñúñez-Peña` aceptado | Sí |
| US17-5 | Largo máximo | Escribir más de 60 / 100 / 500 caracteres | El campo corta y el contador marca 500/500 | Correcto | Sí |
| US17-6 | Confirmación | Completar bien y presionar “Enviar” | Mensaje “¡Gracias…!” y formulario limpio | Correcto | Sí |
