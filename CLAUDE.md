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
- Tokens only. No raw hex, px or ms in component code. `npm run lint:tokens`
  fails the build on any hex literal outside `lib/tokens.css`.
- Gold `#C9A24D` is NEVER text on white. Rules and accents only.
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
- "Ships unstitched" appears on listing, at checkout, and in
  the parcel. Checkout requires explicit acknowledgement
  (cannot be pre-checked, cannot be skipped).
- The configurator degrades, never blocks. If the renderer
  fails, the customer can still buy (see docs/4-architecture.md §5.4).
- Mobile-first: mid-range Android on mobile data, 360px viewport,
  is the reference device, not a desktop browser.
- Guest checkout is the default and only required path. Account
  creation is offered after purchase, never before.

## Brand colours (sampled from the logo — do not adjust)
```
--lun-plum        #5A1E2D
--lun-plum-light  #7A3A45
--lun-gold        #C9A24D
--lun-plum-deep   #3E1420
--lun-gold-pale   #E8D9B0
--lun-gold-deep   #A07F35
--lun-ground      #FBFAF8
--lun-surface     #FFFFFF
--lun-line        #E4DFD8
--lun-ink         #1A1A1A
--lun-ink-muted   #6B6B6B
```
Full token set including type, space, radius, elevation and motion
lives in `lib/tokens.css`, sourced from docs/2-ui.md §8.

## Tech stack
Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
PostgreSQL · Prisma ORM · Better Auth · React Hook Form · Zod ·
Server Actions · Route Handlers · Sharp · Framer Motion · Lucide
Icons · Resend · React Email · Vercel Blob (local storage in dev) ·
next-intl (Sinhala / Tamil / English) · ESLint · Prettier.

## Specifications — the source of truth
Read the relevant section before writing any related code. If code
conflicts with a spec, the spec is right and the code is wrong —
unless the spec is genuinely mistaken, in which case update the
document first, the code second.

  docs/0-prd.md              product requirements — what Lunara sells
  docs/1-ux.md               behaviour — controlling document for the UI
  docs/2-ui.md               tokens, type, colour, layout
  docs/3-components.md       component APIs, states, build order
  docs/4-architecture.md     data model, rendering pipeline, integrations
  docs/5-ai.md               assistant scope and guardrails
  docs/6-development-guide.md  how to prompt and review work on this project

Document hierarchy when specs disagree: docs/1-ux.md (behaviour) wins
over anything else on interaction; docs/2-ui.md (tokens) wins over any
component's visual choice; docs/3-components.md governs behaviour,
docs/4-architecture.md governs data/state; docs/5-ai.md wins on
assistant scope. docs/0-prd.md (the PRD) wins over all of them on what
the business actually sells.

## Definition of done
See docs/3-components.md §7.1 — twelve criteria, all must pass,
including: renders at 360/768/1024/1440px, fully keyboard operable,
44×44px touch targets, zero raw hex/px/ms outside tokens, correct
Sinhala/Tamil/English rendering, prefers-reduced-motion honoured,
WCAG AA contrast in every state.

## Language
Sinhala, Tamil, English. All three, always. Policy text is
never machine-translated — use approved translations only
(see `content/policies/` and `content/care/`).

## Working style
One component or one flow per session. Reference the doc section,
not the idea. Verify each build-order wave (docs/3-components.md §7.2)
before moving to the next. Stop after each completed feature and
summarize before continuing.
