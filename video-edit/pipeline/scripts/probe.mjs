import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const [page_, t, sel] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
await p.goto('file://' + page_ + '?layer=front'); await p.waitForFunction(() => window.__ready === true);
await p.evaluate(t => window.seek(+t), t);
const r = await p.evaluate((sel) => [...document.querySelectorAll(sel)].map(e => { const b = e.getBoundingClientRect(); return [e.className, Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height), getComputedStyle(e).position, getComputedStyle(e).display]; }), sel);
console.log(JSON.stringify(r));
await b.close();
