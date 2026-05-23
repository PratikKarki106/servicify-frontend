import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMotorcycle } from '@fortawesome/free-solid-svg-icons';
import { fetchVehicles, deleteVehicle, type Vehicle } from '../../services/vehicleService';
import { appConfirm } from '../../services/dialogService';

interface VehiclesSectionProps {
  onAddVehicleClick: () => void;
  onBookService: (vehicle: Vehicle) => void;
  onEditVehicleClick?: (vehicleId: string) => void;
}

const VehiclesSection: React.FC<VehiclesSectionProps> = ({
  onAddVehicleClick,
  onBookService,
  onEditVehicleClick
}) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch vehicles data
  const loadVehicles = async () => {
    try {
      setLoading(true);
      const data = await fetchVehicles();
      setVehicles(data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookService = (vehicle: Vehicle) => {
    onBookService(vehicle);
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    const confirmed = await appConfirm({
      title: 'Delete vehicle',
      message: 'Are you sure you want to delete this vehicle?',
      confirmText: 'Delete vehicle',
      variant: 'danger',
    });
    if (!confirmed) return;

    try {
      const isDeleted = await deleteVehicle(vehicleId);
      if (isDeleted) {
        loadVehicles(); // Refresh list
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

    const handleEditClick = (vehicleId: string) => {
    if (onEditVehicleClick) {
      onEditVehicleClick(vehicleId); // Pass vehicle ID to parent
    }
  };

  if (loading) {
    return (
      <div className="userdashboard-section vehicles-section">
        <div className="userdashboard-section-header">
          <h2><FontAwesomeIcon icon={faMotorcycle} /> Your Vehicles</h2>
          <button className="userdashboard-add-btn" onClick={onAddVehicleClick}>
            + Add Vehicle
          </button>
        </div>
        <div className="loading-spinner">Loading vehicles...</div>
      </div>
    );
  }

  return (
    <div className="userdashboard-section vehicles-section">
      <div className="userdashboard-section-header">
        <h2><FontAwesomeIcon icon={faMotorcycle} /> Your Vehicles</h2>
        <button className="userdashboard-add-btn" onClick={onAddVehicleClick}>
          + Add Vehicle
        </button>
      </div>
      <div className="userdashboard-vehicles">
        {vehicles.length === 0 ? (
          <div className="userdashboard-empty">
            <p>No vehicles added yet</p>
            <button onClick={onAddVehicleClick}>Add Your First Vehicle</button>
          </div>
        ) : (
          vehicles.map(vehicle => (
            <div key={vehicle._id} className={`userdashboard-vehicle-card ${vehicle.status !== 'verified' ? 'vehicle-not-verified' : ''}`}>
              <div className="userdashboard-vehicle-header">
                <div className="userdashboard-vehicle-icon">
                  <FontAwesomeIcon icon={faMotorcycle} />
                </div>
                <div className="userdashboard-vehicle-info">
                  <h4>{vehicle.name}</h4>
                  <p>{vehicle.color} • {vehicle.version}</p>
                  <p className="userdashboard-vehicle-plate1">{vehicle.plateNumber}</p>
                </div>
                <div className="vehicle-status-badge">
                  {vehicle.status === 'pending' && (
                    <span className="status-badge pending">Pending</span>
                  )}
                  {vehicle.status === 'verified' && (
                    <span className="status-badge verified">Verified</span>
                  )}
                  {vehicle.status === 'rejected' && (
                    <span className="status-badge rejected">Rejected</span>
                  )}
                </div>
              </div>
              {vehicle.status === 'rejected' && vehicle.rejectionReason && (
                <div className="vehicle-rejection-message">
                  <p><strong>Rejection Reason:</strong> {vehicle.rejectionReason}</p>
                </div>
              )}
              <div className="userdashboard-vehicle-stats">
                <div className="userdashboard-vehicle-stat">
                  <span className="userdashboard-stat-label">Mileage</span>
                  <span className="userdashboard-stat-value">{vehicle.mileage.toLocaleString()} km</span>
                </div>
                <div className="userdashboard-vehicle-stat">
                  <span className="userdashboard-stat-label">Last Service</span>
                  <span className="userdashboard-stat-value">{formatDate(vehicle.lastService)}</span>
                </div>
                <div className="userdashboard-vehicle-stat">
                  <span className="userdashboard-stat-label">Next Due</span>
                  <span className="userdashboard-stat-value">{formatDate(vehicle.nextService)}</span>
                </div>
              </div>
              <div className="userdashboard-vehicle-actions">
                {vehicle.status === 'verified' ? (
                  <>
                    <button
                      className="userdashboard-action-btn service"
                      onClick={() => handleBookService(vehicle)}
                    >
                      Book Service
                    </button>
                    <button
                      className="userdashboard-action-btn view"
                      onClick={() => handleEditClick(vehicle._id)}
                    >
                      Edit Details
                    </button>
                    <button
                      className="userdashboard-action-btn cancel"
                      onClick={() => handleDeleteVehicle(vehicle._id)}
                    >
                      Delete Vehicle
                    </button>
                  </>
                ) : vehicle.status === 'pending' ? (
                  <div className="vehicle-pending-message">
                    <p>⏳ Awaiting admin verification. You will be able to book services once verified.</p>
                    <button
                      className="userdashboard-action-btn cancel"
                      onClick={() => handleDeleteVehicle(vehicle._id)}
                    >
                      Delete Vehicle
                    </button>
                  </div>
                ) : (
                  <div className="vehicle-rejected-actions">
                    <p>🚫 This vehicle has been rejected. Please delete and add again with correct information.</p>
                    <button
                      className="userdashboard-action-btn cancel"
                      onClick={() => handleDeleteVehicle(vehicle._id)}
                    >
                      Delete Vehicle
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VehiclesSection;