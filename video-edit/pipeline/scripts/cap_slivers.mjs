// Report caption groups whose visible span (after clipping to hidden ranges) is shorter than the 0.13 s pop-in.
import fs from 'fs';
const [capFile, hideJSON] = process.argv.slice(2);
const src = fs.readFileSync(capFile, 'utf8'); const groups = JSON.parse(src.slice(src.indexOf('['), src.lastIndexOf(']') + 1));
const hidden = JSON.parse(hideJSON);
groups.forEach((g, gi) => {
  const next = groups[gi + 1]; let t0 = g.start, t1 = next ? Math.min(next.start, g.end + 0.6) : g.end + 0.4;
  for (const [a, b] of hidden) { if (t0 >= a && t0 < b) t0 = b; if (t1 > a && t1 <= b) t1 = a; }
  if (t1 - t0 < 0.08) return;
  if (t1 - t0 < 0.25) console.log(`group ${gi} ${t0.toFixed(3)}-${t1.toFixed(3)} span ${(t1 - t0).toFixed(3)} "${g.words.map(w => w.w).join(' ')}"`);
});
