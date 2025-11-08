import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserDashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarPlus,
  faWrench,
  faFileInvoiceDollar,
  faCalendarCheck,
  faStar,
} from '@fortawesome/free-solid-svg-icons';

// Import Components
import ActiveBookings from './ActiveBookings';
import VehiclesSection from './VehicleSection';
import ServiceReminders from './ServiceReminders';
import ServicePackages from './ServicePackages';
import QuickActions from './QuickActions';
import RecentActivities from './RecentActivities';
import AddVehicleModal from './AddVehicleModal';
import EditVehicleModal from './EditVehicleModal';
import { type Vehicle } from '../../services/vehicleService';
import { getDashboardStats, type DashboardStats } from '../../services/dashboardService';

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const name = localStorage.getItem('userName') || 'User';
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [refreshVehicles, setRefreshVehicles] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');

  const handleEditVehicleClick = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    setShowEditModal(true);
  };

  const [newVehicleData, setNewVehicleData] = useState({
    name: '',
    model: '',
    kilometerRun: '',
    color: '',
    numberPlate: ''
  });

  // Stats data
  const [stats, setStats] = useState<DashboardStats>({
    totalServices: 0,
    totalSpent: 0,
    upcomingServices: 0,
    loyaltyPoints: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch stats data
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getDashboardStats();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Event Handlers
  const handleBookService = () => navigate('/book-appointment');

  const handleBookServiceVehicle = (vehicle?: Vehicle) => {
    if (vehicle) {
      localStorage.setItem('selectedVehicle', JSON.stringify(vehicle));
      console.log('Booking service for vehicle:', vehicle);
    }
    navigate('/book-appointment');
  };

  const handleViewDetails = (bookingId: string | number) => navigate(`/booking-details/${bookingId}`);
  const handleTrackService = (bookingId: string | number) => navigate(`/track-service`);
  const handleReschedule = (bookingId: string | number) => navigate(`/reschedule/${bookingId}`);
  const handleCancelBooking = (bookingId: string | number) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      alert('Booking cancellation will be handled by the component');
    }
  };
  const handleViewVehicle = (vehicleId: string) => navigate(`/vehicle/${vehicleId}`);
  const handlePurchasePackage = (packageId: string) => navigate(`/package/${packageId}`);
  const handleViewAllPackages = () => navigate('/packages');
  const handleTrackServiceGeneral = () => navigate('/track-service');
  const handleViewHistory = () => navigate('/history');
  const handleEmergencyService = () => navigate('/emergency');

  const handleAddVehicleClick = () => setShowAddVehicleModal(true);
  
  const handleCloseModal = () => {
    setShowAddVehicleModal(false);
    setNewVehicleData({
      name: '',
      model: '',
      kilometerRun: '',
      color: '',
      numberPlate: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewVehicleData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Vehicle will be added by the VehiclesSection component');
    handleCloseModal();
  };

  const handleVehicleAdded = () => {
    setRefreshVehicles(prev => !prev);
  };

  const handleVehicleUpdated = () => {
    setRefreshVehicles(prev => !prev);
    setShowEditModal(false);
  };

  return (
    <div className="userdashboard-container">
      {/* Welcome Section - Original */}
      <div className="userdashboard-welcome">
        <div className="userdashboard-welcome-content">
          <h1>Welcome back, {name}! 🏍️</h1>
          <p>Keep your 2-wheeler in top condition with our expert services</p>
        </div>
        <button className="userdashboard-book-btn" onClick={handleBookService}>
          <FontAwesomeIcon icon={faCalendarPlus} />
          <span>Book New Service</span>
        </button>
      </div>

      {/* Stats Cards - Original */}
      <div className="userdashboard-stats">
        <div className="userdashboard-stat-card">
          <div className="userdashboard-stat-icon" style={{ backgroundColor: '#E3F2FD' }}>
            <FontAwesomeIcon icon={faWrench} style={{ color: '#2196F3' }} />
          </div>
          <div className="userdashboard-stat-info">
            <h3>{loading ? '...' : error ? 'N/A' : stats.totalServices}</h3>
            <p>Total Services</p>
          </div>
        </div>
        <div className="userdashboard-stat-card">
          <div className="userdashboard-stat-icon" style={{ backgroundColor: '#E8F5E9' }}>
            <FontAwesomeIcon icon={faFileInvoiceDollar} style={{ color: '#4CAF50' }} />
          </div>
          <div className="userdashboard-stat-info">
            <h3>{loading ? '...' : error ? 'N/A' : `Rs. ${stats.totalSpent.toLocaleString()}`}</h3>
            <p>Total Spent</p>
          </div>
        </div>
        <div className="userdashboard-stat-card">
          <div className="userdashboard-stat-icon" style={{ backgroundColor: '#FFF3E0' }}>
            <FontAwesomeIcon icon={faCalendarCheck} style={{ color: '#FF9800' }} />
          </div>
          <div className="userdashboard-stat-info">
            <h3>{loading ? '...' : error ? 'N/A' : stats.upcomingServices}</h3>
            <p>Upcoming Services</p>
          </div>
        </div>
        <div className="userdashboard-stat-card">
          <div className="userdashboard-stat-icon" style={{ backgroundColor: '#F3E5F5' }}>
            <FontAwesomeIcon icon={faStar} style={{ color: '#9C27B0' }} />
          </div>
          <button onClick={() => navigate('/user/settings')}>
          <div className="userdashboard-stat-info1">
            <h3>{loading ? '...' : error ? 'N/A' : stats.loyaltyPoints}</h3>
            <p>Loyalty Points</p>
          </div>
          </button>
        </div>
      </div>

      {/* Main Content Grid - Original Layout */}
      <div className="userdashboard-grid">
        {/* Active Bookings Component */}
        <ActiveBookings
          onBookService={handleBookService}
          onTrackService={handleTrackService}
          onViewDetails={handleViewDetails}
          onReschedule={handleReschedule}
          onCancelBooking={handleCancelBooking}
        />

        {/* Vehicles Section Component */}
        <VehiclesSection
          key={refreshVehicles ? 'refresh' : 'normal'}
          onAddVehicleClick={handleAddVehicleClick}
          onBookService={handleBookServiceVehicle}
          onEditVehicleClick={handleEditVehicleClick}
        />

        {/* Service Packages Component */}
        <ServicePackages
          onViewAllPackages={handleViewAllPackages}
          onPurchasePackage={handlePurchasePackage}
        />

        {/* Service Reminders Component */}
        <ServiceReminders />

        {/* Quick Actions Component */}
        <QuickActions
          onBookService={handleBookService}
          onTrackService={handleTrackServiceGeneral}
          onViewHistory={handleViewHistory}
          onEmergencyService={handleEmergencyService}
        />

        {/* Recent Activities Component */}
        <RecentActivities />
      </div>

      {/* Add Vehicle Modal Component */}
      <AddVehicleModal
        show={showAddVehicleModal}
        onClose={handleCloseModal}
        onVehicleAdded={handleVehicleAdded}
      />

      <EditVehicleModal
        show={showEditModal}
        vehicleId={selectedVehicleId}
        onClose={() => setShowEditModal(false)}
        onVehicleUpdated={handleVehicleUpdated}
      />
    </div>
  );
};

export default UserDashboard;