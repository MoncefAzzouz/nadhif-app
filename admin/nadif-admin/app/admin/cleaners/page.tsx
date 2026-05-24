'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCheck, Plus, Search, Trash2, Pencil, Sparkles, CheckCircle, 
  Mail, Phone, Award, X, Briefcase, TrendingUp, RefreshCw, AlertCircle, Save
} from 'lucide-react';
import { cleanersApi, type ApiCleaner } from '../../lib/api';

export default function CleanersManager() {
  const [cleaners, setCleaners] = useState<ApiCleaner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'true' | 'false'>('all'); // Based on isActive
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCleaner, setEditingCleaner] = useState<ApiCleaner | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState({
    fullName: '',
    phone: '',
    bio: '',
    isActive: true,
  });

  const fetchCleaners = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await cleanersApi.getAll();
      setCleaners(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load cleaners');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCleaners();
  }, [fetchCleaners]);

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleCreateCleaner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.fullName || !createForm.phone) return;

    try {
      const newCleaner = await cleanersApi.create(createForm);
      setCleaners(prev => [newCleaner, ...prev]);
      setIsAddOpen(false);
      setCreateForm({ fullName: '', phone: '', bio: '', isActive: true });
      triggerToast(`Cleaner agent ${newCleaner.fullName} registered successfully!`);
    } catch (err: any) {
      alert(`Create failed: ${err.message}`);
    }
  };

  const handleUpdateCleaner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCleaner) return;

    try {
      const updated = await cleanersApi.update(editingCleaner.id, {
        fullName: editingCleaner.fullName,
        phone: editingCleaner.phone,
        bio: editingCleaner.bio,
        isActive: editingCleaner.isActive,
      });
      setCleaners(prev => prev.map(c => c.id === editingCleaner.id ? updated : c));
      setEditingCleaner(null);
      triggerToast(`Cleaner details updated for ${editingCleaner.fullName}!`);
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const handleDeleteCleaner = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to permanently delete cleaner specialist: ${name}?`)) {
      try {
        await cleanersApi.delete(id);
        setCleaners(prev => prev.filter(c => c.id !== id));
        triggerToast(`Cleaner ${name} removed from roster.`);
      } catch (err: any) {
        alert(`Delete failed: ${err.message}`);
      }
    }
  };

  const handleStatusChange = async (id: string, isActive: boolean) => {
    try {
      const updated = await cleanersApi.update(id, { isActive });
      setCleaners(prev => prev.map(c => c.id === id ? updated : c));
      triggerToast(`Cleaner status updated!`);
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const filteredCleaners = cleaners.filter(c => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      c.fullName.toLowerCase().includes(searchLower) ||
      c.phone.includes(searchLower);
    
    const matchesStatus = statusFilter === 'all' 
      ? true 
      : statusFilter === 'true' ? c.isActive : !c.isActive;

    return matchesSearch && matchesStatus;
  });

  const totalCleaners = cleaners.length;
  const countAvailable = cleaners.filter(c => c.isActive).length;
  const countInactive = cleaners.filter(c => !c.isActive).length;

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
            <UserCheck size={14} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Cleaning Specialists</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-800 uppercase italic">
            Cleaner <span className="text-primary">Workers</span>
          </h1>
          <p className="text-sm text-slate-400 font-medium font-inter">
            Provision professional cleaning agents, update their profiles, and adjust dispatch states.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchCleaners}
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
            Register Cleaner
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 rounded-3xl p-6 flex items-center gap-4">
          <AlertCircle size={20} className="text-rose-500 shrink-0" />
          <p className="text-sm font-bold text-rose-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: "Total Workers", val: totalCleaners, icon: Briefcase, color: "text-blue-500 bg-blue-50 border-blue-100/50" },
          { label: "Actif / Available", val: countAvailable, icon: CheckCircle, color: "text-emerald-500 bg-emerald-50 border-emerald-100/50" },
          { label: "Inactif", val: countInactive, icon: TrendingUp, color: "text-rose-500 bg-rose-50 border-rose-100/50" }
        ].map((card, idx) => (
          <div key={idx} className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{card.label}</p>
              <h3 className="text-2xl font-black text-slate-800 leading-none">{card.val}</h3>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${card.color}`}>
              <card.icon size={20} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all font-inter"
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
             <p className="text-xs font-bold uppercase tracking-widest text-slate-400 animate-pulse">Loading API Data...</p>
           </div>
        ) : filteredCleaners.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-[2rem] space-y-3">
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-3xl flex items-center justify-center mx-auto text-xl font-bold">🧹</div>
            <h4 className="text-sm font-black uppercase text-slate-700">No Cleaners Found</h4>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[2rem] border border-slate-50">
            <table className="w-full border-collapse text-left min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 bg-slate-50/50">
                  <th className="py-4 pl-6">Cleaner</th>
                  <th className="py-4">Contact</th>
                  <th className="py-4">Rating</th>
                  <th className="py-4">Status</th>
                  <th className="py-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700">
                {filteredCleaners.map((cleaner) => {
                  const initials = cleaner.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                  return (
                    <tr key={cleaner.id} className="hover:bg-slate-50/40 transition-colors font-semibold">
                      <td className="py-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-sm">
                            {initials}
                          </div>
                          <div>
                            <span className="text-xs font-black text-slate-800">{cleaner.fullName}</span>
                            <p className="text-[9px] font-mono text-slate-400 font-bold uppercase">{cleaner.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-xs font-inter font-bold">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Phone size={10} className="text-slate-400" />
                          <span className="font-mono text-[10px]">{cleaner.phone}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-1.5 text-xs text-amber-500 font-inter font-black">
                          <Award size={13} className="text-amber-400" />
                          <span>{cleaner.rating} / 5</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <select
                          value={cleaner.isActive ? 'true' : 'false'}
                          onChange={(e) => handleStatusChange(cleaner.id, e.target.value === 'true')}
                          className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider outline-none border cursor-pointer transition-all ${
                            cleaner.isActive
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
                            onClick={() => setEditingCleaner(cleaner)}
                            className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100 text-slate-400 flex items-center justify-center transition-all cursor-pointer"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteCleaner(cleaner.id, cleaner.fullName)}
                            className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-rose-50 hover:text-rose-600 border border-slate-100 text-rose-400 flex items-center justify-center transition-all cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
              <button onClick={() => setIsAddOpen(false)} className="absolute right-6 top-6 w-9 h-9 rounded-xl border border-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer">
                <X size={15} />
              </button>
              <div className="space-y-1.5 pr-8">
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-800 flex items-center gap-2">
                  <Plus size={20} className="text-primary" /> Provision Cleaner
                </h3>
              </div>
              <form onSubmit={handleCreateCleaner} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Full Name</label>
                    <input type="text" required value={createForm.fullName} onChange={(e) => setCreateForm({...createForm, fullName: e.target.value})} className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl text-xs font-bold text-slate-800" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Phone Number</label>
                    <input type="tel" required value={createForm.phone} onChange={(e) => setCreateForm({...createForm, phone: e.target.value})} className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl text-xs font-bold text-slate-800 font-mono" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Bio / Description</label>
                    <textarea rows={3} value={createForm.bio} onChange={(e) => setCreateForm({...createForm, bio: e.target.value})} className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl text-xs font-bold text-slate-800 resize-none" />
                  </div>
                </div>
                <div className="pt-4">
                  <button type="submit" className="w-full py-4.5 bg-primary text-white rounded-2xl font-black uppercase tracking-wider text-[10px] shadow-xl flex items-center justify-center gap-2 cursor-pointer">
                    Deploy Cleaner
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {editingCleaner && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border border-slate-100 rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl space-y-6 relative overflow-hidden"
            >
              <button onClick={() => setEditingCleaner(null)} className="absolute right-6 top-6 w-9 h-9 rounded-xl border border-slate-100 text-slate-400 flex items-center justify-center cursor-pointer">
                <X size={15} />
              </button>
              <div className="space-y-1.5 pr-8">
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-800">Modify Worker</h3>
              </div>
              <form onSubmit={handleUpdateCleaner} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Full Name</label>
                    <input type="text" required value={editingCleaner.fullName} onChange={(e) => setEditingCleaner({...editingCleaner, fullName: e.target.value})} className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl text-xs font-bold" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Phone Number</label>
                    <input type="tel" required value={editingCleaner.phone} onChange={(e) => setEditingCleaner({...editingCleaner, phone: e.target.value})} className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl text-xs font-bold font-mono" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Bio</label>
                    <textarea rows={3} value={editingCleaner.bio || ''} onChange={(e) => setEditingCleaner({...editingCleaner, bio: e.target.value})} className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl text-xs font-bold resize-none" />
                  </div>
                </div>
                <div className="pt-4 flex gap-4">
                  <button type="button" onClick={() => setEditingCleaner(null)} className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-2xl font-black uppercase text-[10px] cursor-pointer">Cancel</button>
                  <button type="submit" className="flex-1 py-4 bg-primary text-white rounded-2xl font-black uppercase text-[10px] shadow-lg flex justify-center gap-2 cursor-pointer"><Save size={14} /> Save</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
