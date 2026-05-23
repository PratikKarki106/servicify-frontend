import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import './Analytics.css';
import Sidebar from '../components/Sidebar';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
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
  FaSpinner,
} from 'react-icons/fa';
import { fetchAnalyticsData, exportAnalytics } from '../services/Analytics';
import type {
  AnalyticsResponse,
  RevenueDataPoint,
  StatusDataPoint,
  AppointmentTrendDataPoint,
} from '../services/Analytics';

const COLORS = {
  primary: '#4fc3f7',
  secondary: '#7c3aed',
  success: '#00796B',
  warning: '#f59e0b',
  danger: '#C62828',
  confirmed: '#2E7D32',
  pending: '#1565C0',
};

const STATUS_COLORS: Record<string, { fill: string; stroke: string }> = {
  completed: { fill: '#d1fae5', stroke: '#10b981' },
  'in-progress': { fill: '#fef3c7', stroke: '#f59e0b' },
  booked: { fill: '#f1f5f9', stroke: '#64748b' },
  cancelled: { fill: '#fee2e2', stroke: '#ef4444' },
  confirmed: { fill: '#dbeafe', stroke: '#1094E6' },
  payment: { fill: '#ede9fe', stroke: '#8b5cf6' },
};

const SERVICE_TYPE_COLORS: Record<string, { fill: string; stroke: string }> = {
  servicing: { fill: '#dbeafe', stroke: '#1094E6' }, // Blue
  repair: { fill: '#fee2e2', stroke: '#ef4444' },    // Red
  'check up': { fill: '#d1fae5', stroke: '#10b981' }, // Green
  checkup: { fill: '#d1fae5', stroke: '#10b981' },    // Green (fallback)
  wash: { fill: '#f073ba', stroke: '#f1027a' },       // Pink
};

const DarkTooltip: React.FC<{
  active?: boolean;
  payload?: Array<{ color?: string; name?: string; value?: string | number }>;
  label?: string;
  prefix?: string;
  suffix?: string;
}> = ({ active, payload, label, prefix = '', suffix = '' }) => {
  if (!active || !payload?.length) return null;
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

const PieTooltip: React.FC<{
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    payload?: any;
    color?: string;
  }>;
  suffix?: string;
}> = ({ active, payload, suffix = '' }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const rawName = item.name || '';
  const label = rawName === 'in-progress' ? 'In Progress' : rawName.charAt(0).toUpperCase() + rawName.slice(1);
  const val = item.value ?? 0;
  
  const rawKey = rawName.toLowerCase();
  const colors = STATUS_COLORS[rawKey] || SERVICE_TYPE_COLORS[rawKey] || { stroke: item.color || '#1094E6' };
  const indicatorColor = colors.stroke;
  
  return (
    <div className="dark-tooltip" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span 
        style={{ 
          display: 'inline-block', 
          width: '8px', 
          height: '8px', 
          borderRadius: '50%', 
          backgroundColor: indicatorColor 
        }} 
      />
      <span style={{ fontWeight: 600, color: '#f8fafc' }}>{label}:</span>
      <span style={{ color: '#cbd5e1', fontWeight: 500 }}>{val.toLocaleString()} {suffix}</span>
    </div>
  );
};

const KpiSkeletonRow: React.FC = () => (
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
);

const ChartsSkeleton: React.FC = () => (
  <>
    <div className="analytics-card full-width">
      <div className="skeleton skeleton-chart-header" />
      <div className="skeleton skeleton-chart" />
    </div>
    <div className="analytics-two-col">
      <div className="analytics-card"><div className="skeleton skeleton-chart" /></div>
      <div className="analytics-card"><div className="skeleton skeleton-chart" /></div>
    </div>
    <div className="analytics-card full-width">
      <div className="skeleton skeleton-chart-header" />
      <div className="skeleton skeleton-chart" />
    </div>
  </>
);



const ExportMenu: React.FC<{ onExport: (format: 'csv' | 'pdf') => void; isLoading: boolean }> = ({ onExport, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="export-menu">
      <button className="export-btn" onClick={() => setIsOpen(!isOpen)} disabled={isLoading}>
        <FaDownload /> <span className="export-label">Export</span>
      </button>
      {isOpen && (
        <div className="export-dropdown">
          <button className="export-option" onClick={() => { onExport('csv'); setIsOpen(false); }} disabled={isLoading}>
            <FaFileCsv /> CSV
          </button>
          <button className="export-option" onClick={() => { onExport('pdf'); setIsOpen(false); }} disabled={isLoading}>
            <FaFilePdf /> PDF
          </button>
        </div>
      )}
    </div>
  );
};

type RangeKey = 'daily' | 'weekly' | 'monthly';

const Analytics: React.FC = () => {
  const [timeFrame, setTimeFrame] = useState<RangeKey>('weekly');
  const [revenueRange, setRevenueRange] = useState<'weekly' | 'monthly'>('weekly');
  const [exportLoading, setExportLoading] = useState(false);

  const analyticsQuery = useQuery({
    queryKey: ['analytics', timeFrame],
    queryFn: () => fetchAnalyticsData(undefined, timeFrame),
    placeholderData: (previousData) => previousData,
  });

  const revenueQuery = useQuery({
    queryKey: ['revenue', revenueRange],
    queryFn: () => fetchAnalyticsData(undefined, revenueRange),
    placeholderData: (previousData) => previousData,
  });

  const data = analyticsQuery.data as AnalyticsResponse | undefined;
  const revenueData = revenueQuery.data as AnalyticsResponse | undefined;
  const isInitialLoading = analyticsQuery.isLoading && !data;
  const isRefreshing = (analyticsQuery.isFetching || revenueQuery.isFetching) && !!data;
  const revenueKey = revenueRange === 'monthly' ? 'month' : 'day';

  const isEmpty = !data || (
    data.revenue.length === 0 &&
    data.status.length === 0 &&
    data.serviceTypes.length === 0 &&
    data.appointmentsTrend.length === 0
  );

  const handleExport = async (format: 'csv' | 'pdf') => {
    if (!data) return;
    try {
      setExportLoading(true);
      await exportAnalytics(data, { format });
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export data. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <>
      <Sidebar />
      <div className="analytics-container">
        <div className="analytics-header">
          <div>
            <h1 className="analytics-title"><FaChartBar className="title-icon" /> Analytics</h1>
            <p className="analytics-subtitle">Detailed performance breakdown</p>
          </div>
          <div className="header-actions">
            <div className="range-toggle global-toggle">
              {(['daily', 'weekly', 'monthly'] as RangeKey[]).map((r) => (
                <button
                  key={r}
                  className={`range-btn ${timeFrame === r ? 'active' : ''}`}
                  onClick={() => setTimeFrame(r)}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
            <ExportMenu onExport={handleExport} isLoading={exportLoading} />
          </div>
        </div>

        {isInitialLoading ? (
          <>
            <KpiSkeletonRow />
            <ChartsSkeleton />
          </>
        ) : analyticsQuery.isError && !data ? (
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h2>Failed to Load Analytics</h2>
            <p>{(analyticsQuery.error as Error)?.message || 'Failed to load analytics data'}</p>
            <button className="retry-btn" onClick={() => analyticsQuery.refetch()}>
              <FaSpinner className="retry-icon" /> Try Again
            </button>
          </div>
        ) : isEmpty ? (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h2>No Data Available</h2>
            <p>No analytics data available for the selected period.</p>
          </div>
        ) : (
          <>
            <div className="kpi-row">
              {[
                { icon: <FaDollarSign />, label: 'Total Revenue', value: `Rs. ${data!.kpiMetrics.totalRevenue.toLocaleString()}`, color: COLORS.primary },
                { icon: <FaCalendarAlt />, label: 'Total Appointments', value: data!.kpiMetrics.totalAppointments, color: COLORS.secondary },
                { icon: <FaCheckCircle />, label: 'Completion Rate', value: `${data!.kpiMetrics.completionRate}%`, color: COLORS.success },
                { icon: <FaTools />, label: 'Remaining Services', value: data!.kpiMetrics.remainingServices, color: COLORS.warning },
              ].map(({ icon, label, value, color }) => (
                <div className="kpi-card" key={label}>
                  <div className="kpi-icon" style={{ color, background: `${color}18` }}>{icon}</div>
                  <div>
                    <p className="kpi-label">{label}</p>
                    <h3 className="kpi-value" style={{ color }}>{value}</h3>
                  </div>
                </div>
              ))}
            </div>

            {isRefreshing && (
              <div className="analytics-refresh-hint">
                <p><FaSpinner className="spin-icon" /> Updating analytics...</p>
              </div>
            )}

            <div className="analytics-card full-width">
              <div className="analytics-card-header">
                <div>
                  <h2 className="analytics-card-title">Revenue Overview</h2>
                  <p className="analytics-card-subtitle">
                    {revenueRange === 'weekly' ? 'Weekly revenue breakdown (Sun-Sat)' : 'Monthly revenue for the calendar year'}
                  </p>
                </div>
                <div className="range-toggle">
                  {(['weekly', 'monthly'] as ('weekly' | 'monthly')[]).map((r) => (
                    <button key={r} className={`range-btn ${revenueRange === r ? 'active' : ''}`} onClick={() => setRevenueRange(r)}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={(revenueData?.revenue || []) as RevenueDataPoint[]}
                  barSize={revenueRange === 'weekly' ? 32 : 24}
                  margin={{ top: 8, right: 12, left: -5, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                  <XAxis dataKey={revenueKey} tick={{ fill: '#6c757d', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6c757d', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `Rs. ${v.toLocaleString()}`} />
                  <Tooltip content={<DarkTooltip prefix="Rs. " />} cursor={{ fill: 'rgba(16, 148, 230, 0.06)' }} />
                  <Bar dataKey="revenue" fill={COLORS.primary} radius={[6, 6, 0, 0]} name="Revenue" />
                  {revenueRange === 'weekly' && <Bar dataKey="lastWeek" fill="rgba(79,195,247,0.25)" radius={[6, 6, 0, 0]} name="Last Week" />}
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="analytics-two-col">
              {/* Appointment Distribution */}
              <div className="analytics-card">
                <div className="analytics-card-header">
                  <div>
                    <h2 className="analytics-card-title">Appointment Distribution</h2>
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
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {data!.status.map((entry, i) => {
                        const statusKey = entry.name.toLowerCase();
                        const colors = STATUS_COLORS[statusKey] || { fill: COLORS.primary, stroke: COLORS.primary };
                        return (
                          <Cell
                            key={i}
                            fill={colors.fill}
                            stroke={colors.stroke}
                            strokeWidth={2}
                          />
                        );
                      })}
                    </Pie>
                    <Tooltip content={<PieTooltip suffix="appointments" />} />
                    <Legend
                      iconType="circle"
                      iconSize={10}
                      formatter={(v) => {
                        const label = v === 'in-progress' ? 'In Progress' : v.charAt(0).toUpperCase() + v.slice(1);
                        return <span style={{ color: '#495057', fontSize: 12, fontWeight: 500 }}>{label}</span>;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Service Type Distribution */}
              <div className="analytics-card">
                <div className="analytics-card-header">
                  <div>
                    <h2 className="analytics-card-title">Service Type Distribution</h2>
                    <p className="analytics-card-subtitle">All-time service bookings breakdown</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={data!.serviceTypes}
                      cx="50%"
                      cy="48%"
                      innerRadius={65}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="name"
                    >
                      {data!.serviceTypes.map((entry, i) => {
                        const typeKey = entry.name.toLowerCase();
                        const colors = SERVICE_TYPE_COLORS[typeKey] || { fill: COLORS.primary, stroke: COLORS.primary };
                        return (
                          <Cell
                            key={i}
                            fill={colors.fill}
                            stroke={colors.stroke}
                            strokeWidth={2}
                          />
                        );
                      })}
                    </Pie>
                    <Tooltip content={<PieTooltip suffix="bookings" />} />
                    <Legend
                      iconType="circle"
                      iconSize={10}
                      formatter={(v) => <span style={{ color: '#495057', fontSize: 12, fontWeight: 500 }}>{v}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Appointments Trend */}
            <div className="analytics-card full-width">
              <div className="analytics-card-header">
                <div>
                  <h2 className="analytics-card-title">Appointments Trend</h2>
                  <p className="analytics-card-subtitle">
                    {timeFrame === 'daily' ? 'Daily volume (Sun-Sat)' :
                      timeFrame === 'weekly' ? 'Weekly volume (1 Month)' :
                        'Monthly volume (1 Year)'}
                  </p>
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
                    dataKey={timeFrame === 'daily' ? 'day' : timeFrame === 'weekly' ? 'week' : 'month'}
                    tick={{ fill: '#6c757d', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis tick={{ fill: '#6c757d', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<DarkTooltip />} />
                  <Area type="monotone" dataKey="count" stroke={COLORS.secondary} strokeWidth={3} fillOpacity={1} fill="url(#apptGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Analytics;
