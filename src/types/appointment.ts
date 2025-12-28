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

// types.ts
export interface VehicleInfo {
  model: string;
  color: string;
  numberPlate: string;
  kilometerRun: number;
  notes?: string;
  imageUrl?: string;
}

export interface Appointment {
  _id: string;
  userId: number;
  name?: string;
  email?: string;
  serviceType: string;
  vehicleInfo: VehicleInfo;
  date: string;
  time: string;
  pickupRequired: boolean;
  pickupAddress?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
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