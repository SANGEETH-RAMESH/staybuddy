import React, { useState, useEffect } from 'react';
import { X, Calendar, Users, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (bookingData: BookingData) => void;
  hostelName: string;
  maxGuests?: number;
  orderDetails: any[];
  totalRooms: number;
  availableRooms: number;
}

interface BookingData {
  fromDate: string;
  toDate: string;
  guests: number;
}

const BookingModal: React.FC<BookingModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  hostelName, 
  maxGuests = 10,
  orderDetails = [],
  totalRooms = 1,
  availableRooms = 1
}) => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [guests, setGuests] = useState(1);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectingDate, setSelectingDate] = useState<'from' | 'to' | null>(null);

  // Helper function to format date in local timezone
  const formatDateToLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 2);

  // Calculate room availability for each date
  const getRoomAvailability = (date: Date) => {
    const dateStr = formatDateToLocal(date);
    let occupiedRooms = 0;

    orderDetails.forEach(booking => {
      if (booking.active !== false) {
        const bookingStart = new Date(booking.startDate);
        const bookingEnd = new Date(booking.endDate);
        bookingStart.setHours(0, 0, 0, 0);
        bookingEnd.setHours(0, 0, 0, 0);
        
        // Check if the date falls within the booking period
        if (date >= bookingStart && date <= bookingEnd) {
          occupiedRooms += booking.selectedBeds || 1;
        }
      }
    });

    return Math.max(0, totalRooms - occupiedRooms);
  };

  const getDateStatus = (date: Date) => {
    const availableRooms = getRoomAvailability(date);
    if (availableRooms <= 0) return 'unavailable';
    if (availableRooms <= totalRooms * 0.3) return 'limited';
    return 'available';
  };

  const getDateClassName = (date: Date) => {
    const dateStr = formatDateToLocal(date);
    const status = getDateStatus(date);
    const isSelected = dateStr === fromDate || dateStr === toDate;
    const isInRange = fromDate && toDate && dateStr > fromDate && dateStr < toDate;
    const isToday = date.toDateString() === today.toDateString();
    const isPast = date < today;
    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();

    let className = 'w-10 h-10 flex items-center justify-center text-sm rounded-lg transition-colors relative ';

    if (!isCurrentMonth) {
      className += 'text-gray-300 cursor-not-allowed ';
    } else if (isPast) {
      className += 'text-gray-300 cursor-not-allowed ';
    } else if (isSelected) {
      className += 'bg-blue-600 text-white font-semibold ';
    } else if (isInRange) {
      className += 'bg-blue-100 text-blue-700 ';
    } else if (status === 'unavailable') {
      className += 'bg-red-100 text-red-700 cursor-not-allowed ';
    } else if (status === 'limited') {
      className += 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 cursor-pointer ';
    } else {
      className += 'bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer ';
    }

    if (isToday && !isPast && isCurrentMonth) {
      className += 'ring-2 ring-blue-400 ';
    }

    return className;
  };

  const handleDateClick = (date: Date) => {
    const dateStr = formatDateToLocal(date);
    const isPast = date < today;
    const isUnavailable = getDateStatus(date) === 'unavailable';
    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();

    if (isPast || isUnavailable || !isCurrentMonth) return;

    if (selectingDate === 'from') {
      setFromDate(dateStr);
      setToDate('');
      setSelectingDate('to');
    } else if (selectingDate === 'to') {
      if (fromDate && dateStr > fromDate) {
        setToDate(dateStr);
        setSelectingDate(null);
        setShowCalendar(false);
      } else {
        setFromDate(dateStr);
        setToDate('');
        setSelectingDate('to');
      }
    }
  };

  const openCalendar = (type: 'from' | 'to') => {
    setSelectingDate(type);
    setShowCalendar(true);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const canNavigatePrev = () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    return prevMonth >= new Date(today.getFullYear(), today.getMonth(), 1);
  };

  const canNavigateNext = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth <= maxDate;
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    // Generate 42 days (6 weeks) to fill the calendar grid
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="bg-white border rounded-lg shadow-lg p-4 absolute top-full left-0 right-0 z-10 mt-1">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!canNavigatePrev()}
          >
            <ChevronLeft size={16} />
          </button>
          <h3 className="font-semibold text-lg">{monthNames[month]} {year}</h3>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!canNavigateNext()}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => (
            <div
              key={index}
              className={getDateClassName(date)}
              onClick={() => handleDateClick(date)}
              title={`${date.toDateString()} - ${getRoomAvailability(date)} rooms available`}
            >
              {date.getDate()}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t">
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-100 rounded border border-green-200"></div>
              <span className="text-gray-600">Available</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-100 rounded border border-yellow-200"></div>
              <span className="text-gray-600">Limited</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-100 rounded border border-red-200"></div>
              <span className="text-gray-600">Full</span>
            </div>
          </div>
        </div>

        {/* Selection Info */}
        {selectingDate && (
          <div className="mt-3 p-2 bg-blue-50 rounded text-sm text-blue-700">
            {selectingDate === 'from' ? 'Select check-in date' : 'Select check-out date'}
          </div>
        )}
      </div>
    );
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!fromDate) {
      newErrors.fromDate = 'Check-in date is required';
    }

    if (!toDate) {
      newErrors.toDate = 'Check-out date is required';
    }

    if (fromDate && toDate && new Date(fromDate) >= new Date(toDate)) {
      newErrors.toDate = 'Check-out date must be after check-in date';
    }

    if (guests < 1) {
      newErrors.guests = 'At least 1 guest is required';
    }

    if (guests > maxGuests) {
      newErrors.guests = `Maximum ${maxGuests} guests allowed`;
    }

    // Check availability for selected dates
    if (fromDate && toDate) {
      const start = new Date(fromDate);
      const end = new Date(toDate);
      const current = new Date(start);
      
      while (current <= end) {
        const availability = getRoomAvailability(current);
        if (availability <= 0) {
          newErrors.dateRange = 'Selected dates are not available';
          break;
        }
        current.setDate(current.getDate() + 1);
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onConfirm({
        fromDate,
        toDate,
        guests
      });
    }
  };

  const handleGuestChange = (increment: boolean) => {
    setGuests(prev => {
      const newValue = increment ? prev + 1 : prev - 1;
      return Math.max(1, Math.min(maxGuests, newValue));
    });
  };

  const calculateNights = () => {
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      const diffTime = to.getTime() - from.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    }
    return 0;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showCalendar && !(event.target as Element).closest('.calendar-container')) {
        setShowCalendar(false);
        setSelectingDate(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCalendar]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFromDate('');
      setToDate('');
      setGuests(1);
      setErrors({});
      setShowCalendar(false);
      setSelectingDate(null);
      setCurrentMonth(new Date());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Book Your Stay</h2>
            <p className="text-sm text-gray-600 mt-1">{hostelName}</p>
            <p className="text-xs text-gray-500 mt-1">
              {totalRooms} total rooms • {availableRooms} currently available
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Date Selection */}
          <div className="space-y-4 calendar-container relative">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline w-4 h-4 mr-2" />
                  Check-in
                </label>
                <input
                  type="text"
                  value={fromDate ? formatDate(fromDate) : ''}
                  onClick={() => openCalendar('from')}
                  readOnly
                  placeholder="Select date"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-sm ${
                    errors.fromDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.fromDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.fromDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline w-4 h-4 mr-2" />
                  Check-out
                </label>
                <input
                  type="text"
                  value={toDate ? formatDate(toDate) : ''}
                  onClick={() => openCalendar('to')}
                  readOnly
                  placeholder="Select date"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-sm ${
                    errors.toDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.toDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.toDate}</p>
                )}
              </div>
            </div>

            {showCalendar && renderCalendar()}

            {errors.dateRange && (
              <p className="text-red-500 text-sm">{errors.dateRange}</p>
            )}

            {/* Duration Display */}
            {calculateNights() > 0 && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-700">
                  Duration: {calculateNights()} {calculateNights() === 1 ? 'night' : 'nights'}
                </p>
              </div>
            )}
          </div>

          {/* Guest Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="inline w-4 h-4 mr-2" />
              Number of Guests
            </label>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => handleGuestChange(false)}
                disabled={guests <= 1}
                className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                -
              </button>
              <span className="text-lg font-medium w-8 text-center">{guests}</span>
              <button
                type="button"
                onClick={() => handleGuestChange(true)}
                disabled={guests >= maxGuests}
                className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                +
              </button>
            </div>
            {errors.guests && (
              <p className="text-red-500 text-sm mt-1">{errors.guests}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">Maximum {maxGuests} guests allowed</p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              Continue
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;