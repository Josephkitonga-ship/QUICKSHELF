-- Row-level security. Rule: shoppers read active shops and products; merchants touch only their own shop;
-- orders and stock change only through the functions in 0003, never by direct writes.
create or replace function is_admin() returns boolean language sql stable security definer set search_path = public as
$$ select coalesce((select is_admin from profiles where user_id = auth.uid()), false) $$;
create or replace function owns_shop(p_shop uuid) returns boolean language sql stable security definer set search_path = public as
$$ select exists (select 1 from shops where id = p_shop and owner_id = auth.uid()) $$;

alter table plans enable row level security;                create policy plans_read on plans for select using (true);
alter table profiles enable row level security;             create policy profile_own on profiles for select using (user_id = auth.uid());
alter table shops enable row level security;
create policy shops_read on shops for select using (status = 'active' or owner_id = auth.uid() or is_admin());
create policy shops_update_own on shops for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
revoke insert, update, delete on shops from anon, authenticated;
grant update (name, town, category, whatsapp, pickup) on shops to authenticated;

alter table delivery_areas enable row level security;
create policy areas_read on delivery_areas for select using (exists (select 1 from shops s where s.id = shop_id and s.status = 'active') or owns_shop(shop_id) or is_admin());
create policy areas_write on delivery_areas for all using (owns_shop(shop_id)) with check (owns_shop(shop_id));

alter table products enable row level security;
create policy products_read on products for select using ((not archived and exists (select 1 from shops s where s.id = shop_id and s.status = 'active')) or owns_shop(shop_id) or is_admin());
create policy products_write on products for all using (owns_shop(shop_id)) with check (owns_shop(shop_id));
revoke insert, update, delete on products from anon, authenticated;
grant insert (shop_id, slug, name, description, price_kes, category, badge, stock_on_hand, image_url, archived) on products to authenticated;
grant update (name, description, price_kes, category, badge, stock_on_hand, image_url, archived) on products to authenticated;

alter table orders enable row level security;
create policy orders_read on orders for select using (owns_shop(shop_id) or is_admin());
alter table order_items enable row level security;
create policy items_read on order_items for select using (exists (select 1 from orders o where o.id = order_id and (owns_shop(o.shop_id) or is_admin())));
alter table stock_movements enable row level security;
create policy moves_read on stock_movements for select using (exists (select 1 from products p where p.id = product_id and (owns_shop(p.shop_id) or is_admin())));
revoke insert, update, delete on orders, order_items, stock_movements from anon, authenticated;

alter table applications enable row level security;
create policy apply_insert on applications for insert with check (true);
revoke select, update, delete on applications from anon, authenticated;

alter table ads enable row level security;
create policy ads_read on ads for select using ((status = 'approved' and now() between starts_at and ends_at) or owns_shop(shop_id) or is_admin());
create policy ads_insert on ads for insert with check (owns_shop(shop_id) and status = 'pending');
revoke update, delete on ads from anon, authenticated;

alter table subscription_payments enable row level security;
create policy subs_read on subscription_payments for select using (owns_shop(shop_id) or is_admin());
create policy subs_insert on subscription_payments for insert with check (owns_shop(shop_id) and status = 'pending');
revoke update, delete on subscription_payments from anon, authenticated;
