import React, { useState, useEffect, useCallback } from "react";
import "./TrackService.css";
import UserSideTop from "./UserSideTop";
import PayNow from "./Payment/PayNow";
import { getAppointmentsByUser } from "../services/bookAppointment";
import { websocketService } from "../services/websocketService";
import type { Appointment } from "../types/appointment";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClock,
  faCheckCircle,
  faWrench,
  faCreditCard,
  faFlagCheckered,
  faCalendarAlt,
  faCar,
  faTools,
  faExclamationTriangle,
  faSpinner,
  faFileInvoiceDollar,
} from '@fortawesome/free-solid-svg-icons';

type Status = 'Booked' | 'Confirmed' | 'In Progress' | 'Payment' | 'Completed' | 'Cancelled';

interface Stage {
  name: Status;
  icon: any;
  description: string;
}

const stages: Stage[] = [
  { name: 'Booked', icon: faClock, description: 'Request Received' },
  { name: 'Confirmed', icon: faCheckCircle, description: 'Booking Confirmed' },
  { name: 'In Progress', icon: faWrench, description: 'Service Ongoing' },
  { name: 'Payment', icon: faCreditCard, description: 'Payment Processing' },
  { name: 'Completed', icon: faFlagCheckered, description: 'Service Done' }
];

const TrackService: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  const [billTotal, setBillTotal] = useState<number>(0);
  const [isPayNowOpen, setIsPayNowOpen] = useState<boolean>(false);

  const rawUserId = localStorage.getItem('userId');
  const userId = rawUserId ? String(rawUserId) : null;

  // Calculate bill total from bill items
  const calculateBillTotal = (appointment: Appointment | null) => {
    if (!appointment || !appointment.billItems || appointment.billItems.length === 0) {
      return 0;
    }
    return appointment.billItems.reduce((total, item) => {
      return total + item.itemPrice + (item.serviceCharge || 0);
    }, 0);
  };

  // Fetch initial appointments
  const fetchAppointments = useCallback(async () => {
    if (!userId || userId === 'null' || userId === 'undefined') {
      setError('User not authenticated. Please log in.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getAppointmentsByUser(userId);
      let userAppointments = [];

      if (response.success && Array.isArray(response.appointments)) {
        userAppointments = response.appointments;
      } else if (Array.isArray(response)) {
        userAppointments = response;
      }

      const sortedAppointments = userAppointments.sort(
        (a: Appointment, b: Appointment) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setAppointments(sortedAppointments);
      if (sortedAppointments.length > 0) {
        setSelectedAppointment(sortedAppointments[0]);
        setBillTotal(calculateBillTotal(sortedAppointments[0]));
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!userId) return;

    // Connect to WebSocket using your existing service
    websocketService.connect(userId, 'user');

    // Check connection status
    const connected = websocketService.isConnected();
    setConnectionStatus(connected ? 'connected' : 'connecting');

    // Subscribe to appointment updates
    websocketService.subscribeToAppointmentUpdates(
      // Handle status updates
      (data) => {
        console.log('Received status update:', data);

        // Update appointments list
        setAppointments(prev =>
          prev.map(appt =>
            appt.appointmentId.toString() === data.appointmentId
              ? { ...appt, status: data.status }
              : appt
          )
        );

        // Update selected appointment if it's the current one
        setSelectedAppointment(prev => {
          const updated = prev && prev.appointmentId.toString() === data.appointmentId
            ? { ...prev, status: data.status }
            : prev;
          if (updated) {
            setBillTotal(calculateBillTotal(updated));
          }
          return updated;
        });
      },
      // Handle new appointments
      (data) => {
        console.log('Received new appointment:', data);
        if (data.appointment) {
          setAppointments(prev => {
            // Check if already exists
            const exists = prev.some(a => a.appointmentId.toString() === data.appointment.appointmentId.toString());
            if (!exists) {
              return [data.appointment, ...prev].sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
            }
            return prev;
          });
        }
      }
    );

    // Subscribe to bill updates
    const handleBillUpdate = (data: { appointmentId: string; message: string }) => {
      console.log('🔔 Bill update received:', data);
      
      // Refresh the selected appointment to get updated bill
      setAppointments(prev => {
        const updated = prev.map(appt => {
          if (appt.appointmentId.toString() === data.appointmentId) {
            // Mark that bill was updated, will refresh on next fetch
            return { ...appt, billUpdatedAt: new Date() };
          }
          return appt;
        });
        
        // Update selected appointment
        const selectedAppt = updated.find(a => a.appointmentId.toString() === data.appointmentId);
        if (selectedAppt) {
          setSelectedAppointment(selectedAppt);
          setBillTotal(calculateBillTotal(selectedAppt));
        }
        
        return updated;
      });
    };

    websocketService.subscribeToBillUpdates(handleBillUpdate);

    // Cleanup
    return () => {
      websocketService.unsubscribeFromUpdates();
      // Don't disconnect here because other components might be using it
      // websocketService.disconnect();
    };
  }, [userId]);

  const handleAppointmentSelect = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setBillTotal(calculateBillTotal(appointment));
  };

  const handlePayNow = () => {
    if (!selectedAppointment || billTotal <= 0) {
      alert('No bill to pay. Please wait for the admin to generate the bill.');
      return;
    }

    setIsPayNowOpen(true);
  };

  const handlePaymentSuccess = () => {
    // Refresh appointments after successful payment
    fetchAppointments();
    setIsPayNowOpen(false);
  };

  const formatStatus = (status: string): Status => {
    if (!status) return 'Booked';
    const s = status.toLowerCase().trim();
    
    // Map backend statuses to frontend display statuses
    if (s === 'booked' || s === 'pending') return 'Booked';
    if (s.includes('confirm')) return 'Confirmed';
    if (s.includes('progress')) return 'In Progress';
    if (s.includes('payment')) return 'Payment';
    if (s.includes('complete')) return 'Completed';
    if (s.includes('cancel')) return 'Cancelled';
    
    return 'Booked';
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'Completed': return 'trackService-status-completed';
      case 'In Progress': return 'trackService-status-progress';
      case 'Confirmed': return 'trackService-status-confirmed';
      case 'Payment': return 'trackService-status-payment';
      case 'Cancelled': return 'trackService-status-cancelled';
      default: return 'trackService-status-booked';
    }
  };

  // Calculate progress percentage
  const getProgressPercent = (status: Status) => {
    const index = stages.findIndex(s => s.name === status);
    if (index === -1) return 0;
    return (index / (stages.length - 1)) * 100;
  };

  if (loading) {
    return (
      <UserSideTop>
        <div className="trackService-container">
          <div className="trackService-loading">
            <FontAwesomeIcon icon={faSpinner} spin size="3x" />
            <p>Loading your service dashboard...</p>
          </div>
        </div>
      </UserSideTop>
    );
  }

  if (error) {
    return (
      <UserSideTop>
        <div className="trackService-container">
          <div className="trackService-error">
            <FontAwesomeIcon icon={faExclamationTriangle} size="3x" />
            <h2>Oops!</h2>
            <p>{error}</p>
          </div>
        </div>
      </UserSideTop>
    );
  }

  const currentStatus = selectedAppointment ? formatStatus(selectedAppointment.status) : 'Booked';
  const progressPercent = getProgressPercent(currentStatus);

  return (
    <UserSideTop>
      <div className="trackService-page">
        <div className="trackService-header">
          <div className="trackService-header-top">
            <h1 className="trackService-title">Service Tracker</h1>
          </div>
          <p className="trackService-subtitle">Real-time updates on your vehicle maintenance</p>
        </div>

        {appointments.length === 0 ? (
          <div className="trackService-empty">
            <div className="trackService-empty-icon">🔧</div>
            <h3>No Active Services</h3>
            <p>You don't have any appointments to track right now.</p>
          </div>
        ) : (
          <div className="trackService-dashboard">
            
            {/* Left Sidebar: Appointment List */}
            <aside className="trackService-sidebar">
              <h3 className="trackService-sidebar-title">Your Appointments</h3>
              <div className="trackService-list">
                {appointments.map((appt) => {
                  const status = formatStatus(appt.status);
                  const isSelected = selectedAppointment?._id === appt._id;

                  return (
                    <div
                      key={appt._id}
                      className={`trackService-card ${isSelected ? 'trackService-card--active' : ''}`}
                      onClick={() => handleAppointmentSelect(appt)}
                    >
                      <div className="trackService-card-header">
                        <span className="trackService-card-id">#{appt.appointmentId}</span>
                        <span className={`trackService-card-badge ${getStatusColor(status)}`}>
                          {status}
                        </span>
                      </div>
                      <div className="trackService-card-body">
                        <div className="trackService-card-vehicle">
                          <FontAwesomeIcon icon={faCar} />
                          <span>{appt.vehicleInfo.model}</span>
                        </div>
                        <div className="trackService-card-meta">
                          <span><FontAwesomeIcon icon={faCalendarAlt} /> {new Date(appt.date).toLocaleDateString()}</span>
                          <span><FontAwesomeIcon icon={faTools} /> {appt.serviceType}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </aside>

            {/* Main Content: Tracking Visualization */}
            <main className="trackService-main">
              {selectedAppointment ? (
                <>
                  {/* Status Header */}
                  <div className="trackService-status-header">
                    <div>
                      <h2>{selectedAppointment.vehicleInfo.model}</h2>
                      <p>{selectedAppointment.vehicleInfo.numberPlate} • {selectedAppointment.serviceType} Service</p>
                    </div>
                    <div className="trackService-status-actions">
                      <div className={`trackService-status-pill ${getStatusColor(currentStatus)}`}>
                        {currentStatus}
                      </div>
                      {currentStatus === 'Payment' && billTotal > 0 && (
                        <button
                          className="trackService-pay-btn"
                          onClick={handlePayNow}
                        >
                          <FontAwesomeIcon icon={faCreditCard} /> Pay Now
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Visual Progress Tracker */}
                  <div className="trackService-tracker-container">
                    <div className="trackService-tracker">
                      {/* Progress Bar Background */}
                      <div className="trackService-tracker-line-bg"></div>
                      {/* Active Progress Bar */}
                      <div 
                        className="trackService-tracker-line-fill" 
                        style={{ width: `${progressPercent}%` }}
                      ></div>

                      {/* Steps */}
                      <div className="trackService-steps">
                        {stages.map((stage, index) => {
                          const currentIndex = stages.findIndex(s => s.name === currentStatus);
                          const isCompleted = index < currentIndex;
                          const isActive = index === currentIndex;

                          return (
                            <div 
                              key={stage.name} 
                              className={`trackService-step 
                                ${isCompleted ? 'trackService-step--completed' : ''} 
                                ${isActive ? 'trackService-step--active' : ''}`
                              }
                            >
                              <div className="trackService-step-icon">
                                <FontAwesomeIcon icon={stage.icon} />
                              </div>
                              <div className="trackService-step-info">
                                <span className="trackService-step-title">{stage.name}</span>
                                <span className="trackService-step-desc">{stage.description}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="trackService-details-grid">
                    <div className="trackService-detail-box">
                      <h4>Scheduled Date</h4>
                      <p>{new Date(selectedAppointment.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div className="trackService-detail-box">
                      <h4>Time Slot</h4>
                      <p>{selectedAppointment.time}</p>
                    </div>
                    <div className="trackService-detail-box trackService-detail-box--wide">
                      <h4>
                        <FontAwesomeIcon icon={faFileInvoiceDollar} /> Bill Details
                      </h4>
                      {selectedAppointment.billItems && selectedAppointment.billItems.length > 0 ? (
                        <div className="trackService-bill-details">
                          <table className="trackService-bill-table">
                            <thead>
                              <tr>
                                <th>Item Name</th>
                                <th>Item Price</th>
                                <th>Service Charge</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedAppointment.billItems.map((item, index) => (
                                <tr key={item._id || index}>
                                  <td>{item.itemName}</td>
                                  <td>Rs. {item.itemPrice.toFixed(2)}</td>
                                  <td>Rs. {item.serviceCharge.toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr className="trackService-bill-total-row">
                                <td><strong>Total Amount</strong></td>
                                <td colSpan={2}><strong>Rs. {billTotal.toFixed(2)}</strong></td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      ) : (
                        <p className="trackService-bill-amount">Waiting for bill...</p>
                      )}
                    </div>
                    <div className="trackService-detail-box trackService-detail-box--wide">
                      <h4>Current Update</h4>
                      <p className="trackService-pulse-text">
                        {currentStatus === 'Booked' && "We have received your request and are waiting for confirmation."}
                        {currentStatus === 'Confirmed' && "Great news! Your service has been confirmed by the center."}
                        {currentStatus === 'In Progress' && "Our mechanics are currently working on your vehicle."}
                        {currentStatus === 'Payment' && "Service completed! Please proceed with payment to finish."}
                        {currentStatus === 'Completed' && "Service completed successfully. Thank you for choosing us!"}
                        {currentStatus === 'Cancelled' && "This appointment has been cancelled. Please contact us if you need assistance."}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="trackService-placeholder">
                  <p>Select an appointment to view details</p>
                </div>
              )}
            </main>
          </div>
        )}
      </div>

      {/* PayNow Overlay */}
      <PayNow
        isOpen={isPayNowOpen}
        onClose={() => setIsPayNowOpen(false)}
        paymentType="appointment"
        itemId={selectedAppointment?.appointmentId}
        amount={billTotal}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </UserSideTop>
  );
};

export default TrackService;