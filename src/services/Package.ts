// src/services/Package.ts
import axiosInstance from './axiosInstance';

export interface Package {
  _id: string;
  name: string;
  price: number;
  serviceCount: number;
  purchaseDeadline: string;
  description: string;
  benefits: string[];
  serviceType: 'general' | 'premium' | 'detailing' | 'repair' | 'all';
  isActive: boolean;
  totalPurchases: number;
  createdAt: string;
  updatedAt: string;
  isExpired?: boolean;
  isAvailable?: boolean;
}

export interface CreatePackageData {
  name: string;
  price: number;
  serviceCount: number;
  purchaseDeadline: string;
  description: string;
  benefits: string[];
  serviceType: 'general' | 'premium' | 'detailing' | 'repair' | 'all';
  isActive: boolean;
}

export interface UpdatePackageData extends Partial<CreatePackageData> {}

export interface PackageResponse {
  success: boolean;
  message: string;
  data: Package | Package[] | { packages: Package[]; pagination: any } | any;
}

export interface PaginatedResponse {
  packages: Package[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Get token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Package API Service
export const packageService = {
  // Get all packages with optional filters
  getAllPackages: async (params?: {
    status?: 'active' | 'inactive' | 'expired';
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    available?: boolean;
  }): Promise<Package[] | PaginatedResponse> => {
    const token = getAuthToken();
    const response = await axiosInstance.get('/api/packages', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params,
    });
    
    // Handle different response structures
    if (response.data.data && response.data.data.packages) {
      return response.data.data; // Paginated response
    } else if (Array.isArray(response.data.data)) {
      return response.data.data; // Array of packages
    } else {
      return response.data.data; // Return as is
    }
  },

  // Get single package by ID
  getPackageById: async (id: string): Promise<Package> => {
    const token = getAuthToken();
    const response = await axiosInstance.get(`/api/packages/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  },

  // Create new package
  createPackage: async (packageData: CreatePackageData): Promise<Package> => {
    const token = getAuthToken();
    const response = await axiosInstance.post('/api/packages', packageData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  },

  // Update package
  updatePackage: async (id: string, packageData: UpdatePackageData): Promise<Package> => {
    const token = getAuthToken();
    const response = await axiosInstance.put(`/api/packages/${id}`, packageData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  },

  // Delete package
  deletePackage: async (id: string): Promise<void> => {
    const token = getAuthToken();
    await axiosInstance.delete(`/api/packages/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Toggle package status (activate/deactivate)
  togglePackageStatus: async (id: string, isActive: boolean): Promise<Package> => {
    const token = getAuthToken();
    const response = await axiosInstance.put(
      `/api/packages/${id}`,
      { isActive },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.data;
  },

  // Get package statistics (admin only)
  getPackageStatistics: async (): Promise<any> => {
    const token = getAuthToken();
    const response = await axiosInstance.get('/api/packages/admin/statistics', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  },

  // User: Purchase a package
  purchasePackage: async (packageId: string): Promise<any> => {
    const token = getAuthToken();
    const response = await axiosInstance.post(
      '/api/packages/purchase',
      { packageId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.data;
  },

  // User: Get user's packages
  getUserPackages: async (status?: 'active' | 'used' | 'inactive'): Promise<any[]> => {
    const token = getAuthToken();
    const response = await axiosInstance.get('/api/packages/user/packages', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { status },
    });
    return response.data.data;
  },

  // User: Use package credit for service
  usePackageCredit: async (userPackageId: string, serviceId: string, vehicleId: string, notes?: string): Promise<any> => {
    const token = getAuthToken();
    const response = await axiosInstance.post(
      '/api/packages/use-credit',
      { userPackageId, serviceId, vehicleId, notes },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.data;
  },
};

export default packageService;