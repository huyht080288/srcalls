import { parseDictionaryResponse, pickAudioUrl } from '../src/shared/dictionary.js';

const hello = [
  {
    word: 'hello',
    phonetics: [
      { audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/hello-au.mp3' },
      { audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/hello-uk.mp3' },
    ],
  },
];

const parsed = parseDictionaryResponse(hello);
if (!parsed.audioUrl?.includes('hello-uk.mp3')) {
  throw new Error(`Expected UK audio, got ${parsed.audioUrl}`);
}

const none = parseDictionaryResponse([{ word: 'x', phonetics: [{ text: '/x/' }] }]);
if (none.audioUrl !== null) {
  throw new Error('Expected null audio');
}

console.log('pickAudioUrl prefers UK:', parsed.audioUrl);
console.log('dictionary audio tests passed.');
