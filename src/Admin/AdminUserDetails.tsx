import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faUser,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faCalendarAlt,
  faDollarSign,
  faBox,
  faCar,
  faCheckCircle,
  faClock,
  faTrash,
  faUserShield,
  faDownload,
  faExternalLinkAlt
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import adminUserService from '../services/adminUserService';
import type { UserDetails } from '../services/adminUserService';
import './AdminUserDetails.css';

const AdminUserDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'packages' | 'vehicles'>('overview');

  useEffect(() => {
    if (id) {
      fetchUserDetails();
    }
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await adminUserService.getUserDetails(id!);
      if (response.success) {
        setUserDetails(response.data);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userDetails) return;
    
    if (!window.confirm(`Are you sure you want to delete "${userDetails.user.name || userDetails.user.email}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await adminUserService.deleteUser(id!);
      toast.success('User deleted successfully');
      navigate('/admin/users');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user');
    }
  };

  const handleRoleChange = async () => {
    if (!userDetails) return;

    const newRole = userDetails.user.role === 'user' ? 'admin' : 'user';
    if (!window.confirm(`Change ${userDetails.user.name}'s role to ${newRole}?`)) {
      return;
    }

    try {
      await adminUserService.updateUserRole(id!, newRole);
      toast.success(`User role updated to ${newRole}`);
      fetchUserDetails();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user role');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString('en-IN')}`;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'booked': '#1976d2',
      'confirmed': '#388e3c',
      'in-progress': '#f57c00',
      'completed': '#2e7d32',
      'payment': '#7b1fa2',
      'cancelled': '#d32f2f'
    };
    return colors[status] || '#666';
  };

  if (loading) {
    return (
      <>
        <Sidebar />
        <div className="admin-user-details-container">
          <div className="admin-user-details-loading">
            <div className="admin-user-details-spinner"></div>
            <p>Loading user details...</p>
          </div>
        </div>
      </>
    );
  }

  if (!userDetails) {
    return (
      <>
        <Sidebar />
        <div className="admin-user-details-container">
          <div className="admin-user-details-error">
            <h2>User not found</h2>
            <button onClick={() => navigate('/admin/users')}>
              <FontAwesomeIcon icon={faArrowLeft} /> Back to Users
            </button>
          </div>
        </div>
      </>
    );
  }

  const { user, statistics, appointments, payments, packagePurchases, vehicles } = userDetails;

  return (
    <>
      <Sidebar />
      <div className="admin-user-details-container">
        {/* Header */}
        <div className="admin-user-details-header">
          <button className="admin-user-details-back-btn" onClick={() => navigate('/admin/users')}>
            <FontAwesomeIcon icon={faArrowLeft} /> Back
          </button>
          <div className="admin-user-details-title">
            <h1>User Details</h1>
            <p>Complete information about {user.name || user.email}</p>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="admin-user-profile-card">
          <div className="admin-user-profile-left">
            {user.profilePictureUrl ? (
              <img src={user.profilePictureUrl} alt={user.name} className="admin-user-profile-picture" />
            ) : (
              <div className="admin-user-profile-picture-placeholder">
                <FontAwesomeIcon icon={faUser} />
              </div>
            )}
            <div className="admin-user-profile-info">
              <h2>{user.name || 'N/A'}</h2>
              <div className="admin-user-profile-meta">
                <span className={`admin-user-role-badge ${user.role}`}>
                  <FontAwesomeIcon icon={faUserShield} /> {user.role === 'admin' ? 'Administrator' : 'User'}
                </span>
                <span className={`admin-user-verified-badge ${user.isVerified ? 'verified' : 'unverified'}`}>
                  <FontAwesomeIcon icon={user.isVerified ? faCheckCircle : faClock} />
                  {user.isVerified ? 'Verified' : 'Unverified'}
                </span>
              </div>
            </div>
          </div>

          <div className="admin-user-profile-actions">
            <button className="admin-user-action-btn admin-user-role-change-btn" onClick={handleRoleChange}>
              <FontAwesomeIcon icon={faUserShield} />
              Make {user.role === 'user' ? 'Admin' : 'User'}
            </button>
            <button className="admin-user-action-btn admin-user-delete-btn" onClick={handleDeleteUser}>
              <FontAwesomeIcon icon={faTrash} />
              Delete User
            </button>
          </div>
        </div>

        {/* Contact Information */}
        <div className="admin-user-info-grid">
          <div className="admin-user-info-card">
            <div className="admin-user-info-icon" style={{ backgroundColor: '#e3f2fd' }}>
              <FontAwesomeIcon icon={faEnvelope} style={{ color: '#1976d2' }} />
            </div>
            <div>
              <h4>Email Address</h4>
              <p>{user.email}</p>
            </div>
          </div>

          <div className="admin-user-info-card">
            <div className="admin-user-info-icon" style={{ backgroundColor: '#e8f5e9' }}>
              <FontAwesomeIcon icon={faPhone} style={{ color: '#388e3c' }} />
            </div>
            <div>
              <h4>Phone Number</h4>
              <p>{user.phone || 'Not provided'}</p>
            </div>
          </div>

          <div className="admin-user-info-card">
            <div className="admin-user-info-icon" style={{ backgroundColor: '#fff3e0' }}>
              <FontAwesomeIcon icon={faMapMarkerAlt} style={{ color: '#f57c00' }} />
            </div>
            <div>
              <h4>Address</h4>
              <p>
                {user.address?.street || 'Not provided'}
                {user.address?.city && `, ${user.address.city}`}
                {user.address?.state && `, ${user.address.state}`}
                {user.address?.zipCode && ` - ${user.address.zipCode}`}
              </p>
            </div>
          </div>

          <div className="admin-user-info-card">
            <div className="admin-user-info-icon" style={{ backgroundColor: '#fce4ec' }}>
              <FontAwesomeIcon icon={faCalendarAlt} style={{ color: '#c2185b' }} />
            </div>
            <div>
              <h4>Member Since</h4>
              <p>{formatDate(user.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="admin-user-stats-section">
          <h3><FontAwesomeIcon icon={faDollarSign} /> User Statistics</h3>
          <div className="admin-user-stats-grid">
            <div className="admin-user-stat-item">
              <div className="admin-user-stat-value" style={{ color: '#1976d2' }}>
                {formatCurrency(statistics.totalSpent)}
              </div>
              <div className="admin-user-stat-label">Total Spent</div>
            </div>
            <div className="admin-user-stat-item">
              <div className="admin-user-stat-value" style={{ color: '#388e3c' }}>
                {statistics.totalAppointments}
              </div>
              <div className="admin-user-stat-label">Total Appointments</div>
            </div>
            <div className="admin-user-stat-item">
              <div className="admin-user-stat-value" style={{ color: '#2e7d32' }}>
                {statistics.completedAppointments}
              </div>
              <div className="admin-user-stat-label">Completed</div>
            </div>
            <div className="admin-user-stat-item">
              <div className="admin-user-stat-value" style={{ color: '#f57c00' }}>
                {statistics.upcomingAppointments}
              </div>
              <div className="admin-user-stat-label">Upcoming</div>
            </div>
            <div className="admin-user-stat-item">
              <div className="admin-user-stat-value" style={{ color: '#7b1fa2' }}>
                {statistics.activePackages}
              </div>
              <div className="admin-user-stat-label">Active Packages</div>
            </div>
            <div className="admin-user-stat-item">
              <div className="admin-user-stat-value" style={{ color: '#0097a7' }}>
                {statistics.totalVehicles}
              </div>
              <div className="admin-user-stat-label">Vehicles</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="admin-user-tabs">
          <button
            className={`admin-user-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`admin-user-tab ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            Appointments ({appointments.length})
          </button>
          <button
            className={`admin-user-tab ${activeTab === 'packages' ? 'active' : ''}`}
            onClick={() => setActiveTab('packages')}
          >
            Packages ({packagePurchases.length})
          </button>
          <button
            className={`admin-user-tab ${activeTab === 'vehicles' ? 'active' : ''}`}
            onClick={() => setActiveTab('vehicles')}
          >
            Vehicles ({vehicles.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="admin-user-tab-content">
          {activeTab === 'appointments' && (
            <div className="admin-user-appointments">
              {appointments.length === 0 ? (
                <div className="admin-user-empty-state">
                  <FontAwesomeIcon icon={faCalendarAlt} size="2x" />
                  <p>No appointments found</p>
                </div>
              ) : (
                <div className="admin-user-table">
                  <div className="admin-user-table-header">
                    <div className="admin-user-col">ID</div>
                    <div className="admin-user-col">Service</div>
                    <div className="admin-user-col">Date & Time</div>
                    <div className="admin-user-col">Vehicle</div>
                    <div className="admin-user-col">Status</div>
                  </div>
                  {appointments.map((apt: any) => (
                    <div key={apt.appointmentId} className="admin-user-table-row">
                      <div className="admin-user-col">#{apt.appointmentId}</div>
                      <div className="admin-user-col">{apt.serviceType}</div>
                      <div className="admin-user-col">{apt.date} at {apt.time}</div>
                      <div className="admin-user-col">{apt.vehicleInfo?.name || 'N/A'}</div>
                      <div className="admin-user-col">
                        <span
                          className="admin-user-status-badge"
                          style={{ backgroundColor: getStatusColor(apt.status), color: 'white' }}
                        >
                          {apt.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'packages' && (
            <div className="admin-user-packages">
              {packagePurchases.length === 0 ? (
                <div className="admin-user-empty-state">
                  <FontAwesomeIcon icon={faBox} size="2x" />
                  <p>No packages purchased</p>
                </div>
              ) : (
                <div className="admin-user-packages-grid">
                  {packagePurchases.map((pkg: any) => (
                    <div key={pkg._id} className="admin-user-package-card">
                      <div className="admin-user-package-header">
                        <h4>{pkg.packageName}</h4>
                        <span className={`admin-user-package-status ${pkg.isActive && pkg.expiryDate > new Date() && pkg.remainingCredits > 0 ? 'active' : 'expired'}`}>
                          {pkg.isActive && pkg.expiryDate > new Date() && pkg.remainingCredits > 0 ? 'Active' : 'Expired'}
                        </span>
                      </div>
                      <div className="admin-user-package-details">
                        <div className="admin-user-package-item">
                          <span>Credits:</span>
                          <strong>{pkg.remainingCredits} / {pkg.totalCredits}</strong>
                        </div>
                        <div className="admin-user-package-item">
                          <span>Amount:</span>
                          <strong>{formatCurrency(pkg.amount)}</strong>
                        </div>
                        <div className="admin-user-package-item">
                          <span>Purchased:</span>
                          <strong>{formatDate(pkg.purchasedAt)}</strong>
                        </div>
                        <div className="admin-user-package-item">
                          <span>Expires:</span>
                          <strong>{formatDate(pkg.expiryDate)}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'vehicles' && (
            <div className="admin-user-vehicles">
              {vehicles.length === 0 ? (
                <div className="admin-user-empty-state">
                  <FontAwesomeIcon icon={faCar} size="2x" />
                  <p>No vehicles registered</p>
                </div>
              ) : (
                <div className="admin-user-vehicles-grid">
                  {vehicles.map((vehicle: any) => (
                    <div key={vehicle._id} className="admin-user-vehicle-card">
                      {vehicle.imageUrl && (
                        <img src={vehicle.imageUrl} alt={vehicle.name} className="admin-user-vehicle-image" />
                      )}
                      <div className="admin-user-vehicle-details">
                        <h4>{vehicle.name}</h4>
                        <p className="admin-user-vehicle-model">{vehicle.model} - {vehicle.version}</p>
                        <div className="admin-user-vehicle-info">
                          <div className="admin-user-vehicle-info-item">
                            <span>Color:</span>
                            <strong>{vehicle.color}</strong>
                          </div>
                          <div className="admin-user-vehicle-info-item">
                            <span>Plate:</span>
                            <strong>{vehicle.numberPlate}</strong>
                          </div>
                          <div className="admin-user-vehicle-info-item">
                            <span>Mileage:</span>
                            <strong>{vehicle.mileage || 0} km</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="admin-user-overview">
              <div className="admin-user-overview-grid">
                <div className="admin-user-overview-section">
                  <h4><FontAwesomeIcon icon={faCalendarAlt} /> Recent Appointments</h4>
                  {appointments.slice(0, 3).map((apt: any) => (
                    <div key={apt.appointmentId} className="admin-user-overview-item">
                      <div className="admin-user-overview-item-icon" style={{ backgroundColor: getStatusColor(apt.status) }}>
                        <FontAwesomeIcon icon={faCalendarAlt} />
                      </div>
                      <div className="admin-user-overview-item-info">
                        <div className="admin-user-overview-item-title">{apt.serviceType}</div>
                        <div className="admin-user-overview-item-subtitle">
                          {apt.date} at {apt.time}
                        </div>
                      </div>
                      <span className="admin-user-overview-item-status" style={{ color: getStatusColor(apt.status) }}>
                        {apt.status}
                      </span>
                    </div>
                  ))}
                  {appointments.length === 0 && <p className="admin-user-empty-text">No appointments</p>}
                </div>

                <div className="admin-user-overview-section">
                  <h4><FontAwesomeIcon icon={faBox} /> Active Packages</h4>
                  {packagePurchases.filter((pkg: any) => pkg.isActive && pkg.expiryDate > new Date() && pkg.remainingCredits > 0).slice(0, 3).map((pkg: any) => (
                    <div key={pkg._id} className="admin-user-overview-item">
                      <div className="admin-user-overview-item-icon" style={{ backgroundColor: '#7b1fa2' }}>
                        <FontAwesomeIcon icon={faBox} />
                      </div>
                      <div className="admin-user-overview-item-info">
                        <div className="admin-user-overview-item-title">{pkg.packageName}</div>
                        <div className="admin-user-overview-item-subtitle">
                          {pkg.remainingCredits} / {pkg.totalCredits} credits
                        </div>
                      </div>
                      <span className="admin-user-overview-item-status" style={{ color: '#7b1fa2' }}>
                        Active
                      </span>
                    </div>
                  ))}
                  {packagePurchases.filter((pkg: any) => pkg.isActive && pkg.expiryDate > new Date() && pkg.remainingCredits > 0).length === 0 && (
                    <p className="admin-user-empty-text">No active packages</p>
                  )}
                </div>

                <div className="admin-user-overview-section">
                  <h4><FontAwesomeIcon icon={faCar} /> Registered Vehicles</h4>
                  {vehicles.slice(0, 3).map((vehicle: any) => (
                    <div key={vehicle._id} className="admin-user-overview-item">
                      <div className="admin-user-overview-item-icon" style={{ backgroundColor: '#0097a7' }}>
                        <FontAwesomeIcon icon={faCar} />
                      </div>
                      <div className="admin-user-overview-item-info">
                        <div className="admin-user-overview-item-title">{vehicle.name}</div>
                        <div className="admin-user-overview-item-subtitle">
                          {vehicle.numberPlate}
                        </div>
                      </div>
                    </div>
                  ))}
                  {vehicles.length === 0 && <p className="admin-user-empty-text">No vehicles</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminUserDetails;
