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
| CPU per request | 10 ms | Policy, support and other content pages are prerendered and served as static assets — no Worker CPU. Catalogue pages render per request because price and stock must be live (§3.3), so each loads its data in one query. Worker requests are kept light; anything CPU-heavy (password hashing, image processing) does not run on the Worker. Measured: a warm Hyperdrive query costs ~3–4 ms CPU. |
| Requests | 100,000 / day (static assets excluded) | Rate-limit `/api/*` at the edge; abuse is an availability risk, not just a cost one. |
| Hyperdrive queries | 100,000 / day | Pages must not query the database when a prerendered page will do. |
| Database round trip | ~300 ms (Supabase region: Tokyo) | Prerender wherever possible; dynamic reads are reserved for stock checks, cart, checkout and accounts. |

Moving to Workers Paid ($5/month) lifts the CPU and request caps without code changes; it is the fallback if measured CPU does not fit.

2.4 Deployment

| Rule | Detail |
| --- | --- |
| CI is the deploy path | GitHub Actions (`.github/workflows/ci.yml`). Every pull request and push: install, lint (ESLint + token lint), Worker build (which includes `next build` and its type check). Push to `main`: the same, then deploy to the `lunara` Worker. Any branch can be deployed manually ("Run workflow"). |
| No `.env` in a Worker build | OpenNext copies any `.env*` file in the project root into the Worker bundle. `npm run build:worker` refuses to build if one exists (`.env.example` excepted) and fails if the built bundle contains any env value. CI checkouts never contain `.env`, so a developer machine deploys only by exception, from a clean checkout. |
| Domain | `lunarasarees.com` (Cloudflare zone) is the public origin, attached to the Worker as a Custom Domain in `wrangler.jsonc`; `www` is attached and redirected to the apex. `BETTER_AUTH_URL` names it, so sign-in, email links and message links all use it. The `workers.dev` address is switched off (Wrangler disables it once routes are set); if it is re-enabled, it is sent `X-Robots-Tag: noindex`. Email is sent from `hello@lunarasarees.com`, verified in Resend. |
| Where configuration lives | Public values: `vars` in `wrangler.jsonc`. Secrets (`BETTER_AUTH_SECRET`, `RESEND_API_KEY`, `CRON_SECRET`): Worker secrets via `wrangler secret put`, set once and kept across deploys. Database credentials: the Hyperdrive config only. CI holds just `CLOUDFLARE_API_TOKEN` (secret) and `CLOUDFLARE_ACCOUNT_ID` (variable). |
| Migrations are not deployed | CI never runs `prisma migrate`. Schema changes are applied deliberately from a developer machine (`DIRECT_URL`), before the code that needs them is merged. |
| Cost | Free: GitHub Actions minutes on the repo's plan, Workers Free for the deploy itself. |

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

3.3 Implementation Rules (Prisma schema)

| Rule | Detail |
| --- | --- |
| Money | Integer LKR (whole rupees), never floating point. |
| Jacket pricing (PRD Q4/Q5) | JACKET_MATERIAL carries two prices: `pairing_add_on` (added to the matrix price whenever that jacket material is paired with a saree; may be 0) and `standalone_price` (the standalone line). Price is per jacket material, not per colourway: colour never affects price (§3.1). |
| Every colourway is priced | SAREE_COLOURWAY references PRICE_MATRIX on (design_id, material_id) by foreign key, so a colourway cannot exist for a combination that has no price. |
| One price function | `lib/pricing/resolve.ts` is the only code that turns matrix rows and add-ons into a customer price. Catalogue pages, the configurator and (later) checkout all call it on the server. The client receives prices; it never derives them. |
| Stock state is derived | STOCK_ITEM stores `quantity` and `threshold` only. `out` when quantity is 0, `low` when quantity ≤ threshold, otherwise `in`. Computed in `lib/stock/state.ts`; never stored, so it can never disagree with quantity. |
| Curated listing stock | A curated listing is available only if both its saree colourway and its jacket colourway are. Its state is the worse of the two; its "N left" count is the lower quantity. |
| Live reads | Catalogue pages (home arrivals, shop, product, jacket pages, configurator) read price and stock from Postgres on every request — they are not prerendered, so a price or stock change is visible on the next page load. Each page loads its data in a single query (Prisma `relationJoins`) to keep one database round trip per page. |
| Seed data | `prisma/seed.ts` loads the placeholder catalogue from `content/catalogue/seed-catalogue.ts`. It is idempotent (upserts) and is run deliberately, like a migration — never by CI or the Worker. |

3.4 Orders (Phase 1 checkout)

ORDER: number (`LUN-` + 6 characters, unambiguous alphabet) · status (§7.2) · payment_method · customer name, phone, optional email · address · district · optional advisory event date · `unstitched_acknowledged_at` (NOT NULL — an order cannot exist without the acknowledgement) · subtotal, delivery_fee, cod_fee, total (whole LKR, frozen at placement) · delivery estimate range · locale · hashed guest access token.
ORDER_LINE: kind (`listing` | `configured` | `jacket`) · the ids it was resolved from · the SKUs it consumed · a snapshot of the names shown to the customer · unit_price (frozen) · quantity · drape (configured lines only; rendering-only, §3.1).
ORDER_EVENT: one row per status change, with the actor — the order's history and the source for tracking and notifications.

| Rule | Detail |
| --- | --- |
| The server is the only authority | The client sends only references (listing id, jacket colourway id, or design + material + colour + jacket colourway) and quantities. Every price, fee and SKU is resolved on the server at quote time and again at placement. |
| Price changes are attributed, never silent | Placement carries the total the customer last saw. If the server total differs, the order is NOT placed: the client receives the new quote with each changed line marked (old → new price) and the customer confirms again. |
| Stock is taken at placement | Inside the order transaction, each SKU is decremented with a conditional update (`quantity >= n`); if any SKU is short the whole order rolls back and the affected lines are reported. Deterministic, never optimistic (§3.2). Reservation at add-to-cart (§3.2) follows when the cart moves server-side; until then the cart lives on the device. |
| Configured lines need a real stock line | A configured design is orderable only when its design + material + colour resolves to a SAREE_COLOURWAY. Otherwise the line is reported unavailable. |
| Guest access | The confirmation and tracking pages are reached with the order number plus a random token from the confirmation link; only the token's SHA-256 is stored. |
| Limits | At most 10 lines and 5 of any line per order, so a single request cannot drain stock. Edge rate limiting (§2.3) is the second layer. |

3.5 Operations Panel (`/[locale]/ops`)

| Rule | Detail |
| --- | --- |
| Who | Staff sign in with the same passwordless email code as customers. Access requires an active STAFF_MEMBER row for the signed-in email. Staff emails live only in the database (added with `npm run staff:add`), never in the repository. Every ops page AND every ops action checks this on the server; hiding a link is not access control. |
| Orders | List by status, newest first; detail with lines, history and the allowed next steps only (transition table in §7.2). Dispatch requires courier and tracking number. Every transition writes an ORDER_EVENT with the staff email as actor. |
| Bank transfers | The `payment_pending` queue with amount, reference (order number) and age; "payment received" confirms the order. Matching against the bank statement is manual in Phase 1. |
| Cancellation | Cancelling before dispatch returns the order's units to stock in the same transaction. Returned goods are inspected first, so refunds and exchanges never restock automatically — staff adjust stock explicitly. |
| Stock | Adjust by a signed amount with a reason (atomic; can never go below zero) and set the low-stock threshold. Never "overwrite the count", which would silently undo an order placed meanwhile. |
| Prices | Edit PRICE_MATRIX cells and each jacket material's pairing add-on and standalone price. Takes effect on the next page load; customers with the item in their cart see the change attributed inline (§3.4). |
| Audit | Stock and price changes write an AUDIT_LOG row (actor, entity, before, after). |
| Not indexed | `noindex` on every ops page. |

3.6 Customer Accounts and Tracking (`/[locale]/account`)

| Rule | Detail |
| --- | --- |
| Optional, after purchase | Guest checkout stays the only required path (PRD FR-33). The account is offered on the order page once the order exists, with the order's email pre-filled; sign-in is the same passwordless 6-digit code. A "My orders" link sits in the footer, and a person icon sits beside the cart in the header (docs/1-ux.md, founder decision 2026-11-09). Both go to `/[locale]/account/start`, which sends staff to `/ops`, customers to `/account`, and anyone signed out to sign-in and back; a plain sign-in with no return path lands there too. |
| Which orders an account sees | Orders linked to it (`order.userId`), plus orders nobody has linked that carry the account's verified email. Once an order is linked to one account it never appears in another. |
| Linking | Orders placed while signed in are linked at placement. A guest order is linked by "claiming" it: the claim must present the order's access token, the same proof that opens the guest order page, and only an unlinked order can be claimed. |
| Tracking | Progress (placed → confirmed → packed → with the courier → delivered) is derived from ORDER_EVENT, never stored twice. Courier and tracking number show once dispatched. The guest order page and the account show the same record from one component, so they cannot disagree. |
| Privacy | Account pages are `noindex` and dynamic. Someone else's order number returns 404, the same as one that doesn't exist. |
| Later | Saved designs (with the configurator on real data) and saved addresses. |

3.7 Product Photos (`/[locale]/ops/photos`)

| Rule | Detail |
| --- | --- |
| What is photographed | Per saree colourway: gallery photos (up to 8, staff-ordered; the first is the cover in the shop) and the colour reference frame (§4). Per jacket colourway: a swatch photo. Pattern assets and texture tiles for the configurator come with it (§5). |
| Stored as uploaded | Bytes go to R2 untouched: no resize, re-encode or metadata strip, so the embedded colour profile survives (§4). The format is identified from the file's own bytes (JPEG, PNG, WebP only; 12 MB max), never from its name. |
| Upload path | `POST /api/ops/media` with the file as the raw request body: no multipart parsing, so a phone photo costs the Worker almost no CPU. Staff only, same-origin only. One new random key per upload, so cached copies never go stale. |
| Keys, not URLs | The database stores the storage key; the public URL is resolved on read. Moving media to a custom domain changes one variable, not data. |
| Reference frame is write-once | It can be set only when empty, enforced in the database write itself, and there is no remove or replace. A new fabric lot means a new colourway record (§4 Lot change). |
| Audit | Every upload, removal, cover change and swatch replacement writes an AUDIT_LOG row. A replaced swatch's object is kept. |
| Shop | Product cards show the cover; the product page shows the gallery, then the reference frame labelled as such. Until a colourway is photographed, a single placeholder is shown with alt text saying so. Images are shown as-is: no filter, overlay or tint. |

3.8 Reviews (PRD FR-46, FR-49)

| Rule | Detail |
| --- | --- |
| Verified only | A review can be written only from a delivered order (also after a return or refund: unhappy customers must be able to review), one per order line, enforced by a unique key. |
| Signed link, no account | The day-14 message and the order page carry `/[locale]/review/[number]?s=…`, where `s` is an HMAC of the order number with the server secret. Nothing is stored; the link cannot be forged; a wrong link is a 404. |
| Works without JavaScript | The form is a plain multipart post to `POST /api/reviews`, which answers with a redirect. The runtime's native form parser handles the photos. |
| Photos | Up to 3, 8 MB each, JPEG/PNG/WebP sniffed from the bytes, stored untouched in R2 under `reviews/`. If the review fails to save, its photos are deleted. |
| Public, named, honest | Shown with the first name the customer chose, district, date and "Verified purchase". Phone and address are never shown. Reviews publish immediately and are never filtered by rating; the home page shows the newest, photo reviews first. |
| Criticism is answered, not removed | Staff reply publicly under the review. Hiding needs one of three recorded reasons (personal information, abusive language, not about the product); a low rating is not one. Replies and hide/show are audited. |
| Rating | 1 to 5, checked by the app and by a database constraint. Product pages show the count and average of published reviews. |
| Privacy | RLS on `review`, no policies (§2.2). Review pages are `noindex`. |

3.9 Insights (`/[locale]/ops/insights`, PRD §8)

| Rule | Detail |
| --- | --- |
| From recorded facts | Metrics are computed from orders, order lines, ORDER_EVENT and reviews already stored. No tracking script, no cookies, no third-party analytics. |
| In SQL | Each figure is one aggregate query run in parallel; the Worker never loops over every order (CPU budget, §2.3). |
| Counts beside shares | Every percentage shows its counts ("40% (2 of 5)"), so a small sample is not read as a trend. |
| North star | Repeat purchase within 6 and 12 months, customers matched by phone. Only customers whose first order is old enough count; until then it says "not measurable yet". Always all-time. |
| Definitions | Delivered revenue: totals of orders that reached the customer and were not refunded. Super Cotton upgrade: Super share of saree units. On-time dispatch: dispatched on the day of confirmation or the next, Colombo time (target above 98%). Photo reviews per 100 delivered orders. Returns by saree colour. COD by district. |
| Honest gaps | Shown as "not measured yet", with what is missing: configurator funnel and toggle use (needs the live configurator), colour complaints and return reasons (no reason captured), COD refusals (no "refused" outcome after dispatch), WhatsApp response time (outside the system), cost per order (costs not recorded). |

3.10 Product Management (`/[locale]/ops/products`)

| Rule | Detail |
| --- | --- |
| What staff manage | Saree products (a curated listing: design, cotton, colour, paired jacket, stock, price) and jacket colours (with a new or existing jacket material). New designs and jacket materials can be created from the same forms. |
| Price stays single-sourced | The saree price is the PRICE_MATRIX cell for its design × cotton, shared by every colour of that design in that cotton; the form says so. Jacket prices belong to the jacket material. Every price change is audited. |
| Archive, never lose history | Removing a product archives it (founder decision 2026-11-09): `active = false` on the listing and its saree colourway, which hides it from the shop, Design Your Own and checkout (the quote refuses archived colourways). It can be restored. A jacket colour paired in a live product cannot be archived. |
| Delete only the never-sold | Permanent delete is offered only when no order line refers to the item, and needs an explicit "can't be undone" confirmation, checked on the server. |
| Identifiers | Ids and SKUs are generated from names (`SAR-DESIGN-PLN-COLOUR`, `JKT-MATERIAL-COLOUR`), made unique, and never change afterwards; renaming a colour keeps its SKU. |
| Stock | Created with a starting quantity; changed afterwards only through the Stock page's audited, reasoned adjustments (§3.5). |

3.11 Costing (`/[locale]/ops/costs`)

| Rule | Detail |
| --- | --- |
| What is recorded | `product_cost`, one row per SKU (saree colour or jacket colour): fabric, other materials, sewing charges, transport, other — whole LKR per piece — plus a note. Entered on the product and jacket edit pages. |
| Staff-only, never a price | Costs are never sent to customers and never feed a customer price; customer prices stay in lib/pricing (§3.3). RLS on, no policies. |
| Margin | A shop product's cost is its saree cost plus its jacket cost, measured against the paired selling price; a jacket sold alone is measured against its standalone price. Profit = price − cost, margin = profit ÷ price. A SKU without a cost row is "not entered", never treated as free. |
| History | Every save is audited (`cost.update`, before and after). The row holds the current cost only. Deleting a never-sold product deletes its cost row with its stock row. |

3.12 Inventory and the stock ledger (`/[locale]/ops/stock`, `/[locale]/ops/stock/[sku]`)

| Rule | Detail |
| --- | --- |
| One place | The Inventory page (formerly Stock) lists every SKU — saree colours and jacket colours, archived included — with quantity on hand, units sold online, value at cost (quantity × unit cost, §3.11) and value at selling price (a saree at its design × cotton price, a jacket at its price on its own). Adjust and low-stock forms stay on the same page. Units sold in the office join it with office sales. |
| Still one source of truth | `stock_item.quantity` remains the only availability the shop, configurator and checkout read (§3.2). Nothing else holds a count to keep in sync. |
| Ledger | `stock_movement` is append-only: SKU, kind (opening, created, adjustment, online_sale, online_cancel, office_sale, office_return), signed delta, balance after, reference (order or office sale number), note, actor, time. Every quantity change goes through `lib/stock/movements.ts` `moveStock` in the same transaction as the change, so a count and its explanation commit together or not at all. Movements are never edited or deleted, except with their SKU when a never-sold product is deleted. |
| Opening balance | The ledger started on 2026-11-09 with one `opening` movement per SKU recording the quantity then held. Earlier changes remain in audit_log. The dev seed writes stock directly and is not a ledger source. |
| Sold online | Counted from order lines of every order not cancelled — the orders are the record of a sale; the ledger explains stock, not revenue. |

3.13 Office sales and instalments (`/[locale]/ops/office`)

| Rule | Detail |
| --- | --- |
| What is recorded | `office_customer` (name, normalised mobile — unique, so a returning customer is found again — address, note); `office_sale` (number `OFF-XXXXXX`, date, subtotal, discount + reason, total, who sold it); `office_sale_line` (snapshot of each item at the price charged); `office_instalment` (1–3 planned payments: due date, amount); `office_payment` (amount, date, method, reference, who received it). RLS on all, no policies. |
| Price: shop price + attributed discount | Items are chosen from live shop products and jackets sold alone; the server prices them with the shop's own `buildQuote`, so the office can never quote a different price for the same item (CLAUDE.md). A discount (founder decision 2026-11-09) needs a reason, can't exceed the shop price, and is shown beside the price on the sale. Database CHECKs enforce `total = subtotal − discount` and the reason. |
| Plan with due dates | 1–3 instalments. Due dates start on or after the sale date and run in order. Amounts are either all given and sum exactly to the total, or all blank and split evenly (remainder on the first). The plan can be changed later under the same rules; audited with before and after. |
| Paid and outstanding are derived | Never stored. Paid = sum of payments not voided; outstanding = total − paid. Payments are applied to instalments in order (`lib/office/plan.ts`), giving each one paid / part paid / due / overdue against today's date in Sri Lanka. A payment above what is owed is refused (the sale row is locked while checking). A mistaken payment is voided with a reason, never deleted. |
| Stock | Selling takes stock from the same `stock_item` the shop reads, through the ledger (`office_sale`, reference = sale number); a shortfall rolls the whole sale back. Cancelling (reason + explicit confirmation) returns it (`office_return`) and keeps payments on record so the refund owed is visible. The Inventory page shows units sold in the office beside units sold online. |
| Lists | Office sales filter by still owed / overdue / fully paid / cancelled / all, with totals still owed, overdue and due in the next 7 days. Each customer page shows their sales, paid and outstanding. |

Delivery and fees (`lib/commerce/delivery.ts`): every one of the 25 districts maps to a zone; each zone has a fee and an honest working-day range. The COD fee applies only to COD and is shown with its waiver. Values are PLACEHOLDERS until PRD Q5 and courier contracts settle them; they move to the operations panel with it. Payment methods offered now: COD and bank transfer. LankaQR and card appear when a payment gateway is contracted (§6).

3.14 Operations dashboard and frame (`/[locale]/ops`; founder request 2026-11-10)

The operations panel has its own frame (`app/[locale]/ops/OpsChrome.tsx`): the store's header, footer, bars and WhatsApp button are left out on /ops (SiteChrome passes those pages straight through). A --lun-plum-deep sidebar groups the sections: Overview; Sales (orders, bank transfers, office sales); Catalogue (products, inventory, prices, costs, photos); Customers (messages, reviews); Reports (insights). Beside a section it shows how much is waiting: orders needing action, bank transfers to check, messages to send (`opsBadges`, three counts). A white top bar names the page and shows who is signed in, with sign out; "View store" sits at the foot of the sidebar. On phones the sidebar is a drawer behind a menu button (Escape or the dimmed page closes it).

/ops is the dashboard (`lib/ops/dashboard.ts` `dashboardSnapshot`), read in one go from the same records every other ops page reads, nothing stored twice:
- Four figures: online sales and orders over the last 30 Sri Lankan days (cancelled and refunded orders excluded), with the change on the 30 days before in words with an arrow, never colour alone; orders needing action (placed, awaiting payment, confirmed, packed); the office balance due and how much of it is overdue.
- Online sales by day for 30 days: one plum bar a day; hover or focus shows the day, amount and orders, and the same figures are a table for screen readers.
- Needs attention: bank transfers to check (their total and the oldest's age), messages to send, items out of stock and running low, office sales overdue, new reviews this week; each links to the page where the work is done.
- The order pipeline (a count per action status, each opening the orders list filtered to it), what is running low, and the six most recent orders.

The orders list moved from /ops to /ops/orders, beside the order pages; staff signing in still land on /ops, now the dashboard. The existing ops pages are unchanged inside, each set in a white card in the new frame.

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

5.0 Decision (2026-11-09): 3D model in the browser

PRD §4.4 now records the founder's decision: the preview is a 3D model rendered on the customer's device with WebGL (three.js), replacing server-side compositing of photographed frames. Sections 5.1 to 5.3 below describe the earlier frame-compositing design and are kept for the record; where they conflict, this section wins.

| Rule | Detail |
| --- | --- |
| Model | One 3D model (glTF binary, `.glb`) whose garment parts are separate, named meshes: `Saree` (body and pleats), `Pallu`, `Jacket`, and for Kandyan Osariya `Skirt` (the straight skirt, border down the front) and `Frill` (waist and hip frill, bordered). Parts used by only one drape carry the suffix `_saree` or `_osariya` and are shown only for that drape. Until a model exists, a built-in placeholder figure with the same parts is used, so nothing else changes when the model arrives. |
| Painting | Saree and pallu: the design's pattern (its tintable asset, or a built-in pattern until one is uploaded), multiplied by the saree colour, with the material's weave and sheen (Plain: matte, open weave; Super: finer weave, soft sheen). Jacket: the jacket colour, with its swatch photograph as a tiled texture when one exists. Colour is a tint, so any design renders in any colour. |
| Rotation | By hand only (drag, swipe, arrow keys, the rotate buttons), one-to-one with input; never auto-played (UX-C8). Vertical tilt is limited so the model is always upright. |
| Cost | No server work: the page ships plain data and the model file. The 3D library loads only on this page. The renderer draws only when something changes. |
| Honesty | The HonestyNote stays beside the preview (FR-22); alt text names the selection and says it is a rendered approximation. |
| Degrades, never blocks | No WebGL, a failed load or a renderer error swaps to the static fallback with FallbackNotice (§5.4). Choosing and buying never depend on the preview. |
| Buyable vs viewable | Any combination can be previewed. Only a combination that exists as a stocked saree colourway can be added to the cart; the colour picker shows the others disabled, never hidden (UX-C5). |


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
| Client-side 3D model (WebGL) | One model file plus small textures; every combination and every angle rendered on the device. | SELECTED 2026-11-09 (§5.0) |
| Server-side compositing with CDN cache | Server composites on demand and caches the result at the edge. First request for a combination is slower; every subsequent one is a static fetch. Payload to device is a plain image sequence. | Superseded by §5.0: not possible within the Workers Free CPU budget |
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

Implementation (`lib/notifications/`):

| Rule | Detail |
| --- | --- |
| Transactional outbox | NOTIFICATION rows are written in the SAME transaction as the order change that causes them, with the message already rendered in the order's language. An order can never change state without its messages being recorded, and a failed send never rolls back an order. |
| Routing | placed → WhatsApp + SMS (+ email if given); confirmed, packed → WhatsApp (+ email); dispatched → WhatsApp + SMS (+ email); cancelled → WhatsApp + SMS (+ email); delivered → follow-ups due at d+1 (WhatsApp), d+3 (WhatsApp), d+14 (WhatsApp + email), d+45 (email). Bank-transfer orders' placed message carries the transfer instructions (or, while the bank details are placeholders, says they will follow). Out-for-delivery waits for courier integration. |
| Providers | Email: Resend, sent automatically. WhatsApp Business API and SMS: no provider yet, so those rows are `manual` — the ops "Messages" queue shows each due message with one-tap WhatsApp / SMS links pre-filled with the text, and staff mark it sent. Adding a provider later flips those channels to automatic without changing the outbox. |
| Delivery and retry | After commit the Worker attempts due automatic rows at once (`waitUntil`). A Cron Trigger (every 10 minutes) calls `/api/internal/notifications` with `CRON_SECRET` to send anything due or failed. Retries back off exponentially (2, 4, 8, 16 minutes); after 5 failed attempts a row is `failed` and shown in ops. |
| Links | The placed message includes the customer's private confirmation link (order number + token, §3.4). Later messages reference the order number. |

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

Allowed transitions (enforced in `lib/ops/transitions.ts`; anything else is refused):

| From | To |
| --- | --- |
| placed | confirmed, cancelled |
| payment_pending | confirmed, cancelled |
| confirmed | packed, cancelled |
| packed | dispatched, cancelled |
| dispatched | delivered |
| delivered | return_requested |
| return_requested | refunded, exchanged |

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
