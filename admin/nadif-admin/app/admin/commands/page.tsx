'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardList, 
  Search, 
  MapPin, 
  Phone, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Clock3, 
  ThumbsUp, 
  Trash2, 
  Eye, 
  Navigation,
  Sparkles, 
  User, 
  X,
  ChevronDown,
  Pencil,
  Save,
  DollarSign
} from 'lucide-react';

interface Command {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  latitude: number;
  longitude: number;
  addressName: string;
  
  // Booked Offer Details
  serviceName: string;
  layoutType: string;         // e.g. f2, f3, f4
  defaultWorkers: number;
  extraWorkers: number;
  useMaterials: boolean;
  productType: 'none' | 'local' | 'imported';
  totalPrice: number;
  durationHours: number;
  
  // Date & Time
  scheduledDate: string;
  scheduledTime: string;
  
  // State: 'pending' (en attente), 'approved', 'completed', 'cancelled'
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  createdAt: string;
  note?: string;
}

const DEFAULT_COMMANDS: Command[] = [
  {
    id: 'CMD-9021',
    firstName: 'Yacine',
    lastName: 'Benali',
    phoneNumber: '+213 555 12 34 56',
    latitude: 36.7538,
    longitude: 3.0588,
    addressName: 'Rue Didouche Mourad, Alger Centre',
    serviceName: 'Grand Service',
    layoutType: 'f3',
    defaultWorkers: 4,
    extraWorkers: 1,
    useMaterials: true,
    productType: 'imported',
    totalPrice: 13700, // Base 8000 + 1200 extra labor + 2000 materials + 2500 products
    durationHours: 4,
    scheduledDate: '2026-05-18',
    scheduledTime: '09:00',
    status: 'pending',
    note: 'Client requested extra care for glass coffee tables.',
    createdAt: '2026-05-17T10:15:30Z'
  },
  {
    id: 'CMD-4819',
    firstName: 'Amine',
    lastName: 'Chaoui',
    phoneNumber: '+213 661 98 76 54',
    latitude: 36.1912,
    longitude: 5.4083,
    addressName: 'Boulevard 1er Novembre, Sétif',
    serviceName: 'Simple Service',
    layoutType: 'f2',
    defaultWorkers: 3,
    extraWorkers: 0,
    useMaterials: false,
    productType: 'none',
    totalPrice: 3000, // Base 3000
    durationHours: 4,
    scheduledDate: '2026-05-19',
    scheduledTime: '14:00',
    status: 'approved',
    note: 'Prefers eco-friendly or non-scented products.',
    createdAt: '2026-05-16T15:20:00Z'
  },
  {
    id: 'CMD-3281',
    firstName: 'Sofia',
    lastName: 'Dahmani',
    phoneNumber: '+213 770 45 67 89',
    latitude: 35.6987,
    longitude: -0.6349,
    addressName: 'Front de Mer, Oran',
    serviceName: 'Semi Grand Service',
    layoutType: 'f4',
    defaultWorkers: 5,
    extraWorkers: 2,
    useMaterials: true,
    productType: 'local',
    totalPrice: 12200, // Base 7500 + 2000 extra labor + 1500 materials + 1200 products
    durationHours: 4,
    scheduledDate: '2026-05-17',
    scheduledTime: '08:30',
    status: 'completed',
    createdAt: '2026-05-15T08:45:00Z'
  }
];

export default function CommandsPage() {
  const [commands, setCommands] = useState<Command[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'completed' | 'cancelled'>('all');
  
  // Selected Order details modal
  const [selectedCommand, setSelectedCommand] = useState<Command | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [commandToDelete, setCommandToDelete] = useState<Command | null>(null);

  // Edit command modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<Command | null>(null);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('nadif_commands');
    if (stored) {
      try {
        setCommands(JSON.parse(stored));
      } catch (e) {
        setCommands(DEFAULT_COMMANDS);
      }
    } else {
      localStorage.setItem('nadif_commands', JSON.stringify(DEFAULT_COMMANDS));
      setCommands(DEFAULT_COMMANDS);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('nadif_commands', JSON.stringify(commands));
    }
  }, [commands, isLoaded]);

  // Update command status on the fly
  const handleUpdateStatus = (id: string, newStatus: 'pending' | 'approved' | 'completed' | 'cancelled') => {
    setCommands(prev => prev.map(cmd => 
      cmd.id === id ? { ...cmd, status: newStatus } : cmd
    ));
    
    // Also update selected command if modal is open
    if (selectedCommand && selectedCommand.id === id) {
      setSelectedCommand(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  // Open Google maps in new tab
  const handleOpenGoogleMaps = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(url, '_blank');
  };

  // Delete Command
  const handleOpenDelete = (cmd: Command, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid opening details modal
    setCommandToDelete(cmd);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (commandToDelete) {
      setCommands(prev => prev.filter(c => c.id !== commandToDelete.id));
      setIsDeleteModalOpen(false);
      setCommandToDelete(null);
    }
  };

  // Triggering the Edit Modal Form
  const handleOpenEdit = (cmd: Command, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditForm({ ...cmd });
    setIsEditModalOpen(true);
  };

  // Dynamically recalculate prices inside the edit form
  const handleEditFormChange = (key: keyof Command, value: any) => {
    setEditForm(prev => {
      if (!prev) return null;
      const updated = { ...prev, [key]: value };
      
      // Auto math triggers if package specifications mutate
      if (key === 'layoutType' || key === 'extraWorkers' || key === 'useMaterials' || key === 'productType' || key === 'serviceName') {
        let basePrice = 3000;
        let extraWorkerRate = 800;
        let materialRate = 1000;
        let localProdRate = 800;
        let importedProdRate = 1500;
        let defaultW = 3;
        
        const service = updated.serviceName.toLowerCase();
        const layout = updated.layoutType.toLowerCase();
        
        if (layout === 'f2') defaultW = 3;
        else if (layout === 'f3') defaultW = 4;
        else if (layout === 'f4') defaultW = 5;
        
        if (service.includes('grand') && !service.includes('semi')) {
          extraWorkerRate = 1200;
          materialRate = 2000;
          localProdRate = 1200;
          importedProdRate = 2500;
          basePrice = layout === 'f2' ? 6500 : layout === 'f3' ? 8000 : 9500;
          
          // Grand Deep Clean forced logic
          updated.useMaterials = true;
          if (updated.productType === 'none') {
            updated.productType = 'local'; // Symmetrical lock
          }
        } else if (service.includes('semi')) {
          extraWorkerRate = 1000;
          materialRate = 1500;
          localProdRate = 1200;
          importedProdRate = 2000;
          basePrice = layout === 'f2' ? 6000 : layout === 'f3' ? 7500 : 9000;
          
          // Semi Grand Deep Clean forced logic
          updated.useMaterials = true;
          if (updated.productType === 'none') {
            updated.productType = 'local'; // Symmetrical lock
          }
        } else {
          // Simple maintenance
          extraWorkerRate = 800;
          materialRate = 1000;
          localProdRate = 800;
          importedProdRate = 1500;
          basePrice = layout === 'f2' ? 3000 : layout === 'f3' ? 4000 : 5000;
        }
        
        let calculated = basePrice;
        calculated += updated.extraWorkers * extraWorkerRate;
        if (updated.useMaterials) calculated += materialRate;
        
        if (updated.productType === 'local') calculated += localProdRate;
        else if (updated.productType === 'imported') calculated += importedProdRate;
        
        updated.totalPrice = calculated;
        updated.defaultWorkers = defaultW;
      }
      
      return updated;
    });
  };

  // Submit edits
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editForm) {
      setCommands(prev => prev.map(cmd => cmd.id === editForm.id ? editForm : cmd));
      setIsEditModalOpen(false);
      setEditForm(null);
    }
  };

  // Effect to load Leaflet maps dynamically for interactive coordinate picks
  useEffect(() => {
    if (!isEditModalOpen || !editForm) return;

    let mapInstance: any = null;
    let markerInstance: any = null;

    const initMap = () => {
      const L = (window as any).L;
      if (!L) return;

      const container = document.getElementById('leaflet-map-picker');
      if (!container) return;

      // Ensure we don't recreate on the same element
      if ((container as any)._leaflet_id) {
        return;
      }

      try {
        const initialLat = editForm.latitude && editForm.latitude !== 0 ? editForm.latitude : 36.1912;
        const initialLng = editForm.longitude && editForm.longitude !== 0 ? editForm.longitude : 5.4083;

        mapInstance = L.map('leaflet-map-picker').setView([initialLat, initialLng], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstance);

        // Fix broken Leaflet icon URLs inside Next.js bundling
        const customIcon = L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41]
        });

        markerInstance = L.marker([initialLat, initialLng], {
          draggable: true,
          icon: customIcon
        }).addTo(mapInstance);

        // Fetch Reverse geocode details helper
        const reverseGeocode = (lat: number, lng: number) => {
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`)
            .then(res => res.json())
            .then(data => {
              if (data && data.display_name) {
                // Remove redundant postal codes or administrative levels for neatness
                const cleanedAddress = data.display_name.split(',').slice(0, 3).join(',').trim();
                handleEditFormChange('addressName', cleanedAddress);
              }
            })
            .catch(() => {});
        };

        // Pin Drag trigger
        markerInstance.on('dragend', () => {
          const position = markerInstance.getLatLng();
          handleEditFormChange('latitude', position.lat);
          handleEditFormChange('longitude', position.lng);
          reverseGeocode(position.lat, position.lng);
        });

        // Map Click trigger
        mapInstance.on('click', (e: any) => {
          markerInstance.setLatLng(e.latlng);
          handleEditFormChange('latitude', e.latlng.lat);
          handleEditFormChange('longitude', e.latlng.lng);
          reverseGeocode(e.latlng.lat, e.latlng.lng);
        });
      } catch (err) {
        console.error('Leaflet initialization failed', err);
      }
    };

    // Lazy load Leaflet CSS & JS from CDN to prevent compile bundle errors
    if (!(window as any).L) {
      // CSS Link
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(cssLink);

      // JS Script
      const jsScript = document.createElement('script');
      jsScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      jsScript.async = true;
      jsScript.onload = () => {
        setTimeout(initMap, 300);
      };
      document.body.appendChild(jsScript);
    } else {
      setTimeout(initMap, 200);
    }

    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [isEditModalOpen, editForm?.id]);

  // Stats Counters
  const countPending = commands.filter(c => c.status === 'pending').length;
  const countApproved = commands.filter(c => c.status === 'approved').length;
  const countCompleted = commands.filter(c => c.status === 'completed').length;
  const countCancelled = commands.filter(c => c.status === 'cancelled').length;

  // Filter commands
  const filteredCommands = commands.filter(cmd => {
    const matchesSearch = 
      `${cmd.firstName} ${cmd.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cmd.phoneNumber.includes(searchQuery) ||
      cmd.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cmd.serviceName.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || cmd.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-10 font-gilmer max-w-7xl mx-auto">
      {/* 1. Header Area */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
          <ClipboardList size={14} className="text-primary" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Order Control Center</span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter text-slate-800 uppercase italic">
          Client <span className="text-primary">Commands</span> Table
        </h1>
        <p className="text-sm text-slate-400 font-medium font-inter">
          Monitor incoming clean reservations, change deployment states, track localized coordinates on Google Maps, and manage customer service deliverables.
        </p>
      </div>

      {/* 2. Command Metrics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Total */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm relative overflow-hidden flex flex-col justify-between">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Bookings</p>
          <p className="text-3xl font-black text-slate-800 mt-2">{commands.length}</p>
          <div className="absolute top-4 right-4 w-2 h-2 bg-slate-400 rounded-full" />
        </div>

        {/* Pending */}
        <div className="bg-amber-50/50 border border-amber-100 p-6 rounded-3xl shadow-sm relative overflow-hidden flex flex-col justify-between">
          <p className="text-[9px] font-black uppercase tracking-widest text-amber-500">En Attente</p>
          <p className="text-3xl font-black text-amber-600 mt-2">{countPending}</p>
          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full absolute top-4 right-4 animate-pulse" />
        </div>

        {/* Approved */}
        <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-3xl shadow-sm relative overflow-hidden flex flex-col justify-between">
          <p className="text-[9px] font-black uppercase tracking-widest text-blue-500">Approved</p>
          <p className="text-3xl font-black text-blue-600 mt-2">{countApproved}</p>
          <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full" />
        </div>

        {/* Completed */}
        <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-3xl shadow-sm relative overflow-hidden flex flex-col justify-between">
          <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Completed</p>
          <p className="text-3xl font-black text-emerald-600 mt-2">{countCompleted}</p>
          <div className="absolute top-4 right-4 w-2 h-2 bg-emerald-500 rounded-full" />
        </div>

        {/* Cancelled */}
        <div className="bg-rose-50/50 border border-rose-100 p-6 rounded-3xl shadow-sm relative overflow-hidden flex flex-col justify-between">
          <p className="text-[9px] font-black uppercase tracking-widest text-rose-500">Cancelled</p>
          <p className="text-3xl font-black text-rose-600 mt-2">{countCancelled}</p>
          <div className="absolute top-4 right-4 w-2 h-2 bg-rose-500 rounded-full" />
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        {/* Search */}
        <div className="relative w-full md:max-w-sm group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input 
            type="text"
            placeholder="Search by name, CMD ID, or package..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-sm font-bold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-primary/20 outline-none transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto shrink-0 justify-end">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'pending', label: 'En Attente' },
            { id: 'approved', label: 'Approved' },
            { id: 'completed', label: 'Completed' },
            { id: 'cancelled', label: 'Cancelled' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border ${
                statusFilter === tab.id 
                  ? 'bg-primary text-white border-primary shadow-md shadow-primary/10' 
                  : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100 hover:text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Orders Content Table (ONE ORDER PER ROW) */}
      {!isLoaded ? (
        <div className="min-h-[30vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredCommands.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-100 rounded-[3rem] shadow-sm max-w-xl mx-auto space-y-6">
          <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center text-primary mx-auto">
            <ClipboardList size={36} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black uppercase tracking-tight text-slate-800">No Commands Found</h3>
            <p className="text-sm text-slate-400 font-semibold max-w-xs mx-auto">
              {searchQuery ? "No matching orders matching your queries." : "Clean bookings will populate here automatically as clients finalize checkouts."}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left min-w-[1200px]">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                  <th className="pb-4 pl-4">Command ID</th>
                  <th className="pb-4">Client Particulars</th>
                  <th className="pb-4">Phone Number</th>
                  <th className="pb-4">Geo Location</th>
                  <th className="pb-4">Booked Deliverables</th>
                  <th className="pb-4">Schedule Plan</th>
                  <th className="pb-4">Total Cost</th>
                  <th className="pb-4">Dynamic State Switch</th>
                  <th className="pb-4 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence mode="popLayout">
                  {filteredCommands.map((command) => (
                    <motion.tr
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={command.id}
                      className="group hover:bg-slate-50/50 transition-colors font-semibold"
                    >
                      {/* CMD ID */}
                      <td className="py-5 pl-4 font-mono text-[10px] text-slate-400 font-black uppercase tracking-wider">
                        {command.id}
                      </td>

                      {/* Client particulars */}
                      <td className="py-5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm font-bold uppercase tracking-tight text-slate-800">
                            {command.firstName} {command.lastName}
                          </span>
                          {command.note && (
                            <span 
                              className="px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-lg text-[8px] font-black uppercase tracking-wider animate-pulse shrink-0 cursor-help"
                              title={`Note: ${command.note}`}
                            >
                              Note
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                          Registered Client
                        </span>
                      </td>

                      {/* Phone */}
                      <td className="py-5 text-xs text-slate-600 font-inter font-bold">
                        <span className="inline-flex items-center gap-1.5">
                          <Phone size={12} className="text-slate-400" />
                          {command.phoneNumber}
                        </span>
                      </td>

                      {/* Localization maps click */}
                      <td className="py-5">
                        <button
                          onClick={() => handleOpenGoogleMaps(command.latitude, command.longitude)}
                          className="px-2.5 py-1.5 bg-rose-50/50 hover:bg-rose-50 text-rose-600 border border-rose-100/50 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95"
                          title={`Coordinates: ${command.latitude}, ${command.longitude}`}
                        >
                          <MapPin size={11} className="fill-rose-100" />
                          View on Maps
                        </button>
                      </td>

                      {/* Booked Deliverables */}
                      <td className="py-5 max-w-[200px]">
                        <span className="text-xs font-bold text-primary block leading-none">{command.serviceName}</span>
                        <span className="text-[9px] text-slate-400 block mt-1 leading-normal uppercase">
                          {command.layoutType} ({command.defaultWorkers + command.extraWorkers}W) • {command.useMaterials ? 'Materials' : 'No Mat'} • {command.productType}
                        </span>
                      </td>

                      {/* Schedule */}
                      <td className="py-5">
                        <span className="text-xs text-slate-700 block font-inter font-bold">{command.scheduledDate}</span>
                        <span className="text-[9px] text-slate-400 font-bold block mt-0.5">{command.scheduledTime} ({command.durationHours}h clean)</span>
                      </td>

                      {/* Total bill */}
                      <td className="py-5 text-sm font-black text-emerald-500">
                        {command.totalPrice} DA
                      </td>

                      {/* Dynamic State Switch Selector Dropdown */}
                      <td className="py-5">
                        <div className="relative inline-block text-left">
                          <select
                            value={command.status}
                            onChange={(e) => handleUpdateStatus(command.id, e.target.value as any)}
                            className={`pl-3 pr-8 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest outline-none border cursor-pointer appearance-none ${
                              command.status === 'pending' && 'bg-amber-50 text-amber-600 border-amber-100'
                            } ${
                              command.status === 'approved' && 'bg-blue-50 text-blue-600 border-blue-100'
                            } ${
                              command.status === 'completed' && 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            } ${
                              command.status === 'cancelled' && 'bg-rose-50 text-rose-600 border-rose-100'
                            }`}
                          >
                            <option value="pending">⏳ En Attente</option>
                            <option value="approved">⚙️ Approved</option>
                            <option value="completed">✅ Completed</option>
                            <option value="cancelled">❌ Cancelled</option>
                          </select>
                          <ChevronDown size={10} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-70" />
                        </div>
                      </td>

                      {/* Row actions */}
                      <td className="py-5 pr-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedCommand(command);
                              setIsDetailsModalOpen(true);
                            }}
                            className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-primary/10 hover:text-primary text-slate-500 flex items-center justify-center border border-slate-100 transition-all cursor-pointer"
                            title="Inspect Order Particulars"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={(e) => handleOpenEdit(command, e)}
                            className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-amber-50 hover:text-amber-600 text-slate-500 flex items-center justify-center border border-slate-100 transition-all cursor-pointer"
                            title="Modify Order Details"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={(e) => handleOpenDelete(command, e)}
                            className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-400 border border-slate-100 flex items-center justify-center transition-all cursor-pointer"
                            title="Retract Order"
                          >
                            <Trash2 size={13} />
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

      {/* 5. DYNAMIC FULL COMMAND DETAILS DIALOG MODAL */}
      <AnimatePresence>
        {isDetailsModalOpen && selectedCommand && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDetailsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-[600px] bg-white rounded-[3rem] shadow-2xl border border-slate-100 relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="h-2 bg-gradient-to-r from-primary via-primary-400 to-secondary shrink-0" />

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
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{selectedCommand.id}</span>
                    <h2 className="text-2xl font-black uppercase italic tracking-tight text-slate-800">
                      Clean Reservation
                    </h2>
                    <p className="text-xs text-slate-400 font-semibold font-inter">
                      Created on {new Date(selectedCommand.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mt-1 inline-flex items-center gap-1.5 ${
                    selectedCommand.status === 'pending' && 'bg-amber-50 text-amber-600 border border-amber-100'
                  } ${
                    selectedCommand.status === 'approved' && 'bg-blue-50 text-blue-600 border border-blue-100'
                  } ${
                    selectedCommand.status === 'completed' && 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  } ${
                    selectedCommand.status === 'cancelled' && 'bg-rose-50 text-rose-600 border border-rose-100'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      selectedCommand.status === 'pending' && 'bg-amber-500 animate-pulse'
                    } ${
                      selectedCommand.status === 'approved' && 'bg-blue-500'
                    } ${
                      selectedCommand.status === 'completed' && 'bg-emerald-500'
                    } ${
                      selectedCommand.status === 'cancelled' && 'bg-rose-500'
                    }`} />
                    {selectedCommand.status === 'pending' ? 'En Attente' : selectedCommand.status}
                  </span>
                </div>

                {/* Client Information details */}
                <div className="space-y-4 border border-slate-100 rounded-3xl p-6 bg-slate-50/50">
                  <h3 className="text-xs font-black uppercase text-slate-800 border-b border-slate-100 pb-2">
                    Client Details
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="space-y-1">
                      <span className="text-slate-400 block text-[9px] font-black uppercase">First Name</span>
                      <span className="text-slate-800 text-sm font-bold">{selectedCommand.firstName}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 block text-[9px] font-black uppercase">Last Name</span>
                      <span className="text-slate-800 text-sm font-bold">{selectedCommand.lastName}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 block text-[9px] font-black uppercase">Contact Phone</span>
                      <span className="text-slate-800 text-sm font-bold flex items-center gap-1">
                        <Phone size={12} className="text-primary" /> {selectedCommand.phoneNumber}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 block text-[9px] font-black uppercase">Scheduling</span>
                      <span className="text-slate-800 text-sm font-bold flex items-center gap-1.5">
                        <Calendar size={12} className="text-primary" /> {selectedCommand.scheduledDate} @ {selectedCommand.scheduledTime}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 mt-2 space-y-2">
                    <span className="text-slate-400 block text-[9px] font-black uppercase">Geo Location Address</span>
                    <p className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      <MapPin size={14} className="text-rose-500 fill-rose-100 shrink-0" />
                      {selectedCommand.addressName}
                    </p>
                    <div className="pt-2">
                      <button
                        onClick={() => handleOpenGoogleMaps(selectedCommand.latitude, selectedCommand.longitude)}
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all"
                      >
                        <Navigation size={12} className="fill-white/10" />
                        Locate with Google Maps
                      </button>
                    </div>
                  </div>
                </div>

                {/* Offer Deliverables Details */}
                <div className="space-y-4 border border-slate-100 rounded-3xl p-6 bg-slate-50/50">
                  <h3 className="text-xs font-black uppercase text-slate-800 border-b border-slate-100 pb-2">
                    Clean Offer Details
                  </h3>

                  <div className="divide-y divide-slate-100 text-xs font-semibold space-y-2">
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Cleaning Package:</span>
                      <span className="text-primary font-bold">{selectedCommand.serviceName}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-400">House layout size:</span>
                      <span className="text-slate-800 uppercase">{selectedCommand.layoutType} Layout</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-400">Deployed Labor:</span>
                      <span className="text-slate-800">
                        {selectedCommand.defaultWorkers + selectedCommand.extraWorkers} Workers ({selectedCommand.defaultWorkers} Default + {selectedCommand.extraWorkers} Extra)
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-400">Equipment materials:</span>
                      <span className="text-slate-800">{selectedCommand.useMaterials ? 'Nadif materials included' : 'Client provides materials'}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-400">Products origin:</span>
                      <span className="text-slate-800 uppercase">
                        {selectedCommand.productType === 'none' && 'Client own products'}
                        {selectedCommand.productType === 'local' && 'Nadif local products'}
                        {selectedCommand.productType === 'imported' && 'Nadif premium imported products'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-t border-slate-100 pt-2">
                      <span className="text-slate-400 font-bold">Total calculated bill:</span>
                      <span className="text-emerald-500 font-black text-base">{selectedCommand.totalPrice} DA</span>
                    </div>
                  </div>
                </div>

                {/* Note Details */}
                {selectedCommand.note && (
                  <div className="space-y-2 border border-slate-100 rounded-3xl p-6 bg-slate-50/50">
                    <span className="text-slate-400 block text-[9px] font-black uppercase">Client / Admin Instructions Note</span>
                    <p className="text-xs font-semibold text-slate-700 font-inter italic leading-relaxed bg-white border border-slate-100 p-4 rounded-2xl">
                      💡 "{selectedCommand.note}"
                    </p>
                  </div>
                )}

                {/* Dynamic Status Action workflows */}
                <div className="space-y-4 border border-slate-100 rounded-3xl p-6 bg-slate-50/50">
                  <div className="space-y-1">
                    <h3 className="text-xs font-black uppercase text-slate-800">
                      Update Reservation State
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 leading-normal">
                      Transition reservation cycles. Clients are notified on status shifts.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {/* Pending */}
                    <button
                      onClick={() => handleUpdateStatus(selectedCommand.id, 'pending')}
                      className={`py-3 px-2 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                        selectedCommand.status === 'pending'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/10'
                          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-800'
                      }`}
                    >
                      <Clock3 size={14} />
                      En Attente
                    </button>

                    {/* Approved */}
                    <button
                      onClick={() => handleUpdateStatus(selectedCommand.id, 'approved')}
                      className={`py-3 px-2 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                        selectedCommand.status === 'approved'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/10'
                          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-800'
                      }`}
                    >
                      <ThumbsUp size={14} />
                      Approve
                    </button>

                    {/* Completed */}
                    <button
                      onClick={() => handleUpdateStatus(selectedCommand.id, 'completed')}
                      className={`py-3 px-2 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                        selectedCommand.status === 'completed'
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/10'
                          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-800'
                      }`}
                    >
                      <CheckCircle size={14} />
                      Complete
                    </button>

                    {/* Cancelled */}
                    <button
                      onClick={() => handleUpdateStatus(selectedCommand.id, 'cancelled')}
                      className={`py-3 px-2 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                        selectedCommand.status === 'cancelled'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/10'
                          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-800'
                      }`}
                    >
                      <XCircle size={14} />
                      Cancel
                    </button>
                  </div>
                </div>
              </div>

              {/* Close footer */}
              <div className="p-8 border-t border-slate-100 bg-slate-50 flex shrink-0">
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

      {/* 6. EDIT RESEVERTION DIALOG MODAL (ADMIN CONTROL FORM) */}
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
              className="w-full max-w-[650px] bg-white rounded-[3rem] shadow-2xl border border-slate-100 relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
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
                  {/* Title Header */}
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{editForm.id}</span>
                    <h2 className="text-2xl font-black uppercase italic tracking-tight text-slate-800">
                      Modify Clean <span className="text-primary">Reservation</span>
                    </h2>
                    <p className="text-xs text-slate-400 font-semibold font-inter">
                      Fine-tune customer requirements, adjust worker scaling levels, and configure pricing models manually.
                    </p>
                  </div>

                  <div className="w-full h-px bg-slate-100" />

                  {/* Section A: Customer Details */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                      1. Customer Contact & Location Map
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">First Name</label>
                        <input
                          type="text"
                          required
                          value={editForm.firstName}
                          onChange={(e) => handleEditFormChange('firstName', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Last Name</label>
                        <input
                          type="text"
                          required
                          value={editForm.lastName}
                          onChange={(e) => handleEditFormChange('lastName', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Phone Number</label>
                        <input
                          type="text"
                          required
                          value={editForm.phoneNumber}
                          onChange={(e) => handleEditFormChange('phoneNumber', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all"
                        />
                      </div>

                      {/* INTERACTIVE MAP SELECTION */}
                      <div className="sm:col-span-2 space-y-2">
                        <label className="block text-[9px] font-black uppercase text-slate-400">
                          Select Delivery Coordinates on Map (Drag Pin or Click Map)
                        </label>
                        <div 
                          id="leaflet-map-picker" 
                          className="w-full h-64 rounded-3xl border border-slate-200 overflow-hidden relative shadow-inner z-0" 
                          style={{ minHeight: '260px' }}
                        />
                        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100 text-[10px] font-mono text-slate-500">
                          <span>📍 LAT: <strong>{editForm.latitude.toFixed(6)}</strong></span>
                          <span>📍 LNG: <strong>{editForm.longitude.toFixed(6)}</strong></span>
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Address Name (Auto geocoded)</label>
                        <input
                          type="text"
                          required
                          value={editForm.addressName}
                          onChange={(e) => handleEditFormChange('addressName', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-px bg-slate-100" />

                  {/* Section B: Offer Configuration */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                      2. Clean Offer Specifications
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Service Package */}
                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Service Offer</label>
                        <div className="relative">
                          <select
                            value={editForm.serviceName}
                            onChange={(e) => handleEditFormChange('serviceName', e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-primary/20 appearance-none cursor-pointer"
                          >
                            <option value="Simple Service">Simple Service</option>
                            <option value="Semi Grand Service">Semi Grand Service</option>
                            <option value="Grand Service">Grand Service</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                        </div>
                      </div>

                      {/* Layout Type */}
                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">House Layout Type</label>
                        <div className="relative">
                          <select
                            value={editForm.layoutType}
                            onChange={(e) => handleEditFormChange('layoutType', e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-primary/20 appearance-none cursor-pointer uppercase"
                          >
                            <option value="f2">F2 Layout</option>
                            <option value="f3">F3 Layout</option>
                            <option value="f4">F4 Layout</option>
                            <option value="f5">F5 Layout</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                        </div>
                      </div>

                      {/* Extra Workers */}
                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">
                          Extra Workers (Default: {editForm.defaultWorkers})
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          required
                          value={editForm.extraWorkers}
                          onChange={(e) => handleEditFormChange('extraWorkers', parseInt(e.target.value))}
                          className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all"
                        />
                      </div>

                      {/* Clean Duration (Hours) */}
                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Clean Duration (Hours)</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={editForm.durationHours}
                          onChange={(e) => handleEditFormChange('durationHours', parseInt(e.target.value))}
                          className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all"
                        />
                      </div>

                      {/* Materials Toggle */}
                      <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-transparent sm:col-span-2">
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">Provide Cleaning Materials</span>
                          <span className="text-[9px] text-slate-400 block font-semibold">
                            (Forced on for Grand / Semi Grand Deep Clean Package offers)
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={editForm.useMaterials}
                          disabled={editForm.serviceName !== 'Simple Service'}
                          onChange={(e) => handleEditFormChange('useMaterials', e.target.checked)}
                          className="w-5 h-5 accent-primary cursor-pointer disabled:opacity-50"
                        />
                      </div>

                      {/* Products Options */}
                      <div className="sm:col-span-2">
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">
                          Provide Cleaning Products
                          {editForm.serviceName !== 'Simple Service' && (
                            <span className="text-primary italic ml-1"> (Forced: Local or Imported products only!)</span>
                          )}
                        </label>
                        <div className="relative">
                          <select
                            value={editForm.productType}
                            onChange={(e) => handleEditFormChange('productType', e.target.value as any)}
                            className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-primary/20 appearance-none cursor-pointer"
                          >
                            {editForm.serviceName === 'Simple Service' && (
                              <option value="none">Own Products (0 DA)</option>
                            )}
                            <option value="local">Nadif Local Products Surcharge</option>
                            <option value="imported">Nadif Imported Premium Surcharge</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-px bg-slate-100" />

                  {/* Section C: Timing & Pricing */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                      3. Rescheduling & Final Surcharge Adjuster
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Scheduled Date */}
                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Date of cleaner arrival</label>
                        <input
                          type="date"
                          required
                          value={editForm.scheduledDate}
                          onChange={(e) => handleEditFormChange('scheduledDate', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all"
                        />
                      </div>

                      {/* Scheduled Time */}
                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Clean arrival hour</label>
                        <input
                          type="time"
                          required
                          value={editForm.scheduledTime}
                          onChange={(e) => handleEditFormChange('scheduledTime', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all"
                        />
                      </div>

                      {/* Total Price Override */}
                      <div className="sm:col-span-2 bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-black uppercase text-slate-800 block tracking-tight">Total Billing Cost (DA)</span>
                          <span className="text-[9px] text-slate-400 block font-semibold leading-normal mt-0.5">
                            (Recalculates automatically, but you can override manually here!)
                          </span>
                        </div>
                        <div className="relative max-w-[150px] shrink-0">
                          <input
                            type="number"
                            min="0"
                            required
                            value={editForm.totalPrice}
                            onChange={(e) => handleEditFormChange('totalPrice', parseInt(e.target.value))}
                            className="w-full pl-8 pr-4 py-3 bg-white border border-emerald-200 rounded-2xl text-sm font-black text-emerald-600 outline-none focus:border-emerald-500"
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-500">DA</span>
                        </div>
                      </div>

                      {/* Reservation Status */}
                      <div className="sm:col-span-2">
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Deployment Status</label>
                        <div className="relative">
                          <select
                            value={editForm.status}
                            onChange={(e) => handleEditFormChange('status', e.target.value as any)}
                            className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-primary/20 appearance-none cursor-pointer uppercase"
                          >
                            <option value="pending">⏳ En Attente (Pending)</option>
                            <option value="approved">⚙️ Approved</option>
                            <option value="completed">✅ Completed</option>
                            <option value="cancelled">❌ Cancelled</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                        </div>
                      </div>

                      {/* Admin Note */}
                      <div className="sm:col-span-2">
                        <label className="block text-[9px] font-black uppercase text-slate-400 mb-1.5">Reservation & Admin Notes</label>
                        <textarea
                          rows={3}
                          value={editForm.note || ''}
                          onChange={(e) => handleEditFormChange('note', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-primary/20 outline-none transition-all resize-none font-inter"
                          placeholder="Enter custom instructions or client specific feedback notes..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
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
                    Save Reservation File
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. DELETE CONFIRM DIALOG MODAL */}
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
                  Delete Order?
                </h3>
                <p className="text-sm text-slate-400 font-semibold max-w-[280px] mx-auto leading-relaxed">
                  Are you sure you want to delete command <span className="font-bold text-slate-700">"{commandToDelete?.id}"</span> for client {commandToDelete?.firstName} {commandToDelete?.lastName}? This action is irreversible.
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
