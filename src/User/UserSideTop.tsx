import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './UserSideTop.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTachometerAlt,
  faCalendarAlt,
  faMapMarkerAlt,
  faBoxOpen,
  faGift,
  faHistory,
  faSignOutAlt,
  faBars,
  faTimes,
  faBell,
  faUserCircle,
  faUser,
  faCog,
  faComments,
  faChartBar
} from '@fortawesome/free-solid-svg-icons';
import { notificationService } from '../services/notifications';
import type{  Notification } from '../services/notifications';
import Servicify from '../assets/Servicify.png';
import UserMessagesPage from './UserMessagesPage';
import * as ProfileService from '../services/Profile';

interface NavItem {
  id: string;
  name: string;
  icon: any;
  path: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', name: 'Dashboard', icon: faTachometerAlt, path: '/user/dashboard' },
  { id: 'book-appointment', name: 'Book Appointment', icon: faCalendarAlt, path: '/book-appointment' },
  { id: 'analytics', name: 'Analytics', icon: faChartBar, path: '/user/analytics' },
  { id: 'track-service', name: 'Track Service', icon: faMapMarkerAlt, path: '/track-service' },
  { id: 'catalogue', name: 'Catalogue', icon: faBoxOpen, path: '/catalog' },
  { id: 'package', name: 'Packages', icon: faGift, path: '/user/packages' },
  { id: 'history', name: 'History', icon: faHistory, path: '/user/history' },
  { id: 'messages', name: 'Messages', icon: faComments, path: '/user/messages' },
];

interface UserSideTopProps {
  children: React.ReactNode;
  userName?: string;
  email?: string;
}

const UserSideTop: React.FC<UserSideTopProps> = ({
  children,
  userName = localStorage.getItem('userName') || 'User',
  email = localStorage.getItem('userEmail'),
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);

  // Fetch user profile picture
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await ProfileService.getProfile();
        if (response.data?.profilePictureUrl) {
          setProfilePictureUrl(response.data.profilePictureUrl);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };
    fetchProfile();

    // Listen for profile picture updates
    const handleProfileUpdate = (event: CustomEvent) => {
      if (event.detail?.url) {
        setProfilePictureUrl(event.detail.url);
      }
    };

    window.addEventListener('profilePictureUpdated', handleProfileUpdate as EventListener);

    return () => {
      window.removeEventListener('profilePictureUpdated', handleProfileUpdate as EventListener);
    };
  }, []);

  // Check if we're on the messages page
  const isMessagesPage = location.pathname === '/user/messages';

  // Get user ID from localStorage
  const userId = localStorage.getItem('userId');

  // Fetch notifications when component mounts or when showNotifications changes
  useEffect(() => {
    const fetchNotifications = async () => {
      if (userId) {
        try {
          setLoading(true);
          const response = await notificationService.getNotifications(Number(userId));
          if (response.success) {
            setNotifications(response.notifications);
            // Calculate unread count
            const unread = response.notifications.filter(n => !n.read).length;
            setUnreadCount(unread);
          }
        } catch (error) {
          console.error('Error fetching notifications:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (showNotifications) {
      fetchNotifications();
    }
  }, [showNotifications, userId]);

  // Fetch unread count separately to update badge
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (userId) {
        try {
          const response = await notificationService.getUnreadCount(Number(userId));
          if (response.success) {
            setUnreadCount(response.count);
          }
        } catch (error) {
          console.error('Error fetching unread count:', error);
        }
      }
    };

    // Fetch initially and set up interval to refresh every 30 seconds
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, [userId]);

  // Close mobile sidebar on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileSidebarOpen(false);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      // Add your logout logic here
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      navigate('/signin');
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark notification as read
    if (!notification.read) {
      notificationService.markAsRead(notification._id)
        .then(response => {
          if (response.success) {
            // Update local state
            setNotifications(prev =>
              prev.map(n =>
                n._id === notification._id ? {...n, read: true} : n
              )
            );
            setUnreadCount(prev => prev - 1);
          }
        })
        .catch(error => {
          console.error('Error marking notification as read:', error);
        });
    }

    // Navigate to the linked page if available
    if (notification.metadata?.link) {
      navigate(notification.metadata.link);
      setShowNotifications(false);
    }
  };

  const handleMarkAllAsRead = () => {
    if (userId) {
      notificationService.markAllAsRead(Number(userId))
        .then(response => {
          if (response.success) {
            // Update local state
            setNotifications(prev =>
              prev.map(n => ({...n, read: true}))
            );
            setUnreadCount(0);
          }
        })
        .catch(error => {
          console.error('Error marking all notifications as read:', error);
        });
    }
  };

  return (
    <div className="usertop-dashboard">
      {/* Top Bar */}
      <header className="usertop-topbar">
        <div className="usertop-topbar-left">
          <button
            className="usertop-menutoggle"
            onClick={toggleMobileSidebar}
            aria-label="Toggle menu"
          >
            <FontAwesomeIcon icon={faBars} className="usertop-menuicon" />
          </button>
          <div className="usertop-brand">
            <img src={Servicify} alt="Servicify Logo" className="usertop-logo" style={{marginTop: "10px", marginBottom:"10px"}}/>
            <span className="usertop-role">User Dashboard</span>
          </div>
        </div>

        <div className="usertop-topbar-right">
          <div className="usertop-notification-wrapper">
            <button
              className="usertop-notification-btn"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              aria-label="Notifications"
            >
              <FontAwesomeIcon icon={faBell} className="usertop-notification-icon" />
              {unreadCount > 0 && (
                <span className="usertop-notification-badge">{unreadCount}</span>
              )}
            </button>

            {showNotifications && (
              <div className="usertop-notification-dropdown">
                <div className="usertop-notification-header">
                  <h3>Notifications</h3>
                  <button
                    className="usertop-closedropdown"
                    onClick={() => setShowNotifications(false)}
                    aria-label="Close notifications"
                  >
                    ×
                  </button>
                </div>
                <div className="usertop-notification-list">
                  {loading ? (
                    <div className="usertop-notification-item">
                      <p className="usertop-notification-text">Loading notifications...</p>
                    </div>
                  ) : notifications.length > 0 ? (
                    notifications.map(notification => (
                      <div
                        key={notification._id}
                        className={`usertop-notification-item ${!notification.read ? 'unread' : ''}`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="usertop-notification-content">
                          <h4 className="usertop-notification-title">{notification.title}</h4>
                          <p className="usertop-notification-text">{notification.message}</p>
                          <span className="usertop-notification-time">
                            {new Date(notification.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="usertop-notification-item">
                      <p className="usertop-notification-text">No notifications yet</p>
                    </div>
                  )}
                </div>
                <div className="usertop-notification-footer">
                  <button
                    className="usertop-viewall-btn"
                    onClick={handleMarkAllAsRead}
                    disabled={notifications.length === 0 || unreadCount === 0}
                  >
                    Mark All as Read
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="usertop-profile-wrapper">
            <button
              className="usertop-profile-btn"
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              aria-label="User menu"
            >
              <div className="usertop-avatar">
                {profilePictureUrl ? (
                  <img
                    src={profilePictureUrl}
                    alt="Profile"
                    className="usertop-avatar-image"
                    style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <FontAwesomeIcon icon={faUserCircle} className="usertop-avatar-icon" />
                )}
              </div>
              <span className="usertop-username">{userName}</span>
              <span className="usertop-dropdown-arrow">▼</span>
            </button>

            {showUserMenu && (
              <div className="usertop-usermenu-dropdown">
                <div className="usertop-userinfo">
                  <div className="usertop-usermenu-avatar">
                    {profilePictureUrl ? (
                      <img
                        src={profilePictureUrl}
                        alt="Profile"
                        className="usertop-usermenu-avatar-image"
                        style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', marginBottom: '12px' }}
                      />
                    ) : (
                      <FontAwesomeIcon icon={faUserCircle} className="usertop-usermenu-avatar-icon" style={{ fontSize: '48px', marginBottom: '12px' }} />
                    )}
                  </div>
                  <div>
                    <h4>{userName}</h4>
                    <p className="usertop-useremail">{email}</p>
                  </div>
                </div>
                <div className="usertop-usermenu-items">
                  <button
                    className="usertop-usermenu-item"
                    onClick={() => {
                      navigate('/profile');
                      setShowUserMenu(false);
                    }}
                  >
                    <FontAwesomeIcon icon={faUser} className="usertop-usermenu-icon" />
                    <span>My Profile</span>
                  </button>
                  <button
                    className="usertop-usermenu-item"
                    onClick={() => {
                      navigate('/settings');
                      setShowUserMenu(false);
                    }}
                  >
                    <FontAwesomeIcon icon={faCog} className="usertop-usermenu-icon" />
                    <span>Settings</span>
                  </button>
                </div>
                <div className="usertop-usermenu-footer">
                  <button
                    className="usertop-logout-btn"
                    onClick={handleLogout}
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="usertop-logout-icon" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Desktop Sidebar - Fixed Width */}
      <aside className="userside-sidebar">
        <div className="userside-sidebar-header">
          <div className="userside-user-info">
            <div className="userside-user-avatar">
              {profilePictureUrl ? (
                <img
                  src={profilePictureUrl}
                  alt="Profile"
                  className="userside-user-avatar-image"
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <FontAwesomeIcon icon={faUserCircle} className="userside-user-avatar-icon" />
              )}
            </div>
            <div>
              <h3 className="userside-username">{userName}</h3>
              <p className="userside-user-role">Premium Member</p>
            </div>
          </div>
        </div>

        <nav className="userside-sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`userside-nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => handleNavigation(item.path)}
            >
              <FontAwesomeIcon icon={item.icon} className="userside-nav-icon" />
              <span className="userside-nav-text">{item.name}</span>
              {isActive(item.path) && (
                <span className="userside-active-indicator"></span>
              )}
            </button>
          ))}
        </nav>

        <div className="userside-sidebar-footer">
          <button
            className="userside-sidebar-logout"
            onClick={handleLogout}
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="userside-logout-icon" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="userside-mobile-overlay"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`userside-mobile-sidebar ${isMobileSidebarOpen ? 'open' : ''}`}>
        <div className="userside-mobile-header">
          <div className="userside-mobile-user-info">
            <div className="userside-mobile-avatar">
              {profilePictureUrl ? (
                <img
                  src={profilePictureUrl}
                  alt="Profile"
                  className="userside-mobile-avatar-image"
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <FontAwesomeIcon icon={faUserCircle} className="userside-mobile-avatar-icon" />
              )}
            </div>
            <div>
              <h3 className="userside-mobile-name">{userName}</h3>
              <p className="userside-mobile-email">{email}</p>
            </div>
          </div>
          <button
            className="userside-mobile-close"
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <FontAwesomeIcon icon={faTimes} className="userside-mobile-close-icon" />
          </button>
        </div>

        <nav className="userside-mobile-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`userside-mobile-nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => handleNavigation(item.path)}
            >
              <FontAwesomeIcon icon={item.icon} className="userside-mobile-nav-icon" />
              <span className="userside-mobile-nav-text">{item.name}</span>
              {isActive(item.path) && (
                <span className="userside-mobile-active-indicator"></span>
              )}
            </button>
          ))}
        </nav>

        <div className="userside-mobile-footer">
          <button
            className="userside-mobile-logout"
            onClick={handleLogout}
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="userside-mobile-logout-icon" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="usertop-main-content">
        {isMessagesPage ? (
          <UserMessagesPage userId={userId || ''} />
        ) : (
          children
        )}
      </main>
    </div>
  );
};

export default UserSideTop;