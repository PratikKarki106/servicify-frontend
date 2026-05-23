import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { addVehicle, type NewVehicleData } from '../../services/vehicleService';

interface AddVehicleModalProps {
  show: boolean;
  onClose: () => void;
  onVehicleAdded?: () => void;
}

const AddVehicleModal: React.FC<AddVehicleModalProps> = ({
  show,
  onClose,
  onVehicleAdded
}) => {
  const [formData, setFormData] = useState<NewVehicleData>({
    name: '',
    color: '',
    version: '',
    plateNumber: '',
    mileage: 0,
    image: null,
    optionalImage: null
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [optionalPreviewImage, setOptionalPreviewImage] = useState<string | null>(null);

  if (!show) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    if (name === 'mileage') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? 0 : parseInt(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.match('image.*')) {
        setErrors(prev => ({ ...prev, image: 'Please select an image file' }));
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'File size exceeds 5MB limit' }));
        return;
      }
      
      // Clear previous errors for image
      if (errors.image) {
        setErrors(prev => ({ ...prev, image: '' }));
      }
      
      // Set the file and create preview
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOptionalImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.match('image.*')) {
        setErrors(prev => ({ ...prev, optionalImage: 'Please select an image file' }));
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, optionalImage: 'File size exceeds 5MB limit' }));
        return;
      }
      
      // Clear previous errors for optional image
      if (errors.optionalImage) {
        setErrors(prev => ({ ...prev, optionalImage: '' }));
      }
      
      // Set the file and create preview
      setFormData(prev => ({
        ...prev,
        optionalImage: file
      }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setOptionalPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Vehicle name is required';
    }

    if (!formData.color.trim()) {
      newErrors.color = 'Vehicle color is required';
    }

    if (!formData.version.trim()) {
      newErrors.version = 'Vehicle version/model is required';
    }

    if (!formData.plateNumber.trim()) {
      newErrors.plateNumber = 'Plate number is required';
    }

    if (!formData.mileage || formData.mileage < 0) {
      newErrors.mileage = 'Valid mileage is required';
    }

    if (!formData.image) {
      newErrors.image = 'Vehicle image is required';
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
      const newVehicle = await addVehicle(formData);
      
      if (newVehicle) {
        // Reset form
        setFormData({
          name: '',
          color: '',
          version: '',
          plateNumber: '',
          mileage: 0,
          image: null,
          optionalImage: null
        });
        setPreviewImage(null); // Clear the image preview
        setOptionalPreviewImage(null); // Clear optional preview
        
        // Notify parent component
        if (onVehicleAdded) {
          onVehicleAdded();
        }
        
        // Close modal
        onClose();
      }
      
    } catch (error) {
      console.error('Add vehicle error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="userdashboard-modal-overlay">
      <div className="userdashboard-modal">
        <div className="userdashboard-modal-header">
          <h3>Add New Vehicle</h3>
          <button className="userdashboard-modal-close" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="userdashboard-vehicle-form">
          <div className="userdashboard-form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Yamaha MT-15"
              required
              disabled={loading}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>
          
          <div className="userdashboard-form-group">
            <label htmlFor="color">Color *</label>
            <input
              type="text"
              id="color"
              name="color"
              value={formData.color}
              onChange={handleInputChange}
              placeholder="e.g., Red, Black"
              required
              disabled={loading}
              className={errors.color ? 'error' : ''}
            />
            {errors.color && <span className="form-error">{errors.color}</span>}
          </div>
          
          <div className="userdashboard-form-group">
            <label htmlFor="version">Version/Model *</label>
            <input
              type="text"
              id="version"
              name="version"
              value={formData.version}
              onChange={handleInputChange}
              placeholder="e.g., Bs6, Classic 350"
              required
              disabled={loading}
              className={errors.version ? 'error' : ''}
            />
            {errors.version && <span className="form-error">{errors.version}</span>}
          </div>
          
          <div className="userdashboard-form-group">
            <label htmlFor="plateNumber">Number Plate *</label>
            <input
              type="text"
              id="plateNumber"
              name="plateNumber"
              value={formData.plateNumber}
              onChange={handleInputChange}
              placeholder="e.g., BA 2 PA 1234"
              required
              disabled={loading}
              className={errors.plateNumber ? 'error' : ''}
            />
            {errors.plateNumber && <span className="form-error">{errors.plateNumber}</span>}
          </div>
          
          <div className="userdashboard-form-group">
            <label htmlFor="mileage">Kilometer Run *</label>
            <input
              type="number"
              id="mileage"
              name="mileage"
              value={formData.mileage || ''}
              onChange={handleInputChange}
              placeholder="e.g., 4500"
              min="0"
              required
              disabled={loading}
              className={errors.mileage ? 'error' : ''}
            />
            {errors.mileage && <span className="form-error">{errors.mileage}</span>}
          </div>

          {/* Image Upload */}
          <div className="userdashboard-form-group">
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label htmlFor="image">Bluebook *</label>
                <div className="image-upload-container">
                  <label htmlFor="image-upload" className={`image-upload-area ${errors.image ? 'error' : ''}`} style={{ padding: '20px', minHeight: '150px' }}>
                    {previewImage ? (
                      <div className="image-preview" style={{ maxHeight: '120px' }}>
                        <img src={previewImage} alt="Vehicle preview" className="preview-img" style={{ maxHeight: '120px', objectFit: 'contain' }} />
                      </div>
                    ) : (
                      <div className="upload-placeholder">
                        <span>+</span>
                        <p style={{ fontSize: '0.85rem' }}>Upload bluebook</p>
                        <p className="upload-hint" style={{ fontSize: '0.75rem' }}>(Max 5MB)</p>
                      </div>
                    )}
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
                {errors.image && <span className="form-error">{errors.image}</span>}
              </div>

              <div style={{ flex: 1 }}>
                <label htmlFor="optional-image-upload">Vehicle Image (Optional)</label>
                <div className="image-upload-container">
                  <label htmlFor="optional-image-upload" className={`image-upload-area ${errors.optionalImage ? 'error' : ''}`} style={{ padding: '20px', minHeight: '150px' }}>
                    {optionalPreviewImage ? (
                      <div className="image-preview" style={{ maxHeight: '120px' }}>
                        <img src={optionalPreviewImage} alt="Optional preview" className="preview-img" style={{ maxHeight: '120px', objectFit: 'contain' }} />
                      </div>
                    ) : (
                      <div className="upload-placeholder">
                        <span>+</span>
                        <p style={{ fontSize: '0.85rem' }}>Upload vehicle photo</p>
                        <p className="upload-hint" style={{ fontSize: '0.75rem' }}>(Max 5MB)</p>
                      </div>
                    )}
                    <input
                      type="file"
                      id="optional-image-upload"
                      accept="image/*"
                      onChange={handleOptionalImageChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
                {errors.optionalImage && <span className="form-error">{errors.optionalImage}</span>}
              </div>
            </div>
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
              {loading ? 'Adding...' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVehicleModal;