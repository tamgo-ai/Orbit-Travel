import React, { useState } from 'react';
import { Vehicle, Booking, Driver, VehicleCategory, BookingStatus, Coupon, EmailLog, Client, TaskType, DriverTask, Downtime, Incident } from '../types';
import { generateLuxuryDescription } from '../services/geminiService';
import { Plus, Users, Car, Calendar as CalendarIcon, X, Wand2, User, Edit, Mail, Tag, Upload, Trash2, Clock, DollarSign, LayoutDashboard, GanttChartSquare, Briefcase, Plane, Map, Shield, ShieldAlert, BadgePercent, ChevronLeft, ChevronRight, Settings, Truck, Check, AlertTriangle, PenTool, Wrench, CalendarOff, Filter, CheckCircle, Power, Search, ArrowUpDown, Bell, BellOff } from 'lucide-react';
import ClientView from './ClientView';

interface AdminDashboardProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  bookings: Booking[];
  coupons: Coupon[];
  emails: EmailLog[];
  clients: Client[];
  downtimes: Downtime[];
  incidents: Incident[];
  onAddVehicle: (vehicle: Vehicle) => void;
  onUpdateVehicle: (vehicle: Vehicle) => void;
  onAddDriver: (driver: Driver) => void;
  onUpdateDriver: (driver: Driver) => void;
  onAddCoupon: (coupon: Coupon) => void;
  onAssignTask: (bookingId: string, driverId: string, taskType: TaskType, startTime: string, endTime: string) => void;
  onEditBooking: (booking: Booking) => void;
  onAdminBook: (booking: Omit<Booking, 'id' | 'status' | 'createdAt' | 'driverId' | 'paymentStatus' | 'clientId' | 'logistics' | 'notificationsEnabled'>, clientDetails: { name: string, email: string, phone: string }, sendNotifications: boolean) => void;
  onAddClient: (client: Client) => void;
  onUpdateClient: (client: Client) => void;
  onAddDowntime: (downtime: Downtime) => void;
  onAddIncident: (incident: Incident) => void;
  onToggleTaskCompletion: (driverId: string, taskId: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  vehicles, 
  drivers, 
  bookings, 
  coupons,
  emails,
  clients,
  downtimes,
  incidents,
  onAddVehicle,
  onUpdateVehicle,
  onAddDriver,
  onUpdateDriver,
  onAddCoupon,
  onAssignTask,
  onEditBooking,
  onAdminBook,
  onAddClient,
  onUpdateClient,
  onAddDowntime,
  onAddIncident,
  onToggleTaskCompletion
}) => {
  const [view, setView] = useState<'overview' | 'timeline' | 'crm' | 'fleet' | 'drivers' | 'bookings' | 'marketing' | 'create_booking'>('overview');
  
  // Modal States
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [isEditBookingOpen, setIsEditBookingOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isLogisticsModalOpen, setIsLogisticsModalOpen] = useState(false);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  
  // Selection States
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [selectedBookingForLogistics, setSelectedBookingForLogistics] = useState<Booking | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  // Live Map State
  const [showLiveMap, setShowLiveMap] = useState(false);
  
  // Filter States
  const [driverFilter, setDriverFilter] = useState<'all' | 'available' | 'on-trip' | 'off-duty'>('all');

  // Booking Filters
  const [bookingStatusFilter, setBookingStatusFilter] = useState<BookingStatus | 'ALL'>('ALL');
  const [bookingTypeFilter, setBookingTypeFilter] = useState<'ALL' | 'airport' | 'hotel' | 'address'>('ALL');
  const [bookingDateStart, setBookingDateStart] = useState('');
  const [bookingDateEnd, setBookingDateEnd] = useState('');
  const [bookingClientSearch, setBookingClientSearch] = useState('');
  const [bookingVehicleFilter, setBookingVehicleFilter] = useState('ALL');

  // CRM Filters
  const [crmSearch, setCrmSearch] = useState('');
  const [crmSort, setCrmSort] = useState<'spend_desc' | 'spend_asc' | 'name_asc'>('spend_desc');

  // Forms
  const [newVehicleName, setNewVehicleName] = useState('');
  const [newVehicleCategory, setNewVehicleCategory] = useState<VehicleCategory>(VehicleCategory.SUV_LUXURY);
  const [newVehiclePrice, setNewVehiclePrice] = useState(0);
  const [newVehicleFeatures, setNewVehicleFeatures] = useState('');
  const [generatedDesc, setGeneratedDesc] = useState('');
  const [newVehicleImage, setNewVehicleImage] = useState('https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1000');
  const [newVehicleStatus, setNewVehicleStatus] = useState<'active' | 'maintenance' | 'retired'>('active');
  const [isGenerating, setIsGenerating] = useState(false);
  const [editTab, setEditTab] = useState<'details' | 'downtime' | 'schedule'>('details'); // Updated Tabs

  // Driver Form
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverPhone, setNewDriverPhone] = useState('');
  const [newDriverLicense, setNewDriverLicense] = useState('');
  const [newDriverPhoto, setNewDriverPhoto] = useState('https://i.pravatar.cc/150');
  const [newDriverRate, setNewDriverRate] = useState(200);
  const [newDriverShiftStart, setNewDriverShiftStart] = useState('08:00');
  const [newDriverShiftEnd, setNewDriverShiftEnd] = useState('20:00');
  const [newDriverArmed, setNewDriverArmed] = useState(false);
  const [newDriverManualStatus, setNewDriverManualStatus] = useState<'unavailable' | 'on-call' | ''>(''); // Manual override

  // New Client Form
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientCompany, setNewClientCompany] = useState('');
  const [newClientNotes, setNewClientNotes] = useState('');
  const [newClientStatus, setNewClientStatus] = useState<'VIP' | 'Regular' | 'New'>('New');

  // Downtime Form
  const [downtimeStart, setDowntimeStart] = useState('');
  const [downtimeEnd, setDowntimeEnd] = useState('');
  const [downtimeNote, setDowntimeNote] = useState('');

  // Incident Form
  const [incidentDesc, setIncidentDesc] = useState('');
  const [incidentCost, setIncidentCost] = useState(0);
  const [incidentVehicleId, setIncidentVehicleId] = useState('');

  // Coupon Form
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponPercent, setNewCouponPercent] = useState(10);

  // --- Helpers ---

  // Helper to dynamically calculate driver status
  const getDriverCurrentStatus = (driver: Driver): 'available' | 'on-trip' | 'off-duty' | 'on-call' => {
      // 1. Manual Override takes precedence
      if (driver.manualStatus === 'unavailable') return 'off-duty';
      if (driver.manualStatus === 'on-call') return 'on-call';

      const now = new Date().getTime();

      // 2. Check Tasks (Including short delivery/collection tasks)
      // This ensures status is 'on-trip' even during a 30min vehicle delivery
      const activeTask = driver.schedule.find(t => {
          const start = new Date(t.startTime).getTime();
          const end = new Date(t.endTime).getTime();
          return now >= start && now <= end && !t.isCompleted;
      });

      if (activeTask) return 'on-trip';

      // 3. Check Scheduled Downtime
      const isDown = downtimes.some(dt => {
           if (dt.resourceId !== driver.id) return false;
           const start = new Date(dt.startDate).getTime();
           // Downtime dates are typically YYYY-MM-DD, treating as full day inclusive
           const end = new Date(dt.endDate).getTime() + 86400000; 
           return now >= start && now <= end;
      });

      if (isDown) return 'off-duty';

      return 'available';
  };

  const checkDriverAvailability = (driver: Driver, start: string, end: string): boolean => {
      // 1. Check Manual Override
      if (driver.manualStatus === 'unavailable') return false;

      const neededStart = new Date(start).getTime();
      const neededEnd = new Date(end).getTime();

      // 2. Check Schedule (Task Overlap)
      const busyWithTasks = driver.schedule.some(task => {
          const taskStart = new Date(task.startTime).getTime();
          const taskEnd = new Date(task.endTime).getTime();
          // Check for any overlap
          return (neededStart < taskEnd && neededEnd > taskStart);
      });

      if (busyWithTasks) return false;

      // 3. Check Planned Downtime
      const hasDowntime = downtimes.some(dt => {
          if (dt.resourceId !== driver.id) return false;
          const dtStart = new Date(dt.startDate).getTime();
          const dtEnd = new Date(dt.endDate).getTime();
          // Add 24h to endDate to make it inclusive for day checks
          return (neededStart < (dtEnd + 86400000) && neededEnd > dtStart);
      });

      return !hasDowntime;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateDescription = async () => {
    if (!newVehicleName) return;
    setIsGenerating(true);
    const featuresList = newVehicleFeatures.split(',').map(f => f.trim());
    const desc = await generateLuxuryDescription(newVehicleName, newVehicleCategory, featuresList);
    setGeneratedDesc(desc);
    setIsGenerating(false);
  };

  // --- VEHICLE ACTIONS ---

  const openVehicleModal = (vehicle?: Vehicle) => {
      setEditTab('details');
      if (vehicle) {
          setEditingVehicle(vehicle);
          setNewVehicleName(vehicle.name);
          setNewVehicleCategory(vehicle.category);
          setNewVehiclePrice(vehicle.pricePerDay);
          setNewVehicleFeatures(vehicle.features.join(', '));
          setGeneratedDesc(vehicle.description);
          setNewVehicleImage(vehicle.imageUrl);
          setNewVehicleStatus(vehicle.status);
      } else {
          setEditingVehicle(null);
          setNewVehicleName('');
          setNewVehicleCategory(VehicleCategory.SUV_LUXURY);
          setNewVehiclePrice(0);
          setNewVehicleFeatures('');
          setGeneratedDesc('');
          setNewVehicleImage('https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1000');
          setNewVehicleStatus('active');
      }
      setIsVehicleModalOpen(true);
  };

  const handleVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const vehicleData: Vehicle = {
      id: editingVehicle ? editingVehicle.id : `v${Date.now()}`,
      name: newVehicleName,
      category: newVehicleCategory,
      pricePerDay: newVehiclePrice,
      description: generatedDesc || 'Luxury vehicle.',
      features: newVehicleFeatures.split(',').map(f => f.trim()),
      imageUrl: newVehicleImage,
      available: true,
      plate: editingVehicle ? editingVehicle.plate : `ORBIT-${Math.floor(Math.random() * 1000)}`,
      status: newVehicleStatus
    };

    if (editingVehicle) {
        onUpdateVehicle(vehicleData);
    } else {
        onAddVehicle(vehicleData);
    }
    setIsVehicleModalOpen(false);
  };

  // --- DRIVER ACTIONS ---

  const openDriverModal = (driver?: Driver) => {
      setEditTab('details');
      if (driver) {
          setEditingDriver(driver);
          setNewDriverName(driver.name);
          setNewDriverPhone(driver.phone);
          setNewDriverLicense(driver.licenseNumber);
          setNewDriverPhoto(driver.avatarUrl);
          setNewDriverRate(driver.ratePerDay);
          setNewDriverShiftStart(driver.shiftStart);
          setNewDriverShiftEnd(driver.shiftEnd);
          setNewDriverArmed(driver.isArmed);
          setNewDriverManualStatus(driver.manualStatus || '');
      } else {
          setEditingDriver(null);
          setNewDriverName('');
          setNewDriverPhone('');
          setNewDriverLicense('');
          setNewDriverPhoto('https://i.pravatar.cc/150');
          setNewDriverRate(200);
          setNewDriverShiftStart('08:00');
          setNewDriverShiftEnd('20:00');
          setNewDriverArmed(false);
          setNewDriverManualStatus('');
      }
      setIsDriverModalOpen(true);
  };

  const handleDriverSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const driverData: Driver = {
          id: editingDriver ? editingDriver.id : `d${Date.now()}`,
          name: newDriverName,
          phone: newDriverPhone,
          licenseNumber: newDriverLicense,
          avatarUrl: newDriverPhoto,
          rating: editingDriver ? editingDriver.rating : 5.0,
          status: 'available', // Placeholder, calculated dynamically now
          manualStatus: newDriverManualStatus === '' ? null : newDriverManualStatus as any,
          ratePerDay: newDriverRate,
          shiftStart: newDriverShiftStart,
          shiftEnd: newDriverShiftEnd,
          isArmed: newDriverArmed,
          schedule: editingDriver ? editingDriver.schedule : []
      };

      if (editingDriver) {
          onUpdateDriver(driverData);
      } else {
          onAddDriver(driverData);
      }
      setIsDriverModalOpen(false);
  }

  // --- DOWNTIME ---

  const handleAddDowntimeSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const resourceId = editingVehicle ? editingVehicle.id : editingDriver ? editingDriver.id : '';
      if (!resourceId) return;

      const type = editingVehicle ? 'maintenance' : 'vacation';
      
      onAddDowntime({
          id: `dt${Date.now()}`,
          resourceId,
          type,
          startDate: downtimeStart,
          endDate: downtimeEnd,
          note: downtimeNote
      });

      // Clear form but keep modal open
      setDowntimeStart('');
      setDowntimeEnd('');
      setDowntimeNote('');
  };

  // --- INCIDENT ---
  const handleIncidentSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onAddIncident({
          id: `inc${Date.now()}`,
          vehicleId: incidentVehicleId,
          date: new Date().toISOString().split('T')[0],
          description: incidentDesc,
          costEstimate: incidentCost,
          status: 'reported'
      });
      setIsIncidentModalOpen(false);
      setIncidentDesc('');
      setIncidentCost(0);
      setIncidentVehicleId('');
  }

  // ... (Client and Coupon handlers same as before)
  const handleClientSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingClient) {
          onUpdateClient({ ...editingClient, name: newClientName, email: newClientEmail, phone: newClientPhone, company: newClientCompany, notes: newClientNotes, status: newClientStatus });
          setEditingClient(null);
      } else {
          onAddClient({ id: `c${Date.now()}`, name: newClientName, email: newClientEmail, phone: newClientPhone, company: newClientCompany, notes: newClientNotes, status: newClientStatus, totalSpent: 0, joinDate: new Date().toISOString().split('T')[0] });
      }
      setIsClientModalOpen(false);
      resetClientForm();
  }
  const resetClientForm = () => { setNewClientName(''); setNewClientEmail(''); setNewClientPhone(''); setNewClientCompany(''); setNewClientNotes(''); setNewClientStatus('New'); }
  const handleAddCoupon = (e: React.FormEvent) => { e.preventDefault(); onAddCoupon({ code: newCouponCode, discountPercent: newCouponPercent / 100, active: true }); setNewCouponCode(''); }

  return (
    <div className="max-w-7xl mx-auto">
      {/* SaaS Header Controls */}
      <div className="flex flex-col xl:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-serif text-white">ORBIT <span className="text-orbit-gold">Enterprise</span></h2>
          <p className="text-gray-400 text-sm">Global Operations Dashboard</p>
        </div>
        <div className="flex flex-wrap gap-2 bg-black/40 p-1 rounded-lg border border-white/10">
          {[
            { id: 'overview', icon: LayoutDashboard },
            { id: 'timeline', icon: GanttChartSquare },
            { id: 'crm', icon: Briefcase },
            { id: 'bookings', icon: CalendarIcon },
            { id: 'fleet', icon: Car },
            { id: 'drivers', icon: Shield },
            { id: 'marketing', icon: BadgePercent },
          ].map(v => (
            <button key={v.id} onClick={() => setView(v.id as any)} className={`flex items-center gap-2 px-4 py-2 rounded text-sm uppercase tracking-wider transition-colors ${view === v.id ? 'bg-white/10 text-white font-bold border border-white/20' : 'text-gray-500 hover:text-gray-300'}`}>
              <v.icon size={16} /><span className="hidden md:inline">{v.id}</span>
            </button>
          ))}
          <button onClick={() => setView('create_booking')} className={`flex items-center gap-2 px-4 py-2 rounded text-sm uppercase tracking-wider transition-colors bg-orbit-gold text-black font-bold`}><Plus size={16} /></button>
        </div>
      </div>

      {/* KPI Cards (Overview) */}
      {view === 'overview' && (
        <div className="space-y-12 animate-fade-in">
             <div className="flex justify-end"><button onClick={() => setShowLiveMap(!showLiveMap)} className={`flex items-center gap-2 px-4 py-2 rounded border transition-colors ${showLiveMap ? 'bg-orbit-gold text-black border-orbit-gold' : 'text-orbit-gold border-orbit-gold hover:bg-orbit-gold/10'}`}><Map size={16} /> {showLiveMap ? 'Hide Live Map' : 'Show Live Tracker'}</button></div>
            {showLiveMap && (<div className="h-96 w-full glass-panel rounded-xl relative overflow-hidden flex items-center justify-center bg-[#0e0e15]"><div className="absolute inset-0 opacity-30 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center grayscale contrast-125"></div><div className="relative z-10 text-center"><div className="animate-pulse w-4 h-4 bg-orbit-gold rounded-full mx-auto mb-2 shadow-[0_0_20px_#D4AF37]"></div><p className="text-orbit-gold font-mono text-sm tracking-widest">SATELLITE LINK ESTABLISHED</p></div></div>)}
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-panel p-6 rounded-xl border-t-4 border-t-orbit-gold"><div className="flex justify-between mb-4"><span className="text-gray-400 text-xs uppercase">Active Jobs</span><Car size={20}/></div><span className="text-3xl font-bold text-white">{bookings.filter(b => b.status === BookingStatus.CONFIRMED).length}</span></div>
                 <div className="glass-panel p-6 rounded-xl border-t-4 border-t-red-500"><div className="flex justify-between mb-4"><span className="text-gray-400 text-xs uppercase">Incidents</span><AlertTriangle size={20} className="text-red-500"/></div><span className="text-3xl font-bold text-white">{incidents.filter(i => i.status !== 'resolved').length}</span></div>
                 <div className="glass-panel p-6 rounded-xl border-t-4 border-t-blue-500"><div className="flex justify-between mb-4"><span className="text-gray-400 text-xs uppercase">Scheduled Downtime</span><CalendarOff size={20}/></div><span className="text-3xl font-bold text-white">{downtimes.length}</span></div>
            </div>
        </div>
      )}

      {/* TIMELINE VIEW (Simplified for this snippet, mostly unchanged logic) */}
      {view === 'timeline' && (
         <div className="glass-panel rounded-xl overflow-hidden animate-fade-in p-6">
              <h3 className="text-xl text-white mb-6">Operations Timeline (14 Day Outlook)</h3>
              <div className="overflow-x-auto pb-4 custom-scrollbar">
                <div className="min-w-[1200px]">
                    <div className="flex border-b border-white/10 pb-2 mb-2">
                        <div className="w-48 shrink-0 text-xs font-bold text-gray-400 uppercase tracking-widest pl-2">Resource</div>
                        <div className="flex-1 flex">
                            {Array.from({ length: 14 }).map((_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return <div key={i} className="flex-1 text-center border-l border-white/5"><div className="text-[10px] text-gray-500 uppercase">{d.toLocaleDateString('en-US', { weekday: 'short' })}</div><div className="text-sm font-bold text-white">{d.getDate()}</div></div>; })}
                        </div>
                    </div>
                    
                    {/* Vehicles Section */}
                    <div className="mb-2 pl-2 text-xs uppercase text-orbit-gold font-bold tracking-widest">Fleet Assets</div>
                    <div className="space-y-2 mb-8">
                        {vehicles.map(vehicle => (
                            <div key={vehicle.id} className="flex items-center h-16 rounded-lg border border-white/5 bg-white/5 transition-colors">
                                <div className="w-48 shrink-0 p-3 border-r border-white/5 relative">
                                    <div className="font-bold text-white text-sm truncate">{vehicle.name}</div>
                                    <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${vehicle.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div><span className="text-xs text-gray-500 uppercase">{vehicle.plate}</span></div>
                                </div>
                                <div className="flex-1 h-full relative">
                                    <div className="absolute inset-0 flex pointer-events-none">{Array.from({ length: 14 }).map((_, i) => <div key={i} className="flex-1 border-l border-white/5 h-full"></div>)}</div>
                                    
                                    {/* RENDER VEHICLE BOOKINGS */}
                                    {bookings.filter(b => b.vehicleId === vehicle.id && b.status !== BookingStatus.CANCELLED).map(b => {
                                            const today = new Date(); today.setHours(0,0,0,0);
                                            const start = new Date(b.startDate); const end = new Date(b.endDate);
                                            const diffTimeStart = start.getTime() - today.getTime(); const diffDaysStart = Math.ceil(diffTimeStart / (1000 * 60 * 60 * 24)); 
                                            const diffTimeEnd = end.getTime() - start.getTime(); const durationDays = Math.ceil(diffTimeEnd / (1000 * 60 * 60 * 24)) + 1;
                                            if (diffDaysStart > 14 || diffDaysStart + durationDays < 0) return null;
                                            let left = (diffDaysStart / 14) * 100; let width = (durationDays / 14) * 100;
                                            if (left < 0) { width += left; left = 0; } if (left + width > 100) { width = 100 - left; }
                                            return <div key={b.id} className="absolute top-3 bottom-3 rounded-md flex items-center px-2 shadow-lg overflow-hidden cursor-pointer bg-orbit-gold text-black" style={{ left: `${left}%`, width: `${width}%` }} onClick={() => { setEditingBooking(b); setIsEditBookingOpen(true); }}><span className="text-[10px] font-bold truncate">#{b.id}</span></div>;
                                    })}

                                    {/* RENDER VEHICLE DOWNTIME */}
                                    {downtimes.filter(dt => dt.resourceId === vehicle.id).map(dt => {
                                            const today = new Date(); today.setHours(0,0,0,0);
                                            const start = new Date(dt.startDate); const end = new Date(dt.endDate);
                                            const diffTimeStart = start.getTime() - today.getTime(); const diffDaysStart = Math.ceil(diffTimeStart / (1000 * 60 * 60 * 24)); 
                                            const diffTimeEnd = end.getTime() - start.getTime(); const durationDays = Math.ceil(diffTimeEnd / (1000 * 60 * 60 * 24)) + 1;
                                            if (diffDaysStart > 14 || diffDaysStart + durationDays < 0) return null;
                                            let left = (diffDaysStart / 14) * 100; let width = (durationDays / 14) * 100;
                                            if (left < 0) { width += left; left = 0; } if (left + width > 100) { width = 100 - left; }
                                            return <div key={dt.id} className="absolute top-1 bottom-1 flex items-center px-2 cursor-pointer bg-gray-800/80 border border-gray-600/50 stripe-bg" style={{ left: `${left}%`, width: `${width}%` }} title={dt.note}><span className="text-[9px] text-gray-300 font-bold truncate uppercase">{dt.type}</span></div>;
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Drivers Section */}
                    <div className="mb-2 pl-2 text-xs uppercase text-orbit-gold font-bold tracking-widest">Personnel Schedule</div>
                    <div className="space-y-2">
                        {drivers.map(driver => {
                            const currentStatus = getDriverCurrentStatus(driver);
                            return (
                            <div key={driver.id} className="flex items-center h-16 rounded-lg border border-white/5 bg-white/5 transition-colors">
                                <div className="w-48 shrink-0 p-3 border-r border-white/5 relative">
                                    <div className="font-bold text-white text-sm truncate">{driver.name}</div>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${currentStatus === 'off-duty' ? 'bg-gray-500' : currentStatus === 'on-trip' ? 'bg-blue-500' : currentStatus === 'on-call' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                                        <span className="text-xs text-gray-500 uppercase">{driver.licenseNumber}</span>
                                    </div>
                                </div>
                                <div className="flex-1 h-full relative">
                                    <div className="absolute inset-0 flex pointer-events-none">{Array.from({ length: 14 }).map((_, i) => <div key={i} className="flex-1 border-l border-white/5 h-full"></div>)}</div>
                                    
                                    {/* RENDER DRIVER TASKS */}
                                    {driver.schedule.map(task => {
                                            const today = new Date(); today.setHours(0,0,0,0);
                                            const start = new Date(task.startTime); const end = new Date(task.endTime);
                                            const diffTimeStart = start.getTime() - today.getTime(); const diffDaysStart = Math.ceil(diffTimeStart / (1000 * 60 * 60 * 24)); 
                                            // Ensure minimum width for visualization
                                            const diffTimeEnd = end.getTime() - start.getTime(); 
                                            const durationDays = Math.max(0.2, Math.ceil(diffTimeEnd / (1000 * 60 * 60 * 24))); // Allow sub-day visual

                                            if (diffDaysStart > 14 || diffDaysStart + durationDays < 0) return null;
                                            let left = (diffDaysStart / 14) * 100; let width = (durationDays / 14) * 100;
                                            
                                            // Clamp
                                            if (left < 0) { width += left; left = 0; } if (left + width > 100) { width = 100 - left; }
                                            
                                            return <div key={task.id} className={`absolute top-3 bottom-3 rounded-md flex items-center px-2 shadow-lg overflow-hidden cursor-pointer ${task.isCompleted ? 'bg-green-900 border border-green-500' : 'bg-orbit-gold text-black'}`} style={{ left: `${left}%`, width: `${width}%` }} title={task.type}><span className="text-[10px] font-bold truncate">{task.type.split(' ')[0]}</span></div>;
                                    })}

                                    {/* RENDER DRIVER DOWNTIME */}
                                    {downtimes.filter(dt => dt.resourceId === driver.id).map(dt => {
                                            const today = new Date(); today.setHours(0,0,0,0);
                                            const start = new Date(dt.startDate); const end = new Date(dt.endDate);
                                            const diffTimeStart = start.getTime() - today.getTime(); const diffDaysStart = Math.ceil(diffTimeStart / (1000 * 60 * 60 * 24)); 
                                            const diffTimeEnd = end.getTime() - start.getTime(); const durationDays = Math.ceil(diffTimeEnd / (1000 * 60 * 60 * 24)) + 1;
                                            if (diffDaysStart > 14 || diffDaysStart + durationDays < 0) return null;
                                            let left = (diffDaysStart / 14) * 100; let width = (durationDays / 14) * 100;
                                            if (left < 0) { width += left; left = 0; } if (left + width > 100) { width = 100 - left; }
                                            return <div key={dt.id} className="absolute top-1 bottom-1 flex items-center px-2 cursor-pointer bg-blue-900/40 border border-blue-600/50 stripe-bg" style={{ left: `${left}%`, width: `${width}%` }} title={dt.note}><span className="text-[9px] text-gray-300 font-bold truncate uppercase">OFF</span></div>;
                                    })}
                                </div>
                            </div>
                        )})}
                    </div>
                </div>
              </div>
              <style>{` .stripe-bg { background-image: repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.05) 5px, rgba(255,255,255,0.05) 10px); } `}</style>
         </div>
      )}

      {/* Fleet Management */}
      {view === 'fleet' && (
        <div className="animate-fade-in">
           <div className="flex justify-between items-center mb-6">
             <h3 className="text-xl text-white">Vehicle Operations</h3>
             <div className="flex gap-2">
                 <button onClick={() => setIsIncidentModalOpen(true)} className="flex items-center gap-2 bg-red-900/40 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-red-900/60 transition-colors">
                    <AlertTriangle size={16} /> Report Damage
                 </button>
                 <button onClick={() => openVehicleModal()} className="flex items-center gap-2 bg-orbit-gold text-black px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors">
                    <Plus size={16} /> Add Unit
                 </button>
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {vehicles.map(v => (
              <div key={v.id} className="glass-panel p-4 rounded-xl flex gap-4 group relative">
                <button onClick={() => openVehicleModal(v)} className="absolute top-4 right-4 text-gray-400 hover:text-white bg-black/50 p-1 rounded backdrop-blur-md"><Settings size={16} /></button>
                <img src={v.imageUrl} alt={v.name} className={`w-24 h-24 object-cover rounded-lg bg-gray-800 ${v.status !== 'active' ? 'grayscale opacity-50' : ''}`} />
                <div className="flex-1">
                  <h4 className="font-bold text-white text-sm pr-6">{v.name}</h4>
                  <p className="text-xs text-gray-500 mb-2">{v.plate}</p>
                  <div className="mt-2">
                      {v.status === 'active' && <span className="text-[10px] bg-green-900/40 text-green-400 px-2 py-1 rounded border border-green-500/20 uppercase font-bold">Active Fleet</span>}
                      {v.status === 'maintenance' && <span className="text-[10px] bg-red-900/40 text-red-400 px-2 py-1 rounded border border-red-500/20 uppercase font-bold flex items-center gap-1 w-fit"><AlertTriangle size={10}/> Maintenance</span>}
                      {v.status === 'retired' && <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-1 rounded border border-gray-600/20 uppercase font-bold">Retired</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Driver Management */}
      {view === 'drivers' && (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl text-white">Chauffeur Personnel</h3>
                <div className="flex items-center gap-4">
                    <div className="flex bg-black/40 rounded-lg p-1 border border-white/10">
                        {['all', 'available', 'on-trip', 'off-duty'].map(f => (
                            <button key={f} onClick={() => setDriverFilter(f as any)} className={`px-3 py-1 rounded text-xs uppercase tracking-wider ${driverFilter === f ? 'bg-white/10 text-white font-bold' : 'text-gray-500 hover:text-gray-300'}`}>
                                {f.replace('-', ' ')}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => openDriverModal()} className="flex items-center gap-2 bg-orbit-gold text-black px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors"><Plus size={16} /> Recruit</button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {drivers.filter(d => driverFilter === 'all' || getDriverCurrentStatus(d) === driverFilter).map(driver => {
                    const currentStatus = getDriverCurrentStatus(driver);
                    return (
                    <div key={driver.id} className={`glass-panel p-6 rounded-xl flex flex-col items-center text-center relative overflow-hidden group ${currentStatus === 'off-duty' ? 'opacity-70 border-gray-700' : ''}`}>
                         <button onClick={() => openDriverModal(driver)} className="absolute top-2 right-2 text-gray-400 hover:text-white z-10 p-2"><Settings size={16} /></button>
                         {driver.isArmed && (<div className="absolute top-2 left-2 text-red-500" title="Armed Security"><ShieldAlert size={20} /></div>)}
                         <div className="relative mb-4">
                            <img src={driver.avatarUrl} className={`w-24 h-24 rounded-full object-cover border-2 ${currentStatus === 'off-duty' ? 'grayscale' : driver.isArmed ? 'border-red-500' : 'border-white/10'}`} />
                            <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-black ${currentStatus === 'available' ? 'bg-green-500' : currentStatus === 'on-trip' ? 'bg-blue-500' : currentStatus === 'on-call' ? 'bg-yellow-500' : 'bg-gray-500'}`} />
                         </div>
                         <h4 className="text-white font-bold text-lg">{driver.name}</h4>
                         <p className="text-gray-500 text-sm mb-2">{driver.licenseNumber}</p>
                         <div className="mb-4">
                            {driver.manualStatus && <div className="text-[10px] text-orbit-gold uppercase mb-1 font-bold">⚠ Manual Override</div>}
                            {currentStatus === 'off-duty' && <span className="text-xs bg-white/10 px-2 py-1 rounded text-gray-300">⛔ Off Duty / Leave</span>}
                            {currentStatus === 'on-trip' && <span className="text-xs bg-blue-900/30 text-blue-400 px-2 py-1 rounded">On Mission</span>}
                            {currentStatus === 'on-call' && <span className="text-xs bg-yellow-900/30 text-yellow-400 px-2 py-1 rounded">On Call</span>}
                            {currentStatus === 'available' && <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded">Ready</span>}
                         </div>
                    </div>
                )})}
            </div>
        </div>
      )}
      
       {/* CRM View - UPDATED with Filters */}
       {view === 'crm' && (
           <div className="glass-panel rounded-xl overflow-hidden animate-fade-in">
              <div className="p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                  <h3 className="text-xl text-white">Client Directory</h3>
                  <div className="flex gap-4 items-center w-full md:w-auto">
                      <div className="relative flex-1 md:w-64">
                          <Search size={14} className="absolute left-3 top-3 text-gray-500" />
                          <input 
                            placeholder="Search client, email or company..." 
                            className="w-full pl-9 p-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white"
                            value={crmSearch}
                            onChange={(e) => setCrmSearch(e.target.value)}
                          />
                      </div>
                      <select 
                        className="p-2 bg-black/40 border border-white/10 rounded-lg text-sm text-gray-400"
                        value={crmSort}
                        onChange={(e) => setCrmSort(e.target.value as any)}
                      >
                          <option value="spend_desc">Highest Spend</option>
                          <option value="spend_asc">Lowest Spend</option>
                          <option value="name_asc">Name (A-Z)</option>
                      </select>
                      <button onClick={() => { resetClientForm(); setIsClientModalOpen(true); }} className="flex items-center gap-2 bg-orbit-gold text-black px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors shrink-0"><Plus size={16} /> Add Client</button>
                  </div>
              </div>
              <table className="w-full text-left">
                  <thead><tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-widest"><th className="p-4">Name / Company</th><th className="p-4">Contact</th><th className="p-4">Status</th><th className="p-4">Total Spend</th><th className="p-4">Notes</th><th className="p-4 text-right">Action</th></tr></thead>
                  <tbody>
                      {clients
                        .filter(c => 
                            c.name.toLowerCase().includes(crmSearch.toLowerCase()) || 
                            c.email.toLowerCase().includes(crmSearch.toLowerCase()) ||
                            (c.company && c.company.toLowerCase().includes(crmSearch.toLowerCase()))
                        )
                        .sort((a,b) => {
                            if (crmSort === 'spend_desc') return b.totalSpent - a.totalSpent;
                            if (crmSort === 'spend_asc') return a.totalSpent - b.totalSpent;
                            if (crmSort === 'name_asc') return a.name.localeCompare(b.name);
                            return 0;
                        })
                        .map(client => (
                          <tr key={client.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                              <td className="p-4"><span className="text-white font-bold block">{client.name}</span>{client.company && <span className="text-xs text-orbit-gold font-bold uppercase">{client.company}</span>}</td>
                              <td className="p-4 text-sm text-gray-300"><div>{client.email}</div><div>{client.phone}</div></td>
                              <td className="p-4"><span className={`px-2 py-1 rounded text-xs border ${client.status === 'VIP' ? 'border-orbit-gold text-orbit-gold' : 'border-gray-500 text-gray-500'}`}>{client.status}</span></td>
                              <td className="p-4 text-white font-mono">${client.totalSpent.toLocaleString()}</td>
                              <td className="p-4 text-sm text-gray-400 italic max-w-xs truncate">{client.notes}</td>
                              <td className="p-4 text-right"><button onClick={() => { setEditingClient(client); setNewClientName(client.name); setNewClientEmail(client.email); setNewClientPhone(client.phone); setNewClientCompany(client.company || ''); setNewClientNotes(client.notes); setNewClientStatus(client.status); setIsClientModalOpen(true); }} className="text-gray-400 hover:text-white p-2"><Edit size={16} /></button></td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      )}

      {/* Bookings View - UPDATED with Filters */}
      {view === 'bookings' && (
        <div className="animate-fade-in">
           {/* Booking Filters */}
           <div className="glass-panel p-4 rounded-xl mb-6 flex flex-wrap gap-4 items-end">
               <div className="flex-1 min-w-[200px]">
                   <label className="text-xs text-gray-500 uppercase block mb-1">Search Client</label>
                   <input 
                      type="text" 
                      placeholder="Client name..." 
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-gray-200"
                      value={bookingClientSearch}
                      onChange={(e) => setBookingClientSearch(e.target.value)}
                   />
               </div>
               <div>
                   <label className="text-xs text-gray-500 uppercase block mb-1">Assigned Unit</label>
                   <select className="bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-gray-200" value={bookingVehicleFilter} onChange={(e) => setBookingVehicleFilter(e.target.value)}>
                       <option value="ALL">All Vehicles</option>
                       {vehicles.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                   </select>
               </div>
               <div>
                   <label className="text-xs text-gray-500 uppercase block mb-1">Status</label>
                   <select className="bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-gray-200" value={bookingStatusFilter} onChange={(e) => setBookingStatusFilter(e.target.value as any)}>
                       <option value="ALL">All Statuses</option>
                       {Object.values(BookingStatus).map(s => <option key={s} value={s}>{s}</option>)}
                   </select>
               </div>
               <div>
                   <label className="text-xs text-gray-500 uppercase block mb-1">Type</label>
                   <select className="bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-gray-200" value={bookingTypeFilter} onChange={(e) => setBookingTypeFilter(e.target.value as any)}>
                       <option value="ALL">All Types</option>
                       <option value="airport">Airport</option>
                       <option value="hotel">Hotel</option>
                       <option value="address">Address</option>
                   </select>
               </div>
               <div>
                   <label className="text-xs text-gray-500 uppercase block mb-1">Date Range</label>
                   <div className="flex gap-2">
                       <input type="date" className="bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-gray-400" value={bookingDateStart} onChange={(e) => setBookingDateStart(e.target.value)} />
                       <span className="text-gray-500 self-center">-</span>
                       <input type="date" className="bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-gray-400" value={bookingDateEnd} onChange={(e) => setBookingDateEnd(e.target.value)} />
                   </div>
               </div>
               {(bookingStatusFilter !== 'ALL' || bookingTypeFilter !== 'ALL' || bookingDateStart || bookingDateEnd || bookingClientSearch || bookingVehicleFilter !== 'ALL') && (
                   <button onClick={() => { setBookingStatusFilter('ALL'); setBookingTypeFilter('ALL'); setBookingDateStart(''); setBookingDateEnd(''); setBookingClientSearch(''); setBookingVehicleFilter('ALL'); }} className="text-xs text-red-400 hover:text-white mb-2 underline">
                       Clear Filters
                   </button>
               )}
           </div>

           <div className="glass-panel rounded-xl overflow-hidden overflow-x-auto">
             <table className="w-full text-left border-collapse min-w-[1000px]">
               <thead><tr className="border-b border-white/10 bg-black/40"><th className="p-4 text-xs uppercase tracking-widest text-gray-400">Ref</th><th className="p-4 text-xs uppercase tracking-widest text-gray-400">Client</th><th className="p-4 text-xs uppercase tracking-widest text-gray-400">Date & Type</th><th className="p-4 text-xs uppercase tracking-widest text-gray-400">Mission</th><th className="p-4 text-xs uppercase tracking-widest text-gray-400">Logistics</th><th className="p-4 text-xs uppercase tracking-widest text-gray-400 text-right">Dispatch</th></tr></thead>
               <tbody className="text-sm">
                 {bookings.filter(b => {
                     const client = clients.find(c => c.id === b.clientId);
                     // Filter Logic
                     if (bookingStatusFilter !== 'ALL' && b.status !== bookingStatusFilter) return false;
                     if (bookingTypeFilter !== 'ALL' && b.pickupType !== bookingTypeFilter) return false;
                     if (bookingDateStart && new Date(b.startDate) < new Date(bookingDateStart)) return false;
                     if (bookingDateEnd && new Date(b.startDate) > new Date(bookingDateEnd)) return false;
                     if (bookingVehicleFilter !== 'ALL' && b.vehicleId !== bookingVehicleFilter) return false;
                     if (bookingClientSearch && !client?.name.toLowerCase().includes(bookingClientSearch.toLowerCase())) return false;
                     return true;
                 }).map(booking => {
                   const client = clients.find(c => c.id === booking.clientId);
                   const isSelfDrive = !booking.withChauffeur;
                   const deliveryAssigned = booking.logistics.deliveryStatus === 'assigned';
                   const collectionAssigned = booking.logistics.collectionStatus === 'assigned';
                   const chauffeurAssigned = !!booking.driverId;
                   const fullyDispatched = isSelfDrive ? (deliveryAssigned && collectionAssigned) : chauffeurAssigned;
                   return (
                     <tr key={booking.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                       <td className="p-4 text-gray-500 font-mono">
                           <div>#{booking.id}</div>
                           <div className="mt-1">{booking.notificationsEnabled ? <Bell size={12} className="text-orbit-gold" title="Alerts Enabled"/> : <BellOff size={12} className="text-gray-600" title="Alerts Disabled"/>}</div>
                       </td>
                       <td className="p-4 font-bold text-white">{client?.name}</td>
                       <td className="p-4">
                           <div className="text-white font-bold">{booking.startDate}</div>
                           <div className="text-xs text-gray-400 uppercase">{booking.pickupType}</div>
                       </td>
                       <td className="p-4">{booking.withChauffeur ? <span className="flex items-center gap-2 text-orbit-gold"><User size={14} /> Chauffeur {booking.withSecurity ? '+ Security' : ''}</span> : <span className="flex items-center gap-2 text-gray-400"><Car size={14} /> Self-Drive</span>}</td>
                       <td className="p-4">{fullyDispatched ? <span className="text-green-500 flex items-center gap-1 text-xs uppercase font-bold"><Check size={12}/> Ready</span> : <span className="text-red-400 flex items-center gap-1 text-xs uppercase font-bold"><ShieldAlert size={12}/> Action Required</span>}</td>
                       <td className="p-4 text-right"><button onClick={() => { setSelectedBookingForLogistics(booking); setIsLogisticsModalOpen(true); }} className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded text-xs uppercase tracking-widest border border-white/10">Manage Logistics</button></td>
                     </tr>
                   );
                 })}
                 {bookings.filter(b => {
                     const client = clients.find(c => c.id === b.clientId);
                     if (bookingStatusFilter !== 'ALL' && b.status !== bookingStatusFilter) return false;
                     if (bookingTypeFilter !== 'ALL' && b.pickupType !== bookingTypeFilter) return false;
                     if (bookingDateStart && new Date(b.startDate) < new Date(bookingDateStart)) return false;
                     if (bookingDateEnd && new Date(b.startDate) > new Date(bookingDateEnd)) return false;
                     if (bookingVehicleFilter !== 'ALL' && b.vehicleId !== bookingVehicleFilter) return false;
                     if (bookingClientSearch && !client?.name.toLowerCase().includes(bookingClientSearch.toLowerCase())) return false;
                     return true;
                 }).length === 0 && (
                     <tr><td colSpan={6} className="p-8 text-center text-gray-500 italic">No bookings match current filters.</td></tr>
                 )}
               </tbody>
             </table>
          </div>
        </div>
      )}
      {view === 'marketing' && (<div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-8"><div className="glass-panel p-6 rounded-xl"><h3 className="text-xl text-white mb-4">Active Discount Codes</h3><div className="space-y-4">{coupons.map(coupon => (<div key={coupon.code} className="flex justify-between items-center p-3 bg-white/5 rounded-lg"><div><span className="text-orbit-gold font-mono font-bold">{coupon.code}</span><span className="text-gray-500 text-sm ml-2">({coupon.discountPercent * 100}% Off)</span></div><span className={`w-2 h-2 rounded-full ${coupon.active ? 'bg-green-500' : 'bg-red-500'}`} /></div>))}</div></div><div className="glass-panel p-6 rounded-xl"><h3 className="text-xl text-white mb-4">Create Coupon</h3><form onSubmit={handleAddCoupon} className="space-y-4"><div><label className="text-xs uppercase text-gray-500">Code</label><input value={newCouponCode} onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())} className="w-full glass-input p-3 rounded-lg" placeholder="e.g. SUMMER25" required /></div><div><label className="text-xs uppercase text-gray-500">Percentage Off</label><input type="number" value={newCouponPercent} onChange={(e) => setNewCouponPercent(Number(e.target.value))} className="w-full glass-input p-3 rounded-lg" max="100" required /></div><button className="w-full bg-orbit-gold text-black py-2 font-bold uppercase tracking-wider hover:bg-white transition-colors">Create Code</button></form></div></div>)}
      {view === 'create_booking' && (<div className="animate-fade-in"><div className="bg-orbit-gold/10 p-4 mb-4 rounded-lg border border-orbit-gold/30 text-orbit-gold text-center text-sm tracking-widest uppercase">Admin Override Mode Active</div><ClientView vehicles={vehicles} coupons={coupons} onBook={(b, c, n) => { onAdminBook(b, c, n); setView('bookings'); }} isAdminMode={true} /></div>)}

      {/* --- MODALS --- */}

      {/* Driver Modal (Create & Edit) - UPDATED with Scheduling & Tabs */}
      {isDriverModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="glass-panel w-full max-w-md rounded-xl p-8 relative">
                <button onClick={() => setIsDriverModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20}/></button>
                <h3 className="text-2xl font-serif text-white mb-6">{editingDriver ? 'Edit Personnel' : 'Onboard Chauffeur'}</h3>
                
                {editingDriver && (
                    <div className="flex border-b border-white/10 mb-6">
                        <button onClick={() => setEditTab('details')} className={`flex-1 pb-2 text-xs uppercase tracking-widest ${editTab === 'details' ? 'border-b-2 border-orbit-gold text-white' : 'text-gray-500'}`}>Profile</button>
                        <button onClick={() => setEditTab('schedule')} className={`flex-1 pb-2 text-xs uppercase tracking-widest ${editTab === 'schedule' ? 'border-b-2 border-orbit-gold text-white' : 'text-gray-500'}`}>Schedule</button>
                        <button onClick={() => setEditTab('downtime')} className={`flex-1 pb-2 text-xs uppercase tracking-widest ${editTab === 'downtime' ? 'border-b-2 border-orbit-gold text-white' : 'text-gray-500'}`}>Leave</button>
                    </div>
                )}

                {editTab === 'details' ? (
                    <form onSubmit={handleDriverSubmit} className="space-y-4">
                        <div className="flex justify-center mb-6"><div className="relative"><img src={newDriverPhoto} className="w-24 h-24 rounded-full object-cover border-2 border-orbit-gold" /><label className="absolute bottom-0 right-0 bg-white text-black p-1 rounded-full cursor-pointer hover:bg-orbit-gold"><Upload size={14} /><input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, setNewDriverPhoto)} /></label></div></div>
                        <input className="w-full p-3 glass-input rounded-lg" placeholder="Full Name" required value={newDriverName} onChange={e => setNewDriverName(e.target.value)} />
                        <input className="w-full p-3 glass-input rounded-lg" placeholder="License Number" required value={newDriverLicense} onChange={e => setNewDriverLicense(e.target.value)} />
                        <input className="w-full p-3 glass-input rounded-lg" placeholder="Phone Number" required value={newDriverPhone} onChange={e => setNewDriverPhone(e.target.value)} />
                        <div className="grid grid-cols-2 gap-4"><div className="col-span-1"><label className="text-xs text-gray-500 uppercase">Rate/Day</label><input className="w-full p-3 glass-input rounded-lg" type="number" required value={newDriverRate} onChange={e => setNewDriverRate(Number(e.target.value))} /></div><div className="col-span-1 flex items-end"><label className="flex items-center gap-2 cursor-pointer bg-white/5 p-3 rounded-lg w-full"><input type="checkbox" checked={newDriverArmed} onChange={e => setNewDriverArmed(e.target.checked)} className="w-4 h-4 accent-red-500" /><span className="text-sm text-red-400 font-bold uppercase flex items-center gap-1"><ShieldAlert size={14}/> Armed</span></label></div></div>
                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <label className="block text-xs uppercase text-orbit-gold font-bold mb-2 flex items-center gap-2"><Power size={12}/> Manual Status Override</label>
                            <select className="w-full p-3 glass-input rounded-lg bg-black border-orbit-gold/50" value={newDriverManualStatus} onChange={e => setNewDriverManualStatus(e.target.value as any)}>
                                <option value="">Auto (Follow Schedule)</option>
                                <option value="unavailable">🔴 Force Unavailable</option>
                                <option value="on-call">🟡 Force On-Call</option>
                            </select>
                            <p className="text-[10px] text-gray-500 mt-2 italic">Selecting an option here will override all scheduled tasks and downtime.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4"><div className="col-span-1"><label className="text-xs text-gray-500 uppercase">Start</label><input className="w-full p-3 glass-input rounded-lg" type="time" required value={newDriverShiftStart} onChange={e => setNewDriverShiftStart(e.target.value)} /></div><div className="col-span-1"><label className="text-xs text-gray-500 uppercase">End</label><input className="w-full p-3 glass-input rounded-lg" type="time" required value={newDriverShiftEnd} onChange={e => setNewDriverShiftEnd(e.target.value)} /></div></div>
                        <button className="w-full py-3 bg-orbit-gold text-black font-bold uppercase tracking-widest mt-4">{editingDriver ? 'Update Profile' : 'Confirm Onboarding'}</button>
                    </form>
                ) : editTab === 'schedule' ? (
                     <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                         <h4 className="text-white font-bold mb-2 flex items-center gap-2"><CalendarIcon size={16}/> Assigned Missions</h4>
                         {editingDriver?.schedule.sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()).map(task => (
                             <div key={task.id} className={`p-4 rounded-lg border flex justify-between items-center ${task.isCompleted ? 'bg-green-900/10 border-green-500/20 opacity-60' : 'bg-orbit-gold/5 border-orbit-gold/30'}`}>
                                 <div>
                                     <div className="text-sm text-white font-bold flex items-center gap-2">
                                         {task.type}
                                         {task.isCompleted && <span className="text-[10px] bg-green-500 text-black px-1 rounded uppercase">Done</span>}
                                     </div>
                                     <div className="text-xs text-gray-400 mt-1">
                                         {new Date(task.startTime).toLocaleDateString()} {new Date(task.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                     </div>
                                     <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Ref: #{task.bookingId}</div>
                                 </div>
                                 <button 
                                    onClick={() => onToggleTaskCompletion(editingDriver.id, task.id)}
                                    className={`p-2 rounded-full transition-colors ${task.isCompleted ? 'text-green-500 hover:text-white hover:bg-green-500' : 'text-gray-500 hover:text-orbit-gold hover:bg-orbit-gold/10'}`}
                                    title="Toggle Completion"
                                 >
                                     <CheckCircle size={20} />
                                 </button>
                             </div>
                         ))}
                         {editingDriver?.schedule.length === 0 && <p className="text-gray-500 text-sm italic text-center py-4">No active missions assigned.</p>}
                         
                         <h4 className="text-white font-bold mt-6 mb-2 flex items-center gap-2"><CalendarOff size={16}/> Scheduled Downtime</h4>
                         {downtimes.filter(dt => dt.resourceId === editingDriver?.id).map(dt => (
                            <div key={dt.id} className="bg-blue-900/20 border border-blue-500/20 p-3 rounded flex justify-between items-center text-sm mb-2">
                                <div>
                                    <div className="text-white font-bold">{dt.note}</div>
                                    <div className="text-xs text-gray-400">{dt.startDate} → {dt.endDate}</div>
                                </div>
                                <span className="text-xs uppercase bg-blue-500 text-white px-2 rounded">Leave</span>
                            </div>
                        ))}
                        {downtimes.filter(dt => dt.resourceId === editingDriver?.id).length === 0 && <p className="text-gray-600 text-sm italic">No scheduled leave.</p>}
                     </div>
                ) : (
                    <div className="space-y-6">
                        <form onSubmit={handleAddDowntimeSubmit} className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <h4 className="text-white font-bold mb-4 flex items-center gap-2"><CalendarOff size={16}/> Add Leave Block</h4>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div><label className="text-xs uppercase text-gray-500">Start Date</label><input type="date" className="w-full p-2 glass-input rounded" required value={downtimeStart} onChange={e => setDowntimeStart(e.target.value)} /></div>
                                <div><label className="text-xs uppercase text-gray-500">End Date</label><input type="date" className="w-full p-2 glass-input rounded" required value={downtimeEnd} onChange={e => setDowntimeEnd(e.target.value)} /></div>
                            </div>
                            <input className="w-full p-2 glass-input rounded mb-4" placeholder="Reason (e.g. Annual Vacation)" required value={downtimeNote} onChange={e => setDowntimeNote(e.target.value)} />
                            <button className="w-full bg-orbit-gold text-black py-2 rounded font-bold uppercase hover:bg-white">Block Dates</button>
                        </form>
                    </div>
                )}
            </div>
          </div>
      )}

      {/* Incident Modal (Report Damage) */}
      {isIncidentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="glass-panel w-full max-w-md rounded-xl p-8 relative">
                  <button onClick={() => setIsIncidentModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20}/></button>
                  <h3 className="text-2xl font-serif text-white mb-6 text-red-500 flex items-center gap-2"><AlertTriangle/> Report Incident</h3>
                  <form onSubmit={handleIncidentSubmit} className="space-y-4">
                      <div>
                          <label className="text-xs uppercase text-gray-500">Involved Vehicle</label>
                          <select className="w-full p-3 glass-input rounded-lg bg-black" required value={incidentVehicleId} onChange={e => setIncidentVehicleId(e.target.value)}>
                              <option value="">Select Vehicle...</option>
                              {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.plate})</option>)}
                          </select>
                      </div>
                      <div>
                          <label className="text-xs uppercase text-gray-500">Description of Damage</label>
                          <textarea className="w-full p-3 glass-input rounded-lg" rows={4} required value={incidentDesc} onChange={e => setIncidentDesc(e.target.value)} placeholder="Describe damage location and severity..."></textarea>
                      </div>
                      <div>
                          <label className="text-xs uppercase text-gray-500">Estimated Cost ($)</label>
                          <input type="number" className="w-full p-3 glass-input rounded-lg" required value={incidentCost} onChange={e => setIncidentCost(Number(e.target.value))} />
                      </div>
                      <div className="bg-red-900/20 p-4 rounded text-sm text-red-300 border border-red-900">
                          Note: Submitting this report will flag the vehicle in the system but will NOT automatically change its status to Maintenance. Please update status manually if required.
                      </div>
                      <button className="w-full py-3 bg-red-600 text-white font-bold uppercase tracking-widest hover:bg-red-500">Submit Report</button>
                  </form>
              </div>
          </div>
      )}

      {/* ... (Logistics, Client Modals remain the same) ... */}
       {isLogisticsModalOpen && selectedBookingForLogistics && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
              <div className="glass-panel w-full max-w-4xl rounded-xl p-8 relative max-h-[90vh] overflow-y-auto">
                  <button onClick={() => setIsLogisticsModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20}/></button>
                  <div className="mb-8 border-b border-white/10 pb-4">
                      <h3 className="text-2xl font-serif text-white mb-2">Logistics Manager</h3>
                      <p className="text-gray-400 text-sm">Booking #{selectedBookingForLogistics.id} • {selectedBookingForLogistics.pickupType} to {selectedBookingForLogistics.dropoffLocation}</p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Left: Tasks */}
                      <div className="space-y-6">
                          <h4 className="text-orbit-gold uppercase tracking-widest text-xs font-bold border-b border-orbit-gold/20 pb-2">Required Missions</h4>
                          {selectedBookingForLogistics.withChauffeur ? (
                              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                                  <div className="flex justify-between items-center mb-2"><span className="font-bold text-white flex items-center gap-2"><User size={16}/> Chauffeur (Full Duration)</span>{selectedBookingForLogistics.driverId && <Check size={16} className="text-green-500" />}</div>
                                  <div className="space-y-2">
                                    <label className="text-xs uppercase text-gray-500">Assign Driver</label>
                                    <select className="w-full p-2 glass-input rounded bg-black text-sm" value={selectedBookingForLogistics.driverId || ''} onChange={(e) => onAssignTask(selectedBookingForLogistics.id, e.target.value, TaskType.CHAUFFEUR_SERVICE, selectedBookingForLogistics.startDate, selectedBookingForLogistics.endDate)}>
                                        <option value="">Select available driver...</option>
                                        {drivers.filter(d => checkDriverAvailability(d, selectedBookingForLogistics.startDate, selectedBookingForLogistics.endDate)).map(d => (<option key={d.id} value={d.id}>{d.name} {d.isArmed ? '(Armed)' : ''}</option>))}
                                    </select>
                                  </div>
                              </div>
                          ) : (
                              <>
                                  <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                                      <div className="flex justify-between items-center mb-2"><span className="font-bold text-white flex items-center gap-2"><Truck size={16}/> Vehicle Delivery</span>{selectedBookingForLogistics.logistics.deliveryStatus === 'assigned' && <Check size={16} className="text-green-500" />}</div>
                                      <div className="space-y-2">
                                        <label className="text-xs uppercase text-gray-500">Assign Runner</label>
                                        <select className="w-full p-2 glass-input rounded bg-black text-sm" value={selectedBookingForLogistics.logistics.deliveryDriverId || ''} onChange={(e) => { const start = new Date(selectedBookingForLogistics.startDate); const end = new Date(start.getTime() + 3600000); onAssignTask(selectedBookingForLogistics.id, e.target.value, TaskType.VEHICLE_DELIVERY, start.toISOString(), end.toISOString()); }}>
                                            <option value="">Select available runner...</option>
                                            {drivers.filter(d => { const start = new Date(selectedBookingForLogistics.startDate); const end = new Date(start.getTime() + 3600000); return checkDriverAvailability(d, start.toISOString(), end.toISOString()); }).map(d => (<option key={d.id} value={d.id}>{d.name}</option>))}
                                        </select>
                                      </div>
                                  </div>
                                  <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                                      <div className="flex justify-between items-center mb-2"><span className="font-bold text-white flex items-center gap-2"><Truck size={16}/> Vehicle Collection</span>{selectedBookingForLogistics.logistics.collectionStatus === 'assigned' && <Check size={16} className="text-green-500" />}</div>
                                      <div className="space-y-2">
                                        <label className="text-xs uppercase text-gray-500">Assign Runner</label>
                                        <select className="w-full p-2 glass-input rounded bg-black text-sm" value={selectedBookingForLogistics.logistics.collectionDriverId || ''} onChange={(e) => { const start = new Date(selectedBookingForLogistics.endDate); const end = new Date(start.getTime() + 3600000); onAssignTask(selectedBookingForLogistics.id, e.target.value, TaskType.VEHICLE_COLLECTION, start.toISOString(), end.toISOString()); }}>
                                            <option value="">Select available runner...</option>
                                            {drivers.filter(d => { const start = new Date(selectedBookingForLogistics.endDate); const end = new Date(start.getTime() + 3600000); return checkDriverAvailability(d, start.toISOString(), end.toISOString()); }).map(d => (<option key={d.id} value={d.id}>{d.name}</option>))}
                                        </select>
                                      </div>
                                  </div>
                              </>
                          )}
                      </div>
                      {/* Right: Availability (Updated to show status) */}
                      <div className="bg-black/40 rounded-lg p-4 border border-white/5">
                          <h4 className="text-gray-400 text-xs uppercase tracking-widest mb-4">Personnel Status</h4>
                          <div className="space-y-3 max-h-[400px] overflow-y-auto">
                              {drivers.map(d => {
                                  const currentStatus = getDriverCurrentStatus(d);
                                  return (
                                  <div key={d.id} className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
                                      <div className="flex items-center gap-2">
                                          <div className={`w-2 h-2 rounded-full ${currentStatus === 'off-duty' ? 'bg-gray-500' : d.isArmed ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                          <span className={`${currentStatus === 'off-duty' ? 'text-gray-500 line-through' : 'text-gray-300'}`}>{d.name}</span>
                                      </div>
                                      <div className="text-right">
                                          {currentStatus === 'off-duty' ? <span className="text-gray-500 font-bold">OFF DUTY</span> :
                                           currentStatus === 'on-trip' ? <span className="text-blue-400 font-bold">BUSY</span> :
                                           d.schedule.length > 0 ? <span className="text-orbit-gold">{d.schedule.length} tasks</span> : <span className="text-gray-600">Free</span>}
                                      </div>
                                  </div>
                              )})}
                          </div>
                      </div>
                  </div>
                  <div className="mt-8 flex justify-end"><button onClick={() => setIsLogisticsModalOpen(false)} className="bg-orbit-gold text-black px-6 py-2 rounded font-bold uppercase hover:bg-white">Done</button></div>
              </div>
          </div>
      )}
       {isClientModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="glass-panel w-full max-w-md rounded-xl p-8 relative">
                <button onClick={() => { setIsClientModalOpen(false); resetClientForm(); }} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20}/></button>
                <h3 className="text-xl font-serif text-white mb-6">{editingClient ? 'Edit Profile' : 'New Client'}</h3>
                <form onSubmit={handleClientSubmit} className="space-y-4">
                    <input className="w-full p-3 glass-input rounded-lg" placeholder="Full Name" required value={newClientName} onChange={e => setNewClientName(e.target.value)} />
                    <input className="w-full p-3 glass-input rounded-lg" placeholder="Company (Optional)" value={newClientCompany} onChange={e => setNewClientCompany(e.target.value)} />
                    <input className="w-full p-3 glass-input rounded-lg" placeholder="Email" type="email" required value={newClientEmail} onChange={e => setNewClientEmail(e.target.value)} />
                    <input className="w-full p-3 glass-input rounded-lg" placeholder="Phone" required value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)} />
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-gray-500 uppercase">Status</label>
                            <select className="w-full p-3 glass-input rounded-lg bg-black" value={newClientStatus} onChange={e => setNewClientStatus(e.target.value as any)}><option value="New">New</option><option value="Regular">Regular</option><option value="VIP">VIP</option></select>
                        </div>
                    </div>
                    <textarea className="w-full p-3 glass-input rounded-lg" placeholder="Internal Notes..." rows={3} value={newClientNotes} onChange={e => setNewClientNotes(e.target.value)} />
                    <button className="w-full py-3 bg-orbit-gold text-black font-bold uppercase tracking-widest mt-4">{editingClient ? 'Update Record' : 'Create Record'}</button>
                </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminDashboard;