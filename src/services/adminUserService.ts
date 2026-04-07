import axiosInstance from './axiosInstance';

export interface User {
  _id: string;
  userId: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  phone?: string;
  profilePicture?: string;
  profilePictureUrl?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserStatistics {
  totalUsers: number;
  totalAdmins: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  newUsersThisMonth: number;
}

export interface UserDetails {
  user: User;
  statistics: {
    totalSpent: number;
    totalAppointments: number;
    completedAppointments: number;
    upcomingAppointments: number;
    activePackages: number;
    totalPackages: number;
    totalVehicles: number;
  };
  appointments: any[];
  payments: any[];
  packagePurchases: any[];
  vehicles: any[];
}

export const adminUserService = {
  // Get all users with pagination
  getAllUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get('/admin/users', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params,
    });
    return response.data;
  },

  // Get user statistics
  getUserStatistics: async () => {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get('/admin/users/statistics', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Get user details
  getUserDetails: async (id: string) => {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get(`/admin/users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Update user role
  updateUserRole: async (id: string, role: 'user' | 'admin') => {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.put(
      `/admin/users/${id}/role`,
      { role },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  // Delete user
  deleteUser: async (id: string) => {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.delete(`/admin/users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};

export default adminUserService;
