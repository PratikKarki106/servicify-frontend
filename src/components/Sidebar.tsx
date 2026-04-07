// Sidebar.jsx
import React from 'react';
import './Sidebar.css'
import { useState, useEffect } from 'react'
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
} from 'react-icons/fa'
import Logo from '../assets/Servicify.png';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminNotifications from '../Admin/AdminNotifications';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactElement;
  path?: string;
}

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState('dashboard')
  const navigate = useNavigate();
  const location = useLocation();

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
    }
  }, [location.pathname]);

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
      id: 'history',
      label: 'History',
      icon: <FaHistory />,
      path: '/admin/history'
    },
    {
      id: 'appointments',
      label: 'Appointments',
      icon: <FaCalendarAlt />,
      path: '/admin/view-appointment' // Fixed: matches your route
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
      path: '/admin/catalog' // Fixed: matches your route
    },
    {
      id: 'manage-packages',
      label: 'Manage Packages',
      icon: <FaCubes />,
      path: 'admin/packages'
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: <FaComments />,
      path: 'admin/messages'
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
        navigate('/admin/view-appointment'); // Fixed route
        break;
      case 'catalogue':
        navigate('/admin/catalog'); // Fixed route
        break;
      case 'manage-packages':
        navigate('/admin/packages');
        break;
      case 'messages':
        navigate('/admin/messages');
        break;
      case 'logout':
        // Clear all stored data
        localStorage.clear();
        sessionStorage.clear();
        navigate('/Signin');
        console.log('Logging out...')
        break;
      case 'ongoing-service':
        // Add navigation when you create this page
        console.log('Navigate to Ongoing Service - Page not created yet');
        navigate('/admin/confirmed-appointments');
        break;
      case 'manage-packages':
        // Add navigation when you create this page
        console.log('Navigate to Manage Packages - Page not created yet');
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
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`menu-item ${activeItem === item.id ? 'active' : ''}`}
                onClick={() => handleItemClick(item)}
              >
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-label">{item.label}</span>
                {activeItem === item.id && (
                  <span className="active-indicator"></span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </>
  )
}

export default Sidebar