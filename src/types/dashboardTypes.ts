// Shared types for appointments
export interface ServiceBooking {
  id: string;
  date: string;
  time: string;
  serviceType: string;
  status: 'confirmed' | 'pending' | 'in-progress' | 'payment' | 'completed' | 'cancelled';
  vehicle: string;
  estimatedCost: number;
  nextDueDate?: string;
  rawAppointment?: any; // Keep reference to original appointment data
}

export interface Vehicle {
  id: string;
  name: string;
  color?: string;
  version: string;
  plateNumber: string;
  lastService: string;
  nextService: string;
  mileage: number;

  image?: string;
}

export interface Package {
  id: string;
  name: string;
  description: string;
  actualPrice: number;
  discountedPrice: number;
  purchaseDeadline: string;
  features: string[];
  serviceType: string;
  isActive: boolean;
  totalPurchases: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceReminder {
  id: string;
  type: string;
  dueDate: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
}

export interface NewVehicleData {
  name: string;
  model: string;
  kilometerRun: string;
  color: string;
  numberPlate: string;
}