'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  MapPin,
  Phone,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Play,
  Check,
  Info,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  DollarSign,
  Activity,
  Sparkles,
  ArrowRight,
  Package,
  Wrench,
  Search,
  CheckSquare,
  X,
  Lock,
  Unlock
} from 'lucide-react';
import Link from 'next/link';
import { ordersApi, cleanersApi, lockedDaysApi, type ApiOrder, type ApiCleaner } from '../../lib/api';

// Status styling configuration
const STATUS_STYLES: Record<ApiOrder['status'], { label: string; bg: string; text: string; border: string; dot: string }> = {
  PENDING: {
    label: 'En Attente',
    bg: 'bg-amber-50/80 backdrop-blur-md',
    text: 'text-amber-600',
    border: 'border-amber-100',
    dot: 'bg-amber-500 animate-pulse',
  },
  CALLED_NOT_PAID: {
    label: 'Appelé · Non Payé',
    bg: 'bg-orange-50/80 backdrop-blur-md',
    text: 'text-orange-600',
    border: 'border-orange-100',
    dot: 'bg-orange-500 animate-pulse',
  },
  CONFIRMED: {
    label: 'Confirmé',
    bg: 'bg-blue-50/80 backdrop-blur-md',
    text: 'text-blue-600',
    border: 'border-blue-100',
    dot: 'bg-blue-500',
  },
  IN_PROGRESS: {
    label: 'En Cours',
    bg: 'bg-violet-50/80 backdrop-blur-md',
    text: 'text-violet-600',
    border: 'border-violet-100',
    dot: 'bg-violet-500 animate-pulse',
  },
  COMPLETED: {
    label: 'Terminé',
    bg: 'bg-emerald-50/80 backdrop-blur-md',
    text: 'text-emerald-600',
    border: 'border-emerald-100',
    dot: 'bg-emerald-500',
  },
  CANCELLED: {
    label: 'Annulé',
    bg: 'bg-rose-50/80 backdrop-blur-md',
    text: 'text-rose-600',
    border: 'border-rose-100',
    dot: 'bg-rose-500',
  },
};

export default function CalendarPage() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [cleaners, setCleaners] = useState<ApiCleaner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());
  const [lockedDays, setLockedDays] = useState<string[]>([]);

  // Assign Cleaner Modal States
  const [orderToConfirm, setOrderToConfirm] = useState<ApiOrder | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedCleanerIds, setSelectedCleanerIds] = useState<string[]>([]);

  // Date and filter selections
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusTab, setStatusTab] = useState<'ACTIVE' | 'ALL'>('ACTIVE'); // ACTIVE = CONFIRMED & IN_PROGRESS

  // Fetch orders and locked days
  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const [ordersData, cleanersData, lockedDaysData] = await Promise.all([
        ordersApi.getAll(),
        cleanersApi.getAll().catch(() => [] as ApiCleaner[]),
        lockedDaysApi.getAll().catch(() => [] as string[])
      ]);
      // Sort orders by scheduledDate ascending
      const sorted = [...ordersData].sort((a, b) => 
        new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
      );
      setOrders(sorted);
      setCleaners(cleanersData);
      setLockedDays(lockedDaysData);
      setError(null);
    } catch (err: any) {
      console.error('Error loading calendar orders:', err);
      setError(err.message || 'Impossible de charger les commandes.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleToggleLockDay = async (day: Date) => {
    const offset = day.getTimezoneOffset();
    const localDate = new Date(day.getTime() - offset * 60 * 1000);
    const dateStr = localDate.toISOString().slice(0, 10);

    const isLocked = lockedDays.includes(dateStr);
    let updatedLockedDays: string[];
    if (isLocked) {
      updatedLockedDays = lockedDays.filter(d => d !== dateStr);
    } else {
      updatedLockedDays = [...lockedDays, dateStr];
    }

    try {
      setLockedDays(updatedLockedDays); // Optimistic UI update
      await lockedDaysApi.update(updatedLockedDays);
    } catch (err: any) {
      alert(`Erreur lors de la modification du verrouillage de la date: ${err.message || 'Inconnue'}`);
      setLockedDays(lockedDays);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Live timer tick
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update order status action
  const handleUpdateStatus = async (orderId: string, newStatus: ApiOrder['status']) => {
    try {
      await ordersApi.updateStatus(orderId, newStatus);
      // Update local state without complete re-fetch
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err: any) {
      alert(`Erreur lors de la mise à jour du statut: ${err.message || 'Inconnue'}`);
    }
  };

  // ─── Cleaner Availability Calculation ──────────────────────────────────────
  const getRequiredCleanersCount = (order: ApiOrder | null) => {
    if (!order) return 0;
    if (order.serviceId) {
      return (order.houseConfig?.workers || 1) + (order.extraWorkers || 0);
    } else {
      return order.categoryService?.workers || 1;
    }
  };

  const isDateLocked = (dateVal: string) => {
    if (!dateVal) return false;
    try {
      const scheduled = new Date(dateVal);
      const offset = scheduled.getTimezoneOffset();
      const localDate = new Date(scheduled.getTime() - offset * 60 * 1000);
      const dateString = localDate.toISOString().slice(0, 10);
      return lockedDays.includes(dateString);
    } catch {
      return false;
    }
  };

  const getCleanerNames = (cleanerIdStr?: string | null) => {
    if (!cleanerIdStr) return 'Aucun';
    return cleanerIdStr.split(',')
      .map(id => cleaners.find(c => c.id === id.trim())?.fullName || 'Inconnu')
      .join(', ');
  };

  const getAvailableCleaners = (order: ApiOrder | null) => {
    if (!order || !order.scheduledDate) return [];

    const start1 = new Date(order.scheduledDate).getTime();
    const durationHours1 = order.houseConfig?.durationHours ?? order.categoryService?.durationHours ?? order.service?.durationHours ?? 3;
    const end1 = start1 + durationHours1 * 60 * 60 * 1000;

    const activeCleaners = cleaners.filter(c => c.isActive);
    const busyCleanerIds = new Set<string>();

    orders.forEach(other => {
      if (other.id === order.id || !other.cleanerId || other.status === 'CANCELLED') return;
      const start2 = new Date(other.scheduledDate).getTime();
      const durationHours2 = other.houseConfig?.durationHours ?? other.categoryService?.durationHours ?? other.service?.durationHours ?? 3;
      const end2 = start2 + durationHours2 * 60 * 60 * 1000;

      if (start1 < end2 && start2 < end1) {
        other.cleanerId.split(',').forEach(cid => busyCleanerIds.add(cid));
      }
    });

    const available = activeCleaners.filter(c => !busyCleanerIds.has(c.id));
    const serviceName = order.service?.name || order.category?.name || '';

    return [...available].sort((a, b) => {
      const hasA = a.skills.some(s => s.toLowerCase() === serviceName.toLowerCase());
      const hasB = b.skills.some(s => s.toLowerCase() === serviceName.toLowerCase());
      if (hasA && !hasB) return -1;
      if (!hasA && hasB) return 1;
      return 0;
    });
  };

  const getAvailableSlots = (order: ApiOrder | null, requiredCount: number) => {
    if (!order || !order.scheduledDate) return [];

    const date = new Date(order.scheduledDate);
    const slots = [
      "08:00", "09:00", "10:00", "11:00", "12:00", 
      "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
    ];

    const freeSlots: string[] = [];

    slots.forEach(timeStr => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const testDate = new Date(date);
      testDate.setHours(hours, minutes, 0, 0);
      const testTime = testDate.getTime();

      const durationHours = order.houseConfig?.durationHours ?? order.categoryService?.durationHours ?? order.service?.durationHours ?? 3;
      const end1 = testTime + durationHours * 60 * 60 * 1000;

      const busyCleanerIds = new Set<string>();
      orders.forEach(other => {
        if (other.id === order.id || !other.cleanerId || other.status === 'CANCELLED') return;
        const start2 = new Date(other.scheduledDate).getTime();
        const durationHours2 = other.houseConfig?.durationHours ?? other.categoryService?.durationHours ?? other.service?.durationHours ?? 3;
        const end2 = start2 + durationHours2 * 60 * 60 * 1000;

        if (testTime < end2 && start2 < end1) {
          other.cleanerId.split(',').forEach(cid => busyCleanerIds.add(cid));
        }
      });

      const activeCount = cleaners.filter(c => c.isActive).length;
      const availableCount = activeCount - busyCleanerIds.size;

      if (availableCount >= requiredCount) {
        freeSlots.push(timeStr);
      }
    });

    return freeSlots;
  };

  const handleSelectSlot = async (order: ApiOrder, timeStr: string) => {
    try {
      const scheduled = new Date(order.scheduledDate);
      const [hours, minutes] = timeStr.split(':').map(Number);
      scheduled.setHours(hours, minutes, 0, 0);

      await ordersApi.update(order.id, { scheduledDate: scheduled.toISOString() });
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, scheduledDate: scheduled.toISOString() } : o));
      setOrderToConfirm(prev => prev ? { ...prev, scheduledDate: scheduled.toISOString() } : null);
      setSelectedCleanerIds([]);
      alert(`La commande a été déplacée à ${timeStr} avec succès!`);
    } catch (err: any) {
      alert(`Erreur lors du déplacement de la commande: ${err.message || 'Inconnue'}`);
    }
  };

  const handleConfirmAndAssign = async () => {
    if (!orderToConfirm) return;
    const reqCount = getRequiredCleanersCount(orderToConfirm);
    if (selectedCleanerIds.length !== reqCount) {
      alert(`Veuillez sélectionner exactement ${reqCount} cleaner(s).`);
      return;
    }
    setIsLoading(true);
    try {
      const updated = await ordersApi.update(orderToConfirm.id, {
        status: 'CONFIRMED',
        cleanerId: selectedCleanerIds.join(',')
      });
      setOrders(prev => prev.map(o => o.id === orderToConfirm.id ? { ...o, ...updated } : o));
      setIsAssignModalOpen(false);
      setOrderToConfirm(null);
      setSelectedCleanerIds([]);
    } catch (err: any) {
      alert(`Assign update failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Month navigation helpers
  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Calendar grid construction logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Offset adjustment to align Monday as the first day of the week
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0: Sunday, 1: Monday, etc.
  const mondayOffset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const gridStartDate = new Date(firstDayOfMonth);
  gridStartDate.setDate(firstDayOfMonth.getDate() - mondayOffset);

  // Generate 42 days (6 full weeks grid)
  const calendarDays: Date[] = [];
  const tempDate = new Date(gridStartDate);
  for (let i = 0; i < 42; i++) {
    calendarDays.push(new Date(tempDate));
    tempDate.setDate(tempDate.getDate() + 1);
  }

  // Filter orders for a specific date
  const getOrdersForDate = (date: Date) => {
    return orders.filter(order => {
      const orderDate = new Date(order.scheduledDate);
      return (
        orderDate.getFullYear() === date.getFullYear() &&
        orderDate.getMonth() === date.getMonth() &&
        orderDate.getDate() === date.getDate()
      );
    });
  };

  // Helper to determine if a day has work scheduled (CONFIRMED or IN_PROGRESS)
  const dayHasWork = (date: Date) => {
    return orders.some(order => {
      const orderDate = new Date(order.scheduledDate);
      const matchesDay = (
        orderDate.getFullYear() === date.getFullYear() &&
        orderDate.getMonth() === date.getMonth() &&
        orderDate.getDate() === date.getDate()
      );
      return matchesDay && (order.status === 'CONFIRMED' || order.status === 'IN_PROGRESS');
    });
  };

  // Selected date statistics & orders list
  const selectedDayOrders = getOrdersForDate(selectedDate);

  // Filter selected day's orders based on active tab and search query
  const filteredOrders = selectedDayOrders.filter(order => {
    // 1. Status Filter Tab
    if (statusTab === 'ACTIVE') {
      if (order.status !== 'CONFIRMED' && order.status !== 'IN_PROGRESS') {
        return false;
      }
    }

    // 2. Search query filter (matches customer name, phone, address, service/category name)
    if (searchQuery.trim() === '') return true;

    const query = searchQuery.toLowerCase();
    const matchesUser = order.user?.fullName?.toLowerCase().includes(query) ||
                        order.user?.phone?.includes(query);
    const matchesAddress = order.address.toLowerCase().includes(query);
    const matchesService = order.service?.name?.toLowerCase().includes(query) ||
                           order.category?.name?.toLowerCase().includes(query);

    return matchesUser || matchesAddress || matchesService;
  });

  // Calculate stats for the current month view (all orders in this month)
  const currentMonthOrders = orders.filter(order => {
    const d = new Date(order.scheduledDate);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const monthWorkDaysCount = new Set(
    currentMonthOrders
      .filter(o => o.status === 'CONFIRMED' || o.status === 'IN_PROGRESS')
      .map(o => new Date(o.scheduledDate).getDate())
  ).size;

  const monthConfirmedCount = currentMonthOrders.filter(o => o.status === 'CONFIRMED').length;
  const monthInProgressCount = currentMonthOrders.filter(o => o.status === 'IN_PROGRESS').length;
  const monthCompletedCount = currentMonthOrders.filter(o => o.status === 'COMPLETED').length;
  const monthTotalRevenue = currentMonthOrders
    .filter(o => o.status === 'COMPLETED' || o.status === 'CONFIRMED' || o.status === 'IN_PROGRESS')
    .reduce((sum, o) => sum + o.totalPrice, 0);

  // Timer rendering calculation helper
  const renderTimer = (order: ApiOrder) => {
    const scheduled = new Date(order.scheduledDate);
    const durationHours = order.houseConfig?.durationHours ?? order.categoryService?.durationHours ?? order.service?.durationHours ?? 3;
    const end = new Date(scheduled.getTime() + durationHours * 60 * 60 * 1000);

    if (order.status === 'CONFIRMED') {
      const diffMs = scheduled.getTime() - now.getTime();
      if (diffMs > 0) {
        const h = Math.floor(diffMs / (3600 * 1000));
        const m = Math.floor((diffMs % (3600 * 1000)) / (60 * 1000));
        const s = Math.floor((diffMs % (60 * 1000)) / 1000);
        return (
          <div className="flex items-center gap-1 text-[11px] font-black uppercase text-blue-600 bg-blue-50/50 border border-blue-100/50 px-2 py-1 rounded-lg">
            <Clock size={12} className="animate-spin" style={{ animationDuration: '6s' }} />
            <span>Commence dans {h}h {m}m {s}s</span>
          </div>
        );
      } else {
        const overdueMs = now.getTime() - scheduled.getTime();
        const h = Math.floor(overdueMs / (3600 * 1000));
        const m = Math.floor((overdueMs % (3600 * 1000)) / (60 * 1000));
        return (
          <div className="flex items-center gap-1 text-[11px] font-black uppercase text-rose-600 bg-rose-50/50 border border-rose-100/50 px-2 py-1 rounded-lg">
            <AlertCircle size={12} className="animate-bounce" />
            <span>En retard de {h}h {m}m</span>
          </div>
        );
      }
    }

    if (order.status === 'IN_PROGRESS') {
      const diffMs = end.getTime() - now.getTime();
      const totalDurationMs = durationHours * 60 * 60 * 1000;
      const elapsedMs = now.getTime() - scheduled.getTime();
      const progressPercent = Math.min(100, Math.max(0, (elapsedMs / totalDurationMs) * 100));

      if (diffMs > 0) {
        const h = Math.floor(diffMs / (3600 * 1000));
        const m = Math.floor((diffMs % (3600 * 1000)) / (60 * 1000));
        const s = Math.floor((diffMs % (60 * 1000)) / 1000);
        return (
          <div className="w-full space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-[11px] font-black uppercase text-violet-600 bg-violet-50/50 border border-violet-100/50 px-2 py-1 rounded-lg">
                <Activity size={12} className="animate-pulse" />
                <span>Reste {h}h {m}m {s}s</span>
              </div>
              <span className="text-[10px] font-black text-violet-500 uppercase tracking-wider">{Math.round(progressPercent)}% Effectué</span>
            </div>
            {/* Progress Bar Container */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
              <motion.div
                className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
                layout
              />
            </div>
          </div>
        );
      } else {
        const exceededMs = now.getTime() - end.getTime();
        const h = Math.floor(exceededMs / (3600 * 1000));
        const m = Math.floor((exceededMs % (3600 * 1000)) / (60 * 1000));
        return (
          <div className="w-full space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-[11px] font-black uppercase text-rose-600 bg-rose-50/50 border border-rose-100/50 px-2 py-1 rounded-lg">
                <AlertCircle size={12} className="animate-pulse" />
                <span>Dépassement de {h}h {m}m</span>
              </div>
              <span className="text-[10px] font-black text-rose-500 uppercase">100% Temps Écoulé</span>
            </div>
            <div className="w-full h-2 bg-rose-100 rounded-full overflow-hidden border border-rose-200">
              <div className="h-full bg-rose-500 w-full rounded-full" />
            </div>
          </div>
        );
      }
    }

    return null;
  };

  return (
    <div className="space-y-8 font-gilmer max-w-[1600px] mx-auto pb-12">
      {/* ─── Header Section ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 backdrop-blur-xl border border-slate-100 p-8 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest mb-1.5">
            <Sparkles size={12} className="fill-primary animate-pulse" />
            <span>Calendrier de Travail</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Planning & Suivi</h1>
          <p className="text-xs font-bold text-slate-400 mt-1">
            Gérez les interventions journalières, suivez la progression en temps réel et validez les étapes de travail.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchOrders}
            disabled={isLoading}
            className="w-11 h-11 bg-slate-50 border border-slate-100 hover:bg-slate-100 active:scale-95 transition-all text-slate-500 flex items-center justify-center rounded-xl cursor-pointer"
            title="Rafraîchir"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin text-primary' : ''} />
          </button>
          <button
            onClick={handleToday}
            className="px-5 h-11 bg-primary/10 border border-primary/20 text-primary font-black uppercase tracking-wider text-[11px] rounded-xl hover:bg-primary hover:text-white transition-all duration-300 active:scale-95 cursor-pointer flex items-center justify-center"
          >
            Aujourd'hui
          </button>
        </div>
      </div>

      {/* ─── Quick Summary Stats ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Month Stats Card 1 */}
        <div className="bg-white/70 backdrop-blur-xl border border-slate-100/80 p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
            <CalendarIcon size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Jours de Travail</p>
            <h3 className="text-xl font-black text-slate-800">{monthWorkDaysCount}</h3>
            <p className="text-[9px] font-bold text-slate-400 mt-0.5">Ce mois-ci</p>
          </div>
        </div>

        {/* Month Stats Card 2 */}
        <div className="bg-white/70 backdrop-blur-xl border border-slate-100/80 p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-500 flex items-center justify-center">
            <Activity size={22} className="animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">En Cours / Confirmés</p>
            <h3 className="text-xl font-black text-slate-800">{monthInProgressCount} / {monthConfirmedCount}</h3>
            <p className="text-[9px] font-bold text-slate-400 mt-0.5">Statuts actifs</p>
          </div>
        </div>

        {/* Month Stats Card 3 */}
        <div className="bg-white/70 backdrop-blur-xl border border-slate-100/80 p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Missions Terminées</p>
            <h3 className="text-xl font-black text-slate-800">{monthCompletedCount}</h3>
            <p className="text-[9px] font-bold text-slate-400 mt-0.5">Sur ce mois-ci</p>
          </div>
        </div>

        {/* Month Stats Card 4 */}
        <div className="bg-white/70 backdrop-blur-xl border border-slate-100/80 p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <DollarSign size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Revenu Estimé</p>
            <h3 className="text-xl font-black text-slate-800">{monthTotalRevenue.toLocaleString('fr-DZ')} DA</h3>
            <p className="text-[9px] font-bold text-slate-400 mt-0.5">Mois en cours</p>
          </div>
        </div>
      </div>

      {/* ─── Main Content Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Calendar & Month Filter (Span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white/70 backdrop-blur-xl border border-slate-100 p-6 rounded-3xl shadow-sm">
            {/* Calendar Month Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 w-9 h-9 rounded-xl flex items-center justify-center text-primary">
                  <CalendarIcon size={18} />
                </div>
                <h2 className="text-base font-black text-slate-800 uppercase tracking-wider">
                  {currentDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}
                </h2>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrevMonth}
                  className="w-10 h-10 border border-slate-100 hover:bg-slate-50 active:scale-95 transition-all text-slate-500 flex items-center justify-center rounded-xl cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="w-10 h-10 border border-slate-100 hover:bg-slate-50 active:scale-95 transition-all text-slate-500 flex items-center justify-center rounded-xl cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Grid Header: Weekdays */}
            <div className="grid grid-cols-7 gap-1 text-center mb-3">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d, index) => (
                <div key={index} className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-2">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {calendarDays.map((day, idx) => {
                const isSelected = selectedDate.getDate() === day.getDate() &&
                                  selectedDate.getMonth() === day.getMonth() &&
                                  selectedDate.getFullYear() === day.getFullYear();

                const isCurrentMonth = day.getMonth() === month;
                const isToday = new Date().getDate() === day.getDate() &&
                                new Date().getMonth() === day.getMonth() &&
                                new Date().getFullYear() === day.getFullYear();

                const hasWorkScheduled = dayHasWork(day);
                const dayOrders = getOrdersForDate(day);
                const activeOrdersCount = dayOrders.filter(o => o.status === 'CONFIRMED' || o.status === 'IN_PROGRESS').length;

                const offset = day.getTimezoneOffset();
                const localDate = new Date(day.getTime() - offset * 60 * 1000);
                const dateStr = localDate.toISOString().slice(0, 10);
                const isLocked = lockedDays.includes(dateStr);

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedDate(day)}
                    className={`min-h-[75px] md:min-h-[85px] p-2 flex flex-col justify-between items-start border rounded-2xl relative transition-all duration-300 active:scale-95 group text-left cursor-pointer ${
                      isSelected
                        ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20'
                        : isLocked
                        ? 'bg-slate-100/80 border-slate-200 text-slate-400 opacity-60'
                        : isToday
                        ? 'bg-primary/5 border-primary/20 hover:bg-primary/10 text-slate-800'
                        : isCurrentMonth
                        ? 'bg-slate-50/50 border-slate-100 hover:border-slate-300 hover:bg-white text-slate-800'
                        : 'bg-white/20 border-slate-100/50 text-slate-300 hover:bg-slate-50/10 hover:border-slate-200'
                    }`}
                  >
                    {/* Day number & Lock controls */}
                    <div className="w-full flex justify-between items-start">
                      <span className={`text-xs font-black ${isSelected ? 'text-white' : isLocked ? 'text-slate-400 line-through' : isCurrentMonth ? 'text-slate-700' : 'text-slate-400'}`}>
                        {day.getDate()}
                      </span>
                      {isCurrentMonth && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleLockDay(day);
                          }}
                          className={`absolute top-2 right-2 p-1 rounded-lg transition-all active:scale-90 cursor-pointer shadow-sm border ${
                            isLocked
                              ? 'text-rose-600 bg-rose-50 border-rose-200'
                              : isSelected
                              ? 'text-white/80 hover:text-white bg-white/20 border-white/20'
                              : 'text-slate-400 hover:text-slate-700 bg-white border-slate-200'
                          }`}
                          title={isLocked ? "Déverrouiller ce jour" : "Verrouiller ce jour"}
                        >
                          {isLocked ? <Lock size={11} /> : <Unlock size={11} />}
                        </button>
                      )}
                    </div>

                    {/* Status badges inside cell */}
                    {isCurrentMonth && hasWorkScheduled && (
                      <div className="w-full flex items-center justify-between gap-1 mt-1">
                        {/* Dot indicator */}
                        <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-primary shadow-sm shadow-primary/40'} relative`}>
                          <span className={`absolute inset-0 w-2 h-2 rounded-full ${isSelected ? 'bg-white/40' : 'bg-primary/40'} animate-ping`} />
                        </div>

                        {/* Count text */}
                        {activeOrdersCount > 0 && (
                          <span className={`text-[8px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded-md ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                          }`}>
                            {activeOrdersCount} Cmd
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Selected Day commands list (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white/70 backdrop-blur-xl border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col min-h-[500px]">
            {/* Header info */}
            <div className="border-b border-slate-100 pb-4 mb-6">
              <p className="text-[10px] font-black text-primary uppercase tracking-widest">
                Détails du Jour
              </p>
              <h2 className="text-base font-black text-slate-800 uppercase tracking-tight mt-0.5">
                {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </h2>
              
              {/* Tabs selector */}
              <div className="flex items-center gap-1 bg-slate-100/80 border border-slate-200/30 p-1 rounded-xl mt-4">
                <button
                  onClick={() => setStatusTab('ACTIVE')}
                  className={`flex-1 py-2 rounded-lg font-black uppercase text-[10px] tracking-wider transition-all cursor-pointer ${
                    statusTab === 'ACTIVE'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Confirmés / En Cours ({selectedDayOrders.filter(o => o.status === 'CONFIRMED' || o.status === 'IN_PROGRESS').length})
                </button>
                <button
                  onClick={() => setStatusTab('ALL')}
                  className={`flex-1 py-2 rounded-lg font-black uppercase text-[10px] tracking-wider transition-all cursor-pointer ${
                    statusTab === 'ALL'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Toutes les commandes ({selectedDayOrders.length})
                </button>
              </div>

              {/* Day Search input */}
              <div className="relative mt-4">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher par client, adresse, service..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50/50 text-xs font-bold placeholder-slate-400 outline-none focus:border-primary focus:bg-white transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    Effacer
                  </button>
                )}
              </div>
            </div>

            {/* Commands List Container */}
            <div className="flex-1 space-y-4 overflow-y-auto [scrollbar-width:thin] max-h-[500px] pr-1">
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
                    <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-wider animate-pulse">Chargement des données...</span>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center text-center py-8 px-4 border border-rose-100 bg-rose-50/40 rounded-2xl gap-2 text-rose-500">
                    <AlertCircle size={20} />
                    <span className="text-[10px] font-black uppercase tracking-wider">Erreur : {error}</span>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-16 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl p-6"
                  >
                    <CalendarIcon size={32} className="text-slate-300 mb-3" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-400">Aucune commande</span>
                    <p className="text-[10px] font-bold text-slate-400/80 mt-1 max-w-[240px]">
                      {statusTab === 'ACTIVE'
                        ? 'Aucune intervention active (Confirmée / En Cours) prévue pour cette journée.'
                        : 'Aucune commande planifiée pour cette journée.'}
                    </p>
                  </motion.div>
                ) : (
                  filteredOrders.map(order => {
                    const statusConfig = STATUS_STYLES[order.status] || STATUS_STYLES.PENDING;
                    const orderTime = new Date(order.scheduledDate).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    // Determine service/category name
                    const typeLabel = order.serviceId ? 'Service Clé' : 'Catégorie';
                    const titleText = order.service?.name || order.category?.name || 'Prestation Nadif';
                    const configText = order.serviceId
                      ? order.houseConfig?.type
                      : order.categoryService?.name;

                    return (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        layout
                        className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                      >
                        {/* Side Status Border */}
                        <div className={`absolute top-0 bottom-0 left-0 w-1 ${statusConfig.dot.split(' ')[0]}`} />

                        {/* Order Main Header */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                              {typeLabel} • Code #{order.id.slice(0, 8).toUpperCase()}
                            </span>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight mt-0.5">
                              {titleText}
                            </h3>
                            {configText && (
                              <p className="text-[10px] font-bold text-slate-500 uppercase">
                                Format: {configText}
                              </p>
                            )}
                          </div>
                          
                          {/* Time tag */}
                          <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-2.5 py-1.5 rounded-lg text-slate-700">
                            <Clock size={12} className="text-slate-400" />
                            <span className="text-xs font-black tracking-tight">{orderTime}</span>
                          </div>
                        </div>

                        {/* Customer & Location Info */}
                        <div className="space-y-2 border-t border-slate-50 pt-3 pb-3">
                          <div className="flex items-center gap-2 text-xs">
                            <User size={13} className="text-slate-400 shrink-0" />
                            <span className="font-bold text-slate-700">
                              {order.user?.fullName || 'Client Anonyme'}
                            </span>
                          </div>
                          {order.user?.phone && (
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 pl-5">
                              <Phone size={11} className="text-slate-400 shrink-0" />
                              <a href={`tel:${order.user.phone}`} className="hover:text-primary transition-colors">
                                {order.user.phone}
                              </a>
                            </div>
                          )}
                          <div className="flex items-start gap-2 text-[11px] text-slate-500">
                            <MapPin size={13} className="text-slate-400 shrink-0 mt-0.5" />
                            <span className="leading-tight">{order.address}</span>
                          </div>
                        </div>

                        {/* Options Badges & Details */}
                        <div className="flex flex-wrap gap-1.5 mb-3.5">
                          {/* Workers Count */}
                          <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-slate-100 text-slate-600 rounded-md">
                            {getRequiredCleanersCount(order)} Intervenant(s)
                          </span>
                          
                          {/* Materials Badge */}
                          <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                            order.useMaterials ? 'bg-blue-50 text-blue-600 border border-blue-100/30' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {order.useMaterials ? 'Avec Matériel' : 'Sans Matériel'}
                          </span>

                          {/* Products Badge */}
                          {order.productOrigin !== 'NONE' && (
                            <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100/30 rounded-md">
                              Produits: {order.productOrigin === 'LOCAL' ? 'Locaux' : 'Importés'}
                            </span>
                          )}
                        </div>

                        {/* Cleaner details */}
                        {order.cleanerId && (
                          <div className="flex items-center gap-1.5 mb-3.5 text-[10px] font-black uppercase text-emerald-600 tracking-wider">
                            <span>Cleaners: {getCleanerNames(order.cleanerId)}</span>
                          </div>
                        )}

                        {/* Live Timer Render */}
                        {(order.status === 'CONFIRMED' || order.status === 'IN_PROGRESS') && (
                          <div className="bg-slate-50/50 border border-slate-100 p-3 rounded-xl mb-4">
                            {renderTimer(order)}
                          </div>
                        )}

                        {/* Footer Card Row: Price & Actions */}
                        <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                          <div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block leading-none">
                              Total
                            </span>
                            <span className="text-sm font-black text-primary">
                              {order.totalPrice.toLocaleString('fr-DZ')} DA
                            </span>
                          </div>

                          {/* Quick Status Tag / Action Trigger */}
                          <div className="flex items-center gap-1.5">
                            {/* Static status display badge */}
                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                              {statusConfig.label}
                            </span>

                            {/* Transition button */}
                            {order.status === 'PENDING' && (
                              <button
                                onClick={() => {
                                  setOrderToConfirm(order);
                                  setSelectedCleanerIds(order.cleanerId ? order.cleanerId.split(',') : []);
                                  setIsAssignModalOpen(true);
                                }}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[9px] tracking-wider rounded-lg transition-all cursor-pointer flex items-center gap-1 shrink-0"
                              >
                                <Check size={10} strokeWidth={3} />
                                Confirmer
                              </button>
                            )}

                            {order.status === 'CONFIRMED' && (
                              <button
                                onClick={() => handleUpdateStatus(order.id, 'IN_PROGRESS')}
                                className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white font-black uppercase text-[9px] tracking-wider rounded-lg transition-all cursor-pointer flex items-center gap-1 shrink-0"
                              >
                                <Play size={10} fill="white" />
                                Commencer
                              </button>
                            )}

                            {order.status === 'IN_PROGRESS' && (
                              <button
                                onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[9px] tracking-wider rounded-lg transition-all cursor-pointer flex items-center gap-1 shrink-0"
                              >
                                <CheckSquare size={10} />
                                Terminer
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Link to order details page */}
                        <div className="mt-3.5 text-right">
                          <Link
                            href={`/admin/commands/${order.id}`}
                            className="text-[9px] font-black uppercase tracking-wider text-slate-400 hover:text-primary transition-colors inline-flex items-center gap-1"
                          >
                            <span>Fiche Détaillée</span>
                            <ArrowRight size={10} />
                          </Link>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* ── Assign Cleaner Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {isAssignModalOpen && orderToConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsAssignModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-[500px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500 shrink-0" />
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-100 transition-all cursor-pointer z-20"
              >
                <X size={18} />
              </button>

              <div className="p-8 space-y-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    Confirmation de Commande
                  </span>
                  <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                    Assigner un Cleaner
                  </h2>
                  <p className="text-xs text-slate-400 font-bold">
                    Sélectionnez un agent disponible pour le {new Date(orderToConfirm.scheduledDate).toLocaleDateString('fr-DZ', { day: '2-digit', month: 'short', year: 'numeric' })} à {new Date(orderToConfirm.scheduledDate).toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit' })}.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">
                      Cleaners Disponibles
                    </label>
                    <span className="text-[10px] font-black text-primary uppercase tracking-wider">
                      {selectedCleanerIds.length} / {getRequiredCleanersCount(orderToConfirm)} Sélectionné(s)
                    </span>
                  </div>
                  
                  {(() => {
                    if (orderToConfirm && isDateLocked(orderToConfirm.scheduledDate)) {
                      return (
                        <div className="border border-rose-100 bg-rose-50/40 p-5 rounded-2xl text-center text-rose-600 space-y-2">
                          <AlertCircle className="mx-auto text-rose-500" size={24} />
                          <p className="text-xs font-black uppercase tracking-wider">Jour Verrouillé</p>
                          <p className="text-[10px] font-bold text-rose-500">
                            Ce jour est verrouillé par l'administrateur. Vous ne pouvez pas affecter d'agents.
                          </p>
                        </div>
                      );
                    }

                    const requiredCount = getRequiredCleanersCount(orderToConfirm);
                    const availableCleaners = getAvailableCleaners(orderToConfirm);
                    
                    if (availableCleaners.length < requiredCount) {
                      return (
                        <div className="space-y-4">
                          <div className="border border-rose-100 bg-rose-50/40 p-5 rounded-2xl text-center text-rose-600 space-y-2">
                            <AlertCircle className="mx-auto" size={24} />
                            <p className="text-xs font-black uppercase tracking-wider">Créneau Impossible (Pas assez d'agents)</p>
                            <p className="text-[10px] font-bold text-rose-500">
                              Requis: {requiredCount} cleaner(s) • Disponibles: {availableCleaners.length} à {new Date(orderToConfirm.scheduledDate).toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit' })}.
                            </p>
                          </div>

                          {/* Alternative suggestions */}
                          <div className="space-y-2 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">
                              Créneaux alternatifs disponibles ce jour ({requiredCount} agents requis) :
                            </h4>
                            {getAvailableSlots(orderToConfirm, requiredCount).length === 0 ? (
                              <p className="text-[10px] font-bold text-slate-400 pl-1">
                                Aucun autre créneau disponible sur cette journée avec {requiredCount} agents libres.
                              </p>
                            ) : (
                              <div className="flex flex-wrap gap-2 pt-1.5">
                                {getAvailableSlots(orderToConfirm, requiredCount).map(timeStr => (
                                  <button
                                    key={timeStr}
                                    type="button"
                                    onClick={() => handleSelectSlot(orderToConfirm, timeStr)}
                                    className="px-3 py-1.5 bg-white border border-slate-200 hover:border-primary/50 text-slate-700 hover:text-primary rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm hover:shadow active:scale-95"
                                  >
                                    {timeStr}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                        {availableCleaners.map(cleaner => {
                          const isSelected = selectedCleanerIds.includes(cleaner.id);
                          const serviceName = orderToConfirm.service?.name || orderToConfirm.category?.name || '';
                          const hasMatchingSkill = cleaner.skills.some(s => s.toLowerCase() === serviceName.toLowerCase());

                          return (
                            <button
                              key={cleaner.id}
                              type="button"
                              onClick={() => {
                                const isSel = selectedCleanerIds.includes(cleaner.id);
                                const reqCount = getRequiredCleanersCount(orderToConfirm);
                                if (isSel) {
                                  setSelectedCleanerIds(prev => prev.filter(id => id !== cleaner.id));
                                } else {
                                  if (reqCount === 1) {
                                    setSelectedCleanerIds([cleaner.id]);
                                  } else if (selectedCleanerIds.length < reqCount) {
                                    setSelectedCleanerIds(prev => [...prev, cleaner.id]);
                                  } else {
                                    alert(`Vous ne pouvez pas sélectionner plus de ${reqCount} cleaner(s).`);
                                  }
                                }
                              }}
                              className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                                isSelected
                                  ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                                  : 'bg-slate-50/60 border-slate-100 hover:border-slate-200 text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className="text-xs font-black uppercase tracking-tight">
                                  {cleaner.fullName}
                                </span>
                                {hasMatchingSkill && (
                                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                                    isSelected ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                                  }`}>
                                    Compétence Validée
                                  </span>
                                )}
                              </div>
                              <div className={`text-[9px] font-bold leading-relaxed ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                                Tél: {cleaner.phone} • {cleaner.skills.length > 0 ? `Skills: ${cleaner.skills.join(', ')}` : 'Aucun skill spécifié'}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

                <div className="pt-4 border-t border-slate-100 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAssignModalOpen(false)}
                    className="flex-1 py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl font-bold uppercase tracking-wider text-[10px] transition-all cursor-pointer border border-slate-100"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    disabled={(orderToConfirm && isDateLocked(orderToConfirm.scheduledDate)) || selectedCleanerIds.length !== getRequiredCleanersCount(orderToConfirm) || isLoading}
                    onClick={handleConfirmAndAssign}
                    className="flex-1 py-3.5 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-black uppercase tracking-wider text-[10px] transition-all cursor-pointer shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Confirmer & Assigner'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
