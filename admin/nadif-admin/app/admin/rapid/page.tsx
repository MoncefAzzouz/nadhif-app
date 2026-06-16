'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Search,
  MapPin,
  Phone,
  Calendar,
  Clock3,
  Trash2,
  X,
  Code,
  Copy,
  Check,
  Plus,
  Edit2,
  Sparkles,
  AlertCircle,
  Clock,
  User,
  CheckCircle,
  XCircle,
  HelpCircle,
  Briefcase,
  Lock,
  Users,
  Wrench
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { ordersApi, servicesApi, cleanersApi, categoriesApi, lockedDaysApi, skillsApi, imgUrl, promosApi, uploadImage, subscriptionsApi, type ApiOrder, type ApiService, type ApiCleaner, type ApiCategory, type ApiCategoryService, type ApiSkill, type ApiPromo, type ApiSubscription } from '../../lib/api';

const LocationPicker = dynamic(() => import('../../components/LocationPicker'), {
  ssr: false,
  loading: () => <div className="h-[250px] w-full bg-slate-50 rounded-2xl animate-pulse border border-slate-100 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Map Core...</div>
});

const STATUS_LABELS: Record<ApiOrder['status'], string> = {
  PENDING: 'En Attente',
  CALLED_NOT_PAID: 'Appelé (Non Payé)',
  CONFIRMED: 'Confirmé',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const STATUS_STYLES: Record<ApiOrder['status'], string> = {
  PENDING: 'bg-amber-50 text-amber-600 border-amber-100',
  CALLED_NOT_PAID: 'bg-cyan-50 text-cyan-600 border-cyan-100',
  CONFIRMED: 'bg-blue-50 text-blue-600 border-blue-100',
  IN_PROGRESS: 'bg-violet-50 text-violet-600 border-violet-100',
  COMPLETED: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  CANCELLED: 'bg-rose-50 text-rose-600 border-rose-100',
};

const STATUS_DOT: Record<ApiOrder['status'], string> = {
  PENDING: 'bg-amber-500 animate-pulse',
  CALLED_NOT_PAID: 'bg-cyan-500 animate-pulse',
  CONFIRMED: 'bg-blue-500',
  IN_PROGRESS: 'bg-violet-500',
  COMPLETED: 'bg-emerald-500',
  CANCELLED: 'bg-rose-500',
};

export default function RapidPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [services, setServices] = useState<ApiService[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [cleaners, setCleaners] = useState<ApiCleaner[]>([]);
  const [skills, setSkills] = useState<ApiSkill[]>([]);
  const [promos, setPromos] = useState<ApiPromo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ApiOrder['status']>('all');
  const [copied, setCopied] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [lockedDays, setLockedDays] = useState<string[]>([]);
  const [allOrdersForAvailability, setAllOrdersForAvailability] = useState<ApiOrder[]>([]);
  const [subscriptions, setSubscriptions] = useState<ApiSubscription[]>([]);
  
  // Creation States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormType, setAddFormType] = useState<'service' | 'category'>('service');
  const [addFormData, setAddFormData] = useState({
    fullName: '', phone: '', address: '',
    serviceId: '' as string | null, houseConfigId: '' as string | null,
    categoryId: '' as string | null, categoryServiceId: '' as string | null,
    scheduledDate: '', extraWorkers: 0, useMaterials: false, productOrigin: 'NONE',
    latitude: undefined as number | undefined, longitude: undefined as number | undefined,
    sizeM2: undefined as number | undefined,
    clientNote: '',
    housePictures: [] as string[],
    isRapid: true, // Always true for this page
    promoCode: ''
  });

  // Assign modal state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [orderToConfirm, setOrderToConfirm] = useState<ApiOrder | null>(null);
  const [selectedCleanerIds, setSelectedCleanerIds] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  // Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<ApiOrder | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Date picker restricted state
  const [selectedDateOption, setSelectedDateOption] = useState<'today' | 'tomorrow' | 'after_tomorrow'>('today');
  const [selectedTimeOption, setSelectedTimeOption] = useState('08:00');

  // Pricing helper selections
  const selectedAddService = services.find(s => s.id === addFormData.serviceId);
  const selectedAddCategory = categories.find(c => c.id === addFormData.categoryId);
  const selectedAddCategoryService = selectedAddCategory?.categoryServices.find(cs => cs.id === addFormData.categoryServiceId);

  // Restricted Date Calculations
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const afterTomorrow = new Date();
  afterTomorrow.setDate(today.getDate() + 2);

  const formatDateLabel = (d: Date) => {
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' });
  };

  const getDateString = (d: Date) => {
    return d.toISOString().split('T')[0];
  };

  const getRestrictedDates = () => {
    return [
      { key: 'today' as const, label: `Aujourd'hui`, date: today },
      { key: 'tomorrow' as const, label: `Demain`, date: tomorrow },
      { key: 'after_tomorrow' as const, label: `Après-demain`, date: afterTomorrow }
    ];
  };

  // Sync scheduled date state when options change
  useEffect(() => {
    const dates = { today, tomorrow, after_tomorrow: afterTomorrow };
    const dateObj = new Date(dates[selectedDateOption]);
    const [hours, minutes] = selectedTimeOption.split(':').map(Number);
    dateObj.setHours(hours, minutes, 0, 0);
    setAddFormData(prev => ({ ...prev, scheduledDate: dateObj.toISOString() }));
  }, [selectedDateOption, selectedTimeOption]);

  useEffect(() => {
    if (addFormType === 'service' && selectedAddService) {
      if (selectedAddService.materialsMandatory) {
        setAddFormData(prev => ({ ...prev, useMaterials: true }));
      }
      if (selectedAddService.productsMandatory && (!addFormData.productOrigin || addFormData.productOrigin === 'NONE')) {
        setAddFormData(prev => ({ ...prev, productOrigin: 'LOCAL' }));
      }
    }
  }, [addFormData.serviceId, selectedAddService, addFormType]);

  useEffect(() => {
    if (addFormType === 'category' && selectedAddCategory) {
      if (selectedAddCategory.materialsMandatory) {
        setAddFormData(prev => ({ ...prev, useMaterials: true }));
      }
      if (selectedAddCategory.productsMandatory && (!addFormData.productOrigin || addFormData.productOrigin === 'NONE')) {
        setAddFormData(prev => ({ ...prev, productOrigin: 'LOCAL' }));
      }
    }
  }, [addFormData.categoryId, selectedAddCategory, addFormType]);

  const activeCleaners = cleaners.filter(c => c.isActive);

  // Data fetching
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [allOrders, srvs, cats, clns, lockedDaysData, skData, promosData, subs] = await Promise.all([
        ordersApi.getAll(),
        servicesApi.getAll(),
        categoriesApi.getAll(),
        cleanersApi.getAll(),
        lockedDaysApi.getAll().catch(() => [] as string[]),
        skillsApi.getAll().catch(() => [] as ApiSkill[]),
        promosApi.getAll().catch(() => [] as ApiPromo[]),
        subscriptionsApi.getAll().catch(() => [] as ApiSubscription[])
      ]);
      // Only filter for rapid orders
      setOrders(allOrders.filter(o => o.isRapid === true));
      setAllOrdersForAvailability(allOrders);
      setServices(srvs);
      setCategories(cats);
      setCleaners(clns);
      setLockedDays(lockedDaysData);
      setSkills(skData);
      setPromos(promosData);
      setSubscriptions(subs);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch rapid data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Helpers
  const shortId = (id: string) => `CMD-${id.slice(0, 6).toUpperCase()}`;

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return '—'; }
  };

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch { return '—'; }
  };

  const getCleanerNames = (ids: string) => {
    return ids.split(',')
      .map(id => cleaners.find(c => c.id === id.trim())?.fullName || 'Inconnu')
      .join(', ');
  };

  const getRequiredCleanersCount = (order: ApiOrder) => {
    return (order.houseConfig?.workers ?? order.categoryService?.workers ?? 1) + (order.extraWorkers || 0);
  };

  const isDateLocked = (dateVal: string | Date) => {
    if (!dateVal) return false;
    try {
      const scheduled = typeof dateVal === 'string' ? new Date(dateVal) : dateVal;
      const offset = scheduled.getTimezoneOffset();
      const localDate = new Date(scheduled.getTime() - offset * 60 * 1000);
      const dateString = localDate.toISOString().slice(0, 10);
      return lockedDays.includes(dateString);
    } catch {
      return false;
    }
  };

  // Cleaner availability and slots algorithms
  const getAvailableCleaners = (order: ApiOrder) => {
    if (!order.scheduledDate) return [];
    const start1 = new Date(order.scheduledDate).getTime();
    const durationHours1 = order.houseConfig?.durationHours ?? order.categoryService?.durationHours ?? order.service?.durationHours ?? 3;
    const end1 = start1 + durationHours1 * 60 * 60 * 1000;

    const busyCleanerIds = new Set<string>();

    allOrdersForAvailability.forEach(other => {
      if (other.id === order.id || !other.cleanerId || other.status === 'CANCELLED') return;
      const start2 = new Date(other.scheduledDate).getTime();
      const durationHours2 = other.houseConfig?.durationHours ?? other.categoryService?.durationHours ?? other.service?.durationHours ?? 3;
      const end2 = start2 + durationHours2 * 60 * 60 * 1000;

      if (start1 < end2 && start2 < end1) {
        other.cleanerId.split(',').forEach(cid => busyCleanerIds.add(cid.trim()));
      }
    });

    // Check subscription sessions
    subscriptions.forEach(sub => {
      sub.sessions?.forEach(session => {
        if (!session.cleanerId || session.status === 'CANCELLED') return;
        const startSession = new Date(session.scheduledDate).getTime();
        const durationSession = session.durationHours || 3;
        const endSession = startSession + durationSession * 60 * 60 * 1000;

        if (start1 < endSession && startSession < end1) {
          session.cleanerId.split(',').forEach(cid => busyCleanerIds.add(cid.trim()));
        }
      });
    });

    const available = activeCleaners.filter(c => !busyCleanerIds.has(c.id));
    const serviceName = order.service?.name || order.category?.name || '';

    return [...available].sort((a, b) => {
      const hasA = a.skills.some(s => s.toLowerCase() === serviceName.toLowerCase());
      const hasB = b.skills.some(s => s.toLowerCase() === serviceName.toLowerCase());
      if (hasA && !hasB) return -1;
      if (!hasA && hasB) return 1;
      return 0;
    });
  };

  const getAvailableSlots = (order: ApiOrder | null, requiredCount: number) => {
    if (!order || !order.scheduledDate) return [];

    const date = new Date(order.scheduledDate);
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

      const durationHours = order.houseConfig?.durationHours ?? order.categoryService?.durationHours ?? order.service?.durationHours ?? 3;
      const end1 = testTime + durationHours * 60 * 60 * 1000;

      const busyCleanerIds = new Set<string>();
      allOrdersForAvailability.forEach(other => {
        if (other.id === order.id || !other.cleanerId || other.status === 'CANCELLED') return;
        const start2 = new Date(other.scheduledDate).getTime();
        const durationHours2 = other.houseConfig?.durationHours ?? other.categoryService?.durationHours ?? other.service?.durationHours ?? 3;
        const end2 = start2 + durationHours2 * 60 * 60 * 1000;

        if (testTime < end2 && start2 < end1) {
          other.cleanerId.split(',').forEach(cid => busyCleanerIds.add(cid.trim()));
        }
      });

      // Check subscription sessions
      subscriptions.forEach(sub => {
        sub.sessions?.forEach(session => {
          if (!session.cleanerId || session.status === 'CANCELLED') return;
          const startSession = new Date(session.scheduledDate).getTime();
          const durationSession = session.durationHours || 3;
          const endSession = startSession + durationSession * 60 * 60 * 1000;

          if (testTime < endSession && startSession < end1) {
            session.cleanerId.split(',').forEach(cid => busyCleanerIds.add(cid.trim()));
          }
        });
      });

      const availableCount = activeCleaners.length - busyCleanerIds.size;

      if (availableCount >= requiredCount) {
        freeSlots.push(timeStr);
      }
    });

    return freeSlots;
  };

  // Dynamic cleaner availability check for Add modal
  const getAddFormTempOrder = (): ApiOrder | null => {
    if (!addFormData.scheduledDate) return null;
    try {
      const service = services.find(s => s.id === addFormData.serviceId);
      const houseConfig = service?.houseConfigs.find(hc => hc.id === addFormData.houseConfigId);
      const category = categories.find(c => c.id === addFormData.categoryId);
      const categoryService = category?.categoryServices.find(cs => cs.id === addFormData.categoryServiceId);

      return {
        id: 'temp-add',
        userId: '',
        serviceId: addFormType === 'service' ? addFormData.serviceId : null,
        houseConfigId: addFormType === 'service' ? addFormData.houseConfigId : null,
        categoryId: addFormType === 'category' ? addFormData.categoryId : null,
        categoryServiceId: addFormType === 'category' ? addFormData.categoryServiceId : null,
        extraWorkers: addFormType === 'service' ? (addFormData.extraWorkers || 0) : 0,
        useMaterials: addFormData.useMaterials,
        productOrigin: addFormData.productOrigin as any,
        scheduledDate: new Date(addFormData.scheduledDate).toISOString(),
        address: addFormData.address,
        latitude: addFormData.latitude,
        longitude: addFormData.longitude,
        totalPrice: 0,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        service: service || undefined,
        houseConfig: houseConfig || undefined,
        category: category || undefined,
        categoryService: categoryService || undefined,
        cleanerId: undefined
      };
    } catch {
      return null;
    }
  };

  const tempOrderForAdd = getAddFormTempOrder();
  const addRequiredCount = tempOrderForAdd ? getRequiredCleanersCount(tempOrderForAdd) : 0;
  const addAvailableCleanersCount = tempOrderForAdd ? getAvailableCleaners(tempOrderForAdd).length : 0;
  const isAddCleanersShort = !!(tempOrderForAdd && addAvailableCleanersCount < addRequiredCount);
  const addAvailableSlots = tempOrderForAdd ? getAvailableSlots(tempOrderForAdd, addRequiredCount) : [];
  const addFormattedTime = tempOrderForAdd ? new Date(tempOrderForAdd.scheduledDate).toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit' }) : '';

  const handleSelectSlotForAdd = (timeStr: string) => {
    setSelectedTimeOption(timeStr);
  };

  const renderAddCleanerWarnings = () => {
    if (!isAddCleanersShort) return null;
    return (
      <div className="space-y-4 mt-3">
        <div className="border border-rose-100 bg-rose-50/40 p-5 rounded-2xl text-center text-rose-600 space-y-2">
          <AlertCircle className="mx-auto text-rose-500" size={24} />
          <p className="text-xs font-black uppercase tracking-wider">Créneau Impossible (Pas assez d'agents)</p>
          <p className="text-[10px] font-bold text-rose-500">
            Requis: {addRequiredCount} cleaner(s) • Disponibles: {addAvailableCleanersCount} à {addFormattedTime}.
          </p>
        </div>

        {/* Alternative suggestions */}
        <div className="space-y-2 bg-slate-50 p-5 rounded-2xl border border-slate-100">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">
            Créneaux alternatifs disponibles ce jour ({addRequiredCount} agents requis) :
          </h4>
          {addAvailableSlots.length === 0 ? (
            <p className="text-[10px] font-bold text-slate-400 pl-1">
              Aucun autre créneau disponible sur cette journée avec {addRequiredCount} agents libres.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 pt-1.5">
              {addAvailableSlots.map(timeStr => (
                <button
                  key={timeStr}
                  type="button"
                  onClick={() => handleSelectSlotForAdd(timeStr)}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:border-amber-500/50 text-slate-700 hover:text-amber-500 rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm hover:shadow active:scale-95"
                >
                  {timeStr}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Actions
  const handleUpdateStatus = async (id: string, status: ApiOrder['status']) => {
    try {
      await ordersApi.updateStatus(id, status);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleOpenGoogleMaps = (lat: number | null | undefined, lng: number | null | undefined, address?: string) => {
    if (lat && lng) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
    } else if (address) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
    }
  };

  const handleAssignCleaners = async () => {
    if (!orderToConfirm) return;
    if (selectedCleanerIds.length === 0) {
      setAssignError('Veuillez sélectionner au moins un agent.');
      return;
    }
    
    setIsAssigning(true);
    setAssignError(null);
    try {
      await ordersApi.update(orderToConfirm.id, {
        cleanerId: selectedCleanerIds.join(','),
        status: 'CONFIRMED'
      });
      setIsAssignModalOpen(false);
      setOrderToConfirm(null);
      setSelectedCleanerIds([]);
      fetchData();
    } catch (err: any) {
      setAssignError(err.message || 'Failed to confirm command');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(orders, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (addFormType === 'service') {
      if (!addFormData.phone || !addFormData.address || !addFormData.serviceId || !addFormData.houseConfigId || !addFormData.scheduledDate) {
        alert('Please fill out all required fields.');
        return;
      }
    } else {
      if (!addFormData.phone || !addFormData.address || !addFormData.categoryId || !addFormData.categoryServiceId || !addFormData.scheduledDate) {
        alert('Please fill out all required fields.');
        return;
      }
    }

    if (isDateLocked(addFormData.scheduledDate)) {
      alert('This date is locked.');
      return;
    }

    try {
      const payload = {
        ...addFormData,
        sizeM2: addFormType === 'service' && addFormData.sizeM2 ? parseFloat(addFormData.sizeM2.toString()) : null,
        clientNote: addFormData.clientNote || null,
        housePictures: addFormData.housePictures || [],
        scheduledDate: new Date(addFormData.scheduledDate).toISOString(),
        serviceId: addFormType === 'service' ? addFormData.serviceId : null,
        houseConfigId: addFormType === 'service' ? addFormData.houseConfigId : null,
        categoryId: addFormType === 'category' ? addFormData.categoryId : null,
        categoryServiceId: addFormType === 'category' ? addFormData.categoryServiceId : null,
        extraWorkers: addFormType === 'service' ? addFormData.extraWorkers : 0,
        promoCode: addFormData.promoCode || null
      };

      await ordersApi.createAdminOrder(payload);
      setIsAddModalOpen(false);
      fetchData();
      setAddFormData({
        fullName: '', phone: '', address: '',
        serviceId: '', houseConfigId: '',
        categoryId: '', categoryServiceId: '',
        scheduledDate: '', extraWorkers: 0, useMaterials: false, productOrigin: 'NONE',
        latitude: undefined, longitude: undefined,
        sizeM2: undefined,
        clientNote: '',
        housePictures: [],
        isRapid: true,
        promoCode: ''
      });
    } catch (err: any) {
      alert(`Failed to create command: ${err.message}`);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cette commande ?')) return;
    try {
      await ordersApi.delete(id);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete order');
    }
  };

  // Pricing calculations
  let addBasePrice = 0;
  let addExtraWorkerPriceTotal = 0;
  let addUseMaterials = false;
  let addMaterialsPrice = 0;
  let addProductsPrice = 0;
  let addFinalTotal = 0;

  if (addFormType === 'service') {
    const addSelectedHouse = selectedAddService?.houseConfigs.find(hc => hc.id === addFormData.houseConfigId);
    addBasePrice = addSelectedHouse?.rapidBasePrice || 0; // Forced rapid price
    addExtraWorkerPriceTotal = (addFormData.extraWorkers || 0) * (selectedAddService?.rapidExtraWorkerPrice || 0);
    addUseMaterials = addFormData.useMaterials || selectedAddService?.materialsMandatory || false;
    addMaterialsPrice = addUseMaterials ? (selectedAddService?.materialPrice || 0) : 0;
    if (addFormData.productOrigin === 'LOCAL' || (selectedAddService?.productsMandatory && (!addFormData.productOrigin || addFormData.productOrigin === 'NONE'))) {
      addProductsPrice = selectedAddService?.localProductPrice || 0;
    } else if (addFormData.productOrigin === 'IMPORTED') {
      addProductsPrice = selectedAddService?.importedProductPrice || 0;
    }
    addFinalTotal = addBasePrice + addExtraWorkerPriceTotal + addMaterialsPrice + addProductsPrice;
  } else {
    addBasePrice = selectedAddCategoryService?.rapidBasePrice || 0; // Forced rapid price
    addExtraWorkerPriceTotal = 0;
    addUseMaterials = addFormData.useMaterials || selectedAddCategory?.materialsMandatory || false;
    addMaterialsPrice = addUseMaterials ? (selectedAddCategory?.materialPrice || 0) : 0;
    if (addFormData.productOrigin === 'LOCAL' || (selectedAddCategory?.productsMandatory && (!addFormData.productOrigin || addFormData.productOrigin === 'NONE'))) {
      addProductsPrice = selectedAddCategory?.localProductPrice || 0;
    } else if (addFormData.productOrigin === 'IMPORTED') {
      addProductsPrice = selectedAddCategory?.importedProductPrice || 0;
    }
    addFinalTotal = addBasePrice + addMaterialsPrice + addProductsPrice;
  }

  // Find matching promo code if valid
  const activePromo = promos.find(
    p => p.code.toLowerCase() === addFormData.promoCode.trim().toLowerCase() && p.isActive
  );
  let promoDiscountPercent = 0;
  let promoDiscountAmount = 0;
  if (activePromo) {
    const now = new Date();
    const start = new Date(activePromo.validFrom);
    const until = new Date(activePromo.validUntil);
    if (now >= start && now <= until) {
      promoDiscountPercent = activePromo.discountPercent;
    }
  }

  // Apply promo discount
  if (promoDiscountPercent > 0) {
    promoDiscountAmount = addFinalTotal * (promoDiscountPercent / 100);
    addFinalTotal = addFinalTotal - promoDiscountAmount;
  }

  // Filter commands
  const filtered = orders.filter(o => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      o.id.toLowerCase().includes(query) ||
      (o.user?.fullName || '').toLowerCase().includes(query) ||
      (o.user?.phone || '').includes(query) ||
      (o.address || '').toLowerCase().includes(query);
    
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'PENDING').length,
    called: orders.filter(o => o.status === 'CALLED_NOT_PAID').length,
    confirmed: orders.filter(o => o.status === 'CONFIRMED').length,
  };

  return (
    <div className="space-y-10 max-w-full mx-auto px-4 lg:px-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 text-amber-500 font-bold text-sm">
            <Zap className="fill-amber-500 animate-pulse" size={16} />
            <span>Service Rapide (Urgent bookings)</span>
          </div>
          <h1 className="text-3xl font-black uppercase italic tracking-tight text-slate-800">
            Rapid Commands Dashboard
          </h1>
          <p className="text-xs text-slate-400 font-medium font-inter">
            List and manage all express commands with high priority pricing models.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsJsonModalOpen(true)}
            className="px-5 py-3.5 bg-slate-900 hover:bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-slate-800 cursor-pointer shadow-md transition-all active:scale-95"
          >
            <Code size={13} />
            View API JSON
          </button>
          
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-4 bg-amber-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus size={14} />
            Create Rapid Command
          </button>
        </div>
      </div>

      {/* ── Stats Overview ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Rapid', val: stats.total, style: 'from-amber-500/5 to-amber-500/10 border-amber-200/50 text-amber-600', icon: Zap },
          { label: 'En Attente', val: stats.pending, style: 'from-rose-500/5 to-rose-500/10 border-rose-200/50 text-rose-600', icon: Clock },
          { label: 'Appelé (Non Payé)', val: stats.called, style: 'from-cyan-500/5 to-cyan-500/10 border-cyan-200/50 text-cyan-600', icon: Phone },
          { label: 'Confirmées', val: stats.confirmed, style: 'from-emerald-500/5 to-emerald-500/10 border-emerald-200/50 text-emerald-600', icon: CheckCircle }
        ].map((item, i) => (
          <div key={i} className={`bg-gradient-to-br ${item.style} border rounded-3xl p-6 flex items-center justify-between`}>
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">{item.label}</span>
              <span className="text-3xl font-black">{item.val}</span>
            </div>
            <div className={`p-3 rounded-2xl bg-white shadow-sm border border-slate-100`}>
              <item.icon size={18} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Table Filters ── */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative w-full md:max-w-sm group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search by client name, address, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold outline-none focus:border-primary focus:bg-white transition-all text-slate-800"
          />
        </div>

        <div className="flex gap-2 flex-wrap justify-end w-full md:w-auto">
          {['all', 'PENDING', 'CALLED_NOT_PAID', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s as any)}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${
                statusFilter === s
                  ? 'bg-slate-900 border-slate-900 text-white'
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              {s === 'all' ? 'All statuses' : STATUS_LABELS[s as ApiOrder['status']]}
            </button>
          ))}
        </div>
      </div>

      {/* ── Commands List ── */}
      {isLoading ? (
        <div className="h-64 bg-white border border-slate-100 rounded-3xl flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading express bookings...</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="h-64 bg-white border border-slate-100 rounded-3xl flex flex-col items-center justify-center gap-4 text-center">
          <Zap className="text-slate-300 stroke-[1.5]" size={48} />
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-700">Aucune commande express trouvée</p>
            <p className="text-xs text-slate-400 max-w-[280px]">Aucune commande ne correspond aux filtres ou n'a été marquée Service Rapide.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1450px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <th className="py-4 pl-6">CMD ID</th>
                  <th className="py-4">Client</th>
                  <th className="py-4">Phone</th>
                  <th className="py-4">Address</th>
                  <th className="py-4">Service Details</th>
                  <th className="py-4">Scheduled Date</th>
                  <th className="py-4">Total</th>
                  <th className="py-4">Promo</th>
                  <th className="py-4">Status</th>
                  <th className="py-4 pr-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence mode="popLayout">
                  {filtered.map((order) => {
                    const reqCount = getRequiredCleanersCount(order);
                    const avCount = getAvailableCleaners(order).length;
                    const isShort = (order.status === 'PENDING' || order.status === 'CALLED_NOT_PAID') && avCount < reqCount;

                    return (
                      <motion.tr
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={order.id}
                        className={`group border-l-4 font-semibold text-slate-700 hover:bg-slate-50/40 transition-colors ${
                          isShort ? 'border-l-rose-500 bg-rose-50/20' : 'border-l-transparent'
                        }`}
                      >
                        {/* ID */}
                        <td className="py-5 pl-6 font-mono text-[10px] text-slate-400 font-black tracking-wider">
                          {shortId(order.id)}
                        </td>

                        {/* Client */}
                        <td className="py-5">
                          <span className="text-sm font-black uppercase text-slate-800 block leading-tight">
                            {order.user?.fullName || 'Guest Client'}
                          </span>
                          <span className="text-[10px] text-slate-400 block">{order.user?.email || ''}</span>
                        </td>

                        {/* Phone */}
                        <td className="py-5 text-xs">
                          <span className="inline-flex items-center gap-1.5 font-bold">
                            <Phone size={12} className="text-slate-400" />
                            {order.user?.phone || '—'}
                          </span>
                        </td>

                        {/* Location */}
                        <td className="py-5">
                          {order.latitude && order.longitude ? (
                            <button
                              onClick={() => handleOpenGoogleMaps(order.latitude, order.longitude)}
                              className="px-2.5 py-1.5 bg-rose-50/50 hover:bg-rose-50 text-rose-600 border border-rose-100/50 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
                            >
                              <MapPin size={11} className="fill-rose-100" />
                              View Map
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenGoogleMaps(null, null, order.address)}
                              className="text-[10px] text-slate-500 font-bold uppercase truncate max-w-[120px] block hover:text-primary hover:underline cursor-pointer text-left"
                            >
                              {order.address?.slice(0, 20) || '—'}
                            </button>
                          )}
                        </td>

                        {/* Service Name & Config */}
                        <td className="py-5 max-w-[180px]">
                          <span className="text-xs font-black text-primary block leading-none mb-1">
                            {order.service?.name || order.category?.name || '—'}
                          </span>
                          <span className="text-[9px] text-slate-400 block uppercase font-bold">
                            {order.houseConfig?.type?.toUpperCase() || order.categoryService?.name?.toUpperCase() || ''} • {order.productOrigin}
                          </span>
                          {isShort && (
                            <span className="text-[9px] text-rose-500 font-black block mt-1 uppercase tracking-wider animate-pulse">
                              ⚠️ select another time
                            </span>
                          )}
                          {order.cleanerId && (
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              <span className="text-[9px] text-emerald-600 font-black uppercase tracking-wider">
                                Cleaners: {getCleanerNames(order.cleanerId)}
                              </span>
                              <button
                                onClick={() => {
                                  setOrderToConfirm(order);
                                  setSelectedCleanerIds(order.cleanerId ? order.cleanerId.split(',') : []);
                                  setIsAssignModalOpen(true);
                                }}
                                className="px-1.5 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-100 rounded text-[8px] font-bold uppercase transition-all cursor-pointer"
                                title="Modifier les cleaners"
                              >
                                Modifier
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Date */}
                        <td className="py-5">
                          <span className="text-xs text-slate-800 block font-bold">{formatDate(order.scheduledDate)}</span>
                          <span className="text-xs text-primary font-black block mt-0.5">{formatTime(order.scheduledDate)}</span>
                        </td>

                        {/* Total */}
                        <td className="py-5 text-sm font-black text-emerald-500">
                          {order.totalPrice.toLocaleString('fr-DZ')} DA
                        </td>

                        {/* Promo */}
                        <td className="py-5">
                          {order.promo ? (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[9px] font-black uppercase tracking-wider">
                                {order.promo.code}
                              </span>
                              <span className="text-[9px] font-bold text-slate-400 block pl-1">
                                -{order.promo.discountPercent}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-bold">Aucune</span>
                          )}
                        </td>

                        {/* Status Select */}
                        <td className="py-5">
                          <div className="relative inline-block">
                            <select
                              value={order.status}
                              onChange={e => {
                                const val = e.target.value as ApiOrder['status'];
                                if (val === 'CONFIRMED') {
                                  setOrderToConfirm(order);
                                  setSelectedCleanerIds(order.cleanerId ? order.cleanerId.split(',') : []);
                                  setIsAssignModalOpen(true);
                                } else {
                                  handleUpdateStatus(order.id, val);
                                }
                              }}
                              className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider outline-none cursor-pointer transition-colors ${STATUS_STYLES[order.status]}`}
                            >
                              {(Object.keys(STATUS_LABELS) as ApiOrder['status'][]).map(s => (
                                <option key={s} value={s} className="bg-white text-slate-800 font-semibold">{STATUS_LABELS[s]}</option>
                              ))}
                            </select>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-5 text-center pr-6">
                          <div className="flex items-center justify-center gap-2">
                            {order.status === 'CONFIRMED' && (
                              <button
                                onClick={() => {
                                  setOrderToConfirm(order);
                                  setSelectedCleanerIds(order.cleanerId ? order.cleanerId.split(',') : []);
                                  setIsAssignModalOpen(true);
                                }}
                                className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-emerald-600 hover:text-emerald-700 hover:bg-slate-100 transition-all cursor-pointer"
                                title="Modifier les cleaners"
                              >
                                <Users size={14} />
                              </button>
                            )}
                            <button
                              onClick={() => router.push(`/admin/commands/${order.id}`)}
                              className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:bg-slate-100 transition-all cursor-pointer"
                              title="Modifier la commande"
                            >
                              <Wrench size={14} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setIsDetailsModalOpen(true);
                              }}
                              className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                              title="Details"
                            >
                              <Search size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100/50 flex items-center justify-center text-rose-500 hover:text-rose-700 hover:bg-rose-100 transition-all cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

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
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Rapid Commands API</span>
                  </div>
                  <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">
                    Rapid Orders JSON
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
                <pre>{JSON.stringify(orders, null, 2)}</pre>
              </div>

              <div className="p-8 border-t border-white/5 bg-slate-950 flex gap-4 shrink-0 justify-end">
                <button 
                  onClick={handleCopyJson}
                  className="px-6 py-4 bg-amber-500 text-white rounded-2xl font-black uppercase tracking-wider text-[10px] shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
                >
                  {copied ? <><Check size={14} strokeWidth={3} /> Copied! </> : <><Copy size={14} /> Copy JSON API</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── CREATE RAPID MANUAL ORDER MODAL ── */}
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-[1000px] bg-white rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-8 border-b border-slate-100 flex justify-between items-center shrink-0 bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                    <Zap className="fill-white" size={20} />
                  </div>
                  <div className="space-y-0.5">
                    <h2 className="text-xl font-black uppercase tracking-tight text-slate-800">New Rapid Command</h2>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-amber-600">⚡ Forced Urgent Rate</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Form Body */}
              <div className="flex-1 overflow-y-auto p-8 bg-white">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Form */}
                  <form id="add-rapid-form" onSubmit={handleAddSubmit} className="lg:col-span-7 space-y-6">
                    {/* Customer Profile */}
                    <div className="space-y-3">
                      <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Profil Client</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nom Complet</label>
                          <input
                            type="text"
                            required
                            value={addFormData.fullName}
                            onChange={e => setAddFormData(prev => ({ ...prev, fullName: e.target.value }))}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-amber-500"
                            placeholder="e.g. John Doe"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Téléphone</label>
                          <input
                            type="tel"
                            required
                            value={addFormData.phone}
                            onChange={e => setAddFormData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-amber-500"
                            placeholder="e.g. 0555123456"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Booking Mode */}
                    <div className="space-y-3 pt-4 border-t border-slate-100">
                      <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Type de Réservation</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setAddFormType('service');
                            setAddFormData(prev => ({ ...prev, categoryId: null, categoryServiceId: null }));
                          }}
                          className={`py-3 text-[10px] font-black uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${
                            addFormType === 'service' ? 'bg-amber-500 text-white border-amber-500 shadow' : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100'
                          }`}
                        >
                          Service Package
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAddFormType('category');
                            setAddFormData(prev => ({ ...prev, serviceId: null, houseConfigId: null }));
                          }}
                          className={`py-3 text-[10px] font-black uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${
                            addFormType === 'category' ? 'bg-amber-500 text-white border-amber-500 shadow' : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100'
                          }`}
                        >
                          Category Layout
                        </button>
                      </div>
                    </div>

                    {/* Service Selection */}
                    {addFormType === 'service' ? (
                      <div className="space-y-4 pt-4 border-t border-slate-100">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Service</label>
                            <select
                              required
                              value={addFormData.serviceId || ''}
                              onChange={e => setAddFormData(prev => ({ ...prev, serviceId: e.target.value, houseConfigId: '' }))}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-amber-500"
                            >
                              <option value="">Sélectionner un service</option>
                              {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Layout Config</label>
                            <select
                              required
                              disabled={!addFormData.serviceId}
                              value={addFormData.houseConfigId || ''}
                              onChange={e => setAddFormData(prev => ({ ...prev, houseConfigId: e.target.value }))}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-amber-500 disabled:opacity-50"
                            >
                              <option value="">Sélectionner la taille</option>
                              {selectedAddService?.houseConfigs.map((hc: any) => (
                                <option key={hc.id} value={hc.id}>
                                  {hc.type.toUpperCase()} ({hc.workers} Agents, {hc.rapidBasePrice} DA Express)
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {addFormData.serviceId && (
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Agents Supplémentaires</label>
                            <div className="flex items-center gap-3 w-full bg-slate-50 border border-slate-200 rounded-xl p-1">
                              <button
                                type="button"
                                onClick={() => setAddFormData(prev => ({ ...prev, extraWorkers: Math.max(0, prev.extraWorkers - 1) }))}
                                className="flex-1 h-10 rounded-lg bg-white shadow-sm border border-slate-100 flex items-center justify-center font-bold cursor-pointer text-slate-500 hover:text-slate-800 transition-colors"
                              >
                                -
                              </button>
                              <div className="flex-1 text-center font-black text-lg text-amber-500">
                                {addFormData.extraWorkers}
                              </div>
                              <button
                                type="button"
                                onClick={() => setAddFormData(prev => ({ ...prev, extraWorkers: prev.extraWorkers + 1 }))}
                                className="flex-1 h-10 rounded-lg bg-white shadow-sm border border-slate-100 flex items-center justify-center font-bold cursor-pointer text-slate-500 hover:text-slate-800 transition-colors"
                              >
                                +
                              </button>
                            </div>
                            {selectedAddService?.rapidExtraWorkerPrice && (
                              <p className="text-[10px] text-slate-400 font-medium ml-1">
                                Surcharge: +{selectedAddService.rapidExtraWorkerPrice} DA / Agent supplémentaire (Tarif Express)
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4 pt-4 border-t border-slate-100">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Catégorie</label>
                            <select
                              required
                              value={addFormData.categoryId || ''}
                              onChange={e => setAddFormData(prev => ({ ...prev, categoryId: e.target.value, categoryServiceId: '' }))}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-amber-500"
                            >
                              <option value="">Sélectionner une catégorie</option>
                              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Service de Catégorie</label>
                            <select
                              required
                              disabled={!addFormData.categoryId}
                              value={addFormData.categoryServiceId || ''}
                              onChange={e => setAddFormData(prev => ({ ...prev, categoryServiceId: e.target.value }))}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-amber-500 disabled:opacity-50"
                            >
                              <option value="">Sélectionner le sous-service</option>
                              {selectedAddCategory?.categoryServices.map((cs: any) => (
                                <option key={cs.id} value={cs.id}>
                                  {cs.name} ({cs.workers} Agents, {cs.rapidBasePrice} DA Express)
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Customization */}
                    <div className="space-y-4 pt-6 border-t border-slate-100">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Configuration du Service</h4>
                      <div className="space-y-4">
                        {/* Materials */}
                        <div className={`p-4 rounded-xl border flex flex-col justify-between ${(addFormType === 'service' ? selectedAddService?.materialsMandatory : selectedAddCategory?.materialsMandatory)
                          ? 'border-amber-500/30 bg-amber-500/5 text-slate-800'
                          : 'border-slate-200 bg-slate-50 text-slate-800'
                          }`}>
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider">MATÉRIEL NADIF</p>
                              <p className="text-xs font-bold mt-1">Utiliser notre matériel de nettoyage</p>
                              {addFormType === 'service' && selectedAddService && <p className="text-[9px] font-bold text-amber-600 mt-0.5">+{selectedAddService.materialPrice} DA</p>}
                              {addFormType === 'category' && selectedAddCategory && <p className="text-[9px] font-bold text-amber-600 mt-0.5">+{selectedAddCategory.materialPrice} DA</p>}
                            </div>
                            {(addFormType === 'service' ? selectedAddService?.materialsMandatory : selectedAddCategory?.materialsMandatory) ? (
                              <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 border border-amber-500/20 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                                <Lock size={8} /> Obligatoire
                              </div>
                            ) : (
                              <button
                                type="button"
                                disabled={addFormType === 'service' ? !selectedAddService : !selectedAddCategory}
                                onClick={() => setAddFormData(prev => ({ ...prev, useMaterials: !prev.useMaterials }))}
                                className={`w-10 h-6 rounded-full p-0.5 transition-colors cursor-pointer shadow-inner disabled:opacity-50 ${addFormData.useMaterials ? 'bg-amber-500' : 'bg-slate-300'}`}
                              >
                                <div className={`w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${addFormData.useMaterials ? 'translate-x-4' : 'translate-x-0'}`} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Products */}
                        <div className={`p-4 rounded-xl border flex flex-col justify-between ${(addFormType === 'service' ? selectedAddService?.productsMandatory : selectedAddCategory?.productsMandatory)
                          ? 'border-amber-500/30 bg-amber-500/5 text-slate-800'
                          : 'border-slate-200 bg-slate-50 text-slate-800'
                          }`}>
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider">PRODUITS NADIF</p>
                              <p className="text-xs font-bold mt-1">Origine des produits chimiques</p>
                            </div>
                            {(addFormType === 'service' ? selectedAddService?.productsMandatory : selectedAddCategory?.productsMandatory) && (
                              <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 border border-amber-500/20 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                                <Lock size={8} /> Obligatoire
                              </div>
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-1 mt-3">
                            {!(addFormType === 'service' ? selectedAddService?.productsMandatory : selectedAddCategory?.productsMandatory) && (
                              <button
                                type="button"
                                disabled={addFormType === 'service' ? !selectedAddService : !selectedAddCategory}
                                onClick={() => setAddFormData(prev => ({ ...prev, productOrigin: 'NONE' }))}
                                className={`py-2 text-[8px] font-black uppercase tracking-wider rounded-lg border transition-all cursor-pointer disabled:opacity-50 ${addFormData.productOrigin === 'NONE' ? 'bg-amber-500 text-white border-amber-500 shadow' : 'bg-white text-slate-500 border-slate-200 hover:text-slate-800'
                                  }`}
                              >
                                <span className="block">Client</span>
                                <span className="block text-[7px] font-bold opacity-70 mt-0.5">(0 DA)</span>
                              </button>
                            )}
                            <button
                              type="button"
                              disabled={addFormType === 'service' ? !selectedAddService : !selectedAddCategory}
                              onClick={() => setAddFormData(prev => ({ ...prev, productOrigin: 'LOCAL' }))}
                              className={`py-2 text-[8px] font-black uppercase tracking-wider rounded-lg border transition-all cursor-pointer disabled:opacity-50 ${(addFormType === 'service' ? selectedAddService?.productsMandatory : selectedAddCategory?.productsMandatory) ? 'col-span-1.5' : ''
                                } ${(addFormData.productOrigin === 'LOCAL' || ((addFormType === 'service' ? selectedAddService?.productsMandatory : selectedAddCategory?.productsMandatory) && addFormData.productOrigin === 'NONE'))
                                  ? 'bg-amber-500 text-white border-amber-500 shadow' : 'bg-white text-slate-500 border-slate-200 hover:text-slate-800'
                                }`}
                            >
                              <span className="block">Locaux</span>
                              {addFormType === 'service' && selectedAddService && <span className="block text-[7px] font-bold opacity-70 mt-0.5">(+{selectedAddService.localProductPrice} DA)</span>}
                              {addFormType === 'category' && selectedAddCategory && <span className="block text-[7px] font-bold opacity-70 mt-0.5">(+{selectedAddCategory.localProductPrice} DA)</span>}
                            </button>
                            <button
                              type="button"
                              disabled={addFormType === 'service' ? !selectedAddService : !selectedAddCategory}
                              onClick={() => setAddFormData(prev => ({ ...prev, productOrigin: 'IMPORTED' }))}
                              className={`py-2 text-[8px] font-black uppercase tracking-wider rounded-lg border transition-all cursor-pointer disabled:opacity-50 ${(addFormType === 'service' ? selectedAddService?.productsMandatory : selectedAddCategory?.productsMandatory) ? 'col-span-1.5' : ''
                                } ${addFormData.productOrigin === 'IMPORTED' ? 'bg-amber-500 text-white border-amber-500 shadow' : 'bg-white text-slate-500 border-slate-200 hover:text-slate-800'
                                }`}
                            >
                              <span className="block">Importés</span>
                              {addFormType === 'service' && selectedAddService && <span className="block text-[7px] font-bold opacity-70 mt-0.5">(+{selectedAddService.importedProductPrice} DA)</span>}
                              {addFormType === 'category' && selectedAddCategory && <span className="block text-[7px] font-bold opacity-70 mt-0.5">(+{selectedAddCategory.importedProductPrice} DA)</span>}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* RESTRICTED DATE SELECTOR */}
                    <div className="space-y-3 pt-4 border-t border-slate-100">
                      <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Restreindre Date (Aujourd'hui / Demain / +2j)</h4>
                      <div className="grid grid-cols-3 gap-3">
                        {getRestrictedDates().map((d) => {
                          const locked = isDateLocked(d.date);
                          return (
                            <button
                              key={d.key}
                              type="button"
                              disabled={locked}
                              onClick={() => setSelectedDateOption(d.key)}
                              className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                                locked
                                  ? 'bg-rose-50/50 border-rose-100 text-rose-400 opacity-60 cursor-not-allowed'
                                  : selectedDateOption === d.key
                                    ? 'bg-amber-50 border-amber-500 shadow-sm text-amber-700'
                                    : 'bg-slate-50 border-transparent hover:bg-slate-100 text-slate-600'
                              }`}
                            >
                              <div className="w-full flex items-center justify-between">
                                <span className="text-[9px] font-black uppercase tracking-wider block opacity-50">{d.label}</span>
                                {locked && <span className="text-[8px] bg-rose-500 text-white font-black px-1.5 py-0.5 rounded uppercase tracking-wider">Locked</span>}
                              </div>
                              <span className="text-xs font-bold mt-2">{formatDateLabel(d.date)}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* TIME PICKER */}
                    <div className="space-y-3 pt-4 border-t border-slate-100">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Créneau Horaire</label>
                      <select
                        value={selectedTimeOption}
                        onChange={(e) => setSelectedTimeOption(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-amber-500"
                      >
                        {["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      {renderAddCleanerWarnings()}
                    </div>

                    {/* Code Promo */}
                    <div className="space-y-4 pt-6 border-t border-slate-100">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Code Promo</h4>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Promo Code</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={addFormData.promoCode}
                            onChange={e => setAddFormData(prev => ({ ...prev, promoCode: e.target.value.toUpperCase() }))}
                            className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-1 ${
                              addFormData.promoCode && !activePromo
                                ? 'border-amber-400 focus:border-amber-500 focus:ring-amber-500 bg-amber-50/10'
                                : activePromo
                                ? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500 bg-emerald-50/10'
                                : 'border-slate-200 focus:border-amber-500 focus:ring-amber-500'
                            }`}
                            placeholder="e.g. NADIF20"
                          />
                          {addFormData.promoCode && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                              {activePromo ? (
                                <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-2 py-1 rounded-lg uppercase">
                                  Valid (-{promoDiscountPercent}%)
                                </span>
                              ) : (
                                <span className="text-[10px] font-black text-amber-600 bg-amber-100 px-2 py-1 rounded-lg uppercase">
                                  Invalid / Inactive
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Property & Client Notes */}
                    <div className="space-y-4 pt-6 border-t border-slate-100">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Property & Client Notes</h4>
                      <div className="space-y-4">
                        {addFormType === 'service' && (
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">House Size (m²)</label>
                            <input
                              type="number"
                              value={addFormData.sizeM2 ?? ''}
                              onChange={e => {
                                const val = e.target.value;
                                setAddFormData(prev => ({ ...prev, sizeM2: val === '' ? undefined : parseFloat(val) }));
                              }}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                              placeholder="e.g. 120"
                              min="0"
                              step="any"
                            />
                          </div>
                        )}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Client Note</label>
                          <textarea
                            value={addFormData.clientNote ?? ''}
                            onChange={e => setAddFormData(prev => ({ ...prev, clientNote: e.target.value }))}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 min-h-[80px]"
                            placeholder="Add specific instructions, details, etc."
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">House Pictures</label>
                          <div className="flex flex-col gap-3">
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={e => {
                                const files = e.target.files;
                                if (!files) return;
                                const fileArray = Array.from(files);
                                const promises = fileArray.map(file => uploadImage(file));
                                Promise.all(promises).then(base64s => {
                                  setAddFormData(prev => ({
                                    ...prev,
                                    housePictures: [...(prev.housePictures || []), ...base64s]
                                  }));
                                }).catch(err => alert("Error uploading images: " + err.message));
                              }}
                              className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-500/10 file:text-amber-600 hover:file:bg-amber-500/20 cursor-pointer"
                            />
                            {addFormData.housePictures && addFormData.housePictures.length > 0 && (
                              <div className="grid grid-cols-4 gap-2 border border-slate-100 p-3 rounded-2xl bg-slate-50/50">
                                {addFormData.housePictures.map((pic, index) => (
                                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-150">
                                    <img src={imgUrl(pic)} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                      type="button"
                                      onClick={() => setAddFormData(prev => ({
                                        ...prev,
                                        housePictures: prev.housePictures?.filter((_, i) => i !== index) || []
                                      }))}
                                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer"
                                    >
                                      <X size={12} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Address & Coordinates */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Adresse</label>
                        <input
                          type="text"
                          required
                          value={addFormData.address}
                          onChange={e => setAddFormData(prev => ({ ...prev, address: e.target.value }))}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-amber-500"
                          placeholder="Ex: Cité 1200 logts, Batiment B, Alger"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Coordonnées Map</label>
                        <LocationPicker
                          latitude={addFormData.latitude}
                          longitude={addFormData.longitude}
                          onChange={(lat, lng) => setAddFormData(prev => ({ ...prev, latitude: lat, longitude: lng }))}
                        />
                      </div>
                    </div>
                  </form>

                  {/* Right: Bill Calculations */}
                  <div className="lg:col-span-5">
                    <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 lg:p-8 flex flex-col justify-between shadow-sm sticky top-0">
                      <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 border-b border-slate-200 pb-3">
                          Calculateur Facture
                        </h4>

                        <div className="space-y-3 font-semibold text-xs text-slate-600">
                          {addFormType === 'service' ? (
                            <>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Service Base (Tarif Rapide):</span>
                                <span className="text-slate-800 font-bold">{addBasePrice} DA</span>
                              </div>
                              {addFormData.extraWorkers > 0 && (
                                <div className="flex justify-between border-t border-slate-100/50 pt-2">
                                  <span className="text-slate-500">Agents Supplémentaires ({addFormData.extraWorkers}):</span>
                                  <span className="text-slate-800 font-bold">+{addExtraWorkerPriceTotal} DA</span>
                                </div>
                              )}
                              <div className="flex justify-between border-t border-slate-100/50 pt-2">
                                <span className="text-slate-500">Matériel Surcharge:</span>
                                <span className="text-slate-800 font-bold">+{addMaterialsPrice} DA</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Catégorie Base (Tarif Rapide):</span>
                                <span className="text-slate-800 font-bold">{addBasePrice} DA</span>
                              </div>
                              <div className="flex justify-between border-t border-slate-100/50 pt-2">
                                <span className="text-slate-500">Matériel Surcharge:</span>
                                <span className="text-slate-800 font-bold">+{addMaterialsPrice} DA</span>
                              </div>
                            </>
                          )}

                          <div className="flex justify-between border-t border-slate-100/50 pt-2">
                            <span className="text-slate-500">Produits Surcharge:</span>
                            <span className="text-slate-800 font-bold">+{addProductsPrice} DA</span>
                          </div>

                          {promoDiscountPercent > 0 && (
                            <div className="flex justify-between border-t border-dashed border-slate-200 pt-2 text-emerald-600 font-bold text-xs">
                              <span>Discount ({activePromo?.code} -{promoDiscountPercent}%):</span>
                              <span className="font-black">-{promoDiscountAmount.toLocaleString('fr-DZ')} DA</span>
                            </div>
                          )}

                          <div className="flex justify-between border-t-2 border-dashed border-slate-200 pt-4 text-sm">
                            <span className="font-black text-slate-800">Total Général:</span>
                            <span className="font-black text-emerald-500">{addFinalTotal} DA</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-8">
                        <button
                          type="submit"
                          form="add-rapid-form"
                          disabled={isDateLocked(addFormData.scheduledDate) || isAddCleanersShort}
                          className="w-full py-4.5 bg-amber-500 text-white rounded-2xl font-black uppercase tracking-wider text-[10px] shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                          Enregistrer la Commande Express
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── ASSIGN CLEANERS MODAL ── */}
      <AnimatePresence>
        {isAssignModalOpen && orderToConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsAssignModalOpen(false);
                setOrderToConfirm(null);
                setSelectedCleanerIds([]);
              }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-[550px] bg-white rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center shrink-0">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-slate-800">
                    {orderToConfirm.status === 'CONFIRMED' ? 'Modifier les Cleaners' : 'Assign Cleaners'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    Command {shortId(orderToConfirm.id)}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsAssignModalOpen(false);
                    setOrderToConfirm(null);
                    setSelectedCleanerIds([]);
                  }}
                  className="w-8 h-8 rounded-full bg-slate-150 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-all cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {assignError && (
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-xs font-semibold">
                    <AlertCircle size={16} />
                    <span>{assignError}</span>
                  </div>
                )}

                <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-[11px] font-bold text-amber-700 flex items-center gap-2">
                  <User size={14} />
                  <span>Required Agents: {getRequiredCleanersCount(orderToConfirm)}</span>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Available Agents</label>
                  <div className="grid grid-cols-1 gap-2">
                    {(() => {
                      const availableCleaners = getAvailableCleaners(orderToConfirm);
                      
                      const serviceId = orderToConfirm.serviceId;
                      const categoryId = orderToConfirm.categoryId;
                      const serviceName = orderToConfirm.service?.name || orderToConfirm.category?.name || '';
                      
                      const getHasMatching = (cln: ApiCleaner) => {
                        return cln.skills.some(sName => {
                          const skObj = skills.find(s => s.name.toLowerCase() === sName.toLowerCase());
                          if (skObj) {
                            const matchesService = serviceId && skObj.services?.some(s => s.id === serviceId);
                            const matchesCategory = categoryId && skObj.categories?.some(c => c.id === categoryId);
                            if (matchesService || matchesCategory) return true;
                          }
                          return sName.toLowerCase() === serviceName.toLowerCase();
                        });
                      };

                      const sortedCleaners = [...availableCleaners].sort((a, b) => {
                        const hasA = getHasMatching(a);
                        const hasB = getHasMatching(b);
                        if (hasA && !hasB) return -1;
                        if (!hasA && hasB) return 1;
                        return 0;
                      });

                      return sortedCleaners.map(cleaner => {
                        const isChecked = selectedCleanerIds.includes(cleaner.id);
                        const hasMatchingSkill = getHasMatching(cleaner);
                        return (
                          <button
                            key={cleaner.id}
                            type="button"
                            onClick={() => {
                              if (isChecked) {
                                setSelectedCleanerIds(prev => prev.filter(id => id !== cleaner.id));
                              } else {
                                setSelectedCleanerIds(prev => [...prev, cleaner.id]);
                              }
                            }}
                            className={`p-4 rounded-2xl border text-left transition-all flex justify-between items-center cursor-pointer ${
                              isChecked 
                                ? 'bg-amber-500/10 border-amber-500 text-slate-800 font-black' 
                                : 'bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100 font-semibold'
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-xs uppercase font-bold">{cleaner.fullName}</p>
                                {hasMatchingSkill && (
                                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                                    isChecked ? 'bg-amber-500 text-white' : 'bg-primary/10 text-primary'
                                  }`}>
                                    Compétence Validée
                                  </span>
                                )}
                              </div>
                              <p className="text-[9px] text-slate-400 font-bold mt-0.5">{cleaner.phone}</p>
                            </div>
                            {isChecked && <CheckCircle className="text-amber-500 fill-amber-50/50" size={16} />}
                          </button>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4 shrink-0 justify-end">
                <button
                  onClick={handleAssignCleaners}
                  disabled={isAssigning}
                  className="px-6 py-4 bg-amber-500 disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-wider text-[10px] shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  {isAssigning ? 'Confirming...' : orderToConfirm.status === 'CONFIRMED' ? 'Enregistrer les modifications' : 'Assign Cleaners & Confirm'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── DETAILS MODAL ── */}
      <AnimatePresence>
        {isDetailsModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsDetailsModalOpen(false);
                setSelectedOrder(null);
              }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-[600px] bg-white rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center shrink-0 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                    <Zap className="fill-white animate-pulse" size={16} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tight text-slate-800">Command Details</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                      {shortId(selectedOrder.id)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedOrder(null);
                  }}
                  className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="space-y-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-1">Client Profile</span>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
                    <p className="text-xs font-black uppercase text-slate-800">{selectedOrder.user?.fullName || 'Guest Client'}</p>
                    <p className="text-[10px] font-bold text-slate-500">Phone: {selectedOrder.user?.phone || '—'}</p>
                    <p className="text-[10px] font-bold text-slate-500">Email: {selectedOrder.user?.email || '—'}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-1">Booking Info</span>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
                    <p className="text-xs font-black text-primary uppercase">{selectedOrder.service?.name || selectedOrder.category?.name || '—'}</p>
                    <p className="text-[10px] font-bold text-slate-500">Layout size: {selectedOrder.houseConfig?.type?.toUpperCase() || selectedOrder.categoryService?.name?.toUpperCase() || '—'}</p>
                    <p className="text-[10px] font-bold text-slate-500">Scheduled: {formatDate(selectedOrder.scheduledDate)} at {formatTime(selectedOrder.scheduledDate)}</p>
                    <p className="text-[10px] font-bold text-slate-500">Address: {selectedOrder.address}</p>
                  </div>
                </div>

                {selectedOrder.cleanerId && (
                  <div className="space-y-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-1">Cleaners Assignés</span>
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center">
                      <p className="text-xs font-black uppercase text-emerald-600">
                        {getCleanerNames(selectedOrder.cleanerId)}
                      </p>
                      <button
                        onClick={() => {
                          setOrderToConfirm(selectedOrder);
                          setSelectedCleanerIds(selectedOrder.cleanerId ? selectedOrder.cleanerId.split(',') : []);
                          setIsAssignModalOpen(true);
                          setIsDetailsModalOpen(false);
                        }}
                        className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Modifier
                      </button>
                    </div>
                  </div>
                )}

                {selectedOrder.clientNote && (
                  <div className="space-y-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-1">Client Note</span>
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-bold text-slate-700 italic">
                      "{selectedOrder.clientNote}"
                    </div>
                  </div>
                )}

                {selectedOrder.housePictures && selectedOrder.housePictures.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 pl-1">House Pictures</span>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedOrder.housePictures.map((pic, idx) => (
                        <div key={idx} className="relative rounded-2xl overflow-hidden aspect-[4/3] border border-slate-100 bg-slate-100">
                          <img src={imgUrl(pic)} alt="House Pic" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
