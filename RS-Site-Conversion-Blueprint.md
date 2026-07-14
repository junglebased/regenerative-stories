# Regenerative Stories — Conversion Blueprint

> **v1 · Conversion strategy specification.** Fourth document of the system. The OS Spec owns IA and scene narrative; the UI System owns tokens/components; the 3D Framework owns interactions. This document owns **why anyone acts** — and delivers the honest audit the brief demands: exactly where 3D builds trust, and exactly where it would hurt conversion.
>
> **Translation of the brief to this brand (do not skip):** this is not a SaaS page. The "product" is a body of documentary work plus a partnership offer; "pricing" is partnership tiers; "FAQs" are the silent objections of a grant reviewer; "social proof" is institutional, not testimonial-carousel. Conversion here = *a reviewer cites the URL in an internal memo* and *a partner sends the email*. Every pattern below is the landing-page discipline applied to a credibility instrument.

---

## 1. The 3-Second Test — what the first viewport must accomplish

At `t=0–3s`, before any scroll, the page must answer three questions in order:

| Second | Question answered | Element that answers it | Spec |
|---|---|---|---|
| ~0.5 s | "Is this professional?" | Instant dark paint + Fraunces hero title (LCP, preloaded) | No white flash, no font reflow, no loader. Perceived quality is settled before content is read |
| ~1.5 s | "Who is this / what do they do?" | Title + eyebrow + one thesis line | The thesis line carries category ("documentary"), place, and stance in ≤ 12 words. If a reviewer screenshots only this viewport, the memo still writes itself |
| ~3 s | "Is this real?" | Hero film loop fades in over its poster | **Motion of real footage, not motion of UI.** Craft is proven by evidence in second three — before a single claim |

**The 3-second rule for 3D:** WebGL does **not** appear in the first viewport. This is a conversion decision, not a technical one — see §3. Attention is captured by *filmed reality*; the 3D scene is the retention engine, not the attention hook.

Guardrails: exactly one ambient motion in the viewport (the loop); scroll cue teaches the page's single interaction; nav + language switch operable at first paint (a reviewer sent an EN link may need TR in second one).

---## 2. Conversion Architecture — the funnel laid over the scroll

```
DEPTH   SECTION            FUNNEL STAGE        CONVERSION JOB              CTA EXPOSED
0%      #hero              Attention           Prove craft in 3 s          (scroll cue only)
8%      #scroll-scene      Immersion           Make the worldview felt     none — protected zone
35%     #films             Product demo        Prove the product exists    Watch (lightbox)
55%     #impact            Feature showcase    Quantify outcomes           none
65%     #credibility       Social proof        Prove continuity + backers  none
80%     #next              Roadmap             Prove momentum (Season One) soft: "Follow the work"
88%     #partnership       Pricing/offer       Name the ways in            PRIMARY: inquiry
100%    #contact           Close               Zero-friction handshake     email (JS-free)
```

Laws:

1. **One primary CTA** (partnership inquiry), exposed only after all four proofs (craft, product, impact, continuity) have landed. Landing pages that ask before proving train visitors to ignore the ask.
2. **No sticky CTA bar, no exit-intent modal, no scroll-triggered popups.** For a P1 audience (institutional reviewers) interruption patterns don't just underperform — they actively refute the page's own credibility claim. This exclusion is a conversion feature.
3. Every zone has one job. Sections marked "none" for CTA are load-bearing precisely because they ask for nothing — generosity of proof is the persuasion.

---

## 3. Where 3D builds trust — and where it would hurt conversion

The centerpiece answer. Rule derived from the audiences (§ OS-0): **3D builds trust when it *demonstrates the thesis*; it destroys trust the moment it decorates a claim.** A grant reviewer's core anxiety is "is this operation serious?" — 3D that behaves like evidence answers it; 3D that behaves like a template raises it.

### 3.1 Where 3D earns its place

| Location | Why it converts | Mechanism |
|---|---|---|
| **Title sequence (`#scroll-scene`)** | The thesis ("living systems regenerate when connected") is *experienced*, not asserted — the visitor performs the growth with their own scroll. Self-generated conviction outlasts read conviction | Pinned 4-act scene, §3D-Framework. Scroll ownership = agency = trust |
| **Its determinism** (`RS_SEED = 2020`) | Same forest every visit reads as *identity*; random particles read as *screensaver*. Reviewers revisit pages; sameness compounds brand memory | Seeded PRNG, OS §3.3 |
| **Its restraint after itself** | One virtuoso sequence followed by discipline signals: "we can, and we choose when." That is exactly a funder's question about how you'll spend their money | Particle discipline (OS §4.5), idle policy (3DF §9) |
| **Glass over the live scene only** | UI that acknowledges the world behind it reads as considered — production value transferred to the organization's perceived competence | UI §5, G1–G2 |

### 3.2 Where 3D would hurt conversion — and is therefore banned

| Location | What 3D would do there | Why it costs conversions |
|---|---|---|
| **First viewport / hero** | WebGL hero, 3D logo, shader background | Delays LCP on the exact frame where professionalism is judged; and *filmed footage outranks rendered anything* as proof for a film company. A 3D hero says "we make websites," not "we make films" |
| **Films section** | 3D card tilts, WebGL hover distortions, carousel in space | The stills ARE the product. Any rendered layer between the reviewer and the footage dilutes the evidence. Product demo = the lightbox playing the actual film, full stop |
| **Impact + credibility (sand)** | Animated 3D charts, floating counters, parallax numbers | Numbers gain authority from stillness. A reviewer screenshots this section for the memo — it must photograph like a printed report. Motion here reads as compensating |
| **Partnership + contact** | 3D flourishes near the CTA, animated globes, particle backgrounds | At the moment of decision, every moving pixel is a reason to hesitate. The close must feel like a quiet room, not a pitch deck |
| **Navigation / cursor** | 3D menus, cursor followers, magnetic buttons | Latency-feel + portfolio-site vanity signals; institutions distrust sites that perform for themselves |
| **Anywhere on low-power mobile** | Full-tier scene | A janky frame is worse than no frame: it converts "premium" into "fragile" in one stutter. Hence the tier ladder (OS §3.4) — degradation is invisible or it isn't shipped |

**The audit in one line:** 3D lives in exactly one place, where it *is* the argument — everywhere else the argument is footage, numbers, and silence, and 3D would compete with its own evidence.

---

## 4. Section Conversion Specs

### 4.1 Immersive hero — attention (§1 covers it)
Add one conversion detail: the thesis line and title are real text (selectable, indexable, screenshot-crisp) — never baked into imagery. Reviewers copy-paste into memos; make quoting effortless.

### 4.2 Animated demo — two demos, deliberately split
- **Worldview demo** = the title sequence (the "how we think" demo). Protected zone: zero CTAs inside the pin — interrupting the one wordless sequence with an ask would spend the trust it's generating.
- **Product demo** = `#films`. The demo is *watching the actual product* via lightbox — zero-install, one click, on the page. Conversion spec: card CTA verb is always "Watch" (consumption, not navigation); lightbox close returns focus to the card so the reviewing rhythm (watch → next film) has no dead ends. Runtime + year in mono meta answers "how much am I committing to?" before the click.

### 4.3 Storytelling sections — the beats
Beat captions (B1–B4) are the story's only words; they double as the page's most-remembered copy. Conversion job: each beat ends in a noun a reviewer can repeat ("the network", "the signal", "the seed", "the garden"). If a phrase can't survive being quoted in a memo, rewrite it.

### 4.4 Feature showcase — `#impact`
Features = outcomes (viewers reached, screenings, communities). Spec per UI C3: no count-up theater, tabular numerals, flat daylight. **Add one comparative anchor per number** (e.g., scale context) — raw numbers convert only when the reader can rank them.

### 4.5 Social proof — `#credibility`
Institutional proof (timeline 2020→now + supporter logos) outranks testimonials for P1 and is already built. Two upgrades:
- Logos: uniform monochrome treatment (`--color-label` tint on sand), one height — mixed logo chromatics read as a sponsor pinboard, not a peer group.
- **Pull-quote slot (content-gated):** one Spectral-italic quote from a named institutional partner, max 20 words, placed between timeline and logos. A single attributed sentence outperforms a testimonial carousel at zero motion cost. *Requires real quote — flag to content owner; do not ship with a placeholder.*

### 4.6 Pricing — `#partnership` as the tier sheet
The section already lists ways to collaborate; structure it like pricing without money-on-page:

| Tier (pattern) | Offer shape | CTA |
|---|---|---|
| Screen | Host a screening / license a film | Ghost: "Request a screening" |
| Fund | Support a story in development (`#next` links here) | **Primary: "Start the conversation"** |
| Partner | Co-production / institutional alliance | Ghost: "Explore partnership" |

Three options with the middle one visually primary (C1a filled, the page's only filled button) — the classic pricing-page anchor, translated. Each tier: mono eyebrow, one-sentence offer, one concrete deliverable line ("what you get"), CTA. All CTAs resolve to the same contact flow with a `subject` prefilled per tier — segmentation without a form field.

### 4.7 FAQs — answer them without building an FAQ
A visible FAQ accordion reads as retail and breaks the editorial voice. The reviewer's real FAQs get answered **in place**:

| Silent question | Where it's answered |
|---|---|
| "Are they legit / how long have they existed?" | Timeline 2020→now (§4.5) |
| "Can they actually deliver films?" | Three watchable films (§4.2) |
| "Who else trusts them?" | Supporter logos + pull quote |
| "What's next / are they active?" | `#next` Season One |
| "How do I engage and what does it cost me?" | Tier sheet (§4.6) |
| "Who do I email, will a human answer?" | `#contact`: named person + direct address, not info@ |

If a question can't be answered in place, it earns a line in `#contact`, not an accordion.

### 4.8 Conversion CTAs — the system
- **Hierarchy:** 1 primary (filled, partnership-fund) · 3 ghosts (tiers, screening) · N text-CTAs ("Watch →"). Never two filled buttons in one viewport.
- **Copy law:** verb + object, ≤ 4 words, states what happens next ("Start the conversation", not "Learn more" — "Learn more" is where intent goes to die).
- **Motion:** per 3DF §8 — arrival sequenced after the offer text (CTA4), press feedback 90 ms, zero idle animation. The CTA earns attention by being the *stillest confident thing* on the page.
- **Fallback:** every CTA is an `<a href="mailto:...">` under the hood — conversion survives JS failure, ad blockers, and print-to-PDF (reviewers archive pages; a PDF with working mailto still converts).

---

## 5. Friction Audit & Measurement

**Friction to remove (current build):** contact must expose a named human + direct email; film cards need runtime/year meta; tier CTAs need prefilled subjects; TR/EN switch must preserve scroll position (language switch = same argument, other tongue — don't restart the funnel).

**Measurement (privacy-first, no cookie banner — a consent modal is the most expensive popup of all):** server-side or beacon-lite counts only: scroll-depth milestones (25/60/88/100%), lightbox opens per film, CTA clicks per tier, language switches. Targets per OS §0: ≥ 60% reach `#impact`, ≥ 25% open a film, and the new one — **≥ 8% of sessions that reach `#partnership` click a tier CTA.** Review numbers monthly against the decision log in Notion.

---

## 6. Gap List — what this blueprint adds to the build

Content-blocked items (need owner copy, flag in Notion): partner pull quote (§4.5), tier one-liners + deliverable lines (§4.6), named contact person (§4.7). Build items (no content needed): monochrome logo treatment, prefilled mailto subjects, scroll-preserving language switch, beacon metrics. All slot into OS roadmap M5–M6; none block M1–M4.

---

*v1 · Regenerative Stories — Conversion Blueprint · companion to OS Spec + UI System + 3D Framework*
