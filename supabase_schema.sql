-- ══════════════════════════════════════════════════════════════
--  Genaan Platform — Supabase Schema (historical bootstrap snapshot)
--  NOTE: Live DB may differ. Use fix_rls_policies.sql, add_*.sql, and
--  migrations in repo root for consultations, homepage_sections, profiles, etc.
--  Auth users live in auth.users; app profile data is in public.profiles (not users).
-- ══════════════════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- 1. USERS (public profile mirroring auth.users)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.users (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text,
  first_name   text,
  last_name    text,
  phone        text,
  address      text,
  city         text,
  country      text default 'Egypt',
  postcode     text,
  is_admin     boolean default false,
  created_at   timestamptz default now()
);
alter table public.users enable row level security;
create policy "Users can read own row"   on public.users for select using (auth.uid() = id);
create policy "Users can update own row" on public.users for update using (auth.uid() = id);
create policy "Admins can read all"      on public.users for select using (
  exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true)
);

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email, first_name, last_name, is_admin)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce((new.raw_user_meta_data->>'is_admin')::boolean, false)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- 2. CATEGORIES
-- ─────────────────────────────────────────────────────────────
create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  name_en    text not null,
  name_ar    text not null,
  created_at timestamptz default now()
);
alter table public.categories enable row level security;
create policy "Public read categories" on public.categories for select using (true);
create policy "Admin write categories" on public.categories for all using (
  exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true)
);

-- Seed categories
insert into public.categories (slug, name_en, name_ar) values
  ('plant',     'Plants',      'نباتات'),
  ('pot',       'Pots',        'أحواض'),
  ('soil',      'Soil',        'تربة'),
  ('vitamin',   'Vitamins',    'فيتامينات'),
  ('accessory', 'Accessories', 'اكسسوارات')
on conflict (slug) do nothing;

-- ─────────────────────────────────────────────────────────────
-- 3. PRODUCTS
-- ─────────────────────────────────────────────────────────────
create table if not exists public.products (
  id              uuid primary key default gen_random_uuid(),
  name_en         text not null,
  name_ar         text not null,
  description_en  text,
  description_ar  text,
  price           numeric(10,2) not null default 0,
  original_price  numeric(10,2),
  category        text references public.categories(slug),
  stock           integer default 0,
  image_url       text,
  images          text[] default '{}',
  is_featured     boolean default false,
  is_active       boolean default true,
  watering_days   integer,
  light_level     text,
  humidity_level  text,
  created_at      timestamptz default now()
);
alter table public.products enable row level security;
create policy "Public read active products" on public.products for select using (is_active = true);
create policy "Admin full access products" on public.products for all using (
  exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true)
);

-- ─────────────────────────────────────────────────────────────
-- 4. ORDERS
-- ─────────────────────────────────────────────────────────────
create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references public.users(id),
  user_email      text,
  status          text default 'pending'
                  check (status in ('pending','confirmed','shipped','delivered','cancelled')),
  payment_status  text default 'unpaid'
                  check (payment_status in ('unpaid','paid','refunded')),
  payment_method  text default 'cod',
  total           numeric(10,2) default 0,
  subtotal        numeric(10,2) default 0,
  shipping_fee    numeric(10,2) default 0,
  discount        numeric(10,2) default 0,
  coupon_code     text,
  shipping_name   text,
  shipping_phone  text,
  shipping_address text,
  shipping_city   text,
  shipping_country text default 'Egypt',
  notes           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
alter table public.orders enable row level security;
create policy "Users read own orders"  on public.orders for select using (auth.uid() = user_id);
create policy "Users insert orders"    on public.orders for insert with check (auth.uid() = user_id);
create policy "Admin all orders"       on public.orders for all using (
  exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true)
);

-- ─────────────────────────────────────────────────────────────
-- 5. ORDER ITEMS
-- ─────────────────────────────────────────────────────────────
create table if not exists public.order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid references public.orders(id) on delete cascade,
  product_id  uuid references public.products(id),
  name_en     text,
  name_ar     text,
  price       numeric(10,2),
  quantity    integer,
  image_url   text
);
alter table public.order_items enable row level security;
create policy "Users read own order items" on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
);
create policy "Users insert order items" on public.order_items for insert with check (
  exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
);
create policy "Admin all order items" on public.order_items for all using (
  exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true)
);

-- ─────────────────────────────────────────────────────────────
-- 6. COUPONS
-- ─────────────────────────────────────────────────────────────
create table if not exists public.coupons (
  id              uuid primary key default gen_random_uuid(),
  code            text unique not null,
  discount_type   text default 'percentage' check (discount_type in ('percentage','fixed')),
  discount_value  numeric(10,2) not null,
  min_order       numeric(10,2) default 0,
  max_uses        integer,
  used_count      integer default 0,
  expires_at      timestamptz,
  is_active       boolean default true,
  created_at      timestamptz default now()
);
alter table public.coupons enable row level security;
create policy "Public check coupon" on public.coupons for select using (is_active = true);
create policy "Admin manage coupons" on public.coupons for all using (
  exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true)
);

-- ─────────────────────────────────────────────────────────────
-- 7. REVIEWS
-- ─────────────────────────────────────────────────────────────
create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid references public.products(id) on delete cascade,
  user_id     uuid references public.users(id),
  user_name   text,
  rating      integer check (rating between 1 and 5),
  comment     text,
  is_approved boolean default false,
  created_at  timestamptz default now()
);
alter table public.reviews enable row level security;
create policy "Public read approved reviews" on public.reviews for select using (is_approved = true);
create policy "Users insert reviews" on public.reviews for insert with check (auth.uid() = user_id);
create policy "Admin all reviews" on public.reviews for all using (
  exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true)
);

-- ─────────────────────────────────────────────────────────────
-- 8. POSTS (Blog/Journal)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.posts (
  id            uuid primary key default gen_random_uuid(),
  title_en      text not null,
  title_ar      text not null,
  slug          text unique not null,
  content_en    text,
  content_ar    text,
  excerpt_en    text,
  excerpt_ar    text,
  cover_image   text,
  is_published  boolean default false,
  author        text default 'Genaan Team',
  tags          text[] default '{}',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
alter table public.posts enable row level security;
create policy "Public read published posts" on public.posts for select using (is_published = true);
create policy "Admin all posts" on public.posts for all using (
  exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true)
);

-- ─────────────────────────────────────────────────────────────
-- 9. CONTACT MESSAGES
-- ─────────────────────────────────────────────────────────────
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  subject    text,
  message    text not null,
  is_read    boolean default false,
  created_at timestamptz default now()
);
alter table public.contact_messages enable row level security;
create policy "Anyone can insert message" on public.contact_messages for insert with check (true);
create policy "Admin read messages" on public.contact_messages for all using (
  exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true)
);

-- ─────────────────────────────────────────────────────────────
-- 10. SPACES (Community photos)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.spaces (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.users(id),
  user_name   text,
  image_url   text not null,
  caption_en  text,
  caption_ar  text,
  tag_en      text,
  tag_ar      text,
  likes       integer default 0,
  is_approved boolean default true,
  created_at  timestamptz default now()
);
alter table public.spaces enable row level security;
create policy "Public read approved spaces" on public.spaces for select using (is_approved = true);
create policy "Users insert spaces" on public.spaces for insert with check (auth.uid() = user_id);
create policy "Admin all spaces" on public.spaces for all using (
  exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true)
);

-- ─────────────────────────────────────────────────────────────
-- 11. FAQs
-- ─────────────────────────────────────────────────────────────
create table if not exists public.faqs (
  id           uuid primary key default gen_random_uuid(),
  question_en  text not null,
  question_ar  text not null,
  answer_en    text not null,
  answer_ar    text not null,
  order_num    integer default 0,
  is_active    boolean default true,
  created_at   timestamptz default now()
);
alter table public.faqs enable row level security;
create policy "Public read faqs" on public.faqs for select using (is_active = true);
create policy "Admin all faqs" on public.faqs for all using (
  exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true)
);

-- ─────────────────────────────────────────────────────────────
-- 12. NEWSLETTER SUBSCRIPTIONS
-- ─────────────────────────────────────────────────────────────
create table if not exists public.newsletter_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  email      text unique not null,
  is_active  boolean default true,
  created_at timestamptz default now()
);
alter table public.newsletter_subscriptions enable row level security;
create policy "Anyone can subscribe" on public.newsletter_subscriptions for insert with check (true);
create policy "Admin read subscribers" on public.newsletter_subscriptions for select using (
  exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true)
);

-- ─────────────────────────────────────────────────────────────
-- STORAGE BUCKETS
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public) values
  ('products', 'products', true),
  ('spaces',   'spaces',   true),
  ('posts',    'posts',    true)
on conflict (id) do nothing;

-- Storage policies
create policy "Public read products bucket" on storage.objects for select using (bucket_id = 'products');
create policy "Admin upload products"       on storage.objects for insert with check (
  bucket_id = 'products' and
  exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true)
);
create policy "Public read spaces bucket"   on storage.objects for select using (bucket_id = 'spaces');
create policy "Authenticated upload spaces" on storage.objects for insert with check (
  bucket_id = 'spaces' and auth.uid() is not null
);
create policy "Public read posts bucket"    on storage.objects for select using (bucket_id = 'posts');
create policy "Admin upload posts"          on storage.objects for insert with check (
  bucket_id = 'posts' and
  exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true)
);
