import { useState } from 'react';
import './VehicleInfo.css';
import type { VehicleData } from '../types/appointment';

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
  const [formData, setFormData] = useState<VehicleFormData>({
    vehicleInfo: '',
    versionModel: '',
    color: '',
    numberPlate: '',
    kilometers: '',
    optionalNotes: '',
    image: null,
  });

  const handleInputChange = (field: keyof VehicleFormData, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
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
    onNext(formData);
  };

  const handleBackClick = () => {
    onBack();
  };

  return (
    <>
      <div className="vehicle-info-main">
        <p style={{ fontWeight: "700", fontSize: "20px", marginTop: "-15px" }}>Vehicle Information</p>
        <div className="vehicle-info-first">
          <div className="vehicle-info-first-first">
            <p className="vehicle-info-title"> Vehicle Info</p>
            <input
              type="text"
              className="vehicle-info-input"
              placeholder="e.g., Honda Activa 6G"
              value={formData.vehicleInfo}
              onChange={(e) => handleInputChange('vehicleInfo', e.target.value)}
            />
          </div>
          <div className="vehicle-info-first-second">
            <p className="vehicle-info-title"> Version / Model</p>
            <input
              type="text"
              className="vehicle-info-input"
              placeholder="e.g., BS6 / 2023"
              value={formData.versionModel}
              onChange={(e) => handleInputChange('versionModel', e.target.value)}
            />
          </div>
        </div>
        <div className="vehicle-info-first">
          <div className="vehicle-info-first-first">
            <p className="vehicle-info-title"> Color</p>
            <input
              type="text"
              className="vehicle-info-input"
              placeholder="e.g., Red, Maroon, Blue, Black"
              value={formData.color}
              onChange={(e) => handleInputChange('color', e.target.value)}
            />
          </div>
          <div className="vehicle-info-first-second">
            <p className="vehicle-info-title"> Number Plate</p>
            <input
              type="text"
              className="vehicle-info-input"
              placeholder="e.g., Ba 6 Pa 9049"
              value={formData.numberPlate}
              onChange={(e) => handleInputChange('numberPlate', e.target.value)}
            />
          </div>
        </div>
        <div className="vehicle-info-first-second">
          <p className="vehicle-info-title"> Kilometers Run</p>
          <input
            type="text"
            className="vehicle-info-input2"
            placeholder="e.g., 16720 km"
            value={formData.kilometers}
            onChange={(e) => handleInputChange('kilometers', e.target.value)}
          />
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