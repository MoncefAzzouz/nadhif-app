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
  Award,
  Code,
  Copy,
  Check
} from 'lucide-react';
import { 
  cleanersApi, 
  servicesApi, 
  categoriesApi, 
  skillsApi, 
  serviceTiersApi,
  type ApiCleaner, 
  type ApiService, 
  type ApiCategory, 
  type ApiSkill,
  type ApiSubscriptionServiceTier
} from '../../lib/api';

export default function SkillsManager() {
  const [skills, setSkills] = useState<ApiSkill[]>([]);
  const [cleaners, setCleaners] = useState<ApiCleaner[]>([]);
  const [services, setServices] = useState<ApiService[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [serviceTiers, setServiceTiers] = useState<ApiSubscriptionServiceTier[]>([]);
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // UI Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<ApiSkill | null>(null);
  const [viewingWorkersSkill, setViewingWorkersSkill] = useState<ApiSkill | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  
  // JSON API Modal
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Assign Cleaner states
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedCleanerToAssign, setSelectedCleanerToAssign] = useState("");

  // Creation form state
  const [createForm, setCreateForm] = useState({
    name: '',
    nameAr: '',
    nameFr: '',
    description: '',
    color: 'slate',
    serviceIds: [] as string[],
    categoryIds: [] as string[],
    serviceTierIds: [] as string[]
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    id: '',
    name: '',
    nameAr: '',
    nameFr: '',
    description: '',
    color: 'slate',
    serviceIds: [] as string[],
    categoryIds: [] as string[],
    serviceTierIds: [] as string[]
  });

  // Load database entities
  useEffect(() => {
    const loadData = async () => {
      try {
        const [skData, clData, svData, catData, stData] = await Promise.all([
          skillsApi.getAll(),
          cleanersApi.getAll(),
          servicesApi.getAll(),
          categoriesApi.getAll(),
          serviceTiersApi.getAll()
        ]);
        setSkills(skData);
        setCleaners(clData);
        setServices(svData);
        setCategories(catData);
        setServiceTiers(stData);
      } catch (err) {
        console.error("Failed to load skills page dependencies:", err);
      } finally {
        setIsLoaded(true);
      }
    };
    loadData();
  }, []);

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(skills, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartEdit = (skill: ApiSkill) => {
    setEditingSkill(skill);
    setEditForm({
      id: skill.id,
      name: skill.name,
      nameAr: skill.nameAr || '',
      nameFr: skill.nameFr || '',
      description: skill.description || '',
      color: skill.color || 'slate',
      serviceIds: skill.services?.map(s => s.id) || [],
      categoryIds: skill.categories?.map(c => c.id) || [],
      serviceTierIds: skill.subscriptionServiceTiers?.map(st => st.id) || []
    });
  };

  // Add Skill
  const handleCreateSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name) return;

    // Check duplication
    const duplicate = skills.some(s => s.name.toLowerCase() === createForm.name.toLowerCase());
    if (duplicate) {
      alert("⚠️ Une compétence portant ce nom existe déjà.");
      return;
    }

    try {
      const payload = {
        name: createForm.name,
        nameAr: createForm.nameAr,
        nameFr: createForm.nameFr,
        description: createForm.description,
        color: createForm.color,
        serviceIds: createForm.serviceIds,
        categoryIds: createForm.categoryIds,
        serviceTierIds: createForm.serviceTierIds
      };

      const newSkill = await skillsApi.create(payload);
      setSkills(prev => [newSkill, ...prev]);
      setIsAddOpen(false);
      setCreateForm({
        name: '',
        nameAr: '',
        nameFr: '',
        description: '',
        color: 'slate',
        serviceIds: [],
        categoryIds: [],
        serviceTierIds: []
      });
      triggerToast(`✨ Compétence "${newSkill.name}" créée avec succès !`);
    } catch (err: any) {
      console.error(err);
      alert(`Erreur de création : ${err.message || err}`);
    }
  };

  // Edit Skill
  const handleUpdateSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSkill) return;

    try {
      const payload = {
        name: editForm.name,
        nameAr: editForm.nameAr,
        nameFr: editForm.nameFr,
        description: editForm.description,
        color: editForm.color,
        serviceIds: editForm.serviceIds,
        categoryIds: editForm.categoryIds,
        serviceTierIds: editForm.serviceTierIds
      };

      const updated = await skillsApi.update(editForm.id, payload);
      setSkills(prev => prev.map(s => s.id === editForm.id ? updated : s));
      
      // Update cleaners skills names symmetrically if rename occurred
      const oldSkill = skills.find(s => s.id === editForm.id);
      if (oldSkill && oldSkill.name !== editForm.name) {
        await Promise.all(cleaners.map(async (c) => {
          if (c.skills.includes(oldSkill.name)) {
            const updatedSkillsList = c.skills.map(s => s === oldSkill.name ? editForm.name : s);
            await cleanersApi.update(c.id, { skills: updatedSkillsList });
          }
        }));
        const updatedCleaners = await cleanersApi.getAll();
        setCleaners(updatedCleaners);
      }

      setEditingSkill(null);
      triggerToast(`✏️ Compétence "${editForm.name}" mise à jour !`);
    } catch (err: any) {
      console.error(err);
      alert(`Erreur de modification : ${err.message || err}`);
    }
  };

  // Delete Skill
  const handleDeleteSkill = async (id: string, name: string) => {
    // Check if any cleaner holds this skill
    const assignedCleanersCount = cleaners.filter(c => c.skills.includes(name)).length;
    if (assignedCleanersCount > 0) {
      const confirmForce = confirm(
        `⚠️ ATTENTION: Il y a ${assignedCleanersCount} cleaner(s) actif(s) certifié(s) en "${name}". \n\nSupprimer cette compétence la révoquera automatiquement de tous leurs profils. Voulez-vous continuer ?`
      );
      if (!confirmForce) return;
    } else {
      if (!confirm(`Voulez-vous vraiment supprimer définitivement la compétence : "${name}" ?`)) {
        return;
      }
    }

    try {
      await skillsApi.delete(id);
      setSkills(prev => prev.filter(s => s.id !== id));

      // Symmetrically revoke the deleted skill from all cleaners
      await Promise.all(cleaners.map(async (c) => {
        if (c.skills.includes(name)) {
          const revoked = c.skills.filter(s => s !== name);
          await cleanersApi.update(c.id, { skills: revoked });
        }
      }));

      const updatedCleaners = await cleanersApi.getAll();
      setCleaners(updatedCleaners);
      triggerToast(`🗑️ Compétence "${name}" retirée du catalogue.`);
    } catch (err: any) {
      console.error(err);
      alert(`Erreur de suppression : ${err.message || err}`);
    }
  };

  // Assign cleaner to skill
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
      triggerToast(`✅ Cleaner assigné à la compétence ${viewingWorkersSkill.name} !`);
    } catch (err) {
      console.error(err);
      triggerToast(`❌ Échec de l'assignation du cleaner.`);
    }
  };

  // Revoke cleaner from skill
  const handleRemoveCleaner = async (cleanerId: string) => {
    if (!viewingWorkersSkill) return;
    if (!confirm(`Voulez-vous révoquer cette compétence pour ce cleaner ?`)) return;
    const cleanerToUpdate = cleaners.find(c => c.id === cleanerId);
    if (!cleanerToUpdate) return;
    
    const newSkills = cleanerToUpdate.skills.filter(s => s !== viewingWorkersSkill.name);
    try {
      await cleanersApi.update(cleanerToUpdate.id, { skills: newSkills });
      const updatedData = await cleanersApi.getAll();
      setCleaners(updatedData);
      triggerToast(`❌ Compétence révoquée.`);
    } catch (err) {
      console.error(err);
      triggerToast(`❌ Échec de la révocation.`);
    }
  };

  // Search filter
  const filteredSkills = skills.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (s.nameAr && s.nameAr.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (s.nameFr && s.nameFr.toLowerCase().includes(searchQuery.toLowerCase()))
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
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Compétences du personnel</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-800 uppercase italic">
            Gestion des <span className="text-primary">Compétences</span>
          </h1>
          <p className="text-sm text-slate-400 font-medium font-inter">
            Définissez les spécialités professionnelles et associez-les à des services ou catégories pour prioriser les cleaners lors de l'attribution.
          </p>
        </div>

        <div className="flex gap-2 self-start md:self-center">
          <button
            onClick={() => setIsJsonModalOpen(true)}
            className="px-5 py-4 bg-white border border-slate-100 hover:bg-slate-50 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-sm"
          >
            <Code size={14} /> Voir JSON API
          </button>
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-6 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-wider text-[10px] shadow-lg shadow-primary/20 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Plus size={15} />
            Créer une Compétence
          </button>
        </div>
      </div>

      {/* 2. Top Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: "Compétences Enregistrées", val: skills.length, icon: Sparkles, color: "text-purple-500 bg-purple-50 border-purple-100/50" },
          { label: "Services Reliés (Total)", val: skills.reduce((acc, s) => acc + (s.services?.length || 0) + (s.subscriptionServiceTiers?.length || 0), 0), icon: Layers, color: "text-blue-500 bg-blue-50 border-blue-100/50" },
          { label: "Catégories Reliées (Total)", val: skills.reduce((acc, s) => acc + (s.categories?.length || 0), 0), icon: Users, color: "text-emerald-500 bg-emerald-50 border-emerald-100/50" }
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex items-center justify-between gap-4 hover:shadow-md transition-shadow">
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
          
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Rechercher une compétence..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all font-inter"
            />
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase tracking-wider">
            {filteredSkills.length} Spécialités chargées
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
            <h4 className="text-sm font-black uppercase text-slate-700">Aucune Compétence Trouvée</h4>
            <p className="text-xs text-slate-400 font-semibold font-inter max-w-sm mx-auto">
              Nous n'avons trouvé aucune compétence correspondant à votre recherche.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[2rem] border border-slate-50">
            <table className="w-full border-collapse text-left min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 bg-slate-50/50">
                  <th className="py-4 pl-6">Compétence / Traductions</th>
                  <th className="py-4">Association Cible</th>
                  <th className="py-4">Description</th>
                  <th className="py-4">Membres Certifiés</th>
                  <th className="py-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700">
                {filteredSkills.map((skill) => {
                  const cleanersCount = cleaners.filter(c => c.skills.includes(skill.name)).length;
                  return (
                    <tr key={skill.id} className="hover:bg-slate-50/40 transition-colors font-semibold">
                      
                      {/* Name & Badge color */}
                      <td className="py-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-3.5 h-3.5 rounded-full shrink-0 ${
                            skill.color === 'rose' ? 'bg-rose-500' :
                            skill.color === 'emerald' ? 'bg-emerald-500' :
                            skill.color === 'indigo' ? 'bg-indigo-500' :
                            skill.color === 'amber' ? 'bg-amber-500' :
                            skill.color === 'purple' ? 'bg-purple-500' : 'bg-slate-400'
                          }`} />
                          <div className="space-y-0.5">
                            <span className="text-xs font-black text-slate-800">{skill.name}</span>
                            <div className="text-[9px] text-slate-400 font-bold flex gap-2 font-inter">
                              <span>FR: {skill.nameFr || '-'}</span>
                              <span>•</span>
                              <span className="text-right">AR: {skill.nameAr || '-'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Associations badges */}
                      <td className="py-4">
                        <div className="flex flex-wrap gap-1 max-w-[250px]">
                          {skill.services && skill.services.map(s => (
                            <span key={s.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-700 rounded-xl text-[9px] font-black uppercase tracking-wider">
                              ⚡ {s.name}
                            </span>
                          ))}
                          {skill.categories && skill.categories.map(c => (
                            <span key={c.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-100 text-amber-700 rounded-xl text-[9px] font-black uppercase tracking-wider">
                              📁 {c.name}
                            </span>
                          ))}
                          {skill.subscriptionServiceTiers && skill.subscriptionServiceTiers.map(st => (
                            <span key={st.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 border border-purple-100 text-purple-700 rounded-xl text-[9px] font-black uppercase tracking-wider">
                              📅 {st.name}
                            </span>
                          ))}
                          {(!skill.services || skill.services.length === 0) && 
                           (!skill.categories || skill.categories.length === 0) && 
                           (!skill.subscriptionServiceTiers || skill.subscriptionServiceTiers.length === 0) && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 border border-slate-100 text-slate-500 rounded-xl text-[9px] font-black uppercase tracking-wider">
                              🌐 Globale
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Description */}
                      <td className="py-4 text-xs font-inter text-slate-500 font-semibold max-w-[250px] truncate leading-relaxed">
                        {skill.description || 'Aucune description'}
                      </td>

                      {/* Roster Certified */}
                      <td className="py-4">
                        <div className="flex items-center">
                          <button
                            onClick={() => setViewingWorkersSkill(skill)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase font-inter border transition-all cursor-pointer ${
                              cleanersCount > 0 
                                ? 'bg-emerald-50 hover:bg-emerald-100/80 border-emerald-100 hover:border-emerald-200 text-emerald-700' 
                                : 'bg-slate-50 hover:bg-slate-100/80 border-slate-100 hover:border-slate-200 text-slate-500'
                            }`}
                          >
                            <Briefcase size={10} className="text-slate-400 shrink-0" />
                            <span>{cleanersCount} Cleaner(s) Certifié(s)</span>
                            <Eye size={10} className="ml-0.5 opacity-60 shrink-0" />
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 pr-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setViewingWorkersSkill(skill)}
                            className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 border border-slate-100 text-slate-400 flex items-center justify-center transition-all cursor-pointer"
                            title="Voir les agents"
                          >
                            <Users size={12} />
                          </button>

                          <button
                            onClick={() => handleStartEdit(skill)}
                            className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100 text-slate-400 flex items-center justify-center transition-all cursor-pointer"
                            title="Modifier"
                          >
                            <Pencil size={12} />
                          </button>

                          <button
                            onClick={() => handleDeleteSkill(skill.id, skill.name)}
                            className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-rose-50 hover:text-rose-600 border border-slate-100 text-rose-400 flex items-center justify-center transition-all cursor-pointer"
                            title="Supprimer"
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
              className="bg-white border border-slate-100 rounded-[2.5rem] w-full max-w-xl p-8 shadow-2xl space-y-4 relative overflow-hidden"
            >
              <button
                onClick={() => setIsAddOpen(false)}
                className="absolute right-6 top-6 w-9 h-9 rounded-xl border border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>

              <div className="space-y-1 pr-8">
                <span className="text-[8px] font-black uppercase text-primary tracking-widest bg-primary/5 border border-primary/10 px-2 py-0.5 rounded-full inline-block">
                  Master Roster
                </span>
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-800">
                  Créer une Compétence
                </h3>
              </div>

              <form onSubmit={handleCreateSkill} className="space-y-3">
                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Nom (Identifiant Unique)</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Nettoyage Vitres"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Traduction FR</label>
                    <input
                      type="text"
                      placeholder="ex: Nettoyage Vitres"
                      value={createForm.nameFr}
                      onChange={(e) => setCreateForm({ ...createForm, nameFr: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Traduction AR</label>
                    <input
                      type="text"
                      placeholder="ex: تنظيف النوافذ"
                      value={createForm.nameAr}
                      onChange={(e) => setCreateForm({ ...createForm, nameAr: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Many-to-many selectors */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Services Associés</label>
                    <div className="space-y-1.5 max-h-[110px] overflow-y-auto border border-slate-100 rounded-xl p-2.5 bg-slate-50 [scrollbar-width:thin]">
                      {services.length === 0 ? (
                        <p className="text-[10px] text-slate-400 italic font-medium">Aucun service</p>
                      ) : (
                        services.map(s => {
                          const isChecked = createForm.serviceIds.includes(s.id);
                          return (
                            <label key={s.id} className="flex items-center gap-2 text-[10px] font-bold text-slate-700 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  setCreateForm(prev => {
                                    const ids = prev.serviceIds.includes(s.id)
                                      ? prev.serviceIds.filter(id => id !== s.id)
                                      : [...prev.serviceIds, s.id];
                                    return { ...prev, serviceIds: ids };
                                  });
                                }}
                                className="w-3.5 h-3.5 rounded border-slate-200 text-primary focus:ring-primary cursor-pointer"
                              />
                              <span className="truncate">{s.name}</span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Catégories Associées</label>
                    <div className="space-y-1.5 max-h-[110px] overflow-y-auto border border-slate-100 rounded-xl p-2.5 bg-slate-50 [scrollbar-width:thin]">
                      {categories.length === 0 ? (
                        <p className="text-[10px] text-slate-400 italic font-medium">Aucune catégorie</p>
                      ) : (
                        categories.map(c => {
                          const isChecked = createForm.categoryIds.includes(c.id);
                          return (
                            <label key={c.id} className="flex items-center gap-2 text-[10px] font-bold text-slate-700 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  setCreateForm(prev => {
                                    const ids = prev.categoryIds.includes(c.id)
                                      ? prev.categoryIds.filter(id => id !== c.id)
                                      : [...prev.categoryIds, c.id];
                                    return { ...prev, categoryIds: ids };
                                  });
                                }}
                                className="w-3.5 h-3.5 rounded border-slate-200 text-primary focus:ring-primary cursor-pointer"
                              />
                              <span className="truncate">{c.name}</span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Abonnements Associés</label>
                    <div className="space-y-1.5 max-h-[110px] overflow-y-auto border border-slate-100 rounded-xl p-2.5 bg-slate-50 [scrollbar-width:thin]">
                      {serviceTiers.length === 0 ? (
                        <p className="text-[10px] text-slate-400 italic font-medium">Aucun abonnement</p>
                      ) : (
                        serviceTiers.map(st => {
                          const isChecked = createForm.serviceTierIds.includes(st.id);
                          return (
                            <label key={st.id} className="flex items-center gap-2 text-[10px] font-bold text-slate-700 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  setCreateForm(prev => {
                                    const ids = prev.serviceTierIds.includes(st.id)
                                      ? prev.serviceTierIds.filter(id => id !== st.id)
                                      : [...prev.serviceTierIds, st.id];
                                    return { ...prev, serviceTierIds: ids };
                                  });
                                }}
                                className="w-3.5 h-3.5 rounded border-slate-200 text-primary focus:ring-primary cursor-pointer"
                              />
                              <span className="truncate">{st.name}</span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Description de la spécialité..."
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all resize-none font-inter"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Couleur</label>
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
                        onClick={() => setCreateForm({ ...createForm, color: col.id })}
                        className={`h-8 rounded-xl cursor-pointer transition-all border flex items-center justify-center ${col.color} ${
                          createForm.color === col.id ? 'border-slate-800 scale-105 shadow-md shadow-slate-200' : 'border-transparent'
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
                    Créer la Spécialité
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
              className="bg-white border border-slate-100 rounded-[2.5rem] w-full max-w-xl p-8 shadow-2xl space-y-4 relative overflow-hidden"
            >
              <button
                onClick={() => setEditingSkill(null)}
                className="absolute right-6 top-6 w-9 h-9 rounded-xl border border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>

              <div className="space-y-1 pr-8">
                <span className="text-[8px] font-black uppercase text-primary tracking-widest bg-primary/5 border border-primary/10 px-2 py-0.5 rounded-full inline-block">
                  Master Roster
                </span>
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-800">
                  Modifier la Compétence
                </h3>
              </div>

              <form onSubmit={handleUpdateSkill} className="space-y-3">
                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Nom (Identifiant Unique)</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Traduction FR</label>
                    <input
                      type="text"
                      value={editForm.nameFr}
                      onChange={(e) => setEditForm({ ...editForm, nameFr: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Traduction AR</label>
                    <input
                      type="text"
                      value={editForm.nameAr}
                      onChange={(e) => setEditForm({ ...editForm, nameAr: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Edit Form selectors */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Services Associés</label>
                    <div className="space-y-1.5 max-h-[110px] overflow-y-auto border border-slate-100 rounded-xl p-2.5 bg-slate-50 [scrollbar-width:thin]">
                      {services.length === 0 ? (
                        <p className="text-[10px] text-slate-400 italic font-medium">Aucun service</p>
                      ) : (
                        services.map(s => {
                          const isChecked = editForm.serviceIds.includes(s.id);
                          return (
                            <label key={s.id} className="flex items-center gap-2 text-[10px] font-bold text-slate-700 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  setEditForm(prev => {
                                    const ids = prev.serviceIds.includes(s.id)
                                      ? prev.serviceIds.filter(id => id !== s.id)
                                      : [...prev.serviceIds, s.id];
                                    return { ...prev, serviceIds: ids };
                                  });
                                }}
                                className="w-3.5 h-3.5 rounded border-slate-200 text-primary focus:ring-primary cursor-pointer"
                              />
                              <span className="truncate">{s.name}</span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Catégories Associées</label>
                    <div className="space-y-1.5 max-h-[110px] overflow-y-auto border border-slate-100 rounded-xl p-2.5 bg-slate-50 [scrollbar-width:thin]">
                      {categories.length === 0 ? (
                        <p className="text-[10px] text-slate-400 italic font-medium">Aucune catégorie</p>
                      ) : (
                        categories.map(c => {
                          const isChecked = editForm.categoryIds.includes(c.id);
                          return (
                            <label key={c.id} className="flex items-center gap-2 text-[10px] font-bold text-slate-700 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  setEditForm(prev => {
                                    const ids = prev.categoryIds.includes(c.id)
                                      ? prev.categoryIds.filter(id => id !== c.id)
                                      : [...prev.categoryIds, c.id];
                                    return { ...prev, categoryIds: ids };
                                  });
                                }}
                                className="w-3.5 h-3.5 rounded border-slate-200 text-primary focus:ring-primary cursor-pointer"
                              />
                              <span className="truncate">{c.name}</span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Abonnements Associés</label>
                    <div className="space-y-1.5 max-h-[110px] overflow-y-auto border border-slate-100 rounded-xl p-2.5 bg-slate-50 [scrollbar-width:thin]">
                      {serviceTiers.length === 0 ? (
                        <p className="text-[10px] text-slate-400 italic font-medium">Aucun abonnement</p>
                      ) : (
                        serviceTiers.map(st => {
                          const isChecked = editForm.serviceTierIds.includes(st.id);
                          return (
                            <label key={st.id} className="flex items-center gap-2 text-[10px] font-bold text-slate-700 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  setEditForm(prev => {
                                    const ids = prev.serviceTierIds.includes(st.id)
                                      ? prev.serviceTierIds.filter(id => id !== st.id)
                                      : [...prev.serviceTierIds, st.id];
                                    return { ...prev, serviceTierIds: ids };
                                  });
                                }}
                                className="w-3.5 h-3.5 rounded border-slate-200 text-primary focus:ring-primary cursor-pointer"
                              />
                              <span className="truncate">{st.name}</span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all resize-none font-inter"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Couleur</label>
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
                        onClick={() => setEditForm({ ...editForm, color: col.id })}
                        className={`h-8 rounded-xl cursor-pointer transition-all border flex items-center justify-center ${col.color} ${
                          editForm.color === col.id ? 'border-slate-800 scale-105 shadow-md shadow-slate-200' : 'border-transparent'
                        }`}
                      >
                        {editForm.color === col.id && <span className="text-white text-[10px]">✔</span>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-wider text-[10px] shadow-lg shadow-primary/20 hover:scale-101 transition-all cursor-pointer"
                  >
                    Enregistrer les Modifications
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
                    viewingWorkersSkill.color === 'rose' ? 'bg-rose-50 border-rose-100 text-rose-600' :
                    viewingWorkersSkill.color === 'emerald' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                    viewingWorkersSkill.color === 'indigo' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' :
                    viewingWorkersSkill.color === 'amber' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                    viewingWorkersSkill.color === 'purple' ? 'bg-purple-50 border-purple-100 text-purple-600' :
                    'bg-slate-50 border-slate-100 text-slate-500'
                  }`}>
                    Membres Certifiés
                  </span>
                  <h3 className="text-xl font-black uppercase tracking-tight text-slate-800 flex items-center gap-2">
                    <Users size={18} className="text-primary" />
                    Spécialistes : {viewingWorkersSkill.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold font-inter leading-relaxed">
                    Ci-dessous se trouvent les agents certifiés pour effectuer les opérations de **{viewingWorkersSkill.name}**.
                  </p>
                </div>

                {/* Assign Cleaner Section */}
                <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-4 border border-slate-100 shrink-0">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Attribuer une Certification</p>
                    <p className="text-xs font-medium text-slate-400">Ajouter un agent disponible à cette spécialité</p>
                  </div>
                  {!isAssigning ? (
                    <button
                      onClick={() => setIsAssigning(true)}
                      className="px-4 py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-blue-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Plus size={12} /> Assigner
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedCleanerToAssign}
                        onChange={(e) => setSelectedCleanerToAssign(e.target.value)}
                        className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-primary"
                      >
                        <option value="">Sélectionner un agent...</option>
                        {cleaners.filter(c => !c.skills.includes(viewingWorkersSkill.name)).map(c => (
                          <option key={c.id} value={c.id}>{c.fullName}</option>
                        ))}
                      </select>
                      <button
                        onClick={handleAssignCleaner}
                        disabled={!selectedCleanerToAssign}
                        className="px-3 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-emerald-600 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                      >
                        Valider
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
                      <p className="text-xs text-slate-400 font-bold uppercase">Aucun agent certifié</p>
                      <p className="text-[11px] text-slate-400 font-medium font-inter max-w-xs mx-auto">
                        Associez cette compétence à un cleaner pour le voir apparaître ici.
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
                              <span className="text-xs font-black text-slate-800">{cleaner.fullName}</span>
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
                            <span className={`px-2.5 py-1 rounded-lg text-[8.5px] font-black uppercase tracking-wider ${
                              cleaner.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {cleaner.isActive ? 'Actif' : 'Inactif'}
                            </span>
                            
                            <button
                              onClick={() => handleRemoveCleaner(cleaner.id)}
                              className="ml-2 w-7 h-7 flex items-center justify-center rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors cursor-pointer"
                              title="Révoquer"
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
                    Fermer la Vue
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* ── API JSON VIEWER MODAL ── */}
      <AnimatePresence>
        {isJsonModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsJsonModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-[700px] bg-slate-950 text-slate-200 rounded-[3rem] shadow-2xl border border-white/10 relative z-10 overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-8 border-b border-white/5 flex justify-between items-center shrink-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-primary">
                    <Code size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Skills API</span>
                  </div>
                  <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">
                    Skills JSON
                  </h2>
                </div>
                <button 
                  onClick={() => setIsJsonModalOpen(false)}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white border border-white/10 transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 font-mono text-xs text-emerald-400 bg-slate-900/60 leading-relaxed">
                <pre>{JSON.stringify(skills, null, 2)}</pre>
              </div>

              <div className="p-8 border-t border-white/5 bg-slate-950 flex gap-4 shrink-0 justify-end">
                <button 
                  onClick={handleCopyJson}
                  className="px-6 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-wider text-[10px] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
                >
                  {copied ? <><Check size={14} strokeWidth={3} /> Copié ! </> : <><Copy size={14} /> Copier le JSON</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
