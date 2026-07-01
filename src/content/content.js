(() => {
  const MSG_LOOKUP_WORD = 'LOOKUP_WORD';
  const ROOT_ID = 'voice-chr-ext-root';
  const PLAYER_URL = chrome.runtime.getURL('src/audio/player.html');
  const SINGLE_WORD_RE = /^[a-zA-Z]+(?:[-'][a-zA-Z]+)*$/;

  const TOOLTIP_CSS = `
.vce-tooltip {
  position: fixed;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 8px;
  background: #1a1a2e;
  color: #f0f0f5;
  font-family: system-ui, -apple-system, Segoe UI, sans-serif;
  font-size: 14px;
  line-height: 1.4;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.28);
  pointer-events: auto;
  max-width: min(320px, calc(100vw - 16px));
  z-index: 2147483647;
}
.vce-tooltip.vce-loading { color: #c8c8d4; }
.vce-tooltip.vce-error { color: #ffb4b4; }
.vce-ipa {
  font-family: 'Segoe UI', Georgia, 'Times New Roman', serif;
  font-size: 15px;
  letter-spacing: 0.02em;
  white-space: nowrap;
}
.vce-ipa.vce-muted {
  color: #a0a0b0;
  font-family: system-ui, sans-serif;
  font-size: 13px;
}
.vce-play {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: #2d2d44;
  color: inherit;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  flex-shrink: 0;
}
.vce-play:hover:not(:disabled) { background: #3d3d5c; }
.vce-play:focus-visible { outline: 2px solid #6b8cff; outline-offset: 2px; }
.vce-play:disabled { opacity: 0.35; cursor: not-allowed; }
.vce-play.vce-play-error { background: #5c2d2d; outline: 2px solid #ff8080; }
.vce-play.vce-play-active { background: #3d5c44; }
.vce-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid #4a4a66;
  border-top-color: #a0a8ff;
  border-radius: 50%;
  animation: vce-spin 0.7s linear infinite;
}
@keyframes vce-spin { to { transform: rotate(360deg); } }
`;

  let shadowRootRef = null;
  let tooltipEl = null;
  let currentAudioDataUrl = null;
  let pendingWord = null;
  let selectionChangeTimer = null;
  let playerIframe = null;
  let playerReadyPromise = null;
  let lastResultRect = null;
  let lastResultWord = null;

  function isSingleWord(text) {
    const trimmed = text.trim();
    if (!trimmed || /\s/.test(trimmed)) {
      return false;
    }
    return SINGLE_WORD_RE.test(trimmed);
  }

  function normalizeWord(text) {
    return text.trim().toLowerCase();
  }

  function ensureShadowRoot() {
    if (shadowRootRef) {
      return shadowRootRef;
    }

    let host = document.getElementById(ROOT_ID);
    if (host) {
      host.remove();
    }

    host = document.createElement('div');
    host.id = ROOT_ID;
    host.style.cssText =
      'position:fixed;top:0;left:0;width:0;height:0;z-index:2147483647;pointer-events:none;';
    document.documentElement.appendChild(host);

    shadowRootRef = host.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = TOOLTIP_CSS;
    shadowRootRef.appendChild(style);

    return shadowRootRef;
  }

  function ensureAudioPlayer() {
    if (playerReadyPromise) {
      return playerReadyPromise;
    }

    const shadow = ensureShadowRoot();

    playerReadyPromise = new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        window.removeEventListener('message', onReady);
        playerReadyPromise = null;
        reject(new Error('Audio player timeout'));
      }, 8000);

      const onReady = (event) => {
        if (event.source !== playerIframe?.contentWindow) {
          return;
        }
        if (event.data?.type !== 'VCE_PLAYER_READY') {
          return;
        }
        clearTimeout(timeoutId);
        window.removeEventListener('message', onReady);
        resolve();
      };

      window.addEventListener('message', onReady);

      playerIframe = document.createElement('iframe');
      playerIframe.src = PLAYER_URL;
      playerIframe.setAttribute('allow', 'autoplay');
      playerIframe.title = 'VoiceChrExtention audio player';
      playerIframe.style.cssText =
        'position:fixed;width:0;height:0;border:0;opacity:0;pointer-events:none;';
      shadow.appendChild(playerIframe);
    });

    return playerReadyPromise;
  }

  function getExtensionHost() {
    return document.getElementById(ROOT_ID);
  }

  function isPointerInsideExtension(event) {
    const host = getExtensionHost();
    if (!host) {
      return false;
    }
    return event.composedPath().includes(host);
  }

  function removeTooltipEl() {
    if (tooltipEl) {
      tooltipEl.remove();
      tooltipEl = null;
    }
    currentAudioDataUrl = null;
  }

  function hideTooltip() {
    removeTooltipEl();
    pendingWord = null;
    lastResultRect = null;
    lastResultWord = null;
  }

  function captureSelectionInfo() {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
      return null;
    }

    const text = selection.toString();
    if (!isSingleWord(text)) {
      return null;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      return null;
    }

    return {
      word: normalizeWord(text),
      rect: {
        top: rect.top,
        left: rect.left,
        bottom: rect.bottom,
        right: rect.right,
        width: rect.width,
        height: rect.height,
      },
    };
  }

  function formatIpa(ipa) {
    const trimmed = ipa.trim();
    if (trimmed.startsWith('/') && trimmed.endsWith('/')) {
      return trimmed;
    }
    return `/${trimmed}/`;
  }

  function positionTooltip(el, rect) {
    const gap = 6;
    let top = rect.bottom + gap;
    let left = rect.left;

    const { height, width } = el.getBoundingClientRect();
    if (top + height > window.innerHeight) {
      top = rect.top - height - gap;
    }
    if (left + width > window.innerWidth) {
      left = window.innerWidth - width - 8;
    }
    if (left < 8) {
      left = 8;
    }

    el.style.top = `${Math.max(8, top)}px`;
    el.style.left = `${left}px`;
  }

  function showLoadingTooltip(rect) {
    removeTooltipEl();
    const shadow = ensureShadowRoot();
    tooltipEl = document.createElement('div');
    tooltipEl.className = 'vce-tooltip vce-loading';
    tooltipEl.setAttribute('role', 'status');
    tooltipEl.innerHTML = '<span class="vce-spinner"></span><span>Loading…</span>';
    shadow.appendChild(tooltipEl);
    positionTooltip(tooltipEl, rect);
  }

  async function playAudio() {
    const dataUrl = currentAudioDataUrl;
    if (!dataUrl) {
      return;
    }

    const playBtn = tooltipEl?.querySelector('.vce-play');
    if (playBtn) {
      playBtn.classList.remove('vce-play-error');
      playBtn.classList.add('vce-play-active');
    }

    try {
      await ensureAudioPlayer();

      await new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          window.removeEventListener('message', onResult);
          reject(new Error('Play timeout'));
        }, 8000);

        const onResult = (event) => {
          if (event.source !== playerIframe?.contentWindow) {
            return;
          }
          if (event.data?.type !== 'VCE_PLAY_RESULT') {
            return;
          }
          clearTimeout(timeoutId);
          window.removeEventListener('message', onResult);
          if (event.data.ok) {
            resolve();
          } else {
            reject(new Error(event.data.error ?? 'Playback failed'));
          }
        };

        window.addEventListener('message', onResult);
        playerIframe.contentWindow.postMessage({ type: 'VCE_PLAY', dataUrl }, '*');
      });
    } catch (error) {
      console.warn('[VoiceChrExtention] Audio playback failed:', error);
      playerReadyPromise = null;
      if (playBtn) {
        playBtn.classList.add('vce-play-error');
        playBtn.title = 'Playback failed — click to retry';
      }
    } finally {
      if (playBtn) {
        playBtn.classList.remove('vce-play-active');
      }
    }
  }

  function showResultTooltip(rect, result) {
    removeTooltipEl();
    const shadow = ensureShadowRoot();
    tooltipEl = document.createElement('div');
    tooltipEl.className = 'vce-tooltip';

    if (!result.ok) {
      tooltipEl.classList.add('vce-error');
      tooltipEl.setAttribute('role', 'status');
      tooltipEl.textContent =
        result.error === 'not_found' ? 'Word not found' : 'Network error';
      shadow.appendChild(tooltipEl);
      positionTooltip(tooltipEl, rect);
      return;
    }

    tooltipEl.setAttribute('role', 'group');
    currentAudioDataUrl = result.audioDataUrl ?? null;
    lastResultWord = result.word ?? null;
    lastResultRect = rect;

    const ipaEl = document.createElement('span');
    ipaEl.className = 'vce-ipa';
    if (result.ipa) {
      ipaEl.textContent = formatIpa(result.ipa);
    } else {
      ipaEl.textContent = 'No phonetic';
      ipaEl.classList.add('vce-muted');
    }

    const playBtn = document.createElement('button');
    playBtn.type = 'button';
    playBtn.className = 'vce-play';
    playBtn.setAttribute('aria-label', 'Play pronunciation');
    playBtn.tabIndex = 0;
    playBtn.textContent = '🔊';

    if (!currentAudioDataUrl) {
      playBtn.disabled = true;
      playBtn.title = result.audioUrl ? 'Audio unavailable' : 'No audio';
    } else {
      ensureAudioPlayer().catch(() => {});
      playBtn.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        event.stopPropagation();
      });
      playBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        playAudio();
      });
      playBtn.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          event.stopPropagation();
          playAudio();
        }
      });
    }

    tooltipEl.appendChild(ipaEl);
    tooltipEl.appendChild(playBtn);
    shadow.appendChild(tooltipEl);
    positionTooltip(tooltipEl, rect);
  }

  async function handleSelection(info) {
    if (pendingWord === info.word && tooltipEl?.classList.contains('vce-loading')) {
      return;
    }

    if (
      info.word === lastResultWord &&
      tooltipEl &&
      !tooltipEl.classList.contains('vce-loading') &&
      !tooltipEl.classList.contains('vce-error')
    ) {
      return;
    }

    const { word, rect } = info;
    pendingWord = word;
    showLoadingTooltip(rect);

    let result;
    try {
      result = await chrome.runtime.sendMessage({
        type: MSG_LOOKUP_WORD,
        word,
      });
    } catch {
      result = { ok: false, error: 'network' };
    }

    if (pendingWord !== word) {
      return;
    }

    if (!result) {
      result = { ok: false, error: 'network' };
    }

    showResultTooltip(rect, result);
  }

  function scheduleSelectionCheck() {
    clearTimeout(selectionChangeTimer);
    selectionChangeTimer = setTimeout(() => {
      const info = captureSelectionInfo();
      if (!info) {
        return;
      }
      handleSelection(info).catch(() => {
        hideTooltip();
      });
    }, 50);
  }

  function onPointerUp(event) {
    if (isPointerInsideExtension(event)) {
      return;
    }

    const info = captureSelectionInfo();
    if (!info) {
      hideTooltip();
      return;
    }
    handleSelection(info).catch(() => {
      hideTooltip();
    });
  }

  function onKeyDown(event) {
    if (event.key === 'Escape') {
      hideTooltip();
    }
  }

  document.addEventListener('pointerup', onPointerUp, true);
  document.addEventListener('selectionchange', scheduleSelectionCheck);
  document.addEventListener('keydown', onKeyDown);
})();
