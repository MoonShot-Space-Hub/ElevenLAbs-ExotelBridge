# Word-level timing for Hinglish captions: whisper segment bounds + English-ASR anchors + syllable nuclei.
import json, re, sys
nuc = json.load(open(sys.argv[1]))['nuclei']
# (segment start, end, text). '|' separates caption groups; '*word' = keyword highlight; 'word@t' = hard anchor (word start, s)
SEGS = [
 (0.00, 2.16, "Ek@0.16 strategy@0.40 jo | main *19 *saal se | sikha raha hoon"),
 (2.16, 3.58, "aur@2.16 *2.5@2.32 *lakh@2.56 logon@2.80 ne | seekhi hai"),
 (3.58, 5.08, "aur@3.68 woh maine | aapke liye *record@4.72 ki hai"),
 (5.08, 7.74, "*FREE@5.20 ek hi ghante mein | jo aap *click@6.48 karke | turant dekh sakte ho"),
 (7.74, 8.64, "woh@7.76 bhi | bilkul *FREE@8.48"),
 (8.64, 10.78, "jo@8.80 usually@8.96 hamare | *paid@9.60 *programs@9.76 mein | hua karta tha"),
 (10.78, 13.78, "Ab aisa *nahi | ki yeh strategy | dekh ke aap | turant paisa | banana shuru kar doge"),
 (13.78, 15.40, "ya kal ka kal | aap *crorepati | ban jaoge"),
 (15.40, 18.58, "Par@15.52 aapko | samajh mein aayega | ki *market@16.72 | kaise chalta hai | *system@17.76 kaise chalta hai"),
 (18.58, 20.02, "*systematic *trading | hota kya hai"),
 (20.02, 22.32, "So@20.16 *click@20.32 on the *link@20.64 | and check@20.96 out | this *video@21.52 | right now@21.92"),
 (22.32, 24.40, "Aur@22.40 uske saath saath | agar *agle *page | par jaoge"),
 (24.40, 27.30, "toh@24.48 aapko | *4@24.88 *din ka *ABCT@25.44 | attend@26.08 karne ka | mauka milega"),
 (27.30, 30.84, "jahan par | *ABCT@27.76 *with *AI@28.40 | *teen@28.72 *din *ABCT@29.20 | aur@29.60 ek *AI@30.00 ka *tool"),
 (30.84, 32.88, "jo yeh strategy@31.36 | aur bhi *aasaan | kar deta hai"),
 (32.88, 35.74, "So@33.04 *watch@33.20 this *strategy@33.52 | right now@33.92 | *click@34.32 on the *link@34.64 | and I'll@34.96 see you *inside@35.20"),
]
SYL = {'19': 2, '2.5': 2, '4': 1, 'abct': 4, 'ai': 2, "i'll": 1, 'strategy': 3, 'usually': 3, 'programs': 2, 'systematic': 4,
       'trading': 2, 'the': 1, 'video': 3, 'free': 1, 'page': 1, 'link': 1, 'click': 1, 'inside': 2, 'record': 2, 'market': 2,
       'system': 2, 'right': 1, 'watch': 1, 'check': 1, 'out': 1, 'now': 1, 'see': 1, 'you': 1, 'tool': 1, 'attend': 2,
       'and': 1, 'so': 1, 'this': 1, 'on': 1, 'with': 1, 'dhai': 2, 'aayega': 3, 'hai': 1, 'aisa': 2, 'aasaan': 2, 'paisa': 2,
       'mauka': 2, 'aur': 1, 'main': 1, 'hoon': 1, 'teen': 1, 'din': 1, 'deta': 2, 'jaoge': 3, 'doge': 2, 'crorepati': 4}
def syl(w):
    k = w.lower().strip('.,!?')
    if k in SYL: return SYL[k]
    return max(1, len(re.findall(r'(aa|ai|au|ee|oo|ou|ei|[aeiou])', k)))
words = []
for s0, s1, text in SEGS:
    toks = []
    for g, grp in enumerate(text.split('|')):
        for w in grp.split():
            kw = w.startswith('*'); w = w.lstrip('*'); anc = None
            if '@' in w: w, a = w.split('@'); anc = float(a)
            toks.append({'w': w, 'kw': kw, 'anchor': anc, 'syl': syl(w), 'grp': g})
    # split into spans between anchors; distribute syllables onto detected nuclei inside each span
    pts = [(0, s0)] + [(i, t['anchor']) for i, t in enumerate(toks) if t['anchor'] is not None] + [(len(toks), s1)]
    pts2 = []
    for p in pts:
        if pts2 and p[0] == pts2[-1][0]: pts2[-1] = p
        else: pts2.append(p)
    for (i0, t0), (i1, t1) in zip(pts2[:-1], pts2[1:]):
        span = toks[i0:i1]
        if not span: continue
        N = sum(t['syl'] for t in span)
        nn = [n for n in nuc if t0 - 0.02 <= n < t1 - 0.03]
        acc = 0
        for t in span:
            if t['anchor'] is not None and t is span[0]: t['start'] = t['anchor']
            elif nn:
                j = min(len(nn) - 1, int(round(acc * len(nn) / N)))
                t['start'] = max(t0, nn[j] - 0.07) if acc else t0
            else: t['start'] = t0 + (t1 - t0) * acc / N
            acc += t['syl']
    for i, t in enumerate(toks):
        t['seg'] = len([1 for _ in words]) and None
    for i, t in enumerate(toks):
        t['end'] = toks[i + 1]['start'] if i + 1 < len(toks) else s1
        t['seg_start'] = s0; t['seg_end'] = s1
    # monotonic fix
    for i in range(1, len(toks)):
        if toks[i]['start'] <= toks[i - 1]['start'] + 0.06: toks[i]['start'] = toks[i - 1]['start'] + 0.06
    for i, t in enumerate(toks): t['end'] = toks[i + 1]['start'] if i + 1 < len(toks) else s1
    words.append(toks)
# caption groups
groups = []
for si, toks in enumerate(words):
    for g in sorted(set(t['grp'] for t in toks)):
        ws = [t for t in toks if t['grp'] == g]
        groups.append({'seg': si, 'start': round(ws[0]['start'], 3), 'end': round(ws[-1]['end'], 3),
                       'words': [{'w': t['w'], 'kw': t['kw'], 'start': round(t['start'], 3), 'end': round(t['end'], 3)} for t in ws]})
json.dump(groups, open(sys.argv[2], 'w'), indent=1)
for g in groups: print(f"{g['start']:6.2f}-{g['end']:6.2f}  " + ' '.join(('*' if w['kw'] else '') + w['w'] + f"({w['start']:.2f})" for w in g['words']))
