const SINGLE_WORD_RE = /^[a-zA-Z]+(?:[-'][a-zA-Z]+)*$/;

export function isSingleWord(text) {
  const trimmed = text.trim();
  if (!trimmed || /\s/.test(trimmed)) {
    return false;
  }
  return SINGLE_WORD_RE.test(trimmed);
}

export function normalizeWord(text) {
  return text.trim().toLowerCase();
}
