(() => {
  // js/utils/dom.js
  var $ = (selector, scope = document) => scope.querySelector(selector);
  var $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  var on = (el, event, handler, options) => {
    el.addEventListener(event, handler, options);
    return () => el.removeEventListener(event, handler, options);
  };
  var createEl = (tag, attrs = {}, children = []) => {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === "class") el.className = value;
      else if (key === "text") el.textContent = value;
      else el.setAttribute(key, value);
    });
    [].concat(children).forEach((child) => el.append(child));
    return el;
  };
  var escapeHTML = (str) => String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  // js/modules/navbar.js
  var MOBILE_QUERY = window.matchMedia("(max-width: 1023.98px)");
  function markActiveLink(nav) {
    const current2 = document.body.dataset.page;
    $$(".main-nav__link", nav).forEach((link) => {
      const isActive = link.dataset.page === current2;
      link.classList.toggle("is-active", isActive);
      if (isActive) link.setAttribute("aria-current", "page");
    });
  }
  function setupToggle(toggle, nav) {
    const close2 = () => {
      toggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
    };
    on(toggle, "click", () => {
      const open2 = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(open2));
      nav.classList.toggle("is-open", open2);
    });
    on(document, "keydown", (e) => e.key === "Escape" && close2());
    on(MOBILE_QUERY, "change", (e) => !e.matches && close2());
    return close2;
  }
  function setupDropdowns(nav) {
    $$(".has-dropdown", nav).forEach((item) => {
      const btn = $(":scope > .submenu-toggle", item);
      if (!btn) return;
      on(btn, "click", (e) => {
        e.preventDefault();
        const open2 = !item.classList.contains("is-open");
        item.classList.toggle("is-open", open2);
        btn.setAttribute("aria-expanded", String(open2));
      });
    });
    on(nav, "keydown", (e) => {
      var _a;
      if (e.key !== "Escape") return;
      $$(".has-dropdown.is-open", nav).forEach((el) => el.classList.remove("is-open"));
      (_a = document.activeElement) == null ? void 0 : _a.blur();
    });
  }
  function initNavbar() {
    const nav = $("#main-nav");
    const toggle = $(".nav-toggle");
    if (!nav) return;
    markActiveLink(nav);
    setupDropdowns(nav);
    if (toggle) {
      const close2 = setupToggle(toggle, nav);
      $$("a", nav).forEach((a) => on(a, "click", () => MOBILE_QUERY.matches && close2()));
    }
  }

  // js/modules/reveal.js
  function initReveal() {
    const items2 = $$(".reveal, [data-reveal]");
    if (!items2.length) return;
    if (!("IntersectionObserver" in window)) {
      items2.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    items2.forEach((el, i) => {
      el.style.transitionDelay = `${i % 5 * 70}ms`;
      observer.observe(el);
    });
  }

  // js/modules/tabs.js
  function activate(tabs, tab) {
    tabs.forEach((t) => {
      const selected = t === tab;
      t.setAttribute("aria-selected", String(selected));
      t.tabIndex = selected ? 0 : -1;
      const panel = document.getElementById(t.getAttribute("aria-controls"));
      if (panel) panel.hidden = !selected;
    });
  }
  function setupTabs(root) {
    const tabs = $$('[role="tab"]', root);
    if (!tabs.length) return;
    tabs.forEach((tab, index) => {
      on(tab, "click", () => activate(tabs, tab));
      on(tab, "keydown", (e) => {
        const keys = { ArrowRight: 1, ArrowLeft: -1 };
        if (!(e.key in keys)) return;
        const next = tabs[(index + keys[e.key] + tabs.length) % tabs.length];
        next.focus();
        activate(tabs, next);
      });
    });
    activate(tabs, $('[aria-selected="true"]', root) || tabs[0]);
  }
  function initTabs() {
    $$("[data-tabs]").forEach(setupTabs);
  }

  // js/utils/validators.js
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var NAME_RE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;
  var DANGEROUS_RE = /[<>{}]/;
  var required = (msg = "Este campo es obligatorio.") => (value) => value.trim() ? "" : msg;
  var minLength = (n, msg) => (value) => value.trim().length >= n ? "" : msg || `Debe tener al menos ${n} caracteres.`;
  var maxLength = (n, msg) => (value) => value.length <= n ? "" : msg || `No puede superar los ${n} caracteres.`;
  var email = (msg = "Ingresa un correo electr\xF3nico v\xE1lido (ej: nombre@dominio.com).") => (value) => EMAIL_RE.test(value.trim()) ? "" : msg;
  var personName = (msg = "El nombre s\xF3lo puede contener letras y espacios.") => (value) => NAME_RE.test(value.trim()) ? "" : msg;
  var safeText = (msg = "El texto no puede contener los caracteres < > { }.") => (value) => DANGEROUS_RE.test(value) ? msg : "";
  var validate = (value, rules = []) => {
    for (const rule of rules) {
      const error = rule(value);
      if (error) return error;
    }
    return "";
  };

  // js/modules/contactForm.js
  var MAX_MESSAGE = 500;
  var RULES = {
    nombre: [
      required("Ingresa tu nombre completo."),
      minLength(3, "El nombre es demasiado corto."),
      maxLength(60, "El nombre no puede superar los 60 caracteres."),
      personName()
    ],
    email: [required("Ingresa tu correo electr\xF3nico."), maxLength(100), email()],
    tipo: [required("Selecciona un tipo de consulta.")],
    mensaje: [maxLength(MAX_MESSAGE), safeText()]
  };
  function showError(field, message) {
    const wrapper = field.closest(".field");
    const errorEl = $(".field__error", wrapper);
    wrapper.classList.toggle("has-error", Boolean(message));
    field.setAttribute("aria-invalid", String(Boolean(message)));
    if (errorEl) errorEl.textContent = message;
  }
  function checkField(field) {
    const error = validate(field.value, RULES[field.name] || []);
    showError(field, error);
    return !error;
  }
  function setupCounter(textarea) {
    const counter = $(".field__counter", textarea.closest(".field"));
    if (!counter) return () => {
    };
    const update = () => {
      const n = textarea.value.length;
      counter.textContent = `${n} / ${MAX_MESSAGE}`;
      counter.classList.toggle("is-limit", n >= MAX_MESSAGE);
    };
    on(textarea, "input", update);
    update();
    return update;
  }
  function updateSelectPlaceholder(select) {
    select.classList.toggle("is-placeholder", !select.value);
  }
  function initContactForm() {
    const form = $("#contact-form");
    if (!form) return;
    const fields = $$(".field__input", form);
    const status = $(".form-status", form);
    const submit = $('[type="submit"]', form);
    const select = $("select", form);
    const updateCounter = form.mensaje ? setupCounter(form.mensaje) : () => {
    };
    if (select) {
      updateSelectPlaceholder(select);
      on(select, "change", () => updateSelectPlaceholder(select));
    }
    on(form, "input", () => {
      status.textContent = "";
      status.className = "form-status";
    });
    fields.forEach((field) => {
      on(field, "blur", () => checkField(field));
      on(field, "input", () => field.closest(".field").classList.contains("has-error") && checkField(field));
    });
    on(form, "submit", (e) => {
      var _a;
      e.preventDefault();
      const valid = fields.map(checkField).every(Boolean);
      if (!valid) {
        status.className = "form-status form-status--error";
        status.textContent = "Revisa los campos marcados en rojo.";
        (_a = $(".has-error .field__input", form)) == null ? void 0 : _a.focus();
        return;
      }
      submit.disabled = true;
      submit.textContent = "Enviando...";
      setTimeout(() => {
        const nombre = form.nombre.value.trim().split(" ")[0];
        status.className = "form-status form-status--ok";
        status.textContent = `\xA1Gracias, ${nombre}! Recibimos tu consulta y te responderemos a la brevedad.`;
        form.reset();
        fields.forEach((f) => showError(f, ""));
        updateCounter();
        if (select) updateSelectPlaceholder(select);
        submit.disabled = false;
        submit.textContent = "Enviar";
      }, 900);
    });
  }

  // js/data/models.js
  var CRITERIA = [
    { key: "flexibilidad", label: "Flexibilidad ante cambios" },
    { key: "entregas", label: "Velocidad de entregas" },
    { key: "documentacion", label: "Documentaci\xF3n" },
    { key: "cliente", label: "Participaci\xF3n del cliente" },
    { key: "riesgos", label: "Gesti\xF3n de riesgos" },
    { key: "pruebas", label: "Integraci\xF3n de pruebas (SQA)" }
  ];
  var MODELS = {
    cascada: {
      name: "Cascada",
      scores: { flexibilidad: 1, entregas: 1, documentacion: 5, cliente: 1, riesgos: 2, pruebas: 2 },
      ideal: "proyectos con requisitos estables y bien definidos desde el inicio."
    },
    v: {
      name: "Modelo en V",
      scores: { flexibilidad: 2, entregas: 1, documentacion: 5, cliente: 2, riesgos: 3, pruebas: 5 },
      ideal: "sistemas cr\xEDticos donde cada fase necesita su verificaci\xF3n y validaci\xF3n."
    },
    scrum: {
      name: "Scrum",
      scores: { flexibilidad: 5, entregas: 4, documentacion: 2, cliente: 5, riesgos: 4, pruebas: 4 },
      ideal: "productos con requisitos cambiantes y entregas iterativas en sprints."
    },
    kanban: {
      name: "Kanban",
      scores: { flexibilidad: 5, entregas: 5, documentacion: 2, cliente: 3, riesgos: 3, pruebas: 3 },
      ideal: "equipos de soporte o mantenimiento con un flujo continuo de tareas."
    },
    xp: {
      name: "XP (Extreme Programming)",
      scores: { flexibilidad: 5, entregas: 5, documentacion: 1, cliente: 5, riesgos: 4, pruebas: 5 },
      ideal: "equipos peque\xF1os que priorizan la calidad t\xE9cnica (TDD, pair programming)."
    }
  };

  // js/modules/comparator.js
  var pct = (score) => `${score / 5 * 100}%`;
  function fillSelect(select, selectedKey) {
    select.innerHTML = Object.entries(MODELS).map(([key, m]) => `<option value="${key}" ${key === selectedKey ? "selected" : ""}>${escapeHTML(m.name)}</option>`).join("");
  }
  function rowTemplate(criterion, a, b) {
    const sa = a.scores[criterion.key];
    const sb = b.scores[criterion.key];
    return `
    <div class="comparator__row">
      <div class="comparator__cell comparator__cell--a">
        ${sa}/5
        <div class="comparator__bar"><span style="width:${pct(sa)}"></span></div>
      </div>
      <div class="comparator__label">${escapeHTML(criterion.label)}</div>
      <div class="comparator__cell comparator__cell--b">
        ${sb}/5
        <div class="comparator__bar"><span style="width:${pct(sb)}"></span></div>
      </div>
    </div>`;
  }
  function summary(a, b) {
    const total = (m) => Object.values(m.scores).reduce((acc, n) => acc + n, 0);
    const wins = (x, y) => CRITERIA.filter((c) => x.scores[c.key] > y.scores[c.key]).map((c) => c.label.toLowerCase());
    const winsA = wins(a, b);
    const winsB = wins(b, a);
    if (a === b) return `<strong>Elige dos modelos distintos</strong> para ver sus diferencias.`;
    return `
    <p><strong>${escapeHTML(a.name)}</strong> (${total(a)} pts) se destaca en: ${winsA.join(", ") || "\u2014"}.</p>
    <p><strong>${escapeHTML(b.name)}</strong> (${total(b)} pts) se destaca en: ${winsB.join(", ") || "\u2014"}.</p>
    <p style="margin-top:10px">\u{1F4A1} ${escapeHTML(a.name)} es ideal para ${escapeHTML(a.ideal)}
    ${escapeHTML(b.name)} es ideal para ${escapeHTML(b.ideal)}</p>`;
  }
  function initComparator() {
    const root = $("[data-comparator]");
    if (!root) return;
    const selA = $("#model-a", root);
    const selB = $("#model-b", root);
    const table = $(".comparator__table", root);
    const winner = $(".comparator__winner", root);
    fillSelect(selA, "cascada");
    fillSelect(selB, "scrum");
    const render = () => {
      const a = MODELS[selA.value];
      const b = MODELS[selB.value];
      $('[data-name="a"]', root).textContent = a.name;
      $('[data-name="b"]', root).textContent = b.name;
      table.innerHTML = CRITERIA.map((c) => rowTemplate(c, a, b)).join("");
      winner.innerHTML = summary(a, b);
    };
    on(selA, "change", render);
    on(selB, "change", render);
    render();
  }

  // js/modules/kanban.js
  function updateCounts(board) {
    $$(".kanban__col", board).forEach((col) => {
      $(".kanban__count", col).textContent = $$(".kanban__card", col).length;
    });
  }
  function initKanban() {
    const board = $("[data-kanban]");
    if (!board) return;
    let dragged = null;
    const cols = $$(".kanban__col", board);
    const live = $(".kanban__live");
    const moveNext = (card) => {
      const i = cols.indexOf(card.closest(".kanban__col"));
      const target = cols[(i + 1) % cols.length];
      target.append(card);
      updateCounts(board);
      card.focus();
      if (live) live.textContent = `"${card.textContent.trim()}" se movi\xF3 a ${$(".kanban__title", target).textContent}`;
    };
    $$(".kanban__card", board).forEach((card) => {
      card.draggable = true;
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", `${card.textContent.trim()}. Activar para mover a la columna siguiente`);
      on(card, "click", () => moveNext(card));
      on(card, "keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          moveNext(card);
        }
      });
      on(card, "dragstart", (e) => {
        dragged = card;
        card.classList.add("is-dragging");
        e.dataTransfer.effectAllowed = "move";
      });
      on(card, "dragend", () => {
        card.classList.remove("is-dragging");
        dragged = null;
      });
    });
    $$(".kanban__col", board).forEach((col) => {
      on(col, "dragover", (e) => {
        e.preventDefault();
        col.classList.add("is-over");
      });
      on(col, "dragleave", () => col.classList.remove("is-over"));
      on(col, "drop", (e) => {
        e.preventDefault();
        col.classList.remove("is-over");
        if (dragged) {
          col.append(dragged);
          updateCounts(board);
        }
      });
    });
    updateCounts(board);
  }

  // js/modules/toolsFilter.js
  var LABELS = {
    todas: "herramientas",
    bug: "bug trackers",
    testing: "herramientas de testing",
    codigo: "herramientas de calidad de c\xF3digo"
  };
  function applyFilter(root, filter) {
    const cards = $$("[data-category]", root);
    let visible = 0;
    cards.forEach((card) => {
      const show2 = filter === "todas" || card.dataset.category === filter;
      card.classList.remove("is-entering");
      card.hidden = !show2;
      if (show2) {
        visible += 1;
        void card.offsetWidth;
        card.classList.add("is-entering");
      }
    });
    $$("[data-filter]", root).forEach((btn) => btn.setAttribute("aria-pressed", String(btn.dataset.filter === filter)));
    const status = $(".filter-status", root);
    if (status) status.textContent = `Mostrando ${visible} ${LABELS[filter] || "herramientas"}`;
    const empty = $(".tool-empty", root);
    if (empty) empty.hidden = visible > 0;
  }
  function addCounts(root) {
    const cards = $$("[data-category]", root);
    $$("[data-filter]", root).forEach((btn) => {
      const f = btn.dataset.filter;
      const n = f === "todas" ? cards.length : cards.filter((c) => c.dataset.category === f).length;
      const badge = document.createElement("span");
      badge.className = "filter-btn__count";
      badge.textContent = `(${n})`;
      btn.append(badge);
    });
  }
  function initToolsFilter() {
    $$("[data-tools]").forEach((root) => {
      addCounts(root);
      $$("[data-filter]", root).forEach((btn) => on(btn, "click", () => applyFilter(root, btn.dataset.filter)));
      applyFilter(root, "todas");
    });
  }

  // js/modules/safeLinks.js
  var isExternal = (a) => {
    try {
      const url = new URL(a.href, a.baseURI);
      return /^https?:$/.test(url.protocol) && url.host !== a.ownerDocument.location.host;
    } catch (e) {
      return false;
    }
  };
  function initSafeLinks(root = document) {
    $$("a[href]", root).filter(isExternal).forEach((a) => {
      a.target = "_blank";
      const rel = new Set((a.rel || "").split(/\s+/).filter(Boolean));
      rel.add("noopener");
      rel.add("noreferrer");
      a.rel = [...rel].join(" ");
      if (!a.querySelector(".sr-only")) {
        const note = a.ownerDocument.createElement("span");
        note.className = "sr-only";
        note.textContent = " (se abre en una pesta\xF1a nueva)";
        a.append(note);
      }
    });
  }

  // js/modules/profileCards.js
  var MAX_TILT = 6;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function setupCard(card) {
    const activate2 = () => card.classList.add("is-active");
    const reset = () => {
      card.classList.remove("is-active");
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
    };
    on(card, "mouseenter", activate2);
    on(card, "mouseleave", reset);
    on(card, "focusin", activate2);
    on(card, "focusout", reset);
    if (!reduceMotion) {
      on(card, "mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty("--ry", `${(x * MAX_TILT * 2).toFixed(2)}deg`);
        card.style.setProperty("--rx", `${(-y * MAX_TILT * 2).toFixed(2)}deg`);
      });
    }
    const toggle = $(".team-card__toggle", card);
    if (toggle) {
      on(toggle, "click", () => {
        const open2 = card.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", String(open2));
        toggle.textContent = open2 ? "Ocultar motivaci\xF3n" : "Ver motivaci\xF3n";
      });
    }
  }
  function initProfileCards() {
    $$(".team-card").forEach(setupCard);
  }

  // js/modules/lightbox.js
  var ICONS = {
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>'
  };
  var dialog;
  var items = [];
  var current = 0;
  var lastTrigger = null;
  var titleOf = (el) => {
    var _a;
    return el.dataset.lightboxTitle || ((_a = $("figcaption", el)) == null ? void 0 : _a.textContent.trim()) || "Diagrama";
  };
  function iconButton(cls, icon, label) {
    const b = createEl("button", { class: `lightbox__btn ${cls}`, type: "button", "aria-label": label });
    b.innerHTML = icon;
    return b;
  }
  function buildDialog() {
    dialog = createEl("dialog", { class: "lightbox", "aria-labelledby": "lightbox-title" });
    const bar = createEl("div", { class: "lightbox__bar" }, [
      createEl("h2", { class: "lightbox__title", id: "lightbox-title" }),
      createEl("span", { class: "lightbox__counter", "aria-live": "polite" }),
      iconButton("lightbox__close", ICONS.close, "Cerrar pantalla completa")
    ]);
    const stage = createEl("div", { class: "lightbox__stage" }, [
      iconButton("lightbox__nav lightbox__nav--prev", ICONS.prev, "Diagrama anterior"),
      createEl("div", { class: "lightbox__body" }),
      iconButton("lightbox__nav lightbox__nav--next", ICONS.next, "Diagrama siguiente")
    ]);
    const caption = createEl("p", { class: "lightbox__caption" });
    dialog.append(bar, stage, caption);
    document.body.append(dialog);
    on($(".lightbox__close", dialog), "click", close);
    on($(".lightbox__nav--prev", dialog), "click", () => show(current - 1));
    on($(".lightbox__nav--next", dialog), "click", () => show(current + 1));
    on(dialog, "click", (e) => {
      if (e.target === dialog || e.target.classList.contains("lightbox__stage")) close();
    });
    on(dialog, "keydown", (e) => {
      if (e.key === "ArrowLeft") show(current - 1);
      if (e.key === "ArrowRight") show(current + 1);
    });
    on(dialog, "cancel", cleanup);
    on(dialog, "close", cleanup);
  }
  function buildContent(el) {
    const img = $(".illustration__img", el);
    if (img) {
      return createEl("img", {
        class: "lightbox__img",
        src: img.currentSrc || img.src,
        alt: img.alt,
        draggable: "false"
      });
    }
    const clone = el.cloneNode(true);
    clone.classList.add("is-visible", "lightbox__diagram");
    clone.removeAttribute("tabindex");
    clone.removeAttribute("role");
    [clone, ...$$("[id], [aria-labelledby], [tabindex]", clone)].forEach((n) => {
      n.removeAttribute("id");
      n.removeAttribute("aria-labelledby");
      if (n !== clone && n.hasAttribute("tabindex")) n.setAttribute("tabindex", "-1");
    });
    $$(".diagram__caption, .lightbox-hint", clone).forEach((n) => n.remove());
    return clone;
  }
  function show(index) {
    var _a;
    current = (index + items.length) % items.length;
    const el = items[current];
    $(".lightbox__body", dialog).replaceChildren(buildContent(el));
    $(".lightbox__title", dialog).textContent = titleOf(el);
    $(".lightbox__caption", dialog).textContent = ((_a = $("figcaption", el)) == null ? void 0 : _a.textContent.trim()) || "";
    $(".lightbox__counter", dialog).textContent = items.length > 1 ? `${current + 1} / ${items.length}` : "";
    $$(".lightbox__nav", dialog).forEach((b) => b.hidden = items.length < 2);
  }
  function cleanup() {
    document.documentElement.classList.remove("is-locked");
    if (lastTrigger) {
      lastTrigger.focus({ preventScroll: true });
      lastTrigger = null;
    }
  }
  function close() {
    if (dialog == null ? void 0 : dialog.open) dialog.close();
    cleanup();
  }
  function open(index, trigger) {
    if (!dialog) buildDialog();
    lastTrigger = trigger;
    show(index);
    document.documentElement.classList.add("is-locked");
    dialog.showModal();
    $(".lightbox__close", dialog).focus();
  }
  function initLightbox() {
    items = $$("[data-lightbox]");
    if (!items.length || typeof HTMLDialogElement === "undefined") return;
    items.forEach((el, i) => {
      el.tabIndex = 0;
      el.setAttribute("aria-haspopup", "dialog");
      const hint = createEl("span", { class: "sr-only lightbox-hint", text: " (Enter para ver en pantalla completa)" });
      ($("figcaption", el) || el).append(hint);
      on(el, "click", (e) => {
        if (e.target.closest("a, button")) return;
        open(i, el);
      });
      on(el, "keydown", (e) => {
        if (e.target !== el) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open(i, el);
        }
      });
    });
  }

  // js/main.js
  var modules = [
    initNavbar,
    // US-01: menú hamburguesa + sección activa
    initSafeLinks,
    // US-14: apertura segura de enlaces externos
    initReveal,
    initTabs,
    // US-02: pestañas ISO 9126 / 25000
    initToolsFilter,
    // Herramientas: filtro por categoría
    initLightbox,
    // US-07 / US-09: diagramas en pantalla completa
    initProfileCards,
    // US-16: efectos hover en perfiles
    initContactForm,
    // US-17: validación del formulario
    initComparator,
    initKanban
  ];
  function boot() {
    document.documentElement.classList.remove("no-js");
    modules.forEach((init) => {
      try {
        init();
      } catch (err) {
        console.error(`[SQS] Error al iniciar ${init.name}:`, err);
      }
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
