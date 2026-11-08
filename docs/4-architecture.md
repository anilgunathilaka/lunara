# Lunara Sarees - Technical Architecture

LUNARA SAREES

❋

DOCUMENT 4 OF 6

Technical Architecture

System design, data model, rendering pipeline, and integrations

Version 2.0  ·  July 2026

Supports UX Specification v2.0 and Component Library v2.0

Status: Draft for approval

Table of Contents

1. Architectural Principles

| # | Principle | Consequence |
| --- | --- | --- |
| 1 | Stock integrity is the hard constraint | Catalogue and configurator read one authoritative stock record. A customer must never be able to design something unbuyable. This shapes the data model more than any other requirement. |
| 2 | Mobile network conditions are the design target | A mid-range Android on mobile data is the reference device. Payload budgets, image strategy and progressive loading follow from this, not from desktop convenience. |
| 3 | The configurator degrades, never blocks | If the renderer fails, the customer still buys. Fallback is a first-class path, not an error branch. |
| 4 | Colour fidelity is a system property | Colour management runs end to end: capture, storage, delivery, render. A colour-managed pipeline is a contractual requirement, not a nicety. |
| 5 | Boring technology where possible | The configurator is the only place that warrants novel engineering. Everything else uses proven, well-supported tooling. |
| 6 | Composable, not monolithic | Commerce, media and rendering are separable so that any one can be replaced without rewriting the others. |

2. System Overview

┌──────────────────────────────────────────────────────────┐

│                    CLIENT (mobile-first)                  │

│   Next.js · React · Design tokens · Component library     │

│   ┌────────────┐  ┌──────────────┐  ┌─────────────────┐  │

│   │ Catalogue  │  │ Configurator │  │ Cart & Checkout │  │

│   └────────────┘  └──────────────┘  └─────────────────┘  │

└───────────────┬──────────────────────────────────────────┘

│ HTTPS / JSON

┌───────────────▼──────────────────────────────────────────┐

│                    APPLICATION LAYER                      │

│  Catalogue API · Configurator API · Cart & Order API      │

│  Stock Service (single source of truth)                   │

│  Notification Service · Pricing Service                   │

└───┬──────────┬──────────┬──────────┬─────────────┬───────┘

│          │          │          │             │

┌───▼───┐ ┌────▼────┐ ┌───▼────┐ ┌───▼─────┐ ┌────▼──────┐

│  DB   │ │  MEDIA  │ │ RENDER │ │ PAYMENT │ │ MESSAGING │

│Postgres│ │ CDN +  │ │ Compos-│ │ Gateway │ │ SMS +     │

│       │ │ imaging │ │ itor   │ │ + COD   │ │ WhatsApp  │

└───────┘ └─────────┘ └────────┘ └─────────┘ └───────────┘

2.1 Technology Selections

| Layer | Selection | Rationale |
| --- | --- | --- |
| Frontend | Next.js with React, server-rendered catalogue, client-side configurator | SSR gives fast first paint and SEO on catalogue pages — critical for the high-intent local search terms identified in the market research. The configurator is inherently interactive and runs client-side. |
| Styling | CSS custom properties with a utility layer | Tokens from Document 2 map directly to custom properties, making the lint rule against raw values enforceable. |
| Commerce | Headless commerce platform or a bespoke Node service | Either is viable. The decision hinges on whether COD, LankaQR and bank-transfer reconciliation can be modelled cleanly — see Section 9. |
| Hosting | Cloudflare Workers via the OpenNext adapter (`@opennextjs/cloudflare`), deployed with Wrangler | Runs the full Next.js server (middleware, Route Handlers, SSR) at the edge on the Workers Free plan. OpenNext keeps Next's own `next build` / `next dev`, so local development is unchanged. Cloudflare Pages (static only) cannot serve this app. See §2.3 for plan limits. |
| Database | PostgreSQL, hosted on Supabase, accessed only through Prisma (driver adapter `@prisma/adapter-pg`) via Cloudflare Hyperdrive in production | Relational integrity matters here. Stock consistency across two purchase paths is a transactional problem, not a document-store problem. Supabase is used as managed Postgres only — its Auth, Storage and client-side data APIs are not used (see §2.2). |
| Auth | Better Auth (Prisma adapter, same database), passwordless sign-in (email one-time code or magic link) | Optional account layer offered after purchase, never before (PRD FR-33), pre-filled from the order email. Session and user tables live in the same Postgres as orders, so no second identity store is kept in sync. Passwordless because password hashing (scrypt, ~40–170 ms CPU) cannot fit the Workers Free plan's 10 ms CPU budget, and weakening the hash is not acceptable. |
| Media | Cloudflare R2 object storage behind a CDN with on-the-fly image transformation | 25+ materials × colourways × 6 assets is a large library that must be served at multiple sizes with colour management intact. R2 has no egress charge, which matters for an image-heavy catalogue and frame sequences. Local filesystem storage substitutes in development. |
| Rendering | Server-side compositor with an aggressive cache | See Section 5. Client-side compositing is rejected on payload grounds for the target device. |
| Messaging | WhatsApp Business API plus a local SMS gateway | Both are required by Document 1. Email is supplementary and never the sole channel. |

2.2 Provider Constraints

| Provider | Constraint |
| --- | --- |
| Supabase | In production the Worker reaches Postgres only through Hyperdrive (below), never with a raw connection string. Locally, the app uses `DATABASE_URL` (transaction pooler, port 6543); migrations use `DIRECT_URL` (session pooler, port 5432 — the direct host is IPv6-only and unreachable from many local networks). Migrations are run from a developer machine or CI, never from the Worker. Supabase Auth, Storage, Realtime and the auto-generated REST/GraphQL Data API stay disabled or unused — all data access goes through server code and Prisma, so stock and price keep one source of truth. |
| Cloudflare Hyperdrive | Config `lunara-db-direct` points at Supabase's direct host (Cloudflare's recommendation; Hyperdrive does its own pooling, so pooled Supabase URLs would double-pool). Query caching is DISABLED: stock and price must never be served from a stale cache. The database password lives in the Hyperdrive config, not in the Worker. Prisma clients are created per request on the Worker (reusing one across requests with Hyperdrive hangs the Worker). |
| Cloudflare R2 | On the Worker, accessed through an R2 binding (no API keys in the Worker). The S3-compatible API with scoped keys remains available for local scripts. Server code only; credentials never reach the client. Originals are stored byte-for-byte (no processing on upload), so the embedded colour profile is preserved at rest. Any delivery-time transform must preserve that profile (§4) — verified by the publication-gate check, not assumed from provider defaults. |
| Local dev | `next dev` as before. With no R2 binding or credentials, storage writes to `.blob-storage/` on disk (git-ignored). Same interface as R2, so no calling code branches on environment. |

2.3 Hosting Constraints (Workers Free plan)

| Limit | Value | Design consequence |
| --- | --- | --- |
| CPU per request | 10 ms | Catalogue and policy pages are prerendered (`generateStaticParams`) and served as static assets — no Worker CPU. Worker requests are kept light; anything CPU-heavy (password hashing, image processing) does not run on the Worker. Measured: a warm Hyperdrive query costs ~3–4 ms CPU. |
| Requests | 100,000 / day (static assets excluded) | Rate-limit `/api/*` at the edge; abuse is an availability risk, not just a cost one. |
| Hyperdrive queries | 100,000 / day | Pages must not query the database when a prerendered page will do. |
| Database round trip | ~300 ms (Supabase region: Tokyo) | Prerender wherever possible; dynamic reads are reserved for stock checks, cart, checkout and accounts. |

Moving to Workers Paid ($5/month) lifts the CPU and request caps without code changes; it is the fallback if measured CPU does not fit.

3. Data Model

The model separates materials from colourways from pairings. This separation is what allows a curated listing and a customer-configured design to draw from the same stock without divergence.

SAREE_DESIGN            COTTON_MATERIAL       JACKET_MATERIAL

id                      id ('plain'|'super')   id

name                    name                   name

pattern_asset_url       gsm                    composition

placement_map           texture_overlay_url    piece_length_m

occasion_tags []        opacity_rating         texture_tile_url

active                  length_m               active

│                    active                    │

│                       │                      │

└───────┬───────────────┘                      │

▼                                      │

PRICE_MATRIX                                  │

design_id + material_id → price             │

(authoritative; catalogue AND configurator  │

both resolve from here)                    │

│                                      │

SAREE_COLOURWAY                          JACKET_COLOURWAY

id                                       id

design_id ──┐                            material_id

material_id │                            colour_name

colour_name │                            colour_hex

colour_hex  │                            lot_id

lot_id      │                            swatch_url

reference_frame_url                      texture_tile_url

gallery_assets []                        sku

sku                                         │

│                                        │

└────────────┬───────────────────────────┘

▼

STOCK_ITEM  ◄── single source of truth

sku · quantity · threshold · state

│

┌────────────┴────────────┐

▼                         ▼

CURATED_LISTING          CONFIGURED_DESIGN

id                       id

saree_colourway          design_id

jacket_colourway         material_id

name · is_featured       saree_colourway

(price from matrix)      jacket_colourway

drape_style

share_token · created_at

(price from matrix)

3.1 Why This Shape

| Decision | Reason |
| --- | --- |
| Design, material and colour are three separate entities | A design carries the pattern and its placement. A material carries physical properties (GSM, opacity, length) shared by every design made in it. A colourway carries the colour, its lot and its photography. Keeping them separate is what makes designs recolourable without duplicating pattern data per colour. |
| Only two COTTON_MATERIAL rows exist | Plain Cotton and Super Cotton. Modelling material as a table rather than an enum keeps GSM, opacity and length as data rather than code, and leaves room for a third quality later without a migration. |
| PRICE_MATRIX is a first-class table | Price is a function of design AND material, not a column on either. A single authoritative matrix means the catalogue and the configurator can never quote different prices for the same combination — the failure that would most damage trust in live pricing. |
| STOCK_ITEM keyed on SKU, referenced by both paths | This is the architectural expression of Principle 1. A curated pairing does not hold its own stock; it points at the same colourway stock the configurator reads. Divergence becomes structurally impossible rather than a synchronisation problem. |
| CONFIGURED_DESIGN is a first-class record | Designs must be saveable and shareable without an account (UX-C12). A share token on a persisted record achieves this without authentication. |
| drape_style lives on the configured design, not on stock | Osariya uses the same design, material and length. It never affects stock, price or the item shipped — it is a rendering property only. |
| Colour does not affect price | Because designs are recolourable, colour is a render-time operation with no distinct production cost. Pricing on colour would be arbitrary and hard to explain. |
| lot_id on every colourway | Colour drift between fabric lots breaks both the guarantee and the preview. Lot tracking makes re-photography on lot change enforceable (PRD OPS-03). |

3.2 Stock Rules

| Rule | Implementation |
| --- | --- |
| Single source of truth | All availability reads resolve to STOCK_ITEM. No cached copy is authoritative. Catalogue and configurator use the same endpoint. |
| Threshold disabling | When quantity falls at or below threshold, the colourway is automatically marked low-stock; at zero it is disabled in every picker. No manual intervention. |
| Reservation | Stock is reserved at add-to-cart for a bounded window, not at checkout. This prevents the customer who spent time configuring from losing the design at the final step. |
| Configured designs survive stock loss | If a saved design's colourway sells out, the design record persists and renders, with the unavailable element flagged and the nearest alternative suggested on the same axis. |
| Stock is held at colourway level | A design in Super Cotton in emerald is a distinct stock line from the same design in Plain Cotton in emerald. Stock therefore keys on the colourway SKU, which already encodes design and material. |
| Consistency | Stock decrements are transactional. Concurrent orders on the last unit resolve deterministically, never optimistically. |

4. Colour Management Pipeline

Colour is a contractual property of this product. The pipeline below exists so that what is captured, what is displayed, and what is delivered stay in agreement.

CAPTURE            Daylight, fixed protocol, colour target in frame

│               Camera profile locked (PRD OPS-10)

▼

MASTER             sRGB, embedded profile, lossless archive

│               ├── reference_frame  ← NEVER retouched, contractual

│               ├── gallery assets   ← dust removal only

│               └── texture tile     ← for the compositor

▼

DELIVERY           CDN transform: resize, format negotiate

│               Colour profile PRESERVED through every transform

▼

RENDER             Product imagery: displayed as-is, no filter

Preview: composited approximation, labelled as such

| Requirement | Specification |
| --- | --- |
| Profile preservation | Every CDN transform preserves the embedded colour profile. Profile stripping for payload savings is prohibited — it is the exact failure the guarantee is written against. |
| Reference frame immutability | The reference frame is stored write-once. Any change requires a new lot record. It is evidence in a colour claim, so its provenance must be traceable. |
| Texture tile derivation | Tiles derive from the same master as the photography, so the compositor and the gallery share a colour source rather than drifting apart. |
| Validation gate | Before a colourway goes live, its composited preview is compared against the physical fabric and the reference frame. Drift beyond tolerance blocks publication (PRD OPS-12). |
| Lot change | A new fabric lot triggers re-photography and a texture update before continued sale. Enforced by lot_id on the colourway record. |

5. The 360° Preview Pipeline

The most demanding component in the system. The approach follows the layered-compositing decision recorded in PRD Section 4.4.

5.1 Asset Production

ONE-TIME CAPTURE  (per drape style — two total)

Model photographed on a turntable, N frames per full rotation

├── standard saree drape   → N base frames

└── Kandyan Osariya drape  → N base frames

For EACH frame, produce:

├── base layer      model, background, skin, non-garment

├── saree mask      alpha for the saree region

├── jacket mask     alpha for the jacket region

├── placement map   UV-style guide: border / pallu / body

└── shading map     luminance for folds, shadow, drape depth

PER-DESIGN ASSET  (once per design, no model shoot)

└── tintable pattern asset + placement rules

PER-MATERIAL ASSET  (two total)

└── texture overlay expressing weave: Plain vs Super

RUNTIME COMPOSITE  (per frame, per combination)

base

+ ((design pattern → placement map)

× saree colour        ← recolouring, approach (a)

× material texture)   ← Plain or Super weave

masked by saree mask

+ (jacket texture × jacket colour) masked by jacket mask

× shading map          ← preserves fold and drape realism

= rendered frame

Two multiplications carry the realism. The shading map preserves the fold structure of the original capture, so the fabric reads as draped cloth rather than a coloured silhouette. The material texture overlay is what visually distinguishes Super Cotton from Plain — without it, the customer sees no difference and the upgrade price looks unjustified.

Because designs are recolourable, colour costs nothing in capture: it is a tint applied at render time. This is what makes a four-axis configurator affordable. Only design and material require distinct asset production, and neither requires a new model shoot.

5.2 Rendering Strategy

| Option | Assessment | Verdict |
| --- | --- | --- |
| Client-side canvas compositing | Zero server cost and instant response after load, but requires shipping base frames, masks and shading maps to the device. At N frames × multiple layers this is far beyond the mobile payload budget. | Rejected on payload |
| Server-side compositing with CDN cache | Server composites on demand and caches the result at the edge. First request for a combination is slower; every subsequent one is a static fetch. Payload to device is a plain image sequence. | SELECTED |
| Full pre-render of all combinations | Every combination rendered ahead of time. Storage becomes very large and every new material triggers a full re-render. | Rejected on storage and agility |
| Hybrid: pre-render popular, composite the rest | Pre-render curated and historically popular pairings; composite the long tail on demand. | Recommended optimisation once usage data exists |

5.3 Performance Strategy

| Technique | Specification |
| --- | --- |
| Progressive frame loading | Load a small number of frames covering the primary viewing angles first; make the preview interactive immediately; load remaining frames in the background. |
| Resolution tiering | Serve a lower resolution during active rotation and swap to full resolution on rest. The customer cannot resolve detail mid-drag. |
| Predictive caching | On hover or focus of any axis option, begin compositing that combination before it is selected. Material is the highest-value prediction, since there are only two states and the customer frequently compares them. |
| Format negotiation | Serve modern formats where supported, with fallbacks. Colour profile preserved in every format. |
| Cache keys | Keyed on design, material, saree colour, jacket colourway, drape style and frame index. Deterministic and edge-cacheable indefinitely. |
| Budget | Under 5s to interactive on a mid-range Android over mobile data; under 500ms per selection change once loaded. |

5.4 Degradation Ladder

| Condition | Behaviour |
| --- | --- |
| Full capability | 360° rotation, live compositing, all frames. |
| Slow network detected | Reduced frame count, lower resolution. Rotation remains available but stepped. |
| Compositor unavailable | Static paired imagery from the curated library. FallbackNotice shown. Purchase fully available. |
| Client cannot render | Server-rendered static preview. Configurator remains operable through the pickers. |
| Total failure | Redirect to the curated catalogue with a plain explanation. The customer can still buy. |

Every rung of this ladder keeps the purchase available. Principle 3 is absolute: the configurator degrades, it never blocks.

6. Integrations

| Integration | Purpose | Notes |
| --- | --- | --- |
| Payment gateway | Card and LankaQR | Must support local card issuance. PCI compliance is the gateway's responsibility; no card data is stored by Lunara. |
| Bank transfer reconciliation | Manual or semi-automated matching of transfers to orders | First-class payment path per Document 1. Needs an operations tool, not merely a bank account number on a page. |
| COD | Cash collected by courier | Requires courier reconciliation, refusal tracking by district, and a fee model. See Section 7. |
| WhatsApp Business API | Order notifications and the service channel | Template messages require pre-approval; plan lead time. Session messaging governs the service line. |
| SMS gateway | Order notifications | Local provider. Must support Sinhala and Tamil character sets correctly. |
| Courier APIs | Dispatch, tracking, zone estimates | At least two couriers per PRD OPS-15. Abstract behind one internal interface so a courier can be swapped without touching order code. |
| Analytics | Behaviour and funnel measurement | Must capture the configurator metrics defined in PRD Section 8, including drape-toggle usage. |
| Reviews | Verified photo reviews | Must support image upload and public responses to criticism. |

6.1 Notification Architecture

ORDER EVENT  →  Notification Service

│

├── template selection (by event + language)

├── channel routing

│     ├── WhatsApp  (primary)

│     ├── SMS       (parallel for key events)

│     └── Email     (supplementary only)

└── delivery logging + retry

Events: placed · packed · dispatched · out_for_delivery ·

delivered · d+1 · d+3 · d+14 · d+45

WhatsApp and SMS run in parallel for order placed, dispatched and out-for-delivery. Email is never the sole channel for a transactional message.

Templates exist in all three languages. Language is selected from the customer's stored preference, defaulting to the language of the session in which the order was placed.

Delivery failures retry with backoff and are logged. A customer who receives no notification is a support ticket and a trust failure.

7. Commerce Logic

7.1 Pricing

| Rule | Implementation |
| --- | --- |
| Price resolution | Price for any combination resolves from PRICE_MATRIX on design plus material, with any jacket material difference added. Catalogue and configurator resolve from the same matrix, so the two paths can never disagree. |
| All-in display | Displayed price is always saree plus jacket material. Delivery and any COD fee are shown before checkout, never revealed at the final step. |
| Configured pricing | Resolves from the same matrix as the catalogue. The API MUST return not only the new price but the CAUSE of the change — design, material or jacket — so the client can attribute it (UX-C10a). Attribution computed client-side from a diff is fragile and will drift. |
| Material delta | The API MUST expose the Plain-to-Super price difference for a given design, so the material selector can show it before selection (UX-C10b). |
| Parity at launch | Configured designs price the same as curated pairings per UX-Q2. A premium would suppress the usage data needed to prove the feature works. |
| COD fee | A transparent, itemised fee, waived on prepayment. Modelled as an order-level adjustment, never folded silently into the item price. |
| Delivery | Zone-based from district. Free-delivery threshold configurable to lift average order value. |
| Standalone jackets | A minimum-order or flat-rate delivery rule applies, since item value can otherwise fall below delivery cost. |

7.2 Order Lifecycle

placed → confirmed → packed → dispatched → delivered

│         │                                  │

│         └── payment_pending (bank transfer)│

│                                            ▼

└── cancelled                    return_requested

│

┌───────┴───────┐

▼               ▼

refunded         exchanged

| State | Trigger | Notification |
| --- | --- | --- |
| placed | Checkout completed | SMS + WhatsApp |
| payment_pending | Bank transfer selected | WhatsApp with transfer details |
| confirmed | Payment verified, or COD accepted | WhatsApp |
| packed | Warehouse action | WhatsApp |
| dispatched | Courier handover | SMS + WhatsApp with tracking |
| delivered | Courier confirmation | Triggers the d+1 sequence |
| return_requested | Customer initiates | WhatsApp with collection detail |

7.3 COD Handling

COD accounts for close to 80% of Sri Lankan online order payments. It is a trust enabler and a margin risk simultaneously, and the system must treat it as both.

Refusal rate is tracked by district and surfaced operationally, so that prepayment can be required where COD is persistently uneconomic (PRD OPS-19).

High-value COD orders are flagged for phone confirmation before dispatch.

The COD fee and its waiver on prepayment are shown at the payment step, framed as a saving for prepaying rather than a penalty for COD.

8. Non-Functional Requirements

| Area | Requirement |
| --- | --- |
| Performance | Catalogue under 3s to first meaningful paint; configurator under 5s to interactive; selection change under 500ms. Measured on a mid-range Android with throttled network. |
| Availability | 99.5% monthly excluding planned maintenance. Catalogue and checkout must survive configurator failure. |
| Security | TLS throughout. No card data at rest. Customer contact data encrypted at rest with role-based access. |
| Privacy | Personal data limited to what fulfilment requires. A documented retention period. No sale or sharing of customer data. |
| Localisation | Full Sinhala, Tamil and English coverage across interface, transactional messages and policies. Correct language attributes and font loading per script. |
| Observability | Structured logging, error tracking, and the PRD Section 8 metrics instrumented from launch rather than retrofitted. |
| Backup | Daily database backup with a tested restore path. Media assets replicated — the reference frames are contractual evidence and their loss is unrecoverable. |
| SEO | Server-rendered catalogue with structured data. The market research identifies high-intent local search as a compounding acquisition channel. |

9. Risks and Open Decisions

9.1 Technical Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Compositor output is unconvincing and undermines confidence | High | Build a small pilot render set before committing to the full pipeline. Validate against physical fabric. The shading-map technique in Section 5.1 is the key quality lever. |
| Preview performance fails on target devices | High | Server-side compositing with edge cache; progressive frames; resolution tiering; a fully specified degradation ladder. |
| Stock divergence between paths | High | Structural prevention via a single STOCK_ITEM record rather than synchronisation between two stores. |
| Colour profile stripped in the media pipeline | High | Explicit preservation requirement plus an automated check in the publication gate. |
| Bank transfer reconciliation is manual and error-prone | Medium | Build the operations tool before launch. It is a first-class payment path, not an afterthought. |
| WhatsApp template approval delays launch | Medium | Submit templates early; SMS carries transactional messaging if approval slips. |
| Configurator asset production is underestimated | High | Two capture sessions plus per-frame masking and placement mapping is significant production work. Per-design pattern assets add ongoing effort. Schedule as a Phase 2 dependency with its own timeline. |
| A design does not recolour convincingly | High | Validate every design across the full colour range before publication. Any design that fails becomes fixed-colourway or is cut. This is the assumption the whole four-axis model rests on. |
| Plain and Super look identical in the preview | Medium | The material texture overlay must be visibly distinct, or the upgrade price is unjustifiable on screen. Validate side by side before launch. |
| Catalogue and configurator quote different prices | High | Structurally prevented by resolving both from PRICE_MATRIX. Never compute price in the client. |

9.2 Open Technical Decisions

| # | Decision | Recommendation |
| --- | --- | --- |
| T1 | Headless commerce platform or bespoke service? | Evaluate against COD, LankaQR and bank-transfer modelling. Many platforms handle these poorly for this market; a bespoke order service may be simpler than fighting an opinionated platform. |
| T2 | How many frames per rotation? | Enough for smooth reading during drag, balanced against production and storage. Pilot at a lower count and increase only if rotation reads as stepped. |
| T2a | Is the design pattern applied as a flat tint or with per-channel recolouring? | Flat tint is cheaper and adequate for single-colour motifs. Per-channel recolouring preserves multi-tone designs. Pilot both against the actual design set before committing. |
| T3 | Pre-render popular combinations or composite everything on demand? | Composite everything at launch; introduce pre-rendering for curated and popular pairings once usage data identifies them. |
| T4 | Does the preview run on the same infrastructure as the storefront? | Separate. Configurator load must never degrade catalogue or checkout availability. |
| T5 | Which courier integrations first? | The two with strongest complementary zone coverage. Abstract behind one interface so the second can be swapped without touching order code. |
| T6 | Where is the compositor hosted relative to customers? | Edge-cached output matters more than compositor location, since first-render latency is amortised across every subsequent request for that combination. |
