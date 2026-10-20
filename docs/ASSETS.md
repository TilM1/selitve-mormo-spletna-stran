# Mormo.si — Assets

Status: **proposal, awaiting approval.** Nothing here has been generated. Assets are produced one at a time, after the design direction is approved.

---

## 1. Rules for every generated asset

1. **One car, one world.** Every image uses the same vehicle, paint colour, uniform and light as the hero video. Attach a still from the hero video as the reference image to every generation. The prompts below say "the reference car" for this reason; replace it with the actual make and colour once the video is in the repo.
2. **No text or logos in generated images.** Generated lettering comes out wrong. The logo is added afterwards in code or in an editor.
3. **Look:** photographic, natural overcast or soft daylight, neutral grey surroundings, true-to-life colour. The only saturated colours are pink foam and lime accents. No lens flares, no neon, no heavy colour grading.
4. **Setting:** a recognisably Central European residential driveway or modern office car park. No palm trees, no American suburbs, no number plates readable.
5. **Honesty.** A generated before/after is a demonstration, and is labelled as one. It is replaced by real job photos as soon as they exist. Generated images are never captioned as customer cars.
6. **Delivery:** export the largest size available; the build converts to AVIF and WebP and creates responsive sizes.

Assumed for the prompts until confirmed: the worker wears a plain dark grey uniform with small lime details; the service vehicle is a plain dark grey van.

## 2. Priority

| Priority | Assets | Needed for |
|---|---|---|
| **Must have** | A01, A02, A03, A04 | Phase 0 prototype and the homepage core |
| **Should have** | A05, A06, A07, A08, A10 | Complete homepage |
| **Nice to have** | A09, A11, A12, A14, A15 | Polish |
| **Made in code, not generated** | A13 (Open Graph image), favicon, car size silhouettes, route illustrations, droplet | — |

---

## 3. Asset list

### A01 — Hero poster

| | |
|---|---|
| Placement | Section 01, shown before and beneath the video |
| Format | AVIF + WebP + JPEG |
| Dimensions | 1920×1080 and 720×1280 |
| Shows | The exact first frame of each hero video encode |
| Why | It is the page's LCP element; it must match the video's first frame so the switch is invisible |
| How | **Extracted from the video, not generated.** See `MOTION.md` 4.2. |

### A02 — Hero video, portrait version

| | |
|---|---|
| Placement | Section 01 on phones |
| Format | MP4 (H.264 and AV1) |
| Dimensions | 720×1280 (9:16) |
| Shows | The same shot as the hero video, composed for a tall frame with the car fully visible |
| Why | A 16:9 video on a phone keeps only its central third. Most visitors will be on phones. |
| How | First try a manual crop of the master. Only if the car does not fit, use Higgsfield's reframe on the original video. |

**Higgsfield reframe instruction:**
> Reframe this video to 9:16 portrait. Keep the car fully in frame and centred in the lower two thirds. Extend the scene naturally above and below. Preserve the original motion, lighting, colours and pink foam exactly. Do not add new objects, people or text.

### A03 — Foam edge texture

| | |
|---|---|
| Placement | Hero exit (M03), pricing entry (M09) |
| Format | AVIF with transparency, plus a WebP fallback |
| Dimensions | 3840×1200, tileable left to right |
| Shows | A thick band of pink snow foam seen straight on. The top edge is irregular and bubbly. The bottom edge is cut cleanly. |
| Why | This is the site's signature transition. A photographic foam edge matches the video; a drawn one would look like a different brand. |
| How | Generate on a pure black background, then remove the background to get transparency. Produce three variants for the parallax layers: dense, medium, and sparse bubbles. |

**Prompt:**
> Macro studio photograph of thick pink car wash snow foam spread across a flat surface, viewed perfectly straight on, filling the lower half of the frame edge to edge. The upper boundary of the foam is an irregular organic line of clustered bubbles of different sizes, some large glossy bubbles, some fine dense lather, with a few small detached bubbles just above the edge. Bubblegum pink colour with soft white highlights and gentle translucency. Even soft studio lighting from above, crisp detail in every bubble, no motion blur. Pure solid black background above the foam. No car, no hands, no tools, no text. Ultra wide panoramic composition, 16:5.

### A04 — Before / after pair

| | |
|---|---|
| Placement | Section 04 |
| Format | AVIF + WebP |
| Dimensions | 2400×1500 (16:10) and a 1600×2000 (4:5) crop for phones |
| Shows | The same car, same angle, same light: one frame dirty, one frame spotless |
| Why | The proof moment and the page's main interaction. The two frames must align to the pixel or the slider looks fake. |
| How | Generate the clean image first. Then create the dirty version by editing that same image, so the framing is identical. Do not generate the two separately. |

**Prompt, clean (generate first):**
> Photograph of the reference car parked on a clean residential driveway in soft overcast daylight, front three-quarter view from standing height, the whole car in frame with space around it. The paint is freshly hand washed and flawless, deep glossy reflections of the sky along the bonnet and doors, a few fine water beads on the bonnet, clean dark tyres with a satin finish, spotless wheels and glass. Neutral grey modern house wall and paving in the background, slightly out of focus. Natural colours, realistic, high detail, 50 mm lens. No people, no text, no visible number plate.

**Prompt, dirty (edit of the clean image):**
> Keep the car, camera angle, framing, background and lighting exactly the same. Make the car realistically dirty after weeks of winter driving: a dull film of dried road dust over all the paint so reflections are muted, brown mud splatter along the lower doors, sills and behind the wheels, brake dust darkening the wheels, dried water spots and streaks on the glass, a few dead insects on the front bumper. Do not change the car's shape, position or colour underneath the dirt. Realistic, not exaggerated.

### A05 — How it works, three images

| | |
|---|---|
| Placement | Section 03, one per step |
| Format | AVIF + WebP. Step 3 may be a 4–5 second silent loop (MP4). |
| Dimensions | 1600×2000 (4:5) |
| Why | Each step needs to be understood at a glance without reading |

**Prompt, step 1 (choose a plan):**
> Close photograph over the shoulder of a person sitting on a sofa at home holding a smartphone in one hand, thumb about to tap the screen. The phone screen is plain soft white with no readable content. Relaxed morning light from a window, a coffee cup on the table, car keys beside it. Muted grey and white interior. Shallow depth of field, natural colours, realistic. No text, no logos. Vertical 4:5.

**Prompt, step 2 (pick a time):**
> Photograph through an office window from inside, looking down at a modern office car park where the reference car is parked in a marked bay. In the foreground, slightly out of focus, the edge of a desk with a laptop and a hand holding a phone. Overcast daylight, calm weekday mood, neutral grey architecture. Realistic, natural colours. No text, no logos. Vertical 4:5.

**Prompt, step 3 (we come to you):**
> Photograph of a car detailer in a plain dark grey uniform with small lime green details spraying thick pink snow foam from a foam lance onto the reference car parked in an office car park. The car is half covered in pink foam running down the doors. A plain dark grey van stands behind with its side door open showing neatly arranged equipment. Soft overcast daylight, wet ground with reflections, neutral grey office building behind. The worker is seen from the side, face not prominent. Realistic, high detail. No text, no logos. Vertical 4:5.

**Prompt, step 3 as a loop (optional, image-to-video from the still above):**
> Slow, steady shot. The detailer sweeps the foam lance smoothly from left to right, pink foam builds up on the car door and slides slowly downward. Camera almost static with a very slight push in. Natural motion, no cuts, no camera shake. 5 seconds.

### A06 — Occasion posters, four images

| | |
|---|---|
| Placement | Section 08, and later in the booking upsell and emails |
| Format | AVIF + WebP |
| Dimensions | 1600×2000 (4:5), with clear space in the upper third for the title set in code |
| Why | These turn add-ons into something with personality. Each needs its own mood while staying in the same world. |

**Prompt, Ready for Roadtrip:**
> Photograph of the reference car, spotlessly clean, parked at the side of an empty alpine road at early morning, rear three-quarter view with the boot open showing neatly packed bags. Mountains and low mist in the distance, soft golden first light, clear sky filling the upper third of the frame. Crystal clear windows, gleaming paint. Calm, anticipatory mood. Realistic, natural colours. No people, no text, no number plate. Vertical 4:5.

**Prompt, Date Night:**
> Photograph of the reference car, immaculately clean and glossy, parked on a quiet city street at dusk, side view. Warm restaurant window light and soft street lamps reflect along the polished paint and in the spotless glass. Wet cobblestones with gentle reflections. Deep blue evening sky filling the upper third. Elegant, quiet mood. Realistic, natural colours, no neon. No people, no text, no number plate. Vertical 4:5.

**Prompt, Photoshoot Ready:**
> Photograph of the reference car in a large minimal concrete space with a single large soft light source from above, low front three-quarter view. Mirror-like paint with long clean highlight lines along the body, deep black satin tyres, flawless glass. Plain pale grey wall filling the upper third. Precise, studio-quality mood. Realistic, high detail. No people, no text, no number plate. Vertical 4:5.

**Prompt, Family Reset:**
> Photograph looking into the rear seat of the reference car through the open rear door in bright soft daylight. The interior is perfectly clean: spotless seats, vacuumed carpets, a clean child seat properly installed, one small soft toy sitting on the seat. Outside, a blurred green garden and a plain sky in the upper third. Warm, tidy, reassuring mood. Realistic, natural colours. No people, no text. Vertical 4:5.

### A07 — Hand wash macro

| | |
|---|---|
| Placement | Section 09 |
| Format | AVIF + WebP |
| Dimensions | 2400×1600 (3:2) |
| Why | Makes "by hand" tangible and carries the quality argument without words |

**Prompt:**
> Extreme close-up photograph of a hand in a black nitrile glove holding a plush grey microfibre wash mitt, gliding across the painted door of the reference car through a layer of pink foam. Where the mitt has passed, the paint is clean, glossy and reflective; ahead of it, the foam is thick and bubbly. Fine water droplets on the clean area. Soft overcast daylight, very shallow depth of field, focus on the edge between foam and clean paint. Realistic, high detail. No text, no logos. Horizontal 3:2.

### A08 — Fleet

| | |
|---|---|
| Placement | Section 10 and `/za-podjetja` |
| Format | AVIF + WebP |
| Dimensions | 2520×1080 (21:9), with a 4:5 crop for phones |
| Why | Shows the business case at a glance: many cars, cleaned where they stand |

**Prompt:**
> Wide photograph of a modern company car park in front of a glass office building, a row of five identical white compact cars parked neatly in marked bays, seen at a slight angle so the row recedes into the distance. All cars are spotless and glossy. At the far end, a detailer in a plain dark grey uniform is drying the last car with a towel, a plain dark grey van parked beside. Soft overcast daylight, clean wet ground with reflections. Calm, orderly, professional. Realistic, natural colours. No text, no logos, no readable number plates. Ultra wide 21:9.

### A09 — Add-on details, six images (optional)

| | |
|---|---|
| Placement | Section 07, changing with the hovered item; also `/storitve` |
| Format | AVIF + WebP |
| Dimensions | 1200×1200 (1:1) |
| Why | Lets the visitor see what an unfamiliar service means |

Shared style line, added to each prompt:
> Extreme close-up product-style photograph, soft daylight, shallow depth of field, realistic, natural colours, grey and black car interior or exterior, no people's faces, no text, no logos. Square 1:1.

| Add-on | Subject line of the prompt |
|---|---|
| Deep seat cleaning | A wet extraction nozzle drawing a clean lighter stripe across a dark fabric car seat, the uncleaned area visibly duller beside it. |
| Pet hair | A rubber pet hair brush pulling a line of light dog hair off dark boot carpet, a clean dark strip behind it. |
| Leather care | A gloved hand working conditioner into a black leather seat with a soft applicator, the treated area rich and satin, stitching in sharp focus. |
| Child seat | A clean child car seat with its fabric cover freshly cleaned, a detailing brush resting on it, crumbs gone. |
| Wax / sealant | Tight round water beads standing on freshly protected dark car paint, sky reflected in each bead. |
| Ozone treatment | A compact ozone generator standing on the centre console of a closed, clean car interior, soft light through the windows. |

### A10 — Final CTA detail (optional)

| | |
|---|---|
| Placement | Section 13, as a cut-out element on the lime background; also the base for the Open Graph image |
| Format | AVIF with transparency |
| Dimensions | 2400×1400 |
| Why | Ends the page on the product's result: shine |

**Prompt:**
> Studio photograph of the front corner of the reference car, headlight and part of the bonnet and wheel, perfectly clean with tight water beads on the bonnet and a long soft highlight along the body line. Plain pure white background, soft even light, crisp edges suitable for cutting out. Realistic, high detail. No text, no logos, no number plate. Horizontal 16:9.

### A11 — Dirt and dust texture (optional)

| | |
|---|---|
| Placement | Section 02 background, at low opacity |
| Format | AVIF |
| Dimensions | 2400×1600, seamless |
| Why | Gives the "old way" section a physical, gritty surface without illustration |

**Prompt:**
> Flat, straight-on macro photograph of a dark grey painted metal panel covered in a thin layer of dried road dust with scattered brown mud splatter and a few dried drip marks. Even diffuse lighting, no reflections, no perspective, no objects. Subtle and realistic, low contrast. Seamless tileable texture. Horizontal 3:2.

### A12 — Water droplets (optional)

| | |
|---|---|
| Placement | Small details in sections 05, 09 and 13 |
| Format | AVIF with transparency |
| Dimensions | 1600×1600 |
| Why | A real water detail in two or three places ties the light half of the page to the wash |

**Prompt:**
> Macro photograph of scattered clear water droplets of different sizes on a perfectly smooth glossy surface, viewed straight on. Each droplet sharp with a small bright highlight and soft shadow. Pure solid black background, even soft lighting. No other objects, no text. Square 1:1.

### A14 — The queue (optional)

| | |
|---|---|
| Placement | Section 02, small, beside the "old way" route |
| Format | AVIF + WebP |
| Dimensions | 1600×1200 (4:3) |
| Why | One glance at a queue communicates the wasted Saturday |

**Prompt:**
> Photograph taken from the driver's seat through a slightly dirty windscreen, looking at a line of four cars waiting ahead at an automatic car wash on a grey overcast Saturday. Hands resting on the steering wheel. Dull flat light, muted colours, a sense of waiting. The car wash building is generic with no signage. Realistic. No text, no logos, no readable number plates. Horizontal 4:3.

### A15 — Initial Reset interior (optional)

| | |
|---|---|
| Placement | Section 06 |
| Format | AVIF + WebP |
| Dimensions | 2400×1200 (2:1) |
| Why | Shows why the first visit is different from the ones that follow |
| How | As with A04: generate the clean interior first, then edit one half to be dirty so the two halves align |

**Prompt, clean:**
> Photograph of a car's front interior seen from the open driver's door: seats, centre console, dashboard and footwell, all perfectly clean, vacuumed carpets, dust-free dashboard, clear glass. Dark grey and black materials, soft daylight. Realistic, high detail. No people, no text, no logos. Horizontal 2:1.

**Prompt, dirty (edit, left half only):**
> Keep everything identical. On the left half of the image only, make the interior realistically neglected: crumbs and sand on the seat and carpet, dust on the dashboard, a dried stain on the seat fabric, smudges on the plastic. The right half stays perfectly clean. A straight vertical boundary between the two halves.

---

## 4. Real assets to collect from day one

These replace generated images over time and are worth more than any of them.

- Before and after photos of real jobs, taken from the same angle (a simple routine: four fixed angles, before and after).
- Photos of the real van, equipment and uniform.
- A short portrait of the person who comes to the customer's home. For a service that happens in someone's driveway, knowing who arrives matters.
- Customer reviews, with permission to publish name and car.
