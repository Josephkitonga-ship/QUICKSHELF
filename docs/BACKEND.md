# Connecting QuickShelf to Supabase

Without the Supabase variables the site runs on sample data. With them, shoppers place real orders, vendors log in, and the owner approves vendors.

## 1. Create the project
1. Create a Supabase project in the region closest to Kenya.
2. In Project Settings, then API, copy the project URL, the **anon** key and the **service_role** key.
3. In Vercel (Settings, Environment Variables) add:
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server only. Never put it in a `NEXT_PUBLIC_` variable, a file, or a chat.)
   - `NEXT_PUBLIC_QUICKSHELF_WHATSAPP` and, once you have it, `NEXT_PUBLIC_MPESA_TILL`
4. Redeploy so the variables take effect.

## 2. Create the database
In the SQL editor run, in order: `0001_schema.sql`, `0002_security.sql`, `0003_functions.sql`, `0004_wholesale.sql`, `0005_applications_v3.sql`, `0006_owner_ops.sql`. Then, for demo data only, `seed.sql`.
These have never been run, so expect to fix an error or two. Send me the first error message.
Enable **pg_cron** (Database, Extensions) and run:

    select cron.schedule('expire-holds', '*/5 * * * *', 'select public.expire_holds()');

## 3. Login settings
Authentication, URL Configuration: set Site URL to your site address and add `https://<your-site>/auth/callback` to Redirect URLs. Email sign-in links use Supabase's built-in email, which is rate-limited. Add an email provider (SMTP) before the pilot.

## 4. Make yourself the platform owner
Log in once, or create your user under Authentication, Users, then run:

    insert into profiles (user_id, is_admin) select id, true from auth.users where email = 'you@example.com';

## How it works
- A shopper's order calls `place_order`, which holds the stock for 3 hours and creates one order per vendor.
- The vendor dashboard (`/dashboard`) lists orders, with **Mark as paid**, **Mark delivered**, **Cancel** and **Revive**, and a live alert when a new order arrives (sound, vibration, notification).
- A vendor applies at `/sell`. The owner approves at `/owner`, which creates the vendor's login and shop. The vendor then logs in at `/login` with an emailed link.
- Plan payments: the vendor enters the M-Pesa code, and the owner confirms it. That sets the plan and adds 30 days.

## Test before the pilot
- Two orders for the last unit at once: only one succeeds.
- `mark_paid` twice on one order: stock drops once.
- A signed-out visitor cannot read orders or change products.
- A vendor cannot see another vendor's orders.
- The 26th product on a 25-product plan is refused.

## Not done yet
Photos (Cloudinary), email or SMS alerts when no one has the dashboard open, wholesale listings and refill order screens, rate limiting on checkout, and the lawyer-reviewed terms.
