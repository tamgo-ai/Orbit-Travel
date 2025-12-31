export enum VehicleCategory {
  SUV_LUXURY = 'SUV Luxury',
  SEDAN_EXECUTIVE = 'Sedan Executive',
  VAN_FIRST_CLASS = 'Van First Class',
  SPORTS_EXOTIC = 'Sports Exotic'
}

export enum BookingStatus {
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
  MAINTENANCE = 'Maintenance'
}

export enum TaskType {
  CHAUFFEUR_SERVICE = 'Chauffeur Service', // Full duration driving
  VEHICLE_DELIVERY = 'Vehicle Delivery',   // Dropping off car to client
  VEHICLE_COLLECTION = 'Vehicle Collection' // Picking up car from client
}

export interface DriverTask {
  id: string;
  bookingId: string;
  type: TaskType;
  startTime: string; // ISO String
  endTime: string;   // ISO String
  location: string;
  isCompleted: boolean;
}

// NEW: Planned Downtime (Maintenance/Vacations)
export interface Downtime {
  id: string;
  resourceId: string; // vehicleId or driverId
  type: 'maintenance' | 'vacation' | 'sick_leave' | 'other';
  startDate: string; // ISO String or YYYY-MM-DD
  endDate: string;   // ISO String or YYYY-MM-DD
  note: string;
}

// NEW: Damage/Incident Reports
export interface Incident {
  id: string;
  vehicleId: string;
  date: string;
  description: string;
  costEstimate: number;
  status: 'reported' | 'in-repair' | 'resolved';
  photos?: string[];
}

export interface Coupon {
  code: string;
  discountPercent: number;
  active: boolean;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalSpent: number;
  notes: string;
  status: 'VIP' | 'Regular' | 'New';
  joinDate: string;
  company?: string;
}

export interface Vehicle {
  id: string;
  name: string;
  category: VehicleCategory;
  imageUrl: string;
  pricePerDay: number;
  description: string;
  features: string[];
  available: boolean;
  plate: string;
  status: 'active' | 'maintenance' | 'retired';
}

export interface Driver {
  id: string;
  name: string;
  rating: number;
  avatarUrl: string;
  status: 'available' | 'on-trip' | 'off-duty'; // Calculated status
  manualStatus?: 'unavailable' | 'on-call' | null; // Manual override
  phone: string;
  licenseNumber: string;
  ratePerDay: number;
  shiftStart: string;
  shiftEnd: string;
  isArmed: boolean;
  schedule: DriverTask[];
}

export interface FlightDetails {
  airline: string;
  flightNumber: string;
  arrivalTime?: string;
}

export interface LogisticsDetails {
  deliveryDriverId?: string | null;
  collectionDriverId?: string | null;
  deliveryStatus: 'pending' | 'assigned' | 'completed';
  collectionStatus: 'pending' | 'assigned' | 'completed';
}

export interface Booking {
  id: string;
  vehicleId: string;
  clientId: string;
  driverId?: string | null; 
  logistics: LogisticsDetails; 
  startDate: string;
  endDate: string;
  pickupType: 'airport' | 'hotel' | 'address';
  pickupLocation: string;
  dropoffLocation: string;
  flightDetails?: FlightDetails;
  withChauffeur: boolean;
  withSecurity?: boolean;
  notificationsEnabled: boolean; // NEW: Track if alerts were requested
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
  paymentStatus: 'paid' | 'pending' | 'refunded';
  couponCode?: string;
}

export interface EmailLog {
  id: string;
  to: string;
  subject: string;
  provider: 'Mailgun';
  status: 'sent' | 'failed';
  timestamp: string;
}

export interface SMSLog {
  id: string;
  to: string;
  body: string;
  provider: 'Twilio';
  status: 'sent' | 'failed';
  timestamp: string;
}