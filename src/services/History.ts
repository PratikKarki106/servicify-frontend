import axiosInstance from './axiosInstance';

// ─────────────────────────────────────────────────────────────────────────────
// TypeScript Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface AppointmentHistoryItem {
  _id: string;
  appointmentId: number;
  userId: number;
  serviceType: 'servicing' | 'repair' | 'checkup' | 'wash';
  vehicleInfo: {
    name: string;
    model: string;
    color: string;
    numberPlate: string;
    kilometerRun?: number;
    notes?: string;
    imageUrl?: string;
  };
  date: string;
  time: string;
  pickupRequired: boolean;
  pickupAddress?: string;
  status: 'booked' | 'confirmed' | 'in-progress' | 'payment' | 'completed' | 'cancelled';
  cancellationReason?: string;
  cancelledAt?: string;
  email: string;
  name: string;
  contactNumber: string;
  billItems?: {
    itemName: string;
    itemPrice: number;
    serviceCharge?: number;
  }[];
  totalAmount: number;
  paymentStatus: 'initiated' | 'completed' | 'failed' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

export interface PackageHistoryItem {
  _id: string;
  packageId: string;
  packageName: string;
  userId: string;
  userEmail: string;
  userName: string;
  totalCredits: number;
  usedCredits: number;
  remainingCredits: number;
  amount: number;
  paymentStatus: 'initiated' | 'completed' | 'failed' | 'refunded';
  expiryDate: string;
  isActive: boolean;
  purchasedAt: string;
}

export type HistoryItem = AppointmentHistoryItem | PackageHistoryItem;

export interface HistoryGroup {
  date: string;
  items: HistoryItem[];
  totalRevenue: number;
  appointmentCount: number;
  packageCount: number;
}

export interface HistoryFilters {
  type?: 'all' | 'appointment' | 'package' | 'catalog';
  status?: 'all' | 'booked' | 'confirmed' | 'in-progress' | 'payment' | 'completed' | 'cancelled' | 'pending' | 'failed' | 'refunded';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface HistoryResponse {
  success: boolean;
  data: {
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
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// API Service Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch history data with filters
 */
export const fetchHistory = async (filters: HistoryFilters = {}): Promise<HistoryResponse> => {
  try {
    const backendType = filters.type === 'catalog' ? 'all' : filters.type;
    const backendStatusAllowed = ['booked', 'confirmed', 'in-progress', 'payment', 'completed', 'cancelled'];
    const backendStatus = filters.status && backendStatusAllowed.includes(filters.status) ? filters.status : 'all';

    const params: any = {
      page: filters.page || 1,
      limit: filters.limit || 50,
    };

    if (backendType && backendType !== 'all') {
      params.type = backendType;
    }

    if (backendStatus && backendStatus !== 'all') {
      params.status = backendStatus;
    }

    if (filters.startDate) {
      params.startDate = filters.startDate;
    }

    if (filters.endDate) {
      params.endDate = filters.endDate;
    }

    const response = await axiosInstance.get<HistoryResponse>('/api/history', { params });
    return response.data;
  } catch (error: any) {
    console.error('[History Service] Error fetching history:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch history data');
  }
};

/**
 * Fetch appointment history only
 */
export const fetchAppointmentHistory = async (
  filters: Omit<HistoryFilters, 'type'> = {}
): Promise<HistoryResponse> => {
  return fetchHistory({ ...filters, type: 'appointment' });
};

/**
 * Fetch package history only
 */
export const fetchPackageHistory = async (
  filters: Omit<HistoryFilters, 'type'> = {}
): Promise<HistoryResponse> => {
  return fetchHistory({ ...filters, type: 'package' });
};

/**
 * Export history to CSV
 */
export const exportHistoryToCSV = async (filters: HistoryFilters = {}): Promise<void> => {
  try {
    const backendType = filters.type === 'catalog' ? 'all' : filters.type;
    const backendStatusAllowed = ['booked', 'confirmed', 'in-progress', 'payment', 'completed', 'cancelled'];
    const backendStatus = filters.status && backendStatusAllowed.includes(filters.status) ? filters.status : 'all';

    const params: any = {
      ...filters,
      type: backendType,
      status: backendStatus,
      export: 'csv',
    };

    const response = await axiosInstance.get('/api/history/export', {
      params,
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `history-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    console.error('[History Service] Error exporting to CSV:', error);
    throw new Error('Failed to export history to CSV');
  }
};
