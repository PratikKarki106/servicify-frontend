import { useState } from "react";
import UserBookTop from "./UserBookTop";
import VehicleInfo from "./VehicleInfo";
import Time from "./Time";
import HomeNav from "../components/HomeNav";
import UserInfo from "./UserInfo";
import { bookAppointment } from "../services/bookAppointment";

import type {
  ServiceType,
  BackendServiceType,
  VehicleData,
  TimeData,
  UserInfoData,
  FormData,
} from "../types/appointment";

import { serviceMap } from "../types/appointment";

const BookAppointment = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<ServiceType>("servicing");

  const [formData, setFormData] = useState<FormData>({
    vehicle: {
      vehicleInfo: "",
      versionModel: "",
      color: "",
      numberPlate: "",
      kilometers: "",
      optionalNotes: "",
      image: null,
    },
    timeSlot: {
      date: null,
      time: "",
    },
    userInfo: {
      fullName: "",
      phoneNumber: "",
      email: "",
      needPickup: false,
      pickupAddress: "",
    },
  });

  const handleServiceChange = (service: ServiceType) => {
    setSelectedService(service);
  };

  const handleNext = () => setCurrentStep((s) => Math.min(s + 1, 3));
  const handleBack = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const handleVehicleInfoSubmit = (data: VehicleData) => {
    setFormData((prev) => ({ ...prev, vehicle: data }));
    handleNext();
  };

  const handleTimeSubmit = (data: TimeData) => {
    setFormData((prev) => ({ ...prev, timeSlot: data }));
    handleNext();
  };

  const handleUserInfoSubmit = async (data: UserInfoData) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("User not logged in");
      return;
    }

    // Map UI label to backend enum
    const serviceType: BackendServiceType = serviceMap[selectedService];

    // Guard for date
    if (!formData.timeSlot.date) {
      alert("Please select a date");
      return;
    }

    const payload = {
      userId,
      serviceType,
      vehicleInfo: {
        model: formData.vehicle.versionModel,
        color: formData.vehicle.color,
        numberPlate: formData.vehicle.numberPlate,
        kilometerRun: Number(formData.vehicle.kilometers),
        notes: formData.vehicle.optionalNotes,
      },
      date: formData.timeSlot.date.toISOString(),
      time: formData.timeSlot.time,
      pickupRequired: data.needPickup,
      pickupAddress: data.pickupAddress,
      email: data.email,
      name: data.fullName,
      contactNumber: data.phoneNumber,
    };

    try {
      console.log(payload);
      await bookAppointment(payload);
      alert("✅ Appointment booked successfully");
    } catch (error: any) {
      alert(error?.message || "Something went wrong");
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <VehicleInfo onNext={handleVehicleInfoSubmit} onBack={handleBack} />;
      case 2:
        return <Time  selectedService={selectedService} 
        onNext={handleTimeSubmit} 
        onBack={handleBack} />;
      case 3:
        return (
          <UserInfo
            onSubmit={handleUserInfoSubmit}
            onBack={handleBack}
            selectedService={selectedService}
            timeSlot={formData.timeSlot}
            vehicle={formData.vehicle}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <HomeNav />
      <UserBookTop
        currentStep={currentStep}
        selectedService={selectedService}
        onServiceChange={handleServiceChange}
      />
      {renderStep()}
    </>
  );
};

export default BookAppointment;