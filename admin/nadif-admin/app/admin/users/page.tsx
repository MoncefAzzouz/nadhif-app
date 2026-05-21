'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Search, 
  Trash2, 
  Pencil, 
  Shield, 
  Sparkles, 
  CheckCircle, 
  Mail, 
  Phone, 
  Calendar,
  X,
  UserCheck
} from 'lucide-react';

// User Interface
interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'client' | 'super_admin' | 'cleaner';
  joinedDate: string;
}

// Initial Mock Seed
const DEFAULT_USERS: UserRecord[] = [
  {
    id: 'USR-701',
    name: 'Moncef Azzouz',
    email: 'moncef@nadif.dz',
    phone: '0555 12 34 56',
    role: 'client',
    joinedDate: '2026-05-12'
  },
  {
    id: 'USR-102',
    name: 'Amine Sétifi',
    email: 'amine@setif.com',
    phone: '0550 99 88 77',
    role: 'client',
    joinedDate: '2026-04-10'
  },
  {
    id: 'USR-305',
    name: 'Khadidja Alger',
    email: 'khadidja@gmail.com',
    phone: '0770 12 45 78',
    role: 'client',
    joinedDate: '2026-05-01'
  },
  {
    id: 'USR-502',
    name: 'Sofiane Cleaner',
    email: 'sofiane.clean@nadif.dz',
    phone: '0660 33 22 11',
    role: 'cleaner',
    joinedDate: '2026-05-05'
  },
  {
    id: 'USR-901',
    name: 'Yacine Admin',
    email: 'admin@nadif.dz',
    phone: '0555 90 90 90',
    role: 'super_admin',
    joinedDate: '2026-03-01'
  }
];

export default function UsersManager() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'client' | 'super_admin' | 'cleaner'>('all');
  
  // UI Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Creation form state
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'client' as 'client' | 'super_admin' | 'cleaner',
    password: ''
  });

  // Load database
  useEffect(() => {
    const stored = localStorage.getItem('nadif_users_list');
    if (stored) {
      // Clean stale loyalty keys if migrating from previous seeds
      const raw = JSON.parse(stored);
      const cleaned = raw.map(({ points, ...rest }: any) => rest);
      setUsers(cleaned);
    } else {
      localStorage.setItem('nadif_users_list', JSON.stringify(DEFAULT_USERS));
      setUsers(DEFAULT_USERS);
    }
    setIsLoaded(true);
  }, []);

  const saveToDb = (updated: UserRecord[]) => {
    setUsers(updated);
    localStorage.setItem('nadif_users_list', JSON.stringify(updated));
  };

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Add User handler
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name || !createForm.email || !createForm.phone) return;

    const newUser: UserRecord = {
      id: `USR-${Math.floor(100 + Math.random() * 899)}`,
      name: createForm.name,
      email: createForm.email,
      phone: createForm.phone,
      role: createForm.role,
      joinedDate: new Date().toISOString().split('T')[0]
    };

    const updated = [newUser, ...users];
    saveToDb(updated);
    setIsAddOpen(false);
    setCreateForm({
      name: '',
      email: '',
      phone: '',
      role: 'client',
      password: ''
    });
    triggerToast(`✨ User account ${newUser.name} created as ${newUser.role.toUpperCase()}!`);
  };

  // Edit User handler
  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const updated = users.map(u => u.id === editingUser.id ? editingUser : u);
    saveToDb(updated);
    setEditingUser(null);
    triggerToast(`✏️ User profile updated for ${editingUser.name}!`);
  };

  // Delete User
  const handleDeleteUser = (id: string, name: string) => {
    if (name === 'Yacine Admin' || name === 'Super Admin') {
      alert("⚠️ Root Super Administrator profile cannot be deleted for safety restrictions.");
      return;
    }
    if (confirm(`Are you sure you want to permanently delete user account: ${name}?`)) {
      const updated = users.filter(u => u.id !== id);
      saveToDb(updated);
      triggerToast(`🗑️ User account ${name} deleted successfully.`);
    }
  };

  // Filtered Users
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Counters
  const countClients = users.filter(u => u.role === 'client').length;
  const countAdmins = users.filter(u => u.role === 'super_admin').length;
  const countCleaners = users.filter(u => u.role === 'cleaner').length;

  return (
    <div className="space-y-10 font-gilmer max-w-7xl mx-auto animate-fadeIn relative">
      {/* Alert toast notification */}
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

      {/* 1. Header Area */}
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

        {/* Provision User button */}
        <button
          onClick={() => setIsAddOpen(true)}
          className="px-6 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-wider text-[10px] shadow-lg shadow-primary/20 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2.5 cursor-pointer self-start md:self-center"
        >
          <UserPlus size={15} />
          Provision Account
        </button>
      </div>

      {/* 2. Top Statistic Summaries Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: "Clients Actifs", val: countClients, icon: Users, color: "text-blue-500 bg-blue-50 border-blue-100/50" },
          { label: "Super Admins", val: countAdmins, icon: Shield, color: "text-amber-500 bg-amber-50 border-amber-100/50" },
          { label: "Agents Nettoyage", val: countCleaners, icon: UserCheck, color: "text-emerald-500 bg-emerald-50 border-emerald-100/50" }
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className={`p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex items-center justify-between gap-4 hover:shadow-md transition-shadow`}>
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{card.label}</p>
                <h3 className="text-2xl font-black text-slate-800 leading-none">{card.val}</h3>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${card.color}`}>
                <Icon size={20} />
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Search Engine & Directory Filtering */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search bar input */}
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

          {/* Filter Tier Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-xl gap-1 shrink-0 self-start md:self-center">
            {[
              { id: 'all', label: 'Tous' },
              { id: 'client', label: 'Clients' },
              { id: 'cleaner', label: 'Cleaners' },
              { id: 'super_admin', label: 'Admins' }
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

        {/* 4. Elite Directory Database Table */}
        {!isLoaded ? (
          <div className="min-h-[25vh] flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-[2rem] space-y-3">
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-3xl flex items-center justify-center mx-auto text-xl font-bold">
              🔎
            </div>
            <h4 className="text-sm font-black uppercase text-slate-700">No Account Matches Found</h4>
            <p className="text-xs text-slate-400 font-semibold font-inter max-w-sm mx-auto">
              We couldn't locate any users aligned with your search queries. Try verifying details or clear filter parameters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[2rem] border border-slate-50">
            <table className="w-full border-collapse text-left min-w-[800px]">
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
                  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/40 transition-colors font-semibold">
                      
                      {/* Name & ID column */}
                      <td className="py-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl font-black text-xs flex items-center justify-center shadow-sm select-none ${
                            user.role === 'super_admin'
                              ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-amber-200/50'
                              : user.role === 'cleaner'
                                ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-emerald-200/50'
                                : 'bg-gradient-to-br from-primary to-primary-400 text-white shadow-primary/20'
                          }`}>
                            {initials}
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-xs font-black text-slate-800">{user.name}</p>
                            <p className="text-[9px] font-mono text-slate-400 font-bold uppercase">{user.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact details */}
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

                      {/* Registration Date */}
                      <td className="py-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-inter font-semibold">
                          <Calendar size={11} className="text-slate-400" />
                          <span>{user.joinedDate}</span>
                        </div>
                      </td>

                      {/* Role System badge */}
                      <td className="py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[9px] font-black uppercase ${
                          user.role === 'super_admin'
                            ? 'bg-amber-50 text-amber-600 border border-amber-100'
                            : user.role === 'cleaner'
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                              : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                        }`}>
                          {user.role === 'super_admin' && (
                            <>
                              <Shield size={9} />
                              Super Admin
                            </>
                          )}
                          {user.role === 'cleaner' && (
                            <>
                              <Sparkles size={9} />
                              Cleaner
                            </>
                          )}
                          {user.role === 'client' && (
                            <>
                              <Users size={9} />
                              Client
                            </>
                          )}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-4 pr-6 text-right">
                        <div className="flex justify-end gap-2">
                          {/* Edit user details */}
                          <button
                            onClick={() => setEditingUser(user)}
                            className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100 text-slate-400 flex items-center justify-center transition-all cursor-pointer"
                            title="Edit Profile"
                          >
                            <Pencil size={12} />
                          </button>

                          {/* Delete user */}
                          <button
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-rose-50 hover:text-rose-600 border border-slate-100 text-rose-400 flex items-center justify-center transition-all cursor-pointer"
                            title="Delete Account permanently"
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

      {/* 5. PROVISION / ADD NEW USER ACCOUNT MODAL DIALOG */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border border-slate-100 rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl space-y-6 relative overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsAddOpen(false)}
                className="absolute right-6 top-6 w-9 h-9 rounded-xl border border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>

              <div className="space-y-1.5 pr-8">
                <span className="text-[8px] font-black uppercase text-primary tracking-widest bg-primary/5 border border-primary/10 px-2 py-0.5 rounded-full inline-block">
                  Security Provisioning Center
                </span>
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-800 flex items-center gap-2">
                  <UserPlus size={20} className="text-primary" />
                  Create User / Admin
                </h3>
                <p className="text-xs text-slate-400 font-semibold font-inter leading-relaxed">
                  Provision new system users, cleaners, or additional Super Administrators into the Nadif Elite application.
                </p>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Salim Boukhalfa"
                      value={createForm.name}
                      onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. salim@gmail.com"
                      value={createForm.email}
                      onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 0550 11 22 33"
                      value={createForm.phone}
                      onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all font-mono"
                    />
                  </div>

                  {/* Role Type Selection */}
                  <div>
                    <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">System Tier / Role</label>
                    <select
                      value={createForm.role}
                      onChange={(e) => setCreateForm({ 
                        ...createForm, 
                        role: e.target.value as any
                      })}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all"
                    >
                      <option value="client">Client User</option>
                      <option value="cleaner">Cleaner Specialist</option>
                      <option value="super_admin">Super Administrator</option>
                    </select>
                  </div>

                  {/* Password if cleaner or admin */}
                  {createForm.role !== 'client' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="sm:col-span-2 space-y-1.5 pt-2"
                    >
                      <label className="block text-[9px] font-black uppercase text-rose-500 mb-1.5 flex items-center gap-1">
                        <Shield size={10} />
                        Define Secure Access Password
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Define system security password..."
                        value={createForm.password}
                        onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                        className="w-full px-4 py-3.5 bg-rose-50/50 border border-rose-100 rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-rose-300 outline-none transition-all"
                      />
                    </motion.div>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-4.5 bg-primary text-white rounded-2xl font-black uppercase tracking-wider text-[10px] shadow-xl shadow-primary/25 hover:scale-101 active:scale-99 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <UserPlus size={14} />
                    Deploy User Credentials
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. FULL ACCOUNT EDITOR MODAL DIALOG */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border border-slate-100 rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl space-y-6 relative overflow-hidden"
            >
              <button
                onClick={() => setEditingUser(null)}
                className="absolute right-6 top-6 w-9 h-9 rounded-xl border border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>

              <div className="space-y-1.5 pr-8">
                <span className="text-[8px] font-black uppercase text-primary tracking-widest bg-primary/5 border border-primary/10 px-2 py-0.5 rounded-full inline-block">
                  Account Management
                </span>
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-800">
                  Edit User Account
                </h3>
                <p className="text-xs text-slate-400 font-semibold font-inter leading-relaxed">
                  Modify profile coordinates, tier classifications, and settings for **{editingUser.name}**.
                </p>
              </div>

              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      required
                      value={editingUser.name}
                      onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      required
                      value={editingUser.email}
                      onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={editingUser.phone}
                      onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all font-mono"
                    />
                  </div>

                  {/* Role Type */}
                  <div>
                    <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Role Classification</label>
                    <select
                      value={editingUser.role}
                      onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                      disabled={editingUser.name === 'Yacine Admin'}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all"
                    >
                      <option value="client">Client User</option>
                      <option value="cleaner">Cleaner Specialist</option>
                      <option value="super_admin">Super Administrator</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-4.5 bg-primary text-white rounded-2xl font-black uppercase tracking-wider text-[10px] shadow-lg shadow-primary/20 hover:scale-101 active:scale-99 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Pencil size={14} />
                    Commit Account Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
