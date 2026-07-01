const audioDataCache = new Map();

export function getCachedAudioDataUrl(url) {
  return audioDataCache.get(url) ?? null;
}

export async function fetchAudioDataUrl(url) {
  if (audioDataCache.has(url)) {
    return audioDataCache.get(url);
  }

  const response = await fetch(url);
  if (!response.ok) {
    return null;
  }

  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }

  const dataUrl = `data:audio/mpeg;base64,${btoa(binary)}`;
  audioDataCache.set(url, dataUrl);
  return dataUrl;
}
