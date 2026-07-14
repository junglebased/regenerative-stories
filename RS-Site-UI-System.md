# Regenerative Stories — Luxury Interface System

> **v1 · Design tokens + component specs.** Companion to `RS-Site-OS-Spec.md` (which owns strategy, IA, the 3D scene, and the animation inventory). This document owns the **interface layer**: every token, every component, every state. Where the two documents touch, the OS Spec's laws (§2 contrast law, §4 depth model, §5 motion principles) are binding here.
>
> **Definition of luxury for this brand:** restraint executed perfectly. Not gloss, not gradients, not glass everywhere — a documentary house's luxury is *materials* (type, light, hairlines) and *timing*. If a detail could appear on a SaaS landing page, it is wrong here.

---

## 0. Design Principles (the taste layer)

1. **Sharp edges.** Border-radius is `0` across the entire system. Rounded corners read "app"; hard edges read "print, film frame, kilim loom." One radius token exists and it is zero — changing luxury direction later means changing one token.
2. **Hairlines, not shadows.** Elevation is expressed with 1px borders and luminance shifts, never drop shadows. Shadows simulate a light source the light score (OS §4.1) doesn't have.
3. **Type is the ornament.** Fraunces 900 at display sizes does the visual heavy lifting. No decorative elements compete with it.
4. **Glass is a lens, not a material.** Glassmorphism appears only where content must remain visible *through* the UI (see §5). Three surfaces total, each justified.
5. **One motion voice.** Every interaction on the site resolves to the same easing family and duration scale (§6). A visitor should never feel two different "hands" built the page.

---

## 1. Token Architecture

Three layers, CSS custom properties, one file (`css/tokens.css`), no build step:

```
primitive  →  semantic        →  component
--terra-500   --color-action     --btn-primary-bg
```

- **Primitives** never appear in component CSS.
- **Semantic** tokens are the daily vocabulary.
- **Component** tokens exist only where a component needs to vary independently (rare — resist).

Naming: `--{category}-{role}[-{state}]`. All examples below are final, copy-paste-ready values.

---

## 2. Color Tokens

### 2.1 Primitives

```css
:root {
  /* Earth scale (warm neutrals, dark → light) */
  --earth-950: #12110D;   /* scene fog */
  --earth-900: #1A1914;   /* humus */
  --earth-850: #231E18;   /* soil ink */
  --earth-700: #5C4A33;   /* umber (hypha) */
  --earth-200: #E8DFD0;   /* bone */
  --earth-100: #EDE8DF;   /* sand */
  --earth-050: #F5F1E9;   /* raised sand (cards on sand) */

  /* Terra scale (the voice) */
  --terra-600: #A85420;   /* pressed / active */
  --terra-500: #C4662A;   /* accent */
  --terra-300: #E8A15C;   /* signal / hover on dark */
  --terra-100: #F0D9B8;   /* seed glow */

  /* Sage scale (the living secondary) */
  --sage-600:  #4E5E47;   /* moss / muted */
  --sage-400:  #7A8C70;   /* sage */
  --sage-200:  #A9B8A0;   /* sage hover on dark */

  /* Alpha hairlines */
  --line-on-dark:  rgba(255,255,255,0.07);
  --line-on-dark-strong: rgba(255,255,255,0.16);
  --line-on-sand:  rgba(35,30,24,0.15);
  --line-on-sand-strong: rgba(35,30,24,0.35);
}
```

### 2.2 Semantic

```css
:root {
  --color-bg:            var(--earth-900);
  --color-bg-inverse:    var(--earth-100);
  --color-surface:       transparent;        /* cards on dark are line-bounded, not filled */
  --color-surface-inverse: var(--earth-050); /* cards on sand get a fill lift */
  --color-text:          var(--earth-200);
  --color-text-inverse:  var(--earth-850);
  --color-text-soft:     rgba(232,223,208,0.65);
  --color-label:         var(--sage-600);
  --color-action:        var(--terra-500);
  --color-action-hover:  var(--terra-300);
  --color-action-press:  var(--terra-600);
  --color-live:          var(--sage-400);
  --color-focus:         var(--terra-300);   /* focus ring — brighter than action for visibility on dark */
  --color-error:         #B4553E;            /* clay red — errors stay in the earth family */
  --color-error-on-sand: #8F3E2B;
}
```

**State rule (system-wide):** hover shifts *toward light* (`-300`), press shifts *toward dark* (`-600`), disabled drops to 40% opacity + `cursor: not-allowed`. Never a hue change — luxury reads as one material reacting to touch, not swapping colors.

---

## 3. Typography Tokens

### 3.1 Faces & fluid scale

```css
:root {
  --font-display: 'Fraunces', serif;          /* 900 only */
  --font-body:    'Spectral', serif;          /* 300, 300-italic */
  --font-voice:   'IBM Plex Mono', monospace; /* 400 only */

  /* Fluid scale — minor-third rhythm at desktop, tightened floor for mobile */
  --type-hero:    clamp(56px, 10.5vw, 108px); /* Fraunces 900 · lh 0.86 · ls -0.03em · uppercase */
  --type-title:   clamp(34px, 4.5vw,  60px);  /* Fraunces 900 · lh 1.00 · ls -0.02em */
  --type-feature: clamp(36px, 5.5vw,  74px);  /* Fraunces 900 · lh 0.95 · film titles */
  --type-stat:    clamp(38px, 5vw,    68px);  /* Fraunces 900 · lh 1.00 · numbers */
  --type-body:    clamp(17px, 1.35vw, 19px);  /* Spectral 300 · lh 1.65 · measure ≤ 68ch */
  --type-lede:    clamp(20px, 1.8vw,  24px);  /* Spectral 300 · lh 1.55 · first paragraph of a section */
  --type-label:   13px;                        /* Plex Mono · lh 1.6 · ls .10em · uppercase */
  --type-label-lg: 14px;                       /* Plex Mono · eyebrows · ls .12–.16em · uppercase */
  --type-ui:      14px;                        /* Plex Mono · buttons, nav · ls .10em · uppercase */
}
```

### 3.2 Rules

- **Fraunces optical size:** serve the display (opsz 144) subset for `--type-hero/feature`; the text-optical cut looks thin at poster sizes.
- **Numerals:** stats use lining figures, `font-variant-numeric: tabular-nums` wherever numbers align vertically (impact grid, timeline years).
- **Measure:** body copy never exceeds 68ch; ledes 52ch. Luxury is a comfortable line, not a full-bleed paragraph.
- **Italic license:** Spectral 300 italic only for film quotes / pull-quotes. Nowhere else.
- **No weight between 300 and 900 exists in the system.** The gap *is* the style.

---

## 4. Spacing, Grid & Structure Tokens

### 4.1 Space scale (4px base, exponential top end)

```css
:root {
  --sp-1: 4px;   --sp-2: 8px;   --sp-3: 12px;  --sp-4: 16px;
  --sp-5: 24px;  --sp-6: 32px;  --sp-7: 48px;  --sp-8: 64px;
  --sp-9: 96px;  --sp-10: 144px; --sp-11: 216px;
  --sp-section: clamp(96px, 12vw, 216px);  /* vertical rhythm between sections */
}
```

Generosity lives at the top of the scale: sections breathe at `--sp-section`; inside a component nothing exceeds `--sp-7`. Whitespace is the loudest luxury signal on the page — protect it before protecting content density.

### 4.2 Grid

```css
:root {
  --grid-max:   1360px;
  --grid-cols:  12;
  --grid-gutter: clamp(16px, 2.5vw, 32px);
  --grid-margin: clamp(20px, 5vw, 80px);
  --rail: 44px;              /* section rail reserve, ≥1100px only */
  --radius: 0;               /* the whole system, one value */
  --line-w: 1px;
}
```

- 12 columns; content blocks snap to 6/8/10/12; body copy columns 6–7.
- **Asymmetry is deliberate:** section headers sit on cols 1–5, content on 6–12 (or mirrored). Centered layouts only for the impact bridge line and beat captions. Symmetric = brochure; asymmetric = editorial.
- Full-bleed license: film stills, the 3D scene, section hard-cut hairlines. Everything else respects `--grid-margin`.

---

## 5. Elevation & Glass — where glassmorphism earns its place

Flat is the default material. Glass exists **only** where UI must float over live, moving content and the content must stay legible through it. Exactly three surfaces qualify; a fourth requires a design review.

```css
:root {
  --glass-bg:     rgba(18,17,13,0.55);
  --glass-blur:   14px;
  --glass-line:   rgba(255,255,255,0.10);
  --glass:        backdrop-filter: blur(var(--glass-blur));  /* pattern, see below */
}
```

| # | Surface | Why glass is earned | Spec |
|---|---|---|---|
| G1 | **Top nav over the 3D scene** | Nav must persist during the title sequence without amputating the scene behind it | `background: var(--glass-bg); backdrop-filter: blur(14px); border-bottom: 1px solid var(--glass-line)`. Elsewhere on the page the nav is *solid* `--color-bg` — glass switches on via a scroll-position class, so glass literally only exists while there is something alive behind it |
| G2 | **Beat caption plates (`#b1–#b4`)** | Legibility of the narrative over glow/particles without killing the scene with a solid block | Same recipe at `blur(10px)`, `rgba(18,17,13,0.35)`, padding `--sp-5`, no border (borderless = reads as light falloff, not a card) |
| G3 | **Lightbox backdrop** | The page must remain *present but silenced* behind a playing film — context without competition | `rgba(18,17,13,0.78)` + `blur(8px)`; the player box itself is solid black (video needs true black, never glass) |

**Fallback:** wrap every use in `@supports (backdrop-filter: blur(1px))`; fallback is the same rgba at 0.85 opacity. **Never glass:** cards, buttons, forms, footers, anything on sand. Glass on static backgrounds is decoration — banned by the OS Spec's zero-decoration constraint.

---

## 6. Motion Language — one voice for every interaction

Extends OS Spec §5.2. Everything below composes from these tokens; no component defines its own curve.

```css
:root {
  /* Easing — one family: organic settle */
  --ease-grow:   cubic-bezier(0.22, 1, 0.36, 1);  /* entrances, expansions */
  --ease-press:  cubic-bezier(0.4, 0, 0.2, 1);    /* hovers, toggles, color */
  --ease-exit:   cubic-bezier(0.4, 0, 1, 1);      /* dismissals — leave faster than arrive */

  /* Duration scale */
  --dur-instant: 90ms;    /* press feedback */
  --dur-micro:   180ms;   /* hover, focus, color */
  --dur-move:    300ms;   /* position/size changes, menu links */
  --dur-enter:   600ms;   /* section reveals, modal open */

  /* Distance scale — motion travels short */
  --move-1: 2px;   /* press depth */
  --move-2: 8px;   /* hover gap growth */
  --move-3: 12px;  /* reveal rise */
}
```

**Choreography laws:**

1. **Arrive slow, leave fast.** Entrances use `--dur-enter/--ease-grow`; exits use half the duration and `--ease-exit`. (Politeness physics: appearing demands attention, leaving shouldn't.)
2. **Stagger = 40–80ms**, max 6 items. Beyond 6, the tail animates as one group — nobody watches item nine arrive.
3. **Only cheap properties animate:** `opacity`, `transform`, `color`, `border-color`, `background-color`, `gap`. Never `width/height/top/left`; expansion effects use `grid-template-rows: 0fr→1fr` or transforms.
4. **One thing moves at a time** per interaction. A hover may brighten the image *or* grow the CTA gap as its headline act — the film card does both only because they read as a single "wake up" (see C2).
5. **Reduced motion:** every rule above collapses to opacity/color only, durations unchanged. State feedback is accessibility; travel is not.

---

## 7. Component Specs

Format per component: anatomy → tokens → states → motion → accessibility.

### C1 · Buttons

Three variants. No filled rectangles on dark — a filled button is a shout; this brand speaks at conversation volume. The *primary* is filled only on sand.

**C1a — Primary (sand sections only: partnership CTA)**
- Anatomy: Plex Mono `--type-ui`, uppercase, `padding: 14px 28px`, `background: var(--color-action)`, text `--earth-050`, no border.
- Hover: `background: var(--color-action-hover)` + text `--earth-850`, `--dur-micro/--ease-press`.
- Press: `background: var(--color-action-press)`, `transform: translateY(var(--move-1))`, `--dur-instant`.
- Focus: 2px `--color-focus` ring, 3px offset (`outline-offset`), never removed.
- Disabled: 40% opacity, no hover response.

**C1b — Ghost (dark sections: default button)**
- Anatomy: as C1a but `background: transparent`, `border: 1px solid var(--line-on-dark-strong)`, text `--color-text`.
- Hover: `border-color: var(--color-action)`, text `--color-action-hover`. The border ignites; the fill never arrives. `--dur-micro`.
- Press/Focus/Disabled: as C1a.

**C1c — Text CTA (`.film-cta` pattern: "Watch the film →")**
- Anatomy: Plex Mono `--type-ui`, `--color-action`, inline-flex, `gap: 8px` with arrow glyph.
- Hover: `gap: var(--move-2)` + arrow color `--color-action-hover`, `--dur-micro/--ease-press`. The arrow *reaches* — affordance as gesture.
- Focus: same ring as C1a.
- Reduced motion: gap static, underline appears instead.

### C2 · Film Card (the flagship component)

- Anatomy: full-bleed still (ground layer) · index eyebrow (`01 / SOIL`) · badge · Fraunces `--type-feature` title · mono sub · Spectral synopsis (≤ 52ch) · C1c CTA · watermark numeral.
- Resting: still at `brightness(0.92)` — slightly asleep, so hover has somewhere to go.
- Hover/focus-within (**one "wake up" gesture, orchestrated**): still `brightness(1.05)` + `scale(1.015)` (`--dur-move/--ease-grow`), title `--color-text` → full white-bone, CTA gap grows. All three fire together as a single perceived event.
- Press (on CTA or still): opens lightbox (C6).
- Keyboard: entire still is a `<button aria-haspopup="dialog">`; focus ring draws *inside* the image edge (2px, `--color-focus`) so it survives full-bleed.
- Motion budget: transform + filter only; the still is `will-change: transform` **only while hovered** (add/remove via class — permanent will-change taxes memory).

### C3 · Stat Tile (impact grid)

- Anatomy: Fraunces `--type-stat` number (tabular) · hairline top rule · mono label.
- Reveal: numbers do **not** count up (counters read as marketing theater and block comprehension — banned in OS §5.3). They arrive by the standard reveal, already final. The confidence of a number that doesn't perform is the luxury.
- On sand: text `--color-text-inverse`, rule `--line-on-sand-strong`.

### C4 · Timeline Entry (credibility)

- Anatomy: Fraunces year (large, `--color-text-inverse` on sand) · mono event line · optional logo.
- Reveal: 80ms stagger per year (OS §5.3 A11) — accumulation as continuity argument.
- Hover: none. The past doesn't react to a cursor; the timeline is testimony, not UI.

### C5 · Navigation

**Top nav:** two material states — solid `--color-bg` (default) ↔ glass G1 (over scene), crossfaded `--dur-move`. Logo left, `EN·TR` switch + menu button right. Height 64px, hairline bottom border in both states.

**Section rail (≥1100px):** vertical mono labels, `--color-label` resting, active section `--color-text` via 300ms color crossfade. Click scrolls (respecting reduced-motion: `scroll-behavior: auto`).

**Overlay menu:** full-screen `--color-bg` at 0.98 (not glass — nothing moves behind it, so glass is unearned), links in Fraunces `--type-title`, staggered 40ms on open, `--dur-micro` fade on close (arrive slow, leave fast). Focus-trapped, `Esc` closes, focus returns to the menu button.

### C6 · Lightbox

- Open: backdrop G3 fades `--dur-move`; player box scales 0.97→1 `--ease-grow`. Close: half-duration `--ease-exit`.
- Player box: solid `#000`, 16:9 reserved (no CLS), close button top-right — ghost variant, minimum 44×44 hit area.
- While loading the iframe: the loading rule L2 (§8).
- A11y: `role="dialog" aria-modal="true"`, labelled by film title; page behind gets `inert`; scroll locked via `overflow: hidden` on `html` only while open.

### C7 · Forms (contact / partnership inquiry)

Luxury form = fewest possible fields, largest possible calm. Fields: name, email, message. Nothing else.

- **Field anatomy:** mono label above (never floating placeholders — they vanish exactly when a distracted user needs them), input as a **bottom-hairline only** (`border: 0; border-bottom: 1px solid var(--line-on-dark-strong)`), Spectral `--type-body` input text, transparent background, `padding: 12px 0`.
- Focus: bottom border 1px→2px and `--color-action`, label warms to `--color-action-hover`. `--dur-micro`. (Border thickening via `box-shadow: 0 1px 0 var(--color-action)` to avoid layout shift.)
- Filled + valid: border settles at `--color-live` — the field is quietly alive, no checkmark theater.
- Error: border + message in `--color-error`; message is mono `--type-label`, appears with a 4px rise (`--dur-micro`), `aria-live="polite"`, linked via `aria-describedby`. Errors never appear before first blur; never shake (violence is off-voice).
- Submit: C1b ghost → on click enters loading rule L3.
- Autocomplete attributes on every field; labels always `<label for>`.

### C8 · Badges & Eyebrows

Mono `--type-label`, uppercase, 1px border, `padding: 4px 10px`. Status colors: `--color-live` (streaming/available), `--color-action` (in development), `--color-label` (archival). No motion — badges are facts.

---

## 8. Loading Sequences

Loading is the first scene of the film. It is choreographed, never spinner-ed. **No spinners exist in this system.**

**L1 — Page load (the overture):**
1. `0ms` — background `--color-bg` paints instantly (inline critical CSS); nothing flashes white, ever.
2. Fonts: Fraunces 900 + Plex Mono preloaded; `font-display: swap` with a metric-matched fallback (`Georgia` sized via `size-adjust`) so the hero title's swap is a whisper, not a reflow.
3. Hero title + eyebrow reveal: single rise (`--move-3`) + fade, `--dur-enter`, 80ms stagger between the two. One gesture, then stillness.
4. Hero loop video fades in over its poster frame when `canplay` fires — the poster *is* frame one, so the fade is invisible if the network is fast and graceful if slow.
5. The 3D scene module loads deferred (OS §8); its stage shows the video-tier frame until ready. **Scene readiness is announced by a 1px terracotta line growing across the stage's top hairline (600ms, `--ease-grow`)** — a loading indicator that is also the brand (a hypha growing). This is the only "loader" on the site.

**L2 — Lightbox iframe:** backdrop + box open immediately (perceived speed lives in the shell); box shows film title in mono + the same growing-hairline motif until the iframe fires `load`. Title crossfades out `--dur-micro`.

**L3 — Form submit:** button text crossfades to `SENDING` (mono, same width reserved — no layout shift), border animates the growing-hairline (left→right, 1s loop) until response. Success: text → `RECEIVED`, border settles `--color-live`, fields fade to 60%. Failure: L3 reverses, error message per C7. The button never becomes a spinner and never disables into ambiguity.

**The growing hairline is the system's single loading motif** — used in L1/L2/L3. One motif, three contexts: this is what "consistent motion language" means in practice.

---

## 9. Micro-interaction Inventory (delta to OS Spec §5.3)

New rows this document adds to the master inventory — same law: purpose or death.

| ID | Interaction | Motion | Purpose | Reduced motion |
|---|---|---|---|---|
| M1 | Button press | `translateY(2px)`, `--dur-instant` | Physical confirmation of registered input — the click you can see | Color-only press state |
| M2 | Text-CTA arrow reach | gap 8→8+`--move-2` | Directional affordance: "this takes you somewhere" | Underline appears |
| M3 | Form focus ignition | hairline thickens + warms | Confirms *which* field owns the keyboard — critical on a dark, minimal form | Kept (color, no motion) |
| M4 | Nav material swap | solid↔glass crossfade `--dur-move` | Signals entering/leaving the live scene — the UI acknowledges the world behind it | Instant swap |
| M5 | Film card wake-up | brightness+scale+gap, unified | Playability affordance (OS A8, now fully specified) | CTA underline |
| M6 | Growing hairline (L1–L3) | 1px line draws l→r | The brand's one loading motif — waiting rendered as growth | Kept at 0ms fade-in (progress info is essential) |
| M7 | Menu link stagger | 40ms cascade | Forces one top-to-bottom scan of the page's structure | All visible |
| M8 | Valid-field settle | border → `--color-live` | Quiet completion feedback without checkmark noise | Kept (color) |

---

## 10. Deliverable Structure & Handoff

```
02/css/
├─ tokens.css      §2–§6 blocks verbatim — the only file with raw values
├─ base.css        reset, type roles, focus ring, reduced-motion collapse
└─ components.css  C1–C8, consuming tokens only
```

- Acceptance check for any PR: `grep -E '#[0-9a-fA-F]{3,6}|cubic-bezier' components.css` returns **nothing** — all values flow from tokens.
- Dark/sand theming is contextual, not global: a `.on-sand` scope class flips the semantic layer (`--color-text` → inverse, etc.) so components are written once.
- This document + OS Spec §5.3 inventory are the review checklist: any interaction present in code but absent here is a bug, even if it's beautiful.

---

*v1 · Regenerative Stories — Luxury Interface System · companion to RS-Site-OS-Spec.md*
