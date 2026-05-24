'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Trash2, Pencil, CheckCircle, 
  Tag, Percent, X, AlertCircle, Save, RefreshCw, Ticket, Clock, Check
} from 'lucide-react';
import { promosApi, type ApiPromo } from '../../lib/api';

export default function PromoCodesPage() {
  const [promos, setPromos] = useState<ApiPromo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'true' | 'false'>('all'); // Based on isActive
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<ApiPromo | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState({
    code: '',
    discountPercent: 0,
    validFrom: '',
    validUntil: '',
    isActive: true,
  });

  const fetchPromos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await promosApi.getAll();
      setPromos(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load promo codes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromos();
  }, [fetchPromos]);

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.code || createForm.discountPercent <= 0 || !createForm.validFrom || !createForm.validUntil) return;

    try {
      const newPromo = await promosApi.create({
        code: createForm.code.toUpperCase(),
        discountPercent: Number(createForm.discountPercent),
        validFrom: createForm.validFrom,
        validUntil: createForm.validUntil,
        isActive: createForm.isActive,
      });
      setPromos(prev => [newPromo, ...prev]);
      setIsAddOpen(false);
      setCreateForm({ code: '', discountPercent: 0, validFrom: '', validUntil: '', isActive: true });
      triggerToast(`Promo ${newPromo.code} created successfully!`);
    } catch (err: any) {
      alert(`Create failed: ${err.message}`);
    }
  };

  const handleUpdatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPromo) return;

    try {
      const updated = await promosApi.update(editingPromo.id, {
        code: editingPromo.code,
        discountPercent: Number(editingPromo.discountPercent),
        validFrom: editingPromo.validFrom,
        validUntil: editingPromo.validUntil,
        isActive: editingPromo.isActive,
      });
      setPromos(prev => prev.map(p => p.id === editingPromo.id ? updated : p));
      setEditingPromo(null);
      triggerToast(`Promo ${editingPromo.code} updated!`);
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const handleDeletePromo = async (id: string, code: string) => {
    if (confirm(`Are you sure you want to permanently delete code: ${code}?`)) {
      try {
        await promosApi.delete(id);
        setPromos(prev => prev.filter(p => p.id !== id));
        triggerToast(`Code ${code} deleted.`);
      } catch (err: any) {
        alert(`Delete failed: ${err.message}`);
      }
    }
  };

  const handleStatusChange = async (id: string, isActive: boolean) => {
    try {
      const updated = await promosApi.update(id, { isActive });
      setPromos(prev => prev.map(p => p.id === id ? updated : p));
      triggerToast(`Promo status updated!`);
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const filteredPromos = promos.filter(p => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = p.code.toLowerCase().includes(searchLower);
    
    const matchesStatus = statusFilter === 'all' 
      ? true 
      : statusFilter === 'true' ? p.isActive : !p.isActive;

    return matchesSearch && matchesStatus;
  });

  const totalCodes = promos.length;
  const countActive = promos.filter(p => p.isActive).length;

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

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
            <Tag size={14} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Marketing Engine</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-800 uppercase italic">
            Promo <span className="text-primary">Codes</span>
          </h1>
          <p className="text-sm text-slate-400 font-medium font-inter">
            Create discount vouchers, configure pricing rules, and control activation statuses.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchPromos}
            disabled={isLoading}
            className="px-5 py-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-wider text-slate-500 hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-6 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-wider text-[10px] shadow-lg shadow-primary/20 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Plus size={15} />
            Generate Code
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 rounded-3xl p-6 flex items-center gap-4">
          <AlertCircle size={20} className="text-rose-500 shrink-0" />
          <p className="text-sm font-bold text-rose-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[
          { label: "Total Generated", val: totalCodes, icon: Ticket, color: "text-indigo-500 bg-indigo-50 border-indigo-100/50" },
          { label: "Currently Active", val: countActive, icon: Check, color: "text-emerald-500 bg-emerald-50 border-emerald-100/50" }
        ].map((card, idx) => (
          <div key={idx} className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{card.label}</p>
              <h3 className="text-3xl font-black text-slate-800 leading-none">{card.val}</h3>
            </div>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${card.color}`}>
              <card.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by code (e.g. SUMMER50)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all font-inter uppercase"
            />
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="flex p-1 bg-slate-100 rounded-xl gap-1 shrink-0">
            {[
              { id: 'all', label: 'Tous' },
              { id: 'true', label: 'Actif' },
              { id: 'false', label: 'Inactif' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-4 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer transition-all ${
                  statusFilter === tab.id
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
           <div className="min-h-[25vh] flex flex-col items-center justify-center gap-4">
             <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
             <p className="text-xs font-bold uppercase tracking-widest text-slate-400 animate-pulse">Fetching Promos...</p>
           </div>
        ) : filteredPromos.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-[2rem] space-y-3">
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-3xl flex items-center justify-center mx-auto text-xl font-bold">🏷️</div>
            <h4 className="text-sm font-black uppercase text-slate-700">No Promos Found</h4>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[2rem] border border-slate-50">
            <table className="w-full border-collapse text-left min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 bg-slate-50/50">
                  <th className="py-4 pl-6">Code / ID</th>
                  <th className="py-4">Discount</th>
                  <th className="py-4">Created</th>
                  <th className="py-4">Status</th>
                  <th className="py-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700">
                {filteredPromos.map((promo) => (
                  <tr key={promo.id} className="hover:bg-slate-50/40 transition-colors font-semibold">
                    <td className="py-4 pl-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-black text-slate-800 uppercase tracking-widest bg-slate-100 w-max px-2 py-0.5 rounded border border-slate-200">
                          {promo.code}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400">{promo.id.slice(0,8)}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-1.5 text-xs font-black text-primary bg-primary/5 w-max px-3 py-1 rounded-full border border-primary/10">
                        <Percent size={11} />
                        {promo.discountPercent}%
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-inter">
                        <Clock size={11} className="text-slate-400" />
                        <div className="flex flex-col gap-0.5">
                          <span>{promo.createdAt ? new Date(promo.createdAt).toLocaleDateString() : 'N/A'}</span>
                          <span className="text-[9px] text-slate-400 font-mono">
                            Valid: {promo.validFrom ? new Date(promo.validFrom).toLocaleDateString() : 'N/A'} - {promo.validUntil ? new Date(promo.validUntil).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <select
                        value={promo.isActive ? 'true' : 'false'}
                        onChange={(e) => handleStatusChange(promo.id, e.target.value === 'true')}
                        className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider outline-none border cursor-pointer transition-all ${
                          promo.isActive
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        <option value="true">🟢 Actif</option>
                        <option value="false">🔴 Inactif</option>
                      </select>
                    </td>
                    <td className="py-4 pr-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingPromo(promo)}
                          className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100 text-slate-400 flex items-center justify-center transition-all cursor-pointer"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => handleDeletePromo(promo.id, promo.code)}
                          className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-rose-50 hover:text-rose-600 border border-slate-100 text-rose-400 flex items-center justify-center transition-all cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border border-slate-100 rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl space-y-6 relative overflow-hidden"
            >
              <button onClick={() => setIsAddOpen(false)} className="absolute right-6 top-6 w-9 h-9 rounded-xl border border-slate-100 text-slate-400 flex items-center justify-center cursor-pointer">
                <X size={15} />
              </button>
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-800 flex items-center gap-2">
                <Tag size={20} className="text-primary" /> Create Promo
              </h3>
              <form onSubmit={handleCreatePromo} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Code String</label>
                    <input type="text" required value={createForm.code} onChange={(e) => setCreateForm({...createForm, code: e.target.value.toUpperCase()})} className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-800" placeholder="e.g. SUMMER2026" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Discount (%)</label>
                      <input type="number" min="1" max="100" step="1" required value={createForm.discountPercent || ''} onChange={(e) => setCreateForm({...createForm, discountPercent: Number(e.target.value)})} className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl text-xs font-bold text-slate-800 font-mono" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Valid From</label>
                      <input type="date" required value={createForm.validFrom} onChange={(e) => setCreateForm({...createForm, validFrom: e.target.value})} className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl text-xs font-bold text-slate-800 font-mono" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Valid Until</label>
                      <input type="date" required value={createForm.validUntil} onChange={(e) => setCreateForm({...createForm, validUntil: e.target.value})} className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl text-xs font-bold text-slate-800 font-mono" />
                    </div>
                  </div>
                </div>
                <div className="pt-4">
                  <button type="submit" className="w-full py-4.5 bg-primary text-white rounded-2xl font-black uppercase tracking-wider text-[10px] shadow-xl flex items-center justify-center gap-2 cursor-pointer">
                    Generate Promo
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {editingPromo && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border border-slate-100 rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl space-y-6 relative overflow-hidden"
            >
              <button onClick={() => setEditingPromo(null)} className="absolute right-6 top-6 w-9 h-9 rounded-xl border border-slate-100 text-slate-400 flex items-center justify-center cursor-pointer">
                <X size={15} />
              </button>
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-800">Edit Code</h3>
              <form onSubmit={handleUpdatePromo} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Code</label>
                    <input type="text" required value={editingPromo.code} onChange={(e) => setEditingPromo({...editingPromo, code: e.target.value.toUpperCase()})} className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-800" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Discount (%)</label>
                      <input type="number" min="1" max="100" step="1" required value={editingPromo.discountPercent} onChange={(e) => setEditingPromo({...editingPromo, discountPercent: Number(e.target.value)})} className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl text-xs font-bold text-slate-800 font-mono" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Valid From</label>
                      <input type="date" required value={editingPromo.validFrom.split('T')[0]} onChange={(e) => setEditingPromo({...editingPromo, validFrom: e.target.value})} className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl text-xs font-bold text-slate-800 font-mono" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Valid Until</label>
                      <input type="date" required value={editingPromo.validUntil.split('T')[0]} onChange={(e) => setEditingPromo({...editingPromo, validUntil: e.target.value})} className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl text-xs font-bold text-slate-800 font-mono" />
                    </div>
                  </div>
                </div>
                <div className="pt-4 flex gap-4">
                  <button type="button" onClick={() => setEditingPromo(null)} className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-2xl font-black uppercase text-[10px] cursor-pointer">Cancel</button>
                  <button type="submit" className="flex-1 py-4 bg-primary text-white rounded-2xl font-black uppercase text-[10px] shadow-lg flex justify-center gap-2 cursor-pointer"><Save size={14} /> Update</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
