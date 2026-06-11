'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, UserPlus, Search, Trash2, Shield, Sparkles, CheckCircle, 
  Mail, Phone, Calendar, X, UserCheck, RefreshCw, AlertCircle 
} from 'lucide-react';
import { usersApi, type ApiUser } from '../../lib/api';

export default function UsersManager() {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | ApiUser['role']>('all');
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<ApiUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await usersApi.getAll();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await usersApi.delete(userToDelete.id);
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      triggerToast(`User ${userToDelete.fullName} deleted successfully.`);
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtering
  const filteredUsers = users.filter(u => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      (u.fullName || '').toLowerCase().includes(searchLower) ||
      (u.email || '').toLowerCase().includes(searchLower) ||
      (u.phone || '').toLowerCase().includes(searchLower);
    
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const countClients = users.filter(u => u.role === 'CUSTOMER').length;
  const countAdmins = users.filter(u => u.role === 'ADMIN').length;
  const countCleaners = users.filter(u => u.role === 'CLEANER').length;

  const formatDate = (dateString: string) => {
    try { return new Date(dateString).toLocaleDateString('fr-DZ'); } 
    catch { return dateString; }
  };

  return (
    <div className="space-y-10 font-gilmer max-w-full mx-auto px-4 lg:px-8 animate-fadeIn relative">
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
          <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
            <Users size={14} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Accounts Command</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-800 uppercase italic">
            User <span className="text-primary">Accounts</span>
          </h1>
          <p className="text-sm text-slate-400 font-medium font-inter">
            Audit customer directories, assign cleaner contracts, create staff accounts, and provision super administrator credentials.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={isLoading}
          className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-wider text-slate-500 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50 cursor-pointer self-start md:self-center"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 rounded-3xl p-6 flex items-center gap-4">
          <AlertCircle size={20} className="text-rose-500 shrink-0" />
          <div>
            <p className="text-sm font-bold text-rose-700">{error}</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: "Clients Actifs", val: countClients, icon: Users, color: "text-blue-500 bg-blue-50 border-blue-100/50" },
          { label: "Super Admins", val: countAdmins, icon: Shield, color: "text-amber-500 bg-amber-50 border-amber-100/50" },
          { label: "Agents Nettoyage", val: countCleaners, icon: UserCheck, color: "text-emerald-500 bg-emerald-50 border-emerald-100/50" }
        ].map((card, idx) => (
          <div key={idx} className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex items-center justify-between gap-4 hover:shadow-md transition-shadow">
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

      {/* Filter */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Rechercher par nom, e-mail ou téléphone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all font-inter"
            />
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="flex p-1 bg-slate-100 rounded-xl gap-1 shrink-0 self-start md:self-center">
            {[
              { id: 'all', label: 'Tous' },
              { id: 'CUSTOMER', label: 'Clients' },
              { id: 'CLEANER', label: 'Cleaners' },
              { id: 'ADMIN', label: 'Admins' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRoleFilter(tab.id as any)}
                className={`px-4 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer transition-all ${
                  roleFilter === tab.id
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="min-h-[25vh] flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 animate-pulse">Loading API Data...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-[2rem] space-y-3">
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-3xl flex items-center justify-center mx-auto text-xl font-bold">🔎</div>
            <h4 className="text-sm font-black uppercase text-slate-700">No Account Matches Found</h4>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[2rem] border border-slate-50">
            <table className="w-full border-collapse text-left min-w-[1100px]">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 bg-slate-50/50">
                  <th className="py-4 pl-6">Client / Unique ID</th>
                  <th className="py-4">Contact Parameters</th>
                  <th className="py-4">Date Inscription</th>
                  <th className="py-4">Role System</th>
                  <th className="py-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700">
                {filteredUsers.map((user) => {
                  const initials = user.fullName ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/40 transition-colors font-semibold">
                      <td className="py-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl font-black text-xs flex items-center justify-center shadow-sm select-none ${
                            user.role === 'ADMIN' ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white' :
                            user.role === 'CLEANER' ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white' :
                            'bg-gradient-to-br from-primary to-primary-400 text-white'
                          }`}>
                            {initials}
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-xs font-black text-slate-800">{user.fullName}</p>
                            <p className="text-[9px] font-mono text-slate-400 font-bold uppercase">{user.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-xs font-inter font-bold">
                        <div className="space-y-0.5 text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Phone size={10} className="text-slate-400" />
                            <span className="font-mono text-[10px]">{user.phone}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Mail size={10} className="text-slate-400" />
                            <span>{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-inter font-semibold">
                          <Calendar size={11} className="text-slate-400" />
                          <span>{formatDate(user.createdAt)}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[9px] font-black uppercase ${
                          user.role === 'ADMIN' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                          user.role === 'CLEANER' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          'bg-indigo-50 text-indigo-600 border border-indigo-100'
                        }`}>
                          {user.role === 'ADMIN' && <><Shield size={9} /> Super Admin</>}
                          {user.role === 'CLEANER' && <><Sparkles size={9} /> Cleaner</>}
                          {user.role === 'CUSTOMER' && <><Users size={9} /> Client</>}
                        </span>
                      </td>
                      <td className="py-4 pr-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => { setUserToDelete(user); setIsDeleteModalOpen(true); }}
                            className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-rose-50 hover:text-rose-600 border border-slate-100 text-rose-400 flex items-center justify-center transition-all cursor-pointer"
                            title="Delete Account"
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

      <AnimatePresence>
        {isDeleteModalOpen && userToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setIsDeleteModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 relative z-10 space-y-8 text-center"
            >
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto">
                <Trash2 size={32} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black uppercase tracking-tight text-slate-800">Delete User?</h2>
                <p className="text-sm text-slate-400 font-medium">
                  This will permanently remove <span className="font-bold text-slate-600">{userToDelete.fullName}</span> from the database.
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isDeleting}
                  className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black uppercase tracking-wider text-[10px] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={isDeleting}
                  className="flex-1 py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-black uppercase tracking-wider text-[10px] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
