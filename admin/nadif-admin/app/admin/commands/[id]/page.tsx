'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Calculator, 
  ArrowLeft,
  MapPin,
  Lock,
  Clock,
  Save,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { ordersApi, servicesApi, cleanersApi, categoriesApi, lockedDaysApi, type ApiOrder, type ApiService, type ApiCleaner, type ApiCategory, type ApiCategoryService } from '../../../lib/api';

const LocationPicker = dynamic(() => import('../../../components/LocationPicker'), { 
  ssr: false, 
  loading: () => <div className="h-[250px] w-full bg-slate-50 rounded-2xl animate-pulse border border-slate-200 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Map...</div> 
});

export default function EditCommandPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [services, setServices] = useState<ApiService[]>([]);
  const [cleaners, setCleaners] = useState<ApiCleaner[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [allOrders, setAllOrders] = useState<ApiOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lockedDays, setLockedDays] = useState<string[]>([]);
  
  const [editFormData, setEditFormData] = useState<Partial<ApiOrder>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedOrder, fetchedServices, fetchedCleaners, fetchedCategories, fetchedAllOrders, fetchedLockedDays] = await Promise.all([
        ordersApi.getOne(orderId),
        servicesApi.getAll(),
        cleanersApi.getAll(),
        categoriesApi.getAll(),
        ordersApi.getAll().catch(() => [] as ApiOrder[]),
        lockedDaysApi.getAll().catch(() => [] as string[])
      ]);
      setOrder(fetchedOrder);
      setServices(fetchedServices);
      setCleaners(fetchedCleaners);
      setCategories(fetchedCategories);
      setAllOrders(fetchedAllOrders);
      setLockedDays(fetchedLockedDays);
      
      // Initialize form
      setEditFormData({
        serviceId: fetchedOrder.serviceId,
        houseConfigId: fetchedOrder.houseConfigId,
        categoryId: fetchedOrder.categoryId,
        categoryServiceId: fetchedOrder.categoryServiceId,
        extraWorkers: fetchedOrder.extraWorkers,
        useMaterials: fetchedOrder.useMaterials,
        productOrigin: fetchedOrder.productOrigin,
        scheduledDate: fetchedOrder.scheduledDate,
        address: fetchedOrder.address,
        latitude: fetchedOrder.latitude,
        longitude: fetchedOrder.longitude,
        totalPrice: fetchedOrder.totalPrice,
        status: fetchedOrder.status,
        cleanerId: fetchedOrder.cleanerId || '',
        sizeM2: fetchedOrder.sizeM2,
        clientNote: fetchedOrder.clientNote || '',
        housePictures: fetchedOrder.housePictures || [],
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load order');
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Cleaner Availability Calculation ──────────────────────────────────────
  const getRequiredCleanersCount = () => {
    if (editFormData.serviceId) {
      const service = services.find(s => s.id === editFormData.serviceId);
      const hc = service?.houseConfigs?.find(hc => hc.id === editFormData.houseConfigId);
      return (hc?.workers || 1) + (editFormData.extraWorkers || 0);
    } else {
      const category = categories.find(c => c.id === editFormData.categoryId);
      const cs = category?.categoryServices?.find(cs => cs.id === editFormData.categoryServiceId);
      return cs?.workers || 1;
    }
  };

  const isDateLocked = (dateVal: string) => {
    if (!dateVal) return false;
    try {
      const scheduled = new Date(dateVal);
      const offset = scheduled.getTimezoneOffset();
      const localDate = new Date(scheduled.getTime() - offset * 60 * 1000);
      const dateString = localDate.toISOString().slice(0, 10);
      return lockedDays.includes(dateString);
    } catch {
      return false;
    }
  };

  const getAvailableSlots = (requiredCount: number) => {
    if (!editFormData.scheduledDate) return [];

    const date = new Date(editFormData.scheduledDate);
    const slots = [
      "08:00", "09:00", "10:00", "11:00", "12:00", 
      "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
    ];

    const freeSlots: string[] = [];

    slots.forEach(timeStr => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const testDate = new Date(date);
      testDate.setHours(hours, minutes, 0, 0);
      const testTime = testDate.getTime();

      const service = services.find(s => s.id === editFormData.serviceId);
      const category = categories.find(c => c.id === editFormData.categoryId);
      const hc = service?.houseConfigs?.find(h => h.id === editFormData.houseConfigId);
      const cs = category?.categoryServices?.find(c => c.id === editFormData.categoryServiceId);
      const durationHours = hc?.durationHours ?? cs?.durationHours ?? service?.durationHours ?? 3;
      const end1 = testTime + durationHours * 60 * 60 * 1000;

      const busyCleanerIds = new Set<string>();
      allOrders.forEach(other => {
        if (other.id === orderId || !other.cleanerId || other.status === 'CANCELLED') return;
        const start2 = new Date(other.scheduledDate).getTime();
        const durationHours2 = other.houseConfig?.durationHours ?? other.categoryService?.durationHours ?? other.service?.durationHours ?? 3;
        const end2 = start2 + durationHours2 * 60 * 60 * 1000;

        if (testTime < end2 && start2 < end1) {
          other.cleanerId.split(',').forEach(cid => busyCleanerIds.add(cid));
        }
      });

      const activeCount = cleaners.filter(c => c.isActive).length;
      const availableCount = activeCount - busyCleanerIds.size;

      if (availableCount >= requiredCount) {
        freeSlots.push(timeStr);
      }
    });

    return freeSlots;
  };

  const handleSelectSlot = (timeStr: string) => {
    if (!editFormData.scheduledDate) return;
    const scheduled = new Date(editFormData.scheduledDate);
    const [hours, minutes] = timeStr.split(':').map(Number);
    scheduled.setHours(hours, minutes, 0, 0);

    setEditFormData(prev => ({ ...prev, scheduledDate: scheduled.toISOString(), cleanerId: '' }));
  };

  const handleToggleCleaner = (cleanerId: string) => {
    const selectedCleanerIds = editFormData.cleanerId ? editFormData.cleanerId.split(',').map(s => s.trim()).filter(Boolean) : [];
    const isSel = selectedCleanerIds.includes(cleanerId);
    const reqCount = getRequiredCleanersCount();
    let newIds: string[];
    if (isSel) {
      newIds = selectedCleanerIds.filter(id => id !== cleanerId);
    } else {
      if (reqCount === 1) {
        newIds = [cleanerId];
      } else if (selectedCleanerIds.length < reqCount) {
        newIds = [...selectedCleanerIds, cleanerId];
      } else {
        alert(`Vous ne pouvez pas sélectionner plus de ${reqCount} cleaner(s).`);
        return;
      }
    }
    setEditFormData(prev => ({ ...prev, cleanerId: newIds.join(',') }));
  };

  const getAvailableCleaners = () => {
    if (!editFormData.scheduledDate) return [];

    const start1 = new Date(editFormData.scheduledDate).getTime();
    const service = services.find(s => s.id === editFormData.serviceId);
    const category = categories.find(c => c.id === editFormData.categoryId);
    const hc = service?.houseConfigs?.find(h => h.id === editFormData.houseConfigId);
    const cs = category?.categoryServices?.find(c => c.id === editFormData.categoryServiceId);
    const durationHours1 = hc?.durationHours ?? cs?.durationHours ?? service?.durationHours ?? 3;
    const end1 = start1 + durationHours1 * 60 * 60 * 1000;

    const activeCleaners = cleaners.filter(c => c.isActive);
    const busyCleanerIds = new Set<string>();

    allOrders.forEach(other => {
      if (other.id === orderId || !other.cleanerId || other.status === 'CANCELLED') return;
      const start2 = new Date(other.scheduledDate).getTime();
      const durationHours2 = other.houseConfig?.durationHours ?? other.categoryService?.durationHours ?? other.service?.durationHours ?? 3;
      const end2 = start2 + durationHours2 * 60 * 60 * 1000;

      if (start1 < end2 && start2 < end1) {
        other.cleanerId.split(',').forEach(cid => busyCleanerIds.add(cid));
      }
    });

    const available = activeCleaners.filter(c => !busyCleanerIds.has(c.id));
    const serviceName = service?.name || category?.name || '';

    return [...available].sort((a, b) => {
      const hasA = a.skills.some(s => s.toLowerCase() === serviceName.toLowerCase());
      const hasB = b.skills.some(s => s.toLowerCase() === serviceName.toLowerCase());
      if (hasA && !hasB) return -1;
      if (!hasA && hasB) return 1;
      return 0;
    });
  };

  // Recalculate Logic
  const calculateNewPrice = () => {
    if (editFormData.serviceId && editFormData.houseConfigId) {
      const service = services.find(s => s.id === editFormData.serviceId);
      if (!service) return;
      const houseConfig = service.houseConfigs?.find(hc => hc.id === editFormData.houseConfigId);
      if (!houseConfig) return;

      let base = houseConfig.basePrice;
      let extraWorkers = (editFormData.extraWorkers || 0) * service.extraWorkerPrice;
      let materials = (editFormData.useMaterials || service.materialsMandatory) ? service.materialPrice : 0;
      
      let products = 0;
      const origin = editFormData.productOrigin || 'NONE';
      if (service.productsMandatory && origin === 'NONE') {
        products = service.localProductPrice || 0;
      } else {
        if (origin === 'LOCAL') products = service.localProductPrice || 0;
        else if (origin === 'IMPORTED') products = service.importedProductPrice || 0;
      }

      let calculated = base + extraWorkers + materials + products;
      
      if (order?.promo) {
        calculated = calculated * (1 - order.promo.discountPercent / 100);
      }

      setEditFormData(prev => ({ ...prev, totalPrice: calculated }));
    } else if (editFormData.categoryId && editFormData.categoryServiceId) {
      const category = categories.find(c => c.id === editFormData.categoryId);
      if (!category) return;
      const categoryService = category.categoryServices?.find(cs => cs.id === editFormData.categoryServiceId);
      if (!categoryService) return;

      let base = categoryService.basePrice;
      let extraWorkers = 0;
      let materials = (editFormData.useMaterials || category.materialsMandatory) ? category.materialPrice : 0;
      
      let products = 0;
      const origin = editFormData.productOrigin || 'NONE';
      if (category.productsMandatory && origin === 'NONE') {
        products = category.localProductPrice || 0;
      } else {
        if (origin === 'LOCAL') products = category.localProductPrice || 0;
        else if (origin === 'IMPORTED') products = category.importedProductPrice || 0;
      }

      let calculated = base + extraWorkers + materials + products;
      
      if (order?.promo) {
        calculated = calculated * (1 - order.promo.discountPercent / 100);
      }

      setEditFormData(prev => ({ ...prev, totalPrice: calculated }));
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    // Apply Forced Logic before saving
    const payload = { ...editFormData };
    if (payload.status === 'PENDING' || payload.status === 'CALLED_NOT_PAID') {
      payload.cleanerId = null as any;
    }
    if (payload.serviceId) {
      if (payload.sizeM2 !== undefined && payload.sizeM2 !== null) {
        payload.sizeM2 = payload.sizeM2.toString() === '' ? (null as any) : parseFloat(payload.sizeM2.toString());
      }
    } else {
      payload.sizeM2 = null as any;
    }
    if (editFormData.serviceId) {
      const service = services.find(s => s.id === editFormData.serviceId);
      if (service) {
        if (service.materialsMandatory) payload.useMaterials = true;
        if (service.productsMandatory && (!payload.productOrigin || payload.productOrigin === 'NONE')) {
          payload.productOrigin = 'LOCAL';
        }
      }
      payload.categoryId = null;
      payload.categoryServiceId = null;
    } else if (editFormData.categoryId) {
      const category = categories.find(c => c.id === editFormData.categoryId);
      if (category) {
        if (category.materialsMandatory) payload.useMaterials = true;
        if (category.productsMandatory && (!payload.productOrigin || payload.productOrigin === 'NONE')) {
          payload.productOrigin = 'LOCAL';
        }
      }
      payload.serviceId = null;
      payload.houseConfigId = null;
      payload.extraWorkers = 0;
    }

    // Validate that if status is CONFIRMED, IN_PROGRESS, or COMPLETED, correct number of cleaners are assigned
    const status = payload.status || order?.status;
    if (status && ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
      const reqCount = getRequiredCleanersCount();
      const currentCleanerIds = payload.cleanerId ? payload.cleanerId.split(',').map(s => s.trim()).filter(Boolean) : [];
      if (currentCleanerIds.length !== reqCount) {
        alert(`Veuillez assigner exactement ${reqCount} cleaner(s) pour le statut "${status}".`);
        setIsSaving(false);
        return;
      }
    }

    if (isDateLocked(payload.scheduledDate || '')) {
      alert("Cette date est verrouillée par l'administrateur. Veuillez choisir un autre jour.");
      setIsSaving(false);
      return;
    }

    try {
      await ordersApi.update(orderId, payload);
      setSaveSuccess(true);
      setTimeout(() => {
        router.push('/admin/commands?success=true');
      }, 1000);
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-8">
        <div className="bg-rose-50 text-rose-600 p-6 rounded-2xl flex items-center gap-4">
          <AlertCircle size={24} />
          <div>
            <h2 className="font-bold text-lg">Error loading command</h2>
            <p className="text-sm">{error || 'Command not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  const selectedService = services.find(s => s.id === editFormData.serviceId);
  const selectedHouse = selectedService?.houseConfigs?.find(hc => hc.id === editFormData.houseConfigId);
  const selectedCategory = categories.find(c => c.id === editFormData.categoryId);

  return (
    <div className="space-y-8 font-gilmer max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-bold text-sm"
        >
          <ArrowLeft size={16} /> Back to Commands
        </button>
        <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Command #{orderId.slice(-6)}</span>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white text-slate-800 rounded-[2.5rem] p-8 lg:p-10 shadow-xl border border-slate-100 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-60 h-60 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
          {/* Left Side: Form Controls */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-primary">
                <Calculator size={16} className="text-primary fill-primary/20" />
                <span className="text-[10px] font-black uppercase tracking-widest">Configuration Editor</span>
              </div>
              <h3 className="text-3xl font-black uppercase italic tracking-tight text-slate-800">
                Edit <span className="text-primary">Command</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Modify the clean package, layout, contact assignments, and location for client {order.user?.fullName}.
              </p>
            </div>

            <form onSubmit={handleSave} className="space-y-6 pt-2">
              
              {/* STATUS & CONTACT SECTION */}
              <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Operational Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Client Contact</label>
                    <div className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-600 shadow-sm flex items-center justify-between">
                      <span>{order.user?.fullName}</span>
                      <span className="text-primary tracking-wider">{order.user?.phone || 'No phone'}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Order Status</label>
                    <select 
                      value={editFormData.status || 'PENDING'}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none text-slate-800 focus:border-primary/50 shadow-sm"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="CALLED_NOT_PAID">Appelé (Non Payé)</option>
                      <option value="CONFIRMED">Confirmé</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Scheduled Time</label>
                    <input 
                      type="datetime-local"
                      value={editFormData.scheduledDate ? (() => {
                        const d = new Date(editFormData.scheduledDate);
                        const year = d.getFullYear();
                        const month = String(d.getMonth() + 1).padStart(2, '0');
                        const day = String(d.getDate()).padStart(2, '0');
                        const hours = String(d.getHours()).padStart(2, '0');
                        const minutes = String(d.getMinutes()).padStart(2, '0');
                        return `${year}-${month}-${day}T${hours}:${minutes}`;
                      })() : ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val) return;
                        setEditFormData({ ...editFormData, scheduledDate: new Date(val).toISOString() });
                      }}
                      className={`w-full bg-white border rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-primary/50 shadow-sm ${
                        isDateLocked(editFormData.scheduledDate || '')
                          ? 'border-rose-500 bg-rose-50/10 focus:border-rose-500'
                          : 'border-slate-200'
                      }`}
                    />
                    {isDateLocked(editFormData.scheduledDate || '') && (
                      <p className="text-[10px] text-rose-500 font-bold mt-1">
                        ⚠️ Cette date est verrouillée par l'administrateur. Veuillez choisir un autre jour.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">
                        Assign Cleaners (Available Only)
                      </label>
                      <span className="text-[10px] font-black text-primary uppercase tracking-wider">
                        {editFormData.cleanerId ? editFormData.cleanerId.split(',').map(s => s.trim()).filter(Boolean).length : 0} / {getRequiredCleanersCount()} Sélectionné(s)
                      </span>
                    </div>
                    
                    {(() => {
                      const requiredCount = getRequiredCleanersCount();
                      const availableCleaners = getAvailableCleaners();
                      
                      if (availableCleaners.length < requiredCount) {
                        return (
                          <div className="space-y-4">
                            <div className="border border-rose-100 bg-rose-50/40 p-5 rounded-2xl text-center text-rose-600 space-y-2">
                              <AlertCircle className="mx-auto text-rose-500" size={24} />
                              <p className="text-xs font-black uppercase tracking-wider">Créneau Impossible (Pas assez d'agents)</p>
                              <p className="text-[10px] font-bold text-rose-500">
                                Requis: {requiredCount} cleaner(s) • Disponibles: {availableCleaners.length} à {editFormData.scheduledDate ? new Date(editFormData.scheduledDate).toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit' }) : ''}.
                              </p>
                            </div>

                            {/* Alternative suggestions */}
                            <div className="space-y-2 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">
                                Créneaux alternatifs disponibles ce jour ({requiredCount} agents requis) :
                              </h4>
                              {getAvailableSlots(requiredCount).length === 0 ? (
                                <p className="text-[10px] font-bold text-slate-400 pl-1">
                                  Aucun autre créneau disponible sur cette journée avec {requiredCount} agents libres.
                                </p>
                              ) : (
                                <div className="flex flex-wrap gap-2 pt-1.5">
                                  {getAvailableSlots(requiredCount).map(timeStr => (
                                    <button
                                      key={timeStr}
                                      type="button"
                                      onClick={() => handleSelectSlot(timeStr)}
                                      className="px-3 py-1.5 bg-white border border-slate-200 hover:border-primary/50 text-slate-700 hover:text-primary rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm hover:shadow active:scale-95"
                                    >
                                      {timeStr}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 border border-slate-100 rounded-2xl p-2.5 bg-white">
                          {availableCleaners.map(cleaner => {
                            const selectedCleanerIds = editFormData.cleanerId ? editFormData.cleanerId.split(',').map(s => s.trim()).filter(Boolean) : [];
                            const isSelected = selectedCleanerIds.includes(cleaner.id);
                            const service = services.find(s => s.id === editFormData.serviceId);
                            const category = categories.find(c => c.id === editFormData.categoryId);
                            const serviceName = service?.name || category?.name || '';
                            const hasMatchingSkill = cleaner.skills.some(s => s.toLowerCase() === serviceName.toLowerCase());

                            return (
                              <button
                                key={cleaner.id}
                                type="button"
                                onClick={() => handleToggleCleaner(cleaner.id)}
                                className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1 ${
                                  isSelected
                                    ? 'bg-primary border-primary text-white shadow-md shadow-primary/10'
                                    : 'bg-slate-50/60 border-slate-100 hover:border-slate-200 text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-xs font-black uppercase tracking-tight">
                                    {cleaner.fullName}
                                  </span>
                                  {hasMatchingSkill && (
                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                                      isSelected ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                                    }`}>
                                      Compétence Validée
                                    </span>
                                  )}
                                </div>
                                <div className={`text-[9px] font-bold ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                                  Tél: {cleaner.phone} • {cleaner.skills.length > 0 ? `Skills: ${cleaner.skills.join(', ')}` : 'Aucun skill'}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Selectors */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Command Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditFormData(prev => ({ 
                          ...prev, 
                          serviceId: services[0]?.id || '', 
                          houseConfigId: services[0]?.houseConfigs[0]?.id || '',
                          categoryId: null,
                          categoryServiceId: null
                        }));
                      }}
                      className={`py-3 text-[10px] font-black uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${
                        editFormData.serviceId ? 'bg-primary text-white border-primary shadow' : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100 hover:text-slate-600'
                      }`}
                    >
                      Service Booking
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditFormData(prev => ({ 
                          ...prev, 
                          categoryId: categories[0]?.id || '', 
                          categoryServiceId: categories[0]?.categoryServices[0]?.id || '',
                          serviceId: null,
                          houseConfigId: null
                        }));
                      }}
                      className={`py-3 text-[10px] font-black uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${
                        editFormData.categoryId ? 'bg-primary text-white border-primary shadow' : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100 hover:text-slate-600'
                      }`}
                    >
                      Category Booking
                    </button>
                  </div>
                </div>

                {editFormData.serviceId ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Selected Service Package</label>
                      <select 
                        value={editFormData.serviceId || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, serviceId: e.target.value, houseConfigId: undefined })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none text-slate-800 focus:border-primary/50 transition-colors hover:bg-white"
                      >
                        <option value="" disabled className="text-slate-400">Select a service</option>
                        {services.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">House Layout</label>
                      <select 
                        value={editFormData.houseConfigId || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, houseConfigId: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none text-slate-800 focus:border-primary/50 transition-colors hover:bg-white"
                      >
                        <option value="" disabled className="text-slate-400">Select layout</option>
                        {selectedService?.houseConfigs?.map(config => (
                          <option key={config.id} value={config.id}>
                            {config.type.toUpperCase()} layout (Base: {config.basePrice} DA)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                        Add Extra Workers
                      </label>
                      <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 transition-colors hover:bg-white max-w-[200px]">
                        <button 
                          type="button"
                          onClick={() => setEditFormData(prev => ({ ...prev, extraWorkers: Math.max(0, (prev.extraWorkers || 0) - 1) }))}
                          className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center font-bold text-slate-400 hover:text-slate-800"
                        >
                          -
                        </button>
                        <span className="flex-1 text-center text-xs font-black text-slate-800">{editFormData.extraWorkers || 0}</span>
                        <button 
                          type="button"
                          onClick={() => setEditFormData(prev => ({ ...prev, extraWorkers: (prev.extraWorkers || 0) + 1 }))}
                          className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center font-bold text-slate-400 hover:text-slate-800"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Selected Category</label>
                      <select 
                        value={editFormData.categoryId || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, categoryId: e.target.value, categoryServiceId: undefined })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none text-slate-800 focus:border-primary/50 transition-colors hover:bg-white"
                      >
                        <option value="" disabled className="text-slate-400">Select a category</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Category Service Layout</label>
                      <select 
                        value={editFormData.categoryServiceId || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, categoryServiceId: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none text-slate-800 focus:border-primary/50 transition-colors hover:bg-white"
                      >
                        <option value="" disabled className="text-slate-400">Select layout</option>
                        {categories.find(c => c.id === editFormData.categoryId)?.categoryServices?.map(config => (
                          <option key={config.id} value={config.id}>
                            {config.name} (Base: {config.basePrice} DA)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Addons */}
              {editFormData.serviceId && selectedService && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                    selectedService.materialsMandatory 
                      ? 'border-primary/30 bg-primary/5 text-slate-800' 
                      : 'border-slate-200 bg-slate-50 text-slate-800'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider">NADIF MATERIALS</p>
                        <p className="text-xs font-bold mt-1">Use our clean equipment</p>
                        <p className="text-[9px] font-bold text-primary mt-0.5">+{selectedService.materialPrice} DA</p>
                      </div>
                      {selectedService.materialsMandatory ? (
                        <div className="flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                          <Lock size={8} /> Forced
                        </div>
                      ) : (
                        <button 
                          type="button"
                          onClick={() => setEditFormData(prev => ({ ...prev, useMaterials: !prev.useMaterials }))}
                          className={`w-10 h-6 rounded-full p-0.5 transition-colors cursor-pointer shadow-inner ${editFormData.useMaterials ? 'bg-primary' : 'bg-slate-300'}`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${editFormData.useMaterials ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                    selectedService.productsMandatory 
                      ? 'border-primary/30 bg-primary/5 text-slate-800' 
                      : 'border-slate-200 bg-slate-50 text-slate-800'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider">NADIF PRODUCTS</p>
                        <p className="text-xs font-bold mt-1 font-inter">Chemical Products Source</p>
                      </div>
                      {selectedService.productsMandatory && (
                        <div className="flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                          <Lock size={8} /> Forced
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-1 mt-3">
                      {!selectedService.productsMandatory && (
                        <button
                          type="button"
                          onClick={() => setEditFormData(prev => ({ ...prev, productOrigin: 'NONE' }))}
                          className={`py-2 text-[8px] font-black uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${
                            editFormData.productOrigin === 'NONE' 
                              ? 'bg-primary text-white border-primary shadow' 
                              : 'bg-white text-slate-500 border-slate-200 hover:text-slate-800'
                          }`}
                        >
                          <span className="block">Own</span>
                          <span className="block text-[7px] font-bold opacity-70 mt-0.5">(0 DA)</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setEditFormData(prev => ({ ...prev, productOrigin: 'LOCAL' }))}
                        className={`py-2 text-[8px] font-black uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${
                          selectedService.productsMandatory ? 'col-span-1.5' : ''
                        } ${
                          (editFormData.productOrigin === 'LOCAL' || (selectedService.productsMandatory && editFormData.productOrigin === 'NONE'))
                            ? 'bg-primary text-white border-primary shadow' 
                            : 'bg-white text-slate-500 border-slate-200 hover:text-slate-800'
                        }`}
                        >
                        <span className="block">Local</span>
                        <span className="block text-[7px] font-bold opacity-70 mt-0.5">(+{selectedService.localProductPrice} DA)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditFormData(prev => ({ ...prev, productOrigin: 'IMPORTED' }))}
                        className={`py-2 text-[8px] font-black uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${
                          selectedService.productsMandatory ? 'col-span-1.5' : ''
                        } ${
                          editFormData.productOrigin === 'IMPORTED' 
                            ? 'bg-primary text-white border-primary shadow' 
                            : 'bg-white text-slate-500 border-slate-200 hover:text-slate-800'
                        }`}
                        >
                        <span className="block">Imported</span>
                        <span className="block text-[7px] font-bold opacity-70 mt-0.5">(+{selectedService.importedProductPrice} DA)</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {editFormData.categoryId && selectedCategory && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                    selectedCategory.materialsMandatory 
                      ? 'border-primary/30 bg-primary/5 text-slate-800' 
                      : 'border-slate-200 bg-slate-50 text-slate-800'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider">NADIF MATERIALS</p>
                        <p className="text-xs font-bold mt-1">Use our clean equipment</p>
                        <p className="text-[9px] font-bold text-primary mt-0.5">+{selectedCategory.materialPrice} DA</p>
                      </div>
                      {selectedCategory.materialsMandatory ? (
                        <div className="flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                          <Lock size={8} /> Forced
                        </div>
                      ) : (
                        <button 
                          type="button"
                          onClick={() => setEditFormData(prev => ({ ...prev, useMaterials: !prev.useMaterials }))}
                          className={`w-10 h-6 rounded-full p-0.5 transition-colors cursor-pointer shadow-inner ${editFormData.useMaterials ? 'bg-primary' : 'bg-slate-300'}`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${editFormData.useMaterials ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                    selectedCategory.productsMandatory 
                      ? 'border-primary/30 bg-primary/5 text-slate-800' 
                      : 'border-slate-200 bg-slate-50 text-slate-800'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider">NADIF PRODUCTS</p>
                        <p className="text-xs font-bold mt-1 font-inter">Chemical Products Source</p>
                      </div>
                      {selectedCategory.productsMandatory && (
                        <div className="flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                          <Lock size={8} /> Forced
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-1 mt-3">
                      {!selectedCategory.productsMandatory && (
                        <button
                          type="button"
                          onClick={() => setEditFormData(prev => ({ ...prev, productOrigin: 'NONE' }))}
                          className={`py-2 text-[8px] font-black uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${
                            editFormData.productOrigin === 'NONE' 
                              ? 'bg-primary text-white border-primary shadow' 
                              : 'bg-white text-slate-500 border-slate-200 hover:text-slate-800'
                          }`}
                        >
                          <span className="block">Own</span>
                          <span className="block text-[7px] font-bold opacity-70 mt-0.5">(0 DA)</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setEditFormData(prev => ({ ...prev, productOrigin: 'LOCAL' }))}
                        className={`py-2 text-[8px] font-black uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${
                          selectedCategory.productsMandatory ? 'col-span-1.5' : ''
                        } ${
                          (editFormData.productOrigin === 'LOCAL' || (selectedCategory.productsMandatory && editFormData.productOrigin === 'NONE'))
                            ? 'bg-primary text-white border-primary shadow' 
                            : 'bg-white text-slate-500 border-slate-200 hover:text-slate-800'
                        }`}
                        >
                        <span className="block">Local</span>
                        <span className="block text-[7px] font-bold opacity-70 mt-0.5">(+{selectedCategory.localProductPrice} DA)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditFormData(prev => ({ ...prev, productOrigin: 'IMPORTED' }))}
                        className={`py-2 text-[8px] font-black uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${
                          selectedCategory.productsMandatory ? 'col-span-1.5' : ''
                        } ${
                          editFormData.productOrigin === 'IMPORTED' 
                            ? 'bg-primary text-white border-primary shadow' 
                            : 'bg-white text-slate-500 border-slate-200 hover:text-slate-800'
                        }`}
                        >
                        <span className="block">Imported</span>
                        <span className="block text-[7px] font-bold opacity-70 mt-0.5">(+{selectedCategory.importedProductPrice} DA)</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Property Details & Note */}
              <div className="space-y-4 pt-6 border-t border-slate-100">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Property Details & Notes</h4>
                <div className="space-y-4">
                  {editFormData.serviceId && (
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">House Size (m²)</label>
                      <input 
                        type="number"
                        value={editFormData.sizeM2 ?? ''}
                        onChange={e => {
                          const val = e.target.value;
                          setEditFormData(prev => ({ ...prev, sizeM2: val === '' ? undefined : parseFloat(val) }));
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none text-slate-800 focus:border-primary/50 hover:bg-white transition-colors"
                        placeholder="e.g. 120"
                        min="0"
                        step="any"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Client Note</label>
                    <textarea 
                      value={editFormData.clientNote ?? ''}
                      onChange={e => setEditFormData(prev => ({ ...prev, clientNote: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none text-slate-800 focus:border-primary/50 hover:bg-white transition-colors min-h-[100px]"
                      placeholder="Client instruction note"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">House Pictures</label>
                    <div className="flex flex-col gap-3">
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*"
                        onChange={e => {
                          const files = e.target.files;
                          if (!files) return;
                          const fileArray = Array.from(files);
                          const promises = fileArray.map(file => {
                            return new Promise<string>((resolve, reject) => {
                              const reader = new FileReader();
                              reader.onload = () => resolve(reader.result as string);
                              reader.onerror = reject;
                              reader.readAsDataURL(file);
                            });
                          });
                          Promise.all(promises).then(base64s => {
                            setEditFormData(prev => ({
                              ...prev,
                              housePictures: [...(prev.housePictures || []), ...base64s]
                            }));
                          }).catch(err => alert("Error uploading images: " + err.message));
                        }}
                        className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                      />
                      {editFormData.housePictures && editFormData.housePictures.length > 0 && (
                        <div className="grid grid-cols-4 gap-3 border border-slate-100 p-4 rounded-2xl bg-slate-50/50">
                          {editFormData.housePictures.map((pic, index) => (
                            <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-150">
                              <img src={pic} alt="Preview" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setEditFormData(prev => ({
                                  ...prev,
                                  housePictures: prev.housePictures?.filter((_, i) => i !== index) || []
                                }))}
                                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer"
                              >
                                <X size={12} className="text-white" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4 pt-6 border-t border-slate-100">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Location & Map</h4>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Address Text</label>
                  <input
                    type="text"
                    value={editFormData.address || ''}
                    onChange={e => setEditFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none text-slate-800 focus:border-primary/50 hover:bg-white transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
                    <span>Pin Coordinates</span>
                    {editFormData.latitude && editFormData.longitude && (
                      <span className="text-emerald-500">{editFormData.latitude.toFixed(5)}, {editFormData.longitude.toFixed(5)}</span>
                    )}
                  </label>
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-inner relative" style={{ isolation: 'isolate' }}>
                    <LocationPicker 
                      latitude={editFormData.latitude || undefined}
                      longitude={editFormData.longitude || undefined}
                      onChange={(lat, lng) => setEditFormData(prev => ({ ...prev, latitude: lat, longitude: lng }))}
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Right Side: Bill & Actions */}
          <div className="lg:col-span-5 bg-slate-50 border border-slate-100 rounded-[2rem] p-6 lg:p-8 flex flex-col justify-between shadow-sm">
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 border-b border-slate-200 pb-3 flex justify-between items-center">
                <span>Bill Calculations</span>
                <button 
                  onClick={calculateNewPrice}
                  className="text-[9px] bg-primary/10 text-primary px-3 py-1 rounded-full hover:bg-primary/20 transition-colors shadow-sm"
                >
                  Recalculate
                </button>
              </h4>
              
              <div className="space-y-3 font-semibold text-xs text-slate-600">
                {editFormData.serviceId ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Layout Base Rate ({selectedHouse?.type.toUpperCase() || '-'}):</span>
                      <span className="text-slate-800">{selectedHouse?.basePrice || 0} DA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Default Labor:</span>
                      <span className="text-slate-800">{selectedHouse?.workers || 0} Workers</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Extra Labor Added:</span>
                      <span className="text-primary">+{editFormData.extraWorkers || 0} Worker(s)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Extra Labor Price:</span>
                      <span className="text-slate-800">{((editFormData.extraWorkers || 0) * (selectedService?.extraWorkerPrice || 0))} DA</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-2">
                      <span className="text-slate-500">Nadif Materials:</span>
                      <span className={editFormData.useMaterials || selectedService?.materialsMandatory ? 'text-primary' : 'text-slate-400'}>
                        {editFormData.useMaterials || selectedService?.materialsMandatory ? `+${selectedService?.materialPrice || 0} DA` : 'Excluded'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Nadif Products:</span>
                      <span className={(editFormData.productOrigin !== 'NONE' && editFormData.productOrigin) || selectedService?.productsMandatory ? 'text-primary' : 'text-slate-400'}>
                        {(editFormData.productOrigin === 'LOCAL' || (selectedService?.productsMandatory && (!editFormData.productOrigin || editFormData.productOrigin === 'NONE'))) && `+${selectedService?.localProductPrice || 0} DA (Local)`}
                        {editFormData.productOrigin === 'IMPORTED' && `+${selectedService?.importedProductPrice || 0} DA (Imported)`}
                        {!selectedService?.productsMandatory && (!editFormData.productOrigin || editFormData.productOrigin === 'NONE') && 'Excluded'}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Category Layout Base Rate ({selectedCategory?.categoryServices.find(cs => cs.id === editFormData.categoryServiceId)?.name || '-'}):</span>
                      <span className="text-slate-800">{selectedCategory?.categoryServices.find(cs => cs.id === editFormData.categoryServiceId)?.basePrice || 0} DA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Labor:</span>
                      <span className="text-slate-800">{selectedCategory?.categoryServices.find(cs => cs.id === editFormData.categoryServiceId)?.workers || 0} Workers</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-2">
                      <span className="text-slate-500">Nadif Materials:</span>
                      <span className={editFormData.useMaterials || selectedCategory?.materialsMandatory ? 'text-primary' : 'text-slate-400'}>
                        {editFormData.useMaterials || selectedCategory?.materialsMandatory ? `+${selectedCategory?.materialPrice || 0} DA` : 'Excluded'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Nadif Products:</span>
                      <span className={(editFormData.productOrigin !== 'NONE' && editFormData.productOrigin) || selectedCategory?.productsMandatory ? 'text-primary' : 'text-slate-400'}>
                        {(editFormData.productOrigin === 'LOCAL' || (selectedCategory?.productsMandatory && (!editFormData.productOrigin || editFormData.productOrigin === 'NONE'))) && `+${selectedCategory?.localProductPrice || 0} DA (Local)`}
                        {editFormData.productOrigin === 'IMPORTED' && `+${selectedCategory?.importedProductPrice || 0} DA (Imported)`}
                        {!selectedCategory?.productsMandatory && (!editFormData.productOrigin || editFormData.productOrigin === 'NONE') && 'Excluded'}
                      </span>
                    </div>
                  </>
                )}
                {order.promo && (
                  <div className="flex justify-between border-t border-slate-200 pt-2 text-rose-500">
                    <span>Promo Applied ({order.promo.code}):</span>
                    <span>-{order.promo.discountPercent}%</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6 mt-8">
              <div className="border-t border-slate-200 pt-4 flex items-end justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Final Total</p>
                  <div className="flex items-center gap-2 mt-1">
                    <input 
                      type="number"
                      value={editFormData.totalPrice || 0}
                      onChange={e => setEditFormData(prev => ({ ...prev, totalPrice: parseFloat(e.target.value) || 0 }))}
                      className="bg-transparent text-4xl font-black text-emerald-500 w-32 outline-none border-b border-dashed border-emerald-500/30 focus:border-emerald-500"
                    />
                    <span className="text-sm font-black text-emerald-500 uppercase">DA</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleSave}
                disabled={isSaving || isDateLocked(editFormData.scheduledDate || '') || (['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'].includes(editFormData.status || '') && getAvailableCleaners().length < getRequiredCleanersCount())}
                className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : saveSuccess ? (
                  <><CheckCircle size={16} /> Saved Successfully</>
                ) : (
                  <><Save size={16} /> Confirm Changes</>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
