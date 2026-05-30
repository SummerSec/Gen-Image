// One-off: spawn the preview server and capture desktop + mobile screenshots.
// Usage: npm run build && node scripts/screenshot.mjs
import { spawn, execSync } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { chromium } from '@playwright/test';

const PORT = 4173;
const URL = `http://localhost:${PORT}/`;
const CARD = 'aside button[title^="点击"]';

const server = spawn('npm', ['run', 'preview', '--', '--port', String(PORT), '--strictPort'], { shell: true, stdio: 'ignore' });

function killServer() {
  if (process.platform === 'win32') {
    try { execSync(`taskkill /pid ${server.pid} /T /F`); } catch { /* ignore */ }
  } else {
    server.kill();
  }
}

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(URL)).ok) return; } catch { /* not up yet */ }
    await sleep(500);
  }
  throw new Error('preview server did not start');
}

try {
  await waitForServer();
  const browser = await chromium.launch();

  // Desktop: pick a template so the composer shows a prompt + reference.
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await desktop.goto(URL, { waitUntil: 'load' });
  await desktop.waitForSelector(CARD, { timeout: 15000 });
  await desktop.click(CARD);
  await sleep(1200);
  await desktop.screenshot({ path: 'output/screenshot-final.png' });
  await desktop.close();

  // Mobile: prompt library grid (open by default, overlays full screen).
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await mobile.goto(URL, { waitUntil: 'load' });
  await mobile.waitForSelector(CARD, { timeout: 15000 });
  await sleep(1200);
  await mobile.screenshot({ path: 'output/screenshot-mobile.png' });
  await mobile.close();

  await browser.close();
  console.log('screenshots written to output/');
} finally {
  killServer();
}
