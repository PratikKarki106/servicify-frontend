import React, { useState, useEffect } from 'react'
import "./UserInfo.css";
import { useNavigate } from 'react-router-dom';

interface UserInfoProps {
  onSubmit: (data: UserFormData) => void;
  onBack: () => void;
  selectedService: string;
  timeSlot: {
    date: Date | null;
    time: string;
  };
  vehicle: {
    vehicleInfo: string;
    versionModel: string;
    color: string;
    numberPlate: string;
    kilometers: string;
    optionalNotes: string;
    image: File | null;
  };
}

interface UserFormData {
  fullName: string;
  phoneNumber: string;
  email: string;
  needPickup: boolean;
  pickupAddress: string;
}

interface UserProfile {
  name: string;
  email: string;
  contactNumber?: string;
}

const UserInfo: React.FC<UserInfoProps> = ({
  onSubmit,
  onBack,
  selectedService,
  timeSlot,
  vehicle
}) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserFormData>({
    fullName: '',
    phoneNumber: '',
    email: '',
    needPickup: false,
    pickupAddress: '',
  });
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile data from localStorage when component mounts
  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    const storedEmail = localStorage.getItem('userEmail');
    const storedContactNumber = localStorage.getItem('contactNumber'); // Check if contact number is stored
    
    if (storedName || storedEmail) {
      const profileData: UserProfile = {
        name: storedName || '',
        email: storedEmail || '',
        contactNumber: storedContactNumber || ''
      };
      
      setUserProfile(profileData);
      setUserData(prev => ({
        ...prev,
        fullName: profileData.name || '',
        email: profileData.email || '',
        phoneNumber: profileData.contactNumber || '', // Use stored contact number if available
      }));
    }
    
    setLoading(false);
  }, []);

  const handleInputChange = (field: keyof UserFormData, value: string | boolean) => {
    // Only allow phone number to be changed
    if (field === 'phoneNumber') {
      setUserData({
        ...userData,
        [field]: value as string,
      });
    } else if (field === 'needPickup') {
      setUserData({
        ...userData,
        [field]: value as boolean,
      });
    } else if (field === 'pickupAddress') {
      // Allow pickup-related fields to be changed
      setUserData({
        ...userData,
        [field]: value as string,
      });
    }
  };

  const handleToggle = () => {
    const newPickupStatus = !userData.needPickup;
    setUserData({
      ...userData,
      needPickup: newPickupStatus,
      pickupAddress: newPickupStatus ? userData.pickupAddress : '',
    });
  };

  const handleSubmit = () => {
    // Submit only the phone number and pickup-related data
    const submitData = {
      fullName: userProfile?.name || userData.fullName, // Use the original profile data
      phoneNumber: userData.phoneNumber,
      email: userProfile?.email || userData.email, // Use the original profile data
      needPickup: userData.needPickup,
      pickupAddress: userData.pickupAddress,
    };
    
    onSubmit(submitData);
    navigate('/user/dashboard');
  };

  const handleBackClick = () => {
    onBack();
  };

  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format time for display - time is already formatted as string like "10:00 AM"
  const formatTime = (time: string) => {
    return time;
  };

  if (loading) {
    return (
      <div className="user-info-main-container">
        <div className="user-info-container">
          <p style={{fontWeight: "700", fontSize: "20px", marginTop: "-15px" }}>Loading your information...</p>
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-info-main-container">
      <div className="user-info-container">
        <p style={{fontWeight: "700", fontSize: "20px", marginTop: "-15px" }}>Your Information</p>

        <div className="vehicle-info-first-second">
          <p className="vehicle-info-title">Full Name</p>
          <input
            type="text"
            className="vehicle-info-input2"
            placeholder="John Doe"
            value={userData.fullName}
            readOnly
            style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
          />
        </div>

        <div className="vehicle-info-first-second">
          <p className="vehicle-info-title">Phone Number</p>
          <input
            type="text"
            className="vehicle-info-input2"
            placeholder="+1 (555) 123-4567"
            value={userData.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
          />
        </div>

        <div className="vehicle-info-first-second">
          <p className="vehicle-info-title">Email</p>
          <input
            type="email"
            className="vehicle-info-input2"
            placeholder="you@example.com"
            value={userData.email}
            readOnly
            style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
          />
        </div>

        {/* Toggle button for Pickup Service */}
        <div className="pickup-toggle-container">
          <p className="vehicle-info-title">Need Pickup Service?</p>
          <div className="toggle-switch">
            <input
              type="checkbox"
              id="pickup-toggle"
              className="toggle-checkbox"
              checked={userData.needPickup}
              onChange={handleToggle}
            />
            <label htmlFor="pickup-toggle" className="toggle-label">
              <span className="toggle-inner" />
              <span className="toggle-switch-btn" />
            </label>
          </div>
        </div>

        {/* Pickup Address - only shown when toggle is ON */}
        {userData.needPickup && (
          <div className="vehicle-info-first-second">
            <p className="vehicle-info-title">Pickup Address</p>
            <textarea
              className="vehicle-info-input2 address-textarea"
              placeholder="123 Main Street, Anytown, USA 12345"
              value={userData.pickupAddress}
              onChange={(e) => handleInputChange('pickupAddress', e.target.value)}
              rows={3}
            />
          </div>
        )}

        <div className="vehicle-info-last-button">
          <button className="vehicle-info-back" onClick={handleBackClick}>Back</button>
          <button 
            className="vehicle-info-continue" 
            style={{backgroundColor: "#4CAF50"}}
            onClick={handleSubmit}
          >
            Confirm
          </button>
        </div>
      </div>
      
      <div className='side-main-container'>
        <p style={{fontWeight: "700", fontSize: "20px", marginTop: "-15px" }}>Appointment Summary</p>
        <div className='side-container'>
          <div className='side-container-title'>
            <p>Selected Service</p>
            <p>Date & Time</p>
            <p>Vehicle</p>
          </div>
          <div className='side-container-data'>
            <p>{selectedService}</p>
            <p>
              {timeSlot.date ? 
                `${formatDate(timeSlot.date)} | ${formatTime(timeSlot.time)}` 
                : 'Not selected'}
            </p>
            <p>{vehicle.vehicleInfo || 'Not specified'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserInfo;