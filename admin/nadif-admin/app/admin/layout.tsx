'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Layers, LayoutDashboard, ShoppingBag, Settings, LogOut, Menu, X, Sparkles, User, Bell, ClipboardList, Ticket, Sliders, BookOpen, Users, UserCheck } from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  disabled?: boolean;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/admin/dashboard-mock', icon: LayoutDashboard, disabled: true },
  { name: 'Categories', href: '/admin/categories', icon: Layers, disabled: false },
  { name: 'Services', href: '/admin/services', icon: ShoppingBag, disabled: false },
  { name: 'Commands', href: '/admin/commands', icon: ClipboardList, disabled: false },
  { name: 'Utilisateurs', href: '/admin/users', icon: Users, disabled: false },
  { name: 'Cleaners', href: '/admin/cleaners', icon: UserCheck, disabled: false },
  { name: 'Compétences', href: '/admin/skills', icon: Sparkles, disabled: false },
  { name: 'Promo Codes', href: '/admin/promos', icon: Ticket, disabled: false },
  { name: 'Notifications', href: '/admin/notifications', icon: Bell, disabled: false },
  { name: 'Slides', href: '/admin/slides', icon: Sliders, disabled: false },
  { name: 'Pages Manager', href: '/admin/pages', icon: BookOpen, disabled: false },
  { name: 'Settings', href: '/admin/settings-mock', icon: Settings, disabled: true },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Authentication check
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('nadif_admin_logged_in');
    if (isLoggedIn === 'true') {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('nadif_admin_logged_in');
    setIsAuthenticated(false);
    router.push('/login');
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-gilmer">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold uppercase tracking-widest text-foreground-nadif/40 animate-pulse">
            Verifying Credentials...
          </p>
        </div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return null; // Will redirect shortly via useEffect
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-gilmer text-foreground-nadif flex">
      {/* 1. Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-100 p-6 h-screen sticky top-0 shrink-0 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {/* Brand Header */}
        <Link href="/" className="flex items-center gap-4 mb-12 group">
          <div className="bg-primary p-3 rounded-2xl group-hover:rotate-12 transition-transform shadow-lg shadow-primary/20">
            <Image src="/logo.png" alt="Nadif" width={28} height={28} className="brightness-0 invert" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tighter uppercase text-primary block leading-none">NADIF</span>
            <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-foreground-nadif/30">Admin Studio</span>
          </div>
        </Link>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 pl-4">Management</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            if (item.disabled) {
              return (
                <div
                  key={item.name}
                  className="flex items-center gap-4 px-4 py-4 rounded-2xl text-slate-300 cursor-not-allowed group"
                  title="Coming Soon"
                >
                  <Icon size={20} />
                  <span className="text-sm font-bold uppercase tracking-wider">{item.name}</span>
                  <span className="ml-auto text-[8px] font-black bg-slate-100 text-slate-400 px-2 py-1 rounded-md uppercase">
                    Soon
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 relative group overflow-hidden ${
                  isActive
                    ? 'bg-primary text-white shadow-xl shadow-primary/20'
                    : 'text-slate-500 hover:text-primary hover:bg-primary/5'
                }`}
              >
                <Icon size={20} className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary'}`} />
                <span className="text-sm font-bold uppercase tracking-wider">{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white rounded-l-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Admin Card */}
        <div className="pt-6 border-t border-slate-100 mt-auto space-y-4">
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
              <User size={18} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-tight">Super Admin</p>
              <p className="text-[10px] font-bold text-slate-400">admin@nadif.dz</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 py-4 bg-rose-50 text-rose-600 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-rose-100 active:scale-[0.98] transition-all"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-80 bg-white p-8 z-50 lg:hidden flex flex-col h-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-12">
                <Link href="/" className="flex items-center gap-3">
                  <div className="bg-primary p-2 rounded-xl">
                    <Image src="/logo.png" alt="Nadif" width={24} height={24} className="brightness-0 invert" />
                  </div>
                  <span className="text-lg font-black tracking-tighter uppercase text-primary">NADIF</span>
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-10 h-10 rounded-xl border border-slate-100 flex items-center justify-center hover:bg-slate-50"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Nav */}
              <nav className="flex-1 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  
                  if (item.disabled) {
                    return (
                      <div
                        key={item.name}
                        className="flex items-center gap-4 px-4 py-4 rounded-2xl text-slate-300 cursor-not-allowed"
                      >
                        <Icon size={20} />
                        <span className="text-sm font-bold uppercase tracking-wider">{item.name}</span>
                        <span className="ml-auto text-[8px] font-black bg-slate-100 text-slate-400 px-2 py-1 rounded-md">
                          Soon
                        </span>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 ${
                        isActive
                          ? 'bg-primary text-white shadow-xl shadow-primary/20'
                          : 'text-slate-500 hover:text-primary hover:bg-primary/5'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="text-sm font-bold uppercase tracking-wider">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Drawer Admin Info */}
              <div className="pt-6 border-t border-slate-100 mt-auto space-y-4">
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-tight">Super Admin</p>
                    <p className="text-[10px] font-bold text-slate-400">admin@nadif.dz</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-rose-50 text-rose-600 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-rose-100 transition-all"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 2. Main Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 lg:px-12 h-20 flex justify-between items-center">
          {/* Mobile menu trigger */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden w-12 h-12 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-100"
          >
            <Menu size={20} />
          </button>

          {/* Current Area Indicator */}
          <div className="hidden sm:flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Workspace</span>
            <span className="text-xs font-bold text-slate-300">/</span>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 border border-primary/10 rounded-lg text-primary text-[10px] font-black uppercase tracking-wider">
              <Sparkles size={10} className="fill-primary" />
              Nadif Admin v1.0
            </div>
          </div>

          {/* Action Items */}
          <div className="flex items-center gap-4">
            {/* Notification Mock Icon */}
            <button className="w-12 h-12 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-100 text-slate-500 relative transition-all active:scale-95">
              <Bell size={18} />
              <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
              <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full" />
            </button>

            {/* Quick Profile Widget */}
            <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-primary-400 text-white font-black uppercase flex items-center justify-center shadow-lg shadow-primary/20 text-xs">
                AD
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-black uppercase tracking-tight">Admin Nadif</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Online</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content View */}
        <main className="flex-1 p-6 lg:p-12 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
