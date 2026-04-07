import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserCircle,
  faCamera,
  faTrash,
  faSave,
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
  faEdit,
  faTimes,
  faCheck
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as ProfileService from '../services/Profile';
import type { UserProfile } from '../services/Profile';
import './MyProfile.css';

const MyProfile: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    name: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user profile
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await ProfileService.getProfile();
      // The backend returns profilePictureUrl in the response data
      setUser(response.data);
      setEditedData({
        name: response.data.name || '',
        phone: response.data.phone || '',
        address: {
          street: response.data.address?.street || '',
          city: response.data.address?.city || '',
          state: response.data.address?.state || '',
          zipCode: response.data.address?.zipCode || ''
        }
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  // Handle profile picture upload
  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, JPG, PNG, GIF, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      const response = await ProfileService.uploadProfilePicture(file);
      // Update user with the new profile picture URL
      setUser(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          profilePictureUrl: response.profilePictureUrl
        };
      });
      // Dispatch event to notify other components (like UserSideTop)
      window.dispatchEvent(new CustomEvent('profilePictureUpdated', { detail: { url: response.profilePictureUrl } }));
      toast.success('Profile picture updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload profile picture');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle delete profile picture
  const handleDeleteProfilePicture = async () => {
    if (!window.confirm('Are you sure you want to delete your profile picture?')) {
      return;
    }

    try {
      await ProfileService.deleteProfilePicture();
      setUser(prev => prev ? { ...prev, profilePictureUrl: undefined, profilePicture: undefined } : null);
      toast.success('Profile picture deleted successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete profile picture');
    }
  };

  // Handle edit mode
  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    if (user) {
      setEditedData({
        name: user.name || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zipCode: user.address?.zipCode || ''
        }
      });
    }
  };

  // Handle save profile
  const handleSave = async () => {
    try {
      const response = await ProfileService.updateProfile(editedData);
      setUser(response.data);
      setEditing(false);
      toast.success('Profile updated successfully!');

      // Update localStorage
      if (response.data.name) {
        localStorage.setItem('userName', response.data.name);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setEditedData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setEditedData(prev => ({ ...prev, [name]: value }));
    }
  };

  if (loading) {
    return (
      <div className="myprofile-container">
        <div className="myprofile-loading">
          <div className="myprofile-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="myprofile-container">
      <div className="myprofile-card">
        {/* Profile Header */}
        <div className="myprofile-header">
          <h1>My Profile</h1>
          <p>Manage your personal information and settings</p>
        </div>

        {/* Profile Picture Section */}
        <div className="myprofile-picture-section">
          <div className="myprofile-picture-wrapper">
            {user?.profilePictureUrl ? (
              <img
                src={user.profilePictureUrl}
                alt="Profile"
                className="myprofile-picture"
              />
            ) : (
              <div className="myprofile-picture-placeholder">
                <FontAwesomeIcon icon={faUserCircle} />
              </div>
            )}

            {uploading && (
              <div className="myprofile-upload-overlay">
                <div className="myprofile-upload-spinner"></div>
              </div>
            )}
          </div>

          <div className="myprofile-picture-actions">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleProfilePictureChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <button
              className="myprofile-btn myprofile-btn-upload"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <FontAwesomeIcon icon={faCamera} />
              {user?.profilePicture ? 'Change Photo' : 'Upload Photo'}
            </button>
            {user?.profilePicture && (
              <button
                className="myprofile-btn myprofile-btn-delete"
                onClick={handleDeleteProfilePicture}
                disabled={uploading}
              >
                <FontAwesomeIcon icon={faTrash} />
                Remove
              </button>
            )}
          </div>
        </div>

        {/* Profile Information */}
        <div className="myprofile-info-section">
          <div className="myprofile-info-header">
            <h2>Personal Information</h2>
            {!editing ? (
              <button className="myprofile-btn myprofile-btn-edit" onClick={handleEdit}>
                <FontAwesomeIcon icon={faEdit} />
                Edit Profile
              </button>
            ) : (
              <div className="myprofile-edit-actions">
                <button className="myprofile-btn myprofile-btn-cancel" onClick={handleCancel}>
                  <FontAwesomeIcon icon={faTimes} />
                  Cancel
                </button>
                <button className="myprofile-btn myprofile-btn-save" onClick={handleSave}>
                  <FontAwesomeIcon icon={faSave} />
                  Save Changes
                </button>
              </div>
            )}
          </div>

          <div className="myprofile-info-grid">
            {/* Name */}
            <div className="myprofile-info-group">
              <label className="myprofile-info-label">
                <FontAwesomeIcon icon={faUserCircle} />
                Full Name
              </label>
              {editing ? (
                <input
                  type="text"
                  name="name"
                  value={editedData.name}
                  onChange={handleInputChange}
                  className="myprofile-input"
                />
              ) : (
                <p className="myprofile-info-value">{user?.name || 'Not set'}</p>
              )}
            </div>

            {/* Email */}
            <div className="myprofile-info-group">
              <label className="myprofile-info-label">
                <FontAwesomeIcon icon={faEnvelope} />
                Email Address
              </label>
              <p className="myprofile-info-value">{user?.email}</p>
              <span className="myprofile-info-note">Email cannot be changed</span>
            </div>

            {/* Phone */}
            <div className="myprofile-info-group">
              <label className="myprofile-info-label">
                <FontAwesomeIcon icon={faPhone} />
                Phone Number
              </label>
              {editing ? (
                <input
                  type="tel"
                  name="phone"
                  value={editedData.phone}
                  onChange={handleInputChange}
                  className="myprofile-input"
                  placeholder="Enter phone number"
                />
              ) : (
                <p className="myprofile-info-value">{user?.phone || 'Not set'}</p>
              )}
            </div>

            {/* Address - Street */}
            <div className="myprofile-info-group myprofile-info-group-full">
              <label className="myprofile-info-label">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                Street Address
              </label>
              {editing ? (
                <input
                  type="text"
                  name="address.street"
                  value={editedData.address.street}
                  onChange={handleInputChange}
                  className="myprofile-input"
                  placeholder="Enter street address"
                />
              ) : (
                <p className="myprofile-info-value">{user?.address?.street || 'Not set'}</p>
              )}
            </div>

            {/* Address - City */}
            <div className="myprofile-info-group">
              <label className="myprofile-info-label">City</label>
              {editing ? (
                <input
                  type="text"
                  name="address.city"
                  value={editedData.address.city}
                  onChange={handleInputChange}
                  className="myprofile-input"
                  placeholder="Enter city"
                />
              ) : (
                <p className="myprofile-info-value">{user?.address?.city || 'Not set'}</p>
              )}
            </div>

            {/* Address - State */}
            <div className="myprofile-info-group">
              <label className="myprofile-info-label">State</label>
              {editing ? (
                <input
                  type="text"
                  name="address.state"
                  value={editedData.address.state}
                  onChange={handleInputChange}
                  className="myprofile-input"
                  placeholder="Enter state"
                />
              ) : (
                <p className="myprofile-info-value">{user?.address?.state || 'Not set'}</p>
              )}
            </div>

            {/* Address - ZIP Code */}
            <div className="myprofile-info-group">
              <label className="myprofile-info-label">ZIP Code</label>
              {editing ? (
                <input
                  type="text"
                  name="address.zipCode"
                  value={editedData.address.zipCode}
                  onChange={handleInputChange}
                  className="myprofile-input"
                  placeholder="Enter ZIP code"
                />
              ) : (
                <p className="myprofile-info-value">{user?.address?.zipCode || 'Not set'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="myprofile-account-section">
          <h2>Account Information</h2>
          <div className="myprofile-account-grid">
            <div className="myprofile-account-item">
              <span className="myprofile-account-label">Account Type</span>
              <span className={`myprofile-account-badge myprofile-badge-${user?.role}`}>
                {user?.role === 'admin' ? 'Administrator' : 'Regular User'}
              </span>
            </div>
            <div className="myprofile-account-item">
              <span className="myprofile-account-label">Member Since</span>
              <span className="myprofile-account-value">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'N/A'}
              </span>
            </div>
            <div className="myprofile-account-item">
              <span className="myprofile-account-label">Verification Status</span>
              <span className={`myprofile-verification-badge ${user?.isVerified ? 'verified' : 'unverified'}`}>
                <FontAwesomeIcon icon={user?.isVerified ? faCheck : faTimes} />
                {user?.isVerified ? 'Verified' : 'Unverified'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
