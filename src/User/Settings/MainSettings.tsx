import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLock,
  faBell,
  faEye,
  faEyeSlash,
  faSave,
  faPalette,
  faShieldAlt,
  faEnvelope,
  faCheck,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './MainSettings.css';

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  appointmentReminders: boolean;
  promotionalEmails: boolean;
  serviceUpdates: boolean;
}

const MainSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'password' | 'notifications' | 'privacy' | 'appearance'>('password');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    appointmentReminders: true,
    promotionalEmails: false,
    serviceUpdates: true
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    dataSharing: false
  });

  const [appearance, setAppearance] = useState({
    theme: localStorage.getItem('theme') || 'light',
    fontSize: 'medium'
  });

  // Load saved settings on mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notificationSettings');
    if (savedNotifications) {
      setNotificationSettings(JSON.parse(savedNotifications));
    }

    const savedPrivacy = localStorage.getItem('privacySettings');
    if (savedPrivacy) {
      setPrivacySettings(JSON.parse(savedPrivacy));
    }

    const savedAppearance = localStorage.getItem('appearanceSettings');
    if (savedAppearance) {
      setAppearance(JSON.parse(savedAppearance));
    }
  }, []);

  // Handle password change
  const handleChangePassword = async () => {
    // Validate passwords
    if (!passwordData.currentPassword) {
      toast.error('Please enter your current password');
      return;
    }

    if (!passwordData.newPassword) {
      toast.error('Please enter a new password');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      toast.error('New password must be different from current password');
      return;
    }

    try {
      setLoading(true);
      // TODO: Add API call to change password
      // await axiosInstance.post('/auth/change-password', {
      //   currentPassword: passwordData.currentPassword,
      //   newPassword: passwordData.newPassword
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  // Handle notification settings change
  const handleNotificationChange = (key: keyof NotificationSettings) => {
    const updated = {
      ...notificationSettings,
      [key]: !notificationSettings[key]
    };
    setNotificationSettings(updated);
    localStorage.setItem('notificationSettings', JSON.stringify(updated));
    toast.success('Notification settings updated');
  };

  // Handle privacy settings change
  const handlePrivacyChange = (key: string, value: any) => {
    const updated = {
      ...privacySettings,
      [key]: value
    };
    setPrivacySettings(updated);
    localStorage.setItem('privacySettings', JSON.stringify(updated));
  };

  // Handle appearance change
  const handleAppearanceChange = (key: string, value: string) => {
    const updated = {
      ...appearance,
      [key]: value
    };
    setAppearance(updated);
    localStorage.setItem('appearanceSettings', JSON.stringify(updated));
    localStorage.setItem(key, value);

    if (key === 'theme') {
      document.documentElement.setAttribute('data-theme', value);
    }

    toast.success('Appearance settings updated');
  };

  const tabs = [
    { id: 'password', label: 'Password', icon: faLock },
    { id: 'notifications', label: 'Notifications', icon: faBell },
    { id: 'privacy', label: 'Privacy', icon: faShieldAlt },
    { id: 'appearance', label: 'Appearance', icon: faPalette }
  ];

  return (
    <div className="settings-container">
      <div className="settings-card">
        {/* Header */}
        <div className="settings-header">
          <h1>Settings</h1>
          <p>Manage your account settings and preferences</p>
        </div>

        {/* Tabs */}
        <div className="settings-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id as any)}
            >
              <FontAwesomeIcon icon={tab.icon} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="settings-content">
          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="settings-section">
              <div className="settings-section-header">
                <h2>
                  <FontAwesomeIcon icon={faLock} />
                  Change Password
                </h2>
              </div>

              <div className="settings-form">
                <div className="settings-form-group">
                  <label className="settings-label">Current Password</label>
                  <div className="settings-password-input">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      className="settings-toggle-password"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      <FontAwesomeIcon icon={showCurrentPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                </div>

                <div className="settings-form-group">
                  <label className="settings-label">New Password</label>
                  <div className="settings-password-input">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      className="settings-toggle-password"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                  <div className="settings-password-requirements">
                    <p className={passwordData.newPassword.length >= 6 ? 'valid' : ''}>
                      <FontAwesomeIcon icon={faCheck} /> At least 6 characters
                    </p>
                  </div>
                </div>

                <div className="settings-form-group">
                  <label className="settings-label">Confirm New Password</label>
                  <div className="settings-password-input">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      className="settings-toggle-password"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                  {passwordData.confirmPassword && (
                    <p className={`settings-match-status ${passwordData.newPassword === passwordData.confirmPassword ? 'match' : 'no-match'}`}>
                      <FontAwesomeIcon icon={passwordData.newPassword === passwordData.confirmPassword ? faCheck : faTimes} />
                      {passwordData.newPassword === passwordData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                    </p>
                  )}
                </div>

                <button
                  className="settings-btn settings-btn-primary"
                  onClick={handleChangePassword}
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faSave} />
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="settings-section">
              <div className="settings-section-header">
                <h2>
                  <FontAwesomeIcon icon={faBell} />
                  Notification Preferences
                </h2>
                <p>Choose how you want to be notified</p>
              </div>

              <div className="settings-options-grid">
                <div className="settings-option-card">
                  <div className="settings-option-icon" style={{ background: '#e3f2fd' }}>
                    <FontAwesomeIcon icon={faEnvelope} style={{ color: '#2196f3' }} />
                  </div>
                  <div className="settings-option-content">
                    <h3>Email Notifications</h3>
                    <p>Receive updates and notifications via email</p>
                  </div>
                  <label className="settings-toggle">
                    <input
                      type="checkbox"
                      checked={notificationSettings.emailNotifications}
                      onChange={() => handleNotificationChange('emailNotifications')}
                    />
                    <span className="settings-toggle-slider"></span>
                  </label>
                </div>

                <div className="settings-option-card">
                  <div className="settings-option-icon" style={{ background: '#e8f5e9' }}>
                    <FontAwesomeIcon icon={faBell} style={{ color: '#4caf50' }} />
                  </div>
                  <div className="settings-option-content">
                    <h3>Push Notifications</h3>
                    <p>Get instant notifications on your device</p>
                  </div>
                  <label className="settings-toggle">
                    <input
                      type="checkbox"
                      checked={notificationSettings.pushNotifications}
                      onChange={() => handleNotificationChange('pushNotifications')}
                    />
                    <span className="settings-toggle-slider"></span>
                  </label>
                </div>

                <div className="settings-option-card">
                  <div className="settings-option-icon" style={{ background: '#fff3e0' }}>
                    <FontAwesomeIcon icon={faBell} style={{ color: '#ff9800' }} />
                  </div>
                  <div className="settings-option-content">
                    <h3>Appointment Reminders</h3>
                    <p>Never miss your scheduled appointments</p>
                  </div>
                  <label className="settings-toggle">
                    <input
                      type="checkbox"
                      checked={notificationSettings.appointmentReminders}
                      onChange={() => handleNotificationChange('appointmentReminders')}
                    />
                    <span className="settings-toggle-slider"></span>
                  </label>
                </div>

                <div className="settings-option-card">
                  <div className="settings-option-icon" style={{ background: '#f3e5f5' }}>
                    <FontAwesomeIcon icon={faEnvelope} style={{ color: '#9c27b0' }} />
                  </div>
                  <div className="settings-option-content">
                    <h3>Service Updates</h3>
                    <p>Get updates about your service status</p>
                  </div>
                  <label className="settings-toggle">
                    <input
                      type="checkbox"
                      checked={notificationSettings.serviceUpdates}
                      onChange={() => handleNotificationChange('serviceUpdates')}
                    />
                    <span className="settings-toggle-slider"></span>
                  </label>
                </div>

                <div className="settings-option-card">
                  <div className="settings-option-icon" style={{ background: '#fce4ec' }}>
                    <FontAwesomeIcon icon={faGift} style={{ color: '#e91e63' }} />
                  </div>
                  <div className="settings-option-content">
                    <h3>Promotional Emails</h3>
                    <p>Receive offers and promotional content</p>
                  </div>
                  <label className="settings-toggle">
                    <input
                      type="checkbox"
                      checked={notificationSettings.promotionalEmails}
                      onChange={() => handleNotificationChange('promotionalEmails')}
                    />
                    <span className="settings-toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="settings-section">
              <div className="settings-section-header">
                <h2>
                  <FontAwesomeIcon icon={faShieldAlt} />
                  Privacy Settings
                </h2>
                <p>Control your privacy and data sharing preferences</p>
              </div>

              <div className="settings-form">
                <div className="settings-form-group">
                  <label className="settings-label">Profile Visibility</label>
                  <select
                    className="settings-select"
                    value={privacySettings.profileVisibility}
                    onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                  >
                    <option value="public">Public - Anyone can see your profile</option>
                    <option value="private">Private - Only you can see your profile</option>
                    <option value="friends">Friends Only - Only friends can see your profile</option>
                  </select>
                </div>

                <div className="settings-option-card">
                  <div className="settings-option-content">
                    <h3>Show Email Address</h3>
                    <p>Display your email on your public profile</p>
                  </div>
                  <label className="settings-toggle">
                    <input
                      type="checkbox"
                      checked={privacySettings.showEmail}
                      onChange={(e) => handlePrivacyChange('showEmail', e.target.checked)}
                    />
                    <span className="settings-toggle-slider"></span>
                  </label>
                </div>

                <div className="settings-option-card">
                  <div className="settings-option-content">
                    <h3>Show Phone Number</h3>
                    <p>Display your phone number on your public profile</p>
                  </div>
                  <label className="settings-toggle">
                    <input
                      type="checkbox"
                      checked={privacySettings.showPhone}
                      onChange={(e) => handlePrivacyChange('showPhone', e.target.checked)}
                    />
                    <span className="settings-toggle-slider"></span>
                  </label>
                </div>

                <div className="settings-option-card">
                  <div className="settings-option-content">
                    <h3>Data Sharing</h3>
                    <p>Allow anonymized data sharing for service improvement</p>
                  </div>
                  <label className="settings-toggle">
                    <input
                      type="checkbox"
                      checked={privacySettings.dataSharing}
                      onChange={(e) => handlePrivacyChange('dataSharing', e.target.checked)}
                    />
                    <span className="settings-toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="settings-section">
              <div className="settings-section-header">
                <h2>
                  <FontAwesomeIcon icon={faPalette} />
                  Appearance Settings
                </h2>
                <p>Customize how Servicify looks for you</p>
              </div>

              <div className="settings-form">
                <div className="settings-form-group">
                  <label className="settings-label">Theme</label>
                  <div className="settings-theme-options">
                    <button
                      className={`settings-theme-btn ${appearance.theme === 'light' ? 'active' : ''}`}
                      onClick={() => handleAppearanceChange('theme', 'light')}
                    >
                      <span className="settings-theme-icon">☀️</span>
                      <span>Light</span>
                    </button>
                    <button
                      className={`settings-theme-btn ${appearance.theme === 'dark' ? 'active' : ''}`}
                      onClick={() => handleAppearanceChange('theme', 'dark')}
                    >
                      <span className="settings-theme-icon">🌙</span>
                      <span>Dark</span>
                    </button>
                    <button
                      className={`settings-theme-btn ${appearance.theme === 'auto' ? 'active' : ''}`}
                      onClick={() => handleAppearanceChange('theme', 'auto')}
                    >
                      <span className="settings-theme-icon">⚙️</span>
                      <span>Auto</span>
                    </button>
                  </div>
                </div>

                <div className="settings-form-group">
                  <label className="settings-label">Font Size</label>
                  <div className="settings-font-options">
                    <button
                      className={`settings-font-btn ${appearance.fontSize === 'small' ? 'active' : ''}`}
                      onClick={() => handleAppearanceChange('fontSize', 'small')}
                    >
                      A
                    </button>
                    <button
                      className={`settings-font-btn ${appearance.fontSize === 'medium' ? 'active' : ''}`}
                      onClick={() => handleAppearanceChange('fontSize', 'medium')}
                    >
                      A
                    </button>
                    <button
                      className={`settings-font-btn ${appearance.fontSize === 'large' ? 'active' : ''}`}
                      onClick={() => handleAppearanceChange('fontSize', 'large')}
                    >
                      A
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainSettings;
