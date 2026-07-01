import { isSingleWord } from '../src/shared/word.js';
import { parseDictionaryResponse } from '../src/shared/dictionary.js';

const cases = [
  ['hello', true],
  ['hello world', false],
  ["don't", true],
  ['well-known', true],
  ['123', false],
];

for (const [text, expected] of cases) {
  const got = isSingleWord(text);
  if (got !== expected) {
    throw new Error(`isSingleWord("${text}") = ${got}, expected ${expected}`);
  }
}

const sample = [
  {
    word: 'hello',
    phonetic: 'hələʊ',
    phonetics: [
      {
        text: 'hələʊ',
        audio: '//ssl.gstatic.com/dictionary/static/sounds/20200429/hello--_gb_1.mp3',
      },
    ],
  },
];

const parsed = parseDictionaryResponse(sample);
if (!parsed.ok || !parsed.ipa || !parsed.audioUrl?.startsWith('https:')) {
  throw new Error(`parse failed: ${JSON.stringify(parsed)}`);
}

const notFound = parseDictionaryResponse([]);
if (notFound.ok || notFound.error !== 'not_found') {
  throw new Error(`not_found failed: ${JSON.stringify(notFound)}`);
}

console.log('All shared module checks passed.');
