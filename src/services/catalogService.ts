import axiosInstance from './axiosInstance';

export interface CatalogItem {
  _id: string;
  itemName: string;
  description?: string;
  itemPrice: number;
  serviceCharge: number;
  estimatedTime: number;
  totalCost: Number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCatalogItemData {
  itemName: string;
  description?: string;
  itemPrice: number;
  serviceCharge: number;
  estimatedTime: number;
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