import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { editVehicle, fetchVehicles, type UpdateVehicleData, type Vehicle } from '../../services/vehicleService';

interface EditVehicleModalProps {
  show: boolean;
  vehicleId: string;
  onClose: () => void;
  onVehicleUpdated?: () => void;
}

const EditVehicleModal: React.FC<EditVehicleModalProps> = ({
  show,
  vehicleId,
  onClose,
  onVehicleUpdated
}) => {
  const [formData, setFormData] = useState<UpdateVehicleData>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchVehicleDetails = useCallback(async () => {
    try {
      setFetching(true);
      // Fetch all vehicles and find the one with matching ID
      const vehicles = await fetchVehicles();
      const vehicle = vehicles.find(v => v._id === vehicleId);

      if (vehicle) {
        setFormData({
          name: vehicle.name,
          color: vehicle.color,
          version: vehicle.version,
          plateNumber: vehicle.plateNumber,
          mileage: vehicle.mileage,
          lastService: vehicle.lastService ? vehicle.lastService.split('T')[0] : '',
          nextService: vehicle.nextService ? vehicle.nextService.split('T')[0] : ''
        });
      } else {
        throw new Error('Vehicle not found');
      }
    } catch (error) {
      console.error('Error fetching vehicle details:', error);
      onClose();
    } finally {
      setFetching(false);
    }
  }, [onClose, vehicleId]);

  useEffect(() => {
    if (show && vehicleId) {
      fetchVehicleDetails();
    }
  }, [show, vehicleId, fetchVehicleDetails]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    if (name === 'mileage') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? undefined : parseInt(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.mileage !== undefined && formData.mileage < 0) {
      newErrors.mileage = 'Mileage cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const updatedVehicle = await editVehicle(vehicleId, formData);

      if (updatedVehicle) {
        if (onVehicleUpdated) {
          onVehicleUpdated();
        }

        onClose();
      } else {
        throw new Error('Failed to update vehicle');
      }
    } catch (error) {
      console.error('Update vehicle error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  if (fetching) {
    return (
      <div className="userdashboard-modal-overlay">
        <div className="userdashboard-modal">
          <div className="loading-spinner">Loading vehicle details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="userdashboard-modal-overlay">
      <div className="userdashboard-modal">
        <div className="userdashboard-modal-header">
          <h3>Edit Vehicle Details</h3>
          <button className="userdashboard-modal-close" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="userdashboard-vehicle-form">
          <div className="userdashboard-form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange}
              placeholder="e.g., Yamaha MT-15"
              disabled={loading}
            />
          </div>
          
          <div className="userdashboard-form-group">
            <label htmlFor="color">Color</label>
            <input
              type="text"
              id="color"
              name="color"
              value={formData.color || ''}
              onChange={handleInputChange}
              placeholder="e.g., Red, Black"
              disabled={loading}
            />
          </div>
          
          <div className="userdashboard-form-group">
            <label htmlFor="version">Version/Model</label>
            <input
              type="text"
              id="version"
              name="version"
              value={formData.version || ''}
              onChange={handleInputChange}
              placeholder="e.g., Bs6, Classic 350"
              disabled={loading}
            />
          </div>
          
          <div className="userdashboard-form-group">
            <label htmlFor="plateNumber">Number Plate</label>
            <input
              type="text"
              id="plateNumber"
              name="plateNumber"
              value={formData.plateNumber || ''}
              onChange={handleInputChange}
              placeholder="e.g., BA 2 PA 1234"
              disabled={loading}
            />
          </div>
          
          <div className="userdashboard-form-group">
            <label htmlFor="mileage">Kilometer Run</label>
            <input
              type="number"
              id="mileage"
              name="mileage"
              value={formData.mileage || ''}
              onChange={handleInputChange}
              placeholder="e.g., 4500"
              min="0"
              disabled={loading}
              className={errors.mileage ? 'error' : ''}
            />
            {errors.mileage && <span className="form-error">{errors.mileage}</span>}
          </div>
          
          <div className="userdashboard-form-group">
            <label htmlFor="lastService">Last Service Date</label>
            <input
              type="date"
              id="lastService"
              name="lastService"
              value={formData.lastService || ''}
              onChange={handleInputChange}
              disabled={loading}
            />
          </div>
          
          <div className="userdashboard-form-group">
            <label htmlFor="nextService">Next Service Date</label>
            <input
              type="date"
              id="nextService"
              name="nextService"
              value={formData.nextService || ''}
              onChange={handleInputChange}
              disabled={loading}
            />
          </div>
          
          <div className="userdashboard-form-actions">
            <button 
              type="button" 
              className="userdashboard-cancel-btn" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="userdashboard-submit-btn"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVehicleModal;