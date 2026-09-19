import { Shop, TableItem, Category, MenuItem, Order, OrderStatus, PaymentStatus } from './types/database.types';
import { INITIAL_MOCK_SHOP, INITIAL_MOCK_TABLES, INITIAL_MOCK_CATEGORIES, INITIAL_MOCK_MENU, INITIAL_MOCK_ORDERS } from './mock-data';

const STORAGE_KEYS = {
  SHOP: 'scanserve_shop',
  TABLES: 'scanserve_tables',
  CATEGORIES: 'scanserve_categories',
  MENU: 'scanserve_menu',
  ORDERS: 'scanserve_orders',
};

export class LocalStore {
  static getShop(): Shop {
    if (typeof window === 'undefined') return INITIAL_MOCK_SHOP;
    const stored = localStorage.getItem(STORAGE_KEYS.SHOP);
    return stored ? JSON.parse(stored) : INITIAL_MOCK_SHOP;
  }

  static saveShop(shop: Shop) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.SHOP, JSON.stringify(shop));
  }

  static getTables(): TableItem[] {
    if (typeof window === 'undefined') return INITIAL_MOCK_TABLES;
    const stored = localStorage.getItem(STORAGE_KEYS.TABLES);
    return stored ? JSON.parse(stored) : INITIAL_MOCK_TABLES;
  }

  static saveTables(tables: TableItem[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
  }

  static getCategories(): Category[] {
    if (typeof window === 'undefined') return INITIAL_MOCK_CATEGORIES;
    const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return stored ? JSON.parse(stored) : INITIAL_MOCK_CATEGORIES;
  }

  static saveCategories(categories: Category[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }

  static getMenuItems(): MenuItem[] {
    if (typeof window === 'undefined') return INITIAL_MOCK_MENU;
    const stored = localStorage.getItem(STORAGE_KEYS.MENU);
    return stored ? JSON.parse(stored) : INITIAL_MOCK_MENU;
  }

  static saveMenuItems(items: MenuItem[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(items));
  }

  static toggleItemAvailability(itemId: string): MenuItem[] {
    const items = this.getMenuItems();
    const updated = items.map(item =>
      item.id === itemId ? { ...item, is_available: !item.is_available } : item
    );
    this.saveMenuItems(updated);
    return updated;
  }

  static getOrders(): Order[] {
    if (typeof window === 'undefined') return INITIAL_MOCK_ORDERS;
    const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return stored ? JSON.parse(stored) : INITIAL_MOCK_ORDERS;
  }

  static saveOrders(orders: Order[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }

  static addOrder(newOrder: Order): Order[] {
    const orders = this.getOrders();
    const updated = [newOrder, ...orders];
    this.saveOrders(updated);
    return updated;
  }

  static updateOrderStatus(orderId: string, status: OrderStatus): Order[] {
    const orders = this.getOrders();
    const updated = orders.map(ord =>
      ord.id === orderId ? { ...ord, status } : ord
    );
    this.saveOrders(updated);
    return updated;
  }

  static updateOrderPaymentStatus(orderId: string, payment_status: PaymentStatus): Order[] {
    const orders = this.getOrders();
    const updated = orders.map(ord =>
      ord.id === orderId ? { ...ord, payment_status } : ord
    );
    this.saveOrders(updated);
    return updated;
  }
}
