import "./Time.css";
import { useState, useEffect } from "react";

const Time = () => {
  const [today] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState("10:00 AM");

  // Initialize with today's date as selected
  useEffect(() => {
    setSelectedDate(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
  }, [today]);

  // Time slots from 9:00 AM to 6:00 PM with 30 min interval, excluding 1:00, 1:30 and 2:00 PM
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        // Skip 1:00 PM, 1:30 PM, and 2:00 PM
        if ((hour === 13 && minute === 0) || (hour === 13 && minute === 30) || (hour === 14 && minute === 0)) {
          continue;
        }
        
        const time = new Date();
        time.setHours(hour, minute, 0, 0);
        const timeString = time.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        slots.push(timeString);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Generate calendar days for current month
const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get first day of month
    const firstDay = new Date(year, month, 1);
    // Get last day of month
    const lastDay = new Date(year, month + 1, 0);
    // Get day of week for first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDay.getDay();
    
    // Get days in previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    // Create array for calendar days - ONLY 35 cells (5 rows)
    const days = [];
    const totalCells = 35; // 5 rows * 7 days = 35 cells
    
    // Previous month days (grayed out)
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
    
    // Only add next month days if we have less than 35 cells
    // This removes the extra row for months that fit in 5 rows
    if (days.length < totalCells) {
        const nextMonthDays = totalCells - days.length;
        for (let i = 1; i <= nextMonthDays; i++) {
            const date = new Date(year, month + 1, i);
            days.push({
                date,
                isCurrentMonth: false,
                isSelected: selectedDate && date.toDateString() === selectedDate.toDateString(),
                isToday: false,
                isPast: date < new Date(today.getFullYear(), today.getMonth(), today.getDate())
            });
        }
    }
    
    // If days array is still less than 35, something went wrong, just return what we have
    return days;
};

  const days = generateCalendarDays();

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Month names
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handleDateClick = (date: Date, isCurrentMonth: boolean, isPast: boolean) => {
    if (isCurrentMonth && !isPast) {
      setSelectedDate(date);
    }
  };

  // Format today's date for display
  const formatTodayDate = () => {
    return today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="vehicle-info-main">
      {/* Today's Date Display */}
      {/* <div className="today-display">
        <span className="today-label">Today:</span>
        <span className="today-date">{formatTodayDate()}</span>
      </div> */}

      <p style={{ fontWeight: "700", fontSize: "20px", marginTop: "10px", marginBottom: "20px" }}>
        Select Date and time
      </p>

      <div className="calendar-container">
        {/* Calendar Header with Navigation */}
        <div className="calendar-header">
          <button className="nav-button" onClick={goToPreviousMonth}>
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <h3 className="calendar-month-year">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <button className="nav-button" onClick={goToNextMonth}>
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>

        {/* Days of Week */}
        <div className="days-of-week">
          <div>S</div>
          <div>M</div>
          <div>T</div>
          <div>W</div>
          <div>T</div>
          <div>F</div>
          <div>S</div>
        </div>

        {/* Calendar Grid */}
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

      {/* Available Slots Section */}
      <div className="slots-section">
        <h3 className="slots-title">Available Slots</h3>
        <div className="slots-grid">
          {timeSlots.map((time, index) => (
            <button
              key={index}
              className={`time-slot ${selectedTime === time ? "selected" : ""} ${
                (time === "01:00 PM" || time === "01:30 PM" || time === "02:00 PM") ? "disabled" : ""
              }`}
              onClick={() => setSelectedTime(time)}
              disabled={time === "01:00 PM" || time === "01:30 PM" || time === "02:00 PM"}
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Date and Time Display */}
      {selectedDate && (
        <div className="selection-display">
          <div className="selected-date">
            Selected Date: {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
          <div className="selected-time">
            Selected Time: {selectedTime}
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="vehicle-info-last-button">
        <button className="vehicle-info-back">Back</button>
        <button className="vehicle-info-continue">Continue</button>
      </div>
    </div>
  );
};

export default Time;