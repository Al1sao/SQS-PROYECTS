/**
 * Corre las pruebas de tests/index.html en un navegador sin ventana
 * (Chrome / Chromium / Brave / Edge) y muestra el resultado en la terminal.
 *
 * Uso: npm run test:e2e
 * Si no encuentra un navegador, se puede usar CHROME_PATH=/ruta/al/navegador
 * o abrir las pruebas a mano con `npm run serve` → http://localhost:5500/tests/
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn, execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png',
  '.woff2': 'font/woff2', '.pdf': 'application/pdf', '.json': 'application/json',
};

function findBrowser() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const candidates = [
    'google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', 'brave-browser', 'microsoft-edge',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  ];
  for (const c of candidates) {
    if (path.isAbsolute(c) && fs.existsSync(c)) return c;
    try {
      return execSync(`command -v ${c}`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    } catch {
      /* siguiente */
    }
  }
  return null;
}

let browserProcess = null;
let profileDir = null; // carpeta de perfil del navegador de pruebas

/** Cierra el navegador de pruebas y todos sus procesos hijos. */
function killBrowser() {
  if (!browserProcess) return;
  try {
    if (process.platform === 'win32') execSync(`taskkill /pid ${browserProcess.pid} /T /F`, { stdio: 'ignore' });
    else process.kill(-browserProcess.pid, 'SIGKILL');
  } catch {
    /* ya estaba cerrado */
  }
  browserProcess = null;
}

/** Si una ejecución anterior quedó colgada, libera el perfil de pruebas. */
function killLeftovers() {
  if (process.platform === 'win32') return;
  try {
    // el patrón [u] evita que pkill coincida con su propio comando
    execSync(`pkill -f "[u]ser-data-dir=${profileDir}"`, { stdio: 'ignore' });
  } catch {
    /* no había procesos colgados */
  }
}

function finish(code) {
  killBrowser();
  server.close();
  process.exit(code);
}

function printResults(body) {
  const { passed, failed, report } = JSON.parse(body);
  report.forEach((line) => console.log(line.startsWith('PASS') ? `  ✔ ${line.slice(5)}` : `  ✖ ${line.slice(5)}`));
  console.log(`\n${passed} pruebas OK · ${failed} fallidas`);
  return failed ? 1 : 0;
}

const server = http.createServer((req, res) => {
  // el runner del navegador envía aquí los resultados al terminar
  if (req.method === 'POST' && req.url === '/__results') {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      res.end('ok');
      finish(printResults(body));
    });
    return;
  }

  if (process.env.DEBUG) console.log(req.method, req.url);
  const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let file = path.join(ROOT, url);
  if (!file.startsWith(ROOT)) return res.writeHead(403).end();
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  fs.readFile(file, (err, data) => {
    if (err) return res.writeHead(404).end('404');
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(req.method === 'HEAD' ? undefined : data);
  });
});

server.listen(0, () => {
  const { port } = server.address();
  const browser = findBrowser();
  if (!browser) {
    console.error('No se encontró Chrome/Chromium/Brave/Edge. Definí CHROME_PATH o abrí las pruebas con:');
    console.error('  npm run serve  →  http://localhost:5500/tests/');
    server.close();
    process.exit(1);
  }

  // perfil propio y reutilizable (el primer arranque de un perfil nuevo es lento)
  profileDir = path.join(os.tmpdir(), 'sqs-e2e-profile');
  fs.mkdirSync(profileDir, { recursive: true });
  killLeftovers();
  const args = [
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--disable-extensions', '--disable-sync', '--disable-component-update', '--no-proxy-server',
    '--disable-background-timer-throttling', '--disable-renderer-backgrounding',
    `--user-data-dir=${profileDir}`, '--window-size=1400,1000',
    `http://localhost:${port}/tests/index.html?e2e=1`,
  ];
  console.log(`Ejecutando pruebas con ${path.basename(browser)}...\n`);
  browserProcess = spawn(browser, args, { stdio: 'ignore', detached: process.platform !== 'win32' });
  browserProcess.on('error', (e) => {
    console.error(`No se pudo abrir el navegador: ${e.message}`);
    finish(1);
  });

  setTimeout(() => {
    console.error('Tiempo agotado (5 min) esperando los resultados.');
    finish(1);
  }, 300000);

  // Ctrl+C: no dejar el navegador abierto
  process.on('SIGINT', () => finish(130));
  process.on('SIGTERM', () => finish(143));
});
