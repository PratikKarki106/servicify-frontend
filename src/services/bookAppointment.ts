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