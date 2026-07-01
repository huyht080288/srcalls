(() => {
  let currentAudio = null;

  window.addEventListener('message', (event) => {
    if (event.source !== window.parent) {
      return;
    }
    if (event.data?.type !== 'VCE_PLAY' || !event.data.dataUrl) {
      return;
    }

    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }

    currentAudio = new Audio(event.data.dataUrl);
    currentAudio
      .play()
      .then(() => {
        window.parent.postMessage({ type: 'VCE_PLAY_RESULT', ok: true }, '*');
      })
      .catch((error) => {
        window.parent.postMessage(
          { type: 'VCE_PLAY_RESULT', ok: false, error: String(error) },
          '*'
        );
      });
  });

  window.parent.postMessage({ type: 'VCE_PLAYER_READY' }, '*');
})();
