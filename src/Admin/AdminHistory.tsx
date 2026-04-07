import React, { useState, useEffect, useCallback } from 'react';
import './AdminHistory.css';
import Sidebar from '../components/Sidebar';
import {
  FaHistory,
  FaCalendarAlt,
  FaDollarSign,
  FaFilter,
  FaFileCsv,
  FaTools,
  FaCheckCircle,
  FaChevronDown,
  FaChevronUp,
  FaSpinner,
  FaSearch,
  FaCubes
} from 'react-icons/fa';
import {
  fetchHistory,
  exportHistoryToCSV,
} from '../services/History';

import type {
      HistoryFilters,
  HistoryGroup,
  HistoryItem,
  AppointmentHistoryItem,
  PackageHistoryItem
} from '../services/History';

// ─── Color Constants ─────────────────────────────────────────────────────────

const COLORS = {
  primary: '#4fc3f7',
  secondary: '#7c3aed',
  success: '#00796B',
  warning: '#f59e0b',
  danger: '#C62828',
  confirmed: '#2E7D32',
  pending: '#1565C0',
  booked: '#1976D2',
};

const STATUS_COLORS: Record<string, string> = {
  'completed': COLORS.success,
  'confirmed': COLORS.confirmed,
  'in-progress': COLORS.primary,
  'payment': COLORS.warning,
  'booked': COLORS.booked,
  'cancelled': COLORS.danger,
};

// const SERVICE_ICONS: Record<string, React.ReactNode> = {
//   'servicing': <FaTools />,
//   'repair': <FaTools />,
//   'checkup': <FaCheckCircle />,
//   'wash': <FaExclamationCircle />,
// };

// ─── Helper Functions ────────────────────────────────────────────────────────

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatTime = (timeString: string): string => {
  return timeString;
};

const formatCurrency = (amount: number): string => {
  return `Rs. ${amount.toLocaleString()}`;
};

const isAppointmentItem = (item: HistoryItem): item is AppointmentHistoryItem => {
  return 'appointmentId' in item;
};

const getStatusLabel = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
};

// ─── Loading Skeleton Component ──────────────────────────────────────────────

const LoadingSkeleton: React.FC = () => (
  <div className="history-container">
    <Sidebar />
    <div className="history-content">
      <div className="history-header">
        <div className="skeleton skeleton-title" />
      </div>
      <div className="history-filters">
        <div className="skeleton skeleton-filter" />
        <div className="skeleton skeleton-filter" />
        <div className="skeleton skeleton-filter" />
      </div>
      <div className="history-groups">
        <div className="skeleton skeleton-group" />
        <div className="skeleton skeleton-group" />
      </div>
    </div>
  </div>
);

// ─── Error State Component ───────────────────────────────────────────────────

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => (
  <div className="history-container">
    <Sidebar />
    <div className="history-content">
      <div className="error-state">
        <div className="error-icon">⚠️</div>
        <h2>Failed to Load History</h2>
        <p>{message}</p>
        <button className="retry-btn" onClick={onRetry}>
          <FaSpinner className="retry-icon" /> Try Again
        </button>
      </div>
    </div>
  </div>
);

// ─── Empty State Component ───────────────────────────────────────────────────

interface EmptyStateProps {
  message: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message }) => (
  <div className="history-container">
    <Sidebar />
    <div className="history-content">
      <div className="empty-state">
        <div className="empty-icon">📜</div>
        <h2>No History Found</h2>
        <p>{message}</p>
      </div>
    </div>
  </div>
);

// ─── History Item Card Component ─────────────────────────────────────────────

interface HistoryItemCardProps {
  item: HistoryItem;
}

const HistoryItemCard: React.FC<HistoryItemCardProps> = ({ item }) => {
  const isAppointment = isAppointmentItem(item);

  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status.toLowerCase()] || COLORS.primary;
  };

  return (
    <div className="history-item-card">
      <div className="history-item-header">
        <div className="history-item-type">
          {isAppointment ? (
            <>
              <FaTools className="type-icon" />
              <span className="type-label">Appointment</span>
            </>
          ) : (
            <>
              <FaCubes className="type-icon" />
              <span className="type-label">Package</span>
            </>
          )}
        </div>
        <div className="history-item-status" style={{ background: getStatusColor(isAppointment ? item.status : (item as PackageHistoryItem).paymentStatus) + '18', color: getStatusColor(isAppointment ? item.status : (item as PackageHistoryItem).paymentStatus) }}>
          {getStatusLabel(isAppointment ? item.status : (item as PackageHistoryItem).paymentStatus)}
        </div>
      </div>

      <div className="history-item-body">
        <div className="history-item-info">
          {isAppointment ? (
            <>
              <div className="info-row">
                <span className="info-label">Service:</span>
                <span className="info-value">{getStatusLabel(item.serviceType)}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Customer:</span>
                <span className="info-value">{item.name}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Vehicle:</span>
                <span className="info-value">{item.vehicleInfo.name} {item.vehicleInfo.model}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Time:</span>
                <span className="info-value">{formatTime(item.time)}</span>
              </div>
            </>
          ) : (
            <>
              <div className="info-row">
                <span className="info-label">Package:</span>
                <span className="info-value">{(item as PackageHistoryItem).packageName}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Customer:</span>
                <span className="info-value">{(item as PackageHistoryItem).userName}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Credits:</span>
                <span className="info-value">{(item as PackageHistoryItem).totalCredits} credits</span>
              </div>
              <div className="info-row">
                <span className="info-label">Valid Until:</span>
                <span className="info-value">{formatDate((item as PackageHistoryItem).expiryDate)}</span>
              </div>
            </>
          )}
        </div>

        <div className="history-item-amount">
          <div className="amount-label">Amount</div>
          <div className="amount-value">{formatCurrency(isAppointment ? (item as AppointmentHistoryItem).totalAmount || 0 : (item as PackageHistoryItem).amount)}</div>
        </div>
      </div>
    </div>
  );
};

// ─── History Group Component ─────────────────────────────────────────────────

interface HistoryGroupProps {
  group: HistoryGroup;
  expanded: boolean;
  onToggle: () => void;
}

const HistoryGroup: React.FC<HistoryGroupProps> = ({ group, expanded, onToggle }) => {
  return (
    <div className={`history-group ${expanded ? 'expanded' : ''}`}>
      <div className="history-group-header" onClick={onToggle} role="button" tabIndex={0} aria-expanded={expanded}>
        <div className="group-date-section">
          <div className="group-date">
            <FaCalendarAlt className="date-icon" />
            <span>{formatDate(group.date)}</span>
          </div>
          <div className="group-stats">
            <span className="stat">{group.appointmentCount} appointments</span>
            <span className="stat">{group.packageCount} packages</span>
            <span className="stat revenue">{formatCurrency(group.totalRevenue)}</span>
          </div>
        </div>
        <div className="group-toggle">
          {expanded ? <FaChevronUp /> : <FaChevronDown />}
        </div>
      </div>

      {expanded && (
        <div className="history-group-items">
          {group.items.map((item, index) => (
            <HistoryItemCard key={index} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Filter Panel Component ──────────────────────────────────────────────────

interface FilterPanelProps {
  filters: HistoryFilters;
  onFilterChange: (filters: HistoryFilters) => void;
  onExport: () => void;
  exportLoading: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFilterChange, onExport, exportLoading }) => {
  const [showFilters, setShowFilters] = useState(true);

  const handleChange = (key: keyof HistoryFilters, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="filter-panel">
      <div className="filter-panel-header">
        <div className="filter-title">
          <FaFilter /> Filters
        </div>
        <div className="filter-actions">
          <button
            className="toggle-filters-btn"
            onClick={() => setShowFilters(!showFilters)}
            aria-label={showFilters ? 'Hide filters' : 'Show filters'}
          >
            {showFilters ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          <button
            className="export-btn"
            onClick={onExport}
            disabled={exportLoading}
            aria-label="Export history to CSV"
          >
            {exportLoading ? <FaSpinner className="spin-icon" /> : <FaFileCsv />}
            <span className="export-label">{exportLoading ? 'Exporting...' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="filter-panel-content">
          <div className="filter-row">
            <div className="filter-group">
              <label className="filter-label">
                <FaSearch /> Type
              </label>
              <select
                className="filter-select"
                value={filters.type || 'all'}
                onChange={(e) => handleChange('type', e.target.value)}
                aria-label="Filter by type"
              >
                <option value="all">All Types</option>
                <option value="appointment">Appointments</option>
                <option value="package">Packages</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">
                <FaCheckCircle /> Status
              </label>
              <select
                className="filter-select"
                value={filters.status || 'all'}
                onChange={(e) => handleChange('status', e.target.value)}
                aria-label="Filter by status"
              >
                <option value="all">All Statuses</option>
                <option value="booked">Booked</option>
                <option value="confirmed">Confirmed</option>
                <option value="in-progress">In Progress</option>
                <option value="payment">Payment</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* <div className="filter-group">
              <label className="filter-label">
                <FaCalendarAlt /> Start Date
              </label>
              <input
                type="date"
                className="filter-date"
                value={filters.startDate || ''}
                onChange={(e) => handleChange('startDate', e.target.value)}
                aria-label="Start date"
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">
                <FaCalendarAlt /> End Date
              </label>
              <input
                type="date"
                className="filter-date"
                value={filters.endDate || ''}
                onChange={(e) => handleChange('endDate', e.target.value)}
                aria-label="End date"
              />
            </div> */}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Summary Cards Component ─────────────────────────────────────────────────

interface SummaryCardsProps {
  totalRevenue: number;
  totalAppointments: number;
  totalPackages: number;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ totalRevenue, totalAppointments, totalPackages }) => {
  return (
    <div className="history-summary">
      <div className="summary-card">
        <div className="summary-icon" style={{ color: COLORS.primary, background: `${COLORS.primary}18` }}>
          <FaDollarSign />
        </div>
        <div className="summary-content">
          <div className="summary-label">Total Revenue</div>
          <div className="summary-value" style={{ color: COLORS.primary }}>
            {formatCurrency(totalRevenue)}
          </div>
        </div>
      </div>

      <div className="summary-card">
        <div className="summary-icon" style={{ color: COLORS.secondary, background: `${COLORS.secondary}18` }}>
          <FaTools />
        </div>
        <div className="summary-content">
          <div className="summary-label">Total Appointments</div>
          <div className="summary-value" style={{ color: COLORS.secondary }}>
            {totalAppointments}
          </div>
        </div>
      </div>

      <div className="summary-card">
        <div className="summary-icon" style={{ color: COLORS.success, background: `${COLORS.success}18` }}>
          <FaCubes />
        </div>
        <div className="summary-content">
          <div className="summary-label">Total Packages</div>
          <div className="summary-value" style={{ color: COLORS.success }}>
            {totalPackages}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

const AdminHistory: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<{
    groups: HistoryGroup[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
    summary: {
      totalRevenue: number;
      totalAppointments: number;
      totalPackages: number;
    };
  } | null>(null);
  const [filters, setFilters] = useState<HistoryFilters>({
    type: 'all',
    status: 'all',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 50
  });
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [exportLoading, setExportLoading] = useState(false);

  // Load history data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchHistory(filters);
      setHistoryData(response.data);
      
      // Auto-expand first group if exists
      if (response.data.groups.length > 0) {
        setExpandedGroups(new Set([response.data.groups[0].date]));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load history data');
      setHistoryData(null);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle filter change with debounce
  const handleFilterChange = (newFilters: HistoryFilters) => {
    setFilters({ ...newFilters, page: 1 });
  };

  // Handle export
  const handleExport = async () => {
    try {
      setExportLoading(true);
      await exportHistoryToCSV(filters);
    } catch (err: any) {
      console.error('Export failed:', err);
      alert('Failed to export history. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  // Toggle group expansion
  const toggleGroup = (date: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedGroups(newExpanded);
  };

  // Expand all groups
  const expandAll = () => {
    if (historyData) {
      setExpandedGroups(new Set(historyData.groups.map(g => g.date)));
    }
  };

  // Collapse all groups
  const collapseAll = () => {
    setExpandedGroups(new Set());
  };

  // Render loading state
  if (loading) {
    return <LoadingSkeleton />;
  }

  // Render error state
  if (error && !historyData) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  // Render empty state
  if (!historyData || historyData.groups.length === 0) {
    return <EmptyState message="No history data available for the selected filters." />;
  }

  return (
    <>
      <Sidebar />
      <div className="history-container">
        <div className="history-content">
          {/* Header */}
          <div className="history-header">
            <div>
              <h1 className="history-title">
                <FaHistory className="title-icon" /> History
              </h1>
              <p className="history-subtitle">Complete record of all appointments and packages</p>
            </div>
            <div className="history-actions">
              <button className="expand-all-btn" onClick={expandAll}>
                Expand All
              </button>
              <button className="expand-all-btn" onClick={collapseAll}>
                Collapse All
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <SummaryCards
            totalRevenue={historyData.summary.totalRevenue}
            totalAppointments={historyData.summary.totalAppointments}
            totalPackages={historyData.summary.totalPackages}
          />

          {/* Filter Panel */}
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onExport={handleExport}
            exportLoading={exportLoading}
          />

          {/* History Groups */}
          <div className="history-groups">
            {historyData.groups.map((group, index) => (
              <HistoryGroup
                key={index}
                group={group}
                expanded={expandedGroups.has(group.date)}
                onToggle={() => toggleGroup(group.date)}
              />
            ))}
          </div>

          {/* Pagination Info */}
          {historyData.pagination.totalPages > 1 && (
            <div className="history-pagination">
              <p>
                Showing page {historyData.pagination.currentPage} of {historyData.pagination.totalPages}
                ({historyData.pagination.totalItems} total records)
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminHistory;
