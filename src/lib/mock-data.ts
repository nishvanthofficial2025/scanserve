import { Shop, TableItem, Category, MenuItem, Order, OrderItem } from './types/database.types';

export const INITIAL_MOCK_SHOP: Shop = {
  id: 'shop-demo-123',
  owner_id: 'user-demo-456',
  name: 'Chai & Bites Cafe',
  slug: 'chai-bites',
  logo_url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=200&q=80',
  tax_percent: 5.0,
  payment_mode: 'both',
  payment_provider: 'zoho',
  plan: 'trial',
  created_at: new Date().toISOString(),
};

export const INITIAL_MOCK_TABLES: TableItem[] = [
  { id: 'tbl-1', shop_id: 'shop-demo-123', label: 'Table 1', created_at: new Date().toISOString() },
  { id: 'tbl-2', shop_id: 'shop-demo-123', label: 'Table 2', created_at: new Date().toISOString() },
  { id: 'tbl-3', shop_id: 'shop-demo-123', label: 'Table 3', created_at: new Date().toISOString() },
  { id: 'tbl-4', shop_id: 'shop-demo-123', label: 'Table 4', created_at: new Date().toISOString() },
  { id: 'tbl-5', shop_id: 'shop-demo-123', label: 'Garden T-1', created_at: new Date().toISOString() },
];

export const INITIAL_MOCK_CATEGORIES: Category[] = [
  { id: 'cat-1', shop_id: 'shop-demo-123', name: 'Hot Teas & Coffees', sort_order: 1, created_at: new Date().toISOString() },
  { id: 'cat-2', shop_id: 'shop-demo-123', name: 'Snacks & Samosas', sort_order: 2, created_at: new Date().toISOString() },
  { id: 'cat-3', shop_id: 'shop-demo-123', name: 'Sandwiches & Buns', sort_order: 3, created_at: new Date().toISOString() },
  { id: 'cat-4', shop_id: 'shop-demo-123', name: 'Cool Beverages', sort_order: 4, created_at: new Date().toISOString() },
];

export const INITIAL_MOCK_MENU: MenuItem[] = [
  {
    id: 'item-1',
    shop_id: 'shop-demo-123',
    category_id: 'cat-1',
    name: 'Kulhad Masala Chai',
    description: 'Special brewed cardamom & ginger tea served in traditional clay cup.',
    price: 25,
    image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=300&q=80',
    is_veg: true,
    is_available: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'item-2',
    shop_id: 'shop-demo-123',
    category_id: 'cat-1',
    name: 'Irani Special Tea',
    description: 'Rich thick creamy milk tea with aromatic spices.',
    price: 30,
    image_url: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=300&q=80',
    is_veg: true,
    is_available: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: 'item-3',
    shop_id: 'shop-demo-123',
    category_id: 'cat-2',
    name: 'Crispy Punjabi Samosa (2 pcs)',
    description: 'Spicy potato and green peas filling served with mint & tamarind chutney.',
    price: 40,
    image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=300&q=80',
    is_veg: true,
    is_available: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'item-4',
    shop_id: 'shop-demo-123',
    category_id: 'cat-2',
    name: 'Chicken Paneer Puff',
    description: 'Flaky baked pastry filled with spiced shredded chicken & cottage cheese.',
    price: 65,
    image_url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=300&q=80',
    is_veg: false,
    is_available: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: 'item-5',
    shop_id: 'shop-demo-123',
    category_id: 'cat-3',
    name: 'Bun Maska Jam',
    description: 'Soft buttered sweet bun with mixed fruit jam.',
    price: 35,
    image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80',
    is_veg: true,
    is_available: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'item-6',
    shop_id: 'shop-demo-123',
    category_id: 'cat-3',
    name: 'Grilled Cheese Corn Sandwich',
    description: 'Double layer toastie loaded with mozzarella cheese & sweet corn.',
    price: 90,
    image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=300&q=80',
    is_veg: true,
    is_available: false, // Demo sold out item
    sort_order: 2,
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_MOCK_ORDERS: Order[] = [
  {
    id: 'ord-101',
    shop_id: 'shop-demo-123',
    table_id: 'tbl-1',
    table_label: 'Table 1',
    status: 'placed',
    payment_status: 'unpaid',
    payment_method: 'counter',
    subtotal: 90,
    tax: 4.5,
    total: 94.5,
    note: 'Make chai extra ginger please',
    customer_token: 'cust-token-999',
    created_at: new Date(Date.now() - 3 * 60000).toISOString(),
    order_items: [
      { id: 'oi-1', order_id: 'ord-101', menu_item_id: 'item-1', name_snapshot: 'Kulhad Masala Chai', price_snapshot: 25, quantity: 2 },
      { id: 'oi-2', order_id: 'ord-101', menu_item_id: 'item-3', name_snapshot: 'Crispy Punjabi Samosa (2 pcs)', price_snapshot: 40, quantity: 1 }
    ]
  },
  {
    id: 'ord-102',
    shop_id: 'shop-demo-123',
    table_id: 'tbl-3',
    table_label: 'Table 3',
    status: 'accepted',
    payment_status: 'paid',
    payment_method: 'online',
    subtotal: 130,
    tax: 6.5,
    total: 136.5,
    note: 'Less spicy samosa chutney',
    customer_token: 'cust-token-888',
    created_at: new Date(Date.now() - 15 * 60000).toISOString(),
    order_items: [
      { id: 'oi-3', order_id: 'ord-102', menu_item_id: 'item-4', name_snapshot: 'Chicken Paneer Puff', price_snapshot: 65, quantity: 2 }
    ]
  }
];
