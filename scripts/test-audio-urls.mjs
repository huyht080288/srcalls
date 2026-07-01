import { parseDictionaryResponse } from '../src/shared/dictionary.js';

const words = ['hello', 'serendipity', 'pronunciation', 'world', 'documentation'];

for (const word of words) {
  const res = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
  );
  const data = await res.json();
  const parsed = parseDictionaryResponse(data);
  console.log(`\n=== ${word} ===`);
  console.log('parsed:', parsed);

  if (parsed.audioUrl) {
    const audioRes = await fetch(parsed.audioUrl, { method: 'HEAD' });
    console.log('audio HEAD:', audioRes.status, parsed.audioUrl);
  }

  const phonetics = data[0]?.phonetics?.filter((p) => p.audio) ?? [];
  console.log('all audio urls:', phonetics.map((p) => p.audio));
}
