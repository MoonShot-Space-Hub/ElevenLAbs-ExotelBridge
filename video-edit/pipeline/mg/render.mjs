// Frame-accurate overlay renderer: loads page.html?layer=X, calls window.seek(t) per frame, saves transparent PNGs.
// usage: node render.mjs <layer> <outDir> <fps_num/den> <nFrames> <workers> [from] [to]
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs'; import path from 'path'; import url from 'url';
const [layer, outDir, fpsStr, nStr, wStr, fromStr, toStr] = process.argv.slice(2);
const [fn, fd] = fpsStr.split('/').map(Number); const fps = fn / (fd || 1);
const n = +nStr, workers = +wStr || 3; const from = fromStr ? +fromStr : 0, to = toStr ? +toStr : n;
fs.mkdirSync(outDir, { recursive: true });
const here = path.dirname(url.fileURLToPath(import.meta.url));
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--font-render-hinting=none', '--disable-lcd-text', '--force-color-profile=srgb'] });
const t0 = Date.now(); let done = 0, skipped = 0;
async function worker(w) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('console', m => { if (m.type() === 'error') console.error('[page]', m.text()); });
  page.on('pageerror', e => console.error('[pageerror]', e.message));
  await page.goto('file://' + path.join(here, 'page.html') + '?layer=' + layer);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 30000 });
  for (let i = from + w; i < to; i += workers) {
    const t = i / fps;
    const active = await page.evaluate(t => window.seek(t), t);
    const file = path.join(outDir, `f_${String(i).padStart(5, '0')}.png`);
    if (!active) { skipped++; if (fs.existsSync(file)) fs.unlinkSync(file); continue; }
    await page.screenshot({ path: file, omitBackground: true, type: 'png' });
    done++;
    if ((done + skipped) % 200 === 0) console.log(`${layer}: ${done + skipped}/${to - from} (${skipped} empty) ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  await page.close();
}
await Promise.all(Array.from({ length: workers }, (_, w) => worker(w)));
await browser.close();
console.log(`${layer}: done ${done} rendered, ${skipped} empty, ${((Date.now() - t0) / 1000).toFixed(0)}s`);
