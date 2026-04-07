import axiosInstance from './axiosInstance';

export interface UserProfile {
  _id: string;
  userId: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  phone?: string;
  profilePicture?: string;
  profilePictureUrl?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
}

export const getProfile = async (): Promise<{ success: boolean; data: UserProfile }> => {
  try {
    const response = await axiosInstance.get('/profile');
    return response.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Failed to fetch profile');
  }
};

export const updateProfile = async (data: UpdateProfileData): Promise<{ success: boolean; data: UserProfile }> => {
  try {
    const response = await axiosInstance.put('/profile', data);
    return response.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Failed to update profile');
  }
};

export const uploadProfilePicture = async (file: File): Promise<{ success: boolean; data: UserProfile; profilePictureUrl: string }> => {
  try {
    const formData = new FormData();
    formData.append('profilePicture', file);

    const response = await axiosInstance.post('/profile/upload-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Failed to upload profile picture');
  }
};

export const deleteProfilePicture = async (): Promise<{ success: boolean }> => {
  try {
    const response = await axiosInstance.delete('/profile/delete-picture');
    return response.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Failed to delete profile picture');
  }
};
