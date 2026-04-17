import axiosInstance from './axiosInstance';

export interface CatalogItem {
  _id: string;
  companyId: string | { _id: string; name: string };
  productId: string | { _id: string; name: string };
  versionId: string | { _id: string; name: string };
  ccId: string | { _id: string; name: string };
  itemName: string;
  description?: string;
  itemPrice: number;
  serviceCharge: number;
  estimatedTime: number;
  totalCost: Number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  _id: string;
  name: string;
  isActive: boolean;
}

export interface Product {
  _id: string;
  name: string;
  companyId: string | { _id: string; name: string };
  isActive: boolean;
}

export interface Version {
  _id: string;
  name: string;
  companyId: string | { _id: string; name: string };
  productId: string | { _id: string; name: string };
  isActive: boolean;
}

export interface CreateCatalogItemData {
  companyId: string;
  productId: string;
  versionId: string;
  ccId: string;
  itemName: string;
  description?: string;
  itemPrice: number;
  serviceCharge: number;
  estimatedTime: number;
  imageUrl?: string;
  isActive?: boolean;
}

// Admin functions
export const getAllCatalogItems = async (params?: any) => {
  try {
    const response = await axiosInstance.get('/api/catalog', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching catalog items:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch catalog items',
      error: error.message
    };
  }
};

export const createCatalogItem = async (data: CreateCatalogItemData) => {
  try {
    const response = await axiosInstance.post('/api/catalog', data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating catalog item:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to create catalog item',
      error: error.message
    };
  }
};

export const updateCatalogItem = async (id: string, data: Partial<CreateCatalogItemData>) => {
  try {
    const response = await axiosInstance.put(`/api/catalog/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error('Error updating catalog item:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to update catalog item',
      error: error.message
    };
  }
};

export const deleteCatalogItem = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/api/catalog/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting catalog item:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to delete catalog item',
      error: error.message
    };
  }
};

// User functions
export const getUserCatalogItems = async () => {
  try {
    const response = await axiosInstance.get('/api/catalog/user/items');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching user catalog items:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch catalog items',
      error: error.message
    };
  }
};

// Filter helper functions
export const getCompanies = async () => {
  try {
    const response = await axiosInstance.get('/api/companies');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching companies:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch companies',
      error: error.message
    };
  }
};

export const getProducts = async (companyId?: string) => {
  try {
    const params = companyId ? { companyId } : {};
    const response = await axiosInstance.get('/api/products', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching products:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch products',
      error: error.message
    };
  }
};

export const getVersions = async (companyId?: string, productId?: string) => {
  try {
    const params: any = {};
    if (companyId) params.companyId = companyId;
    if (productId) params.productId = productId;
    const response = await axiosInstance.get('/api/versions', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching versions:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch versions',
      error: error.message
    };
  }
};