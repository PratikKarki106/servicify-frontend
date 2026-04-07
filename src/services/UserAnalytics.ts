import axiosInstance from './axiosInstance';

// ─────────────────────────────────────────────────────────────────────────────
// TypeScript Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface SpendingHistoryDataPoint {
  day?: string;
  month?: string;
  amount: number;
}

export interface ServiceUsageDataPoint {
  name: string;
  count: number;
  color: string;
}

export interface MonthlyComparisonDataPoint {
  category: string;
  thisMonth: number;
  lastMonth: number;
}

export interface ServiceCategoryDataPoint {
  name: string;
  count: number;
  totalAmount: number;
}

export interface ActivityRadarDataPoint {
  dimension: string;
  value: number;
}

export interface SpendingComparison {
  current: number;
  previous: number;
}

export interface QuickStats {
  completedServices: number;
  ongoingServices: number;
  totalReviews: number;
  cancelledServices: number;
}

export interface UserKpiMetrics {
  totalSpent: number;
  totalServices: number;
  avgRating: number;
  activeServices: number;
  spendingTrend: 'up' | 'down' | 'stable';
  serviceTrend: 'up' | 'down' | 'stable';
}

export interface UserAnalyticsResponse {
  spendingHistory: SpendingHistoryDataPoint[];
  serviceUsage: ServiceUsageDataPoint[];
  monthlyComparison: MonthlyComparisonDataPoint[];
  serviceCategories: ServiceCategoryDataPoint[];
  activityRadar: ActivityRadarDataPoint[];
  spendingComparison: {
    weekly: SpendingComparison;
    monthly: SpendingComparison;
  };
  quickStats: QuickStats;
  kpiMetrics: UserKpiMetrics;
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
 * Fetch user analytics data for the dashboard
 * @param dateRange - Optional date range filter
 * @param timeFrame - 'weekly' or 'monthly' view
 */
export const fetchUserAnalyticsData = async (
  dateRange?: DateRange,
  timeFrame: 'weekly' | 'monthly' = 'weekly'
): Promise<UserAnalyticsResponse> => {
  try {
    const params: any = { timeFrame };
    if (dateRange) {
      params.startDate = dateRange.startDate;
      params.endDate = dateRange.endDate;
    }

    const response = await axiosInstance.get<UserAnalyticsResponse>('/api/analytics/user/dashboard', { params });
    return response.data;
  } catch (error: any) {
    console.error('[User Analytics Service] Error fetching analytics data:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch user analytics data');
  }
};

/**
 * Fetch user spending data specifically
 * @param dateRange - Optional date range filter
 * @param timeFrame - 'weekly' or 'monthly' view
 */
export const fetchUserSpendingData = async (
  dateRange?: DateRange,
  timeFrame: 'weekly' | 'monthly' = 'weekly'
): Promise<SpendingHistoryDataPoint[]> => {
  try {
    const params: any = { timeFrame };
    if (dateRange) {
      params.startDate = dateRange.startDate;
      params.endDate = dateRange.endDate;
    }

    const response = await axiosInstance.get<SpendingHistoryDataPoint[]>('/api/analytics/user/spending', { params });
    return response.data;
  } catch (error: any) {
    console.error('[User Analytics Service] Error fetching spending data:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch spending data');
  }
};

/**
 * Fetch user service usage data
 */
export const fetchUserServiceUsage = async (): Promise<ServiceUsageDataPoint[]> => {
  try {
    const response = await axiosInstance.get<ServiceUsageDataPoint[]>('/api/analytics/user/service-usage');
    return response.data;
  } catch (error: any) {
    console.error('[User Analytics Service] Error fetching service usage:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch service usage');
  }
};

/**
 * Fetch user KPI metrics
 * @param dateRange - Optional date range filter
 */
export const fetchUserKpiMetrics = async (dateRange?: DateRange): Promise<UserKpiMetrics> => {
  try {
    const params: any = {};
    if (dateRange) {
      params.startDate = dateRange.startDate;
      params.endDate = dateRange.endDate;
    }

    const response = await axiosInstance.get<UserKpiMetrics>('/api/analytics/user/kpi-metrics', { params });
    return response.data;
  } catch (error: any) {
    console.error('[User Analytics Service] Error fetching KPI metrics:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch KPI metrics');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Export Functionality
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Export user analytics data to CSV
 * @param data - The analytics data to export
 * @param filename - Output filename (without extension)
 */
export const exportUserToCSV = (data: UserAnalyticsResponse, filename: string = 'user-analytics-report'): void => {
  try {
    let csvContent = 'data:text/csv;charset=utf-8,';

    // Spending History Section
    csvContent += '\n=== SPENDING HISTORY ===\n';
    csvContent += 'Period,Amount\n';
    data.spendingHistory.forEach(row => {
      const period = row.day || row.month || 'N/A';
      csvContent += `${period},${row.amount}\n`;
    });

    // Service Usage Section
    csvContent += '\n=== SERVICE USAGE ===\n';
    csvContent += 'Service Type,Count\n';
    data.serviceUsage.forEach(row => {
      csvContent += `${row.name},${row.count}\n`;
    });

    // Monthly Comparison Section
    csvContent += '\n=== MONTHLY COMPARISON ===\n';
    csvContent += 'Category,This Month,Last Month\n';
    data.monthlyComparison.forEach(row => {
      csvContent += `${row.category},${row.thisMonth},${row.lastMonth}\n`;
    });

    // Service Categories Section
    csvContent += '\n=== SERVICE CATEGORIES ===\n';
    csvContent += 'Service Type,Count,Total Amount\n';
    data.serviceCategories.forEach(row => {
      csvContent += `${row.name},${row.count},${row.totalAmount}\n`;
    });

    // KPI Metrics Section
    csvContent += '\n=== KPI METRICS ===\n';
    csvContent += 'Metric,Value\n';
    csvContent += `Total Spent,Rs. ${data.kpiMetrics.totalSpent}\n`;
    csvContent += `Total Services,${data.kpiMetrics.totalServices}\n`;
    csvContent += `Average Rating,${data.kpiMetrics.avgRating}\n`;
    csvContent += `Active Services,${data.kpiMetrics.activeServices}\n`;

    // Quick Stats Section
    csvContent += '\n=== QUICK STATS ===\n';
    csvContent += 'Stat,Value\n';
    csvContent += `Completed Services,${data.quickStats.completedServices}\n`;
    csvContent += `Ongoing Services,${data.quickStats.ongoingServices}\n`;
    csvContent += `Total Reviews,${data.quickStats.totalReviews}\n`;
    csvContent += `Cancelled Services,${data.quickStats.cancelledServices}\n`;

    // Create and trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('[User Analytics Export] CSV exported successfully');
  } catch (error) {
    console.error('[User Analytics Export] Error exporting to CSV:', error);
    throw new Error('Failed to export data to CSV');
  }
};

/**
 * Export user analytics data to PDF
 */
export const exportUserToPDF = async (data: UserAnalyticsResponse, filename: string = 'user-analytics-report'): Promise<void> => {
  try {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Failed to open print window');
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>User Analytics Report - ${filename}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; background: #fff; color: #333; }
            h1 { color: #8b5cf6; border-bottom: 3px solid #8b5cf6; padding-bottom: 15px; }
            h2 { color: #1a1a2e; margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
            th { background: linear-gradient(135deg, #8b5cf6, #a855f7); color: white; font-weight: 600; }
            tr:nth-child(even) { background: #f8f9fa; }
            .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
            .kpi-card { background: linear-gradient(135deg, #f8f9fa, #fff); padding: 18px; border-radius: 12px; text-align: center; border: 1px solid #e9ecef; }
            .kpi-value { font-size: 26px; font-weight: bold; color: #8b5cf6; }
            .kpi-label { font-size: 12px; color: #6c757d; margin-top: 6px; font-weight: 500; }
            .timestamp { color: #94a3b8; font-size: 12px; margin-top: 30px; }
            .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 20px 0; }
            .stat-item { background: #f8f9fa; padding: 15px; border-radius: 10px; text-align: center; }
            .stat-value { font-size: 22px; font-weight: bold; color: #1a1a2e; }
            .stat-label { font-size: 11px; color: #6c757d; margin-top: 4px; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <h1>📊 User Analytics Report</h1>
          <p class="timestamp">Generated: ${new Date().toLocaleString()}</p>

          <h2>Key Performance Indicators</h2>
          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-value">Rs. ${(data.kpiMetrics.totalSpent / 1000).toFixed(1)}k</div>
              <div class="kpi-label">Total Spent</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-value">${data.kpiMetrics.totalServices}</div>
              <div class="kpi-label">Total Services</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-value">⭐ ${data.kpiMetrics.avgRating}</div>
              <div class="kpi-label">Avg Rating</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-value">${data.kpiMetrics.activeServices}</div>
              <div class="kpi-label">Active Services</div>
            </div>
          </div>

          <h2>Quick Stats</h2>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">${data.quickStats.completedServices}</div>
              <div class="stat-label">Completed</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${data.quickStats.ongoingServices}</div>
              <div class="stat-label">Ongoing</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${data.quickStats.totalReviews}</div>
              <div class="stat-label">Reviews</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${data.quickStats.cancelledServices}</div>
              <div class="stat-label">Cancelled</div>
            </div>
          </div>

          <h2>Spending History</h2>
          <table>
            <thead>
              <tr><th>Period</th><th>Amount (Rs.)</th></tr>
            </thead>
            <tbody>
              ${data.spendingHistory.map(row => `
                <tr>
                  <td>${row.day || row.month || 'N/A'}</td>
                  <td>${row.amount.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2>Service Usage</h2>
          <table>
            <thead>
              <tr><th>Service Type</th><th>Count</th></tr>
            </thead>
            <tbody>
              ${data.serviceUsage.map(row => `
                <tr>
                  <td>${row.name}</td>
                  <td>${row.count}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2>Service Categories</h2>
          <table>
            <thead>
              <tr><th>Category</th><th>Count</th><th>Total Amount (Rs.)</th></tr>
            </thead>
            <tbody>
              ${data.serviceCategories.map(row => `
                <tr>
                  <td>${row.name}</td>
                  <td>${row.count}</td>
                  <td>${row.totalAmount.toLocaleString()}</td>
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

    console.log('[User Analytics Export] PDF export initiated');
  } catch (error) {
    console.error('[User Analytics Export] Error exporting to PDF:', error);
    throw new Error('Failed to export data to PDF');
  }
};

/**
 * Export user analytics data based on format option
 */
export const exportUserAnalytics = async (
  data: UserAnalyticsResponse,
  options: ExportOptions
): Promise<void> => {
  const { format } = options;
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `user-analytics-report-${timestamp}`;

  switch (format) {
    case 'csv':
      exportUserToCSV(data, filename);
      break;
    case 'pdf':
      await exportUserToPDF(data, filename);
      break;
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};
