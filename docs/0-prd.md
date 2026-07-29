# Lunara Sarees - Product Requirements Document v3.0

PRODUCT REQUIREMENTS DOCUMENT

LUNARA SAREES

Cotton Sarees with Jacket Material  ·  Design Your Own Saree Configurator

Version 3.0  ·  July 2026

Market: Sri Lanka (primary)  ·  Sri Lankan diaspora (secondary, Phase 3)

Status: Draft for Approval

Supersedes v2.0. See Section 0.2 for the record of correction.

Companion document: Sri Lankan Online Saree Market — Market Research Report (July 2026)

Table of Contents

0. Document Control

| Field | Detail |
| --- | --- |
| Product | Lunara Sarees — cotton saree brand with jacket material, and a Design Your Own Saree visual configurator |
| Document type | Product Requirements Document (PRD) |
| Version | 3.0 — Draft for approval. Supersedes v2.0 in full. |
| Date | July 2026 |
| Owner | Founder / Product Owner |
| Primary channel | Facebook page (facebook.com/profile.php?id=61585275432968), WhatsApp, and the Lunara web store |
| Evidence base | Sri Lankan Online Saree Market — Market Research Report (July 2026) |
| Review cadence | Monthly during Phase 1; quarterly thereafter |
| Approval required from | Founder, Operations lead, Web/Technical lead, Marketing lead |

0.1 Requirement Notation

| Notation | Meaning |
| --- | --- |
| MUST | Required for launch. The release does not ship without it. |
| SHOULD | Strongly desired. Ship without it only with an explicit, recorded decision. |
| COULD | Valuable but deferrable to a later phase. |
| FR-x | Functional requirement, numbered. |
| NFR-x | Non-functional requirement (performance, security, reliability). |
| OPS-x | Operational requirement — a business process or capability, not software. |

0.2 Record of Correction from v1.0

Version 1.0 was drafted on an incorrect understanding of the product and is withdrawn. It described a made-to-order business taking customer body measurements and stitching fitted jackets. That is not what Lunara sells.

Version 2.0 corrected that, but modelled the configurator as a two-axis chooser across a wide material range. Version 3.0 corrects the configurator model itself: the range is two cotton materials, not twenty-five, and saree design is a separate selectable axis. Both corrections are recorded so that no superseded requirement is carried forward by accident.

0.2.1 v1.0 → v2.0

| v1.0 assumed (incorrect) | v2.0 confirmed (correct) |
| --- | --- |
| Customer body measurements captured at order. | No measurements are taken at any point. |
| Jackets stitched to individual fit by Lunara. | No stitching is performed. The jacket material ships unstitched. |
| A ready-to-wear finished outfit is delivered. | A cotton saree plus an unstitched jacket material piece is delivered. The customer arranges her own tailoring. |
| Production happens after purchase; 7–10 day lead times. | Stock ships from inventory. Dispatch is same-day or next-day. |
| Tailoring SLAs, capacity models, remake policies, deposits. | None of these apply. Removed in full. |
| Jacket material fixed per saree. | Two paths: fixed pairing in the standard catalogue, and free selection in the Design Your Own Saree configurator. Jacket material is also sold standalone. |

0.2.2 v2.0 → v3.0

| v2.0 assumed (incorrect) | v3.0 confirmed (correct) |
| --- | --- |
| 25+ saree materials in multiple colours. | Two cotton materials only: Plain Cotton and Super Cotton. |
| The configurator has two selectable axes plus a drape toggle: saree material/colour and jacket material/colour. | Four selectable axes: saree DESIGN, saree material (2), saree colour, and jacket material/colour — plus the drape toggle. |
| Design was not a concept. A saree was a material in a colourway. | Design is a distinct, pre-defined pattern selectable independently of material and colour. |
| Price was a property of the material colourway. | Price is computed from design AND material together, and updates live as either changes. |
| Saree colour and design were the same choice. | Design is recolourable. The same design renders in any available saree colour — confirmed as approach (a) by the founder. |

Sourcing note: the Lunara Facebook page could not be machine-read during preparation, as Facebook disallows automated access. Brand positioning below is taken from the founder's written brief and confirmed through direct clarification. Any live page content that contradicts this document should be reconciled before approval.

1. Product Overview

1.1 Brand Definition

Lunara Sarees is a premium Sri Lankan saree brand. Its designs blend refined craftsmanship with timeless elegance, offering sarees selected and paired with care, quality and attention to detail.

Lunara sells cotton sarees, each supplied with an unstitched jacket material piece. The customer arranges her own tailoring. What Lunara personalises is not fit — it is the pairing: which jacket material, in which colour, goes with which saree, and how the finished combination will look draped.

1.2 What Lunara Actually Sells

The word 'custom' in Lunara's brand language refers to design choice, not to bodily fit. Getting this distinction right drives every requirement in this document.

| Lunara is NOT | Lunara IS |
| --- | --- |
| A tailoring service. No measurements are taken and nothing is stitched. | A cotton saree retailer that lets the customer choose her own saree-and-jacket pairing and see it before she buys. |
| A made-to-order producer with post-purchase production lead times. | A stock-shipping retailer dispatching from inventory, same-day or next-day. |
| A seller shipping whatever jacket piece happened to come with the saree. | A brand offering a defined set of saree designs, each available in two cotton qualities and a range of colours, freely pairable with a range of jacket materials. |
| A catalogue the customer must mentally assemble from flat photographs. | A visual configurator that renders the chosen combination on a 360° model, in her chosen drape style. |

1.3 The Two Purchase Paths and the Standalone Line

| Path | What the customer does | Who it serves |
| --- | --- | --- |
| Path A — Standard Catalogue | Browses ready-paired products. Each cotton saree is listed with a fixed jacket material chosen by Lunara. She buys the pairing as presented. | The customer who wants a curated decision made for her, quickly. Expected to carry the majority of launch volume. |
| Path B — Design Your Own Saree | Opens the configurator. Selects a saree design, a cotton material (Plain or Super), a saree colour, and a jacket material and colour — each independently. Chooses drape style (saree or Kandyan Osariya). The 360° model preview and the price both update live with every selection. Orders the finished combination through normal checkout. | The customer who wants control, who has a specific colour requirement to match, or who simply enjoys the process. The brand's primary differentiator. |
| Standalone jacket material | Orders jacket material on its own, without a saree. | Customers who already own a saree and want a new or replacement jacket piece; customers matching an existing wardrobe. A low-cost repeat-purchase driver. |

1.4 Vision and Mission

|  | Statement |
| --- | --- |
| Vision | To become the Sri Lankan brand a woman trusts to help her choose a saree and jacket pairing she is confident in — before she spends a rupee. |
| Mission | To remove the guesswork from buying a saree online: what colour it really is, how the cotton actually falls, and what the finished pairing will look like when she wears it. |
| Brand promise | See it before you wear it. |

1.5 Strategic Positioning

| Dimension | Lunara position | Rationale |
| --- | --- | --- |
| Category | Cotton sarees in two qualities — Plain Cotton and Super Cotton — supplied with unstitched jacket material | Cotton is climate-appropriate, wearable daily and photographs honestly. Two qualities give a clear good/better ladder without the working capital of a wide material range. |
| Price tier | Core mid. Price is a function of design and material, so the range spans an accessible Plain Cotton entry point up to a Super Cotton premium. | Above informal Facebook sellers, below imported silk. Justified by design choice, pairing choice, honest photography and delivery certainty — not by fabric cost. |
| Primary customer | The professional repeat buyer (Persona 1 in the market research) | Buys 4–8 sarees a year on a predictable rhythm. Values comfort, colour reliability and easy reordering. |
| Differentiator | The Design Your Own Saree configurator: design, material, colour, jacket and drape all selectable, with a live 360° preview and live pricing | No Sri Lankan competitor at any tier offers visual pairing preview, let alone across four axes with transparent price movement. It is a genuine, defensible first. |
| What Lunara will not do | Compete on lowest price; stock heavy silks or bridal at launch; use 'inbox for price'; offer stitching | Each either destroys margin, exceeds current capability, or reproduces the behaviour that erodes trust in this market. |

1.6 Why Two Cotton Qualities Is the Right Constraint

The range is deliberately two materials — Plain Cotton and Super Cotton — with variety delivered through design and colour rather than through fabric proliferation. This is the single most capital-efficient decision in the business model.

Photographs honestly. Cotton has less sheen and less colour drift under lighting than silk or synthetics, directly reducing the category's single largest pain point — colour misrepresentation. This matters doubly for Lunara, because the configurator makes a visual promise that the delivered product must keep.

Climate-correct. Sri Lankan heat and humidity make breathable cotton the most wearable everyday and office fabric, supporting the repeat-purchase model.

Radically lower inventory risk. Two materials rather than twenty-five collapses the stock footprint. The same capital buys depth in designs and colours — which is what actually makes the configurator feel rich — instead of breadth in fabrics the customer cannot distinguish on a screen.

A legible quality ladder. Plain and Super give the customer one clear upgrade decision rather than a confusing spread of near-identical cottons. It also makes the price model easy to explain, which matters when price moves live in the configurator.

Renders predictably. Cotton's matte, even surface composites more convincingly in a layered preview than high-sheen silk, where specular highlights and zari would expose the approximation immediately.

Credible expansion story. A brand known for doing cotton exceptionally well can move into linen, soft silk and handloom with earned authority.

2. Problem Statement

2.1 The Core Problem

A Sri Lankan woman buying a saree online cannot picture the finished result. She sees a saree photographed flat or on a mannequin. She may or may not be told what jacket material comes with it. She has no way to know whether the pairing will look right, whether the colours work together, or how any of it will sit when actually draped — and if she wants an Osariya rather than a standard drape, she has no visual reference at all.

So she does what the market research documented: she defers to a physical showroom, or she buys from a Facebook seller and accepts the risk, or she does not buy at all. The category's online penetration lags the national e-commerce average almost entirely because of this uncertainty, not because of lack of demand or internet access.

2.2 Problems Lunara Solves, Mapped to Research Findings

| Research pain point | How it hurts the customer today | How Lunara solves it |
| --- | --- | --- |
| A1 — Colour misrepresentation | The saree arrives a visibly different shade from the photograph, ruining occasion or workplace colour matching. | Every material and colourway photographed in natural daylight with one unedited reference frame on the product page. Physical swatch service. Written colour-accuracy guarantee covering product page imagery. |
| A2 / A3 — Fabric fall and opacity unknown | Cannot tell whether the cotton is crisp or soft, or whether it is sheer enough to be unwearable at the office. | Drape video on every material, stated GSM or weight, and a three-point opacity rating published on every listing. |
| A5 — Blouse ambiguity | Unclear whether a jacket piece is included, what material it is, or what it looks like against the saree. | Eliminated. Every order states the jacket material explicitly, and the configurator shows the pairing rendered on a model before purchase. |
| The pairing problem (unnamed in research, specific to Lunara) | No seller lets the customer see a saree and jacket combination together before buying. She assembles it in her imagination and hopes. | The Design Your Own Saree configurator. This is the differentiator. |
| Osariya invisibility | Kandyan Osariya is culturally essential but almost never shown online, and younger buyers often cannot picture the drape. | The drape-style toggle renders the same material selection as a Kandyan Osariya on the 360° model. |
| C1 / C2 — No returns route | Buyer carries all risk on a purchase she cannot physically inspect. | A published 7-day returns policy. Because nothing is personalised, returned stock is fully resellable — so Lunara can afford to be genuinely generous here. |
| D1 / D2 — Missing the event date; no updates | Purchase exists to be worn on a fixed date. Silence after ordering causes anxiety. | Stock ships same-day or next-day, removing production risk entirely. Automated SMS and WhatsApp status updates at each dispatch stage. |
| E1 — Hidden pricing | 'Inbox for price' reads as differential pricing and destroys shoppability. | Every price published publicly, on every channel, without exception. |

2.3 The Problem Lunara Creates for Itself

The configurator is the brand's greatest asset and its greatest risk. It makes a visual promise. If the delivered pairing does not match what the customer saw on screen, the feature that won her becomes the reason she leaves — and she will say so publicly.

| Self-inflicted risk | Why it arises | Where addressed |
| --- | --- | --- |
| Preview-to-product colour mismatch | A composited preview is an approximation. Screen calibration, layer blending and fabric texture all introduce drift from the real fabric. | Section 4.4 (preview honesty requirements) and Section 6.1 (scope of the colour guarantee) |
| Combinatorial render complexity | Two materials keeps stock simple, but design × colour × jacket × drape still produces a large number of renderable combinations that must stay in sync with live stock. | Section 5.1 (inventory) and FR-27 (real-time availability) |
| Configurator build cost and timeline | A four-axis 360° layered preview with live pricing is the most technically demanding element by a wide margin and can delay the entire launch if sequenced wrongly. | Section 7.1 (phased release) and Section 4.4 (build approach) |
| Price transparency under live change | Price moves as the customer selects. If the movement is not explained at the moment it happens, it reads as arbitrary or as a hidden charge. | FR-19a and Section 6.4 (pricing policy) |
| Customer designs a combination that is out of stock | She invests effort in a design, then cannot buy it. Worse than never offering the choice. | FR-27 — availability enforced live within the configurator, not at checkout |

3. Target Users and Personas

Three personas are in scope for version 1, drawn from the market research segmentation and narrowed to those Lunara's cotton-and-pairing model actually serves.

3.1 Primary — Nimali, the Professional Repeat Buyer

| Dimension | Detail |
| --- | --- |
| Profile | 28–42. Colombo, Gampaha, Kandy. Bank, telco, insurance, government or school employment. Household income LKR 150,000–350,000/month. |
| Need | Cotton sarees worn 3–5 days a week. Comfortable in heat, professional in appearance. |
| Frequency | 4–8 sarees per year — the highest lifetime value of any segment. |
| Budget | LKR 4,500–14,000 per saree with jacket material. |
| Behaviour | Mobile-first. Browses Facebook and Instagram in the evening. Compares several sellers. Often COD on first purchase, moving to bank transfer once trust is established. Already has a regular tailor. |
| Jobs to be done | Build a work wardrobe without spending mornings shopping. Know the jacket material will suit the saree before buying. Reorder easily once she has found a material she likes. |
| Relationship to the configurator | Uses it to check a pairing before committing, and to find colour combinations she would not have thought of. Likely to use Path A for speed and Path B when she wants something specific. |
| What makes her leave | One saree that arrives a different shade from the screen. One out-of-stock surprise after designing a combination. |
| Priority for v1 | PRIMARY |

3.2 Secondary — Shanika, the Occasion Buyer

| Dimension | Detail |
| --- | --- |
| Profile | 25–45. Attends 6–15 weddings, almsgivings, poya observances and family functions a year. |
| Need | A distinctive cotton saree for a specific dated event, usually within a two to three week window. |
| Budget | LKR 8,000–18,000. |
| Behaviour | Compressed purchase window. Highly influenced by what she saw someone else wear and by short-form video. |
| Jobs to be done | Not turn up in the same combination as another guest. Have the saree in hand with enough time for her tailor to finish the jacket. Look considered rather than generic. |
| Relationship to the configurator | The heaviest user. Distinctiveness is her goal, and a unique pairing is exactly what the configurator produces. Also the most likely to use the Osariya toggle. |
| What makes her leave | Delivery too slow to leave tailoring time before the event. |
| Priority for v1 | SECONDARY — same platform, with clear dispatch speed and a tailoring-time reminder at checkout. |

3.3 Tertiary — Dilrukshi, the Regional Value Buyer

| Dimension | Detail |
| --- | --- |
| Profile | 30–55. Outside the Western Province — Kurunegala, Matara, Anuradhapura, Badulla, Ratnapura. |
| Need | Everyday and temple-wear cotton at an accessible price. |
| Budget | LKR 3,000–7,000. |
| Behaviour | Facebook-native. Discovers through shared posts. Almost exclusively COD. May not have a card activated for online payment. Often on a slower connection and an older device. |
| Jobs to be done | Buy something decent without travelling to a town showroom, and without being cheated. |
| Relationship to the configurator | May not use it at all. The catalogue path and a lightweight fallback must work perfectly on a low-end Android over mobile data. |
| What makes her leave | Delivery fees disproportionate to item price; a site too heavy to load; no one answering in her language. |
| Priority for v1 | TERTIARY — served, with disciplined COD and delivery economics. |

3.4 Explicitly Out of Scope for v1

| Segment | Why deferred | Revisit |
| --- | --- | --- |
| Kavindi — the Bride | Bridal demands heavy silk, deep Osariya expertise and physical consultation. Attempting it at launch would compromise the cotton focus and expose the business to reputational risk on the highest-stakes purchase in the category. Note that the Osariya toggle serves Osariya-curious everyday buyers, not brides. | Phase 4 (Month 18+) |
| Malar — the Traditional Silk Buyer | Requires pure silk, authenticity documentation and Kanchipuram sourcing relationships — none of which exist at launch. Silk also renders poorly in a composited preview. | Phase 3–4 |
| Anoma — the Diaspora Buyer | High value and genuinely under-served. Requires international shipping and landed-cost transparency, and should follow a proven domestic operation. | Phase 3 (Month 9–18) |

4. Product Scope and Functional Requirements

4.1 Catalogue Structure

Three product types exist in the catalogue, and the data model must distinguish them from the outset.

| Product type | Composition | Notes |
| --- | --- | --- |
| Paired saree (Path A) | One cotton saree in a specific colourway, plus one fixed jacket material in a specific colourway, sold as a single listing. | Curated by Lunara. The default browsing experience and expected volume driver at launch. |
| Configured saree (Path B) | One saree design, in one cotton material, in one colour, plus one independently chosen jacket material and colour, assembled by the customer in the configurator. | Generated at order time from component stock. Not a pre-existing SKU. |
| Standalone jacket material | One jacket material in a specific colourway, sold alone. | Low price point, high repeat frequency. Useful for reactivating dormant customers. |

Inventory implication: Path A and Path B draw from the same underlying component stock. A paired listing must not reserve stock that the configurator then cannot see, and vice versa. Both must read from a single source of truth. This is the most important technical constraint in the document.

4.2 Product Catalogue — Requirements

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-01 | Every saree design, in every material and colourway offered, MUST have a minimum of five assets: full drape on a model, pallu detail, border close-up, cotton texture macro, and one unedited natural-daylight reference frame. | MUST |
| FR-02 | Every saree design MUST have a 10–15 second drape-in-motion video shot in daylight, in at least one representative material and colour. | MUST |
| FR-03 | Every listing MUST state: design name, cotton material (Plain or Super), weight or GSM, saree length in metres, and a three-point opacity rating (opaque / semi-sheer / sheer). | MUST |
| FR-04 | Every jacket material colourway MUST have a true-colour swatch image shot under the same standardised daylight conditions as the sarees, plus a texture macro. | MUST |
| FR-05 | Every listing MUST display the full published price, with delivery fee and any COD fee visible before checkout. | MUST |
| FR-06 | Every paired listing MUST explicitly name the jacket material included and state clearly that it ships unstitched. | MUST |
| FR-07 | The catalogue MUST support filtering by design, colour, cotton material, occasion, price band and opacity. | MUST |
| FR-08 | Product names and all policy pages MUST be available in Sinhala and Tamil in addition to English. | MUST |
| FR-09 | Listings SHOULD display remaining availability where a material colourway is running low, to create honest urgency and prevent configurator disappointment. | SHOULD |
| FR-10 | The catalogue SHOULD support a wishlist with back-in-stock and new-arrival alerts over email or WhatsApp. | SHOULD |
| FR-11 | Listings COULD show 'others paired this with' suggestions drawn from actual configurator data. | COULD |

4.3 Design Your Own Saree — Functional Requirements

This is the heart of the product. The configurator is a dedicated page reached from primary navigation. It carries four independent selectable axes plus a drape toggle, and both the rendered model and the price respond to every one of them.

| Axis | Options | Affects model? | Affects price? |
| --- | --- | --- | --- |
| Saree design | A pre-defined design set | Yes | Yes |
| Cotton material | Plain Cotton · Super Cotton | Yes — texture and fall | Yes |
| Saree colour | Available colour range; designs are recolourable | Yes | No |
| Jacket material and colour | Jacket range | Yes | Yes, where jacket materials differ in price |
| Drape style | Saree · Kandyan Osariya | Yes | No — same material, same length, same item shipped |

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-12 | The configurator MUST allow selection of a saree DESIGN from the pre-defined design set. | MUST |
| FR-12a | The configurator MUST allow selection of the cotton material — Plain Cotton or Super Cotton — independently of the design. | MUST |
| FR-12b | The configurator MUST allow selection of a saree COLOUR independently of the design. Designs are recolourable: the same design renders in any available colour. | MUST |
| FR-13 | The configurator MUST allow selection of a jacket material and colour independently of the saree selection. Any jacket may be paired with any saree. | MUST |
| FR-14 | The configurator MUST offer a drape-style toggle with two options: standard saree drape and Kandyan Osariya. | MUST |
| FR-15 | The model image MUST update to reflect the current saree design, cotton material, saree colour, jacket selection and drape style, without a page reload. A change to ANY of these five inputs re-renders the model. | MUST |
| FR-16 | The model preview MUST support 360° rotation, allowing the customer to view the drape from all angles including the pallu and the back. | MUST |
| FR-17 | Switching drape style MUST re-render the model in that drape while preserving the customer's design, material, colour and jacket selections. | MUST |
| FR-18 | Selection controls MUST use visible colour and texture swatches, never colour names alone. | MUST |
| FR-19 | The configurator MUST display the live total price, updating as selections change. Price is computed from the selected DESIGN and the selected MATERIAL together. | MUST |
| FR-19a | When the price changes as a result of a selection, the configurator MUST make the reason legible at the moment of change — naming whether the movement came from the design or from the material. Price that moves without explanation reads as arbitrary or as a hidden charge. | MUST |
| FR-19b | The material selector MUST show the price difference between Plain Cotton and Super Cotton for the currently selected design, before the customer switches. | MUST |
| FR-20 | On completion, the customer MUST be able to add the configured combination to cart and proceed through normal checkout. | MUST |
| FR-21 | The configured combination MUST be saveable and shareable via a link, so she can seek a second opinion before buying. | SHOULD |
| FR-22 | The configurator MUST carry a visible, plainly worded note that the preview is an approximate visualisation, with a direct link to the true daylight photography for each selected material. | MUST |
| FR-23 | The configurator MUST be fully usable on a 360px mobile viewport with touch-based rotation. | MUST |
| FR-24 | The configurator MUST offer a fallback experience where the 360° preview cannot load, showing static paired imagery rather than failing. | MUST |
| FR-25 | The configurator SHOULD offer a curated 'suggested pairings' starting point, so a customer facing 25×15 combinations is not paralysed by choice. | SHOULD |
| FR-26 | The configurator SHOULD allow the customer to request physical swatches of her selected combination before ordering. | SHOULD |
| FR-27 | The configurator MUST reflect live stock availability across all four axes. Out-of-stock design, material, colour or jacket options MUST be visibly disabled, never selectable and then rejected at checkout. | MUST |
| FR-28 | The configurator COULD allow saving multiple designs to a personal gallery for later comparison. | COULD |

4.4 The 360° Preview — Build Approach

The four selectable axes multiply. Design × material × colour × jacket × drape produces far more combinations than can be photographed individually, even though the material range is only two. Photographing every combination is not feasible.

The saving grace is that designs are recolourable, confirmed as approach (a). A design is captured once as a pattern with its own mask, then tinted to any saree colour at render time. Colour therefore costs nothing additional in capture — it is a render-time operation. Only design and material require distinct capture or texture work.

| Approach | How it works | Assessment |
| --- | --- | --- |
| Pre-rendered photography | Shoot a model in every design, material, colour and jacket combination, from every angle. | Rejected. The shoot count is impossible across four axes, and every new design would require a full re-shoot. |
| Layered compositing (RECOMMENDED) | Capture one 360° model sequence per drape style. Within each frame, mask the saree region and the jacket region separately. At render time, composite: the selected DESIGN pattern, tinted to the selected COLOUR, textured for the selected MATERIAL, into the saree mask; and the jacket colour and texture into the jacket mask. | Recommended for launch. Because designs are recolourable, colour is free at render time and only design and material need distinct asset work. Adding a design requires a pattern asset and mask, not a new model shoot. The trade-off is that the result is an approximation, addressed by FR-22 and Section 6.1. |
| 3D garment simulation | Full CAD simulation of fabric drape and physics. | Deferred. Highest fidelity and best handling of drape differences, but the cost and build time would delay launch by months. Revisit in Phase 3 or 4. |

The recommended approach requires two distinct 360° model capture sequences — one draped in standard saree style, one in Kandyan Osariya — each shot at a consistent interval of rotation, with the saree region and the jacket region cleanly masked in every frame. This is a one-time production cost that then supports the entire design and colour range indefinitely.

Per design, the additional asset requirement is a tileable pattern asset produced so that it can be tinted, plus placement guidance for how the design sits within the drape (border, pallu, body). Per material, the requirement is a texture overlay expressing the weave difference between Plain and Super Cotton. Neither requires a new model shoot.

[DECISION REQUIRED] The composited preview cannot be covered by the colour-accuracy guarantee, because it is a rendering rather than a photograph. Section 6.1 scopes the guarantee to product page photography only. This must be communicated honestly in the configurator itself (FR-22), or the brand's best feature will become its largest source of colour complaints.

4.5 Standalone Jacket Material — Requirements

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-29 | Jacket materials MUST be purchasable independently, without a saree, as their own catalogue category. | MUST |
| FR-30 | Standalone jacket listings MUST state material composition, colour, piece length in metres, and that the piece ships unstitched. | MUST |
| FR-31 | Standalone jacket listings SHOULD suggest Lunara sarees that pair well with that material, linking through to the configurator with the jacket pre-selected. | SHOULD |
| FR-32 | A minimum-order or flat-rate delivery rule MUST be defined for standalone jacket orders, since the item value may otherwise be lower than the cost of delivering it. | MUST |

4.6 Checkout and Payment — Requirements

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-33 | Guest checkout MUST be the default path. Account creation is offered after purchase, never before. | MUST |
| FR-34 | Payment options MUST include cash on delivery, bank transfer, LankaQR, and debit/credit card. Bank transfer MUST be first-class, as it is the established default for social-commerce orders in this market. | MUST |
| FR-35 | A transparent COD handling fee MUST be applied and clearly labelled, waived on prepayment. | MUST |
| FR-36 | Delivery fee and estimated delivery date MUST be shown before the final checkout step, never revealed at the end. | MUST |
| FR-37 | Order confirmation MUST be sent by both SMS and WhatsApp, not by email alone. | MUST |
| FR-38 | For configured orders, checkout MUST display a final visual summary of the chosen combination for confirmation. | MUST |
| FR-39 | Checkout MUST display a clear reminder that the jacket material ships unstitched and requires tailoring, so no customer is surprised on delivery. | MUST |
| FR-40 | The system SHOULD support order placement initiated from a WhatsApp conversation with a payment link, for customers who will not self-serve on the website. | SHOULD |

4.7 Fulfilment and Post-Purchase — Requirements

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-41 | Orders MUST move through customer-visible states: Confirmed → Packed → Dispatched → Delivered. | MUST |
| FR-42 | The customer MUST receive an automated SMS and WhatsApp notification at each state transition. | MUST |
| FR-43 | The returns policy MUST be published in plain Sinhala, Tamil and English, and MUST appear on every product page, not only in the footer. | MUST |
| FR-44 | A written colour-accuracy guarantee MUST appear on every product page, with its scope clearly stated. | MUST |
| FR-45 | A one-tap WhatsApp contact MUST be present on every page with a published first-response commitment. | MUST |
| FR-46 | Verified customer photo reviews MUST be displayed on product pages. Negative reviews MUST be responded to publicly rather than removed. | MUST |
| FR-47 | Business registration number, physical address and a phone number answered by a human MUST be published on the site. | MUST |
| FR-48 | Every parcel MUST include a printed cotton care card and a printed returns card with a three-step process and a WhatsApp number. | MUST |
| FR-49 | An automated post-purchase sequence MUST run: receipt confirmation at delivery+1, satisfaction check at delivery+3, photo review request at delivery+14, and a relevant new-arrival prompt at delivery+45. | MUST |
| FR-50 | The system SHOULD support a loyalty mechanism recognising repeat purchase, given the primary persona buys 4–8 times a year. | SHOULD |
| FR-51 | The system COULD offer gift vouchers and gift packaging with an extended exchange window. | COULD |

4.8 Non-Functional Requirements

| ID | Requirement | Target |
| --- | --- | --- |
| NFR-01 | Catalogue page load on a mid-range Android over mobile data | Under 3 seconds to first meaningful paint |
| NFR-02 | Configurator initial load | Under 5 seconds on mobile data; progressive loading with a visible indicator |
| NFR-03 | Preview update latency when a selection changes | Under 500ms |
| NFR-04 | Mobile-first responsive design across the entire purchase flow | 100% of flows usable on a 360px viewport |
| NFR-05 | Image delivery optimised and lazy-loaded without compromising colour fidelity | Compressed, colour profile preserved |
| NFR-06 | Payment handling via a PCI-compliant gateway; no card data stored by Lunara | Zero card data at rest |
| NFR-07 | Inventory consistency between catalogue and configurator | Single source of truth; no divergence |
| NFR-08 | Site availability | 99.5% monthly, excluding planned maintenance |
| NFR-09 | WhatsApp first response during published service hours | Under 30 minutes |
| NFR-10 | Trilingual support across product names, policies and transactional messages | Sinhala, Tamil, English |

4.9 Explicitly Out of Scope for v1

| Out of scope | Reason | Earliest revisit |
| --- | --- | --- |
| Any stitching or tailoring service | Not the business. Jacket material ships unstitched, always. | Not planned |
| Customer body measurements | Not collected at any point. | Not planned |
| Silk, georgette, chiffon, linen and blended materials | Cotton-first is a deliberate constraint. Cotton also composites more convincingly in the preview than high-sheen fabrics. | Phase 3, Month 9+ |
| Bridal wear | Requires expertise and inventory value that do not exist at launch. Note that the Osariya drape toggle is a visualisation feature, not an entry into bridal. | Phase 4, Month 18+ |
| 3D garment simulation preview | Layered compositing is sufficient for launch at materially lower cost and risk. | Phase 3–4 |
| International shipping | Requires landed-cost transparency and international returns routing. Prove domestically first. | Phase 3, Month 9+ |
| Physical retail space | Capital-intensive and unnecessary while the model is being validated. | Phase 4+ |
| Mobile app | The mobile web experience must be excellent first. An app adds cost without adding reach at this scale. | Phase 4+ |

5. Operational Requirements

5.1 Inventory and Sourcing

Lunara now holds finished stock rather than producing to order. Inventory discipline replaces production capacity as the central operational concern.

| ID | Requirement | Priority |
| --- | --- | --- |
| OPS-01 | Maintain two cotton materials — Plain Cotton and Super Cotton — with a defined, pre-defined set of saree designs and a defined colour range per design. Design count, colour count and jacket material count MUST be confirmed and documented before catalogue build. | MUST |
| OPS-02 | Every design, in every material and colourway offered, MUST be physically swatched and photographed under identical standardised daylight conditions, so that configurator colour and product page colour derive from the same source. | MUST |
| OPS-03 | Record a reference colour frame for every fabric lot. Any lot change MUST trigger re-photography and a configurator texture update before continued sale. | MUST |
| OPS-04 | Secure at least two suppliers per core cotton type before launch, to avoid single-source failure mid-season. | MUST |
| OPS-05 | Operate a single source of truth for stock, read by both the catalogue and the configurator, with no manual reconciliation. | MUST |
| OPS-06 | Define minimum stock thresholds per material colourway, below which the configurator disables that option automatically. | MUST |
| OPS-07 | Hold buffer stock on the top-selling materials sufficient to cover peak-season demand. | SHOULD |
| OPS-08 | Review slow-moving designs and colourways quarterly and retire them from the configurator to keep the choice set navigable. | SHOULD |
| OPS-08a | Maintain a published price matrix mapping every design and material combination to its price, reviewed quarterly against fabric cost movement. | MUST |

5.2 Content Production

| ID | Requirement | Priority |
| --- | --- | --- |
| OPS-09 | Produce two 360° model capture sequences — one standard saree drape, one Kandyan Osariya — with saree and jacket regions cleanly masked in every frame. | MUST |
| OPS-10 | Define and document a standardised photography protocol covering lighting, background, white balance and camera settings, applied to every material without exception. | MUST |
| OPS-11 | Produce a tintable pattern asset and placement map for every design, plus a texture overlay for each of the two cotton materials, and a true-colour swatch for every saree and jacket colourway, all suitable for compositing into the preview. | MUST |
| OPS-12 | Validate every composited preview against the real fabric before publishing, and adjust the texture or colour value where drift is visible. | MUST |
| OPS-13 | Establish a repeatable process so a new material can be added to the configurator from swatch to live in a defined, short turnaround. | SHOULD |

5.3 Fulfilment

| ID | Requirement | Priority |
| --- | --- | --- |
| OPS-14 | Dispatch same-day for orders confirmed before a published daily cut-off time, next-day otherwise. | MUST |
| OPS-15 | Contract at least two couriers with differing regional strengths, so Western Province and outstation delivery can be routed appropriately. | MUST |
| OPS-16 | Publish honest zone-based delivery timeframes rather than a single national promise. | MUST |
| OPS-17 | Package every order in branded packaging with tissue, care card and returns card. | MUST |
| OPS-18 | Publish seasonal order cut-off dates well ahead of Avurudu, Vesak, Poson and Deepavali, with an explicit note allowing customers time for their own tailoring. | MUST |
| OPS-19 | Track COD refusal rate by district and restrict or require prepayment where it is persistently uneconomic. | SHOULD |

6. Customer Policies

These policies are product features, not legal boilerplate. The market research found that clear, generous, prominently published returns terms are rare across the entire Sri Lankan online saree landscape, and that visible guarantees carry heavy influence on purchase decisions.

6.1 Colour Accuracy Guarantee

Lunara commits that every material is photographed in natural daylight, that one unedited reference frame is published for every colourway, and that if a delivered item differs materially from that reference frame, Lunara will collect it at its own cost and either replace or refund it in full.

| Scope | Covered? | Wording requirement |
| --- | --- | --- |
| Product page photography | Yes — fully covered | The reference frame is the standard against which any colour claim is judged. |
| Physical swatches | Yes — fully covered | Swatches are cut from the actual stock lot. |
| Configurator 360° preview | No — explicitly excluded | The preview is a visualisation, not a photograph. FR-22 requires a plainly worded note stating this, with a link to the true photography for each selected material. |

This exclusion must be worded honestly and prominently rather than buried. A customer who feels the guarantee was quietly narrowed will be more damaging than one who was told plainly at the point of selection.

6.2 Returns and Exchange Policy

Because nothing is personalised and all stock is resellable, Lunara can afford a genuinely generous policy — and should, since this is one of the four wide-open competitive gaps identified in the market research.

| Situation | Lunara's response | Customer cost |
| --- | --- | --- |
| Colour differs materially from the published reference frame | Full replacement or refund. Collection at Lunara's cost. | None |
| Manufacturing defect or damage in transit | Full replacement or refund. Collection at Lunara's cost. | None |
| Wrong item or wrong jacket material shipped | Full replacement, expedited. Collection at Lunara's cost. | None |
| Change of mind, item unused and untagged, within 7 days | Full refund to the original payment method. | Return delivery only |
| Exchange for a different colour or material, within 7 days | Exchange processed, price difference settled either way. | Return delivery only |
| Jacket material already cut or stitched by the customer's tailor | No return. Clearly stated at checkout and on the printed returns card. | Not returnable |

Refunds MUST be issued to the original payment method within a published number of working days. Store credit MUST NOT be substituted without the customer's explicit agreement.

The policy MUST be stated on every product page in plain language, in all three languages, before the customer reaches checkout.

6.3 Delivery Commitment

Orders confirmed before the published daily cut-off dispatch the same day; all others dispatch the next working day.

Zone-based delivery estimates are published honestly rather than as a single optimistic national figure.

Automated status updates are sent at every dispatch transition. Silence is treated as a service failure.

Seasonal cut-off dates are published well in advance, with an explicit reminder that the customer needs additional time for her own tailoring.

6.4 Pricing Policy

Every price is published publicly on every channel. 'Inbox for price' is prohibited without exception, including on Facebook and Instagram posts.

No permanent inflated 'was' pricing. Promotions are genuine and time-boxed to festival and seasonal windows.

The all-in cost — saree, jacket material, delivery, and any COD fee — is visible before checkout.

Configurator pricing is transparent and live. Price is a function of the selected design and the selected cotton material, and it updates the moment either changes.

When the price moves, the configurator names why — whether the movement came from the design or from the material. An unexplained price change reads as arbitrary or as a hidden charge, and undoes the trust the rest of the interface is built to earn.

The material selector shows the Plain-to-Super price difference for the current design before the customer switches, so the upgrade decision is made with the cost visible rather than discovered after.

A published price matrix maps every design and material combination to its price. Configurator pricing and catalogue pricing resolve from that single matrix, so the two paths can never disagree.

7. Release Plan and Roadmap

The configurator is the differentiator, but it is also the longest build. Sequencing it as a blocker to launch would delay revenue by months. The plan below ships a credible commerce business first, then adds the configurator as a distinct, marketable launch moment.

7.1 Phase 1 — Commerce Foundation (Months 0–3)

Goal: a customer can buy a cotton saree with jacket material, receive it quickly, trust the colour, and want to buy again. No configurator yet.

| Deliverable | Detail |
| --- | --- |
| Paired catalogue | The full range of cotton sarees with fixed jacket pairings, each shot to the FR-01 to FR-03 standard. |
| Standalone jacket range | Jacket materials purchasable independently, with delivery economics defined. |
| Checkout | Guest checkout, COD plus bank transfer plus LankaQR plus card, full cost transparency, unstitched reminder. |
| Trust layer | Published colour guarantee, returns policy, delivery commitment, business registration, human-answered phone number — all trilingual. |
| Order tracking | The four dispatch states with automated SMS and WhatsApp notification at each transition. |
| Service | Staffed WhatsApp line with a published response commitment. |
| Operations | Two couriers contracted, standardised photography protocol live, single-source-of-truth inventory operating. |
| Content | Facebook and Instagram presence with every price published; drape and cotton care video. |

Phase 1 exit criteria: on-time dispatch above 98%; colour complaint rate below an agreed threshold; a defined number of photo reviews collected; positive contribution margin after delivery and return costs.

7.2 Phase 2 — Design Your Own Saree (Months 3–6)

Goal: launch the configurator as a distinct brand moment, with the commerce foundation already proven.

| Deliverable | Detail |
| --- | --- |
| 360° capture production | Two model sequences — standard drape and Kandyan Osariya — with clean layer masking. |
| Design and texture library | Tintable pattern assets and placement maps for every design, texture overlays for Plain and Super Cotton, and true-colour swatches for every colourway — all validated against real fabric. |
| Configurator build | Four-axis selection (design, material, colour, jacket), drape toggle, live 360° preview, live pricing with change attribution, live stock enforcement, mobile-first. |
| Preview honesty layer | The FR-22 visualisation note and direct links to true photography for each selected material. |
| Suggested pairings | Curated starting combinations so customers are not paralysed by the full choice set. |
| Save and share | Shareable design links for second opinions. |
| Swatch service | Physical swatches of a selected combination dispatched on request. |
| Launch campaign | The configurator is the marketing story. Short-form video showing a design being built and the Osariya toggle in action. |

7.3 Phase 3 — Scale and Material Expansion (Months 6–12)

| Deliverable | Detail |
| --- | --- |
| Range expansion — stage one | Add designs first, since a design costs only a pattern asset and no new model shoot. Introduce linen or cotton-silk blends only after the design range is proven, and only where each renders acceptably in the composited preview. |
| Diaspora channel | International shipping with a transparent landed-cost calculator and a defined international returns route. |
| Loyalty programme | Recognition and early access for the repeat buyer who drives lifetime value. |
| Seasonal capsule | A curated quarterly cotton collection converting sporadic purchase into recurring revenue. |
| Sri Lankan handloom line | A local-origin cotton handloom range that cross-border competitors structurally cannot replicate. |
| Configurator gallery | Personal saved-design gallery and community-visible popular pairings. |

7.4 Phase 4 — Category Extension (Months 12–24)

| Deliverable | Detail |
| --- | --- |
| Material expansion — stage two | Soft silks and occasion fabrics. Note that high-sheen fabrics may require a preview fidelity upgrade before they can be offered in the configurator. |
| 3D preview upgrade | Replace layered compositing with garment simulation for materially better drape fidelity, if the range and revenue justify it. |
| Bridal and Kandyan Osariya vertical | A separate, appointment-led sub-brand. The Osariya toggle will by then have generated real demand data to size this properly. |
| Physical experience space | A single Colombo studio or pop-up to resolve touch-and-feel objections and support swatch handling. |

8. Success Metrics

Because a substantial share of orders will arrive COD, order-count metrics are misleading. Every acquisition decision must be judged on delivered and paid revenue after delivery and return costs.

8.1 North Star Metric

Repeat purchase rate at 12 months. Lunara's economic model rests on the professional buyer who purchases 4–8 sarees a year. If she returns, the colour, quality and delivery promises are working. If she does not, no amount of acquisition spend will compensate.

8.2 Metric Set

| Category | Metric | Why it matters | Discipline |
| --- | --- | --- | --- |
| Quality | Colour complaint rate per 100 orders | Tests whether the photography standard is holding — the category's largest pain point. | Investigate any colourway above baseline; re-shoot before re-listing |
| Quality | Preview-related complaint rate (configurator orders only) | Isolates whether the composited preview is misleading customers. | If materially above the catalogue baseline, the preview fidelity or the FR-22 disclosure needs work |
| Configurator | Configurator engagement rate (visitors who open it) | Measures whether the differentiator is being discovered at all. | Rising; if low, the navigation placement is wrong |
| Configurator | Configurator completion rate (opened to added-to-cart) | Measures whether the choice set overwhelms or converts. | If low, suggested pairings (FR-25) need expanding |
| Configurator | Conversion rate: configured versus paired orders | Tests whether the configurator actually sells or merely entertains. | Configured orders should convert at or above paired |
| Configurator | Osariya toggle usage rate | Sizes latent Osariya demand and informs the Phase 4 bridal decision. | Track from launch as a strategic signal |
| Configurator | Design popularity distribution | Shows which designs earn their place and which should be retired. | Review quarterly against OPS-08 |
| Economics | Super Cotton upgrade rate | Tests whether the quality ladder and its price presentation actually work. | If very low, the price difference is either too large or not well explained (FR-19b) |
| Configurator | Abandonment after a price increase | Detects whether live price movement is losing customers at the moment it happens. | If elevated, FR-19a attribution needs work |
| Reliability | On-time dispatch against published cut-off | Straightforward with stock shipping; no excuse for failure. | Above 98% |
| Retention | Repeat purchase rate at 6 and 12 months | North star. Drives lifetime value and reduces acquisition dependence. | Rising quarter on quarter |
| Economics | Cost per delivered and paid order | COD refusals make order-count metrics misleading. | All acquisition spend judged on this, never on orders placed |
| Economics | Return rate by reason and by colourway | Distinguishes colour failures from change-of-mind returns. | Colour-driven returns are a defect; change-of-mind is a cost of trust |
| Economics | COD refusal rate by district | Identifies where COD is uneconomic. | Restrict or require prepayment where persistently high |
| Economics | Standalone jacket attachment and repeat rate | Tests whether the standalone line drives reactivation as intended. | Track separately from saree orders |
| Trust | Photo reviews collected per 100 delivered orders | Trust assets compound and cannot be retrofitted later. | Explicit collection target from the first order |
| Service | WhatsApp first-response time | The consultative layer supports the premium position. | Published commitment measured daily |

9. Risks, Assumptions and Dependencies

9.1 Risk Register

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Composited preview misleads on colour, generating complaints on the brand's best feature | High | High | FR-22 disclosure note; OPS-12 validation of every preview against real fabric; guarantee scoped explicitly in 6.1; direct link to true photography at the point of selection. |
| Configurator build overruns and delays launch | High | High | Phased release. Phase 1 ships commerce without the configurator, so revenue is not gated on the hardest build. |
| Inventory divergence between catalogue and configurator produces out-of-stock orders | Medium | High | Single source of truth (OPS-05); live availability enforcement in the configurator (FR-27); automatic disabling below threshold (OPS-06). |
| Choice paralysis across hundreds of combinations | Medium | Medium | Curated suggested pairings (FR-25); strong filtering; Path A catalogue remains the default for customers who want a decision made for them. |
| Configurator too heavy for low-end devices and mobile data | High | Medium | NFR-02 and NFR-03 targets; mandatory static fallback (FR-24); Path A fully usable without the configurator. |
| Customer surprised that the jacket ships unstitched | Medium | High | Explicit statement on every listing (FR-06), at checkout (FR-39), and on the printed card in the parcel (FR-48). |
| Working capital tied up across the design and colour range | Medium | Medium | Two materials keeps the footprint far smaller than a wide fabric range. Defined minimum stock thresholds; quarterly retirement of slow-moving designs (OPS-08); buffer stock only on proven sellers. |
| A design does not recolour convincingly | Medium | High | Validate every design across the full colour range before publication. Any design that fails becomes fixed-colourway, or is cut from the set. |
| Live price movement reads as arbitrary or as a hidden charge | Medium | High | FR-19a requires the reason for every price change to be legible at the moment it happens; FR-19b shows the material upgrade cost before the switch. |
| Colour drift between fabric lots breaks both the guarantee and the preview | Medium | High | Reference frame per lot; mandatory re-photography and texture update on lot change (OPS-03). |
| Cotton supply disruption or price volatility | Medium | High | Two suppliers per core cotton type; buffer stock on top sellers; quarterly pricing review. |
| Rising paid-social acquisition cost | High | Medium | Build owned channels early — WhatsApp lists, email, SEO, organic short-form video. The configurator is inherently shareable content. |
| A public complaint damages a young brand disproportionately | Medium | High | Published complaints process with stated response time; resolve visibly and generously. |
| Configurator copied by a competitor once proven | Medium | Medium | Move fast; the 360° capture library and material texture library are real assets that take time to build. Depth of range is the moat, not the code. |

9.2 Key Assumptions to Validate

[ASSUMPTION] That layered compositing produces a preview convincing enough to drive purchase confidence. Validate with a small pilot render set against real fabric before committing to the full build.

[ASSUMPTION] That customers will engage with a configurator rather than defaulting to the simpler paired catalogue. Measure engagement and completion rates from launch.

[ASSUMPTION] That the pairing choice justifies a price premium over informal Facebook sellers. Test with a controlled price experiment during Phase 1.

[ASSUMPTION] That the Osariya toggle drives meaningful engagement rather than being a novelty. Track usage rate as a strategic signal for Phase 4.

[ASSUMPTION] That the confirmed design set is large enough to make the configurator feel rich while remaining affordable to produce as tintable assets. Design count is pending — see Q1.

[ASSUMPTION] That every design in the set is genuinely recolourable without looking wrong. Approach (a) has been confirmed by the founder, but any multi-colour printed artwork in the set would break the assumption and need fixed colourways instead.

[ASSUMPTION] That customers understand and accept live price movement in the configurator. Test abandonment after price increases during Phase 2.

9.3 Dependencies

| Dependency | Owner | Required by |
| --- | --- | --- |
| Two cotton suppliers confirmed per core type | Sourcing | Before Phase 1 launch |
| Two couriers contracted with zone coverage confirmed | Fulfilment | Before Phase 1 launch |
| Payment gateway with COD, bank transfer, LankaQR and card enabled | Product / Finance | Before Phase 1 launch |
| Standardised daylight photography setup and written protocol | Marketing | Before catalogue build |
| Single-source-of-truth inventory system | Technical | Before Phase 1 launch |
| Trilingual copy for all policies and transactional messages | Marketing | Before Phase 1 launch |
| Business registration and published contact details | Founder | Before Phase 1 launch |
| WhatsApp Business account with staffed coverage hours | Service | Before Phase 1 launch |
| 360° model capture in both drape styles, with layer masking | Marketing / Technical | Before Phase 2 |
| Material texture and swatch library for every colourway | Marketing | Before Phase 2 |
| Configurator development resource identified and briefed | Technical | Before Phase 2 build starts |

10. Open Questions for Decision

These require a founder decision before this PRD can move from draft to approved.

| # | Question | Why it matters | Decision needed by |
| --- | --- | --- | --- |
| Q1 | How many designs are in the pre-defined set, and how many colours per design? | Confirmed: two cotton materials, designs pre-defined and recolourable. The design count and colour count determine total SKU count, pattern-asset production effort and working capital. This is the last blocking unknown. | Immediately — blocks catalogue build |
| Q1a | What is the price difference between Plain Cotton and Super Cotton, and is it flat across designs or proportional? | Determines the price matrix structure and how FR-19b presents the upgrade. | Before Phase 1 launch |
| Q2 | Is the composited-preview approach approved, or is pre-rendered photography or 3D preferred? | The single largest build decision. Determines Phase 2 cost, timeline and preview fidelity. | Before Phase 2 planning |
| Q3 | How is price banded across designs — flat per design, or tiered by design complexity? | Determines the price matrix, the configurator display logic and the entire margin model. | Before Phase 1 launch |
| Q4 | Is jacket material priced into the paired listing, or shown as a separate line? | Affects perceived value, comparability against competitors, and the standalone jacket price point. | Before Phase 1 launch |
| Q5 | What is the standalone jacket price point and minimum-order or delivery rule? | Item value may be lower than delivery cost, making the line loss-making without a rule. | Before Phase 1 launch |
| Q6 | Where does the Facebook page fit — storefront, or acquisition channel feeding the website? | Determines whether the site is essential at launch or whether Phase 1 can run partly on social plus WhatsApp. | Immediately |
| Q7 | Who builds the configurator — in-house, local agency, or an existing platform extension? | Drives Phase 2 timeline, cost and long-term maintainability. | Before Phase 2 |
| Q8 | Will the paired catalogue and the configurator share one price, or will configured orders carry a premium? | A premium monetises the differentiator but may suppress its use and the data it generates. | Before Phase 2 |
| Q9 | Is there a physical location where customers can see fabric in person? | Would materially strengthen trust and support the swatch service. | Before Phase 1 launch |
| Q10 | Who is accountable for the photography protocol and its consistency over time? | Colour consistency is the foundation of both the guarantee and the preview. It needs a named owner. | Before catalogue build |

11. Appendix

11.1 Requirements Summary by Priority

| Priority | Count | Notes |
| --- | --- | --- |
| MUST (functional) | 41 of 51 functional requirements | Define the Phase 1 and Phase 2 releases. None can be dropped without a recorded decision. |
| SHOULD (functional) | 7 of 51 | Target where capacity allows; otherwise the following phase. |
| COULD (functional) | 3 of 51 | Phase 3 or later. |
| Non-functional | 10 | All apply from the phase in which the relevant surface ships. |
| Operational | 19 | OPS-01 to OPS-08 and OPS-14 to OPS-19 are Phase 1. OPS-09 to OPS-13 are Phase 2 prerequisites. |

11.2 Requirements by Phase

| Phase | Functional requirements | Focus |
| --- | --- | --- |
| Phase 1 — Commerce Foundation | FR-01 to FR-11, FR-29 to FR-51 | Paired catalogue, standalone jackets, checkout, trust layer, fulfilment |
| Phase 2 — Design Your Own Saree | FR-12 to FR-28 | Configurator, 360° preview, drape toggle, live stock enforcement |
| Phase 3 — Scale | Material expansion, diaspora shipping, loyalty | Growth on a proven base |
| Phase 4 — Extension | Preview upgrade, bridal vertical, physical space | Category and fidelity expansion |

11.3 Glossary

| Term | Definition |
| --- | --- |
| Jacket material | The unstitched fabric piece supplied for making the upper garment worn with a saree. Lunara uses 'jacket' per the founder's brief; 'blouse' is more common in the wider market and should be used in customer-facing copy where it aids search visibility. |
| Saree design | A pre-defined pattern, selectable independently of material and colour. Recolourable: the same design renders in any available saree colour. |
| Plain Cotton / Super Cotton | The two cotton qualities offered. Material affects texture, fall and price, but never length or drape compatibility. |
| Price matrix | The authoritative mapping of every design and material combination to its price. Catalogue and configurator both resolve from it. |
| Paired saree | A catalogue listing where Lunara has pre-selected the design, material, colour and jacket material. Path A. |
| Configured saree | A combination of design, material, colour, jacket and drape assembled by the customer in the configurator. Path B. |
| Drape style | Either standard saree drape or Kandyan Osariya. A visualisation toggle only — both use the same material and the same saree length. |
| Layered compositing | The recommended preview technique: one 360° model capture per drape style, with saree and jacket rendered as swappable colour and texture layers. |
| Reference frame | One unedited, natural-daylight photograph per fabric lot, against which colour claims are judged. |
| Opacity rating | A published three-point scale (opaque / semi-sheer / sheer) addressing pain point A3 from the market research. |
| GSM | Grams per square metre — the standard measure of fabric weight, published to help customers judge cotton substance. |
| COD | Cash on delivery. Close to 80% of Sri Lankan online order payments, per the market research. |
| Single source of truth | One authoritative stock record read by both catalogue and configurator, preventing divergence. |

11.4 Related Documents

Sri Lankan Online Saree Market — Market Research Report (July 2026). Provides the market sizing, persona definitions, competitor tiers, pain point clusters and pricing bands referenced throughout this PRD.

Lunara Sarees PRD v1.0 and v2.0 — both withdrawn. Superseded in full by this document. See Section 0.2.

Lunara Sarees Facebook page — facebook.com/profile.php?id=61585275432968. Not machine-readable at the time of writing; live content should be reconciled against Section 1 before approval.

11.5 Approval

| Role | Name | Decision | Date |
| --- | --- | --- | --- |
| Founder / Product Owner |  |  |  |
| Operations lead |  |  |  |
| Web / Technical lead |  |  |  |
| Marketing lead |  |  |  |
