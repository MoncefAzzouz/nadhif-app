'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  UploadCloud, 
  AlertCircle, 
  Check, 
  X, 
  Search, 
  Grid, 
  List, 
  Layers, 
  Sparkles, 
  Power,
  ImageIcon
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: string; // URL or Base64 string
  isActive: boolean;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Laundry & Ironing', icon: '/assets/landiring.JPG', isActive: true },
  { id: '2', name: 'Carpet Cleaning', icon: '/assets/sejadaclean.JPG', isActive: true },
  { id: '3', name: 'Air Conditioning', icon: '/assets/clima.JPG', isActive: true },
  { id: '4', name: 'Deep Cleaning', icon: '/assets/deepclean.JPG', isActive: true },
];

export default function CategoriesPage() {
  // Category State
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [iconBase64, setIconBase64] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Category to Delete
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('nadif_categories');
    if (stored) {
      try {
        setCategories(JSON.parse(stored));
      } catch (e) {
        setCategories(DEFAULT_CATEGORIES);
      }
    } else {
      localStorage.setItem('nadif_categories', JSON.stringify(DEFAULT_CATEGORIES));
      setCategories(DEFAULT_CATEGORIES);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('nadif_categories', JSON.stringify(categories));
    }
  }, [categories, isLoaded]);

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName('');
    setIconBase64('');
    setIsActive(true);
    setFormError('');
    setIsFormModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setIconBase64(category.icon);
    setIsActive(category.isActive);
    setFormError('');
    setIsFormModalOpen(true);
  };

  // Handle PNG icon selection
  const processFile = (file: File) => {
    if (file.type !== 'image/png') {
      setFormError('Only PNG files are allowed. Please upload a valid PNG format.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setIconBase64(e.target.result as string);
        setFormError('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Drag and Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Form Submit (Add or Edit)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setFormError('Category name is required.');
      return;
    }

    if (!iconBase64) {
      setFormError('Please upload a category icon in PNG format.');
      return;
    }

    if (editingCategory) {
      // Edit mode
      setCategories(prev => prev.map(cat => 
        cat.id === editingCategory.id 
          ? { ...cat, name: name.trim(), icon: iconBase64, isActive } 
          : cat
      ));
    } else {
      // Create mode
      const newCategory: Category = {
        id: Date.now().toString(),
        name: name.trim(),
        icon: iconBase64,
        isActive: isActive
      };
      setCategories(prev => [...prev, newCategory]);
    }

    setIsFormModalOpen(false);
  };

  // Confirm delete dialog
  const handleOpenDelete = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (categoryToDelete) {
      setCategories(prev => prev.filter(cat => cat.id !== categoryToDelete.id));
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  // Toggle active status from the main dashboard card
  const handleToggleStatus = (id: string) => {
    setCategories(prev => prev.map(cat => 
      cat.id === id ? { ...cat, isActive: !cat.isActive } : cat
    ));
  };

  // Filter categories
  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Statistics
  const totalCount = categories.length;
  const activeCount = categories.filter(c => c.isActive).length;
  const inactiveCount = totalCount - activeCount;

  return (
    <div className="space-y-10 font-gilmer max-w-7xl mx-auto">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
            <Layers size={14} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Nadif Service Catalog</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-800 uppercase italic">
            Category <span className="text-primary">Manager</span>
          </h1>
          <p className="text-sm text-slate-400 font-medium">
            Create, modify, and remove service categories. Custom PNG icons persist locally.
          </p>
        </div>

        <button 
          onClick={handleOpenCreate}
          className="px-6 py-4 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer shrink-0 self-start md:self-center"
        >
          <Plus size={16} strokeWidth={3} />
          Add Category
        </button>
      </div>

      {/* 2. Stats Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group transition-all"
        >
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Categories</p>
            <p className="text-3xl font-black text-slate-800">{totalCount}</p>
          </div>
          <div className="w-12 h-12 bg-slate-50 text-slate-500 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
            <Layers size={20} />
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group transition-all"
        >
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Live</p>
            <p className="text-3xl font-black text-emerald-600">{activeCount}</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
            <Check size={20} />
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group transition-all"
        >
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Inactive Drafts</p>
            <p className="text-3xl font-black text-amber-500">{inactiveCount}</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all">
            <Power size={20} />
          </div>
        </motion.div>
      </div>

      {/* 3. Toolbar Section */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input 
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-sm font-bold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-primary/20 outline-none transition-all"
          />
        </div>

        {/* View Switcher */}
        <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl self-end sm:self-center">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-xl transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-700'}`}
            title="Grid View"
          >
            <Grid size={18} />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-xl transition-all cursor-pointer ${viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-700'}`}
            title="List View"
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* 4. Category Grid / List Display */}
      {!isLoaded ? (
        <div className="min-h-[30vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-100 rounded-[3rem] shadow-sm max-w-xl mx-auto space-y-6">
          <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center text-primary mx-auto">
            <Layers size={36} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black uppercase tracking-tight text-slate-800">No Categories Found</h3>
            <p className="text-sm text-slate-400 font-semibold max-w-xs mx-auto">
              {searchQuery ? "We couldn't find any matches for your query. Try something else." : "Get started by creating your very first cleaning service category!"}
            </p>
          </div>
          {!searchQuery && (
            <button 
              onClick={handleOpenCreate}
              className="px-6 py-4 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-all shadow-lg"
            >
              Add New Category
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        // Grid View
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredCategories.map((category) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={category.id}
                className="group relative bg-white border border-slate-100 hover:border-primary/20 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col justify-between overflow-hidden"
              >
                {/* Visual Glow */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[4rem] group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-500" />
                
                <div className="space-y-6">
                  {/* Category Image Header */}
                  <div className="flex justify-between items-start relative z-10">
                    <div className="w-20 h-20 relative rounded-3xl overflow-hidden shadow-md ring-4 ring-slate-50">
                      <img 
                        src={category.icon} 
                        alt={category.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                    </div>

                    {/* Status Badge */}
                    <button
                      onClick={() => handleToggleStatus(category.id)}
                      className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                        category.isActive 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100' 
                          : 'bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-100'
                      }`}
                      title={category.isActive ? "Click to Deactivate" : "Click to Activate"}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${category.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                      {category.isActive ? 'Active' : 'Draft'}
                    </button>
                  </div>

                  {/* Title */}
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold uppercase tracking-tight text-slate-800 truncate">
                      {category.name}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      ID: {category.id}
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-slate-50 my-6" />

                {/* Actions Panel */}
                <div className="flex justify-end gap-3 relative z-10">
                  <button 
                    onClick={() => handleOpenEdit(category)}
                    className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-primary/10 hover:text-primary text-slate-500 border border-slate-100 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    title="Edit Category"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleOpenDelete(category)}
                    className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-500 border border-slate-100 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    title="Delete Category"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        // List View
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                  <th className="pb-4 pl-4">Icon</th>
                  <th className="pb-4">Category Name</th>
                  <th className="pb-4">ID</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence mode="popLayout">
                  {filteredCategories.map((category) => (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={category.id} 
                      className="group hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="py-4 pl-4">
                        <div className="w-12 h-12 relative rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                          <img src={category.icon} alt={category.name} className="w-full h-full object-cover" />
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="text-sm font-bold uppercase tracking-tight text-slate-800">{category.name}</span>
                      </td>
                      <td className="py-4">
                        <span className="text-xs font-semibold text-slate-400 font-mono">{category.id}</span>
                      </td>
                      <td className="py-4">
                        <button
                          onClick={() => handleToggleStatus(category.id)}
                          className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                            category.isActive 
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100' 
                              : 'bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-100'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${category.isActive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          {category.isActive ? 'Active' : 'Draft'}
                        </button>
                      </td>
                      <td className="py-4 pr-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleOpenEdit(category)}
                            className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-primary/10 hover:text-primary text-slate-500 flex items-center justify-center transition-all cursor-pointer"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => handleOpenDelete(category)}
                            className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-500 flex items-center justify-center transition-all cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. ADD / EDIT DIALOG MODAL */}
      <AnimatePresence>
        {isFormModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-[500px] bg-white rounded-[3rem] shadow-2xl border border-slate-100 relative z-10 overflow-hidden"
            >
              {/* Top Banner Accent */}
              <div className="h-2 bg-gradient-to-r from-primary via-primary-400 to-secondary" />

              {/* Close Button */}
              <button 
                onClick={() => setIsFormModalOpen(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-100 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>

              <form onSubmit={handleSubmit} className="p-8 lg:p-10 space-y-8">
                {/* Header */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-primary">
                    <Sparkles size={16} className="fill-primary" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Service Management</span>
                  </div>
                  <h2 className="text-2xl font-black uppercase italic tracking-tight text-slate-800">
                    {editingCategory ? 'Modify Category' : 'Create Category'}
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">
                    Configure your category name, PNG icon, and deployment status below.
                  </p>
                </div>

                {/* Form Error Notice */}
                {formError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 bg-rose-50 text-rose-600 p-4 rounded-2xl border border-rose-100 text-xs font-bold items-start"
                  >
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <p>{formError}</p>
                  </motion.div>
                )}

                {/* Form Fields */}
                <div className="space-y-6">
                  {/* Category Name */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 pl-2">
                      Category Name
                    </label>
                    <input 
                      type="text"
                      placeholder="e.g. Premium Ironing, Sofa Dry Cleaning"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (formError.includes('name')) setFormError('');
                      }}
                      className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-primary/20 focus:bg-white outline-none font-bold text-slate-800 text-sm placeholder-slate-300 transition-all"
                    />
                  </div>

                  {/* Icon File Upload (PNG Only) */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 pl-2">
                      PNG Icon / Image Asset
                    </label>

                    {iconBase64 ? (
                      // Preview state
                      <div className="relative border border-slate-100 rounded-3xl p-4 flex items-center gap-4 bg-slate-50/50">
                        <div className="w-16 h-16 relative rounded-2xl overflow-hidden border border-slate-100 shadow-sm shrink-0">
                          <img src={iconBase64} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 uppercase truncate">
                            Selected PNG Icon
                          </p>
                          <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1 mt-0.5">
                            <Check size={10} strokeWidth={3} /> Ready to Save
                          </p>
                        </div>
                        <button 
                          type="button"
                          onClick={() => {
                            setIconBase64('');
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="w-10 h-10 rounded-xl bg-white hover:bg-rose-50 hover:text-rose-600 text-slate-400 border border-slate-100 flex items-center justify-center transition-all cursor-pointer"
                          title="Remove Icon"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      // Drag zone state
                      <div 
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
                          dragActive 
                            ? 'border-primary bg-primary/5 text-primary scale-[0.99]' 
                            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 text-slate-400'
                        }`}
                      >
                        <input 
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept="image/png"
                          className="hidden" 
                        />
                        <UploadCloud size={32} className={`mb-3 ${dragActive ? 'text-primary animate-bounce' : 'text-slate-300'}`} />
                        <p className="text-xs font-bold text-slate-700">
                          Drag & drop PNG image here, or <span className="text-primary hover:underline">browse</span>
                        </p>
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider mt-2.5 bg-slate-100 px-3 py-1 rounded-md">
                          PNG Format Only
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Active deployment toggle */}
                  <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl">
                    <div>
                      <p className="text-xs font-black uppercase tracking-tight text-slate-800">Deployment Status</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">Activate for client requests immediately</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsActive(!isActive)}
                      className={`w-14 h-8 rounded-full transition-colors cursor-pointer relative p-1 ${
                        isActive ? 'bg-primary' : 'bg-slate-300'
                      }`}
                    >
                      <motion.div 
                        layout
                        className="w-6 h-6 bg-white rounded-full shadow-sm"
                        animate={{ x: isActive ? 24 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    className="flex-1 py-4 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-2xl font-bold uppercase tracking-wider text-[10px] border border-slate-100 transition-all cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-wider text-[10px] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-center"
                  >
                    {editingCategory ? 'Save Changes' : 'Publish Category'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. DELETE CONFIRMATION DIALOG */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-[400px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 relative z-10 overflow-hidden p-8 text-center space-y-6"
            >
              <div className="w-16 h-16 bg-rose-50 border border-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto">
                <Trash2 size={24} />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-800">
                  Delete Category?
                </h3>
                <p className="text-sm text-slate-400 font-semibold max-w-[280px] mx-auto leading-relaxed">
                  Are you sure you want to remove <span className="font-bold text-slate-700">"{categoryToDelete?.name}"</span>? This action is permanent.
                </p>
              </div>

              {/* Actions */}
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
