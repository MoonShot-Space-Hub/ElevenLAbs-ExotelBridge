// "Ai Genric VBM 3-2" ("I wish I had 28 hours a day") — cue sheet. Times = seconds in the 60 fps source (English VO).
// Same system as the other ads. Captions sit higher (y≈1030) because the bottom of this shot is a bright white table.
const T_END = window.T_END || 51.08;           // 49.08 s footage + 2.0 s end-card freeze
const SRC_END = 49.08;
const AMB = '#FFC531', NAVY = '#0B1F4D', RED = '#D92D20', GREEN = '#16A34A', MUTED = '#C9D3E8', PAPER = '#F7F8FA', SLATE = '#5B6478';
const TOP = { x: 60, y: 262, w: 900 }, LOW = { x: 70, y: 975, w: 880 }, CX = 510;
const shadowTxt = '0 4px 14px rgba(0,0,0,.55), 0 1px 3px rgba(0,0,0,.6)';
function html(parent, style, inner) { return el('div', 'abs', parent || $front(), style, inner); }
function playIcon(size, bg, fg) {
  return `<span style="display:inline-flex;flex:0 0 auto;align-items:center;justify-content:center;width:${size}px;height:${size}px;border-radius:50%;background:${bg}">
    <svg viewBox="0 0 24 24" width="${size * .46}" height="${size * .46}" style="margin-left:${size * .06}px"><path d="M6 4l14 8-14 8z" fill="${fg}"/></svg></span>`;
}
function growCard(card, h0, steps) { gsap.set(card, { height: h0 }); steps.forEach(([t, h]) => TL.to(card, { height: h, duration: 0.24, ease: 'power3.out' }, t)); }
function chipHTML(icon, label, opt = {}) {
  const dark = opt.dark, fs = opt.fs || 30;
  return `<div class="chip" style="display:flex;align-items:center;gap:14px;height:${opt.h || 68}px;padding:0 18px 0 12px;border-radius:16px;
    background:${opt.bg || (dark ? 'rgba(255,255,255,.10)' : 'rgba(11,31,77,.07)')};border:2px solid ${dark ? 'rgba(255,255,255,.14)' : 'rgba(11,31,77,.10)'};${opt.style || ''}">
    <span class="ci" style="flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;width:46px;height:46px;border-radius:50%;background:${opt.icbg || AMB}">${iconHTML(icon, 28, opt.icfg || NAVY, 2.6)}</span>
    <span style="font:800 ${fs}px MS;color:${opt.fg || (dark ? '#fff' : NAVY)};white-space:nowrap">${label}</span></div>`;
}
function banner(icon, title, rowHTML, opt = {}) {
  return `<div class="card" style="position:relative;overflow:hidden;padding:20px 24px 22px">
      <div class="bh" style="position:relative;height:34px">${title.map((t, i) => `<div class="h${i}" style="position:absolute;left:0;top:0;display:flex;align-items:center;gap:12px;font:800 28px MS;color:${t[2] || AMB};letter-spacing:3px;white-space:nowrap">${iconHTML(t[0], 32, t[2] || AMB, 2.4)} ${t[1]}</div>`).join('')}</div>
      <div class="br" style="display:flex;gap:12px;margin-top:14px;align-items:center">${rowHTML}</div></div>`;
}
function gridCard(parent, headerHTML, items, t0, t1, heights) {
  const c = html(parent, { left: LOW.x + 'px', top: LOW.y + 'px', width: LOW.w + 'px', borderRadius: '28px', background: PAPER, boxShadow: '0 16px 36px rgba(0,0,0,.4)', overflow: 'hidden' });
  c.innerHTML = headerHTML;
  items.forEach(([ic, label, t, row, col, full, opt]) => {
    const it = html(c, { left: (28 + (full ? 0 : col * 420)) + 'px', top: (96 + row * 80) + 'px', width: (full ? 824 : 404) + 'px' }, chipHTML(ic, label, opt || {}));
    gsap.set(it, { autoAlpha: 0 });
    TL.fromTo(it, { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1, duration: 0.24, ease: 'back.out(1.8)', immediateRender: false }, t);
    TL.fromTo(it.querySelector('.chip'), { boxShadow: '0 0 0 6px rgba(255,197,49,.8)' }, { boxShadow: '0 0 0 0px rgba(255,197,49,0)', duration: 0.6, immediateRender: false }, t);
  });
  gsap.set(c, { autoAlpha: 0 });
  growCard(c, heights[0], heights.slice(1));
  TL.fromTo(c, { autoAlpha: 0, y: 80 }, { autoAlpha: 1, y: 0, duration: 0.24, ease: 'power3.out', immediateRender: false }, t0);
  TL.to(c, { autoAlpha: 0, y: 60, duration: 0.16, ease: 'power2.in' }, t1 - 0.16);
  return c;
}
const pillHdr = (bg, fg, icon, text) => `<div style="position:absolute;left:28px;top:24px;display:inline-flex;align-items:center;gap:12px;background:${bg};color:${fg};border-radius:999px;padding:7px 24px 7px 12px;font:900 30px MS;letter-spacing:1.5px">${iconHTML(icon, 34, fg, 3)} ${text}</div>`;

function buildAll() {
  const F = $front(), B = $back();
  const HIDE = [[0, 1.80], [9.50, 14.40], [20.40, 22.24], [23.10, 30.45], [40.45, 42.98], [45.10, 99]];
  buildCaptions(CAPTIONS, HIDE, { top: 1030 });

  // ---------------- compliance strip (static; he mentions trading/investing) ----------------
  const disc = html(F, { left: '60px', top: '1452px', width: '900px', display: 'flex', justifyContent: 'center' },
    `<div style="background:rgba(4,10,26,.62);border-radius:14px;padding:5px 20px;font:500 28px/1.25 MS;color:rgba(255,255,255,.92);white-space:nowrap">Educational content only &nbsp;•&nbsp; Not investment advice</div>`);
  gsap.set(disc, { autoAlpha: 1 }); TL.set(disc, { autoAlpha: 0 }, SRC_END);

  // ---------------- 0.00–2.66 HOOK (frame 0 = thumbnail) ----------------
  const scrim = html(F, { left: 0, top: 0, width: '1080px', height: '800px', background: 'linear-gradient(180deg, rgba(4,10,26,.66) 0%, rgba(4,10,26,.36) 60%, rgba(4,10,26,0) 100%)' });
  const hook = html(F, { left: '60px', top: '250px', width: '900px', textAlign: 'center' }, `
    <div class="hk-pill" style="display:inline-flex;align-items:center;gap:12px;background:${AMB};color:${NAVY};border-radius:999px;padding:8px 26px 8px 14px;font:800 30px MS;letter-spacing:1px;white-space:nowrap;box-shadow:0 8px 22px rgba(0,0,0,.35)">
      ${iconHTML('sparkles', 32, NAVY, 2.4)} AI MASTERCLASS</div>
    <div class="l1" style="margin-top:14px;font:900 66px/1 MS;color:#fff;text-shadow:${shadowTxt}">I WISH I HAD</div>
    <div class="l2" style="display:inline-flex;align-items:center;gap:16px;margin-top:8px;font:900 128px/1 MS;color:${AMB};text-shadow:${shadowTxt};letter-spacing:-1px">
      <span class="ck" style="display:inline-block;filter:drop-shadow(0 4px 10px rgba(0,0,0,.5))">${iconHTML('alarm-clock', 100, AMB, 2.2)}</span>28 HOURS</div>
    <div class="l3" style="margin-top:8px;font:900 66px/1 MS;color:#fff;text-shadow:${shadowTxt}">A DAY</div>`);
  gsap.set([hook, scrim], { autoAlpha: 1 });
  TL.fromTo(hook, { scale: 1.05 }, { scale: 1, duration: 0.35, ease: 'power3.out', immediateRender: true }, 0);
  pulse(hook.querySelector('.l2'), 0.72, 1.08, 0.32);
  TL.fromTo(hook.querySelector('.ck'), { rotation: 0 }, { rotation: 12, duration: 0.08, yoyo: true, repeat: 5, ease: 'sine.inOut', immediateRender: false }, 0.72);
  TL.to(hook, { autoAlpha: 0, y: -60, duration: 0.15, ease: 'power2.in' }, 2.56);
  TL.to(scrim, { autoAlpha: 0, duration: 0.2 }, 2.56);

  // ---------------- 3.30–8.70 distractions → 'always short of time' (top band, behind presenter) ----------------
  const b1 = html(B, { left: TOP.x + 'px', top: TOP.y + 'px', width: TOP.w + 'px' }, banner(null, [['zap', 'SO MUCH'], ['hourglass', 'ALWAYS SHORT OF TIME', '#FF8A80']],
    `<div class="c1" style="flex:1">${chipHTML('smartphone', 'Distraction', { dark: true, h: 70, fs: 30 })}</div>
     <div class="c2" style="flex:1">${chipHTML('briefcase', 'Work', { dark: true, h: 70, fs: 30 })}</div>
     <div class="c3" style="flex:1">${chipHTML('globe', 'The world', { dark: true, h: 70, fs: 30 })}</div>`));
  win(b1, 3.30, 8.70, { inT: 'down', dIn: 0.24, outT: 'up', dOut: 0.16 });
  const q1 = (s) => b1.querySelector(s);
  [['.c1', 3.34], ['.c2', 4.38], ['.c3', 6.46]].forEach(([s, t]) => win(q1(s), t, null, { inT: 'pop2', dIn: 0.24 }));
  gsap.set(q1('.h1'), { autoAlpha: 0 });
  TL.to(q1('.h0'), { autoAlpha: 0, y: -12, duration: 0.14 }, 7.70);
  TL.fromTo(q1('.h1'), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.18, immediateRender: false }, 7.74);
  b1.querySelectorAll('.ci').forEach((c, i) => TL.to(c, { backgroundColor: '#FF8A80', duration: 0.18 }, 7.74 + i * 0.06));

  // ---------------- 9.50–14.40 'NO TIME FOR' ✗ health / family / fitness / hobbies (paper, lower slot) ----------------
  const xo = { icbg: '#FDE2E0', icfg: RED };
  gridCard(F, pillHdr(RED, '#fff', 'x', 'NO TIME FOR'), [
    ['heart-pulse', 'Health', 9.58, 0, 0, false, xo], ['users', 'Family', 10.86, 0, 1, false, xo],
    ['dumbbell', 'Fitness', 12.30, 1, 0, false, xo], ['palette', 'Hobbies', 13.90, 1, 1, false, xo]], 9.50, 14.40, [180, [12.26, 260]]);

  // ---------------- 17.95–20.40 'THE POWER OF AI' (top band, behind presenter) ----------------
  const b2 = html(B, { left: TOP.x + 'px', top: TOP.y + 'px', width: TOP.w + 'px' }, `
    <div class="card" style="position:relative;padding:24px 26px;text-align:center">
      <div style="font:800 28px MS;color:${MUTED};letter-spacing:3px">NOW WE HAVE</div>
      <div class="pw" style="display:inline-flex;align-items:center;gap:16px;margin-top:6px;font:900 76px/1.05 MS;color:#fff">THE POWER OF <span style="color:${AMB}">AI</span>${iconHTML('sparkles', 64, AMB, 2.4)}</div></div>`);
  win(b2, 17.95, 20.40, { inT: 'down', dIn: 0.26, outT: 'up', dOut: 0.16 });
  pulse(b2.querySelector('.pw'), 18.46, 1.06, 0.3);

  // ---------------- 20.40–22.24 'BUY BACK 10 HOURS of your week' (navy, lower slot) ----------------
  const bb = html(F, { left: LOW.x + 'px', top: (LOW.y + 10) + 'px', width: LOW.w + 'px' }, `
    <div class="card" style="position:relative;padding:26px 30px;text-align:center">
      <div style="font:800 30px MS;color:${MUTED};letter-spacing:3px">WITH AI, BUY BACK AT LEAST</div>
      <div style="display:flex;align-items:baseline;justify-content:center;gap:20px;margin-top:10px">
        <span class="num bn" style="font:900 150px/1 MS;color:${AMB};letter-spacing:-3px">0</span>
        <span style="font:900 72px/1 MS;color:#fff">HOURS</span></div>
      <div class="wk" style="margin-top:8px;font:800 44px MS;color:#fff">of your week ${iconHTML('calendar-days', 40, AMB, 2.4)}</div></div>`);
  gsap.set(bb, { autoAlpha: 0 });
  TL.fromTo(bb, { autoAlpha: 0, y: 80 }, { autoAlpha: 1, y: 0, duration: 0.24, ease: 'power3.out', immediateRender: false }, 20.40);
  counter(bb.querySelector('.bn'), 20.50, 0.66, 0, 10, (v) => String(Math.round(v)), 'expo.out');
  pulse(bb.querySelector('.bn'), 21.14, 1.1, 0.3);
  win(bb.querySelector('.wk'), 21.80, null, { inT: 'up', dIn: 0.2 });
  TL.to(bb, { autoAlpha: 0, y: 60, duration: 0.16, ease: 'power2.in' }, 22.08);

  // ---------------- 23.10–30.45 'USE AI IN YOUR' grid (paper, lower slot) ----------------
  gridCard(F, pillHdr(NAVY, '#fff', 'sparkles', 'USE AI IN YOUR'), [
    ['briefcase', 'Job', 23.18, 0, 0], ['store', 'Business', 24.14, 0, 1],
    ['landmark', 'Trading & investments', 25.26, 1, 0, true], ['user', 'Personal life', 27.10, 2, 0], ['plane', 'Travel plans', 28.38, 2, 1],
    ['globe', 'Everywhere', 29.74, 3, 0, true, { bg: NAVY, fg: AMB }]], 23.10, 30.45, [180, [25.22, 260], [27.06, 340], [29.70, 420]]);

  // ---------------- 33.30–35.45 'not a tech guy — stock market investor' (top band) ----------------
  const b3 = html(B, { left: TOP.x + 'px', top: TOP.y + 'px', width: TOP.w + 'px' }, banner(null, [['user', 'ABOUT ME']],
    `<div class="t1" style="flex:0 0 auto;position:relative">${chipHTML('laptop', 'Tech guy', { dark: true, h: 70, fs: 30, icbg: '#FDE2E0', icfg: RED })}
       <div class="ts" style="position:absolute;left:62px;right:12px;top:50%;height:6px;margin-top:-3px;border-radius:3px;background:#FF6B5E"></div></div>
     <div class="t2" style="flex:1">${chipHTML('landmark', 'Stock market investor', { dark: true, h: 70, fs: 30 })}</div>`));
  win(b3, 33.74, 35.45, { inT: 'down', dIn: 0.24, outT: 'up', dOut: 0.16 });
  win(b3.querySelector('.t1'), 33.80, null, { inT: 'pop2', dIn: 0.22 });
  wipe(b3.querySelector('.ts'), 33.84, 0.2);
  win(b3.querySelector('.t2'), 34.46, null, { inT: 'pop2', dIn: 0.24 });

  // ---------------- 35.74–38.80 'I use AI daily and save 10 hours of my week' (top band) ----------------
  const b4 = html(B, { left: TOP.x + 'px', top: TOP.y + 'px', width: TOP.w + 'px' }, banner(null, [['sparkles', 'MY ROUTINE']],
    `<div class="d1" style="flex:1">${chipHTML('sparkles', 'AI on a daily basis', { dark: true, h: 70, fs: 30 })}</div>
     <div class="d2" style="flex:1">${chipHTML('timer', 'Save 10 hrs / week', { dark: true, h: 70, fs: 30 })}</div>`));
  win(b4, 35.74, 38.80, { inT: 'down', dIn: 0.24, outT: 'up', dOut: 0.16 });
  win(b4.querySelector('.d1'), 35.88, null, { inT: 'pop2', dIn: 0.24 });
  win(b4.querySelector('.d2'), 37.74, null, { inT: 'pop2', dIn: 0.24 });

  // ---------------- 40.45–42.98 'NOW TIME FOR' ✓ health / kids / family / more (paper, lower slot) ----------------
  const ok = { icbg: '#DCFCE7', icfg: GREEN };
  gridCard(F, pillHdr(GREEN, '#fff', 'check', 'ALL THE TIME FOR'), [
    ['heart-pulse', 'Health', 40.62, 0, 0, false, ok], ['baby', 'Kids', 41.10, 0, 1, false, ok],
    ['users', 'Family', 41.66, 1, 0, false, ok], ['sparkles', '& a lot more', 42.54, 1, 1, false, ok]], 40.45, 42.98, [180, [41.62, 260]]);

  // ---------------- 45.10–end final CTA end card ----------------
  const escrim = html(F, { left: 0, top: '880px', width: '1080px', height: '560px', background: 'linear-gradient(180deg, rgba(4,10,26,0) 0%, rgba(4,10,26,.58) 24%, rgba(4,10,26,.58) 76%, rgba(4,10,26,0) 100%)' });
  win(escrim, 45.10, null, { inT: 'fade', dIn: 0.3 });                   // the end card sits on the striped jacket: keep the text readable
  const end = html(F, { left: '60px', top: '930px', width: '900px', textAlign: 'center' }, `
    <div class="e1" style="font:900 56px/1.1 MS;color:#fff;text-shadow:${shadowTxt};white-space:nowrap">LEARN <span style="color:${AMB}">AI</span> THE SIMPLE WAY</div>
    <div class="e2" style="margin-top:8px;font:800 40px MS;color:#fff;text-shadow:${shadowTxt}">Join my masterclass</div>
    <div class="btn" style="margin:22px auto 0;width:760px;height:122px;border-radius:999px;background:${AMB};display:flex;align-items:center;justify-content:center;gap:20px;
      font:900 58px MS;color:${NAVY};box-shadow:0 14px 30px rgba(0,0,0,.45),inset 0 -6px 0 rgba(0,0,0,.12)">${playIcon(76, NAVY, AMB)} JOIN NOW</div>
    <div class="tap" style="margin-top:14px;font:800 40px MS;color:#fff;text-shadow:${shadowTxt}">Tap the button below <span class="emoji">👇</span></div>`);
  win(end, 45.10, null, { inT: 'up', dIn: 0.32 });
  const qe = (s) => end.querySelector(s);
  win(qe('.tap'), 46.80, null, { inT: 'pop2', dIn: 0.26 });
  pulse(qe('.e1'), 46.32, 1.05, 0.3);                                     // 'simple'
  chevrons(F, CX - 40, 1290, 46.90, T_END + 1, 80, AMB, 10);
  handTap(F, CX + 6, 1322, 46.55, 46.80, 47.70, 104);                    // taps the chevron tip on 'click'
  TL.to(qe('.btn'), { scale: 1.035, duration: 0.42, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 49.20);
  const legal = html(F, { left: '60px', top: '1400px', width: '900px', textAlign: 'center' },
    `<div style="display:inline-block;background:rgba(4,10,26,.66);border-radius:16px;padding:8px 20px;font:500 28px/1.25 MS;color:rgba(255,255,255,.92);white-space:nowrap">
      Educational content only. Not investment advice.</div>`);
  win(legal, SRC_END, null, { inT: 'fade', dIn: 0.2 });
}
