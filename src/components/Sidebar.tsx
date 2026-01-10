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
  FaChevronLeft,
  FaChevronRight,
  FaBars,
  FaCubes,
  FaUserCircle,
  FaTools
} from 'react-icons/fa'
import Logo from '../assets/Servicify.png';
import { useNavigate, useLocation } from 'react-router-dom';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactElement;
  path?: string;
}

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState('dashboard')
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)
  const navigate = useNavigate();
  const location = useLocation();

  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Update active item based on current route
  useEffect(() => {
    const path = location.pathname;
    
    if (path === '/admin' || path === '/') {
      setActiveItem('dashboard');
    } else if (path.includes('view-appointment')) {
      setActiveItem('appointments');
    } else if (path.includes('catalog')) {
      setActiveItem('catalogue');
    } else if (path.includes('confirmed-appointments')) {
      setActiveItem('ongoing-service');
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
      id: 'history', 
      label: 'History', 
      icon: <FaHistory />,
      // path: '/history' // Commented out - no route yet
    },
    { 
      id: 'manage-packages', 
      label: 'Manage Packages', 
      icon: <FaCubes />,
      // path: '/manage-packages' // Commented out - no route yet
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
      case 'appointments':
        navigate('/admin/view-appointment'); // Fixed route
        break;
      case 'catalogue':
        navigate('/admin/catalog'); // Fixed route
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
      case 'history':
        // Add navigation when you create this page
        console.log('Navigate to History - Page not created yet');
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
    
    if (isMobile && isOverlayOpen) {
      setIsOverlayOpen(false)
    }
  }

  const toggleSidebar = () => {
    if (isMobile) {
      setIsOverlayOpen(!isOverlayOpen)
    } else {
      setIsCollapsed(!isCollapsed)
    }
  }

  return (
    <>
      {/* Top Bar */}
      <div className="top-bar">
        <div className="top-bar-left">
          <button 
            className="menu-toggle-btn"
            onClick={toggleSidebar}
            aria-label={isMobile ? (isOverlayOpen ? "Close menu" : "Open menu") : "Toggle sidebar"}
          >
            <FaBars />
          </button>
          <img src={Logo} alt="Servicify Logo" className="top-bar-title" />
        </div>
        <div className="top-bar-right">
          <div className="user-profile">
            <FaUserCircle className="user-icon" />
            <span className="user-name">Super Administrator</span>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobile && isOverlayOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setIsOverlayOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`sidebar-container ${isCollapsed ? 'collapsed' : ''} ${isMobile ? 'mobile' : ''} ${isMobile && isOverlayOpen ? 'overlay-open' : ''}`}>
        {/* Collapse Toggle Button with Circular Border */}
        <div className="sidebar-toggle-wrapper">
          <button 
            className="sidebar-toggle-btn"
            onClick={toggleSidebar}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="sidebar-content">
          {/* User Profile Section */}
          <div className="sidebar-profile">
            <div className="profile-avatar">
              <FaUserCircle />
            </div>
            {!isCollapsed && (
              <>
                <h2 className="profile-name">Admin</h2>
              </>
            )}
          </div>

          {/* Navigation Menu */}
          <nav className="sidebar-menu">
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`menu-item ${activeItem === item.id ? 'active' : ''}`}
                onClick={() => handleItemClick(item)}
              >
                <span className="menu-icon">{item.icon}</span>
                {!isCollapsed && (
                  <span className="menu-label">{item.label}</span>
                )}
                {!isCollapsed && activeItem === item.id && (
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