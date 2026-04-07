import React, { useState, useEffect, useCallback } from 'react';
import './Analytics.css';
import Sidebar from '../components/Sidebar';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { 
  FaDollarSign, 
  FaCalendarAlt, 
  FaTools, 
  FaCheckCircle, 
  FaChartBar,
  FaDownload,
  FaFileCsv,
  FaFilePdf,
  FaChevronLeft,
  FaChevronRight,
  FaSpinner
} from 'react-icons/fa';
import {
  fetchAnalyticsData,
  exportAnalytics,
} from '../services/Analytics';

import type{
    AnalyticsResponse,
    RevenueDataPoint,
    StatusDataPoint,
    ServiceTypeDataPoint,
    AppointmentTrendDataPoint,
    DateRange
} from '../services/Analytics';
// ─── Color Constants ─────────────────────────────────────────────────────────

const COLORS = {
  primary: '#4fc3f7',
  secondary: '#7c3aed',
  success: '#00796B',
  warning: '#f59e0b',
  danger: '#C62828',
  confirmed: '#2E7D32',
  pending: '#1565C0',
};

const STATUS_COLORS: Record<string, string> = {
  'Completed': COLORS.success,
  'In Progress': COLORS.primary,
  'Pending': COLORS.pending,
  'Cancelled': COLORS.danger,
  'Confirmed': COLORS.confirmed,
};

const SERVICE_COLORS: Record<string, string> = {
  'Servicing': COLORS.primary,
  'Repair': COLORS.secondary,
  'Checkup': COLORS.success,
  'Wash': COLORS.warning,
};

// ─── Reusable Custom Tooltip Component ───────────────────────────────────────

interface DarkTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  prefix?: string;
  suffix?: string;
}

const DarkTooltip: React.FC<DarkTooltipProps> = ({ active, payload, label, prefix = '', suffix = '' }) => {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="dark-tooltip">
      <p className="tooltip-label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="tooltip-value" style={{ color: p.color || COLORS.primary }}>
          {p.name}: {prefix}{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}{suffix}
        </p>
      ))}
    </div>
  );
};

// ─── Loading Skeleton Component ──────────────────────────────────────────────

const LoadingSkeleton: React.FC = () => (
  <div className="analytics-container">
    <div className="analytics-header">
      <div className="skeleton-title-group">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-subtitle" />
      </div>
    </div>
    <div className="kpi-row">
      {[...Array(4)].map((_, i) => (
        <div className="kpi-card skeleton-card" key={i}>
          <div className="skeleton skeleton-icon" />
          <div className="skeleton-group">
            <div className="skeleton skeleton-label" />
            <div className="skeleton skeleton-value" />
          </div>
        </div>
      ))}
    </div>
    <div className="analytics-card full-width">
      <div className="skeleton skeleton-chart-header" />
      <div className="skeleton skeleton-chart" />
    </div>
  </div>
);

// ─── Error State Component ───────────────────────────────────────────────────

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => (
  <div className="analytics-container">
    <div className="error-state">
      <div className="error-icon">⚠️</div>
      <h2>Failed to Load Analytics</h2>
      <p>{message}</p>
      <button className="retry-btn" onClick={onRetry}>
        <FaSpinner className="retry-icon" /> Try Again
      </button>
    </div>
  </div>
);

// ─── Empty State Component ───────────────────────────────────────────────────

interface EmptyStateProps {
  message: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message }) => (
  <div className="analytics-container">
    <div className="empty-state">
      <div className="empty-icon">📊</div>
      <h2>No Data Available</h2>
      <p>{message}</p>
    </div>
  </div>
);

// ─── Date Range Picker Component ─────────────────────────────────────────────

interface DateRangePickerProps {
  dateRange: DateRange;
  onChange: (range: DateRange) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ dateRange, onChange }) => {
  const handleChange = (field: 'startDate' | 'endDate', value: string) => {
    onChange({ ...dateRange, [field]: value });
  };

  return (
    <div className="date-range-picker">
      <label className="date-input-group">
        <span className="date-label">From:</span>
        <input
          type="date"
          value={dateRange.startDate}
          onChange={(e) => handleChange('startDate', e.target.value)}
          className="date-input"
          aria-label="Start date"
        />
      </label>
      <label className="date-input-group">
        <span className="date-label">To:</span>
        <input
          type="date"
          value={dateRange.endDate}
          onChange={(e) => handleChange('endDate', e.target.value)}
          className="date-input"
          aria-label="End date"
        />
      </label>
    </div>
  );
};

// ─── Export Menu Component ───────────────────────────────────────────────────

interface ExportMenuProps {
  onExport: (format: 'csv' | 'pdf') => void;
  isLoading: boolean;
}

const ExportMenu: React.FC<ExportMenuProps> = ({ onExport, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="export-menu">
      <button
        className="export-btn"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        aria-label="Export data"
        aria-expanded={isOpen}
      >
        <FaDownload /> <span className="export-label">Export</span>
      </button>
      {isOpen && (
        <div className="export-dropdown">
          <button
            className="export-option"
            onClick={() => { onExport('csv'); setIsOpen(false); }}
            disabled={isLoading}
          >
            <FaFileCsv /> CSV
          </button>
          <button
            className="export-option"
            onClick={() => { onExport('pdf'); setIsOpen(false); }}
            disabled={isLoading}
          >
            <FaFilePdf /> PDF
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Main Analytics Component ────────────────────────────────────────────────

type RangeKey = 'weekly' | 'monthly';

const Analytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [revenueRange, setRevenueRange] = useState<RangeKey>('weekly');
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [exportLoading, setExportLoading] = useState(false);

  // Fetch analytics data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const analyticsData = await fetchAnalyticsData(dateRange, revenueRange);
      setData(analyticsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics data');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [dateRange, revenueRange]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle export
  const handleExport = async (format: 'csv' | 'pdf') => {
    if (!data) return;
    
    try {
      setExportLoading(true);
      await exportAnalytics(data, { format });
    } catch (err: any) {
      console.error('Export failed:', err);
      alert('Failed to export data. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  // Get revenue data key based on range
  const revenueKey = revenueRange === 'weekly' ? 'day' : 'month';

  // Check if data is empty
  const isEmpty = !data || (
    data.revenue.length === 0 &&
    data.status.length === 0 &&
    data.serviceTypes.length === 0 &&
    data.appointmentsTrend.length === 0
  );

  // Render loading state
  if (loading) {
    return <LoadingSkeleton />;
  }

  // Render error state
  if (error && !data) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  // Render empty state
  if (isEmpty) {
    return <EmptyState message="No analytics data available for the selected period." />;
  }

  return (
    <>
      <Sidebar />
      <div className="analytics-container">

        {/* ── Page Header ── */}
        <div className="analytics-header">
          <div>
            <h1 className="analytics-title">
              <FaChartBar className="title-icon" /> Analytics
            </h1>
            <p className="analytics-subtitle">Detailed performance breakdown for your workshop</p>
          </div>
          <div className="header-actions">
            <DateRangePicker dateRange={dateRange} onChange={setDateRange} />
            <ExportMenu onExport={handleExport} isLoading={exportLoading} />
          </div>
        </div>

        {/* ── Summary KPI Row ── */}
        <div className="kpi-row">
          {[
            { 
              icon: <FaDollarSign />, 
              label: 'Total Revenue', 
              value: `Rs. ${(data!.kpiMetrics.totalRevenue / 1000).toFixed(0)}k`, 
              color: COLORS.primary 
            },
            { 
              icon: <FaCalendarAlt />, 
              label: 'Total Appointments', 
              value: data!.kpiMetrics.totalAppointments, 
              color: COLORS.secondary 
            },
            { 
              icon: <FaCheckCircle />, 
              label: 'Completion Rate', 
              value: `${data!.kpiMetrics.completionRate}%`, 
              color: COLORS.success 
            },
            { 
              icon: <FaTools />, 
              label: 'Avg Daily Services', 
              value: data!.kpiMetrics.avgDailyServices, 
              color: COLORS.warning 
            },
          ].map(({ icon, label, value, color }) => (
            <div className="kpi-card" key={label}>
              <div className="kpi-icon" style={{ color, background: `${color}18` }} aria-hidden="true">{icon}</div>
              <div>
                <p className="kpi-label">{label}</p>
                <h3 className="kpi-value" style={{ color }} aria-label={`${label}: ${value}`}>{value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* ── Revenue Chart (full width) ── */}
        <div className="analytics-card full-width">
          <div className="analytics-card-header">
            <div>
              <h2 className="analytics-card-title">Revenue Overview</h2>
              <p className="analytics-card-subtitle">
                {revenueRange === 'weekly' ? 'This week vs last week' : 'Monthly revenue for the selected period'}
              </p>
            </div>
            <div className="range-toggle" role="group" aria-label="Revenue time range">
              {(['weekly', 'monthly'] as RangeKey[]).map(r => (
                <button
                  key={r}
                  className={`range-btn ${revenueRange === r ? 'active' : ''}`}
                  onClick={() => setRevenueRange(r)}
                  aria-pressed={revenueRange === r}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data!.revenue as RevenueDataPoint[]} barSize={revenueRange === 'weekly' ? 24 : 18}
              margin={{ top: 8, right: 12, left: -5, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
              <XAxis 
                dataKey={revenueKey} 
                tick={{ fill: '#6c757d', fontSize: 12 }} 
                axisLine={false} 
                tickLine={false}
                aria-label="Time period"
              />
              <YAxis 
                tick={{ fill: '#6c757d', fontSize: 11 }} 
                axisLine={false} 
                tickLine={false}
                tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                aria-label="Revenue amount"
              />
              <Tooltip content={<DarkTooltip prefix="Rs. " />} cursor={{ fill: 'rgba(16, 148, 230, 0.06)' }} />
              <Bar 
                dataKey="revenue" 
                fill={COLORS.primary} 
                radius={[6, 6, 0, 0]} 
                name="Revenue"
                aria-label="Current revenue"
              />
              {revenueRange === 'weekly' && (
                <Bar 
                  dataKey="lastWeek" 
                  fill="rgba(79,195,247,0.25)" 
                  radius={[6, 6, 0, 0]} 
                  name="Last Week"
                  aria-label="Last week revenue"
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ── Middle Row: Status Donut + Appointments Trend ── */}
        <div className="analytics-two-col">

          {/* Status Distribution */}
          <div className="analytics-card">
            <div className="analytics-card-header">
              <div>
                <h2 className="analytics-card-title">Status Distribution</h2>
                <p className="analytics-card-subtitle">All-time appointment statuses</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie 
                  data={data!.status as StatusDataPoint[]} 
                  cx="50%" 
                  cy="48%" 
                  innerRadius={65} 
                  outerRadius={100}
                  paddingAngle={3} 
                  dataKey="value"
                  aria-label="Status distribution chart"
                >
                  {data!.status.map((entry, i) => (
                    <Cell key={i} fill={entry.color || STATUS_COLORS[entry.name] || COLORS.primary} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v, n) => [`${v ?? 0} appointments`, n]}
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid #e9ecef',
                    borderRadius: 8,
                    fontSize: 13,
                    color: '#333',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Legend 
                  iconType="circle" 
                  iconSize={8}
                  formatter={(v) => <span style={{ color: '#495057', fontSize: 12 }}>{v}</span>}
                  aria-label="Status legend"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Appointments Trend */}
          <div className="analytics-card">
            <div className="analytics-card-header">
              <div>
                <h2 className="analytics-card-title">Appointments Trend</h2>
                <p className="analytics-card-subtitle">Weekly volume over time</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data!.appointmentsTrend as AppointmentTrendDataPoint[]} margin={{ top: 8, right: 12, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="apptGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.secondary} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.secondary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                <XAxis 
                  dataKey={data!.appointmentsTrend[0]?.week ? 'week' : 'date'} 
                  tick={{ fill: '#6c757d', fontSize: 12 }} 
                  axisLine={false} 
                  tickLine={false}
                  aria-label="Time period"
                />
                <YAxis 
                  tick={{ fill: '#6c757d', fontSize: 11 }} 
                  axisLine={false} 
                  tickLine={false}
                  aria-label="Appointment count"
                />
                <Tooltip content={<DarkTooltip suffix=" appts" />} cursor={{ stroke: 'rgba(16, 148, 230, 0.15)' }} />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke={COLORS.secondary} 
                  strokeWidth={2.5}
                  fill="url(#apptGrad)" 
                  name="Appointments" 
                  dot={{ fill: COLORS.secondary, r: 4 }}
                  aria-label="Appointments trend"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Service Type Breakdown (horizontal bars) ── */}
        <div className="analytics-card full-width">
          <div className="analytics-card-header">
            <div>
              <h2 className="analytics-card-title">Service Type Breakdown</h2>
              <p className="analytics-card-subtitle">Number of bookings per service category</p>
            </div>
          </div>
          <div className="service-breakdown-list" role="list" aria-label="Service type breakdown">
            {data!.serviceTypes.map(({ name, count, color }) => {
              const max = Math.max(...data!.serviceTypes.map(d => d.count));
              const pct = Math.round((count / max) * 100);
              return (
                <div className="service-breakdown-row" key={name} role="listitem">
                  <span className="sb-label">{name}</span>
                  <div className="sb-bar-track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                    <div className="sb-bar-fill" style={{ width: `${pct}%`, background: color || SERVICE_COLORS[name] || COLORS.primary }} />
                  </div>
                  <span className="sb-count" style={{ color: color || SERVICE_COLORS[name] || COLORS.primary }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </>
  );
};

export default Analytics;
