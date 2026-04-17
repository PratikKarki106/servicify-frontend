import axiosInstance from './axiosInstance';

export interface Company {
  _id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const getAllCompanies = async (search?: string) => {
  try {
    const params: any = {};
    if (search) {
      params.search = search;
    }
    const response = await axiosInstance.get('/api/companies', { params });
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

export const createCompany = async (data: { name: string }) => {
  try {
    const response = await axiosInstance.post('/api/companies', data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating company:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to create company',
      error: error.message
    };
  }
};

export const getCompanyById = async (id: string) => {
  try {
    const response = await axiosInstance.get(`/api/companies/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching company:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch company',
      error: error.message
    };
  }
};

export const updateCompany = async (id: string, data: { name: string }) => {
  try {
    const response = await axiosInstance.put(`/api/companies/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error('Error updating company:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to update company',
      error: error.message
    };
  }
};

export const deleteCompany = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/api/companies/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting company:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to delete company',
      error: error.message
    };
  }
};
