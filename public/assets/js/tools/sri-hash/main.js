import { copyPlainText } from '../../shared/clipboard.js';
import { createIntegrityToken } from './digest.js';
import { fetchResourceBytes, readFileBytes, readTextBytes } from './input.js';
import { createHtmlSnippet } from './snippets.js';
import { SriError } from './validate.js';

const MODES = Object.freeze(['url', 'file', 'text']);
const FORM = document.getElementById('sri-form');
const byId = (id) => document.getElementById(id);
let currentMode = 'url';
let isBusy = false;
let activeRequest = null;

function announce(message) {
  byId('operation-status').textContent = message;
}

function clearOutput() {
  byId('result-content').hidden = true;
  byId('result-placeholder').hidden = false;
  byId('snippet-group').hidden = true;
  byId('snippet-unavailable').hidden = true;
  byId('integrity-output').value = '';
  byId('html-output').value = '';
  byId('error-message').hidden = true;
  byId('error-message').textContent = '';
  announce('');
}

function selectMode(mode, focus = false) {
  if (!MODES.includes(mode) || isBusy) return;
  currentMode = mode;
  for (const candidate of MODES) {
    const selected = candidate === mode;
    const tab = byId(`tab-${candidate}`);
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    tab.classList.toggle('is-selected', selected);
    byId(`panel-${candidate}`).hidden = !selected;
  }
  byId('snippet-url-row').hidden = mode === 'url';
  clearOutput();
  if (focus) byId(`tab-${mode}`).focus();
}

function setBusy(busy) {
  isBusy = busy;
  for (const field of FORM.querySelectorAll('input, textarea, button')) {
    if (field.id !== 'cancel-button') field.disabled = busy;
  }
  byId('cancel-button').hidden = !(busy && currentMode === 'url');
  byId('generate-button').textContent = busy ? 'Generating…' : 'Generate integrity hash';
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} bytes`;
  return `${(bytes / 1024).toFixed(1)} KiB`;
}

function showError(error) {
  clearOutput();
  const message = error instanceof SriError ? error.message : 'An unexpected error occurred while processing the resource.';
  byId('error-message').textContent = message;
  byId('error-message').hidden = false;
  announce('Unable to generate an integrity hash.');
}

function selectedValue(name) {
  return FORM.querySelector(`input[name="${name}"]:checked`)?.value;
}

async function generate(event) {
  event.preventDefault();
  if (isBusy) return;
  clearOutput();

  const mode = currentMode;
  const algorithm = selectedValue('algorithm');
  const resourceType = selectedValue('resource-type');
  activeRequest = new AbortController();
  setBusy(true);
  announce(mode === 'url' ? 'Fetching the remote resource…' : 'Calculating the integrity hash…');

  try {
    let bytes;
    let resourceUrl;
    let context = '';
    if (mode === 'url') {
      const result = await fetchResourceBytes(byId('resource-url').value, { signal: activeRequest.signal });
      bytes = result.bytes;
      resourceUrl = result.url;
      context = 'HTTPS resource fetched with CORS and no credentials';
    } else if (mode === 'file') {
      const file = byId('resource-file').files?.[0];
      if (!file) throw new SriError('INVALID_INPUT', 'Choose a local file first.');
      bytes = await readFileBytes(file);
      resourceUrl = byId('snippet-url').value.trim();
      context = 'Local file; not uploaded';
    } else {
      const source = byId('resource-text').value;
      if (!source) throw new SriError('INVALID_INPUT', 'Paste some text to hash.');
      bytes = readTextBytes(source);
      resourceUrl = byId('snippet-url').value.trim();
      context = 'UTF-8 text; processed locally';
    }

    const integrity = await createIntegrityToken(bytes, algorithm);
    const snippet = resourceUrl ? createHtmlSnippet({ resourceUrl, integrity, resourceType }) : '';
    byId('integrity-output').value = integrity;
    byId('snippet-group').hidden = !snippet;
    byId('snippet-unavailable').hidden = Boolean(snippet);
    byId('html-output').value = snippet;
    byId('result-details').textContent = `${algorithm.toUpperCase().replace('SHA', 'SHA-')} · ${formatSize(bytes.byteLength)} · ${context}`;
    byId('result-placeholder').hidden = true;
    byId('result-content').hidden = false;
    announce('Integrity hash generated. You can copy the result.');
  } catch (error) {
    showError(error);
  } finally {
    activeRequest = null;
    setBusy(false);
  }
}

async function copyResult(elementId) {
  const text = byId(elementId).value;
  if (!text) return;
  try {
    await copyPlainText(text);
    announce(elementId === 'integrity-output' ? 'Integrity token copied.' : 'HTML snippet copied.');
  } catch (error) {
    announce(error.message || 'Clipboard permission denied. Select and copy the text manually.');
    byId(elementId).focus();
    byId(elementId).select();
  }
}

function initialise() {
  if (!FORM) return;
  FORM.addEventListener('submit', generate);
  for (const mode of MODES) {
    const tab = byId(`tab-${mode}`);
    tab.addEventListener('click', () => selectMode(mode));
    tab.addEventListener('keydown', (event) => {
      const index = MODES.indexOf(mode);
      let target;
      if (event.key === 'ArrowRight') target = MODES[(index + 1) % MODES.length];
      if (event.key === 'ArrowLeft') target = MODES[(index + MODES.length - 1) % MODES.length];
      if (event.key === 'Home') target = MODES[0];
      if (event.key === 'End') target = MODES[MODES.length - 1];
      if (target) {
        event.preventDefault();
        selectMode(target, true);
      }
    });
  }

  for (const input of FORM.querySelectorAll('input, textarea')) {
    input.addEventListener('input', clearOutput);
    input.addEventListener('change', clearOutput);
  }
  byId('cancel-button').addEventListener('click', () => activeRequest?.abort());
  byId('copy-integrity').addEventListener('click', () => copyResult('integrity-output'));
  byId('copy-snippet').addEventListener('click', () => copyResult('html-output'));
  selectMode('url');
}

initialise();
