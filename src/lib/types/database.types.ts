export type PaymentMode = 'online' | 'counter' | 'both';
export type PaymentProvider = 'razorpay' | 'zoho';
export type OrderStatus = 'placed' | 'accepted' | 'ready' | 'served' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'failed' | 'refunded';

export interface Shop {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  logo_url: string;
  tax_percent: number;
  payment_mode: PaymentMode;
  payment_provider?: PaymentProvider;
  plan: string;
  created_at: string;
}

export interface TableItem {
  id: string;
  shop_id: string;
  label: string;
  created_at: string;
}

export interface Category {
  id: string;
  shop_id: string;
  name: string;
  sort_order: number;
  created_at: string;
}

export interface MenuItem {
  id: string;
  shop_id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_veg: boolean;
  is_available: boolean;
  sort_order: number;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  name_snapshot: string;
  price_snapshot: number;
  quantity: number;
}

export interface Order {
  id: string;
  shop_id: string;
  table_id: string | null;
  table_label: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: string;
  subtotal: number;
  tax: number;
  total: number;
  note: string;
  customer_token: string;
  created_at: string;
  order_items?: OrderItem[];
}

export interface Payment {
  id: string;
  order_id: string;
  provider: string;
  provider_order_id: string;
  provider_payment_id: string;
  status: string;
  created_at: string;
}
