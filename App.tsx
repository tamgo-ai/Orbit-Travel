import React, { useState } from 'react';
import Layout from './components/Layout';
import ClientView from './components/ClientView';
import AdminDashboard from './components/AdminDashboard';
import { Vehicle, Driver, Booking, BookingStatus, Coupon, EmailLog, SMSLog, Client, TaskType, DriverTask, Downtime, Incident } from './types';
import { INITIAL_VEHICLES, INITIAL_DRIVERS, INITIAL_BOOKINGS, INITIAL_COUPONS, INITIAL_CLIENTS, INITIAL_DOWNTIME, INITIAL_INCIDENTS } from './constants';
import { MailgunService, TwilioService } from './services/integrations';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'client' | 'admin'>('client');
  
  // App State
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [downtimes, setDowntimes] = useState<Downtime[]>(INITIAL_DOWNTIME);
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [emails, setEmails] = useState<EmailLog[]>([]);
  const [smsLogs, setSmsLogs] = useState<SMSLog[]>([]);

  // --- Actions ---

  const handleNewBooking = async (
      bookingData: Omit<Booking, 'id' | 'status' | 'createdAt' | 'driverId' | 'paymentStatus' | 'clientId' | 'logistics' | 'notificationsEnabled'>, 
      clientDetails: { name: string, email: string, phone: string },
      sendNotifications: boolean = true
    ) => {
    
    // CRM Logic: Check if client exists, else create
    let clientId = clients.find(c => c.email === clientDetails.email)?.id;
    
    if (!clientId) {
        clientId = `c${Date.now()}`;
        const newClient: Client = {
            id: clientId,
            name: clientDetails.name,
            email: clientDetails.email,
            phone: clientDetails.phone,
            totalSpent: 0,
            notes: 'New Online Registration',
            status: 'New',
            joinDate: new Date().toISOString().split('T')[0]
        };
        setClients(prev => [...prev, newClient]);
    }

    const newBooking: Booking = {
      ...bookingData,
      id: `b${Date.now()}`,
      clientId,
      status: BookingStatus.PENDING,
      createdAt: new Date().toISOString(),
      driverId: null, // Initially null, assigned via Logistics
      logistics: {
          deliveryStatus: 'pending',
          collectionStatus: 'pending',
          deliveryDriverId: null,
          collectionDriverId: null
      },
      paymentStatus: 'paid',
      notificationsEnabled: sendNotifications // Persist preference
    };
    
    // Update State
    setBookings([newBooking, ...bookings]);
    
    // Update Client Spend
    setClients(prev => prev.map(c => 
        c.id === clientId 
            ? { ...c, totalSpent: c.totalSpent + newBooking.totalPrice }
            : c
    ));
    
    // Notifications Logic
    if (sendNotifications) {
        // Trigger Confirmation Email (Mailgun)
        const mailResult = await MailgunService.sendEmail(clientDetails.email, `ORBIT Folio #${newBooking.id} Confirmed`, {});
        setEmails(prev => [{
            id: mailResult.id,
            to: clientDetails.email,
            subject: `Confirmation: Booking #${newBooking.id}`,
            provider: 'Mailgun',
            status: 'sent',
            timestamp: new Date().toISOString()
        }, ...prev]);

        // Trigger SMS (Twilio)
        if (clientDetails.phone) {
            const smsResult = await TwilioService.sendSMS(clientDetails.phone, `ORBIT: Your reservation #${newBooking.id} is confirmed. View your secure folio in the app.`);
            setSmsLogs(prev => [{
                id: smsResult.id,
                to: clientDetails.phone,
                body: `Reservation #${newBooking.id} Confirmed`,
                provider: 'Twilio',
                status: 'sent',
                timestamp: new Date().toISOString()
            }, ...prev]);
        }
    }
  };

  const handleAddVehicle = (newVehicle: Vehicle) => {
    setVehicles([...vehicles, newVehicle]);
  };

  const handleUpdateVehicle = (updatedVehicle: Vehicle) => {
      setVehicles(vehicles.map(v => v.id === updatedVehicle.id ? updatedVehicle : v));
  }

  const handleAddDriver = (newDriver: Driver) => {
      setDrivers([...drivers, newDriver]);
  };

  const handleUpdateDriver = (updatedDriver: Driver) => {
      setDrivers(drivers.map(d => d.id === updatedDriver.id ? updatedDriver : d));
  }

  const handleToggleTaskCompletion = (driverId: string, taskId: string) => {
      setDrivers(prevDrivers => prevDrivers.map(driver => {
          if (driver.id !== driverId) return driver;
          return {
              ...driver,
              schedule: driver.schedule.map(task => 
                  task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
              )
          };
      }));
  };

  const handleAddCoupon = (newCoupon: Coupon) => {
      setCoupons([...coupons, newCoupon]);
  }

  const handleAddDowntime = (downtime: Downtime) => {
      setDowntimes([...downtimes, downtime]);
  }

  const handleAddIncident = (incident: Incident) => {
      setIncidents([...incidents, incident]);
  }

  // UPDATED: Handle complex task assignment
  const handleAssignTask = (bookingId: string, driverId: string, taskType: TaskType, startTime: string, endTime: string) => {
      
      const newTask: DriverTask = {
          id: `t${Date.now()}`,
          bookingId,
          type: taskType,
          startTime,
          endTime,
          location: 'TBD', // Logic could refine this
          isCompleted: false
      };

      // 1. Update Booking Logistics
      setBookings(prev => prev.map(b => {
          if (b.id !== bookingId) return b;
          
          const newLogistics = { ...b.logistics };
          let newDriverId = b.driverId;

          if (taskType === TaskType.CHAUFFEUR_SERVICE) {
              newDriverId = driverId; // Main driver
          } else if (taskType === TaskType.VEHICLE_DELIVERY) {
              newLogistics.deliveryDriverId = driverId;
              newLogistics.deliveryStatus = 'assigned';
          } else if (taskType === TaskType.VEHICLE_COLLECTION) {
              newLogistics.collectionDriverId = driverId;
              newLogistics.collectionStatus = 'assigned';
          }

          // If all necessary assignments are made, confirm booking
          let newStatus = b.status;
          if (b.withChauffeur && driverId) newStatus = BookingStatus.CONFIRMED;
          if (!b.withChauffeur && newLogistics.deliveryStatus === 'assigned' && newLogistics.collectionStatus === 'assigned') {
              newStatus = BookingStatus.CONFIRMED;
          }

          return { ...b, status: newStatus, logistics: newLogistics, driverId: newDriverId };
      }));

      // 2. Update Driver Schedule
      setDrivers(prev => prev.map(d => {
          if (d.id === driverId) {
              return { ...d, schedule: [...d.schedule, newTask] };
          }
          return d;
      }));
  };

  const handleEditBooking = (updatedBooking: Booking) => {
      setBookings(bookings.map(b => b.id === updatedBooking.id ? updatedBooking : b));
  }

  // CRM CRUD
  const handleAddClient = (newClient: Client) => {
      setClients([...clients, newClient]);
  }

  const handleUpdateClient = (updatedClient: Client) => {
      setClients(clients.map(c => c.id === updatedClient.id ? updatedClient : c));
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'client' ? (
        <ClientView 
          vehicles={vehicles}
          coupons={coupons}
          onBook={handleNewBooking}
        />
      ) : (
        <AdminDashboard 
          vehicles={vehicles}
          drivers={drivers}
          bookings={bookings}
          coupons={coupons}
          emails={emails}
          clients={clients}
          downtimes={downtimes}
          incidents={incidents}
          onAddVehicle={handleAddVehicle}
          onUpdateVehicle={handleUpdateVehicle}
          onAddDriver={handleAddDriver}
          onUpdateDriver={handleUpdateDriver}
          onAddCoupon={handleAddCoupon}
          onAssignTask={handleAssignTask}
          onEditBooking={handleEditBooking}
          onAdminBook={handleNewBooking}
          onAddClient={handleAddClient}
          onUpdateClient={handleUpdateClient}
          onAddDowntime={handleAddDowntime}
          onAddIncident={handleAddIncident}
          onToggleTaskCompletion={handleToggleTaskCompletion}
        />
      )}
    </Layout>
  );
};

export default App;