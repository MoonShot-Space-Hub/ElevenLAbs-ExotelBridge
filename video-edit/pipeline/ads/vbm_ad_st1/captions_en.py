# Build caption groups for an English ad from Parakeet word timestamps. CHUNKS lists the display words per chunk;
# words are matched in order against the ASR words. '*' marks an amber keyword. Display text may fix ASR spelling.
import json, sys, re
asr = json.load(open(sys.argv[1])); END = float(sys.argv[3])
CHUNKS = [
 "This *Diwali,", "*gift your future self", "a *skill.", "A skill that makes you", "a parallel source of income.",
 "How to *analyze the stock,", "when to *buy,", "when to *sell,", "when to *exit,", "how much to buy,", "how much to sell,",
 "how to manage your *emotions,", "and that everything", "into one simple *masterclass", "called *ABCT *with *AI.",
 "Anybody can trade with AI.", "In this masterclass,", "you will learn", "how a *trading *system works,", "when to *enter,", "when to *exit,",
 "all that,", "how to *select the stock,", "and also", "how you can use *AI", "to *save *time", "and *scan the stock,", "*automate the stock", "so that you can",
 "save your time", "doing your regular *job", "or *business.", "Along with that,", "you create a parallel", "source of income.",
 "So you *don't have to", "*leave *everything", "and do stock market.", "Stock market is created", "to create a parallel", "source of income, right?",
 "And that's what exactly", "we are going to cover", "in this *masterclass.", "So *click on the *link", "and *join the *free masterclass", "right now.",
]
norm = lambda w: re.sub(r"[^a-z0-9']", '', w.lower())
ws = asr; i = 0; groups = []
for ch in CHUNKS:
    words = []
    for tok in ch.split():
        kw = tok.startswith('*'); tok = tok.lstrip('*')
        a = ws[i]
        if norm(a['w']) != norm(tok) and not (norm(tok) == 'diwali' or norm(tok) == 'abct'):
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
