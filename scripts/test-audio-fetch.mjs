import { fetchAudioDataUrl } from '../src/shared/audio-fetch.js';

const url = 'https://api.dictionaryapi.dev/media/pronunciations/en/hello-uk.mp3';
const dataUrl = await fetchAudioDataUrl(url);

if (!dataUrl?.startsWith('data:audio/mpeg;base64,')) {
  throw new Error(`Invalid data URL: ${dataUrl?.slice(0, 40)}`);
}

const again = await fetchAudioDataUrl(url);
if (again !== dataUrl) {
  throw new Error('Audio cache miss');
}

console.log('audio-fetch OK, bytes:', dataUrl.length);
