'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCheck, 
  Plus, 
  Search, 
  Trash2, 
  Pencil, 
  Sparkles, 
  CheckCircle, 
  Mail, 
  Phone, 
  Award,
  X,
  Briefcase,
  Sliders,
  Check,
  TrendingUp
} from 'lucide-react';

// Cleaner Interface
interface CleanerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'available' | 'on_duty' | 'inactive';
  completedOrders: number;
  skills: string[];
  wilaya: string;
}

// Initial Mock Staff
const DEFAULT_CLEANERS: CleanerRecord[] = [
  {
    id: 'CLN-301',
    name: 'Sofiane Cleaner',
    email: 'sofiane.clean@nadif.dz',
    phone: '0660 33 22 11',
    status: 'available',
    completedOrders: 45,
    skills: ['Deep Clean', 'Steam Mop', 'Sanitization'],
    wilaya: 'Sétif'
  },
  {
    id: 'CLN-102',
    name: 'Riad Bouzidi',
    email: 'riad@nadif.dz',
    phone: '0550 44 55 66',
    status: 'on_duty',
    completedOrders: 32,
    skills: ['Standard Clean', 'Ironing'],
    wilaya: 'Sétif'
  },
  {
    id: 'CLN-205',
    name: 'Amel Mansouri',
    email: 'amel@nadif.dz',
    phone: '0770 99 88 44',
    status: 'available',
    completedOrders: 58,
    skills: ['Deep Clean', 'Symmetrical Windows', 'Sanitization'],
    wilaya: 'Sétif'
  },
  {
    id: 'CLN-408',
    name: 'Karim Oualid',
    email: 'karim@nadif.dz',
    phone: '0555 77 66 11',
    status: 'inactive',
    completedOrders: 18,
    skills: ['Standard Clean', 'Steam Mop'],
    wilaya: 'Sétif'
  }
];

export default function CleanersManager() {
  const [cleaners, setCleaners] = useState<CleanerRecord[]>([]);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'on_duty' | 'inactive'>('all');
  
  // UI Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCleaner, setEditingCleaner] = useState<CleanerRecord | null>(null);
  const [skillsCleaner, setSkillsCleaner] = useState<CleanerRecord | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Creation form state
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'available' as 'available' | 'on_duty' | 'inactive',
    skills: [] as string[],
    password: '',
    wilaya: 'Sétif'
  });

  // Load database
  useEffect(() => {
    const stored = localStorage.getItem('nadif_cleaners_list');
    if (stored) {
      // Clean rating key from stale records if migrating from previous seed
      const raw = JSON.parse(stored);
      const cleaned = raw.map(({ rating, ...rest }: any) => rest);
      setCleaners(cleaned);
    } else {
      localStorage.setItem('nadif_cleaners_list', JSON.stringify(DEFAULT_CLEANERS));
      setCleaners(DEFAULT_CLEANERS);
    }

    // Dynamic skills fetching
    const storedSkills = localStorage.getItem('nadif_skills_list');
    if (storedSkills) {
      const skillsArray = JSON.parse(storedSkills);
      setAvailableSkills(skillsArray.map((s: any) => s.name));
    } else {
      const defaultSkills = [
        'Standard Clean',
        'Deep Clean',
        'Steam Mop',
        'Sanitization',
        'Ironing',
        'Symmetrical Windows'
      ];
      setAvailableSkills(defaultSkills);
    }

    setIsLoaded(true);
  }, []);

  const saveToDb = (updated: CleanerRecord[]) => {
    setCleaners(updated);
    localStorage.setItem('nadif_cleaners_list', JSON.stringify(updated));
  };

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Add Cleaner
  const handleCreateCleaner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name || !createForm.email || !createForm.phone) return;

    const newCleaner: CleanerRecord = {
      id: `CLN-${Math.floor(100 + Math.random() * 899)}`,
      name: createForm.name,
      email: createForm.email,
      phone: createForm.phone,
      status: createForm.status,
      completedOrders: 0,
      skills: createForm.skills,
      wilaya: createForm.wilaya
    };

    const updated = [newCleaner, ...cleaners];
    saveToDb(updated);
    setIsAddOpen(false);
    setCreateForm({
      name: '',
      email: '',
      phone: '',
      status: 'available',
      skills: [],
      password: '',
      wilaya: 'Sétif'
    });
    triggerToast(`✨ Cleaner agent ${newCleaner.name} registered successfully!`);
  };

  // Update Status Inline
  const handleStatusChange = (id: string, newStatus: 'available' | 'on_duty' | 'inactive') => {
    const updated = cleaners.map(c => c.id === id ? { ...c, status: newStatus } : c);
    saveToDb(updated);
    triggerToast(`🟢 Cleaner status altered to ${newStatus.replace('_', ' ').toUpperCase()}!`);
  };

  // Update Cleaner profile
  const handleUpdateCleaner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCleaner) return;

    const updated = cleaners.map(c => c.id === editingCleaner.id ? editingCleaner : c);
    saveToDb(updated);
    setEditingCleaner(null);
    triggerToast(`✏️ Cleaner details updated for ${editingCleaner.name}!`);
  };

  // Update Cleaner Skills
  const handleSaveSkills = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillsCleaner) return;

    const updated = cleaners.map(c => c.id === skillsCleaner.id ? skillsCleaner : c);
    saveToDb(updated);
    setSkillsCleaner(null);
    triggerToast(`🛠️ Specialty skills updated for ${skillsCleaner.name}!`);
  };

  // Delete Cleaner
  const handleDeleteCleaner = (id: string, name: string) => {
    if (confirm(`Are you sure you want to permanently delete cleaner specialist: ${name}?`)) {
      const updated = cleaners.filter(c => c.id !== id);
      saveToDb(updated);
      triggerToast(`🗑️ Cleaner ${name} removed from roster.`);
    }
  };

  // Checkbox skill helper
  const toggleCreateSkill = (skill: string) => {
    const current = [...createForm.skills];
    if (current.includes(skill)) {
      setCreateForm({ ...createForm, skills: current.filter(s => s !== skill) });
    } else {
      setCreateForm({ ...createForm, skills: [...current, skill] });
    }
  };

  const toggleEditSkill = (skill: string) => {
    if (!skillsCleaner) return;
    const current = [...skillsCleaner.skills];
    let updatedSkills: string[] = [];
    if (current.includes(skill)) {
      updatedSkills = current.filter(s => s !== skill);
    } else {
      updatedSkills = [...current, skill];
    }
    setSkillsCleaner({ ...skillsCleaner, skills: updatedSkills });
  };

  // Filtered cleaners
  const filteredCleaners = cleaners.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Analytics
  const totalCleaners = cleaners.length;
  const countAvailable = cleaners.filter(c => c.status === 'available').length;
  const countOnDuty = cleaners.filter(c => c.status === 'on_duty').length;

  return (
    <div className="space-y-10 font-gilmer max-w-7xl mx-auto animate-fadeIn relative">
      {/* Alert toast */}
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
            <UserCheck size={14} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Cleaning Specialists</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-800 uppercase italic">
            Cleaner <span className="text-primary">Workers</span>
          </h1>
          <p className="text-sm text-slate-400 font-medium font-inter">
            Provision professional cleaning agents, modify specialty skills checklists, and adjust dispatch states.
          </p>
        </div>

        {/* Provision cleaner button */}
        <button
          onClick={() => setIsAddOpen(true)}
          className="px-6 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-wider text-[10px] shadow-lg shadow-primary/20 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2.5 cursor-pointer self-start md:self-center"
        >
          <Plus size={15} />
          Register Cleaner
        </button>
      </div>

      {/* 2. Statistic Summaries Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: "Total Workers", val: totalCleaners, icon: Briefcase, color: "text-blue-500 bg-blue-50 border-blue-100/50" },
          { label: "Disponible (Available)", val: countAvailable, icon: CheckCircle, color: "text-emerald-500 bg-emerald-50 border-emerald-100/50" },
          { label: "En Intervention (On Duty)", val: countOnDuty, icon: TrendingUp, color: "text-amber-500 bg-amber-50 border-amber-100/50" }
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

      {/* 3. Search Bar & Status Filtering */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search bar input */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Rechercher par nom, e-mail, compétence..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all font-inter"
            />
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          {/* Status Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-xl gap-1 shrink-0 self-start md:self-center">
            {[
              { id: 'all', label: 'Tous' },
              { id: 'available', label: 'Disponible' },
              { id: 'on_duty', label: 'Intervention' },
              { id: 'inactive', label: 'Inactif' }
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

        {/* 4. Directory Database Table */}
        {!isLoaded ? (
          <div className="min-h-[25vh] flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredCleaners.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-[2rem] space-y-3">
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-3xl flex items-center justify-center mx-auto text-xl font-bold">
              🧹
            </div>
            <h4 className="text-sm font-black uppercase text-slate-700">No Cleaner Specialists Listed</h4>
            <p className="text-xs text-slate-400 font-semibold font-inter max-w-sm mx-auto">
              We couldn't locate any professional cleaning agents. Try verifying search spelling or clear status tabs filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[2rem] border border-slate-50">
            <table className="w-full border-collapse text-left min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 bg-slate-50/50">
                  <th className="py-4 pl-6">Specialist / Worker ID</th>
                  <th className="py-4">Contact Coordinates</th>
                  <th className="py-4">Specialty Skills</th>
                  <th className="py-4">Completed Jobs</th>
                  <th className="py-4">Dispatch Status</th>
                  <th className="py-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700">
                {filteredCleaners.map((cleaner) => {
                  const initials = cleaner.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                  return (
                    <tr key={cleaner.id} className="hover:bg-slate-50/40 transition-colors font-semibold">
                      
                      {/* Cleaner Details */}
                      <td className="py-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-sm select-none">
                            {initials}
                          </div>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black text-slate-800">{cleaner.name}</span>
                              <span className="text-[9px] font-black text-slate-300">({cleaner.wilaya})</span>
                            </div>
                            <p className="text-[9px] font-mono text-slate-400 font-bold uppercase">{cleaner.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact Coordinates */}
                      <td className="py-4 text-xs font-inter font-bold">
                        <div className="space-y-0.5 text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Phone size={10} className="text-slate-400" />
                            <span className="font-mono text-[10px]">{cleaner.phone}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Mail size={10} className="text-slate-400" />
                            <span>{cleaner.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Specialty Skills Pills */}
                      <td className="py-4 max-w-[280px]">
                        <div className="flex flex-wrap gap-1">
                          {cleaner.skills.length === 0 ? (
                            <span className="text-[8px] font-black uppercase text-slate-300">No skills assigned</span>
                          ) : (
                            cleaner.skills.map((skill, idx) => (
                              <span 
                                key={idx}
                                className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded-lg border ${
                                  skill.includes('Deep') 
                                    ? 'bg-rose-50 border-rose-100 text-rose-600'
                                    : skill.includes('Steam')
                                      ? 'bg-indigo-50 border-indigo-100 text-indigo-600'
                                      : 'bg-slate-50 border-slate-100 text-slate-500'
                                }`}
                              >
                                {skill}
                              </span>
                            ))
                          )}
                        </div>
                      </td>

                      {/* Experience (Completed Orders) */}
                      <td className="py-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-inter font-black">
                          <Award size={13} className="text-slate-400" />
                          <span>{cleaner.completedOrders} Orders</span>
                        </div>
                      </td>

                      {/* State drop selector */}
                      <td className="py-4">
                        <select
                          value={cleaner.status}
                          onChange={(e) => handleStatusChange(cleaner.id, e.target.value as any)}
                          className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider outline-none border cursor-pointer transition-all ${
                            cleaner.status === 'available'
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                              : cleaner.status === 'on_duty'
                                ? 'bg-amber-50 text-amber-600 border-amber-200 animate-pulse'
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          <option value="available">🟢 Disponible</option>
                          <option value="on_duty">🟡 Intervention</option>
                          <option value="inactive">🔴 Inactif</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-4 pr-6 text-right">
                        <div className="flex justify-end gap-2">
                          {/* Specialties Editor shortcut */}
                          <button
                            onClick={() => setSkillsCleaner(cleaner)}
                            className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 border border-slate-100 text-slate-500 flex items-center justify-center transition-all cursor-pointer"
                            title="Edit Specialty Skills"
                          >
                            <Sliders size={12} />
                          </button>

                          {/* Edit Cleaner info */}
                          <button
                            onClick={() => setEditingCleaner(cleaner)}
                            className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100 text-slate-400 flex items-center justify-center transition-all cursor-pointer"
                            title="Edit Worker Profile"
                          >
                            <Pencil size={12} />
                          </button>

                          {/* Delete cleaner */}
                          <button
                            onClick={() => handleDeleteCleaner(cleaner.id, cleaner.name)}
                            className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-rose-50 hover:text-rose-600 border border-slate-100 text-rose-400 flex items-center justify-center transition-all cursor-pointer"
                            title="Delete Worker Account"
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

      {/* 5. SKILLS CHECKLIST EDITOR MODAL */}
      <AnimatePresence>
        {skillsCleaner && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border border-slate-100 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl space-y-6 relative overflow-hidden"
            >
              <button
                onClick={() => setSkillsCleaner(null)}
                className="absolute right-6 top-6 w-9 h-9 rounded-xl border border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>

              <div className="space-y-1.5 pr-8">
                <span className="text-[8px] font-black uppercase text-primary tracking-widest bg-primary/5 border border-primary/10 px-2 py-0.5 rounded-full inline-block">
                  Specialty Operations
                </span>
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-800">
                  Worker Specialization
                </h3>
                <p className="text-xs text-slate-400 font-semibold font-inter leading-relaxed">
                  Modify certified specialization skills for **{skillsCleaner.name}**.
                </p>
              </div>

              <form onSubmit={handleSaveSkills} className="space-y-5">
                {/* Skills Checklist selection */}
                <div className="space-y-2">
                  <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Specialties Checklist</label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableSkills.map((skill) => {
                      const isSelected = skillsCleaner.skills.includes(skill);
                      return (
                        <button
                          type="button"
                          key={skill}
                          onClick={() => toggleEditSkill(skill)}
                          className={`px-3 py-3 rounded-xl border text-left text-[9px] font-black uppercase flex items-center justify-between transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-black'
                              : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                          }`}
                        >
                          <span>{skill}</span>
                          {isSelected && <Check size={10} />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-4.5 bg-primary text-white rounded-2xl font-black uppercase tracking-wider text-[10px] shadow-lg shadow-primary/20 hover:scale-101 transition-all cursor-pointer"
                  >
                    Commit Specializations
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. REGISTER NEW CLEANER MODAL DIALOG */}
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
                  Staff Recruitment
                </span>
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-800 flex items-center gap-2">
                  <Plus size={20} className="text-primary" />
                  Provision Cleaner Agent
                </h3>
                <p className="text-xs text-slate-400 font-semibold font-inter leading-relaxed">
                  Recruit and provision a professional cleaning specialist into the Nadif Sétif operational directory.
                </p>
              </div>

              <form onSubmit={handleCreateCleaner} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mourad Chibane"
                      value={createForm.name}
                      onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Email address</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. mourad@nadif.dz"
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
                      placeholder="e.g. 0662 90 90 90"
                      value={createForm.phone}
                      onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all font-mono"
                    />
                  </div>

                  {/* Cleaner status */}
                  <div>
                    <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Initial Dispatch Status</label>
                    <select
                      value={createForm.status}
                      onChange={(e) => setCreateForm({ ...createForm, status: e.target.value as any })}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all"
                    >
                      <option value="available">🟢 Available / Disponible</option>
                      <option value="on_duty">🟡 On Duty / Intervention</option>
                      <option value="inactive">🔴 Inactive / Inactif</option>
                    </select>
                  </div>

                  {/* Skills Checklist selection */}
                  <div className="sm:col-span-2 space-y-2">
                    <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Choose Specialist Skills</label>
                    <div className="grid grid-cols-2 gap-2">
                      {availableSkills.map((skill) => {
                        const isSelected = createForm.skills.includes(skill);
                        return (
                          <button
                            type="button"
                            key={skill}
                            onClick={() => toggleCreateSkill(skill)}
                            className={`px-3 py-3 rounded-xl border text-left text-[9px] font-black uppercase flex items-center justify-between transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-black'
                                : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                            }`}
                          >
                            <span>{skill}</span>
                            {isSelected && <Check size={10} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Secure Password input */}
                  <div className="sm:col-span-2 space-y-1.5 pt-2">
                    <label className="block text-[9px] font-black uppercase text-emerald-600 mb-1.5 flex items-center gap-1">
                      <Sparkles size={10} />
                      Worker App Login Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Assign security password for cleaner mobile login..."
                      value={createForm.password}
                      onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                      className="w-full px-4 py-3.5 bg-emerald-50/20 border border-emerald-100 rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-emerald-300 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-4.5 bg-primary text-white rounded-2xl font-black uppercase tracking-wider text-[10px] shadow-xl shadow-primary/25 hover:scale-101 active:scale-99 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Plus size={14} />
                    Deploy Cleaner Record
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. FULL WORKER EDITOR MODAL DIALOG */}
      <AnimatePresence>
        {editingCleaner && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border border-slate-100 rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl space-y-6 relative overflow-hidden"
            >
              <button
                onClick={() => setEditingCleaner(null)}
                className="absolute right-6 top-6 w-9 h-9 rounded-xl border border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>

              <div className="space-y-1.5 pr-8">
                <span className="text-[8px] font-black uppercase text-primary tracking-widest bg-primary/5 border border-primary/10 px-2 py-0.5 rounded-full inline-block">
                  Recruitment Center
                </span>
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-800">
                  Modify Worker Profile
                </h3>
                <p className="text-xs text-slate-400 font-semibold font-inter leading-relaxed">
                  Update personal coordinates, operating Wilaya, and settings for **{editingCleaner.name}**.
                </p>
              </div>

              <form onSubmit={handleUpdateCleaner} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      required
                      value={editingCleaner.name}
                      onChange={(e) => setEditingCleaner({ ...editingCleaner, name: e.target.value })}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Email address</label>
                    <input
                      type="email"
                      required
                      value={editingCleaner.email}
                      onChange={(e) => setEditingCleaner({ ...editingCleaner, email: e.target.value })}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={editingCleaner.phone}
                      onChange={(e) => setEditingCleaner({ ...editingCleaner, phone: e.target.value })}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all font-mono"
                    />
                  </div>

                  {/* Wilaya Center */}
                  <div>
                    <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Operating Wilaya Center</label>
                    <input
                      type="text"
                      required
                      value={editingCleaner.wilaya}
                      onChange={(e) => setEditingCleaner({ ...editingCleaner, wilaya: e.target.value })}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all"
                    />
                  </div>

                  {/* Completed Orders */}
                  <div>
                    <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Completed Job interventions</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={editingCleaner.completedOrders}
                      onChange={(e) => setEditingCleaner({ ...editingCleaner, completedOrders: Number(e.target.value) || 0 })}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-4.5 bg-primary text-white rounded-2xl font-black uppercase tracking-wider text-[10px] shadow-lg shadow-primary/20 hover:scale-101 active:scale-99 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Pencil size={14} />
                    Commit Worker Parameters
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
