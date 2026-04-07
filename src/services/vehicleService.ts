import axiosInstance from './axiosInstance';
import { toast } from 'react-toastify';

export interface Vehicle {
  _id: string;
  userId: string;
  name: string;
  color: string;
  version: string;
  plateNumber: string;
  mileage: number;
  lastService: string;
  nextService: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewVehicleData {
  name: string;
  color: string;
  version: string;
  plateNumber: string;
  mileage: number;
  image?: File | null;
  lastService?: string;
  nextService?: string;
}

export interface UpdateVehicleData {
  name?: string;
  color?: string;
  version?: string;
  plateNumber?: string;
  mileage?: number;
  lastService?: string;
  nextService?: string;
}

// Helper function to get user ID
const getUserId = () => {
  const userId = localStorage.getItem('userId');
  if (!userId) {
    throw new Error('User ID not found. Please login.');
  }
  return userId;
};

// Fetch vehicles for current user
export const fetchVehicles = async (): Promise<Vehicle[]> => {
  try {
    const userId = getUserId();
    
    const response = await axiosInstance.get('/vehicles', {
      headers: { 'X-User-Id': userId }
    });
    
    return response.data.data || [];
  } catch (error: any) {
    console.error('Error fetching vehicles:', error);
    toast.error('Failed to fetch vehicles');
    return [];
  }
};

// Add new vehicle for current user
export const addVehicle = async (vehicleData: NewVehicleData): Promise<Vehicle | null> => {
  try {
    const userId = getUserId();

    // Create FormData to handle file upload
    const formData = new FormData();
    
    // Append all vehicle data to FormData
    Object.entries(vehicleData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'image' && value instanceof File) {
          formData.append(key, value, value.name);
        } else if (key !== 'image') {
          formData.append(key, String(value));
        }
      }
    });
    
    // Append userId to FormData
    formData.append('userId', userId);

    const response = await axiosInstance.post('/vehicles', formData, {
      headers: { 
        'X-User-Id': userId,
        'Content-Type': 'multipart/form-data'
      }
    });

    toast.success('Vehicle added successfully!');
    return response.data.data;
  } catch (error: any) {
    console.error('Error adding vehicle:', error);
    toast.error(error.response?.data?.message || 'Failed to add vehicle');
    return null;
  }
};

// Edit vehicle for current user
export const editVehicle = async (vehicleId: string, vehicleData: UpdateVehicleData): Promise<Vehicle | null> => {
  try {
    const userId = getUserId();
    
    const response = await axiosInstance.put(`/vehicles/${vehicleId}`, vehicleData, {
      headers: { 'X-User-Id': userId }
    });
    
    toast.success('Vehicle updated successfully!');
    return response.data.data;
  } catch (error: any) {
    console.error('Error updating vehicle:', error);
    toast.error(error.response?.data?.message || 'Failed to update vehicle');
    return null;
  }
};

// Delete vehicle for current user
export const deleteVehicle = async (vehicleId: string): Promise<boolean> => {
  try {
    const userId = getUserId();
    
    await axiosInstance.delete(`/vehicles/${vehicleId}`, {
      headers: { 'X-User-Id': userId }
    });
    
    toast.success('Vehicle deleted successfully!');
    return true;
  } catch (error: any) {
    console.error('Error deleting vehicle:', error);
    toast.error(error.response?.data?.message || 'Failed to delete vehicle');
    return false;
  }
};