'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Plus, 
  Search, 
  Trash2, 
  Pencil, 
  CheckCircle, 
  X, 
  Briefcase, 
  Layers, 
  Users,
  Eye,
  Phone,
  Mail,
  Award
} from 'lucide-react';
import { cleanersApi, type ApiCleaner } from '../../lib/api';

// Skill Interface
interface SpecialistSkill {
  id: string;
  name: string;
  description: string;
  color: 'indigo' | 'emerald' | 'rose' | 'amber' | 'purple' | 'slate';
}

// Cleaners are now ApiCleaner imported from api.ts

// Initial Seeds
const DEFAULT_SKILLS: SpecialistSkill[] = [
  {
    id: 'SKL-01',
    name: 'Standard Clean',
    description: 'Basic dust cleaning, vacuuming, surface wiping, and trash removal.',
    color: 'slate'
  },
  {
    id: 'SKL-02',
    name: 'Deep Clean',
    description: 'Heavy grease scrub, bathroom sanitation, cabinet interiors, and deep floor mop.',
    color: 'rose'
  },
  {
    id: 'SKL-03',
    name: 'Steam Mop',
    description: 'Professional high-temperature floor steaming, stain disinfection, and tile shine.',
    color: 'indigo'
  },
  {
    id: 'SKL-04',
    name: 'Sanitization',
    description: 'Anti-bacterial misting, virus sanitization, and premium chemical disinfection.',
    color: 'emerald'
  },
  {
    id: 'SKL-05',
    name: 'Ironing',
    description: 'Professional fabric steam pressing, clothes folding, and clean garment organization.',
    color: 'amber'
  },
  {
    id: 'SKL-06',
    name: 'Symmetrical Windows',
    description: 'Streak-free window frame squeegee, double-sided glass polishing, and pane wash.',
    color: 'purple'
  }
];

export default function SkillsManager() {
  const [skills, setSkills] = useState<SpecialistSkill[]>([]);
  const [cleaners, setCleaners] = useState<ApiCleaner[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // UI Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<SpecialistSkill | null>(null);
  const [viewingWorkersSkill, setViewingWorkersSkill] = useState<SpecialistSkill | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  
  // Assign Cleaner states
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedCleanerToAssign, setSelectedCleanerToAssign] = useState("");

  // Creation form state
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    color: 'slate' as 'indigo' | 'emerald' | 'rose' | 'amber' | 'purple' | 'slate'
  });

  // Load databases
  useEffect(() => {
    // 1. Load Skills list
    const storedSkills = localStorage.getItem('nadif_skills_list');
    let activeSkills = DEFAULT_SKILLS;
    if (storedSkills) {
      activeSkills = JSON.parse(storedSkills);
      setSkills(activeSkills);
    } else {
      localStorage.setItem('nadif_skills_list', JSON.stringify(DEFAULT_SKILLS));
      setSkills(DEFAULT_SKILLS);
    }

    // 2. Load Cleaners list from API
    cleanersApi.getAll().then(data => {
      setCleaners(data);
    }).catch(err => {
      console.error("Failed to fetch cleaners:", err);
    });
    
    setIsLoaded(true);
  }, []);

  const saveToDb = (updated: SpecialistSkill[]) => {
    setSkills(updated);
    localStorage.setItem('nadif_skills_list', JSON.stringify(updated));
  };

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Add Skill
  const handleCreateSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name || !createForm.description) return;

    // Check duplication
    const duplicate = skills.some(s => s.name.toLowerCase() === createForm.name.toLowerCase());
    if (duplicate) {
      alert("⚠️ A specialist skill with this name already exists in the catalog.");
      return;
    }

    const newSkill: SpecialistSkill = {
      id: `SKL-${Math.floor(10 + Math.random() * 89)}`,
      name: createForm.name,
      description: createForm.description,
      color: createForm.color
    };

    const updated = [...skills, newSkill];
    saveToDb(updated);
    setIsAddOpen(false);
    setCreateForm({
      name: '',
      description: '',
      color: 'slate'
    });
    triggerToast(`✨ Specialist skill "${newSkill.name}" created successfully!`);
  };

  // Edit Skill
  const handleUpdateSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSkill) return;

    const updated = skills.map(s => s.id === editingSkill.id ? editingSkill : s);
    saveToDb(updated);
    
    // Symmetrically update existing cleaners' skills names if a skill name was renamed!
    const oldSkill = skills.find(s => s.id === editingSkill.id);
    if (oldSkill && oldSkill.name !== editingSkill.name) {
      Promise.all(cleaners.map(async (c) => {
        if (c.skills.includes(oldSkill.name)) {
          const updatedSkillsList = c.skills.map(s => s === oldSkill.name ? editingSkill.name : s);
          await cleanersApi.update(c.id, { skills: updatedSkillsList });
        }
      })).then(() => cleanersApi.getAll().then(setCleaners));
    }

    setEditingSkill(null);
    triggerToast(`✏️ Skill specifications updated for "${editingSkill.name}"!`);
  };

  // Delete Skill
  const handleDeleteSkill = (id: string, name: string) => {
    // Check if any cleaner holds this skill
    const assignedCleanersCount = cleaners.filter(c => c.skills.includes(name)).length;
    if (assignedCleanersCount > 0) {
      const confirmForce = confirm(
        `⚠️ WARNING: There are ${assignedCleanersCount} active cleaners certified in "${name}". \n\nDeleting this skill will automatically revoke it from all assigned cleaner profiles. Do you want to proceed?`
      );
      if (!confirmForce) return;
    } else {
      if (!confirm(`Are you sure you want to permanently delete the specialist skill: "${name}"?`)) {
        return;
      }
    }

    const updated = skills.filter(s => s.id !== id);
    saveToDb(updated);

    // Symmetrically revoke the deleted skill from all active cleaners rosters
    Promise.all(cleaners.map(async (c) => {
      if (c.skills.includes(name)) {
        const revoked = c.skills.filter(s => s !== name);
        await cleanersApi.update(c.id, { skills: revoked });
      }
    })).then(() => cleanersApi.getAll().then(setCleaners));

    triggerToast(`🗑️ Specialist skill "${name}" removed from the master catalog.`);
  };

  // Assign / Remove cleaner from skill
  const handleAssignCleaner = async () => {
    if (!selectedCleanerToAssign || !viewingWorkersSkill) return;
    const cleanerToUpdate = cleaners.find(c => c.id === selectedCleanerToAssign);
    if (!cleanerToUpdate) return;

    const newSkills = [...cleanerToUpdate.skills, viewingWorkersSkill.name];
    try {
      await cleanersApi.update(cleanerToUpdate.id, { skills: newSkills });
      const updatedData = await cleanersApi.getAll();
      setCleaners(updatedData);
      setSelectedCleanerToAssign("");
      setIsAssigning(false);
      triggerToast(`✅ Cleaner assigned to ${viewingWorkersSkill.name}!`);
    } catch (err) {
      console.error(err);
      triggerToast(`❌ Failed to assign cleaner.`);
    }
  };

  const handleRemoveCleaner = async (cleanerId: string) => {
    if (!viewingWorkersSkill) return;
    if (!confirm(`Are you sure you want to revoke this skill?`)) return;
    const cleanerToUpdate = cleaners.find(c => c.id === cleanerId);
    if (!cleanerToUpdate) return;
    
    const newSkills = cleanerToUpdate.skills.filter(s => s !== viewingWorkersSkill.name);
    try {
      await cleanersApi.update(cleanerToUpdate.id, { skills: newSkills });
      const updatedData = await cleanersApi.getAll();
      setCleaners(updatedData);
      triggerToast(`❌ Skill revoked from cleaner.`);
    } catch (err) {
      console.error(err);
      triggerToast(`❌ Failed to revoke skill.`);
    }
  };

  // Filtered skills
  const filteredSkills = skills.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <Sparkles size={14} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Master Roster Skills</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-800 uppercase italic">
            Specialist <span className="text-primary">Skills</span>
          </h1>
          <p className="text-sm text-slate-400 font-medium font-inter">
            Administer the master catalog of certified specialties. Add new cleaning operational scopes which will dynamically populate your cleaner rosters.
          </p>
        </div>

        {/* Create Skill button */}
        <button
          onClick={() => setIsAddOpen(true)}
          className="px-6 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-wider text-[10px] shadow-lg shadow-primary/20 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2.5 cursor-pointer self-start md:self-center"
        >
          <Plus size={15} />
          Create Specialty
        </button>
      </div>

      {/* 2. Top Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: "Skills Registered", val: skills.length, icon: Sparkles, color: "text-purple-500 bg-purple-50 border-purple-100/50" },
          { label: "Active Sectors", val: 3, icon: Layers, color: "text-blue-500 bg-blue-50 border-blue-100/50" },
          { label: "Certified Staff Count", val: cleaners.length, icon: Users, color: "text-emerald-500 bg-emerald-50 border-emerald-100/50" }
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

      {/* 3. Search Bar & Directory Table */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search bar input */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Rechercher une compétence ou description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all font-inter"
            />
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase tracking-wider">
            {filteredSkills.length} Specialties Loaded
          </span>
        </div>

        {/* 4. Table */}
        {!isLoaded ? (
          <div className="min-h-[20vh] flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredSkills.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-[2rem] space-y-3">
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-3xl flex items-center justify-center mx-auto text-xl font-bold">
              🛠️
            </div>
            <h4 className="text-sm font-black uppercase text-slate-700">No Specialist Skills Found</h4>
            <p className="text-xs text-slate-400 font-semibold font-inter max-w-sm mx-auto">
              We couldn't locate any skills matching your search parameters. Try verifying terms.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[2rem] border border-slate-50">
            <table className="w-full border-collapse text-left min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 bg-slate-50/50">
                  <th className="py-4 pl-6">Specialty Skill / ID</th>
                  <th className="py-4">Scope Description</th>
                  <th className="py-4">Certified Workers Roster</th>
                  <th className="py-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700">
                {filteredSkills.map((skill) => {
                  // Compute dynamic assigned workers count
                  const cleanersCount = cleaners.filter(c => c.skills.includes(skill.name)).length;
                  return (
                    <tr key={skill.id} className="hover:bg-slate-50/40 transition-colors font-semibold">
                      
                      {/* Name & Accent Color badge */}
                      <td className="py-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-3.5 h-3.5 rounded-full shrink-0 ${
                            skill.color === 'rose'
                              ? 'bg-rose-500 shadow-md shadow-rose-200'
                              : skill.color === 'emerald'
                                ? 'bg-emerald-500 shadow-md shadow-emerald-200'
                                : skill.color === 'indigo'
                                  ? 'bg-indigo-500 shadow-md shadow-indigo-200'
                                  : skill.color === 'amber'
                                    ? 'bg-amber-500 shadow-md shadow-amber-200'
                                    : skill.color === 'purple'
                                      ? 'bg-purple-500 shadow-md shadow-purple-200'
                                      : 'bg-slate-400 shadow-md shadow-slate-200'
                          }`} />
                          <div className="space-y-0.5">
                            <span className="text-xs font-black text-slate-800">{skill.name}</span>
                            <p className="text-[9px] font-mono text-slate-400 font-bold uppercase">{skill.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="py-4 text-xs font-inter text-slate-500 font-semibold max-w-[320px] leading-relaxed">
                        {skill.description}
                      </td>

                      {/* Assigned Workers Count */}
                      <td className="py-4">
                        <div className="flex items-center">
                          <button
                            onClick={() => setViewingWorkersSkill(skill)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase font-inter border transition-all cursor-pointer ${
                              cleanersCount > 0 
                                ? 'bg-emerald-50 hover:bg-emerald-100/80 border-emerald-100 hover:border-emerald-200 text-emerald-700' 
                                : 'bg-slate-50 hover:bg-slate-100/80 border-slate-100 hover:border-slate-200 text-slate-500'
                            }`}
                            title="Click to view certified workers list"
                          >
                            <Briefcase size={10} className="text-slate-400 shrink-0" />
                            <span>{cleanersCount} Cleaners Certified</span>
                            <Eye size={10} className="ml-0.5 opacity-60 shrink-0" />
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 pr-6 text-right">
                        <div className="flex justify-end gap-2">
                          {/* View certified workers */}
                          <button
                            onClick={() => setViewingWorkersSkill(skill)}
                            className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 border border-slate-100 text-slate-400 flex items-center justify-center transition-all cursor-pointer"
                            title="View Certified Specialists"
                          >
                            <Users size={12} />
                          </button>

                          {/* Edit skill */}
                          <button
                            onClick={() => setEditingSkill(skill)}
                            className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100 text-slate-400 flex items-center justify-center transition-all cursor-pointer"
                            title="Edit Skill Details"
                          >
                            <Pencil size={12} />
                          </button>

                          {/* Delete skill */}
                          <button
                            onClick={() => handleDeleteSkill(skill.id, skill.name)}
                            className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-rose-50 hover:text-rose-600 border border-slate-100 text-rose-400 flex items-center justify-center transition-all cursor-pointer"
                            title="Delete Skill"
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

      {/* 5. ADD SKILL DIALOG PANEL */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border border-slate-100 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl space-y-6 relative overflow-hidden"
            >
              <button
                onClick={() => setIsAddOpen(false)}
                className="absolute right-6 top-6 w-9 h-9 rounded-xl border border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>

              <div className="space-y-1.5 pr-8">
                <span className="text-[8px] font-black uppercase text-primary tracking-widest bg-primary/5 border border-primary/10 px-2 py-0.5 rounded-full inline-block">
                  Master Roster
                </span>
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-800">
                  Create Specialty
                </h3>
                <p className="text-xs text-slate-400 font-semibold font-inter leading-relaxed">
                  Establish a new certified operation which will immediately appear as a checklist item in cleaner rosters.
                </p>
              </div>

              <form onSubmit={handleCreateSkill} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Specialty Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Carpet Extraction"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Scope Description</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe operating methods, chemicals, and equipment certifications required for this skill..."
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all resize-none font-inter leading-relaxed"
                  />
                </div>

                {/* Accent Color Selection */}
                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Accent Color Badge</label>
                  <div className="grid grid-cols-6 gap-2">
                    {[
                      { id: 'slate', color: 'bg-slate-400' },
                      { id: 'rose', color: 'bg-rose-500' },
                      { id: 'indigo', color: 'bg-indigo-500' },
                      { id: 'emerald', color: 'bg-emerald-500' },
                      { id: 'amber', color: 'bg-amber-500' },
                      { id: 'purple', color: 'bg-purple-500' }
                    ].map((col) => (
                      <button
                        type="button"
                        key={col.id}
                        onClick={() => setCreateForm({ ...createForm, color: col.id as any })}
                        className={`h-10 rounded-xl cursor-pointer transition-all border flex items-center justify-center ${col.color} ${
                          createForm.color === col.id 
                            ? 'border-slate-800 scale-105 shadow-md shadow-slate-200' 
                            : 'border-transparent'
                        }`}
                      >
                        {createForm.color === col.id && <span className="text-white text-[10px]">✔</span>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-wider text-[10px] shadow-lg shadow-primary/20 hover:scale-101 transition-all cursor-pointer"
                  >
                    Deploy Specialty Skill
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. EDIT SKILL DIALOG PANEL */}
      <AnimatePresence>
        {editingSkill && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border border-slate-100 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl space-y-6 relative overflow-hidden"
            >
              <button
                onClick={() => setEditingSkill(null)}
                className="absolute right-6 top-6 w-9 h-9 rounded-xl border border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>

              <div className="space-y-1.5 pr-8">
                <span className="text-[8px] font-black uppercase text-primary tracking-widest bg-primary/5 border border-primary/10 px-2 py-0.5 rounded-full inline-block">
                  Master Roster
                </span>
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-800">
                  Modify Specialty
                </h3>
                <p className="text-xs text-slate-400 font-semibold font-inter leading-relaxed">
                  Update name, colored badges, and operating scope parameters for this certified skill.
                </p>
              </div>

              <form onSubmit={handleUpdateSkill} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Specialty Name</label>
                  <input
                    type="text"
                    required
                    value={editingSkill.name}
                    onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Scope Description</label>
                  <textarea
                    required
                    rows={3}
                    value={editingSkill.description}
                    onChange={(e) => setEditingSkill({ ...editingSkill, description: e.target.value })}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all resize-none font-inter leading-relaxed"
                  />
                </div>

                {/* Accent Color Selection */}
                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Accent Color Badge</label>
                  <div className="grid grid-cols-6 gap-2">
                    {[
                      { id: 'slate', color: 'bg-slate-400' },
                      { id: 'rose', color: 'bg-rose-500' },
                      { id: 'indigo', color: 'bg-indigo-500' },
                      { id: 'emerald', color: 'bg-emerald-500' },
                      { id: 'amber', color: 'bg-amber-500' },
                      { id: 'purple', color: 'bg-purple-500' }
                    ].map((col) => (
                      <button
                        type="button"
                        key={col.id}
                        onClick={() => setEditingSkill({ ...editingSkill, color: col.id as any })}
                        className={`h-10 rounded-xl cursor-pointer transition-all border flex items-center justify-center ${col.color} ${
                          editingSkill.color === col.id 
                            ? 'border-slate-800 scale-105 shadow-md shadow-slate-200' 
                            : 'border-transparent'
                        }`}
                      >
                        {editingSkill.color === col.id && <span className="text-white text-[10px]">✔</span>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-wider text-[10px] shadow-lg shadow-primary/20 hover:scale-101 transition-all cursor-pointer"
                  >
                    Commit Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. CERTIFIED WORKERS VIEW DIALOG */}
      <AnimatePresence>
        {viewingWorkersSkill && (() => {
          const certifiedStaff = cleaners.filter(c => c.skills.includes(viewingWorkersSkill.name));
          return (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white border border-slate-100 rounded-[2.5rem] w-full max-w-2xl p-8 shadow-2xl space-y-6 relative overflow-hidden max-h-[90vh] flex flex-col"
              >
                <button
                  onClick={() => {
                    setViewingWorkersSkill(null);
                    setIsAssigning(false);
                    setSelectedCleanerToAssign("");
                  }}
                  className="absolute right-6 top-6 w-9 h-9 rounded-xl border border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer z-10"
                >
                  <X size={15} />
                </button>

                <div className="space-y-1.5 pr-8 shrink-0">
                  <span className={`inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                    viewingWorkersSkill.color === 'rose'
                      ? 'bg-rose-50 border-rose-100 text-rose-600'
                      : viewingWorkersSkill.color === 'emerald'
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                        : viewingWorkersSkill.color === 'indigo'
                          ? 'bg-indigo-50 border-indigo-100 text-indigo-600'
                          : viewingWorkersSkill.color === 'amber'
                            ? 'bg-amber-50 border-amber-100 text-amber-600'
                            : viewingWorkersSkill.color === 'purple'
                              ? 'bg-purple-50 border-purple-100 text-purple-600'
                              : 'bg-slate-50 border-slate-100 text-slate-500'
                  }`}>
                    Certified Roster
                  </span>
                  <h3 className="text-xl font-black uppercase tracking-tight text-slate-800 flex items-center gap-2">
                    <Users size={18} className="text-primary" />
                    {viewingWorkersSkill.name} Specialists
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold font-inter leading-relaxed">
                    Below are the cleaning agents certified to perform **{viewingWorkersSkill.name}** operations.
                  </p>
                </div>

                {/* Assign Cleaner Header */}
                <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-4 border border-slate-100 shrink-0">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Skill Certification</p>
                    <p className="text-xs font-medium text-slate-400">Add a cleaner to this roster</p>
                  </div>
                  {!isAssigning ? (
                    <button
                      onClick={() => setIsAssigning(true)}
                      className="px-4 py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-blue-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Plus size={12} /> Assign Cleaner
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedCleanerToAssign}
                        onChange={(e) => setSelectedCleanerToAssign(e.target.value)}
                        className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-primary"
                      >
                        <option value="">Select cleaner...</option>
                        {cleaners.filter(c => !c.skills.includes(viewingWorkersSkill.name)).map(c => (
                          <option key={c.id} value={c.id}>{c.fullName}</option>
                        ))}
                      </select>
                      <button
                        onClick={handleAssignCleaner}
                        disabled={!selectedCleanerToAssign}
                        className="px-3 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-emerald-600 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => {
                          setIsAssigning(false);
                          setSelectedCleanerToAssign("");
                        }}
                        className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto pr-1 space-y-3 [scrollbar-width:thin] max-h-[50vh]">
                  {certifiedStaff.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-slate-100 rounded-2xl space-y-2">
                      <p className="text-xs text-slate-400 font-bold uppercase">No Cleaners Certified Yet</p>
                      <p className="text-[11px] text-slate-400 font-medium font-inter max-w-xs mx-auto">
                        Assign this specialty skill to cleaner profiles inside the Cleaners Workers dashboard to see them listed here.
                      </p>
                    </div>
                  ) : (
                    certifiedStaff.map((cleaner) => {
                      const initials = cleaner.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                      return (
                        <div key={cleaner.id} className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-sm select-none shrink-0 font-gilmer">
                              {initials}
                            </div>
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-black text-slate-800">{cleaner.fullName}</span>
                                {/* <span className="text-[9px] font-black text-slate-400 uppercase">({cleaner.wilaya})</span> */}
                              </div>
                              <p className="text-[9px] font-mono text-slate-400 font-bold uppercase">{cleaner.id}</p>
                            </div>
                          </div>

                          <div className="space-y-1 font-inter text-[10px] text-slate-500 font-semibold shrink-0">
                            {cleaner.phone && (
                              <div className="flex items-center gap-1">
                                <Phone size={9} className="text-slate-400 shrink-0" />
                                <span className="font-mono">{cleaner.phone}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                            <div className="flex items-center gap-1 font-inter text-[10px] font-black text-slate-700">
                              <Award size={11} className="text-slate-400 shrink-0" />
                              {/* <span>{cleaner.completedOrders || 0} Jobs</span> */}
                            </div>
                            <span className={`px-2.5 py-1 rounded-lg text-[8.5px] font-black uppercase tracking-wider ${
                              cleaner.isActive
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-slate-100 text-slate-500'
                            }`}>
                              {cleaner.isActive ? 'Actif' : 'Inactif'}
                            </span>
                            
                            {/* Remove button */}
                            <button
                              onClick={() => handleRemoveCleaner(cleaner.id)}
                              className="ml-2 w-7 h-7 flex items-center justify-center rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors cursor-pointer"
                              title="Revoke Certification"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="pt-2 shrink-0">
                  <button
                    onClick={() => {
                      setViewingWorkersSkill(null);
                      setIsAssigning(false);
                      setSelectedCleanerToAssign("");
                    }}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-wider text-[10px] shadow-lg shadow-slate-900/10 hover:scale-101 transition-all cursor-pointer text-center"
                  >
                    Close Detail View
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

    </div>
  );
}
