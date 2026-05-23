import { useEffect, useState } from 'react';
import './VehicleInfo.css';
import type { VehicleData } from '../../types/appointment';
import { type Vehicle } from '../../services/vehicleService';
import { useNavigate } from 'react-router-dom';

export interface VehicleInfoProps {
  onNext: (data: VehicleData) => void;
  onBack: () => void;
}

interface VehicleFormData {
  vehicleInfo: string;
  versionModel: string;
  color: string;
  numberPlate: string;
  kilometers: string;
  optionalNotes: string;
  image: File | null;
}

const VehicleInfo: React.FC<VehicleInfoProps> = ({ onNext, onBack }) => {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const navigate = useNavigate();
  const [formData, setFormData] = useState<VehicleFormData>({
    vehicleInfo: '',
    versionModel: '',
    color: '',
    numberPlate: '',
    kilometers: '',
    optionalNotes: '',
    image: null,
  });
  const [errors, setErrors] = useState<Partial<VehicleFormData>>({});

  const handleInputChange = (field: keyof VehicleFormData, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        image: e.target.files[0],
      });
    }
  };

  const handleContinue = () => {
    // Validate required fields
    const newErrors: Partial<VehicleFormData> = {};
    
    if (!formData.vehicleInfo.trim()) {
      newErrors.vehicleInfo = 'Vehicle name is required';
    }
    
    if (!formData.versionModel.trim()) {
      newErrors.versionModel = 'Version/Model is required';
    }
    
    if (!formData.color.trim()) {
      newErrors.color = 'Color is required';
    }
    
    if (!formData.numberPlate.trim()) {
      newErrors.numberPlate = 'Number plate is required';
    }
    
    if (!formData.kilometers.trim()) {
      newErrors.kilometers = 'Kilometers run is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Clear any existing errors if validation passes
    setErrors({});
    onNext(formData);
  };

  const handleBackClick = () => {
    navigate('/user/dashboard');
  };

  // Load vehicle data from localStorage when component mounts
  useEffect(() => {
    const storedVehicle = localStorage.getItem('selectedVehicle');
    if (storedVehicle) {
      try {
        const vehicleData = JSON.parse(storedVehicle) as Vehicle;
        setSelectedVehicle(vehicleData);
        // Auto-fill form with vehicle data
        setFormData(prev => ({
          ...prev,
          vehicleInfo: vehicleData.name || '',
          versionModel: vehicleData.version || '',
          color: vehicleData.color || '',
          numberPlate: vehicleData.plateNumber || '',
          kilometers: vehicleData.mileage ? vehicleData.mileage.toString() : '',
          // Keep optionalNotes and image as they were (empty/default)
        }));
      } catch (error) {
        console.error('Error parsing vehicle data:', error);
      }
    }
  }, []);

  // Cleanup localStorage when component unmounts
  useEffect(() => {
    return () => {
      localStorage.removeItem('selectedVehicle');
    };
  }, []);

  return (
    <>
      <div className="vehicle-info-main">
        <p style={{ fontWeight: "700", fontSize: "20px", marginTop: "-15px" }}>Vehicle Information</p>
        
        {/* Show notification if form was auto-filled */}
        {selectedVehicle && (
          <div style={{ 
            background: '#e8f5e9', 
            padding: '8px 12px', 
            borderRadius: '6px', 
            marginBottom: '15px',
            fontSize: '14px',
            color: '#2e7d32',
            border: '1px solid #c8e6c9'
          }}>
            ✓ Form auto-filled from your vehicle: <strong>{selectedVehicle.name}</strong> ({selectedVehicle.plateNumber})
          </div>
        )}
        
        <div className="vehicle-info-first">
          <div className="vehicle-info-first-first">
            <p className="vehicle-info-title"> Vehicle Name</p>
            <input
              type="text"
              className={`vehicle-info-input ${errors.vehicleInfo ? 'error' : ''}`}
              placeholder="e.g., Honda Activa 6G"
              value={formData.vehicleInfo}
              onChange={(e) => handleInputChange('vehicleInfo', e.target.value)}
            />
            {errors.vehicleInfo && <div className="error-message">{errors.vehicleInfo}</div>}
          </div>
          <div className="vehicle-info-first-second">
            <p className="vehicle-info-title"> Version / Model</p>
            <input
              type="text"
              className={`vehicle-info-input ${errors.versionModel ? 'error' : ''}`}
              placeholder="e.g., BS6 / 2023"
              value={formData.versionModel}
              onChange={(e) => handleInputChange('versionModel', e.target.value)}
            />
            {errors.versionModel && <div className="error-message">{errors.versionModel}</div>}
          </div>
        </div>
        <div className="vehicle-info-first">
          <div className="vehicle-info-first-first">
            <p className="vehicle-info-title"> Color</p>
            <input
              type="text"
              className={`vehicle-info-input ${errors.color ? 'error' : ''}`}
              placeholder="e.g., Red, Maroon, Blue, Black"
              value={formData.color}
              onChange={(e) => handleInputChange('color', e.target.value)}
            />
            {errors.color && <div className="error-message">{errors.color}</div>}
          </div>
          <div className="vehicle-info-first-second">
            <p className="vehicle-info-title"> Number Plate</p>
            <input
              type="text"
              className={`vehicle-info-input ${errors.numberPlate ? 'error' : ''}`}
              placeholder="e.g., Ba 6 Pa 9049"
              value={formData.numberPlate}
              onChange={(e) => handleInputChange('numberPlate', e.target.value)}
            />
            {errors.numberPlate && <div className="error-message">{errors.numberPlate}</div>}
          </div>
        </div>
        <div className="vehicle-info-first-second">
          <p className="vehicle-info-title"> Kilometers Run</p>
          <input
            type="text"
            className={`vehicle-info-input2 ${errors.kilometers ? 'error' : ''}`}
            placeholder="e.g.g., 16720 km"
            value={formData.kilometers}
            onChange={(e) => handleInputChange('kilometers', e.target.value)}
          />
          {errors.kilometers && <div className="error-message">{errors.kilometers}</div>}
        </div>
        <div className="vehicle-info-first-second">
          <p className="vehicle-info-title"> Optional Notes</p>
          <textarea
            className="vehicle-info-input3"
            placeholder="Do you have any specific issues with your vehicle?"
            value={formData.optionalNotes}
            onChange={(e) => handleInputChange('optionalNotes', e.target.value)}
          />
        </div>
        <div className="vehicle-info-first-second">
          <p className="vehicle-info-title">Upload Image (Optional)</p>
          <label className="vehicle-upload-box">
            <span className="vehicle-upload-text">
              Upload a file or drag and drop<br />
              <span className="vehicle-upload-subtext">PNG, JPG, GIF up to 10MB</span>
            </span>
            <input
              type="file"
              accept="image/png, image/jpeg, image/gif"
              className="vehicle-upload-input"
              onChange={handleFileChange}
            />
          </label>
        </div>
        <div className="vehicle-info-last-button">
          <button className="vehicle-info-back" onClick={handleBackClick}>Back</button>
          <button className="vehicle-info-continue" onClick={handleContinue}>Continue</button>
        </div>
      </div>
    </>
  );
}

export default VehicleInfo;