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
  Sparkles,
  Power,
  ShoppingBag,
  Code,
  Copy,
  Calculator,
  Calendar,
  Clock,
  Bell,
  Trash,
  Info,
  Lock,
  Layers
} from 'lucide-react';
import { categoriesApi, uploadImage, imgUrl, type ApiCategory as Category, type ApiCategoryService as CategoryService, type ServiceDetails } from '../../lib/api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [nameFr, setNameFr] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionFr, setDescriptionFr] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');

  // Mobile details page content (objective/includes/duration/additional, EN+FR+AR)
  const emptyDetailsForm = {
    objective: '', objectiveFr: '', objectiveAr: '',
    includes: '', includesFr: '', includesAr: '',
    durationText: '', durationTextFr: '', durationTextAr: '',
    additional: '', additionalFr: '', additionalAr: '',
  };
  const [detailsForm, setDetailsForm] = useState({ ...emptyDetailsForm });
  const detailsFromApi = (d?: ServiceDetails | null) => ({
    objective: d?.objective || '', objectiveFr: d?.objectiveFr || '', objectiveAr: d?.objectiveAr || '',
    includes: (d?.includes || []).join('\n'), includesFr: (d?.includesFr || []).join('\n'), includesAr: (d?.includesAr || []).join('\n'),
    durationText: d?.durationText || '', durationTextFr: d?.durationTextFr || '', durationTextAr: d?.durationTextAr || '',
    additional: d?.additional || '', additionalFr: d?.additionalFr || '', additionalAr: d?.additionalAr || '',
  });
  const splitLines = (s: string) => s.split('\n').map(l => l.trim()).filter(Boolean);
  const detailsToApi = (): ServiceDetails => ({
    objective: detailsForm.objective.trim(), objectiveFr: detailsForm.objectiveFr.trim(), objectiveAr: detailsForm.objectiveAr.trim(),
    includes: splitLines(detailsForm.includes), includesFr: splitLines(detailsForm.includesFr), includesAr: splitLines(detailsForm.includesAr),
    durationText: detailsForm.durationText.trim(), durationTextFr: detailsForm.durationTextFr.trim(), durationTextAr: detailsForm.durationTextAr.trim(),
    additional: detailsForm.additional.trim(), additionalFr: detailsForm.additionalFr.trim(), additionalAr: detailsForm.additionalAr.trim(),
  });
  const setDetail = (key: keyof typeof emptyDetailsForm, val: string) =>
    setDetailsForm(prev => ({ ...prev, [key]: val }));
  const [formLangTab, setFormLangTab] = useState<'en' | 'fr' | 'ar'>('en');
  const [pictureBase64, setPictureBase64] = useState('');

  // Materials Form States
  const [materialPrice, setMaterialPrice] = useState<number>(0);
  const [materialsMandatory, setMaterialsMandatory] = useState(false);

  // Products Form States
  const [localProductPrice, setLocalProductPrice] = useState<number>(0);
  const [importedProductPrice, setImportedProductPrice] = useState<number>(0);
  const [productsMandatory, setProductsMandatory] = useState(false);

  const [isActive, setIsActive] = useState(true);
  const [categoryServices, setCategoryServices] = useState<Partial<CategoryService>[]>([]);

  // Nested Services Sub-form Add
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceNameFr, setNewServiceNameFr] = useState('');
  const [newServiceNameAr, setNewServiceNameAr] = useState('');
  const [newServiceWorkers, setNewServiceWorkers] = useState<number>(3);
  const [newServiceBasePrice, setNewServiceBasePrice] = useState<number>(3000);
  const [newServiceRapidBasePrice, setNewServiceRapidBasePrice] = useState<number>(0);
  const [newServiceDuration, setNewServiceDuration] = useState<number>(3);
  const [editingServiceName, setEditingServiceName] = useState<string | null>(null);

  const [formError, setFormError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Category to Delete
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // JSON Copied Toast
  const [copied, setCopied] = useState(false);

  // LIVE SIMULATOR STATES
  const [selectedSimCategory, setSelectedSimCategory] = useState<Category | null>(null);
  const [selectedSimSubService, setSelectedSimSubService] = useState<string>('');
  const [simUseMaterials, setSimUseMaterials] = useState<boolean>(true);
  const [simUseProducts, setSimUseProducts] = useState<'none' | 'local' | 'imported'>('local');
  const [simDate, setSimDate] = useState<string>('2026-06-02');
  const [simTime, setSimTime] = useState<string>('09:00');

  // Load from API
  const fetchCategories = async () => {
    try {
      const fetched = await categoriesApi.getAll();
      setCategories(fetched);
      if (fetched.length > 0) setSelectedSimCategory(fetched[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Set default simulation settings when selected category changes
  useEffect(() => {
    if (selectedSimCategory && selectedSimCategory.categoryServices.length > 0) {
      setSelectedSimSubService(selectedSimCategory.categoryServices[0].name);
      setSimUseMaterials(selectedSimCategory.materialsMandatory ? true : false);
      setSimUseProducts(selectedSimCategory.productsMandatory ? 'local' : 'none');
    }
  }, [selectedSimCategory]);

  // Sync simulator mandatory rules on change
  useEffect(() => {
    if (selectedSimCategory) {
      if (selectedSimCategory.materialsMandatory) {
        setSimUseMaterials(true);
      }
      if (selectedSimCategory.productsMandatory && simUseProducts === 'none') {
        setSimUseProducts('local');
      }
    }
  }, [selectedSimSubService, selectedSimCategory, simUseProducts]);

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName('');
    setNameFr('');
    setNameAr('');
    setDescription('');
    setDescriptionFr('');
    setDescriptionAr('');
    setDetailsForm({ ...emptyDetailsForm });
    setFormLangTab('en');
    setPictureBase64('');

    setMaterialPrice(1500);
    setMaterialsMandatory(false);

    setLocalProductPrice(1200);
    setImportedProductPrice(2000);
    setProductsMandatory(false);

    setIsActive(true);
    setCategoryServices([
      { name: 'service 1', nameFr: 'service 1', nameAr: 'خدمة 1', workers: 3, basePrice: 3000, rapidBasePrice: 4000, durationHours: 3 },
    ]);
    setNewServiceName('');
    setNewServiceNameFr('');
    setNewServiceNameAr('');
    setNewServiceWorkers(3);
    setNewServiceBasePrice(3000);
    setNewServiceRapidBasePrice(0);
    setNewServiceDuration(3);
    setEditingServiceName(null);
    setFormError('');
    setIsFormModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setNameFr(category.nameFr || '');
    setNameAr(category.nameAr || '');
    setDescription(category.description);
    setDescriptionFr(category.descriptionFr || '');
    setDescriptionAr(category.descriptionAr || '');
    setDetailsForm(detailsFromApi(category.details));
    setFormLangTab('en');
    setPictureBase64(category.picture);

    setMaterialPrice(category.materialPrice);
    setMaterialsMandatory(category.materialsMandatory);

    setLocalProductPrice(category.localProductPrice);
    setImportedProductPrice(category.importedProductPrice);
    setProductsMandatory(category.productsMandatory);

    setIsActive(category.isActive);
    setCategoryServices(category.categoryServices.map(cs => ({
      name: cs.name,
      nameFr: cs.nameFr || '',
      nameAr: cs.nameAr || '',
      workers: cs.workers,
      basePrice: cs.basePrice,
      rapidBasePrice: cs.rapidBasePrice || 0,
      durationHours: cs.durationHours
    })));
    setNewServiceName('');
    setNewServiceNameFr('');
    setNewServiceNameAr('');
    setNewServiceWorkers(3);
    setNewServiceBasePrice(3000);
    setNewServiceRapidBasePrice(0);
    setNewServiceDuration(3);
    setEditingServiceName(null);
    setFormError('');
    setIsFormModalOpen(true);
  };

  // Handle icon selection (PNG/JPEG/WebP — same formats the backend accepts)
  const processFile = (file: File) => {
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setFormError('Only PNG, JPG or WebP images are allowed.');
      return;
    }

    uploadImage(file)
      .then((url) => {
        setPictureBase64(url);
        setFormError('');
      })
      .catch((err) => setFormError(err?.message || 'Upload failed'));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

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
    if (file) processFile(file);
  };

  // Category services adding inside modal sub-form
  // Category services adding/editing inside modal sub-form
  const handleEditServiceConfig = (config: any) => {
    setNewServiceName(config.name);
    setNewServiceNameFr(config.nameFr || '');
    setNewServiceNameAr(config.nameAr || '');
    setNewServiceWorkers(config.workers);
    setNewServiceBasePrice(config.basePrice);
    setNewServiceRapidBasePrice(config.rapidBasePrice || 0);
    setNewServiceDuration(config.durationHours ?? 3);
    setEditingServiceName(config.name);
  };

  const handleAddServiceConfig = () => {
    const nameCleaned = newServiceName.trim();
    if (!nameCleaned) return;

    if (newServiceBasePrice <= 0) {
      setFormError(`Base price must be a positive rate.`);
      return;
    }
    if (newServiceRapidBasePrice < 0) {
      setFormError(`Rapid price must be positive.`);
      return;
    }

    if (editingServiceName) {
      if (editingServiceName.toLowerCase() !== nameCleaned.toLowerCase() && categoryServices.some((config: any) => config.name.toLowerCase() === nameCleaned.toLowerCase())) {
        setFormError(`Configuration for '${nameCleaned}' already exists.`);
        return;
      }
      setCategoryServices(prev => prev.map((config: any) => 
        config.name === editingServiceName 
          ? { ...config, name: nameCleaned, nameFr: newServiceNameFr.trim(), nameAr: newServiceNameAr.trim(), workers: newServiceWorkers, basePrice: newServiceBasePrice, rapidBasePrice: newServiceRapidBasePrice, durationHours: newServiceDuration } 
          : config
      ));
      setEditingServiceName(null);
    } else {
      if (categoryServices.some((config: any) => config.name.toLowerCase() === nameCleaned.toLowerCase())) {
        setFormError(`Configuration for '${nameCleaned}' already exists.`);
        return;
      }
      setCategoryServices(prev => [...prev, { name: nameCleaned, nameFr: newServiceNameFr.trim(), nameAr: newServiceNameAr.trim(), workers: newServiceWorkers, basePrice: newServiceBasePrice, rapidBasePrice: newServiceRapidBasePrice, durationHours: newServiceDuration }]);
    }

    setNewServiceName('');
    setNewServiceNameFr('');
    setNewServiceNameAr('');
    setNewServiceWorkers(3);
    setNewServiceBasePrice(3000);
    setNewServiceRapidBasePrice(0);
    setNewServiceDuration(3);
    setFormError('');
  };

  // Category services removal inside modal sub-form
  const handleRemoveServiceConfig = (name: string) => {
    setCategoryServices(prev => prev.filter((c: any) => c.name !== name));
    if (editingServiceName === name) {
      setEditingServiceName(null);
      setNewServiceName('');
      setNewServiceNameFr('');
      setNewServiceNameAr('');
      setNewServiceWorkers(3);
      setNewServiceBasePrice(3000);
      setNewServiceRapidBasePrice(0);
      setNewServiceDuration(3);
    }
  };

  // Submit Save or Create
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setFormError('Category name is required.');
      return;
    }
    if (!description.trim()) {
      setFormError('Category description is required.');
      return;
    }
    if (!pictureBase64) {
      setFormError('Please upload a category image.');
      return;
    }
    if (categoryServices.length === 0) {
      setFormError('Configure at least one sub-service layout and base price.');
      return;
    }

    try {
      const payload: any = {
        name: name.trim(),
        nameFr: nameFr.trim(),
        nameAr: nameAr.trim(),
        description: description.trim(),
        descriptionFr: descriptionFr.trim(),
        descriptionAr: descriptionAr.trim(),
        picture: pictureBase64,
        categoryServices,
        materialPrice,
        materialsMandatory,
        localProductPrice,
        importedProductPrice,
        productsMandatory,
        details: detailsToApi(),
        isActive
      };

      if (editingCategory) {
        const updated = await categoriesApi.update(editingCategory.id, payload);
        setCategories(prev => prev.map(c => c.id === updated.id ? updated : c));
      } else {
        const created = await categoriesApi.create(payload);
        setCategories(prev => [...prev, created]);
      }
      setIsFormModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save category');
    }
  };

  // Delete handlers
  const handleOpenDelete = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (categoryToDelete) {
      try {
        await categoriesApi.delete(categoryToDelete.id);
        setCategories(prev => prev.filter(c => c.id !== categoryToDelete.id));
        setIsDeleteModalOpen(false);
        setCategoryToDelete(null);
      } catch (err: any) {
        alert('Failed to delete: ' + err.message);
      }
    }
  };

  const handleToggleStatus = async (id: string) => {
    const category = categories.find(c => c.id === id);
    if (!category) return;
    try {
      const updated = await categoriesApi.update(id, { isActive: !category.isActive });
      setCategories(prev => prev.map(c => c.id === id ? updated : c));
    } catch (e) {
      alert('Failed to update status');
    }
  };

  // Copy JSON Code block
  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(categories, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filter categories
  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Statistics
  const totalCount = categories.length;
  const activeCount = categories.filter(c => c.isActive).length;
  const inactiveCount = totalCount - activeCount;

  // Simulator logic
  const getSimResult = () => {
    if (!selectedSimCategory) return null;
    const subService = selectedSimCategory.categoryServices.find(c => c.name === selectedSimSubService);
    if (!subService) return null;

    const basePrice = subService.basePrice;
    const useMaterials = selectedSimCategory.materialsMandatory ? true : simUseMaterials;
    const materialCharge = useMaterials ? selectedSimCategory.materialPrice : 0;

    let productCharge = 0;
    const currentProduct = selectedSimCategory.productsMandatory && simUseProducts === 'none' ? 'local' : simUseProducts;
    if (currentProduct === 'local') {
      productCharge = selectedSimCategory.localProductPrice || 0;
    } else if (currentProduct === 'imported') {
      productCharge = selectedSimCategory.importedProductPrice || 0;
    }

    const total = basePrice + materialCharge + productCharge;

    return {
      basePrice,
      useMaterials,
      materialCharge,
      currentProduct,
      productCharge,
      total,
      workers: subService.workers
    };
  };

  const simResult = getSimResult();

  return (
    <div className="space-y-10 font-gilmer max-w-7xl mx-auto">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
            <Layers size={14} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Nadif Service Catalog</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-800 uppercase italic">
            Category <span className="text-primary">Manager</span>
          </h1>
          <p className="text-sm text-slate-400 font-medium">
            Configure cleaner requirements, materials charge rules, product origins and rates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => setIsJsonModalOpen(true)}
            className="px-5 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Code size={16} />
            View API JSON
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-6 py-4 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Plus size={16} strokeWidth={3} />
            Add Category
          </button>
        </div>
      </div>

      {/* 2. Interactive Live Simulator Sandbox */}
      {selectedSimCategory && simResult && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-950 text-white rounded-[2.5rem] p-8 lg:p-10 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-60 h-60 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
            {/* Simulation settings */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary">
                  <Calculator size={16} className="text-primary fill-primary/20" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Simulator Console</span>
                </div>
                <h3 className="text-2xl font-black uppercase italic tracking-tight">
                  Mobile App <span className="text-primary">Calculation Preview</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Select categories, sub-services, materials, and product origins to preview real-time mobile API results.
                </p>
              </div>

              {/* Selector elements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category choice */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Selected Category</label>
                  <select
                    value={selectedSimCategory.id}
                    onChange={(e) => {
                      const found = categories.find(c => c.id === e.target.value);
                      if (found) setSelectedSimCategory(found);
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold outline-none text-white focus:border-primary/50"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id} className="bg-slate-900 text-white font-bold">{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Sub service choice */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Select Sub-Service</label>
                  <select
                    value={selectedSimSubService}
                    onChange={(e) => setSelectedSimSubService(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold outline-none text-white focus:border-primary/50"
                  >
                    {selectedSimCategory.categoryServices.map(cs => (
                      <option key={cs.id} value={cs.name} className="bg-slate-900 text-white font-bold">{cs.name} ({cs.workers} Workers, {cs.durationHours}h)</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Materials checkbox */}
                <div className="bg-white/5 border border-white/5 p-5 rounded-2xl flex flex-col justify-between gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Materials Check</span>
                      <h4 className="text-xs font-black uppercase tracking-tight mt-1">Use Clean Materials</h4>
                    </div>
                    <button
                      onClick={() => {
                        if (!selectedSimCategory.materialsMandatory) {
                          setSimUseMaterials(!simUseMaterials);
                        }
                      }}
                      disabled={selectedSimCategory.materialsMandatory}
                      className={`w-12 h-7 rounded-full p-1 transition-colors relative cursor-pointer ${selectedSimCategory.materialsMandatory
                          ? 'bg-emerald-500/50 cursor-not-allowed'
                          : simUseMaterials ? 'bg-primary' : 'bg-white/10'
                        }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-all ${selectedSimCategory.materialsMandatory || simUseMaterials ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal font-medium">
                    {selectedSimCategory.materialsMandatory
                      ? 'Mandatory for this category. Included in base price.'
                      : `Optionally add clean materials for +${selectedSimCategory.materialPrice} DA.`}
                  </p>
                </div>

                {/* Products choices */}
                <div className="bg-white/5 border border-white/5 p-5 rounded-2xl flex flex-col justify-between gap-3">
                  <div>
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Product Origin</span>
                    <h4 className="text-xs font-black uppercase tracking-tight mt-1">Cleaning Products Kit</h4>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 bg-slate-950/60 p-1 rounded-xl">
                    {/* None */}
                    {!selectedSimCategory.productsMandatory && (
                      <button
                        onClick={() => setSimUseProducts('none')}
                        className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${simUseProducts === 'none' ? 'bg-white/10 text-white shadow' : 'text-slate-500 hover:text-white'
                          }`}
                      >
                        None
                      </button>
                    )}
                    {/* Local */}
                    <button
                      onClick={() => setSimUseProducts('local')}
                      className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${simUseProducts === 'local' ? 'bg-white/10 text-white shadow' : 'text-slate-500 hover:text-white'
                        } ${selectedSimCategory.productsMandatory ? 'col-span-1.5' : ''}`}
                    >
                      Local (+{selectedSimCategory.localProductPrice} DA)
                    </button>
                    {/* Imported */}
                    <button
                      onClick={() => setSimUseProducts('imported')}
                      className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${simUseProducts === 'imported' ? 'bg-white/10 text-white shadow' : 'text-slate-500 hover:text-white'
                        } ${selectedSimCategory.productsMandatory ? 'col-span-1.5' : ''}`}
                    >
                      Imported (+{selectedSimCategory.importedProductPrice} DA)
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal font-medium">
                    {selectedSimCategory.productsMandatory
                      ? 'Products kit is mandatory. Select origin.'
                      : 'Add premium products kit to your clean order.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Calculations receipt panel */}
            <div className="lg:col-span-5 bg-white/5 border border-white/5 rounded-3xl p-6 lg:p-8 flex flex-col justify-between gap-6 backdrop-blur">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden shadow border border-white/10">
                      <img src={imgUrl(selectedSimCategory.picture)} alt="Thumbnail" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase truncate max-w-[150px]">{selectedSimCategory.name}</h4>
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-0.5">{selectedSimSubService}</p>
                    </div>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                    <Check size={10} strokeWidth={3} /> API Valid
                  </div>
                </div>

                {/* Bill Breakdown */}
                <div className="space-y-2.5 text-xs font-medium text-slate-400">
                  <div className="flex justify-between">
                    <span>Base Price ({selectedSimSubService}):</span>
                    <span className="font-bold text-white">{simResult.basePrice} DA</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Clean Materials:</span>
                    <span className="font-bold text-white">
                      {simResult.useMaterials ? `+${selectedSimCategory.materialPrice} DA` : 'Excluded'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Products Kit:</span>
                    <span className="font-bold text-white">
                      {simResult.currentProduct === 'local' && `+${selectedSimCategory.localProductPrice} DA (Local)`}
                      {simResult.currentProduct === 'imported' && `+${selectedSimCategory.importedProductPrice} DA (Imported)`}
                      {simResult.currentProduct === 'none' && 'Excluded'}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-white/5 pt-2.5">
                    <span>Staff Assigned:</span>
                    <span className="font-bold text-white">{simResult.workers} Professional Cleaners</span>
                  </div>
                </div>
              </div>

              {/* Total Summary */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Estimated Total</p>
                    <p className="text-3xl font-black text-primary tracking-tight">{simResult.total} DA</p>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pb-1">VAT Included</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 flex gap-3 items-center border border-white/5 text-[10px] font-bold text-slate-300 leading-normal">
                  <Info size={14} className="text-primary shrink-0" />
                  <p>
                    Calculated live using default rules. Results will match clients mobile checkout exact price.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 3. Stats Dashboard */}
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

      {/* 4. Toolbar Section */}
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

      {/* 5. Category Grid / List Display */}
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
              {searchQuery ? "We couldn't find any matches for your query. Try something else." : "Get started by creating your very first cleaning category!"}
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
                        src={imgUrl(category.picture)}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>

                    {/* Status Badge */}
                    <button
                      onClick={() => handleToggleStatus(category.id)}
                      className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${category.isActive
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-100'
                        }`}
                      title={category.isActive ? "Click to Deactivate" : "Click to Activate"}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${category.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                      {category.isActive ? 'Active' : 'Draft'}
                    </button>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2 relative z-10">
                    <h3 className="text-xl font-bold uppercase tracking-tight text-slate-800 leading-none group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-semibold font-inter line-clamp-3 leading-relaxed">
                      {category.description}
                    </p>
                  </div>

                  {/* Category Services Layout default rules */}
                  <div className="space-y-2">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Labor Layout Default rules</p>
                    <div className="flex flex-wrap gap-2">
                      {category.categoryServices.map((cs) => (
                        <span key={cs.id} className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-bold text-slate-500 uppercase">
                          {cs.name}: <strong className="text-slate-800">{cs.basePrice} DA</strong> <span className="text-amber-600 font-bold ml-1">⚡ {cs.rapidBasePrice || 0} DA</span> ({cs.workers}W, {cs.durationHours}h)
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Surcharges list */}
                  <div className="space-y-1.5 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 text-[9px] font-semibold text-slate-500">
                    <div className="flex justify-between">
                      <span>Materials Surcharge:</span>
                      <strong className="text-slate-800">
                        +{category.materialPrice} DA {category.materialsMandatory && '(Mandatory)'}
                      </strong>
                    </div>
                    <div className="flex justify-between border-t border-slate-100/50 pt-1.5">
                      <span>Local Products Rate:</span>
                      <strong className="text-slate-800">
                        +{category.localProductPrice || 0} DA {category.productsMandatory && '(Mandatory)'}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Imported Products Rate:</span>
                      <strong className="text-slate-800">
                        +{category.importedProductPrice || 0} DA
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-slate-50 my-6" />

                {/* Actions Panel */}
                <div className="flex justify-between items-center relative z-10">
                  <button
                    onClick={() => {
                      setSelectedSimCategory(category);
                      if (category.categoryServices.length > 0) {
                        setSelectedSimSubService(category.categoryServices[0].name);
                      }
                    }}
                    className="px-3.5 py-2.5 bg-primary/5 hover:bg-primary hover:text-white border border-primary/10 text-primary text-[9px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center gap-1.5 font-bold"
                  >
                    <Calculator size={12} />
                    Simulate Price
                  </button>

                  <div className="flex gap-2">
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
                  <th className="pb-4">Rates config count</th>
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
                          <img src={imgUrl(category.picture)} alt={category.name} className="w-full h-full object-cover" />
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold uppercase tracking-tight text-slate-800">{category.name}</span>
                          <span className="text-[10px] text-slate-400 font-medium font-inter line-clamp-1">{category.description}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="text-xs font-semibold text-slate-500 font-mono">
                          {category.categoryServices.length} sub-services
                        </span>
                      </td>
                      <td className="py-4">
                        <button
                          onClick={() => handleToggleStatus(category.id)}
                          className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-1.5 ${category.isActive
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
                            onClick={() => {
                              setSelectedSimCategory(category);
                              if (category.categoryServices.length > 0) {
                                setSelectedSimSubService(category.categoryServices[0].name);
                              }
                            }}
                            className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-primary/10 hover:text-primary text-slate-500 flex items-center justify-center transition-all cursor-pointer animate-pulse"
                            title="Simulate Price"
                          >
                            <Calculator size={14} />
                          </button>
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

      {/* 6. ADD / EDIT DIALOG MODAL */}
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
              className="w-full max-w-[620px] max-h-[85vh] bg-white rounded-[3rem] shadow-2xl border border-slate-100 relative z-10 overflow-hidden flex flex-col"
            >
              {/* Top Banner Accent */}
              <div className="h-2 bg-gradient-to-r from-primary via-primary-400 to-secondary shrink-0" />

              {/* Close Button */}
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-100 transition-all cursor-pointer z-20"
              >
                <X size={18} />
              </button>

              <div className="overflow-y-auto p-8 lg:p-10 space-y-8">
                {/* Header */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-primary">
                    <Sparkles size={16} className="fill-primary" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Catalog Configuration</span>
                  </div>
                  <h2 className="text-2xl font-black uppercase italic tracking-tight text-slate-800">
                    {editingCategory ? 'Modify Category' : 'Create Category'}
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">
                    Configure your category name, services structure, surcharge rules, and deployment status.
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

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Language Tab Switcher */}
                  <div className="flex gap-2 border-b border-slate-100 pb-3">
                    <button
                      type="button"
                      onClick={() => setFormLangTab('en')}
                      className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer ${
                        formLangTab === 'en' ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormLangTab('fr')}
                      className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer ${
                        formLangTab === 'fr' ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      French
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormLangTab('ar')}
                      className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer ${
                        formLangTab === 'ar' ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      Arabic
                    </button>
                  </div>

                  {formLangTab === 'en' && (
                    <>
                      {/* Category Name */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 pl-2">
                          Category Name (English)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Laundry & Ironing, Carpet Cleaning"
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            if (formError.includes('name')) setFormError('');
                          }}
                          className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-primary/20 focus:bg-white outline-none font-bold text-slate-800 text-sm placeholder-slate-300 transition-all"
                        />
                      </div>

                      {/* Category Description */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 pl-2">
                          Description (English)
                        </label>
                        <textarea
                          placeholder="Explain what types of cleaners, properties or rules apply to this service category..."
                          value={description}
                          onChange={(e) => {
                            setDescription(e.target.value);
                            if (formError.includes('description')) setFormError('');
                          }}
                          rows={3}
                          className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-primary/20 focus:bg-white outline-none font-bold text-slate-800 text-sm placeholder-slate-300 transition-all resize-none"
                        />
                      </div>
                    </>
                  )}

                  {formLangTab === 'fr' && (
                    <>
                      {/* Category Name (FR) */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 pl-2">
                          Category Name (French)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Lavage & Repassage, Nettoyage de Tapis"
                          value={nameFr}
                          onChange={(e) => setNameFr(e.target.value)}
                          className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-primary/20 focus:bg-white outline-none font-bold text-slate-800 text-sm placeholder-slate-300 transition-all"
                        />
                      </div>

                      {/* Category Description (FR) */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 pl-2">
                          Description (French)
                        </label>
                        <textarea
                          placeholder="Expliquez les détails..."
                          value={descriptionFr}
                          onChange={(e) => setDescriptionFr(e.target.value)}
                          rows={3}
                          className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-primary/20 focus:bg-white outline-none font-bold text-slate-800 text-sm placeholder-slate-300 transition-all resize-none"
                        />
                      </div>
                    </>
                  )}

                  {formLangTab === 'ar' && (
                    <>
                      {/* Category Name (AR) */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 pl-2">
                          Category Name (Arabic)
                        </label>
                        <input
                          type="text"
                          dir="rtl"
                          placeholder="مثال: غسيل وكي، تنظيف سجاد"
                          value={nameAr}
                          onChange={(e) => setNameAr(e.target.value)}
                          className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-primary/20 focus:bg-white outline-none font-bold text-slate-800 text-sm placeholder-slate-300 transition-all text-right"
                        />
                      </div>

                      {/* Category Description (AR) */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 pl-2">
                          Description (Arabic)
                        </label>
                        <textarea
                          placeholder="شرح تفاصيل الفئة..."
                          value={descriptionAr}
                          onChange={(e) => setDescriptionAr(e.target.value)}
                          rows={3}
                          dir="rtl"
                          className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-primary/20 focus:bg-white outline-none font-bold text-slate-800 text-sm placeholder-slate-300 transition-all resize-none text-right"
                        />
                      </div>
                    </>
                  )}

                  {/* Icon File Upload */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 pl-2">
                      Icon / Image Asset
                    </label>

                    {pictureBase64 ? (
                      // Preview state
                      <div className="relative border border-slate-100 rounded-3xl p-4 flex items-center gap-4 bg-slate-50/50">
                        <div className="w-16 h-16 relative rounded-2xl overflow-hidden border border-slate-100 shadow-sm shrink-0 bg-slate-50">
                          <img src={imgUrl(pictureBase64)} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 uppercase truncate">
                            Selected Icon
                          </p>
                          <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1 mt-0.5">
                            <Check size={10} strokeWidth={3} /> Ready to Save
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setPictureBase64('');
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
                        className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${dragActive
                            ? 'border-primary bg-primary/5 text-primary scale-[0.99]'
                            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 text-slate-400'
                          }`}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                        />
                        <UploadCloud size={32} className={`mb-3 ${dragActive ? 'text-primary animate-bounce' : 'text-slate-300'}`} />
                        <p className="text-xs font-bold text-slate-700">
                          Drag & drop an image here, or <span className="text-primary hover:underline">browse</span>
                        </p>
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider mt-2.5 bg-slate-100 px-3 py-1 rounded-md">
                          PNG, JPG or WebP
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Mobile Details Page Content */}
                  <div className="space-y-4 border border-slate-200 rounded-2xl p-5 bg-slate-50/40">
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
                      📱 Mobile Details Page (shown on the app's service page)
                    </p>
                    {([
                      { label: 'Objective', en: 'objective', fr: 'objectiveFr', ar: 'objectiveAr', rows: 2, hint: 'Goal of the service...' },
                      { label: 'Service Includes (one per line)', en: 'includes', fr: 'includesFr', ar: 'includesAr', rows: 4, hint: 'Deep cleaning of floors\nKitchen cleaning...' },
                      { label: 'Duration Text', en: 'durationText', fr: 'durationTextFr', ar: 'durationTextAr', rows: 1, hint: 'e.g. 3 to 4 hours' },
                      { label: 'Additional Info', en: 'additional', fr: 'additionalFr', ar: 'additionalAr', rows: 2, hint: 'Extra notes shown at the bottom...' },
                    ] as const).map(group => (
                      <div key={group.en} className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-2">
                          {group.label}
                        </label>
                        <textarea
                          rows={group.rows}
                          placeholder={group.hint}
                          value={detailsForm[group.en]}
                          onChange={(e) => setDetail(group.en, e.target.value)}
                          className="w-full px-5 py-3 bg-white rounded-2xl border border-slate-200 focus:border-primary/30 outline-none font-semibold text-slate-800 text-sm placeholder-slate-300 transition-all resize-none"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <textarea
                            rows={group.rows}
                            placeholder="Français (optionnel)"
                            value={detailsForm[group.fr]}
                            onChange={(e) => setDetail(group.fr, e.target.value)}
                            className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 focus:border-primary/30 outline-none font-semibold text-slate-700 text-xs placeholder-slate-300 transition-all resize-none"
                          />
                          <textarea
                            rows={group.rows}
                            dir="rtl"
                            placeholder="العربية (اختياري)"
                            value={detailsForm[group.ar]}
                            onChange={(e) => setDetail(group.ar, e.target.value)}
                            className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 focus:border-primary/30 outline-none font-semibold text-slate-700 text-xs placeholder-slate-300 transition-all resize-none text-right"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Sub-Services Configuration List */}
                  <div className="space-y-4 border border-slate-100 rounded-3xl p-5 bg-slate-50/50">
                    <div className="space-y-1">
                      <h4 className="text-xs font-black uppercase text-slate-800 pl-1">Sub-Services Base Price Rules</h4>
                      <p className="text-[10px] font-bold text-slate-400 pl-1 leading-normal">
                        Associate services layouts/sizes with professional worker counts and rates.
                      </p>
                    </div>

                    {categoryServices.length > 0 && (
                      <div className="divide-y divide-slate-100 bg-white rounded-2xl border border-slate-100 px-4 overflow-hidden">
                        {categoryServices.map((config: any) => (
                          <div key={config.name} className="flex justify-between items-center py-3 text-xs">
                            <div>
                              <span className="font-black uppercase text-slate-800">{config.name}</span>
                              {(config.nameFr || config.nameAr) && (
                                <span className="text-[9px] text-slate-400 ml-2">
                                  (FR: {config.nameFr || '--'} / AR: {config.nameAr || '--'})
                                </span>
                              )}
                              <span className="text-[9px] text-slate-400 font-bold ml-2">({config.workers} Workers, {config.durationHours ?? 3}h)</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex flex-col items-end mr-2">
                                <span className="font-black text-primary text-[11px] leading-tight">{config.basePrice} DA Base</span>
                                <span className="text-[10px] font-black text-amber-500 leading-tight">⚡ {config.rapidBasePrice || 0} DA</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleEditServiceConfig(config)}
                                className="text-blue-500 hover:text-blue-700 p-1 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                                title="Edit config"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveServiceConfig(config.name)}
                                className="text-rose-500 hover:text-rose-700 p-1 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                                title="Remove config"
                              >
                                <Trash size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add layout controls */}
                    <div className="space-y-2 border-t border-slate-100 pt-3 mt-2">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-1">Name (EN)</label>
                          <input
                            type="text"
                            placeholder="e.g. Standard"
                            value={newServiceName}
                            onChange={(e) => setNewServiceName(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none text-slate-800 focus:border-primary/40"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-1">Name (FR)</label>
                          <input
                            type="text"
                            placeholder="e.g. Standard"
                            value={newServiceNameFr}
                            onChange={(e) => setNewServiceNameFr(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none text-slate-800 focus:border-primary/40"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-1">Name (AR)</label>
                          <input
                            type="text"
                            dir="rtl"
                            placeholder="مثال: عادي"
                            value={newServiceNameAr}
                            onChange={(e) => setNewServiceNameAr(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none text-slate-800 focus:border-primary/40 text-right"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-1">Workers Required</label>
                          <input
                            type="number"
                            placeholder="Workers"
                            value={newServiceWorkers || ''}
                            onChange={(e) => setNewServiceWorkers(Number(e.target.value))}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none text-slate-800 focus:border-primary/40 text-center"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-1">Base Price (DA)</label>
                          <input
                            type="number"
                            placeholder="Base Price"
                            value={newServiceBasePrice || ''}
                            onChange={(e) => setNewServiceBasePrice(Number(e.target.value))}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none text-slate-800 focus:border-primary/40 text-center"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-1">Rapid Price (DA)</label>
                          <input
                            type="number"
                            placeholder="Rapid Price"
                            value={newServiceRapidBasePrice || ''}
                            onChange={(e) => setNewServiceRapidBasePrice(Number(e.target.value))}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none text-slate-800 focus:border-primary/40 text-center"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-1">Duration (H)</label>
                          <input
                            type="number"
                            placeholder="Hours"
                            value={newServiceDuration || ''}
                            onChange={(e) => setNewServiceDuration(Number(e.target.value))}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none text-slate-800 focus:border-primary/40 text-center"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddServiceConfig}
                        className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold uppercase transition-all cursor-pointer mt-1"
                      >
                        {editingServiceName ? 'Update Service Rate Rule' : 'Add Service Rate Rule'}
                      </button>
                    </div>
                  </div>

                  {/* 1. Materials Checklist rules */}
                  <div className="bg-slate-50 rounded-3xl p-5 space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-black uppercase text-slate-800">Cleaning Materials Surcharge</h4>
                        <p className="text-[9px] font-bold text-slate-400 mt-0.5">Toggle default materials cost rules</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setMaterialsMandatory(!materialsMandatory)}
                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${materialsMandatory
                            ? 'bg-rose-50 text-rose-600 border border-rose-100'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                      >
                        {materialsMandatory ? 'Always Mandatory' : 'Optional Choice'}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1 col-span-2">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-2">
                          Materials Surcharge Rate (DA)
                        </label>
                        <input
                          type="number"
                          value={materialPrice || ''}
                          onChange={(e) => setMaterialPrice(Number(e.target.value))}
                          className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 outline-none font-bold text-slate-800 text-xs focus:border-primary/40"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. Cleaning products rules */}
                  <div className="bg-slate-50 rounded-3xl p-5 space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-black uppercase text-slate-800">Cleaning Products Kit Surcharge</h4>
                        <p className="text-[9px] font-bold text-slate-400 mt-0.5">Add local vs imported cost margins</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setProductsMandatory(!productsMandatory)}
                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${productsMandatory
                            ? 'bg-rose-50 text-rose-600 border border-rose-100'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                      >
                        {productsMandatory ? 'Always Mandatory' : 'Optional Choice'}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-2">
                          Local Kit Price (DA)
                        </label>
                        <input
                          type="number"
                          value={localProductPrice || ''}
                          onChange={(e) => setLocalProductPrice(Number(e.target.value))}
                          className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 outline-none font-bold text-slate-800 text-xs focus:border-primary/40"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-2">
                          Imported Kit Price (DA)
                        </label>
                        <input
                          type="number"
                          value={importedProductPrice || ''}
                          onChange={(e) => setImportedProductPrice(Number(e.target.value))}
                          className="w-full px-4 py-3 bg-white rounded-xl border border-slate-200 outline-none font-bold text-slate-800 text-xs focus:border-primary/40"
                        />
                      </div>
                    </div>
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
                      className={`w-14 h-8 rounded-full transition-colors cursor-pointer relative p-1 ${isActive ? 'bg-primary' : 'bg-slate-300'
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

                  {/* Actions */}
                  <div className="flex gap-4 pt-4 shrink-0">
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
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. DELETE CONFIRMATION DIALOG */}
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

      {/* 8. JSON VIEWER MODAL */}
      <AnimatePresence>
        {isJsonModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsJsonModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-[640px] bg-slate-950 text-white rounded-[3rem] shadow-2xl border border-white/5 relative z-10 overflow-hidden flex flex-col max-h-[80vh]"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex justify-between items-center shrink-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-primary">
                    <Code size={14} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live API Response</span>
                  </div>
                  <h3 className="text-lg font-black uppercase italic tracking-tight">
                    Categories Data <span className="text-primary">Payload</span>
                  </h3>
                </div>
                <button
                  onClick={() => setIsJsonModalOpen(false)}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 border border-white/10 transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Payload code block */}
              <div className="flex-1 overflow-auto p-6 font-mono text-[11px] leading-relaxed text-slate-300 bg-slate-900/50">
                <pre>{JSON.stringify(categories, null, 2)}</pre>
              </div>

              {/* Footer controls */}
              <div className="p-6 border-t border-white/5 flex gap-4 shrink-0 bg-slate-950">
                <button
                  onClick={handleCopyJson}
                  className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-black uppercase tracking-wider text-[10px] flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check size={14} className="text-emerald-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      Copy JSON Payload
                    </>
                  )}
                </button>
                <button
                  onClick={() => setIsJsonModalOpen(false)}
                  className="flex-1 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-wider text-[10px] transition-all cursor-pointer text-center"
                >
                  Close Viewer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
