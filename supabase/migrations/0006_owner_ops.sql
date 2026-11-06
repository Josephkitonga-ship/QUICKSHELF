-- Platform-owner operations, vendor alerts (realtime) and admin read access. Run after 0005.
grant select on applications to authenticated;
create policy apps_admin_read on applications for select using (is_admin());

create or replace function approve_application(p_app uuid, p_owner uuid) returns text language plpgsql security definer set search_path = public as $$
declare a applications%rowtype; v_base text; v_slug text; v_n int := 1; v_digits text; v_wa text;
begin
  if not is_admin() then raise exception 'not_allowed'; end if;
  select * into a from applications where id = p_app for update;
  if not found or a.status <> 'new' then raise exception 'bad_status'; end if;
  v_base := trim(both '-' from lower(regexp_replace(a.shop_name, '[^a-zA-Z0-9]+', '-', 'g')));
  if length(v_base) < 3 then v_base := 'shop-' || v_base; end if;
  v_base := left(v_base, 34); v_slug := v_base;
  while exists (select 1 from shops where slug = v_slug) or v_slug in ('admin','api','login','www','sell','apply','shops','shop','products','cart','checkout','saved','o','terms','privacy','dashboard','owner','wholesale') loop
    v_n := v_n + 1; v_slug := v_base || '-' || v_n;
  end loop;
  v_digits := regexp_replace(a.phone, '\D', '', 'g');
  v_wa := case when v_digits like '254%' then v_digits when v_digits like '0%' then '254' || substr(v_digits, 2) else '254' || v_digits end;
  insert into shops (slug, name, town, category, whatsapp, status, plan_id, plan_expires_at, owner_id)
  values (v_slug, a.shop_name, coalesce(a.sub_county || ', ' || a.county, a.town), coalesce(nullif(trim(split_part(a.sells, ',', 1)), ''), 'General'), v_wa, 'active', a.plan_id, now() + interval '30 days', p_owner);
  update applications set status = 'approved' where id = p_app;
  return v_slug;
end $$;
create or replace function reject_application(p_app uuid) returns void language plpgsql security definer set search_path = public as $$
begin if not is_admin() then raise exception 'not_allowed'; end if; update applications set status = 'rejected' where id = p_app and status = 'new'; end $$;
-- Confirming a plan payment sets the plan and adds 30 days from the later of today or the current end date.
create or replace function confirm_subscription(p_pay uuid) returns void language plpgsql security definer set search_path = public as $$
declare pay subscription_payments%rowtype;
begin
  if not is_admin() then raise exception 'not_allowed'; end if;
  select * into pay from subscription_payments where id = p_pay for update;
  if not found or pay.status <> 'pending' then raise exception 'bad_status'; end if;
  update shops set plan_id = pay.plan_id, plan_expires_at = greatest(coalesce(plan_expires_at, now()), now()) + interval '30 days' where id = pay.shop_id;
  update subscription_payments set status = 'confirmed' where id = p_pay;
end $$;
create or replace function reject_subscription(p_pay uuid) returns void language plpgsql security definer set search_path = public as $$
begin if not is_admin() then raise exception 'not_allowed'; end if; update subscription_payments set status = 'rejected' where id = p_pay and status = 'pending'; end $$;
create or replace function review_ad(p_ad uuid, p_ok boolean) returns void language plpgsql security definer set search_path = public as $$
begin if not is_admin() then raise exception 'not_allowed'; end if; update ads set status = case when p_ok then 'approved' else 'rejected' end where id = p_ad and status = 'pending'; end $$;
create or replace function set_shop_status(p_shop uuid, p_status text) returns void language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'not_allowed'; end if;
  if p_status not in ('active', 'suspended') then raise exception 'bad_status'; end if;
  update shops set status = p_status where id = p_shop;
end $$;
revoke execute on function approve_application(uuid, uuid), reject_application(uuid), confirm_subscription(uuid), reject_subscription(uuid), review_ad(uuid, boolean), set_shop_status(uuid, text) from public, anon;
grant execute on function approve_application(uuid, uuid), reject_application(uuid), confirm_subscription(uuid), reject_subscription(uuid), review_ad(uuid, boolean), set_shop_status(uuid, text) to authenticated;
-- Lets the vendor dashboard hear about new orders live (row-level security still applies).
alter publication supabase_realtime add table public.orders;
