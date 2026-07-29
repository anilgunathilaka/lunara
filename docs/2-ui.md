# Lunara Sarees - UI Design Specification

LUNARA SAREES

❋

DOCUMENT 2 OF 6

UI Design Specification

Visual language, design tokens, and application rules

Version 1.0  ·  July 2026

Palette sampled directly from the Lunara wordmark

Aligned to UX Specification v1.0

Status: Draft for approval

Table of Contents

1. Design Direction

1.1 Reading the Logo

The Lunara mark contains the entire design direction, and the specification below is derived from it rather than invented alongside it.

| What the mark does | What the interface must therefore do |
| --- | --- |
| A gold geometric medallion — an eight-point star built from overlapping petals and fine hairline construction lines — sits beside a deep plum wordmark in a high-contrast serif with generous letterspacing. | Gold is ornament and structure, never a background wash. Plum is authority and text. The interface earns its richness from restraint and precision, not from saturation. |
| The medallion is drawn with visible construction geometry: thin lines describing the shape that the solid petals fill. | Hairline rules and thin geometric detail are the signature device. They appear as dividers, frames and section markers — and they are always thin, never heavy. |
| The wordmark is letterspaced wide and set in a serif with sharp, high-contrast stroke modulation. | Display type is a high-contrast serif, letterspaced, used sparingly at large sizes. Body type is a quiet, highly legible companion that never competes. |
| The mark sits on generous white space. Nothing crowds it. | Whitespace is a material. Density is the enemy of a premium read, especially on a product where the photography must carry the sale. |

1.2 Direction Statement

Quiet luxury with a geometric spine. The photography is the hero on every screen — cotton texture, drape, true colour — and the interface is the frame around it: plum for authority, gold for the thin ornamental line that recalls the medallion, and a warm off-white ground that flatters cotton without tinting it.

The one deliberate risk: the signature device is the hairline geometric rule lifted from the medallion's construction lines, used as a structural motif across dividers, active states and section markers. It is a distinctive detail borrowed from the brand's own artefact rather than a generic border treatment.

1.3 What This Design Explicitly Avoids

| Avoided | Why |
| --- | --- |
| Gold as a fill for large areas or as body text | Gold at #C9A24D fails contrast against white for text and cheapens instantly when used as a fill. It is a line and an accent, nothing more. |
| Terracotta or warm-clay accents | A common default in generated design and entirely foreign to this mark. |
| Heavy shadows and elevated cards | Depth here comes from hairlines and whitespace, consistent with the flat geometric mark. |
| Rounded, friendly geometry | The mark is sharp and angular. Radii stay small and disciplined. |
| Gradient overlays on photography | The colour-accuracy promise makes any tinting of product imagery an actual liability, not merely a style choice. |

2. Colour

2.1 Brand Colours — Sampled from the Logo

These three values are taken pixel-exact from the supplied artwork. They are not approximations and must not be adjusted.

| Token | Hex | Swatch | Use |
| --- | --- | --- | --- |
| --lun-plum | #5A1E2D |  | Primary brand. Wordmark, headings, primary actions, table headers. |
| --lun-plum-light | #7A3A45 |  | Secondary plum from the SAREES lockup. Subheadings, hover states, secondary text on light grounds. |
| --lun-gold | #C9A24D |  | Accent only. Hairline rules, active indicators, small ornament. Never body text on white, never a large fill. |

2.2 Extended Palette

Derived from the brand three, chosen to support product photography without tinting it.

| Token | Hex | Swatch | Use |
| --- | --- | --- | --- |
| --lun-plum-deep | #3E1420 |  | Footer ground, high-emphasis surfaces, pressed states. |
| --lun-gold-pale | #E8D9B0 |  | Subtle accent fills, selected swatch ring, gentle highlight bands. |
| --lun-gold-deep | #A07F35 |  | Gold text where contrast is required — meets AA on white at body size. |
| --lun-ground | #FBFAF8 |  | Page background. Warm off-white; flatters cotton without casting colour. |
| --lun-surface | #FFFFFF |  | Cards, product tiles, any surface carrying photography. |
| --lun-line | #E4DFD8 |  | Default hairline rules, borders, dividers. |
| --lun-ink | #1A1A1A |  | Body text. |
| --lun-ink-muted | #6B6B6B |  | Secondary text, captions, metadata. |

2.3 Semantic Colours

| Token | Hex | Swatch | Use |
| --- | --- | --- | --- |
| --lun-success | #2E6B4F |  | In stock, order confirmed, successful save. |
| --lun-warning | #8A6516 |  | Low stock, advisory notes, the unstitched reminder. |
| --lun-danger | #9B2C2C |  | Errors, out of stock, destructive actions. Deliberately distinct from brand plum. |
| --lun-info | #3E2A56 |  | The preview honesty note and other neutral advisories. |

The danger colour is intentionally separated from brand plum. If an error looked like the brand, customers would learn to ignore the brand colour — or worse, read every plum element as a warning.

2.4 Contrast Compliance

| Combination | Ratio | Verdict |
| --- | --- | --- |
| Plum #5A1E2D on ground #FBFAF8 | ~11.9:1 | Passes AAA. Default for headings and body. |
| Plum-light #7A3A45 on ground | ~7.8:1 | Passes AAA. Safe for subheadings and secondary text. |
| Ink #1A1A1A on ground | ~16.8:1 | Passes AAA. Default body text. |
| Ink-muted #6B6B6B on ground | ~5.4:1 | Passes AA. Captions and metadata only. |
| Gold #C9A24D on white | ~2.1:1 | FAILS. Prohibited for text of any size. Rules and ornament only. |
| Gold-deep #A07F35 on white | ~3.6:1 | Passes AA for large text (18.66px bold / 24px regular) only. Not for body copy. |
| White on plum #5A1E2D | ~11.9:1 | Passes AAA. The primary button pairing. |
| White on gold #C9A24D | ~2.1:1 | FAILS. Never place white text on gold. |

The gold restriction is the single most important rule in this document. It is the brand's most recognisable colour and the one most likely to be misapplied. Gold draws lines; it does not carry words.

2.5 Colour and Product Photography

| Rule | Reason |
| --- | --- |
| Product imagery MUST sit on pure white #FFFFFF, never on the warm ground. | A warm ground shifts perceived fabric colour. The colour-accuracy promise makes this a liability, not a preference. |
| No gradient, tint, duotone or overlay may be applied to any product image. | Same reason. Every product photograph is evidence in a colour claim. |
| Swatch chips MUST render the true sampled fabric colour, with no border tint that could shift perception. Use a neutral hairline only. | A coloured border changes how the adjacent colour is read. |
| The selected-swatch indicator MUST be a ring outside the chip, never an overlay on it. | An overlay obscures the very colour being chosen. |

3. Typography

3.1 Typefaces

| Role | Typeface | Fallback stack | Rationale |
| --- | --- | --- | --- |
| Display | Cormorant Garamond | Georgia, 'Times New Roman', serif | High-contrast serif with sharp modulation, closely matching the wordmark's character. Used sparingly at large sizes with wide letterspacing. |
| Body | Inter | system-ui, 'Segoe UI', Roboto, sans-serif | Quiet, highly legible at small sizes on Android. Never competes with the display face or the photography. |
| Sinhala | Noto Sans Sinhala | 'Iskoola Pota', sans-serif | Full script coverage with weights matching Inter. |
| Tamil | Noto Sans Tamil | 'Latha', sans-serif | Full script coverage with weights matching Inter. |
| Numeric / utility | Inter with tabular figures | monospace fallback | Prices, measurements and order numbers must align in columns. |

Display type is Latin-only by design. Sinhala and Tamil headings use the Noto body face at heading sizes and weights — Cormorant has no Sinhala or Tamil coverage, and substituting a mismatched display face would look worse than a consistent body face at scale.

3.2 Type Scale

| Token | Size / line-height | Weight | Tracking | Use |
| --- | --- | --- | --- | --- |
| --type-display-xl | 48 / 56 | 400 | +0.06em | Home hero only. Cormorant. |
| --type-display-l | 36 / 44 | 400 | +0.05em | Page titles. Cormorant. |
| --type-display-m | 28 / 36 | 400 | +0.04em | Section headings. Cormorant. |
| --type-heading | 20 / 28 | 600 | +0.01em | Card titles, block headings. Inter. |
| --type-body-l | 17 / 26 | 400 | 0 | Product descriptions. Inter. |
| --type-body | 15 / 24 | 400 | 0 | Default body. Inter. |
| --type-body-s | 13 / 20 | 400 | 0 | Captions, metadata. Inter. |
| --type-label | 12 / 16 | 600 | +0.10em | Eyebrows, uppercase labels. Inter. |
| --type-price | 20 / 28 | 600 | 0 | Prices. Inter, tabular figures. |

3.3 Mobile Scale

Display sizes step down on viewports below 768px. Body sizes do not — 15px is already the floor for comfortable reading on a mid-range Android.

| Token | Desktop | Mobile |
| --- | --- | --- |
| --type-display-xl | 48 | 32 |
| --type-display-l | 36 | 26 |
| --type-display-m | 28 | 22 |
| --type-heading | 20 | 18 |
| Body tokens | unchanged | unchanged |

3.4 Typographic Rules

Cormorant appears at 22px and above only. Below that its high stroke contrast becomes fragile and illegible, particularly on Android at low pixel density.

Uppercase is reserved for --type-label. Never set body copy or product names in uppercase.

Letterspacing is positive on display and label tokens, echoing the wordmark. Body copy is never letterspaced.

Prices always use tabular figures so that columns of prices align in the cart and catalogue.

Line length is capped at 68 characters for body copy. Wider lines are harder to track and read as unconsidered.

Sinhala and Tamil often set taller than Latin at the same nominal size. Line height increases by 4px for these scripts across all body tokens.

4. Space, Shape and Depth

4.1 Spacing Scale

A 4px base unit. Every margin, padding and gap resolves to one of these tokens — no arbitrary values.

| Token | Value | Typical use |
| --- | --- | --- |
| --space-1 | 4px | Icon-to-label gaps, tight internal padding. |
| --space-2 | 8px | Within a component; swatch grid gaps. |
| --space-3 | 12px | Between related controls. |
| --space-4 | 16px | Default component padding; mobile page gutter. |
| --space-5 | 24px | Between components; card padding. |
| --space-6 | 32px | Between content blocks. |
| --space-7 | 48px | Between page sections on mobile. |
| --space-8 | 64px | Between page sections on desktop. |
| --space-9 | 96px | Around the hero; major breathing room. |

4.2 Radius

| Token | Value | Applied to |
| --- | --- | --- |
| --radius-none | 0 | Hairline rules, dividers, the geometric motif. |
| --radius-s | 2px | Swatch chips, small tags, input fields. |
| --radius-m | 4px | Buttons, cards, modals. |
| --radius-full | 999px | Pills and the WhatsApp floating action only. |

Radii stay deliberately small. The medallion is built from straight lines and sharp points; soft, heavily rounded geometry would contradict the mark.

4.3 Elevation

Depth is expressed through hairlines and whitespace rather than shadow. Only three elevations exist.

| Token | Definition | Applied to |
| --- | --- | --- |
| --elev-0 | No shadow. 1px --lun-line border. | Cards, product tiles, inputs. The default. |
| --elev-1 | 0 2px 8px rgba(90,30,45,0.08) | Sticky bars, dropdowns, the mobile price bar. |
| --elev-2 | 0 8px 32px rgba(90,30,45,0.14) | Modals and slide-overs only. |

Shadow tints use plum rather than neutral black, so that depth remains within the brand's colour world.

4.4 The Signature Device — Geometric Hairline

The medallion is constructed from thin geometric lines. That construction is lifted into the interface as its signature structural device.

Section divider — hairline with a centred motif:

────────────────────────  ❋  ────────────────────────

1px --lun-line              gold, 12px

Section marker — a short gold rule above a heading:

▬▬▬▬  2px × 32px, --lun-gold

Section heading in Cormorant

Active tab indicator — a gold rule beneath the label:

Saree      Jacket      Drape

▬▬▬▬▬▬▬

2px, --lun-gold

Selected swatch — a gold ring OUTSIDE the chip:

┌─────┐        ╔═════╗   2px gold ring, 2px offset

│     │   →    ║     ║   colour never overlaid

└─────┘        ╚═════╝

| Usage rule | Specification |
| --- | --- |
| Weight | Hairlines are 1px for dividers and borders; 2px for active indicators and selection rings. Never heavier. |
| Colour | --lun-line for structural dividers; --lun-gold for meaningful state (active, selected, section marker). |
| Frequency | At most one motif divider per screen section. The device loses meaning through repetition. |
| Prohibition | The motif never decorates a product photograph, and never appears inside the configurator preview area. |

5. Layout

5.1 Breakpoints

| Name | Range | Grid | Gutter |
| --- | --- | --- | --- |
| Mobile | 320–767px | 4 columns | 16px |
| Tablet | 768–1023px | 8 columns | 24px |
| Desktop | 1024–1439px | 12 columns | 32px |
| Wide | 1440px+ | 12 columns, max content 1320px | 32px |

Mobile is the design origin, not an adaptation. Every screen is designed at 360px first and expanded upward.

5.2 Key Layouts

PRODUCT DETAIL — desktop ≥1024px

┌────────────────────────────┬──────────────────────┐

│                            │  Name (Cormorant)    │

│      GALLERY               │  Price               │

│      7 columns             │  ──── gold rule      │

│      pure white ground     │  Jacket: named+swatch│

│                            │  ⚠ ships unstitched  │

│      [thumbnail strip]     │  [ Add to cart ]     │

│                            │  [ Change the jacket]│

│                            │  [ Send me swatches ]│

└────────────────────────────┴──────────────────────┘

──────────  ❋  ──────────

Fabric block · Delivery · Promises · Care · Reviews

PRODUCT DETAIL — mobile <768px

Gallery, full-bleed, swipeable

Name · Price · Jacket + swatch · ⚠ unstitched

[ Add to cart ]   ← pinned to viewport bottom

Accordion: Fabric / Delivery / Promises / Care / Reviews

5.3 Configurator Layout

The layout is specified in the UX document. This section defines only its visual treatment.

| Zone | Visual treatment |
| --- | --- |
| Preview area | Pure white --lun-surface. No border, no shadow, no motif. Nothing may compete with the rendered garment. |
| Honesty note | --lun-info text on --lun-gold-pale at 20% opacity, with a 1px --lun-line top border. Present but never alarming. |
| Picker panel | --lun-ground with a 1px --lun-line separating it from the preview. Swatch grid on --space-2 gaps. |
| Active tab | Gold 2px rule beneath the label, per the signature device. |
| Selected swatch | Gold 2px ring at 2px offset. The chip's colour is never overlaid. |
| Disabled swatch | 40% opacity plus a 1px diagonal line. Colour alone never conveys the state. |
| Price and action | On mobile, pinned to the viewport bottom with --elev-1 and a 1px top hairline. |

6. Imagery Standards

6.1 Photography

| Attribute | Standard |
| --- | --- |
| Lighting | Natural daylight, diffused, consistent across every shoot. A written protocol is an operational requirement in the PRD (OPS-10). |
| Background | Neutral white or a very light warm grey. Never a coloured backdrop that could shift perceived fabric colour. |
| Reference frame | One unedited daylight frame per colourway, published and labelled as the colour reference. This image is never retouched. |
| Retouching | Dust and blemish removal only. Colour, saturation and white balance are never adjusted on product imagery. |
| Aspect ratios | Product 4:5 · gallery 1:1 · hero 16:9 · swatch 1:1. |
| Model imagery | Full drape visible including pallu. Consistent pose and distance across the range so that comparison is meaningful. |
| Video | 10–15 seconds, daylight, showing drape in motion and the pallu falling. Silent by default with no music. |

6.2 The Colour Reference Frame

This asset carries a contractual role, not merely a visual one. Document 1 and the PRD both scope the colour-accuracy promise to it specifically.

| Requirement | Specification |
| --- | --- |
| Labelling | Visibly labelled in the gallery as the colour reference, in all three languages. |
| Treatment | No filter, no crop that changes context, no adjustment of any kind. |
| Placement | Always present in the gallery; never buried behind a 'more images' interaction. |
| Configurator link | The preview's honesty note links directly to the reference frames for both currently selected materials. |

6.3 Iconography

| Attribute | Standard |
| --- | --- |
| Style | Line icons, 1.5px stroke, square terminals — consistent with the medallion's hairline construction. |
| Size | 20px default, 24px for touch targets, 16px inline with text. |
| Colour | Inherits text colour. Gold reserved for active or selected states only. |
| Prohibition | No filled icons, no duotone, no illustrated or decorative icon sets. |

7. Motion

Motion is used to make state changes legible, never to decorate. The configurator is the only surface with meaningful animation, because there a change of state is the entire point.

| Token | Duration / easing | Applied to |
| --- | --- | --- |
| --motion-instant | 0ms | Colour changes on hover; anything under reduced-motion. |
| --motion-quick | 120ms ease-out | Button and swatch state changes. |
| --motion-standard | 200ms ease-out | Slide-overs, accordions, tab changes. |
| --motion-preview | 280ms ease-in-out | Configurator preview cross-fade on selection change. |
| --motion-page | 320ms ease-out | Page and route transitions. |

7.1 Motion Rules

The preview cross-fade is the only orchestrated moment in the product. When a material changes, the rendered garment cross-fades rather than flickering or reloading — this single detail carries the perceived quality of the whole feature.

Rotation follows the pointer or finger one-to-one. It is direct manipulation, never an animation the customer triggers and watches.

Never animate a product photograph. No parallax, no scale-on-hover, no drift.

prefers-reduced-motion is honoured absolutely: cross-fades become instant swaps and rotation becomes stepped.

No scroll-triggered reveal animations. On mobile data they read as broken loading rather than as polish.

8. Token Reference

The complete token set as CSS custom properties. Document 3 builds components exclusively from these; no component may introduce a raw value.

:root {

/* Brand — sampled from lunara-png.png */

--lun-plum:        #5A1E2D;

--lun-plum-light:  #7A3A45;

--lun-gold:        #C9A24D;

/* Extended */

--lun-plum-deep:   #3E1420;

--lun-gold-pale:   #E8D9B0;

--lun-gold-deep:   #A07F35;

--lun-ground:      #FBFAF8;

--lun-surface:     #FFFFFF;

--lun-line:        #E4DFD8;

--lun-ink:         #1A1A1A;

--lun-ink-muted:   #6B6B6B;

/* Semantic */

--lun-success:     #2E6B4F;

--lun-warning:     #8A6516;

--lun-danger:      #9B2C2C;

--lun-info:        #3E2A56;

/* Type */

--font-display: 'Cormorant Garamond', Georgia, serif;

--font-body:    'Inter', system-ui, sans-serif;

--font-sinhala: 'Noto Sans Sinhala', 'Iskoola Pota', sans-serif;

--font-tamil:   'Noto Sans Tamil', 'Latha', sans-serif;

--type-display-xl: 48px/56px;  --type-display-l: 36px/44px;

--type-display-m:  28px/36px;  --type-heading:   20px/28px;

--type-body-l:     17px/26px;  --type-body:      15px/24px;

--type-body-s:     13px/20px;  --type-label:     12px/16px;

--type-price:      20px/28px;

/* Space */

--space-1: 4px;   --space-2: 8px;   --space-3: 12px;

--space-4: 16px;  --space-5: 24px;  --space-6: 32px;

--space-7: 48px;  --space-8: 64px;  --space-9: 96px;

/* Shape */

--radius-none: 0;     --radius-s: 2px;

--radius-m:    4px;   --radius-full: 999px;

/* Elevation */

--elev-0: none;

--elev-1: 0 2px 8px rgba(90,30,45,0.08);

--elev-2: 0 8px 32px rgba(90,30,45,0.14);

/* Motion */

--motion-quick:    120ms ease-out;

--motion-standard: 200ms ease-out;

--motion-preview:  280ms ease-in-out;

--motion-page:     320ms ease-out;

}

@media (prefers-reduced-motion: reduce) {

:root {

--motion-quick: 0ms; --motion-standard: 0ms;

--motion-preview: 0ms; --motion-page: 0ms;

}

}

8.1 Enforcement

| Rule | Enforcement |
| --- | --- |
| No raw hex values in component code. | Lint rule failing the build on any hex literal outside the token file. |
| No arbitrary spacing values. | Spacing must resolve to a --space token. |
| Gold never used for text on white. | Documented in review checklist and covered by the contrast audit in Document 6. |
| No filter or overlay on product imagery. | Code review checkpoint on any component rendering product photography. |
