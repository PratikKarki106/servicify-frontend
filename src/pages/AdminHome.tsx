import React, { useState, useEffect } from 'react';
import type {JSX} from 'react';;
import './AdminHome.css';
import { 
  FaCalendarAlt, 
  FaTools, 
  FaCheckCircle,
  FaDownload,
  FaPlus,
  FaArrowUp,
  FaArrowDown,
  FaUserPlus,
  FaCar,
  FaClipboardList,
  FaClock,
  FaUser,
  FaCarSide,
  FaWrench,
  FaCheck,
  FaSpinner
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { getAllAppointments } from '../services/bookAppointment';
import type{ GetAllAppointmentsParams } from '../services/bookAppointment';

// Define TypeScript interfaces
interface VehicleInfo {
  model: string;
  color: string;
  numberPlate: string;
  kilometerRun: number;
  notes?: string;
  imageUrl?: string;
}

interface AppointmentData {
  _id?: string;
  userId: string;
  serviceType: "servicing" | "repair" | "checkup" | "wash";
  vehicleInfo: VehicleInfo;
  date: string;
  time: string;
  pickupRequired: boolean;
  pickupAddress?: string;
  email?: string;
  name?: string;
  contactNumber?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface StatusInfo {
  icon: JSX.Element;
  color: string;
  bgColor: string;
}

interface ApiResponse {
  success: boolean;
  data?: {
    appointments: AppointmentData[];
    total?: number;
    page?: number;
    limit?: number;
  };
  message?: string;
}

const AdminHome: React.FC = () => {
  const navigate = useNavigate();
  const [recentAppointments, setRecentAppointments] = useState<AppointmentData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get current date
  const currentDate = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'short' };
  const formattedDate = currentDate.toLocaleDateString('en-US', options);

  // Fetch recent appointments
  const fetchRecentAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: GetAllAppointmentsParams = {
        page: 1,
        limit: 3,
        sortBy: 'createdAt',
        sortOrder: 'desc'  // ← CHANGE THIS from 'asc' to 'desc'
      };
      
      console.log('Fetching with params:', params); // Add this
      
      const response = await getAllAppointments(params) as ApiResponse;
      
      console.log('API Response:', response); // Add this
      
      if (response.success && response.data) {
        console.log('Appointments found:', response.data.appointments); // Add this
        setRecentAppointments(response.data.appointments || []);
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

useEffect(() => {
  fetchRecentAppointments();
}, []);

  const handleExportReport = (): void => {
    console.log('Exporting report...');
    alert('Report exported successfully!');
  };

  const handleNewEntry = (): void => {
    console.log('Creating new entry...');
    alert('New entry form would open here!');
  };

  const handleViewAllAppointments = (): void => {
    navigate('/admin/view-appointment');
  };

  const handleBookAppointment = (): void => {
    navigate('/book-appointment');
  };

  const handleRegisterUser = (): void => {
    navigate('/signup');
  };

  const handleManageInventory = (): void => {
    navigate('/admin/inventory');
  };

  // Get status icon and color
  const getStatusInfo = (status: string | undefined): StatusInfo => {
    const statusLower = status?.toLowerCase() || '';
    
    switch (statusLower) {
      case 'completed':
        return { 
          icon: <FaCheck />, 
          color: '#51cf66', 
          bgColor: 'rgba(81, 207, 102, 0.1)' 
        };
      case 'in progress':
        return { 
          icon: <FaSpinner />, 
          color: '#1094E6', 
          bgColor: 'rgba(16, 148, 230, 0.1)' 
        };
      case 'pending':
        return { 
          icon: <FaClock />, 
          color: '#ffd43b', 
          bgColor: 'rgba(255, 212, 59, 0.1)' 
        };
      default:
        return { 
          icon: <FaClock />, 
          color: '#6c757d', 
          bgColor: 'rgba(108, 117, 125, 0.1)' 
        };
    }
  };

  // Get service icon
  const getServiceIcon = (serviceType: string | undefined): JSX.Element => {
    const serviceTypeLower = serviceType?.toLowerCase() || '';
    
    switch (serviceTypeLower) {
      case 'servicing':
        return <FaCarSide />;
      case 'repair':
        return <FaWrench />;
      case 'checkup':
        return <FaClipboardList />;
      case 'wash':
        return <FaCar />;
      default:
        return <FaCarSide />;
    }
  };

  // Format time
  const formatTime = (timeString: string | undefined): string => {
    if (!timeString) return 'N/A';
    try {
      const time = new Date(`2000-01-01T${timeString}`);
      return time.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
    } catch (error) {
      return 'Invalid time';
    }
  };

  // Format date
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <>
      <Sidebar />
      <div className="admin-main-container">
        {/* Header with greeting and buttons in same line */}
        <div className="dashboard-header-row">
          <div className="welcome-section">
            <h1 className="welcome-title">Welcome back, Admin</h1>
            <p className="date-display">Here is your daily overview for {formattedDate}</p>
          </div>
          
          <div className="action-buttons-horizontal">
            <button className="export-btn" onClick={handleExportReport}>
              <FaDownload />
              <span>Export Report</span>
            </button>
            <button className="new-entry-btn" onClick={handleNewEntry}>
              <FaPlus />
              <span>New Entry</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid-container">
          {/* Appointments Today Card */}
          <div className="stat-card-container">
            <div className="stat-header-container">
              <div className="stat-icon-container appointments">
                <FaCalendarAlt />
              </div>
              <div className="stat-trend-container up">
                <FaArrowUp />
                <span>10%</span>
              </div>
            </div>
            <div className="stat-content-container">
              <h3 className="stat-number">12</h3>
              <p className="stat-label">Appointments Today</p>
            </div>
          </div>

          {/* Pending Repairs Card */}
          <div className="stat-card-container">
            <div className="stat-header-container">
              <div className="stat-icon-container repairs">
                <FaTools />
              </div>
              <div className="stat-trend-container down">
                <FaArrowDown />
                <span>~2%</span>
              </div>
            </div>
            <div className="stat-content-container">
              <h3 className="stat-number">5</h3>
              <p className="stat-label">Pending Repairs</p>
            </div>
          </div>

          {/* Completed Services Card */}
          <div className="stat-card-container">
            <div className="stat-header-container">
              <div className="stat-icon-container completed">
                <FaCheckCircle />
              </div>
              <div className="stat-trend-container up">
                <FaArrowUp />
                <span>~5%</span>
              </div>
            </div>
            <div className="stat-content-container">
              <h3 className="stat-number">42</h3>
              <p className="stat-label">Completed Services</p>
            </div>
          </div>
        </div>

        {/* Recent Appointments and Quick Actions Section */}
        <div className="content-grid-container">
          {/* Recent Appointments */}
          <div className="recent-appointments-section">
            <div className="section-header">
              <h2 className="section-title">Recent Appointments</h2>
              <button className="view-all-btn" onClick={handleViewAllAppointments}>
                View All
              </button>
            </div>
            
            <div className="appointments-table-container">
              {loading ? (
                <div className="loading-container">
                  <FaSpinner className="spinner" />
                  <p>Loading appointments...</p>
                </div>
              ) : error ? (
                <div className="error-container">
                  <p>Error: {error}</p>
                  <button onClick={fetchRecentAppointments} className="retry-button">
                    Retry
                  </button>
                </div>
              ) : recentAppointments.length > 0 ? (
                <table className="appointments-table">
                  <thead>
                    <tr>
                      <th>VEHICLE</th>
                      <th>CUSTOMER</th>
                      <th>SERVICE TYPE</th>
                      <th>STATUS</th>
                      <th>TIME</th>
                      <th>DATE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAppointments.map((appointment, index) => {
                      const statusInfo = getStatusInfo(appointment.status);
                      return (
                        <tr key={appointment._id || index}>
                          <td>
                            <div className="vehicle-info">
                              <div className="vehicle-icon">
                                {getServiceIcon(appointment.serviceType)}
                              </div>
                              <div className="vehicle-details">
                                <div className="vehicle-model">
                                  {appointment.vehicleInfo?.model || 'N/A'}
                                </div>
                                <div className="vehicle-plate">
                                  License: {appointment.vehicleInfo?.numberPlate || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="customer-info">
                              <FaUser className="customer-icon" />
                              <span>{appointment.name || 'N/A'}</span>
                            </div>
                          </td>
                          <td>
                            <span className="service-type-badge">
                              {appointment.serviceType || 'N/A'}
                            </span>
                          </td>
                          <td>
                            <span 
                              className="status-badge"
                              style={{ 
                                backgroundColor: statusInfo.bgColor,
                                color: statusInfo.color
                              }}
                            >
                              {statusInfo.icon}
                              <span>{appointment.status || 'Pending'}</span>
                            </span>
                          </td>
                          <td>
                            <div className="time-slot">
                              <FaClock />
                              <span>{formatTime(appointment.time)}</span>
                            </div>
                          </td>
                          <td>
                            <div className="date-display-small">
                              {formatDate(appointment.date)}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">
                  <FaCalendarAlt className="empty-icon" />
                  <p>No recent appointments found</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions-section">
            <div className="section-header">
              <h2 className="section-title">Quick Actions</h2>
            </div>
            
            <div className="quick-actions-grid">
              <button className="quick-action-btn" onClick={handleBookAppointment}>
                <div className="quick-action-icon" style={{ backgroundColor: 'rgba(16, 148, 230, 0.1)' }}>
                  <FaCalendarAlt style={{ color: '#1094E6' }} />
                </div>
                <div className="quick-action-content">
                  <h3>New Appointment</h3>
                  <p>Schedule a service for a client</p>
                </div>
              </button>

              <button className="quick-action-btn" onClick={handleRegisterUser}>
                <div className="quick-action-icon" style={{ backgroundColor: 'rgba(121, 82, 179, 0.1)' }}>
                  <FaUserPlus style={{ color: '#7952b3' }} />
                </div>
                <div className="quick-action-content">
                  <h3>Register Customer</h3>
                  <p>Add a new client profile</p>
                </div>
              </button>

              <button className="quick-action-btn" onClick={handleManageInventory}>
                <div className="quick-action-icon" style={{ backgroundColor: 'rgba(81, 207, 102, 0.1)' }}>
                  <FaClipboardList style={{ color: '#51cf66' }} />
                </div>
                <div className="quick-action-content">
                  <h3>Manage Inventory</h3>
                  <p>Update and track parts stock</p>
                </div>
              </button>

              <button className="quick-action-btn">
                <div className="quick-action-icon" style={{ backgroundColor: 'rgba(255, 107, 107, 0.1)' }}>
                  <FaTools style={{ color: '#ff6b6b' }} />
                </div>
                <div className="quick-action-content">
                  <h3>Service Reports</h3>
                  <p>Generate service history reports</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminHome;