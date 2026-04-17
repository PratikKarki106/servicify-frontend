import axiosInstance from './axiosInstance';

export interface Product {
  _id: string;
  name: string;
  companyId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const getAllProducts = async (params?: { companyId?: string; search?: string }) => {
  try {
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

export const createProduct = async (data: { name: string; companyId: string }) => {
  try {
    const response = await axiosInstance.post('/api/products', data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating product:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to create product',
      error: error.message
    };
  }
};

export const getProductById = async (id: string) => {
  try {
    const response = await axiosInstance.get(`/api/products/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching product:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch product',
      error: error.message
    };
  }
};

export const updateProduct = async (id: string, data: { name?: string; companyId?: string }) => {
  try {
    const response = await axiosInstance.put(`/api/products/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error('Error updating product:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to update product',
      error: error.message
    };
  }
};

export const deleteProduct = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/api/products/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting product:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to delete product',
      error: error.message
    };
  }
};
