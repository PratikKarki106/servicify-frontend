import HomeNav from '../components/HomeNav';
import './viewAppointment.css'
import { FaChevronRight } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { getAllAppointments, updateBillItems, getAppointmentById, updateAppointmentStatus } from '../services/bookAppointment';
import type { Appointment } from '../types/appointment';
import Sidebar from '../components/Sidebar';
import AppointmentDetails from './AppointmentDetails';
import BillSection from './BillSection';

// Define BillItem interface
interface BillItem {
  id: string;
  itemName: string;
  itemPrice: number;
  serviceCharge?: number;
}

const AdminAppointment = () => {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('All');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string>('');

  // Bill state for selected appointment
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [isSavingBill, setIsSavingBill] = useState<boolean>(false);
  const [billSaveError, setBillSaveError] = useState<string | null>(null);

  // Fetch appointments from API - All statuses
  const fetchAppointments = async (status?: string | null, date?: string | null) => {
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

      // Add date filter if provided
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
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleDetailsClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    // Load existing bill items from appointment if any
    const existingBillItems: BillItem[] = (appointment.billItems || []).map((item: any, index: number) => ({
      id: item._id || `item-${index}`,
      itemName: item.itemName,
      itemPrice: item.itemPrice,
      serviceCharge: item.serviceCharge || 0
    }));
    setBillItems(existingBillItems);
    setBillSaveError(null);
  };

  const handleCloseDetails = () => {
    setSelectedAppointment(null);
    setBillItems([]);
    setBillSaveError(null);
  };

  // Handle filter button clicks
  const handleFilterClick = (filterType: string) => {
    setFilter(filterType);
    fetchAppointments(filterType === 'All' ? null : filterType, dateFilter || null);
  };

  // Handle date filter change
  const handleDateFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setDateFilter(date);
    fetchAppointments(filter === 'All' ? null : filter, date);
  };

  // Clear date filter
  const clearDateFilter = () => {
    setDateFilter('');
    fetchAppointments(filter === 'All' ? null : filter, null);
  };

  // Bill management functions
  const handleAddBillItem = (item: Omit<BillItem, 'id'>) => {
    const billItem: BillItem = {
      id: Date.now().toString(),
      itemName: item.itemName,
      itemPrice: item.itemPrice,
      serviceCharge: item.serviceCharge || 0
    };

    const newBillItems = [...billItems, billItem];
    setBillItems(newBillItems);
    
    // Save to backend
    saveBillItemsToBackend(newBillItems);
  };

  const handleRemoveBillItem = (id: string) => {
    const newBillItems = billItems.filter(item => item.id !== id);
    setBillItems(newBillItems);
    
    // Save to backend
    saveBillItemsToBackend(newBillItems);
  };

  // Save bill items to backend
  const saveBillItemsToBackend = async (items: BillItem[]) => {
    if (!selectedAppointment) return;
    
    try {
      setIsSavingBill(true);
      setBillSaveError(null);
      
      // Convert BillItem format to backend format (without id)
      const billItemsForBackend = items.map(item => ({
        itemName: item.itemName,
        itemPrice: item.itemPrice,
        serviceCharge: item.serviceCharge || 0
      }));
      
      console.log('Saving bill items for appointment:', selectedAppointment.appointmentId);
      console.log('Bill items:', billItemsForBackend);
      
      const response = await updateBillItems(selectedAppointment.appointmentId, billItemsForBackend);
      console.log('Save response:', response);
      
      if (response.success) {
        // Update the selected appointment with the new bill items
        setSelectedAppointment(prev => prev ? {
          ...prev,
          billItems: billItemsForBackend
        } : null);
        console.log('Bill items saved successfully!');
        
        // Refresh the appointment from backend to get the latest data
        await refreshSelectedAppointment();
      } else {
        throw new Error(response.message || 'Failed to save bill items');
      }
    } catch (error: any) {
      console.error('Error saving bill items:', error);
      setBillSaveError(error.message || 'Failed to save bill items');
      alert('Failed to save bill: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSavingBill(false);
    }
  };

  // Refresh the selected appointment from backend
  const refreshSelectedAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      const response = await getAppointmentById(selectedAppointment.appointmentId);

      if (response.success && response.appointment) {
        setSelectedAppointment(response.appointment);
        // Update bill items from the refreshed appointment
        const refreshedBillItems: BillItem[] = (response.appointment.billItems || []).map((item: any, index: number) => ({
          id: item._id || `item-${index}`,
          itemName: item.itemName,
          itemPrice: item.itemPrice,
          serviceCharge: item.serviceCharge || 0
        }));
        setBillItems(refreshedBillItems);
        console.log('Appointment refreshed with bill items:', refreshedBillItems);
      }
    } catch (error) {
      console.error('Error refreshing appointment:', error);
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

  // Get status label for table display (long form)
  const getStatusLabel = (status: string) => {
    if (!status) return 'N/A';
    
    const statusMap: Record<string, string> = {
      'booked': 'Booked',
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'in-progress': 'In Progress',
      'payment': 'Payment',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    };
    
    return statusMap[status.toLowerCase()] || status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Handle status change from dropdown
  const handleStatusChange = async (appointmentId: number, newStatus: string) => {
    try {
      setUpdatingStatus(appointmentId.toString());
      
      const response = await updateAppointmentStatus(appointmentId, newStatus);
      
      if (response.success) {
        // Update the appointments list with the new status
        setAppointments(prev =>
          prev.map(appt =>
            appt.appointmentId === appointmentId
              ? { ...appt, status: newStatus }
              : appt
          )
        );
        
        // Update selected appointment if it's the current one
        if (selectedAppointment && selectedAppointment.appointmentId === appointmentId) {
          setSelectedAppointment({
            ...selectedAppointment,
            status: newStatus
          });
        }
        
        alert(`Appointment #${appointmentId} status updated to ${newStatus}`);
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      alert('Failed to update status: ' + (error.message || 'Unknown error'));
    } finally {
      setUpdatingStatus(null);
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
          <div className='filter-right-group'>
            <div className='date-filter-wrapper'>
              <input
                type="date"
                className='date-filter-input'
                value={dateFilter}
                onChange={handleDateFilterChange}
              />
              {dateFilter && (
                <button className='clear-date-btn' onClick={clearDateFilter} title="Clear date filter">
                  ×
                </button>
              )}
            </div>
            <button className='new-appointment-button'>+ New Appointment</button>
          </div>
        </div>
        
        <div className='content-wrapper'>
          {/* Left Side - Table */}
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
                    className={`appointment-row ${selectedAppointment?.appointmentId === appointment.appointmentId ? 'selected' : ''}`}
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
                        <select
                          className='status-dropdown'
                          value={appointment.status || 'confirmed'}
                          onChange={(e) => handleStatusChange(appointment.appointmentId, e.target.value)}
                          disabled={updatingStatus === appointment.appointmentId.toString()}
                        >
                          <option value="booked">Booked</option>
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="in-progress">In Progress</option>
                          <option value="payment">Payment</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
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

          {/* Right Side - Details Panel with Bill Section */}
          {selectedAppointment && (
            <AppointmentDetails
              appointment={selectedAppointment}
              onClose={handleCloseDetails}
              showDownloadButton={true}
              billItems={billItems}
              billSection={
                <BillSection
                  billItems={billItems}
                  onAddBillItem={handleAddBillItem}
                  onRemoveBillItem={handleRemoveBillItem}
                  isSaving={isSavingBill}
                  saveError={billSaveError}
                />
              }
            />
          )}
        </div>
      </div>
    </>
  )
}

export default AdminAppointment;