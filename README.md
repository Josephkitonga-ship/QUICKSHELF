# QuickShelf web

Next.js 14 (App Router) and TypeScript. Plain CSS, no UI library, no animation.

## Run
    npm install
    cp .env.example .env.local
    npm run dev

With the Supabase variables empty, the site runs on sample data and keeps carts and orders on the phone (demo mode).
With them set, it reads from Supabase and places real orders. See `docs/BACKEND.md`.

## Structure
- `app/` pages and `app/api/` routes (catalog, checkout, orders, apply)
- `components/` header, footer, cards, cart and saved-items storage
- `lib/db.ts` the only place that talks to Supabase; `lib/data.ts` sample data
- `supabase/` SQL: schema, security, functions, seed

## Placeholders
Sample data and fake WhatsApp numbers, photo boxes, and `/terms` and `/privacy` text.
Not built: vendor login and dashboards (retail and wholesale), owner screens. The `/wholesale` page uses sample data and must be gated to approved vendors before real prices are used. `/terms` and `/privacy` are drafts for legal review.
