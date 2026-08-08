'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gift, Plus, Search, Trash2, Pencil, X, RefreshCw, AlertCircle, CheckCircle,
  Users, History, TrendingUp, TrendingDown, Save, Coins, Package, Upload, Sparkles,
  Code, Copy, Check,
} from 'lucide-react';
import {
  pointsApi, servicesApi, categoriesApi, uploadImage, imgUrl,
  type ApiPointStoreItem, type ApiPointClient, type ApiPointTransaction,
  type ApiService, type ApiCategory, type PointStoreItemPayload, type PointTransactionType,
} from '../../lib/api';

type Tab = 'store' | 'clients' | 'history';

const TX_STYLES: Record<PointTransactionType, { label: string; className: string }> = {
  EARNED: { label: 'Earned', className: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  SPENT: { label: 'Spent', className: 'bg-amber-50 text-amber-600 border-amber-100' },
  REFUNDED: { label: 'Refunded', className: 'bg-sky-50 text-sky-600 border-sky-100' },
  ADJUSTED: { label: 'Adjusted', className: 'bg-violet-50 text-violet-600 border-violet-100' },
};

const emptyForm: PointStoreItemPayload & { target: 'service' | 'category' } = {
  name: '', nameAr: '', nameFr: '',
  description: '', descriptionAr: '', descriptionFr: '',
  picture: '', pointCost: 100,
  serviceId: '', houseConfigId: '', categoryId: '', categoryServiceId: '',
  isActive: true,
  target: 'service',
};

const fmt = (n: number) => n.toLocaleString('fr-DZ');
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });

export default function PointsPage() {
  const [tab, setTab] = useState<Tab>('store');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [items, setItems] = useState<ApiPointStoreItem[]>([]);
  const [clients, setClients] = useState<ApiPointClient[]>([]);
  const [transactions, setTransactions] = useState<ApiPointTransaction[]>([]);
  const [services, setServices] = useState<ApiService[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);

  const [searchStore, setSearchStore] = useState('');
  const [searchClient, setSearchClient] = useState('');

  // Raw API payload viewer (same pattern as the Commands page)
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Reward form (create + edit share it)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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
      const [itemsData, clientsData, txData, servicesData, categoriesData] = await Promise.all([
        pointsApi.store.getAll(),
        pointsApi.clients.getAll(),
        pointsApi.transactions(200),
        servicesApi.getAll(),
        categoriesApi.getAll(),
      ]);
      setItems(itemsData);
      setClients(clientsData);
      setTransactions(txData);
      setServices(servicesData);
      setCategories(categoriesData);
    } catch (err: any) {
      setError(err.message || 'Failed to load loyalty data. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ─── Reward form ────────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  };

  const openEdit = (item: ApiPointStoreItem) => {
    setEditingId(item.id);
    setForm({
      name: item.name, nameAr: item.nameAr, nameFr: item.nameFr,
      description: item.description, descriptionAr: item.descriptionAr, descriptionFr: item.descriptionFr,
      picture: item.picture, pointCost: item.pointCost,
      serviceId: item.serviceId ?? '', houseConfigId: item.houseConfigId ?? '',
      categoryId: item.categoryId ?? '', categoryServiceId: item.categoryServiceId ?? '',
      isActive: item.isActive,
      target: item.categoryId ? 'category' : 'service',
    });
    setIsFormOpen(true);
  };

  const handlePicture = async (file: File) => {
    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      setForm(prev => ({ ...prev, picture: url }));
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Only the selected target is sent; the other pair is cleared so the
      // backend does not reject the item for pointing at two things at once.
      const payload: PointStoreItemPayload = {
        name: form.name, nameAr: form.nameAr, nameFr: form.nameFr,
        description: form.description, descriptionAr: form.descriptionAr, descriptionFr: form.descriptionFr,
        picture: form.picture,
        pointCost: Number(form.pointCost),
        isActive: form.isActive,
        serviceId: form.target === 'service' ? form.serviceId || null : null,
        houseConfigId: form.target === 'service' ? form.houseConfigId || null : null,
        categoryId: form.target === 'category' ? form.categoryId || null : null,
        categoryServiceId: form.target === 'category' ? form.categoryServiceId || null : null,
      };

      if (editingId) {
        const updated = await pointsApi.store.update(editingId, payload);
        setItems(prev => prev.map(i => (i.id === editingId ? { ...i, ...updated } : i)));
        triggerToast('Reward updated');
      } else {
        const created = await pointsApi.store.create(payload);
        setItems(prev => [created, ...prev]);
        triggerToast('Reward added to the store');
      }
      setIsFormOpen(false);
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (item: ApiPointStoreItem) => {
    const used = item._count?.orders ?? 0;
    const message = used > 0
      ? `"${item.name}" was already redeemed ${used} time(s), so it will be disabled instead of deleted. Continue?`
      : `Delete "${item.name}" permanently?`;
    if (!confirm(message)) return;

    try {
      const result = await pointsApi.store.delete(item.id);
      if (result.deactivated) {
        setItems(prev => prev.map(i => (i.id === item.id ? { ...i, isActive: false } : i)));
        triggerToast('Reward disabled (it has redemptions)');
      } else {
        setItems(prev => prev.filter(i => i.id !== item.id));
        triggerToast('Reward deleted');
      }
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const toggleActive = async (item: ApiPointStoreItem) => {
    try {
      const updated = await pointsApi.store.update(item.id, {
        name: item.name, nameAr: item.nameAr, nameFr: item.nameFr,
        description: item.description, descriptionAr: item.descriptionAr, descriptionFr: item.descriptionFr,
        picture: item.picture, pointCost: item.pointCost,
        serviceId: item.serviceId, houseConfigId: item.houseConfigId,
        categoryId: item.categoryId, categoryServiceId: item.categoryServiceId,
        isActive: !item.isActive,
      });
      setItems(prev => prev.map(i => (i.id === item.id ? updated : i)));
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

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
    activeRewards: items.filter(i => i.isActive).length,
    holders: clients.filter(c => c.points > 0).length,
  }), [clients, items]);

  const filteredItems = items.filter(i =>
    i.name.toLowerCase().includes(searchStore.toLowerCase()) ||
    (i.service?.name || i.category?.name || '').toLowerCase().includes(searchStore.toLowerCase()),
  );

  const filteredClients = clients.filter(c => {
    const q = searchClient.toLowerCase();
    return c.fullName.toLowerCase().includes(q) || c.phone.includes(q) || c.email.toLowerCase().includes(q);
  });

  const selectedService = services.find(s => s.id === form.serviceId);
  const selectedCategory = categories.find(c => c.id === form.categoryId);

  // The viewer always shows the tab you are looking at, with the endpoint that
  // returns it — handy when wiring the mobile app against the same data.
  const jsonView = useMemo(() => {
    if (tab === 'store') return { label: 'GET /api/points/store', title: 'Point store JSON', data: items };
    if (tab === 'clients') return { label: 'GET /api/points/clients', title: 'Client balances JSON', data: clients };
    return { label: 'GET /api/points/transactions', title: 'Point history JSON', data: transactions };
  }, [tab, items, clients, transactions]);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(jsonView.data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const targetLabel = (item: ApiPointStoreItem) => {
    if (item.service) return `${item.service.name}${item.houseConfig ? ` · ${item.houseConfig.type}` : ''}`;
    if (item.category) return `${item.category.name}${item.categoryService ? ` · ${item.categoryService.name}` : ''}`;
    return '—';
  };

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
            Reward completed orders, run the point store, and follow every client balance.
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
          {tab === 'store' && (
            <button
              onClick={openCreate}
              className="px-6 py-4 bg-amber-500 text-white rounded-2xl font-black uppercase tracking-wider text-[10px] shadow-lg shadow-amber-500/20 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Plus size={15} />
              New Reward
            </button>
          )}
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
          { label: 'Points spent', val: fmt(stats.spent), icon: TrendingDown, color: 'text-violet-500 bg-violet-50 border-violet-100/50' },
          { label: 'Active rewards', val: stats.activeRewards, icon: Gift, color: 'text-emerald-500 bg-emerald-50 border-emerald-100/50' },
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
          {/* ── STORE ───────────────────────────────────────────────────────── */}
          {tab === 'store' && (
            <div className="space-y-6">
              <div className="relative max-w-md">
                <input
                  type="text"
                  placeholder="Search a reward or a service..."
                  value={searchStore}
                  onChange={e => setSearchStore(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl text-xs font-bold text-slate-800 focus:border-amber-200 outline-none transition-all font-inter"
                />
                <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>

              {filteredItems.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-[2.5rem] p-16 text-center space-y-4">
                  <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-400 mx-auto">
                    <Gift size={28} />
                  </div>
                  <p className="text-sm font-black uppercase tracking-wider text-slate-500">No reward yet</p>
                  <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto">
                    Add a reward to let clients exchange their points for a service in the mobile app.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredItems.map(item => (
                    <div
                      key={item.id}
                      className={`bg-white border rounded-[2rem] shadow-sm overflow-hidden flex flex-col ${item.isActive ? 'border-slate-100' : 'border-slate-100 opacity-60'}`}
                    >
                      <div className="h-36 bg-slate-50 relative">
                        {(item.picture || item.service?.picture || item.category?.picture) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={imgUrl(item.picture || item.service?.picture || item.category?.picture)}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Package size={32} />
                          </div>
                        )}
                        <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg">
                          <Coins size={11} />
                          {fmt(item.pointCost)} pts
                        </span>
                        {!item.isActive && (
                          <span className="absolute top-3 left-3 px-3 py-1.5 bg-slate-800 text-white rounded-xl text-[9px] font-black uppercase tracking-wider">
                            Disabled
                          </span>
                        )}
                      </div>

                      <div className="p-6 space-y-3 flex-1 flex flex-col">
                        <div className="space-y-1">
                          <h3 className="text-sm font-black uppercase tracking-tight text-slate-800">{item.name}</h3>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{targetLabel(item)}</p>
                        </div>
                        {item.description && (
                          <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">{item.description}</p>
                        )}

                        <div className="flex items-center gap-2 pt-2 mt-auto">
                          <button
                            onClick={() => toggleActive(item)}
                            className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer border ${
                              item.isActive
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                                : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'
                            }`}
                          >
                            {item.isActive ? 'Active' : 'Disabled'}
                          </button>
                          <button
                            onClick={() => openEdit(item)}
                            className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 flex items-center justify-center transition-all cursor-pointer border border-slate-100"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="w-10 h-10 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-500 flex items-center justify-center transition-all cursor-pointer border border-rose-100"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                        {(item._count?.orders ?? 0) > 0 && (
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">
                            Redeemed {item._count?.orders} time(s)
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
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
                        <td className="py-4 text-[11px] font-bold text-slate-500 max-w-[220px] truncate">
                          {tx.storeItem?.name || tx.reason || '—'}
                        </td>
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

      {/* ── Reward form modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !isSaving && setIsFormOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-[2.5rem] p-8 lg:p-10 shadow-2xl border border-slate-100 relative z-10 space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                    <Gift size={20} />
                  </div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-slate-800">
                    {editingId ? 'Edit reward' : 'New reward'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[9px] font-black uppercase text-slate-400 tracking-widest px-1">Name (EN) *</label>
                  <input
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Free deep clean"
                    className="w-full px-4 py-3.5 bg-slate-50 border border-transparent focus:border-amber-200 rounded-2xl outline-none focus:bg-white transition-all text-xs font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[9px] font-black uppercase text-slate-400 tracking-widest px-1">Cost in points *</label>
                  <input
                    required
                    type="number"
                    min={1}
                    step={1}
                    value={form.pointCost}
                    onChange={e => setForm({ ...form, pointCost: Number(e.target.value) })}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-transparent focus:border-amber-200 rounded-2xl outline-none focus:bg-white transition-all text-xs font-black"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[9px] font-black uppercase text-slate-400 tracking-widest px-1">Name (AR)</label>
                  <input
                    dir="rtl"
                    value={form.nameAr}
                    onChange={e => setForm({ ...form, nameAr: e.target.value })}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-transparent focus:border-amber-200 rounded-2xl outline-none focus:bg-white transition-all text-xs font-bold font-cairo"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[9px] font-black uppercase text-slate-400 tracking-widest px-1">Name (FR)</label>
                  <input
                    value={form.nameFr}
                    onChange={e => setForm({ ...form, nameFr: e.target.value })}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-transparent focus:border-amber-200 rounded-2xl outline-none focus:bg-white transition-all text-xs font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[9px] font-black uppercase text-slate-400 tracking-widest px-1">Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-transparent focus:border-amber-200 rounded-2xl outline-none focus:bg-white transition-all text-xs font-bold resize-none"
                />
              </div>

              {/* What the client actually gets */}
              <div className="space-y-4 border border-slate-100 rounded-3xl p-5 bg-slate-50/50">
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">What the client receives *</p>
                <div className="flex p-1 bg-white rounded-xl gap-1 w-fit border border-slate-100">
                  {(['service', 'category'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, target: t })}
                      className={`px-4 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer transition-all ${
                        form.target === t ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {t === 'service' ? 'Service' : 'Category'}
                    </button>
                  ))}
                </div>

                {form.target === 'service' ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <select
                      required
                      value={form.serviceId ?? ''}
                      onChange={e => setForm({ ...form, serviceId: e.target.value, houseConfigId: '' })}
                      className="w-full px-4 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none text-xs font-bold cursor-pointer"
                    >
                      <option value="">Select a service…</option>
                      {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <select
                      required
                      value={form.houseConfigId ?? ''}
                      onChange={e => setForm({ ...form, houseConfigId: e.target.value })}
                      disabled={!selectedService}
                      className="w-full px-4 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none text-xs font-bold cursor-pointer disabled:opacity-50"
                    >
                      <option value="">Select the house type…</option>
                      {selectedService?.houseConfigs.map(hc => (
                        <option key={hc.id} value={hc.id}>{hc.type} — {fmt(hc.basePrice)} DA</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <select
                      required
                      value={form.categoryId ?? ''}
                      onChange={e => setForm({ ...form, categoryId: e.target.value, categoryServiceId: '' })}
                      className="w-full px-4 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none text-xs font-bold cursor-pointer"
                    >
                      <option value="">Select a category…</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select
                      required
                      value={form.categoryServiceId ?? ''}
                      onChange={e => setForm({ ...form, categoryServiceId: e.target.value })}
                      disabled={!selectedCategory}
                      className="w-full px-4 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none text-xs font-bold cursor-pointer disabled:opacity-50"
                    >
                      <option value="">Select the option…</option>
                      {selectedCategory?.categoryServices.map(cs => (
                        <option key={cs.id} value={cs.id}>{cs.name} — {fmt(cs.basePrice)} DA</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Picture */}
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                  {form.picture ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imgUrl(form.picture)} alt="Reward" className="w-full h-full object-cover" />
                  ) : (
                    <Package size={22} className="text-slate-300" />
                  )}
                </div>
                <div className="space-y-2">
                  <label className="px-5 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl text-[9px] font-black uppercase tracking-wider text-slate-500 cursor-pointer inline-flex items-center gap-2 transition-all">
                    <Upload size={13} />
                    {isUploading ? 'Uploading…' : 'Upload picture'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) handlePicture(f); }}
                    />
                  </label>
                  <p className="text-[10px] font-bold text-slate-400">Optional — the service picture is used when empty.</p>
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={e => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                />
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Visible in the mobile app store
                </span>
              </label>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  disabled={isSaving}
                  className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black uppercase tracking-wider text-[10px] transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isUploading}
                  className="flex-1 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black uppercase tracking-wider text-[10px] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      {editingId ? 'Save changes' : 'Create reward'}
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

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
                  <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">
                    {jsonView.title}
                  </h2>
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

              {/* Adjustment */}
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
                          <p className="text-xs font-bold text-slate-700 truncate">{tx.storeItem?.name || tx.reason || '—'}</p>
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
