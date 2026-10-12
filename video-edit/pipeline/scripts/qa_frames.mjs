// Render given frame indices for a layer into dir as f_XXXXX.png (same naming as render.mjs).
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs';
const [page_, layer, out, ...frames] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
p.on('pageerror', e => console.error('[pageerror]', e.message));
await p.goto('file://' + page_ + '?layer=' + layer); await p.waitForFunction(() => window.__ready === true);
for (const f of frames.map(Number).sort((a, b) => a - b)) {
  const active = await p.evaluate(t => window.seek(t), f / eval(process.env.FPSV || '60000/1001'));
  const file = `${out}/f_${String(f).padStart(5, '0')}.png`;
  if (active) await p.screenshot({ path: file, omitBackground: true }); else if (fs.existsSync(file)) fs.unlinkSync(file);
}
await b.close();
