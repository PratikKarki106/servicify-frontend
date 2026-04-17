import axiosInstance from './axiosInstance';

export interface CC {
  _id: string;
  name: string;
  companyId: string | { _id: string; name: string };
  productId: string | { _id: string; name: string };
  versionId: string | { _id: string; name: string };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const getAllCCs = async (params?: { companyId?: string; productId?: string; versionId?: string; search?: string }) => {
  try {
    const response = await axiosInstance.get('/api/ccs', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching CCs:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch CCs',
      error: error.message
    };
  }
};

export const createCC = async (data: { name: string; companyId: string; productId: string; versionId: string }) => {
  try {
    const response = await axiosInstance.post('/api/ccs', data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating CC:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to create CC',
      error: error.message
    };
  }
};

export const getCCById = async (id: string) => {
  try {
    const response = await axiosInstance.get(`/api/ccs/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching CC:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch CC',
      error: error.message
    };
  }
};

export const updateCC = async (id: string, data: { name?: string; companyId?: string; productId?: string; versionId?: string }) => {
  try {
    const response = await axiosInstance.put(`/api/ccs/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error('Error updating CC:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to update CC',
      error: error.message
    };
  }
};

export const deleteCC = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/api/ccs/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting CC:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to delete CC',
      error: error.message
    };
  }
};
