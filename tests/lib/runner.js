/**
 * Ejecuta todas las suites y muestra los resultados en la página.
 * El resumen queda también en <body data-result="..."> para leerlo
 * desde la terminal (scripts/e2e.js).
 */
import { createContext } from './harness.js';

const escape = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

export async function run(suites, { output, sandbox, summary }) {
  let passed = 0;
  let failed = 0;
  const report = [];

  for (const suite of suites) {
    const section = document.createElement('section');
    section.className = 'suite';
    section.innerHTML = `<h2><span class="suite__id">${suite.id}</span> ${escape(suite.title)}</h2><ol class="tests"></ol>`;
    output.append(section);
    const list = section.querySelector('.tests');

    for (const test of suite.tests) {
      const li = document.createElement('li');
      li.className = 'test is-running';
      li.innerHTML = `<span class="test__status">…</span><span class="test__name">${escape(test.name)}</span>`;
      list.append(li);

      const t = createContext(sandbox);
      const start = performance.now();
      let error = null;
      try {
        await test.run(t);
      } catch (err) {
        error = err;
      } finally {
        t.cleanup();
      }
      const ms = Math.round(performance.now() - start);

      li.classList.remove('is-running');
      if (error) {
        failed++;
        li.classList.add('is-fail');
        li.querySelector('.test__status').textContent = '✖';
        li.insertAdjacentHTML('beforeend', `<p class="test__error">${escape(error.message)}</p>`);
      } else {
        passed++;
        li.classList.add('is-pass');
        li.querySelector('.test__status').textContent = '✔';
      }
      li.insertAdjacentHTML('beforeend', `<span class="test__time">${ms} ms</span>`);
      report.push(`${error ? 'FAIL' : 'PASS'} [${suite.id}] ${test.name}${error ? ` → ${error.message}` : ''}`);
    }
  }

  summary.textContent = `${passed} pruebas OK · ${failed} fallidas`;
  summary.className = `summary ${failed ? 'is-fail' : 'is-pass'}`;
  document.body.dataset.result = JSON.stringify({ passed, failed, report });
  document.title = `${failed ? '✖' : '✔'} ${passed}/${passed + failed} · Pruebas S.Q.S`;

  // si las pruebas las lanzó `npm run test:e2e`, se le envían los resultados
  if (new URLSearchParams(location.search).has('e2e')) {
    fetch('/__results', { method: 'POST', body: document.body.dataset.result }).catch(() => {});
  }
}
