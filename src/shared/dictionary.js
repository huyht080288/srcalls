export function normalizeAudioUrl(url) {
  if (!url || !url.trim()) {
    return null;
  }
  const trimmed = url.trim();
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }
  return trimmed;
}

const AUDIO_PREFERENCE = ['-uk.mp3', '-us.mp3', '-au.mp3', '-ca.mp3'];

export function pickAudioUrl(phonetics) {
  const urls = (phonetics ?? [])
    .map((p) => normalizeAudioUrl(p.audio))
    .filter(Boolean);

  if (urls.length === 0) {
    return null;
  }

  for (const suffix of AUDIO_PREFERENCE) {
    const match = urls.find((url) => url.endsWith(suffix) || url.includes(suffix));
    if (match) {
      return match;
    }
  }

  return urls[0];
}

export function parseDictionaryResponse(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return { ok: false, error: 'not_found' };
  }

  const entry = data[0];
  let ipa = entry.phonetic;
  if (!ipa) {
    const withText = entry.phonetics?.find((p) => p.text);
    ipa = withText?.text ?? null;
  }

  const audioUrl = pickAudioUrl(entry.phonetics);

  return {
    ok: true,
    word: entry.word,
    ipa: ipa ?? null,
    audioUrl,
  };
}
