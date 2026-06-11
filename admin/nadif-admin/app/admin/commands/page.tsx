'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList,
  Search,
  MapPin,
  Phone,
  Calendar,
  Clock3,
  CheckCircle,
  XCircle,
  ThumbsUp,
  Trash2,
  Eye,
  Navigation,
  Sparkles,
  X,
  ChevronDown,
  RefreshCw,
  AlertCircle,
  DollarSign,
  User,
  Package,
  Wrench,
  Plus,
  Lock,
  Code,
  Copy,
  Check,
  Users
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { ordersApi, servicesApi, cleanersApi, categoriesApi, lockedDaysApi, skillsApi, subscriptionsApi, uploadImage, imgUrl, type ApiOrder, type ApiService, type ApiCleaner, type ApiCategory, type ApiCategoryService, type ApiSkill, type ApiSubscription } from '../../lib/api';

const LocationPicker = dynamic(() => import('../../components/LocationPicker'), {
  ssr: false,
  loading: () => <div className="h-[250px] w-full bg-slate-50 rounded-2xl animate-pulse border border-slate-100 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Map Core...</div>
});

// ─── Status helpers ────────────────────────────────────────────────────────────
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

type FilterStatus = 'all' | ApiOrder['status'];

import { useRouter } from 'next/navigation';

export default function CommandsPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [services, setServices] = useState<ApiService[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [cleaners, setCleaners] = useState<ApiCleaner[]>([]);
  const [skills, setSkills] = useState<ApiSkill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [bookingTypeFilter, setBookingTypeFilter] = useState<'all' | 'service' | 'category'>('all');
  const [addFormType, setAddFormType] = useState<'service' | 'category'>('service');
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState<ApiOrder | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<ApiOrder | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [lockedDays, setLockedDays] = useState<string[]>([]);

  // Assign Cleaner Modal States
  const [orderToConfirm, setOrderToConfirm] = useState<ApiOrder | null>(null);
  const [subscriptions, setSubscriptions] = useState<ApiSubscription[]>([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedCleanerIds, setSelectedCleanerIds] = useState<string[]>([]);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    fullName: '', phone: '', address: '',
    serviceId: '' as string | null, houseConfigId: '' as string | null,
    categoryId: '' as string | null, categoryServiceId: '' as string | null,
    scheduledDate: '', extraWorkers: 0, useMaterials: false, productOrigin: 'NONE',
    isRapid: false,
    latitude: undefined as number | undefined, longitude: undefined as number | undefined,
    sizeM2: undefined as number | undefined,
    clientNote: '',
    housePictures: [] as string[]
  });

  const selectedAddService = services.find(s => s.id === addFormData.serviceId);
  const selectedAddCategory = categories.find(c => c.id === addFormData.categoryId);

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
      alert("Cette date est verrouillée par l'administrateur. Veuillez choisir un autre jour.");
      return;
    }
    if (isAddCleanersShort) {
      alert("Créneau Impossible: Pas assez d'agents disponibles à cette heure.");
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
        isRapid: addFormData.isRapid
      };
      await ordersApi.createAdminOrder(payload);
      setIsAddModalOpen(false);
      fetchOrders();
      setAddFormData({
        fullName: '', phone: '', address: '',
        serviceId: '', houseConfigId: '',
        categoryId: '', categoryServiceId: '',
        scheduledDate: '', extraWorkers: 0, useMaterials: false, productOrigin: 'NONE',
        isRapid: false,
        latitude: undefined, longitude: undefined,
        sizeM2: undefined,
        clientNote: '',
        housePictures: []
      });
      setAddFormType('service');
    } catch (err: any) {
      alert(`Failed to create command: ${err.message}`);
    }
  };

  // ─── Fetch orders from API ────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [data, srvData, catData, clnData, lockedDaysData, skData, subData] = await Promise.all([
        ordersApi.getAll(),
        servicesApi.getAll(),
        categoriesApi.getAll(),
        cleanersApi.getAll().catch(() => [] as ApiCleaner[]),
        lockedDaysApi.getAll().catch(() => [] as string[]),
        skillsApi.getAll().catch(() => [] as ApiSkill[]),
        subscriptionsApi.getAll().catch(() => [] as ApiSubscription[])
      ]);
      setOrders(data);
      setServices(srvData);
      setCategories(catData);
      setCleaners(clnData);
      setLockedDays(lockedDaysData);
      setSkills(skData);
      setSubscriptions(subData);
    } catch (err: any) {
      setError(err.message || 'Failed to load orders. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // ─── Update status via API ────────────────────────────────────────────────
  const handleUpdateStatus = async (id: string, newStatus: ApiOrder['status']) => {
    setUpdatingId(id);
    try {
      const updated = await ordersApi.updateStatus(id, newStatus);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updated } : o));
      if (selectedOrder?.id === id) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // ─── Cleaner Availability Calculation ──────────────────────────────────────
  const getRequiredCleanersCount = (order: ApiOrder | null) => {
    if (!order) return 0;
    if (order.serviceId) {
      return (order.houseConfig?.workers || 1) + (order.extraWorkers || 0);
    } else {
      return order.categoryService?.workers || 1;
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

  const getCleanerNames = (cleanerIdStr?: string | null) => {
    if (!cleanerIdStr) return 'Aucun';
    return cleanerIdStr.split(',')
      .map(id => cleaners.find(c => c.id === id.trim())?.fullName || 'Inconnu')
      .join(', ');
  };

  const getAvailableCleaners = (order: ApiOrder | null) => {
    if (!order || !order.scheduledDate) return [];

    const start1 = new Date(order.scheduledDate).getTime();
    const durationHours1 = order.houseConfig?.durationHours ?? order.categoryService?.durationHours ?? order.service?.durationHours ?? 3;
    const end1 = start1 + durationHours1 * 60 * 60 * 1000;

    const activeCleaners = cleaners.filter(c => c.isActive);
    const busyCleanerIds = new Set<string>();

    orders.forEach(other => {
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

  const modalReqCount = selectedOrder ? getRequiredCleanersCount(selectedOrder) : 0;
  const modalAvCount = selectedOrder ? getAvailableCleaners(selectedOrder).length : 0;
  const modalIsShort = selectedOrder
    ? (selectedOrder.status === 'PENDING' || selectedOrder.status === 'CALLED_NOT_PAID') && modalAvCount < modalReqCount
    : false;

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
      orders.forEach(other => {
        if (other.id === order.id || !other.cleanerId || other.status === 'CANCELLED') return;
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

  const handleSelectSlot = async (order: ApiOrder, timeStr: string) => {
    try {
      const scheduled = new Date(order.scheduledDate);
      const [hours, minutes] = timeStr.split(':').map(Number);
      scheduled.setHours(hours, minutes, 0, 0);

      await ordersApi.update(order.id, { scheduledDate: scheduled.toISOString() });
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, scheduledDate: scheduled.toISOString() } : o));
      setOrderToConfirm(prev => prev ? { ...prev, scheduledDate: scheduled.toISOString() } : null);
      setSelectedCleanerIds([]);
      alert(`La commande a été déplacée à ${timeStr} avec succès!`);
    } catch (err: any) {
      alert(`Erreur lors du déplacement de la commande: ${err.message || 'Inconnue'}`);
    }
  };

  const handleConfirmAndAssign = async () => {
    if (!orderToConfirm) return;
    const reqCount = getRequiredCleanersCount(orderToConfirm);
    if (selectedCleanerIds.length !== reqCount) {
      alert(`Veuillez sélectionner exactement ${reqCount} cleaner(s).`);
      return;
    }
    setUpdatingId(orderToConfirm.id);
    try {
      const updated = await ordersApi.update(orderToConfirm.id, {
        status: 'CONFIRMED',
        cleanerId: selectedCleanerIds.join(',')
      });
      setOrders(prev => prev.map(o => o.id === orderToConfirm.id ? { ...o, ...updated } : o));
      if (selectedOrder?.id === orderToConfirm.id) {
        setSelectedOrder(prev => prev ? { ...prev, ...updated } : null);
      }
      setIsAssignModalOpen(false);
      setOrderToConfirm(null);
      setSelectedCleanerIds([]);
    } catch (err: any) {
      alert(`Assign update failed: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // ─── Open Google Maps ─────────────────────────────────────────────────────
  const handleOpenGoogleMaps = (lat?: number | null, lng?: number | null, address?: string) => {
    if (lat && lng) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
    } else if (address) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
    }
  };

  // ─── Delete order via API ─────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!orderToDelete) return;
    setIsDeleting(true);
    try {
      await ordersApi.delete(orderToDelete.id);
      setOrders(prev => prev.filter(o => o.id !== orderToDelete.id));
      setIsDeleteModalOpen(false);
      setOrderToDelete(null);
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // ─── Stats ────────────────────────────────────────────────────────────────
  const countByStatus = (s: ApiOrder['status']) => orders.filter(o => o.status === s).length;

  // ─── Filter ───────────────────────────────────────────────────────────────
  const filtered = orders.filter(order => {
    if (bookingTypeFilter === 'service' && !order.serviceId) return false;
    if (bookingTypeFilter === 'category' && !order.categoryId) return false;

    const fullName = order.user?.fullName ?? '';
    const phone = order.user?.phone ?? '';
    const email = order.user?.email ?? '';
    const service = order.service?.name ?? '';
    const category = order.category?.name ?? '';
    const matchSearch =
      fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phone.includes(searchQuery) ||
      email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const formatDate = (iso: string) => {
    try { return new Date(iso).toLocaleDateString('fr-DZ', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return iso; }
  };
  const formatTime = (iso: string) => {
    try { return new Date(iso).toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit' }); }
    catch { return ''; }
  };
  const shortId = (id: string) => `CMD-${id.slice(0, 6).toUpperCase()}`;

  // Dynamic price calculation for Add Modal
  const selectedAddCategoryService = selectedAddCategory?.categoryServices.find(cs => cs.id === addFormData.categoryServiceId);

  let addBasePrice = 0;
  let addExtraWorkerPriceTotal = 0;
  let addUseMaterials = false;
  let addMaterialsPrice = 0;
  let addProductsPrice = 0;
  let addFinalTotal = 0;

  if (addFormType === 'service') {
    const addSelectedHouse = selectedAddService?.houseConfigs.find(hc => hc.id === addFormData.houseConfigId);
    addBasePrice = addFormData.isRapid ? (addSelectedHouse?.rapidBasePrice || 0) : (addSelectedHouse?.basePrice || 0);
    const extraPriceUnit = addFormData.isRapid ? (selectedAddService?.rapidExtraWorkerPrice || 0) : (selectedAddService?.extraWorkerPrice || 0);
    addExtraWorkerPriceTotal = (addFormData.extraWorkers || 0) * extraPriceUnit;
    addUseMaterials = addFormData.useMaterials || selectedAddService?.materialsMandatory || false;
    addMaterialsPrice = addUseMaterials ? (selectedAddService?.materialPrice || 0) : 0;
    if (addFormData.productOrigin === 'LOCAL' || (selectedAddService?.productsMandatory && (!addFormData.productOrigin || addFormData.productOrigin === 'NONE'))) {
      addProductsPrice = selectedAddService?.localProductPrice || 0;
    } else if (addFormData.productOrigin === 'IMPORTED') {
      addProductsPrice = selectedAddService?.importedProductPrice || 0;
    }
    addFinalTotal = addBasePrice + addExtraWorkerPriceTotal + addMaterialsPrice + addProductsPrice;
  } else {
    addBasePrice = addFormData.isRapid ? (selectedAddCategoryService?.rapidBasePrice || 0) : (selectedAddCategoryService?.basePrice || 0);
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
    if (!addFormData.scheduledDate) return;
    const datePart = addFormData.scheduledDate.split('T')[0];
    setAddFormData(prev => ({
      ...prev,
      scheduledDate: `${datePart}T${timeStr}`
    }));
  };

  const renderAddCleanerWarnings = () => {
    if (!isAddCleanersShort) return null;
    return (
      <div className="space-y-4 mt-3">
        <div className="border border-rose-100 bg-rose-50/40 p-5 rounded-2xl text-center text-rose-600 space-y-2">
          <AlertCircle className="mx-auto" size={24} />
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
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(orders, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-10 font-gilmer max-w-7xl mx-auto">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
            <ClipboardList size={14} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Order Control Center</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-800 uppercase italic">
            Client <span className="text-primary">Commands</span> Table
          </h1>
          <p className="text-sm text-slate-400 font-medium">
            Live orders from the backend. Status updates sync immediately to the database.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsJsonModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-wider text-slate-300 hover:text-white hover:bg-slate-950 transition-all shadow-sm cursor-pointer"
          >
            <Code size={14} /> View API JSON
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-wider shadow-[0_4px_15px_-3px_rgba(37,99,235,0.4)] hover:shadow-[0_8px_20px_-3px_rgba(37,99,235,0.5)] hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <Plus size={14} /> Add Command
          </button>
          <button
            onClick={fetchOrders}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-wider text-slate-500 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Error state ────────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-rose-50 border border-rose-100 rounded-3xl p-6 flex items-center gap-4">
          <AlertCircle size={20} className="text-rose-500 shrink-0" />
          <div>
            <p className="text-sm font-bold text-rose-700">{error}</p>
            <p className="text-xs text-rose-500 mt-1">Make sure the backend is running on port 5001.</p>
          </div>
          <button onClick={fetchOrders} className="ml-auto px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer hover:bg-rose-600 transition-all">
            Retry
          </button>
        </div>
      )}

      {/* ── Stats Dashboard ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Bookings</p>
          <p className="text-3xl font-black text-slate-800 mt-2">{orders.length}</p>
        </div>
        {(['PENDING', 'CALLED_NOT_PAID', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as ApiOrder['status'][]).map(s => (
          <div key={s} className={`border p-6 rounded-3xl shadow-sm flex flex-col justify-between ${STATUS_STYLES[s].replace('text-', 'border-').split('border-')[1] ? '' : ''} bg-white border-slate-100`}>
            <p className={`text-[9px] font-black uppercase tracking-widest ${STATUS_STYLES[s].split(' ')[1]}`}>
              {STATUS_LABELS[s]}
            </p>
            <p className={`text-3xl font-black mt-2 ${STATUS_STYLES[s].split(' ')[1]}`}>{countByStatus(s)}</p>
            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[s]} mt-2`} />
          </div>
        ))}
      </div>

      {/* ── Booking Type Tabs ────────────────────────────────────────────── */}
      <div className="flex border-b border-slate-100 gap-4">
        <button
          onClick={() => setBookingTypeFilter('all')}
          className={`pb-4 px-6 text-xs font-black uppercase tracking-wider transition-all border-b-2 relative cursor-pointer flex items-center gap-1.5 ${bookingTypeFilter === 'all'
            ? 'text-primary border-primary'
            : 'text-slate-400 border-transparent hover:text-slate-600'
            }`}
        >
          All Commands ({orders.length})
          {orders.filter(o => o.status === 'PENDING').length > 0 && (
            <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0">
              {orders.filter(o => o.status === 'PENDING').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setBookingTypeFilter('service')}
          className={`pb-4 px-6 text-xs font-black uppercase tracking-wider transition-all border-b-2 relative cursor-pointer flex items-center gap-1.5 ${bookingTypeFilter === 'service'
            ? 'text-primary border-primary'
            : 'text-slate-400 border-transparent hover:text-slate-600'
            }`}
        >
          Service Commands ({orders.filter(o => o.serviceId).length})
          {orders.filter(o => o.serviceId && o.status === 'PENDING').length > 0 && (
            <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0">
              {orders.filter(o => o.serviceId && o.status === 'PENDING').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setBookingTypeFilter('category')}
          className={`pb-4 px-6 text-xs font-black uppercase tracking-wider transition-all border-b-2 relative cursor-pointer flex items-center gap-1.5 ${bookingTypeFilter === 'category'
            ? 'text-primary border-primary'
            : 'text-slate-400 border-transparent hover:text-slate-600'
            }`}
        >
          Category Commands ({orders.filter(o => o.categoryId).length})
          {orders.filter(o => o.categoryId && o.status === 'PENDING').length > 0 && (
            <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0">
              {orders.filter(o => o.categoryId && o.status === 'PENDING').length}
            </span>
          )}
        </button>
      </div>

      {/* ── Search & Filter ────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative w-full md:max-w-sm group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search by name, email, CMD ID, service..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-sm font-bold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-primary/20 outline-none transition-all"
          />
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto shrink-0 justify-end">
          {([
            { id: 'all', label: 'All Orders' },
            { id: 'PENDING', label: 'En Attente' },
            { id: 'CALLED_NOT_PAID', label: 'Appelé (Non Payé)' },
            { id: 'CONFIRMED', label: 'Confirmé' },
            { id: 'IN_PROGRESS', label: 'In Progress' },
            { id: 'COMPLETED', label: 'Completed' },
            { id: 'CANCELLED', label: 'Cancelled' },
          ] as { id: FilterStatus; label: string }[]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border ${statusFilter === tab.id
                ? 'bg-primary text-white border-primary shadow-md shadow-primary/10'
                : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100 hover:text-slate-600'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="min-h-[30vh] flex items-center justify-center gap-4 flex-col">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 animate-pulse">Loading orders from API...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-100 rounded-[3rem] shadow-sm max-w-xl mx-auto space-y-6">
          <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center text-primary mx-auto">
            <ClipboardList size={36} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black uppercase tracking-tight text-slate-800">No Commands Found</h3>
            <p className="text-sm text-slate-400 font-semibold max-w-xs mx-auto">
              {searchQuery ? 'No orders match your search query.' : error ? 'Backend error — check connection.' : 'No orders yet in the system.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left min-w-[1100px]">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                  <th className="pb-4 pl-4">Command ID</th>
                  <th className="pb-4">Client</th>
                  <th className="pb-4">Contact</th>
                  <th className="pb-4">Location</th>
                  <th className="pb-4">Service</th>
                  <th className="pb-4">Scheduled</th>
                  <th className="pb-4">Total</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence mode="popLayout">
                  {filtered.map(order => {
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
                        className={`group transition-colors font-semibold border-l-4 ${isShort
                          ? 'bg-rose-50/40 hover:bg-rose-50/60 border-l-rose-500'
                          : 'hover:bg-slate-50/50 border-l-transparent'
                          }`}
                      >
                        {/* CMD ID */}
                        <td className="py-5 pl-4 font-mono text-[10px] text-slate-400 font-black uppercase tracking-wider">
                          {shortId(order.id)}
                        </td>

                        {/* Client */}
                        <td className="py-5">
                          <span className="text-sm font-bold uppercase tracking-tight text-slate-800 block">
                            {order.user?.fullName ?? '—'}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                            {order.user?.email ?? ''}
                          </span>
                        </td>

                        {/* Phone */}
                        <td className="py-5 text-xs text-slate-600 font-bold">
                          <span className="inline-flex items-center gap-1.5">
                            <Phone size={12} className="text-slate-400" />
                            {order.user?.phone ?? '—'}
                          </span>
                        </td>

                        {/* Location */}
                        <td className="py-5">
                          {order.latitude && order.longitude ? (
                            <button
                              onClick={() => handleOpenGoogleMaps(order.latitude, order.longitude)}
                              className="px-2.5 py-1.5 bg-rose-50/50 hover:bg-rose-50 text-rose-600 border border-rose-100/50 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95"
                            >
                              <MapPin size={11} className="fill-rose-100" />
                              View Map
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenGoogleMaps(null, null, order.address)}
                              className="text-[10px] text-slate-500 font-bold uppercase truncate max-w-[120px] block hover:text-primary hover:underline cursor-pointer text-left" title={order.address}
                            >
                              {order.address?.slice(0, 20) || '—'}
                            </button>
                          )}
                        </td>

                        {/* Service */}
                        <td className="py-5 max-w-[180px]">
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span className="text-xs font-bold text-primary block leading-none">
                              {order.service?.name || order.category?.name || '—'}
                            </span>
                            {order.isRapid && (
                              <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[8px] font-black uppercase rounded tracking-wider inline-flex items-center gap-0.5 animate-pulse">
                                ⚡ Rapide
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] text-slate-400 block mt-1 uppercase">
                            {order.houseConfig?.type?.toUpperCase() || order.categoryService?.name?.toUpperCase() || ''} • {order.productOrigin}
                          </span>
                          {((order.sizeM2 !== undefined && order.sizeM2 !== null) || (order.housePictures && order.housePictures.length > 0)) && (
                            <span className="text-[10px] text-slate-700 font-bold block mt-1">
                              {order.sizeM2 !== undefined && order.sizeM2 !== null ? `${order.sizeM2} m²` : ''}
                              {order.sizeM2 !== undefined && order.sizeM2 !== null && order.housePictures && order.housePictures.length > 0 ? ' • ' : ''}
                              {order.housePictures && order.housePictures.length > 0 ? `${order.housePictures.length} photo(s)` : ''}
                            </span>
                          )}
                          {order.clientNote && (
                            <span className="text-[10px] text-slate-500 italic block mt-0.5 max-w-[180px] truncate" title={order.clientNote}>
                              Note: {order.clientNote}
                            </span>
                          )}
                          {isShort && (
                            <span className="text-[10px] text-rose-500 font-bold block mt-1 uppercase tracking-wider animate-pulse">
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

                        {/* Scheduled */}
                        <td className="py-5">
                          <span className="text-xs text-slate-700 block font-bold">{formatDate(order.scheduledDate)}</span>
                          <span className="text-xs text-primary font-black block mt-0.5">{formatTime(order.scheduledDate)}</span>
                          <span className="text-[9px] text-slate-400 font-bold block mt-0.5">
                            {`${order.houseConfig?.durationHours ?? order.categoryService?.durationHours ?? order.service?.durationHours ?? 3}h clean`}
                          </span>
                        </td>

                        {/* Total */}
                        <td className="py-5 text-sm font-black text-emerald-500">
                          {order.totalPrice.toLocaleString('fr-DZ')} DA
                        </td>

                        {/* Status dropdown */}
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
                              disabled={updatingId === order.id}
                              className={`pl-3 pr-8 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest outline-none border cursor-pointer appearance-none disabled:opacity-60 ${STATUS_STYLES[order.status]}`}
                            >
                              {(Object.keys(STATUS_LABELS) as ApiOrder['status'][]).map(s => (
                                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                              ))}
                            </select>
                            <ChevronDown size={10} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-70" />
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-5 pr-4 text-right">
                          <div className="flex justify-end gap-2">
                            {order.status === 'CONFIRMED' && (
                              <button
                                onClick={() => {
                                  setOrderToConfirm(order);
                                  setSelectedCleanerIds(order.cleanerId ? order.cleanerId.split(',') : []);
                                  setIsAssignModalOpen(true);
                                }}
                                className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 text-slate-500 flex items-center justify-center border border-slate-100 transition-all cursor-pointer"
                                title="Modifier les cleaners"
                              >
                                <Users size={13} />
                              </button>
                            )}
                            <button
                              onClick={() => { setSelectedOrder(order); setIsDetailsModalOpen(true); }}
                              className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-primary/10 hover:text-primary text-slate-500 flex items-center justify-center border border-slate-100 transition-all cursor-pointer"
                              title="View details"
                            >
                              <Eye size={13} />
                            </button>
                            <button
                              onClick={() => router.push(`/admin/commands/${order.id}`)}
                              className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 text-slate-500 flex items-center justify-center border border-slate-100 transition-all cursor-pointer"
                              title="Edit order"
                            >
                              <Wrench size={13} />
                            </button>
                            <button
                              onClick={e => { e.stopPropagation(); setOrderToDelete(order); setIsDeleteModalOpen(true); }}
                              className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-400 border border-slate-100 flex items-center justify-center transition-all cursor-pointer"
                              title="Delete order"
                            >
                              <Trash2 size={13} />
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

      {/* ── Details Modal ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isDetailsModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsDetailsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-[620px] bg-white rounded-[3rem] shadow-2xl border border-slate-100 relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="h-2 bg-gradient-to-r from-primary via-primary to-emerald-500 shrink-0" />
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-100 transition-all cursor-pointer z-20"
              >
                <X size={18} />
              </button>

              <div className="flex-1 overflow-y-auto p-8 lg:p-10 space-y-8">
                {/* Header */}
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{shortId(selectedOrder.id)}</span>
                    <h2 className="text-2xl font-black uppercase italic tracking-tight text-slate-800">Clean Reservation</h2>
                    <p className="text-xs text-slate-400 font-semibold">Created {formatDate(selectedOrder.createdAt)}</p>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mt-1 inline-flex items-center gap-1.5 border ${STATUS_STYLES[selectedOrder.status]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[selectedOrder.status]}`} />
                    {STATUS_LABELS[selectedOrder.status]}
                  </span>
                </div>

                {/* Warning Banner */}
                {modalIsShort && (
                  <div className="bg-rose-50 border border-rose-100 rounded-3xl p-5 flex items-start gap-3">
                    <AlertCircle size={20} className="text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-rose-700">Conflit de Disponibilité</p>
                      <p className="text-xs text-rose-600 mt-1 font-semibold leading-relaxed">
                        Il n'y a pas assez de nettoyeurs disponibles pour ce créneau.
                        <strong> Veuillez appeler le client pour proposer un décalage d'horaire.</strong>
                      </p>
                    </div>
                  </div>
                )}

                {/* Client */}
                <div className="space-y-4 border border-slate-100 rounded-3xl p-6 bg-slate-50/50">
                  <h3 className="text-xs font-black uppercase text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                    <User size={12} /> Client Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="space-y-1">
                      <span className="text-slate-400 block text-[9px] font-black uppercase">Full Name</span>
                      <span className="text-slate-800 text-sm font-bold">{selectedOrder.user?.fullName ?? '—'}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 block text-[9px] font-black uppercase">Email</span>
                      <span className="text-slate-800 text-sm font-bold">{selectedOrder.user?.email ?? '—'}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 block text-[9px] font-black uppercase">Phone</span>
                      <span className="text-slate-800 text-sm font-bold flex items-center gap-1">
                        <Phone size={12} className="text-primary" />
                        {selectedOrder.user?.phone ?? '—'}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 block text-[9px] font-black uppercase">Scheduled Date</span>
                      <span className="text-slate-800 text-sm font-bold flex items-center gap-1.5">
                        <Calendar size={12} className="text-primary" />
                        {formatDate(selectedOrder.scheduledDate)}
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-slate-100 pt-4 space-y-2">
                    <span className="text-slate-400 block text-[9px] font-black uppercase">Address</span>
                    <p className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      <MapPin size={14} className="text-rose-500 fill-rose-100 shrink-0" />
                      {selectedOrder.address || '—'}
                    </p>
                    {selectedOrder.latitude && selectedOrder.longitude && (
                      <button
                        onClick={() => handleOpenGoogleMaps(selectedOrder.latitude, selectedOrder.longitude)}
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all"
                      >
                        <Navigation size={12} className="fill-white/10" />
                        Open Google Maps
                      </button>
                    )}
                  </div>
                </div>

                {/* Service / Order Details */}
                <div className="space-y-4 border border-slate-100 rounded-3xl p-6 bg-slate-50/50">
                  <h3 className="text-xs font-black uppercase text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                    <Wrench size={12} /> Service Details
                  </h3>
                  <div className="divide-y divide-slate-100 text-xs font-semibold">
                    {selectedOrder.serviceId ? (
                      [
                        ['Type', 'Service Booking'],
                        ['Service', selectedOrder.service?.name ?? '—'],
                        ['House Config', `${selectedOrder.houseConfig?.type?.toUpperCase() ?? '—'} (${selectedOrder.houseConfig?.workers ?? '?'} workers)`],
                        ['Extra Workers', selectedOrder.extraWorkers > 0 ? `+${selectedOrder.extraWorkers}` : 'None'],
                        ['Materials', selectedOrder.useMaterials ? 'Nadif materials included' : 'Client provides'],
                        ['Products', selectedOrder.productOrigin === 'NONE' ? 'Client own' : `Nadif ${selectedOrder.productOrigin.toLowerCase()}`],
                        ['Duration', `${selectedOrder.houseConfig?.durationHours ?? selectedOrder.service?.durationHours ?? '?'}h`],
                      ].map(([label, value]) => (
                        <div key={label} className="flex justify-between py-2">
                          <span className="text-slate-400">{label}:</span>
                          <span className="text-slate-800 font-bold">{value}</span>
                        </div>
                      ))
                    ) : (
                      [
                        ['Type', 'Category Booking'],
                        ['Category', selectedOrder.category?.name ?? '—'],
                        ['Category Config', `${selectedOrder.categoryService?.name ?? '—'} (${selectedOrder.categoryService?.workers ?? '?'} workers)`],
                        ['Materials', selectedOrder.useMaterials ? 'Nadif materials included' : 'Client provides'],
                        ['Products', selectedOrder.productOrigin === 'NONE' ? 'Client own' : `Nadif ${selectedOrder.productOrigin.toLowerCase()}`],
                        ['Duration', `${selectedOrder.categoryService?.durationHours ?? '?'}h`],
                      ].map(([label, value]) => (
                        <div key={label} className="flex justify-between py-2">
                          <span className="text-slate-400">{label}:</span>
                          <span className="text-slate-800 font-bold">{value}</span>
                        </div>
                      ))
                    )}
                    {selectedOrder.promo && (
                      <div className="flex justify-between py-2">
                        <span className="text-slate-400">Promo Code:</span>
                        <span className="text-emerald-600 font-bold">{selectedOrder.promo.code} (−{selectedOrder.promo.discountPercent}%)</span>
                      </div>
                    )}
                    {selectedOrder.cleanerId && (
                      <div className="flex justify-between py-2 items-center">
                        <span className="text-slate-400">Cleaners Assignés:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-800 font-bold">{getCleanerNames(selectedOrder.cleanerId)}</span>
                          <button
                            onClick={() => {
                              setOrderToConfirm(selectedOrder);
                              setSelectedCleanerIds(selectedOrder.cleanerId ? selectedOrder.cleanerId.split(',') : []);
                              setIsAssignModalOpen(true);
                            }}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer"
                          >
                            Modifier
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-t border-slate-200 pt-3">
                      <span className="text-slate-600 font-bold">Total Bill:</span>
                      <span className="text-emerald-500 font-black text-base">{selectedOrder.totalPrice.toLocaleString('fr-DZ')} DA</span>
                    </div>
                  </div>
                </div>

                {/* Property Details & Note */}
                {((selectedOrder.sizeM2 !== undefined && selectedOrder.sizeM2 !== null) || selectedOrder.clientNote || (selectedOrder.housePictures && selectedOrder.housePictures.length > 0)) && (
                  <div className="space-y-4 border border-slate-100 rounded-3xl p-6 bg-slate-50/50">
                    <h3 className="text-xs font-black uppercase text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                      <ClipboardList size={12} /> Property Details & Notes
                    </h3>
                    <div className="space-y-3 text-xs font-semibold">
                      {(selectedOrder.sizeM2 !== undefined && selectedOrder.sizeM2 !== null) && (
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-400">House Size:</span>
                          <span className="text-slate-800 font-bold">{selectedOrder.sizeM2} m²</span>
                        </div>
                      )}
                      {selectedOrder.clientNote && (
                        <div className="py-1">
                          <span className="text-slate-400 block mb-1">Client Note:</span>
                          <div className="bg-white border border-slate-150 rounded-xl p-3 text-slate-700 font-medium text-xs whitespace-pre-wrap">
                            {selectedOrder.clientNote}
                          </div>
                        </div>
                      )}
                      {selectedOrder.housePictures && selectedOrder.housePictures.length > 0 && (
                        <div className="py-1">
                          <span className="text-slate-400 block mb-2">House Pictures ({selectedOrder.housePictures.length}):</span>
                          <div className="grid grid-cols-3 gap-2">
                            {selectedOrder.housePictures.map((pic, idx) => (
                              <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group cursor-zoom-in">
                                <img
                                  src={imgUrl(pic)}
                                  alt={`House ${idx + 1}`}
                                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                  onClick={() => setLightboxImage(pic)}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Status actions */}
                <div className="space-y-4 border border-slate-100 rounded-3xl p-6 bg-slate-50/50">
                  <h3 className="text-xs font-black uppercase text-slate-800">Update Status</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(Object.keys(STATUS_LABELS) as ApiOrder['status'][]).map(s => (
                      <button
                        key={s}
                        onClick={() => {
                          if (s === 'CONFIRMED') {
                            setOrderToConfirm(selectedOrder);
                            setSelectedCleanerIds(selectedOrder.cleanerId ? selectedOrder.cleanerId.split(',') : []);
                            setIsAssignModalOpen(true);
                          } else {
                            handleUpdateStatus(selectedOrder.id, s);
                          }
                        }}
                        disabled={updatingId === selectedOrder.id}
                        className={`py-3 px-2 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 disabled:opacity-50 ${selectedOrder.status === s
                          ? `${STATUS_STYLES[s]} shadow-md`
                          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                          }`}
                      >
                        {s === 'PENDING' && <Clock3 size={14} />}
                        {s === 'CONFIRMED' && <Sparkles size={14} />}
                        {s === 'IN_PROGRESS' && <Wrench size={14} />}
                        {s === 'COMPLETED' && <CheckCircle size={14} />}
                        {s === 'CANCELLED' && <XCircle size={14} />}
                        {STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-slate-100 bg-slate-50 shrink-0">
                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                >
                  Close Command File
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Delete Confirm Modal ──────────────────────────────────────────── */}
      <AnimatePresence>
        {isDeleteModalOpen && orderToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setIsDeleteModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 relative z-10 space-y-8 text-center"
            >
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto">
                <Trash2 size={32} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black uppercase tracking-tight text-slate-800">Delete Order?</h2>
                <p className="text-sm text-slate-400 font-medium">
                  This will permanently remove order <span className="font-black text-slate-600">{shortId(orderToDelete.id)}</span> from{' '}
                  <span className="font-bold text-slate-600">{orderToDelete.user?.fullName ?? 'the client'}</span>.
                  This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isDeleting}
                  className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black uppercase tracking-wider text-[10px] transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="flex-1 py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-black uppercase tracking-wider text-[10px] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} />
                      Confirm Delete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Assign Cleaner Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {isAssignModalOpen && orderToConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsAssignModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-[500px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500 shrink-0" />
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-100 transition-all cursor-pointer z-20"
              >
                <X size={18} />
              </button>

              <div className="p-8 space-y-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    {orderToConfirm.status === 'CONFIRMED' ? 'Modification de Commande' : 'Confirmation de Commande'}
                  </span>
                  <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                    {orderToConfirm.status === 'CONFIRMED' ? 'Modifier les Cleaners' : 'Assigner un Cleaner'}
                  </h2>
                  <p className="text-xs text-slate-400 font-bold">
                    Sélectionnez un agent disponible pour le {formatDate(orderToConfirm.scheduledDate)} à {formatTime(orderToConfirm.scheduledDate)}.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">
                      Cleaners Disponibles
                    </label>
                    <span className="text-[10px] font-black text-primary uppercase tracking-wider">
                      {selectedCleanerIds.length} / {getRequiredCleanersCount(orderToConfirm)} Sélectionné(s)
                    </span>
                  </div>

                  {(() => {
                    const requiredCount = getRequiredCleanersCount(orderToConfirm);
                    const availableCleaners = getAvailableCleaners(orderToConfirm);

                    if (availableCleaners.length < requiredCount) {
                      return (
                        <div className="space-y-4">
                          <div className="border border-rose-100 bg-rose-50/40 p-5 rounded-2xl text-center text-rose-600 space-y-2">
                            <AlertCircle className="mx-auto" size={24} />
                            <p className="text-xs font-black uppercase tracking-wider">Créneau Impossible (Pas assez d'agents)</p>
                            <p className="text-[10px] font-bold text-rose-500">
                              Requis: {requiredCount} cleaner(s) • Disponibles: {availableCleaners.length} à {new Date(orderToConfirm.scheduledDate).toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit' })}.
                            </p>
                          </div>

                          {/* Alternative suggestions */}
                          <div className="space-y-2 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">
                              Créneaux alternatifs disponibles ce jour ({requiredCount} agents requis) :
                            </h4>
                            {getAvailableSlots(orderToConfirm, requiredCount).length === 0 ? (
                              <p className="text-[10px] font-bold text-slate-400 pl-1">
                                Aucun autre créneau disponible sur cette journée avec {requiredCount} agents libres.
                              </p>
                            ) : (
                              <div className="flex flex-wrap gap-2 pt-1.5">
                                {getAvailableSlots(orderToConfirm, requiredCount).map(timeStr => (
                                  <button
                                    key={timeStr}
                                    type="button"
                                    onClick={() => handleSelectSlot(orderToConfirm, timeStr)}
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

                    // Sort cleaners with matching skills to the top
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

                    return (
                      <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                        {sortedCleaners.map(cleaner => {
                          const isSelected = selectedCleanerIds.includes(cleaner.id);
                          const hasMatchingSkill = getHasMatching(cleaner);

                          return (
                            <button
                              key={cleaner.id}
                              type="button"
                              onClick={() => {
                                const isSel = selectedCleanerIds.includes(cleaner.id);
                                const reqCount = getRequiredCleanersCount(orderToConfirm);
                                if (isSel) {
                                  setSelectedCleanerIds(prev => prev.filter(id => id !== cleaner.id));
                                } else {
                                  if (reqCount === 1) {
                                    setSelectedCleanerIds([cleaner.id]);
                                  } else if (selectedCleanerIds.length < reqCount) {
                                    setSelectedCleanerIds(prev => [...prev, cleaner.id]);
                                  } else {
                                    alert(`Vous ne pouvez pas sélectionner plus de ${reqCount} cleaner(s).`);
                                  }
                                }
                              }}
                              className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1.5 ${isSelected
                                ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                                : 'bg-slate-50/60 border-slate-100 hover:border-slate-200 text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className="text-xs font-black uppercase tracking-tight">
                                  {cleaner.fullName}
                                </span>
                                {hasMatchingSkill && (
                                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                                    }`}>
                                    Compétence Validée
                                  </span>
                                )}
                              </div>
                              <div className={`text-[9px] font-bold leading-relaxed ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                                Tél: {cleaner.phone} • {cleaner.skills.length > 0 ? `Skills: ${cleaner.skills.join(', ')}` : 'Aucun skill spécifié'}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

                <div className="pt-4 border-t border-slate-100 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAssignModalOpen(false)}
                    className="flex-1 py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl font-bold uppercase tracking-wider text-[10px] transition-all cursor-pointer border border-slate-100"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    disabled={selectedCleanerIds.length !== getRequiredCleanersCount(orderToConfirm) || updatingId === orderToConfirm.id}
                    onClick={handleConfirmAndAssign}
                    className="flex-1 py-3.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-xl font-black uppercase tracking-wider text-[10px] transition-all cursor-pointer shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                  >
                    {updatingId === orderToConfirm.id ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      orderToConfirm.status === 'CONFIRMED' ? 'Enregistrer les modifications' : 'Confirmer & Assigner'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Add Command Modal ──────────────────────────────────────────── */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl relative z-10 max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    <Plus size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-tight text-slate-800">Add Command (Manual)</h2>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Guest Customer Creation</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-white">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Side: Form */}
                  <form id="add-command-form" onSubmit={handleAddSubmit} className="lg:col-span-7 space-y-8">

                    {/* Customer Profile */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Customer Profile</h4>
                      <div className="space-y-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                          <input
                            type="text"
                            value={addFormData.fullName}
                            onChange={e => setAddFormData(prev => ({ ...prev, fullName: e.target.value }))}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            placeholder="e.g. John Doe (Optional)"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Phone Number</label>
                          <input
                            type="tel"
                            required
                            value={addFormData.phone}
                            onChange={e => setAddFormData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            placeholder="e.g. 0555123456"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Command Booking Type Switcher */}
                    <div className="space-y-4 pt-6 border-t border-slate-100">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Booking Type</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setAddFormType('service');
                            setAddFormData(prev => ({ ...prev, categoryId: null, categoryServiceId: null }));
                          }}
                          className={`py-3 text-[10px] font-black uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${addFormType === 'service' ? 'bg-primary text-white border-primary shadow' : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100 hover:text-slate-600'
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
                          className={`py-3 text-[10px] font-black uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${addFormType === 'category' ? 'bg-primary text-white border-primary shadow' : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100 hover:text-slate-600'
                            }`}
                        >
                          Category Layout
                        </button>
                      </div>
                    </div>

                    {/* Speed Priority Toggle */}
                    <div className="space-y-4 pt-6 border-t border-slate-100">
                      <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl">
                        <div>
                          <p className="text-xs font-black uppercase tracking-tight text-amber-600 flex items-center gap-1">
                            ⚡ Service Rapide
                          </p>
                          <p className="text-[10px] font-bold text-slate-500 mt-0.5">
                            Appliquer le tarif rapide (Urgence / Réservation le jour même)
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAddFormData(prev => ({ ...prev, isRapid: !prev.isRapid }))}
                          className={`w-12 h-7 rounded-full transition-colors cursor-pointer relative p-1 ${
                            addFormData.isRapid ? 'bg-amber-500' : 'bg-slate-300'
                          }`}
                        >
                          <motion.div 
                            layout
                            className="w-5 h-5 bg-white rounded-full shadow-sm"
                            animate={{ x: addFormData.isRapid ? 20 : 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Service Package */}
                    {addFormType === 'service' ? (
                      <div className="space-y-4 pt-6 border-t border-slate-100">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Service Package Details</h4>
                        <div className="space-y-2">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Service Type</label>
                            <select
                              required
                              value={addFormData.serviceId || ''}
                              onChange={e => setAddFormData(prev => ({ ...prev, serviceId: e.target.value, houseConfigId: '' }))}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            >
                              <option value="">Select Service...</option>
                              {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">House Layout</label>
                            <select
                              required
                              value={addFormData.houseConfigId || ''}
                              onChange={e => setAddFormData(prev => ({ ...prev, houseConfigId: e.target.value }))}
                              disabled={!selectedAddService}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
                            >
                              <option value="">Select Layout...</option>
                              {selectedAddService?.houseConfigs.map((hc: any) => (
                                <option key={hc.id} value={hc.id}>{hc.type} - {hc.basePrice} DA</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Scheduled Date</label>
                            <input
                              type="datetime-local"
                              required
                              value={addFormData.scheduledDate}
                              onChange={e => setAddFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                              className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-1 ${isDateLocked(addFormData.scheduledDate) || isAddCleanersShort
                                ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500 bg-rose-50/10'
                                : 'border-slate-200 focus:border-primary focus:ring-primary'
                                }`}
                            />
                            {isDateLocked(addFormData.scheduledDate) && (
                              <p className="text-[10px] text-rose-500 font-bold mt-1">
                                ⚠️ Cette date est verrouillée par l'administrateur. Veuillez choisir un autre jour.
                              </p>
                            )}
                            {renderAddCleanerWarnings()}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 pt-6 border-t border-slate-100">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Category Layout Details</h4>
                        <div className="space-y-2">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Category</label>
                            <select
                              required
                              value={addFormData.categoryId || ''}
                              onChange={e => setAddFormData(prev => ({ ...prev, categoryId: e.target.value, categoryServiceId: '' }))}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            >
                              <option value="">Select Category...</option>
                              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Category Service Layout</label>
                            <select
                              required
                              value={addFormData.categoryServiceId || ''}
                              onChange={e => setAddFormData(prev => ({ ...prev, categoryServiceId: e.target.value }))}
                              disabled={!selectedAddCategory}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
                            >
                              <option value="">Select Layout...</option>
                              {selectedAddCategory?.categoryServices.map((cs: any) => (
                                <option key={cs.id} value={cs.id}>{cs.name} - {cs.basePrice} DA</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Scheduled Date</label>
                            <input
                              type="datetime-local"
                              required
                              value={addFormData.scheduledDate}
                              onChange={e => setAddFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                              className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-1 ${isDateLocked(addFormData.scheduledDate) || isAddCleanersShort
                                ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500 bg-rose-50/10'
                                : 'border-slate-200 focus:border-primary focus:ring-primary'
                                }`}
                            />
                            {isDateLocked(addFormData.scheduledDate) && (
                              <p className="text-[10px] text-rose-500 font-bold mt-1">
                                ⚠️ Cette date est verrouillée par l'administrateur. Veuillez choisir un autre jour.
                              </p>
                            )}
                            {renderAddCleanerWarnings()}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Customization */}
                    <div className="space-y-4 pt-6 border-t border-slate-100">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Service Configuration</h4>
                      <div className="space-y-4">
                        {addFormType === 'service' && (
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Extra Workers</label>
                            <div className="flex items-center gap-3 w-full bg-slate-50 border border-slate-200 rounded-xl p-1">
                              <button type="button" onClick={() => setAddFormData(prev => ({ ...prev, extraWorkers: Math.max(0, prev.extraWorkers - 1) }))} className="flex-1 h-10 rounded-lg bg-white shadow-sm border border-slate-100 flex items-center justify-center font-bold cursor-pointer text-slate-500 hover:text-slate-800 transition-colors">-</button>
                              <div className="flex-1 text-center font-black text-lg text-primary">{addFormData.extraWorkers}</div>
                              <button type="button" onClick={() => setAddFormData(prev => ({ ...prev, extraWorkers: prev.extraWorkers + 1 }))} className="flex-1 h-10 rounded-lg bg-white shadow-sm border border-slate-100 flex items-center justify-center font-bold cursor-pointer text-slate-500 hover:text-slate-800 transition-colors">+</button>
                            </div>
                          </div>
                        )}

                        {/* Materials */}
                        <div className={`p-4 rounded-xl border flex flex-col justify-between ${(addFormType === 'service' ? selectedAddService?.materialsMandatory : selectedAddCategory?.materialsMandatory)
                          ? 'border-primary/30 bg-primary/5 text-slate-800'
                          : 'border-slate-200 bg-slate-50 text-slate-800'
                          }`}>
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider">NADIF MATERIALS</p>
                              <p className="text-xs font-bold mt-1">Use our clean equipment</p>
                              {addFormType === 'service' && selectedAddService && <p className="text-[9px] font-bold text-primary mt-0.5">+{selectedAddService.materialPrice} DA</p>}
                              {addFormType === 'category' && selectedAddCategory && <p className="text-[9px] font-bold text-primary mt-0.5">+{selectedAddCategory.materialPrice} DA</p>}
                            </div>
                            {(addFormType === 'service' ? selectedAddService?.materialsMandatory : selectedAddCategory?.materialsMandatory) ? (
                              <div className="flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                                <Lock size={8} /> Forced
                              </div>
                            ) : (
                              <button
                                type="button"
                                disabled={addFormType === 'service' ? !selectedAddService : !selectedAddCategory}
                                onClick={() => setAddFormData(prev => ({ ...prev, useMaterials: !prev.useMaterials }))}
                                className={`w-10 h-6 rounded-full p-0.5 transition-colors cursor-pointer shadow-inner disabled:opacity-50 ${addFormData.useMaterials ? 'bg-primary' : 'bg-slate-300'}`}
                              >
                                <div className={`w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${addFormData.useMaterials ? 'translate-x-4' : 'translate-x-0'}`} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Products */}
                        <div className={`p-4 rounded-xl border flex flex-col justify-between ${(addFormType === 'service' ? selectedAddService?.productsMandatory : selectedAddCategory?.productsMandatory)
                          ? 'border-primary/30 bg-primary/5 text-slate-800'
                          : 'border-slate-200 bg-slate-50 text-slate-800'
                          }`}>
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider">NADIF PRODUCTS</p>
                              <p className="text-xs font-bold mt-1 font-inter">Chemical Products Source</p>
                            </div>
                            {(addFormType === 'service' ? selectedAddService?.productsMandatory : selectedAddCategory?.productsMandatory) && (
                              <div className="flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                                <Lock size={8} /> Forced
                              </div>
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-1 mt-3">
                            {!(addFormType === 'service' ? selectedAddService?.productsMandatory : selectedAddCategory?.productsMandatory) && (
                              <button
                                type="button"
                                disabled={addFormType === 'service' ? !selectedAddService : !selectedAddCategory}
                                onClick={() => setAddFormData(prev => ({ ...prev, productOrigin: 'NONE' }))}
                                className={`py-2 text-[8px] font-black uppercase tracking-wider rounded-lg border transition-all cursor-pointer disabled:opacity-50 ${addFormData.productOrigin === 'NONE' ? 'bg-primary text-white border-primary shadow' : 'bg-white text-slate-500 border-slate-200 hover:text-slate-800'
                                  }`}
                              >
                                <span className="block">Own</span>
                                <span className="block text-[7px] font-bold opacity-70 mt-0.5">(0 DA)</span>
                              </button>
                            )}
                            <button
                              type="button"
                              disabled={addFormType === 'service' ? !selectedAddService : !selectedAddCategory}
                              onClick={() => setAddFormData(prev => ({ ...prev, productOrigin: 'LOCAL' }))}
                              className={`py-2 text-[8px] font-black uppercase tracking-wider rounded-lg border transition-all cursor-pointer disabled:opacity-50 ${(addFormType === 'service' ? selectedAddService?.productsMandatory : selectedAddCategory?.productsMandatory) ? 'col-span-1.5' : ''
                                } ${(addFormData.productOrigin === 'LOCAL' || ((addFormType === 'service' ? selectedAddService?.productsMandatory : selectedAddCategory?.productsMandatory) && addFormData.productOrigin === 'NONE'))
                                  ? 'bg-primary text-white border-primary shadow' : 'bg-white text-slate-500 border-slate-200 hover:text-slate-800'
                                }`}
                            >
                              <span className="block">Local</span>
                              {addFormType === 'service' && selectedAddService && <span className="block text-[7px] font-bold opacity-70 mt-0.5">(+{selectedAddService.localProductPrice} DA)</span>}
                              {addFormType === 'category' && selectedAddCategory && <span className="block text-[7px] font-bold opacity-70 mt-0.5">(+{selectedAddCategory.localProductPrice} DA)</span>}
                            </button>
                            <button
                              type="button"
                              disabled={addFormType === 'service' ? !selectedAddService : !selectedAddCategory}
                              onClick={() => setAddFormData(prev => ({ ...prev, productOrigin: 'IMPORTED' }))}
                              className={`py-2 text-[8px] font-black uppercase tracking-wider rounded-lg border transition-all cursor-pointer disabled:opacity-50 ${(addFormType === 'service' ? selectedAddService?.productsMandatory : selectedAddCategory?.productsMandatory) ? 'col-span-1.5' : ''
                                } ${addFormData.productOrigin === 'IMPORTED' ? 'bg-primary text-white border-primary shadow' : 'bg-white text-slate-500 border-slate-200 hover:text-slate-800'
                                }`}
                            >
                              <span className="block">Imported</span>
                              {addFormType === 'service' && selectedAddService && <span className="block text-[7px] font-bold opacity-70 mt-0.5">(+{selectedAddService.importedProductPrice} DA)</span>}
                              {addFormType === 'category' && selectedAddCategory && <span className="block text-[7px] font-bold opacity-70 mt-0.5">(+{selectedAddCategory.importedProductPrice} DA)</span>}
                            </button>
                          </div>
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
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
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
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary min-h-[80px]"
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
                              className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
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

                    {/* Location */}
                    <div className="space-y-4 pt-6 border-t border-slate-100">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Location</h4>
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Address</label>
                          <input
                            type="text"
                            required
                            value={addFormData.address}
                            onChange={e => setAddFormData(prev => ({ ...prev, address: e.target.value }))}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            placeholder="Full Address"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Map Location</label>
                          <LocationPicker
                            latitude={addFormData.latitude}
                            longitude={addFormData.longitude}
                            onChange={(lat, lng) => setAddFormData(prev => ({ ...prev, latitude: lat, longitude: lng }))}
                          />
                        </div>
                      </div>
                    </div>
                  </form>

                  {/* Right Side: Bill & Actions */}
                  <div className="lg:col-span-5">
                    <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 lg:p-8 flex flex-col justify-between shadow-sm sticky top-0">
                      <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 border-b border-slate-200 pb-3">
                          Bill Calculations
                        </h4>

                        <div className="space-y-3 font-semibold text-xs text-slate-600">
                          {addFormType === 'service' ? (
                            <>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Layout Base Rate ({selectedAddService?.houseConfigs.find((hc: any) => hc.id === addFormData.houseConfigId)?.type.toUpperCase() || '-'}):</span>
                                <span className="text-slate-800">{addBasePrice} DA</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Default Labor:</span>
                                <span className="text-slate-800">{selectedAddService?.houseConfigs.find((hc: any) => hc.id === addFormData.houseConfigId)?.workers || 0} Workers</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Extra Labor Added:</span>
                                <span className="text-primary">+{addFormData.extraWorkers || 0} Worker(s)</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Extra Labor Price:</span>
                                <span className="text-slate-800">{addExtraWorkerPriceTotal} DA</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Category Layout Base Rate ({selectedAddCategoryService?.name || '-'}):</span>
                                <span className="text-slate-800">{addBasePrice} DA</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Labor:</span>
                                <span className="text-slate-800">{selectedAddCategoryService?.workers || 0} Workers</span>
                              </div>
                            </>
                          )}
                          <div className="flex justify-between border-t border-slate-200 pt-2">
                            <span className="text-slate-500">Nadif Materials:</span>
                            <span className={addUseMaterials ? 'text-primary' : 'text-slate-400'}>
                              {addUseMaterials ? `+${addMaterialsPrice} DA` : 'Excluded'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Nadif Products:</span>
                            <span className={addProductsPrice > 0 ? 'text-primary' : 'text-slate-400'}>
                              {addProductsPrice > 0 ? `+${addProductsPrice} DA` : 'Excluded'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6 mt-8">
                        <div className="border-t border-slate-200 pt-4 flex items-end justify-between">
                          <div>
                            <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Final Total</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-4xl font-black text-emerald-500">{addFinalTotal}</span>
                              <span className="text-sm font-black text-emerald-500 uppercase">DA</span>
                            </div>
                          </div>
                        </div>

                        <button
                          form="add-command-form"
                          type="submit"
                          disabled={isDateLocked(addFormData.scheduledDate) || isAddCleanersShort}
                          className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus size={16} /> Create Order
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAddModalOpen(false)}
                          className="w-full py-3 bg-transparent text-slate-500 hover:text-slate-800 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-colors cursor-pointer"
                        >
                          Cancel
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

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxImage(null)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-4xl max-h-[85vh] z-10 overflow-hidden rounded-2xl border border-white/10"
            >
              <button
                onClick={() => setLightboxImage(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center text-white border border-white/10 transition-all cursor-pointer z-20"
              >
                <X size={18} />
              </button>
              <img src={imgUrl(lightboxImage)} alt="House Pic Fullsize" className="max-w-full max-h-[85vh] object-contain" />
            </motion.div>
          </div>
        )}
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
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Commands API</span>
                  </div>
                  <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">
                    Orders JSON
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
                  className="px-6 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-wider text-[10px] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
                >
                  {copied ? <><Check size={14} strokeWidth={3} /> Copied! </> : <><Copy size={14} /> Copy JSON API</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
