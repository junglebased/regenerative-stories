# Regenerative Stories — Site Operating System Spec

> **v1 · Production specification.** This is the single hand-off document for building the premium 3D-animated site in Claude Code. It is grounded in the existing codebase (`02/index.html`, `02/index_tr.html`) and the decisions locked in `RS-Site-Pipeline.md` (animation = code-native "Yol A": mycelium → electric signal → seed → garden).
>
> **Rule of the document:** every animation listed here carries a *Purpose* — if a motion can't justify itself in one sentence, it doesn't ship.

---

## 0. Strategy — Who this site converts, and to what

The site is not a portfolio. It is a **credibility instrument** for a documentary production company applying to grant programs (NatGeo-class) and recruiting impact partners.

### Audiences, ranked

| # | Audience | What they need in 90 seconds | Conversion event |
|---|---|---|---|
| P1 | Grant reviewers / funders | Proof of craft + proof of impact + proof of continuity (2020→now) | They cite the URL in an internal memo; they reach Contact |
| P2 | Impact partners & NGOs | Shared values, professionalism, a clear "how to work with us" | Partnership inquiry (email) |
| P3 | Viewers / press | Watch the films now | YouTube play (lightbox), channel follow |

### Conversion logic of the page

One scroll = one argument: **"Living systems regenerate when connected — so do stories."** The 3D scene *demonstrates* the thesis; the films *prove* it; the impact numbers *quantify* it; the timeline *establishes continuity*; the partnership section *closes*. Every design decision below serves that single argument. Nothing on the page exists to be impressive; it exists to be *believed*.

### Success metrics

- Scroll-depth: ≥ 60% of sessions reach `#impact`.
- ≥ 25% of sessions open at least one film lightbox.
- Contact/partnership clicks measurable (mailto instrumented with a lightweight event, no invasive analytics).
- Lighthouse: Performance ≥ 90 (mobile), Accessibility ≥ 95, LCP < 2.5 s on mid-tier Android.

---

## 1. Information Architecture

Single-page narrative, EN (`index.html`) + TR mirror (`index_tr.html`). No sub-pages — grant reviewers don't browse, they scroll once. Anchored sections in fixed order; the order **is** the argument:

```
/                          (EN)  ·  /tr (index_tr.html)
│
├─ #hero            Identity + thesis line + poster loop     "Who is speaking"
├─ #scroll-scene    THE LIVING SYSTEM (pinned 3D scene,      "The worldview,
│                   4 beats: network→signal→seed→garden)      experienced not told"
├─ #films-intro     Bridge copy                              "From metaphor to work"
├─ #films           Films 01–03 (YouTube lightbox)           "Proof of craft"
├─ #impact          Numbers + reach                          "Proof of impact"
├─ #credibility     Timeline 2020→now + supporter logos      "Proof of continuity"
├─ #next            Stories We're Pursuing (Season One)      "Proof of momentum"
├─ #partnership     Ways to collaborate                      "The offer"
└─ #contact         Contact + footer                         "The close"
```

### Navigation model (three redundant systems, one mental model)

1. **Top nav** (`#top-nav`): logo + language switch + menu button. Always reachable; goes translucent over the 3D scene, solid elsewhere.
2. **Section rail** (`#strat`, left edge, desktop ≥ 1100px only): vertical mono labels marking current section — the "you are here" for a long scroll. Hidden on mobile (rail width token `--rail: 44px` → 0).
3. **Overlay menu** (`#menu-overlay`): full anchor list, the accessible fallback and the mobile primary. `role="dialog"`, focus-trapped, Esc closes.

**IA rule:** new content must join an existing section or justify a new *beat* in the argument. No "About page" — the whole page is the about page.

---

## 2. Visual Identity System

The identity already exists in code; this section canonicalizes it as tokens. **Do not invent new colors or faces** — extend by token only.

### 2.1 Color tokens

```css
:root {
  /* Ground */
  --bg:        #1A1914;   /* dark humus — page base */
  --bg-sand:   #EDE8DF;   /* dried-earth light panels (impact, credibility) */
  /* Ink */
  --text:      #E8DFD0;   /* bone — body on dark */
  --text-dk:   #231E18;   /* soil — body on sand */
  /* Voice */
  --accent:    #C4662A;   /* terracotta — action, signal, kilim thread */
  --sage:      #7A8C70;   /* sage — living/secondary voice */
  --muted:     #4E5E47;   /* moss — metadata, labels */
  /* Lines */
  --border:    rgba(255,255,255,0.07);
  --border-dk: rgba(35,30,24,0.15);
}
```

**Contrast law:** `--accent` on `--bg` ≈ 4.1:1 → allowed only at ≥ 18.5px/bold or for non-text UI; body copy is always `--text` (12.9:1) or `--text-dk` on sand (12.3:1). `--muted` on `--bg` fails AA for body — labels using it must stay ≥ 13px uppercase mono *and* never carry information absent elsewhere (it is decorative voice, verified against WCAG 1.4.3 by keeping essential text out of it).

### 2.2 3D scene color extension (new tokens)

```css
:root {
  --scene-hypha:   #5C4A33;  /* mycelium strands — warm umber, low luminance */
  --scene-signal:  #E8A15C;  /* electric pulse — heated terracotta, additive */
  --scene-seed:    #F0D9B8;  /* seed glow core */
  --scene-leaf:    #7A8C70;  /* garden foliage = --sage, deliberately */
  --scene-bloom:   #C4662A;  /* kilim-motif flowers = --accent, deliberately */
  --scene-fog:     #12110D;  /* depth falloff, slightly darker than --bg */
}
```

Purpose: the scene's climax (garden) resolves into the *site's own* accent + sage — the 3D world and the UI are one organism. A viewer who never articulates this still feels the coherence.

### 2.3 Typography

| Role | Face | Weight | Usage |
|---|---|---|---|
| Display | **Fraunces** | 900 | Titles, big numbers, beats. `clamp()`-sized, tight leading (0.86–1.0), letter-spacing −0.02 to −0.03em |
| Body | **Spectral** | 300 | Paragraphs, long-form. Line-height ≥ 1.6 |
| Voice/label | **IBM Plex Mono** | 400 | Eyebrows, metadata, nav, stats labels. Uppercase, tracked +0.08 to +0.16em |

Type scale stays fluid via existing `clamp()` patterns (e.g. hero `clamp(56px, 10.5vw, 108px)`). Fonts: self-host WOFF2 subsets (latin + latin-ext for TR: `ğışçöü İ`), `font-display: swap`, preload the two files used above the fold (Fraunces 900, Plex Mono 400). Budget: ≤ 120 KB total font transfer.

### 2.4 Texture & motif

- **Kilim motif** is the only ornament license: appears in garden-bloom geometry (Act IV) and may appear as a 1px-line divider pattern. Never as background wallpaper.
- Film-still imagery does the texture work; UI chrome stays flat, bordered by the hairline tokens.
- Grain/noise: a single, static 2–3% opacity noise on `--bg-sand` panels is permitted; **no animated grain** (cost without meaning).

---

## 3. The 3D Interaction System — "The Living System"

The signature element. One pinned scene (`#scroll-scene`), scroll-driven, four acts. Per the pipeline decision: **code-native WebGL, no video scrubbing.** Cinematic quality comes from shader craft — volumetric glow, depth fog, organic branching — not from file size.

### 3.1 Narrative timeline (scroll = time)

Pinned stage height: **400vh** (100vh viewport, 300vh of scrub). `progress ∈ [0,1]` derived from the sticky container's scroll offset, smoothed with `lerp(current, target, 0.08)` per frame so scrub feels like breath, not a slider.

| Act | Progress | Scene | Beat copy (existing `#b1–#b4`) | What the viewer should *feel* |
|---|---|---|---|---|
| I — Network | 0.00–0.30 | Mycelium hyphae grow across dark soil: L-system branching, seeded PRNG (same forest every visit — the brand's forest) | b1 | Hidden intelligence, patience |
| II — Signal | 0.25–0.55 | Particle pulses (`--scene-signal`, additive) travel the network edges; traffic density ramps with progress | b2 | Communication, urgency |
| III — Convergence | 0.50–0.75 | Network drains toward a center; strands morph inward; a seed condenses and glows (`--scene-seed`) | b3 | Focus, potential energy |
| IV — Garden | 0.70–1.00 | Seed cracks; procedural stem + leaves; kilim-motif blossoms unfold in `--scene-bloom`; camera pulls back to reveal a small garden | b4 | Release, regeneration — the thesis, proven visually |

Acts overlap by ~0.05 so transitions cross-fade rather than cut — nature doesn't hard-cut.

### 3.2 Camera & pointer system

- **Camera:** single slow dolly along Z with two keyframed drifts (Act III push-in +12%, Act IV pull-back −20%). No free orbit — this is cinema, not a viewer.
- **Pointer parallax:** mouse position tilts camera ±2.5° (lerped 0.05), touch devices use `deviceorientation` **only if** permission is already granted — never prompt. *Purpose:* depth perception; the scene reads as a space, not a wallpaper. Disabled under reduced motion.
- **No click/drag interactions inside the scene.** Interactivity budget is spent on scroll; competing gestures would break the "scroll = time" contract.

### 3.3 Technical architecture

```
02/
├─ index.html / index_tr.html      (existing shells)
├─ js/
│  ├─ scene.js         entry: init, RAF loop, progress binding, quality tiers
│  ├─ mycelium.js      L-system growth → LineSegments2-style ribbons (custom shader:
│  │                   growth via per-vertex "birth" attribute vs. uProgress — GPU-side
│  │                   reveal, zero geometry churn per frame)
│  ├─ signals.js       instanced particles advected along edge paths (path index +
│  │                   t stored per instance; vertex shader does the travel)
│  ├─ seedgarden.js    convergence morph targets + procedural stem/leaf/bloom
│  │                   (bloom = instanced kilim quads with SDF petal shader)
│  └─ post.js          additive glow: cheap dual-pass blur on a half-res target
│                      (no full postprocessing chain; one bloom is the budget)
└─ (assets as today)
```

- **Renderer:** Three.js (pinned version, self-hosted ESM build, tree-shaken — target ≤ 110 KB gz for three + scene code combined). Raw WebGL2 is acceptable if the build discipline holds, but Three.js is the recommended path for morph + instancing velocity.
- **Determinism:** one seed constant `RS_SEED = 2020` (founding year). Every visit grows the same network. *Purpose:* the animation is identity, not screensaver.
- **DPR cap:** `min(devicePixelRatio, 2)` desktop, `1.5` mobile.

### 3.4 Quality tiers & fallback ladder

| Tier | Trigger | Delivery |
|---|---|---|
| Full | WebGL2 + desktop + no reduced-motion | 4-act scene, glow pass, ~9k hyphae segments, 1.2k signal particles |
| Mobile | WebGL2 + coarse pointer | Same acts, 40% segment count, 400 particles, glow at ⅓ res, DPR 1.5 |
| Video | WebGL unavailable / context-loss / `scene.js` fails | Existing `#anim-video` (`__shot___type_sin.mp4`) plays as ambient loop behind beats — already wired, keep as the safety net |
| Static | `prefers-reduced-motion: reduce` | Poster frame of Act IV (garden, pre-rendered JPEG ≤ 80 KB); beats fade in on scroll with opacity only |

Context-loss handler (`webglcontextlost`) demotes to Video tier without reload. FPS watchdog: if median frame > 22 ms over a 2 s window, drop one tier's particle budget live.

---

## 4. Cinematic Scene Direction — the page as one continuous shot

The 3D scene (§3) is the title sequence; this section directs everything around it. The page is cut like a documentary: **cold open → title sequence → three acts of evidence → epilogue.** The whole scroll should feel like one camera move: *descend into the soil, travel the network, break the surface, stand in the garden, sit down to talk.* Constraint carried from §0: every effect names the story event it depicts. "Atmosphere" is not an event.

### 4.1 The light score (page-wide lighting design)

Light on this site never animates on its own; it changes only because the visitor moved. Lighting = *position in the story*, not spectacle.

| Scene | Ground | Light logic | What it makes the eye do |
|---|---|---|---|
| `#hero` | `--bg` (humus) | Night exterior. The film loop is the only luminous object — the brand's "campfire" | Eye locks onto the moving image: craft is witnessed before a single claim is read |
| `#scroll-scene` | `--scene-fog` (deepest) | Underground. Zero external light; the network itself emits (glow pass) | Eye follows the signals — the visitor literally tracks the thesis |
| `#films` | `--bg` | Screening room. Each film still is the brightest object in the viewport when centered | Attention hands off from still to still in scroll order — a curated reel, not a grid scan |
| `#impact` + `#credibility` | `--bg-sand` | **Surfacing into daylight.** Flat, even, print-like light. No glow, no shadowplay | Numbers and the 2020→now timeline read like a printed report — evidence shown in honest light is *more* persuasive than evidence dramatized |
| `#next` | `--bg` | Dusk. Darkness returns but the accent stays warm | Anticipation register for "Stories We're Pursuing" |
| `#partnership` + `#contact` | `--bg` | Campfire close: terracotta accents against dark | Intimacy for the ask — partnerships are conversations, not transactions |

The dark→sand→dark arc *is* the narrative arc rendered in luminance: underground → surface → evening. A visitor who never names it still feels the journey complete.

### 4.2 Depth model — where parallax is allowed to exist

Three layer classes with fixed rules; depth is felt, reading is never taxed:

| Layer | Contents | Depth behavior | Law |
|---|---|---|---|
| **Ground** | Scene canvas, film stills' watermark numerals, poster media | Counter-parallax ≤ 8% of scroll delta (A9), or scale-settle 1.04→1.00 on entry | Only non-text elements may occupy this layer |
| **Content** | All readable text, cards, CTAs, stats, timeline | Coefficient exactly 1.0 — scrolls with the finger, always | **Text never parallaxes.** The reading surface is stable ground; this is the usability floor under all the cinema |
| **Camera** | The 3D scene only | Dolly + pointer tilt per §3.2 | True camera movement is spent in one place so it stays special |

*Purpose of the ≤ 8% cap:* enough differential for the eye's depth perception to fire, below the threshold where tracking a moving target while reading costs comprehension.

### 4.3 Scene-by-scene direction — how each scene guides the visitor

| Scene | Camera treatment | Guidance mechanism | Usability guardrail |
|---|---|---|---|
| **Cold open** — `#hero` | Locked-off wide (no motion but the film loop) | Title states identity; scroll cue (A2) teaches the single interaction | Nav + language switch fully functional from frame one; LCP element lives here |
| **Title sequence** — `#scroll-scene` | The only true camera: dolly per §3.1–3.2 | Progress bar (A5) promises an end; beats (A4) caption each act so meaning never depends on decoding visuals | Native scroll physics only; PageDown traverses identically; static-poster tier delivers the same thesis image |
| **Screening room** — `#films` | Static frames; stills settle 1.04→1.00 as they enter (a dolly-settle, felt not seen) | Brightness hierarchy (§4.1) + hover affordance (A8) route the eye still → title → play | Lightbox is the only modal; cards are keyboard-operable; stills lazy-load below fold |
| **Daylight ledger** — `#impact` + `#credibility` | No camera. Flat light, print typography | Stagger on timeline years (A11) makes six years *accumulate* — continuity performed, not asserted | Zero parallax, zero glow on sand: this is where a grant reviewer screenshots; it must read at a glance and photograph clean |
| **Dusk** — `#next` | Static; standard reveals (A7) | Contrast snap back to dark re-arouses attention exactly when momentum sags (~80% depth) | Same reveal grammar as every section — no new patterns to learn this late |
| **Campfire** — `#partnership` + `#contact` | Static, warmest accent density on the page | Accent saturation peaks here, so peak visual warmth coincides with the CTA — the eye is already on the button | Contact is plain text + mailto: the close must work with JS fully disabled |

### 4.4 Depth transitions between scenes

Exactly **two hard cuts** and otherwise continuous ground — the page is edited like a two-cut film:

1. **Hero → title sequence:** shared dark ground; the hero loop dims as the pin engages ("lights go down"). Continuous — the visitor sinks, no seam.
2. **Title sequence → screening room:** at `progress = 1.0` the garden holds; the sticky releases into an identical dark ground and the first still settles in. The garden hands off to a real film frame: *metaphor cuts to evidence.*
3. **Films → impact — HARD CUT** (dark → sand at a full-width hairline). Justification: evidence should not be eased into; an honest cut is documentary grammar. It is also free (no JS, no jank) and invisible to reduced-motion users because it was never motion.
4. **Credibility → next — HARD CUT** (sand → dark), mirroring cut 3 so the pair reads as intentional structure.
5. **Next → close:** continuous dark to the footer; the journey ends where it began, one level warmer.

### 4.5 Particle discipline

Particle systems exist in **exactly two moments**, both inside the title sequence: signal pulses traveling the network (Act II — depicting communication) and seed motes during convergence (Act III — depicting gathering). No ambient dust, floaters, or drift anywhere else. After the title sequence proves we *can*, restraint proves we *chose* — and on this brand, discipline is the aesthetic. Any future particle proposal must name its story event in the §5.3 inventory or it doesn't merge.

---

## 5. Animation Language

### 5.1 Principles (the grammar)

1. **Everything grows; nothing slides.** Entrances scale from 98→100% + fade + ≤ 12px rise. No lateral fly-ins — sideways motion belongs to nothing in nature here.
2. **Scroll is the only clock** for the scene; time-based animation is reserved for micro-feedback (hover, focus) under 300 ms.
3. **One glow.** Additive bloom exists only in the 3D scene. UI never glows — keeps the scene's climax unique.
4. **Motion earns meaning or dies.** Enforced by the inventory in §5.3: every entry has a Purpose cell. PRs adding animation must add a row.

### 5.2 Motion tokens

```css
:root {
  --ease-grow:  cubic-bezier(0.22, 1, 0.36, 1);   /* organic decelerate — entrances */
  --ease-press: cubic-bezier(0.4, 0, 0.2, 1);      /* standard — hovers, UI feedback */
  --dur-micro:  180ms;   /* hover, focus ring */
  --dur-enter:  600ms;   /* reveal-on-scroll blocks */
  --dur-scene:  n/a;     /* scroll-driven, no clock */
}
```

### 5.3 Animation inventory — every motion, justified

| ID | Element | Trigger | Motion | **Purpose (why it exists)** | Reduced-motion behavior |
|---|---|---|---|---|---|
| A1 | Hero poster loop (`hero_loop.mp4`) | Load | Ambient video, muted | Establishes film craft in the first second — we are filmmakers before we say so | Paused on poster frame |
| A2 | Scroll cue (hero, bottom-right) | Load | 10px vertical breathe, 2 s loop | Teaches the page's one interaction: scroll | Static arrow |
| A3 | 3D scene Acts I–IV | Scroll progress | §3.1 | The thesis, experienced: connection → regeneration. This is the argument, not decoration | Static garden poster |
| A4 | Beat text `#b1–#b4` | Progress windows | Fade + 12px rise in, fade out | Anchors each act in language; motion syncs word to image so neither is skippable | Opacity-only fade |
| A5 | Scroll progress bar (`#scroll-prog`) | Scroll | Width 0→100% | Tells the viewer the pinned scene has an end — prevents "am I stuck?" abandonment | Kept (position feedback, essential) |
| A6 | Pointer parallax | Mouse move | ±2.5° camera tilt, lerped | Converts flat canvas into perceived space; depth = production value | Off |
| A7 | `.reveal` sections | IntersectionObserver, once, 15% visible | Fade + rise, `--dur-enter`, `--ease-grow` | Paces the argument — each proof block gets a moment of arrival instead of a wall of content | Off (visible immediately) |
| A8 | Film card hover | Hover/focus | Still brightens 1.0→1.08, CTA gap widens 8→14px | Affordance: "this is playable." Signals interactivity without a fake play chrome | CTA underlines instead |
| A9 | Film number watermark | Scroll (subtle, −4% translate) | Slow counter-parallax | Layers the film cards; separates foreground content from ground | Off |
| A10 | Lightbox open/close | Click | Backdrop fade 200 ms + box scale 0.97→1 | Confirms modal state change; scale-from-card preserves spatial continuity | Instant swap, fade only |
| A11 | Timeline year numbers (credibility) | Reveal | Fade + rise, 80 ms stagger per year | Stagger reads as accumulation — six years arriving one by one *is* the continuity claim | All visible |
| A12 | Nav state (rail + top nav) | Section change | Label color crossfade 300 ms | Orientation feedback on a long page | Kept (color only — already minimal) |
| A13 | Menu overlay | Button | Fade + links stagger 40 ms | Hierarchy scan: staggering forces top-to-bottom reading of anchors once | Fade only |
| A14 | Buttons/links | Hover/focus | Color + underline, `--dur-micro` | Baseline affordance | Kept (non-motion) |

**Explicitly banned:** cursor followers, magnetic buttons, text scramble/decode effects, horizontal scroll-jacking, autoplaying sound, parallax on body copy, animated counters that block reading. Each is momentum-breaking for P1 (a reviewer skimming) and off-voice for a documentary brand.

---

## 6. Responsive System

Mobile-first CSS; the existing `clamp()` fluid type carries most of the load. Breakpoints (min-width):

| Token | Width | Changes |
|---|---|---|
| base | 0 | Single column; rail hidden; beats `clamp(40px,…)` floor; scene = Mobile tier; film cards stack still-above-text; menu overlay is primary nav |
| `md` | 720px | Two-column film cards; impact grid 2-up; timeline horizontal |
| `lg` | 1100px | Section rail appears (`--rail:44px`); beats reach full display size; full scene tier eligible |
| `xl` | 1440px | Content max-width 1360px; scene canvas letterboxes gracefully (fog hides edges) |

Scene-specific responsive rules:
- Pinned height 400vh desktop → **300vh mobile** (thumb-scroll fatigue is real; the argument must not cost more than three swipes per act).
- Beat text: keep ≥ 24px minimum, text-shadow token retained for legibility over glow.
- `overflow-x: clip` on body stays (already present) — the scene must never cause horizontal scroll.
- Touch: no scroll hijacking, native momentum only; the sticky pin is pure CSS `position: sticky`, so the browser owns the physics.

---

## 7. Accessibility Strategy

Non-negotiables, tested before every deploy:

1. **Reduced motion:** single media query gates *all* of §5; scene renders the Act IV poster (the page still delivers its thesis image — accessibility must not mean a lesser argument).
2. **Canvas semantics:** `#anim-canvas` and `#anim-video` keep `aria-hidden="true"`; the beats (`#b1–#b4`) are real DOM text, so the narrative is fully readable by screen readers in order — the scene is enhancement, the words are content.
3. **Pinned scene ≠ trap:** no `overflow` locks, no wheel listeners with `preventDefault`. Keyboard users scroll through with PageDown identically.
4. **Dialogs:** lightbox + menu overlay: focus trap, `Esc` closes, focus returns to invoker, `aria-modal` (already scaffolded — verify trap + return).
5. **Focus visibility:** `:focus-visible` ring in `--accent`, 2px offset, on every interactive element including film cards.
6. **Contrast:** per §2.1 law; automated check (axe) in the QA pass; `--muted` never carries sole meaning.
7. **Media:** every still gets descriptive `alt` in both languages; YouTube iframes get `title`; hero video `muted` + no audio ever without gesture.
8. **Language:** `lang="en"` / `lang="tr"` on `<html>` per file; visible language switch in top nav with `hreflang` links; TR content is a translation, not a subset.
9. **Headings:** one `h1` (hero title), sections begin at `h2` — audit existing markup during build.

---

## 8. Performance Budget

| Metric | Budget |
|---|---|
| LCP (mobile, mid-tier) | < 2.5 s — LCP element is hero title or poster, **never** the canvas |
| JS total | ≤ 150 KB gz (three.js subset + scene ≤ 110 KB, site JS ≤ 40 KB) |
| Fonts | ≤ 120 KB WOFF2, 2 preloaded |
| CLS | < 0.05 — canvas and video have reserved aspect boxes |
| Scene | 60 fps desktop / ≥ 40 fps mobile median; watchdog per §3.4 |
| Images | Stills lazy-loaded (`loading="lazy"`), WebP/AVIF where possible, ≤ 180 KB each |
| Videos | `preload="metadata"` for scene fallback; hero loop ≤ 2.5 MB, `preload="auto"` only on desktop |

Scene loads as a deferred ESM module *after* first paint; until then the video fallback frame occupies the stage — the page is never blocked on WebGL.

---

## 9. Implementation Roadmap

Maps onto the pipeline's Faz 3–6; each milestone has acceptance criteria. Suggested branch flow: feature commits on the working branch, deploy per `01_DEPLOYMENT_GUIDE` / existing scripts.

### M1 — Token & skeleton hardening (0.5 day)
Extract §2 tokens into the stylesheet as the single `:root` block; add §5.2 motion tokens; audit headings/landmarks (§7.9); wire `.reveal` to the IO pattern with reduced-motion gate.
**Done when:** axe clean, tokens are the only color/easing literals in CSS.

### M2 — Scene scaffold (1 day)
`js/scene.js` bootstrap: renderer, DPR caps, sticky progress binding (lerped), quality-tier detection, context-loss → video fallback, FPS watchdog. Empty stage renders fog + test geometry.
**Done when:** all four fallback tiers reachable and verified (devtools override for reduced-motion + WebGL kill).

### M3 — Act I & II: mycelium + signals (2 days)
L-system growth with `RS_SEED`, birth-attribute reveal shader; instanced signal particles on edge paths; beats b1/b2 synced to progress windows.
**Done when:** 60 fps desktop / 40 fps mobile with tier budgets; growth is deterministic across reloads.

### M4 — Act III & IV: convergence + garden (2 days)
Morph-target convergence, seed glow (the one bloom pass), procedural stem/leaf, kilim SDF blossoms in `--scene-bloom`/`--scene-leaf`; camera drifts; Act IV poster exported for the Static tier.
**Done when:** full scrub reads as one continuous story; overlap cross-fades verified; poster committed.

### M5 — Polish & mobile (1 day)
Pointer parallax, mobile pin height 300vh, particle budget tuning on a real device, beat legibility over glow, §5.3 inventory audited against the build (delete any motion that grew a purpose-less row).
**Done when:** every inventory row's behavior + reduced-motion column matches reality.

### M6 — QA + deploy (0.5 day)
Lighthouse (≥ 90/95 per §0), axe, keyboard-only pass, TR parity check, cross-browser (Safari incl. iOS, Firefox, Chrome), deploy + SSL/mobile verification, decision log to Notion per pipeline §4.

---

## 10. Hand-off Notes for Claude Code

- **Source of truth for content:** existing `02/index.html` copy + Notion packs. Do not rewrite copy while building; flag instead.
- **Do not** add a build framework for the site shell — it is deliberately a static page; the only module graph is the scene's ESM files. Self-host three.js; no CDN (network policy + longevity).
- **Determinism first:** if a visual can be seeded, seed it with `RS_SEED = 2020`.
- **When cutting scope under time pressure**, cut in this order: A6 parallax → glow pass (flat additive still reads) → Act III morph (crossfade instead) — never cut fallback tiers or accessibility items; those are the floor.

---

*v1 · Regenerative Stories — Site OS Spec · companion to RS-Site-Pipeline.md*
