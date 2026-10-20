# Mormo.si — Motion and Interaction

Status: **proposal, awaiting approval.**

Goal: high visual impact at low performance cost.

---

## 1. Principles

1. **Every motion is a cleaning action**: foam covers, a squeegee wipes, water rinses, a clean surface shines.
2. **Compositor only.** Animate `transform` and `opacity`. Clipping and masking are used where measured to be cheap. Nothing animates layout properties.
3. **The browser drives scroll effects.** Native scroll-driven CSS animations run off the main thread. There are no scroll event listeners anywhere on the site.
4. **Enhancement, never dependency.** Without scroll-driven animation support, a section shows its finished state with a single fade when it enters view. Nothing is hidden behind an effect.
5. **Never block interaction.** Decorative layers ignore pointer events and are hidden from assistive technology.
6. **Reduced motion is respected everywhere.** With `prefers-reduced-motion`, the video does not play, scroll effects are static, and only short opacity changes remain.

## 2. Techniques and why

| Technique | Used for | Why |
|---|---|---|
| CSS `position: sticky` | Hero hold, pinned "how it works" image | Pinning with no JavaScript |
| CSS scroll-driven animations (`animation-timeline: view()` / `scroll()`) | Foam parallax, route drawing, reveals | Off the main thread; falls back to a static state |
| `IntersectionObserver` | Navigation state, play/pause video, one-shot entrances, lazy loading | Fires only on threshold changes |
| CSS transitions and keyframes | Buttons, gloss, price change | Cheapest option |
| SVG | Routes, droplet, squeegee line, small foam shapes | Sharp at any size, a few kilobytes |
| Canvas 2D | Pressure-wash reveal only | Erasing a mask along a pointer path needs per-pixel drawing |
| View Transitions API | Step changes in the funnel and booking flow | Native, progressive |

**No animation library in V1.** Nothing here needs timeline scrubbing or physics that CSS cannot express. GSAP would add roughly 25–45 KB for capabilities the spec does not use. It is reconsidered only if the Phase 0 prototype shows that the hero transition needs finer control on browsers without scroll-driven animations.

**No WebGL.** No effect in this spec justifies it.

**No animated SVG filters.** Turbulence and "gooey" filters repaint every frame and are slow on phones. Foam is a pre-made shape or texture moved with a transform.

---

## 3. Motion inventory

Cost: **L** = transform/opacity only; **M** = paints a small area or a canvas.

### M01 — Hero video entrance · foam: no · water: no

- **What:** The poster image is visible immediately. When the video can play, it fades in over the poster (400 ms). The headline and actions rise 16 px and fade in once, staggered by 80 ms.
- **Cost:** L. **Reduced motion:** poster only, no rise.

### M02 — Navigation transition

- **What:** Transparent with white text over the hero, sitting on a soft dark gradient that is part of the hero, not the bar. A 1 px sentinel at the hero's end, watched by an `IntersectionObserver`, flips the bar to a solid ink background (240 ms). On light sections the bar stays ink for a consistent lime button.
- **Note:** No `backdrop-filter` while over the video. Blurring a playing video on every frame is expensive on phones.
- **Cost:** L. **Reduced motion:** instant change.

### M03 — Hero exit: the foam pass · foam: yes · water: yes

The signature transition.

- **What the user sees:** The video stays fixed while scrolling begins. A band of pink foam rises from the bottom edge and travels up across the frame. Its top edge is bubbly and irregular. Its bottom edge is a straight, thin, wet line, like a squeegee stroke. Above the band is the video; below it, already clean, is the next section.
- **How it is built:** The hero is `position: sticky`, so it stays put while the next section scrolls up over it in normal document flow. The foam band is attached to the top of that section. This means the core effect is ordinary scrolling with zero script. Depth comes from two or three foam layers that move at slightly different rates through scroll-driven transforms. The video dims slightly and pauses once fully covered.
- **Assets:** foam edge texture with transparency (A03); SVG fallback shape.
- **Cost:** L. Each foam layer is one composited image.
- **Mobile:** two layers, shorter band.
- **Without scroll-driven support:** the band is static on the section's leading edge; the pass still happens because it is plain scrolling.
- **Reduced motion:** a straight edge with no foam layers.

### M04 — Route drawing (section 02) · dirt: yes

- **What:** The long dust-coloured road draws itself along its winding path as the section scrolls through view; its five stops appear as the line reaches them. Then the lime line draws in one fast stroke (300 ms), triggered once.
- **How:** SVG stroke offset tied to the section's view timeline. A faint mud and dust texture sits in the background at low opacity and does not move.
- **Cost:** M (small SVG repaint). **Fallback and reduced motion:** both routes fully drawn.

### M05 — Pinned steps (section 03) · foam: in the photo only

- **What:** The image column stays pinned while three steps scroll by. The image cross-fades as each step becomes active. Foam appears here only inside the step 3 photograph, not as an effect.
- **How:** CSS sticky. One `IntersectionObserver` per step sets the active index.
- **Cost:** L. **Mobile:** no pinning, stacked. **Reduced motion:** images swap without a fade.

### M06 — Before/after slider (section 04) · dirt: yes · shine: yes

- **What:** Drag the divider to wipe between the dirty and the clean car. The divider is a squeegee line with a droplet handle. On entry it nudges 6 % and returns, once, to show it moves.
- **How:** Two stacked images; the top one is clipped by a CSS variable. Pointer events update the variable inside `requestAnimationFrame`. A real `<input type="range">` sits underneath, so arrow keys and screen readers work.
- **Cost:** L–M. **Reduced motion:** no nudge.

### M07 — Pressure-wash reveal (section 04, desktop option) · pressure wash: yes · water: yes

- **What:** A "Operi sam" toggle switches the slider into a mode where the pointer acts as a pressure washer: moving over the dirty image clears a soft-edged path to the clean one. When about 60 % is cleared, the rest rinses away on its own.
- **How:** A canvas holds the dirty image; the pointer erases it with a soft round brush. Resolution is capped at 1.5× device pixel ratio. The code is a separate chunk loaded only when the section is near and only on devices with a fine pointer.
- **Why it earns its place:** It is the one moment a visitor *does* the cleaning. It is also optional; the slider is the default and the accessible path.
- **Cost:** M, contained to one element. **Touch devices and reduced motion:** not offered.
- **Build order:** after M06, and only kept if it holds 60 fps on a mid-range laptop.

### M08 — Price change (section 05 and funnel)

- **What:** When the vehicle size changes, each price slides up and is replaced (180 ms).
- **Cost:** L. Tabular figures and reserved width, so nothing shifts. **Reduced motion:** instant.

### M09 — Main foam reveal (entering section 05) · foam: yes · water: yes

- **What:** The pricing section arrives covered along its top by thick foam that slides away upward as you scroll, leaving a brief line of water droplets that fade. This is the "wash" between the dark half of the page and the clean half.
- **How:** Same construction as M03 (a foam band on the section's leading edge with parallax layers), reusing the same texture in a paler tint. Droplets are a single static image fading out.
- **Cost:** L. **Fallback and reduced motion:** straight edge.

### M10 — Dirty-to-clean progression (whole page) · dirt: yes

- **What:** Section backgrounds step from asphalt through graphite to fog, white and lime, as listed in `DESIGN-SYSTEM.md`. Dirt textures fade out by section 04.
- **How:** Static per-section colours. No continuous colour interpolation on scroll.
- **Cost:** none.

### M11 — Gloss sweep · shine: yes

- **What:** One narrow, angled highlight crosses a surface in 700 ms, once, when it enters view. Used on: the ALWAYS CLEAN panel, the fleet image, the final CTA block. Also on hover for the primary button.
- **How:** A pseudo-element with a soft white gradient, translated across; clipped by the element's shape.
- **Cost:** L. **Reduced motion:** none.

### M12 — Button clean · foam: yes (subtle)

- **What:** Pressing a primary button on a plan choice or on the final confirmation shows a short burst: four to six small foam bubbles expand from the press point and vanish within 400 ms, and the button gets a gloss sweep.
- **Where:** Plan selection, "Na plačilo", "Potrdi termin". Not on navigation or secondary buttons.
- **How:** Pseudo-elements and a few absolutely positioned spans created on press and removed after; no persistent nodes.
- **Cost:** L. **Reduced motion:** none.

### M13 — Occasion posters (section 08)

- **What:** Horizontal row with native scroll-snap. The poster nearest the centre scales to 100 %, neighbours rest at 94 %.
- **How:** CSS scroll-snap; scale through a scroll-driven view timeline on the horizontal axis.
- **Cost:** L. **Fallback:** all posters at 100 %.

### M14 — Water droplets · water: yes

- **What:** A few still droplets on two or three surfaces: the "why by hand" image, the corner of the final CTA, the fading rinse line in M09. The FAQ marker is a droplet that rotates when the item opens.
- **How:** One pre-rendered transparent image per placement or inline SVG. No per-droplet DOM nodes, no continuous animation.
- **Cost:** none to L.

### M15 — Final rinse (entering section 13) · water: yes · shine: yes

- **What:** A thin sheet of water runs down as the lime block arrives, then the gloss sweep crosses it. The third and last foam-family moment: no foam left, only water and shine.
- **How:** A transparent water-edge image on the section's leading edge, as in M03.
- **Cost:** L.

### M16 — Funnel and booking transitions

- **What:** Steps cross-fade with a short horizontal wipe using the View Transitions API. The progress bar fills from dust to lime.
- **Cost:** L. **Fallback and reduced motion:** instant change.

### M17 — Booking confirmed · shine: yes

- **What:** A droplet turns into a check mark, followed by one gloss sweep on the summary.
- **Cost:** L.

### Considered and rejected

| Idea | Decision | Reason |
|---|---|---|
| Foam cursor on desktop | Not in V1 | A custom cursor trail fights the browser's own cursor, costs frames on every pointer move, and adds nothing to conversion. The pressure-wash mode (M07) gives the same delight in one contained place. |
| Scroll-jacking or smooth-scroll library | Rejected | Breaks native scrolling, harms accessibility and INP. |
| Foam covering the whole viewport then being wiped | Replaced by M03 | A full-screen cover blocks content and reads as a slide transition. The passing band gives the same idea without hiding anything. |
| Continuous particle bubbles | Rejected | Many nodes, constant animation, decorative only. |

---

## 4. Hero video strategy

The hero is the largest element on the page, so it decides the LCP. The strategy is: **the poster is the LCP, the video is an enhancement that arrives after.**

I have not seen the video file. Duration, framing and loop point are assumptions to verify when it is added.

### 4.1 Files to produce from the master

| File | Resolution | Codec | Target size | Served to |
|---|---|---|---|---|
| `hero-1920.av1.mp4` | 1920×1080 | AV1 | ≤ 2.2 MB | Desktop browsers with AV1 |
| `hero-1920.mp4` | 1920×1080 | H.264 | ≤ 3.5 MB | Desktop fallback |
| `hero-1280.mp4` | 1280×720 | H.264 | ≤ 1.8 MB | Tablets, small laptops |
| `hero-portrait-720.av1.mp4` | 720×1280 | AV1 | ≤ 1.0 MB | Phones with AV1 |
| `hero-portrait-720.mp4` | 720×1280 | H.264 | ≤ 1.5 MB | Phones, fallback |
| `hero-poster-1920.avif` / `.webp` / `.jpg` | 1920×1080 | — | ≤ 120 KB (AVIF) | Desktop poster |
| `hero-poster-portrait-720.avif` / `.webp` / `.jpg` | 720×1280 | — | ≤ 60 KB (AVIF) | Phone poster |

- No audio track in any file.
- 30 fps, 8–10 seconds. If the master is longer, loop a shorter section.
- The poster is **the exact first frame** of the corresponding video, so the swap from image to video is invisible.
- The last frame must match the first for a seamless loop. If it does not, add a short cross-fade at the loop point during encoding.
- **Portrait version:** a 16:9 video shown full-height on a phone keeps only the central third. If the car is not centred, the portrait file is made with a deliberate crop or a 9:16 reframe (A02), not a blind centre crop.

### 4.2 Encoding commands

```bash
# Desktop H.264
ffmpeg -i master.mov -an -vf "scale=1920:-2,fps=30" -c:v libx264 -preset slow -crf 24 \
  -profile:v high -pix_fmt yuv420p -g 60 -movflags +faststart hero-1920.mp4

# Desktop AV1
ffmpeg -i master.mov -an -vf "scale=1920:-2,fps=30" -c:v libsvtav1 -preset 5 -crf 34 \
  -pix_fmt yuv420p -g 60 -movflags +faststart hero-1920.av1.mp4

# Phone portrait H.264 (adjust the crop x-offset to keep the car in frame)
ffmpeg -i master.mov -an -vf "crop=ih*9/16:ih,scale=720:1280,fps=30" -c:v libx264 -preset slow -crf 26 \
  -profile:v high -pix_fmt yuv420p -g 60 -movflags +faststart hero-portrait-720.mp4

# Poster = first frame
ffmpeg -i hero-1920.mp4 -frames:v 1 hero-poster-1920.png
```

CRF values are starting points; raise or lower until each file meets its size target without visible banding in dark areas. Posters are converted to AVIF, WebP and JPEG at build time.

### 4.3 Markup and loading

```html
<section class="hero">
  <picture>                     <!-- the LCP element -->
    <source media="(max-width: 767px) and (orientation: portrait)" type="image/avif" srcset="/video/hero-poster-portrait-720.avif">
    <source type="image/avif" srcset="/video/hero-poster-1920.avif">
    <img src="/video/hero-poster-1920.jpg" alt="" fetchpriority="high" decoding="sync" width="1920" height="1080">
  </picture>

  <video muted loop playsinline preload="none" aria-hidden="true" tabindex="-1">
    <!-- sources are attached by script after first paint -->
  </video>

  <div class="hero__content">…</div>
</section>
```

Sequence:

1. **HTML arrives.** The poster is a real image with high fetch priority and a preload hint in the head, art-directed per viewport. It paints first and is the LCP.
2. **Headline and buttons** are server-rendered HTML. They are usable before any script runs.
3. **After first paint**, a small client component (about 1 KB) decides whether to load video at all:
   - `prefers-reduced-motion: reduce` → no video.
   - Data Saver on, or a 2G/3G connection where the browser reports it → no video.
   - Otherwise it attaches the right `<source>` set for the viewport (AV1 first, H.264 fallback) and calls `play()`.
4. **On the `playing` event** the video fades in over the poster. If autoplay is refused (for example iPhone Low Power Mode), the poster simply stays. No play button is shown.
5. **Off-screen or tab hidden** → the video pauses, and resumes on return.

This order means the video never competes with the poster, fonts or CSS for bandwidth, and a failed or slow video costs nothing visible.

### 4.4 Layout

- Height `100svh` (the small viewport unit, so mobile browser bars do not cause a jump), with a minimum of 560 px.
- Video and poster are `object-fit: cover`, absolutely positioned, same box, so swapping causes no layout shift.
- The hero background colour is `#111416`, visible for the few milliseconds before the poster decodes.
- Legibility comes from two static gradients inside the hero: a short one at the top under the navigation and a taller one at the bottom under the headline. Their strength is tuned against the brightest frames of the video.
- Text sits bottom-left with safe-area padding.

### 4.5 Delivery and caching

- Files live in `/public/video/` with a version in the filename (`hero-1920.v1.mp4`).
- `Cache-Control: public, max-age=31536000, immutable`. A new edit gets a new filename.
- Served from Vercel's CDN with range requests. At these sizes that is well inside the plan's bandwidth; if traffic grows substantially, the files move to object storage without changing the markup.
- The master file is kept outside the repository.

### 4.6 Acceptance checks

| Check | Pass |
|---|---|
| LCP element is the poster image | yes |
| LCP on a mid-range phone, 4G | ≤ 2.0 s |
| Layout shift when the video starts | 0 |
| Bytes requested before first paint that belong to the video | 0 |
| Reduced motion | poster only, no video request |
| Low Power Mode on iPhone | poster only, no broken play icon |
| Loop | no visible jump |

---

## 5. Performance guardrails for all motion

- At most three scroll-driven effects active in the viewport at once.
- `will-change` is applied only while an element is animating, never permanently.
- Images below the hero are lazy-loaded with reserved dimensions. Foam textures for M03 are fetched at low priority right after the poster, because they are needed on the first scroll.
- Interactive chunks (M07) load on proximity, not on page load.
- Every effect is tested on a mid-range Android phone and on Safari on iPhone before it is accepted. An effect that drops frames there is simplified or removed.
