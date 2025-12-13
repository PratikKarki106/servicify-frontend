import React, { useState } from 'react'
import UserBookTop from './UserBookTop';
import VehicleInfo from './VehicleInfo';
import Time from './Time';
import HomeNav from '../components/HomeNav';
import UserInfo from './UserInfo';

interface VehicleData {
  vehicleInfo: string;
  versionModel: string;
  color: string;
  numberPlate: string;
  kilometers: string;
  optionalNotes: string;
  image: File | null;
  [key: string]: any;
}

interface TimeData {
  date: Date | null;
  time: string;
}

interface UserInfoData {
  fullName: string;
  phoneNumber: string;
  email: string;
  needPickup: boolean;
  pickupAddress: string;
  [key: string]: any;
}

interface FormData {
  vehicle: VehicleData;
  timeSlot: TimeData;
  userInfo: UserInfoData;
}

const BookAppointment = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedService, setSelectedService] = useState<string>('Servicing');
  const [formData, setFormData] = useState<FormData>({
    vehicle: {
      vehicleInfo: '',
      versionModel: '',
      color: '',
      numberPlate: '',
      kilometers: '',
      optionalNotes: '',
      image: null,
    },
    timeSlot: {
      date: null,
      time: '',
    },
    userInfo: {
      fullName: '',
      phoneNumber: '',
      email: '',
      needPickup: false,
      pickupAddress: '',
    }
  });

  const handleServiceChange = (service: string) => {
    setSelectedService(service);
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleVehicleInfoSubmit = (data: VehicleData) => {
    setFormData({...formData, vehicle: data});
    handleNext();
  };

  const handleTimeSubmit = (data: TimeData) => {
    setFormData({...formData, timeSlot: data});
    handleNext();
  };

  const handleUserInfoSubmit = (data: UserInfoData) => {
    const finalData = {
      ...formData,
      userInfo: data
    };
    console.log('Final form data:', finalData);
    // Here you would typically submit the data to your backend
    console.log('Submitting to backend:', finalData);
  };

  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <VehicleInfo 
            onNext={handleVehicleInfoSubmit}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <Time 
            onNext={handleTimeSubmit}
            onBack={handleBack}
          />
        );
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
        return <VehicleInfo onNext={handleVehicleInfoSubmit} onBack={handleBack} />;
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
  )
}

export default BookAppointment