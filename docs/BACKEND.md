# Wiring the frontend to the backend (Supabase)

The frontend runs on sample data until two environment variables are set. Nothing else changes in the pages.

## 1. Create the project
1. Create a Supabase project. Pick the region closest to Kenya that is available.
2. In **Project Settings > API** copy the project URL and the **anon** key.
3. Put them in `.env.local` (local) and in the Vercel project settings (hosting):
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_QUICKSHELF_WHATSAPP`.
4. Never use the service-role key in the frontend or in any `NEXT_PUBLIC_` variable.

## 2. Create the database
Run these in the Supabase SQL editor, in order:
1. `supabase/migrations/0001_schema.sql` (tables, plan limits)
2. `supabase/migrations/0002_security.sql` (row-level security and permissions)
3. `supabase/migrations/0003_functions.sql` (checkout and stock functions)
4. `supabase/migrations/0004_wholesale.sql` (wholesale refills between vendors)
5. `supabase/seed.sql` (demo vendors and products, optional, never in production)

## 3. Turn on the stock timer
Enable the **pg_cron** extension (Database > Extensions), then run:

    select cron.schedule('expire-holds', '*/5 * * * *', 'select public.expire_holds()');

This releases stock held by unpaid orders after 3 hours.

## 4. Create the first platform owner
Sign up a user in Supabase Auth, then run (with that user's id):

    insert into profiles (user_id, is_admin) values ('<user-id>', true);

## How the pieces connect
| Frontend | Backend |
| --- | --- |
| `lib/db.ts` reads shops, products and ads | tables with row-level security (shoppers see active shops only) |
| `POST /api/checkout` | `place_order()`: prices, stock and fees decided in the database, one order per shop, stock held 3 hours |
| `GET /api/orders/[cart]` | `get_cart_orders()`: tracking by the long random cart reference |
| `POST /api/apply` | inserts into `applications` (owner reviews them) |
| `/wholesale` (sample data for now) | `wholesale_terms` and `create_refill_request()`: prices readable only by approved vendors on a plan that allows it |
| Merchant "Mark as paid" (dashboard, not built) | `mark_paid()`, `mark_delivered()`, `cancel_order()`, `revive_order()` |

## Test before going live
- Place an order for the last unit twice at once: only one must succeed.
- Place an order, wait past the hold (or run `select expire_holds()` after editing `hold_expires_at`): stock is released.
- Call `mark_paid` twice on one order: stock is deducted only once.
- As an anonymous user, try to read `orders` or write `products` directly: both must be refused.
- Add the 26th product on a 25-product plan: refused.

## Not done yet
- Merchant login and dashboard (the functions exist, the screens do not).
- Platform-owner screens (approve applications, confirm plan payments, approve ads).
- Photos (Cloudinary).
- Abuse protection on checkout (rate limiting, bot check) and merchant alerts (push, SMS or email).
- Wholesale screens that use the database (the catalog page uses sample data until vendor login exists).
- Vendor and supplier dashboards.
- Real terms and privacy text, and registration as a data controller.
- The SQL has not been run against a database yet. Run it on a new Supabase project first and fix any errors.

Tiers: Starter KSh 800 (25 products), Growth KSh 1,500 (50, can buy wholesale), Top tier KSh 2,000 (100, can also supply wholesale). Jumia and Kilimall are not part of the product.
