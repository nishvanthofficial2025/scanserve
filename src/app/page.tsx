import Link from 'next/link';
import {
  QrCode,
  LayoutDashboard,
  UtensilsCrossed,
  Printer,
  Settings,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';

export default function LandingHomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 font-black text-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              S
            </div>
            <div>
              <span className="font-extrabold text-white text-lg tracking-tight">ScanServe</span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                QR Micro-SaaS
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/owner/login"
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              Sign In
            </Link>
            <Link
              href="/owner/dashboard"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition active:scale-95"
            >
              Owner Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-16">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-1.5 rounded-full text-xs font-extrabold tracking-wide uppercase shadow">
            <Sparkles className="w-4 h-4" />
            <span>QR Table-Ordering Solution for Cafes & Tea Shops</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Put a QR Code on Every Table.{' '}
            <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-300 bg-clip-text text-transparent">
              Customers Order & Pay From Phone.
            </span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Eliminate waiting times, stop paper menu clutter, and receive instant kitchen orders on a live dashboard with audio chime alerts. Zero app downloads needed.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/s/chai-bites?table=Table%201"
              target="_blank"
              className="py-3.5 px-6 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center space-x-2 transition active:scale-95"
            >
              <Smartphone className="w-4 h-4" />
              <span>Test Customer QR Experience (Table 1)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/owner/dashboard"
              className="py-3.5 px-6 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white font-bold text-sm rounded-2xl shadow-lg transition flex items-center space-x-2"
            >
              <LayoutDashboard className="w-4 h-4 text-amber-400" />
              <span>Launch Live Owner Dashboard</span>
            </Link>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/s/chai-bites?table=Table%201"
            className="group bg-slate-900 border border-slate-800 hover:border-amber-500/50 p-6 rounded-3xl transition shadow-xl space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition">
              1. Customer Web App
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Mobile-first menu with veg/non-veg tags, customizable cart notes, and "Pay at Counter" or UPI checkout.
            </p>
            <span className="inline-flex items-center text-xs font-bold text-amber-400 group-hover:translate-x-1 transition">
              View Mobile Menu →
            </span>
          </Link>

          <Link
            href="/owner/dashboard"
            className="group bg-slate-900 border border-slate-800 hover:border-amber-500/50 p-6 rounded-3xl transition shadow-xl space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition">
              2. Live Owner Dashboard
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Loud audio chime on new orders. Move orders through Placed → Accepted → Ready → Served with 1 tap.
            </p>
            <span className="inline-flex items-center text-xs font-bold text-amber-400 group-hover:translate-x-1 transition">
              Open Dashboard →
            </span>
          </Link>

          <Link
            href="/owner/tables"
            className="group bg-slate-900 border border-slate-800 hover:border-amber-500/50 p-6 rounded-3xl transition shadow-xl space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition">
              <Printer className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition">
              3. Printable QR Generator
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generate one printable QR standee sheet per table with table numbers and custom shop branding.
            </p>
            <span className="inline-flex items-center text-xs font-bold text-amber-400 group-hover:translate-x-1 transition">
              Print Table QRs →
            </span>
          </Link>
        </div>

        {/* Core Advantages */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl">
          <h2 className="text-xl font-black text-white text-center">Built for Speed & Reliability</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
            <div className="space-y-2">
              <div className="inline-flex p-2.5 rounded-xl bg-amber-500/10 text-amber-400 mb-1">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">&lt;5s Quick Sold-Out Toggle</h4>
              <p className="text-xs text-slate-400">
                Mark items as sold-out in under 5 seconds so customers never order unavailable tea or food.
              </p>
            </div>

            <div className="space-y-2">
              <div className="inline-flex p-2.5 rounded-xl bg-amber-500/10 text-amber-400 mb-1">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Tamper-Proof Price Security</h4>
              <p className="text-xs text-slate-400">
                All totals, GST taxes, and item prices are calculated directly on the server to prevent manipulation.
              </p>
            </div>

            <div className="space-y-2">
              <div className="inline-flex p-2.5 rounded-xl bg-amber-500/10 text-amber-400 mb-1">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">PWA Installable</h4>
              <p className="text-xs text-slate-400">
                Add to phone home screen as a native application with smooth transitions and offline fallback.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/40 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© ScanServe Micro-SaaS • Fast QR Table Ordering for Restaurants & Tea Shops</p>
          <div className="flex items-center space-x-4">
            <Link href="/owner/setup" className="hover:text-amber-400 transition">Shop Settings</Link>
            <Link href="/owner/menu" className="hover:text-amber-400 transition">Menu Editor</Link>
            <Link href="/owner/tables" className="hover:text-amber-400 transition">Tables & QRs</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
