-- Order and stock functions. Prices, stock and delivery fees are read here, never trusted from the browser.

-- Shopper checkout: one cart, one order per shop, stock held for 3 hours.
create or replace function place_order(p_name text, p_phone text, p_lines jsonb, p_delivery jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_cart text := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));
  v_phone text := regexp_replace(coalesce(p_phone, ''), '\s', '', 'g');
  v_shop shops%rowtype; v_line record; v_prod products%rowtype; v_order orders%rowtype;
  v_n int := 0; v_sub int; v_fee int; v_type text; v_area text; v_out jsonb := '[]'::jsonb;
begin
  if length(trim(coalesce(p_name, ''))) < 2 then raise exception 'invalid_name'; end if;
  if v_phone !~ '^(\+?254|0)[0-9]{9}$' then raise exception 'invalid_phone'; end if;
  if jsonb_typeof(p_lines) is distinct from 'array' or jsonb_array_length(p_lines) = 0 then raise exception 'empty_cart'; end if;
  for v_shop in
    select s.* from shops s where s.status = 'active' and s.id in (
      select pr.shop_id from products pr join jsonb_to_recordset(p_lines) as l(slug text, qty int) on l.slug = pr.slug)
    order by s.id
  loop
    v_n := v_n + 1; v_sub := 0; v_fee := 0;
    v_type := coalesce(p_delivery -> v_shop.slug ->> 'type', 'pickup');
    v_area := p_delivery -> v_shop.slug ->> 'area';
    if v_type = 'delivery' then
      select fee_kes into v_fee from delivery_areas where shop_id = v_shop.id and name = v_area;
      if not found then raise exception 'invalid_area:%', v_shop.slug; end if;
    elsif not v_shop.pickup then
      raise exception 'pickup_unavailable:%', v_shop.slug;
    end if;
    insert into orders (ref, cart_ref, shop_id, customer_name, customer_phone, delivery_type, delivery_area, delivery_fee_kes, total_kes, hold_expires_at)
    values ('QS-' || substr(v_cart, 1, 4) || '-' || v_n, v_cart, v_shop.id, trim(p_name), v_phone, v_type,
            case when v_type = 'delivery' then v_area end, v_fee, 0, now() + interval '3 hours')
    returning * into v_order;
    for v_line in select l.slug, l.qty from jsonb_to_recordset(p_lines) as l(slug text, qty int) order by l.slug loop
      select * into v_prod from products where slug = v_line.slug and shop_id = v_shop.id and not archived for update;
      if not found then continue; end if;
      if v_line.qty is null or v_line.qty < 1 then raise exception 'invalid_qty'; end if;
      if v_prod.stock_on_hand - v_prod.reserved < v_line.qty then raise exception 'out_of_stock:%', v_prod.slug; end if;
      update products set reserved = reserved + v_line.qty where id = v_prod.id;
      insert into order_items (order_id, product_id, name, qty, price_kes) values (v_order.id, v_prod.id, v_prod.name, v_line.qty, v_prod.price_kes);
      insert into stock_movements (product_id, order_id, kind, qty) values (v_prod.id, v_order.id, 'reserve', v_line.qty);
      v_sub := v_sub + v_prod.price_kes * v_line.qty;
    end loop;
    if v_sub = 0 then raise exception 'empty_cart'; end if;
    update orders set total_kes = v_sub + v_fee where id = v_order.id;
    v_out := v_out || jsonb_build_object('ref', v_order.ref, 'shop', v_shop.slug);
  end loop;
  if v_n = 0 then raise exception 'empty_cart'; end if;
  return jsonb_build_object('cartRef', v_cart, 'orders', v_out);
end $$;

-- Tracking page: anyone with the long random cart reference can read that cart's orders.
create or replace function get_cart_orders(p_cart text) returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'ref', o.ref, 'cart', o.cart_ref, 'shop', s.slug, 'shopName', s.name, 'whatsapp', s.whatsapp,
    'name', o.customer_name, 'status', o.status,
    'delivery', jsonb_build_object('type', o.delivery_type, 'area', o.delivery_area, 'fee', o.delivery_fee_kes),
    'total', o.total_kes,
    'lines', (select coalesce(jsonb_agg(jsonb_build_object('name', i.name, 'qty', i.qty, 'price', i.price_kes)), '[]'::jsonb) from order_items i where i.order_id = o.id)
  ) order by o.ref), '[]'::jsonb)
  from orders o join shops s on s.id = o.shop_id where o.cart_ref = upper(p_cart)
$$;

-- Merchant: "Mark as paid" makes the stock deduction permanent.
create or replace function mark_paid(p_order uuid) returns void language plpgsql security definer set search_path = public as $$
declare o orders%rowtype; i record;
begin
  select * into o from orders where id = p_order for update;
  if not found or not (owns_shop(o.shop_id) or is_admin()) then raise exception 'not_allowed'; end if;
  if o.status <> 'pending' then raise exception 'bad_status'; end if;
  for i in select * from order_items where order_id = o.id loop
    insert into stock_movements (product_id, order_id, kind, qty) values (i.product_id, o.id, 'sale', i.qty) on conflict do nothing;
    if found then update products set reserved = reserved - i.qty, stock_on_hand = stock_on_hand - i.qty where id = i.product_id; end if;
  end loop;
  update orders set status = 'paid' where id = o.id;
end $$;

create or replace function mark_delivered(p_order uuid) returns void language plpgsql security definer set search_path = public as $$
declare o orders%rowtype;
begin
  select * into o from orders where id = p_order for update;
  if not found or not (owns_shop(o.shop_id) or is_admin()) then raise exception 'not_allowed'; end if;
  if o.status <> 'paid' then raise exception 'bad_status'; end if;
  update orders set status = 'delivered' where id = o.id;
end $$;

-- Releases the held stock of an unpaid order.
create or replace function release_order(p_order uuid, p_status text) returns void language plpgsql security definer set search_path = public as $$
declare i record;
begin
  for i in select * from order_items where order_id = p_order loop
    insert into stock_movements (product_id, order_id, kind, qty) values (i.product_id, p_order, 'release', i.qty) on conflict do nothing;
    if found then update products set reserved = greatest(reserved - i.qty, 0) where id = i.product_id; end if;
  end loop;
  update orders set status = p_status where id = p_order;
end $$;

create or replace function cancel_order(p_order uuid) returns void language plpgsql security definer set search_path = public as $$
declare o orders%rowtype;
begin
  select * into o from orders where id = p_order for update;
  if not found or not (owns_shop(o.shop_id) or is_admin()) then raise exception 'not_allowed'; end if;
  if o.status <> 'pending' then raise exception 'bad_status'; end if;
  perform release_order(o.id, 'cancelled');
end $$;

-- Merchant: bring an expired order back if the customer paid late and stock is still there.
create or replace function revive_order(p_order uuid) returns void language plpgsql security definer set search_path = public as $$
declare o orders%rowtype; i record; p products%rowtype;
begin
  select * into o from orders where id = p_order for update;
  if not found or not (owns_shop(o.shop_id) or is_admin()) then raise exception 'not_allowed'; end if;
  if o.status <> 'expired' then raise exception 'bad_status'; end if;
  for i in select * from order_items where order_id = o.id loop
    select * into p from products where id = i.product_id for update;
    if p.stock_on_hand - p.reserved < i.qty then raise exception 'out_of_stock:%', p.slug; end if;
    update products set reserved = reserved + i.qty where id = i.product_id;
  end loop;
  delete from stock_movements where order_id = o.id and kind = 'release';
  update orders set status = 'pending', hold_expires_at = now() + interval '3 hours' where id = o.id;
end $$;

-- Run every 5 minutes (see docs/BACKEND.md): releases stock held by unpaid orders.
create or replace function expire_holds() returns int language plpgsql security definer set search_path = public as $$
declare o record; n int := 0;
begin
  for o in select id from orders where status = 'pending' and hold_expires_at < now() for update skip locked loop
    perform release_order(o.id, 'expired'); n := n + 1;
  end loop;
  return n;
end $$;

revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function place_order(text, text, jsonb, jsonb), get_cart_orders(text) to anon, authenticated;
grant execute on function mark_paid(uuid), mark_delivered(uuid), cancel_order(uuid), revive_order(uuid) to authenticated;
grant execute on function is_admin(), owns_shop(uuid) to anon, authenticated;
