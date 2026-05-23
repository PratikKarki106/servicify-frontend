import HomeNav from '../components/HomeNav';
import './viewAppointment.css'
import { FaChevronRight, FaCalendarAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useState, useEffect, useRef } from 'react';
import { getAllAppointments, updateAppointmentStatus } from '../services/bookAppointment';
import type { Appointment } from '../types/appointment';
import Sidebar from '../components/Sidebar';
import AppointmentDetails from './AppointmentDetails';
import { appAlert, appConfirm } from '../services/dialogService';
import { websocketService } from '../services/websocketService';

const ViewAppointment = () => {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);       // true only on initial mount
  const [isSyncing, setIsSyncing] = useState<boolean>(false);  // subtle indicator for background refreshes
  const [error, setError] = useState<string | null>(null);
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const isInitialLoad = useRef(true);
  const currentFilters = useRef({ serviceType: 'All', date: '' });

  // Fetch appointments — shows full spinner only on initial load, subtle sync indicator on refresh
  const fetchAppointments = async (serviceType: string | null = null, date: string | null = null, silent = false) => {
    try {
      if (isInitialLoad.current) {
        setLoading(true);
      } else if (!silent) {
        setIsSyncing(true);
      }
      setError(null);

      // Keep ref in sync so WebSocket callbacks can re-use current filters
      currentFilters.current = {
        serviceType: serviceType ?? 'All',
        date: date ?? ''
      };

      const params: any = {
        sortBy: 'createdAt',
        sortOrder: 'desc',
        status: 'booked'
      };

      if (serviceType && serviceType !== 'All') {
        params.serviceType = serviceType.toLowerCase();
      }

      if (date) {
        params.date = date;
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
      setIsSyncing(false);
      isInitialLoad.current = false;
    }
  };

  // Handle confirming an appointment
  const handleConfirmAppointment = async () => {
    if (!selectedAppointment) return;
    
    try {
      setIsUpdating(true);
      
      const response = await updateAppointmentStatus(selectedAppointment.appointmentId, 'confirmed');
      
      if (response.success) {
        // Remove from list since it's no longer in "booked" status
        setAppointments(prev => prev.filter(app => app.appointmentId !== selectedAppointment.appointmentId));
        setSelectedAppointment(null);
        await appAlert({ title: 'Success', message: 'Appointment confirmed successfully!', variant: 'success' });
      } else {
        await appAlert({ title: 'Action failed', message: 'Failed to confirm appointment. Please try again.', variant: 'danger' });
      }
    } catch (err: any) {
      console.error('Error confirming appointment:', err);
      
      if (err.message?.includes('cancelled') || err.code === 'APPOINTMENT_CANCELLED') {
        await appAlert({ title: 'Cannot confirm', message: 'This appointment was cancelled and cannot be confirmed. Please refresh the page.', variant: 'warning' });
        fetchAppointments();
      } else {
        await appAlert({ title: 'Error', message: err.message || 'Error confirming appointment', variant: 'danger' });
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle cancelling an appointment
  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;
    
    const shouldCancel = await appConfirm({
      title: 'Cancel appointment',
      message: 'Are you sure you want to cancel this appointment?',
      confirmText: 'Yes, cancel',
      variant: 'warning',
    });
    if (!shouldCancel) {
      return;
    }
    
    try {
      setIsUpdating(true);
      
      const response = await updateAppointmentStatus(selectedAppointment.appointmentId, 'cancelled');
      
      if (response.success) {
        // Remove from list since it's no longer in "booked" status
        setAppointments(prev => prev.filter(app => app.appointmentId !== selectedAppointment.appointmentId));
        setSelectedAppointment(null);
        await appAlert({ title: 'Success', message: 'Appointment cancelled successfully!', variant: 'success' });
      } else {
        await appAlert({ title: 'Action failed', message: 'Failed to cancel appointment. Please try again.', variant: 'danger' });
      }
    } catch (err: any) {
      console.error('Error cancelling appointment:', err);
      await appAlert({ title: 'Error', message: err.message || 'Error cancelling appointment', variant: 'danger' });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle filter changes
  const handleServiceTypeFilterChange = (serviceType: string) => {
    setServiceTypeFilter(serviceType);
    fetchAppointments(serviceType, dateFilter);
  };

  const handleDateFilterChange = (date: string) => {
    // Fix timezone issue by working directly with the date string
    const dateString = date.split('T')[0]; // Extract YYYY-MM-DD part
    
    setDateFilter(dateString);
    fetchAppointments(serviceTypeFilter, dateString);
    setShowCalendar(false);
  };

  const clearDateFilter = () => {
    setDateFilter('');
    fetchAppointments(serviceTypeFilter, null);
  };

  // Calendar component
  const Calendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    
    // Disable past dates
    const isPastDate = (year: number, month: number, day: number) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const checkDate = new Date(year, month, day);
      return checkDate < today;
    };

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    
    const prevMonth = () => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };
    
    const nextMonth = () => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };
    
    const selectDate = (day: number) => {
      // Create date string directly without Date object conversion
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const dateString = `${year}-${month}-${dayStr}`;
      
      handleDateFilterChange(dateString);
    };
    
    return (
      <div className="calendar-popup">
        <div className="calendar-header">
          <button onClick={prevMonth}>&lt;</button>
          <span>{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          <button onClick={nextMonth}>&gt;</button>
        </div>
        <div className="calendar-grid">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="calendar-day-header">{day}</div>
          ))}
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div key={`empty-${index}`} className="calendar-day empty"></div>
          ))}
          {Array.from({ length: daysInMonth }, (_, index) => {
            const day = index + 1;
            const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
            const isPast = isPastDate(currentDate.getFullYear(), currentDate.getMonth(), day);
            
            return (
              <div 
                key={day} 
                className={`calendar-day ${isToday ? 'today' : ''} ${isPast ? 'past' : ''}`}
                onClick={() => !isPast && selectDate(day)}
                style={{ cursor: isPast ? 'not-allowed' : 'pointer', opacity: isPast ? 0.5 : 1 }}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Initial fetch + WebSocket real-time subscription
  useEffect(() => {
    fetchAppointments();

    const socket = websocketService.connectForAdmin();

    websocketService.subscribeToAppointmentUpdates(
      // Status updated — remove from "booked" list if it's no longer booked
      (data) => {
        setAppointments(prev => prev.filter(
          appt => appt.appointmentId !== Number(data.appointmentId)
        ));
        setSelectedAppointment(prev =>
          prev && prev.appointmentId === Number(data.appointmentId) ? null : prev
        );
      },
      // New appointment created — silently refresh to pick it up
      () => {
        const { serviceType, date } = currentFilters.current;
        fetchAppointments(serviceType === 'All' ? null : serviceType, date || null, true);
      },
      // Appointment cancelled — remove from list
      (data) => {
        setAppointments(prev => prev.filter(
          appt => appt.appointmentId !== Number(data.appointmentId)
        ));
        setSelectedAppointment(prev =>
          prev && prev.appointmentId === Number(data.appointmentId) ? null : prev
        );
      }
    );

    return () => {
      websocketService.unsubscribeFromUpdates();
    };
  }, []);

  const handleDetailsClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleCloseDetails = () => {
    setSelectedAppointment(null);
  };

  // Format time for display
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

  // Get display date
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
        <div className='filter-section'>
          {isSyncing && (
            <div className="sync-indicator">
              <span className="sync-dot"></span> Syncing...
            </div>
          )}
          <div className='filter-dropdown-container'>
            <label>Service Type</label>
            <select 
              className='filter-dropdown'
              value={serviceTypeFilter}
              onChange={(e) => handleServiceTypeFilterChange(e.target.value)}
            >
              <option value="All">All Services</option>
              <option value="Servicing">Servicing</option>
              <option value="Repair">Repair</option>
              <option value="Check up">Check up</option>
              <option value="Wash">Wash</option>
            </select>
          </div>
          
          <div className='filter-dropdown-container'>
            <label>Date</label>
            <div className='date-filter-container'>
              <input
                type="text"
                className='filter-dropdown date-input'
                value={dateFilter ? new Date(dateFilter).toLocaleDateString() : ''}
                placeholder="Select date"
                readOnly
                onClick={() => setShowCalendar(!showCalendar)}
              />
              <FaCalendarAlt className='calendar-icon' onClick={() => setShowCalendar(!showCalendar)} />
              {dateFilter && (
                <button className='clear-date-btn' onClick={clearDateFilter}>×</button>
              )}
              {showCalendar && <Calendar />}
            </div>
          </div>
        </div>
        
        <div className='content-wrapper'>
          {/* Left Side - Table */}
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

          {/* Right Side - Details Panel - Using the reusable component with action buttons */}
          {selectedAppointment && (
            <AppointmentDetails 
              appointment={selectedAppointment}
              onClose={handleCloseDetails}
              showDownloadButton={true}
              actionButtons={
                <>
                  <button 
                    className={`appointment-action-btn confirm-btn ${isUpdating ? 'loading' : ''}`}
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
                        <FaCheckCircle /> Confirm
                      </>
                    )}
                  </button>
                  <button 
                    className={`appointment-action-btn cancel-btn ${isUpdating ? 'loading' : ''}`}
                    onClick={handleCancelAppointment}
                    disabled={isUpdating || selectedAppointment.status !== 'booked'}
                  >
                    <FaTimesCircle /> Cancel
                  </button>
                </>
              }
            />
          )}
        </div>
      </div>
    </>
  )
}

export default ViewAppointment;