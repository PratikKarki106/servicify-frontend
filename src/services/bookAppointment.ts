import axiosInstance from "./axiosInstance";

export interface VehicleInfo {
  model: string;
  color: string;
  numberPlate: string;
  kilometerRun: number;
  notes?: string;
  imageUrl?: string;
}

export interface AppointmentData {
  userId: string;
  serviceType: "servicing" | "repair" | "checkup" | "wash";
  vehicleInfo: {
    model: string;
    color: string;
    numberPlate: string;
    kilometerRun: number;
    notes?: string;
    imageUrl?: string;
  };
  date: string;
  time: string;
  pickupRequired: boolean;
  pickupAddress?: string;
  email?: string;
  name?: string;
  contactNumber?: string;
}

export interface GetAllAppointmentsParams {
  page?: number;
  limit?: number;
  serviceType?: string;
  status?: string;
  date?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Book a new appointment
export const bookAppointment = async (appointmentData: AppointmentData) => {
  const response = await axiosInstance.post("/appointments", appointmentData);
  return response.data;
};

// Get all appointments for a user
export const getAppointmentsByUser = async (userId: string) => {
  const response = await axiosInstance.get(`/appointments/user/${userId}`);
  return response.data;
};

// Get single appointment by ID
export const getAppointmentById = async (id: string) => {
  const response = await axiosInstance.get(`/appointments/${id}`);
  return response.data;
};

// Cancel appointment
export const cancelAppointment = async (id: string) => {
  const response = await axiosInstance.delete(`/appointments/${id}`);
  return response.data;
};

// Update appointment (e.g. reschedule)
export const updateAppointment = async (id: string, updates: Partial<AppointmentData>) => {
  const response = await axiosInstance.put(`/appointments/${id}`, updates);
  return response.data;
};


// Get all appointments
export const getAllAppointments = async (params?: GetAllAppointmentsParams) => {
  try {
    const response = await axiosInstance.get("/appointments/appointment", {
      params: {
        page: params?.page || 1,
        limit: params?.limit || 20, // Default 20 per page
        serviceType: params?.serviceType,
        status: params?.status,
        date: params?.date,
        sortBy: params?.sortBy || 'createdAt', // Default sort by createdAt
        sortOrder: params?.sortOrder || 'desc' // Default descending (newest first)
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching all appointments:', error);
    
    // Return a structured error response
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch appointments',
      error: error.message
    };
  }
};

// To update status of an appointment
export const updateAppointmentStatus = async (appointmentId: string, status: string) => {
  try {
    const response = await axiosInstance.patch(`/appointments/appointment/${appointmentId}/status`, {
      status: status
    });
    return response.data;
  } catch (error: any) {
    console.error('Error updating appointment status:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to update appointment status',
      error: error.message
    };
  }
};