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
  AlertCircle
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { ordersApi, servicesApi, cleanersApi, type ApiOrder, type ApiService, type ApiCleaner } from '../../../lib/api';

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [editFormData, setEditFormData] = useState<Partial<ApiOrder>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedOrder, fetchedServices, fetchedCleaners] = await Promise.all([
        ordersApi.getOne(orderId),
        servicesApi.getAll(),
        cleanersApi.getAll()
      ]);
      setOrder(fetchedOrder);
      setServices(fetchedServices);
      setCleaners(fetchedCleaners);
      
      // Initialize form
      setEditFormData({
        serviceId: fetchedOrder.serviceId,
        houseConfigId: fetchedOrder.houseConfigId,
        extraWorkers: fetchedOrder.extraWorkers,
        useMaterials: fetchedOrder.useMaterials,
        productOrigin: fetchedOrder.productOrigin,
        scheduledDate: fetchedOrder.scheduledDate,
        address: fetchedOrder.address,
        latitude: fetchedOrder.latitude,
        longitude: fetchedOrder.longitude,
        totalPrice: fetchedOrder.totalPrice,
        status: fetchedOrder.status,
        cleanerId: fetchedOrder.cleanerId,
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

  // Recalculate Logic
  const calculateNewPrice = () => {
    if (!editFormData.serviceId || !editFormData.houseConfigId) return;
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
      // Logic handles this visually, but if recalced in an invalid state:
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
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    // Apply Forced Logic before saving
    const service = services.find(s => s.id === editFormData.serviceId);
    const payload = { ...editFormData };
    if (service) {
      if (service.materialsMandatory) payload.useMaterials = true;
      if (service.productsMandatory && (!payload.productOrigin || payload.productOrigin === 'NONE')) {
        payload.productOrigin = 'LOCAL';
      }
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
                      <option value="ASSIGNED">Assigned</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Scheduled Time</label>
                    <input 
                      type="datetime-local"
                      value={editFormData.scheduledDate ? new Date(editFormData.scheduledDate).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setEditFormData({ ...editFormData, scheduledDate: new Date(e.target.value).toISOString() })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-primary/50 shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Selectors */}
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

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    Add Extra Workers
                  </label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 transition-colors hover:bg-white">
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

              {/* Addons */}
              {selectedService && (
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
                disabled={isSaving}
                className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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
