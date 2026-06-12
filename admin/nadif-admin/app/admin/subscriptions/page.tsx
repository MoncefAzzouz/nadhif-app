'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

const LocationPicker = dynamic(() => import('../../components/LocationPicker'), {
  ssr: false,
  loading: () => <div className="h-[250px] w-full bg-slate-50 rounded-2xl animate-pulse border border-slate-100 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Map Core...</div>
});
import {
  CalendarCheck,
  CalendarDays,
  Layers,
  ShoppingBag,
  Users,
  Trash2,
  Eye,
  CheckCircle,
  Plus,
  Search,
  Sparkles,
  Clock,
  DollarSign,
  CreditCard,
  AlertCircle,
  X,
  ChevronDown,
  RefreshCw,
  Edit,
  Settings,
  Calendar,
  MapPin,
  Phone,
  Info,
  Code,
  Copy,
  Check,
  UploadCloud
} from 'lucide-react';
import {
  subscriptionsApi,
  propertyTypesApi,
  serviceTiersApi,
  cleanersApi,
  skillsApi,
  ordersApi,
  type ApiSubscription,
  type ApiSubscriptionPropertyType,
  type ApiSubscriptionServiceTier,
  type ApiSubscriptionSession,
  type ApiSubscriptionPayment,
  type ApiCleaner,
  type ApiSkill,
  type ApiOrder
} from '../../lib/api';
import { uploadImage, imgUrl } from '../../lib/api';

const STATUS_LABELS: Record<ApiSubscription['status'], string> = {
  PENDING: 'En Attente',
  DAYS_PROPOSED: 'Appelé (Non Payé)',
  CONFIRMED: 'Confirmé',
  ACTIVE: 'Actif',
  COMPLETED: 'Terminé',
  CANCELLED: 'Annulé',
};

const STATUS_STYLES: Record<ApiSubscription['status'], string> = {
  PENDING: 'bg-amber-50 text-amber-600 border-amber-100',
  DAYS_PROPOSED: 'bg-cyan-50 text-cyan-600 border-cyan-100',
  CONFIRMED: 'bg-blue-50 text-blue-600 border-blue-100',
  ACTIVE: 'bg-violet-50 text-violet-600 border-violet-100',
  COMPLETED: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  CANCELLED: 'bg-rose-50 text-rose-600 border-rose-100',
};

const STATUS_DOT: Record<ApiSubscription['status'], string> = {
  PENDING: 'bg-amber-500 animate-pulse',
  DAYS_PROPOSED: 'bg-cyan-500 animate-pulse',
  CONFIRMED: 'bg-blue-500',
  ACTIVE: 'bg-violet-500',
  COMPLETED: 'bg-emerald-500',
  CANCELLED: 'bg-rose-500',
};

export default function SubscriptionsPage() {
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'propertyTypes' | 'serviceTiers'>('subscriptions');

  // Core data
  const [subscriptions, setSubscriptions] = useState<ApiSubscription[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<ApiSubscriptionPropertyType[]>([]);
  const [serviceTiers, setServiceTiers] = useState<ApiSubscriptionServiceTier[]>([]);
  const [cleaners, setCleaners] = useState<ApiCleaner[]>([]);
  const [skills, setSkills] = useState<ApiSkill[]>([]);
  const [allOrders, setAllOrders] = useState<ApiOrder[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals state
  const [selectedSub, setSelectedSub] = useState<ApiSubscription | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [subToDelete, setSubToDelete] = useState<ApiSubscription | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Available days modal state
  const [isDaysModalOpen, setIsDaysModalOpen] = useState(false);
  const [availableDaysData, setAvailableDaysData] = useState<any>(null);
  const [selectedDates, setSelectedDates] = useState<string[]>([]); // Array of ISO Date Strings (YYYY-MM-DD)
  const [isDaysLoading, setIsDaysLoading] = useState(false);

  // Sessions schedule modal state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleSessions, setScheduleSessions] = useState<{
    dateStr: string;
    dayName: string;
    time: string; // e.g. "08:00"
    cleanerId: string;
  }[]>([]);
  const [activeSessionPopover, setActiveSessionPopover] = useState<string | null>(null);

  // Payment modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [isPaymentSaving, setIsPaymentSaving] = useState(false);

  // Property type and service tier form modal state
  const [isPropTypeModalOpen, setIsPropTypeModalOpen] = useState(false);
  const [editingPropType, setEditingPropType] = useState<ApiSubscriptionPropertyType | null>(null);
  const [propTypeForm, setPropTypeForm] = useState({ name: '', nameAr: '', nameFr: '', picture: '', isActive: true });
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isServiceTierModalOpen, setIsServiceTierModalOpen] = useState(false);
  const [editingServiceTier, setEditingServiceTier] = useState<ApiSubscriptionServiceTier | null>(null);
  const [serviceTierForm, setServiceTierForm] = useState({
    name: '', nameAr: '', nameFr: '', description: '', durationHours: 3, workers: 1, isActive: true
  });

  // JSON viewer & creation modal states
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    fullName: '',
    phone: '',
    propertyTypeId: '',
    surfaceM2: '',
    roomsToClean: '',
    address: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    serviceTierId: '',
    daysPerWeek: 2,
    adminNote: '',
    pictures: [] as string[]
  });

  // Fetch all required data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [subsData, propsData, tiersData, cleanersData, skillsData, ordersData] = await Promise.all([
        subscriptionsApi.getAll(),
        propertyTypesApi.getAll().catch(() => []),
        serviceTiersApi.getAll().catch(() => []),
        cleanersApi.getAll().catch(() => []),
        skillsApi.getAll().catch(() => []),
        ordersApi.getAll().catch(() => [])
      ]);
      setSubscriptions(subsData);
      setPropertyTypes(propsData);
      setServiceTiers(tiersData);
      setCleaners(cleanersData);
      setSkills(skillsData);
      setAllOrders(ordersData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle status update
  const handleUpdateStatus = async (id: string, newStatus: ApiSubscription['status']) => {
    try {
      const updated = await subscriptionsApi.update(id, { status: newStatus });
      setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
      if (selectedSub?.id === id) {
        setSelectedSub(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  // Handle price update
  const handleUpdatePrice = async (id: string, price: number) => {
    try {
      const updated = await subscriptionsApi.update(id, { monthlyPrice: price });
      setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
      if (selectedSub?.id === id) {
        setSelectedSub(prev => prev ? { ...prev, monthlyPrice: price } : null);
      }
    } catch (err: any) {
      alert(`Failed to update price: ${err.message}`);
    }
  };

  // Handle notes update
  const handleUpdateNotes = async (id: string, note: string) => {
    try {
      const updated = await subscriptionsApi.update(id, { adminNote: note });
      setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
      if (selectedSub?.id === id) {
        setSelectedSub(prev => prev ? { ...prev, adminNote: note } : null);
      }
    } catch (err: any) {
      alert(`Failed to update admin notes: ${err.message}`);
    }
  };

  // Open Available Days Modal
  const handleOpenDaysModal = async (sub: ApiSubscription) => {
    setSelectedSub(sub);
    setIsDaysLoading(true);
    setIsDaysModalOpen(true);
    setAvailableDaysData(null);
    setSelectedDates([]);
    try {
      const res = await subscriptionsApi.getAvailableDays(sub.id);
      setAvailableDaysData(res);
      // Pre-select already scheduled dates if sessions exist
      if (sub.sessions && sub.sessions.length > 0) {
        const dates = sub.sessions
          .filter(s => s.status !== 'CANCELLED')
          .map(s => s.scheduledDate.substring(0, 10));
        setSelectedDates(Array.from(new Set(dates)));
      }
    } catch (err: any) {
      alert(`Failed to load availability: ${err.message}`);
      setIsDaysModalOpen(false);
    } finally {
      setIsDaysLoading(false);
    }
  };

  // Select/Deselect Date in Calendar
  const handleToggleDate = (dateStr: string, isAvailable: boolean) => {
    if (!isAvailable || !selectedSub || !availableDaysData) return;

    // Find the week this date belongs to
    const weekObj = availableDaysData.weeks?.find((w: any) => w.days.some((d: any) => d.date === dateStr));
    if (!weekObj) return;

    const isCurrentlySelected = selectedDates.includes(dateStr);

    if (isCurrentlySelected) {
      // Always allow deselecting
      setSelectedDates(prev => prev.filter(d => d !== dateStr));
    } else {
      // Check if we already selected max allowed for this week
      const selectedInWeek = selectedDates.filter(dStr => weekObj.days.some((d: any) => d.date === dStr));
      if (selectedInWeek.length >= selectedSub.daysPerWeek) {
        alert(`Vous devez sélectionner exactement ${selectedSub.daysPerWeek} jours pour la semaine ${weekObj.week}. Désélectionnez d'abord un jour de cette semaine si vous souhaitez le modifier.`);
        return;
      }
      setSelectedDates(prev => [...prev, dateStr]);
    }
  };

  // Open scheduling modal with selected dates
  const handleProceedToScheduling = () => {
    if (!selectedSub || !availableDaysData) return;

    // Check if each week has exactly daysPerWeek selected
    for (const weekObj of availableDaysData.weeks) {
      const selectedInWeek = selectedDates.filter(dStr => weekObj.days.some((d: any) => d.date === dStr));
      if (selectedInWeek.length !== selectedSub.daysPerWeek) {
        alert(`Erreur: Vous devez sélectionner exactement ${selectedSub.daysPerWeek} jours pour la semaine ${weekObj.week}. Actuellement: ${selectedInWeek.length} sélectionné(s).`);
        return;
      }
    }

    // Build default sessions list
    const sessions = selectedDates.map(dateStr => {
      // Find matching session if already exists
      const existing = selectedSub.sessions?.find(s => s.scheduledDate.startsWith(dateStr));
      const dayName = new Date(dateStr).toLocaleDateString('fr-FR', { weekday: 'long' });

      // Default time is existing scheduled hour or "09:00"
      let time = "09:00";
      if (existing) {
        const dateObj = new Date(existing.scheduledDate);
        const hours = String(dateObj.getHours()).padStart(2, '0');
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        time = `${hours}:${minutes}`;
      }

      return {
        dateStr,
        dayName,
        time,
        cleanerId: existing?.cleanerId || '',
      };
    });

    // Sort by date chronological
    sessions.sort((a, b) => a.dateStr.localeCompare(b.dateStr));

    setScheduleSessions(sessions);
    setIsDaysModalOpen(false);
    setIsScheduleModalOpen(true);
  };

  // Check if a specific cleaner is busy at a date, time, and duration
  const isCleanerBusy = (cleanerId: string, dateStr: string, timeStr: string, durationHours: number, idx?: number) => {
    const startObj = new Date(`${dateStr}T${timeStr}:00`);
    const start = startObj.getTime();
    const end = start + durationHours * 60 * 60 * 1000;

    // 1. Check orders
    let busyByOrder = false;
    allOrders.forEach(order => {
      if (busyByOrder || !order.cleanerId || order.status === 'CANCELLED') return;
      const orderStart = new Date(order.scheduledDate).getTime();
      const orderDuration = order.houseConfig?.durationHours ?? order.categoryService?.durationHours ?? order.service?.durationHours ?? 3;
      const orderEnd = orderStart + orderDuration * 60 * 60 * 1000;

      if (start < orderEnd && orderStart < end) {
        const ids = order.cleanerId.split(',').map(id => id.trim());
        if (ids.includes(cleanerId)) {
          busyByOrder = true;
        }
      }
    });
    if (busyByOrder) return true;

    // 2. Check other subscription sessions
    let busyBySession = false;
    subscriptions.forEach(sub => {
      sub.sessions?.forEach(session => {
        if (busyBySession || !session.cleanerId || session.status === 'CANCELLED') return;
        if (selectedSub && sub.id === selectedSub.id) return;

        const sessionStart = new Date(session.scheduledDate).getTime();
        const sessionEnd = sessionStart + session.durationHours * 60 * 60 * 1000;

        if (start < sessionEnd && sessionStart < end) {
          const ids = session.cleanerId.split(',').map(id => id.trim());
          if (ids.includes(cleanerId)) {
            busyBySession = true;
          }
        }
      });
    });
    if (busyBySession) return true;

    // 3. Check other sessions in the local scheduleSessions state (exclude index idx)
    let busyByLocalSession = false;
    if (idx !== undefined) {
      scheduleSessions.forEach((s, i) => {
        if (i === idx || !s.cleanerId) return;
        const sStartObj = new Date(`${s.dateStr}T${s.time}:00`);
        const sStart = sStartObj.getTime();
        const sEnd = sStart + durationHours * 60 * 60 * 1000;

        if (start < sEnd && sStart < end) {
          const ids = s.cleanerId.split(',').map(id => id.trim());
          if (ids.includes(cleanerId)) {
            busyByLocalSession = true;
          }
        }
      });
    }

    return busyByLocalSession;
  };

  // Cleaner availability checking for a specific session slot
  // Cross-references orders and other subscription sessions
  const getCleanersAvailability = (dateStr: string, timeStr: string, durationHours: number, idx?: number) => {
    // Filter active cleaners
    const available = cleaners.filter(c => c.isActive && !isCleanerBusy(c.id, dateStr, timeStr, durationHours, idx));

    // Sort by skill match prioritisation
    // Find skills that match the selected sub tier name, or standard cleaner rating
    const serviceTierId = selectedSub?.serviceTierId;
    const serviceTierName = selectedSub?.serviceTier?.name || '';
    
    const getHasMatching = (cln: ApiCleaner) => {
      return cln.skills.some(sName => {
        const skObj = skills.find(s => s.name.toLowerCase() === sName.toLowerCase());
        if (skObj) {
          const matchesTier = serviceTierId && skObj.subscriptionServiceTiers?.some(t => t.id === serviceTierId);
          if (matchesTier) return true;
        }
        return sName.toLowerCase() === serviceTierName.toLowerCase();
      });
    };

    return [...available].sort((a, b) => {
      const hasA = getHasMatching(a);
      const hasB = getHasMatching(b);
      if (hasA && !hasB) return -1;
      if (!hasA && hasB) return 1;
      // Secondary sorting by rating
      return b.rating - a.rating;
    });
  };

  // Helper to format/retrieve assigned cleaner names for display
  const getSessionCleanersLabel = (cleanerIdStr: string | null) => {
    if (!cleanerIdStr) return "Non assigné";
    const ids = cleanerIdStr.split(',').map(s => s.trim()).filter(Boolean);
    if (ids.length === 0) return "Non assigné";

    const names = ids.map(id => {
      const cleaner = cleaners.find(c => c.id === id);
      return cleaner ? cleaner.fullName.split(' ')[0] : 'Inconnu';
    });

    return names.join(', ');
  };

  // Helper to filter available time slots based on worker requirement
  const getAvailableTimesForSession = (dateStr: string, currentTime: string, durationHours: number, workersNeeded: number, idx?: number) => {
    const allTimes = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00"];
    const filtered = allTimes.filter(t => {
      const avail = getCleanersAvailability(dateStr, t, durationHours, idx);
      return avail.length >= workersNeeded;
    });
    if (currentTime && !filtered.includes(currentTime)) {
      filtered.push(currentTime);
      filtered.sort();
    }
    return filtered;
  };

  // Save Sessions schedule
  const handleSaveSchedule = async () => {
    if (!selectedSub) return;

    // Validate that all sessions have a time and cleaner assigned
    const reqCount = selectedSub.serviceTier?.workers || 1;
    const missingCleaner = scheduleSessions.some(s => {
      const selectedCount = s.cleanerId ? s.cleanerId.split(',').map(id => id.trim()).filter(Boolean).length : 0;
      return selectedCount !== reqCount;
    });
    if (missingCleaner) {
      if (!confirm(`Certaines sessions n'ont pas le nombre requis d'agents (${reqCount}). Voulez-vous enregistrer quand même ?`)) {
        return;
      }
    }

    try {
      const durationHours = selectedSub.serviceTier?.durationHours || 3;
      const sessionsPayload = scheduleSessions.map(s => ({
        scheduledDate: new Date(`${s.dateStr}T${s.time}:00`).toISOString(),
        durationHours,
        cleanerId: s.cleanerId || null,
      }));

      // Call API to recreate sessions
      await subscriptionsApi.setSessions(selectedSub.id, sessionsPayload);

      // Automatically move status to confirmed
      const updated = await subscriptionsApi.update(selectedSub.id, { status: 'CONFIRMED' });

      // Refresh list
      setSubscriptions(prev => prev.map(s => s.id === selectedSub.id ? { ...s, ...updated } : s));

      setIsScheduleModalOpen(false);
      alert("Planning enregistré avec succès !");
      fetchData();
    } catch (err: any) {
      alert(`Failed to save schedule: ${err.message}`);
    }
  };

  // Record payment
  const handleSavePayment = async () => {
    if (!selectedSub || !paymentAmount) return;
    const amt = parseFloat(paymentAmount);
    if (isNaN(amt) || amt <= 0) {
      alert("Veuillez saisir un montant valide.");
      return;
    }

    setIsPaymentSaving(true);
    try {
      const res = await subscriptionsApi.recordPayment(selectedSub.id, amt, paymentNote);
      // Update local subscription list with the new data returned
      setSubscriptions(prev => prev.map(s => s.id === selectedSub.id ? res.subscription : s));
      setSelectedSub(res.subscription);
      setPaymentAmount('');
      setPaymentNote('');
      setIsPaymentModalOpen(false);
      alert("Paiement enregistré !");
    } catch (err: any) {
      alert(`Failed to save payment: ${err.message}`);
    } finally {
      setIsPaymentSaving(false);
    }
  };

  // Drag and drop handlers for property type pictures
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageFile(file);
    }
  };

  const handleImageFile = (file: File) => {
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      alert('Only PNG, JPG or WebP images are allowed.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPropTypeForm(prev => ({ ...prev, picture: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  // Property Type CRUD Actions
  const handleSavePropType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propTypeForm.name) return;

    try {
      if (editingPropType) {
        await propertyTypesApi.update(editingPropType.id, propTypeForm);
      } else {
        await propertyTypesApi.create(propTypeForm);
      }
      setIsPropTypeModalOpen(false);
      setEditingPropType(null);
      setPropTypeForm({ name: '', nameAr: '', nameFr: '', picture: '', isActive: true });
      fetchData();
    } catch (err: any) {
      alert(`Error saving configuration: ${err.message}`);
    }
  };

  const handleDeletePropType = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce type de logement ?")) return;
    try {
      await propertyTypesApi.delete(id);
      fetchData();
    } catch (err: any) {
      alert(`Error deleting: ${err.message}`);
    }
  };

  // Service Tier CRUD Actions
  const handleSaveServiceTier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceTierForm.name) return;

    try {
      if (editingServiceTier) {
        await serviceTiersApi.update(editingServiceTier.id, serviceTierForm);
      } else {
        await serviceTiersApi.create(serviceTierForm);
      }
      setIsServiceTierModalOpen(false);
      setEditingServiceTier(null);
      setServiceTierForm({
        name: '', nameAr: '', nameFr: '', description: '', durationHours: 3, workers: 1, isActive: true
      });
      fetchData();
    } catch (err: any) {
      alert(`Error saving configuration: ${err.message}`);
    }
  };

  const handleDeleteServiceTier = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce niveau de service ?")) return;
    try {
      await serviceTiersApi.delete(id);
      fetchData();
    } catch (err: any) {
      alert(`Error deleting: ${err.message}`);
    }
  };

  // Delete Subscription
  const handleDeleteSub = async () => {
    if (!subToDelete) return;
    setIsDeleting(true);
    try {
      await subscriptionsApi.delete(subToDelete.id);
      setSubscriptions(prev => prev.filter(s => s.id !== subToDelete.id));
      setIsDeleteModalOpen(false);
      setSubToDelete(null);
    } catch (err: any) {
      alert(`Failed to delete subscription: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(subscriptions, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFormData.fullName || !addFormData.phone || !addFormData.propertyTypeId || !addFormData.surfaceM2 || !addFormData.roomsToClean || !addFormData.serviceTierId || !addFormData.daysPerWeek) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    try {
      const payload = {
        fullName: addFormData.fullName,
        phone: addFormData.phone,
        propertyTypeId: addFormData.propertyTypeId,
        surfaceM2: parseFloat(addFormData.surfaceM2.toString()),
        roomsToClean: parseInt(addFormData.roomsToClean.toString()),
        address: addFormData.address,
        latitude: addFormData.latitude !== undefined ? parseFloat(addFormData.latitude.toString()) : null,
        longitude: addFormData.longitude !== undefined ? parseFloat(addFormData.longitude.toString()) : null,
        serviceTierId: addFormData.serviceTierId,
        daysPerWeek: parseInt(addFormData.daysPerWeek.toString()),
        pictures: addFormData.pictures,
        adminNote: addFormData.adminNote || '',
      };
      await subscriptionsApi.create(payload);
      setIsAddModalOpen(false);
      fetchData();
      alert("Abonnement créé avec succès !");
    } catch (err: any) {
      alert(`Erreur de création : ${err.message}`);
    }
  };

  // Search/Filter logic
  const filteredSubs = subscriptions.filter(sub => {
    const matchesSearch =
      sub.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.phone.includes(searchQuery) ||
      sub.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Abonnements Mensuels
          </span>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">
            Gestion des Abonnements
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsJsonModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 hover:border-slate-300 rounded-2xl text-xs font-black tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Code size={14} />
            Voir JSON API
          </button>
          
          <button
            onClick={() => {
              setAddFormData({
                fullName: '', phone: '', propertyTypeId: '', surfaceM2: '', roomsToClean: '',
                address: '', latitude: undefined, longitude: undefined,
                serviceTierId: '', daysPerWeek: 2, adminNote: '', pictures: [] as string[]
              });
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2.5 px-5 py-3 bg-primary hover:bg-primary-dark text-white rounded-2xl text-xs font-black tracking-wider transition-all shadow-lg shadow-primary/20 active:scale-95 cursor-pointer"
          >
            <Plus size={14} />
            Créer Abonnement
          </button>

          <button
            onClick={fetchData}
            disabled={isLoading}
            className="flex items-center gap-2.5 px-5 py-3 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 hover:border-slate-300 rounded-2xl text-xs font-black tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-60"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Rafraîchir
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 pb-px gap-8">
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`pb-4 text-xs font-black uppercase tracking-widest relative transition-all cursor-pointer ${
            activeTab === 'subscriptions' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Demandes d'Abonnements
          {activeTab === 'subscriptions' && (
            <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('propertyTypes')}
          className={`pb-4 text-xs font-black uppercase tracking-widest relative transition-all cursor-pointer ${
            activeTab === 'propertyTypes' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Config Logements
          {activeTab === 'propertyTypes' && (
            <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('serviceTiers')}
          className={`pb-4 text-xs font-black uppercase tracking-widest relative transition-all cursor-pointer ${
            activeTab === 'serviceTiers' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Niveaux de Service
          {activeTab === 'serviceTiers' && (
            <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />
          )}
        </button>
      </div>

      {error && (
        <div className="border border-rose-100 bg-rose-50/40 p-4 rounded-2xl flex items-center gap-3 text-rose-600 text-xs font-bold">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* TAB 1: Subscriptions List */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6">
          {/* Stats widgets */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { label: 'Total', count: subscriptions.length, color: 'text-slate-600 bg-slate-50' },
              { label: 'En Attente', count: subscriptions.filter(s => s.status === 'PENDING').length, color: 'text-amber-600 bg-amber-50' },
              { label: 'Appelé (Non Payé)', count: subscriptions.filter(s => s.status === 'DAYS_PROPOSED').length, color: 'text-cyan-600 bg-cyan-50' },
              { label: 'Confirmés', count: subscriptions.filter(s => s.status === 'CONFIRMED').length, color: 'text-blue-600 bg-blue-50' },
              { label: 'Actifs', count: subscriptions.filter(s => s.status === 'ACTIVE').length, color: 'text-violet-600 bg-violet-50' },
              { label: 'Terminés', count: subscriptions.filter(s => s.status === 'COMPLETED').length, color: 'text-emerald-600 bg-emerald-50' },
            ].map(stat => (
              <div key={stat.label} className="bg-white border border-slate-100 p-5 rounded-3xl flex flex-col justify-between h-28 shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{stat.label}</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-black text-slate-800 tracking-tight">{stat.count}</span>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${stat.color}`}>Stat</span>
                </div>
              </div>
            ))}
          </div>

          {/* Filters & search */}
          <div className="bg-white border border-slate-100 p-6 rounded-3xl flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
            <div className="w-full md:max-w-md relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Rechercher par client, téléphone ou adresse..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-primary/50 rounded-2xl pl-11 pr-4 py-3 text-xs font-bold outline-none transition-all placeholder:text-slate-400 text-slate-700"
              />
            </div>

            <div className="flex w-full md:w-auto items-center gap-3 self-stretch md:self-auto justify-end">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest hidden sm:inline">Statut</span>
              <div className="relative w-full sm:w-48">
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={14} />
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl px-4 py-3 text-xs font-black tracking-wider text-slate-600 outline-none appearance-none transition-all cursor-pointer"
                >
                  <option value="all">Tous les Statuts</option>
                  <option value="PENDING">En Attente</option>
                  <option value="DAYS_PROPOSED">Appelé (Non Payé)</option>
                  <option value="CONFIRMED">Confirmés</option>
                  <option value="ACTIVE">Actifs</option>
                  <option value="COMPLETED">Terminés</option>
                  <option value="CANCELLED">Annulés</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table list */}
          <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-8">Client</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Logement</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Service / Fréquence</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Prix Mensuel</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Statut</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center pr-8">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-xs font-bold text-slate-400">
                        Chargement des abonnements...
                      </td>
                    </tr>
                  ) : filteredSubs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-xs font-bold text-slate-400">
                        Aucun abonnement trouvé.
                      </td>
                    </tr>
                  ) : (
                    filteredSubs.map(sub => {
                      const remaining = (sub.monthlyPrice || 0) - sub.amountPaid;
                      return (
                        <tr key={sub.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="p-6 pl-8">
                            <div className="font-bold text-slate-800 text-sm">{sub.fullName}</div>
                            <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1 mt-0.5">
                              <Phone size={10} /> {sub.phone}
                            </div>
                          </td>
                          <td className="p-6">
                            <div className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[9px] font-black">
                                {sub.propertyType?.name || 'Logement'}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-bold mt-1">
                              {sub.roomsToClean} pièces • {sub.surfaceM2} m²
                            </div>
                          </td>
                          <td className="p-6">
                            <div className="font-black text-slate-800 text-xs flex items-center gap-1.5">
                              <span className="capitalize">{sub.serviceTier?.name || 'N/A'}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-bold mt-1">
                              {sub.daysPerWeek} jours / semaine (4 semaines)
                            </div>
                          </td>
                          <td className="p-6 text-right">
                            {sub.monthlyPrice !== null ? (
                              <div>
                                <span className="font-black text-slate-800 text-sm">{sub.monthlyPrice} DA</span>
                                <div className="text-[9px] font-bold text-slate-400 mt-0.5">
                                  Payé: <span className="text-emerald-500 font-black">{sub.amountPaid} DA</span>
                                  {remaining > 0 && ` • Restant: ${remaining} DA`}
                                </div>
                              </div>
                            ) : (
                              <span className="text-[10px] font-black text-amber-500 uppercase px-2 py-1 bg-amber-50 rounded-xl border border-amber-100">
                                Non Défini
                              </span>
                            )}
                          </td>
                          <td className="p-6">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider ${STATUS_STYLES[sub.status]}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[sub.status]}`} />
                              {STATUS_LABELS[sub.status]}
                            </span>
                          </td>
                          <td className="p-6 text-center pr-8">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedSub(sub);
                                  setIsDetailsModalOpen(true);
                                }}
                                className="w-9 h-9 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                                title="Voir Détails"
                              >
                                <Eye size={15} />
                              </button>

                              <button
                                onClick={() => handleOpenDaysModal(sub)}
                                className="px-3 py-1.5 bg-primary/5 hover:bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border border-primary/10 hover:border-primary/20 transition-all cursor-pointer"
                                title="Gérer le planning"
                              >
                                <CalendarDays size={13} />
                                Planning
                              </button>

                              <button
                                onClick={() => {
                                  setSubToDelete(sub);
                                  setIsDeleteModalOpen(true);
                                }}
                                className="w-9 h-9 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                                title="Supprimer"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Property Types Configuration */}
      {activeTab === 'propertyTypes' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">
              Configurateurs de Logements
            </h3>
            <button
              onClick={() => {
                setEditingPropType(null);
                setPropTypeForm({ name: '', nameAr: '', nameFr: '', picture: '', isActive: true });
                setIsPropTypeModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
            >
              <Plus size={14} /> Nouveau Type
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {propertyTypes.map(type => (
              <div key={type.id} className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex justify-between items-start">
                    <span className={`px-2.5 py-1 text-[9px] font-black uppercase rounded-full ${type.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400'}`}>
                      {type.isActive ? 'Actif' : 'Inactif'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingPropType(type);
                          setPropTypeForm({
                            name: type.name,
                            nameAr: type.nameAr || '',
                            nameFr: type.nameFr || '',
                            picture: type.picture || '',
                            isActive: type.isActive
                          });
                          setIsPropTypeModalOpen(true);
                        }}
                        className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 flex items-center justify-center transition-all cursor-pointer"
                      >
                        <Edit size={13} />
                      </button>
                      <button
                        onClick={() => handleDeletePropType(type.id)}
                        className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-500 flex items-center justify-center transition-all cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Image Display */}
                  <div className="flex items-center gap-4 mt-4">
                    {type.picture ? (
                      <div className="w-14 h-14 relative rounded-2xl overflow-hidden shadow-sm border border-slate-100 shrink-0 bg-slate-50">
                        <img src={imgUrl(type.picture)} alt={type.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 text-lg shrink-0 bg-slate-50">
                        🏠
                      </div>
                    )}
                    <div>
                      <h4 className="text-base font-black text-slate-800 leading-tight">{type.name}</h4>
                      <div className="space-y-0.5 mt-1 text-[10px] text-slate-400 font-bold font-inter">
                        <div>Français : {type.nameFr || '—'}</div>
                        <div>Arabe : {type.nameAr || '—'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Service Tiers Configuration */}
      {activeTab === 'serviceTiers' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">
              Configuration des Niveaux de Services
            </h3>
            <button
              onClick={() => {
                setEditingServiceTier(null);
                setServiceTierForm({
                  name: '', nameAr: '', nameFr: '', description: '', durationHours: 3, workers: 1, isActive: true
                });
                setIsServiceTierModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
            >
              <Plus size={14} /> Nouveau Niveau
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {serviceTiers.map(tier => (
              <div key={tier.id} className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex justify-between items-start">
                    <span className={`px-2.5 py-1 text-[9px] font-black uppercase rounded-full ${tier.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400'}`}>
                      {tier.isActive ? 'Actif' : 'Inactif'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingServiceTier(tier);
                          setServiceTierForm({
                            name: tier.name,
                            nameAr: tier.nameAr,
                            nameFr: tier.nameFr,
                            description: tier.description,
                            durationHours: tier.durationHours,
                            workers: tier.workers,
                            isActive: tier.isActive
                          });
                          setIsServiceTierModalOpen(true);
                        }}
                        className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 flex items-center justify-center transition-all cursor-pointer"
                      >
                        <Edit size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteServiceTier(tier.id)}
                        className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-500 flex items-center justify-center transition-all cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <h4 className="text-lg font-black text-slate-800 mt-3">{tier.name}</h4>
                  <p className="text-xs font-bold text-slate-400 mt-1">{tier.description || 'Pas de description.'}</p>

                  <div className="flex gap-4 mt-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Durée</span>
                      <span className="text-xs font-black text-slate-700">{tier.durationHours} heures</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Agents requis</span>
                      <span className="text-xs font-black text-slate-700">{tier.workers} cleaner(s)</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── DETAILS MODAL ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isDetailsModalOpen && selectedSub && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsDetailsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-[700px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="h-2 bg-gradient-to-r from-primary to-violet-500 shrink-0" />
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-100 transition-all cursor-pointer z-20"
              >
                <X size={18} />
              </button>

              <div className="p-8 space-y-6 overflow-y-auto pr-6 mr-1">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Détails de l'Abonnement</span>
                  <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                    Abonnement Mensuel
                  </h2>
                </div>

                {/* Sub status, price details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Statut Actuel</span>
                    <div className="relative mt-2">
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={12} />
                      <select
                        value={selectedSub.status}
                        onChange={e => handleUpdateStatus(selectedSub.id, e.target.value as any)}
                        className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-2 text-xs font-black uppercase text-slate-700 outline-none appearance-none cursor-pointer transition-all"
                      >
                        <option value="PENDING">En Attente</option>
                        <option value="DAYS_PROPOSED">Appelé (Non Payé)</option>
                        <option value="CONFIRMED">Confirmé</option>
                        <option value="ACTIVE">Actif</option>
                        <option value="COMPLETED">Terminé</option>
                        <option value="CANCELLED">Annulé</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Prix Fixé (DA)</span>
                    <input
                      type="number"
                      placeholder="Fixer le prix..."
                      defaultValue={selectedSub.monthlyPrice || ''}
                      onBlur={e => handleUpdatePrice(selectedSub.id, parseFloat(e.target.value) || 0)}
                      className="w-full mt-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-2 text-xs font-black text-slate-700 outline-none transition-all"
                    />
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Paiement</span>
                      <div className="text-xs font-bold text-slate-600 mt-1">
                        Payé: <span className="font-black text-emerald-500">{selectedSub.amountPaid} DA</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsPaymentModalOpen(true)}
                      className="mt-2 text-[10px] font-black uppercase text-primary hover:text-primary-dark transition-all flex items-center gap-1 justify-start cursor-pointer"
                    >
                      <Plus size={10} /> Enregistrer Paiement
                    </button>
                  </div>
                </div>

                {/* Client info */}
                <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100/80 space-y-3">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Informations Client</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-slate-600">
                    <div>
                      <span className="text-[9px] text-slate-400 block mb-0.5">Nom Complet</span>
                      {selectedSub.fullName}
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block mb-0.5">Téléphone</span>
                      {selectedSub.phone}
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-[9px] text-slate-400 block mb-0.5">Adresse</span>
                      {selectedSub.address || '—'}
                    </div>
                  </div>
                </div>

                {/* Layout details */}
                <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100/80 space-y-3">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Configuration & Logement</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-bold text-slate-600">
                    <div>
                      <span className="text-[9px] text-slate-400 block mb-0.5">Type Logement</span>
                      {selectedSub.propertyType?.name || 'N/A'}
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block mb-0.5">Chambres à nettoyer</span>
                      {selectedSub.roomsToClean}
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block mb-0.5">Surface</span>
                      {selectedSub.surfaceM2} m²
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block mb-0.5">Fréquence</span>
                      {selectedSub.daysPerWeek} fois/semaine
                    </div>
                  </div>
                </div>

                {/* Pictures */}
                {selectedSub.pictures && selectedSub.pictures.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider pl-1">Photos du logement</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedSub.pictures.map((pic, idx) => (
                        <a key={idx} href={pic} target="_blank" rel="noreferrer" className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shadow-sm relative group hover:border-primary/50 transition-all">
                          <img src={imgUrl(pic)} alt="Logement pic" className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Scheduled sessions list */}
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider pl-1">Calendrier des Sessions</span>
                  {selectedSub.sessions && selectedSub.sessions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedSub.sessions.map((session, idx) => {
                        const dateObj = new Date(session.scheduledDate);
                        const label = dateObj.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
                        const hour = dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                        return (
                          <div key={session.id} className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Calendar size={14} className="text-slate-400" />
                              <div className="text-[11px] font-bold text-slate-700">
                                <span className="font-black text-slate-800">{label}</span> • {hour}
                              </div>
                            </div>
                            <div className="text-[10px] font-black text-slate-500 flex items-center gap-1.5">
                              {session.cleanerId ? (
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded border border-blue-100">
                                  {getSessionCleanersLabel(session.cleanerId)}
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-amber-50 text-amber-500 rounded border border-amber-100">
                                  Non assigné
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 font-bold border border-dashed border-slate-200 p-4 rounded-xl text-center">
                      Aucune session n'est planifiée. Cliquez sur "Planning" pour commencer.
                    </div>
                  )}
                </div>

                {/* Internal notes */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider pl-1">Notes Administrateur</span>
                  <textarea
                    placeholder="Ajouter des notes internes sur les paiements, exigences spécifiques du client..."
                    defaultValue={selectedSub.adminNote || ''}
                    onBlur={e => handleUpdateNotes(selectedSub.id, e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-primary/50 hover:border-slate-300 rounded-2xl p-4 text-xs font-bold outline-none text-slate-700 min-h-[80px] transition-all"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── CALENDAR / AVAILABLE DAYS MODAL ────────────────────────────────── */}
      <AnimatePresence>
        {isDaysModalOpen && selectedSub && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsDaysModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-[800px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500 shrink-0" />
              <button
                onClick={() => setIsDaysModalOpen(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-100 transition-all cursor-pointer z-20"
              >
                <X size={18} />
              </button>

              <div className="p-8 space-y-6 overflow-y-auto">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    Jours Disponibles de l'Abonnement
                  </span>
                  <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                    Calendrier de Disponibilité
                  </h2>
                  <p className="text-xs font-bold text-slate-400">
                    Sélectionnez les jours pour le planning mensuel. Fréquence requise : <span className="text-primary font-black">{selectedSub.daysPerWeek} jours / semaine</span>.
                  </p>
                </div>

                {isDaysLoading ? (
                  <div className="p-12 text-center text-xs font-bold text-slate-400">
                    Calcul des disponibilités en fonction des cleaners libres...
                  </div>
                ) : !availableDaysData ? (
                  <div className="p-12 text-center text-xs font-bold text-slate-400">
                    Erreur de chargement.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Render Weeks */}
                    <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2">
                      {availableDaysData.weeks?.map((weekData: any) => (
                        <div key={weekData.week} className="space-y-2">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">
                            Semaine {weekData.week}
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                            {weekData.days?.map((day: any) => {
                              const isSelected = selectedDates.includes(day.date);
                              const formattedDate = new Date(day.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
                              
                              let btnClass = "";
                              let labelClass = "";
                              let subTextClass = "";
                              let statusText = `${day.availableCleanerCount} agent(s)`;

                              if (isSelected) {
                                btnClass = 'bg-primary text-white border-primary shadow-lg shadow-primary/25';
                                labelClass = 'text-white/80';
                                subTextClass = 'text-white/85';
                              } else if (day.isLocked) {
                                btnClass = 'bg-slate-100 border-slate-100 text-slate-400 opacity-40 cursor-not-allowed';
                                labelClass = 'text-slate-400';
                                subTextClass = 'text-slate-400 font-black';
                                statusText = 'Verrouillé';
                              } else if (!day.isAvailable) {
                                btnClass = 'bg-rose-50 border-rose-100 text-rose-600 cursor-not-allowed';
                                labelClass = 'text-rose-400';
                                subTextClass = 'text-rose-500 font-bold';
                                statusText = 'Pas d\'agent libre';
                              } else {
                                btnClass = 'bg-white border-slate-200 hover:border-primary text-slate-700';
                                labelClass = 'text-slate-400';
                                subTextClass = 'text-slate-400';
                              }

                              return (
                                <button
                                  key={day.date}
                                  type="button"
                                  disabled={day.isLocked || !day.isAvailable}
                                  onClick={() => handleToggleDate(day.date, day.isAvailable && !day.isLocked)}
                                  className={`p-3 rounded-2xl border text-center flex flex-col justify-between h-20 transition-all outline-none cursor-pointer ${btnClass}`}
                                >
                                  <span className={`text-[9px] font-black uppercase ${labelClass}`}>
                                    {day.dayName.substring(0, 3)}
                                  </span>
                                  <span className="text-xs font-black">{formattedDate}</span>
                                  <span className={`text-[9px] ${subTextClass}`}>
                                    {statusText}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center border-t border-slate-100 pt-6">
                      <span className="text-xs font-bold text-slate-500">
                        Sélectionnés: <span className="font-black text-primary">{selectedDates.length}</span> / {selectedSub.daysPerWeek * 4} jours requis
                      </span>
                      <button
                        onClick={handleProceedToScheduling}
                        disabled={selectedDates.length === 0}
                        className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
                      >
                        Assigner Heures & Agents
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── SESSION SCHEDULING MODAL ───────────────────────────────────────── */}
      <AnimatePresence>
        {isScheduleModalOpen && selectedSub && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsScheduleModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-[650px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="h-2 bg-gradient-to-r from-violet-500 to-primary shrink-0" />
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-100 transition-all cursor-pointer z-20"
              >
                <X size={18} />
              </button>

              <div className="p-8 space-y-6 overflow-y-auto flex-1">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    Planification des Sessions
                  </span>
                  <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                    Assigner Heure & Agent
                  </h2>
                  <p className="text-xs font-bold text-slate-400">
                    Déterminez l'heure et l'agent de nettoyage pour chaque jour sélectionné.
                  </p>
                </div>

                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 pb-48">
                  {scheduleSessions.map((session, idx) => {
                    const durationHours = selectedSub.serviceTier?.durationHours || 3;
                    const workersNeeded = selectedSub.serviceTier?.workers || 1;
                    const availableCleaners = getCleanersAvailability(session.dateStr, session.time, durationHours, idx);

                    return (
                      <div key={session.dateStr} className="bg-slate-50 border border-slate-100 p-5 rounded-3xl grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                        <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Date</span>
                          <span className="text-xs font-black text-slate-800 capitalize">
                            {session.dayName} {new Date(session.dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>

                        {/* Slot Time selection */}
                        <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Heure de Début</span>
                          <select
                            value={session.time}
                            onChange={e => {
                              const val = e.target.value;
                              // Automatically filter cleanerIds that are no longer available at new time
                              setScheduleSessions(prev => prev.map((s, i) => {
                                if (i === idx) {
                                  const availAtNewTime = getCleanersAvailability(s.dateStr, val, durationHours, idx).map(c => c.id);
                                  const currentCleanerIds = s.cleanerId ? s.cleanerId.split(',').map(id => id.trim()).filter(Boolean) : [];
                                  const validCleanerIds = currentCleanerIds.filter(cid => availAtNewTime.includes(cid));
                                  return { ...s, time: val, cleanerId: validCleanerIds.join(',') };
                                }
                                return s;
                              }));
                            }}
                            className="w-full mt-1.5 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none"
                          >
                            {getAvailableTimesForSession(session.dateStr, session.time, durationHours, workersNeeded, idx).map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>

                        {/* Cleaner selection */}
                        <div className="relative">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Agent Assigné</span>
                          
                          {(() => {
                            const selectedIds = session.cleanerId ? session.cleanerId.split(',').map(s => s.trim()).filter(Boolean) : [];
                            const isOpen = activeSessionPopover === session.dateStr;

                            return (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setActiveSessionPopover(isOpen ? null : session.dateStr)}
                                  className="w-full mt-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none flex items-center justify-between cursor-pointer transition-all min-h-[36px]"
                                >
                                  <span className="truncate">
                                    {selectedIds.length > 0
                                      ? `${selectedIds.length} / ${workersNeeded} sélectionné(s)`
                                      : "-- Choisir Agent --"}
                                  </span>
                                  <ChevronDown size={14} className="text-slate-400 shrink-0 ml-1" />
                                </button>

                                {isOpen && (
                                  <>
                                    {/* Backdrop click to close */}
                                    <div 
                                      className="fixed inset-0 z-30" 
                                      onClick={() => setActiveSessionPopover(null)} 
                                    />
                                    <div className={`absolute left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-xl p-3.5 z-40 max-h-[220px] overflow-y-auto space-y-2 ${
                                      idx >= scheduleSessions.length - 2 ? 'bottom-full mb-2' : 'mt-1'
                                    }`}>
                                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex justify-between items-center">
                                        <span>Sélectionner {workersNeeded} agent(s)</span>
                                        {selectedIds.length > 0 && (
                                          <button 
                                            type="button"
                                            onClick={() => {
                                              setScheduleSessions(prev => prev.map((s, i) => i === idx ? { ...s, cleanerId: '' } : s));
                                            }}
                                            className="text-primary hover:text-primary-dark cursor-pointer text-[8px]"
                                          >
                                            Effacer tout
                                          </button>
                                        )}
                                      </div>
                                      
                                      <div className="space-y-1">
                                        {(() => {
                                          const displayList = [...cleaners]
                                            .filter(c => c.isActive)
                                            .map(cleaner => {
                                              const isSelected = selectedIds.includes(cleaner.id);
                                              const isBusy = isCleanerBusy(cleaner.id, session.dateStr, session.time, durationHours, idx);
                                              return { ...cleaner, isSelected, isBusy };
                                            })
                                            .sort((a, b) => {
                                              if (a.isSelected && !b.isSelected) return -1;
                                              if (!a.isSelected && b.isSelected) return 1;
                                              if (!a.isBusy && b.isBusy) return -1;
                                              if (a.isBusy && !b.isBusy) return 1;
                                              
                                              const serviceTierId = selectedSub?.serviceTierId;
                                              const serviceTierName = selectedSub?.serviceTier?.name || '';
                                              const getHasMatching = (cln: ApiCleaner) => {
                                                return cln.skills.some(sName => {
                                                  const skObj = skills.find(s => s.name.toLowerCase() === sName.toLowerCase());
                                                  if (skObj) {
                                                    const matchesTier = serviceTierId && skObj.subscriptionServiceTiers?.some(t => t.id === serviceTierId);
                                                    if (matchesTier) return true;
                                                  }
                                                  return sName.toLowerCase() === serviceTierName.toLowerCase();
                                                });
                                              };

                                              const hasA = getHasMatching(a);
                                              const hasB = getHasMatching(b);
                                              if (hasA && !hasB) return -1;
                                              if (!hasA && hasB) return 1;
                                              return b.rating - a.rating;
                                            });

                                          if (displayList.length === 0) {
                                            return (
                                              <div className="text-center text-slate-400 py-3 text-[10px] font-bold">
                                                Aucun agent actif disponible
                                              </div>
                                            );
                                          }

                                          return displayList.map(cleaner => {
                                            const isSelected = cleaner.isSelected;
                                            const isBusy = cleaner.isBusy;
                                            
                                            const serviceTierId = selectedSub?.serviceTierId;
                                            const serviceTierName = selectedSub?.serviceTier?.name || '';
                                            const isSkillMatch = cleaner.skills.some(sName => {
                                              const skObj = skills.find(s => s.name.toLowerCase() === sName.toLowerCase());
                                              if (skObj) {
                                                const matchesTier = serviceTierId && skObj.subscriptionServiceTiers?.some(t => t.id === serviceTierId);
                                                if (matchesTier) return true;
                                              }
                                              return sName.toLowerCase() === serviceTierName.toLowerCase();
                                            });

                                            return (
                                              <button
                                                key={cleaner.id}
                                                type="button"
                                                disabled={isBusy && !isSelected}
                                                onClick={() => {
                                                  if (isSelected) {
                                                    const newIds = selectedIds.filter(id => id !== cleaner.id);
                                                    setScheduleSessions(prev => prev.map((s, i) => i === idx ? { ...s, cleanerId: newIds.join(',') } : s));
                                                  } else {
                                                    if (workersNeeded === 1) {
                                                      setScheduleSessions(prev => prev.map((s, i) => i === idx ? { ...s, cleanerId: cleaner.id } : s));
                                                      setActiveSessionPopover(null);
                                                    } else {
                                                      if (selectedIds.length < workersNeeded) {
                                                        const newIds = [...selectedIds, cleaner.id];
                                                        setScheduleSessions(prev => prev.map((s, i) => i === idx ? { ...s, cleanerId: newIds.join(',') } : s));
                                                      } else {
                                                        alert(`Vous ne pouvez pas sélectionner plus de ${workersNeeded} cleaner(s).`);
                                                      }
                                                    }
                                                  }
                                                }}
                                                className={`w-full text-left px-2.5 py-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                                                  isSelected 
                                                    ? 'bg-primary border-primary text-white' 
                                                    : isBusy
                                                    ? 'bg-slate-100/50 border-slate-200 text-slate-400 opacity-60 cursor-not-allowed'
                                                    : 'bg-slate-50 border-slate-100 hover:border-slate-200 text-slate-700 hover:bg-slate-50'
                                                }`}
                                              >
                                                <span className="truncate flex items-center gap-1.5">
                                                  {workersNeeded > 1 && (
                                                    <input 
                                                      type="checkbox" 
                                                      checked={isSelected}
                                                      disabled={isBusy && !isSelected}
                                                      readOnly
                                                      className="rounded h-3.5 w-3.5 border-slate-300 accent-primary"
                                                    />
                                                  )}
                                                  <span>{cleaner.fullName}</span>
                                                </span>
                                                <div className="flex items-center gap-1 shrink-0">
                                                  {isBusy && (
                                                    <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded ${
                                                      isSelected ? 'bg-rose-500/20 text-rose-200' : 'bg-rose-50 text-rose-500 border border-rose-100'
                                                    }`}>
                                                      ⚠️ Occupé
                                                    </span>
                                                  )}
                                                  {isSkillMatch && (
                                                    <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded ${
                                                      isSelected ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                                                    }`}>
                                                      ⭐ Skill
                                                    </span>
                                                  )}
                                                </div>
                                              </button>
                                            );
                                          });
                                        })()}
                                      </div>
                                    </div>
                                  </>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center border-t border-slate-100 pt-6">
                  <button
                    onClick={() => {
                      setIsScheduleModalOpen(false);
                      setIsDaysModalOpen(true);
                    }}
                    className="text-xs font-black uppercase text-slate-500 hover:text-slate-700 transition-all cursor-pointer"
                  >
                    Retour au calendrier
                  </button>
                  <button
                    onClick={handleSaveSchedule}
                    className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Confirmer & Enregistrer le planning
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── RECORD PAYMENT MODAL ────────────────────────────────────────── */}
      <AnimatePresence>
        {isPaymentModalOpen && selectedSub && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsPaymentModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-[450px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 relative z-10 overflow-hidden"
            >
              <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500 shrink-0" />
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-100 transition-all cursor-pointer z-20"
              >
                <X size={18} />
              </button>

              <div className="p-8 space-y-6">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Tracker Financier</span>
                  <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                    Enregistrer Paiement
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Montant (DA)</label>
                    <input
                      type="number"
                      placeholder="Ex: 5000"
                      value={paymentAmount}
                      onChange={e => setPaymentAmount(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-primary/50 rounded-2xl px-4 py-3 text-xs font-bold outline-none text-slate-700 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Note (optionnel)</label>
                    <input
                      type="text"
                      placeholder="Ex: Espèces, Virement CCP, Avance..."
                      value={paymentNote}
                      onChange={e => setPaymentNote(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-primary/50 rounded-2xl px-4 py-3 text-xs font-bold outline-none text-slate-700 transition-all"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setIsPaymentModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-black uppercase text-slate-500 hover:text-slate-700 transition-all cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSavePayment}
                    disabled={isPaymentSaving || !paymentAmount}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── DELETE MODAL ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isDeleteModalOpen && subToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-[400px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 relative z-10 overflow-hidden"
            >
              <div className="p-8 space-y-6 text-center">
                <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-100">
                  <Trash2 size={24} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Supprimer l'abonnement</h3>
                  <p className="text-xs text-slate-400 font-bold leading-relaxed">
                    Êtes-vous sûr de vouloir supprimer la demande d'abonnement de <span className="font-black text-slate-600">{subToDelete.fullName}</span> ? Cette action est irréversible et supprimera toutes les sessions associées.
                  </p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleDeleteSub}
                    disabled={isDeleting}
                    className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isDeleting ? 'Suppression...' : 'Supprimer'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── PROP TYPE CREATE/EDIT MODAL ────────────────────────────────────── */}
      <AnimatePresence>
        {isPropTypeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsPropTypeModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-[500px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 relative z-10 overflow-hidden"
            >
              <div className="h-2 bg-gradient-to-r from-primary to-indigo-500 shrink-0" />
              <button
                onClick={() => setIsPropTypeModalOpen(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-100 transition-all cursor-pointer z-20"
              >
                <X size={18} />
              </button>

              <form onSubmit={handleSavePropType} className="p-8 space-y-6">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Configurateur</span>
                  <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                    {editingPropType ? 'Modifier Type de Logement' : 'Nouveau Type de Logement'}
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Nom (Interne)</label>
                    <input
                      type="text"
                      placeholder="Ex: Villa, Bureau, Appartement..."
                      value={propTypeForm.name}
                      onChange={e => setPropTypeForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-primary/50 rounded-2xl px-4 py-3 text-xs font-bold outline-none text-slate-700 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Nom Français</label>
                    <input
                      type="text"
                      placeholder="Ex: Villa"
                      value={propTypeForm.nameFr}
                      onChange={e => setPropTypeForm(prev => ({ ...prev, nameFr: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-primary/50 rounded-2xl px-4 py-3 text-xs font-bold outline-none text-slate-700 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Nom Arabe</label>
                    <input
                      type="text"
                      placeholder="Ex: فيلا"
                      value={propTypeForm.nameAr}
                      onChange={e => setPropTypeForm(prev => ({ ...prev, nameAr: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-primary/50 rounded-2xl px-4 py-3 text-xs font-bold outline-none text-slate-700 transition-all"
                    />
                  </div>

                  {/* Icon / Image Asset Upload */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">
                      Icône / Image (Optionnel)
                    </label>

                    {propTypeForm.picture ? (
                      // Preview state
                      <div className="relative border border-slate-100 rounded-3xl p-4 flex items-center gap-4 bg-slate-50/50">
                        <div className="w-16 h-16 relative rounded-2xl overflow-hidden border border-slate-100 shadow-sm shrink-0 bg-slate-50">
                          <img src={imgUrl(propTypeForm.picture)} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 uppercase truncate">
                            Icône Sélectionnée
                          </p>
                          <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1 mt-0.5 font-inter">
                            <Check size={10} strokeWidth={3} /> Prêt à enregistrer
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setPropTypeForm(prev => ({ ...prev, picture: '' }));
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
                        className={`border-2 border-dashed rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${dragActive
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
                        <UploadCloud size={24} className={`mb-2 ${dragActive ? 'text-primary animate-bounce' : 'text-slate-300'}`} />
                        <p className="text-xs font-bold text-slate-700">
                          Glissez & déposez une image ici, ou <span className="text-primary hover:underline">parcourir</span>
                        </p>
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider mt-1.5 bg-slate-100 px-2 py-0.5 rounded">
                          PNG, JPG ou WebP
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <input
                      type="checkbox"
                      id="prop-active"
                      checked={propTypeForm.isActive}
                      onChange={e => setPropTypeForm(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="w-4 h-4 accent-primary rounded border-slate-200 outline-none"
                    />
                    <label htmlFor="prop-active" className="text-xs font-bold text-slate-600 select-none cursor-pointer">
                      Activer ce type de logement pour les clients
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsPropTypeModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-black uppercase text-slate-500 hover:text-slate-700 transition-all cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                  >
                    {editingPropType ? 'Sauvegarder' : 'Créer'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── SERVICE TIER CREATE/EDIT MODAL ─────────────────────────────────── */}
      <AnimatePresence>
        {isServiceTierModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsServiceTierModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-[500px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 relative z-10 overflow-hidden"
            >
              <div className="h-2 bg-gradient-to-r from-primary to-indigo-500 shrink-0" />
              <button
                onClick={() => setIsServiceTierModalOpen(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-100 transition-all cursor-pointer z-20"
              >
                <X size={18} />
              </button>

              <form onSubmit={handleSaveServiceTier} className="p-8 space-y-6">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Configurateur</span>
                  <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                    {editingServiceTier ? 'Modifier Niveau de Service' : 'Nouveau Niveau de Service'}
                  </h2>
                </div>

                <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-2">
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Nom (Interne)</label>
                    <input
                      type="text"
                      placeholder="Ex: Simple, Semi-Grand, Grand..."
                      value={serviceTierForm.name}
                      onChange={e => setServiceTierForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-primary/50 rounded-2xl px-4 py-3 text-xs font-bold outline-none text-slate-700 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Nom Français</label>
                    <input
                      type="text"
                      placeholder="Ex: Simple"
                      value={serviceTierForm.nameFr}
                      onChange={e => setServiceTierForm(prev => ({ ...prev, nameFr: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-primary/50 rounded-2xl px-4 py-3 text-xs font-bold outline-none text-slate-700 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Nom Arabe</label>
                    <input
                      type="text"
                      placeholder="Ex: بسيط"
                      value={serviceTierForm.nameAr}
                      onChange={e => setServiceTierForm(prev => ({ ...prev, nameAr: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-primary/50 rounded-2xl px-4 py-3 text-xs font-bold outline-none text-slate-700 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Description</label>
                    <textarea
                      placeholder="Description du service pour l'abonnement..."
                      value={serviceTierForm.description}
                      onChange={e => setServiceTierForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-primary/50 rounded-2xl p-4 text-xs font-bold outline-none text-slate-700 min-h-[60px] transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Durée (Heures)</label>
                      <input
                        type="number"
                        placeholder="3"
                        value={serviceTierForm.durationHours}
                        onChange={e => setServiceTierForm(prev => ({ ...prev, durationHours: parseInt(e.target.value) || 3 }))}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-primary/50 rounded-2xl px-4 py-3 text-xs font-bold outline-none text-slate-700 transition-all"
                        min={1}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Agents requis</label>
                      <input
                        type="number"
                        placeholder="1"
                        value={serviceTierForm.workers}
                        onChange={e => setServiceTierForm(prev => ({ ...prev, workers: parseInt(e.target.value) || 1 }))}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-primary/50 rounded-2xl px-4 py-3 text-xs font-bold outline-none text-slate-700 transition-all"
                        min={1}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <input
                      type="checkbox"
                      id="tier-active"
                      checked={serviceTierForm.isActive}
                      onChange={e => setServiceTierForm(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="w-4 h-4 accent-primary rounded border-slate-200 outline-none"
                    />
                    <label htmlFor="tier-active" className="text-xs font-bold text-slate-600 select-none cursor-pointer">
                      Activer ce niveau de service pour les clients
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsServiceTierModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-black uppercase text-slate-500 hover:text-slate-700 transition-all cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                  >
                    {editingServiceTier ? 'Sauvegarder' : 'Créer'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── API JSON VIEWER MODAL ── */}
      <AnimatePresence>
        {isJsonModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsJsonModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-[700px] bg-slate-950 text-slate-200 rounded-[3rem] shadow-2xl border border-white/10 relative z-10 overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-8 border-b border-white/5 flex justify-between items-center shrink-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-primary">
                    <Code size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Subscriptions API</span>
                  </div>
                  <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">
                    Subscriptions JSON
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
                <pre>{JSON.stringify(subscriptions, null, 2)}</pre>
              </div>

              <div className="p-8 border-t border-white/5 bg-slate-950 flex gap-4 shrink-0 justify-end">
                <button 
                  onClick={handleCopyJson}
                  className="px-6 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-wider text-[10px] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
                >
                  {copied ? <Check size={14} strokeWidth={3} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy JSON API'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── CREATE SUBSCRIPTION MODAL ── */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-[600px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="h-2 bg-gradient-to-r from-primary to-indigo-500 shrink-0" />
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-100 transition-all cursor-pointer z-20"
              >
                <X size={18} />
              </button>

              <form onSubmit={handleAddSubmit} className="p-8 space-y-6 overflow-y-auto">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Création Administrative</span>
                  <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                    Nouveau contrat d'abonnement
                  </h2>
                  <p className="text-xs font-bold text-slate-400">
                    Saisissez les détails pour créer un abonnement client (identique au processus mobile).
                  </p>
                </div>

                <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Nom Complet</label>
                      <input
                        type="text"
                        placeholder="Ex: Mohamed Amin"
                        value={addFormData.fullName}
                        onChange={e => setAddFormData(prev => ({ ...prev, fullName: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-primary/50 rounded-2xl px-4 py-3 text-xs font-bold outline-none text-slate-700 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Téléphone</label>
                      <input
                        type="text"
                        placeholder="Ex: 0550123456"
                        value={addFormData.phone}
                        onChange={e => setAddFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-primary/50 rounded-2xl px-4 py-3 text-xs font-bold outline-none text-slate-700 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Type Logement</label>
                      <select
                        value={addFormData.propertyTypeId}
                        onChange={e => setAddFormData(prev => ({ ...prev, propertyTypeId: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-primary/50 rounded-2xl px-4 py-3 text-xs font-bold outline-none text-slate-700 transition-all"
                        required
                      >
                        <option value="">-- Choisir type --</option>
                        {propertyTypes.filter(p => p.isActive).map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Niveau de Service</label>
                      <select
                        value={addFormData.serviceTierId}
                        onChange={e => setAddFormData(prev => ({ ...prev, serviceTierId: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-primary/50 rounded-2xl px-4 py-3 text-xs font-bold outline-none text-slate-700 transition-all"
                        required
                      >
                        <option value="">-- Choisir niveau --</option>
                        {serviceTiers.filter(t => t.isActive).map(t => (
                          <option key={t.id} value={t.id}>{t.name} ({t.durationHours}h, {t.workers} cleaner)</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Surface (m²)</label>
                      <input
                        type="number"
                        placeholder="Ex: 85"
                        value={addFormData.surfaceM2}
                        onChange={e => setAddFormData(prev => ({ ...prev, surfaceM2: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-primary/50 rounded-2xl px-4 py-3 text-xs font-bold outline-none text-slate-700 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Nbr de Pièces</label>
                      <input
                        type="number"
                        placeholder="Ex: 3"
                        value={addFormData.roomsToClean}
                        onChange={e => setAddFormData(prev => ({ ...prev, roomsToClean: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-primary/50 rounded-2xl px-4 py-3 text-xs font-bold outline-none text-slate-700 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Jours/Semaine</label>
                      <select
                        value={addFormData.daysPerWeek}
                        onChange={e => setAddFormData(prev => ({ ...prev, daysPerWeek: parseInt(e.target.value) }))}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-primary/50 rounded-2xl px-4 py-3 text-xs font-bold outline-none text-slate-700 transition-all"
                        required
                      >
                        <option value={1}>1 jour</option>
                        <option value={2}>2 jours</option>
                        <option value={3}>3 jours</option>
                        <option value={4}>4 jours</option>
                        <option value={5}>5 jours</option>
                        <option value={6}>6 jours</option>
                        <option value={7}>7 jours</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Adresse</label>
                    <input
                      type="text"
                      placeholder="Ex: 12 Rue Didouche Mourad, Alger"
                      value={addFormData.address}
                      onChange={e => setAddFormData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-primary/50 rounded-2xl px-4 py-3 text-xs font-bold outline-none text-slate-700 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Localisation Carte</label>
                    <LocationPicker
                      latitude={addFormData.latitude}
                      longitude={addFormData.longitude}
                      onChange={(lat, lng) => setAddFormData(prev => ({ ...prev, latitude: lat, longitude: lng }))}
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Note / Remarques Internes</label>
                    <textarea
                      placeholder="Ajouter des notes ou remarques particulières pour cet abonnement..."
                      value={addFormData.adminNote}
                      onChange={e => setAddFormData(prev => ({ ...prev, adminNote: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-primary/50 rounded-2xl p-4 text-xs font-bold outline-none text-slate-700 min-h-[80px] transition-all"
                    />
                  </div>

                  {/* Pictures selector */}
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Photos du Logement</label>
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
                            pictures: [...(prev.pictures || []), ...base64s]
                          }));
                        }).catch(err => alert("Erreur d'upload: " + err.message));
                      }}
                      className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                    />
                    {addFormData.pictures && addFormData.pictures.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 border border-slate-100 p-3 rounded-2xl bg-slate-50/50 mt-2">
                        {addFormData.pictures.map((pic, index) => (
                          <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-150">
                            <img src={imgUrl(pic)} alt="Preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setAddFormData(prev => ({
                                ...prev,
                                pictures: prev.pictures.filter((_, i) => i !== index)
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

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-black uppercase text-slate-500 hover:text-slate-700 transition-all cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Créer l'abonnement
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
