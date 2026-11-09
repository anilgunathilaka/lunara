# Lunara Sarees - Component Library

LUNARA SAREES

❋

DOCUMENT 3 OF 6

Component Library

Component inventory, APIs, states, and composition rules

Version 2.0  ·  July 2026

Built from the tokens in UI Design Specification v1.0

Behaviour governed by UX Specification v2.0

Status: Draft for approval

Table of Contents

1. Library Principles

| # | Principle | Consequence |
| --- | --- | --- |
| 1 | Tokens only | No component contains a raw hex, px or ms value. Everything resolves to a token from Document 2. A lint rule fails the build otherwise. |
| 2 | Behaviour lives in Document 1 | A component implements the interaction rules already specified in the UX document. It does not invent behaviour. |
| 3 | Accessible by construction | Keyboard operation, focus visibility, ARIA roles and 44px touch targets are built into the component, not added at review. |
| 4 | Mobile-first | Every component is designed and built at 360px before any wider treatment. |
| 5 | Composition over configuration | Prefer small components composed together over one component with fifteen props. |
| 6 | Product imagery is sacred | Any component rendering a product photograph applies no filter, overlay, gradient or tint. This is a colour-accuracy liability, not a style preference. |

1.1 Naming and Structure

components/

├── primitives/     Button · Input · Select · Checkbox · Radio

│                   Badge · Tag · Divider · Icon · Spinner

├── brand/          SectionMarker · MotifDivider · Wordmark

├── product/        ProductCard · ProductGallery · SwatchChip

│                   SwatchGrid · FabricBlock · JacketBlock

│                   OpacityRating · PriceDisplay · StockState

├── configurator/   PreviewCanvas · RotationControl · HonestyNote

│                   DesignPicker · MaterialSelector · ColourPicker

│                   DrapeToggle · SuggestedStrip · ConfiguratorBar

│                   PriceAttribution

├── commerce/       CartLine · CartSummary · CheckoutStep

│                   PaymentMethod · UnstitchedReminder

│                   DeliveryEstimate

├── feedback/       Toast · InlineError · EmptyState

│                   LoadingSkeleton · FallbackNotice

└── layout/         Header · Footer · MobileNav · WhatsAppAction

Accordion · SlideOver · Modal

2. Primitives

2.1 Button

<Button

variant = 'primary' | 'secondary' | 'tertiary' | 'danger'

size    = 'sm' | 'md' | 'lg'

fullWidth?  loading?  disabled?  iconLeft?  iconRight?

onClick

>

| Variant | Resting | Hover | Active | Disabled |
| --- | --- | --- | --- | --- |
| primary | --lun-plum bg, white text, --radius-m | --lun-plum-deep bg | --lun-plum-deep, 1px inset | 40% opacity, no pointer |
| secondary | transparent bg, 1px --lun-plum border, plum text | --lun-plum at 6% bg | --lun-plum at 12% bg | 40% opacity |
| tertiary | no border, plum text, underline on hover | underline | underline, --lun-plum-deep | 40% opacity |
| danger | --lun-danger bg, white text | darken 8% | darken 12% | 40% opacity |

| Size | Height | Padding | Type token |
| --- | --- | --- | --- |
| sm | 36px | --space-3 horizontal | --type-body-s |
| md | 44px | --space-4 horizontal | --type-body |
| lg | 52px | --space-5 horizontal | --type-body-l |

| Rule | Specification |
| --- | --- |
| Minimum height | 44px on any touch surface, regardless of size prop. The sm variant is desktop-only. |
| Loading | Label is replaced by a spinner; width is preserved to prevent layout shift. Button is disabled while loading. |
| Focus | 2px --lun-gold outline at 2px offset. Never removed. |
| Label voice | Active verb naming what happens: 'Add to cart', 'Save this design'. Never 'Submit' or 'OK'. |
| Gold prohibition | Gold is never a button background — white text on gold fails contrast at 2.1:1. |

2.2 Input, Select, Checkbox, Radio

| Component | Specification |
| --- | --- |
| Input | 44px height, 1px --lun-line border, --radius-s. Focus: 2px --lun-plum border plus gold outline. Error: 1px --lun-danger border with the message rendered below in --type-body-s. Label always visible above the field — placeholders are never used as labels. |
| Select | Matches Input metrics. Native select on mobile for reliability; custom listbox on desktop only where genuinely needed. |
| Checkbox | 20×20px visual, 44×44px hit area, --radius-s. Checked: --lun-plum fill, white check. Focus ring identical to Button. |
| Radio | 20×20px, --radius-full. Selected: --lun-plum ring with a filled centre dot. |
| Validation | Errors appear on blur, never on every keystroke. Messages state what to do: 'Enter a 10-digit phone number', not 'Invalid input'. |

2.3 Brand Primitives

<SectionMarker>          2px × 32px gold rule above a heading

<MotifDivider>           hairline — ❋ — hairline, max once per section

<Divider tone='line'|'gold'>   1px full-width rule

These three carry the signature device from Document 2. MotifDivider is deliberately limited to once per screen section — the motif loses meaning through repetition, and it never appears inside the configurator preview area.

3. Product Components

3.1 SwatchChip

The most-used component in the product and the one most exposed to the colour-accuracy promise. Its correctness matters more than its complexity suggests.

<SwatchChip

colourHex        true sampled fabric colour

textureUrl?      texture tile, overlaid at low opacity for weave

label            colour name, e.g. 'Deep teal'

materialName     e.g. 'Voile'

state = 'default' | 'selected' | 'disabled' | 'low-stock'

size  = 'sm' 32px | 'md' 44px | 'lg' 56px

onSelect

>

| State | Rendering | Accessibility |
| --- | --- | --- |
| default | Colour fill, 1px --lun-line border, --radius-s. | role=radio, aria-checked=false, label announces material and colour. |
| selected | Gold 2px ring at 2px offset, OUTSIDE the chip. The colour is never overlaid. | aria-checked=true. |
| disabled | 40% opacity plus a 1px diagonal line across the chip. | aria-disabled=true, reason announced: 'Out of stock'. |
| low-stock | Default rendering plus a small gold dot at the upper right. | Announced as 'Low stock' after the colour name. |

| Rule | Reason |
| --- | --- |
| The selection ring sits outside the chip, never over it. | An overlay obscures the exact colour the customer is trying to judge. |
| The border is a neutral hairline, never a tinted one. | A coloured border shifts perception of the adjacent colour. |
| Colour is never the sole indicator of state. | Accessibility requirement, and disabled swatches must be distinguishable in greyscale. |
| Hit area is at least 44×44px even at size sm. | Swatch grids are the densest interactive surface in the product. |

3.2 SwatchGrid

<SwatchGrid

items      SwatchChip[]

selectedId

columns    { mobile: 5, tablet: 7, desktop: 8 }

groupBy?   'material' | 'colourFamily'

onSelect

>

Implements a roving-tabindex radiogroup: arrow keys move between chips, Enter or Space selects.

Gap is --space-2. Out-of-stock chips remain in place rather than being removed, so the grid does not reflow as stock changes.

When grouped, each group carries a --type-label heading.

3.3 ProductCard

<ProductCard

image  drape photo, 4:5, NO filter or overlay

name · price · jacketMaterialName · jacketSwatchHex

stockState = 'in' | 'low' | 'out'

href

>

| Zone | Content |
| --- | --- |
| Image | 4:5 drape photograph on --lun-surface. No overlay, no hover zoom, no gradient. |
| Name | Design name in --type-heading, --lun-plum, two lines maximum. Material shown beneath as a --type-label. |
| Price | --type-price, tabular figures. Always the all-in price for saree plus jacket material. |
| Jacket row | Small swatch chip plus material name — the jacket is never left implicit. |
| Stock | Badge only when low or out. In-stock is the silent default; announcing it on every card is noise. |

3.4 ProductGallery

| Requirement | Specification |
| --- | --- |
| Asset order | Full drape → pallu detail → border close-up → texture macro → colour reference frame → drape video. |
| Reference frame | Visibly labelled as the colour reference in the active language. Never hidden behind a 'more images' interaction. |
| Mobile | Full-bleed, swipeable, with dot indicators. Pinch-to-zoom enabled. |
| Desktop | Main image with a thumbnail strip beneath. Click-to-zoom rather than hover-zoom. |
| Video | Inline, muted, loops, with a visible play control. Never autoplays with sound. |
| Prohibition | No filter, overlay, gradient, watermark or animated transition on any product image. |

3.5 FabricBlock, JacketBlock, OpacityRating

<FabricBlock material='plain'|'super' gsm lengthMetres opacity />

<JacketBlock materialName swatchHex pieceLengthMetres />   ← always states UNSTITCHED

<OpacityRating value='opaque' | 'semi-sheer' | 'sheer' />

| Component | Rules |
| --- | --- |
| FabricBlock | Renders cotton material (Plain or Super), GSM, length in metres and the opacity rating as a labelled list. Every field is mandatory — no field may be omitted because the data is missing. |
| JacketBlock | MUST render the phrase 'ships unstitched' in the active language, at --type-body weight 600, never in fine print. This is the product's most likely misunderstanding. |
| OpacityRating | A three-segment indicator with a plain-language label. 'Semi-sheer' prevents a return; no Sri Lankan competitor publishes this, and it costs nothing. |

4. Configurator Components

These implement Flow B from Document 1. Interaction rules UX-C1 through UX-C12 are binding on this section.

4.1 PreviewCanvas

<PreviewCanvas

designId · materialId ('plain'|'super') · sareeColourId

jacketMaterialId · jacketColourId

drapeStyle = 'saree' | 'osariya'

frameIndex          current rotation frame

onRotate            drag / swipe / arrow keys

onRenderFailure     → triggers FallbackNotice

>

Since 2026-11-09 (docs/4-architecture.md §5.0) the preview is a 3D model drawn in the browser by ConfiguratorViewer; it receives the selection (pattern, saree colour, material, jacket, drape) instead of a frame URL, and a rotation angle replaces frameIndex. The requirements below are unchanged.

| Requirement | Specification | UX rule |
| --- | --- | --- |
| Update latency | Under 500ms from selection to rendered change. | UX-C4 |
| Transition | Cross-fade at --motion-preview. Never a flicker, reload or spinner between states. | UX-C4 |
| Rotation | Drag on pointer, swipe on touch, arrow keys when focused. One-to-one with input, never a played animation. | UX-C8 |
| Visible controls | Arrow affordances present as a discoverable fallback for drag. | UX-C8 |
| Failure | On render failure, swap to static paired imagery and surface FallbackNotice. Purchase remains available. | UX-C9 |
| Drape switch | Re-renders in the new drape while preserving design, material, colour and jacket selections. | UX-C3 |
| Four-axis re-render | A change to design, material, colour, jacket or drape MUST re-render. Five inputs, one canvas. | UX-C1a |
| Surface | Pure --lun-surface. No border, shadow, motif or decoration of any kind. | Document 2 §5.3 |
| Reduced motion | Cross-fade becomes an instant swap; rotation becomes stepped. | Document 2 §7.1 |

4.2 HonestyNote

Small component, disproportionate importance. It carries the boundary of the colour-accuracy promise.

<HonestyNote

sareeReferenceHref     → true daylight photography

jacketReferenceHref    → true daylight photography

/>

Renders, in the active language:

ⓘ This is an approximate view. See the real photographs of

[saree material] and [jacket material] for true colour.

| Rule | Specification |
| --- | --- |
| Persistence | Always visible adjacent to the preview. Never dismissible, never a tooltip, never collapsed into a footnote. |
| Links | One tap to the true photography for each currently selected material. Links update as selections change. |
| Tone | Factual and calm. --lun-info on --lun-gold-pale at 20%. It informs; it does not alarm. |
| Rationale | Section 6.1 of the PRD scopes the colour guarantee to photography only. That exclusion must be visible at the moment of choosing, or the brand's best feature becomes its largest complaint source. |

4.2a DesignPicker, MaterialSelector and ColourPicker

Three of the four configurator axes. Each is independently selectable and each triggers a re-render; design and material additionally move the price.

<DesignPicker

designs · selectedDesignId

renderInColour     tiles render in the CURRENT colour

onSelect

/>

<MaterialSelector

value = 'plain' | 'super'

priceDelta         difference for the CURRENT design

onChange

/>

<ColourPicker

colours · selectedColourId

availableForDesign   colours valid for the current design

onSelect

/>

| Component | Rules | UX rule |
| --- | --- | --- |
| DesignPicker | Tiles MUST render each design in the currently selected colour, so the choice is made in context rather than against a generic sample. Selecting a design preserves the current colour where that colour is available for the new design. | UX-C1b |
| MaterialSelector | Two options only. The Super option MUST display the price difference for the current design BEFORE selection, e.g. 'Super Cotton +LKR 900'. The delta recomputes when the design changes. | UX-C10b |
| ColourPicker | Wraps SwatchGrid. Colours unavailable for the current design are disabled with the reason stated, not hidden — hiding them makes the range look smaller than it is. | UX-C5 |
| All three | Independently selectable in any order. Changing one never resets another. | UX-C1a |

4.2b PriceAttribution

Small component carrying a trust obligation. Price moves live across four axes; this makes each movement legible.

<PriceAttribution

price · previousPrice

cause = 'design' | 'material' | 'jacket'

causeLabel      e.g. 'Super Cotton'

/>

Renders inline beside the price:

LKR 8,900   ▲ Super Cotton +900

| Rule | Specification |
| --- | --- |
| Placement | Inline, adjacent to the price. Never a toast — a toast is dismissible and easy to miss, and the attribution must sit where the number changed. |
| Persistence | Visible for a few seconds after the change, then fades. The price itself remains. |
| Direction | Increases and decreases are both attributed. A price drop with no explanation is as confusing as a rise. |
| Rationale | UX-C10a. An unexplained price movement reads as arbitrary or as a hidden charge, and undoes the trust the rest of the interface is built to earn. |

4.3 DrapeToggle

<DrapeToggle value='saree'|'osariya' onChange explainerHref />

| Rule | Specification |
| --- | --- |
| Labels | Both options labelled in the active language. Osariya additionally shown in Sinhala script as ඔසරිය. |
| Indicator | Active option carries the gold 2px rule beneath, per the signature device. |
| State preservation | Switching never clears design, material, colour or jacket selections. |
| Explainer | A tertiary link to a short explanation of Osariya. Many younger buyers do not know the same saree can be draped either way. |
| Analytics | Toggle usage is tracked. PRD Section 8 treats it as a strategic signal for the Phase 4 bridal decision. |

4.4 Axis Navigation and SuggestedStrip

| Component | Specification |
| --- | --- |
| Axis navigation | Tabbed on mobile (Design / Material / Colour / Jacket / Drape), stacked panels on desktop. Each tab hosts its own picker. Switching tabs never loses scroll position or any selection. |
| SuggestedStrip | Horizontally scrollable strip of curated pairings. Selecting one loads it as the working design, from which anything can be changed. Refreshable without losing the current design. Implements UX-C11 and mitigates the choice-paralysis risk. |

4.5 ConfiguratorBar

<ConfiguratorBar

price · currency='LKR'

onAddToCart · onSave · onShare · onRequestSwatches

canAddToCart      false when any selection is out of stock

/>

On mobile, pinned to the viewport bottom with --elev-1 and a 1px top hairline.

Price updates live with every selection, per UX-C10. It is computed from the selected design and material together, and every movement is attributed via PriceAttribution.

Save and Share never require an account, per UX-C12.

5. Commerce Components

5.1 CartLine

| Requirement | Specification |
| --- | --- |
| Configured designs | MUST render a thumbnail of the actual combination, never a generic placeholder. |
| Line detail | MUST name the design, the cotton material, the saree colour, the jacket material and colour, and the drape style. All five, on the line. |
| Edit action | 'Edit this design' returns to the configurator with full state intact. |
| Unstitched note | Visible on every line carrying a saree. |
| Quantity | Editable inline. Removal requires no confirmation dialogue but offers an undo toast. |

5.2 UnstitchedReminder

The single most important commerce component. It prevents the product's most likely misunderstanding.

<UnstitchedReminder

variant = 'inline' | 'checkout'

acknowledged        checkout variant only

onAcknowledge

/>

| Variant | Behaviour |
| --- | --- |
| inline | Displayed on product detail and cart lines. Informational, no interaction. |
| checkout | Requires explicit acknowledgement via checkbox before the order can be placed. Cannot be pre-checked. Cannot be skipped. |

Three placements are required by Document 1: the listing, checkout, and the printed card in the parcel. Three is not excessive for the misunderstanding most likely to generate a return.

5.3 PaymentMethod and DeliveryEstimate

| Component | Specification |
| --- | --- |
| PaymentMethod | Four options rendered with equal visual weight: cash on delivery, bank transfer, LankaQR, card. Bank transfer is NOT hidden behind an 'other methods' disclosure — it is the established default for social-commerce orders in this market. The COD fee is itemised on the option itself, with its waiver on prepayment stated. |
| DeliveryEstimate | Derived from the selected district. Renders an honest range, never a single optimistic national figure. Shows the dispatch cut-off time and the fee. Appears in cart and at checkout, never only at the final step. |

6. Feedback and Layout Components

6.1 Feedback

| Component | Specification |
| --- | --- |
| Toast | Bottom-centre on mobile, bottom-right on desktop. Auto-dismisses after 4s except where it carries an undo action. Announced via aria-live=polite. |
| InlineError | Rendered directly beneath the offending field in --lun-danger. States what to do, not merely that something is wrong. |
| EmptyState | Always offers an action. Cart empty offers both doors — curated shop and configurator — with equal weight. |
| LoadingSkeleton | Shape-matched to the content it replaces. The configurator loads progressively: interface and pickers first, preview last with a skeleton in its place. |
| FallbackNotice | Shown when the 360° renderer fails. States plainly that rotation is unavailable and that photography is shown instead. Never pretends nothing is wrong. |

6.2 Layout

| Component | Specification |
| --- | --- |
| Header | Wordmark, five primary items, language selector, cart count, WhatsApp. 'Design Your Own' is visually distinguished — it is the differentiator and must not read as one item among five. |
| MobileNav | Bottom bar: Shop, Design, Cart, Menu. Persistent across all pages. |
| WhatsAppAction | Floating on mobile, header and footer on desktop. Reachable from every page without scrolling. |
| SlideOver | Used for add-to-cart confirmation. Confirms without navigating away from the product, per Flow A step 3. |
| Accordion | Product detail secondary blocks on mobile. First panel open by default. |
| Footer | Facts band with icons, then --lun-gold-pale ground (docs/2-ui.md §7.4). Support links, policies, registration number, address, contact number, language selector. |

7. Quality Standards

7.1 Definition of Done

A component is complete only when every item below is true.

| # | Criterion |
| --- | --- |
| 1 | Renders correctly at 360px, 768px, 1024px and 1440px. |
| 2 | Fully keyboard operable with a visible focus indicator. |
| 3 | Correct ARIA roles, labels and live-region behaviour. |
| 4 | Touch targets at least 44×44px. |
| 5 | All states implemented: default, hover, active, focus, disabled, loading, error, empty. |
| 6 | Zero raw hex, px or ms values — tokens only. |
| 7 | Text renders correctly in Sinhala, Tamil and English, including line-height adjustment. |
| 8 | Honours prefers-reduced-motion. |
| 9 | Colour is never the only means of conveying state. |
| 10 | If it renders product imagery: no filter, overlay, gradient or tint. |
| 11 | Meets WCAG AA contrast in every state. |
| 12 | Behaviour matches the governing rule in Document 1, cited by rule ID. |

7.2 Build Order

| Wave | Components | Unblocks |
| --- | --- | --- |
| 1 — Foundation | Tokens, Button, Input, Select, Checkbox, Radio, Divider, Icon, SectionMarker, MotifDivider | Everything |
| 2 — Catalogue | ProductCard, ProductGallery, SwatchChip, FabricBlock, JacketBlock, OpacityRating, PriceDisplay, StockState | Phase 1 shop |
| 3 — Commerce | CartLine, CartSummary, CheckoutStep, PaymentMethod, UnstitchedReminder, DeliveryEstimate | Phase 1 checkout |
| 4 — Layout & feedback | Header, Footer, MobileNav, WhatsAppAction, SlideOver, Accordion, Toast, InlineError, EmptyState, LoadingSkeleton | Phase 1 launch |
| 5 — Configurator | SwatchGrid, PreviewCanvas, RotationControl, HonestyNote, DesignPicker, MaterialSelector, ColourPicker, PriceAttribution, DrapeToggle, SuggestedStrip, ConfiguratorBar, FallbackNotice | Phase 2 |

Waves 1 to 4 deliver the entire Phase 1 commerce business. Wave 5 is the Phase 2 configurator. This ordering means revenue is never gated on the hardest build — the sequencing decision made in PRD Section 7.
