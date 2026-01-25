-- Seed Products
insert into products (name, bag_size_lbs, sku, base_price_cents)
values
('8lb Ice Bag', 8, 'YCI-8LB', 250),
('20lb Ice Bag', 20, 'YCI-20LB', 450)
on conflict (sku) do nothing;

-- Seed Users (password_hash is placeholder; your backend should hash real passwords)
insert into users (role, full_name, email, phone, password_hash)
values
('admin','Basit Wali','admin@yci.local','3373002072','HASHED_PASSWORD'),
('dispatcher','Dispatcher One','dispatch@yci.local',null,'HASHED_PASSWORD'),
('driver','Driver One','driver1@yci.local',null,'HASHED_PASSWORD'),
('technician','Tech One','tech1@yci.local',null,'HASHED_PASSWORD')
on conflict (email) do nothing;

-- Seed Customers
insert into customers (business_name, billing_email, billing_phone, billing_address, notes)
values
('Good Day Liquor','billing@goodday.local',null,'Lake Charles, LA', 'Cash customer'),
('Corner Market #12','billing@cornermarket.local',null,'Lake Charles, LA', 'Weekly delivery'),
('Bayou Fuel Stop','billing@bayoufuel.local',null,'Sulphur, LA', 'Needs early delivery')
returning id;

-- Grab ids (for manual DB use, do quick selects)
-- Locations
insert into locations (customer_id, location_name, address_line, city, state, zip, access_notes)
select c.id, 'Good Day Liquor', '123 Main St', 'Lake Charles', 'LA', '70601', 'Deliver to back door'
from customers c where c.business_name='Good Day Liquor';

insert into locations (customer_id, location_name, address_line, city, state, zip, access_notes)
select c.id, 'Corner Market #12', '456 Broad St', 'Lake Charles', 'LA', '70605', 'Gate code 1234'
from customers c where c.business_name='Corner Market #12';

insert into locations (customer_id, location_name, address_line, city, state, zip, access_notes)
select c.id, 'Bayou Fuel Stop', '789 Highway 90', 'Sulphur', 'LA', '70663', 'Call manager on arrival'
from customers c where c.business_name='Bayou Fuel Stop';

-- Seed Orders
insert into orders (customer_id, location_id, status, requested_delivery_date, requested_window, notes, created_at)
select c.id, l.id, 'approved', current_date, 'AM', 'Front cooler restock', now()
from customers c
join locations l on l.customer_id=c.id
where c.business_name='Good Day Liquor'
limit 1;

insert into orders (customer_id, location_id, status, requested_delivery_date, requested_window, notes, created_at)
select c.id, l.id, 'approved', current_date, 'AM', 'Weekend demand', now()
from customers c
join locations l on l.customer_id=c.id
where c.business_name='Corner Market #12'
limit 1;

-- Order items
insert into order_items (order_id, product_id, quantity)
select o.id, p.id, 10
from orders o, products p
where p.sku='YCI-20LB'
and o.notes in ('Front cooler restock','Weekend demand');

insert into order_items (order_id, product_id, quantity)
select o.id, p.id, 6
from orders o, products p
where p.sku='YCI-8LB'
and o.notes in ('Front cooler restock');

-- Seed Route for today
insert into routes (route_date, driver_id, status, title, notes, created_by)
select current_date, u.id, 'published', 'Lake Charles AM', 'Demo route', a.id
from users u
join users a on a.email='admin@yci.local'
where u.email='driver1@yci.local'
limit 1;

-- Route stops
insert into route_stops (route_id, location_id, order_id, stop_sequence, status, planned_notes)
select r.id, o.location_id, o.id, 1, 'pending', 'Deliver per order'
from routes r
join orders o on o.requested_delivery_date=r.route_date
where r.title='Lake Charles AM'
order by o.created_at asc
limit 1;

insert into route_stops (route_id, location_id, order_id, stop_sequence, status, planned_notes)
select r.id, o.location_id, o.id, 2, 'pending', 'Deliver per order'
from routes r
join orders o on o.requested_delivery_date=r.route_date
where r.title='Lake Charles AM'
order by o.created_at desc
limit 1;

-- Complete 1 delivery (cash)
insert into deliveries (route_stop_id, delivered_20lb_qty, delivered_8lb_qty, payment, amount_cents, notes, submitted_by)
select rs.id, 10, 6, 'cash', 4500, 'All good', u.id
from route_stops rs
join routes r on r.id=rs.route_id
join users u on u.email='driver1@yci.local'
where r.title='Lake Charles AM' and rs.stop_sequence=1;

update route_stops set status='completed' where stop_sequence=1;

-- Complete 2nd delivery (check)
insert into deliveries (route_stop_id, delivered_20lb_qty, delivered_8lb_qty, payment, amount_cents, check_number, notes, submitted_by)
select rs.id, 10, 0, 'check', 4500, '1029', 'Left at receiving', u.id
from route_stops rs
join routes r on r.id=rs.route_id
join users u on u.email='driver1@yci.local'
where r.title='Lake Charles AM' and rs.stop_sequence=2;

update route_stops set status='completed' where stop_sequence=2;

update routes set status='completed' where title='Lake Charles AM';
