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
import { servicesApi, type ApiService as Service, type ApiHouseConfig as HouseConfig } from '../../lib/api';

// Local mock removed in favor of API

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [nameFr, setNameFr] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionFr, setDescriptionFr] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [formLangTab, setFormLangTab] = useState<'en' | 'fr' | 'ar'>('en');
  const [pictureBase64, setPictureBase64] = useState('');
  const [extraWorkerPrice, setExtraWorkerPrice] = useState<number>(0);
  const [durationHours, setDurationHours] = useState<number>(4);
  
  // Materials Form States
  const [materialPrice, setMaterialPrice] = useState<number>(0);
  const [materialsMandatory, setMaterialsMandatory] = useState(false);
  
  // Products Form States
  const [localProductPrice, setLocalProductPrice] = useState<number>(0);
  const [importedProductPrice, setImportedProductPrice] = useState<number>(0);
  const [productsMandatory, setProductsMandatory] = useState(false);
  
  const [isActive, setIsActive] = useState(true);
  const [houseConfigs, setHouseConfigs] = useState<Partial<HouseConfig>[]>([]);

  // Nested House Config Sub-form Add
  const [newHouseType, setNewHouseType] = useState('');
  const [newHouseTypeFr, setNewHouseTypeFr] = useState('');
  const [newHouseTypeAr, setNewHouseTypeAr] = useState('');
  const [newHouseWorkers, setNewHouseWorkers] = useState<number>(3);
  const [newHouseBasePrice, setNewHouseBasePrice] = useState<number>(3000);
  const [newHouseDuration, setNewHouseDuration] = useState<number>(3);
  const [editingHouseType, setEditingHouseType] = useState<string | null>(null);

  const [formError, setFormError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Service to Delete
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  // JSON Copied Toast
  const [copied, setCopied] = useState(false);

  // LIVE SIMULATOR STATES
  const [selectedSimService, setSelectedSimService] = useState<Service | null>(null);
  const [selectedSimHouse, setSelectedSimHouse] = useState<string>('');
  const [simExtraWorkers, setSimExtraWorkers] = useState<number>(0);
  const [simUseMaterials, setSimUseMaterials] = useState<boolean>(true);
  const [simUseProducts, setSimUseProducts] = useState<'none' | 'local' | 'imported'>('local');
  const [simDate, setSimDate] = useState<string>('2026-05-18');
  const [simTime, setSimTime] = useState<string>('09:00');

  // Load from API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const fetched = await servicesApi.getAll();
        setServices(fetched);
        if (fetched.length > 0) setSelectedSimService(fetched[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoaded(true);
      }
    };
    fetchServices();
  }, []);

  // Set default simulation settings when selected service changes
  useEffect(() => {
    if (selectedSimService && selectedSimService.houseConfigs.length > 0) {
      setSelectedSimHouse(selectedSimService.houseConfigs[0].type);
      setSimExtraWorkers(0);
      setSimUseMaterials(selectedSimService.materialsMandatory ? true : false);
      setSimUseProducts(selectedSimService.productsMandatory ? 'local' : 'none');
      setSimTime('09:00');
    }
  }, [selectedSimService]);

  // Sync simulator mandatory rules on change
  useEffect(() => {
    if (selectedSimService) {
      if (selectedSimService.materialsMandatory) {
        setSimUseMaterials(true);
      }
      if (selectedSimService.productsMandatory && simUseProducts === 'none') {
        setSimUseProducts('local');
      }
    }
  }, [selectedSimHouse, selectedSimService, simUseProducts]);

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingService(null);
    setName('');
    setNameFr('');
    setNameAr('');
    setDescription('');
    setDescriptionFr('');
    setDescriptionAr('');
    setFormLangTab('en');
    setPictureBase64('');
    setExtraWorkerPrice(1000);
    setDurationHours(4);
    
    setMaterialPrice(1500);
    setMaterialsMandatory(false);
    
    setLocalProductPrice(1200);
    setImportedProductPrice(2000);
    setProductsMandatory(false);
    
    setIsActive(true);
    setHouseConfigs([
      { type: 'f2', typeFr: 'f2', typeAr: 'ف2', workers: 3, basePrice: 3000, durationHours: 3 },
      { type: 'f3', typeFr: 'f3', typeAr: 'ف3', workers: 4, basePrice: 4000, durationHours: 3 },
      { type: 'f4', typeFr: 'f4', typeAr: 'ف4', workers: 5, basePrice: 5000, durationHours: 3 }
    ]);
    setNewHouseType('');
    setNewHouseTypeFr('');
    setNewHouseTypeAr('');
    setNewHouseWorkers(3);
    setNewHouseBasePrice(3000);
    setNewHouseDuration(3);
    setEditingHouseType(null);
    setFormError('');
    setIsFormModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (service: Service) => {
    setEditingService(service);
    setName(service.name);
    setNameFr(service.nameFr || '');
    setNameAr(service.nameAr || '');
    setDescription(service.description);
    setDescriptionFr(service.descriptionFr || '');
    setDescriptionAr(service.descriptionAr || '');
    setFormLangTab('en');
    setPictureBase64(service.picture);
    setExtraWorkerPrice(service.extraWorkerPrice);
    setDurationHours(service.durationHours);
    
    setMaterialPrice(service.materialPrice);
    setMaterialsMandatory(service.materialsMandatory);
    
    setLocalProductPrice(service.localProductPrice || 0);
    setImportedProductPrice(service.importedProductPrice || 0);
    setProductsMandatory(service.productsMandatory || false);
    
    setIsActive(service.isActive);
    setHouseConfigs(service.houseConfigs.map(hc => ({
      id: hc.id,
      serviceId: hc.serviceId,
      type: hc.type,
      typeFr: hc.typeFr || '',
      typeAr: hc.typeAr || '',
      workers: hc.workers,
      basePrice: hc.basePrice,
      durationHours: hc.durationHours
    })));
    setNewHouseType('');
    setNewHouseTypeFr('');
    setNewHouseTypeAr('');
    setNewHouseWorkers(3);
    setNewHouseBasePrice(3000);
    setNewHouseDuration(3);
    setEditingHouseType(null);
    setFormError('');
    setIsFormModalOpen(true);
  };

  // File Upload Handlers (PNG strict checking)
  const processFile = (file: File) => {
    if (file.type !== 'image/png') {
      setFormError('Only PNG files are allowed. Please upload a valid PNG format.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPictureBase64(e.target.result as string);
        setFormError('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  // House configs adding/editing inside modal sub-form
  const handleEditHouseConfig = (config: any) => {
    setNewHouseType(config.type);
    setNewHouseTypeFr(config.typeFr || '');
    setNewHouseTypeAr(config.typeAr || '');
    setNewHouseWorkers(config.workers);
    setNewHouseBasePrice(config.basePrice);
    setNewHouseDuration(config.durationHours ?? 3);
    setEditingHouseType(config.type);
  };

  const handleAddHouseConfig = () => {
    const typeCleaned = newHouseType.trim().toLowerCase();
    if (!typeCleaned) return;

    if (newHouseBasePrice <= 0) {
      setFormError(`Base price must be a positive rate.`);
      return;
    }

    if (editingHouseType) {
      if (editingHouseType !== typeCleaned && houseConfigs.some((config: any) => config.type === typeCleaned)) {
        setFormError(`Configuration for '${typeCleaned}' already exists.`);
        return;
      }
      setHouseConfigs(prev => prev.map((config: any) => 
        config.type === editingHouseType 
          ? { ...config, type: typeCleaned, typeFr: newHouseTypeFr.trim(), typeAr: newHouseTypeAr.trim(), workers: newHouseWorkers, basePrice: newHouseBasePrice, durationHours: newHouseDuration } 
          : config
      ));
      setEditingHouseType(null);
    } else {
      if (houseConfigs.some((config: any) => config.type === typeCleaned)) {
        setFormError(`Configuration for '${typeCleaned}' already exists.`);
        return;
      }
      setHouseConfigs(prev => [...prev, { type: typeCleaned, typeFr: newHouseTypeFr.trim(), typeAr: newHouseTypeAr.trim(), workers: newHouseWorkers, basePrice: newHouseBasePrice, durationHours: newHouseDuration }]);
    }

    setNewHouseType('');
    setNewHouseTypeFr('');
    setNewHouseTypeAr('');
    setNewHouseWorkers(3);
    setNewHouseBasePrice(3000);
    setNewHouseDuration(3);
    setFormError('');
  };

  // House configs removal inside modal sub-form
  const handleRemoveHouseConfig = (type: string) => {
    setHouseConfigs(prev => prev.filter((c: any) => c.type !== type));
    if (editingHouseType === type) {
      setEditingHouseType(null);
      setNewHouseType('');
      setNewHouseTypeFr('');
      setNewHouseTypeAr('');
      setNewHouseWorkers(3);
      setNewHouseBasePrice(3000);
      setNewHouseDuration(3);
    }
  };

  // Submit Save or Create
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setFormError('Service name is required.');
      return;
    }
    if (!description.trim()) {
      setFormError('Service description is required.');
      return;
    }
    if (!pictureBase64) {
      setFormError('Please upload a PNG service image.');
      return;
    }
    if (houseConfigs.length === 0) {
      setFormError('Configure at least one house layout type (e.g. f2, f3) and base price.');
      return;
    }

    try {
      if (editingService) {
        // Edit
        const payload: any = { 
          name: name.trim(), 
          nameFr: nameFr.trim(),
          nameAr: nameAr.trim(),
          description: description.trim(), 
          descriptionFr: descriptionFr.trim(),
          descriptionAr: descriptionAr.trim(),
          picture: pictureBase64, 
          houseConfigs, 
          extraWorkerPrice, 
          durationHours, 
          materialPrice, 
          materialsMandatory, 
          localProductPrice,
          importedProductPrice,
          productsMandatory,
          isActive 
        };
        const updated = await servicesApi.update(editingService.id, payload);
        setServices(prev => prev.map(srv => srv.id === updated.id ? updated : srv));
      } else {
        // Create
        const payload = {
          name: name.trim(),
          nameFr: nameFr.trim(),
          nameAr: nameAr.trim(),
          description: description.trim(),
          descriptionFr: descriptionFr.trim(),
          descriptionAr: descriptionAr.trim(),
          picture: pictureBase64,
          houseConfigs,
          extraWorkerPrice,
          durationHours,
          materialPrice,
          materialsMandatory,
          localProductPrice,
          importedProductPrice,
          productsMandatory,
          isActive
        };
        const created = await servicesApi.create(payload);
        setServices(prev => [...prev, created]);
      }
      setIsFormModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save service');
    }
  };

  // Delete handlers
  const handleOpenDelete = (service: Service) => {
    setServiceToDelete(service);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (serviceToDelete) {
      try {
        await servicesApi.delete(serviceToDelete.id);
        setServices(prev => prev.filter(s => s.id !== serviceToDelete.id));
        setIsDeleteModalOpen(false);
        setServiceToDelete(null);
      } catch (err: any) {
        alert('Failed to delete: ' + err.message);
      }
    }
  };

  const handleToggleStatus = async (id: string) => {
    const srv = services.find(s => s.id === id);
    if (!srv) return;
    try {
      const updated = await servicesApi.update(id, { isActive: !srv.isActive });
      setServices(prev => prev.map(s => s.id === id ? updated : s));
    } catch (e) {
      alert('Failed to update status');
    }
  };

  // Copy JSON Code block
  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(services, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filter services
  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // SIMULATOR CALCULATOR LOGIC
  const getSimCalculations = () => {
    if (!selectedSimService) return null;

    const config = selectedSimService.houseConfigs.find((c: HouseConfig) => c.type === selectedSimHouse);
    if (!config) return null;

    // 1. Base Rate loaded directly from layout selected
    const baseVal = config.basePrice;
    
    // 2. Worker logic
    const defaultWorkers = config.workers;
    const totalWorkers = defaultWorkers + simExtraWorkers;
    const extraPriceSum = simExtraWorkers * selectedSimService.extraWorkerPrice;
    
    // 3. Materials Surcharge logic (force true if service has mandatory materials)
    const useMaterials = selectedSimService.materialsMandatory ? true : simUseMaterials;
    const materialCharge = useMaterials ? selectedSimService.materialPrice : 0;

    // 4. Products Surcharge logic (force local/imported if service has mandatory products)
    let currentProduct = simUseProducts;
    if (selectedSimService.productsMandatory && currentProduct === 'none') {
      currentProduct = 'local';
    }
    
    let productCharge = 0;
    if (currentProduct === 'local') {
      productCharge = selectedSimService.localProductPrice || 0;
    } else if (currentProduct === 'imported') {
      productCharge = selectedSimService.importedProductPrice || 0;
    }

    // 5. Total
    const totalPrice = baseVal + extraPriceSum + materialCharge + productCharge;

    // Time calculations
    let finishedTimeStr = '';
    try {
      const [hours, minutes] = simTime.split(':').map(Number);
      const startMinutesTotal = hours * 60 + minutes;
      const endMinutesTotal = startMinutesTotal + (selectedSimService.durationHours * 60);
      
      const finishedHours = Math.floor((endMinutesTotal / 60) % 24);
      const finishedMinutes = Math.floor(endMinutesTotal % 60);
      
      const hh = finishedHours.toString().padStart(2, '0');
      const mm = finishedMinutes.toString().padStart(2, '0');
      finishedTimeStr = `${hh}:${mm}`;
    } catch(e) {
      finishedTimeStr = '--:--';
    }

    // Format Date for Notification
    let formattedDate = simDate;
    try {
      const parsedDate = new Date(simDate);
      if (!isNaN(parsedDate.getTime())) {
        formattedDate = parsedDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
    } catch(e) {}

    // Formatted push notifications details
    const matText = useMaterials ? 'w/ materials' : 'own materials';
    
    let prodText = 'own products';
    if (currentProduct === 'local') prodText = 'local products';
    else if (currentProduct === 'imported') prodText = 'imported products';

    const notificationMessage = `🔔 Schedule Alert: Clean order for ${selectedSimService.name} (${selectedSimHouse.toUpperCase()} layout, ${matText}, ${prodText}) is set for ${formattedDate} at ${simTime}. The work will take approximately 4 hours and will finish around ${finishedTimeStr}.`;

    return {
      baseVal,
      defaultWorkers,
      totalWorkers,
      extraPriceSum,
      useMaterials,
      materialCharge,
      currentProduct,
      productCharge,
      totalPrice,
      finishedTimeStr,
      notificationMessage
    };
  };

  const simResult = getSimCalculations();

  return (
    <div className="space-y-10 font-gilmer max-w-7xl mx-auto">
      {/* 1. Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
            <ShoppingBag size={14} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Dynamic Offer Manager</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-800 uppercase italic">
            Service & Pricing <span className="text-primary">Configurator</span>
          </h1>
          <p className="text-sm text-slate-400 font-medium font-inter">
            Define pricing rules per layout (F2, F3, F4), extra worker rates, cleaning equipment surcharges, local vs imported product selections, and timing notification triggers.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 shrink-0 self-start md:self-center">
          <button 
            onClick={() => setIsJsonModalOpen(true)}
            className="px-5 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2.5 transition-all cursor-pointer"
          >
            <Code size={16} />
            View API JSON
          </button>

          <button 
            onClick={handleOpenCreate}
            className="px-6 py-4 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Plus size={16} strokeWidth={3} />
            Add Service
          </button>
        </div>
      </div>

      {/* 2. Interactive Live Simulator Sandbox */}
      {selectedSimService && simResult && (
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
                  Select clean packages, select layouts, materials checklist, and product origins to preview real-time mobile API results.
                </p>
              </div>

              {/* Selector elements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Service choice */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Selected Service Package</label>
                  <select 
                    value={selectedSimService.id}
                    onChange={(e) => {
                      const found = services.find(s => s.id === e.target.value);
                      if (found) setSelectedSimService(found);
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold outline-none text-white focus:border-primary/50"
                  >
                    {services.map(s => (
                      <option key={s.id} value={s.id} className="bg-slate-900 text-white font-bold">{s.name}</option>
                    ))}
                  </select>
                </div>

                {/* House layout selection */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">House Layout</label>
                  <select 
                    value={selectedSimHouse}
                    onChange={(e) => setSelectedSimHouse(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold outline-none text-white focus:border-primary/50"
                  >
                    {selectedSimService.houseConfigs.map((config: HouseConfig) => (
                      <option key={config.type} value={config.type} className="bg-slate-900 text-white font-bold">
                        {config.type.toUpperCase()} layout (Default: {config.workers} workers, Base: {config.basePrice} DA, Duration: {config.durationHours}h)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Extra workers selection */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Add Extra Workers
                  </label>
                  <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-2 py-1">
                    <button 
                      onClick={() => setSimExtraWorkers(prev => Math.max(0, prev - 1))}
                      className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center font-bold text-slate-400 hover:text-white"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center text-xs font-black">{simExtraWorkers}</span>
                    <button 
                      onClick={() => setSimExtraWorkers(prev => prev + 1)}
                      className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center font-bold text-slate-400 hover:text-white"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Starting schedule time */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Start Time Schedule</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="date"
                      value={simDate}
                      onChange={(e) => setSimDate(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold text-white outline-none focus:border-primary/50"
                    />
                    <input 
                      type="time"
                      value={simTime}
                      onChange={(e) => setSimTime(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold text-white outline-none focus:border-primary/50"
                    />
                  </div>
                </div>
              </div>

              {/* Material and Product Controls (SAME SYMMETRICAL BEHAVIOR) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nadif Material Selection */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                  selectedSimService.materialsMandatory 
                    ? 'border-primary/30 bg-primary/5 text-white/90' 
                    : 'border-white/10 bg-white/5 text-white'
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">NADIF MATERIALS</p>
                      <p className="text-xs font-bold mt-1">Use our clean equipment</p>
                    </div>
                    {selectedSimService.materialsMandatory ? (
                      <div className="flex items-center gap-1 bg-primary/20 text-primary border border-primary/20 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                        <Lock size={8} /> Forced
                      </div>
                    ) : (
                      <button 
                        onClick={() => setSimUseMaterials(!simUseMaterials)}
                        className={`w-10 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${simUseMaterials ? 'bg-primary' : 'bg-slate-700'}`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${simUseMaterials ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] font-semibold text-slate-400 mt-2">
                    {selectedSimService.materialsMandatory 
                      ? `Materials are always included for deep cleaning packages.` 
                      : `Optionally add equipment for +${selectedSimService.materialPrice} DA.`}
                  </p>
                </div>

                {/* Nadif Products Selection (Same behavior as material) */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                  selectedSimService.productsMandatory 
                    ? 'border-primary/30 bg-primary/5 text-white/90' 
                    : 'border-white/10 bg-white/5 text-white'
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">NADIF PRODUCTS</p>
                      <p className="text-xs font-bold mt-1 font-inter">Chemical Products Source</p>
                    </div>
                    {selectedSimService.productsMandatory && (
                      <div className="flex items-center gap-1 bg-primary/20 text-primary border border-primary/20 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                        <Lock size={8} /> Forced
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-1 mt-3">
                    {/* Only show 'Own' if products are NOT mandatory */}
                    {!selectedSimService.productsMandatory && (
                      <button
                        onClick={() => setSimUseProducts('none')}
                        className={`py-2 text-[8px] font-black uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${
                          simResult.currentProduct === 'none' 
                            ? 'bg-primary text-white border-primary shadow' 
                            : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                        }`}
                      >
                        Own (0 DA)
                      </button>
                    )}
                    
                    <button
                      onClick={() => setSimUseProducts('local')}
                      className={`py-2 text-[8px] font-black uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${
                        selectedSimService.productsMandatory ? 'col-span-1.5' : ''
                      } ${
                        simResult.currentProduct === 'local' 
                          ? 'bg-primary text-white border-primary shadow' 
                          : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                      }`}
                    >
                      Local (+{selectedSimService.localProductPrice} DA)
                    </button>
                    
                    <button
                      onClick={() => setSimUseProducts('imported')}
                      className={`py-2 text-[8px] font-black uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${
                        selectedSimService.productsMandatory ? 'col-span-1.5' : ''
                      } ${
                        simResult.currentProduct === 'imported' 
                          ? 'bg-primary text-white border-primary shadow' 
                          : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                      }`}
                    >
                      Imported (+{selectedSimService.importedProductPrice} DA)
                    </button>
                  </div>
                  
                  <p className="text-[10px] font-semibold text-slate-400 mt-2">
                    {selectedSimService.productsMandatory 
                      ? `Products are mandatory. Choose Local or Imported.` 
                      : `Optionally choose our products, or provide your own.`}
                  </p>
                </div>
              </div>

              {/* Generated simulated notification message preview */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-5 relative overflow-hidden">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-primary/20 text-primary border border-primary/20 rounded-xl flex items-center justify-center shrink-0 mt-0.5 animate-pulse">
                    <Bell size={18} className="fill-primary/20" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-primary tracking-widest">Calculated Push Notification Preview</p>
                    <p className="text-xs text-slate-100 font-semibold font-inter leading-relaxed">
                      {simResult.notificationMessage}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Calculations and summary results */}
            <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-[2rem] p-6 lg:p-8 flex flex-col justify-between">
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 border-b border-white/10 pb-3">
                  Bill Calculations
                </h4>
                
                <div className="space-y-3 font-semibold text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Layout Base Rate ({selectedSimHouse.toUpperCase()}):</span>
                    <span>{simResult.baseVal} DA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Default Labor ({selectedSimHouse.toUpperCase()}):</span>
                    <span>{simResult.defaultWorkers} Workers</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Extra Labor Added:</span>
                    <span className="text-primary">+{simExtraWorkers} Worker(s)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Extra Labor Price:</span>
                    <span>{simResult.extraPriceSum} DA ({selectedSimService.extraWorkerPrice} DA ea.)</span>
                  </div>
                  <div className="flex justify-between border-t border-white/5 pt-2">
                    <span className="text-slate-400">Nadif Materials:</span>
                    <span className={simResult.useMaterials ? 'text-primary' : 'text-slate-500'}>
                      {simResult.useMaterials ? `+${selectedSimService.materialPrice} DA` : 'Excluded'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Nadif Products:</span>
                    <span className={simResult.currentProduct !== 'none' ? 'text-primary' : 'text-slate-500'}>
                      {simResult.currentProduct === 'local' && `+${selectedSimService.localProductPrice} DA (Local)`}
                      {simResult.currentProduct === 'imported' && `+${selectedSimService.importedProductPrice} DA (Imported)`}
                      {simResult.currentProduct === 'none' && 'Excluded'}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-white/5 pt-2">
                    <span className="text-slate-400">Work Duration Limit:</span>
                    <span>{selectedSimService.durationHours} Hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Completion Time:</span>
                    <span className="text-slate-300 flex items-center gap-1">
                      <Clock size={12} /> {simTime} → <span className="text-emerald-400 font-bold">{simResult.finishedTimeStr}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 mt-6 flex items-end justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Total Service Cost</p>
                  <p className="text-4xl font-black text-emerald-400 leading-none mt-1">
                    {simResult.totalPrice} <span className="text-xs uppercase font-normal font-gilmer">DA</span>
                  </p>
                </div>
                <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-[9px] font-black uppercase tracking-wider">
                  Success Sim
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 3. Offer Catalogue Section */}
      <div className="space-y-6">
        {/* Search tool */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
          <div className="relative w-full sm:max-w-xs group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-sm font-bold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-primary/20 outline-none transition-all"
            />
          </div>

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

        {/* Dynamic Service Rendering */}
        {!isLoaded ? (
          <div className="min-h-[30vh] flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-20 bg-white border border-slate-100 rounded-[3rem] shadow-sm max-w-xl mx-auto space-y-6">
            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center text-primary mx-auto">
              <ShoppingBag size={36} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-800">No Services Found</h3>
              <p className="text-sm text-slate-400 font-semibold max-w-xs mx-auto">
                {searchQuery ? "No matching services. Try modifying your search criteria." : "Define your first service structure to publish offerings immediately."}
              </p>
            </div>
            {!searchQuery && (
              <button 
                onClick={handleOpenCreate}
                className="px-6 py-4 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-all shadow-lg mx-auto block mt-4"
              >
                Add New Service
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredServices.map((service) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={service.id}
                  className="group relative bg-white border border-slate-100 hover:border-primary/20 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col justify-between overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[4rem] group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-500" />

                  <div className="space-y-6">
                    {/* Header: Picture & Active Status Toggle */}
                    <div className="flex justify-between items-start relative z-10">
                      <div className="w-20 h-20 relative rounded-3xl overflow-hidden shadow-md border border-slate-100 bg-slate-50 shrink-0">
                        <img 
                          src={service.picture} 
                          alt={service.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        />
                      </div>

                      <button
                        onClick={() => handleToggleStatus(service.id)}
                        className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                          service.isActive 
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100' 
                            : 'bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-100'
                        }`}
                        title={service.isActive ? "Deactivate" : "Activate"}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${service.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                        {service.isActive ? 'Active' : 'Draft'}
                      </button>
                    </div>

                    {/* Service Name & Description */}
                    <div className="space-y-2 relative z-10">
                      <h3 className="text-xl font-bold uppercase tracking-tight text-slate-800 leading-none group-hover:text-primary transition-colors">
                        {service.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-semibold font-inter line-clamp-3 leading-relaxed">
                        {service.description}
                      </p>
                    </div>

                    {/* House configs layout and worker counts badges */}
                    <div className="space-y-2">
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Labor Layout Default rules</p>
                      <div className="flex flex-wrap gap-2">
                        {service.houseConfigs.map((config: HouseConfig) => (
                          <span key={config.type} className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-bold text-slate-500 uppercase">
                            {config.type}: <strong className="text-slate-800">{config.basePrice} DA</strong> ({config.workers}W, {config.durationHours}h)
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Surcharges list */}
                    <div className="space-y-1.5 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 text-[9px] font-semibold text-slate-500">
                      <div className="flex justify-between">
                        <span>Extra Worker Rate:</span>
                        <strong className="text-slate-800">+{service.extraWorkerPrice} DA</strong>
                      </div>
                      <div className="flex justify-between border-t border-slate-100/50 pt-1.5">
                        <span>Materials Surcharge:</span>
                        <strong className="text-slate-800">
                          +{service.materialPrice} DA {service.materialsMandatory && '(Mandatory)'}
                        </strong>
                      </div>
                      <div className="flex justify-between border-t border-slate-100/50 pt-1.5">
                        <span>Local Products Rate:</span>
                        <strong className="text-slate-800">
                          +{service.localProductPrice || 0} DA {service.productsMandatory && '(Mandatory)'}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Imported Products Rate:</span>
                        <strong className="text-slate-800">
                          +{service.importedProductPrice || 0} DA
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-px bg-slate-50 my-6" />

                  {/* Actions buttons */}
                  <div className="flex justify-between items-center relative z-10">
                    <button
                      onClick={() => setSelectedSimService(service)}
                      className="px-3.5 py-2.5 bg-primary/5 hover:bg-primary hover:text-white border border-primary/10 text-primary text-[9px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center gap-1.5 font-bold"
                    >
                      <Calculator size={12} />
                      Simulate Price
                    </button>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleOpenEdit(service)}
                        className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-primary/10 hover:text-primary text-slate-500 border border-slate-100 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
                        title="Edit Service"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleOpenDelete(service)}
                        className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-500 border border-slate-100 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
                        title="Delete Service"
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
          /* List View */
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                    <th className="pb-4 pl-4">Photo</th>
                    <th className="pb-4">Service Offer</th>
                    <th className="pb-4">Layout Mappings</th>
                    <th className="pb-4">Extra Labor Rate</th>
                    <th className="pb-4">Materials Rate</th>
                    <th className="pb-4">Products Rate</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <AnimatePresence mode="popLayout">
                    {filteredServices.map((service) => (
                      <motion.tr 
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={service.id} 
                        className="group hover:bg-slate-50/50 transition-colors font-semibold"
                      >
                        <td className="py-4 pl-4">
                          <div className="w-12 h-12 relative rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                            <img src={service.picture} alt={service.name} className="w-full h-full object-cover" />
                          </div>
                        </td>
                        <td className="py-4 font-inter">
                          <span className="text-sm font-bold uppercase tracking-tight text-slate-800 block font-gilmer">{service.name}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{service.id}</span>
                        </td>
                        <td className="py-4">
                          <div className="flex flex-wrap gap-1 max-w-[180px]">
                            {service.houseConfigs.map((c: HouseConfig) => (
                              <span key={c.type} className="px-1.5 py-0.5 bg-slate-100 text-[8px] font-black text-slate-600 rounded uppercase">
                                {c.type}: {c.basePrice} DA ({c.workers}W, {c.durationHours}h)
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 text-sm text-slate-700">{service.extraWorkerPrice} DA</td>
                        <td className="py-4 text-sm text-slate-700">
                          {service.materialPrice} DA 
                          {service.materialsMandatory && <span className="ml-1.5 text-[8px] bg-primary/10 text-primary font-black uppercase px-1.5 py-0.5 rounded">Forced</span>}
                        </td>
                        <td className="py-4 text-xs text-slate-700">
                          <div className="space-y-0.5 font-bold">
                            <div>Local: {service.localProductPrice || 0} DA</div>
                            <div>Imported: {service.importedProductPrice || 0} DA</div>
                            {service.productsMandatory && <span className="text-[8px] bg-primary/10 text-primary font-black uppercase px-1.5 py-0.5 rounded inline-block mt-1">Forced</span>}
                          </div>
                        </td>
                        <td className="py-4">
                          <button
                            onClick={() => handleToggleStatus(service.id)}
                            className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                              service.isActive 
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100' 
                                : 'bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-100'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${service.isActive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            {service.isActive ? 'Active' : 'Draft'}
                          </button>
                        </td>
                        <td className="py-4 pr-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => setSelectedSimService(service)}
                              className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-primary/10 hover:text-primary text-slate-500 flex items-center justify-center transition-all cursor-pointer"
                              title="Simulate"
                            >
                              <Calculator size={14} />
                            </button>
                            <button 
                              onClick={() => handleOpenEdit(service)}
                              className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-primary/10 hover:text-primary text-slate-500 flex items-center justify-center transition-all cursor-pointer"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              onClick={() => handleOpenDelete(service)}
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
      </div>

      {/* 4. API JSON VIEWER MODAL */}
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
              {/* Header */}
              <div className="p-8 lg:p-10 border-b border-white/5 flex justify-between items-center shrink-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-primary">
                    <Code size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Mobile API Endpoint</span>
                  </div>
                  <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">
                    Services JSON API Output
                  </h2>
                  <p className="text-xs text-slate-400 font-medium font-inter">
                    Direct copy-paste config data for your Mobile app developer to display offerings in Flutter/React Native.
                  </p>
                </div>
                
                <button 
                  onClick={() => setIsJsonModalOpen(false)}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white border border-white/10 transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Code viewer */}
              <div className="flex-1 overflow-y-auto p-8 font-mono text-xs text-emerald-400 bg-slate-900/60 leading-relaxed selection:bg-primary selection:text-white">
                <pre>{JSON.stringify(services, null, 2)}</pre>
              </div>

              {/* Footer Actions */}
              <div className="p-8 border-t border-white/5 bg-slate-950 flex gap-4 shrink-0 justify-end">
                <button 
                  onClick={handleCopyJson}
                  className="px-6 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-wider text-[10px] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check size={14} strokeWidth={3} />
                      Copied to Clipboard!
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      Copy JSON API
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. CREATE / EDIT DIALOG FORM MODAL */}
      <AnimatePresence>
        {isFormModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-[640px] bg-white rounded-[3rem] shadow-2xl border border-slate-100 relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="h-2 bg-gradient-to-r from-primary via-primary-400 to-secondary shrink-0" />

              <button 
                onClick={() => setIsFormModalOpen(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-100 transition-all cursor-pointer z-20"
              >
                <X size={18} />
              </button>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 lg:p-10 space-y-8">
                {/* Header */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-primary">
                    <Sparkles size={16} className="fill-primary" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Dynamic Form</span>
                  </div>
                  <h2 className="text-2xl font-black uppercase italic tracking-tight text-slate-800">
                    {editingService ? 'Modify Service offer' : 'Create Service offer'}
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">
                    Configure service pricing metrics, house-to-labor structures, equipment surcharges, local/imported product selections, and image branding parameters.
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

                {/* Main Fields */}
                <div className="space-y-6">
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
                      {/* Service Name */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 pl-2">
                          Service Name (English)
                        </label>
                        <input 
                          type="text"
                          placeholder="e.g. Simple Service, Grand Service"
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            if (formError.includes('name')) setFormError('');
                          }}
                          className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-primary/20 focus:bg-white outline-none font-bold text-slate-800 text-sm placeholder-slate-300 transition-all"
                        />
                      </div>

                      {/* Description */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 pl-2">
                          Service Description (English)
                        </label>
                        <textarea 
                          rows={3}
                          placeholder="Detail what is included (dusting, scrubbing, grease washing)..."
                          value={description}
                          onChange={(e) => {
                            setDescription(e.target.value);
                            if (formError.includes('description')) setFormError('');
                          }}
                          className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-primary/20 focus:bg-white outline-none font-semibold text-slate-800 text-sm placeholder-slate-300 transition-all resize-none font-inter"
                        />
                      </div>
                    </>
                  )}

                  {formLangTab === 'fr' && (
                    <>
                      {/* Service Name (FR) */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 pl-2">
                          Service Name (French)
                        </label>
                        <input 
                          type="text"
                          placeholder="e.g. Service Simple, Grand Service"
                          value={nameFr}
                          onChange={(e) => setNameFr(e.target.value)}
                          className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-primary/20 focus:bg-white outline-none font-bold text-slate-800 text-sm placeholder-slate-300 transition-all"
                        />
                      </div>

                      {/* Description (FR) */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 pl-2">
                          Service Description (French)
                        </label>
                        <textarea 
                          rows={3}
                          placeholder="Détails du service (poussière, récurage)..."
                          value={descriptionFr}
                          onChange={(e) => setDescriptionFr(e.target.value)}
                          className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-primary/20 focus:bg-white outline-none font-semibold text-slate-800 text-sm placeholder-slate-300 transition-all resize-none font-inter"
                        />
                      </div>
                    </>
                  )}

                  {formLangTab === 'ar' && (
                    <>
                      {/* Service Name (AR) */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 pl-2">
                          Service Name (Arabic)
                        </label>
                        <input 
                          type="text"
                          dir="rtl"
                          placeholder="مثال: خدمة بسيطة، خدمة كاملة"
                          value={nameAr}
                          onChange={(e) => setNameAr(e.target.value)}
                          className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-primary/20 focus:bg-white outline-none font-bold text-slate-800 text-sm placeholder-slate-300 transition-all text-right"
                        />
                      </div>

                      {/* Description (AR) */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 pl-2">
                          Service Description (Arabic)
                        </label>
                        <textarea 
                          rows={3}
                          dir="rtl"
                          placeholder="تفاصيل الخدمة (تنظيف الغبار، الغسيل)..."
                          value={descriptionAr}
                          onChange={(e) => setDescriptionAr(e.target.value)}
                          className="w-full px-6 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-primary/20 focus:bg-white outline-none font-semibold text-slate-800 text-sm placeholder-slate-300 transition-all resize-none font-inter text-right"
                        />
                      </div>
                    </>
                  )}

                  {/* Pricing and Details Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Extra Worker Price */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 pl-2">
                        Extra Worker Surcharge (DA)
                      </label>
                      <input 
                        type="number"
                        placeholder="1000"
                        value={extraWorkerPrice || ''}
                        onChange={(e) => setExtraWorkerPrice(Number(e.target.value))}
                        className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-primary/20 focus:bg-white outline-none font-bold text-slate-800 text-sm placeholder-slate-300 transition-all"
                      />
                    </div>

                    {/* Duration Hours */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 pl-2">
                        Duration Hours
                      </label>
                      <input 
                        type="number"
                        placeholder="4"
                        value={durationHours || ''}
                        onChange={(e) => setDurationHours(Number(e.target.value))}
                        className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-primary/20 focus:bg-white outline-none font-bold text-slate-800 text-sm placeholder-slate-300 transition-all"
                      />
                    </div>
                  </div>

                  {/* Nadif Material Surcharge Block */}
                  <div className="space-y-4 border border-slate-100 rounded-3xl p-5 bg-slate-50/50">
                    <div className="space-y-1">
                      <h4 className="text-xs font-black uppercase text-slate-800 pl-1">Materials Surcharge Config</h4>
                      <p className="text-[10px] font-bold text-slate-400 pl-1 leading-normal">
                        Configure materials surcharge and mandatory status.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-slate-100">
                      <div className="space-y-2">
                        <label className="text-[8px] font-black uppercase text-slate-400 tracking-wider">
                          Material Price Surcharge (DA)
                        </label>
                        <input 
                          type="number"
                          placeholder="1500"
                          value={materialPrice || ''}
                          onChange={(e) => setMaterialPrice(Number(e.target.value))}
                          className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-transparent focus:border-primary/20 outline-none font-bold text-slate-800 text-xs transition-all"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-black uppercase text-slate-800">Materials Mandatory</p>
                          <p className="text-[8px] font-bold text-slate-400 leading-normal">Forced for Grand / Semi Grand cleanings</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setMaterialsMandatory(!materialsMandatory)}
                          className={`w-12 h-7 rounded-full transition-colors cursor-pointer relative p-0.5 ${
                            materialsMandatory ? 'bg-primary' : 'bg-slate-300'
                          }`}
                        >
                          <motion.div 
                            layout
                            className="w-6 h-6 bg-white rounded-full shadow-sm"
                            animate={{ x: materialsMandatory ? 20 : 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Nadif Products Surcharge Block (SAME SYMMETRICAL BEHAVIOR AS MATERIAL) */}
                  <div className="space-y-4 border border-slate-100 rounded-3xl p-5 bg-slate-50/50">
                    <div className="space-y-1">
                      <h4 className="text-xs font-black uppercase text-slate-800 pl-1">Products Surcharge Config</h4>
                      <p className="text-[10px] font-bold text-slate-400 pl-1 leading-normal">
                        Configure local and imported cleaning product surcharges and mandatory status.
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[8px] font-black uppercase text-slate-400 tracking-wider">
                            Local Product Surcharge (DA)
                          </label>
                          <input 
                            type="number"
                            placeholder="1200"
                            value={localProductPrice || ''}
                            onChange={(e) => setLocalProductPrice(Number(e.target.value))}
                            className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-transparent focus:border-primary/20 outline-none font-bold text-slate-800 text-xs transition-all"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[8px] font-black uppercase text-slate-400 tracking-wider">
                            Imported Product Surcharge (DA)
                          </label>
                          <input 
                            type="number"
                            placeholder="2000"
                            value={importedProductPrice || ''}
                            onChange={(e) => setImportedProductPrice(Number(e.target.value))}
                            className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-transparent focus:border-primary/20 outline-none font-bold text-slate-800 text-xs transition-all"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                        <div>
                          <p className="text-[10px] font-black uppercase text-slate-800">Products Mandatory</p>
                          <p className="text-[8px] font-bold text-slate-400 leading-normal">Forced for Grand / Semi Grand cleanings (cannot opt-out)</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setProductsMandatory(!productsMandatory)}
                          className={`w-12 h-7 rounded-full transition-colors cursor-pointer relative p-0.5 ${
                            productsMandatory ? 'bg-primary' : 'bg-slate-300'
                          }`}
                        >
                          <motion.div 
                            layout
                            className="w-6 h-6 bg-white rounded-full shadow-sm"
                            animate={{ x: productsMandatory ? 20 : 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Icon File Upload (PNG Only) */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 pl-2">
                      Service Image Asset (PNG format)
                    </label>

                    {pictureBase64 ? (
                      <div className="relative border border-slate-100 rounded-3xl p-4 flex items-center gap-4 bg-slate-50/50">
                        <div className="w-16 h-16 relative rounded-2xl overflow-hidden border border-slate-100 shadow-sm shrink-0 bg-slate-50">
                          <img src={pictureBase64} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 uppercase truncate">
                            Uploaded PNG Image
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
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div 
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
                          dragActive 
                            ? 'border-primary bg-primary/5 text-primary' 
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
                        <UploadCloud size={28} className="mb-2 text-slate-300" />
                        <p className="text-xs font-bold text-slate-700">
                          Drag & drop PNG image here, or <span className="text-primary hover:underline">browse</span>
                        </p>
                        <p className="text-[8px] font-black uppercase text-slate-400 tracking-wider mt-1 bg-slate-100 px-2 py-0.5 rounded">
                          PNG Only
                        </p>
                      </div>
                    )}
                  </div>

                  {/* House Configs Subform (NESTED ARRAY CONTROL WITH INDIVIDUAL BASE PRICE) */}
                  <div className="space-y-4 border border-slate-100 rounded-3xl p-5 bg-slate-50/50">
                    <div className="space-y-1">
                      <h4 className="text-xs font-black uppercase text-slate-800 pl-1">House Layout Configs & Base Rates</h4>
                      <p className="text-[10px] font-bold text-slate-400 pl-1 leading-normal">
                        Associate layouts (f2, f3, f4) with worker limits and individual base rates.
                      </p>
                    </div>

                    {/* Array values */}
                    {houseConfigs.length > 0 && (
                      <div className="divide-y divide-slate-100 bg-white rounded-2xl border border-slate-100 px-4 overflow-hidden">
                        {houseConfigs.map((config: any) => (
                          <div key={config.type} className="flex justify-between items-center py-3 text-xs">
                            <div>
                              <span className="font-black uppercase text-slate-800">{config.type} Layout</span>
                              {(config.typeFr || config.typeAr) && (
                                <span className="text-[9px] text-slate-400 ml-2">
                                  (FR: {config.typeFr || '--'} / AR: {config.typeAr || '--'})
                                </span>
                              )}
                              <span className="text-[9px] text-slate-400 font-bold ml-2">({config.workers} Workers, {config.durationHours ?? 3}h)</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-black text-primary">{config.basePrice} DA Base</span>
                              <button 
                                type="button"
                                onClick={() => handleEditHouseConfig(config)}
                                className="text-blue-500 hover:text-blue-700 p-1 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                                title="Edit config"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button 
                                type="button"
                                onClick={() => handleRemoveHouseConfig(config.type)}
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
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-1">Layout (EN)</label>
                          <input 
                            type="text"
                            placeholder="e.g. f5"
                            value={newHouseType}
                            onChange={(e) => setNewHouseType(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none text-slate-800 focus:border-primary/40"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-1">Layout (FR)</label>
                          <input 
                            type="text"
                            placeholder="e.g. f5"
                            value={newHouseTypeFr}
                            onChange={(e) => setNewHouseTypeFr(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none text-slate-800 focus:border-primary/40"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-1">Layout (AR)</label>
                          <input 
                            type="text"
                            dir="rtl"
                            placeholder="مثال: ف5"
                            value={newHouseTypeAr}
                            onChange={(e) => setNewHouseTypeAr(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none text-slate-800 focus:border-primary/40 text-right"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-1">Workers Required</label>
                          <input 
                            type="number"
                            placeholder="Workers"
                            value={newHouseWorkers || ''}
                            onChange={(e) => setNewHouseWorkers(Number(e.target.value))}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none text-slate-800 focus:border-primary/40 text-center"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-1">Base Price (DA)</label>
                          <input 
                            type="number"
                            placeholder="Base Price"
                            value={newHouseBasePrice || ''}
                            onChange={(e) => setNewHouseBasePrice(Number(e.target.value))}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none text-slate-800 focus:border-primary/40 text-center"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-1">Duration (H)</label>
                          <input 
                            type="number"
                            placeholder="Hours"
                            value={newHouseDuration || ''}
                            onChange={(e) => setNewHouseDuration(Number(e.target.value))}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none text-slate-800 focus:border-primary/40 text-center"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddHouseConfig}
                        className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold uppercase transition-all cursor-pointer mt-1"
                      >
                        {editingHouseType ? 'Update Layout Configuration' : 'Add Layout Configuration'}
                      </button>
                    </div>
                  </div>

                  {/* Active status */}
                  <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl shrink-0">
                    <div>
                      <p className="text-xs font-black uppercase tracking-tight text-slate-800">Deployment Status</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">Publish offering instantly for mobile booking</p>
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

                {/* Bottom Actions */}
                <div className="flex gap-4 pt-4 shrink-0">
                  <button 
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    className="flex-1 py-4 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-2xl font-bold uppercase tracking-wider text-[10px] border border-slate-100 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-wider text-[10px] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    {editingService ? 'Save Changes' : 'Publish Service'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. DELETE CONFIRM DIALOG MODAL */}
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
              <div className="w-16 h-16 bg-rose-50 border border-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto">
                <Trash2 size={24} />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-800">
                  Delete Service?
                </h3>
                <p className="text-sm text-slate-400 font-semibold max-w-[280px] mx-auto leading-relaxed">
                  Are you sure you want to remove <span className="font-bold text-slate-700">"{serviceToDelete?.name}"</span>? This action will immediately retract it from mobile client selections.
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
