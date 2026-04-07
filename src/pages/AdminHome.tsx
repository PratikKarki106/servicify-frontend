import React, { useState, useEffect } from 'react';
import type { JSX } from 'react';
import './AdminHome.css';
import {
  FaCalendarAlt, FaTools, FaCheckCircle, FaDownload, FaPlus,
  FaArrowUp, FaArrowDown, FaUserPlus, FaCar, FaClipboardList,
  FaClock, FaUser, FaCarSide, FaWrench, FaCheck, FaSpinner,
  FaExclamationTriangle, FaDollarSign
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { getAllAppointments } from '../services/bookAppointment';
import { fetchAnalyticsData } from '../services/Analytics';
import type { RevenueDataPoint, StatusDataPoint } from '../services/Analytics';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

// ─── Interfaces ────────────────────────────────────────────────────────────────

interface VehicleInfo {
  model: string;
  color: string;
  numberPlate: string;
  kilometerRun: number;
  notes?: string;
  imageUrl?: string;
}

interface AppointmentData {
  _id?: string;
  userId: string;
  serviceType: 'servicing' | 'repair' | 'checkup' | 'wash';
  vehicleInfo: VehicleInfo;
  date: string;
  time: string;
  pickupRequired: boolean;
  pickupAddress?: string;
  email?: string;
  name?: string;
  contactNumber?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface StatusInfo {
  icon: JSX.Element;
  color: string;
  bgColor: string;
}

interface ApiResponse {
  success: boolean;
  appointments?: AppointmentData[];
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Chart data is now fetched dynamically from backend API

// ─── Custom Tooltip for Revenue Bar Chart ──────────────────────────────────────

const RevenueTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#1a2236',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 8,
        padding: '8px 14px',
        fontSize: 13,
        color: '#e2e8f0'
      }}>
        <p style={{ margin: 0, fontWeight: 600 }}>{label}</p>
        <p style={{ margin: '4px 0 0', color: '#4fc3f7' }}>
          Rs. {payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

// ─── Component ────────────────────────────────────────────────────────────────

const AdminHome: React.FC = () => {
  const navigate = useNavigate();
  const [recentAppointments, setRecentAppointments] = useState<AppointmentData[]>([]);
  const [loading, setLoading]   = useState<boolean>(true);
  const [error, setError]       = useState<string | null>(null);

  const [stats, setStats] = useState({
    appointmentsToday: 0,
    totalIncome: 0,
    pendingRepairs: 0,
    completedServices: 0,
  });
  const [statsLoading, setStatsLoading] = useState<boolean>(true);
  
  const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>([]);
  const [statusData, setStatusData] = useState<StatusDataPoint[]>([]);

  const currentDate  = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'short',
  } as Intl.DateTimeFormatOptions);

  // ── Data fetching ────────────────────────────────────────────────────────────

  const fetchRecentAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllAppointments({
        page: 1, limit: 3, sortBy: 'createdAt', sortOrder: 'desc' as const,
      }) as ApiResponse;

      if (response.success) {
        setRecentAppointments(response.appointments || []);
      } else {
        setError(response.message || 'Failed to fetch appointments');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading appointments');
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(
        `http://localhost:5000/admin/dashboard/stats?date=${today}`,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      if (response.ok) {
        const result = await response.json();
        setStats({
          appointmentsToday: result.appointmentsToday || 0,
          totalIncome:        result.totalIncome       || 0,
          pendingRepairs:     result.pendingRepairs    || 0,
          completedServices:  result.completedServices || 0,
        });
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const data = await fetchAnalyticsData(undefined, 'weekly');
      setRevenueData(data.revenue);
      
      const STATUS_COLORS: Record<string, string> = {
        'Completed': '#00796B',
        'In Progress': '#1976D2',
        'Pending': '#1565C0',
        'Cancelled': '#C62828',
        'Confirmed': '#2E7D32'
      };

      const statusWithColors = data.status.map(item => ({
        ...item,
        color: STATUS_COLORS[item.name] || '#6c757d'
      }));
      setStatusData(statusWithColors);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    }
  };

  useEffect(() => {
    fetchRecentAppointments();
    fetchDashboardStats();
    loadAnalytics();
  }, []);

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const getStatusInfo = (status: string | undefined): StatusInfo => {
    switch ((status || '').toLowerCase()) {
      case 'completed':  return { icon: <FaCheck />,               color: '#00796B', bgColor: 'rgba(0,121,107,0.1)' };
      case 'in-progress':
      case 'in progress':
      case 'in_progress': return { icon: <FaSpinner />,            color: '#1976D2', bgColor: 'rgba(25,118,210,0.1)' };
      case 'confirmed':  return { icon: <FaCheckCircle />,         color: '#2E7D32', bgColor: 'rgba(46,125,50,0.1)' };
      case 'booked':
      case 'pending':    return { icon: <FaClock />,               color: '#1565C0', bgColor: 'rgba(21,101,192,0.1)' };
      case 'cancelled':  return { icon: <FaExclamationTriangle />, color: '#C62828', bgColor: 'rgba(196,40,40,0.1)' };
      default:           return { icon: <FaClock />,               color: '#6c757d', bgColor: 'rgba(108,117,125,0.1)' };
    }
  };

  const getServiceIcon = (serviceType: string | undefined): JSX.Element => {
    switch ((serviceType || '').toLowerCase()) {
      case 'servicing': return <FaCarSide />;
      case 'repair':    return <FaWrench />;
      case 'checkup':   return <FaClipboardList />;
      case 'wash':      return <FaCar />;
      default:          return <FaCarSide />;
    }
  };

  const formatTime = (timeString: string | undefined): string => {
    if (!timeString) return 'N/A';
    if (/^\d{1,2}:\d{2}\s*(AM|PM|am|pm)?$/.test(timeString)) {
      const parts  = timeString.trim().split(' ');
      const timePart = parts[0];
      const period   = parts[1] ? parts[1].toUpperCase() : '';
      if (period) return `${timePart} ${period}`;
      const [h, m] = timePart.split(':').map(Number);
      return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
    }
    try {
      return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit', hour12: true,
      });
    } catch { return timeString; }
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      });
    } catch { return 'Invalid date'; }
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      <Sidebar />
      <div className="admin-main-container">

        {/* ── Header ── */}
        <div className="dashboard-header-row">
          <div className="welcome-section">
            <h1 className="welcome-title">Welcome back, Admin</h1>
            <p className="date-display">Here is your daily overview for {formattedDate}</p>
          </div>
          <div className="action-buttons-horizontal">
            <button className="export-btn" onClick={() => alert('Report exported!')}>
              <FaDownload /><span>Export Report</span>
            </button>
            <button className="new-entry-btn" onClick={() => alert('New entry form!')}>
              <FaPlus /><span>New Entry</span>
            </button>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="stats-grid-container">
          {[
            { icon: <FaCalendarAlt />, cls: 'appointments', trend: 'up',   pct: '10%',  value: stats.appointmentsToday,                           label: 'Appointments Today' },
            { icon: <FaDollarSign />,  cls: 'income',       trend: 'up',   pct: '~15%', value: `Rs. ${stats.totalIncome.toLocaleString()}`,        label: 'Total Income' },
            { icon: <FaTools />,       cls: 'repairs',      trend: 'down', pct: '~2%',  value: stats.pendingRepairs,                               label: 'Pending Repairs' },
            { icon: <FaCheckCircle />, cls: 'completed',    trend: 'up',   pct: '~5%',  value: stats.completedServices,                            label: 'Completed Services' },
          ].map(({ icon, cls, trend, pct, value, label }) => (
            <div className="stat-card-container" key={label}>
              <div className="stat-header-container">
                <div className={`stat-icon-container ${cls}`}>{icon}</div>
                <div className={`stat-trend-container ${trend}`}>
                  {trend === 'up' ? <FaArrowUp /> : <FaArrowDown />}
                  <span>{pct}</span>
                </div>
              </div>
              <div className="stat-content-container">
                <h3 className="stat-number">{statsLoading ? '...' : value}</h3>
                <p className="stat-label">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Charts Row ── */}
        <div className="charts-grid-container">

          {/* Revenue Bar Chart */}
          <div className="chart-card">
            <div className="chart-card-header">
              <div>
                <h2 className="chart-title">Revenue This Week</h2>
                <p className="chart-subtitle">Daily income breakdown</p>
              </div>
              <button className="chart-link-btn" onClick={() => navigate('/admin/analytics')}>
                Full Analytics →
              </button>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueData} barSize={28} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<RevenueTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="revenue" fill="#4fc3f7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Status Donut Chart */}
          <div className="chart-card">
            <div className="chart-card-header">
              <div>
                <h2 className="chart-title">Appointment Status</h2>
                <p className="chart-subtitle">Distribution overview</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value ?? 0} appointments`, name]}
                  contentStyle={{
                    background: '#1a2236',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    fontSize: 13,
                    color: '#e2e8f0'
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span style={{ color: '#94a3b8', fontSize: 12 }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Bottom Row: Appointments + Quick Actions ── */}
        <div className="content-grid-container">

          {/* Recent Appointments */}
          <div className="recent-appointments-section">
            <div className="section-header">
              <h2 className="section-title">Recent Appointments</h2>
              <button className="view-all-btn" onClick={() => navigate('/admin/view-appointment')}>
                View All
              </button>
            </div>
            <div className="appointments-table-container">
              {loading ? (
                <div className="loading-container">
                  <FaSpinner className="spinner" /><p>Loading appointments...</p>
                </div>
              ) : error ? (
                <div className="error-container">
                  <p>Error: {error}</p>
                  <button onClick={fetchRecentAppointments} className="retry-button">Retry</button>
                </div>
              ) : recentAppointments.length > 0 ? (
                <table className="appointments-table">
                  <thead>
                    <tr>
                      <th>VEHICLE</th><th>CUSTOMER</th><th>SERVICE TYPE</th>
                      <th>STATUS</th><th>TIME</th><th>DATE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAppointments.map((appt, idx) => {
                      const si = getStatusInfo(appt.status);
                      return (
                        <tr key={appt._id || idx}>
                          <td>
                            <div className="vehicle-info">
                              <div className="vehicle-icon">{getServiceIcon(appt.serviceType)}</div>
                              <div className="vehicle-details">
                                <div className="vehicle-model">{appt.vehicleInfo?.model || 'N/A'}</div>
                                <div className="vehicle-plate">License: {appt.vehicleInfo?.numberPlate || 'N/A'}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="customer-info">
                              <FaUser className="customer-icon" />
                              <span>{appt.name || 'N/A'}</span>
                            </div>
                          </td>
                          <td><span className="service-type-badge">{appt.serviceType || 'N/A'}</span></td>
                          <td>
                            <span className="status-badge"
                              style={{ backgroundColor: si.bgColor, color: si.color }}>
                              {si.icon}<span>{appt.status || 'Pending'}</span>
                            </span>
                          </td>
                          <td>
                            <div className="time-slot">
                              <FaClock /><span>{formatTime(appt.time)}</span>
                            </div>
                          </td>
                          <td><div className="date-display-small">{formatDate(appt.date)}</div></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">
                  <FaCalendarAlt className="empty-icon" />
                  <p>No recent appointments found</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions-section">
            <div className="section-header">
              <h2 className="section-title">Quick Actions</h2>
            </div>
            <div className="quick-actions-grid">
              {[
                { icon: <FaCalendarAlt />, color: '#1094E6', bg: 'rgba(16,148,230,0.1)',  title: 'New Appointment',   desc: 'Schedule a service for a client', onClick: () => navigate('/book-appointment') },
                { icon: <FaUserPlus />,    color: '#7952b3', bg: 'rgba(121,82,179,0.1)', title: 'View Customers',    desc: 'View Customer profiles',           onClick: () => navigate('/admin/users') },
                { icon: <FaClipboardList />, color: '#51cf66', bg: 'rgba(81,207,102,0.1)', title: 'Manage Inventory', desc: 'Update and track parts stock',      onClick: () => navigate('/admin/inventory') },
                { icon: <FaTools />,       color: '#ff6b6b', bg: 'rgba(255,107,107,0.1)', title: 'Service Reports',  desc: 'Generate service history reports',  onClick: () => navigate('/admin/analytics') },
              ].map(({ icon, color, bg, title, desc, onClick }) => (
                <button className="quick-action-btn" key={title} onClick={onClick}>
                  <div className="quick-action-icon" style={{ backgroundColor: bg }}>
                    {React.cloneElement(icon, { style: { color } })}
                  </div>
                  <div className="quick-action-content">
                    <h3>{title}</h3>
                    <p>{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminHome;