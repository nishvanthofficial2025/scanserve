'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { LocalStore } from '@/lib/store';
import { Shop, PaymentMode } from '@/lib/types/database.types';
import { Save, Check, Store, Percent, CreditCard, Sparkles, Globe } from 'lucide-react';

export default function ShopSetupPage() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setShop(LocalStore.getShop());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop) return;

    LocalStore.saveShop(shop);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!shop) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <Navbar shopSlug={shop.slug} shopName={shop.name} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center space-x-3">
              <Store className="w-8 h-8 text-amber-500" />
              <span>Shop Settings & Branding</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Customize your restaurant profile, taxes, and accepted payment channels.
            </p>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            {shop.plan.toUpperCase()} PLAN
          </span>
        </div>

        {saved && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center space-x-2">
            <Check className="w-5 h-5 text-emerald-400" />
            <span>Shop settings saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
            <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center space-x-2">
              <Globe className="w-5 h-5 text-amber-400" />
              <span>General & Public Slug</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Shop Name
                </label>
                <input
                  type="text"
                  required
                  value={shop.name}
                  onChange={(e) => setShop({ ...shop, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  URL Slug (Customer Link)
                </label>
                <div className="flex rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
                  <span className="px-3 py-3 text-xs text-slate-500 bg-slate-900/60 border-r border-slate-800 flex items-center">
                    /s/
                  </span>
                  <input
                    type="text"
                    required
                    value={shop.slug}
                    onChange={(e) => setShop({ ...shop, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                    className="w-full bg-transparent px-3 py-3 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Logo Image URL
              </label>
              <input
                type="url"
                value={shop.logo_url}
                onChange={(e) => setShop({ ...shop, logo_url: e.target.value })}
                placeholder="https://example.com/logo.png"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
            <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-amber-400" />
              <span>Payments & Taxation</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1">
                  <Percent className="w-4 h-4 text-amber-400" />
                  <span>GST / Tax Rate (%)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="30"
                  value={shop.tax_percent}
                  onChange={(e) => setShop({ ...shop, tax_percent: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Customer Payment Mode
                </label>
                <select
                  value={shop.payment_mode}
                  onChange={(e) => setShop({ ...shop, payment_mode: e.target.value as PaymentMode })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="both">Both Online & Pay at Counter</option>
                  <option value="online">Online Payment Only</option>
                  <option value="counter">Pay at Counter Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Online Gateway Provider
                </label>
                <select
                  value={shop.payment_provider || 'zoho'}
                  onChange={(e) => setShop({ ...shop, payment_provider: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 font-semibold text-amber-400"
                >
                  <option value="zoho">Zoho Payments (UPI & Cards)</option>
                  <option value="razorpay">Razorpay Checkout</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="py-3.5 px-8 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 flex items-center space-x-2 transition active:scale-95"
            >
              <Save className="w-5 h-5" />
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
