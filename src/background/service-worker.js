import { parseDictionaryResponse } from '../shared/dictionary.js';
import { fetchAudioDataUrl } from '../shared/audio-fetch.js';
import { MSG_LOOKUP_WORD } from '../shared/messages.js';

const API_BASE = 'https://api.dictionaryapi.dev/api/v2/entries/en';
const lookupCache = new Map();

async function lookupWord(word) {
  const key = word.toLowerCase();
  if (lookupCache.has(key)) {
    return lookupCache.get(key);
  }

  try {
    const response = await fetch(`${API_BASE}/${encodeURIComponent(key)}`);
    if (response.status === 404) {
      return { ok: false, error: 'not_found' };
    }
    if (!response.ok) {
      return { ok: false, error: 'network' };
    }

    const data = await response.json();
    const result = parseDictionaryResponse(data);
    if (!result.ok) {
      return result;
    }

    if (result.audioUrl) {
      const audioDataUrl = await fetchAudioDataUrl(result.audioUrl);
      if (audioDataUrl) {
        result.audioDataUrl = audioDataUrl;
      } else {
        result.audioUrl = null;
      }
    }

    lookupCache.set(key, result);
    return result;
  } catch {
    return { ok: false, error: 'network' };
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === MSG_LOOKUP_WORD && message.word) {
    lookupWord(message.word).then(sendResponse);
    return true;
  }
  return false;
});
