'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Ticket, 
  Search, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Trash2, 
  Eye, 
  Pencil, 
  Plus, 
  X, 
  ChevronDown, 
  Save, 
  Sparkles, 
  Percent, 
  DollarSign,
  TrendingUp
} from 'lucide-react';

interface PromoCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  usageLimit: number;
  usageCount: number;
  expiryDate: string;
  status: 'active' | 'expired' | 'inactive';
  description: string;
  createdAt: string;
}

const DEFAULT_PROMOS: PromoCode[] = [
  {
    id: 'PRM-001',
    code: 'WELCOME20',
    discountType: 'percentage',
    discountValue: 20,
    usageLimit: 200,
    usageCount: 45,
    expiryDate: '2026-08-31',
    status: 'active',
    description: 'Welcome promotion offering 20% discount on first maintenance checkouts.',
    createdAt: '2026-05-10T08:00:00Z'
  },
  {
    id: 'PRM-002',
    code: 'FIRSTCLEAN',
    discountType: 'fixed',
    discountValue: 1500,
    usageLimit: 100,
    usageCount: 88,
    expiryDate: '2026-06-30',
    status: 'active',
    description: 'Flat rate 1,500 DA reduction for newly registered cleaning app users.',
    createdAt: '2026-05-12T10:15:00Z'
  },
  {
    id: 'PRM-003',
    code: 'RAMADAN2026',
    discountType: 'percentage',
    discountValue: 25,
    usageLimit: 150,
    usageCount: 150,
    expiryDate: '2026-04-15',
    status: 'expired',
    description: 'Exclusive Ramadan holy month promotional clean discount package.',
    createdAt: '2026-03-01T06:00:00Z'
  },
  {
    id: 'PRM-004',
    code: 'ELITE10',
    discountType: 'percentage',
    discountValue: 10,
    usageLimit: 50,
    usageCount: 0,
    expiryDate: '2026-12-31',
    status: 'inactive',
    description: 'Premium customer referral program code for loyal VIP members.',
    createdAt: '2026-05-15T14:30:00Z'
  }
];

export default function PromoCodesPage() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'inactive'>('all');
  
  // Dialog Modal states
  const [selectedPromo, setSelectedPromo] = useState<PromoCode | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [promoToDelete, setPromoToDelete] = useState<PromoCode | null>(null);

  // Form states
  const [editForm, setEditForm] = useState<PromoCode | null>(null);
  const [addForm, setAddForm] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 10,
    usageLimit: 100,
    expiryDate: '',
    status: 'active' as 'active' | 'expired' | 'inactive',
    description: ''
  });

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('nadif_promos');
    if (stored) {
      try {
        setPromos(JSON.parse(stored));
      } catch (e) {
        setPromos(DEFAULT_PROMOS);
      }
    } else {
      localStorage.setItem('nadif_promos', JSON.stringify(DEFAULT_PROMOS));
      setPromos(DEFAULT_PROMOS);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('nadif_promos', JSON.stringify(promos));
    }
  }, [promos, isLoaded]);

  // Open Edit Modal
  const handleOpenEdit = (promo: PromoCode, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditForm({ ...promo });
    setIsEditModalOpen(true);
  };

  // Open Delete Modal
  const handleOpenDelete = (promo: PromoCode, e: React.MouseEvent) => {
    e.stopPropagation();
    setPromoToDelete(promo);
    setIsDeleteModalOpen(true);
  };

  // Delete Confirm
  const handleDeleteConfirm = () => {
    if (promoToDelete) {
      setPromos(prev => prev.filter(p => p.id !== promoToDelete.id));
      setIsDeleteModalOpen(false);
      setPromoToDelete(null);
    }
  };

  // Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editForm) {
      // Validate code formatting (uppercase)
      const formattedForm = {
        ...editForm,
        code: editForm.code.toUpperCase().trim()
      };
      setPromos(prev => prev.map(p => p.id === formattedForm.id ? formattedForm : p));
      setIsEditModalOpen(false);
      setEditForm(null);
    }
  };

  // Save Add
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPromo: PromoCode = {
      id: `PRM-${Math.floor(100 + Math.random() * 900)}`,
      code: addForm.code.toUpperCase().trim(),
      discountType: addForm.discountType,
      discountValue: Number(addForm.discountValue),
      usageLimit: Number(addForm.usageLimit),
      usageCount: 0,
      expiryDate: addForm.expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: addForm.status,
      description: addForm.description,
      createdAt: new Date().toISOString()
    };

    setPromos(prev => [newPromo, ...prev]);
    setIsAddModalOpen(false);
    // Reset form
    setAddForm({
      code: '',
      discountType: 'percentage',
      discountValue: 10,
      usageLimit: 100,
      expiryDate: '',
      status: 'active',
      description: ''
    });
  };

  // Quick switch status
  const handleQuickStatusSwitch = (id: string, newStatus: 'active' | 'expired' | 'inactive') => {
    setPromos(prev => prev.map(p => 
      p.id === id ? { ...p, status: newStatus } : p
    ));
  };

  // Stats
  const totalPromos = promos.length;
  const activePromos = promos.filter(p => p.status === 'active').length;
  const expiredPromos = promos.filter(p => p.status === 'expired').length;
  const totalUsages = promos.reduce((sum, p) => sum + p.usageCount, 0);

  // Filter & Search
  const filteredPromos = promos.filter(p => {
    const matchesSearch = 
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-10 font-gilmer max-w-7xl mx-auto animate-fadeIn">
      {/* 1. Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
            <Ticket size={14} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Marketing Panel</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-800 uppercase italic">
            Promo <span className="text-primary">Codes</span> Manager
          </h1>
          <p className="text-sm text-slate-400 font-medium font-inter">
            Deploy dynamic discount vouchers, configure flat rate or percentage reductions, track real-time campaign usage, and manage active periods.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-6 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-wider text-[10px] shadow-lg shadow-primary/20 hover:scale-102 active:scale-98 transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus size={14} />
          Create Promo Code
        </button>
      </div>

      {/* 2. Metrics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Codes */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm relative overflow-hidden flex flex-col justify-between">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Vouchers</p>
          <p className="text-3xl font-black text-slate-800 mt-2">{totalPromos}</p>
          <div className="absolute top-4 right-4 w-2 h-2 bg-slate-400 rounded-full" />
        </div>

        {/* Active Codes */}
        <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-3xl shadow-sm relative overflow-hidden flex flex-col justify-between">
          <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Active Campaign</p>
          <p className="text-3xl font-black text-emerald-600 mt-2">{activePromos}</p>
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full absolute top-4 right-4 animate-pulse" />
        </div>

        {/* Total usages */}
        <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-3xl shadow-sm relative overflow-hidden flex flex-col justify-between">
          <p className="text-[9px] font-black uppercase tracking-widest text-blue-500">Total Redemptions</p>
          <p className="text-3xl font-black text-blue-600 mt-2">{totalUsages}</p>
          <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full" />
        </div>

        {/* Expired Codes */}
        <div className="bg-rose-50/50 border border-rose-100 p-6 rounded-3xl shadow-sm relative overflow-hidden flex flex-col justify-between">
          <p className="text-[9px] font-black uppercase tracking-widest text-rose-500">Expired promos</p>
          <p className="text-3xl font-black text-rose-600 mt-2">{expiredPromos}</p>
          <div className="absolute top-4 right-4 w-2 h-2 bg-rose-500 rounded-full" />
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        {/* Search */}
        <div className="relative w-full md:max-w-sm group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input 
            type="text"
            placeholder="Search by code or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-sm font-bold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-primary/20 outline-none transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto shrink-0 justify-end">
          {[
            { id: 'all', label: 'All Campaign' },
            { id: 'active', label: 'Active' },
            { id: 'expired', label: 'Expired' },
            { id: 'inactive', label: 'Inactive' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border ${
                statusFilter === tab.id 
                  ? 'bg-primary text-white border-primary shadow-md shadow-primary/10' 
                  : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100 hover:text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Promo Code Table */}
      {!isLoaded ? (
        <div className="min-h-[30vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredPromos.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-100 rounded-[3rem] shadow-sm max-w-xl mx-auto space-y-6">
          <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center text-primary mx-auto">
            <Ticket size={36} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black uppercase tracking-tight text-slate-800">No Promos Found</h3>
            <p className="text-sm text-slate-400 font-semibold max-w-xs mx-auto">
              {searchQuery ? "No promo codes matching your search query." : "Inject new discount codes to trigger high conversion checkouts."}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left min-w-[1000px]">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                  <th className="pb-4 pl-4">Promo Code</th>
                  <th className="pb-4">Reduction Scope</th>
                  <th className="pb-4">Campaign Usages</th>
                  <th className="pb-4">Expiration Limit</th>
                  <th className="pb-4">Statut</th>
                  <th className="pb-4 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence mode="popLayout">
                  {filteredPromos.map((promo) => {
                    const usagePercent = Math.min(100, Math.round((promo.usageCount / promo.usageLimit) * 100));
                    return (
                      <motion.tr
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={promo.id}
                        className="group hover:bg-slate-50/50 transition-colors font-semibold"
                      >
                        {/* Promo Code code */}
                        <td className="py-5 pl-4">
                          <span className="font-mono text-sm font-black bg-slate-100 text-slate-800 px-3 py-1.5 rounded-xl uppercase tracking-wider border border-slate-200/50">
                            {promo.code}
                          </span>
                        </td>

                        {/* Reduction */}
                        <td className="py-5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase ${
                            promo.discountType === 'percentage' 
                              ? 'bg-amber-50 text-amber-600 border border-amber-100/50' 
                              : 'bg-emerald-50 text-emerald-600 border border-emerald-100/50'
                          }`}>
                            {promo.discountType === 'percentage' ? (
                              <>
                                <Percent size={12} />
                                {promo.discountValue}% Off
                              </>
                            ) : (
                              <>
                                <DollarSign size={12} />
                                {promo.discountValue} DA Off
                              </>
                            )}
                          </span>
                        </td>

                        {/* Usages */}
                        <td className="py-5">
                          <div className="space-y-1.5 max-w-[150px]">
                            <div className="flex justify-between text-[10px] font-black text-slate-500">
                              <span>{promo.usageCount} / {promo.usageLimit} uses</span>
                              <span>{usagePercent}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  usagePercent >= 100 
                                    ? 'bg-rose-500' 
                                    : usagePercent >= 75 
                                      ? 'bg-amber-500' 
                                      : 'bg-primary'
                                }`}
                                style={{ width: `${usagePercent}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Expire Date */}
                        <td className="py-5 text-xs text-slate-600 font-inter font-bold">
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar size={12} className="text-slate-400" />
                            {promo.expiryDate}
                          </span>
                        </td>

                        {/* Statut Status drop picker */}
                        <td className="py-5">
                          <div className="relative inline-block text-left">
                            <select
                              value={promo.status}
                              onChange={(e) => handleQuickStatusSwitch(promo.id, e.target.value as any)}
                              className={`pl-3 pr-8 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest outline-none border cursor-pointer appearance-none ${
                                promo.status === 'active' && 'bg-emerald-50 text-emerald-600 border-emerald-100'
                              } ${
                                promo.status === 'expired' && 'bg-rose-50 text-rose-600 border-rose-100'
                              } ${
                                promo.status === 'inactive' && 'bg-slate-100 text-slate-500 border-slate-200'
                              }`}
                            >
                              <option value="active">🟢 Active</option>
                              <option value="expired">🔴 Expired</option>
                              <option value="inactive">⚫ Inactive</option>
                            </select>
                            <ChevronDown size={10} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-70" />
                          </div>
                        </td>

                        {/* Actions Detail and Modifier */}
                        <td className="py-5 pr-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedPromo(promo);
                                setIsDetailsModalOpen(true);
                              }}
                              className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-primary/10 hover:text-primary text-slate-500 flex items-center justify-center border border-slate-100 transition-all cursor-pointer"
                              title="Inspect Promo Details"
                            >
                              <Eye size={13} />
                            </button>
                            <button
                              onClick={(e) => handleOpenEdit(promo, e)}
                              className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-amber-50 hover:text-amber-600 text-slate-500 flex items-center justify-center border border-slate-100 transition-all cursor-pointer"
                              title="Modifier (Edit) Promo"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={(e) => handleOpenDelete(promo, e)}
                              className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-400 border border-slate-100 flex items-center justify-center transition-all cursor-pointer"
                              title="Delete Promo Code"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. DETAILS MODAL */}
      <AnimatePresence>
        {isDetailsModalOpen && selectedPromo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDetailsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-[500px] bg-white rounded-[3rem] shadow-2xl border border-slate-100 relative z-10 overflow-hidden flex flex-col"
            >
              <div className="h-2 bg-gradient-to-r from-primary to-amber-500 shrink-0" />

              <button 
                onClick={() => setIsDetailsModalOpen(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-100 transition-all cursor-pointer z-20"
              >
                <X size={18} />
              </button>

              <div className="p-8 lg:p-10 space-y-8">
                {/* Header */}
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{selectedPromo.id}</span>
                    <h2 className="text-2xl font-black uppercase tracking-tight text-slate-800 font-mono">
                      {selectedPromo.code}
                    </h2>
                    <p className="text-xs text-slate-400 font-semibold font-inter">
                      Created on {new Date(selectedPromo.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mt-1 inline-flex items-center gap-1.5 ${
                    selectedPromo.status === 'active' && 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  } ${
                    selectedPromo.status === 'expired' && 'bg-rose-50 text-rose-600 border border-rose-100'
                  } ${
                    selectedPromo.status === 'inactive' && 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      selectedPromo.status === 'active' && 'bg-emerald-500 animate-pulse'
                    } ${
                      selectedPromo.status === 'expired' && 'bg-rose-500'
                    } ${
                      selectedPromo.status === 'inactive' && 'bg-slate-500'
                    }`} />
                    {selectedPromo.status}
                  </span>
                </div>

                {/* Description */}
                <div className="space-y-2 border border-slate-100 rounded-3xl p-6 bg-slate-50/50">
                  <span className="text-slate-400 block text-[9px] font-black uppercase">Promotion Scope & Terms</span>
                  <p className="text-xs font-semibold text-slate-700 leading-relaxed font-inter">
                    {selectedPromo.description || "No specific promotional guidelines set."}
                  </p>
                </div>

                {/* Reduction Details */}
                <div className="space-y-4 border border-slate-100 rounded-3xl p-6 bg-slate-50/50">
                  <h3 className="text-xs font-black uppercase text-slate-800 border-b border-slate-100 pb-2">
                    Voucher Performance Specs
                  </h3>

                  <div className="divide-y divide-slate-100 text-xs font-semibold space-y-2.5">
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Discount Reduction Value:</span>
                      <span className="text-primary font-black text-sm">
                        {selectedPromo.discountType === 'percentage' ? `${selectedPromo.discountValue}%` : `${selectedPromo.discountValue} DA`}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-400">Total Campaign Usage:</span>
                      <span className="text-slate-800">
                        {selectedPromo.usageCount} / {selectedPromo.usageLimit} redemptions
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-400">Expiration Date:</span>
                      <span className="text-slate-800 flex items-center gap-1">
                        <Calendar size={12} className="text-slate-400" />
                        {selectedPromo.expiryDate}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-400">Usage Density:</span>
                      <span className="text-slate-800">
                        {Math.round((selectedPromo.usageCount / selectedPromo.usageLimit) * 100)}% Used
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Close Footer */}
              <div className="p-8 border-t border-slate-100 bg-slate-50 flex shrink-0">
                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                >
                  Close Voucher File
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. MODIFIER (EDIT) MODAL */}
      <AnimatePresence>
        {isEditModalOpen && editForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsEditModalOpen(false);
                setEditForm(null);
              }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-[550px] bg-white rounded-[3rem] shadow-2xl border border-slate-100 relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="h-2 bg-gradient-to-r from-amber-500 via-primary to-emerald-500 shrink-0" />

              <button 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditForm(null);
                }}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-100 transition-all cursor-pointer z-20"
              >
                <X size={18} />
              </button>

              <form onSubmit={handleSaveEdit} className="flex flex-col h-full overflow-hidden">
                <div className="flex-1 overflow-y-auto p-8 lg:p-10 space-y-6">
                  {/* Title */}
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{editForm.id}</span>
                    <h2 className="text-2xl font-black uppercase italic tracking-tight text-slate-800">
                      Modifier <span className="text-primary">Promo Code</span>
                    </h2>
                    <p className="text-xs text-slate-400 font-semibold font-inter">
                      Adjust discount rate factors, edit usage thresholds, or stretch active timelines.
                    </p>
                  </div>

                  <div className="w-full h-px bg-slate-100" />

                  {/* Form fields */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Code */}
                      <div className="sm:col-span-2">
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Voucher Code (uppercase)</label>
                        <input
                          type="text"
                          required
                          value={editForm.code}
                          onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all uppercase font-mono tracking-wider"
                        />
                      </div>

                      {/* Discount Type */}
                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Reduction Scope Type</label>
                        <div className="relative">
                          <select
                            value={editForm.discountType}
                            onChange={(e) => setEditForm({ ...editForm, discountType: e.target.value as any })}
                            className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-primary/20 appearance-none cursor-pointer"
                          >
                            <option value="percentage">Percentage (%)</option>
                            <option value="fixed">Fixed Flat Rate (DA)</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                        </div>
                      </div>

                      {/* Discount Value */}
                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">
                          Discount Value ({editForm.discountType === 'percentage' ? '%' : 'DA'})
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={editForm.discountValue}
                          onChange={(e) => setEditForm({ ...editForm, discountValue: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all"
                        />
                      </div>

                      {/* Usage Limit */}
                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Usage Limit Capacity</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={editForm.usageLimit}
                          onChange={(e) => setEditForm({ ...editForm, usageLimit: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all"
                        />
                      </div>

                      {/* Expiry Date */}
                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Expiration Deadline</label>
                        <input
                          type="date"
                          required
                          value={editForm.expiryDate}
                          onChange={(e) => setEditForm({ ...editForm, expiryDate: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all"
                        />
                      </div>

                      {/* Status */}
                      <div className="sm:col-span-2">
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Voucher Status</label>
                        <div className="relative">
                          <select
                            value={editForm.status}
                            onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                            className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-primary/20 appearance-none cursor-pointer uppercase"
                          >
                            <option value="active">🟢 Active</option>
                            <option value="expired">🔴 Expired</option>
                            <option value="inactive">⚫ Inactive</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                        </div>
                      </div>

                      {/* Description */}
                      <div className="sm:col-span-2">
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Voucher Scope Details (Description)</label>
                        <textarea
                          rows={3}
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all resize-none font-inter"
                          placeholder="Welcome promo giving discounts on maintenance cleans..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-8 border-t border-slate-100 bg-slate-50 flex gap-4 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditForm(null);
                    }}
                    className="flex-1 py-4 bg-white hover:bg-slate-100 text-slate-700 rounded-2xl font-bold uppercase tracking-wider text-[10px] border border-slate-100 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-wider text-[10px] shadow-lg shadow-primary/20 hover:bg-primary/95 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Save size={14} />
                    Save Voucher
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. CREATE NEW PROMO CODE MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-[550px] bg-white rounded-[3rem] shadow-2xl border border-slate-100 relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="h-2 bg-gradient-to-r from-primary via-primary-400 to-secondary shrink-0" />

              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-100 transition-all cursor-pointer z-20"
              >
                <X size={18} />
              </button>

              <form onSubmit={handleAddSubmit} className="flex flex-col h-full overflow-hidden">
                <div className="flex-1 overflow-y-auto p-8 lg:p-10 space-y-6">
                  {/* Title */}
                  <div>
                    <div className="inline-flex items-center gap-2 bg-primary/5 px-3 py-1 rounded-full border border-primary/10 mb-2">
                      <Sparkles size={12} className="text-primary" />
                      <span className="text-[9px] font-black uppercase tracking-wider text-primary">New Campaign</span>
                    </div>
                    <h2 className="text-2xl font-black uppercase italic tracking-tight text-slate-800">
                      Create <span className="text-primary">Promo Code</span>
                    </h2>
                    <p className="text-xs text-slate-400 font-semibold font-inter">
                      Define a fresh voucher, allocate total usages limits, and set expiration parameters to convert leads.
                    </p>
                  </div>

                  <div className="w-full h-px bg-slate-100" />

                  {/* Form */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Code */}
                      <div className="sm:col-span-2">
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Voucher Code (uppercase, e.g., NADIF25)</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. NADIF20"
                          value={addForm.code}
                          onChange={(e) => setAddForm({ ...addForm, code: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all uppercase font-mono tracking-wider"
                        />
                      </div>

                      {/* Discount Type */}
                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Reduction Scope Type</label>
                        <div className="relative">
                          <select
                            value={addForm.discountType}
                            onChange={(e) => setAddForm({ ...addForm, discountType: e.target.value as any })}
                            className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-primary/20 appearance-none cursor-pointer"
                          >
                            <option value="percentage">Percentage (%)</option>
                            <option value="fixed">Fixed Flat Rate (DA)</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                        </div>
                      </div>

                      {/* Discount Value */}
                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">
                          Discount Value ({addForm.discountType === 'percentage' ? '%' : 'DA'})
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={addForm.discountValue}
                          onChange={(e) => setAddForm({ ...addForm, discountValue: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all"
                        />
                      </div>

                      {/* Usage Limit */}
                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Usage Limit Capacity</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={addForm.usageLimit}
                          onChange={(e) => setAddForm({ ...addForm, usageLimit: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all"
                        />
                      </div>

                      {/* Expiry Date */}
                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Expiration Deadline</label>
                        <input
                          type="date"
                          required
                          value={addForm.expiryDate}
                          onChange={(e) => setAddForm({ ...addForm, expiryDate: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all"
                        />
                      </div>

                      {/* Status */}
                      <div className="sm:col-span-2">
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Voucher Status</label>
                        <div className="relative">
                          <select
                            value={addForm.status}
                            onChange={(e) => setAddForm({ ...addForm, status: e.target.value as any })}
                            className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-primary/20 appearance-none cursor-pointer uppercase"
                          >
                            <option value="active">🟢 Active</option>
                            <option value="expired">🔴 Expired</option>
                            <option value="inactive">⚫ Inactive</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                        </div>
                      </div>

                      {/* Description */}
                      <div className="sm:col-span-2">
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Voucher Scope Details (Description)</label>
                        <textarea
                          rows={3}
                          required
                          value={addForm.description}
                          onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all resize-none font-inter"
                          placeholder="Explain terms of this discount (e.g. 20% discount on initial house bookings)..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-8 border-t border-slate-100 bg-slate-50 flex gap-4 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-4 bg-white hover:bg-slate-100 text-slate-700 rounded-2xl font-bold uppercase tracking-wider text-[10px] border border-slate-100 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-wider text-[10px] shadow-lg shadow-primary/20 hover:bg-primary/95 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Plus size={14} />
                    Deploy Promo Code
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 8. DELETE CONFIRM MODAL */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-[400px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 relative z-10 overflow-hidden p-8 text-center space-y-6"
            >
              <div className="w-16 h-16 bg-rose-50 border border-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <Trash2 size={24} />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-800">
                  Delete Voucher?
                </h3>
                <p className="text-sm text-slate-400 font-semibold max-w-[280px] mx-auto leading-relaxed font-inter">
                  Are you sure you want to delete promo code <span className="font-bold text-slate-700">"{promoToDelete?.code}"</span>? This will permanently invalidate the voucher key.
                </p>
              </div>

              <div className="flex gap-4 pt-2">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-4 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-2xl font-bold uppercase tracking-wider text-[10px] border border-slate-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-wider text-[10px] shadow-lg shadow-rose-600/10 hover:bg-rose-700 active:scale-[0.98] transition-all cursor-pointer"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
