-- create extension if not exists "uuid-ossp"; -- Postgres Only

-- Skipping Enum checks for SQLite
-- do $$
-- begin
--   if not exists (select 1 from pg_type where typname = 'user_role') then
--     create type user_role as enum ('admin','manager','dispatcher','driver','technician','customer');
--   end if;
--   if not exists (select 1 from pg_type where typname = 'order_status') then
--     create type order_status as enum ('draft','submitted','approved','assigned','delivered','cancelled');
--   end if;
--   if not exists (select 1 from pg_type where typname = 'route_status') then
--     create type route_status as enum ('draft','published','in_progress','completed','cancelled');
--   end if;
--   if not exists (select 1 from pg_type where typname = 'stop_status') then
--     create type stop_status as enum ('pending','arrived','completed','skipped');
--   end if;
--   if not exists (select 1 from pg_type where typname = 'payment_method') then
--     create type payment_method as enum ('cash','check','credit','charge');
--   end if;
--   if not exists (select 1 from pg_type where typname = 'work_order_status') then
--     create type work_order_status as enum ('open','assigned','in_progress','completed','cancelled');
--   end if;
-- end $$;

create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  role user_role not null,
  full_name text not null,
  email text unique,
  phone text,
  password_hash text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists customers (
  id uuid primary key default uuid_generate_v4(),
  business_name text not null,
  billing_email text,
  billing_phone text,
  billing_address text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists customer_users (
  customer_id uuid not null references customers(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  primary key (customer_id, user_id)
);

create table if not exists locations (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references customers(id) on delete cascade,
  location_name text,
  address_line text not null,
  city text,
  state text,
  zip text,
  latitude double precision,
  longitude double precision,
  access_notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_locations_customer on locations(customer_id);

create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  bag_size_lbs int not null check (bag_size_lbs in (8,20)),
  sku text unique,
  base_price_cents int not null default 0,
  is_active boolean not null default true
);

create table if not exists customer_prices (
  customer_id uuid not null references customers(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  price_cents int not null,
  primary key (customer_id, product_id)
);

create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references customers(id) on delete restrict,
  location_id uuid references locations(id) on delete set null,
  status order_status not null default 'submitted',
  requested_delivery_date date,
  requested_window text,
  notes text,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_orders_customer on orders(customer_id);
create index if not exists idx_orders_status on orders(status);

create table if not exists order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id) on delete restrict,
  quantity int not null check (quantity >= 0)
);

create index if not exists idx_order_items_order on order_items(order_id);

create table if not exists routes (
  id uuid primary key default uuid_generate_v4(),
  route_date date not null,
  driver_id uuid references users(id) on delete set null,
  status route_status not null default 'draft',
  title text,
  notes text,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_routes_date on routes(route_date);
create index if not exists idx_routes_driver on routes(driver_id);

create table if not exists route_stops (
  id uuid primary key default uuid_generate_v4(),
  route_id uuid not null references routes(id) on delete cascade,
  location_id uuid not null references locations(id) on delete restrict,
  order_id uuid references orders(id) on delete set null,
  stop_sequence int not null,
  status stop_status not null default 'pending',
  planned_notes text
);

create unique index if not exists uq_route_stop_sequence on route_stops(route_id, stop_sequence);

create table if not exists deliveries (
  id uuid primary key default uuid_generate_v4(),
  route_stop_id uuid not null unique references route_stops(id) on delete cascade,
  delivered_20lb_qty int not null default 0 check (delivered_20lb_qty >= 0),
  delivered_8lb_qty int not null default 0 check (delivered_8lb_qty >= 0),
  payment payment_method not null,
  amount_cents int not null default 0 check (amount_cents >= 0),
  check_number text,
  card_last4 text,
  notes text,
  photo_url text,
  signature_url text,
  completed_at timestamptz not null default now(),
  submitted_by uuid references users(id) on delete set null
);

create table if not exists work_orders (
  id uuid primary key default uuid_generate_v4(),
  location_id uuid not null references locations(id) on delete cascade,
  status work_order_status not null default 'open',
  priority int not null default 2 check (priority between 1 and 5),
  issue_type text,
  description text,
  assigned_to uuid references users(id) on delete set null,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists work_order_photos (
  id uuid primary key default uuid_generate_v4(),
  work_order_id uuid not null references work_orders(id) on delete cascade,
  photo_url text not null,
  label text,
  created_at timestamptz not null default now()
);
