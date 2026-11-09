# Lunara Sarees - UX Specification

LUNARA SAREES

❋

DOCUMENT 1 OF 6

UX Specification

Information architecture, user flows, and interaction behaviour

Version 2.0  ·  July 2026

Aligned to PRD v3.0

Status: Draft for approval

The controlling document for all six. Where any other document conflicts with this one, this one wins.

Table of Contents

1. Purpose and Principles

1.1 What This Document Governs

This specification defines how Lunara Sarees behaves: what screens exist, how a customer moves between them, what happens at every decision point, and what the system does when things go wrong. It is the controlling UX reference for the build.

It deliberately does not specify colour, type or spacing — those live in Document 2. It does not specify component APIs — those live in Document 3. Where this document says 'a primary action', Document 2 decides what that looks like and Document 3 decides how it is built.

1.2 The Product in One Line

Lunara sells cotton sarees supplied with unstitched jacket material, in two cotton qualities: Plain Cotton and Super Cotton. A customer can buy a combination Lunara has curated, or assemble her own — choosing design, material, colour, jacket and drape style — and see it rendered on a 360° model, with the price updating live, before she buys. Nothing is stitched and no measurements are taken.

1.3 Design Principles

| # | Principle | What it means in practice |
| --- | --- | --- |
| 1 | Certainty over persuasion | The category's problem is doubt, not lack of desire. Every screen should reduce uncertainty about colour, fabric, what is included, and when it arrives. No screen should use urgency or scarcity theatre to compensate. |
| 2 | Show, never describe | A colour name is not a colour. A fabric adjective is not a fabric. Wherever a thing can be shown — a swatch, a drape video, a rendered pairing — show it and let the words support it. |
| 3 | The honest preview | The configurator makes a visual promise. It must state its own limits plainly, at the moment of choosing, and route the customer to true photography. A quiet approximation is worse than no preview. |
| 3b | Price moves in the open | Price changes as she selects. Every movement must be legible at the moment it happens, naming what caused it. Price that shifts without explanation reads as arbitrary or as a hidden charge, and undoes the trust everything else is built to earn. |
| 4 | Two doors, one house | The curated catalogue and the configurator are equal front doors, not a basic path and an advanced path. A customer must be able to cross between them without losing her work. |
| 5 | Mobile is the product | The majority of traffic arrives on a mid-range Android over mobile data. A feature that only works well on desktop does not work. |
| 6 | Nothing is a surprise on delivery | That the jacket ships unstitched must be stated on the listing, at checkout, and in the parcel. Three times is not excessive for the single most likely misunderstanding. |
| 7 | Say it in her language | Sinhala, Tamil and English are equal. Language is chosen once and remembered. |

2. Information Architecture

2.1 Site Map

HOME

│

├── SHOP  (curated pairings — Path A)

│     ├── All sarees

│     ├── By occasion    · Office · Everyday · Festive · Temple

│     ├── By material    · Plain Cotton · Super Cotton

│     ├── By design

│     ├── By colour

│     └── Product detail page  ──────────┐

│                                        │

├── DESIGN YOUR OWN SAREE  (Path B)      │  cross-links

│     ├── Configurator canvas            │  both ways

│     ├── Saved designs                  │

│     └── Shared design view (public) ───┘

│

├── JACKET MATERIAL  (standalone line)

│     ├── All jacket materials

│     └── Jacket detail page

│

├── CART → CHECKOUT → ORDER CONFIRMED

│

├── ACCOUNT  (optional, post-purchase)

│     ├── Orders & tracking

│     ├── Saved designs

│     └── Addresses

│

└── SUPPORT

├── Delivery

├── Returns & exchange

├── Colour accuracy promise

├── Caring for cotton

├── How to get your jacket stitched

└── Contact  (WhatsApp · phone · address)

2.2 Navigation Rules

| Rule | Specification |
| --- | --- |
| Primary navigation | Five items maximum: Shop, Design Your Own, Jacket Material, Support, Cart. On mobile these collapse to a bottom bar of four (Shop, Design, Cart, Menu) plus a persistent WhatsApp affordance. |
| Account icon | A person icon beside the cart (founder decision 2026-11-09) — an action, not a sixth navigation item. It opens sign-in; once signed in, staff land in the operations panel and customers in Orders & tracking. It never asks anyone to create an account before buying: guest checkout stays the only required path. |
| Design Your Own placement | MUST sit in primary navigation, visually distinguished from the other items. It is the differentiator; burying it in a submenu wastes the entire Phase 2 investment. |
| Cart persistence | Cart contents survive across sessions on the same device for at least 30 days. A configured design in the cart retains its full selection state. |
| Language selector | Present in the header on every page. Selection persists across sessions. Never resets on navigation. |
| WhatsApp affordance | Persistent and reachable from every page without scrolling. On mobile it is a floating action; on desktop it sits in the header and repeats in the footer. |
| Breadcrumbs | On product and jacket detail pages only. Not on the configurator, which is a canvas rather than a location in a hierarchy. |

2.3 Entity Model as the Customer Understands It

The customer does not think in SKUs. She thinks in three things, and the interface should reflect exactly these:

| What she thinks | What the system holds | Where it appears |
| --- | --- | --- |
| "This design" | A pre-defined pattern, recolourable across the available colour range. Independent of material. | Shop, configurator design picker, product detail |
| "Plain or Super" | One of two cotton qualities. Affects texture, fall and price — never length or drape compatibility. | Configurator material selector, product detail, price matrix |
| "This colour" | A colour applied to the chosen design. Because designs are recolourable, colour is an independent choice. | Configurator colour picker, product detail |
| "This jacket fabric" | A jacket material in a specific colourway, with piece length, composition and swatch imagery. | Configurator jacket picker, jacket material catalogue, paired listings |
| "The two of them together" | A pairing. Either curated by Lunara (a listing) or assembled by her (a configured design). | Product detail, configurator canvas, cart, order |

3. Core User Flows

Six flows carry the product. Each is specified as steps, decision points, and failure handling.

3.1 Flow A — Buy a Curated Pairing

The expected majority path at launch. Optimised for speed and confidence, not exploration.

Entry: Home · Shop · social link · search

│

▼

[1] Shop grid

Filters: design · colour · material · occasion · price · opacity

Each card: drape photo, name, price, jacket material named

│

▼

[2] Product detail page

Gallery (5 assets + drape video)  ·  Colour reference frame

Fabric block: material (Plain/Super) · GSM · length · opacity

Jacket block: material named · UNSTITCHED stated

Price · delivery estimate · returns promise · reviews

┌── secondary action: 'Customise this' → Flow B

└── secondary action: 'Send me swatches'

│

▼

[3] Add to cart  →  slide-over confirms, does NOT navigate away

│

▼

[4] Cart  →  [5] Checkout  →  [6] Order confirmed

| Step | Must be true | Failure handling |
| --- | --- | --- |
| 1 | Filters apply without a page reload and are reflected in the URL so results can be shared and restored. Result count always visible. | No results: offer to relax the narrowest filter by name, e.g. 'No voile in emerald — show all voile?' Never a dead end. |
| 2 | Jacket material named and 'ships unstitched' stated above the fold on mobile. Price is total for saree plus jacket material. | Out of stock: show the item, disable the buy action, offer a back-in-stock alert and surface three genuinely similar alternatives. |
| 3 | Adding to cart never navigates away from the product. A slide-over confirms and offers 'View cart' or 'Keep shopping'. | Stock lost between view and add: state it plainly at the moment of failure, do not silently fail. |

3.2 Flow B — Design Your Own Saree

The differentiating flow. Its job is to make a customer confident about a pairing she assembled herself, and to be honest about what the preview can and cannot promise.

Entry: nav 'Design Your Own' · PDP 'Change the jacket' · shared link

│

▼

[1] Opening state — NOT an empty canvas

A curated combination is pre-loaded and rendered.

Caption: 'Start here, or change anything.'

Rationale: four axes from zero is paralysing.

│

├──[2a] Choose saree DESIGN        → model + price update

├──[2b] Choose MATERIAL            → model + price update

│         Plain Cotton | Super Cotton

├──[2c] Choose saree COLOUR        → model updates

├──[2d] Choose JACKET material+colour → model + price update

└──[2e] Choose DRAPE               → model updates

│         Saree | Kandyan Osariya

│        (any order; each updates the model in < 500ms)

▼

[3] 360° model preview

Drag / swipe to rotate · pallu and back reachable

PERSISTENT honesty note + link to true photography

LIVE PRICE with attribution for every change

│

├── 'Send me swatches'      → swatch request

├── 'Save this design'      → saved designs

├── 'Share for an opinion'  → shareable link

└── 'See real photographs'  → true daylight gallery, modal

│

▼

[4] Add to cart  →  Flow A steps 4-6 (identical from here)

3.2.1 Configurator Interaction Rules

| ID | Rule | Reason |
| --- | --- | --- |
| UX-C1 | The configurator MUST open with a pre-loaded curated combination, never an empty state. | Choice paralysis is the primary risk across four axes. A starting point converts far better than a blank canvas. |
| UX-C1a | Design, material, colour and jacket MUST be independently selectable in any order. Changing one never resets another. | Four axes only feel like control if they are genuinely independent. Forced ordering makes it feel like a wizard. |
| UX-C1b | Selecting a design MUST preserve the current colour where that colour is available for the new design. | Designs are recolourable. Losing her colour on a design change is gratuitous work. |
| UX-C2 | Saree and jacket selection MUST be independent. Any jacket may pair with any saree design, material or colour. | This is the product promise. No artificial compatibility restrictions. |
| UX-C3 | Changing drape style MUST preserve design, material, colour and jacket selections. | Losing her work on a toggle is the fastest way to lose the customer. |
| UX-C4 | Preview MUST update in under 500ms of a selection change, with an optimistic transition rather than a spinner. | Latency here reads as the product being broken, not slow. |
| UX-C5 | Out-of-stock designs, materials, colours and jackets MUST be visibly disabled in every picker, never selectable. | Letting her design something unbuyable is worse than not offering the choice. |
| UX-C6 | The honesty note MUST be persistently visible near the preview, not in a dismissed tooltip or a footnote. | Section 6.1 of the PRD scopes the colour guarantee to photography only. That exclusion has to be visible at the moment of choosing. |
| UX-C7 | 'See real photographs' MUST be reachable in one tap from the preview for both the selected saree and the selected jacket. | The route from approximation to truth must be immediate. |
| UX-C8 | Rotation MUST work by drag on desktop and swipe on touch, with visible arrow controls as a fallback. | Not every customer will discover drag-to-rotate. |
| UX-C9 | On failure of the 360° renderer, the interface MUST fall back to static paired imagery and remain fully purchasable. | The customer must never be blocked from buying by a rendering failure. |
| UX-C10 | Live price MUST update with each selection. Price is computed from the selected design and material together. | Price revealed at checkout is the classic abandonment trigger identified in the market research. |
| UX-C10a | When price changes, the interface MUST name what caused it — the design or the material — at the moment of change. | An unexplained price movement reads as arbitrary or as a hidden charge. Attribution is what makes live pricing feel honest rather than slippery. |
| UX-C10b | The material selector MUST show the Plain-to-Super price difference for the current design before she switches. | The upgrade decision should be made with the cost visible, not discovered after. |
| UX-C11 | Suggested pairings MUST be offered as a browsable strip, refreshable without losing the current design. | Serves the customer who wants inspiration rather than authorship. |
| UX-C12 | A configured design MUST be saveable and shareable by link without requiring an account. | Forced registration before value is delivered is a documented abandonment cause. |

3.2.2 The Osariya Toggle

Kandyan Osariya uses the same materials and the same saree length as standard drape. The toggle is a visualisation change only — it never alters stock, price or the item shipped.

| Aspect | Behaviour |
| --- | --- |
| What changes | The rendered drape on the model. The 360° sequence switches to the Osariya capture. |
| What does not change | Design, material, colour or jacket selection; price; stock; SKU; or anything about the physical item shipped. |
| Labelling | Both options MUST be labelled in all three languages, with Osariya also shown in Sinhala script as ඔසරිය. |
| Supporting content | A short explainer link: what Osariya is, and that the same saree can be draped either way. Many younger buyers do not know this. |
| Analytics | Toggle usage MUST be tracked. PRD Section 8 treats it as a strategic signal for the Phase 4 bridal decision. |

3.3 Flow C — Buy Jacket Material Alone

Entry: nav 'Jacket Material' · PDP cross-link · post-purchase email

│

▼

[1] Jacket grid — filter by colour, material, price

│

▼

[2] Jacket detail

Swatch macro · texture close-up · composition · piece length

'Ships unstitched' stated

'See this against a saree' → opens configurator, jacket pre-selected

│

▼

[3] Add to cart → checkout

Delivery rule for low-value orders applied and explained

Commercial note: jacket material is a low-value, high-frequency line. Delivery economics must be stated on the listing itself — a customer who discovers a delivery fee larger than the item at checkout will not return.

3.4 Flow D — Checkout

[1] Cart

Line items: configured designs show a preview thumbnail

Editable quantity · remove · 'edit this design' → configurator

Delivery estimate and fee shown HERE, not later

│

▼

[2] Details        — guest by default; no account required

Name · phone · delivery address · district

│

▼

[3] Delivery       — zone estimate from district

Optional: 'I need this by [date]' (advisory, not a promise)

│

▼

[4] Payment        — COD · bank transfer · LankaQR · card

COD fee shown and explained; waived on prepayment

│

▼

[5] Review         — final summary

⚠ UNSTITCHED REMINDER, acknowledged explicitly

│

▼

[6] Confirmed      — order number, SMS + WhatsApp sent

| Step | Rules |
| --- | --- |
| Cart | Configured designs MUST render a thumbnail of the actual combination, not a generic placeholder. 'Edit this design' MUST return to the configurator with state intact. |
| Details | Guest checkout is the default and only required path. Account creation is offered after the order is placed, pre-filled, as a convenience. |
| Delivery | Zone-based estimate derived from district. Honest ranges, never a single optimistic national figure. The event-date field is advisory and MUST be labelled as such — it helps prioritise packing but is not a contractual promise. |
| Payment | Bank transfer is first-class, not hidden behind 'other methods'. It is the established default for social-commerce orders in this market. COD fee is itemised and its waiver on prepayment stated. |
| Review | The unstitched reminder MUST require an explicit acknowledgement — a checkbox or equivalent — not merely display. This is the single most likely misunderstanding in the product. |
| Confirmed | Order number, itemised summary, delivery estimate, and what happens next. Confirmation sent by SMS and WhatsApp; email is supplementary, never the only channel. |

3.5 Flow E — Post-Purchase

| Trigger | Channel | Content |
| --- | --- | --- |
| Order placed | SMS + WhatsApp | Confirmation, order number, delivery estimate, contact number. |
| Packed | WhatsApp | Brief note that the order is packed and dispatching. |
| Dispatched | SMS + WhatsApp | Courier, tracking number, revised estimate if changed. |
| Out for delivery | SMS | Expected window and, for COD, the amount to have ready. |
| Delivered + 1 day | WhatsApp | Receipt check, cotton care link, returns window reminder, and a link on getting the jacket stitched. |
| Delivered + 3 days | WhatsApp | Satisfaction check; offer of help. |
| Delivered + 14 days | WhatsApp + email | Photo review request. |
| Delivered + 45 days | Email | Relevant new arrivals; standalone jacket material prompt. |

3.6 Flow F — Return or Exchange

Entry: printed card in parcel · Support page · WhatsApp

│

▼

[1] Start a return — order number + phone, no login required

│

▼

[2] Choose reason

Colour differs from photograph  → free, Lunara collects

Damaged or defective            → free, Lunara collects

Wrong item sent                 → free, expedited replacement

Changed my mind                 → 7 days, customer pays return

Want a different colour         → exchange, difference settled

│

▼

[3] Confirmation — what happens, when, and who collects

│

▼

[4] Resolution — refund to original method within stated days

Because nothing is personalised, all returned stock is resellable. Lunara can afford genuine generosity here, and the market research identifies published returns as one of four wide-open competitive gaps. The interface should make the policy feel easy, not defended.

4. Screen Specifications

4.1 Home

| Zone | Content | Notes |
| --- | --- | --- |
| Hero | The configurator's promise, shown rather than described: a live or looping demonstration of a pairing changing on the model. | The hero is the thesis. Lunara's thesis is 'see it before you wear it', so the hero must show a combination changing. |
| Two doors | Two equal entry points: 'Shop curated pairings' and 'Design your own'. | Equal visual weight. Neither is the advanced option. |
| Trust strip | Colour promise · 7-day returns · dispatch speed · WhatsApp. | Above the fold on mobile. These four facts answer the category's biggest doubts. |
| New arrivals | Six to eight recent pairings. |  |
| Osariya feature | A single panel showing the same saree in both drapes. | Culturally distinctive and something no competitor shows online. |
| Proof | Customer photo reviews with names and districts. | Named, real, and never curated to remove criticism. |

4.2 Product Detail Page

| Block | Required content | Priority on mobile |
| --- | --- | --- |
| Gallery | Full drape on model · pallu detail · border close-up · texture macro · unedited daylight reference frame · 10–15s drape video. | 1 — above fold |
| Identity | Design name, material (Plain or Super), price (saree + jacket material, all-in), stock state. | 1 — above fold |
| Jacket block | Jacket material named, swatch shown, 'ships unstitched' stated plainly. | 1 — above fold |
| Actions | Add to cart · Customise this → configurator · Send me swatches. | 2 |
| Fabric block | Cotton material (Plain / Super) · GSM · length in metres · opacity rating (opaque / semi-sheer / sheer). | 2 |
| Delivery | Estimate by district, dispatch cut-off, fee. | 2 |
| Promises | Colour accuracy promise · returns policy, in plain language on the page itself, not only in the footer. | 3 |
| Care | How to wash and keep this cotton. | 4 |
| Reviews | Photo reviews, named, with responses to criticism visible. | 4 |
| Related | This design in other colours; this design in the other material; sarees that share its jacket. | 5 |

The opacity rating is a small feature with outsized effect. 'Semi-sheer' on a listing prevents a return, a complaint, and a lost customer — and no Sri Lankan competitor publishes it.

4.3 Configurator Canvas

DESKTOP  (≥1024px)                          MOBILE  (<768px)

┌──────────────────┬───────────────┐        ┌─────────────────────┐

│                  │ DESIGN        │        │   360° PREVIEW      │

│   360° PREVIEW   │ [design grid] │        │   swipe to rotate   │

│   drag to rotate │               │        │                     │

│                  │ MATERIAL      │        ├─────────────────────┤

│                  │ (•) Plain     │        │ ⓘ approximate view  │

│                  │ ( ) Super +900│        │   see real photos → │

│                  │               │        ├─────────────────────┤

│                  │ COLOUR        │        │ [Design][Material]   │

│                  │ [swatch grid] │        │ [Colour][Jacket][Drape]

├──────────────────┤               │        ├─────────────────────┤

│ ⓘ approximate    │ JACKET        │        │  picker for          │

│   see real →     │ [swatch grid] │        │  active tab          │

├──────────────────┤               │        │                      │

│ suggested strip  │ DRAPE         │        ├─────────────────────┤

│                  │ (•)Saree ( )Osariya    │ LKR 8,900  ▲ Super  │

│                  │               │        │ [ Add to cart ]      │

│                  │ LKR 8,900     │        └─────────────────────┘

│                  │ [Add to cart] │        price + attribution +

└──────────────────┴───────────────┘        action, all pinned

| Element | Specification |
| --- | --- |
| Preview | Dominant element at every breakpoint. Never smaller than 45% of viewport height on mobile. |
| Honesty note | Persistent, adjacent to the preview, never dismissible. Links directly to true photography for the current selections. |
| Design picker | Visual tiles showing each design rendered in the currently selected colour, so the choice is made in context rather than against a generic sample. |
| Swatch pickers | Visual swatches showing actual colour and texture. Colour names accompany but never replace the swatch. Out-of-stock options visibly disabled with reason on tap. |
| Drape toggle | Two clearly labelled options. Switching preserves all material selections. |
| Price | Live, always visible. On mobile, pinned with the primary action. When it changes, a brief inline attribution names the cause — 'Super Cotton +LKR 900' — shown adjacent to the price, not as a toast. |
| Material selector | Two options, with the price difference for the current design shown on the Super option before selection. |
| Suggested pairings | A horizontally browsable strip. Selecting one loads it as the working design; the customer can then change anything. |
| Secondary actions | Save · Share · Send me swatches · See real photographs. None require an account. |

4.4 Empty, Loading and Error States

These states carry more weight than usual here, because a slow or broken configurator on mobile data is the most likely first impression for a large share of traffic.

| State | Behaviour | Copy direction |
| --- | --- | --- |
| Configurator loading | Progressive: interface and pickers first, preview last, with a visible skeleton in the preview area. Never a blank screen with a spinner. | 'Setting up your canvas' — plain, no whimsy. |
| Preview render failure | Fall back to static paired imagery. Purchase remains fully available. State that rotation is unavailable rather than pretending nothing is wrong. | 'The 360° view isn't loading right now. Here's the photography instead — you can still order.' |
| Option out of stock mid-design | Disable it, explain at the point of the disabled option, and suggest the nearest available alternative on the same axis. | 'Emerald in Super Cotton has just sold out. Emerald in Plain Cotton is available.' |
| Design unavailable in chosen colour | Keep the design selected, flag the colour, and offer the nearest available colour for that design. | 'This design isn't made in emerald. Closest is deep teal.' |
| Empty cart | Route to both doors — curated shop and configurator — with equal weight. | 'Nothing in your cart yet.' Then two actions. |
| No filter results | Name the narrowest filter and offer to relax it specifically. | 'No Super Cotton under LKR 6,000. Show all Super Cotton?' |
| Network failure at checkout | Preserve all entered data. Never clear the form. Offer retry and a WhatsApp fallback with the order details. | 'That didn't go through. Your details are saved — try again, or send this to us on WhatsApp.' |
| Payment declined | State what happened, keep the order recoverable, offer alternative methods including COD. | 'The card was declined. You can try another card, or pay cash on delivery.' |

5. Interaction and Accessibility Standards

5.1 Performance Budgets

These are UX requirements, not engineering aspirations. The tertiary persona is on a mid-range Android over mobile data; if these budgets are missed, that segment is excluded from the product.

| Surface | Budget | Measured as |
| --- | --- | --- |
| Catalogue page | Under 3s to first meaningful paint | Mid-range Android, 3G-equivalent throttling |
| Configurator initial load | Under 5s to interactive, progressive | Same conditions |
| Preview update on selection | Under 500ms | Time from tap to rendered change |
| Rotation frame rate | Smooth enough to read as continuous | No visible stepping during drag |
| Any navigation | Under 2s | Same conditions |

5.2 Accessibility

| Requirement | Standard |
| --- | --- |
| Contrast | WCAG AA minimum for all text. The gold brand colour MUST NOT be used for body text on white — it fails contrast. See Document 2 for the compliant application. |
| Keyboard | Every flow completable by keyboard, including the configurator. Rotation reachable by arrow keys when the preview has focus. |
| Focus | Visible focus indicator on every interactive element. Never removed without replacement. |
| Touch targets | Minimum 44×44px. Swatches in particular must not be smaller. |
| Colour independence | Colour is never the only means of conveying state. Out-of-stock swatches carry a visual mark as well as reduced saturation. |
| Alternative text | Every product image described by material, colour and view. Preview described as a rendered approximation of the current selection. |
| Reduced motion | Honour prefers-reduced-motion. Rotation becomes stepped rather than continuous; transitions become instant. |
| Language | Page language attribute set correctly per selected language, including for Sinhala and Tamil script. |

5.3 Content and Voice

| Principle | Direction | Example |
| --- | --- | --- |
| Plain over clever | Say what the thing is. | 'Ships unstitched' — not 'ready for your personal touch'. |
| Active voice | Name the action the control performs. | 'Add to cart', 'Save this design', 'Send me swatches'. |
| Consistent verbs | A control keeps its name through the whole flow. | 'Save this design' produces 'Design saved'. |
| Errors direct | State what happened and what to do. No apologising, no vagueness. | 'Emerald voile has just sold out.' Not 'Sorry, something went wrong.' |
| Empty screens invite | An empty state offers an action, not a mood. | 'Nothing saved yet. Start a design.' |
| No manufactured urgency | Stock scarcity is stated only when true. | 'Two left in this colour' only when two remain. |

6. Open UX Decisions

These require a decision before build. Each is recorded with its trade-off so the choice is deliberate.

| # | Decision | Options | Recommendation |
| --- | --- | --- | --- |
| UX-Q1 | Does the configurator open with a pre-loaded design or an empty canvas? | (a) Pre-loaded curated pairing (b) Empty with prompts | (a). Choice paralysis across hundreds of combinations is the primary conversion risk. |
| UX-Q2 | Is a configured saree priced the same as an equivalent curated listing? | (a) Same price (b) Small premium | (a) at launch. Price is already a function of design and material; adding a configuration premium would make the price matrix harder to explain and suppress the usage data needed to prove the feature works. |
| UX-Q2a | How is the price-change attribution presented? | (a) Inline beside the price (b) Toast (c) Both | (a). A toast is dismissible and easy to miss; the attribution must sit where the number changed. |
| UX-Q3 | Should the event-date field make a delivery promise? | (a) Advisory only (b) Binding commitment | (a). Stock shipping makes dates achievable, but a binding promise creates liability the courier network cannot guarantee outstation. |
| UX-Q4 | Does saving a design require an account? | (a) No, device-local plus link (b) Yes | (a). Forced registration before value is a documented abandonment cause. |
| UX-Q5 | How prominent is the honesty note about preview approximation? | (a) Persistent adjacent to preview (b) Dismissible tooltip | (a). The guarantee exclusion must be visible when choosing, not findable afterwards. |
| UX-Q6 | Are curated pairings and the configurator equal in navigation? | (a) Equal (b) Configurator secondary | (a). It is the differentiator and the reason for the Phase 2 investment. |

6.1 Handover

| This document defines | Defined elsewhere |
| --- | --- |
| Screens, flows, states, rules, copy direction, accessibility and performance budgets. | Colour, type, spacing, elevation → Document 2. Component APIs and props → Document 3. Data model, rendering pipeline, stock integrity → Document 4. Assistant behaviour → Document 5. Build sequence → Document 6. |
