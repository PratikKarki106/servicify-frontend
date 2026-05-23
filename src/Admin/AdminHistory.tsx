import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  FaCubes,
} from 'react-icons/fa';
import { fetchHistory, exportHistoryToCSV } from '../services/History';
import type {
  HistoryFilters,
  HistoryGroup,
  HistoryItem,
  AppointmentHistoryItem,
  PackageHistoryItem,
} from '../services/History';

const COLORS = {
  primary: '#4fc3f7',
  secondary: '#7c3aed',
  success: '#00796B',
  warning: '#f59e0b',
  danger: '#C62828',
  confirmed: '#2E7D32',
  booked: '#1976D2',
};

const STATUS_COLORS: Record<string, string> = {
  completed: COLORS.success,
  confirmed: COLORS.confirmed,
  'in-progress': COLORS.primary,
  payment: COLORS.warning,
  booked: COLORS.booked,
  cancelled: COLORS.danger,
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatCurrency = (amount: number): string => `Rs. ${amount.toLocaleString()}`;
const isAppointmentItem = (item: HistoryItem): item is AppointmentHistoryItem => 'appointmentId' in item;
const getStatusLabel = (status: string): string => status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');

const ResultsSkeleton: React.FC = () => (
  <>
    <div className="history-summary">
      {[...Array(3)].map((_, i) => (
        <div className="summary-card skeleton-card" key={i}>
          <div className="skeleton skeleton-icon" />
          <div className="skeleton-group">
            <div className="skeleton skeleton-label" />
            <div className="skeleton skeleton-value" />
          </div>
        </div>
      ))}
    </div>
    <div className="history-groups">
      {[...Array(3)].map((_, i) => (
        <div className="skeleton skeleton-group" key={i} />
      ))}
    </div>
  </>
);

const HistoryItemCard: React.FC<{ item: HistoryItem }> = ({ item }) => {
  const isAppointment = isAppointmentItem(item);
  const status = isAppointment ? item.status : (item as PackageHistoryItem).paymentStatus;
  const statusColor = STATUS_COLORS[status.toLowerCase()] || COLORS.primary;

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
        <div className="history-item-status" style={{ background: `${statusColor}18`, color: statusColor }}>
          {getStatusLabel(status)}
        </div>
      </div>

      <div className="history-item-body">
        <div className="history-item-info">
          {isAppointment ? (
            <>
              <div className="info-row"><span className="info-label">Service:</span><span className="info-value">{getStatusLabel(item.serviceType)}</span></div>
              <div className="info-row"><span className="info-label">Customer:</span><span className="info-value">{item.name}</span></div>
              <div className="info-row"><span className="info-label">Vehicle:</span><span className="info-value">{item.vehicleInfo.name} {item.vehicleInfo.model}</span></div>
              <div className="info-row"><span className="info-label">Time:</span><span className="info-value">{item.time}</span></div>
            </>
          ) : (
            <>
              <div className="info-row"><span className="info-label">Package:</span><span className="info-value">{(item as PackageHistoryItem).packageName}</span></div>
              <div className="info-row"><span className="info-label">Customer:</span><span className="info-value">{(item as PackageHistoryItem).userName}</span></div>
              <div className="info-row"><span className="info-label">Credits:</span><span className="info-value">{(item as PackageHistoryItem).totalCredits} credits</span></div>
              <div className="info-row"><span className="info-label">Valid Until:</span><span className="info-value">{formatDate((item as PackageHistoryItem).expiryDate)}</span></div>
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

const HistoryGroupSection: React.FC<{
  group: HistoryGroup;
  expanded: boolean;
  onToggle: () => void;
}> = ({ group, expanded, onToggle }) => (
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
      <div className="group-toggle">{expanded ? <FaChevronUp /> : <FaChevronDown />}</div>
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

const FilterPanel: React.FC<{
  filters: HistoryFilters;
  onFilterChange: (filters: HistoryFilters) => void;
  onExport: () => void;
  exportLoading: boolean;
}> = ({ filters, onFilterChange, onExport, exportLoading }) => {
  const [showFilters, setShowFilters] = useState(true);
  const handleChange = (key: keyof HistoryFilters, value: string) => onFilterChange({ ...filters, [key]: value });

  return (
    <div className="filter-panel">
      <div className="filter-panel-header">
        <div className="filter-title"><FaFilter /> Filters</div>
        <div className="filter-actions">
          <button className="toggle-filters-btn" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          <button className="export-btn" onClick={onExport} disabled={exportLoading}>
            {exportLoading ? <FaSpinner className="spin-icon" /> : <FaFileCsv />}
            <span className="export-label">{exportLoading ? 'Exporting...' : 'Export CSV'}</span>
          </button>
        </div>
      </div>
      {showFilters && (
        <div className="filter-panel-content">
          <div className="filter-row">
            <div className="filter-group">
              <label className="filter-label"><FaSearch /> Type</label>
              <select className="filter-select" value={filters.type || 'all'} onChange={(e) => handleChange('type', e.target.value)}>
                <option value="all">All Types</option>
                <option value="appointment">Appointments</option>
                <option value="package">Packages</option>
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label"><FaCheckCircle /> Status</label>
              <select className="filter-select" value={filters.status || 'all'} onChange={(e) => handleChange('status', e.target.value)}>
                <option value="all">All Statuses</option>
                <option value="booked">Booked</option>
                <option value="confirmed">Confirmed</option>
                <option value="in-progress">In Progress</option>
                <option value="payment">Payment</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminHistory: React.FC = () => {
  const [filters, setFilters] = useState<HistoryFilters>({ type: 'all', status: 'all', startDate: '', endDate: '', page: 1, limit: 50 });
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [exportLoading, setExportLoading] = useState(false);

  const historyQuery = useQuery({
    queryKey: ['history', filters],
    queryFn: () => fetchHistory(filters),
    placeholderData: (previousData) => previousData,
  });

  const historyData = historyQuery.data?.data;
  const isInitialLoading = historyQuery.isLoading && !historyData;
  const isRefreshing = historyQuery.isFetching && !!historyData;

  useEffect(() => {
    if (!historyData?.groups?.length) return;
    setExpandedGroups((prev) => (prev.size > 0 ? prev : new Set([historyData.groups[0].date])));
  }, [historyData?.groups]);

  const handleFilterChange = (newFilters: HistoryFilters) => setFilters({ ...newFilters, page: 1 });

  const handleExport = async () => {
    try {
      setExportLoading(true);
      await exportHistoryToCSV(filters);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export history. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const expandAll = () => {
    if (!historyData) return;
    setExpandedGroups(new Set(historyData.groups.map((g) => g.date)));
  };

  const collapseAll = () => setExpandedGroups(new Set());

  const summary = useMemo(
    () => historyData?.summary ?? { totalRevenue: 0, totalAppointments: 0, totalPackages: 0 },
    [historyData]
  );

  return (
    <>
      <Sidebar />
      <div className="history-container">
        <div className="history-content">
          <div className="history-header">
            <div>
              <h1 className="history-title"><FaHistory className="title-icon" /> History</h1>
              <p className="history-subtitle">Complete record of all appointments and packages</p>
            </div>
            <div className="history-actions">
              <button className="expand-all-btn" onClick={expandAll}>Expand All</button>
              <button className="expand-all-btn" onClick={collapseAll}>Collapse All</button>
            </div>
          </div>

          <FilterPanel filters={filters} onFilterChange={handleFilterChange} onExport={handleExport} exportLoading={exportLoading} />

          {isInitialLoading ? (
            <ResultsSkeleton />
          ) : historyQuery.isError && !historyData ? (
            <div className="error-state">
              <div className="error-icon">⚠️</div>
              <h2>Failed to Load History</h2>
              <p>{(historyQuery.error as Error)?.message || 'Failed to load history data'}</p>
              <button className="retry-btn" onClick={() => historyQuery.refetch()}>
                <FaSpinner className="retry-icon" /> Try Again
              </button>
            </div>
          ) : !historyData || historyData.groups.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📜</div>
              <h2>No History Found</h2>
              <p>No history data available for the selected filters.</p>
            </div>
          ) : (
            <>
              <div className="history-summary">
                <div className="summary-card">
                  <div className="summary-icon" style={{ color: COLORS.primary, background: `${COLORS.primary}18` }}><FaDollarSign /></div>
                  <div className="summary-content"><div className="summary-label">Total Revenue</div><div className="summary-value" style={{ color: COLORS.primary }}>{formatCurrency(summary.totalRevenue)}</div></div>
                </div>
                <div className="summary-card">
                  <div className="summary-icon" style={{ color: COLORS.secondary, background: `${COLORS.secondary}18` }}><FaTools /></div>
                  <div className="summary-content"><div className="summary-label">Total Appointments</div><div className="summary-value" style={{ color: COLORS.secondary }}>{summary.totalAppointments}</div></div>
                </div>
                <div className="summary-card">
                  <div className="summary-icon" style={{ color: COLORS.success, background: `${COLORS.success}18` }}><FaCubes /></div>
                  <div className="summary-content"><div className="summary-label">Total Packages</div><div className="summary-value" style={{ color: COLORS.success }}>{summary.totalPackages}</div></div>
                </div>
              </div>

              {isRefreshing && (
                <div className="history-pagination">
                  <p><FaSpinner className="spin-icon" /> Updating results...</p>
                </div>
              )}

              <div className="history-groups">
                {historyData.groups.map((group, index) => (
                  <HistoryGroupSection
                    key={`${group.date}-${index}`}
                    group={group}
                    expanded={expandedGroups.has(group.date)}
                    onToggle={() =>
                      setExpandedGroups((prev) => {
                        const next = new Set(prev);
                        if (next.has(group.date)) next.delete(group.date);
                        else next.add(group.date);
                        return next;
                      })
                    }
                  />
                ))}
              </div>

              {historyData.pagination.totalPages > 1 && (
                <div className="history-pagination">
                  <p>
                    Showing page {historyData.pagination.currentPage} of {historyData.pagination.totalPages}
                    ({historyData.pagination.totalItems} total records)
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminHistory;
