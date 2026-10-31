-- Two application routes (retail vendor, wholesale merchant) with a Kenyan county and sub-county.
alter table applications
  add column kind text not null default 'retail' check (kind in ('retail', 'wholesale')),
  add column county text check (county is null or length(county) between 3 and 40),
  add column sub_county text check (sub_county is null or length(sub_county) between 2 and 60),
  add column supply_capacity text check (supply_capacity is null or length(supply_capacity) <= 200),
  add column corridors text check (corridors is null or length(corridors) <= 200),
  add column moq_rules text check (moq_rules is null or length(moq_rules) <= 200),
  add column registration_no text check (registration_no is null or length(registration_no) <= 60);
-- Wholesale merchants are Top tier. Their applications must carry the extra details used for verification.
alter table applications add constraint wholesale_details check (kind <> 'wholesale' or (supply_capacity is not null and corridors is not null and moq_rules is not null and registration_no is not null));
