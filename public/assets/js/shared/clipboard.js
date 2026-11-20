/** No DOM-based fallback: never put sensitive copied material into an editable node. */
export async function copyPlainText(value, clipboard = globalThis.navigator?.clipboard) {
  if (!clipboard || typeof clipboard.writeText !== 'function') {
    throw new Error('Clipboard access is unavailable. Select and copy the output manually.');
  }
  await clipboard.writeText(value);
}
