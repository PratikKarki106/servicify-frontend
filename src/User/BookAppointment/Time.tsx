import "./Time.css";
import { useState, useEffect, useMemo } from "react";
import left from "../../assets/left-arrow.png";
import right from "../../assets/right-arrow.png";
import type { ServiceType } from "../../types/appointment";
import axiosInstance from "../../services/axiosInstance";

interface TimeProps {
  selectedService: ServiceType;
  onNext: (data: { date: Date | null; time: string }) => void;
  onBack: () => void;
}

const Time: React.FC<TimeProps> = ({ selectedService, onNext, onBack }) => {
  const [today] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  useEffect(() =>{
  if (!selectedDate) return;
  const fetchAvailability = async () => {
    try {
      const year = selectedDate.getFullYear();
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
      const day = selectedDate.getDate().toString().padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const res = await axiosInstance.get(
        `/appointments/availability?date=${dateStr}&serviceType=${selectedService}` );
        const slots = res.data?.availability?.filter((s: any) => s.available).map((s: any) => s.time) ?? [];
      setAvailableSlots(slots);
    } catch (error){
      console.error("Error fetching availability", error);
      setAvailableSlots([]);
    }
  };

  fetchAvailability();
  }, [selectedDate, selectedService]);


  useEffect(() => {
    setSelectedDate(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
  }, [today]);

  // ⏱ interval in minutes based on service
  const getIntervalByService = (service: ServiceType): number => {
    switch (service) {
      case "repair":
        return 60;
      case "wash":
        return 20;
      case "servicing":
      case "checkup":
      default:
        return 30;
    }
  };

  // 🕘 Generate slots dynamically
  const timeSlots = useMemo(() => {
    const interval = getIntervalByService(selectedService);

    const slots: string[] = [];
    const start = new Date();
    start.setHours(9, 0, 0, 0); // 09:00 AM

    const end = new Date();
    end.setHours(18, 0, 0, 0); // 06:00 PM

    const current = new Date(start);

    while (current <= end) {
      const hours = current.getHours();
      const minutes = current.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      const h12 = hours % 12 || 12;
      const h = h12.toString().padStart(2, "0");
      const m = minutes.toString().padStart(2, "0");
      slots.push(`${h}:${m} ${ampm}`);

      current.setMinutes(current.getMinutes() + interval);
    }

    return slots;
  }, [selectedService]);

  // --- Calendar logic (unchanged, exactly as your original code) ---
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const days = [];
    const totalCells = 35;

    // Previous month days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date,
        isCurrentMonth: false,
        isSelected: selectedDate && date.toDateString() === selectedDate.toDateString(),
        isToday: false,
        isPast: date < new Date(today.getFullYear(), today.getMonth(), today.getDate())
      });
    }

    // Current month days
    const daysInMonth = lastDay.getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const isToday = date.toDateString() === today.toDateString();
      const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      days.push({
        date,
        isCurrentMonth: true,
        isSelected: selectedDate && date.toDateString() === selectedDate.toDateString(),
        isToday,
        isPast
      });
    }

    // Next month days if needed
    if (days.length < totalCells) {
      const nextMonthDays = totalCells - days.length;
      for (let i = 1; i <= nextMonthDays; i++) {
        const date = new Date(year, month + 1, i);
        days.push({
          date,
          isCurrentMonth: false,
          isSelected: selectedDate && date.toDateString() === selectedDate.toDateString(),
          isToday: false,
          isPast: false
        });
      }
    }
    return days;
  };

  const days = generateCalendarDays();

  // --- Navigation ---
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handleDateClick = (date: Date, isCurrentMonth: boolean, isPast: boolean) => {
    if (isCurrentMonth && !isPast) {
      setSelectedDate(date);
    }
  };

  const handleContinue = () => {
    onNext({ date: selectedDate, time: selectedTime });
  };

  return (
    <div className="vehicle-info-main">
      <p style={{ fontWeight: "700", fontSize: "20px", marginBottom: "20px" }}>
        Select Date & Time ({selectedService})
      </p>

      {/* --- Calendar --- */}
      <div className="calendar-container">
        <div className="calendar-header">
          <button className="nav-button" onClick={goToPreviousMonth}>
            <img src={left} alt="Previous month" style={{ height: "16px", marginLeft: "20px" }}/>
          </button>
          <h3 className="calendar-month-year">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <button className="nav-button" onClick={goToNextMonth}>
            <img src={right} alt="Next month" style={{ height: "16px", marginRight: "20px" }}/>
          </button>
        </div>

        <div className="days-of-week">
          <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
        </div>

        <div className="calendar-grid">
          {days.map((day, index) => (
            <button
              key={index}
              className={`calendar-day
                ${!day.isCurrentMonth ? "other-month" : ""}
                ${day.isSelected ? "selected" : ""}
                ${day.isToday ? "today" : ""}
                ${day.isPast ? "past-date" : ""}
              `}
              onClick={() => handleDateClick(day.date, day.isCurrentMonth, day.isPast)}
              disabled={day.isPast}
              title={day.isPast ? "Cannot select past dates" : ""}
            >
              <span className="date-number">{day.date.getDate()}</span>
              {day.isToday && <span className="today-dot"></span>}
            </button>
          ))}
        </div>
      </div>

      {/* --- Available Slots --- */}
      <div className="slots-section">
        <h3 className="slots-title">Available Slots</h3>
        <div className="slots-grid">
          {timeSlots.map((time) => {
            // Check if the selected date is today and if the time has already passed
            const isToday = selectedDate && 
              selectedDate.toDateString() === new Date().toDateString();
            
            let isTimePassed = false;
            if (isToday) {
              // Convert the time string to a Date object for comparison
              const [timePart, period] = time.split(' ');
              let [hours, minutes] = timePart.split(':').map(Number);
              
              // Convert to 24-hour format for comparison
              if (period === 'PM' && hours !== 12) {
                hours += 12;
              } else if (period === 'AM' && hours === 12) {
                hours = 0;
              }
              
              const currentTime = new Date();
              const slotTime = new Date();
              slotTime.setHours(hours, minutes, 0, 0);
              
              isTimePassed = currentTime > slotTime;
            }
            
            // Determine if the slot should be disabled
            const isDisabled = !availableSlots.includes(time) || isTimePassed;
            
            return (
              <button
                key={time}
                className={`time-slot 
                  ${selectedTime === time ? "selected" : ""} 
                  ${isTimePassed ? "time-passed" : ""} 
                  ${isDisabled ? "disabled" : ""}
                `}
                onClick={() => !isDisabled && setSelectedTime(time)}
                disabled={isDisabled}
                title={isTimePassed ? "Time has already passed" : (!availableSlots.includes(time) ? "Slot full" : "")}
              >
                {time}
              </button>
            );
          })}
        </div>
      </div>

      {/* --- Buttons --- */}
      <div className="vehicle-info-last-button">
        <button className="vehicle-info-back" onClick={onBack}>Back</button>
        <button
          className="vehicle-info-continue"
          onClick={handleContinue}
          disabled={!selectedDate || !selectedTime}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default Time;
