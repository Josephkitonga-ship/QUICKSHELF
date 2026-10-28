-- Demo data that mirrors lib/data.ts. Do not run in production.
insert into shops (slug, name, town, category, whatsapp, status, plan_id) values
 ('mama-njeri', 'Mama Njeri’s Groceries', 'Westlands', 'Groceries', '254700000001', 'active', 'growth'),
 ('kamau-electronics', 'Kamau Electronics', 'Nairobi CBD', 'Electronics', '254700000002', 'active', 'growth'),
 ('wanjiru-fashion', 'Wanjiru Fashion', 'Thika', 'Fashion', '254700000003', 'active', 'starter'),
 ('otieno-hardware', 'Otieno Hardware', 'Kisumu', 'Building', '254700000004', 'active', 'starter'),
 ('achieng-home', 'Achieng Home', 'Mombasa', 'Home & Kitchen', '254700000005', 'active', 'starter');
insert into delivery_areas (shop_id, name, fee_kes) select id, 'Westlands', 70 from shops where slug = 'mama-njeri';
insert into delivery_areas (shop_id, name, fee_kes) select id, 'Nairobi CBD', 100 from shops where slug = 'mama-njeri';
insert into delivery_areas (shop_id, name, fee_kes) select id, 'Thika town', 150 from shops where slug = 'wanjiru-fashion';
insert into delivery_areas (shop_id, name, fee_kes) select id, 'Kisumu town', 200 from shops where slug = 'otieno-hardware';
insert into delivery_areas (shop_id, name, fee_kes) select id, 'Mombasa island', 150 from shops where slug = 'achieng-home';
insert into products (shop_id, slug, name, price_kes, category, badge, stock_on_hand, description)
select s.id, v.slug, v.name, v.price, v.cat, v.badge, v.stock, 'Sample description. Replace with the shop’s own text.'
from (values
 ('mama-njeri','maize-flour-2kg','Maize flour 2 kg',150,'Groceries','Offer',24),
 ('mama-njeri','cooking-oil-1l','Cooking oil 1 L',280,'Groceries',null,2),
 ('mama-njeri','tomatoes-1kg','Tomatoes 1 kg',120,'Groceries','New',40),
 ('kamau-electronics','phone-charger','Phone charger',450,'Electronics',null,15),
 ('kamau-electronics','bluetooth-speaker','Bluetooth speaker',1800,'Electronics','Offer',6),
 ('wanjiru-fashion','cotton-dress','Cotton dress',1200,'Fashion','New',10),
 ('wanjiru-fashion','sneakers','Sneakers',2100,'Fashion',null,0),
 ('otieno-hardware','padlock-50mm','Padlock 50 mm',380,'Building',null,30),
 ('otieno-hardware','work-boots','Work boots',2900,'Building','New',8),
 ('achieng-home','kitchen-set','Kitchen set',2400,'Home & Kitchen',null,5)
) as v(shop, slug, name, price, cat, badge, stock) join shops s on s.slug = v.shop;
insert into ads (shop_id, placement, headline, line, starts_at, ends_at, status)
select id, 'banner', 'Weekend offer at Kamau Electronics', 'Chargers from KSh 450', now() - interval '1 day', now() + interval '30 days', 'approved' from shops where slug = 'kamau-electronics';
