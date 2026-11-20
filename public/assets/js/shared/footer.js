/** Update the copyright year without hard-coding the active year in HTML. */
export function setCurrentYear(root, now = new Date()) {
  const yearElement = root?.querySelector('[data-current-year]');
  if (!yearElement) return false;
  yearElement.textContent = String(now.getFullYear());
  return true;
}

if (typeof document !== 'undefined') {
  setCurrentYear(document);
}
