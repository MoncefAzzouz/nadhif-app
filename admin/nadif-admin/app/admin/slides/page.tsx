'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sliders, 
  Plus, 
  Trash2, 
  Pencil, 
  Upload, 
  Image as ImageIcon, 
  Eye, 
  ArrowUpDown, 
  Save, 
  X, 
  ChevronDown, 
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

interface Slide {
  id: string;
  title: string;
  imageUrl: string;
  actionRoute: string;
  order: number;
  status: 'active' | 'inactive';
  description: string;
  createdAt: string;
}

const DEFAULT_SLIDES: Slide[] = [
  {
    id: 'SLD-001',
    title: '🕌 Ramadan Holy Clean Package',
    imageUrl: '/assets/deepclean.JPG',
    actionRoute: 'Grand Deep Clean',
    order: 1,
    status: 'active',
    description: 'Special deep clean package slide with mandatory materials locked.',
    createdAt: '2026-05-10T12:00:00Z'
  },
  {
    id: 'SLD-002',
    title: '❄️ AC Airflow & Clean Air Promo',
    imageUrl: '/assets/cleanair.png',
    actionRoute: 'Simple Maintenance',
    order: 2,
    status: 'active',
    description: 'Seasonal promotion slide highlighting AC deep sanitizing & air safety.',
    createdAt: '2026-05-12T14:30:00Z'
  },
  {
    id: 'SLD-003',
    title: '💎 Premium Sofa & Carpet Cleaners',
    imageUrl: '/assets/sejadaclean.JPG',
    actionRoute: 'Semi Grand Deep Clean',
    order: 3,
    status: 'inactive',
    description: 'Targeted service slide showcasing sofa, upholstery, and carpet washes.',
    createdAt: '2026-05-15T09:00:00Z'
  }
];

export default function SlidesPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Dialog Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState<Slide | null>(null);
  const [slideToDelete, setSlideToDelete] = useState<Slide | null>(null);

  // Form states
  const [editForm, setEditForm] = useState<Slide | null>(null);
  const [addForm, setAddForm] = useState({
    title: '',
    imageUrl: '',
    actionRoute: 'Grand Deep Clean',
    order: 1,
    status: 'active' as 'active' | 'inactive',
    description: ''
  });

  const [addDragOver, setAddDragOver] = useState(false);
  const [editDragOver, setEditDragOver] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    const stored = localStorage.getItem('nadif_slides');
    if (stored) {
      try {
        setSlides(JSON.parse(stored));
      } catch (e) {
        setSlides(DEFAULT_SLIDES);
      }
    } else {
      localStorage.setItem('nadif_slides', JSON.stringify(DEFAULT_SLIDES));
      setSlides(DEFAULT_SLIDES);
    }
    setIsLoaded(true);
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('nadif_slides', JSON.stringify(slides));
    }
  }, [slides, isLoaded]);

  // Handle PNG/JPG base64 upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'add' | 'edit') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        if (target === 'add') {
          setAddForm(prev => ({ ...prev, imageUrl: reader.result as string }));
        } else if (target === 'edit' && editForm) {
          setEditForm({ ...editForm, imageUrl: reader.result as string });
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag over drop handlers
  const handleDragOver = (e: React.DragEvent, target: 'add' | 'edit') => {
    e.preventDefault();
    if (target === 'add') setAddDragOver(true);
    else setEditDragOver(true);
  };

  const handleDragLeave = (target: 'add' | 'edit') => {
    if (target === 'add') setAddDragOver(false);
    else setEditDragOver(false);
  };

  const handleDrop = (e: React.DragEvent, target: 'add' | 'edit') => {
    e.preventDefault();
    if (target === 'add') setAddDragOver(false);
    else setEditDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        if (target === 'add') {
          setAddForm(prev => ({ ...prev, imageUrl: reader.result as string }));
        } else if (target === 'edit' && editForm) {
          setEditForm({ ...editForm, imageUrl: reader.result as string });
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Status quick switch
  const handleStatusToggle = (id: string, currentStatus: 'active' | 'inactive') => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    setSlides(prev => prev.map(s => s.id === id ? { ...s, status: nextStatus } : s));
    setSuccessToast(`🟢 Slide Status switched to ${nextStatus.toUpperCase()}!`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Submit Add
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!addForm.imageUrl) {
      alert("Please upload a banner image!");
      return;
    }

    const newSlide: Slide = {
      id: `SLD-${Math.floor(100 + Math.random() * 900)}`,
      title: addForm.title,
      imageUrl: addForm.imageUrl,
      actionRoute: addForm.actionRoute,
      order: Number(addForm.order),
      status: addForm.status,
      description: addForm.description,
      createdAt: new Date().toISOString()
    };

    setSlides(prev => {
      // Re-order if matching rank
      const updated = prev.map(s => {
        if (s.order >= newSlide.order) {
          return { ...s, order: s.order + 1 };
        }
        return s;
      });
      return [...updated, newSlide].sort((a, b) => a.order - b.order);
    });

    setIsAddModalOpen(false);
    setAddForm({
      title: '',
      imageUrl: '',
      actionRoute: 'Grand Deep Clean',
      order: slides.length + 1,
      status: 'active',
      description: ''
    });

    setSuccessToast("🚀 Carousel slide created successfully!");
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Open Edit Modal
  const handleOpenEdit = (slide: Slide) => {
    setEditForm({ ...slide });
    setIsEditModalOpen(true);
  };

  // Submit Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editForm) {
      setSlides(prev => {
        const filtered = prev.filter(s => s.id !== editForm.id);
        const updated = filtered.map(s => {
          if (s.order >= editForm.order) {
            return { ...s, order: s.order + 1 };
          }
          return s;
        });
        return [...updated, editForm].sort((a, b) => a.order - b.order);
      });
      setIsEditModalOpen(false);
      setEditForm(null);

      setSuccessToast("✏️ Carousel slide updated successfully!");
      setTimeout(() => setSuccessToast(null), 3000);
    }
  };

  // Open Delete
  const handleOpenDelete = (slide: Slide) => {
    setSlideToDelete(slide);
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete
  const handleDeleteConfirm = () => {
    if (slideToDelete) {
      setSlides(prev => prev.filter(s => s.id !== slideToDelete.id).map((s, idx) => ({ ...s, order: idx + 1 })));
      setIsDeleteModalOpen(false);
      setSlideToDelete(null);

      setSuccessToast("🗑️ Carousel slide deleted permanently!");
      setTimeout(() => setSuccessToast(null), 3000);
    }
  };

  // Sorted slides list
  const sortedSlides = [...slides].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-10 font-gilmer max-w-7xl mx-auto animate-fadeIn relative">
      {/* Success Alert Banner */}
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

      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
            <Sliders size={14} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Slide Studio</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-800 uppercase italic">
            Carousel <span className="text-primary">Banners</span> Manager
          </h1>
          <p className="text-sm text-slate-400 font-medium font-inter">
            Create, modify, and delete promotional banner slides shown on the home page carousel of the mobile client app. Upload beautiful banner images.
          </p>
        </div>

        <button
          onClick={() => {
            setAddForm(prev => ({ ...prev, order: slides.length + 1 }));
            setIsAddModalOpen(true);
          }}
          className="px-6 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-wider text-[10px] shadow-lg shadow-primary/20 hover:scale-102 active:scale-98 transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus size={14} />
          Create New Slide
        </button>
      </div>

      {/* 2. Visual Slides Grid Card */}
      {!isLoaded ? (
        <div className="min-h-[30vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : sortedSlides.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-100 rounded-[3rem] shadow-sm max-w-xl mx-auto space-y-6">
          <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center text-primary mx-auto">
            <ImageIcon size={36} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black uppercase tracking-tight text-slate-800">No Carousel Banners</h3>
            <p className="text-sm text-slate-400 font-semibold max-w-xs mx-auto">
              Create slides with promotional banner images to drive bookings towards specific service deep links.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {sortedSlides.map((slide) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={slide.id}
                className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col group relative hover:shadow-md transition-all duration-300"
              >
                {/* Banner Image Preview Container */}
                <div className="w-full aspect-[16/9] relative bg-slate-100 overflow-hidden border-b border-slate-100">
                  <img 
                    src={slide.imageUrl} 
                    alt={slide.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />

                  {/* Top Bar Indicators */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-none">
                    <span className="bg-slate-900/80 backdrop-blur-md text-white font-mono text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                      Rank #{slide.order}
                    </span>

                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                      slide.status === 'active' ? 'bg-emerald-500/90 text-white' : 'bg-slate-600/90 text-white'
                    }`}>
                      {slide.status}
                    </span>
                  </div>
                </div>

                {/* Banner Details */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight line-clamp-1">
                      {slide.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-semibold font-inter line-clamp-2 leading-relaxed">
                      {slide.description || "No promotional details written for this slides campaign."}
                    </p>
                  </div>

                  <div className="space-y-4 pt-2">
                    {/* Deep link Target info */}
                    <div className="flex justify-between items-center border-t border-slate-50 pt-3">
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Tap Action:</span>
                      <span className="text-[10px] font-black bg-primary/5 text-primary px-3 py-1 rounded-full uppercase flex items-center gap-1.5">
                        <ArrowRight size={10} />
                        {slide.actionRoute}
                      </span>
                    </div>

                    {/* Action Overlay Row */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStatusToggle(slide.id, slide.status)}
                        className={`flex-1 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer border flex items-center justify-center gap-2 ${
                          slide.status === 'active'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100/50'
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200/50'
                        }`}
                      >
                        {slide.status === 'active' ? (
                          <>
                            <ToggleRight size={14} />
                            Active
                          </>
                        ) : (
                          <>
                            <ToggleLeft size={14} />
                            Inactive
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleOpenEdit(slide)}
                        className="w-11 py-3.5 bg-slate-50 hover:bg-amber-50 hover:text-amber-600 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-500 transition-all cursor-pointer"
                        title="Modifier (Edit) Slide"
                      >
                        <Pencil size={14} />
                      </button>

                      <button
                        onClick={() => handleOpenDelete(slide)}
                        className="w-11 py-3.5 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 border border-slate-100 rounded-2xl flex items-center justify-center text-rose-500 transition-all cursor-pointer"
                        title="Delete Slide"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* 3. ADD NEW SLIDE MODAL */}
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
              <div className="h-2 bg-gradient-to-r from-primary to-amber-500 shrink-0" />

              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-100 transition-all cursor-pointer z-20"
              >
                <X size={18} />
              </button>

              <form onSubmit={handleAddSubmit} className="flex flex-col h-full overflow-hidden">
                <div className="flex-1 overflow-y-auto p-8 lg:p-10 space-y-6">
                  <div>
                    <div className="inline-flex items-center gap-2 bg-primary/5 px-3 py-1 rounded-full border border-primary/10 mb-2">
                      <Sparkles size={12} className="text-primary" />
                      <span className="text-[9px] font-black uppercase tracking-wider text-primary">New Banner</span>
                    </div>
                    <h2 className="text-2xl font-black uppercase italic tracking-tight text-slate-800">
                      Create <span className="text-primary">Carousel Slide</span>
                    </h2>
                    <p className="text-xs text-slate-400 font-semibold font-inter">
                      Upload highly visual service banners, configure tap action deep routes, and assign rankings.
                    </p>
                  </div>

                  <div className="w-full h-px bg-slate-100" />

                  {/* Form fields */}
                  <div className="space-y-4">
                    {/* Drag-and-drop Image Upload */}
                    <div>
                      <label className="block text-[9px] font-black uppercase text-slate-400 mb-2">Banner Slide Image (PNG / JPG)</label>
                      <div
                        onDragOver={(e) => handleDragOver(e, 'add')}
                        onDragLeave={() => handleDragLeave('add')}
                        onDrop={(e) => handleDrop(e, 'add')}
                        className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all duration-300 relative aspect-[16/9] flex flex-col items-center justify-center overflow-hidden ${
                          addDragOver ? 'border-primary bg-primary/5' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                        }`}
                      >
                        {addForm.imageUrl ? (
                          <>
                            <img src={addForm.imageUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setAddForm(prev => ({ ...prev, imageUrl: '' }));
                              }}
                              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-900/80 backdrop-blur-md text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer z-10"
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <div className="space-y-3 flex flex-col items-center">
                            <div className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm">
                              <Upload size={18} />
                            </div>
                            <div>
                              <p className="text-xs font-black uppercase text-slate-800">Drag & Drop Image</p>
                              <p className="text-[10px] text-slate-400 font-bold font-inter mt-1">PNG, JPG, JPEG up to 5MB</p>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageFileChange(e, 'add')}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Slide Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 🕌 Ramadan Holy Clean Package"
                        value={addForm.title}
                        onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                        className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Action route */}
                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Mobile Action Route</label>
                        <div className="relative">
                          <select
                            value={addForm.actionRoute}
                            onChange={(e) => setAddForm({ ...addForm, actionRoute: e.target.value })}
                            className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-primary/20 appearance-none cursor-pointer"
                          >
                            <option value="Grand Deep Clean">Grand Deep Clean</option>
                            <option value="Semi Grand Deep Clean">Semi Grand Deep Clean</option>
                            <option value="Simple Maintenance">Simple Maintenance</option>
                            <option value="Promo Codes">Promo Codes Wallet</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                        </div>
                      </div>

                      {/* Display Order */}
                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Carousel Order Rank</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={addForm.order}
                          onChange={(e) => setAddForm({ ...addForm, order: parseInt(e.target.value) })}
                          className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Voucher Status</label>
                      <div className="relative">
                        <select
                          value={addForm.status}
                          onChange={(e) => setAddForm({ ...addForm, status: e.target.value as any })}
                          className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-primary/20 appearance-none cursor-pointer uppercase"
                        >
                          <option value="active">🟢 Active</option>
                          <option value="inactive">⚫ Inactive</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Voucher Scope Details (Description)</label>
                      <textarea
                        rows={2}
                        value={addForm.description}
                        onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                        className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all resize-none font-inter"
                        placeholder="Internal campaign description or terms notes..."
                      />
                    </div>
                  </div>
                </div>

                {/* Footer buttons */}
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
                    Deploy Slide
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. MODIFIER (EDIT) SLIDE MODAL */}
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
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{editForm.id}</span>
                    <h2 className="text-2xl font-black uppercase italic tracking-tight text-slate-800">
                      Modifier <span className="text-primary">Carousel Slide</span>
                    </h2>
                    <p className="text-xs text-slate-400 font-semibold font-inter">
                      Swap images, adjust rankings, edit routes, or switch visibility.
                    </p>
                  </div>

                  <div className="w-full h-px bg-slate-100" />

                  {/* Form fields */}
                  <div className="space-y-4">
                    {/* Drag-and-drop Image Upload */}
                    <div>
                      <label className="block text-[9px] font-black uppercase text-slate-400 mb-2">Banner Slide Image (PNG / JPG)</label>
                      <div
                        onDragOver={(e) => handleDragOver(e, 'edit')}
                        onDragLeave={() => handleDragLeave('edit')}
                        onDrop={(e) => handleDrop(e, 'edit')}
                        className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all duration-300 relative aspect-[16/9] flex flex-col items-center justify-center overflow-hidden ${
                          editDragOver ? 'border-primary bg-primary/5' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                        }`}
                      >
                        {editForm.imageUrl ? (
                          <>
                            <img src={editForm.imageUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditForm({ ...editForm, imageUrl: '' });
                              }}
                              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-900/80 backdrop-blur-md text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer z-10"
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <div className="space-y-3 flex flex-col items-center">
                            <div className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm">
                              <Upload size={18} />
                            </div>
                            <div>
                              <p className="text-xs font-black uppercase text-slate-800">Drag & Drop Image</p>
                              <p className="text-[10px] text-slate-400 font-bold font-inter mt-1">PNG, JPG, JPEG up to 5MB</p>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageFileChange(e, 'edit')}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Slide Title</label>
                      <input
                        type="text"
                        required
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Action route */}
                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Mobile Action Route</label>
                        <div className="relative">
                          <select
                            value={editForm.actionRoute}
                            onChange={(e) => setEditForm({ ...editForm, actionRoute: e.target.value })}
                            className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-primary/20 appearance-none cursor-pointer"
                          >
                            <option value="Grand Deep Clean">Grand Deep Clean</option>
                            <option value="Semi Grand Deep Clean">Semi Grand Deep Clean</option>
                            <option value="Simple Maintenance">Simple Maintenance</option>
                            <option value="Promo Codes">Promo Codes Wallet</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                        </div>
                      </div>

                      {/* Display Order */}
                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Carousel Order Rank</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={editForm.order}
                          onChange={(e) => setEditForm({ ...editForm, order: parseInt(e.target.value) })}
                          className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Voucher Status</label>
                      <div className="relative">
                        <select
                          value={editForm.status}
                          onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                          className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-primary/20 appearance-none cursor-pointer uppercase"
                        >
                          <option value="active">🟢 Active</option>
                          <option value="inactive">⚫ Inactive</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Voucher Scope Details (Description)</label>
                      <textarea
                        rows={2}
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        className="w-full px-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all resize-none font-inter"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer buttons */}
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
                    Save Slide
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. DELETE CONFIRM SLIDE MODAL */}
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
                  Delete Carousel Slide?
                </h3>
                <p className="text-sm text-slate-400 font-semibold max-w-[280px] mx-auto leading-relaxed font-inter">
                  Are you sure you want to delete <span className="font-bold text-slate-700">"{slideToDelete?.title}"</span>? This will permanently remove the slide banner from client screens.
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
