# "ABCT with AI" ad — review and edit notes

Source: `Abct_With_Ai_new_ads_1_1.mp4`. Vertical 9:16, 1080×1920, 59.94 fps, 35.7 s. Hinglish voiceover, a single talking-head take in a park.

## What the video says (transcript, Hinglish)

| Time | Line |
|---|---|
| 0.0–3.6 | Ek strategy jo main 19 saal se sikha raha hoon, aur dhai lakh logon ne seekhi hai |
| 3.6–10.8 | aur woh maine aapke liye record ki hai — free, ek hi ghante mein, jo aap click karke turant dekh sakte ho, woh bhi bilkul free, jo usually hamare paid programs mein hua karta tha |
| 10.8–15.4 | Ab aisa nahi ki yeh strategy dekh ke aap turant paisa banana shuru kar doge, ya kal ka kal aap crorepati ban jaoge |
| 15.4–20.0 | Par aapko samajh mein aayega ki market kaise chalta hai, system kaise chalta hai, systematic trading hota kya hai |
| 20.0–22.3 | So click on the link and check out this video right now |
| 22.3–32.9 | Aur uske saath saath agar agle page par jaoge toh aapko 4 din ka ABCT attend karne ka mauka milega, jahan par ABCT with AI — teen din ABCT aur ek AI ka tool hai, jo yeh strategy ko aur bhi aasaan kar deta hai |
| 32.9–35.7 | So watch this strategy right now, click on the link and I'll see you inside |

Funnel: a free 1-hour recorded strategy video, then on the next page a 4-day "ABCT with AI" (3 days of ABCT plus an AI tool).

## What can be made better

### High priority (all fixed in the edit)
1. **Nothing works with the sound off.** There was no text at all. Most feed viewers watch muted, so they never learned the video is FREE. *Edit:* Hinglish captions throughout (2–4 words, keywords in amber) and a frame-0 headline: "FREE • 1-HOUR VIDEO / 19 SAAL KI STRATEGY".
2. **Weak first second.** It opened on a wide shot with a small face (~20% of frame width), and "free" only arrives at 5.2 s. *Edit:* the ad opens close on the face with the offer on screen from frame 0, so the first frame also works as the thumbnail.
3. **One static shot for 36 s, and the 4 jump cuts (5.47 / 10.83 / 12.65 / 15.42 s) look like glitches.** The last 20 s never change. *Edit:* a virtual camera cuts between wide (1.12×), medium (1.22×) and close (1.32–1.38×) every 1.5–3.5 s on sentence boundaries. The jump cuts now read as deliberate cuts, and the "Par…" pivot switches to a navy focus look.
4. **Proof points were only spoken.** *Edit:* a 2,50,000 counter on "dhai lakh", and a 19 SAAL headline.
5. **The offer details were scattered** (recorded, free, 1 hour, click & watch, used to be paid). *Edit:* one "Strategy Video" card that builds as he speaks: REC → FREE badge → 1 GHANTA → hand taps ▶ → "PAID PROGRAM" struck through → FREE stamp.
6. **The funnel is confusing.** CTA 1 at 20 s sounds like the ending, "agle page" is never explained, and "click the link" points at nothing. *Edit:* STEP 1 / STEP 2 structure, an amber button with a hand-tap and arrows pointing at the ad's CTA button, and an end card that repeats it.
7. **ABCT is never explained, and "4 din" vs "3 din + AI tool" is hard to follow by ear.** *Edit:* "4 DIN ABCT", then "ABCT with AI = [3 DIN ABCT] + [AI TOOL]", exactly as he says it (no invented Day-4 label).
8. **Compliance (SEBI / ASCI).** There was no written disclaimer, and the "paisa / crorepati" lines are a trap if animated literally. *Edit:* a persistent two-line disclaimer, a full legal line on the end card, and a myth card that shows "Turant paisa ✗ / Kal-ka-kal crorepati ✗" in grey, already struck through. No ₹, money, rising-chart or ka-ching visuals or sounds anywhere.
9. **Busy background, as bright as the face.** The yachts and marina read as a wealth cue next to "crorepati". *Edit:* AI person-matting separates the presenter. The background is blurred, darkened and desaturated (more so in the "aisa nahi" section), and the "samajh aayega" section gets a navy studio look with a grid. Greens are toned down and a soft vignette added.
10. **Audio.** The voice was muddy (+4 dB at 200–400 Hz), had almost nothing above ~4.8 kHz, sat at −15.9 LUFS, and had no music or SFX. *Edit:* de-mud and presence EQ, a harmonic exciter to restore "air", a music bed arranged to the script (drums drop for the disclaimer, return on "Par…", resolve at the end), ~25 subtle SFX, and a master at −14 LUFS / −1.5 dBTP.
11. **The ending was abrupt** (0.38 s after the last word). *Edit:* a 1.6 s end-card hold on a closed-mouth frame, with the CTA and legal line.

### Needs a reshoot / client input (can't be fixed in the edit)
- **Voice quality:** the recording is band-limited (narrow-band mic or heavy noise reduction). Re-record on a lav mic, or run the voice through an AI speech enhancer before the final mix.
- **Script order:** say the offer first ("Free 1-hour video…"), keep one CTA at the end, and say what ABCT stands for and whether the 4-day ABCT is paid. Consider dropping the repeated "woh bhi bilkul free" (that would also shorten the ad).
- **Framing:** shoot chest-up, or in 4K, so punch-ins stay sharp. The 1080p source is soft above ~1.35×. Choose a calmer background without boats.
- **B-roll:** a screen recording of the free video and of a chart walkthrough or the AI tool would make it a real explainer.
- **Confirm before running:** SEBI registration status (show name and registration number if registered), the final disclaimer wording, documentation for "19 saal" and "2.5 lakh", what ABCT stands for, whether the AI tool is Day 4, and whether the 4-day ABCT is paid.

## Notes on the edit
- Music and sound effects are synthesized from scratch (no stock or licensed audio), so there are no licensing issues. The mixer (`pipeline/scripts/mix.py`) can export separate voice, music and SFX stems if you want to swap in your own licensed track.
- Fonts: Montserrat (SIL OFL). Icons: Lucide (ISC).
- Everything is reproducible with the scripts in `pipeline/` (graphics: `pipeline/mg/`, edit and mix settings: `pipeline/config/`). The rendered videos are delivered in the chat, not stored in this repo.
