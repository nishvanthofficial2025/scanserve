'use client';

import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import { LocalStore } from '@/lib/store';
import { Shop, Order, OrderStatus, PaymentStatus } from '@/lib/types/database.types';
import {
  LayoutDashboard,
  Bell,
  Volume2,
  VolumeX,
  CheckCircle2,
  Clock,
  Check,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OwnerDashboardPage() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const prevOrdersCountRef = useRef<number>(0);

  // Play crisp Web Audio chime tone for new incoming orders
  const playNewOrderChime = () => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2); // A5

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn('Audio chime playback:', e);
    }
  };

  const loadOrders = () => {
    const currentOrders = LocalStore.getOrders();

    // Trigger audio chime if new order arrived!
    if (prevOrdersCountRef.current > 0 && currentOrders.length > prevOrdersCountRef.current) {
      playNewOrderChime();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.2 } });
    }

    prevOrdersCountRef.current = currentOrders.length;
    setOrders(currentOrders);
  };

  useEffect(() => {
    setShop(LocalStore.getShop());
    loadOrders();

    // Polling refresh every 3 seconds for instant realtime dashboard updates
    const interval = setInterval(loadOrders, 3000);
    return () => clearInterval(interval);
  }, [soundEnabled]);

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    const updated = LocalStore.updateOrderStatus(orderId, newStatus);
    setOrders(updated);
  };

  const handleUpdatePaymentStatus = (orderId: string, newPaymentStatus: PaymentStatus) => {
    const updated = LocalStore.updateOrderPaymentStatus(orderId, newPaymentStatus);
    setOrders(updated);
  };

  // Metrics
  const todayOrders = orders.filter(o => o.status !== 'cancelled');
  const todaySales = todayOrders.reduce((sum, o) => sum + (o.payment_status === 'paid' ? o.total : 0), 0);
  const activeOrders = orders.filter(o => o.status === 'placed' || o.status === 'accepted' || o.status === 'ready');

  const filteredOrders = orders.filter(o => {
    if (statusFilter === 'active') return o.status === 'placed' || o.status === 'accepted' || o.status === 'ready';
    if (statusFilter === 'completed') return o.status === 'served';
    if (statusFilter === 'cancelled') return o.status === 'cancelled';
    return true;
  });

  if (!shop) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24">
      <Navbar shopSlug={shop.slug} shopName={shop.name} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Top Header & Daily Summary Widget */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center space-x-3">
              <LayoutDashboard className="w-8 h-8 text-amber-500" />
              <span>Live Orders Board</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Realtime order feed with audio chime alert on incoming orders.
            </p>
          </div>

          {/* Audio Chime Sound Toggle */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition flex items-center space-x-2 ${
                soundEnabled
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
              <span>{soundEnabled ? 'Loud Sound Alert: ON' : 'Sound Alert: MUTED'}</span>
            </button>
          </div>
        </div>

        {/* Daily Summary Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Kitchen Orders</p>
              <h3 className="text-2xl font-black text-amber-400 mt-1">{activeOrders.length}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Orders Today</p>
              <h3 className="text-2xl font-black text-white mt-1">{todayOrders.length}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Sales Today</p>
              <h3 className="text-2xl font-black text-emerald-400 mt-1">₹{todaySales}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Accepted / Served Rate</p>
              <h3 className="text-2xl font-black text-amber-400 mt-1">
                {todayOrders.length > 0 ? Math.round((orders.filter(o=>o.status==='served').length / todayOrders.length)*100) : 100}%
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
          {[
            { id: 'active', label: `Active Kitchen (${activeOrders.length})` },
            { id: 'completed', label: 'Served Orders' },
            { id: 'all', label: 'All Orders' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                statusFilter === tab.id
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOrders.map(order => {
            const timeAgo = Math.max(1, Math.round((Date.now() - new Date(order.created_at).getTime()) / 60000));

            return (
              <div
                key={order.id}
                className={`bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between shadow-2xl transition relative ${
                  order.status === 'placed'
                    ? 'border-amber-500 ring-2 ring-amber-500/20 animate-pulse-subtle'
                    : order.status === 'accepted'
                    ? 'border-blue-500/50'
                    : order.status === 'ready'
                    ? 'border-emerald-500/50'
                    : 'border-slate-800 opacity-75'
                }`}
              >
                {/* Header */}
                <div>
                  <div className="flex items-start justify-between border-b border-slate-800 pb-3 mb-3">
                    <div>
                      <span className="inline-block px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-sm tracking-wide shadow mb-1">
                        {order.table_label}
                      </span>
                      <p className="text-[11px] text-slate-400">Order #{order.id} • {timeAgo} min ago</p>
                    </div>

                    <div className="text-right">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        order.status === 'placed'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : order.status === 'accepted'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : order.status === 'ready'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-1.5 mb-4 max-h-40 overflow-y-auto">
                    {order.order_items?.map(oi => (
                      <div key={oi.id} className="flex justify-between items-center text-xs">
                        <span className="font-bold text-white">
                          {oi.quantity}x <span className="font-semibold text-slate-200">{oi.name_snapshot}</span>
                        </span>
                        <span className="text-slate-400 font-medium">₹{oi.price_snapshot * oi.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {/* Customer Note */}
                  {order.note && (
                    <div className="mb-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-amber-300">
                      <span className="font-bold text-amber-400">Note: </span>"{order.note}"
                    </div>
                  )}

                  {/* Total & Payment Status */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs mb-4">
                    <div>
                      <span className="text-slate-400">Total: </span>
                      <span className="font-black text-amber-400 text-sm">₹{order.total}</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        order.payment_status === 'paid'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {order.payment_status.toUpperCase()} ({order.payment_method})
                      </span>

                      {order.payment_status === 'unpaid' && (
                        <button
                          onClick={() => handleUpdatePaymentStatus(order.id, 'paid')}
                          className="px-2 py-0.5 bg-emerald-500 text-slate-950 text-[10px] font-bold rounded hover:bg-emerald-400 transition"
                          title="Mark as paid at counter"
                        >
                          Mark Paid
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Transition Action Buttons */}
                <div className="pt-2 border-t border-slate-800/60 grid grid-cols-2 gap-2">
                  {order.status === 'placed' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'accepted')}
                        className="py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition"
                      >
                        Accept Order
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                        className="py-2.5 bg-slate-800 hover:bg-slate-700 text-rose-400 font-semibold text-xs rounded-xl transition"
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {order.status === 'accepted' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'ready')}
                      className="col-span-2 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow transition"
                    >
                      Mark Order Ready
                    </button>
                  )}

                  {order.status === 'ready' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'served')}
                      className="col-span-2 py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-bold text-xs rounded-xl transition"
                    >
                      Mark Served to Table ✓
                    </button>
                  )}

                  {order.status === 'served' && (
                    <span className="col-span-2 py-2 text-center text-xs font-bold text-slate-500">
                      Completed Order ✓
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {filteredOrders.length === 0 && (
            <div className="col-span-full py-16 text-center bg-slate-900 border border-slate-800 rounded-2xl">
              <Clock className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-400">No active kitchen orders right now.</p>
              <p className="text-xs text-slate-500 mt-1">Orders placed by table QR scans will appear here instantly.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
