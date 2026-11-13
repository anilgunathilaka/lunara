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
| --container-max | 90vw | Widest the site content runs: 90% of the screen, the same width as the hero banner photograph (founder decision 2026-11-10; was 1360px) (§7.4). |

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
| --motion-reveal | 1150ms cubic-bezier(0.58, 0, 0.28, 0.99) | Home hero and header entrance only (§7.2). |
| --motion-reveal-delay | 400ms | Stagger between hero reveal steps (§7.2). |
| --motion-stagger | 80ms | Between words of the hero headline (§7.2). |
| --motion-hero-interval | 4000ms | Time from one hero slide to the next, the slide itself included (§7.2; founder decision 2026-11-10). |
| --motion-hero-slide | 1000ms ease | The hero row sliding across to the next photograph (§7.2). |
| --motion-marquee | 120000ms | One loop of the sliding facts beneath the hero banner (§7.2). |
| --motion-sticky-bar | 500ms ease | The product page bar with Add to cart sliding up from the bottom (§7.5). |
| --motion-menu | 300ms cubic-bezier(0.33, 0, 0, 1) | Header menu panel fade (§7.2). |
| --motion-header | 500ms cubic-bezier(0.33, 0, 0, 1) | Header hairline (§7.2). |
| --motion-announcement-interval | 3000ms | Time each utility-bar fact stays (§7.2). |
| --motion-announcement-fade | 700ms ease | Cross-fade between utility-bar facts (§7.2). |
| --motion-section | 800ms cubic-bezier(0.33, 0, 0, 1) | Words rising into place on scroll (§7.4). |

7.1 Motion Rules

The preview cross-fade is the only orchestrated moment in the product. When a material changes, the rendered garment cross-fades rather than flickering or reloading — this single detail carries the perceived quality of the whole feature.

Rotation follows the pointer or finger one-to-one. It is direct manipulation, never an animation the customer triggers and watches.

Never animate a product photograph. No parallax, no scale-on-hover, no drift. The one exception is the home hero slider (founder decision 2026-11-10, §7.2): when the slide changes, whole photographs slide across, unaltered; there is still no parallax, scaling, drift or dimming of a photograph.

prefers-reduced-motion is honoured absolutely: cross-fades become instant swaps and rotation becomes stepped.

No scroll-triggered reveal animations. On mobile data they read as broken loading rather than as polish.

7.2 Home Hero and Header (founder decision 2026-11-09)

The one decorative exception: the home hero and the header announce the brand on arrival. It runs once, on page load, never on scroll.

- Utility bar (founder decision 2026-11-09, after killstar.com): a 40px --lun-plum-deep bar (founder decision 2026-11-10: 10% lower than the first 44px) above the header shows one fact at a time, centred, in light 15px white type, each fact a link to where it is explained (ships unstitched, dispatch, returns, colour promise). The facts cross-fade (--motion-announcement-fade) every --motion-announcement-interval and loop. It waits while hovered or focused; a quiet pause button at the right edge stops it (WCAG 2.2.2). It scrolls away with the page while the header stays (the group sticks at minus the bar height). Under reduced motion it stands still.
- Header: compact — the logo in the centre of the page, 20% larger than the base wordmark size (founder decision 2026-11-09), the navigation on the left, account and cart icons on the right — with the same side edges as the hero card. The strip and header are sticky together: they stay at the top while the page scrolls, and a hairline settles under the header once the page has moved. Shop and Support carry a chevron that opens a menu panel (founder decision 2026-11-09, after bedrock-one-nu.vercel.app): a --radius-panel --lun-plum-deep panel, as wide as the page container (--container-max), centred under the header. On the left, its entries set large and light; pointing at or focusing one makes it the active entry (in --lun-gold-pale) and shows its small-capitals tag, description and links in the middle, rising in each time (--motion-pane), with two columns of photographs on the right from 1024px. A hairline foot carries a line of ours and a door. Hover opens it; the chevron button opens it from the keyboard; Escape closes it. The panel drops in (--motion-panel). Unlike the reference, it is opaque: no blur or tint over what lies behind it, and the page is not dimmed. WhatsApp is a fixed round button at the bottom right of every page, on every screen. The language choice is hidden for now and the site opens in English (founder decision 2026-11-09; lib/features.ts languageSelector, i18n/routing.ts localeDetection) — the Sinhala and Tamil pages and messages stay complete, so switching it back on restores all three. Phones also keep the bottom bar. The header fades down into place on load (--motion-page). Styling (founder decision 2026-11-10, after secchiariboots.com; layout and content unchanged): at the top of the page the header has generous room above the logo and menu (--space-7 above, --space-5 below from 1024px), drawing in to --space-3 once the page moves (--motion-header); English menu words are in capitals, medium weight, lightly spaced, in ink; a thin --lun-plum line draws in from the left under the word pointed at and goes back to the left when the pointer leaves (--motion-menu).
- Hero slider (founder decision 2026-11-10, after secchiariboots.com): photographs only, no words on them — the founder banners first, then featured sarees, four at most (founder decision 2026-11-10; was five). The slides sit side by side and the row slides across (--motion-hero-slide) every --motion-hero-interval; each photograph is inset from the page edges to the same width as the site content (--container-max, 90vw). Taken from the reference without its parallax and without its dimming of the neighbouring slides (§7.1).
- On the photograph (founder decision 2026-11-13: no dashes): thin previous / next arrows at the bottom right from 768px; phones swipe. No words, dashes, counter, scroll cue, review proof, pause button or pills on the photograph.
- First view (founder decision 2026-11-10, revised the same day): the banner is 80% of the screen below the sticky header (100svh, less the header, --header-h, and the phone bottom bar, times 0.8), never less than 18rem. The utility bar (40px, --utility-h) scrolls away above it and the sliding facts (--marquee-h) start below the fold: the first screen need not show them. Tablets use the desktop logo size so the menu fits beside it.
- Beneath the banner (founder decision 2026-11-10, after secchiariboots.com; revised the same day: one row, 20% smaller): the four facts — ships unstitched, 7-day returns, dispatched in 1 working day, colour-accurate photography — as one row of sliding words running edge to edge, large (--marquee-large) in --lun-plum mixed 62% into the ground (3:1 or better for large text). English is in capitals in the display face with lining figures, alternate facts in a heavier weight; Sinhala and Tamil use the body face. The row drifts on its own (--motion-marquee) and, where the browser supports scroll-linked animation, slides further as the page scrolls. Screen readers read the four facts once, from a list; the moving row is hidden from them. Under reduced motion it stands still.
- Headline (founder decision 2026-11-10): no visible promise, subhead or shop links beneath the banner; the promise stays the page h1 for search engines and screen readers only. After the sliding facts the page goes straight to New arrivals.
- Controls: it advances on its own and waits while hovered or focused; using an arrow or a swipe stops it advancing for good (WCAG 2.2.2).
- prefers-reduced-motion: nothing animates or advances on its own; slides change at once, and the facts stand still.

7.3 Page Background (founder decision 2026-11-09)

Every page background is --lun-surface (white). --lun-ground keeps its sampled value (brand colours are never adjusted) but is no longer used as a page or section background.

7.4 Site Sections and Footer (founder decision 2026-11-09, after theirnibs.com)

The founder asked for the whole site to follow theirnibs.com in layout and motion, with Lunara's own content and colours. Pages are rebuilt in waves; the home page and footer come first.

- Home after the hero, in order: New arrivals as a rail of cards that scrolls sideways and snaps (four across from 1024px, three from 768px, one and a bit on phones), with View all and round arrow buttons — styled after perniaspopupshop.com (founder decision 2026-11-10; rail only, shop cards unchanged): heading in capitals in the body face, View all as plain muted capitals, 2:3 photographs with square corners, then only the name in capitals on one line, the cotton in muted ink and the price (founder decision 2026-11-13: no stock note or jacket on rail cards; shop cards keep them); no zoom on hover (§7.1); ways in as four photograph tiles over solid --lun-gold-pale label bars with an arrow (Plain Cotton, Super Cotton — opening /shop?material=… — Jacket Material, the care guide); the two drapes as two photographs edge to edge, each with its name in white with the plum halo and a gold-pale button; the drape promise set large; reviews; a white panel beside a photograph (getting the jacket stitched; white since 2026-11-10); and a centred word from us (WhatsApp).
- Footer: a band of the four facts with icons on white between hairlines, then Support and Policies columns and the business details on white under a --lun-line hairline (founder decision 2026-11-10: the whole site background is white; was gold-pale), closed by a --lun-gold-deep hairline and the copyright line. Text on gold-pale is --lun-ink, never --lun-ink-muted (contrast).
- Container: site content runs at most --container-max (90vw, a 5vw edge each side) wide, centred, on every page: header, menu panels, home sections, shop, product, cart, footer — the same width as the home hero banner photograph (founder decision 2026-11-10; was 1360px). Only the utility bar and the sliding facts run the full width of the page.
- Section titles: --type-display-l in the display face, --lun-plum-deep. Product names on cards (English) in the display face.
- Motion: headings and words rise softly into place as they scroll into view (--motion-section). Text only: photographs never fade, slide or scale on their own (§7.1). Content is never hidden without JavaScript, and nothing moves under prefers-reduced-motion. The product rail moves only when the customer moves it.
- Not taken from the reference: dimming the page behind menus, and fading photographs in as they load (§7.1).

7.5 Product Page (founder decision 2026-11-13, after eshandlooms.com)

The founder asked for the product page to follow eshandlooms.com in layout and motion, with Lunara's own content and colours, and the gallery left as it is. No lines between the sections (founder decision 2026-11-13): the jacket, the details, the reviews and the related sarees are set apart by space alone.

- Above: a breadcrumb (Home / Shop / the saree) on the left, Prev and Next on the right, in shop order and wrapping round, in small muted capitals.
- Photographs (founder decision 2026-11-13, after secchiariboots.com): from 1024px four photographs show at once, two by two (founder decision 2026-11-13: the first four, the placeholder in any empty place; every photograph stays in the slider below 1024px), each filling a tall 2:3 tile edge to edge (no band round it; founder decision 2026-11-13), --space-2 apart; the gallery takes about 70% of the page container, the details the rest (at least 20rem). The details column is sticky: it stays in view, just under the header, while the photographs scroll past. Choosing a photograph opens it larger, the full height of the screen, in the middle; the page behind is dimmed (--lun-ink at 20%), the photograph never is. Escape, the close button or a click outside closes it. No animation, as in the reference. Below 1024px the slider stays: thumbnails in a column on the left from 768px, dots on phones.
- Beside the gallery (the gallery at most 40rem wide, thumbnails in a column on its left from 768px; from 1024px the gallery and a details column of at most 32rem sit side by side, the gallery on the page container's left edge and the details on its right edge; stacked on phones): reviews summary when there are reviews, the name (--type-display-m, body face, light, ink), the price (--type-display-m, --lun-plum), the cotton, the stock note, the jacket between hairlines with "ships unstitched", then Add to cart as a square --lun-plum-deep button in small spaced capitals (full width on phones), Customise this, and Send me swatches.
- Details (founder decision 2026-11-13, revised the same day): the material, delivery, colour promise and care blocks fold under Send me swatches, in the details column, as an accordion with hairlines and names in small spaced capitals (the first open); the material shows as a ruled table.
- Reviews (founder decision 2026-11-13, after killstar.com; replaces the reviews tab): a centred heading in muted capitals; the average large (--type-display-xl) with --lun-plum stars and "Based on N reviews", beside a bar for each rating from five stars to one (--lun-plum on --lun-line) with its count, a hairline between them from 768px; then each review between hairlines in three columns from 768px: who (an initial in a --lun-gold-pale circle, the name in capitals, the district, "Verified purchase"), what (stars, the words, photos as taken, any reply from Lunara under a gold rule) and the date. With no reviews, a short line says so. Not taken from the reference: search, filters and "was this helpful?" votes.
- Related (founder decision 2026-11-13): "You might also like" as the same rail and cards as New arrivals on the home page (§7.4): heading on the left, View all and round arrows on the right, up to eight sarees that scroll sideways.
- Bar: once the page's own Add to cart has scrolled up out of view, a white bar slides up from the bottom (--motion-sticky-bar) with the photograph, the name, the price and a round --lun-plum Add to cart that presses the page's own button (one add-to-cart path, one confirmation); it slides away when the button comes back. On phones it sits above the bottom bar; the WhatsApp button rises above it.
- Not taken from the reference: the quantity box beside Add to cart and Buy now (not part of Lunara's product), the instalment lines, and the related carousel (a grid instead).

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
