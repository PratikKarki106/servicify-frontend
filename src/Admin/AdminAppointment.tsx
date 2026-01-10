import HomeNav from '../components/HomeNav';
import './viewAppointment.css'
import { FaChevronRight, FaCar, FaCalendarAlt, FaClock, FaStickyNote, FaMapMarkerAlt, FaEllipsisH } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { getAllAppointments, updateAppointmentStatus } from '../services/bookAppointment';
import type { Appointment } from '../types/appointment';
import Sidebar from '../components/Sidebar';

// Define status options
const STATUS_OPTIONS = [
  { value: 'confirmed', label: 'Confirmed', short: 'Conf' },
  { value: 'in-progress', label: 'In Progress', short: 'In Prog' },
  { value: 'completed', label: 'Completed', short: 'Comp' },
  { value: 'cancelled', label: 'Cancelled', short: 'Cancel' }
];


const AdminAppointment = () => {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('All');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState<string | null>(null);

  // Fetch appointments from API - All statuses
  const fetchAppointments = async (status?: string | null) => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };
      
      // Add status filter if provided
      if (status && status !== 'All') {
        params.status = status.toLowerCase();
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

  // Handle status change
  const handleStatusChange = async (appointmentId: string, newStatus: string, fromTable: boolean = false) => {
    try {
      setIsUpdating(true);
      
      // Call API to update appointment status
      const response = await updateAppointmentStatus(appointmentId, newStatus);
      
      if (response.success) {
        // Update local state
        const updatedAppointments = appointments.map(app => 
          app._id === appointmentId ? { ...app, status: newStatus } : app
        );
        setAppointments(updatedAppointments);
        
        // Update selected appointment if it's the one being changed
        if (selectedAppointment && selectedAppointment._id === appointmentId) {
          setSelectedAppointment({ ...selectedAppointment, status: newStatus });
        }
        
        // Show success message
        if (!fromTable) {
          alert(`Status updated to ${STATUS_OPTIONS.find(s => s.value === newStatus)?.label || newStatus}!`);
        }
        
        // Close dropdown if changing from table
        if (fromTable) {
          setShowStatusDropdown(null);
        }
      } else {
        alert('Failed to update status. Please try again.');
      }
    } catch (err: any) {
      console.error('Error updating status:', err);
      alert(err.message || 'Error updating status');
    } finally {
      setIsUpdating(false);
    }
  };

  // Toggle status dropdown in table
  const toggleStatusDropdown = (appointmentId: string) => {
    setShowStatusDropdown(showStatusDropdown === appointmentId ? null : appointmentId);
  };

  // Close dropdown when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest('.status-cell')) {
        setShowStatusDropdown(null);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Initial fetch on component mount
  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleDetailsClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowStatusDropdown(null); // Close any open dropdowns
  };

  const handleCloseDetails = () => {
    setSelectedAppointment(null);
  };

  // Handle filter button clicks
  const handleFilterClick = (filterType: string) => {
    setFilter(filterType);
    fetchAppointments(filterType === 'All' ? null : filterType);
  };

  // Get short form of status for table view
  const getStatusShortForm = (status: string) => {
    const statusOption = STATUS_OPTIONS.find(s => s.value === status);
    return statusOption?.short || status.substring(0, 4);
  };

  // Get full form of status for details view
  // const getStatusFullForm = (status: string) => {
  //   const statusOption = STATUS_OPTIONS.find(s => s.value === status);
  //   return statusOption?.label || status.charAt(0).toUpperCase() + status.slice(1);
  // };

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
      <Sidebar />
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
              <div className='header-cell service-header'>SERVICE</div>
              <div className='header-cell status-header'>STATUS</div>
              <div className='header-cell time-header'>TIME</div>
              <div className='header-cell action-header'>ACTION</div>
            </div>
            
            <div className='appointments-list'>
              {appointments.length === 0 ? (
                <div className="no-appointments">
                  <p>No appointments found</p>
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
                        {appointment.serviceType?.substring(0, 3) || 'N/A'}
                      </span>
                    </div>
                    <div className='cell status-cell'>
                      <div className='status-container'>
                        <div 
                          className={`status-badge-table status-${appointment.status || 'confirmed'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStatusDropdown(appointment._id);
                          }}
                        >
                          {getStatusShortForm(appointment.status || 'confirmed')}
                          <FaEllipsisH className='status-dropdown-icon' />
                        </div>
                        
                        {showStatusDropdown === appointment._id && (
                          <div className='status-dropdown'>
                            {STATUS_OPTIONS.map((statusOption) => (
                              <div
                                key={statusOption.value}
                                className={`status-dropdown-item ${appointment.status === statusOption.value ? 'current' : ''}`}
                                onClick={() => handleStatusChange(appointment._id, statusOption.value, true)}
                              >
                                <span className={`status-indicator status-${statusOption.value}`}></span>
                                <span className='status-label'>{statusOption.label}</span>
                                {appointment.status === statusOption.value && (
                                  <span className='current-badge'>Current</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
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
                      <span className='info-label'>Status:</span>
                      <div className='status-select-container'>
                        <select 
                          className='status-select'
                          value={selectedAppointment.status || 'confirmed'}
                          onChange={(e) => handleStatusChange(selectedAppointment._id, e.target.value)}
                          disabled={isUpdating}
                        >
                          {STATUS_OPTIONS.map((statusOption) => (
                            <option key={statusOption.value} value={statusOption.value}>
                              {statusOption.label}
                            </option>
                          ))}
                        </select>
                        {isUpdating && (
                          <div className="spinner-small"></div>
                        )}
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
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default AdminAppointment;