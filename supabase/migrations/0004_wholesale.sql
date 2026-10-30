-- Wholesale refills between vendors. Run after 0003.
-- Wholesale prices are readable only by approved vendors whose plan allows buying, and by the supplier who owns them.
create table wholesale_terms (
  product_id uuid primary key references products on delete cascade,
  moq int not null check (moq >= 1),
  price_breaks jsonb not null,                -- [{"from":12,"price":130},{"from":48,"price":122}]
  dispatch_days int not null default 2 check (dispatch_days >= 0),
  active boolean not null default true
);
create table refill_requests (
  id uuid primary key default gen_random_uuid(), ref text unique not null,
  buyer_shop_id uuid not null references shops, supplier_shop_id uuid not null references shops,
  status text not null default 'requested' check (status in ('requested','confirmed','paid','dispatched','received','cancelled')),
  total_kes int not null, created_at timestamptz not null default now()
);
create table refill_items (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references refill_requests on delete cascade,
  product_id uuid not null references products, name text not null,
  qty int not null check (qty > 0), unit_price_kes int not null
);

alter table wholesale_terms enable row level security;
create policy terms_read on wholesale_terms for select using (
  (active and exists (select 1 from shops s join plans pl on pl.id = s.plan_id where s.owner_id = auth.uid() and s.status = 'active' and pl.can_buy_wholesale))
  or exists (select 1 from products p where p.id = product_id and owns_shop(p.shop_id)) or is_admin());
create policy terms_write on wholesale_terms for all
  using (exists (select 1 from products p join shops s on s.id = p.shop_id join plans pl on pl.id = s.plan_id where p.id = product_id and s.owner_id = auth.uid() and pl.can_supply_wholesale))
  with check (exists (select 1 from products p join shops s on s.id = p.shop_id join plans pl on pl.id = s.plan_id where p.id = product_id and s.owner_id = auth.uid() and pl.can_supply_wholesale));

alter table refill_requests enable row level security;
create policy refill_read on refill_requests for select using (owns_shop(buyer_shop_id) or owns_shop(supplier_shop_id) or is_admin());
alter table refill_items enable row level security;
create policy refill_items_read on refill_items for select using (exists (select 1 from refill_requests r where r.id = request_id and (owns_shop(r.buyer_shop_id) or owns_shop(r.supplier_shop_id) or is_admin())));
revoke insert, update, delete on refill_requests, refill_items from anon, authenticated;

-- A vendor asks one supplier to restock them. No stock is held until the supplier confirms.
create or replace function create_refill_request(p_buyer uuid, p_lines jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_buyer shops%rowtype; v_sup uuid := null; v_line record; v_prod products%rowtype; v_terms wholesale_terms%rowtype;
  v_unit int; v_total int := 0; v_req refill_requests%rowtype; v_items jsonb := '[]'::jsonb; v_wa text;
begin
  select * into v_buyer from shops where id = p_buyer and owner_id = auth.uid() and status = 'active';
  if not found then raise exception 'not_allowed'; end if;
  if not exists (select 1 from plans where id = v_buyer.plan_id and can_buy_wholesale) then raise exception 'plan_no_buy'; end if;
  if jsonb_typeof(p_lines) is distinct from 'array' or jsonb_array_length(p_lines) = 0 then raise exception 'empty_request'; end if;
  for v_line in select l.slug, l.qty from jsonb_to_recordset(p_lines) as l(slug text, qty int) loop
    select * into v_prod from products where slug = v_line.slug and not archived;
    if not found then raise exception 'unknown_product:%', v_line.slug; end if;
    if v_sup is null then v_sup := v_prod.shop_id; elsif v_sup <> v_prod.shop_id then raise exception 'one_supplier_per_request'; end if;
    if v_prod.shop_id = p_buyer then raise exception 'own_product'; end if;
    select * into v_terms from wholesale_terms where product_id = v_prod.id and active;
    if not found then raise exception 'not_wholesale:%', v_line.slug; end if;
    select (b ->> 'price')::int into v_unit from jsonb_array_elements(v_terms.price_breaks) b
      where (b ->> 'from')::int <= v_line.qty and v_line.qty >= v_terms.moq order by (b ->> 'from')::int desc limit 1;
    if v_unit is null then raise exception 'below_moq:%', v_line.slug; end if;
    v_total := v_total + v_unit * v_line.qty;
    v_items := v_items || jsonb_build_object('productId', v_prod.id, 'name', v_prod.name, 'qty', v_line.qty, 'unit', v_unit);
  end loop;
  if not exists (select 1 from shops s join plans pl on pl.id = s.plan_id where s.id = v_sup and s.status = 'active' and pl.can_supply_wholesale) then raise exception 'supplier_not_allowed'; end if;
  insert into refill_requests (ref, buyer_shop_id, supplier_shop_id, total_kes)
  values ('RF-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)), p_buyer, v_sup, v_total) returning * into v_req;
  insert into refill_items (request_id, product_id, name, qty, unit_price_kes)
  select v_req.id, (i ->> 'productId')::uuid, i ->> 'name', (i ->> 'qty')::int, (i ->> 'unit')::int from jsonb_array_elements(v_items) i;
  select whatsapp into v_wa from shops where id = v_sup;
  return jsonb_build_object('ref', v_req.ref, 'total', v_total, 'supplierWhatsapp', v_wa);
end $$;
revoke execute on function create_refill_request(uuid, jsonb) from public, anon;
grant execute on function create_refill_request(uuid, jsonb) to authenticated;
