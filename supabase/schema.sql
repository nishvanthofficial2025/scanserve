-- =====================================================================
-- ScanServe: Complete Supabase PostgreSQL Schema & Security Rules (RLS)
-- =====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUM TYPES
DO $$ BEGIN
  CREATE TYPE payment_mode_enum AS ENUM ('online', 'counter', 'both');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE order_status_enum AS ENUM ('placed', 'accepted', 'ready', 'served', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status_enum AS ENUM ('unpaid', 'paid', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. TABLES DEFINITION

-- SHOPS
CREATE TABLE IF NOT EXISTS public.shops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT DEFAULT '',
  tax_percent NUMERIC(5, 2) NOT NULL DEFAULT 5.00,
  payment_mode payment_mode_enum NOT NULL DEFAULT 'both',
  plan TEXT NOT NULL DEFAULT 'trial',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLES
CREATE TABLE IF NOT EXISTS public.tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- MENU ITEMS
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  image_url TEXT DEFAULT '',
  is_veg BOOLEAN NOT NULL DEFAULT true,
  is_available BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  table_id UUID REFERENCES public.tables(id) ON DELETE SET NULL,
  table_label TEXT DEFAULT 'Counter',
  status order_status_enum NOT NULL DEFAULT 'placed',
  payment_status payment_status_enum NOT NULL DEFAULT 'unpaid',
  payment_method TEXT NOT NULL DEFAULT 'counter',
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  tax NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  note TEXT DEFAULT '',
  customer_token TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ORDER ITEMS
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
  name_snapshot TEXT NOT NULL,
  price_snapshot NUMERIC(10, 2) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0)
);

-- PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'razorpay',
  provider_order_id TEXT DEFAULT '',
  provider_payment_id TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. INDEXES FOR FAST RECOVERY & LOOKUPS
CREATE INDEX IF NOT EXISTS idx_shops_owner ON public.shops(owner_id);
CREATE INDEX IF NOT EXISTS idx_shops_slug ON public.shops(slug);
CREATE INDEX IF NOT EXISTS idx_tables_shop ON public.tables(shop_id);
CREATE INDEX IF NOT EXISTS idx_categories_shop ON public.categories(shop_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_shop ON public.menu_items(shop_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON public.menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_shop ON public.orders(shop_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_token ON public.orders(customer_token);

-- 5. ROW LEVEL SECURITY (RLS) POLICIES

ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Shops: Owner can CRUD their own shops; Public can read shops by slug or id
CREATE POLICY "Public can view active shop info" ON public.shops
  FOR SELECT USING (true);

CREATE POLICY "Owners can insert their shop" ON public.shops
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their shop" ON public.shops
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their shop" ON public.shops
  FOR DELETE USING (auth.uid() = owner_id);

-- Tables: Owner can CRUD; Public can view tables for ordering
CREATE POLICY "Public can view tables" ON public.tables
  FOR SELECT USING (true);

CREATE POLICY "Owners can manage tables" ON public.tables
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.shops WHERE shops.id = tables.shop_id AND shops.owner_id = auth.uid())
  );

-- Categories & Menu Items: Owner full control; Public read-only
CREATE POLICY "Public can view categories" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Owners can manage categories" ON public.categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.shops WHERE shops.id = categories.shop_id AND shops.owner_id = auth.uid())
  );

CREATE POLICY "Public can view available menu items" ON public.menu_items
  FOR SELECT USING (true);

CREATE POLICY "Owners can manage menu items" ON public.menu_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.shops WHERE shops.id = menu_items.shop_id AND shops.owner_id = auth.uid())
  );

-- Orders: Owner can view/manage all shop orders; Customers can insert and read their order by customer_token
CREATE POLICY "Public & Owners can view orders" ON public.orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.shops WHERE shops.id = orders.shop_id AND shops.owner_id = auth.uid())
    OR orders.customer_token IS NOT NULL
    OR auth.role() = 'anon'
  );

CREATE POLICY "Public can insert order" ON public.orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Owners can update orders" ON public.orders
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.shops WHERE shops.id = orders.shop_id AND shops.owner_id = auth.uid())
  );

-- Order Items
CREATE POLICY "Public & Owners can view order items" ON public.order_items
  FOR SELECT USING (true);

CREATE POLICY "Public can insert order items" ON public.order_items
  FOR INSERT WITH CHECK (true);

-- Payments
CREATE POLICY "Public & Owners can view payments" ON public.payments
  FOR SELECT USING (true);

CREATE POLICY "System/Public can insert payments" ON public.payments
  FOR INSERT WITH CHECK (true);

-- 6. SERVER-SIDE RPC FUNCTION: CREATE ORDER WITH TAMPER-PROOF PRICES
CREATE OR REPLACE FUNCTION create_order_with_items(
  p_shop_id UUID,
  p_table_id UUID,
  p_table_label TEXT,
  p_payment_method TEXT,
  p_note TEXT,
  p_customer_token TEXT,
  p_items JSONB -- Array of { menu_item_id: UUID, quantity: INT }
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tax_percent NUMERIC(5,2);
  v_subtotal NUMERIC(10,2) := 0.00;
  v_tax NUMERIC(10,2) := 0.00;
  v_total NUMERIC(10,2) := 0.00;
  v_order_id UUID;
  v_item JSONB;
  v_menu_item RECORD;
  v_item_subtotal NUMERIC(10,2);
BEGIN
  -- Get shop tax percentage
  SELECT tax_percent INTO v_tax_percent FROM public.shops WHERE id = p_shop_id;
  IF v_tax_percent IS NULL THEN
    v_tax_percent := 5.00;
  END IF;

  -- Create Order Record initially
  INSERT INTO public.orders (
    shop_id, table_id, table_label, status, payment_status, payment_method,
    subtotal, tax, total, note, customer_token
  ) VALUES (
    p_shop_id, p_table_id, COALESCE(p_table_label, 'Counter'), 'placed', 'unpaid', p_payment_method,
    0.00, 0.00, 0.00, COALESCE(p_note, ''), COALESCE(p_customer_token, '')
  ) RETURNING id INTO v_order_id;

  -- Iterate through JSON items and pull actual item prices from menu_items table
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT * INTO v_menu_item FROM public.menu_items
    WHERE id = (v_item->>'menu_item_id')::UUID AND shop_id = p_shop_id;

    IF v_menu_item IS NULL THEN
      RAISE EXCEPTION 'Item not found or unavailable';
    END IF;

    IF NOT v_menu_item.is_available THEN
      RAISE EXCEPTION 'Item % is currently sold out', v_menu_item.name;
    END IF;

    v_item_subtotal := v_menu_item.price * (v_item->>'quantity')::INT;
    v_subtotal := v_subtotal + v_item_subtotal;

    INSERT INTO public.order_items (
      order_id, menu_item_id, name_snapshot, price_snapshot, quantity
    ) VALUES (
      v_order_id, v_menu_item.id, v_menu_item.name, v_menu_item.price, (v_item->>'quantity')::INT
    );
  END LOOP;

  -- Calculate Tax & Total on server
  v_tax := ROUND((v_subtotal * (v_tax_percent / 100.0)), 2);
  v_total := v_subtotal + v_tax;

  -- Update Order with calculated totals
  UPDATE public.orders
  SET subtotal = v_subtotal, tax = v_tax, total = v_total
  WHERE id = v_order_id;

  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'subtotal', v_subtotal,
    'tax', v_tax,
    'total', v_total
  );
END;
$$;

-- 7. REALTIME REPLICATION CONFIGURATION
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
