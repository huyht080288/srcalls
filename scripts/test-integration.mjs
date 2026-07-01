/**
 * Integration smoke test: Dictionary API + shared parse (no browser).
 * Run: node scripts/test-integration.mjs
 */
import { parseDictionaryResponse } from '../src/shared/dictionary.js';

const words = ['hello', 'serendipity', 'xyzxyzxyz'];

for (const word of words) {
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
  const response = await fetch(url);
  const label = `${word} → HTTP ${response.status}`;

  if (response.status === 404) {
    const parsed = parseDictionaryResponse([]);
    console.log(label, '→', parsed);
    continue;
  }

  if (!response.ok) {
    console.error(label, 'FAILED');
    process.exit(1);
  }

  const data = await response.json();
  const parsed = parseDictionaryResponse(data);
  console.log(label, '→', parsed.ok ? { ipa: parsed.ipa, audio: !!parsed.audioUrl } : parsed);
  if (word !== 'xyzxyzxyz' && !parsed.ok) {
    console.error(`Expected success for ${word}`);
    process.exit(1);
  }
  if (word === 'xyzxyzxyz' && parsed.ok) {
    console.error('Expected not found for nonsense word');
    process.exit(1);
  }
}

console.log('Integration API checks passed.');
