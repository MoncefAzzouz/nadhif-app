'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gift, Search, X, RefreshCw, AlertCircle, CheckCircle,
  Users, History, TrendingUp, Save, Coins, Package, Sparkles,
  Code, Copy, Check, Zap, Layers, ShoppingBag,
} from 'lucide-react';
import {
  pointsApi, imgUrl,
  type ApiPointClient, type ApiPointTransaction,
  type ApiService, type ApiCategory, type PointTransactionType,
} from '../../lib/api';

type Tab = 'store' | 'clients' | 'history';

const TX_STYLES: Record<PointTransactionType, { label: string; className: string }> = {
  EARNED: { label: 'Earned', className: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  SPENT: { label: 'Spent', className: 'bg-amber-50 text-amber-600 border-amber-100' },
  REFUNDED: { label: 'Refunded', className: 'bg-sky-50 text-sky-600 border-sky-100' },
  ADJUSTED: { label: 'Adjusted', className: 'bg-violet-50 text-violet-600 border-violet-100' },
};

const fmt = (n: number) => n.toLocaleString('fr-DZ');
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });

// Local edit buffer for one catalog entry: the toggle plus every point cost the
// admin can type, kept separate from the fetched data until "Save" is pressed.
interface ServiceDraft {
  pointStoreEnabled: boolean;
  extraWorkerPointCost: number;
  rapidExtraWorkerPointCost: number;
  materialPointCost: number;
  localProductPointCost: number;
  importedProductPointCost: number;
  houseConfigs: Record<string, { pointCost: number; rapidPointCost: number }>;
}

interface CategoryDraft {
  pointStoreEnabled: boolean;
  materialPointCost: number;
  localProductPointCost: number;
  importedProductPointCost: number;
  categoryServices: Record<string, { pointCost: number; rapidPointCost: number }>;
}

const serviceDraft = (service: ApiService): ServiceDraft => ({
  pointStoreEnabled: service.pointStoreEnabled ?? false,
  extraWorkerPointCost: service.extraWorkerPointCost ?? 0,
  rapidExtraWorkerPointCost: service.rapidExtraWorkerPointCost ?? 0,
  materialPointCost: service.materialPointCost ?? 0,
  localProductPointCost: service.localProductPointCost ?? 0,
  importedProductPointCost: service.importedProductPointCost ?? 0,
  houseConfigs: Object.fromEntries(
    service.houseConfigs.map(hc => [hc.id, { pointCost: hc.pointCost ?? 0, rapidPointCost: hc.rapidPointCost ?? 0 }]),
  ),
});

const categoryDraft = (category: ApiCategory): CategoryDraft => ({
  pointStoreEnabled: category.pointStoreEnabled ?? false,
  materialPointCost: category.materialPointCost ?? 0,
  localProductPointCost: category.localProductPointCost ?? 0,
  importedProductPointCost: category.importedProductPointCost ?? 0,
  categoryServices: Object.fromEntries(
    category.categoryServices.map(cs => [cs.id, { pointCost: cs.pointCost ?? 0, rapidPointCost: cs.rapidPointCost ?? 0 }]),
  ),
});

export default function PointsPage() {
  const [tab, setTab] = useState<Tab>('store');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [services, setServices] = useState<ApiService[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [clients, setClients] = useState<ApiPointClient[]>([]);
  const [transactions, setTransactions] = useState<ApiPointTransaction[]>([]);

  const [serviceDrafts, setServiceDrafts] = useState<Record<string, ServiceDraft>>({});
  const [categoryDrafts, setCategoryDrafts] = useState<Record<string, CategoryDraft>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const [searchStore, setSearchStore] = useState('');
  const [searchClient, setSearchClient] = useState('');
  const [catalogKind, setCatalogKind] = useState<'services' | 'categories'>('services');

  // Raw API payload viewer (same pattern as the Commands page)
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Client history + adjustment
  const [openClient, setOpenClient] = useState<ApiPointClient | null>(null);
  const [clientHistory, setClientHistory] = useState<ApiPointTransaction[] | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [isAdjusting, setIsAdjusting] = useState(false);

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [catalog, clientsData, txData] = await Promise.all([
        pointsApi.store.getCatalog(),
        pointsApi.clients.getAll(),
        pointsApi.transactions(200),
      ]);
      setServices(catalog.services);
      setCategories(catalog.categories);
      setServiceDrafts(Object.fromEntries(catalog.services.map(s => [s.id, serviceDraft(s)])));
      setCategoryDrafts(Object.fromEntries(catalog.categories.map(c => [c.id, categoryDraft(c)])));
      setClients(clientsData);
      setTransactions(txData);
    } catch (err: any) {
      setError(err.message || 'Failed to load loyalty data. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ─── Saving point costs ─────────────────────────────────────────────────────

  const saveService = async (service: ApiService) => {
    const draft = serviceDrafts[service.id];
    if (!draft) return;
    setSavingId(service.id);
    try {
      const updated = await pointsApi.store.updateService(service.id, {
        pointStoreEnabled: draft.pointStoreEnabled,
        extraWorkerPointCost: draft.extraWorkerPointCost,
        rapidExtraWorkerPointCost: draft.rapidExtraWorkerPointCost,
        materialPointCost: draft.materialPointCost,
        localProductPointCost: draft.localProductPointCost,
        importedProductPointCost: draft.importedProductPointCost,
        houseConfigs: Object.entries(draft.houseConfigs).map(([id, row]) => ({ id, ...row })),
      });
      setServices(prev => prev.map(s => (s.id === service.id ? updated : s)));
      setServiceDrafts(prev => ({ ...prev, [service.id]: serviceDraft(updated) }));
      triggerToast(`${service.name} point pricing saved`);
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSavingId(null);
    }
  };

  const saveCategory = async (category: ApiCategory) => {
    const draft = categoryDrafts[category.id];
    if (!draft) return;
    setSavingId(category.id);
    try {
      const updated = await pointsApi.store.updateCategory(category.id, {
        pointStoreEnabled: draft.pointStoreEnabled,
        materialPointCost: draft.materialPointCost,
        localProductPointCost: draft.localProductPointCost,
        importedProductPointCost: draft.importedProductPointCost,
        categoryServices: Object.entries(draft.categoryServices).map(([id, row]) => ({ id, ...row })),
      });
      setCategories(prev => prev.map(c => (c.id === category.id ? updated : c)));
      setCategoryDrafts(prev => ({ ...prev, [category.id]: categoryDraft(updated) }));
      triggerToast(`${category.name} point pricing saved`);
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSavingId(null);
    }
  };

  const serviceDirty = (service: ApiService) =>
    JSON.stringify(serviceDrafts[service.id]) !== JSON.stringify(serviceDraft(service));
  const categoryDirty = (category: ApiCategory) =>
    JSON.stringify(categoryDrafts[category.id]) !== JSON.stringify(categoryDraft(category));

  // ─── Client history + adjustment ────────────────────────────────────────────

  const openClientHistory = async (client: ApiPointClient) => {
    setOpenClient(client);
    setClientHistory(null);
    setAdjustAmount('');
    setAdjustReason('');
    try {
      const data = await pointsApi.clients.getOne(client.id);
      setClientHistory(data.transactions);
      setOpenClient(data.user);
    } catch (err: any) {
      alert(`Failed to load history: ${err.message}`);
      setOpenClient(null);
    }
  };

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!openClient) return;
    const amount = Number(adjustAmount);
    if (!Number.isInteger(amount) || amount === 0) {
      alert('Enter a whole number of points. Use a negative value to remove points.');
      return;
    }
    setIsAdjusting(true);
    try {
      const result = await pointsApi.clients.adjust(openClient.id, amount, adjustReason || undefined);
      setClients(prev => prev.map(c => (c.id === openClient.id ? { ...c, points: result.points } : c)));
      setOpenClient(prev => (prev ? { ...prev, points: result.points } : prev));
      const refreshed = await pointsApi.clients.getOne(openClient.id);
      setClientHistory(refreshed.transactions);
      setTransactions(await pointsApi.transactions(200));
      setAdjustAmount('');
      setAdjustReason('');
      triggerToast(`${amount > 0 ? '+' : ''}${amount} points — new balance ${fmt(result.points)}`);
    } catch (err: any) {
      alert(`Adjustment failed: ${err.message}`);
    } finally {
      setIsAdjusting(false);
    }
  };

  // ─── Derived ────────────────────────────────────────────────────────────────

  const stats = useMemo(() => ({
    circulating: clients.reduce((sum, c) => sum + c.points, 0),
    spent: clients.reduce((sum, c) => sum + c.totalSpent, 0),
    inStore:
      services.filter(s => s.pointStoreEnabled).length +
      categories.filter(c => c.pointStoreEnabled).length,
    holders: clients.filter(c => c.points > 0).length,
  }), [clients, services, categories]);

  const jsonView = useMemo(() => {
    if (tab === 'store') {
      return {
        label: 'GET /api/points/store/all',
        title: 'Point catalog JSON',
        data: catalogKind === 'services' ? services : categories,
      };
    }
    if (tab === 'clients') return { label: 'GET /api/points/clients', title: 'Client balances JSON', data: clients };
    return { label: 'GET /api/points/transactions', title: 'Point history JSON', data: transactions };
  }, [tab, catalogKind, services, categories, clients, transactions]);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(jsonView.data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredServices = services.filter(s => s.name.toLowerCase().includes(searchStore.toLowerCase()));
  const filteredCategories = categories.filter(c => c.name.toLowerCase().includes(searchStore.toLowerCase()));

  const filteredClients = clients.filter(c => {
    const q = searchClient.toLowerCase();
    return c.fullName.toLowerCase().includes(q) || c.phone.includes(q) || c.email.toLowerCase().includes(q);
  });

  // A point input paired with the DZD price it replaces.
  const PointInput = ({
    label, price, value, onChange, accent = 'amber',
  }: { label: string; price?: number; value: number; onChange: (v: number) => void; accent?: 'amber' | 'sky' }) => (
    <div className="space-y-1.5">
      <label className="block text-[9px] font-black uppercase text-slate-400 tracking-widest">
        {label}
        {price !== undefined && (
          <span className="ml-1.5 text-slate-300 normal-case tracking-normal">({fmt(price)} DA)</span>
        )}
      </label>
      <div className="relative">
        <input
          type="number"
          min={0}
          step={1}
          value={value}
          onChange={e => onChange(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
          className={`w-full pl-3 pr-11 py-2.5 bg-white border rounded-xl outline-none text-xs font-black transition-all ${
            accent === 'sky'
              ? 'border-sky-100 focus:border-sky-300 text-sky-700'
              : 'border-slate-100 focus:border-amber-300 text-slate-800'
          }`}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase text-slate-300">pts</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-10 font-gilmer max-w-7xl mx-auto animate-fadeIn relative">
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-xl shadow-emerald-900/10 flex items-center gap-3 font-bold text-xs uppercase tracking-wider"
          >
            <CheckCircle size={16} />
            <span>{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-amber-500/5 px-4 py-2 rounded-full border border-amber-500/10">
            <Sparkles size={14} className="text-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-600">Loyalty Engine</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-800 uppercase italic">
            Client <span className="text-amber-500">Points</span>
          </h1>
          <p className="text-sm text-slate-400 font-medium font-inter">
            Reward completed orders, price your services in points, and follow every client balance.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsJsonModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-wider text-slate-300 hover:text-white hover:bg-slate-950 transition-all shadow-sm cursor-pointer"
          >
            <Code size={14} /> View API JSON
          </button>
          <button
            onClick={fetchAll}
            disabled={isLoading}
            className="px-5 py-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-wider text-slate-500 hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 rounded-3xl p-6 flex items-center gap-4">
          <AlertCircle size={20} className="text-rose-500 shrink-0" />
          <p className="text-sm font-bold text-rose-700">{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Points in circulation', val: fmt(stats.circulating), icon: Coins, color: 'text-amber-500 bg-amber-50 border-amber-100/50' },
          { label: 'Points spent', val: fmt(stats.spent), icon: ShoppingBag, color: 'text-violet-500 bg-violet-50 border-violet-100/50' },
          { label: 'In the point store', val: stats.inStore, icon: Gift, color: 'text-emerald-500 bg-emerald-50 border-emerald-100/50' },
          { label: 'Clients with points', val: stats.holders, icon: Users, color: 'text-indigo-500 bg-indigo-50 border-indigo-100/50' },
        ].map((card, idx) => (
          <div key={idx} className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex items-center justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{card.label}</p>
              <h3 className="text-3xl font-black text-slate-800 leading-none truncate">{card.val}</h3>
            </div>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shrink-0 ${card.color}`}>
              <card.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-slate-100 rounded-2xl gap-1 w-fit">
        {([
          { id: 'store', label: 'Point Store', icon: Gift },
          { id: 'clients', label: 'Client Balances', icon: Users },
          { id: 'history', label: 'History', icon: History },
        ] as const).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all flex items-center gap-2 ${
              tab === t.id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <t.icon size={13} />
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="min-h-[30vh] flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 animate-pulse">Loading loyalty data...</p>
        </div>
      ) : (
        <>
          {/* ── STORE: the real catalog, priced in points ────────────────────── */}
          {tab === 'store' && (
            <div className="space-y-6">
              <div className="bg-amber-50/60 border border-amber-100 rounded-3xl p-5 flex gap-4">
                <Sparkles size={18} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] font-bold text-amber-800 leading-relaxed">
                  These are your existing services and categories. Switch one on to publish it in the app&apos;s point
                  store, then give every priced step its cost in points — the client pays that instead of the price in DA.
                  A step left at <strong>0</strong> stays hidden, and a service with no priced step never appears.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Search a service or category..."
                    value={searchStore}
                    onChange={e => setSearchStore(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl text-xs font-bold text-slate-800 focus:border-amber-200 outline-none transition-all font-inter"
                  />
                  <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>

                <div className="flex p-1 bg-slate-100 rounded-xl gap-1 w-fit">
                  {([
                    { id: 'services', label: `Services (${services.length})`, icon: ShoppingBag },
                    { id: 'categories', label: `Categories (${categories.length})`, icon: Layers },
                  ] as const).map(k => (
                    <button
                      key={k.id}
                      onClick={() => setCatalogKind(k.id)}
                      className={`px-4 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer transition-all flex items-center gap-2 ${
                        catalogKind === k.id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <k.icon size={12} />
                      {k.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Services */}
              {catalogKind === 'services' && (
                <div className="space-y-5">
                  {filteredServices.map(service => {
                    const draft = serviceDrafts[service.id];
                    if (!draft) return null;
                    const dirty = serviceDirty(service);
                    return (
                      <div
                        key={service.id}
                        className={`bg-white border rounded-[2rem] shadow-sm overflow-hidden transition-all ${
                          draft.pointStoreEnabled ? 'border-amber-200' : 'border-slate-100'
                        }`}
                      >
                        <div className="p-6 flex items-center gap-5 border-b border-slate-50">
                          <div className="w-16 h-16 rounded-2xl bg-slate-50 overflow-hidden shrink-0 flex items-center justify-center">
                            {service.picture ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={imgUrl(service.picture)} alt={service.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package size={22} className="text-slate-300" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-black uppercase tracking-tight text-slate-800 truncate">{service.name}</h3>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              {service.houseConfigs.length} house type(s) · {service.durationHours}h
                              {!service.isActive && <span className="text-rose-400"> · service disabled</span>}
                            </p>
                          </div>

                          <button
                            onClick={() =>
                              setServiceDrafts(prev => ({
                                ...prev,
                                [service.id]: { ...draft, pointStoreEnabled: !draft.pointStoreEnabled },
                              }))
                            }
                            className={`px-5 py-3 rounded-2xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer border shrink-0 flex items-center gap-2 ${
                              draft.pointStoreEnabled
                                ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20'
                                : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'
                            }`}
                          >
                            <Gift size={12} />
                            {draft.pointStoreEnabled ? 'In point store' : 'Not in store'}
                          </button>
                        </div>

                        {draft.pointStoreEnabled && (
                          <div className="p-6 space-y-6 bg-slate-50/40">
                            {/* House types */}
                            <div className="space-y-3">
                              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">House types</p>
                              {service.houseConfigs.map(config => (
                                <div key={config.id} className="grid sm:grid-cols-[1fr_auto_auto] gap-4 items-end bg-white border border-slate-100 rounded-2xl p-4">
                                  <div className="space-y-1">
                                    <p className="text-xs font-black uppercase text-slate-700">{config.type}</p>
                                    <p className="text-[10px] font-bold text-slate-400">
                                      {config.workers} worker(s) · {config.durationHours}h
                                    </p>
                                  </div>
                                  <div className="w-full sm:w-36">
                                    <PointInput
                                      label="Normal"
                                      price={config.basePrice}
                                      value={draft.houseConfigs[config.id]?.pointCost ?? 0}
                                      onChange={v =>
                                        setServiceDrafts(prev => ({
                                          ...prev,
                                          [service.id]: {
                                            ...draft,
                                            houseConfigs: {
                                              ...draft.houseConfigs,
                                              [config.id]: { ...draft.houseConfigs[config.id], pointCost: v },
                                            },
                                          },
                                        }))
                                      }
                                    />
                                  </div>
                                  <div className="w-full sm:w-36">
                                    <PointInput
                                      label="Rapid ⚡"
                                      price={config.rapidBasePrice}
                                      accent="sky"
                                      value={draft.houseConfigs[config.id]?.rapidPointCost ?? 0}
                                      onChange={v =>
                                        setServiceDrafts(prev => ({
                                          ...prev,
                                          [service.id]: {
                                            ...draft,
                                            houseConfigs: {
                                              ...draft.houseConfigs,
                                              [config.id]: { ...draft.houseConfigs[config.id], rapidPointCost: v },
                                            },
                                          },
                                        }))
                                      }
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Options */}
                            <div className="space-y-3">
                              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Options</p>
                              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-white border border-slate-100 rounded-2xl p-4">
                                <PointInput
                                  label="Extra worker"
                                  price={service.extraWorkerPrice}
                                  value={draft.extraWorkerPointCost}
                                  onChange={v => setServiceDrafts(prev => ({ ...prev, [service.id]: { ...draft, extraWorkerPointCost: v } }))}
                                />
                                <PointInput
                                  label="Extra worker (rapid)"
                                  price={service.rapidExtraWorkerPrice}
                                  accent="sky"
                                  value={draft.rapidExtraWorkerPointCost}
                                  onChange={v => setServiceDrafts(prev => ({ ...prev, [service.id]: { ...draft, rapidExtraWorkerPointCost: v } }))}
                                />
                                <PointInput
                                  label="Materials"
                                  price={service.materialPrice}
                                  value={draft.materialPointCost}
                                  onChange={v => setServiceDrafts(prev => ({ ...prev, [service.id]: { ...draft, materialPointCost: v } }))}
                                />
                                <PointInput
                                  label="Local products"
                                  price={service.localProductPrice}
                                  value={draft.localProductPointCost}
                                  onChange={v => setServiceDrafts(prev => ({ ...prev, [service.id]: { ...draft, localProductPointCost: v } }))}
                                />
                                <PointInput
                                  label="Imported products"
                                  price={service.importedProductPrice}
                                  value={draft.importedProductPointCost}
                                  onChange={v => setServiceDrafts(prev => ({ ...prev, [service.id]: { ...draft, importedProductPointCost: v } }))}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="px-6 py-4 flex items-center justify-between gap-4 border-t border-slate-50">
                          <p className="text-[10px] font-bold text-slate-400">
                            {dirty ? 'Unsaved changes' : 'Saved'}
                          </p>
                          <button
                            onClick={() => saveService(service)}
                            disabled={!dirty || savingId === service.id}
                            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black uppercase tracking-wider text-[10px] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {savingId === service.id ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Saving…
                              </>
                            ) : (
                              <>
                                <Save size={13} />
                                Save
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {filteredServices.length === 0 && (
                    <p className="text-center py-12 text-xs font-black uppercase tracking-wider text-slate-400">No service found</p>
                  )}
                </div>
              )}

              {/* Categories */}
              {catalogKind === 'categories' && (
                <div className="space-y-5">
                  {filteredCategories.map(category => {
                    const draft = categoryDrafts[category.id];
                    if (!draft) return null;
                    const dirty = categoryDirty(category);
                    return (
                      <div
                        key={category.id}
                        className={`bg-white border rounded-[2rem] shadow-sm overflow-hidden transition-all ${
                          draft.pointStoreEnabled ? 'border-amber-200' : 'border-slate-100'
                        }`}
                      >
                        <div className="p-6 flex items-center gap-5 border-b border-slate-50">
                          <div className="w-16 h-16 rounded-2xl bg-slate-50 overflow-hidden shrink-0 flex items-center justify-center">
                            {category.picture ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={imgUrl(category.picture)} alt={category.name} className="w-full h-full object-cover" />
                            ) : (
                              <Layers size={22} className="text-slate-300" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-black uppercase tracking-tight text-slate-800 truncate">{category.name}</h3>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              {category.categoryServices.length} option(s)
                              {!category.isActive && <span className="text-rose-400"> · category disabled</span>}
                            </p>
                          </div>

                          <button
                            onClick={() =>
                              setCategoryDrafts(prev => ({
                                ...prev,
                                [category.id]: { ...draft, pointStoreEnabled: !draft.pointStoreEnabled },
                              }))
                            }
                            className={`px-5 py-3 rounded-2xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer border shrink-0 flex items-center gap-2 ${
                              draft.pointStoreEnabled
                                ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20'
                                : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'
                            }`}
                          >
                            <Gift size={12} />
                            {draft.pointStoreEnabled ? 'In point store' : 'Not in store'}
                          </button>
                        </div>

                        {draft.pointStoreEnabled && (
                          <div className="p-6 space-y-6 bg-slate-50/40">
                            <div className="space-y-3">
                              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Options</p>
                              {category.categoryServices.map(option => (
                                <div key={option.id} className="grid sm:grid-cols-[1fr_auto_auto] gap-4 items-end bg-white border border-slate-100 rounded-2xl p-4">
                                  <div className="space-y-1">
                                    <p className="text-xs font-black uppercase text-slate-700">{option.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400">
                                      {option.workers} worker(s) · {option.durationHours}h
                                    </p>
                                  </div>
                                  <div className="w-full sm:w-36">
                                    <PointInput
                                      label="Normal"
                                      price={option.basePrice}
                                      value={draft.categoryServices[option.id]?.pointCost ?? 0}
                                      onChange={v =>
                                        setCategoryDrafts(prev => ({
                                          ...prev,
                                          [category.id]: {
                                            ...draft,
                                            categoryServices: {
                                              ...draft.categoryServices,
                                              [option.id]: { ...draft.categoryServices[option.id], pointCost: v },
                                            },
                                          },
                                        }))
                                      }
                                    />
                                  </div>
                                  <div className="w-full sm:w-36">
                                    <PointInput
                                      label="Rapid ⚡"
                                      price={option.rapidBasePrice}
                                      accent="sky"
                                      value={draft.categoryServices[option.id]?.rapidPointCost ?? 0}
                                      onChange={v =>
                                        setCategoryDrafts(prev => ({
                                          ...prev,
                                          [category.id]: {
                                            ...draft,
                                            categoryServices: {
                                              ...draft.categoryServices,
                                              [option.id]: { ...draft.categoryServices[option.id], rapidPointCost: v },
                                            },
                                          },
                                        }))
                                      }
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="space-y-3">
                              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Options</p>
                              <div className="grid sm:grid-cols-3 gap-4 bg-white border border-slate-100 rounded-2xl p-4">
                                <PointInput
                                  label="Materials"
                                  price={category.materialPrice}
                                  value={draft.materialPointCost}
                                  onChange={v => setCategoryDrafts(prev => ({ ...prev, [category.id]: { ...draft, materialPointCost: v } }))}
                                />
                                <PointInput
                                  label="Local products"
                                  price={category.localProductPrice}
                                  value={draft.localProductPointCost}
                                  onChange={v => setCategoryDrafts(prev => ({ ...prev, [category.id]: { ...draft, localProductPointCost: v } }))}
                                />
                                <PointInput
                                  label="Imported products"
                                  price={category.importedProductPrice}
                                  value={draft.importedProductPointCost}
                                  onChange={v => setCategoryDrafts(prev => ({ ...prev, [category.id]: { ...draft, importedProductPointCost: v } }))}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="px-6 py-4 flex items-center justify-between gap-4 border-t border-slate-50">
                          <p className="text-[10px] font-bold text-slate-400">{dirty ? 'Unsaved changes' : 'Saved'}</p>
                          <button
                            onClick={() => saveCategory(category)}
                            disabled={!dirty || savingId === category.id}
                            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black uppercase tracking-wider text-[10px] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {savingId === category.id ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Saving…
                              </>
                            ) : (
                              <>
                                <Save size={13} />
                                Save
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {filteredCategories.length === 0 && (
                    <p className="text-center py-12 text-xs font-black uppercase tracking-wider text-slate-400">No category found</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── CLIENTS ─────────────────────────────────────────────────────── */}
          {tab === 'clients' && (
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm space-y-6">
              <div className="relative max-w-md">
                <input
                  type="text"
                  placeholder="Search by name, phone or email..."
                  value={searchClient}
                  onChange={e => setSearchClient(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-amber-200 outline-none transition-all font-inter"
                />
                <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px]">
                  <thead>
                    <tr className="text-[9px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                      <th className="text-left pb-4 pl-4">Client</th>
                      <th className="text-left pb-4">Phone</th>
                      <th className="text-right pb-4">Balance</th>
                      <th className="text-right pb-4">Earned</th>
                      <th className="text-right pb-4">Spent</th>
                      <th className="text-right pb-4 pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredClients.map(client => (
                      <tr key={client.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 pl-4">
                          <p className="text-xs font-black text-slate-800">{client.fullName}</p>
                          <p className="text-[10px] font-bold text-slate-400 truncate max-w-[220px]">{client.email}</p>
                        </td>
                        <td className="py-4 text-xs font-bold text-slate-500">{client.phone}</td>
                        <td className="py-4 text-right">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-xl text-[11px] font-black">
                            <Coins size={11} />
                            {fmt(client.points)}
                          </span>
                        </td>
                        <td className="py-4 text-right text-[11px] font-black text-emerald-500">+{fmt(client.totalEarned)}</td>
                        <td className="py-4 text-right text-[11px] font-black text-slate-400">−{fmt(client.totalSpent)}</td>
                        <td className="py-4 pr-4 text-right">
                          <button
                            onClick={() => openClientHistory(client)}
                            className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 hover:text-amber-600 text-slate-500 text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer border border-slate-100 inline-flex items-center gap-2"
                          >
                            <History size={12} />
                            History & adjust
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredClients.length === 0 && (
                  <p className="text-center py-12 text-xs font-black uppercase tracking-wider text-slate-400">No client found</p>
                )}
              </div>
            </div>
          )}

          {/* ── HISTORY ─────────────────────────────────────────────────────── */}
          {tab === 'history' && (
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px]">
                  <thead>
                    <tr className="text-[9px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                      <th className="text-left pb-4 pl-4">Date</th>
                      <th className="text-left pb-4">Client</th>
                      <th className="text-left pb-4">Type</th>
                      <th className="text-left pb-4">Reason</th>
                      <th className="text-right pb-4">Movement</th>
                      <th className="text-right pb-4 pr-4">Balance after</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {transactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 pl-4 text-[11px] font-bold text-slate-400 whitespace-nowrap">{fmtDate(tx.createdAt)}</td>
                        <td className="py-4 text-xs font-black text-slate-800">
                          {tx.user?.fullName ?? '—'}
                          <span className="block text-[10px] font-bold text-slate-400">{tx.user?.phone}</span>
                        </td>
                        <td className="py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${TX_STYLES[tx.type].className}`}>
                            {TX_STYLES[tx.type].label}
                          </span>
                        </td>
                        <td className="py-4 text-[11px] font-bold text-slate-500 max-w-[220px] truncate">{tx.reason || '—'}</td>
                        <td className={`py-4 text-right text-xs font-black ${tx.amount > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {tx.amount > 0 ? '+' : ''}{fmt(tx.amount)}
                        </td>
                        <td className="py-4 pr-4 text-right text-[11px] font-black text-slate-600">{fmt(tx.balanceAfter)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {transactions.length === 0 && (
                  <p className="text-center py-12 text-xs font-black uppercase tracking-wider text-slate-400">
                    No point movement yet
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── API JSON viewer ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {isJsonModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsJsonModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-[700px] bg-slate-950 text-slate-200 rounded-[3rem] shadow-2xl border border-white/10 relative z-10 overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-8 border-b border-white/5 flex justify-between items-center shrink-0 gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 text-amber-500">
                    <Code size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest truncate">{jsonView.label}</span>
                  </div>
                  <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">{jsonView.title}</h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    {jsonView.data.length} record(s) — switch tab to inspect another endpoint
                  </p>
                </div>
                <button
                  onClick={() => setIsJsonModalOpen(false)}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white border border-white/10 transition-all cursor-pointer shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-8 font-mono text-xs text-emerald-400 bg-slate-900/60 leading-relaxed">
                <pre>{JSON.stringify(jsonView.data, null, 2)}</pre>
              </div>

              <div className="p-8 border-t border-white/5 bg-slate-950 flex gap-4 shrink-0 justify-end">
                <button
                  onClick={handleCopyJson}
                  className="px-6 py-4 bg-amber-500 text-white rounded-2xl font-black uppercase tracking-wider text-[10px] shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
                >
                  {copied ? <><Check size={14} strokeWidth={3} /> Copied! </> : <><Copy size={14} /> Copy JSON API</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Client history + adjustment modal ─────────────────────────────── */}
      <AnimatePresence>
        {openClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpenClient(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 relative z-10 overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <h2 className="text-xl font-black uppercase tracking-tight text-slate-800 truncate">{openClient.fullName}</h2>
                  <p className="text-[11px] font-bold text-slate-400">{openClient.phone} · {openClient.email}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="inline-flex items-center gap-2 px-4 py-3 bg-amber-50 text-amber-600 border border-amber-100 rounded-2xl text-sm font-black">
                    <Coins size={15} />
                    {fmt(openClient.points)} pts
                  </span>
                  <button
                    onClick={() => setOpenClient(null)}
                    className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-all cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleAdjust} className="p-6 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
                <input
                  type="number"
                  step={1}
                  value={adjustAmount}
                  onChange={e => setAdjustAmount(e.target.value)}
                  placeholder="+100 or -50"
                  className="w-full sm:w-40 px-4 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none focus:border-amber-200 transition-all text-xs font-black"
                />
                <input
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  placeholder="Reason (optional)"
                  className="flex-1 px-4 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none focus:border-amber-200 transition-all text-xs font-bold"
                />
                <button
                  type="submit"
                  disabled={isAdjusting}
                  className="px-6 py-3.5 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-black uppercase tracking-wider text-[10px] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
                >
                  <TrendingUp size={13} />
                  {isAdjusting ? 'Applying…' : 'Adjust'}
                </button>
              </form>

              <div className="flex-1 overflow-y-auto p-6">
                {clientHistory === null ? (
                  <div className="py-12 flex justify-center">
                    <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : clientHistory.length === 0 ? (
                  <p className="text-center py-12 text-xs font-black uppercase tracking-wider text-slate-400">
                    No movement for this client yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {clientHistory.map(tx => (
                      <div key={tx.id} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border shrink-0 ${TX_STYLES[tx.type].className}`}>
                          {TX_STYLES[tx.type].label}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-700 truncate">{tx.reason || '—'}</p>
                          <p className="text-[10px] font-bold text-slate-400">{fmtDate(tx.createdAt)}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`text-sm font-black ${tx.amount > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {tx.amount > 0 ? '+' : ''}{fmt(tx.amount)}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400">balance {fmt(tx.balanceAfter)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
