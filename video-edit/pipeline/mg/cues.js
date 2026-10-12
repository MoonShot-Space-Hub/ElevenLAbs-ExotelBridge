// Cue sheet v2 → motion graphics. Times are seconds in the source timeline (speech-synced).
// Layout rules: content stays inside x 60–960 / y 250–1500; at most captions + one graphic (+ compliance strip);
// cards are auto-height (they grow with each row) so a header never sits over an empty body.
const T_END = window.T_END || 38.0;            // 35.74 s of footage + end-card freeze
const AMB = '#FFC531', NAVY = '#0B1F4D', RED = '#D92D20', GREEN = '#16A34A', MUTED = '#C9D3E8', PAPER = '#F7F8FA', SLATE = '#5B6478';
const SIDE = { x: 64, y: 262, w: 336 };       // top-left slot, composited BEHIND the presenter
const LOW = { x: 70, y: 975, w: 880 };        // lower slot (bottom edge kept ≤ 1405)
const CX = 510;                               // centre of the 60–960 safe column
const shadowTxt = '0 4px 14px rgba(0,0,0,.55), 0 1px 3px rgba(0,0,0,.6)';
const CUT = { c328: 327.5, c520: 519.5, c649: 648.5, c758: 757.5, c924: 923.5, c1115: 1114.5, c1201: 1200.5, c1556: 1555.5, c1845: 1844.5, c1970: 1969.5 };
for (const k in CUT) CUT[k] = CUT[k] / (60000 / 1001);
function html(parent, style, inner) { return el('div', 'abs', parent || $front(), style, inner); }
function playIcon(size, bg, fg) {
  return `<span style="display:inline-flex;flex:0 0 auto;align-items:center;justify-content:center;width:${size}px;height:${size}px;border-radius:50%;background:${bg}">
    <svg viewBox="0 0 24 24" width="${size * .46}" height="${size * .46}" style="margin-left:${size * .06}px"><path d="M6 4l14 8-14 8z" fill="${fg}"/></svg></span>`;
}
// grow an auto-height card: heights[] = [[t, px], ...]
function growCard(card, h0, steps) {
  gsap.set(card, { height: h0 });
  steps.forEach(([t, h]) => TL.to(card, { height: h, duration: 0.24, ease: 'power3.out' }, t));
}
function buildAll() {
  const F = $front(), B = $back();
  // ---------------- captions (handed off to any card that carries the same words) ----------------
  const HIDE = [[12.50, CUT.c924], [16.62, 22.32], [24.84, 30.70], [CUT.c1970, 99]];
  buildCaptions(CAPTIONS, HIDE);

  // ---------------- persistent compliance strip (static) ----------------
  const disc = html(F, { left: '60px', top: '1418px', width: '900px', display: 'flex', justifyContent: 'center' },
    `<div style="background:rgba(4,10,26,.58);border-radius:14px;padding:5px 20px;font:500 28px/1.25 MS;color:rgba(255,255,255,.9);text-align:center;white-space:nowrap">Educational content only &nbsp;•&nbsp; Not investment advice<br>Trading involves market risk &nbsp;•&nbsp; No assured returns</div>`);
  gsap.set(disc, { autoAlpha: 1 }); TL.set(disc, { autoAlpha: 0 }, 35.74);

  // ---------------- 0.00–2.16 HOOK headline: fully built on frame 0 (= thumbnail) ----------------
  const scrim = html(F, { left: 0, top: 0, width: '1080px', height: '780px', background: 'linear-gradient(180deg, rgba(4,10,26,.62) 0%, rgba(4,10,26,.35) 55%, rgba(4,10,26,0) 100%)' });
  const hook = html(F, { left: '60px', top: '250px', width: '900px', textAlign: 'center' }, `
    <div style="display:inline-flex;align-items:center;gap:14px;background:${AMB};color:${NAVY};border-radius:999px;padding:9px 28px 9px 12px;font:800 34px MS;letter-spacing:1px;box-shadow:0 8px 22px rgba(0,0,0,.35)">
      ${playIcon(46, NAVY, AMB)} FREE &nbsp;•&nbsp; 1-HOUR VIDEO</div>
    <div class="hk-l1" style="margin-top:12px;font:900 96px/1 MS;color:#fff;text-shadow:${shadowTxt};letter-spacing:-1px">19 SAAL KI</div>
    <div class="hk-l2" style="position:relative;display:inline-block;margin-top:4px;font:900 122px/1 MS;color:${AMB};text-shadow:${shadowTxt};letter-spacing:-1px">STRATEGY
      <div class="hk-ul" style="position:absolute;left:4px;right:4px;bottom:-12px;height:10px;border-radius:5px;background:#fff;box-shadow:0 3px 8px rgba(0,0,0,.4)"></div></div>`);
  gsap.set([hook, scrim], { autoAlpha: 1 });
  TL.fromTo(hook, { scale: 1.05 }, { scale: 1, duration: 0.35, ease: 'power3.out', immediateRender: true }, 0);
  // underline is complete on frame 0; a light sweep runs across it on 'strategy'
  const ul = hook.querySelector('.hk-ul'); ul.style.overflow = 'hidden';
  const shine = el('div', 'abs', ul, { left: '-30%', top: 0, width: '30%', height: '100%', background: 'linear-gradient(90deg, rgba(255,197,49,0), rgba(255,197,49,1), rgba(255,197,49,0))' });
  HOOKS.push((t) => { shine.style.left = (-30 + 140 * prog(t, 0.40, 0.45, 'power2.inOut')) + '%'; });
  pulse(hook.querySelector('.hk-l1'), 0.92, 1.07, 0.3);
  TL.to(hook, { autoAlpha: 0, y: -60, duration: 0.15, ease: 'power2.in' }, 2.01);
  TL.to(scrim, { autoAlpha: 0, duration: 0.18 }, 2.0);

  // ---------------- 2.16–3.58 proof counter (side slot, behind presenter) ----------------
  const cnt = html(B, { left: SIDE.x + 'px', top: SIDE.y + 'px', width: SIDE.w + 'px' }, `
    <div class="card" style="position:relative;padding:22px 22px 20px">
      <div style="position:absolute;right:18px;top:18px;opacity:.95">${iconHTML('users', 38, AMB, 2.6)}</div>
      <div class="num c-num" style="font:900 58px/1 MS;color:#fff;letter-spacing:-1px;margin-top:30px">0</div>
      <div style="margin-top:12px;font:700 32px MS;color:#fff;white-space:nowrap">logon ne <span style="color:${AMB}">seekhi</span></div>
      <div class="c-bar" style="margin-top:14px;height:8px;border-radius:4px;background:${AMB}"></div>
    </div>`);
  win(cnt, 2.16, 3.58, { inT: 'left', dIn: 0.28, outT: 'up', dOut: 0.16 });
  const fmtIN = new Intl.NumberFormat('en-IN');
  counter(cnt.querySelector('.c-num'), 2.30, 0.66, 0, 250000, (v) => fmtIN.format(v >= 248500 ? 250000 : Math.round(v / 1000) * 1000), 'expo.out');
  wipe(cnt.querySelector('.c-bar'), 2.30, 0.66, 'expo.out');
  pulse(cnt.querySelector('.c-num'), 2.98, 1.06, 0.25);

  // ---------------- 3.62–10.83 offer card (side slot, behind presenter) ----------------
  const off = html(B, { left: SIDE.x + 'px', top: SIDE.y + 'px', width: SIDE.w + 'px' }, `
    <div class="card" style="position:relative;padding:18px 18px 20px">
      <div style="display:flex;align-items:center;gap:12px;font:900 28px MS;color:#fff;letter-spacing:2.5px">
        <span class="rec" style="width:20px;height:20px;border-radius:50%;background:#E5484D;box-shadow:0 0 12px #E5484D"></span>RECORDED</div>
      <div class="thumb" style="position:relative;margin-top:14px;height:184px;border-radius:18px;overflow:hidden;background:linear-gradient(135deg,#16306B 0%,#0A1636 100%);border:2px solid rgba(255,255,255,.12)">
        <div class="tcontent" style="position:absolute;inset:0">
          <div class="play" style="position:absolute;left:50%;top:44%;transform:translate(-50%,-50%)">${playIcon(84, AMB, NAVY)}</div>
          <div style="position:absolute;left:16px;bottom:12px;font:900 30px MS;color:#fff;letter-spacing:.5px">STRATEGY VIDEO</div></div>
        <div class="paid" style="position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);text-align:center">
          <div style="font:700 26px MS;color:${MUTED};letter-spacing:1px">PEHLE SIRF</div>
          <span style="display:inline-flex;align-items:center;gap:10px;margin-top:4px;font:900 36px MS;color:#E7ECF7;letter-spacing:1px">${iconHTML('lock', 34, '#E7ECF7', 2.8)} PAID PROGRAM</span>
          <div class="strike" style="position:absolute;left:22px;right:22px;top:66%;height:7px;margin-top:-3px;border-radius:4px;background:#E5484D"></div></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px;margin-top:14px">
        <div class="chip-h" style="display:flex;align-items:center;gap:12px;background:rgba(255,255,255,.12);border-radius:16px;padding:10px 16px;font:800 32px MS;color:#fff">${iconHTML('timer', 36, AMB, 2.6)} 1 GHANTA</div>
        <div class="chip-c" style="display:flex;align-items:center;gap:12px;background:rgba(255,255,255,.12);border-radius:16px;padding:10px 16px;font:800 32px MS;color:#fff">${iconHTML('mouse-pointer-click', 36, AMB, 2.6)} Turant dekho</div>
      </div>
      <div class="free" style="position:absolute;right:-6px;top:56px;background:${AMB};color:${NAVY};font:900 44px MS;padding:8px 22px;border-radius:14px;box-shadow:0 8px 18px rgba(0,0,0,.4);transform:rotate(8deg)">FREE</div>
      <div class="stamp" style="position:absolute;left:50%;top:104px;margin-left:-140px;width:280px;text-align:center;font:900 84px/1 MS;color:${AMB};border:8px solid ${AMB};border-radius:18px;padding:8px 0 6px;letter-spacing:3px;background:rgba(11,31,77,.6);box-shadow:0 10px 26px rgba(0,0,0,.45)">FREE</div>
    </div>`);
  win(off, 3.62, CUT.c649, { inT: 'pop2', dIn: 0.28, outT: 'left', dOut: 0.18 });
  const q = (s) => off.querySelector(s);
  HOOKS.push((t) => { const k = t - 3.62; q('.rec').style.opacity = (k > 0 && k < 1.2) ? (Math.floor(k / 0.3) % 2 ? 0.25 : 1) : 1; });
  gsap.set(q('.paid'), { autoAlpha: 0 });
  win(q('.free'), 5.20, null, { inT: 'pop', dIn: 0.28, rot: 8, easeIn: 'back.out(2.2)' });
  win(q('.chip-h'), 5.47, null, { inT: 'pop2', dIn: 0.24 });
  win(q('.chip-c'), 6.99, null, { inT: 'pop2', dIn: 0.24 });
  press(q('.play'), 6.48);
  handTap(B, SIDE.x + 160, SIDE.y + 140, 6.15, 6.48, 7.15, 110);
  pulse(q('.free'), 8.48, 1.15, 0.3);
  // value reveal: 'PEHLE SIRF PAID PROGRAM' replaces the thumbnail content, gets struck, then FREE stamps over it
  TL.to(q('.tcontent'), { autoAlpha: 0, duration: 0.15 }, 9.55);
  TL.fromTo(q('.paid'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.2, ease: 'power2.out', immediateRender: false }, 9.60);
  wipe(q('.strike'), 9.80, 0.2, 'power2.out');
  win(q('.stamp'), 9.96, null, { inT: 'stamp', rot: -9, rot0: -20 });
  TL.to([q('.paid'), q('.free')], { autoAlpha: 0, duration: 0.1 }, 10.14);

  // ---------------- 12.50–15.41 myth card (paper, lower slot) ----------------
  const myth = html(F, { left: LOW.x + 'px', top: LOW.y + 'px', width: LOW.w + 'px', borderRadius: '28px', background: PAPER, boxShadow: '0 16px 36px rgba(0,0,0,.4)', overflow: 'hidden' });
  myth.innerHTML = `<div style="position:absolute;left:36px;top:28px;display:inline-flex;align-items:center;gap:12px;background:${RED};color:#fff;border-radius:999px;padding:8px 24px 8px 12px;font:900 34px MS;letter-spacing:1.5px">${iconHTML('x', 36, '#fff', 3.4)} AISA NAHI HOGA</div>`;
  [['Turant paisa', 12.56], ['Kal-ka-kal crorepati', 14.20]].forEach(([txt, t], i) => {
    const row = el('div', 'abs', myth, { left: '36px', top: (118 + i * 112) + 'px', display: 'flex', alignItems: 'center', gap: '24px' });
    const mk = el('div', '', row, { position: 'relative', width: '68px', height: '68px', flex: '0 0 auto' });
    const label = el('div', '', row, { position: 'relative', font: '800 60px MS', color: SLATE, whiteSpace: 'nowrap' }, txt);
    const st = el('div', 'abs', label, { left: '-6px', right: '-6px', top: '50%', height: '8px', marginTop: '-2px', borderRadius: '4px', background: RED });
    gsap.set(st, { scaleX: 1 });   // struck from the moment it appears (never shown un-struck)
    gsap.set(row, { autoAlpha: 0 });
    TL.fromTo(row, { autoAlpha: 0, x: -30 }, { autoAlpha: 1, x: 0, duration: 0.2, ease: 'power3.out', immediateRender: false }, t);
    crossMark(mk, 0, 0, 68, t);
  });
  gsap.set(myth, { autoAlpha: 0 });
  growCard(myth, 214, [[14.18, 326]]);
  TL.fromTo(myth, { autoAlpha: 0, y: 80 }, { autoAlpha: 1, y: 0, duration: 0.26, ease: 'power3.out', immediateRender: false }, 12.50);
  TL.to(myth, { autoAlpha: 0, y: 60, duration: 0.16, ease: 'power2.in' }, CUT.c924 - 0.16);

  // ---------------- 16.62–20.04 reality checklist (paper, lower slot) ----------------
  const real = html(F, { left: LOW.x + 'px', top: LOW.y + 'px', width: LOW.w + 'px', borderRadius: '28px', background: PAPER, boxShadow: '0 16px 36px rgba(0,0,0,.4)', overflow: 'hidden' });
  real.innerHTML = `<div style="position:absolute;left:36px;top:28px;display:inline-flex;align-items:center;gap:12px;background:${NAVY};color:#fff;border-radius:999px;padding:8px 24px 8px 12px;font:900 34px MS;letter-spacing:1.5px">${iconHTML('check', 36, '#4ADE80', 3.6)} AAPKO SAMAJH AAYEGA</div>`;
  [['<b>Market</b> kaise chalta hai', 16.66], ['<b>System</b> kaise chalta hai', 17.72], ['<b>Systematic trading</b> kya hai', 18.54]].forEach(([txt, t], i) => {
    const row = el('div', 'abs', real, { left: '36px', top: (116 + i * 92) + 'px', display: 'flex', alignItems: 'center', gap: '22px' });
    const mk = el('div', '', row, { position: 'relative', width: '58px', height: '58px', flex: '0 0 auto' });
    el('div', '', row, { font: '600 46px MS', color: SLATE, whiteSpace: 'nowrap' }, txt.replace(/<b>/g, `<b style="font-weight:900;color:${NAVY}">`));
    gsap.set(row, { autoAlpha: 0 });
    TL.fromTo(row, { autoAlpha: 0, x: -30 }, { autoAlpha: 1, x: 0, duration: 0.2, ease: 'power3.out', immediateRender: false }, t);
    checkMark(mk, 0, 0, 58, t, GREEN);
  });
  gsap.set(real, { autoAlpha: 0 });
  growCard(real, 204, [[17.70, 296], [18.52, 388]]);
  TL.fromTo(real, { autoAlpha: 0, y: 80 }, { autoAlpha: 1, y: 0, duration: 0.26, ease: 'power3.out', immediateRender: false }, 16.62);
  TL.to(real, { autoAlpha: 0, y: 60, duration: 0.16, ease: 'power2.in' }, CUT.c1201 - 0.16);
  // faint grid behind the presenter for the navy 'focus' background (15.42–20.04)
  const grid = html(B, { left: '0px', top: '-64px', width: '1080px', height: '2048px',
    backgroundImage: 'linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px)', backgroundSize: '64px 64px' });
  win(grid, CUT.c924, CUT.c1201, { inT: 'cut', outT: 'cut' });
  HOOKS.push((t) => { grid.style.transform = `translateY(${-((t - 15.42) * 6) % 64}px)`; });

  // ---------------- 20.04–22.32 CTA 1 = STEP 1 (soft: no hand, no breathing) ----------------
  const cta1 = html(F, { left: '60px', top: '1110px', width: '900px', textAlign: 'center' }, `
    <div style="display:inline-block;background:rgba(4,10,26,.65);color:${AMB};font:900 30px MS;letter-spacing:3px;border-radius:999px;padding:6px 24px">STEP 1</div>
    <div class="btn" style="margin:14px auto 0;width:760px;height:118px;border-radius:999px;background:${AMB};display:flex;align-items:center;justify-content:center;gap:20px;
      font:900 54px MS;color:${NAVY};box-shadow:0 14px 30px rgba(0,0,0,.45),inset 0 -6px 0 rgba(0,0,0,.12)">${playIcon(72, NAVY, AMB)} FREE VIDEO DEKHO</div>
    <div class="tap" style="margin-top:16px;font:800 40px MS;color:#fff;text-shadow:${shadowTxt}">Neeche button pe TAP karo <span class="emoji">👇</span></div>`);
  win(cta1, CUT.c1201, 22.32, { inT: 'up', dIn: 0.3, outT: 'down', dOut: 0.16 });
  win(cta1.querySelector('.tap'), 20.32, null, { inT: 'pop2', dIn: 0.26 });

  // ---------------- 23.30–24.84 STEP 2 → agle page (side slot, behind presenter) ----------------
  const nx = html(B, { left: SIDE.x + 'px', top: (SIDE.y + 20) + 'px' }, `
    <div class="card" style="padding:20px 26px 22px">
      <div style="font:800 28px MS;color:${AMB};letter-spacing:3px">STEP 2</div>
      <div style="margin-top:8px;font:900 54px/1.08 MS;color:#fff;white-space:nowrap">Agle page<br>par <span style="display:inline-block;vertical-align:-6px">${iconHTML('arrow-right', 54, AMB, 3.2)}</span></div>
    </div>`);
  win(nx, 23.30, 24.84, { inT: 'right', dIn: 0.26, outT: 'fade', dOut: 0.14 });

  // ---------------- 24.84–30.70 '4 DIN ABCT' → 'ABCT with AI = 3 DIN ABCT + AI TOOL' (navy, lower slot) ----------------
  const eq = html(F, { left: LOW.x + 'px', top: LOW.y + 'px', width: LOW.w + 'px', height: '420px' });
  const eqA = el('div', 'card abs', eq, { inset: '0px', padding: '30px 36px', textAlign: 'center' });
  eqA.innerHTML = `<div style="display:inline-block;background:rgba(255,255,255,.1);color:${AMB};font:800 30px MS;letter-spacing:3px;border-radius:999px;padding:6px 22px">STEP 2 &nbsp;•&nbsp; AGLE PAGE PAR</div>
    <div style="display:flex;align-items:baseline;justify-content:center;gap:26px;margin-top:30px">
      <span class="a4" style="font:900 128px/1 MS;color:${AMB};letter-spacing:-2px">4 DIN</span>
      <span class="ab" style="font:900 112px/1 MS;color:#fff;letter-spacing:4px">ABCT</span></div>
    <div class="asub" style="margin-top:30px;font:700 40px MS;color:${MUTED}">attend karne ka mauka</div>`;
  const eqB = el('div', 'card abs', eq, { inset: '0px', padding: '28px 28px', textAlign: 'center' });
  const tile = (i) => `<div class="tile t${i}" style="width:66px;height:70px;border-radius:12px;background:rgba(255,255,255,.12);display:flex;flex-direction:column;overflow:hidden">
      <div style="height:18px;background:${AMB}"></div><div style="flex:1;display:flex;align-items:center;justify-content:center;font:900 30px MS;color:#fff">${i}</div></div>`;
  eqB.innerHTML = `<div class="b1" style="display:flex;align-items:center;justify-content:center;gap:16px;font:900 80px/1 MS;color:#fff;letter-spacing:2px">ABCT
      <span style="color:${AMB}">with AI</span>${iconHTML('sparkles', 62, AMB, 2.4)}</div>
    <div style="display:flex;align-items:center;justify-content:center;gap:20px;margin-top:34px">
      <div class="b2" style="width:420px;height:204px;border-radius:22px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px">
        <div style="display:flex;gap:12px">${tile(1)}${tile(2)}${tile(3)}</div>
        <div style="font:900 46px MS;color:#fff">3 DIN <span style="color:${AMB}">ABCT</span></div></div>
      <div class="plus" style="font:900 76px MS;color:${AMB}">+</div>
      <div class="b3" style="width:296px;height:204px;border-radius:22px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:${NAVY}">
        ${iconHTML('sparkles', 66, NAVY, 2.4)}<div style="font:900 48px MS">AI TOOL</div></div>
    </div>`;
  gsap.set(eq, { autoAlpha: 0 });
  TL.fromTo(eq, { autoAlpha: 0, y: 80 }, { autoAlpha: 1, y: 0, duration: 0.26, ease: 'power3.out', immediateRender: false }, 24.84);
  const qa = (s) => eqA.querySelector(s), qb = (s) => eqB.querySelector(s);
  win(qa('.a4'), 24.86, null, { inT: 'pop', dIn: 0.3 });
  win(qa('.ab'), 25.44, null, { inT: 'pop', dIn: 0.3 });
  win(qa('.asub'), 26.08, null, { inT: 'up', dIn: 0.25 });
  gsap.set(eqB, { autoAlpha: 0 });
  TL.to(eqA, { autoAlpha: 0, scale: 0.95, duration: 0.12, ease: 'power2.in' }, 27.54);
  TL.fromTo(eqB, { autoAlpha: 0, scale: 1.03 }, { autoAlpha: 1, scale: 1, duration: 0.18, ease: 'power2.out', immediateRender: false }, 27.64);
  gsap.set([qb('.b1'), qb('.plus')], { autoAlpha: 0 });
  win(qb('.b1'), 27.70, null, { inT: 'pop2', dIn: 0.3 });
  // empty dashed slots (no words before they are spoken), filled on their words
  const slotStyle = { background: 'rgba(255,255,255,.04)', border: '3px dashed rgba(255,255,255,.28)' };
  gsap.set([qb('.b2'), qb('.b3')], slotStyle);
  gsap.set([...qb('.b2').children, ...qb('.b3').children], { autoAlpha: 0 });
  TL.set(qb('.b2'), { background: 'rgba(255,255,255,.08)', border: '2px solid rgba(255,255,255,.16)' }, 28.70);
  TL.set(qb('.b2').children[0], { autoAlpha: 1 }, 28.70); TL.to(qb('.b2').children[1], { autoAlpha: 1, duration: 0.2 }, 28.70);
  pulse(qb('.b2'), 28.70, 1.05, 0.26);
  [1, 2, 3].forEach((i) => win(qb('.t' + i), 28.80 + (i - 1) * 0.12, null, { inT: 'pop', dIn: 0.22 }));
  win(qb('.plus'), 29.58, null, { inT: 'pop', dIn: 0.22 });
  TL.set(qb('.b3'), { background: AMB, border: '0px solid transparent' }, 29.98);
  TL.to([...qb('.b3').children], { autoAlpha: 1, duration: 0.18 }, 29.98); pulse(qb('.b3'), 29.98, 1.07, 0.3);
  TL.to(eq, { autoAlpha: 0, y: 60, duration: 0.16, ease: 'power2.in' }, 30.54);

  // ---------------- 32.87–end final CTA end card ----------------
  const end = html(F, { left: '60px', top: '960px', width: '900px', textAlign: 'center' }, `
    <div class="e1" style="font:900 50px/1.1 MS;color:#fff;text-shadow:${shadowTxt};white-space:nowrap">FREE <span style="color:${AMB}">1-HOUR</span> STRATEGY VIDEO</div>
    <div class="e3" style="margin-top:12px;font:700 34px MS;color:${MUTED};text-shadow:${shadowTxt};white-space:nowrap"><span style="color:${AMB}">STEP 2:</span> Agle page par 4 DIN ABCT with AI</div>
    <div class="btn" style="margin:22px auto 0;width:780px;height:124px;border-radius:999px;background:${AMB};display:flex;align-items:center;justify-content:center;gap:20px;
      font:900 58px MS;color:${NAVY};box-shadow:0 14px 30px rgba(0,0,0,.45),inset 0 -6px 0 rgba(0,0,0,.12)">${playIcon(76, NAVY, AMB)} ABHI DEKHO</div>
    <div class="tap" style="margin-top:14px;font:800 40px MS;color:#fff;text-shadow:${shadowTxt}">Neeche button pe TAP karo <span class="emoji">👇</span></div>`);
  win(end, CUT.c1970, null, { inT: 'up', dIn: 0.32 });
  const qe = (s) => end.querySelector(s);
  win(qe('.e3'), 33.30, null, { inT: 'fade', dIn: 0.3 });
  win(qe('.tap'), 34.30, null, { inT: 'pop2', dIn: 0.26 });
  // chevrons point at the real platform button; the hand taps the chevron tip on 'click'
  const chev = chevrons(F, CX - 40, 1284, 34.30, T_END + 1, 80, AMB, 10);
  handTap(F, CX + 6, 1318, 34.05, 34.32, 35.10, 104);
  TL.to(qe('.btn'), { scale: 1.035, duration: 0.42, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 35.80);
  // end-freeze legal line replaces the short strip
  const legal = html(F, { left: '60px', top: '1376px', width: '900px', textAlign: 'center' },
    `<div style="display:inline-block;background:rgba(4,10,26,.62);border-radius:16px;padding:8px 20px;font:500 28px/1.25 MS;color:rgba(255,255,255,.92);white-space:nowrap">
      Investments in securities market are subject to market risks.<br>Educational content only. Not investment advice.<br>No assured returns.</div>`);
  win(legal, 35.74, null, { inT: 'fade', dIn: 0.2 });
}
