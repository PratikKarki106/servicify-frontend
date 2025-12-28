import HomeNav from '../components/HomeNav';
import './viewAppointment.css'
import { FaChevronRight, FaCar, FaCalendarAlt, FaClock, FaStickyNote, FaCheckCircle, FaTimesCircle, FaMapMarkerAlt } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { getAllAppointments, updateAppointmentStatus } from '../services/bookAppointment'; // Add updateAppointmentStatus
import type { Appointment, ApiResponse } from '../types/appointment';

// Define TypeScript interfaces
interface VehicleInfo {
  model: string;
  color: string;
  numberPlate: string;
  kilometerRun: number;
  notes?: string;
  imageUrl?: string;
}

const ViewAppointment = () => {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('All');
  const [isUpdating, setIsUpdating] = useState<boolean>(false); // For confirmation loading state

  // Fetch appointments from API - Only "booked" status
  const fetchAppointments = async (serviceType: string | null = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        sortBy: 'createdAt',
        sortOrder: 'desc',
        status: 'booked' // Only fetch appointments with "booked" status
      };
      
      if (serviceType && serviceType !== 'All') {
        params.serviceType = serviceType.toLowerCase();
      }
      
      const response = await getAllAppointments(params);
      
      if (response.success) {
        setAppointments(response.appointments || []);
      } else {
        setError('Failed to fetch appointments');
      }
    } catch (err: any) {
      console.error('Error fetching appointments:', err);
      setError(err.message || 'Error loading appointments');
    } finally {
      setLoading(false);
    }
  };

  // Handle confirming an appointment
  const handleConfirmAppointment = async () => {
    if (!selectedAppointment) return;
    
    try {
      setIsUpdating(true);
      
      // Call API to update appointment status
      const response = await updateAppointmentStatus(selectedAppointment._id, 'confirmed');
      
      if (response.success) {
        // Update local state
        const updatedAppointment = { ...selectedAppointment, status: 'confirmed' };
        setSelectedAppointment(updatedAppointment);
        
        // Remove from appointments list (since it's no longer "booked")
        setAppointments(prev => prev.filter(app => app._id !== selectedAppointment._id));
        
        // Show success message (you could add toast notification here)
        alert('Appointment confirmed successfully!');
      } else {
        alert('Failed to confirm appointment. Please try again.');
      }
    } catch (err: any) {
      console.error('Error confirming appointment:', err);
      alert(err.message || 'Error confirming appointment');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle canceling an appointment
  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;
    
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }
    
    try {
      setIsUpdating(true);
      
      // Call API to update appointment status
      const response = await updateAppointmentStatus(selectedAppointment._id, 'cancelled');
      
      if (response.success) {
        const updatedAppointment = { ...selectedAppointment, status: 'cancelled' };
        setSelectedAppointment(updatedAppointment);
        
        // Remove from appointments list (since it's no longer "booked")
        setAppointments(prev => prev.filter(app => app._id !== selectedAppointment._id));
        
        // Show success message
        alert('Appointment cancelled successfully!');
      } else {
        alert('Failed to cancel appointment. Please try again.');
      }
    } catch (err: any) {
      console.error('Error cancelling appointment:', err);
      alert(err.message || 'Error cancelling appointment');
    } finally {
      setIsUpdating(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleDetailsClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleCloseDetails = () => {
    setSelectedAppointment(null);
  };

  // Handle filter button clicks
  const handleFilterClick = (filterType: string) => {
    setFilter(filterType);
    fetchAppointments(filterType === 'All' ? null : filterType);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  // Format time for display (extract from date field if available)
  const formatTimeFromDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'N/A';
    }
  };

  // Get display date (today, tomorrow, or formatted date)
  const getDisplayDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    try {
      const appointmentDate = new Date(dateString);
      if (isNaN(appointmentDate.getTime())) return 'Invalid Date';
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      appointmentDate.setHours(0, 0, 0, 0);
      
      if (appointmentDate.getTime() === today.getTime()) {
        return 'Today';
      } else if (appointmentDate.getTime() === tomorrow.getTime()) {
        return 'Tomorrow';
      } else {
        return appointmentDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      }
    } catch (error) {
      console.error('Error getting display date:', error);
      return 'Invalid Date';
    }
  };

  // Render loading state
  if (loading) {
    return (
      <>
        <HomeNav />
        <div className="main-container-viewappointment">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading appointments...</p>
          </div>
        </div>
      </>
    );
  }

  // Render error state
  if (error) {
    return (
      <>
        <HomeNav />
        <div className="main-container-viewappointment">
          <div className="error-container">
            <h3>Error Loading Appointments</h3>
            <p>{error}</p>
            <button 
              onClick={() => fetchAppointments()} 
              className="retry-button"
            >
              Retry
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <HomeNav />
      <div className={`main-container-viewappointment ${selectedAppointment ? 'details-open' : ''}`}>
        <div className='filter-buttons-appointment'>
          <div className='filter-left-group'>
            <button 
              className={`filter-button-appointment ${filter === 'All' ? 'active' : ''}`}
              onClick={() => handleFilterClick('All')}
            >
              All
            </button>
            <button 
              className={`filter-button-appointment ${filter === 'Servicing' ? 'active' : ''}`}
              onClick={() => handleFilterClick('Servicing')}
            >
              Servicing
            </button>
            <button 
              className={`filter-button-appointment ${filter === 'Repair' ? 'active' : ''}`}
              onClick={() => handleFilterClick('Repair')}
            >
              Repair
            </button>
            <button 
              className={`filter-button-appointment ${filter === 'Check up' ? 'active' : ''}`}
              onClick={() => handleFilterClick('Check up')}
            >
              Check up
            </button>
            <button 
              className={`filter-button-appointment ${filter === 'Wash' ? 'active' : ''}`}
              onClick={() => handleFilterClick('Wash')}
            >
              Wash
            </button>
          </div>
          <button className='new-appointment-button'>+ New Appointment</button>
        </div>
        
        <div className='content-wrapper'>
          {/* Left Side - Table (30-35% width when details open) */}
          <div className='appointment-list-container'>
            <div className='appointments-header'>
              <div className='header-cell name-header'>NAME</div>
              <div className='header-cell service-header'>SERVICE TYPE</div>
              <div className='header-cell time-header'>TIME</div>
              <div className='header-cell action-header'>ACTION</div>
            </div>
            
            <div className='appointments-list'>
              {appointments.length === 0 ? (
                <div className="no-appointments">
                  <p>No booked appointments found</p>
                </div>
              ) : (
                appointments.map((appointment: Appointment) => (
                  <div 
                    key={appointment._id} 
                    className={`appointment-row ${selectedAppointment?._id === appointment._id ? 'selected' : ''}`}
                  >
                    <div className='cell name-cell'>
                      <div className='customer-name'>
                        {appointment.name || `User #${appointment.userId}`}
                      </div>
                      <div className='customer-email'>
                        {appointment.email || 'Email not available'}
                      </div>
                    </div>
                    <div className='cell service-cell'>
                      <span className={`service-badge service-${appointment.serviceType ? appointment.serviceType.toLowerCase() : 'default'}`}>
                        {appointment.serviceType || 'Unknown'}
                      </span>
                    </div>
                    <div className='cell time-cell'>
                      <div className='appointment-time'>
                        {appointment.time || formatTimeFromDate(appointment.date)}
                      </div>
                      <div className='appointment-date'>
                        {getDisplayDate(appointment.date)}
                      </div>
                    </div>
                    <div className='cell action-cell'>
                      <button 
                        className='details-button'
                        onClick={() => handleDetailsClick(appointment)}
                      >
                        Details <FaChevronRight className='details-icon' />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Side - Details Panel (65-70% width when open) */}
          {selectedAppointment && (
            <div className='appointment-details-panel'>
              <div className='details-header'>
                <h2>Appointment Details</h2>
                <button className='close-details-btn' onClick={handleCloseDetails}>
                  ×
                </button>
              </div>
              
              <div className='details-content'>
                {/* Customer Information */}
                <div className='details-section'>
                  <h3 className='section-title'>Customer Information</h3>
                  <div className='info-grid'>
                    <div className='info-item'>
                      <span className='info-label'>Name:</span>
                      <span className='info-value1'>
                        {selectedAppointment.name || `User #${selectedAppointment.userId}`}
                      </span>
                    </div>
                    <div className='info-item'>
                      <span className='info-label'>Email:</span>
                      <span className='info-value2'>
                        {selectedAppointment.email || 'Not available'}
                      </span>
                    </div>
                    <div className='info-item'>
                      <span className='info-label'>User ID:</span>
                      <span className='info-value1'>{selectedAppointment.userId}</span>
                    </div>
                  </div>
                </div>

                {/* Appointment Details */}
                <div className='details-section'>
                  <h3 className='section-title'>Appointment Details</h3>
                  <div className='info-grid'>
                    <div className='info-item'>
                      <FaCalendarAlt className='info-icon' />
                      <span className='info-label'>Date:</span>
                      <span className='info-value1'>{formatDate(selectedAppointment.date)}</span>
                    </div>
                    <div className='info-item'>
                      <FaClock className='info-icon' />
                      <span className='info-label'>Time:</span>
                      <span className='info-value1'>
                        {selectedAppointment.time || formatTimeFromDate(selectedAppointment.date)}
                      </span>
                    </div>
                    <div className='info-item'>
                      <div className={`status-badge status-${selectedAppointment.status || 'booked'}`}>
                        {(selectedAppointment.status || 'booked').charAt(0).toUpperCase() + (selectedAppointment.status || 'booked').slice(1)}
                      </div>
                    </div>
                    <div className='info-item'>
                      {selectedAppointment.pickupRequired ? (
                        <>
                          <FaMapMarkerAlt className='info-icon' />
                          <span className='info-label'>Pickup:</span>
                          <span className='info-value1 required'>Required</span>
                          {selectedAppointment.pickupAddress && (
                            <span className='info-address'>{selectedAppointment.pickupAddress}</span>
                          )}
                        </>
                      ) : (
                        <>
                          <FaMapMarkerAlt className='info-icon' />
                          <span className='info-label'>Pickup:</span>
                          <span className='info-value not-required'>Not Required</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Vehicle Information */}
                <div className='details-section'>
                  <h3 className='section-title'>Vehicle Information</h3>
                  <div className='info-grid'>
                    <div className='info-item'>
                      <FaCar className='info-icon' />
                      <span className='info-label'>Model:</span>
                      <span className='info-value1'>
                        {selectedAppointment.vehicleInfo?.model || 'Not specified'}
                      </span>
                    </div>
                    <div className='info-item'>
                      <span className='info-label'>Color:</span>
                      <span className='info-value1'>
                        {selectedAppointment.vehicleInfo?.color || 'Not specified'}
                      </span>
                    </div>
                    <div className='info-item'>
                      <span className='info-label'>Number Plate:</span>
                      <span className='info-value'>
                        {selectedAppointment.vehicleInfo?.numberPlate || 'Not specified'}
                      </span>
                    </div>
                    <div className='info-item'>
                      <span className='info-label'>Kilometer Run:</span>
                      <span className='info-value'>
                        {selectedAppointment.vehicleInfo?.kilometerRun 
                          ? `${selectedAppointment.vehicleInfo.kilometerRun.toLocaleString()} km`
                          : 'Not specified'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Service Details */}
                <div className='details-section'>
                  <h3 className='section-title'>Service Details</h3>
                  <div className='info-grid'>
                    <div className='info-item'>
                      <span className='info-label'>Service Type:</span>
                      <span className={`service-type-badge service-${selectedAppointment.serviceType ? selectedAppointment.serviceType.toLowerCase() : 'default'}`}>
                        {selectedAppointment.serviceType || 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedAppointment.vehicleInfo?.notes && (
                  <div className='details-section'>
                    <h3 className='section-title'>Notes</h3>
                    <div className='notes-container'>
                      <FaStickyNote className='notes-icon' />
                      <p className='notes-text'>{selectedAppointment.vehicleInfo.notes}</p>
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div className='details-section'>
                  <h3 className='section-title'>Timeline</h3>
                  <div className='timeline'>
                    <div className='timeline-item'>
                      <div className='timeline-dot created'></div>
                      <div className='timeline-content'>
                        <span className='timeline-event'>Appointment Created</span>
                        <span className='timeline-date'>
                          {selectedAppointment.createdAt 
                            ? new Date(selectedAppointment.createdAt).toLocaleString()
                            : 'Not available'
                          }
                        </span>
                      </div>
                    </div>
                    <div className='timeline-item'>
                      <div className='timeline-dot updated'></div>
                      <div className='timeline-content'>
                        <span className='timeline-event'>Last Updated</span>
                        <span className='timeline-date'>
                          {selectedAppointment.updatedAt 
                            ? new Date(selectedAppointment.updatedAt).toLocaleString()
                            : 'Not available'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className='action-buttons'>
                  <button 
                    className={`action-btn confirm-btn ${isUpdating ? 'loading' : ''}`}
                    onClick={handleConfirmAppointment}
                    disabled={isUpdating || selectedAppointment.status !== 'booked'}
                  >
                    {isUpdating ? (
                      <>
                        <div className="spinner-small"></div>
                        Confirming...
                      </>
                    ) : (
                      <>
                        <FaCheckCircle /> Confirm Appointment
                      </>
                    )}
                  </button>
                  <button 
                    className={`action-btn cancel-btn ${isUpdating ? 'loading' : ''}`}
                    onClick={handleCancelAppointment}
                    disabled={isUpdating || selectedAppointment.status !== 'booked'}
                  >
                    <FaTimesCircle /> Cancel Appointment
                  </button>
                  <button 
                    className='action-btn edit-btn'
                    disabled={isUpdating}
                  >
                    Edit Details
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default ViewAppointment;