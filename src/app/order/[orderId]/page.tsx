'use client';

import { useState, useEffect } from 'react';
import { LocalStore } from '@/lib/store';
import { Order, Shop } from '@/lib/types/database.types';
import { CheckCircle2, Clock, Utensils, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function OrderStatusPage({ params }: { params: { orderId: string } }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);

  const fetchOrder = () => {
    const orders = LocalStore.getOrders();
    const found = orders.find(o => o.id === params.orderId);
    if (found) setOrder(found);
    setShop(LocalStore.getShop());
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 3000); // Polling refresh
    return () => clearInterval(interval);
  }, [params.orderId]);

  if (!order || !shop) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Utensils className="w-10 h-10 text-amber-500 animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-400">Loading order tracking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between max-w-md mx-auto border-x border-slate-900 shadow-2xl">
      <header className="bg-slate-900 p-4 border-b border-slate-800 flex items-center justify-between sticky top-0 z-10">
        <Link href={`/s/${shop.slug}?table=${encodeURIComponent(order.table_label)}`} className="text-slate-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="text-center">
          <h1 className="text-base font-extrabold text-white">{shop.name}</h1>
          <p className="text-xs text-amber-400 font-bold">{order.table_label}</p>
        </div>
        <button onClick={fetchOrder} className="text-slate-400 hover:text-amber-400">
          <RefreshCw className="w-4 h-4" />
        </button>
      </header>

      <main className="p-5 space-y-6 flex-1 overflow-y-auto">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-1.5 rounded-full text-xs font-bold">
            <Clock className="w-4 h-4" />
            <span>ORDER #{order.id}</span>
          </div>
          <h2 className="text-xl font-black text-white capitalize">Status: {order.status}</h2>
        </div>

        {/* Timeline */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          {[
            { status: 'placed', title: 'Order Placed', desc: 'Received by kitchen' },
            { status: 'accepted', title: 'Preparing', desc: 'Chefs are cooking' },
            { status: 'ready', title: 'Order Ready', desc: 'Ready for table' },
            { status: 'served', title: 'Served', desc: 'Order delivered' },
          ].map((step, idx) => {
            const statuses = ['placed', 'accepted', 'ready', 'served'];
            const currentIdx = statuses.indexOf(order.status);
            const isDone = currentIdx >= idx;
            return (
              <div key={step.status} className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isDone ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-500'}`}>
                  {isDone ? '✓' : idx + 1}
                </div>
                <div>
                  <h4 className={`text-xs font-bold ${isDone ? 'text-white' : 'text-slate-500'}`}>{step.title}</h4>
                  <p className="text-[10px] text-slate-400">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
