# Lunara Sarees - Claude Development Guide

LUNARA SAREES

❋

DOCUMENT 6 OF 6

Claude Development Guide

How to build Lunara with an AI coding assistant

Version 2.0  ·  July 2026

Operational companion to Documents 1–5

For the founder and any developer working on Lunara

Status: Draft for approval

Table of Contents

1. How to Use This Guide

Documents 1 to 5 describe what Lunara should be. This one describes how to get it built when the person writing the code is an AI assistant working from those documents.

The central idea is simple: an AI assistant produces work of the quality that its instructions permit. Vague instructions produce plausible, generic output that looks finished and quietly ignores the decisions in the specifications. Precise instructions, anchored to a specific document section, produce work you can actually ship.

1.1 The Document Hierarchy

| When these conflict | This one wins | Why |
| --- | --- | --- |
| Anything vs. Document 1 (UX) | Document 1 | It is the controlling behavioural specification. |
| Component code vs. Document 2 (UI) | Document 2 | Tokens are non-negotiable. No component invents a value. |
| Document 3 vs. Document 4 | Document 3 for behaviour, Document 4 for data | Components own interaction; architecture owns state and persistence. |
| Assistant output vs. Document 5 | Document 5 | Scope and guardrails are a brand decision, not a technical one. |
| Any document vs. the PRD | The PRD | It defines what the business actually sells. v2.0, not v1.0. |

If Claude produces something that conflicts with a specification, the specification is right and the code is wrong — unless the specification is genuinely mistaken, in which case update the document first and the code second. Never let code silently become the source of truth.

2. Project Setup

2.1 The Context File

Create a CLAUDE.md at the repository root. Claude Code reads it automatically at the start of every session, so it is the highest-leverage file in the project. Keep it short — a long file gets skimmed.

# Lunara Sarees

## What this is

Cotton sarees sold with UNSTITCHED jacket material.

We do NOT stitch. We do NOT take measurements.

We do NOT sell ready-to-wear outfits.

TWO cotton materials only: Plain Cotton, Super Cotton.

NOT a wide fabric range. Variety comes from DESIGN, not fabric.

Two purchase paths:

A. Curated listings — design + material + colour + jacket

all chosen by us

B. Design Your Own — FOUR independent axes plus a drape

toggle. Customer selects:

1. saree DESIGN   (pre-defined set, recolourable)

2. MATERIAL       (Plain | Super)

3. saree COLOUR   (any design renders in any colour)

4. JACKET         (material + colour)

+ DRAPE           (Saree | Kandyan Osariya)

Model re-renders on ALL of these.

PRICE re-computes on design + material.

Plus: jacket material sold standalone.

## Non-negotiables

- Tokens only. No raw hex, px or ms in component code.

- Gold #C9A24D is NEVER text on white. Rules and accents only.

- No filter, overlay, gradient or tint on product photography.

- Stock: one source of truth. Catalogue and configurator read

the same record. Never two stores kept in sync.

- Price: one source of truth — PRICE_MATRIX (design × material).

Never compute price in the client. Catalogue and configurator

MUST NOT be able to quote different prices for the same combo.

- Every price change is ATTRIBUTED at the moment it happens,

inline beside the price. Never a toast. Unexplained price

movement reads as a hidden charge.

- Designs are RECOLOURABLE. One pattern asset, tinted at render

time. Do not model design and colour as one choice.

- 'Ships unstitched' appears on listing, at checkout, and in

the parcel. Checkout requires explicit acknowledgement.

- The configurator degrades, never blocks. If the renderer

fails, the customer can still buy.

- Mobile-first: mid-range Android on mobile data is the

reference device, not a desktop browser.

## Brand colours (sampled from the logo — do not adjust)

--lun-plum       #5A1E2D

--lun-plum-light #7A3A45

--lun-gold       #C9A24D

## Specifications

docs/1-ux.md            behaviour — controlling document

docs/2-ui.md            tokens, type, colour

docs/3-components.md    component APIs and states

docs/4-architecture.md  data model, rendering, integrations

docs/5-ai.md            assistant scope and guardrails

## Definition of done

See docs/3-components.md §7.1. Twelve criteria. All must pass.

## Language

Sinhala, Tamil, English. All three, always. Policy text is

never machine-translated — use approved translations only.

Note what this file leads with: what Lunara is NOT. Several earlier attempts at the PRD got the product model wrong — first assuming custom tailoring, then assuming a wide material range. Stating the exclusions first prevents an assistant from filling the gap with a plausible assumption, which is exactly how the model was misunderstood both times.

2.2 Repository Structure

lunara/

├── CLAUDE.md              ← read automatically every session

├── docs/                  ← the six specifications, as markdown

├── app/                   ← routes

├── components/            ← per Document 3 structure

├── lib/

│   ├── tokens.css         ← the ONLY file with raw values

│   ├── stock/             ← single source of truth

│   └── compositor/        ← 360° render pipeline

├── content/

│   ├── policies/          ← si / ta / en — approved translations

│   └── care/

└── tests/

Convert each specification to markdown in docs/. Claude reads markdown far more reliably than .docx, and you can reference a section directly in a prompt.

tokens.css is the only file permitted to contain raw values. Everything else references custom properties, which makes the lint rule enforceable.

3. How to Prompt for This Project

3.1 The Pattern That Works

Four elements, every time: the artefact, the governing specification, the binding constraints, and the definition of done.

Build SwatchChip from docs/3-components.md §3.1.

Constraints:

- Selection ring OUTSIDE the chip, never overlaid

- Neutral hairline border only — no tinted border

- Colour is never the sole state indicator

- 44×44px hit area minimum, even at size sm

- Tokens only, no raw values

Done when all 12 criteria in §7.1 pass.

Show me the disabled and low-stock states specifically.

3.2 Why Vague Prompts Fail Here

| Vague prompt | What you get | Precise prompt |
| --- | --- | --- |
| 'Build a colour swatch component' | A generic swatch with the selection state overlaid on the colour — the exact mistake §3.1 exists to prevent. | 'Build SwatchChip from docs/3-components.md §3.1. Selection ring outside the chip.' |
| 'Make the product page' | Templated e-commerce with a hover-zoom gallery and a gradient hero. Both prohibited. | 'Build the product detail page from docs/1-ux.md §4.2. Mobile layout first. No filter on any product image.' |
| 'Add the configurator' | A client-side canvas that will not run on the target device, usually with only two axes. | 'Build PreviewCanvas from docs/3-components.md §4.1, four axes plus drape, server-composited per docs/4-architecture.md §5.2.' |
| 'Style it nicely' | Warm cream background, terracotta accent, generic serif — a default that ignores the brand entirely. | 'Apply tokens from docs/2-ui.md §8. Gold is rules and accents only, never text on white.' |

3.3 Prompts for the Risky Parts

The configurator preview

Build the server-side compositor from docs/4-architecture.md §5.

Pipeline per frame:

base + (saree texture × colour) masked

+ (jacket texture × colour) masked

× shading map

The shading map multiply is what makes it read as draped

cloth rather than a flat silhouette. Do not skip it.

Cache key: saree colourway + jacket colourway + drape + frame.

Must be edge-cacheable indefinitely.

Then implement the degradation ladder in §5.4. Every rung

keeps purchase available. Show me the compositor-unavailable

path working.

Live pricing

Implement pricing from docs/4-architecture.md §7.1.

Price = PRICE_MATRIX[design][material] + jacket delta.

Resolve on the server. NEVER compute in the client — the

catalogue and configurator must be structurally incapable of

quoting different prices for the same combination.

The API returns the new price AND the cause of the change

('design' | 'material' | 'jacket'). Do not have the client

diff old and new to guess the cause — that drifts.

Then build PriceAttribution from docs/3-components.md §4.2b.

Inline beside the price. Not a toast.

Stock integrity

Implement the stock service from docs/4-architecture.md §3.2.

Hard requirement: catalogue and configurator resolve

availability through the SAME endpoint reading the SAME

STOCK_ITEM record. Do not build two stores and synchronise

them — divergence must be structurally impossible, not

prevented by a sync job.

Write a test that proves a curated pairing and a configured

design competing for the last unit resolve deterministically.

The unstitched reminder

Build UnstitchedReminder from docs/3-components.md §5.2.

The checkout variant MUST require explicit acknowledgement.

Cannot be pre-checked. Cannot be skipped. Cannot be dismissed.

This prevents the product's single most likely

misunderstanding. Treat it as a hard requirement, not a

nice-to-have that can be softened for conversion.

4. Build Sequence

Follow the wave order from Document 3 §7.2. Waves 1 to 4 deliver the entire Phase 1 commerce business; wave 5 is the Phase 2 configurator. This ordering means revenue is never gated on the hardest build.

| Wave | Build | Verify before moving on |
| --- | --- | --- |
| 1 — Foundation | tokens.css, then primitives: Button, Input, Select, Checkbox, Radio, Divider, Icon, SectionMarker, MotifDivider. | Lint rule rejects a raw hex. Contrast audit passes. Keyboard and focus work on every primitive. |
| 2 — Catalogue | ProductCard, ProductGallery, SwatchChip, FabricBlock, JacketBlock, OpacityRating, PriceDisplay, StockState. | No filter on any product image. JacketBlock states 'ships unstitched' at weight 600. Reference frame is labelled. |
| 3 — Commerce | CartLine, CartSummary, CheckoutStep, PaymentMethod, UnstitchedReminder, DeliveryEstimate. | Bank transfer has equal visual weight. COD fee itemised. Checkout blocks without acknowledgement. |
| 4 — Layout & feedback | Header, Footer, MobileNav, WhatsAppAction, SlideOver, Accordion, Toast, InlineError, EmptyState, LoadingSkeleton. | Language selector persists. WhatsApp reachable from every page. Add-to-cart does not navigate away. |
| 5 — Configurator | SwatchGrid, PreviewCanvas, RotationControl, HonestyNote, DesignPicker, MaterialSelector, ColourPicker, PriceAttribution, DrapeToggle, SuggestedStrip, ConfiguratorBar, FallbackNotice. | Opens pre-loaded, never empty. All four axes independent. Drape switch preserves selections. Honesty note persistent. Price attributed inline. Degradation ladder works at every rung. |

4.1 Verify at Every Wave

Do not accumulate unverified work. Each wave gets checked before the next begins.

Before moving to the next wave, check:

□ Renders at 360 / 768 / 1024 / 1440px

□ Keyboard operable, focus visible

□ Touch targets ≥ 44×44px

□ All states present: default hover active focus

disabled loading error empty

□ Zero raw hex / px / ms outside tokens.css

□ Sinhala, Tamil, English all render correctly

□ prefers-reduced-motion honoured

□ Colour never the only state indicator

□ Product imagery: no filter, overlay, tint

□ WCAG AA contrast in every state

□ Behaviour matches its rule ID in docs/1-ux.md

5. Reviewing AI-Written Code

Claude writes fluent code quickly. Fluency is not correctness, and the failure modes here are specific and predictable.

5.1 Where Generated Code Goes Wrong on This Project

| Failure mode | How it appears | Check for it |
| --- | --- | --- |
| Silent token drift | A component uses #5A1E2D directly instead of var(--lun-plum). Looks identical, breaks the moment a token changes. | Grep for hex literals outside tokens.css. Automate it. |
| Gold misuse | Gold applied to text, a button background, or a large fill. Fails contrast at 2.1:1. | Contrast audit on every screen. Gold appears only as rules, rings and small ornament. |
| Photography treatment | A subtle gradient or hover-zoom added to product images because it looks polished. | Inspect every component that renders product imagery. Zero treatment is the rule. |
| Two stock stores | A cached catalogue list and a live configurator query. Works in testing, diverges in production. | Trace both paths to the same endpoint and the same record. |
| Softened requirements | The unstitched checkbox becomes pre-checked, or the honesty note becomes dismissible — both improve conversion metrics and break the promise. | Re-read the requirement text. If it says 'never dismissible', it means never. |
| Desktop-first layout | Built at 1440px and made responsive afterwards. The mobile experience is an afterthought. | Open at 360px first. If it was built desktop-first, it will show. |
| Placeholder content that ships | Lorem ipsum, English-only strings, or invented product data left in place. | Search for placeholder text before every merge. |
| Accessibility added late | Focus rings removed for aesthetics, ARIA missing on custom controls. | Tab through the entire flow. If you cannot complete it by keyboard, it is not done. |

5.2 Useful Review Prompts

Review this against docs/2-ui.md. List every raw value that

should be a token, and every place gold is used as text.

Check this component against the 12 criteria in

docs/3-components.md §7.1. Which fail?

Trace how availability is resolved in both the catalogue and

the configurator. Are they reading the same record? Show me

the path.

Open this at 360px. What breaks?

I think you softened a requirement here. Re-read

docs/1-ux.md §3.2.1 UX-C6 and tell me whether this

implementation matches it.

The last prompt is worth using regularly. Requirements that constrain conversion — the unstitched acknowledgement, the persistent honesty note, honest stock messaging — are exactly the ones an assistant optimising for a good-looking result will quietly soften.

6. Working Practices

6.1 Session Discipline

| Practice | Why |
| --- | --- |
| One component or one flow per session | Long sessions drift. Context fills with earlier work and the assistant starts pattern-matching its own output rather than the specification. |
| Reference the section, not the idea | 'Per §3.1' is precise. 'Like we discussed' is not, and the assistant will fill the gap with a plausible guess. |
| Commit at every working state | Cheap to do, and it gives you a point to return to when a session goes sideways. |
| Re-anchor after any correction | When you correct something, restate the constraint. Otherwise the correction fades from context and the same mistake returns. |
| Ask for the failure path first | Build the degradation before the happy path. It is the part most likely to be skipped and most costly to omit. |

6.2 When the Assistant Gets It Wrong

State the specific rule that was violated and the section it lives in. 'That's wrong' teaches nothing; 'UX-C6 says the honesty note is never dismissible' is actionable.

If the same mistake recurs, add the rule to CLAUDE.md. Recurrence means the constraint is not in reliable context.

If a specification is genuinely wrong, update the document, then the code. Never let the code become the source of truth by default.

Be direct. Extended negotiation over a clear requirement wastes the session — restate the constraint and ask for the corrected version.

6.3 What to Keep Human

| Decision | Why it stays with you |
| --- | --- |
| The open questions in PRD §10 | Design count, colour count, the Plain-to-Super price difference, who builds the configurator — all commercial decisions with real money attached. |
| Whether a requirement can be softened | An assistant will optimise toward a good-looking result. Whether the unstitched acknowledgement can be relaxed is a brand and trust decision, not a UX-polish one. |
| Policy wording and its translations | Policy text is a commitment. Machine translation of a returns policy creates obligations you did not agree to. |
| Whether the composited preview is convincing enough | Only a human comparing a render to real fabric can judge this. It is the pilot gate in PRD §9.2. |
| Photography protocol and colour approval | The reference frame is contractual evidence. A person signs it off. |

7. Pre-Launch Checklist

7.1 Phase 1 — Commerce

BRAND & VISUAL

□ Every colour resolves to a token; zero raw hex

□ Gold never used as text on white anywhere

□ Contrast audit passes AA on every screen

□ No filter or overlay on any product image

PRODUCT TRUTH

□ Every listing states cotton type, GSM, length, opacity

□ Every listing names the jacket material

□ 'Ships unstitched' on listing, checkout, printed card

□ Reference frame published and labelled per colourway

COMMERCE

□ Guest checkout is the default and only required path

□ COD, bank transfer, LankaQR, card — equal weight

□ COD fee itemised; waiver on prepayment stated

□ Delivery fee and estimate shown before final step

□ Unstitched acknowledgement blocks order without it

TRUST

□ Returns policy on every product page, three languages

□ Colour promise published with its scope stated

□ Registration number, address, human-answered phone

□ WhatsApp reachable from every page

TECHNICAL

□ Catalogue < 3s first paint on throttled mid-range Android

□ Every flow keyboard-completable, focus visible

□ Sinhala, Tamil, English complete — no English-only strings

□ SMS + WhatsApp fire on placed, dispatched, out-for-delivery

□ Stock reads resolve to one record from both paths

7.2 Phase 2 — Configurator

□ Opens with a pre-loaded design, never empty (UX-C1)

□ Four axes independently selectable in any order (UX-C1a)

□ Design change preserves colour where available (UX-C1b)

□ Any jacket pairs with any design/material/colour (UX-C2)

□ Drape switch preserves all four selections (UX-C3)

□ Selection change renders in < 500ms (UX-C4)

□ Out-of-stock options disabled, never selectable (UX-C5)

□ Honesty note persistent, not dismissible (UX-C6)

□ 'See real photographs' one tap away (UX-C7)

□ Rotation: drag, swipe, arrows, all working (UX-C8)

□ Renderer failure → static imagery, purchase available (UX-C9)

□ Price updates live from design + material (UX-C10)

□ Every price change attributed inline, not a toast (UX-C10a)

□ Super Cotton delta shown BEFORE switching (UX-C10b)

□ Catalogue and configurator quote identical prices

□ Plain vs Super visibly distinct in the preview

□ Every design validated across the full colour range

□ Suggested pairings browsable without losing work (UX-C11)

□ Save and share work without an account (UX-C12)

□ Osariya labelled in Sinhala script; toggle tracked

□ Every rung of the degradation ladder tested

□ Composited previews validated against physical fabric

7.3 The Two Questions Before Launch

If both of these can be answered honestly, the build is ready. If either cannot, something in the specification has been quietly softened.

| Question | What a 'no' means |
| --- | --- |
| Can a customer on a mid-range Android, on mobile data, in Sinhala, complete a purchase without confusion about what she is receiving? | The mobile-first requirement, the language requirement, or the unstitched disclosure has been compromised. Any of the three is a launch blocker. |
| If the 360° renderer fails entirely, can she still buy? | Principle 3 has been violated. The configurator has become a dependency rather than an enhancement, and a rendering failure now costs revenue. |
