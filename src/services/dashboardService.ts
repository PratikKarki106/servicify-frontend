import axiosInstance from './axiosInstance';

export interface DashboardStats {
  totalServices: number;
  totalSpent: number;
  upcomingServices: number;
  loyaltyPoints: number;
}

/**
 * Fetch user dashboard statistics
 * @returns Promise with dashboard stats including total services, total spent, upcoming services, and loyalty points
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await axiosInstance.get('/api/dashboard/stats');
  return response.data;
};
