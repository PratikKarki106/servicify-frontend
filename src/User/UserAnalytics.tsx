import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './UserAnalytics.css';
import UserSideTop from './UserSideTop';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import {
  FaWallet,
  FaCalendarCheck,
  FaClock,
  FaChartPie,
  FaDownload,
  FaFileCsv,
  FaFilePdf,
  FaSpinner,
  FaArrowUp,
  FaArrowDown,
  FaCheckCircle,
  FaExclamationCircle
} from 'react-icons/fa';
import {
  fetchUserAnalyticsData,
  exportUserAnalytics,
  type UserAnalyticsResponse,
  type DateRange
} from '../services/UserAnalytics';

// ─── Color Constants ─────────────────────────────────────────────────────────

const USER_COLORS = {
  primary: '#8b5cf6',
  secondary: '#06b6d4',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  purple: '#a855f7',
  pink: '#ec4899',
};

const SERVICE_COLORS: Record<string, string> = {
  'Servicing': USER_COLORS.primary,
  'Repair': USER_COLORS.secondary,
  'Checkup': USER_COLORS.success,
  'Wash': USER_COLORS.warning,
  'Installation': USER_COLORS.purple,
  'Maintenance': USER_COLORS.info,
};

// ─── Custom Tooltip Component ───────────────────────────────────────────────

interface UserTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  prefix?: string;
  suffix?: string;
}

const UserChartTooltip: React.FC<UserTooltipProps> = ({ active, payload, label, prefix = '', suffix = '' }) => {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="useranalytics-chart-tooltip">
      <p className="useranalytics-tooltip-label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="useranalytics-tooltip-value" style={{ color: p.color || USER_COLORS.primary }}>
          {p.name}: {prefix}{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}{suffix}
        </p>
      ))}
    </div>
  );
};

// ─── Loading Skeleton Component ──────────────────────────────────────────────

const UserAnalyticsSkeleton: React.FC = () => (
  <UserSideTop>
    <div className="useranalytics-container">
      <div className="useranalytics-header">
        <div className="useranalytics-skeleton-title-group">
          <div className="useranalytics-skeleton useranalytics-skeleton-title" />
          <div className="useranalytics-skeleton useranalytics-skeleton-subtitle" />
        </div>
      </div>
      <div className="useranalytics-kpi-row">
        {[...Array(4)].map((_, i) => (
          <div className="useranalytics-kpi-card useranalytics-skeleton-card" key={i}>
            <div className="useranalytics-skeleton useranalytics-skeleton-icon" />
            <div className="useranalytics-skeleton-group">
              <div className="useranalytics-skeleton useranalytics-skeleton-label" />
              <div className="useranalytics-skeleton useranalytics-skeleton-value" />
            </div>
          </div>
        ))}
      </div>
      <div className="useranalytics-card useranalytics-full-width">
        <div className="useranalytics-skeleton useranalytics-skeleton-chart-header" />
        <div className="useranalytics-skeleton useranalytics-skeleton-chart" />
      </div>
    </div>
  </UserSideTop>
);

// ─── Error State Component ───────────────────────────────────────────────────

interface UserErrorStateProps {
  message: string;
  onRetry: () => void;
}

const UserAnalyticsError: React.FC<UserErrorStateProps> = ({ message, onRetry }) => (
  <UserSideTop>
    <div className="useranalytics-container">
      <div className="useranalytics-error-state">
        <div className="useranalytics-error-icon">⚠️</div>
        <h2 className="useranalytics-error-title">Failed to Load Analytics</h2>
        <p className="useranalytics-error-message">{message}</p>
        <button className="useranalytics-retry-btn" onClick={onRetry}>
          <FaSpinner className="useranalytics-retry-icon" /> Try Again
        </button>
      </div>
    </div>
  </UserSideTop>
);

// ─── Empty State Component ───────────────────────────────────────────────────

interface UserEmptyStateProps {
  message: string;
}

const UserAnalyticsEmpty: React.FC<UserEmptyStateProps> = ({ message }) => (
  <UserSideTop>
    <div className="useranalytics-container">
      <div className="useranalytics-empty-state">
        <div className="useranalytics-empty-icon">📊</div>
        <h2 className="useranalytics-empty-title">No Data Available</h2>
        <p className="useranalytics-empty-message">{message}</p>
      </div>
    </div>
  </UserSideTop>
);

// ─── Date Range Picker Component ─────────────────────────────────────────────

interface UserDateRangePickerProps {
  dateRange: DateRange;
  onChange: (range: DateRange) => void;
}

const UserDateRangePicker: React.FC<UserDateRangePickerProps> = ({ dateRange, onChange }) => {
  const handleChange = (field: 'startDate' | 'endDate', value: string) => {
    onChange({ ...dateRange, [field]: value });
  };

  return (
    <div className="useranalytics-date-range-picker">
      <label className="useranalytics-date-input-group">
        <span className="useranalytics-date-label">From:</span>
        <input
          type="date"
          value={dateRange.startDate}
          onChange={(e) => handleChange('startDate', e.target.value)}
          className="useranalytics-date-input"
          aria-label="Start date"
        />
      </label>
      <label className="useranalytics-date-input-group">
        <span className="useranalytics-date-label">To:</span>
        <input
          type="date"
          value={dateRange.endDate}
          onChange={(e) => handleChange('endDate', e.target.value)}
          className="useranalytics-date-input"
          aria-label="End date"
        />
      </label>
    </div>
  );
};

// ─── Export Menu Component ───────────────────────────────────────────────────

interface UserExportMenuProps {
  onExport: (format: 'csv' | 'pdf') => void;
  isLoading: boolean;
}

const UserExportMenu: React.FC<UserExportMenuProps> = ({ onExport, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="useranalytics-export-menu">
      <button
        className="useranalytics-export-btn"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        aria-label="Export data"
        aria-expanded={isOpen}
      >
        <FaDownload /> <span className="useranalytics-export-label">Export</span>
      </button>
      {isOpen && (
        <div className="useranalytics-export-dropdown">
          <button
            className="useranalytics-export-option"
            onClick={() => { onExport('csv'); setIsOpen(false); }}
            disabled={isLoading}
          >
            <FaFileCsv /> CSV
          </button>
          <button
            className="useranalytics-export-option"
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

// ─── Spending Comparison Card Component ──────────────────────────────────────

interface SpendingComparisonProps {
  currentPeriod: number;
  previousPeriod: number;
  label: string;
}

const UserSpendingComparison: React.FC<SpendingComparisonProps> = ({ currentPeriod, previousPeriod, label }) => {
  const percentageChange = previousPeriod > 0 
    ? ((currentPeriod - previousPeriod) / previousPeriod * 100).toFixed(1)
    : '0';
  
  const isIncreasing = parseFloat(percentageChange) > 0;
  const isDecreasing = parseFloat(percentageChange) < 0;

  return (
    <div className="useranalytics-spending-comparison">
      <div className="useranalytics-comparison-header">
        <span className="useranalytics-comparison-label">{label}</span>
        <div className={`useranalytics-comparison-indicator ${isIncreasing ? 'useranalytics-increasing' : isDecreasing ? 'useranalytics-decreasing' : ''}`}>
          {isIncreasing ? <FaArrowUp /> : isDecreasing ? <FaArrowDown /> : null}
          <span className="useranalytics-comparison-percentage">{Math.abs(parseFloat(percentageChange))}%</span>
        </div>
      </div>
      <div className="useranalytics-comparison-values">
        <div className="useranalytics-comparison-current">
          <span className="useranalytics-value-label">Current</span>
          <span className="useranalytics-value-amount">Rs. {currentPeriod.toLocaleString()}</span>
        </div>
        <div className="useranalytics-comparison-previous">
          <span className="useranalytics-value-label">Previous</span>
          <span className="useranalytics-value-amount">Rs. {previousPeriod.toLocaleString()}</span>
        </div>
      </div>
      <div className="useranalytics-comparison-bar-container">
        <div className="useranalytics-comparison-bar-wrapper">
          <div 
            className="useranalytics-comparison-bar-fill useranalytics-current-bar" 
            style={{ width: `${Math.min((currentPeriod / Math.max(currentPeriod, previousPeriod)) * 100, 100)}%` }}
          />
        </div>
        <div className="useranalytics-comparison-bar-wrapper">
          <div 
            className="useranalytics-comparison-bar-fill useranalytics-previous-bar" 
            style={{ width: `${Math.min((previousPeriod / Math.max(currentPeriod, previousPeriod)) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// ─── Main UserAnalytics Component ────────────────────────────────────────────

type RangeKey = 'weekly' | 'monthly';

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const YEAR_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

const UserAnalytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<UserAnalyticsResponse | null>(null);
  const [spendingRange, setSpendingRange] = useState<RangeKey>('weekly');
  const [exportLoading, setExportLoading] = useState(false);

  // Fetch analytics data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const analyticsData = await fetchUserAnalyticsData(undefined, spendingRange);
      setData(analyticsData);
    } catch (err: any) {
      console.error('[UserAnalytics] Error fetching data:', err);
      setError(err.message || 'Failed to load analytics data');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [spendingRange]);

  useEffect(() => {
    loadData();
  }, [spendingRange, loadData]);

  // Handle export
  const handleExport = async (format: 'csv' | 'pdf') => {
    if (!data) return;

    try {
      setExportLoading(true);
      await exportUserAnalytics(data, { format });
    } catch (err: any) {
      console.error('Export failed:', err);
      alert('Failed to export data. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  // Get spending data key based on range
  const spendingKey = spendingRange === 'weekly' ? 'day' : 'month';
  const normalizedSpendingHistory = useMemo(() => {
    if (!data?.spendingHistory?.length) {
      return spendingRange === 'weekly'
        ? WEEK_DAYS.map((day) => ({ day, amount: 0 }))
        : YEAR_MONTHS.map((month) => ({ month, amount: 0 }));
    }

    if (spendingRange === 'weekly') {
      const totalsByDay = new Map<string, number>();
      data.spendingHistory.forEach((point) => {
        const key = point.day || '';
        if (!key) return;
        totalsByDay.set(key, (totalsByDay.get(key) || 0) + Number(point.amount || 0));
      });

      return WEEK_DAYS.map((day) => ({
        day,
        amount: totalsByDay.get(day) || 0,
      }));
    }

    const totalsByMonth = new Map<string, number>();
    data.spendingHistory.forEach((point) => {
      const key = point.month || '';
      if (!key) return;
      totalsByMonth.set(key, (totalsByMonth.get(key) || 0) + Number(point.amount || 0));
    });

    return YEAR_MONTHS.map((month) => ({
      month,
      amount: totalsByMonth.get(month) || 0,
    }));
  }, [data?.spendingHistory, spendingRange]);

  // Check if data is empty
  const isEmpty = !data || (
    normalizedSpendingHistory.every((point) => point.amount === 0) &&
    data.serviceUsage.length === 0 &&
    data.monthlyComparison.length === 0
  );

  // Render loading state
  if (loading) {
    return <UserAnalyticsSkeleton />;
  }

  // Render error state
  if (error && !data) {
    return <UserAnalyticsError message={error} onRetry={loadData} />;
  }

  // Render empty state
  if (isEmpty) {
    return <UserAnalyticsEmpty message="No analytics data available for the selected period." />;
  }

  return (
    <UserSideTop>
      <div className="useranalytics-container">

        {/* ── Page Header ── */}
        <div className="useranalytics-header">
          <div className="useranalytics-title-section">
            <h1 className="useranalytics-main-title">
              <FaChartPie className="useranalytics-title-icon" /> My Analytics
            </h1>
            <p className="useranalytics-page-subtitle">Track your service usage and spending patterns</p>
          </div>
        </div>

        {/* ── Summary KPI Row ── */}
        <div className="useranalytics-kpi-row">
          {[
            {
              icon: <FaWallet />,
              label: 'Total Spent',
              value: `Rs. ${(data!.kpiMetrics.totalSpent).toLocaleString()}`,
              color: USER_COLORS.primary,
              trend: data!.kpiMetrics.spendingTrend
            },
            {
              icon: <FaCalendarCheck />,
              label: 'Total Services',
              value: data!.kpiMetrics.totalServices.toLocaleString(),
              color: USER_COLORS.success,
              trend: data!.kpiMetrics.serviceTrend
            },
            {
              icon: <FaClock />,
              label: 'Active Services',
              value: data!.kpiMetrics.activeServices.toLocaleString(),
              color: USER_COLORS.info,
              trend: 'stable'
            },
          ].map(({ icon, label, value, color, trend }) => (
            <div className="useranalytics-kpi-card" key={label}>
              <div className="useranalytics-kpi-header">
                <div className="useranalytics-kpi-icon-wrapper" style={{ color, background: `${color}18` }}>
                  {icon}
                </div>
                {trend && trend !== 'stable' && (
                  <div className={`useranalytics-kpi-trend ${trend === 'up' ? 'useranalytics-trend-up' : 'useranalytics-trend-down'}`}>
                    {trend === 'up' ? <FaArrowUp /> : <FaArrowDown />}
                  </div>
                )}
              </div>
              <div className="useranalytics-kpi-content">
                <p className="useranalytics-kpi-label">{label}</p>
                <h3 className="useranalytics-kpi-value" style={{ color }}>{value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* ── Spending Overview Chart ── */}
        <div className="useranalytics-card useranalytics-full-width">
          <div className="useranalytics-card-header">
            <div className="useranalytics-chart-title-section">
              <h2 className="useranalytics-chart-title">Spending Overview</h2>
              <p className="useranalytics-chart-subtitle">
                {spendingRange === 'weekly' ? 'Daily spending this week' : 'Monthly spending pattern'}
              </p>
            </div>
            <div className="useranalytics-range-toggle" role="group" aria-label="Spending time range">
              {(['weekly', 'monthly'] as RangeKey[]).map(r => (
                <button
                  key={r}
                  className={`useranalytics-range-btn ${spendingRange === r ? 'useranalytics-active' : ''}`}
                  onClick={() => setSpendingRange(r)}
                  aria-pressed={spendingRange === r}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={normalizedSpendingHistory} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="spendingGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={USER_COLORS.primary} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={USER_COLORS.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
              <XAxis
                dataKey={spendingKey}
                tick={{ fill: '#6c757d', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                aria-label="Time period"
              />
              <YAxis
                tick={{ fill: '#6c757d', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `Rs. ${v}`}
                aria-label="Spending amount"
              />
              <Tooltip content={<UserChartTooltip prefix="Rs. " />} cursor={{ stroke: 'rgba(139, 92, 246, 0.2)', strokeWidth: 2 }} />
              <Area
                type="monotone"
                dataKey="amount"
                stroke={USER_COLORS.primary}
                strokeWidth={3}
                fill="url(#spendingGrad)"
                name="Spent"
                aria-label="Spending trend"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ── Middle Row: Service Usage + Monthly Comparison ── */}
        <div className="useranalytics-two-column">

          {/* Service Usage Distribution */}
          <div className="useranalytics-card">
            <div className="useranalytics-card-header">
              <div>
                <h2 className="useranalytics-card-title">Service Usage</h2>
                <p className="useranalytics-card-subtitle">Services you've used most</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data!.serviceUsage}
                  cx="50%"
                  cy="45%"
                  innerRadius={70}
                  outerRadius={105}
                  paddingAngle={4}
                  dataKey="count"
                  aria-label="Service usage chart"
                >
                  {data!.serviceUsage.map((entry, i) => (
                    <Cell key={i} fill={entry.color || SERVICE_COLORS[entry.name] || USER_COLORS.primary} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v, n) => [`${v ?? 0} services`, n]}
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
                  iconSize={9}
                  formatter={(v) => <span style={{ color: '#495057', fontSize: 12 }}>{v}</span>}
                  aria-label="Service usage legend"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Comparison */}
          <div className="useranalytics-card">
            <div className="useranalytics-card-header">
              <div>
                <h2 className="useranalytics-card-title">Monthly Comparison</h2>
                <p className="useranalytics-card-subtitle">This month vs last month</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data!.monthlyComparison} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                <XAxis
                  dataKey="category"
                  tick={{ fill: '#6c757d', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  aria-label="Service category"
                />
                <YAxis
                  tick={{ fill: '#6c757d', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `${v}`}
                  aria-label="Service count"
                />
                <Tooltip content={<UserChartTooltip suffix=" services" />} cursor={{ fill: 'rgba(139, 92, 246, 0.08)' }} />
                <Legend />
                <Bar
                  dataKey="thisMonth"
                  fill={USER_COLORS.primary}
                  radius={[6, 6, 0, 0]}
                  name="This Month"
                  aria-label="Current month services"
                />
                <Bar
                  dataKey="lastMonth"
                  fill="rgba(139, 92, 246, 0.3)"
                  radius={[6, 6, 0, 0]}
                  name="Last Month"
                  aria-label="Last month services"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Spending Comparison Card ── */}
        <div className="useranalytics-card useranalytics-full-width">
          <div className="useranalytics-card-header">
            <div>
              <h2 className="useranalytics-card-title">Spending Analysis</h2>
              <p className="useranalytics-card-subtitle">Compare your spending across periods</p>
            </div>
          </div>
          <div className="useranalytics-spending-grid">
            <UserSpendingComparison
              label="Weekly Spending"
              currentPeriod={data!.spendingComparison.weekly.current}
              previousPeriod={data!.spendingComparison.weekly.previous}
            />
            <UserSpendingComparison
              label="Monthly Spending"
              currentPeriod={data!.spendingComparison.monthly.current}
              previousPeriod={data!.spendingComparison.monthly.previous}
            />
          </div>
        </div>

        {/* ── Service Type Breakdown ── */}
        <div className="useranalytics-card useranalytics-full-width">
          <div className="useranalytics-card-header">
            <div>
              <h2 className="useranalytics-card-title">Service Categories</h2>
              <p className="useranalytics-card-subtitle">Your usage by service type</p>
            </div>
          </div>
          <div className="useranalytics-category-list" role="list" aria-label="Service category breakdown">
            {data!.serviceCategories.map(({ name, count, totalAmount }) => {
              const maxCount = Math.max(...data!.serviceCategories.map(d => d.count));
              const pct = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
              return (
                <div className="useranalytics-category-row" key={name} role="listitem">
                  <span className="useranalytics-category-label">{name}</span>
                  <div className="useranalytics-category-bar-track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                    <div 
                      className="useranalytics-category-bar-fill" 
                      style={{ 
                        width: `${pct}%`, 
                        background: `linear-gradient(90deg, ${SERVICE_COLORS[name] || USER_COLORS.primary}, ${SERVICE_COLORS[name] || USER_COLORS.primary}88)` 
                      }} 
                    />
                  </div>
                  <div className="useranalytics-category-stats">
                    <span className="useranalytics-category-count">{count} services</span>
                    <span className="useranalytics-category-amount">Rs. {totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Recent Activity Radar Chart ── */}
        {data!.activityRadar && data!.activityRadar.length > 0 && (
          <div className="useranalytics-card useranalytics-full-width">
            <div className="useranalytics-card-header">
              <div>
                <h2 className="useranalytics-card-title">Activity Overview</h2>
                <p className="useranalytics-card-subtitle">Your service activity across different dimensions</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data!.activityRadar}>
                <PolarGrid stroke="rgba(0,0,0,0.1)" />
                <PolarAngleAxis dataKey="dimension" tick={{ fill: '#6c757d', fontSize: 11 }} />
                <PolarRadiusAxis angle={90} domain={[0, 'auto']} tick={{ fill: '#6c757d', fontSize: 10 }} />
                <Radar
                  name="Your Activity"
                  dataKey="value"
                  stroke={USER_COLORS.primary}
                  strokeWidth={2}
                  fill={USER_COLORS.primary}
                  fillOpacity={0.4}
                  dot={{ r: 4, fill: USER_COLORS.primary }}
                />
                <Tooltip content={<UserChartTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ── Quick Stats Summary ── */}
        <div className="useranalytics-card useranalytics-full-width">
          <div className="useranalytics-card-header">
            <div>
              <h2 className="useranalytics-card-title">Quick Stats</h2>
              <p className="useranalytics-card-subtitle">Your service journey at a glance</p>
            </div>
          </div>
          <div className="useranalytics-stats-grid">
            <div className="useranalytics-stat-item">
              <div className="useranalytics-stat-icon" style={{ background: `${USER_COLORS.success}18`, color: USER_COLORS.success }}>
                <FaCheckCircle />
              </div>
              <div className="useranalytics-stat-content">
                <span className="useranalytics-stat-value">{data!.quickStats.completedServices}</span>
                <span className="useranalytics-stat-label">Completed Services</span>
              </div>
            </div>
            <div className="useranalytics-stat-item">
              <div className="useranalytics-stat-icon" style={{ background: `${USER_COLORS.info}18`, color: USER_COLORS.info }}>
                <FaClock />
              </div>
              <div className="useranalytics-stat-content">
                <span className="useranalytics-stat-value">{data!.quickStats.ongoingServices}</span>
                <span className="useranalytics-stat-label">Ongoing Services</span>
              </div>
            </div>
            <div className="useranalytics-stat-item">
              <div className="useranalytics-stat-icon" style={{ background: `${USER_COLORS.danger}18`, color: USER_COLORS.danger }}>
                <FaExclamationCircle />
              </div>
              <div className="useranalytics-stat-content">
                <span className="useranalytics-stat-value">{data!.quickStats.cancelledServices}</span>
                <span className="useranalytics-stat-label">Cancelled Services</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </UserSideTop>
  );
};

export default UserAnalytics;
