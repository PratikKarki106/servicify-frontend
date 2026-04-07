import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast } from 'react-toastify';
import {
  faCalendarCheck,
  faClock,
  faFileInvoiceDollar,
  faMapMarkerAlt,
  faCheckCircle,
  faWrench,
  faHistory,
  faSpinner,
  faExclamationTriangle,
  faCalendarPlus,
  faCreditCard
} from '@fortawesome/free-solid-svg-icons';
import type { ServiceBooking } from '../../types/dashboardTypes';
import { getAppointmentsByUser, cancelAppointment } from '../../services/bookAppointment';
import type { Appointment } from '../../types/appointment';
import { websocketService } from '../../services/websocketService';
import PayNow from '../Payment/PayNow';

interface ActiveBookingsProps {
  onBookService: () => void;
  onTrackService: (appointmentId: string | number) => void;
  onViewDetails: (appointmentId: string | number) => void;
  onReschedule: (appointmentId: string | number) => void;
  onCancelBooking: (appointmentId: string | number) => void;

}

const ActiveBookings: React.FC<ActiveBookingsProps> = ({
  onBookService,
  onTrackService,
  onViewDetails,
  onReschedule,
  onCancelBooking
}) => {
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | number | null>(null);
  const [cancelSuccess, setCancelSuccess] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState<boolean>(false);
  const [isPayNowOpen, setIsPayNowOpen] = useState<boolean>(false);
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState<ServiceBooking | null>(null);

  // Helper function to safely map status string to ServiceBooking status
  const mapToServiceBookingStatus = (status: string): ServiceBooking['status'] => {
    const normalizedStatus = status.toLowerCase().trim();

    // Map backend statuses to standard status values
    if (normalizedStatus === 'booked' || normalizedStatus === 'pending') return 'pending';
    if (normalizedStatus === 'confirmed') return 'confirmed';
    if (normalizedStatus === 'in-progress' || normalizedStatus === 'in_progress' || normalizedStatus === 'in progress') return 'in-progress';
    if (normalizedStatus === 'payment') return 'payment';
    if (normalizedStatus === 'completed') return 'completed';
    if (normalizedStatus === 'cancelled') return 'cancelled';

    // Handle special cases
    if (normalizedStatus === 'scheduled') return 'confirmed';

    return 'pending' as ServiceBooking['status'];
  };

  const formatVehicleInfo = (vehicleInfo: { name: string; model: string; color: string; numberPlate: string; } | undefined) => {
    if (!vehicleInfo) return 'N/A';

    const vehicleName = vehicleInfo.name;
    const { model, color, numberPlate } = vehicleInfo;
    const parts = [];
    if (vehicleName) parts.push(vehicleName);
    if (model) parts.push(model);
    if (color) parts.push(color);
    if (numberPlate) parts.push(`(${numberPlate})`);

    return parts.length > 0 ? parts.join(' ') : 'N/A';
  };

  // Calculate total bill amount from bill items
  const calculateTotalAmount = (billItems: any[] | undefined) => {
    if (!billItems || billItems.length === 0) return 0;
    
    return billItems.reduce((total, item) => {
      return total + item.itemPrice + (item.serviceCharge || 0);
    }, 0);
  };

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    setCancelSuccess(null);
    setCancelError(null);

    try {
      const UserID = localStorage.getItem('userId') || '';

      if (!UserID) {
        throw new Error('User ID not found');
      }

      console.log('Fetching appointments for user:', UserID);
      const response = await getAppointmentsByUser(UserID);
      console.log('Appointments response:', response);

      // Handle different response structures
      let appointmentsUser: Appointment[] = [];

      if (response.success && Array.isArray(response.appointments)) {
        // Backend returns { success: true, appointments: [...] }
        appointmentsUser = response.appointments;
        console.log('Appointments with bill items:', appointmentsUser.map(a => ({
          id: a.appointmentId,
          billItems: a.billItems
        })));
      } else if (Array.isArray(response)) {
        // In case response is directly an array
        appointmentsUser = response;
      } else if (response.success === false) {
        // Handle error response
        throw new Error(response.message || 'Failed to fetch appointments');
      } else {
        // Fallback
        appointmentsUser = [];
      }

      // Filter out cancelled and completed appointments (completed go to History)
      const activeAppointments = appointmentsUser.filter(app =>
        app.status !== 'completed' && app.status !== 'cancelled'
      );

      const convertedBookings: ServiceBooking[] = activeAppointments.map(appointment => {
        const vehicleString = formatVehicleInfo(appointment.vehicleInfo);

        // Use appointmentId instead of _id
        const bookingId = appointment.appointmentId || appointment._id;

        // Calculate total amount from bill items
        const totalAmount = calculateTotalAmount(appointment.billItems);

        return {
          id: bookingId.toString(), // Store as string for consistency
          serviceType: appointment.serviceType || 'General Service',
          vehicle: vehicleString,
          date: appointment.date,
          time: appointment.time,
          status: mapToServiceBookingStatus(appointment.status),
          estimatedCost: totalAmount, // Use the calculated total from bill
          rawAppointment: appointment // Keep reference to original appointment data
        };
      });

      setBookings(convertedBookings);
    } catch (err: any) {
      console.error('Error fetching appointments:', err);

      // Check if it's a 404 error (no appointments) - but this should be handled in the service now
      if (err.message?.includes('not found') || err.message?.includes('No appointments')) {
        // No appointments found, which is fine
        setBookings([]);
        setError(null);
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        // Authentication errors
        setError('Please log in to view your appointments');
      } else {
        // Real errors
        setError(err.message || 'Failed to load appointments');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePayNowClick = (booking: ServiceBooking) => {
    if (booking.estimatedCost <= 0) {
      alert('No bill to pay. Please wait for the admin to generate the bill.');
      return;
    }
    setSelectedBookingForPayment(booking);
    setIsPayNowOpen(true);
  };

  const handlePaymentSuccess = () => {
    // Refresh the bookings list after successful payment
    fetchAppointments();
    setIsPayNowOpen(false);
    setSelectedBookingForPayment(null);
  };

  // Check if user returned from successful payment
  useEffect(() => {
    const paymentSuccess = sessionStorage.getItem('paymentSuccess');
    if (paymentSuccess) {
      sessionStorage.removeItem('paymentSuccess');
      // Show success toast
      toast.success('🎉 Your appointment payment is completed successfully!', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
      // Refresh appointments to show updated status
      fetchAppointments();
    }
  }, []);

  // Fetch bookings data
  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (appointmentId: string | number, reason?: string) => {
    setCancellingId(appointmentId);
    setCancelError(null);
    setCancelSuccess(null);

    try {
      console.log('Cancelling appointment:', appointmentId);
      
      // Call the cancelAppointment API
      const response = await cancelAppointment(appointmentId, reason || 'Cancelled by user');
      
      console.log('Cancel response:', response);
      
      if (response.success) {
        setCancelSuccess(`Appointment #${appointmentId} has been cancelled successfully.`);
        
        // Call parent callback if provided
        if (onCancelBooking) {
          onCancelBooking(appointmentId);
        }
        
        // Refresh the bookings list after a short delay
        setTimeout(() => {
          fetchAppointments();
        }, 1500);
      } else {
        setCancelError(response.message || 'Failed to cancel appointment');
      }
    } catch (err: any) {
      console.error('Error cancelling appointment:', err);
      setCancelError(err.message || 'Failed to cancel appointment. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getStatusColor = (status: ServiceBooking['status']) => {
    switch (status) {
      case 'pending': return '#1565C0';
      case 'confirmed': return '#2E7D32';
      case 'in-progress': return '#1976D2';
      case 'payment': return '#F57C00';
      case 'completed': return '#00796B';
      case 'cancelled': return '#C62828';
      default: return '#9E9E9E';
    }
  };

  const getStatusIcon = (status: ServiceBooking['status']) => {
    switch (status) {
      case 'pending': return <FontAwesomeIcon icon={faClock} style={{ color: '#1565C0' }} />;
      case 'confirmed': return <FontAwesomeIcon icon={faCheckCircle} style={{ color: '#2E7D32' }} />;
      case 'in-progress': return <FontAwesomeIcon icon={faWrench} style={{ color: '#1976D2' }} />;
      case 'payment': return <FontAwesomeIcon icon={faCreditCard} style={{ color: '#F57C00' }} />;
      case 'completed': return <FontAwesomeIcon icon={faHistory} style={{ color: '#00796B' }} />;
      case 'cancelled': return <FontAwesomeIcon icon={faExclamationTriangle} style={{ color: '#C62828' }} />;
      default: return null;
    }
  };

  const handleRetry = () => {
    fetchAppointments();
  };

  // Clear success/error messages after some time
  useEffect(() => {
    if (cancelSuccess || cancelError) {
      const timer = setTimeout(() => {
        setCancelSuccess(null);
        setCancelError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [cancelSuccess, cancelError]);

  // WebSocket listener for real-time bill updates
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    // Connect to WebSocket if not already connected
    const socket = websocketService.connect(userId, 'user');

    // Update connection status
    setIsWebSocketConnected(socket?.connected || false);

    socket?.on('connect', () => {
      setIsWebSocketConnected(true);
      console.log('✅ WebSocket connected');
    });

    socket?.on('disconnect', () => {
      setIsWebSocketConnected(false);
      console.log('❌ WebSocket disconnected');
    });

    // Subscribe to bill updates
    const handleBillUpdate = (data: { appointmentId: string; message: string }) => {
      console.log('🔔 Bill update received:', data);
      
      // Show notification to user
      setCancelSuccess(`Your appointment #${data.appointmentId} bill has been updated. Refreshing...`);
      
      // Refresh the bookings list to get updated bill amount
      setTimeout(() => {
        fetchAppointments();
      }, 1000);
    };

    websocketService.subscribeToBillUpdates(handleBillUpdate);

    // Cleanup on unmount
    return () => {
      websocketService.unsubscribeFromUpdates();
      socket?.off('connect');
      socket?.off('disconnect');
    };
  }, []);

  if (loading) {
    return (
      <div className="userdashboard-section bookings-section">
        <div className="userdashboard-section-header">
          <h2><FontAwesomeIcon icon={faCalendarCheck} /> Active Bookings</h2>
          <span className="userdashboard-section-badge">0</span>
        </div>
        <div className="loading-spinner">
          <FontAwesomeIcon icon={faSpinner} spin /> Loading bookings...
        </div>
      </div>
    );
  }

  return (
    <div className="userdashboard-section bookings-section">
      <div className="userdashboard-section-header">
        <h2><FontAwesomeIcon icon={faCalendarCheck} /> Active Bookings</h2>
        <div className="userdashboard-header-right">
          {isWebSocketConnected && (
            <span className="websocket-status connected" title="Live updates enabled">
              <span className="status-dot"></span> Live
            </span>
          )}
          <span className="userdashboard-section-badge">{bookings.length}</span>
        </div>
      </div>
      
      {/* Success/Error Messages */}
      {cancelSuccess && (
        <div className="success-message" style={{
          backgroundColor: '#d4edda',
          color: '#155724',
          padding: '10px 15px',
          borderRadius: '4px',
          marginBottom: '15px',
          border: '1px solid #c3e6cb'
        }}>
          <FontAwesomeIcon icon={faCheckCircle} /> {cancelSuccess}
        </div>
      )}
      
      {cancelError && (
        <div className="error-message" style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '10px 15px',
          borderRadius: '4px',
          marginBottom: '15px',
          border: '1px solid #f5c6cb'
        }}>
          <FontAwesomeIcon icon={faExclamationTriangle} /> {cancelError}
        </div>
      )}
      
      <div className="userdashboard-bookings">
        {error ? (
          // Show error only for real errors (not 404)
          <div className="error-message">
            <p>{error}</p>
            <button onClick={handleRetry} className="userdashboard-action-btn retry">
              Retry
            </button>
          </div>
        ) : bookings.length === 0 ? (
          // Empty state - no active bookings
          <div className="userdashboard-empty" style={{
            textAlign: 'center',
            padding: '40px 20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '2px dashed #dee2e6'
          }}>
            <div style={{
              fontSize: '48px',
              color: '#adb5bd',
              marginBottom: '20px'
            }}>
              <FontAwesomeIcon icon={faCalendarCheck} />
            </div>
            <h3 style={{
              color: '#495057',
              marginBottom: '10px',
              fontSize: '18px',
              fontWeight: '600'
            }}>
              You have no active bookings
            </h3>
            <p style={{
              color: '#6c757d',
              marginBottom: '25px',
              fontSize: '14px'
            }}>
              Ready to schedule your vehicle service? Book your first appointment now!
            </p>
            <button 
              onClick={onBookService}
              className="userdashboard-action-btn book-service"
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
            >
              <FontAwesomeIcon icon={faCalendarPlus} />
              Book Appointment
            </button>
          </div>
        ) : (
          // Show active bookings
          bookings.map(booking => (
            <div key={booking.id} className="userdashboard-booking-card">
              <div className="userdashboard-booking-header">
                <div>
                  <h4>{booking.serviceType}</h4>
                  <p className="userdashboard-booking-vehicle">{booking.vehicle}</p>
                  <small className="appointment-id" style={{ color: '#666', fontSize: '12px' }}>
                    Appointment ID: {booking.id}
                  </small>
                </div>
                <div 
                  className="userdashboard-booking-status" 
                  style={{ color: getStatusColor(booking.status) }}
                >
                  {getStatusIcon(booking.status)} 
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace('-', ' ')}
                </div>
              </div>
              <div className="userdashboard-booking-details">
                <div className="userdashboard-booking-info">
                  <div>
                    <FontAwesomeIcon icon={faCalendarCheck} />
                    <span>{formatDate(booking.date)}</span>
                  </div>
                  <div>
                    <FontAwesomeIcon icon={faClock} />
                    <span>{booking.time}</span>
                  </div>
                  <div>
                    <FontAwesomeIcon icon={faFileInvoiceDollar} />
                    <span className="booking-amount">Rs. {booking.estimatedCost.toFixed(2)}</span>
                  </div>
                </div>
                <div className="userdashboard-booking-actions">
                  <button
                    className="userdashboard-action-btn track"
                    onClick={() => onTrackService(booking.id)}
                    disabled={cancellingId === booking.id || booking.status === 'cancelled'}
                  >
                    <FontAwesomeIcon icon={faMapMarkerAlt} /> Track
                  </button>
                  <button
                    className="userdashboard-action-btn details"
                    onClick={() => onViewDetails(booking.id)}
                    disabled={cancellingId === booking.id}
                  >
                    Details
                  </button>
                  {booking.status === 'payment' ? (
                    <button
                      className="userdashboard-action-btn pay"
                      style={{
                        backgroundColor: '#F57C00',
                        color: 'white'
                      }}
                      onClick={() => handlePayNowClick(booking)}
                      disabled={cancellingId === booking.id}
                    >
                      <FontAwesomeIcon icon={faCreditCard} /> Pay Now
                    </button>
                  ) : (
                    <button
                      className="userdashboard-action-btn reschedule"
                      onClick={() => onReschedule(booking.id)}
                      disabled={cancellingId === booking.id ||
                               booking.status === 'cancelled' ||
                               booking.status === 'in-progress' ||
                               booking.status === 'completed'}
                    >
                      Reschedule
                    </button>
                  )}
                  <button
                    className="userdashboard-action-btn cancel"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to cancel this appointment?')) {
                        handleCancel(booking.id);
                      }
                    }}
                    disabled={cancellingId === booking.id ||
                             booking.status === 'cancelled' ||
                             booking.status === 'completed' ||
                             booking.status === 'in-progress' ||
                             booking.status === 'payment'}
                  >
                    {cancellingId === booking.id ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin /> Cancelling...
                      </>
                    ) : (
                      'Cancel'
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* PayNow Overlay */}
      <PayNow
        isOpen={isPayNowOpen}
        onClose={() => {
          setIsPayNowOpen(false);
          setSelectedBookingForPayment(null);
        }}
        paymentType="appointment"
        itemId={selectedBookingForPayment?.id}
        amount={selectedBookingForPayment?.estimatedCost}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default ActiveBookings;