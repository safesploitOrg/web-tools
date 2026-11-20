import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname, relative, sep } from 'node:path';
import assert from 'node:assert/strict';

const PUBLIC_DIR = resolve('public');
const PAGES = ['index.html', 'sri-hash/index.html'];
const LOCAL_LINK = /\b(?:href|src)\s*=\s*["']([^"']+)["']/gu;
const MODULE_IMPORT = /\bfrom\s+["']([^"']+)["']/gu;

function checkTarget(referrer, destination) {
  if (destination.startsWith('#') || /^(?:https?:|mailto:|data:)/iu.test(destination)) return;
  assert(!destination.startsWith('/'), `Root-relative path breaks GitHub Pages: ${referrer} -> ${destination}`);
  const target = resolve(dirname(referrer), decodeURIComponent(destination.split(/[?#]/u, 1)[0]));
  const rel = relative(PUBLIC_DIR, target);
  assert(rel !== '..' && !rel.startsWith(`..${sep}`), `Path escapes public/: ${destination}`);
  assert(existsSync(target) || existsSync(resolve(target, 'index.html')), `Broken local path: ${referrer} -> ${destination}`);
}

function checkImports(file) {
  const content = readFileSync(file, 'utf8');
  for (const [, path] of content.matchAll(MODULE_IMPORT)) checkTarget(file, path);
}

for (const route of PAGES) {
  const file = resolve(PUBLIC_DIR, route);
  assert(existsSync(file), `Missing public route ${route}`);
  for (const [, target] of readFileSync(file, 'utf8').matchAll(LOCAL_LINK)) {
    checkTarget(file, target);
  }
}

for (const file of [
  'assets/js/tools/sri-hash/main.js',
  'assets/js/tools/sri-hash/digest.js',
  'assets/js/tools/sri-hash/input.js',
  'assets/js/tools/sri-hash/validate.js',
  'assets/js/tools/sri-hash/snippets.js',
  'assets/js/shared/clipboard.js',
  'assets/js/shared/footer.js',
]) checkImports(resolve(PUBLIC_DIR, file));

for (const route of PAGES) {
  const page = readFileSync(resolve(PUBLIC_DIR, route), 'utf8');
  assert(page.includes('data-current-year'), `Missing dynamic footer year: ${route}`);
  assert(page.includes('https://github.com/safesploitOrg/web-tools'), `Missing repository link: ${route}`);
  assert(!page.includes('class="header-links"'), `Redundant header navigation: ${route}`);
}

console.info('PASS: catalogue, SRI route, shared footer, relative assets and JS imports resolve from public/.');
