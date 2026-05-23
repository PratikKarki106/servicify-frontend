import axiosInstance from './axiosInstance';

export interface Version {
  _id: string;
  name: string;
  companyId: string;
  productId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const getAllVersions = async (params?: { companyId?: string; productId?: string; search?: string }) => {
  try {
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

export const createVersion = async (data: { name: string; companyId: string; productId: string }) => {
  try {
    const response = await axiosInstance.post('/api/versions', data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating version:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to create version',
      error: error.message
    };
  }
};

export const getVersionById = async (id: string) => {
  try {
    const response = await axiosInstance.get(`/api/versions/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching version:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch version',
      error: error.message
    };
  }
};

export const updateVersion = async (id: string, data: { name?: string; companyId?: string; productId?: string }) => {
  try {
    const response = await axiosInstance.put(`/api/versions/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error('Error updating version:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to update version',
      error: error.message
    };
  }
};

export const deleteVersion = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/api/versions/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting version:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to delete version',
      error: error.message
    };
  }
};
