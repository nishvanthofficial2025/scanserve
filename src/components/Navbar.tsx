'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Store, UtensilsCrossed, QrCode, LayoutDashboard, Settings, ExternalLink, LogOut } from 'lucide-react';

interface NavbarProps {
  shopSlug?: string;
  shopName?: string;
  onLogout?: () => void;
}

export default function Navbar({ shopSlug = 'chai-bites', shopName = 'ScanServe Shop', onLogout }: NavbarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/owner/dashboard', label: 'Live Orders', icon: LayoutDashboard },
    { href: '/owner/menu', label: 'Menu Editor', icon: UtensilsCrossed },
    { href: '/owner/tables', label: 'Tables & QRs', icon: QrCode },
    { href: '/owner/setup', label: 'Shop Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Shop Switcher */}
          <div className="flex items-center space-x-3">
            <Link href="/owner/dashboard" className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black text-lg">
                S
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-slate-100 text-base tracking-tight">{shopName}</span>
                <span className="block text-[10px] text-amber-400 font-medium">ScanServe Owner Dashboard</span>
              </div>
            </Link>
          </div>

          {/* Nav links desktop */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-semibold shadow'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Quick Actions: Preview Customer Page & Logout */}
          <div className="flex items-center space-x-2">
            <Link
              href={`/s/${shopSlug}?table=T-1`}
              target="_blank"
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition"
              title="Open customer ordering view in new tab"
            >
              <span>Customer View</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Nav Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-800 px-2 py-2 flex justify-around items-center shadow-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-3 rounded-lg text-[11px] font-medium transition ${
                isActive ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
