'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  CalendarCheck,
  DollarSign,
  AlertCircle,
  Clock,
  ArrowRight,
  Sparkles,
  Plus,
  Percent,
  Bell,
  Zap,
  TrendingDown,
  Activity,
  ClipboardList
} from 'lucide-react';
import { dashboardApi, type ApiDashboardStats } from '../../lib/api';

export default function AdminDashboardPage() {
  const [data, setData] = useState<ApiDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await dashboardApi.getStats();
      setData(res);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to fetch dashboard metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Poll stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading && !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center font-gilmer gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold uppercase tracking-widest text-slate-400 animate-pulse">
          Assembling Live Analytics...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center p-8 bg-rose-50 border border-rose-100 rounded-3xl text-center max-w-xl mx-auto space-y-4">
        <AlertCircle className="text-rose-500" size={48} />
        <h3 className="text-lg font-black text-rose-800 uppercase tracking-tight">Failed to load Dashboard</h3>
        <p className="text-xs text-rose-600 font-medium font-inter">{error}</p>
        <button
          onClick={fetchStats}
          className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  const stats = data?.stats;
  const statusBreakdown = data?.orderStatusBreakdown || {};
  const totalOrders = Object.values(statusBreakdown).reduce((sum, count) => sum + count, 0);

  // Status mapping details
  const STATUS_CONFIGS: Record<string, { label: string; color: string; bg: string }> = {
    PENDING: { label: 'En attente', color: 'text-amber-600 border-amber-200', bg: 'bg-amber-500' },
    CALLED_NOT_PAID: { label: 'Appelé (Non payé)', color: 'text-orange-600 border-orange-200', bg: 'bg-orange-500' },
    CONFIRMED: { label: 'Confirmé', color: 'text-blue-600 border-blue-200', bg: 'bg-blue-500' },
    IN_PROGRESS: { label: 'En cours', color: 'text-indigo-600 border-indigo-200', bg: 'bg-indigo-500' },
    COMPLETED: { label: 'Complété', color: 'text-emerald-600 border-emerald-200', bg: 'bg-emerald-500' },
    CANCELLED: { label: 'Annulé', color: 'text-rose-600 border-rose-200', bg: 'bg-rose-500' },
  };

  return (
    <div className="space-y-10 font-gilmer max-w-7xl mx-auto animate-fadeIn pb-16">
      {/* 1. Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
            <Activity size={14} className="text-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Live Operations Control</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-800 uppercase italic">
            Nadif <span className="text-primary">Dashboard</span>
          </h1>
          <p className="text-sm text-slate-400 font-medium font-inter">
            Monitor revenues, track cleaner availability, audit order pipelines, and trigger quick management tasks.
          </p>
        </div>

        {/* Quick actions panel */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchStats}
            className="px-5 py-3 border border-slate-200 hover:border-slate-300 text-slate-600 bg-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer"
          >
            Refresh Data
          </button>
          <Link
            href="/admin/commands"
            className="px-5 py-3 bg-primary hover:bg-primary/95 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-primary/15 active:scale-[0.98] flex items-center gap-2"
          >
            <Plus size={14} />
            Manage Commands
          </Link>
        </div>
      </div>

      {/* 2. Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm flex items-center justify-between group transition-all"
        >
          <div className="space-y-2.5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Total Revenue</span>
            <div className="space-y-0.5">
              <span className="text-2xl font-black text-slate-800 tracking-tight block">
                {stats?.totalRevenue.toLocaleString() || '0'} <span className="text-xs font-bold text-slate-400">DZD</span>
              </span>
              <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 font-inter">
                <TrendingUp size={12} />
                +14.8% this month
              </span>
            </div>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 transition-colors group-hover:bg-emerald-500 group-hover:text-white">
            <DollarSign size={20} />
          </div>
        </motion.div>

        {/* Pending Orders */}
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm flex items-center justify-between group transition-all"
        >
          <div className="space-y-2.5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Pending Orders</span>
            <div className="space-y-0.5">
              <span className="text-2xl font-black text-slate-800 tracking-tight block">
                {stats?.pendingOrders || '0'} <span className="text-xs font-bold text-slate-400">Orders</span>
              </span>
              <span className="text-[10px] text-amber-500 font-bold flex items-center gap-1 font-inter">
                {stats && stats.pendingOrders > 0 ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    Awaiting dispatch
                  </>
                ) : (
                  'All caught up!'
                )}
              </span>
            </div>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${stats && stats.pendingOrders > 0 ? 'bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white' : 'bg-slate-50 text-slate-400'}`}>
            <Clock size={20} />
          </div>
        </motion.div>

        {/* Active Cleaners */}
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm flex items-center justify-between group transition-all"
        >
          <div className="space-y-2.5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Active Partners</span>
            <div className="space-y-0.5">
              <span className="text-2xl font-black text-slate-800 tracking-tight block">
                {stats?.activeCleaners || '0'} <span className="text-xs font-bold text-slate-400">Cleaners</span>
              </span>
              <span className="text-[10px] text-blue-500 font-bold flex items-center gap-1 font-inter">
                <Sparkles size={12} className="fill-blue-50" />
                Active on platform
              </span>
            </div>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 transition-colors group-hover:bg-blue-500 group-hover:text-white">
            <Users size={20} />
          </div>
        </motion.div>

        {/* Active Subscriptions */}
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm flex items-center justify-between group transition-all"
        >
          <div className="space-y-2.5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Abonnements Actifs</span>
            <div className="space-y-0.5">
              <span className="text-2xl font-black text-slate-800 tracking-tight block">
                {stats?.activeSubscriptions || '0'} <span className="text-xs font-bold text-slate-400">Packs</span>
              </span>
              <span className="text-[10px] text-purple-500 font-bold flex items-center gap-1 font-inter">
                <CalendarCheck size={12} />
                Recurring revenue items
              </span>
            </div>
          </div>
          <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 transition-colors group-hover:bg-purple-500 group-hover:text-white">
            <CalendarCheck size={20} />
          </div>
        </motion.div>
      </div>

      {/* 3. Status Pipeline & Quick Tools Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Status Pipeline Breakdown (7 columns) */}
        <div className="lg:col-span-7 bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm flex flex-col justify-between">
          <div className="space-y-1 mb-6">
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-800">
              Orders Status Pipeline
            </h2>
            <p className="text-xs text-slate-400 font-bold font-inter">
              Volume split across status types. Total orders logged: {totalOrders}
            </p>
          </div>

          <div className="space-y-5 flex-1 flex flex-col justify-center">
            {Object.keys(STATUS_CONFIGS).map((statusKey) => {
              const config = STATUS_CONFIGS[statusKey];
              const count = statusBreakdown[statusKey] || 0;
              const percent = totalOrders > 0 ? (count / totalOrders) * 100 : 0;

              return (
                <div key={statusKey} className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-600 uppercase tracking-wider text-[10px]">{config.label}</span>
                    <span className="text-slate-800 font-mono">
                      {count} <span className="text-[10px] text-slate-400 font-bold">({percent.toFixed(1)}%)</span>
                    </span>
                  </div>
                  {/* Progress bar wrapper */}
                  <div className="w-full h-3 bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full ${config.bg} rounded-full`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Operations (5 columns) */}
        <div className="lg:col-span-5 bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-800">
              Operations Toolbox
            </h2>
            <p className="text-xs text-slate-400 font-bold font-inter">
              Shortcut actions for immediate operations tasks.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 flex-1 justify-center">
            <Link
              href="/admin/commands?action=create"
              className="group border border-slate-100 bg-slate-50/50 hover:bg-primary/5 hover:border-primary/20 p-4 rounded-2xl flex items-center gap-4 transition-all"
            >
              <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                <ClipboardList size={18} />
              </div>
              <div className="text-left">
                <span className="text-xs font-black text-slate-800 uppercase tracking-tight block">Register Command</span>
                <span className="text-[10px] text-slate-400 font-bold block font-inter">Manually log client booking</span>
              </div>
              <ArrowRight size={14} className="ml-auto text-slate-300 group-hover:text-primary transition-colors group-hover:translate-x-1" />
            </Link>

            <Link
              href="/admin/cleaners"
              className="group border border-slate-100 bg-slate-50/50 hover:bg-primary/5 hover:border-primary/20 p-4 rounded-2xl flex items-center gap-4 transition-all"
            >
              <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                <Users size={18} />
              </div>
              <div className="text-left">
                <span className="text-xs font-black text-slate-800 uppercase tracking-tight block">Manage Cleaners</span>
                <span className="text-[10px] text-slate-400 font-bold block font-inter">Audit personnel records</span>
              </div>
              <ArrowRight size={14} className="ml-auto text-slate-300 group-hover:text-primary transition-colors group-hover:translate-x-1" />
            </Link>

            <Link
              href="/admin/promos"
              className="group border border-slate-100 bg-slate-50/50 hover:bg-primary/5 hover:border-primary/20 p-4 rounded-2xl flex items-center gap-4 transition-all"
            >
              <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                <Percent size={18} />
              </div>
              <div className="text-left">
                <span className="text-xs font-black text-slate-800 uppercase tracking-tight block">Promo Vouchers</span>
                <span className="text-[10px] text-slate-400 font-bold block font-inter">Deploy discount campaigns</span>
              </div>
              <ArrowRight size={14} className="ml-auto text-slate-300 group-hover:text-primary transition-colors group-hover:translate-x-1" />
            </Link>

            <Link
              href="/admin/notifications"
              className="group border border-slate-100 bg-slate-50/50 hover:bg-primary/5 hover:border-primary/20 p-4 rounded-2xl flex items-center gap-4 transition-all"
            >
              <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                <Bell size={18} />
              </div>
              <div className="text-left">
                <span className="text-xs font-black text-slate-800 uppercase tracking-tight block">FCM Push Center</span>
                <span className="text-[10px] text-slate-400 font-bold block font-inter">Draft and send push messages</span>
              </div>
              <ArrowRight size={14} className="ml-auto text-slate-300 group-hover:text-primary transition-colors group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Recent Actions List Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders List */}
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-primary animate-pulse" />
              <h2 className="text-lg font-black uppercase tracking-tight text-slate-800">
                Recent Orders
              </h2>
            </div>
            <Link
              href="/admin/commands"
              className="text-[10px] font-black text-primary uppercase tracking-wider hover:underline"
            >
              All Orders
            </Link>
          </div>

          <div className="divide-y divide-slate-50 text-slate-700">
            {!data?.recentOrders || data.recentOrders.length === 0 ? (
              <p className="text-center py-8 text-slate-400 text-xs font-bold uppercase tracking-wider font-inter">
                No orders logged yet.
              </p>
            ) : (
              data.recentOrders.map((order) => {
                const config = STATUS_CONFIGS[order.status] || { label: order.status, bg: 'bg-slate-400' };
                const dateStr = new Date(order.scheduledDate).toLocaleDateString('fr-FR', {
                  month: 'short',
                  day: 'numeric',
                });
                return (
                  <div key={order.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4 font-semibold text-xs">
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-slate-800 font-black truncate max-w-[200px]">
                        {order.user?.fullName || 'Guest Client'}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold font-inter truncate max-w-[180px]">
                        {order.service?.name || order.category?.name || 'Cleaning Job'}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-right shrink-0">
                      <div className="space-y-0.5">
                        <span className="font-mono text-slate-800 font-black block">{order.totalPrice} DZD</span>
                        <span className="text-[9px] text-slate-400 font-bold font-inter block">{dateStr}</span>
                      </div>
                      <span className={`w-2.5 h-2.5 rounded-full ${config.bg}`} title={config.label} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Subscriptions List */}
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <CalendarCheck size={16} className="text-primary" />
              <h2 className="text-lg font-black uppercase tracking-tight text-slate-800">
                Recent Subscriptions
              </h2>
            </div>
            <Link
              href="/admin/subscriptions"
              className="text-[10px] font-black text-primary uppercase tracking-wider hover:underline"
            >
              All Packs
            </Link>
          </div>

          <div className="divide-y divide-slate-50 text-slate-700">
            {!data?.recentSubscriptions || data.recentSubscriptions.length === 0 ? (
              <p className="text-center py-8 text-slate-400 text-xs font-bold uppercase tracking-wider font-inter">
                No subscription packs requested.
              </p>
            ) : (
              data.recentSubscriptions.map((sub) => {
                const dateStr = new Date(sub.createdAt).toLocaleDateString('fr-FR', {
                  month: 'short',
                  day: 'numeric',
                });
                return (
                  <div key={sub.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4 font-semibold text-xs">
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-slate-800 font-black truncate max-w-[200px]">{sub.fullName}</p>
                      <p className="text-[10px] text-slate-400 font-bold font-inter truncate max-w-[180px]">
                        {sub.serviceTier?.name || 'Grand tier'} • {sub.surfaceM2}m²
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono text-slate-800 font-black block">
                        {sub.monthlyPrice ? `${sub.monthlyPrice} DZD` : 'Awaiting Quote'}
                      </span>
                      <span className="text-[9px] text-slate-400 font-bold font-inter block">{dateStr}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
