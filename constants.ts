import { Vehicle, VehicleCategory, Driver, Booking, BookingStatus, Coupon, Client, TaskType, Downtime, Incident } from './types';

export const EL_SALVADOR_AIRLINES = [
  'Avianca',
  'United Airlines',
  'American Airlines',
  'Delta Air Lines',
  'Copa Airlines',
  'Volaris',
  'Spirit Airlines',
  'Iberia',
  'Aeroméxico'
];

export const INITIAL_CLIENTS: Client[] = [
  { id: 'c1', name: 'Ricardo Poma', email: 'r.poma@vip.sv', phone: '+503 7000-0001', totalSpent: 15400, notes: 'Prefers Escalades only. Cold water.', status: 'VIP', joinDate: '2023-01-15', company: 'Grupo Poma' },
  { id: 'c2', name: 'Guest User', email: 'guest@orbit.com', phone: '', totalSpent: 0, notes: 'Temporary profile', status: 'New', joinDate: '2024-01-01' },
];

export const INITIAL_COUPONS: Coupon[] = [
  { code: 'VIP20', discountPercent: 0.20, active: true },
  { code: 'WELCOME10', discountPercent: 0.10, active: true },
  { code: 'ORBITAL', discountPercent: 0.15, active: false },
];

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'v1',
    name: 'Cadillac Escalade ESV',
    category: VehicleCategory.SUV_LUXURY,
    imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1000',
    pricePerDay: 450,
    description: 'A sanctuary of silence and hand-stitched leather, offering an imposing presence that demands respect on any arrival.',
    features: ['Massage Seats', 'Privacy Glass', 'Wi-Fi', 'Armored'],
    available: true,
    plate: 'ORBIT-01',
    status: 'active'
  },
  {
    id: 'v2',
    name: 'Mercedes-Benz S-Class',
    category: VehicleCategory.SEDAN_EXECUTIVE,
    imageUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=1000',
    pricePerDay: 350,
    description: 'The definitive statement of personal achievement, combining cutting-edge technology with timeless elegance.',
    features: ['Reclining Rear Seats', 'Burmester Audio', 'Ambient Lighting'],
    available: true,
    plate: 'ORBIT-02',
    status: 'active'
  },
  {
    id: 'v3',
    name: 'Chevrolet Suburban High Country',
    category: VehicleCategory.SUV_LUXURY,
    imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000',
    pricePerDay: 300,
    description: 'Uncompromising capability meets executive refinement, perfect for secure and discreet group transport.',
    features: ['7 Passengers', 'Secure Trunk', '4WD'],
    available: false,
    plate: 'ORBIT-03',
    status: 'maintenance'
  }
];

export const INITIAL_DRIVERS: Driver[] = [
  { 
    id: 'd1', 
    name: 'Arthur Pennyworth', 
    rating: 5.0, 
    avatarUrl: 'https://i.pravatar.cc/150?u=d1', 
    status: 'available', 
    manualStatus: null,
    phone: '+1 555-0101', 
    licenseNumber: 'NY-8821',
    ratePerDay: 250,
    shiftStart: '06:00',
    shiftEnd: '18:00',
    isArmed: false,
    schedule: []
  },
  { 
    id: 'd2', 
    name: 'James Bond', 
    rating: 4.9, 
    avatarUrl: 'https://i.pravatar.cc/150?u=d2', 
    status: 'on-trip', 
    manualStatus: null,
    phone: '+1 555-0007', 
    licenseNumber: 'MI6-007',
    ratePerDay: 450,
    shiftStart: '12:00',
    shiftEnd: '00:00',
    isArmed: true,
    schedule: [
        {
            id: 't1',
            bookingId: 'b1',
            type: TaskType.CHAUFFEUR_SERVICE,
            startTime: new Date(Date.now() - 3600000).toISOString(),
            endTime: new Date(Date.now() + 3600000).toISOString(),
            location: 'JFK',
            isCompleted: false
        }
    ]
  },
  { 
    id: 'd3', 
    name: 'Frank Martin', 
    rating: 4.8, 
    avatarUrl: 'https://i.pravatar.cc/150?u=d3', 
    status: 'available', 
    manualStatus: null,
    phone: '+1 555-9988', 
    licenseNumber: 'TR-9922',
    ratePerDay: 200,
    shiftStart: '08:00',
    shiftEnd: '20:00',
    isArmed: false,
    schedule: []
  },
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    vehicleId: 'v3',
    clientId: 'c1',
    driverId: 'd2',
    logistics: {
        deliveryDriverId: 'd2',
        deliveryStatus: 'assigned',
        collectionStatus: 'pending'
    },
    startDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
    endDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // 2 days from now
    pickupType: 'airport',
    pickupLocation: 'JFK Private Terminal',
    dropoffLocation: 'The Plaza Hotel',
    withChauffeur: true,
    withSecurity: true,
    notificationsEnabled: true,
    totalPrice: 1200,
    status: BookingStatus.MAINTENANCE, // Using booking system to block timeline for maintenance
    createdAt: new Date().toISOString(),
    paymentStatus: 'paid',
    flightDetails: { airline: 'Avianca', flightNumber: 'AV520', arrivalTime: '14:30' }
  }
];

export const INITIAL_DOWNTIME: Downtime[] = [
    {
        id: 'dt1',
        resourceId: 'v1',
        type: 'maintenance',
        startDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0], // 5 days from now
        endDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
        note: 'Scheduled 50k mile service'
    },
    {
        id: 'dt2',
        resourceId: 'd1',
        type: 'vacation',
        startDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0],
        note: 'Annual Leave'
    }
];

export const INITIAL_INCIDENTS: Incident[] = [
    {
        id: 'inc1',
        vehicleId: 'v2',
        date: new Date(Date.now() - 86400000 * 10).toISOString().split('T')[0],
        description: 'Minor scratch on rear bumper during valet parking.',
        costEstimate: 450,
        status: 'resolved'
    }
];