'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { LocalStore } from '@/lib/store';
import { Shop, Category, MenuItem, Order, OrderItem } from '@/lib/types/database.types';
import {
  Utensils,
  ShoppingBag,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  Leaf,
  Beef,
  ChevronRight,
  X,
  CreditCard,
  Receipt,
  Search,
  MessageSquare,
  Clock,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

interface CartItem {
  item: MenuItem;
  quantity: number;
}

export default function CustomerMenuPage({ params }: { params: { slug: string } }) {
  const searchParams = useSearchParams();
  const tableParam = searchParams.get('table') || 'Table 1';

  const [shop, setShop] = useState<Shop | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [vegOnly, setVegOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Cart & Order State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderNote, setOrderNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'counter' | 'online'>('counter');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Load shop data
    const currentShop = LocalStore.getShop();
    setShop(currentShop);
    setCategories(LocalStore.getCategories());
    setMenuItems(LocalStore.getMenuItems());

    // Check if customer already has a stored active order on this phone
    if (typeof window !== 'undefined') {
      const activeOrderId = localStorage.getItem(`scanserve_last_order_${params.slug}`);
      if (activeOrderId) {
        const orders = LocalStore.getOrders();
        const found = orders.find(o => o.id === activeOrderId && o.status !== 'served' && o.status !== 'cancelled');
        if (found) setPlacedOrder(found);
      }
    }
  }, [params.slug]);

  // Cart Helper functions
  const addToCart = (item: MenuItem) => {
    if (!item.is_available) return;
    setCart(prev => {
      const existing = prev.find(i => i.item.id === item.id);
      if (existing) {
        return prev.map(i =>
          i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.item.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map(i =>
          i.item.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
        );
      }
      return prev.filter(i => i.item.id !== itemId);
    });
  };

  const cartTotalCount = cart.reduce((acc, i) => acc + i.quantity, 0);
  const cartSubtotal = cart.reduce((acc, i) => acc + i.item.price * i.quantity, 0);
  const taxPercent = shop?.tax_percent || 5.0;
  const cartTax = Math.round(cartSubtotal * (taxPercent / 100) * 100) / 100;
  const cartTotal = Math.round((cartSubtotal + cartTax) * 100) / 100;

  // Handle Submit Order
  const handlePlaceOrder = async () => {
    if (cart.length === 0 || !shop) return;
    setPlacingOrder(true);

    const customerToken = `token_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newOrderId = `ord-${Date.now().toString().slice(-6)}`;

    const orderItems: OrderItem[] = cart.map((ci, idx) => ({
      id: `oi-${Date.now()}-${idx}`,
      order_id: newOrderId,
      menu_item_id: ci.item.id,
      name_snapshot: ci.item.name,
      price_snapshot: ci.item.price,
      quantity: ci.quantity,
    }));

    const newOrder: Order = {
      id: newOrderId,
      shop_id: shop.id,
      table_id: null,
      table_label: tableParam,
      status: 'placed',
      payment_status: paymentMethod === 'online' ? 'unpaid' : 'unpaid',
      payment_method: paymentMethod === 'online' ? (shop.payment_provider || 'zoho') : 'counter',
      subtotal: cartSubtotal,
      tax: cartTax,
      total: cartTotal,
      note: orderNote,
      customer_token: customerToken,
      created_at: new Date().toISOString(),
      order_items: orderItems,
    };

    // Save order in local reactive store
    LocalStore.addOrder(newOrder);
    localStorage.setItem(`scanserve_last_order_${params.slug}`, newOrder.id);
    localStorage.setItem(`scanserve_token_${newOrder.id}`, customerToken);

    // If online payment selected with Zoho Payments provider
    if (paymentMethod === 'online') {
      try {
        const res = await fetch('/api/payments/zoho/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_id: newOrderId }),
        });
        const paymentData = await res.json();

        // Mark payment paid for test drive / redirect to payment URL
        if (paymentData.payment_url) {
          LocalStore.updateOrderPaymentStatus(newOrderId, 'paid');
          newOrder.payment_status = 'paid';
        }
      } catch (err) {
        console.warn('Online payment initiation:', err);
      }
    }

    setPlacedOrder(newOrder);
    setCart([]);
    setCartOpen(false);
    setPlacingOrder(false);
  };

  // Filter menu items
  const filteredMenuItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory;
    const matchesVeg = vegOnly ? item.is_veg : true;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesVeg && matchesSearch;
  });

  if (!shop) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Utensils className="w-10 h-10 text-amber-500 animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-400">Loading shop menu...</p>
        </div>
      </div>
    );
  }

  // Active Placed Order Banner / Screen View
  if (placedOrder) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between max-w-md mx-auto min-h-screen border-x border-slate-900 shadow-2xl">
        {/* Header */}
        <header className="bg-slate-900 p-4 border-b border-slate-800 text-center sticky top-0 z-10">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Order #{placedOrder.id} Placed</span>
          </div>
          <h1 className="text-xl font-black text-white">{shop.name}</h1>
          <p className="text-xs text-amber-400 font-bold mt-0.5">Assigned to: {placedOrder.table_label}</p>
        </header>

        {/* Live Order Timeline */}
        <main className="p-5 space-y-6 flex-1 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2 flex items-center justify-between">
              <span>Live Order Status</span>
              <span className="text-[10px] text-slate-500 font-normal">Auto-updates</span>
            </h2>

            <div className="space-y-4 pt-1">
              {[
                { status: 'placed', title: '1. Order Received', desc: 'Shop kitchen has received your order' },
                { status: 'accepted', title: '2. Accepted & Preparing', desc: 'Chefs are brewing & cooking your items' },
                { status: 'ready', title: '3. Order Ready!', desc: 'Your order is ready to serve' },
                { status: 'served', title: '4. Served to Table', desc: 'Enjoy your delicious meal!' },
              ].map((step, idx) => {
                const statuses = ['placed', 'accepted', 'ready', 'served'];
                const currentIdx = statuses.indexOf(placedOrder.status);
                const isDone = currentIdx >= idx;
                const isCurrent = currentIdx === idx;

                return (
                  <div key={step.status} className="flex items-start space-x-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition ${
                        isDone
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {isDone ? '✓' : idx + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-xs font-bold ${isCurrent ? 'text-amber-400' : isDone ? 'text-white' : 'text-slate-500'}`}>
                        {step.title}
                      </h3>
                      <p className="text-[11px] text-slate-400">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Items Summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
              Your Items ({placedOrder.order_items?.length || 0})
            </h3>
            <div className="space-y-2 divide-y divide-slate-800/60">
              {placedOrder.order_items?.map((item) => (
                <div key={item.id} className="pt-2 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-white">{item.quantity}x</span>{' '}
                    <span className="text-slate-200">{item.name_snapshot}</span>
                  </div>
                  <span className="font-semibold text-slate-300">₹{item.price_snapshot * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-800 pt-3 space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span>₹{placedOrder.subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>GST ({shop.tax_percent}%)</span>
                <span>₹{placedOrder.tax}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-amber-400 pt-1 border-t border-slate-800">
                <span>Total Amount</span>
                <span>₹{placedOrder.total}</span>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl text-center text-xs space-y-1 border border-slate-800">
              <p className="text-slate-300">
                Payment Method:{' '}
                <span className="font-bold capitalize text-amber-400">{placedOrder.payment_method}</span>
              </p>
              <p className="text-[11px] text-slate-400">
                Status:{' '}
                <span className={`font-bold ${placedOrder.payment_status === 'paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {placedOrder.payment_status.toUpperCase()}
                </span>
              </p>
            </div>
          </div>
        </main>

        {/* Footer Actions */}
        <footer className="p-4 bg-slate-900 border-t border-slate-800 space-y-2">
          <button
            onClick={() => setPlacedOrder(null)}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition"
          >
            + Place Another Order
          </button>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-28 max-w-md mx-auto min-h-screen border-x border-slate-900 shadow-2xl relative">
      {/* Mobile Sticky Shop & Table Header */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {shop.logo_url ? (
              <img
                src={shop.logo_url}
                alt={shop.name}
                className="w-10 h-10 rounded-xl object-cover border border-slate-700 shadow"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 font-black text-xl flex items-center justify-center">
                {shop.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-base font-extrabold text-white tracking-tight leading-tight">{shop.name}</h1>
              <span className="inline-flex items-center text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                📍 {tableParam}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition flex items-center space-x-1 ${
                vegOnly
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <Leaf className="w-3 h-3" />
              <span>VEG ONLY</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-3 relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar mt-3 pt-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-950 text-slate-400 border border-slate-800'
            }`}
          >
            All Items
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-950 text-slate-400 border border-slate-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </header>

      {/* Menu List */}
      <main className="p-4 space-y-4">
        {filteredMenuItems.map(item => {
          const cartEntry = cart.find(c => c.item.id === item.id);
          const qty = cartEntry ? cartEntry.quantity : 0;

          return (
            <div
              key={item.id}
              className={`bg-slate-900 border rounded-2xl p-3.5 flex items-center justify-between gap-3 transition shadow-lg ${
                item.is_available ? 'border-slate-800' : 'border-slate-800/40 opacity-50 bg-slate-900/40'
              }`}
            >
              <div className="flex items-start space-x-3 flex-1 min-w-0">
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-800"
                  />
                )}
                <div className="space-y-1">
                  <div className="flex items-center space-x-1.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full inline-block ${
                        item.is_veg ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                    <h3 className="text-xs font-bold text-white tracking-tight">{item.name}</h3>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-snug">{item.description}</p>
                  <p className="text-xs font-extrabold text-amber-400">₹{item.price}</p>
                </div>
              </div>

              {/* Add / Quantity Controls */}
              <div className="shrink-0">
                {!item.is_available ? (
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    SOLD OUT
                  </span>
                ) : qty > 0 ? (
                  <div className="flex items-center space-x-2 bg-amber-500 text-slate-950 rounded-xl px-2 py-1 shadow-md">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1 hover:bg-amber-600 rounded-lg transition"
                    >
                      <Minus className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                    <span className="text-xs font-black px-1">{qty}</span>
                    <button
                      onClick={() => addToCart(item)}
                      className="p-1 hover:bg-amber-600 rounded-lg transition"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => addToCart(item)}
                    className="py-1.5 px-4 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 text-xs font-bold rounded-xl transition flex items-center space-x-1 shadow active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>ADD</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </main>

      {/* Floating Bottom Cart Bar */}
      {cartTotalCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-40">
          <button
            onClick={() => setCartOpen(true)}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-3.5 px-5 rounded-2xl shadow-2xl flex items-center justify-between border border-amber-400/30 transition active:scale-[0.98]"
          >
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-950 text-amber-400 flex items-center justify-center text-xs font-black">
                {cartTotalCount}
              </div>
              <span className="text-xs tracking-wider uppercase">View Cart</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-sm font-extrabold">₹{cartTotal}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* CART & CHECKOUT MODAL */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col justify-end max-w-md mx-auto">
          <div className="bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 space-y-5 max-h-[85vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-black text-white flex items-center space-x-2">
                  <ShoppingBag className="w-5 h-5 text-amber-400" />
                  <span>Your Order ({cartTotalCount} items)</span>
                </h2>
                <p className="text-[11px] text-amber-400 font-bold">Table: {tableParam}</p>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="space-y-3 max-h-48 overflow-y-auto divide-y divide-slate-800">
              {cart.map(c => (
                <div key={c.item.id} className="pt-2 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-white">{c.item.name}</h4>
                    <p className="text-[11px] text-slate-400">₹{c.item.price} each</p>
                  </div>
                  <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-xl px-2 py-1">
                    <button
                      onClick={() => removeFromCart(c.item.id)}
                      className="text-slate-400 hover:text-white"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-bold text-amber-400 text-xs px-1">{c.quantity}</span>
                    <button
                      onClick={() => addToCart(c.item)}
                      className="text-slate-400 hover:text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Special Order Note */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1 flex items-center space-x-1">
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                <span>Special Note / Instructions</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Extra spicy, less sugar tea"
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="block text-[11px] font-semibold text-slate-300 uppercase">
                Payment Option
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('counter')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                    paymentMethod === 'counter'
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  <Receipt className="w-4 h-4" />
                  <span>Pay at Counter</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('online')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                    paymentMethod === 'online'
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>UPI / Online</span>
                </button>
              </div>
            </div>

            {/* Total Breakdown */}
            <div className="border-t border-slate-800 pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span>₹{cartSubtotal}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>GST Tax ({taxPercent}%)</span>
                <span>₹{cartTax}</span>
              </div>
              <div className="flex justify-between text-base font-black text-amber-400 pt-1 border-t border-slate-800">
                <span>Total Payable</span>
                <span>₹{cartTotal}</span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={placingOrder}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-xl shadow-xl transition active:scale-95 disabled:opacity-50"
            >
              {placingOrder ? 'Sending Order to Kitchen...' : 'Confirm & Place Order'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
