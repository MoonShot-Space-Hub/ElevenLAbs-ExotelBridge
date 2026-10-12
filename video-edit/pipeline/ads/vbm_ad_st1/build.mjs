// Bundles lucide icons + caption timing data into plain JS files the page can load over file://
import fs from 'fs';
const names = ['search','log-in','log-out','door-open','scale','brain','briefcase','store','scan-search','cog','flame','star','users','graduation-cap','play','clock','lock','lock-open','sparkles','pointer','mouse-pointer-click','chevron-down','chevrons-down','calendar-days','video','candlestick-chart','settings-2','x','check','circle-check','circle-x','link','bot','badge-check','arrow-right','square-play','cpu','wand-sparkles','shield-check','gift','timer'];
const icons = {};
for (const n of names) {
  const s = fs.readFileSync(`node_modules/lucide-static/icons/${n}.svg`, 'utf8');
  icons[n] = s.slice(s.indexOf('>', s.indexOf('<svg')) + 1, s.lastIndexOf('</svg>')).trim();
}
fs.writeFileSync('icons.js', 'window.ICONS = ' + JSON.stringify(icons) + ';\n');
const caps = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
fs.writeFileSync('captions.js', 'window.CAPTIONS = ' + JSON.stringify(caps) + ';\n');
console.log('icons', Object.keys(icons).length, 'caption groups', caps.length);
