# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The marketing/landing site for **Regenerative Stories**, a character-driven documentary series from Turkey's regenerating land (regenerativestories.earth). It is a static, no-build, hand-written HTML/CSS/JS site — there is no package.json, no bundler, no framework, and no test suite.

## Repository layout

- `02/` — the live site root. Everything that gets deployed lives here.
  - `index.html` — English homepage (single file: inline `<style>` in `<head>`, all page markup, inline `<script>` before `</body>`).
  - `index_tr.html` — Turkish homepage. A structural mirror of `index.html` (same section IDs, same CSS, same JS) with translated copy and `lang="tr"` / `og:locale: tr_TR`. **Any structural or behavioral change made to `index.html` must be ported to `index_tr.html` by hand** — there is no shared-template mechanism, no i18n framework, and no build step to keep them in sync.
  - `images/`, `stills/`, `images/logos/` — photos, film stills, and partner/supporter logos.
  - `hero_loop.mp4`, `__shot___type_sin.mp4` — video assets used by the scroll-scrubbed hero animation.
  - `logo.svg`, `robots.txt`, `sitemap.xml`, `vercel.json` — site-level assets and config.
- `RS-Site-Pipeline.md` — (Turkish) internal process doc describing the Notion → Claude Chat → Claude Design → Claude Code → deploy workflow used to build this site, including the phased plan for the hero mycelium-network animation. Read this for *why* things are built the way they are, not for code details.
- `deploy-guzelhosting.sh` — FTP deploy script for a secondary/backup host (guzelhosting) via `lftp`. Requires `FTP_HOST`, `FTP_USER`, `FTP_PASS` env vars (see `.gitignore`'d `.env`); optional `FTP_PORT`, `REMOTE_DIR`, `LOCAL_FILE`.
- `.claude/launch.json` — a `live-server` launch config for local preview (see below).

There is no `src/`, no other top-level app — `02/` is the entire deployable site.

## Development workflow

**Local preview:** serve `02/` with a static file server and open it in a browser. The repo already defines this via `.claude/launch.json`:
```
npx live-server ./02 --port=8080 --no-browser
```
There is no dev server with hot module reload, no compilation step, and no CSS/JS build — edit the HTML files directly and refresh.

**No lint/test/build commands exist in this repo.** Verify changes by loading the page in a browser and checking the console/network tab manually, especially for:
- the scroll-driven hero animation (desktop scrubs video frames via `currentTime`; touch/mobile falls back to a normal loop — see the IIFE around `anim-video` in the inline `<script>`)
- `prefers-reduced-motion` behavior (animation and count-up stats degrade to static end states)
- mobile layout (breakpoints are hand-written in the inline `<style>`, no CSS framework)

**Deployment** (per `RS-Site-Pipeline.md` and `vercel.json`): the site is deployed as static files. `vercel.json` configures response headers for `/*.mp4` (video content-type, byte-range support, long-lived caching) and for `robots.txt`/`sitemap.xml`. `deploy-guzelhosting.sh` is an alternate/manual FTP push path to a secondary host — run it from a shell with `FTP_HOST`/`FTP_USER`/`FTP_PASS` set (e.g. via `.env`, which is gitignored and must never be committed).

## Conventions to follow when editing

- **Single-file pages, no external CSS/JS files.** Both `index.html` and `index_tr.html` keep all CSS in one `<style>` block and all JS in one `<script>` block at the bottom. Keep new code inline in the same style rather than splitting into separate asset files, unless asked to restructure.
- **CSS custom properties** are defined once in `:root` (`--bg`, `--bg-sand`, `--text`, `--accent`, `--sage`, `--muted`, `--border`, `--rail`, etc.) — reuse these tokens instead of hardcoding new colors.
- **Fonts**: Fraunces (display/headings), Spectral (body serif), IBM Plex Mono (labels/mono accents), loaded from Google Fonts in `<head>`.
- **JS style**: vanilla ES5-leaning JS (`var`, function expressions), each independent behavior wrapped in its own IIFE (`(function(){ ... })()`) — nav menu, stats count-up, hero video scroll-scrub, character card expand, film copy toggle, parallax, scroll-reveal via `IntersectionObserver`, YouTube lightbox. Follow this same self-contained-IIFE pattern for new interactive behavior rather than introducing a framework or module system.
- **Scroll performance**: scroll handlers are rAF-throttled (`ticking` flag pattern) and listeners are `{passive:true}`. Match this pattern for any new scroll-driven code.
- **Accessibility/motion**: respect `window.matchMedia('(prefers-reduced-motion: reduce)')` for anything animated, as existing code does.
- **Section IDs are load-bearing**: `#hero`, `#scroll-scene`, `#films-intro`, `#films`, `#impact`, `#credibility`, `#next`, `#partnership`, `#contact` are referenced by the in-page rail nav (`#strat`) and scroll-spy JS (`sections` array). If you rename or reorder sections, update the `sections` array and rail nav links (`.si[data-t]`) in the `<script>` block accordingly, in both language files.
- **Film video IDs**: YouTube IDs are wired via `data-yt="<id>"` attributes on `.film-play-btn`/`.film-cta` buttons and opened through the shared lightbox (`#lb`); don't hand-roll new embed logic.
- **SEO/meta duplication**: `<title>`, meta description, Open Graph, Twitter Card, and JSON-LD (`Organization`) tags are duplicated between `index.html` and `index_tr.html` with per-locale content (`og:locale` vs `og:locale:alternate`) — update both when changing site copy/titles, and update `sitemap.xml`'s `<lastmod>` when publishing meaningful content changes.
- **Turkish content**: `RS-Site-Pipeline.md` and code comments/process docs are written in Turkish; site copy in `index_tr.html` should match that language register (matches existing translation quality/tone already in the file).
