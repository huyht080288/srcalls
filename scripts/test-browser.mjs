/**
 * Browser test on normal + CSP-strict pages.
 * Run: node scripts/test-browser.mjs
 */
import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extensionPath = path.resolve(__dirname, '..');

async function runOnPage(browser, pagePath, label) {
  const page = await browser.newPage();
  const testPage = `file://${path.resolve(__dirname, pagePath)}`;
  await page.goto(testPage, { waitUntil: 'domcontentloaded' });

  await page.evaluate(() => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const index = node.textContent.indexOf('hello');
      if (index >= 0) {
        const range = document.createRange();
        range.setStart(node, index);
        range.setEnd(node, index + 5);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        document.dispatchEvent(
          new PointerEvent('pointerup', { bubbles: true, cancelable: true })
        );
        return;
      }
    }
    throw new Error('hello text node not found');
  });

  await page.waitForFunction(
    () => {
      const host = document.getElementById('voice-chr-ext-root');
      if (!host?.shadowRoot) return false;
      const tooltip = host.shadowRoot.querySelector('.vce-tooltip');
      return tooltip && !tooltip.classList.contains('vce-loading');
    },
    { timeout: 15000 }
  );

  const playResult = await page.evaluate(async () => {
    const host = document.getElementById('voice-chr-ext-root');
    const tooltipBefore = host.shadowRoot.querySelector('.vce-tooltip');
    const playBtn = host.shadowRoot.querySelector('.vce-play');
    if (!playBtn || playBtn.disabled) {
      return { ok: false, error: 'play button missing or disabled' };
    }
    playBtn.click();
    await new Promise((r) => setTimeout(r, 2500));
    const tooltipAfter = host.shadowRoot.querySelector('.vce-tooltip');
    if (!tooltipAfter) {
      return { ok: false, error: 'tooltip disappeared after play click' };
    }
    if (playBtn.classList.contains('vce-play-error')) {
      return { ok: false, error: 'play button shows error state' };
    }
    return { ok: true, stable: tooltipBefore === tooltipAfter };
  });

  if (!playResult.ok) {
    throw new Error(`${label}: ${playResult.error}`);
  }
  if (!playResult.stable) {
    throw new Error(`${label}: tooltip was recreated on play click`);
  }

  await page.close();
  console.log(`${label}: passed`);
}

const browser = await puppeteer.launch({
  headless: false,
  args: [
    `--disable-extensions-except=${extensionPath}`,
    `--load-extension=${extensionPath}`,
    '--no-sandbox',
    '--allow-file-access-from-files',
  ],
});

try {
  await runOnPage(browser, '../test/test-page.html', 'Normal page');
  await runOnPage(browser, '../test/test-page-csp.html', 'CSP strict page');
  console.log('All browser tests passed.');
} finally {
  await browser.close();
}
