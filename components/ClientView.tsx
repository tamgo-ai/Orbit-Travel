import React, { useState } from 'react';
import { Vehicle, Booking, Coupon } from '../types';
import { EL_SALVADOR_AIRLINES } from '../constants';
import { Calendar, MapPin, UserCheck, ArrowRight, CheckCircle, Info, CreditCard, Lock, Tag, ShieldAlert, MessageSquare, Bell, AlertTriangle } from 'lucide-react';
import { suggestItinerary } from '../services/geminiService';
import { StripeService } from '../services/integrations';

interface ClientViewProps {
  vehicles: Vehicle[];
  coupons: Coupon[];
  onBook: (booking: Omit<Booking, 'id' | 'status' | 'createdAt' | 'driverId' | 'paymentStatus' | 'clientId'>, clientDetails: { name: string, email: string, phone: string }, sendNotifications: boolean) => void;
  isAdminMode?: boolean;
}

const ClientView: React.FC<ClientViewProps> = ({ vehicles, coupons, onBook, isAdminMode = false }) => {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [showConfirmationModal, setShowConfirmationModal] = useState(false); // For Admin Confirmation

  // Form State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pickupType, setPickupType] = useState<'airport' | 'hotel' | 'address'>('airport');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  
  // Chauffeur Options
  const [withChauffeur, setWithChauffeur] = useState(false);
  const [withSecurity, setWithSecurity] = useState(false);
  
  // Client Info
  const [clientName, setClientName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Flight Info
  const [airline, setAirline] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [flightTime, setFlightTime] = useState('');
  
  // Payment & Coupon
  const [couponCode, setCouponCode] = useState('');
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  
  // Notifications Settings
  const [sendNotifications, setSendNotifications] = useState(true);
  
  // AI Itinerary Suggestion
  const [suggestion, setSuggestion] = useState<string>('');

  const CHAUFFEUR_RATE = 200; 
  const SECURITY_PREMIUM = 200; // Extra cost for armed driver

  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;

    if (isAdminMode) {
      setShowConfirmationModal(true);
    } else {
      executeBooking();
    }
  };

  const executeBooking = async () => {
      setShowConfirmationModal(false);
      setIsAnimating(true);
      
      try {
          if (!isAdminMode) {
              setProcessingStage('Secure Handshake with Stripe...');
              await StripeService.createPaymentIntent(calculateTotal());
              setProcessingStage('Verifying Card Details...');
              await StripeService.processCard({});
          } else {
              setProcessingStage('Generating Folio...');
          }

          setProcessingStage('Finalizing Reservation...');
          setTimeout(() => {
              onBook({
                  vehicleId: selectedVehicle!.id,
                  startDate,
                  endDate,
                  pickupType,
                  pickupLocation: pickupType === 'airport' ? `Airport (${airline} ${flightNumber})` : pickupLocation,
                  dropoffLocation,
                  withChauffeur,
                  withSecurity,
                  totalPrice: calculateTotal(),
                  couponCode: activeCoupon?.code,
                  flightDetails: pickupType === 'airport' ? { airline, flightNumber, arrivalTime: flightTime } : undefined
              }, { name: clientName, email, phone }, sendNotifications);
              
              setStep(3);
              setIsAnimating(false);
          }, 1000);

      } catch (error) {
          setIsAnimating(false);
          alert("Payment failed. Please try again.");
      }
  };

  const applyCoupon = () => {
    const found = coupons.find(c => c.code === couponCode && c.active);
    if (found) {
      setActiveCoupon(found);
    } else {
      alert("Invalid or expired code");
      setActiveCoupon(null);
    }
  };

  const calculateTotal = () => {
    if (!selectedVehicle || !startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
    
    let subtotal = (days || 1) * selectedVehicle.pricePerDay;
    
    if (withChauffeur) {
        let driverRate = CHAUFFEUR_RATE;
        if (withSecurity) driverRate += SECURITY_PREMIUM;
        subtotal += (days || 1) * driverRate;
    }
    
    if (activeCoupon) {
      subtotal = subtotal * (1 - activeCoupon.discountPercent);
    }
    
    return subtotal;
  };

  if (step === 3) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 px-6 glass-panel rounded-2xl animate-fade-in">
        <div className="w-24 h-24 rounded-full bg-green-500/20 text-green-400 mx-auto flex items-center justify-center mb-8 border border-green-500/50">
          <CheckCircle size={48} />
        </div>
        <h2 className="text-4xl font-serif font-bold text-white mb-4">Reservation Confirmed</h2>
        <p className="text-gray-400 text-lg mb-8">
          Your secure folio has been created for the <span className="text-orbit-gold">{selectedVehicle?.name}</span>. 
          {sendNotifications ? (
              <span> Dispatch sent via Mailgun/Twilio to <span className="text-white">{email}</span>.</span>
          ) : (
              <span> Notifications were disabled for this booking.</span>
          )}
        </p>
        <button 
          onClick={() => { 
              setStep(1); 
              setSelectedVehicle(null); 
              setStartDate(''); 
              setEndDate('');
              setActiveCoupon(null);
          }}
          className="px-8 py-3 bg-white text-black font-bold uppercase tracking-widest hover:bg-orbit-gold transition-colors"
        >
          New Reservation
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto relative">
      {/* Confirmation Modal (Admin) */}
      {showConfirmationModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-xl">
          <div className="glass-panel p-8 rounded-xl max-w-md w-full border border-orbit-gold/50 shadow-[0_0_30px_rgba(212,175,55,0.15)] animate-fade-in">
            <h3 className="text-2xl font-serif text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="text-orbit-gold" /> Confirm Booking
            </h3>
            <p className="text-gray-300 mb-6">
              You are about to create a reservation for <strong>{clientName}</strong>. 
              {sendNotifications 
                ? <span className="block mt-2 text-green-400 text-sm">✓ Email & SMS notifications will be sent.</span>
                : <span className="block mt-2 text-red-400 text-sm">⚠ Notifications are DISABLED. Client will not be alerted.</span>
              }
            </p>
            <div className="grid grid-cols-2 gap-4">
               <button 
                  onClick={() => setShowConfirmationModal(false)}
                  className="py-3 rounded bg-white/10 hover:bg-white/20 text-white font-bold uppercase tracking-wide"
               >
                 Cancel
               </button>
               <button 
                  onClick={executeBooking}
                  className="py-3 rounded bg-orbit-gold hover:bg-white text-black font-bold uppercase tracking-wide"
               >
                 Confirm & Create
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      {!isAdminMode && (
        <div className="mb-12 text-center">
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-4 tracking-tight">
            {step === 1 ? 'Select Your Unit' : 'Configure Mission'}
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg font-light">
            {step === 1 
                ? 'Access our exclusive fleet of armored and executive transport.'
                : 'Define operational parameters and secure your assets.'}
            </p>
        </div>
      )}

      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vehicles.map((vehicle) => (
            <div 
              key={vehicle.id} 
              className={`group glass-panel rounded-xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:border-orbit-gold/50 ${vehicle.status !== 'active' ? 'opacity-60 grayscale pointer-events-none' : ''}`}
              onClick={() => vehicle.status === 'active' && handleVehicleSelect(vehicle)}
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={vehicle.imageUrl} 
                  alt={vehicle.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {vehicle.status !== 'active' && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white font-bold tracking-widest uppercase border border-white/30 px-4 py-2 bg-black/50 backdrop-blur-md">
                            {vehicle.status === 'maintenance' ? 'In Maintenance' : 'Unavailable'}
                        </span>
                    </div>
                )}
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent h-32" />
                <div className="absolute bottom-4 left-4">
                  <span className="text-xs font-bold text-orbit-gold uppercase tracking-wider mb-1 block">{vehicle.category}</span>
                  <h3 className="text-2xl font-serif text-white">{vehicle.name}</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-400 text-sm leading-relaxed mb-6 italic border-l-2 border-orbit-gold pl-4">
                  "{vehicle.description}"
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {vehicle.features.map((feature, i) => (
                    <span key={i} className="px-3 py-1 bg-white/5 rounded-full text-xs text-gray-300 border border-white/10">
                      {feature}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-white/10 pt-4">
                  <div>
                    <span className="text-2xl font-bold text-white">${vehicle.pricePerDay}</span>
                    <span className="text-gray-500 text-sm"> / day</span>
                  </div>
                  <button disabled={vehicle.status !== 'active'} className="text-orbit-gold hover:text-white flex items-center gap-2 transition-colors">
                    Reserve <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {step === 2 && selectedVehicle && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-fade-in">
          {/* Summary Card */}
          <div className="lg:col-span-1">
            <div className="glass-panel rounded-xl p-6 sticky top-24">
              <h3 className="text-xl font-serif text-white mb-6">Manifest Summary</h3>
              
              <img 
                src={selectedVehicle.imageUrl} 
                alt={selectedVehicle.name} 
                className="w-full h-40 object-cover rounded-lg mb-6 border border-white/10"
              />
              
              <div className="space-y-4 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Unit</span>
                  <span className="text-white font-medium">{selectedVehicle.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rate</span>
                  <span className="text-white font-medium">${selectedVehicle.pricePerDay} / day</span>
                </div>
                 <div className="flex justify-between">
                  <span>Security/Driver</span>
                  <span className={`font-medium ${withChauffeur ? 'text-orbit-gold' : 'text-gray-500'}`}>
                    {withChauffeur 
                        ? (withSecurity ? `Armed Escort (+${CHAUFFEUR_RATE + SECURITY_PREMIUM}/day)` : `Standard (+${CHAUFFEUR_RATE}/day)`) 
                        : 'Self-Drive'}
                  </span>
                </div>
                {activeCoupon && (
                   <div className="flex justify-between text-orbit-gold">
                      <span className="flex items-center gap-1"><Tag size={12}/> Protocol ({activeCoupon.code})</span>
                      <span>-{activeCoupon.discountPercent * 100}%</span>
                   </div>
                )}
                {startDate && endDate && (
                   <div className="border-t border-white/10 pt-4 mt-4">
                     <div className="flex justify-between items-center">
                        <span className="text-lg">Total Cost</span>
                        <span className="text-3xl font-serif text-orbit-gold">${calculateTotal().toLocaleString()}</span>
                     </div>
                   </div>
                )}
              </div>
              
              <button onClick={() => setStep(1)} className="mt-6 w-full py-2 text-gray-500 hover:text-white text-xs uppercase tracking-widest text-center">
                Select Different Unit
              </button>
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handlePreSubmit} className="glass-panel p-8 md:p-12 rounded-xl space-y-8 relative overflow-hidden">
                {isAnimating && (
                    <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center backdrop-blur-md">
                        <div className="text-center">
                            <div className="animate-spin w-16 h-16 border-4 border-orbit-gold border-t-transparent rounded-full mx-auto mb-6"></div>
                            <h3 className="text-xl text-white font-serif mb-2">Processing Secure Request</h3>
                            <p className="text-orbit-gold tracking-widest uppercase text-xs">{processingStage}</p>
                        </div>
                    </div>
                )}

              {/* CLIENT DETAILS */}
              <div className="space-y-6">
                 <h3 className="text-2xl font-serif text-white flex items-center gap-3">
                  <UserCheck className="text-orbit-gold" /> Principal Client
                </h3>
                <div className="grid grid-cols-1 gap-6">
                    <input 
                        type="text" 
                        placeholder="Full Legal Name"
                        className="w-full p-4 glass-input rounded-lg"
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-6">
                        <input 
                            type="email" 
                            placeholder="Official Email"
                            className="w-full p-4 glass-input rounded-lg"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input 
                            type="tel" 
                            placeholder="Direct Phone"
                            className="w-full p-4 glass-input rounded-lg"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                </div>
              </div>

              {/* DATES */}
              <div className="border-t border-white/10 pt-8 space-y-6">
                <h3 className="text-2xl font-serif text-white flex items-center gap-3">
                  <Calendar className="text-orbit-gold" /> Schedule
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Acquisition Date</label>
                    <input 
                      type="date" 
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full p-4 glass-input rounded-lg"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Release Date</label>
                    <input 
                      type="date" 
                      required
                      min={startDate || new Date().toISOString().split('T')[0]}
                      className="w-full p-4 glass-input rounded-lg"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* LOGISTICS */}
              <div className="border-t border-white/10 pt-8 space-y-6">
                <h3 className="text-2xl font-serif text-white flex items-center gap-3">
                  <MapPin className="text-orbit-gold" /> Logistics & Routing
                </h3>
                
                {/* Pickup Type Tabs */}
                <div className="flex p-1 bg-black/40 rounded-lg w-fit border border-white/10">
                  {(['airport', 'hotel', 'address'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setPickupType(type)}
                      className={`px-6 py-2 rounded-md text-sm uppercase tracking-wider transition-all ${
                        pickupType === type 
                          ? 'bg-orbit-gold text-black font-bold shadow-[0_0_15px_rgba(212,175,55,0.3)]' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {pickupType === 'airport' ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in bg-white/5 p-4 rounded-lg border border-white/10">
                            <div className="md:col-span-1">
                                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Airline</label>
                                <select 
                                    className="w-full p-4 glass-input rounded-lg bg-black text-gray-200"
                                    value={airline}
                                    onChange={(e) => setAirline(e.target.value)}
                                    required
                                >
                                    <option value="" disabled>Select Carrier</option>
                                    {EL_SALVADOR_AIRLINES.map(a => <option key={a} value={a}>{a}</option>)}
                                </select>
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Flight Number</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. AV520"
                                    className="w-full p-4 glass-input rounded-lg"
                                    value={flightNumber}
                                    onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                                    required
                                />
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Arrival Time</label>
                                <input 
                                    type="time" 
                                    className="w-full p-4 glass-input rounded-lg"
                                    value={flightTime}
                                    onChange={(e) => setFlightTime(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Pick-up Location</label>
                            <input 
                                type="text" 
                                required
                                placeholder="Enter specific address"
                                className="w-full p-4 glass-input rounded-lg"
                                value={pickupLocation}
                                onChange={(e) => setPickupLocation(e.target.value)}
                                onBlur={async () => {
                                    if(pickupLocation) setSuggestion(await suggestItinerary(pickupLocation));
                                }}
                            />
                            {suggestion && (
                                <div className="mt-2 flex items-start gap-2 text-xs text-orbit-gold/80 italic">
                                    <Info size={14} className="mt-0.5 shrink-0" />
                                    {suggestion}
                                </div>
                            )}
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Drop-off / Destination</label>
                        <input 
                            type="text" 
                            required
                            placeholder="Destination"
                            className="w-full p-4 glass-input rounded-lg"
                            value={dropoffLocation}
                            onChange={(e) => setDropoffLocation(e.target.value)}
                        />
                    </div>
                </div>
              </div>

              {/* SERVICE */}
              <div className="border-t border-white/10 pt-8 space-y-6">
                <h3 className="text-2xl font-serif text-white flex items-center gap-3">
                  <UserCheck className="text-orbit-gold" /> Personnel
                </h3>
                
                <div 
                  className={`flex items-center justify-between p-6 rounded-xl border transition-all cursor-pointer mb-4 ${
                    withChauffeur 
                      ? 'bg-orbit-gold/10 border-orbit-gold' 
                      : 'bg-black/20 border-white/10 hover:border-white/30'
                  }`}
                  onClick={() => {
                      setWithChauffeur(!withChauffeur);
                      if(withChauffeur) setWithSecurity(false); // Reset security if unchecking driver
                  }}
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${withChauffeur ? 'bg-orbit-gold text-black' : 'bg-white/10 text-gray-400'}`}>
                            <UserCheck size={24} />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-white">Secure Chauffeur Service</h4>
                            <p className="text-sm text-gray-400">Professional driver.</p>
                        </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${withChauffeur ? 'border-orbit-gold bg-orbit-gold' : 'border-gray-500'}`}>
                        {withChauffeur && <CheckCircle size={16} className="text-black" />}
                    </div>
                </div>

                {/* Armed Security Option (Only shows if Chauffeur is selected) */}
                {withChauffeur && (
                     <div 
                        className={`flex items-center justify-between p-6 rounded-xl border transition-all cursor-pointer animate-fade-in ${
                            withSecurity 
                            ? 'bg-red-900/20 border-red-500' 
                            : 'bg-black/20 border-white/10 hover:border-white/30'
                        }`}
                        onClick={() => setWithSecurity(!withSecurity)}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${withSecurity ? 'bg-red-500 text-white' : 'bg-white/10 text-gray-400'}`}>
                                <ShieldAlert size={24} />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-white">Armed Protection</h4>
                                <p className="text-sm text-gray-400">Close protection officer (Armed). <span className="text-red-400">+${SECURITY_PREMIUM}/day</span></p>
                            </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${withSecurity ? 'border-red-500 bg-red-500' : 'border-gray-500'}`}>
                            {withSecurity && <CheckCircle size={16} className="text-white" />}
                        </div>
                    </div>
                )}
              </div>

               {/* PAYMENT */}
               <div className="border-t border-white/10 pt-8 space-y-6">
                  <h3 className="text-2xl font-serif text-white flex items-center gap-3">
                    <CreditCard className="text-orbit-gold" /> Payment Protocol
                  </h3>
                  
                  {/* Notification Toggle (Visible in both modes but styled differently) */}
                   <div className="flex items-center gap-4 bg-white/5 p-4 rounded-lg border border-white/10">
                      <div className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${sendNotifications ? 'bg-green-500' : 'bg-gray-600'}`} onClick={() => setSendNotifications(!sendNotifications)}>
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${sendNotifications ? 'translate-x-4' : ''}`}></div>
                      </div>
                      <div className="flex-1">
                          <span className="text-sm font-bold text-white flex items-center gap-2"><Bell size={14}/> Send Confirmation Alerts</span>
                          <p className="text-xs text-gray-500">Dispatch Email (Mailgun) & SMS (Twilio) upon confirmation.</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 gap-6">
                     <div>
                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Authorization Code (Coupon)</label>
                        <div className="flex gap-2">
                             <input 
                                type="text" 
                                placeholder="Optional"
                                className="flex-1 p-4 glass-input rounded-lg"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                            />
                            <button 
                                type="button"
                                onClick={applyCoupon}
                                className="px-4 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 text-white"
                            >
                                Verify
                            </button>
                        </div>
                     </div>
                  </div>

                  {/* Mock Stripe Element */}
                  <div className="bg-[#0a0a12] p-6 rounded-xl border border-white/10 shadow-inner">
                      <div className="flex justify-between items-center mb-4">
                         <span className="text-gray-400 text-sm flex items-center gap-2"><Lock size={12}/> Encrypted via Stripe Enterprise</span>
                         <div className="flex gap-2">
                            <div className="w-8 h-5 bg-gray-600 rounded opacity-50"></div>
                            <div className="w-8 h-5 bg-white rounded"></div>
                         </div>
                      </div>
                      <div className="space-y-4">
                         <input 
                            type="text" 
                            placeholder="Card Number"
                            maxLength={19}
                            className="w-full p-3 bg-black border border-gray-800 rounded text-white focus:border-orbit-gold focus:outline-none font-mono tracking-wider"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            required={!isAdminMode}
                         />
                         <div className="grid grid-cols-2 gap-4">
                             <input 
                                type="text" 
                                placeholder="MM / YY"
                                className="w-full p-3 bg-black border border-gray-800 rounded text-white focus:border-orbit-gold focus:outline-none font-mono"
                                value={cardExpiry}
                                onChange={(e) => setCardExpiry(e.target.value)}
                                required={!isAdminMode}
                             />
                             <input 
                                type="text" 
                                placeholder="CVC"
                                maxLength={3}
                                className="w-full p-3 bg-black border border-gray-800 rounded text-white focus:border-orbit-gold focus:outline-none font-mono"
                                value={cardCVC}
                                onChange={(e) => setCardCVC(e.target.value)}
                                required={!isAdminMode}
                             />
                         </div>
                      </div>
                  </div>
               </div>

              <button 
                type="submit"
                className="w-full py-5 bg-orbit-gold text-black font-bold text-lg uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
              >
                {isAdminMode ? 'Override & Create Folio' : `Authorize $${calculateTotal().toLocaleString()}`}
              </button>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientView;