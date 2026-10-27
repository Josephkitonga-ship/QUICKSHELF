# QuickShelf web (frontend)

Next.js 14 (App Router) and TypeScript. No UI library and no animation. Plain CSS in `app/globals.css`.

## Run
    npm install
    cp .env.example .env.local   # set NEXT_PUBLIC_QUICKSHELF_WHATSAPP
    npm run dev

## What is real and what is a placeholder
- Data is sample data in `lib/data.ts`. Replace with Supabase queries.
- Cart, saved items and placed orders live in the phone's localStorage. The backend will create orders, hold stock and send merchant alerts.
- The order message follows the agreed specification (`lib/whatsapp.ts`), one chat per shop.
- Photos are placeholders. Cloudinary comes later.
- `/terms` and `/privacy` need real text. `/apply` sends the application to QuickShelf on WhatsApp for now.
- Not built yet: merchant dashboard, platform-owner screens, Jumia and Kilimall connection.
