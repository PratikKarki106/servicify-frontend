// Sidebar.jsx
import React, { useState, useEffect } from 'react';
import './Sidebar.css'
import useSidebarBadges from '../hooks/useSidebarBadges';
import {
  FaTachometerAlt,
  FaCalendarAlt,
  FaBox,
  FaHistory,
  FaSignOutAlt,
  FaCubes,
  FaTools,
  FaComments,
  FaChartBar,
  FaCar,
  FaGift,
} from 'react-icons/fa'
import Logo from '../assets/Servicify.png';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminNotifications from '../Admin/AdminNotifications';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactElement;
  path?: string;
  badge?: number;
}

// Maps sidebar item id -> which badge key it uses
const BADGE_ITEM_IDS = new Set(['appointments', 'manage-vehicles', 'messages']);

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState('dashboard')
  const navigate = useNavigate();
  const location = useLocation();
  const badges = useSidebarBadges();

  // seenCounts stores the badge value at the moment the admin clicked the item.
  // Badge is hidden as long as the live count <= seenCounts[id].
  // If a new request arrives (count exceeds seenCount), the badge reappears.
  const [seenCounts, setSeenCounts] = useState<Record<string, number>>({});

  // Update active item based on current route
  useEffect(() => {
    const path = location.pathname;

    if (path === '/admin' || path === '/') {
      setActiveItem('dashboard');
    } else if (path.includes('analytics')) {
      setActiveItem('analytics');
    } else if (path.includes('history')) {
      setActiveItem('history');
    } else if (path.includes('view-appointment')) {
      setActiveItem('appointments');
    } else if (path.includes('catalog')) {
      setActiveItem('catalogue');
    } else if (path.includes('confirmed-appointments')) {
      setActiveItem('ongoing-service');
    } else if (path.includes('packages')) {
      setActiveItem('manage-packages');
    } else if (path.includes('messages')) {
      setActiveItem('messages');
    } else if (path.includes('manage-vehicles')) {
      setActiveItem('manage-vehicles');
    } else if (path.includes('manage-redeem')) {
      setActiveItem('manage-redeem');
    }
  }, [location.pathname]);

  // Returns the visible badge count for a menu item:
  // 0   → badge hidden (admin has already seen this count)
  // N   → N new/pending items arrived since admin last visited this section
  const getEffectiveBadge = (itemId: string, rawBadge: number): number => {
    const seen = seenCounts[itemId] ?? -1;
    if (rawBadge <= 0) return 0;
    // Only show badge if current count exceeds what was seen when admin last clicked
    return rawBadge > seen ? rawBadge : 0;
  };

  // Menu items - updated with correct routes
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <FaTachometerAlt />,
      path: '/admin'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <FaChartBar />,
      path: '/admin/analytics'
    },
    {
      id: 'appointments',
      label: 'Appointments',
      icon: <FaCalendarAlt />,
      path: '/admin/view-appointment',
      badge: badges.appointments
    },
    {
      id: 'ongoing-service',
      label: 'Ongoing Service',
      icon: <FaTools />,
      path: '/admin/confirmed-appointments'
    },
    {
      id: 'catalogue',
      label: 'Catalogue',
      icon: <FaBox />,
      path: '/admin/catalog'
    },
    {
      id: 'manage-packages',
      label: 'Manage Packages',
      icon: <FaCubes />,
      path: 'admin/packages'
    },
    {
      id: 'manage-vehicles',
      label: 'Manage Vehicles',
      icon: <FaCar />,
      path: '/admin/manage-vehicles',
      badge: badges.manageVehicles
    },
    {
      id: 'manage-redeem',
      label: 'Manage Redeem',
      icon: <FaGift />,
      path: '/admin/manage-redeem'
    },
    {
      id: 'history',
      label: 'History',
      icon: <FaHistory />,
      path: '/admin/history'
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: <FaComments />,
      path: 'admin/messages',
      badge: badges.messages
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: <FaSignOutAlt />,
      // No path needed for logout - handled specially
    },
  ];

  const handleItemClick = (item: MenuItem) => {
    setActiveItem(item.id)

    // If this item has a badge, record the current count as "seen"
    // so the badge disappears until a higher count arrives
    if (BADGE_ITEM_IDS.has(item.id) && item.badge != null && item.badge > 0) {
      setSeenCounts(prev => ({ ...prev, [item.id]: item.badge as number }));
    }

    // Handle navigation based on item id
    switch(item.id) {
      case 'dashboard':
        navigate('/admin');
        break;
      case 'analytics':
        navigate('/admin/analytics');
        break;
      case 'history':
        navigate('/admin/history');
        break;
      case 'appointments':
        navigate('/admin/view-appointment');
        break;
      case 'catalogue':
        navigate('/admin/catalog');
        break;
      case 'manage-packages':
        navigate('/admin/packages');
        break;
      case 'messages':
        navigate('/admin/messages');
        break;
      case 'manage-vehicles':
        navigate('/admin/manage-vehicles');
        break;
      case 'manage-redeem':
        navigate('/admin/manage-redeem');
        break;
      case 'logout':
        // Clear all stored data
        localStorage.clear();
        sessionStorage.clear();
        navigate('/Signin');
        console.log('Logging out...')
        break;
      case 'ongoing-service':
        console.log('Navigate to Ongoing Service - Page not created yet');
        navigate('/admin/confirmed-appointments');
        break;
      default:
        // If there's a path property, use it
        if (item.path) {
          navigate(item.path);
        }
    }
  }

  return (
    <>
      {/* Top Bar */}
      <div className="top-bar">
        <div className="top-bar-left">
          <img src={Logo} alt="Servicify Logo" className="top-bar-title" />
        </div>
        <div className="top-bar-right">
          <span className="admin-label">Admin</span>
          <AdminNotifications />
        </div>
      </div>

      {/* Sidebar Container */}
      <div className={`sidebar-container`}>
        {/* Sidebar Content */}
        <div className="sidebar-content">
          {/* Navigation Menu */}
          <nav className="sidebar-menu">
            {menuItems.map((item) => {
              const effectiveBadge = item.badge != null
                ? getEffectiveBadge(item.id, item.badge)
                : 0;

              return (
                <button
                  key={item.id}
                  className={`menu-item ${activeItem === item.id ? 'active' : ''}`}
                  onClick={() => handleItemClick(item)}
                >
                  <span className="menu-icon">{item.icon}</span>
                  <span className="menu-label">{item.label}</span>
                  {effectiveBadge > 0 && (
                    <span className="sidebar-badge">
                      {effectiveBadge > 99 ? '99+' : effectiveBadge}
                    </span>
                  )}
                  {activeItem === item.id && effectiveBadge === 0 && (
                    <span className="active-indicator"></span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  )
}

export default Sidebar
