// "Generic AI VBM Ad 4" (AI for the Common Man, Hinglish) — cue sheet. Times = seconds in the 60 fps source.
// Same system as the other ads: captions + at most one graphic + compliance strip; content inside x 60–960 / y 250–1500.
const T_END = window.T_END || 33.67;           // 31.67 s footage + 2.0 s end-card freeze
const SRC_END = 31.67;
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
  const dark = opt.dark, fs = opt.fs || 30, font = opt.deva ? `700 ${fs + 2}px Deva` : `800 ${fs}px MS`;
  return `<div class="chip" style="display:flex;align-items:center;gap:14px;height:${opt.h || 68}px;padding:0 18px 0 12px;border-radius:16px;
    background:${dark ? 'rgba(255,255,255,.10)' : 'rgba(11,31,77,.07)'};border:2px solid ${dark ? 'rgba(255,255,255,.14)' : 'rgba(11,31,77,.10)'};${opt.style || ''}">
    <span class="ci" style="flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;width:46px;height:46px;border-radius:50%;background:${opt.icbg || AMB}">${iconHTML(icon, 28, NAVY, 2.6)}</span>
    <span style="font:${font};color:${dark ? '#fff' : NAVY};white-space:nowrap">${label}</span></div>`;
}
function sparkles(parent, pts, t0, t1) {
  pts.forEach(([x, y, s, ph]) => {
    const sp = el('div', 'abs', parent, { left: x + 'px', top: y + 'px', width: s + 'px', height: s + 'px' },
      `<svg viewBox="0 0 24 24" width="${s}" height="${s}"><path d="M12 0 C13 9 15 11 24 12 C15 13 13 15 12 24 C11 15 9 13 0 12 C9 11 11 9 12 0 Z" fill="#FFD966"/></svg>`);
    HOOKS.push((t) => { const on = t >= t0 && t < t1; const k = on ? 0.5 + 0.5 * Math.sin((t - t0) * 5 + ph) : 0; sp.style.opacity = (on ? 0.25 + 0.75 * k : 0).toFixed(3); sp.style.transform = `scale(${0.6 + 0.5 * k}) rotate(${(t * 40 + ph * 30) % 360}deg)`; });
  });
}
function buildAll() {
  const F = $front(), B = $back();
  const HIDE = [[7.10, 11.42], [19.08, 23.91], [29.20, 99]];
  buildCaptions(CAPTIONS, HIDE);

  // ---------------- compliance strip (static, one line: the ad mentions trading/investment) ----------------
  const disc = html(F, { left: '60px', top: '1450px', width: '900px', display: 'flex', justifyContent: 'center' },
    `<div style="background:rgba(4,10,26,.55);border-radius:14px;padding:5px 20px;font:500 28px/1.25 MS;color:rgba(255,255,255,.9);white-space:nowrap">Educational content only &nbsp;•&nbsp; Not investment advice</div>`);
  gsap.set(disc, { autoAlpha: 1 }); TL.set(disc, { autoAlpha: 0 }, SRC_END);

  // ---------------- 0.00–2.20 HOOK: fully built on frame 0 (= thumbnail) ----------------
  const scrim = html(F, { left: 0, top: 0, width: '1080px', height: '780px', background: 'linear-gradient(180deg, rgba(4,10,26,.66) 0%, rgba(4,10,26,.38) 60%, rgba(4,10,26,0) 100%)' });
  const hook = html(F, { left: '60px', top: '250px', width: '900px', textAlign: 'center' }, `
    <div class="hk-pill" style="display:inline-flex;align-items:center;gap:12px;background:${AMB};color:${NAVY};border-radius:999px;padding:8px 24px 8px 14px;font:800 27px MS;letter-spacing:.5px;white-space:nowrap;box-shadow:0 8px 22px rgba(0,0,0,.35)">
      ${iconHTML('sparkles', 30, NAVY, 2.4)} FREE MASTERCLASS &nbsp;•&nbsp; AI FOR THE COMMON MAN</div>
    <div class="l1" style="margin-top:14px;font:900 84px/1 MS;color:#fff;text-shadow:${shadowTxt};letter-spacing:-1px">STILL WORKING</div>
    <div class="l2" style="display:inline-flex;align-items:center;gap:16px;margin-top:8px;font:900 120px/1 MS;color:${AMB};text-shadow:${shadowTxt};letter-spacing:-1px">
      <span class="hi" style="display:inline-block;filter:drop-shadow(0 4px 10px rgba(0,0,0,.5))">${iconHTML('hand', 96, AMB, 2.2)}</span>MANUALLY?</div>`);
  gsap.set([hook, scrim], { autoAlpha: 1 });
  TL.fromTo(hook, { scale: 1.05 }, { scale: 1, duration: 0.35, ease: 'power3.out', immediateRender: true }, 0);
  pulse(hook.querySelector('.l2'), 0.88, 1.08, 0.32);            // 'manually'
  TL.fromTo(hook.querySelector('.hi'), { rotation: 0 }, { rotation: 14, duration: 0.12, yoyo: true, repeat: 3, ease: 'sine.inOut', immediateRender: false }, 0.88);
  TL.to(hook, { autoAlpha: 0, y: -60, duration: 0.15, ease: 'power2.in' }, 2.06);
  TL.to(scrim, { autoAlpha: 0, duration: 0.2 }, 2.06);

  // ---------------- 2.22–7.00 manual tasks → 'ya phir AI se?' (top band, behind presenter) ----------------
  const mt = html(B, { left: TOP.x + 'px', top: TOP.y + 'px', width: TOP.w + 'px' }, `
    <div class="card" style="position:relative;padding:20px 24px 22px">
      <div class="hdr" style="position:relative;height:34px">
        <div class="h1" style="position:absolute;left:0;top:0;display:flex;align-items:center;gap:12px;font:800 28px MS;color:${AMB};letter-spacing:3px">${iconHTML('hand', 32, AMB, 2.4)} DONE MANUALLY</div>
        <div class="h2" style="position:absolute;left:0;top:0;display:flex;align-items:center;gap:12px;font:800 28px MS;color:${AMB};letter-spacing:3px">${iconHTML('sparkles', 32, AMB, 2.4)} YA PHIR AI SE?</div></div>
      <div style="display:flex;gap:12px;margin-top:14px">
        <div class="m1" style="flex:1">${chipHTML('presentation', 'PPT banana', { dark: true, h: 70, fs: 30 })}</div>
        <div class="m2" style="flex:1.2">${chipHTML('file-text', 'Report analysis', { dark: true, h: 70, fs: 30 })}</div>
        <div class="m3" style="flex:1">${chipHTML('plane', 'Travel plan', { dark: true, h: 70, fs: 30 })}</div></div></div>`);
  win(mt, 2.22, 7.00, { inT: 'down', dIn: 0.26, outT: 'up', dOut: 0.16 });
  [['.m1', 2.26], ['.m2', 3.04], ['.m3', 4.08]].forEach(([s, t]) => win(mt.querySelector(s), t, null, { inT: 'pop2', dIn: 0.24 }));
  gsap.set(mt.querySelector('.h2'), { autoAlpha: 0 });
  pulse(mt.querySelector('.h1'), 5.44, 1.08, 0.3);              // 'manually?'
  TL.to(mt.querySelector('.h1'), { autoAlpha: 0, y: -12, duration: 0.14 }, 6.10);
  TL.fromTo(mt.querySelector('.h2'), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.18, immediateRender: false }, 6.15);
  // chips switch from 'manual' grey icons to amber AI icons on 'AI se'
  mt.querySelectorAll('.ci').forEach((c) => gsap.set(c, { backgroundColor: '#8A93A6' }));
  mt.querySelectorAll('.ci').forEach((c, i) => TL.to(c, { backgroundColor: AMB, duration: 0.18 }, 6.15 + i * 0.08));
  mt.querySelectorAll('.chip').forEach((c, i) => pulse(c, 6.15 + i * 0.08, 1.05, 0.24));

  // ---------------- 7.10–11.42 'AI won't replace you — people using AI can' (navy, lower slot) ----------------
  const rp = html(F, { left: LOW.x + 'px', top: LOW.y + 'px', width: LOW.w + 'px' });
  const rpc = el('div', 'card', rp, { position: 'relative', overflow: 'hidden', padding: '26px 30px' });
  rpc.innerHTML = `<div class="r1" style="display:flex;align-items:center;gap:20px">
      <span style="flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;width:76px;height:76px;border-radius:50%;background:rgba(255,255,255,.12)">${iconHTML('bot', 48, '#fff', 2.2)}</span>
      <div style="font:800 48px/1.1 MS;color:#fff">AI is <span style="color:${AMB}">not</span> going<br>to replace you</div></div>
    <div class="r2" style="display:flex;align-items:center;gap:20px;margin-top:26px">
      <span style="flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;width:76px;height:76px;border-radius:50%;background:${AMB}">${iconHTML('user-check', 46, NAVY, 2.4)}</span>
      <div style="font:800 48px/1.1 MS;color:#fff"><span style="color:${AMB}">People using AI</span><br><span class="r3">can replace you</span></div></div>`;
  gsap.set(rp, { autoAlpha: 0 }); gsap.set([rpc.querySelector('.r2'), rpc.querySelector('.r3')], { autoAlpha: 0 });
  growCard(rpc, 158, [[8.68, 316]]);
  TL.fromTo(rp, { autoAlpha: 0, y: 80 }, { autoAlpha: 1, y: 0, duration: 0.24, ease: 'power3.out', immediateRender: false }, 7.12);
  TL.fromTo(rpc.querySelector('.r2'), { autoAlpha: 0, x: -30 }, { autoAlpha: 1, x: 0, duration: 0.22, ease: 'power3.out', immediateRender: false }, 8.72);
  TL.fromTo(rpc.querySelector('.r3'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, immediateRender: false }, 10.65);
  TL.to(rp, { autoAlpha: 0, y: 60, duration: 0.16, ease: 'power2.in' }, 11.28);

  // ---------------- 13.22–17.82 'aapko khaali bolna hai' — English / हिंदी → AI (top band, behind presenter) ----------------
  const sp = html(B, { left: TOP.x + 'px', top: TOP.y + 'px', width: TOP.w + 'px' }, `
    <div class="card" style="position:relative;padding:20px 24px 22px">
      <div style="display:flex;align-items:center;gap:12px;font:800 28px MS;color:${AMB};letter-spacing:3px">${iconHTML('mic', 32, AMB, 2.4)} AAPKO KHAALI BOLNA HAI</div>
      <div style="display:flex;gap:12px;margin-top:14px;align-items:center">
        <div class="s1" style="flex:1">${chipHTML('message-circle', 'English', { dark: true, h: 70, fs: 32 })}</div>
        <div class="s2" style="flex:1">${chipHTML('message-circle', 'हिंदी', { dark: true, h: 70, fs: 32, deva: true })}</div>
        <div class="s3" style="flex:0 0 auto;display:flex;align-items:center;gap:10px;font:900 36px MS;color:${AMB}">${iconHTML('arrow-right', 40, AMB, 3)} AI ${iconHTML('sparkles', 38, AMB, 2.4)}</div></div></div>`);
  win(sp, 13.22, 17.82, { inT: 'down', dIn: 0.26, outT: 'up', dOut: 0.16 });
  const spc = sp.querySelector('.card'); spc.style.overflow = 'hidden'; growCard(spc, 78, [[14.56, 164]]);
  const sq = (s) => sp.querySelector(s);
  gsap.set([sq('.s1'), sq('.s2'), sq('.s3')], { autoAlpha: 0 });
  // empty-body guard: the chips row shows a soft placeholder until 'English'
  win(sq('.s1'), 14.60, null, { inT: 'pop2', dIn: 0.24 });
  win(sq('.s2'), 15.74, null, { inT: 'pop2', dIn: 0.24 });
  win(sq('.s3'), 16.70, null, { inT: 'left', dIn: 0.26 });

  // ---------------- 18.80–23.91 use-case grid → 'SAB KUCH AI SE' (paper, lower slot) ----------------
  const uc = html(F, { left: LOW.x + 'px', top: LOW.y + 'px', width: LOW.w + 'px', borderRadius: '28px', background: PAPER, boxShadow: '0 16px 36px rgba(0,0,0,.4)', overflow: 'hidden' });
  const ucs = [['briefcase', 'Job', 19.28], ['store', 'Business', 19.84], ['candlestick-chart', 'Trading', 20.64], ['landmark', 'Investment', 21.36], ['plane', 'Travel plan', 22.08]];
  ucs.forEach(([ic, label, t], i) => {
    const row = Math.floor(i / 2), col = i % 2;
    const c = html(uc, { left: (28 + col * 420) + 'px', top: (26 + row * 82) + 'px', width: '404px' }, chipHTML(ic, label, { fs: 32 }));
    gsap.set(c, { autoAlpha: 0 });
    TL.fromTo(c, { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1, duration: 0.24, ease: 'back.out(1.8)', immediateRender: false }, t);
    TL.fromTo(c.querySelector('.chip'), { backgroundColor: 'rgba(255,197,49,.55)' }, { backgroundColor: 'rgba(11,31,77,.07)', duration: 0.6, immediateRender: false }, t);
  });
  const all = html(uc, { left: '448px', top: (26 + 2 * 82) + 'px', width: '404px', height: '68px', borderRadius: '16px', background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', font: '900 32px MS', color: AMB },
    `${iconHTML('sparkles', 34, AMB, 2.4)} Sab kuch AI se`);
  gsap.set(all, { autoAlpha: 0 });
  TL.fromTo(all, { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1, duration: 0.28, ease: 'back.out(1.8)', immediateRender: false }, 23.10);
  uc.querySelectorAll('.ci').forEach((c, i) => TL.to(c, { scale: 1.15, duration: 0.1, yoyo: true, repeat: 1 }, 23.12 + i * 0.05));
  gsap.set(uc, { autoAlpha: 0 });
  growCard(uc, 120, [[20.58, 202], [22.04, 284]]);
  TL.fromTo(uc, { autoAlpha: 0, y: 80 }, { autoAlpha: 1, y: 0, duration: 0.24, ease: 'power3.out', immediateRender: false }, 19.10);
  TL.to(uc, { autoAlpha: 0, y: 60, duration: 0.16, ease: 'power2.in' }, 23.76);

  // ---------------- 24.60–26.35 'ghanton mein → minute mein' (top band, behind presenter) ----------------
  const hm = html(B, { left: TOP.x + 'px', top: TOP.y + 'px', width: TOP.w + 'px' }, `
    <div class="card" style="position:relative;padding:20px 24px 22px">
      <div style="display:flex;align-items:center;gap:12px;font:800 28px MS;color:${AMB};letter-spacing:3px">${iconHTML('zap', 32, AMB, 2.4)} AUR WOH BHI</div>
      <div style="display:flex;gap:14px;margin-top:14px;align-items:center">
        <div class="g1" style="flex:1">${chipHTML('hourglass', 'Kuch hi ghanton mein', { dark: true, h: 70, fs: 30 })}</div>
        <div class="g2" style="flex:1">${chipHTML('clock', 'Kabhi minute mein', { dark: true, h: 70, fs: 30 })}</div></div></div>`);
  win(hm, 24.60, 26.40, { inT: 'down', dIn: 0.24, outT: 'up', dOut: 0.16 });
  win(hm.querySelector('.g1'), 24.66, null, { inT: 'pop2', dIn: 0.24 });
  win(hm.querySelector('.g2'), 25.90, null, { inT: 'pop2', dIn: 0.24 });

  // ---------------- 29.20–end final CTA end card ----------------
  const end = html(F, { left: '60px', top: '930px', width: '900px', textAlign: 'center' }, `
    <div class="e1" style="font:900 56px/1.1 MS;color:#fff;text-shadow:${shadowTxt};white-space:nowrap">JOIN MY <span style="color:${AMB}">FREE</span> MASTERCLASS</div>
    <div class="e2" style="margin-top:10px;display:flex;align-items:center;justify-content:center;gap:12px;font:900 52px/1 MS;color:${AMB};text-shadow:${shadowTxt}">${iconHTML('sparkles', 46, AMB, 2.4)} AI for the Common Man</div>
    <div class="btn" style="margin:24px auto 0;width:760px;height:122px;border-radius:999px;background:${AMB};display:flex;align-items:center;justify-content:center;gap:20px;
      font:900 58px MS;color:${NAVY};box-shadow:0 14px 30px rgba(0,0,0,.45),inset 0 -6px 0 rgba(0,0,0,.12)">${playIcon(76, NAVY, AMB)} JOIN NOW</div>
    <div class="tap" style="margin-top:14px;font:800 40px MS;color:#fff;text-shadow:${shadowTxt}">Tap the button below <span class="emoji">👇</span></div>`);
  win(end, 29.20, null, { inT: 'up', dIn: 0.32 });
  const qe = (s) => end.querySelector(s);
  win(qe('.e2'), 30.50, null, { inT: 'pop2', dIn: 0.28 });             // 'on AI for the Common Man'
  win(qe('.tap'), 29.60, null, { inT: 'pop2', dIn: 0.26 });
  pulse(qe('.e1'), 29.60, 1.05, 0.3);                                      // 'free'
  chevrons(F, CX - 40, 1290, 29.70, T_END + 1, 80, AMB, 10);
  handTap(F, CX + 6, 1322, 29.05, 29.30, 30.20, 104);                     // taps the chevron tip on 'join'
  sparkles(end, [[40, -30, 34, 0.4], [830, -20, 30, 2.1], [860, 180, 36, 3.6], [20, 200, 28, 1.3]], 29.5, T_END + 1);
  TL.to(qe('.btn'), { scale: 1.035, duration: 0.42, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 31.80);
  const legal = html(F, { left: '60px', top: '1400px', width: '900px', textAlign: 'center' },
    `<div style="display:inline-block;background:rgba(4,10,26,.62);border-radius:16px;padding:8px 20px;font:500 28px/1.25 MS;color:rgba(255,255,255,.92);white-space:nowrap">
      Educational content only. Not investment advice.</div>`);
  win(legal, SRC_END, null, { inT: 'fade', dIn: 0.2 });
}
