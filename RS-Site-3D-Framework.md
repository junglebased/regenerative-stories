# Regenerative Stories — 3D Interaction Framework

> **v1 · Engineering specification (Three.js).** Third document of the system. `RS-Site-OS-Spec.md` owns strategy/IA/scene narrative; `RS-Site-UI-System.md` owns tokens/components. This document is the build sheet for everything that moves in 3D and everything that triggers it: exact triggers, durations, curves, and — for every interaction — the UX problem it solves.
>
> Inherited laws (binding): scroll is the only clock for the scene · one glow · text never parallaxes · every motion justifies itself · reduced-motion collapses travel, never feedback.

---

## 0. What "hero" means here

The page's first viewport (`#hero`) is deliberately **not** WebGL — it is a film loop, because the brand's first proof is filmmaking, and because the LCP element must never wait on a renderer. The 3D hero experience is the **pinned title sequence** (`#scroll-scene`) that follows. This framework covers both, plus every interactive surface downstream.

---

## 1. Engine Architecture

```
02/js/
├─ scene.js        bootstrap · RAF loop · quality tiers · context-loss → video tier
├─ timeline.js     the master scrub: window() + ease() utilities (§2, §4)
├─ camera.js       dolly rig + pointer parallax (§5)
├─ mycelium.js     Act I geometry + growth shader
├─ signals.js      Act II instanced particles
├─ seedgarden.js   Act III–IV morph + procedural garden
├─ post.js         single half-res additive bloom
└─ ui-motion.js    DOM interactions (§6–§9) — no Three.js import; shares easing tokens
```

**Render loop contract:**

```js
// one RAF, one clock, one smoothed progress value
target  = clamp01((scrollY - stickyTop) / (stickyHeight - viewportH));
progress = lerp(progress, target, 0.08);          // ~180ms settle at 60fps
if (Math.abs(progress - target) < 0.0005 && !pointerDirty) skipRender();  // idle = 0 GPU
```

- `lerp 0.08` is the scene's global "weight". It converts scroll deltas into motion with ~180 ms of inertia — heavy enough to feel filmed, light enough to never feel laggy. **Do not tune per-effect; tune here once.**
- All scene animation reads `progress`; nothing in the scene owns a clock except signal-particle drift (Act II idle motion, ±0, see A2b).
- Events: `scroll` and `pointermove` listeners are `{ passive: true }` and only write values; all reads happen in the RAF. Zero layout work in listeners.

**Timeline utility (the whole scrub system is 15 lines):**

```js
const window_ = (p, a, b) => clamp01((p - a) / (b - a));      // progress window
const ease = {
  grow:   t => 1 - Math.pow(1 - t, 3),                        // cubic out  — organic settle
  inOut:  t => t * t * (3 - 2 * t),                           // smoothstep — crossfades
  gather: t => t * t * t,                                     // cubic in   — convergence accelerates
  bloom:  t => 1 - Math.pow(1 - t, 5),                        // quint out  — unfolding
};
// usage: hyphaeReveal = ease.grow(window_(progress, 0.00, 0.30));
```

These four named curves are the **entire easing vocabulary of the 3D scene**. They are the GLSL/JS mirror of the CSS tokens (`ease.grow` ≙ `--ease-grow`); a fifth curve requires a design review.

---

## 2. Easing Reference (both worlds, one voice)

| Name | CSS | JS/GLSL | Used for |
|---|---|---|---|
| grow | `cubic-bezier(0.22, 1, 0.36, 1)` | `1-(1-t)^3` | Entrances, growth, camera settle |
| press | `cubic-bezier(0.4, 0, 0.2, 1)` | `smoothstep` | Hovers, color, crossfades |
| exit | `cubic-bezier(0.4, 0, 1, 1)` | `t^3` (in) | Dismissals, convergence |
| bloom | — (scene only) | `1-(1-t)^5` | Act IV petal unfold only |

---

## 3. Loading Experience (scene bootstrap)

The renderer must never make the page wait, and its arrival must be a moment, not a pop.

| Step | Trigger | Duration / Easing | Spec | UX problem solved |
|---|---|---|---|---|
| L-1 | `DOMContentLoaded` | — | Stage shows video-tier frame (existing `#anim-video` poster) | Page is complete-looking at first paint; WebGL is a bonus, never a dependency |
| L-2 | `requestIdleCallback` (fallback 2 s timeout) | — | `import('./scene.js')` deferred ESM | Renderer never competes with LCP/fonts for bandwidth |
| L-3 | First compile + first frame rendered offscreen | — | Warm-up render at `progress = 0` before reveal | Kills the first-frame shader-compile jank *before* the user can see it |
| L-4 | Warm-up complete | 600 ms · `--ease-grow` | 1px terracotta hairline draws across stage top (UI System motif M6), then canvas crossfades over video 400 ms `--ease-press` | Announces "the living system is live" in brand language; no spinner, no pop-in |
| L-5 | `webglcontextlost` (any time) | 400 ms fade | Canvas fades out, video tier resumes | Failure is invisible as failure — degradation reads as a style choice |

---

## 4. The Master Timeline — every scene animation, keyframed

Scroll-scrubbed (trigger = `progress` through the 400vh pin; duration = scroll-owned; "easing" = curve applied inside the window). Beats are DOM (`ui-motion.js`) but listed here because they sync to the same timeline.

| ID | Property | Window | Curve | Exact behavior | UX problem solved |
|---|---|---|---|---|---|
| A1a | Hyphae reveal (`uProgress` vs. per-vertex `birth`) | 0.00–0.30 | grow | Network draws from 5 seed points; branch generations gated at birth 0.0/0.4/0.7/0.9 | Growth must read as *biology, not wipe* — generational gating gives organic cadence; the visitor understands "this is alive" without a caption |
| A1b | Hypha thickness pulse | 0.05–0.30 | inOut | Line width 0.6→1.0 following local reveal | Newborn strands look tender, matured strands substantial — depth of life without extra geometry |
| A2a | Signal spawn rate | 0.25–0.55 | grow | 0→N particles/s (N per quality tier), advected along edge paths at 0.35 path-lengths/s | Rising traffic = rising urgency; the visitor *feels* the network start to talk before beat copy says so |
| A2b | Signal drift (time-based, the one exception) | while Act II visible | sine, 1.6 s period, amplitude 0.15 px @1x | Perpendicular micro-oscillation on particle paths | A perfectly still frame between scroll gestures looks frozen/broken; 1 property of idle life keeps the scene breathing at zero narrative cost |
| A3a | Convergence pull | 0.50–0.72 | **gather** (cubic-in) | All vertices morph toward origin; morph weight 0→1 | Cubic-*in* makes the collapse accelerate — gathering energy reads as intent, not deflation. Visitor anticipates a payoff |
| A3b | Seed condensation + glow | 0.62–0.75 | grow | Seed scale 0→1; bloom pass strength 0→1.0 (the site's only glow peak) | Single luminance climax marks "the point of the story" — attention is physically brightest at the thesis pivot |
| A4a | Seed crack + stem | 0.72–0.84 | grow | Stem extrudes procedurally, 2 leaf pairs unfold via joint rotation −90°→0° | Payoff must follow climax within one scroll gesture or tension dissipates |
| A4b | Kilim blossoms | 0.80–0.97 | **bloom** (quint-out) | 12–24 instanced SDF-petal quads scale 0→1, stagger 0.015 progress each | Quint-out = fast unfurl then long settle, how petals actually open; stagger avoids a "grid of sprites" read |
| A4c | Glow decay | 0.75–0.95 | inOut | Bloom strength 1.0→0.15 | Light hands over from magic (glow) to matter (garden) — the metaphor resolves into something real, matching the site's cut to real film stills |
| B1–B4 | Beat captions | in: first 12% of each act · out: last 8% | press (CSS) | Opacity 0→1 + `translateY(12px→0)`; out = opacity only | Words anchor each act; asymmetric in/out (rise in, fade out) keeps arrival eventful and exit silent |
| P1 | Progress bar | 0.00–1.00 | linear | `scaleX(progress)`, transform-only | Linear is deliberate: it is *instrumentation*, and instruments don't ease. Answers "how much is left?" honestly |
| F1 | Depth fog | constant | — | `FogExp2(--scene-fog, tuned so density ≈ 65% falloff at far radius)` | Hides network edges and canvas bounds → the world feels endless, not boxed; also culls overdraw |

---

## 5. Camera Rig & Cursor Effects

### 5.1 Scroll-triggered camera moves

Single perspective camera (fov 50), scrubbed — never tweened on its own clock.

| ID | Move | Window | Curve | Exact values | UX problem solved |
|---|---|---|---|---|---|
| C1 | Establishing drift | 0.00–0.50 | linear | Dolly z: 100→94 (−6%) | Imperceptible forward motion keeps long Act I/II from feeling static — parked cameras read as slideshows |
| C2 | Convergence push-in | 0.50–0.75 | gather | z: 94→82 (−12%), fov 50→46 | Camera leans in *with* the visitor's attention at the gather; slight fov tighten adds intimacy without fisheye |
| C3 | Garden pull-back | 0.75–1.00 | grow | z: 82→104 (+27%), fov 46→52, pitch −4° | Reveal move: from seed close-up to garden wide — scale of outcome is the payoff; pitch down grounds the garden on "soil" |
| C4 | Exit handshake | 0.97–1.00 | inOut | Camera holds; canvas opacity 1→0.94 | Softens the pin release so unpinning doesn't feel like the scene snapped off |

### 5.2 Pointer effects — the whole policy

| ID | Trigger | Duration / Easing | Exact behavior | UX problem solved |
|---|---|---|---|---|
| PX1 | `pointermove` over pinned scene (fine pointers only) | continuous, lerp 0.05/frame (~280 ms settle) | Camera rotation offset: yaw ±2.5°, pitch ±1.5°, mapped from normalized cursor; **rig-level offset, composed after scroll rig** | Parallax proves the scene is a *space*, not a video — the single strongest "this is real 3D" signal, at near-zero cost |
| PX2 | `pointerleave` | 900 ms via same lerp | Offset returns to 0 | Scene must never hold a stale tilt — drift-back keeps the framed composition authoritative |
| PX3 | Raycast hover on scene objects | **none — deliberately absent** | — | Clickable 3D objects would fork attention from the scroll contract and cost a raycast/frame; the scene is cinema, and you don't click cinema |
| PX4 | Custom cursor / cursor follower | **banned** (OS §5.3) | — | Followers add latency perception to every pointer move and read as portfolio-site vanity — off-voice for documentary credibility |

`deviceorientation` variant of PX1 on touch: only if permission already granted, amplitude halved, else off. Never prompt — a permission dialog is the most expensive animation on the page.

---

## 6. Section Transitions (DOM, `ui-motion.js`)

| ID | Trigger | Duration / Easing | Exact behavior | UX problem solved |
|---|---|---|---|---|
| S1 | Section reveal — IntersectionObserver, `threshold: 0.15`, once | 600 ms · `--ease-grow` | `opacity 0→1` + `translateY(12px→0)`; children stagger 60 ms, cap 6 | Paces the argument (each proof block "arrives"); `once` because re-animating on scroll-up punishes re-reading |
| S2 | Dark→sand hard cut (films→impact) | 0 ms | No transition — background changes at a full-width 1px hairline | Documentary grammar: evidence isn't eased into. Also zero jank and identical under reduced motion |
| S3 | Sand→dark hard cut (credibility→next) | 0 ms | Mirror of S2 | Symmetry makes the two cuts read as intentional editing, not inconsistency |
| S4 | Nav material swap | 300 ms · `--ease-press` | Solid ↔ glass crossfade, toggled by scene bounds (scroll positions cached, checked in RAF) | UI acknowledges the live world behind it; also announces "the title sequence has begun/ended" without a single extra element |
| S5 | Rail state change | 300 ms · `--ease-press` | Active label color crossfade, driven by same IO as S1 | Persistent "you are here" on an 8-section page — kills scroll disorientation |

---

## 7. Film Showcases (the "product" surfaces)

The products are films; the showcase pattern is **still → wake-up → lightbox**, engineered so the play decision takes one glance and one click.

| ID | Trigger | Duration / Easing | Exact behavior | UX problem solved |
|---|---|---|---|---|
| FS1 | Card enters viewport (IO, 0.15, once) | 600 ms · `--ease-grow` | Still `scale(1.04→1.0)` + fade; text block reveals per S1 | Dolly-settle gives each film a cinematic entrance; scale-*down* (not up) reads as focus being pulled |
| FS2 | `pointerenter` / `focus-within` on card | 300 ms · `--ease-grow` | Orchestrated wake-up: still `brightness(0.92→1.05)` + `scale(1→1.015)`, title → full bone, CTA gap 8→14px — one composite gesture | Playability affordance without fake play-button chrome; resting state at 0.92 brightness exists *so that* hover has somewhere to go |
| FS3 | `pointerleave` / blur | 180 ms · `--ease-exit` | Reverse of FS2 at reduced duration | Leave-faster-than-arrive: attention isn't taxed by departures |
| FS4 | Watermark numeral counter-parallax | scroll, continuous | `translateY` at −6% of section scroll delta, transform-only, RAF-batched | Layers the card (ground vs. content) → perceived depth on a 2D section, consistent with scene's 3D language; ≤8% cap per depth law |
| FS5 | Click still / CTA → lightbox open | 300 ms · `--ease-grow` | Backdrop (glass G3) fade + player `scale(0.97→1)`; iframe loads behind title card + growing hairline (L2) | Perceived-instant open: shell appears in one frame even if YouTube takes two seconds; spatial scale-from preserves "this came from that card" |
| FS6 | Lightbox close (`Esc` / ✕ / backdrop) | 150 ms · `--ease-exit` | Fade out; focus returns to invoking card | Exit at half cost; focus return keeps keyboard users oriented — the #1 modal a11y failure, solved by spec |

---

## 8. CTA Animations

| ID | Trigger | Duration / Easing | Exact behavior | UX problem solved |
|---|---|---|---|---|
| CTA1 | Ghost button `pointerenter` | 180 ms · `--ease-press` | Border `--line-on-dark-strong` → `--color-action`; text → `--color-action-hover`. Fill never arrives | Affordance at conversation volume — the border *ignites*, signaling interactivity without shouting |
| CTA2 | Any button `pointerdown` | 90 ms · `--ease-press` | `translateY(2px)`; release springs back 180 ms `--ease-grow` | Visible physical confirmation that input registered — kills double-click anxiety on a quiet UI |
| CTA3 | Text-CTA hover ("Watch the film →") | 180 ms · `--ease-press` | `gap: 8px→14px` — the arrow reaches | Directional promise ("this takes you somewhere") in 6px of motion |
| CTA4 | Partnership primary enters viewport | 600 ms · `--ease-grow`, 200 ms after its section text | Standard S1 reveal, deliberately last in its stagger | The ask appears only after the offer is read — sequencing as persuasion; **no** pulse/shimmer/attention-seeking loop, which would torch the credibility the whole page just built |
| CTA5 | Form submit | per UI System L3 | `SENDING` swap (width-reserved) + growing hairline loop; `RECEIVED` + `--color-live` settle on 200 | Submission state is unambiguous without spinner theater; reserved width = zero layout shift at the moment of maximum user attention |

---

## 9. Idle & Ambient Policy

What happens when the visitor does nothing:

- Scene idle: render loop **sleeps** (§1) except A2b's drift while Act II is on screen. GPU at ~0% when parked outside the scene.
- No autonomous attention-seekers anywhere: no bouncing scroll cues after hero (A2's cue breathes only in the hero, 10px/2s sine — it teaches the page's single interaction, then never reappears), no periodic shimmers, no "still there?" nudges.
- **UX problem solved by the absence:** a reader parked on the impact numbers is *converting* — motion at that moment competes with the memo they're writing about you.

---

## 10. Performance Contract (framework-level)

- One RAF for scene + all DOM scroll effects (FS4, P1, S4) — `ui-motion.js` registers into `scene.js`'s loop when present, owns its own otherwise.
- Budgets per OS Spec §8; tier logic per OS §3.4. Framework additions: raycasting **0/frame** (PX3), `will-change` applied on `pointerenter` and removed on settle (FS2), all listeners passive, IO everywhere instead of scroll-position math except the pin itself.
- Kill-switch honored everywhere: `prefers-reduced-motion` collapses every table above to opacity/color, camera static, PX1 off, video tier posters — checked once at boot **and** on media-query change event (users toggle it live).

---

## 11. Build Order (slots into OS Spec roadmap M2–M5)

1. `timeline.js` + `camera.js` rig with test geometry — verify C1–C4 against scrub before any content exists.
2. Acts in order (A1 → A4); each act lands with its beat sync and tier budgets before the next begins.
3. `ui-motion.js` (S/FS/CTA tables) — pure CSS-class choreography, buildable in parallel.
4. L-sequence last: warm-up + crossfade against the finished scene, then a full reduced-motion + WebGL-kill pass of every table row.

---

*v1 · Regenerative Stories — 3D Interaction Framework · companion to RS-Site-OS-Spec.md + RS-Site-UI-System.md*
