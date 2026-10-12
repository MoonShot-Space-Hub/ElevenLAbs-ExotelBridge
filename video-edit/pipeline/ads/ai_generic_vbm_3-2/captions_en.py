# Build caption groups for an English ad from Parakeet word timestamps. CHUNKS lists the display words per chunk;
# words are matched in order against the ASR words. '*' marks an amber keyword. Display text may fix ASR spelling.
import json, sys, re
asr = json.load(open(sys.argv[1])); END = float(sys.argv[3])
CHUNKS = [
 "I wish I had", "*28 *hours a day.", "Don't you think so?", "With so much *distraction,", "so much of *work,", "and so much of things", "going around in the world,",
 "we always feel", "*short of *time.", "Either I don't have time", "for my *health,", "or I don't have time", "for my *family,", "or I don't have time", "for my *fitness,",
 "or don't have time", "for my *hobbies.", "That's the problem", "most people face,", "but *not *any *longer", "because now we have", "the *power of *AI.",
 "With the help of AI,", "you can at least", "buy back *10 *hours", "of your week.", "How?", "You can use in your *job,", "you can use in your *business,",
 "you can use in your", "*trading and *investments,", "you can use in your", "*personal *life,", "you can use in your", "*travel *plans,", "you can use *everywhere,",
 "but provided you know", "how to *use it,", "and it's not that *difficult.", "Like, I'm *not a *tech *guy,", "I'm a stock market *investor,", "but I use *AI",
 "on a *daily basis", "and save *10 *hours", "of my week.", "And I have all the time", "to focus on my *health,", "my *kids, my *family,", "and a lot of other things.",
 "And I'm teaching the same", "in my *masterclass.", "If you want to learn AI", "the most *simple way,", "*click on the *link", "and *join my *masterclass", "right now.",
]
norm = lambda w: re.sub(r"[^a-z0-9']", '', w.lower())
ws = asr; i = 0; groups = []
for ch in CHUNKS:
    words = []
    for tok in ch.split():
        kw = tok.startswith('*'); tok = tok.lstrip('*')
        a = ws[i]
        if norm(a['w']) != norm(tok) and norm(tok) not in ('how', 'use'):
            print('MISMATCH', i, a['w'], tok); 
        words.append({'w': tok, 'kw': kw, 'start': round(a['t'], 3)}); i += 1
    groups.append({'words': words})
for gi, g in enumerate(groups):
    nxt = groups[gi + 1]['words'][0]['start'] if gi + 1 < len(groups) else END
    for wi, w in enumerate(g['words']):
        w['end'] = g['words'][wi + 1]['start'] if wi + 1 < len(g['words']) else nxt
    g['start'] = g['words'][0]['start']; g['end'] = nxt
print('used', i, 'of', len(ws), 'asr words')
json.dump(groups, open(sys.argv[2], 'w'), indent=1)
for g in groups: print(f"{g['start']:6.2f}-{g['end']:6.2f} " + ' '.join(('*' if w['kw'] else '') + w['w'] for w in g['words']))
