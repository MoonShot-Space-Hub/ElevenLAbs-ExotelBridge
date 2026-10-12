// Deterministic motion-graphics engine: a single paused GSAP timeline seeked per frame + pure (t)=>{} hooks.
gsap.config({ force3D: false });
const TL = gsap.timeline({ paused: true, defaults: { immediateRender: false } });
const HOOKS = [];
const BACK_RANGES = [];
function runHooks(t) { for (const h of HOOKS) h(t); }
function backActive(t) { return BACK_RANGES.some(([a, b]) => t >= a - 0.04 && t <= b + 0.04); }
const $back = () => document.getElementById('back');
const $front = () => document.getElementById('front');
function el(tag, cls, parent, style = {}, html = '') {
  const e = document.createElement(tag); if (cls) e.className = cls;
  Object.assign(e.style, style); if (html) e.innerHTML = html; (parent || $front()).appendChild(e); return e;
}
function iconHTML(name, size, color = '#fff', sw = 2.4, fill = 'none') {
  return `<span class="ico" style="width:${size}px;height:${size}px;color:${color}"><svg viewBox="0 0 24 24" fill="${fill}" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg></span>`;
}
const E = (n) => gsap.parseEase(n);
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
function prog(t, t0, d, ease = 'none') { return E(ease)(clamp((t - t0) / d, 0, 1)); }
// visibility window with entrance/exit presets. Element starts hidden.
function win(e, t0, t1, o = {}) {
  const inT = o.inT || 'pop', outT = o.outT || 'fade', dIn = o.dIn ?? 0.3, dOut = o.dOut ?? 0.2;
  gsap.set(e, { autoAlpha: 0 });
  const fromV = {
    pop: { autoAlpha: 0, scale: 0.6 }, pop2: { autoAlpha: 0, scale: 0.85 }, fade: { autoAlpha: 0 },
    left: { autoAlpha: 0, x: -140 }, right: { autoAlpha: 0, x: 160 }, up: { autoAlpha: 0, y: 90 }, down: { autoAlpha: 0, y: -90 },
    stamp: { autoAlpha: 0, scale: 1.7, rotation: o.rot0 ?? -16 }, cut: { autoAlpha: 0 }, flipin: { autoAlpha: 0, rotationX: -80, y: 30 },
  }[inT];
  const toV = { autoAlpha: 1, scale: 1, x: 0, y: 0, rotation: o.rot ?? 0, rotationX: 0 };
  const easeIn = o.easeIn || ({ pop: 'back.out(1.7)', pop2: 'back.out(1.4)', stamp: 'power4.in', cut: 'none' }[inT] || 'power3.out');
  TL.fromTo(e, fromV, { ...toV, duration: inT === 'cut' ? 0.001 : (inT === 'stamp' ? 0.2 : dIn), ease: easeIn, immediateRender: false }, t0);
  if (t1 != null) {
    const outV = { fade: { autoAlpha: 0 }, up: { autoAlpha: 0, y: -80 }, down: { autoAlpha: 0, y: 80 }, left: { autoAlpha: 0, x: -160 },
      right: { autoAlpha: 0, x: 160 }, shrink: { autoAlpha: 0, scale: 0.8 }, cut: { autoAlpha: 0 } }[outT];
    TL.to(e, { ...outV, duration: outT === 'cut' ? 0.001 : dOut, ease: 'power2.in' }, t1 - (outT === 'cut' ? 0 : dOut));
  }
  if (e.parentElement && e.parentElement.id === 'back') BACK_RANGES.push([t0, t1 == null ? 1e9 : t1]);
  return e;
}
// one-shot emphasis pulse
function pulse(e, t, s = 1.08, d = 0.22) { TL.to(e, { scale: s, duration: d * 0.4, ease: 'power2.out' }, t).to(e, { scale: 1, duration: d * 0.6, ease: 'power2.inOut' }, t + d * 0.4); }
function press(e, t) { TL.to(e, { scale: 0.93, duration: 0.09, ease: 'power2.out' }, t).to(e, { scale: 1, duration: 0.16, ease: 'back.out(2)' }, t + 0.09); }
// counter: pure function of t
function counter(e, t0, d, from, to, fmt, ease = 'expo.out') {
  HOOKS.push((t) => { const v = from + (to - from) * prog(t, t0, d, ease); e.textContent = fmt(v); });
}
// SVG path draw-on (stroke-dashoffset), pure function of t
function drawPath(path, t0, d, ease = 'power2.out') {
  const L = path.getTotalLength(); path.style.strokeDasharray = L;
  HOOKS.push((t) => { path.style.strokeDashoffset = L * (1 - prog(t, t0, d, ease)); });
}
// width wipe (e.g. underline / strike / progress fill), pure function of t
function wipe(e, t0, d, ease = 'power2.out', prop = 'scaleX') {
  e.style.transformOrigin = '0% 50%';
  HOOKS.push((t) => { e.style.transform = `${prop}(${prog(t, t0, d, ease)})`; });
}
// ---------- captions ----------
function buildCaptions(groups, hidden = [], opt = {}) {
  const inHidden = (t) => hidden.some(([a, b]) => t >= a && t < b);
  groups.forEach((g, gi) => {
    const next = groups[gi + 1];
    let t0 = g.start, t1 = next ? Math.min(next.start, g.end + 0.6) : g.end + 0.4;
    if (opt.override && opt.override[gi]) Object.assign(g, opt.override[gi]);
    if (g.skip) return;
    // clip against hidden ranges
    for (const [a, b] of hidden) { if (t0 >= a && t0 < b) t0 = b; if (t1 > a && t1 <= b) t1 = a; }
    if (t1 - t0 < 0.08) return;
    const box = el('div', 'cap', $front(), { top: (g.top ?? opt.top ?? 1180) + 'px' });
    const mk = (cls) => {
      const d = el('div', 'txt ' + cls, box);
      g.words.forEach((w, wi) => {
        const s = document.createElement('span'); s.className = 'w'; s.dataset.i = wi;
        s.textContent = w.kw ? w.w.toUpperCase() : w.w; d.appendChild(s);
      });
      return d;
    };
    const st = mk('stroke'), fi = mk('fill');
    if (g.size) { st.style.fontSize = fi.style.fontSize = g.size + 'px'; }
    else {  // auto-fit: prefer one line; shrink down to 70px before allowing a balanced 2-line wrap
      for (const fz of [84, 80, 76, 72, 70]) {
        st.style.fontSize = fi.style.fontSize = fz + 'px';
        if (fi.getBoundingClientRect().height < fz * 1.5 && fi.scrollWidth <= 860) break;
      }
      if (fi.getBoundingClientRect().height >= 70 * 1.5) st.style.fontSize = fi.style.fontSize = '82px';
    }
    gsap.set(box, { autoAlpha: 0, transformOrigin: '50% 50%' });
    TL.fromTo(box, { autoAlpha: 1, scale: 0.9, y: 14 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.13, ease: 'power2.out', immediateRender: false }, t0);
    TL.set(box, { autoAlpha: 0 }, t1);
    g.words.forEach((w, wi) => {
      if (!w.kw) return;
      const ws = [st.children[wi], fi.children[wi]];
      const tk = Math.max(t0, w.start);
      if (tk > t0 + 0.02) TL.set(fi.children[wi], { color: '#fff' }, t0);
      TL.set(fi.children[wi], { color: opt.kwColor || '#FFC531' }, tk);
      ws.forEach((s) => TL.fromTo(s, { scale: 1 }, { scale: 1.04, duration: 0.07, ease: 'power2.out', immediateRender: false }, tk).to(s, { scale: 1, duration: 0.14, ease: 'power2.inOut' }, tk + 0.07));
    });
  });
}
// ---------- component helpers ----------
function svgEl(parent, w, h, inner, style = {}) {
  const d = el('div', 'abs', parent, { width: w + 'px', height: h + 'px', ...style });
  d.innerHTML = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="overflow:visible">${inner}</svg>`;
  return d;
}
// red cross that draws on (two strokes)
function crossMark(parent, x, y, s, t0, color = '#E5484D') {
  const d = svgEl(parent, s, s, `<circle cx="${s / 2}" cy="${s / 2}" r="${s / 2 - 3}" fill="${color}"/>
    <path class="a" d="M${s * .32} ${s * .32} L${s * .68} ${s * .68}" stroke="#fff" stroke-width="${s * .12}" stroke-linecap="round" fill="none"/>
    <path class="b" d="M${s * .68} ${s * .32} L${s * .32} ${s * .68}" stroke="#fff" stroke-width="${s * .12}" stroke-linecap="round" fill="none"/>`, { left: x + 'px', top: y + 'px' });
  drawPath(d.querySelector('.a'), t0 + 0.05, 0.12); drawPath(d.querySelector('.b'), t0 + 0.15, 0.12);
  return d;
}
function checkMark(parent, x, y, s, t0, color = '#22C55E') {
  const d = svgEl(parent, s, s, `<circle cx="${s / 2}" cy="${s / 2}" r="${s / 2 - 3}" fill="${color}"/>
    <path class="a" d="M${s * .28} ${s * .52} L${s * .44} ${s * .67} L${s * .73} ${s * .36}" stroke="#fff" stroke-width="${s * .12}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`, { left: x + 'px', top: y + 'px' });
  drawPath(d.querySelector('.a'), t0 + 0.05, 0.22);
  return d;
}
// hand cursor (lucide pointer, filled white, navy outline) that taps at time t
function handTap(parent, x, y, t0, tTap, t1, size = 120) {
  const h = el('div', 'abs', parent, { left: x + 'px', top: y + 'px', width: size + 'px', height: size + 'px', filter: 'drop-shadow(0 6px 10px rgba(0,0,0,.45))' },
    `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="#fff" stroke="#0B1F4D" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICONS['pointer']}</svg>`);
  gsap.set(h, { autoAlpha: 0, transformOrigin: '40% 10%' });
  TL.fromTo(h, { autoAlpha: 0, x: 90, y: 120, rotation: 12 }, { autoAlpha: 1, x: 0, y: 0, rotation: 0, duration: 0.3, ease: 'power3.out', immediateRender: false }, t0);
  TL.to(h, { scale: 0.86, duration: 0.09, ease: 'power2.out' }, tTap).to(h, { scale: 1, duration: 0.18, ease: 'back.out(2)' }, tTap + 0.09);
  TL.to(h, { autoAlpha: 0, duration: 0.15 }, t1 - 0.15);
  // ripple ring at fingertip
  const r = el('div', 'abs', parent, { left: (x + size * 0.36 - 60) + 'px', top: (y + size * 0.05 - 60) + 'px', width: '120px', height: '120px', borderRadius: '50%', border: '6px solid rgba(255,197,49,.95)' });
  gsap.set(r, { autoAlpha: 0, scale: 0.2 });
  TL.fromTo(r, { autoAlpha: 1, scale: 0.2 }, { autoAlpha: 0, scale: 1.4, duration: 0.45, ease: 'power2.out', immediateRender: false }, tTap + 0.02);
  return h;
}
// bouncing chevrons pointing down
function chevrons(parent, x, y, t0, t1, size = 90, color = '#FFC531', amp = 22) {
  const c = el('div', 'abs', parent, { left: x + 'px', top: y + 'px', width: size + 'px', height: size + 'px', filter: 'drop-shadow(0 3px 6px rgba(0,0,0,.5))' }, iconHTML('chevrons-down', size, color, 3));
  win(c, t0, t1, { inT: 'down', dIn: 0.25 });
  HOOKS.push((t) => { if (t > t0 + 0.25 && t < t1) { const k = (t - t0 - 0.25) / 0.55; const n = Math.min(k, 3); c.style.translate = `0 ${n < 3 ? Math.abs(Math.sin(Math.PI * n)) * amp : 0}px`; } });
  return c;
}
