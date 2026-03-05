import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAdminNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../services/adminNotificationService.js';
import {
  FaBell,
  FaCalendarAlt,
  FaTools,
  FaCheckCircle,
  FaTimesCircle,
  FaCreditCard,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTrash,
  FaCheck
} from 'react-icons/fa';
import './AdminNotifications.css';

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const [notificationsData, countData] = await Promise.all([
        getAdminNotifications(),
        getUnreadCount()
      ]);

      if (notificationsData.success) {
        setNotifications(notificationsData.notifications);
      }
      if (countData.success) {
        setUnreadCount(countData.count);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Mark as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      fetchNotifications();
      setShowDropdown(false);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Delete notification
  const handleDelete = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification._id);
    }
    
    // Navigate based on notification type
    if (notification.metadata?.link) {
      navigate(notification.metadata.link);
    }
    setShowDropdown(false);
  };

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment':
        return <FaCalendarAlt />;
      case 'service':
        return <FaTools />;
      case 'booking':
        return <FaCalendarAlt />;
      case 'cancellation':
        return <FaTimesCircle />;
      case 'payment':
        return <FaCreditCard />;
      default:
        return <FaInfoCircle />;
    }
  };

  // Get color based on notification type
  const getNotificationColor = (type) => {
    switch (type) {
      case 'appointment':
      case 'booking':
        return '#1976D2';
      case 'service':
        return '#F57C00';
      case 'cancellation':
        return '#C62828';
      case 'payment':
        return '#388E3C';
      default:
        return '#757575';
    }
  };

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="admin-notifications">
      {/* Notification Bell Icon */}
      <div 
        className="notification-bell" 
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <FaBell className="bell-icon" />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <>
          <div 
            className="notification-overlay" 
            onClick={() => setShowDropdown(false)}
          />
          <div className="notification-dropdown">
            <div className="notification-header">
              <h3>Notifications</h3>
              <div className="notification-actions">
                {unreadCount > 0 && (
                  <button 
                    className="mark-all-read" 
                    onClick={handleMarkAllAsRead}
                  >
                    <FaCheck /> Mark all read
                  </button>
                )}
              </div>
            </div>

            <div className="notification-list">
              {loading ? (
                <div className="notification-loading">
                  <p>Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="notification-empty">
                  <FaBell size={40} color="#ccc" />
                  <p>No notifications</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div 
                      className="notification-icon"
                      style={{ backgroundColor: `${getNotificationColor(notification.type)}20` }}
                    >
                      <div 
                        className="notification-icon-inner"
                        style={{ color: getNotificationColor(notification.type) }}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>
                    
                    <div className="notification-content">
                      <div className="notification-title">{notification.title}</div>
                      <div className="notification-message">{notification.message}</div>
                      <div className="notification-time">{formatTime(notification.createdAt)}</div>
                    </div>

                    <div className="notification-actions-right">
                      {!notification.read && <div className="unread-dot" />}
                      <button
                        className="delete-notification"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notification._id);
                        }}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="notification-footer">
                <button onClick={() => navigate('/admin/notifications')}>
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminNotifications;
