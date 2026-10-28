-- QuickShelf schema. Run files in order: 0001, 0002, 0003, then seed.sql (optional, demo data).

create table plans (
  id text primary key, name text not null, price_kes int not null, product_limit int not null,
  channels text[] not null default '{}'
);
insert into plans values ('starter','Starter',1500,25,'{}'), ('growth','Growth',3000,50,'{jumia}'), ('top','Top tier',4500,100,'{jumia,kilimall}');

create table profiles (user_id uuid primary key references auth.users on delete cascade, is_admin boolean not null default false);

create table shops (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug ~ '^[a-z0-9-]{3,40}$' and slug not in ('admin','api','login','www','sell','apply','shops','shop','products','cart','checkout','saved','o','terms','privacy')),
  name text not null, town text not null, category text not null,
  whatsapp text not null check (whatsapp ~ '^254[0-9]{9}$'),
  pickup boolean not null default true,
  status text not null default 'pending' check (status in ('pending','active','suspended')),
  plan_id text not null default 'starter' references plans(id),
  plan_expires_at timestamptz,
  owner_id uuid references auth.users,
  created_at timestamptz not null default now()
);

create table delivery_areas (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops on delete cascade,
  name text not null, fee_kes int not null check (fee_kes >= 0),
  unique (shop_id, name)
);

create table products (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops on delete cascade,
  slug text unique not null, name text not null, description text not null default '',
  price_kes int not null check (price_kes > 0), category text not null,
  badge text check (badge in ('New','Offer')),
  stock_on_hand int not null default 0 check (stock_on_hand >= 0),
  reserved int not null default 0 check (reserved >= 0),
  image_url text, archived boolean not null default false,
  created_at timestamptz not null default now(),
  check (reserved <= stock_on_hand)
);
create index on products (shop_id) where not archived;
create index on products using gin (to_tsvector('simple', name));

create table orders (
  id uuid primary key default gen_random_uuid(),
  ref text unique not null, cart_ref text not null,
  shop_id uuid not null references shops,
  customer_name text not null, customer_phone text not null,
  delivery_type text not null check (delivery_type in ('pickup','delivery')),
  delivery_area text, delivery_fee_kes int not null default 0,
  total_kes int not null,
  status text not null default 'pending' check (status in ('pending','paid','delivered','cancelled','expired')),
  source text not null default 'marketplace',
  hold_expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index on orders (cart_ref);
create index on orders (shop_id, status);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders on delete cascade,
  product_id uuid not null references products,
  name text not null, qty int not null check (qty > 0), price_kes int not null
);

-- Every stock change is recorded once. The unique key makes retries safe.
create table stock_movements (
  id bigint generated always as identity primary key,
  product_id uuid not null references products,
  order_id uuid references orders,
  kind text not null check (kind in ('reserve','release','sale','adjust')),
  qty int not null, created_at timestamptz not null default now(),
  unique (order_id, product_id, kind)
);

create table applications (
  id uuid primary key default gen_random_uuid(),
  shop_name text not null check (length(shop_name) between 2 and 80),
  owner_name text not null check (length(owner_name) between 2 and 80),
  phone text not null check (length(phone) between 9 and 20),
  town text not null check (length(town) between 2 and 60),
  sells text not null check (length(sells) between 2 and 500),
  plan_id text not null references plans(id),
  status text not null default 'new' check (status in ('new','approved','rejected')),
  created_at timestamptz not null default now()
);

create table ads (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops on delete cascade,
  placement text not null check (placement in ('banner','sponsored_product','featured_shop')),
  headline text not null, line text not null default '',
  starts_at timestamptz not null, ends_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  payment_code text, created_at timestamptz not null default now()
);

create table subscription_payments (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops on delete cascade,
  plan_id text not null references plans(id), amount_kes int not null,
  mpesa_code text unique not null,
  status text not null default 'pending' check (status in ('pending','confirmed','rejected')),
  created_at timestamptz not null default now()
);

-- Phase 2 (Jumia, Kilimall): maps a product to its listing on a channel.
create table channel_listings (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products on delete cascade,
  channel text not null check (channel in ('jumia','kilimall')),
  external_id text, sync_status text not null default 'pending',
  last_synced_at timestamptz, unique (product_id, channel)
);

-- Product cap per plan, enforced here and not only in the UI. A shop 7 days past its plan end cannot add products.
create or replace function enforce_plan_limit() returns trigger language plpgsql security definer set search_path = public as $$
declare s shops%rowtype; lim int; n int;
begin
  select * into s from shops where id = new.shop_id;
  if s.plan_expires_at is not null and now() > s.plan_expires_at + interval '7 days' then raise exception 'plan_lapsed'; end if;
  select product_limit into lim from plans where id = s.plan_id;
  select count(*) into n from products where shop_id = new.shop_id and not archived;
  if n >= lim then raise exception 'plan_limit'; end if;
  return new;
end $$;
create trigger products_plan_limit before insert on products for each row execute function enforce_plan_limit();
