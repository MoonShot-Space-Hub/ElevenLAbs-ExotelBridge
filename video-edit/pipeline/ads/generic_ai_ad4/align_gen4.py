# Word-level timing for Hinglish captions: whisper segment bounds + English-ASR anchors + syllable nuclei.
import json, re, sys
nuc = json.load(open(sys.argv[1]))['nuclei']
# (segment start, end, text). '|' separates caption groups; '*word' = keyword highlight; 'word@t' = hard anchor (word start, s)
SEGS = [
 (0.00, 2.20, "Kya aap abhi bhi | *manually@0.88 kaam | kar rahe ho?"),
 (2.20, 2.96, "Jaise *PPT@2.24 banana@2.56,"),
 (2.96, 4.04, "*report@3.04 *analysis@3.44,"),
 (4.04, 4.72, "*travel@4.08 *plan@4.40,"),
 (4.72, 5.86, "everything@4.88 done@5.28 *manually@5.44?"),
 (5.86, 7.00, "Ya phir | *AI se kar rahe ho?"),
 (7.00, 8.46, "*AI@7.20 is not going | to *replace@7.92 you."),
 (8.46, 10.06, "Log@8.72 jo@9.04 *AI@9.28 | use@9.60 kar rahe hain"),
 (10.06, 11.42, "woh aapko | *replace kar sakte hain."),
 (11.43, 13.89, "Aur yeh itna bhi | *mushkil *nahi hai, | aapko khaali | *bolna hai."),
 (13.90, 17.82, "Aap normal@14.24 *English@14.64 bhi | bol sakte ho | ya *Hindi@15.76 bhi | bol@16.08 sakte ho, | aur *AI@16.72 ko | sikha@17.12 sakte ho"),
 (17.83, 23.91, "aur apna kaam, | apna *job@19.28, | apna *business@19.84, | apna *trading@20.64, | apna *investment@21.36, | apna *travel@22.08 *plan@22.32, | sab kuch *AI@23.12 se | kar@23.44 sakte ho."),
 (23.91, 26.35, "Aur woh bhi | kuch hi *ghanton mein, | aur kabhi-kabhi | kuch hi *minute@25.92 mein@26.16."),
 (26.35, 28.99, "Agar aapko | *AI seekhna hai, | woh bhi ekdum | *aasaan tareeke se,"),
 (29.00, 31.66, "toh@29.20 *join@29.28 my@29.52 *free@29.60 *masterclass@29.84 | on@30.40 *AI@30.56 for@30.96 the@31.04 *Common@31.12 *Man@31.36."),
]
SYL = {'19': 2, '2.5': 2, '4': 1, 'abct': 4, 'ai': 2, "i'll": 1, 'strategy': 3, 'usually': 3, 'programs': 2, 'systematic': 4,
       'trading': 2, 'the': 1, 'video': 3, 'free': 1, 'page': 1, 'link': 1, 'click': 1, 'inside': 2, 'record': 2, 'market': 2,
       'system': 2, 'right': 1, 'watch': 1, 'check': 1, 'out': 1, 'now': 1, 'see': 1, 'you': 1, 'tool': 1, 'attend': 2,
       'and': 1, 'so': 1, 'this': 1, 'on': 1, 'with': 1, 'dhai': 2, 'aayega': 3, 'hai': 1, 'aisa': 2, 'aasaan': 2, 'paisa': 2,
       'mauka': 2, 'aur': 1, 'main': 1, 'hoon': 1, 'teen': 1, 'din': 1, 'deta': 2, 'jaoge': 3, 'doge': 2, 'crorepati': 4, 'manually': 4, 'ppt': 3, 'analysis': 4, 'report': 2, 'everything': 3, 'done': 1, 'english': 2, 'hindi': 2, 'normal': 2, 'job': 1, 'business': 2, 'investment': 3, 'plan': 1, 'minute': 2, 'masterclass': 3, 'common': 2, 'man': 1, 'join': 1, 'my': 1, 'free': 1, 'for': 1, 'is': 1, 'not': 1, 'going': 2, 'to': 1, 'replace': 2, 'use': 1, 'mushkil': 2, 'kabhi-kabhi': 4, 'ghanton': 2, 'seekhna': 2, 'tareeke': 3, 'ekdum': 2, 'sikha': 2, 'khaali': 2, 'bolna': 2}
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
            if '@' in w:
                w, a = w.split('@'); m_ = re.match(r'([0-9]+\.[0-9]+)(.*)', a); anc = float(m_.group(1)); w = w + m_.group(2)
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
