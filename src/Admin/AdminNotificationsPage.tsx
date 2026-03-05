import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import {
  getAdminNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  type AdminNotification
} from '../services/adminNotificationService';
import {
  FaBell,
  FaCalendarAlt,
  FaTools,
  FaTimesCircle,
  FaCreditCard,
  FaInfoCircle,
  FaTrash,
  FaCheck,
  FaFilter
} from 'react-icons/fa';
import './AdminNotificationsPage.css';

const AdminNotificationsPage = () => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  // const navigate = useNavigate();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await getAdminNotifications();
      if (response.success && response.notifications) {
        setNotifications(response.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment':
      case 'booking':
        return <FaCalendarAlt />;
      case 'service':
        return <FaTools />;
      case 'cancellation':
        return <FaTimesCircle />;
      case 'payment':
        return <FaCreditCard />;
      default:
        return <FaInfoCircle />;
    }
  };

  const getNotificationColor = (type: string) => {
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : filter === 'unread'
      ? notifications.filter(n => !n.read)
      : notifications.filter(n => n.type === filter);

  return (
    <>
      <Sidebar />
      <div className="admin-notifications-page">
        <div className="notifications-page-header">
          <div className="header-left">
            <h1>
              <FaBell className="header-icon" />
              Notifications
            </h1>
            <p>Stay updated with your service center activities</p>
          </div>
          <div className="header-actions">
            <div className="filter-container">
              <FaFilter className="filter-icon" />
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="booking">Bookings</option>
                <option value="appointment">Appointments</option>
                <option value="service">Services</option>
                <option value="payment">Payments</option>
                <option value="cancellation">Cancellations</option>
              </select>
            </div>
            <button 
              className="mark-all-btn"
              onClick={handleMarkAllAsRead}
              disabled={notifications.filter(n => !n.read).length === 0}
            >
              <FaCheck /> Mark All Read
            </button>
          </div>
        </div>

        <div className="notifications-list-container">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="empty-state">
              <FaBell size={60} color="#ccc" />
              <h3>No notifications</h3>
              <p>
                {filter === 'unread' 
                  ? 'All notifications have been read' 
                  : filter === 'all'
                    ? "You don't have any notifications yet"
                    : `No ${filter} notifications`}
              </p>
            </div>
          ) : (
            <div className="notifications-grid">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`notification-card ${!notification.read ? 'unread' : ''}`}
                >
                  <div className="card-header">
                    <div 
                      className="card-icon"
                      style={{ backgroundColor: `${getNotificationColor(notification.type)}20` }}
                    >
                      <div 
                        className="card-icon-inner"
                        style={{ color: getNotificationColor(notification.type) }}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>
                    <div className="card-status">
                      {!notification.read && <span className="unread-badge">New</span>}
                      <span className="notification-type">{notification.type}</span>
                    </div>
                  </div>

                  <div className="card-content">
                    <h3 className="card-title">{notification.title}</h3>
                    <p className="card-message">{notification.message}</p>
                    {notification.metadata?.appointmentId && (
                      <p className="card-meta">
                        Appointment ID: #{notification.metadata.appointmentId}
                      </p>
                    )}
                    {notification.metadata?.serviceType && (
                      <p className="card-meta">
                        Service: {notification.metadata.serviceType}
                      </p>
                    )}
                  </div>

                  <div className="card-footer">
                    <span className="card-time">{formatTime(notification.createdAt)}</span>
                    <div className="card-actions">
                      {!notification.read && (
                        <button
                          className="btn-read"
                          onClick={() => handleMarkAsRead(notification._id)}
                        >
                          <FaCheck /> Mark Read
                        </button>
                      )}
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(notification._id)}
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminNotificationsPage;
