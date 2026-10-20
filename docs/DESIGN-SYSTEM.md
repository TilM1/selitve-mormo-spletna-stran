# Mormo.si — Design System

Status: **proposal, awaiting approval.** The direction is confirmed on the Phase 0 prototype, with the real hero video, before the rest is built.

---

## 1. Design idea

**The page gets washed as you scroll.**

It opens dark and gritty, passes through foam and water, and ends light, glossy and green. The service is demonstrated by the page itself, so the visual effects are the argument and not decoration.

Three rules keep this from becoming a gimmick:

1. **Every effect is a cleaning action.** Foam covers, a squeegee wipes, water rinses, a clean surface shines. Nothing bounces, floats or parallaxes without that reason.
2. **Foam appears three times on the homepage, not everywhere.** Scarcity is what makes it memorable.
3. **Type and layout carry the premium feel.** Remove every effect and the page should still look designed.

### What it must never look like

| Avoid | Do instead |
|---|---|
| Rows of identical rounded cards | A different layout per section (see the wireframe) |
| Gradient fills, glass panels, glowing blobs | Flat colour, real photography, one gloss highlight |
| Lime used everywhere | Lime only for actions and for "clean" |
| Icon + heading + two lines, three across | Large type, numbered steps, images that do work |
| Stock detailing photos | Assets made for this site, one consistent car and setting |
| Centred everything | Asymmetric, editorial alignment on a 12-column grid |

---

## 2. Colour

Fixed by the brand: lime `#D1FE17` and ink `#111416`. The rest is proposed.

### Palette

| Token | Hex | Role |
|---|---|---|
| `--lime` | `#D1FE17` | Primary action, the "clean" state, the droplet |
| `--lime-deep` | `#B4E000` | Lime pressed state |
| `--ink` | `#111416` | Base dark, text on light |
| `--graphite` | `#1B2023` | Raised dark surfaces |
| `--asphalt` | `#2B3136` | The "dirty" section background |
| `--steel` | `#5C656C` | Secondary text on light, borders on dark |
| `--mist` | `#C8CED2` | Borders, dividers on light |
| `--fog` | `#EDEFF0` | Light grey section background |
| `--white` | `#FFFFFF` | Clean surfaces, text on dark |
| `--mud` | `#6A4E39` | Dirt, only in "dirty" sections |
| `--dust` | `#A58C74` | Dried dirt, dusty overlays |
| `--foam` | `#FF9ACB` | Pink foam |
| `--foam-light` | `#FFD6EA` | Foam highlights, pale foam |
| `--water` | `#A6DDF5` | Water, used sparingly |

### Usage rules

- **Lime is a fill, not a text colour, on light backgrounds.** Lime text on white fails contrast. On light sections, lime appears as a button or highlight with ink text on top. On dark sections lime text is fine.
- **Pink only where there is foam.** It is never a button colour, a link colour or a badge.
- **Brown only before the wash.** It appears in sections 02–04 and never after pricing.
- **Blue is a trace.** Droplets, the rinse line, one or two details.
- Body text is always ink on light or white on dark. Minimum contrast 4.5:1 for text, 3:1 for large type and controls.

### Colour across the page

| Section | Background | Mood |
|---|---|---|
| 01 Hero | video on ink | Cinematic |
| 02 Old way vs ours | asphalt, with dust and mud | Dirty |
| 03 How it works | graphite → foam arrives | Wash begins |
| 04 Before / after | graphite | Proof |
| 05 Subscriptions | fog, entered through foam | Rinsed |
| 06 Initial Reset | fog with a trace of water | Fresh |
| 07 Add-ons | white | Clean |
| 08 Occasions | white, image-led | Clean, playful |
| 09 Why by hand | white | Clean |
| 10 Fleet | ink, glossy | Polished dark |
| 11 Reviews | white | Clean |
| 12 FAQ | fog | Calm |
| 13 Final CTA | lime | Shine |

Section 10 is dark on purpose. Dark here is polished black paint with lime reflections, the opposite of the dusty asphalt at the top, and it gives the eye a break before the bright finish.

---

## 3. Typography

**One variable family: Archivo** (weight and width axes, full Slovenian character support, open licence, self-hosted).

The logo wordmark is a heavy, wide grotesque. Archivo at expanded width and heavy weight sits naturally beside it, and at normal width it is a clean text face. One font file gives two voices, which is also the cheapest option for performance. If the wordmark's actual typeface is known and licensed for web, it replaces Archivo for display.

| Style | Width | Weight | Size (mobile → desktop) | Use |
|---|---|---|---|---|
| Display | 120 | 800 | 44 → 112 px | Hero and section headlines |
| Headline | 115 | 750 | 32 → 64 px | Secondary headlines |
| Title | 105 | 700 | 22 → 32 px | Plan names, step titles |
| Body large | 100 | 400 | 18 → 21 px | Lead paragraphs |
| Body | 100 | 400 | 16 → 17 px | Text |
| Label | 110 | 600 | 12 → 13 px, uppercase, +6 % tracking | Kickers, tags, navigation |
| Numeric | 115 | 750 | tabular figures | Prices, step numbers |

- Headlines are short and set tight (line height 0.95–1.05). Maximum three lines.
- Sentence case in Slovenian headlines; uppercase only for labels and buttons.
- Check č, š, ž at display size in the prototype; diacritics must not collide with the line above.
- Prices follow Slovenian convention: `89 €`, `1.290,00 €`, a non-breaking space before the symbol.
- Fonts load with `font-display: swap` and a metric-adjusted fallback, so text never moves when the font arrives.

---

## 4. Shape and space

### The four signature elements

| Element | What it is | Where |
|---|---|---|
| **Droplet** | The exact droplet from the logo | List bullets, step markers, progress indicator, FAQ toggle, slider handle, favicon |
| **Foam edge** | An irregular, bubbly organic edge | Three section transitions only |
| **Squeegee line** | A dead-straight, slightly tilted edge with a thin bead of water | Reveals and wipes |
| **Gloss** | One narrow highlight sweeping across a surface | Clean surfaces: the featured plan, the final CTA, the primary button |

The contrast between the organic foam edge and the hard squeegee line is the visual grammar: messy before, precise after.

### Shape

- Buttons are full pills.
- Images and panels use a 24 px radius on desktop, 16 px on mobile. Small controls use 10 px.
- No drop shadows on light surfaces. Separation comes from colour blocks and space. Dark surfaces may carry a faint top highlight, like light on paint.
- Borders are 1 px, `--mist` on light and `--steel` at low opacity on dark.

### Layout

- 12-column grid, 1320 px maximum content width, 24 px gutters; 4 columns and 20 px side margins on mobile.
- Sections breathe: 160 px vertical padding on desktop, 88 px on mobile.
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 160.
- Breakpoints: 480, 768, 1024, 1280, 1536.

---

## 5. Components

| Component | Notes |
|---|---|
| **Button, primary** | Lime pill, ink text, label style. Hover: gloss sweep. Press: slight scale. Focus: 2 px ink ring with a 2 px offset (white ring on dark). |
| **Button, secondary** | Transparent pill with a 1.5 px border in the current text colour. |
| **Text action** | Underlined text with an arrow or phone glyph. Used for the small hero actions. |
| **Navigation** | Transparent over the hero, solid after it (`MOTION.md` M02). Mobile: logo, primary button, menu button; full-screen ink menu. |
| **Size selector** | Three-way segmented control with small car silhouettes. Used on pricing and in the funnel; the same component in both. |
| **Plan panel** | Described in wireframe section 05. Not a card grid. |
| **Menu list** | Name, dotted leader, price. Used for add-ons. |
| **Before/after** | Draggable divider with a droplet handle; a real range input underneath for keyboard and screen readers. |
| **Field** | Label above, 56 px tall, 10 px radius, error text below in plain Slovenian. |
| **Step progress** | A horizontal bar that turns from dust to lime as steps complete. |
| **FAQ item** | Native `<details>`; the marker is a droplet that turns when open. |
| **Sticky mobile CTA** | A slim bar with the primary button, appearing after the hero and hiding near the final CTA and inside forms. |

All interactive elements are real `<button>` or `<a>` elements, reachable by keyboard, with visible focus, and at least 44 × 44 px on touch. Decorative foam and water layers are `aria-hidden` and never intercept pointer events.

---

## 6. Homepage wireframe

### 01 — Hero video

| | |
|---|---|
| Purpose | State the promise in three seconds and offer one obvious action |
| Headline | **Nikoli več v avtopralnico.** |
| Supporting line | Pridemo na dom ali v službo in poskrbimo, da je tvoj avto vedno čist. |
| Layout | Full-viewport video. Transparent navigation on top. Headline and actions anchored bottom-left on a soft dark scrim. A small line bottom-right: "Ljubljana z okolico · od 89 € na mesec". |
| Actions | Primary **Izberi paket**. Secondary **Kako deluje**. Beneath, as text actions: **Pokliči nas** · **Pošlji povpraševanje**. |
| Animation | Poster shows instantly, video fades in when it can play. Headline rises once. See `MOTION.md` M01, and section 4 for the video strategy. |
| Assets | Hero video encodes and poster (A01, A02) |
| Mobile | Portrait encode. Headline at 44 px across the lower third. Primary button full width; secondary beside or under it; the two text actions in one row. Safe-area padding at the bottom. |

### 02 — Old way vs our way

| | |
|---|---|
| Purpose | Make the friction of the old way felt, then remove it |
| Headline | **Zakaj bi svoj čas preživljal v avtopralnici?** |
| Layout | Two routes drawn across the full width. Top: a long, winding, dust-coloured road with five stops: *Vožnja → Vrsta → Pranje → Čakanje → Vožnja domov*. Below: one short, straight lime line with three stops: *Parkiraš → Nadaljuješ z dnevom → Čist avto*. The difference in length is the message. Labels "Stari način" and "Naš način". |
| Animation | The long road draws itself slowly as you scroll; the lime line then draws in one quick stroke. M04. |
| Assets | Subtle dust and mud texture in the background (A11). Optional photo of a car wash queue (A14). |
| CTA | None. A closing line: "Mi pridemo do tebe." |
| Mobile | Routes turn vertical: the long road snakes down the screen; the lime line is a short straight drop beside it. |

### 03 — How it works

| | |
|---|---|
| Purpose | Show that it takes three steps and almost no effort |
| Headline | **Ti parkiraš. Mi operemo.** |
| Layout | Two columns. Left, a tall image area that stays pinned while you scroll. Right, three large numbered steps that scroll past; the image changes with the active step. **1 Izberi paket** — Poveš nam, kaj voziš in kje parkiraš. **2 Izberi termin** — Vsak mesec te spomnimo. Termin izbereš v pol minute. **3 Mi pridemo** — Doma ali v službi. Ti nadaljuješ s svojim dnevom. |
| Animation | Pinning is plain CSS sticky. Images cross-fade. The step 3 photo is the first foam after the hero. M05. |
| Assets | Three images or short loops (A05) |
| CTA | Text action: **Poglej pakete** |
| Mobile | No pinning. Each step is image then text, stacked. |

### 04 — Before / after

| | |
|---|---|
| Purpose | Proof, and the most playful moment on the page |
| Headline | **Zjutraj umazan. Popoldne čist.** |
| Layout | One very large image, nearly full width, with a draggable divider. Small labels "Prej" and "Potem". A caption states plainly whether the photo is a real job or a demonstration. |
| Animation | Drag to compare (M06). On desktop, an optional mode where the pointer acts as a pressure washer (M07). |
| Assets | Matched dirty and clean pair (A04) |
| CTA | None |
| Mobile | 4:5 crop. Divider dragged by thumb, with a large handle. The divider nudges once on entry to show it moves. |

### 05 — Subscriptions

| | |
|---|---|
| Purpose | The conversion section. Make ALWAYS CLEAN the obvious choice. |
| Headline | **Vedno čist avto. Brez čakanja.** |
| Layout | Entered through the main foam transition. Size selector at the top. Then an asymmetric arrangement: **ALWAYS CLEAN** takes about half the width as a tall ink panel with lime price and the tag "Najbolj priljubljen". **CLEAN** and **PREMIUM** sit beside it as two shorter, quieter panels on fog. One shared list "V vsakem obisku" under all three, so the same features are not repeated three times. |
| Content | Price per month for the selected size, visits per month, one-line promise per plan. PREMIUM follows decision 8. |
| Animation | Prices roll when the size changes (M08). The featured panel gets one gloss sweep on entry (M11). |
| CTA | Each plan: **Izberi {paket}** → funnel with plan and size carried over |
| Mobile | ALWAYS CLEAN first and full width, then CLEAN, then PREMIUM. Size selector sticks under the navigation while the section is in view. |

### 06 — Initial Reset

| | |
|---|---|
| Purpose | Explain the one-time first visit before checkout does, and make it feel like value |
| Headline | **Prvi obisk je temeljit.** |
| Copy | Ob prvem obisku avto spravimo na naš standard. Od takrat ga samo še vzdržujemo. Začetno čiščenje od 149 €. |
| Layout | A single wide band, not a panel. Left: the headline and two sentences. Right: a simple timeline: one large first marker ("Prvi obisk"), followed by evenly spaced small droplets ("Vsak naslednji"). |
| Animation | The markers fill in sequence once |
| Assets | Optional split interior image (A15) |
| CTA | None; it supports section 05 |
| Mobile | Stacked; the timeline runs horizontally and can be swiped |

### 07 — Add-ons

| | |
|---|---|
| Purpose | Show depth of service without a wall of detailing jargon |
| Headline | **Ta mesec rabiš malo več?** |
| Layout | A typographic menu, like a good restaurant's: three groups (**Notranjost**, **Zaščita**, **Posebno**), each a list of name, dotted leader, price. A single image area beside the list changes with the hovered item. |
| Animation | Image cross-fade on hover or focus. Nothing else. |
| Assets | Six small macro images (A09), optional |
| CTA | Line: "Dodaš jih ob rezervaciji termina." |
| Mobile | Groups stack; no hover images, one image per group |

### 08 — Special occasions

| | |
|---|---|
| Purpose | Brand personality; turns upsells into something people look forward to |
| Headline | **Posebna priložnost?** |
| Layout | Four tall, full-bleed posters in a horizontal row that scrolls sideways: **Ready for Roadtrip**, **Date Night**, **Photoshoot Ready**, **Family Reset**. Each: one strong image, the name in display type, three included items, price. |
| Animation | Native scroll-snap. The poster in focus is slightly larger. M13. |
| Assets | Four posters (A06) |
| CTA | None on the homepage; these are bought during booking |
| Mobile | Same row, one poster per screen width with the next one peeking |

### 09 — Why mobile hand cleaning

| | |
|---|---|
| Purpose | The quality argument, stated carefully |
| Headline | **Ročno. Brez avtomatskih krtač.** |
| Layout | A large macro image on one side. On the other, three short statements in headline type with one line of explanation each: hand washing with clean mitts; at your location; the same standard every time. One sober sentence on brushes: krtače v avtomatskih pralnicah lahko na laku pustijo drobne praske. |
| Animation | Statements fade up once. Static droplets on the image. |
| Assets | Macro of a mitt and pink foam on paint (A07) |
| CTA | None |
| Mobile | Image on top, statements below |

### 10 — Fleet / business

| | |
|---|---|
| Purpose | Capture company leads |
| Headline | **Vozni park, ki je vedno čist.** |
| Layout | Ink background. Wide image of company cars. Short copy: we clean at your car park, during working hours, one invoice. A compact enquiry form in the section: company, number of vehicles, contact. |
| Animation | Gloss sweep on the image edge once |
| Assets | Fleet image (A08) |
| CTA | **Pošlji povpraševanje** → `fleet_lead`. Link to `/za-podjetja`. |
| Mobile | Image, copy, then the form full width |

### 11 — Reviews

| | |
|---|---|
| Purpose | Trust |
| Headline | **Kaj pravijo naročniki.** |
| Layout | One large quote at a time in headline type, with name and car. Two or three smaller quotes beside it. No star-rating carousel. |
| Rule | Hidden until real reviews exist. |
| Mobile | One quote per screen width, swipeable |

### 12 — FAQ

| | |
|---|---|
| Purpose | Remove the last objections; search visibility |
| Headline | **Pogosta vprašanja** |
| Layout | Two columns: headline and contact line on the left, questions on the right. Topics: what if it rains, do I need to be there, do you need water or power, where can you wash, how cancelling works, what the first visit is, how I pay. |
| Animation | Native open and close; droplet marker turns |
| CTA | "Nisi našel odgovora? **Pokliči nas**" |
| Mobile | Single column |

### 13 — Final CTA

| | |
|---|---|
| Purpose | Close |
| Headline | **Naslednje pranje? Že urejeno.** |
| Layout | Full-bleed lime. Enormous headline in ink. One button in ink with white text. Phone number beneath. |
| Animation | Entered through the final rinse; one gloss sweep across the whole block. M11. |
| Assets | Optional clean-car detail with beading water (A10) |
| CTA | **Izberi paket** |
| Mobile | Same, headline at display size across three lines |

Footer: ink, logo, navigation, contact, service area, legal links, company details.

---

## 7. Copy rules

- Slovenian, informal "ti", short sentences. Confident, friendly, a little playful.
- Say what happens, not how good we are.

| Write | Do not write |
|---|---|
| Ti parkiraš. Mi operemo. | Z veseljem vam ponujamo… |
| Zjutraj umazan. Popoldne čist. | Najvišja kakovost storitev |
| Naslednje pranje? Že urejeno. | Vaše zadovoljstvo je naša prioriteta |
| Mi pridemo do tebe. | Naše podjetje se ponaša… |

- Buttons name the action: "Izberi paket", "Potrdi termin", "Posodobi kartico".
- Error messages say what to do: "Vpiši poštno številko" and not "Neveljaven vnos".
- Plan and occasion names stay in English as brand names; everything around them is Slovenian.
- No claims we cannot support. No invented numbers, reviews or guarantees.
