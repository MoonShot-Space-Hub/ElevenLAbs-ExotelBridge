// VBM AD ST-1 ("This Diwali, gift your future self a skill") — cue sheet. Times = seconds in the source (speech-synced).
// Same system as the ABCT ad: captions + at most one graphic + compliance strip; content inside x 60–960 / y 250–1500;
// cards are auto-height; no money imagery; claims shown only as spoken.
const T_END = window.T_END || 50.03;            // 48.03 s footage + 2.0 s end-card freeze
const SRC_END = 48.03;
const AMB = '#FFC531', NAVY = '#0B1F4D', RED = '#D92D20', GREEN = '#16A34A', MUTED = '#C9D3E8', PAPER = '#F7F8FA', SLATE = '#5B6478';
const TOP = { x: 60, y: 262, w: 900 };        // top band above the head (composited BEHIND the presenter)
const LOW = { x: 70, y: 960, w: 880 };        // lower slot over the chest (bottom kept ≤ 1405)
const CX = 510;
const shadowTxt = '0 4px 14px rgba(0,0,0,.55), 0 1px 3px rgba(0,0,0,.6)';
function html(parent, style, inner) { return el('div', 'abs', parent || $front(), style, inner); }
function playIcon(size, bg, fg) {
  return `<span style="display:inline-flex;flex:0 0 auto;align-items:center;justify-content:center;width:${size}px;height:${size}px;border-radius:50%;background:${bg}">
    <svg viewBox="0 0 24 24" width="${size * .46}" height="${size * .46}" style="margin-left:${size * .06}px"><path d="M6 4l14 8-14 8z" fill="${fg}"/></svg></span>`;
}
function growCard(card, h0, steps) { gsap.set(card, { height: h0 }); steps.forEach(([t, h]) => TL.to(card, { height: h, duration: 0.24, ease: 'power3.out' }, t)); }
// small Diwali diya (lamp) with a flickering flame — pure function of t
function diya(parent, size, style = {}) {
  const d = el('span', '', parent, { display: 'inline-block', width: size + 'px', height: size + 'px', position: 'relative', flex: '0 0 auto', ...style });
  d.innerHTML = `<svg viewBox="0 0 64 64" width="${size}" height="${size}" style="overflow:visible">
    <defs><radialGradient id="dg" cx="50%" cy="60%" r="60%"><stop offset="0" stop-color="#FFF3B0"/><stop offset=".55" stop-color="#FFC531"/><stop offset="1" stop-color="#FF7A00"/></radialGradient>
    <linearGradient id="db" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E58A1F"/><stop offset="1" stop-color="#9A3B0C"/></linearGradient></defs>
    <circle class="glow" cx="32" cy="24" r="20" fill="#FFC531" opacity=".28"/>
    <path class="flame" d="M32 6 C40 18 40 28 32 34 C24 28 24 18 32 6 Z" fill="url(#dg)"/>
    <path d="M6 36 Q32 66 58 36 Q46 42 32 42 Q18 42 6 36 Z" fill="url(#db)"/>
    <ellipse cx="32" cy="37" rx="17" ry="4" fill="#5A1A05" opacity=".6"/></svg>`;
  const fl = d.querySelector('.flame'), gl = d.querySelector('.glow');
  HOOKS.push((t) => { const k = 1 + 0.06 * Math.sin(t * 17) + 0.04 * Math.sin(t * 29 + 1); fl.setAttribute('transform', `translate(32 34) scale(${1 / k} ${k}) translate(-32 -34)`); gl.setAttribute('opacity', (0.22 + 0.1 * Math.sin(t * 11)).toFixed(3)); });
  return d;
}
// twinkling 4-point gold sparkles around a box
function sparkles(parent, pts, t0, t1) {
  pts.forEach(([x, y, s, ph]) => {
    const sp = el('div', 'abs', parent, { left: x + 'px', top: y + 'px', width: s + 'px', height: s + 'px' },
      `<svg viewBox="0 0 24 24" width="${s}" height="${s}"><path d="M12 0 C13 9 15 11 24 12 C15 13 13 15 12 24 C11 15 9 13 0 12 C9 11 11 9 12 0 Z" fill="#FFD966"/></svg>`);
    HOOKS.push((t) => { const on = t >= t0 && t < t1; const k = on ? 0.5 + 0.5 * Math.sin((t - t0) * 5 + ph) : 0; sp.style.opacity = (on ? 0.25 + 0.75 * k : 0).toFixed(3); sp.style.transform = `scale(${0.6 + 0.5 * k}) rotate(${(t * 40 + ph * 30) % 360}deg)`; });
  });
}
// chip used in grids/banners: icon in amber circle + label
function chipHTML(icon, label, opt = {}) {
  const dark = opt.dark, fs = opt.fs || 30;
  return `<div class="chip" style="display:flex;align-items:center;gap:14px;height:${opt.h || 68}px;padding:0 18px 0 12px;border-radius:16px;
    background:${dark ? 'rgba(255,255,255,.10)' : 'rgba(11,31,77,.07)'};border:2px solid ${dark ? 'rgba(255,255,255,.14)' : 'rgba(11,31,77,.10)'};${opt.style || ''}">
    <span style="flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;width:46px;height:46px;border-radius:50%;background:${AMB}">${iconHTML(icon, 28, NAVY, 2.6)}</span>
    <span style="font:800 ${fs}px MS;color:${dark ? '#fff' : NAVY};white-space:nowrap">${label}</span></div>`;
}
function buildAll() {
  const F = $front(), B = $back();
  // ---------------- captions (handed off to the card that carries the same words) ----------------
  const HIDE = [[6.08, 13.20], [14.08, 17.40], [45.04, 99]];
  buildCaptions(CAPTIONS, HIDE);

  // ---------------- compliance strip (static) ----------------
  const disc = html(F, { left: '60px', top: '1418px', width: '900px', display: 'flex', justifyContent: 'center' },
    `<div style="background:rgba(20,4,24,.58);border-radius:14px;padding:5px 20px;font:500 28px/1.25 MS;color:rgba(255,255,255,.9);text-align:center;white-space:nowrap">Educational content only &nbsp;•&nbsp; Not investment advice<br>Trading involves market risk &nbsp;•&nbsp; No assured returns</div>`);
  gsap.set(disc, { autoAlpha: 1 }); TL.set(disc, { autoAlpha: 0 }, SRC_END);

  // ---------------- 0.00–3.05 HOOK: fully built on frame 0 (= thumbnail) ----------------
  const scrim = html(F, { left: 0, top: 0, width: '1080px', height: '760px', background: 'linear-gradient(180deg, rgba(30,4,36,.62) 0%, rgba(30,4,36,.32) 60%, rgba(30,4,36,0) 100%)' });
  const hook = html(F, { left: '60px', top: '250px', width: '900px', textAlign: 'center' }, `
    <div class="hk-pill" style="display:inline-flex;align-items:center;gap:12px;background:${AMB};color:${NAVY};border-radius:999px;padding:6px 28px 6px 14px;font:800 34px MS;letter-spacing:1px;box-shadow:0 8px 22px rgba(0,0,0,.35)">
      <span class="dy"></span>THIS DIWALI &nbsp;•&nbsp; FREE MASTERCLASS</div>
    <div class="l1" style="margin-top:16px;font:900 62px/1 MS;color:#fff;text-shadow:${shadowTxt};letter-spacing:-0.5px;white-space:nowrap">GIFT YOUR FUTURE SELF</div>
    <div class="l2" style="position:relative;display:inline-flex;align-items:center;gap:18px;margin-top:10px;font:900 128px/1 MS;color:${AMB};text-shadow:${shadowTxt};letter-spacing:-1px">
      <span class="gi" style="display:inline-block;filter:drop-shadow(0 4px 10px rgba(0,0,0,.5))">${iconHTML('gift', 104, AMB, 2.2)}</span>A SKILL</div>`);
  diya(hook.querySelector('.dy'), 46);
  sparkles(hook, [[70, 120, 34, 0], [820, 60, 28, 1.7], [760, 300, 38, 3.1], [110, 300, 26, 4.4], [455, -6, 22, 2.2]], 0, 3.1);
  gsap.set([hook, scrim], { autoAlpha: 1 });
  TL.fromTo(hook, { scale: 1.05 }, { scale: 1, duration: 0.35, ease: 'power3.out', immediateRender: true }, 0);
  pulse(hook.querySelector('.hk-pill'), 0.32, 1.06, 0.3);            // 'Diwali'
  pulse(hook.querySelector('.l1'), 1.04, 1.05, 0.3);              // 'gift'
  pulse(hook.querySelector('.l2'), 2.40, 1.08, 0.32);             // 'skill'
  TL.fromTo(hook.querySelector('.gi'), { rotation: 0 }, { rotation: -10, duration: 0.12, yoyo: true, repeat: 3, ease: 'sine.inOut', immediateRender: false }, 1.04);
  TL.to(hook, { autoAlpha: 0, y: -60, duration: 0.16, ease: 'power2.in' }, 2.92);
  TL.to(scrim, { autoAlpha: 0, duration: 0.2 }, 2.92);

  // ---------------- 5.92–13.20 'WHAT YOU'LL LEARN' grid (paper card, lower slot) ----------------
  const cur = html(F, { left: LOW.x + 'px', top: LOW.y + 'px', width: LOW.w + 'px', borderRadius: '28px', background: PAPER, boxShadow: '0 16px 36px rgba(0,0,0,.4)', overflow: 'hidden' });
  cur.innerHTML = `<div style="position:absolute;left:28px;top:24px;display:inline-flex;align-items:center;gap:12px;background:${NAVY};color:#fff;border-radius:999px;padding:7px 24px 7px 12px;font:900 30px MS;letter-spacing:1.5px">${iconHTML('graduation-cap', 34, AMB, 2.4)} WHAT YOU'LL LEARN</div>`;
  const items = [['search', 'Analyze the stock', 6.24], ['log-in', 'When to buy', 7.68], ['log-out', 'When to sell', 8.40], ['door-open', 'When to exit', 9.28],
                 ['scale', 'How much to buy', 10.32], ['scale', 'How much to sell', 11.12], ['brain', 'How to manage your emotions', 12.62]];
  items.forEach(([ic, label, t], i) => {
    const row = Math.floor(i / 2), col = i % 2, full = i === 6;
    const c = html(cur, { left: (28 + (full ? 0 : col * 420)) + 'px', top: (98 + row * 80) + 'px', width: (full ? 824 : 404) + 'px' }, chipHTML(ic, label));
    gsap.set(c, { autoAlpha: 0 });
    TL.fromTo(c, { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1, duration: 0.26, ease: 'back.out(1.8)', immediateRender: false }, t);
    const ch = c.querySelector('.chip');
    TL.fromTo(ch, { backgroundColor: 'rgba(255,197,49,.55)' }, { backgroundColor: 'rgba(11,31,77,.07)', duration: 0.6, ease: 'power2.out', immediateRender: false }, t);
  });
  gsap.set(cur, { autoAlpha: 0 });
  growCard(cur, 190, [[8.36, 270], [10.28, 350], [12.58, 430]]);
  TL.fromTo(cur, { autoAlpha: 0, y: 80 }, { autoAlpha: 1, y: 0, duration: 0.22, ease: 'power3.out', immediateRender: false }, 6.08);
  TL.to(cur, { autoAlpha: 0, y: 60, duration: 0.16, ease: 'power2.in' }, 12.98);

  // ---------------- 14.08–17.40 '1 SIMPLE MASTERCLASS' → 'ABCT with AI' reveal (navy, lower slot) ----------------
  const rv = html(F, { left: LOW.x + 'px', top: (LOW.y + 20) + 'px', width: LOW.w + 'px', height: '330px' });
  const rvc = el('div', 'card abs', rv, { inset: '0px', textAlign: 'center' });
  rvc.innerHTML = `<div class="r0" style="position:absolute;left:0;right:0;top:44px;font:700 36px MS;color:${MUTED};letter-spacing:2px">EVERYTHING IN</div>
    <div class="r1" style="position:absolute;left:0;right:0;top:100px;font:900 84px/1.05 MS;color:${AMB};letter-spacing:-1px">1 SIMPLE<br><span style="color:#fff">MASTERCLASS</span></div>
    <div class="r2" style="position:absolute;left:0;right:0;top:62px;font:900 128px/1 MS;color:#fff;letter-spacing:4px">ABCT</div>
    <div class="r3" style="position:absolute;left:0;right:0;top:204px;display:flex;align-items:center;justify-content:center;gap:16px;font:900 80px/1 MS;color:${AMB}">with AI ${iconHTML('sparkles', 70, AMB, 2.4)}</div>`;
  const qr = (s) => rvc.querySelector(s);
  gsap.set(rv, { autoAlpha: 0 }); gsap.set([qr('.r1'), qr('.r2'), qr('.r3')], { autoAlpha: 0 });
  TL.fromTo(rv, { autoAlpha: 0, y: 80 }, { autoAlpha: 1, y: 0, duration: 0.26, ease: 'power3.out', immediateRender: false }, 14.08);
  win(qr('.r1'), 14.40, null, { inT: 'pop', dIn: 0.34 });
  TL.to([qr('.r0'), qr('.r1')], { autoAlpha: 0, scale: 0.9, duration: 0.1, ease: 'power2.in' }, 15.72);
  win(qr('.r2'), 15.82, null, { inT: 'stamp', rot: 0, rot0: 0 });
  win(qr('.r3'), 16.64, null, { inT: 'up', dIn: 0.3 });
  sparkles(rvc, [[120, 40, 40, 0.3], [740, 60, 34, 2.0], [690, 250, 30, 1.1], [150, 240, 36, 3.3]], 16.64, 17.40);
  TL.to(rv, { autoAlpha: 0, y: 60, duration: 0.16, ease: 'power2.in' }, 17.26);

  // ---------------- 20.30–25.40 'IN THIS MASTERCLASS' (top band, behind presenter) ----------------
  const tb1 = html(B, { left: TOP.x + 'px', top: TOP.y + 'px', width: TOP.w + 'px' }, `
    <div class="card" style="position:relative;padding:20px 24px 22px">
      <div style="display:flex;align-items:center;gap:12px;font:800 28px MS;color:${AMB};letter-spacing:3px">${iconHTML('graduation-cap', 32, AMB, 2.4)} YOU WILL LEARN</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px">
        <div class="k1">${chipHTML('cog', 'Trading system', { dark: true, h: 70, fs: 32 })}</div><div class="k2">${chipHTML('log-in', 'When to enter', { dark: true, h: 70, fs: 32 })}</div>
        <div class="k3">${chipHTML('door-open', 'When to exit', { dark: true, h: 70, fs: 32 })}</div><div class="k4">${chipHTML('search', 'Stock selection', { dark: true, h: 70, fs: 32 })}</div>
      </div></div>`);
  win(tb1, 21.02, 25.40, { inT: 'down', dIn: 0.26, outT: 'up', dOut: 0.16 });
  const tb1c = tb1.querySelector('.card'); tb1c.style.overflow = 'hidden';
  growCard(tb1c, 168, [[22.98, 250]]);
  [['.k1', 21.20], ['.k2', 22.40], ['.k3', 23.04], ['.k4', 24.00]].forEach(([s, t]) => win(tb1.querySelector(s), t, null, { inT: 'pop2', dIn: 0.24 }));

  // ---------------- 26.50–30.30 'USE AI TO' (top band, behind presenter) ----------------
  const tb2 = html(B, { left: TOP.x + 'px', top: TOP.y + 'px', width: TOP.w + 'px' }, `
    <div class="card" style="position:relative;padding:20px 24px 22px">
      <div style="display:flex;align-items:center;gap:12px;font:800 28px MS;color:${AMB};letter-spacing:3px">${iconHTML('sparkles', 32, AMB, 2.4)} USE AI TO</div>
      <div style="display:flex;gap:12px;margin-top:14px">
        <div class="a1" style="flex:1">${chipHTML('timer', 'Save time', { dark: true, h: 70, fs: 31 })}</div>
        <div class="a2" style="flex:1">${chipHTML('scan-search', 'Scan stocks', { dark: true, h: 70, fs: 31 })}</div>
        <div class="a3" style="flex:1">${chipHTML('cog', 'Automate', { dark: true, h: 70, fs: 31 })}</div></div></div>`);
  win(tb2, 27.10, 30.30, { inT: 'down', dIn: 0.26, outT: 'up', dOut: 0.16 });
  [['.a1', 27.28], ['.a2', 28.08], ['.a3', 29.04]].forEach(([s, t]) => win(tb2.querySelector(s), t, null, { inT: 'pop2', dIn: 0.24 }));

  // ---------------- 31.70–33.80 'KEEP DOING YOUR job / business' (top band, behind presenter) ----------------
  const tb3 = html(B, { left: TOP.x + 'px', top: TOP.y + 'px', width: TOP.w + 'px' }, `
    <div class="card" style="position:relative;padding:20px 24px 22px">
      <div style="display:flex;align-items:center;gap:12px;font:800 28px MS;color:${AMB};letter-spacing:3px">${iconHTML('timer', 32, AMB, 2.4)} SAVE TIME FOR YOUR</div>
      <div style="display:flex;gap:12px;margin-top:14px;align-items:center">
        <div class="j1" style="flex:1">${chipHTML('briefcase', 'Regular job', { dark: true, h: 70, fs: 32 })}</div>
        <div class="jor" style="font:800 30px MS;color:${MUTED}">or</div>
        <div class="j2" style="flex:1">${chipHTML('store', 'Business', { dark: true, h: 70, fs: 32 })}</div></div></div>`);
  win(tb3, 32.16, 33.80, { inT: 'down', dIn: 0.26, outT: 'up', dOut: 0.16 });
  win(tb3.querySelector('.j1'), 32.32, null, { inT: 'pop2', dIn: 0.24 });
  win(tb3.querySelector('.jor'), 33.04, null, { inT: 'fade', dIn: 0.15 });
  win(tb3.querySelector('.j2'), 33.20, null, { inT: 'pop2', dIn: 0.24 });

  // ---------------- 36.30–38.80 'NO NEED TO leave everything' (top band, behind presenter) ----------------
  const tb4 = html(B, { left: TOP.x + 'px', top: TOP.y + 'px', width: TOP.w + 'px' }, `
    <div style="border-radius:28px;background:${PAPER};box-shadow:0 14px 34px rgba(0,0,0,.38);padding:18px 26px 22px">
      <div style="display:inline-flex;align-items:center;gap:10px;background:${RED};color:#fff;border-radius:999px;padding:6px 20px 6px 10px;font:900 28px MS;letter-spacing:1.5px">${iconHTML('x', 30, '#fff', 3.4)} NO NEED TO</div>
      <div class="lv" style="display:flex;align-items:center;gap:20px;margin-top:14px">
        <div class="mk" style="position:relative;width:62px;height:62px;flex:0 0 auto"></div>
        <div style="position:relative;font:800 56px MS;color:${SLATE};white-space:nowrap">Leave everything
          <div class="st" style="position:absolute;left:-6px;right:-6px;top:50%;height:8px;margin-top:-2px;border-radius:4px;background:${RED}"></div></div></div></div>`);
  win(tb4, 36.92, 38.80, { inT: 'down', dIn: 0.24, outT: 'up', dOut: 0.16 });
  gsap.set(tb4.querySelector('.lv'), { autoAlpha: 0 });
  TL.fromTo(tb4.querySelector('.lv'), { autoAlpha: 0, x: -30 }, { autoAlpha: 1, x: 0, duration: 0.2, ease: 'power3.out', immediateRender: false }, 37.04);
  crossMark(tb4.querySelector('.mk'), 0, 0, 62, 37.04);

  // ---------------- 45.04–end final CTA end card ----------------
  const end = html(F, { left: '60px', top: '930px', width: '900px', textAlign: 'center' }, `
    <div class="e1" style="font:900 56px/1.1 MS;color:#fff;text-shadow:${shadowTxt};white-space:nowrap">JOIN THE <span style="color:${AMB}">FREE</span> MASTERCLASS</div>
    <div class="e2" style="margin-top:10px;display:flex;align-items:center;justify-content:center;gap:12px;font:900 54px/1 MS;color:#fff;text-shadow:${shadowTxt};letter-spacing:2px">ABCT <span style="color:${AMB}">with AI</span>${iconHTML('sparkles', 48, AMB, 2.4)}</div>
    <div class="btn" style="margin:24px auto 0;width:760px;height:122px;border-radius:999px;background:${AMB};display:flex;align-items:center;justify-content:center;gap:20px;
      font:900 58px MS;color:${NAVY};box-shadow:0 14px 30px rgba(0,0,0,.45),inset 0 -6px 0 rgba(0,0,0,.12)">${playIcon(76, NAVY, AMB)} JOIN NOW</div>
    <div class="tap" style="margin-top:14px;font:800 40px MS;color:#fff;text-shadow:${shadowTxt}">Tap the button below <span class="emoji">👇</span></div>`);
  win(end, 45.04, null, { inT: 'up', dIn: 0.32 });
  const qe = (s) => end.querySelector(s);
  pulse(qe('.e1'), 46.64, 1.05, 0.3);                       // 'free'
  win(qe('.tap'), 45.30, null, { inT: 'pop2', dIn: 0.26 });
  chevrons(F, CX - 40, 1290, 45.40, T_END + 1, 80, AMB, 10);
  handTap(F, CX + 6, 1322, 45.00, 45.22, 46.10, 104);       // taps the chevron tip on 'click'
  sparkles(end, [[40, -30, 34, 0.4], [830, -20, 30, 2.1], [860, 180, 36, 3.6], [20, 200, 28, 1.3]], 45.3, T_END + 1);
  TL.to(qe('.btn'), { scale: 1.035, duration: 0.42, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 48.10);
  const legal = html(F, { left: '60px', top: '1376px', width: '900px', textAlign: 'center' },
    `<div style="display:inline-block;background:rgba(20,4,24,.62);border-radius:16px;padding:8px 20px;font:500 28px/1.25 MS;color:rgba(255,255,255,.92);white-space:nowrap">
      Investments in securities market are subject to market risks.<br>Educational content only. Not investment advice.<br>No assured returns or income.</div>`);
  win(legal, SRC_END, null, { inT: 'fade', dIn: 0.2 });
}
