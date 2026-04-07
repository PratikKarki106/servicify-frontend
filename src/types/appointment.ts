// types/appointment.ts
export interface VehicleInfo {
  name: string;
  model: string;
  color: string;
  numberPlate: string;
  kilometerRun: number;
  notes?: string;
  imageUrl?: string;
}

export interface BillItemData {
  itemName: string;
  itemPrice: number;
  serviceCharge: number;
  _id?: string;
}

export interface AppointmentData {
  userId: string;
  serviceType: "servicing" | "repair" | "checkup" | "wash";
  vehicleInfo: VehicleInfo;
  date: string;
  time: string;
  pickupRequired: boolean;
  pickupAddress?: string;
  email?: string;
  name?: string;
  contactNumber?: string;
}

export interface Appointment {
  _id: string;
  appointmentId: number;
  userId: number;
  name?: string;
  email?: string;
  phone?: string;
  contactNumber?: string;
  serviceType: string;
  vehicleInfo: VehicleInfo;
  date: string;
  time: string;
  pickupRequired: boolean;
  pickupAddress?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  billItems?: BillItemData[];
}

export interface ApiResponse {
  success: boolean;
  appointments: Appointment[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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

// Frontend display labels
export type ServiceType = "servicing" | "repair" | "checkup" | "wash";

// Backend API enum (lowercase)
export type BackendServiceType = "servicing" | "repair" | "checkup" | "wash";

// Map UI labels to backend values
export const serviceMap: Record<ServiceType, BackendServiceType> = {
  servicing: "servicing",
  repair: "repair",
  checkup: "checkup",
  wash: "wash",
};

export interface VehicleData {
  vehicleInfo: string;
  versionModel: string;
  color: string;
  numberPlate: string;
  kilometers: string;
  optionalNotes: string;
  image: File | null;
}

export interface TimeData {
  date: Date | null;
  time: string;
}

export interface UserInfoData {
  fullName: string;
  phoneNumber: string;
  email: string;
  needPickup: boolean;
  pickupAddress: string;
}

export interface FormData {
  vehicle: VehicleData;
  timeSlot: TimeData;
  userInfo: UserInfoData;
}