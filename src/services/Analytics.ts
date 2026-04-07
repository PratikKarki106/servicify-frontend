import axiosInstance from './axiosInstance';

// ─────────────────────────────────────────────────────────────────────────────
// TypeScript Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface RevenueDataPoint {
  day?: string;
  month?: string;
  revenue: number;
  lastWeek?: number;
}

export interface StatusDataPoint {
  name: string;
  value: number;
  color: string;
}

export interface ServiceTypeDataPoint {
  name: string;
  count: number;
  color: string;
}

export interface AppointmentTrendDataPoint {
  week?: string;
  date?: string;
  count: number;
}

export interface KpiMetrics {
  totalRevenue: number;
  totalAppointments: number;
  completionRate: number;
  avgDailyServices: number;
}

export interface AnalyticsResponse {
  revenue: RevenueDataPoint[];
  status: StatusDataPoint[];
  serviceTypes: ServiceTypeDataPoint[];
  appointmentsTrend: AppointmentTrendDataPoint[];
  kpiMetrics: KpiMetrics;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface ExportOptions {
  format: 'csv' | 'pdf';
  dateRange?: DateRange;
}

// ─────────────────────────────────────────────────────────────────────────────
// API Service Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch analytics data for the dashboard
 * @param dateRange - Optional date range filter
 * @param timeFrame - 'weekly' or 'monthly' view
 */
export const fetchAnalyticsData = async (
  dateRange?: DateRange,
  timeFrame: 'weekly' | 'monthly' = 'weekly'
): Promise<AnalyticsResponse> => {
  try {
    const params: any = { timeFrame };
    if (dateRange) {
      params.startDate = dateRange.startDate;
      params.endDate = dateRange.endDate;
    }

    const response = await axiosInstance.get<AnalyticsResponse>('/api/analytics/dashboard', { params });
    return response.data;
  } catch (error: any) {
    console.error('[Analytics Service] Error fetching analytics data:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch analytics data');
  }
};

/**
 * Fetch revenue data specifically
 * @param dateRange - Optional date range filter
 * @param timeFrame - 'weekly' or 'monthly' view
 */
export const fetchRevenueData = async (
  dateRange?: DateRange,
  timeFrame: 'weekly' | 'monthly' = 'weekly'
): Promise<RevenueDataPoint[]> => {
  try {
    const params: any = { timeFrame };
    if (dateRange) {
      params.startDate = dateRange.startDate;
      params.endDate = dateRange.endDate;
    }

    const response = await axiosInstance.get<RevenueDataPoint[]>('/api/analytics/revenue', { params });
    return response.data;
  } catch (error: any) {
    console.error('[Analytics Service] Error fetching revenue data:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch revenue data');
  }
};

/**
 * Fetch status distribution data
 */
export const fetchStatusDistribution = async (): Promise<StatusDataPoint[]> => {
  try {
    const response = await axiosInstance.get<StatusDataPoint[]>('/api/analytics/status-distribution');
    return response.data;
  } catch (error: any) {
    console.error('[Analytics Service] Error fetching status distribution:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch status distribution');
  }
};

/**
 * Fetch service type breakdown data
 */
export const fetchServiceTypeBreakdown = async (): Promise<ServiceTypeDataPoint[]> => {
  try {
    const response = await axiosInstance.get<ServiceTypeDataPoint[]>('/api/analytics/service-types');
    return response.data;
  } catch (error: any) {
    console.error('[Analytics Service] Error fetching service type breakdown:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch service type breakdown');
  }
};

/**
 * Fetch appointments trend data
 * @param dateRange - Optional date range filter
 */
export const fetchAppointmentsTrend = async (dateRange?: DateRange): Promise<AppointmentTrendDataPoint[]> => {
  try {
    const params: any = {};
    if (dateRange) {
      params.startDate = dateRange.startDate;
      params.endDate = dateRange.endDate;
    }

    const response = await axiosInstance.get<AppointmentTrendDataPoint[]>('/api/analytics/appointments-trend', { params });
    return response.data;
  } catch (error: any) {
    console.error('[Analytics Service] Error fetching appointments trend:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch appointments trend');
  }
};

/**
 * Fetch KPI metrics
 * @param dateRange - Optional date range filter
 */
export const fetchKpiMetrics = async (dateRange?: DateRange): Promise<KpiMetrics> => {
  try {
    const params: any = {};
    if (dateRange) {
      params.startDate = dateRange.startDate;
      params.endDate = dateRange.endDate;
    }

    const response = await axiosInstance.get<KpiMetrics>('/api/analytics/kpi-metrics', { params });
    return response.data;
  } catch (error: any) {
    console.error('[Analytics Service] Error fetching KPI metrics:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch KPI metrics');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Export Functionality
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Export analytics data to CSV
 * @param data - The analytics data to export
 * @param filename - Output filename (without extension)
 */
export const exportToCSV = (data: AnalyticsResponse, filename: string = 'analytics-report'): void => {
  try {
    // Create CSV content for Revenue
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    // Revenue Section
    csvContent += '\n=== REVENUE DATA ===\n';
    csvContent += 'Period,Revenue,Last Week\n';
    data.revenue.forEach(row => {
      const period = row.day || row.month || 'N/A';
      csvContent += `${period},${row.revenue},${row.lastWeek || ''}\n`;
    });

    // Status Distribution Section
    csvContent += '\n=== STATUS DISTRIBUTION ===\n';
    csvContent += 'Status,Count\n';
    data.status.forEach(row => {
      csvContent += `${row.name},${row.value}\n`;
    });

    // Service Types Section
    csvContent += '\n=== SERVICE TYPES ===\n';
    csvContent += 'Service Type,Count\n';
    data.serviceTypes.forEach(row => {
      csvContent += `${row.name},${row.count}\n`;
    });

    // Appointments Trend Section
    csvContent += '\n=== APPOINTMENTS TREND ===\n';
    csvContent += 'Period,Count\n';
    data.appointmentsTrend.forEach(row => {
      const period = row.week || row.date || 'N/A';
      csvContent += `${period},${row.count}\n`;
    });

    // KPI Metrics Section
    csvContent += '\n=== KPI METRICS ===\n';
    csvContent += 'Metric,Value\n';
    csvContent += `Total Revenue,${data.kpiMetrics.totalRevenue}\n`;
    csvContent += `Total Appointments,${data.kpiMetrics.totalAppointments}\n`;
    csvContent += `Completion Rate,${data.kpiMetrics.completionRate}%\n`;
    csvContent += `Avg Daily Services,${data.kpiMetrics.avgDailyServices}\n`;

    // Create and trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('[Analytics Export] CSV exported successfully');
  } catch (error) {
    console.error('[Analytics Export] Error exporting to CSV:', error);
    throw new Error('Failed to export data to CSV');
  }
};

/**
 * Export analytics data to PDF (using browser's print functionality)
 * Note: For production, consider using a library like jsPDF or react-pdf
 */
export const exportToPDF = async (data: AnalyticsResponse, filename: string = 'analytics-report'): Promise<void> => {
  try {
    // Create a printable version of the data
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Failed to open print window');
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Analytics Report - ${filename}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; background: #fff; color: #333; }
            h1 { color: #1e293b; border-bottom: 2px solid #4fc3f7; padding-bottom: 10px; }
            h2 { color: #334155; margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
            th { background: #f1f5f9; font-weight: 600; }
            .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
            .kpi-card { background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; }
            .kpi-value { font-size: 24px; font-weight: bold; color: #4fc3f7; }
            .kpi-label { font-size: 12px; color: #64748b; margin-top: 5px; }
            .timestamp { color: #94a3b8; font-size: 12px; margin-top: 30px; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <h1>📊 Analytics Report</h1>
          <p class="timestamp">Generated: ${new Date().toLocaleString()}</p>
          
          <h2>Key Performance Indicators</h2>
          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-value">Rs. ${(data.kpiMetrics.totalRevenue / 1000).toFixed(0)}k</div>
              <div class="kpi-label">Total Revenue</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-value">${data.kpiMetrics.totalAppointments}</div>
              <div class="kpi-label">Total Appointments</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-value">${data.kpiMetrics.completionRate}%</div>
              <div class="kpi-label">Completion Rate</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-value">${data.kpiMetrics.avgDailyServices}</div>
              <div class="kpi-label">Avg Daily Services</div>
            </div>
          </div>

          <h2>Revenue Data</h2>
          <table>
            <thead>
              <tr><th>Period</th><th>Revenue</th><th>Last Week</th></tr>
            </thead>
            <tbody>
              ${data.revenue.map(row => `
                <tr>
                  <td>${row.day || row.month || 'N/A'}</td>
                  <td>Rs. ${row.revenue.toLocaleString()}</td>
                  <td>${row.lastWeek ? `Rs. ${row.lastWeek.toLocaleString()}` : '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2>Status Distribution</h2>
          <table>
            <thead>
              <tr><th>Status</th><th>Count</th></tr>
            </thead>
            <tbody>
              ${data.status.map(row => `
                <tr>
                  <td>${row.name}</td>
                  <td>${row.value}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2>Service Types</h2>
          <table>
            <thead>
              <tr><th>Service Type</th><th>Count</th></tr>
            </thead>
            <tbody>
              ${data.serviceTypes.map(row => `
                <tr>
                  <td>${row.name}</td>
                  <td>${row.count}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2>Appointments Trend</h2>
          <table>
            <thead>
              <tr><th>Period</th><th>Count</th></tr>
            </thead>
            <tbody>
              ${data.appointmentsTrend.map(row => `
                <tr>
                  <td>${row.week || row.date || 'N/A'}</td>
                  <td>${row.count}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    console.log('[Analytics Export] PDF export initiated');
  } catch (error) {
    console.error('[Analytics Export] Error exporting to PDF:', error);
    throw new Error('Failed to export data to PDF');
  }
};

/**
 * Export analytics data based on format option
 */
export const exportAnalytics = async (
  data: AnalyticsResponse,
  options: ExportOptions
): Promise<void> => {
  const { format } = options;
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `analytics-report-${timestamp}`;

  switch (format) {
    case 'csv':
      exportToCSV(data, filename);
      break;
    case 'pdf':
      await exportToPDF(data, filename);
      break;
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};
