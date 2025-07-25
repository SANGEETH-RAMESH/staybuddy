import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Wallet, CreditCard, AlertCircle, AlertTriangle, ArrowLeft, Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import { Notification } from '../../../interface/Notification';
import { getSingleHostel, getUserDetails, getWalletDetails, payment, createBooking } from '../../../services/userServices';
import { socket } from '../../../utils/socket';
import { RazorpayResponse, ValidationErrors } from '../../../interface/RazorpayOptions';
import { RazorpayOptions } from '../../../interface/RazorpayOptions';

declare class Razorpay {
  constructor(options: RazorpayOptions);
  open(): void;
  on(event: string, callback: (response: RazorpayResponse) => void): void;
}


const calculateMonthsDifference = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const yearDiff = end.getFullYear() - start.getFullYear();
  const monthDiff = end.getMonth() - start.getMonth();
  const dayDiff = end.getDate() - start.getDate();

  let totalMonths = yearDiff * 12 + monthDiff;

  if (dayDiff < 0) {
    totalMonths -= 1;
  }

  return Math.max(1, Math.ceil(totalMonths + (dayDiff > 0 ? dayDiff / 30 : 0)));
};

const BookingForm = () => {
  const [maxBeds, setMaxBeds] = useState(1);
  const [selectedBeds, setSelectedBeds] = useState<number>(1);
  const [selectedFacilities, setSelectedFacilities] = useState<{ [key: string]: boolean }>({
    wifi: false,
    laundry: false,
    food: false,
  });
  const [foodRate, setFoodRate] = useState(0);
  const [tenantPreferred, setTenantPreferred] = useState('');
  const [baseRentAmount, setBaseRentAmount] = useState(0);
  const [baseDepositAmount, setBaseDepositAmount] = useState(0);
  const [category, setCategory] = useState('');
  const [availableFacilities, setAvailableFacilities] = useState<string[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [host_id, setHost_id] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [isActive, setIsActive] = useState<boolean>(true)
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('')
  const [hostelName, setHostelName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [cancellationPolicy, setCancellationPolicy] = useState('');

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [bookingMonths, setBookingMonths] = useState(1);
  const [isLoading, setIsLoading] = useState(false)
  // const [facilityError, setFacilityError] = useState<string>('');

  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { fromDate, toDate, guests } = location.state || {}
  console.log(fromDate, toDate, guests, 'dddd')


  const totalRentAmount = baseRentAmount * selectedBeds * bookingMonths;
  const totalDepositAmount = baseDepositAmount * selectedBeds;
  const totalFoodRate = foodRate * selectedBeds * bookingMonths;
  const totalAmount = totalRentAmount + totalDepositAmount + (selectedFacilities.food ? totalFoodRate : 0);

  // Validation functions
  const validateName = (name: string): string | undefined => {
    if (!name.trim()) return 'Name is required';
    if (name.length < 2) return 'Name must be at least 2 characters';
    if (!/^[a-zA-Z\s]+$/.test(name)) return 'Name can only contain letters and spaces';
    return undefined;
  };

  const validatePhone = (phone: string): string | undefined => {
    if (!phone.trim()) return 'Phone number is required';
    if (!/^[0-9]{10}$/.test(phone)) return 'Phone number must be 10 digits';
    return undefined;
  };

  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email format';
    return undefined;
  };

  const validateBeds = (beds: number): string | undefined => {
    if (beds < 1) return 'Must select at least 1 bed';
    if (beds > maxBeds) return `Cannot select more than ${maxBeds} beds`;
    return undefined;
  };

  const validateFacilities = (facilities: { [key: string]: boolean }): string | undefined => {
    const selectedCount = Object.values(facilities).filter(value => value).length;
    if (selectedCount === 0) {
      return 'Please select at least one facility';
    }
    return undefined;
  };

  const handleBlur = (field: keyof ValidationErrors) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field);
  };

  useEffect(() => {
    if (startDate && endDate) {
      const months = calculateMonthsDifference(startDate, endDate);
      setBookingMonths(months);
    }
  }, [startDate, endDate]);

  const validateField = (field: keyof ValidationErrors) => {
    let fieldError: string | undefined;

    switch (field) {
      case 'customerName':
        fieldError = validateName(customerName);
        break;
      case 'customerPhone':
        fieldError = validatePhone(customerPhone);
        break;
      case 'customerEmail':
        fieldError = validateEmail(customerEmail);
        break;
      case 'selectedBeds':
        fieldError = validateBeds(selectedBeds);
        break;
    }

    setErrors(prev => ({
      ...prev,
      [field]: fieldError,
    }));

    return !fieldError;
  };

  useEffect(() => {
    if (fromDate && toDate && guests) {
      console.log(typeof guests);
      console.log(guests, 'dfsdf')
      setStartDate(fromDate);
      setEndDate(toDate);
      setSelectedBeds(guests)
    }
  }, [fromDate, toDate, guests]);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {
      customerName: validateName(customerName),
      customerPhone: validatePhone(customerPhone),
      customerEmail: validateEmail(customerEmail),
      selectedBeds: validateBeds(selectedBeds),
      facilities: validateFacilities(selectedFacilities),
    };

    setErrors(newErrors);
    setTouched({
      customerName: true,
      customerPhone: true,
      customerEmail: true,
      selectedBeds: true,
      facilities: true,
    });

    return !Object.values(newErrors).some(error => error !== undefined);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        if (!id) return;
        const [hostelResponse, userResponse, walletResponse] = await Promise.all([
          getSingleHostel(id),
          getUserDetails(),
          getWalletDetails()
        ]);

        const hostelData = hostelResponse.data.message;
        const userData = userResponse.data.data;
        const walletData = walletResponse.data.message;
        console.log(userData, 'hee')
        setCancellationPolicy(hostelData.cancellationPolicy);
        setWalletBalance(walletData.balance);
        setUserId(userData._id)
        setCustomerEmail(userData.email);
        setIsActive(hostelData.isActive)
        setCustomerName(userData.name);
        setCustomerPhone(userData.mobile);
        setMaxBeds(parseInt(hostelData.totalRooms));
        // setSelectedBeds(1);
        setBaseRentAmount(hostelData.bedShareRoom);
        setBaseDepositAmount(hostelData.advanceamount);
        setCategory(hostelData.category);
        setTenantPreferred(hostelData.policies);
        setHost_id(hostelData.host_id._id);
        setFoodRate(hostelData.foodRate);
        setHostelName(hostelData.hostelname)

        const facilitiesArray = Array.isArray(hostelData.facilities)
          ? hostelData.facilities
          : typeof hostelData.facilities === 'string'
            ? hostelData.facilities.split(',')
            : [];
        setAvailableFacilities(facilitiesArray);
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Error loading hostel details');
      }
    };

    fetchData();
  }, [id]);

  const handleBedsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    setSelectedBeds(value);
    validateField('selectedBeds');
  };

  const handleFacilityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    const newFacilities = {
      ...selectedFacilities,
      [name]: checked,
    };

    setSelectedFacilities(newFacilities);

    if (name === 'food' && !checked) {
      setFoodRate(0);
    }

    const facilityValidationError = validateFacilities(newFacilities);
    setErrors(prev => ({
      ...prev,
      facilities: facilityValidationError
    }));
    setTouched(prev => ({
      ...prev,
      facilities: true
    }));
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleWalletPayment = async () => {
    if (!validateForm()) {
      toast.error('Please correct all errors before proceeding');
      return;
    }

    if (walletBalance < totalAmount) {
      toast.error('Insufficient wallet balance');
      return;
    }

    setLoading(true);
    const bookingDetails = {
      customerName,
      customerPhone,
      customerEmail,
      selectedBeds,
      totalRentAmount,
      totalDepositAmount,
      tenantPreferred,
      selectedFacilities,
      host_id,
      hostel_id: id,
      foodRate: selectedFacilities.food ? foodRate : null,
      category,
      paymentMethod,
      cancellationPolicy,
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    };

    try {
      const response = await createBooking(bookingDetails);
      console.log(response)
      if (response.data.message === 'Hostel Booked') {
        const newNotification: Notification = {
          receiver: userId,
          message: `Your booking at ${hostelName} has been confirmed for ${new Date().toLocaleDateString()}`,
          title: 'Booking Confirmed',
          type: 'success',
          isRead: true
        }
        console.log('rece', newNotification)
        socket.emit('send_notification', newNotification)
        // toast.success('Hostel Booked Successfully');
        toast.success("Hostel Booked Successfully", { style: { backgroundColor: '#FFFFFF', color: '#31AFEF' } });

        navigate('/hostel');
      } else {
        toast.error('Booking failed');
      }
    } catch (error) {
      console.error('Wallet payment error:', error);
      toast.error('Wallet payment failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      toast.error('Please correct all errors before proceeding');
      return;
    }

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      toast.error('Failed to load payment gateway');
      return;
    }

    setLoading(true);
    try {
      const response = await payment(totalAmount)

      const { order_id } = response.data;

      const options = {
        key: 'rzp_test_s0Bm198VJWlvQ2',
        amount: totalAmount * 100,
        currency: 'INR',
        name: 'Hostel Booking',
        description: `Booking for ${selectedBeds} bed(s)`,
        order_id,
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },
        theme: {
          color: '#3B82F6',
        },
        handler: async (response: RazorpayResponse) => {
          console.log(response)
          await handleSubmit();
          // toast.success('Payment successful!');
        },
        modal: {
          ondismiss: () => toast.info('Payment cancelled'),
        },
      };

      const rzp = new Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment initiation failed:', error);
      toast.error('Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSelection = () => {
    if (isActive == false) {
      toast.error("Hostel is InActive")
    }
    else if (paymentMethod === 'wallet') {
      handleWalletPayment();
    } else {
      handlePayment();
    }
  };

  const handleSubmit = async () => {
    const bookingDetails = {
      customerName,
      customerPhone,
      customerEmail,
      selectedBeds,
      totalRentAmount,
      totalDepositAmount,
      tenantPreferred,
      selectedFacilities,
      host_id,
      hostel_id: id,
      foodRate: selectedFacilities.food ? foodRate : null,
      category,
      paymentMethod,
      cancellationPolicy,
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    };

    try {
      const response = await createBooking(bookingDetails);
      if (response.data.message === 'Hostel Booked') {
        const newNotification: Notification = {
          receiver: userId,
          message: `Your booking at ${hostelName} has been confirmed for ${new Date().toLocaleDateString()}`,
          title: 'Booking Confirmed',
          type: 'success',
          isRead: true
        }
        console.log(host_id)
        const hostNotification: Notification = {
          receiver: host_id,
          message: `A new booking has been made for ${hostelName} on ${new Date().toLocaleDateString()}`,
          title: 'New Booking received',
          type: 'info',
          isRead: true
        }
        console.log('rece', newNotification)
        socket.emit('send_notification', newNotification)
        socket.emit('send_notification', hostNotification)
        // toast.success('Hostel Booked Successfully');
        toast.success("Hostel Booked Successfully", { style: { backgroundColor: '#FFFFFF', color: '#31AFEF' } });
        navigate('/hostel');
      } else {
        toast.error('Booking failed');
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Error creating booking');
    }
  };

  const renderError = (field: keyof ValidationErrors) => {
    if (touched[field] && errors[field]) {
      return (
        <div className="flex items-center text-red-500 text-sm mt-1">
          <AlertTriangle className="h-4 w-4 mr-1" />
          <span>{errors[field]}</span>
        </div>
      );
    }
    return null;
  };

  const handleGoBack = () => {
    navigate(`/singlehostel/${id}`)
  }

  if (loading) {
    return (
      <div className="p-6 bg-white border rounded-lg">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader size="lg" className="text-blue-600 mx-auto mb-2" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return isLoading ? (
    <div className="mb-4 flex items-center justify-center h-40">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
      </div>
    </div>
  ) : (
    <>
      <div className="max-w-4xl p-6 mx-auto bg-white rounded-lg shadow-lg">

        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base font-medium">Back</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-blue-600 mb-1">Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  validateField('customerName');
                }}
                onBlur={() => handleBlur('customerName')}
                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 ${touched.customerName && errors.customerName ? 'border-red-500' : ''
                  }`}
              />
              {renderError('customerName')}
            </div>

            <div>
              <label className="block text-sm text-blue-600 mb-1">From Date</label>
              <input
                type="text"
                value={startDate}
                disabled
                className="w-full p-2 border rounded-lg bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm text-blue-600 mb-1">Rent Amount / Month</label>
              <input
                type="text"
                value={totalRentAmount}
                disabled
                className="w-full p-2 border rounded-lg bg-gray-50"
              />
            </div>



            {cancellationPolicy === 'freecancellation' && (
              <div className="p-3 bg-green-50 border  mb-1 border-green-200 rounded-lg">
                <div className="flex items-center text-green-700">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Free Cancellation Policy Available</span>
                </div>
              </div>
            )}

            {cancellationPolicy === 'no free cancellation' && (
              <div className="p-3 bg-red-50 border mb-1 border-red-200 rounded-lg">
                <div className="flex items-center text-red-700">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">No Free Cancellation — Charges may apply</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm text-blue-600 mb-1">Number of Beds (Max: {maxBeds})</label>
              <input
                type="number"
                value={selectedBeds}
                onChange={handleBedsChange}
                onBlur={() => handleBlur('selectedBeds')}
                min="1"
                max={maxBeds}
                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 ${touched.selectedBeds && errors.selectedBeds ? 'border-red-500' : ''
                  }`}
              />
              {renderError('selectedBeds')}
            </div>

            <div>
              <label className="block text-sm text-blue-400 mb-1">Category</label>
              <input
                type="text"
                readOnly
                value={category.toUpperCase()}
                className="w-full p-2 border rounded-lg bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm text-blue-400 mb-1">Preferred</label>
              <input
                type="text"
                readOnly
                value={tenantPreferred}
                className="w-full p-2 border rounded-lg bg-gray-50"
              />
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm text-blue-600 mb-2">Available Facilities</h3>
              <div className="space-y-2">
                {['Washing Machine', 'Food', 'Stove', 'Wifi', 'Refrigerator', 'Laundry'].map((facility) => {
                  const facilityKey = facility.toLowerCase();
                  const isAvailable = availableFacilities.includes(facilityKey);
                  return (
                    <div key={facility} className="flex items-center">
                      <input
                        type="checkbox"
                        id={facility}
                        name={facilityKey}
                        checked={selectedFacilities[facilityKey] || false}
                        onChange={handleFacilityChange}
                        disabled={!isAvailable}
                        className={`mr-2 ${touched.facilities && errors.facilities ? 'border-red-500' : ''}`}
                      />
                      <label
                        htmlFor={facility}
                        className={`text-sm ${isAvailable ? 'text-gray-700' : 'text-gray-400 line-through'}`}
                      >
                        {facility}
                        {!isAvailable && ' (Unavailable)'}
                      </label>
                    </div>
                  );
                })}
              </div>
              {touched.facilities && errors.facilities && (
                <div className="flex items-center text-red-500 text-sm mt-2">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  <span>{errors.facilities}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-blue-600 mb-1">Phone</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => {
                  setCustomerPhone(e.target.value);
                  validateField('customerPhone');
                }}
                onBlur={() => handleBlur('customerPhone')}
                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 ${touched.customerPhone && errors.customerPhone ? 'border-red-500' : ''
                  }`}
              />
              {renderError('customerPhone')}
            </div>

            <div>
              <label className="block text-sm text-blue-600 mb-1">End Date</label>
              <input
                type="text"
                value={endDate}
                disabled
                className="w-full p-2 border rounded-lg bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm text-blue-600 mb-1">Email</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => {
                  setCustomerEmail(e.target.value);
                  validateField('customerEmail');
                }}
                onBlur={() => handleBlur('customerEmail')}
                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 ${touched.customerEmail && errors.customerEmail ? 'border-red-500' : ''
                  }`}
              />
              {renderError('customerEmail')}
            </div>

            {selectedFacilities.food && (
              <div>
                <label className="block text-sm text-blue-600 mb-1">Food Rate / Month</label>
                <input
                  type="number"
                  value={totalFoodRate}
                  readOnly
                  className="w-full p-2 border rounded-lg bg-gray-50"
                />
              </div>
            )}



            <div>
              <label className="block text-sm text-blue-600 mb-1">Deposit</label>
              <input
                type="text"
                value={totalDepositAmount}
                disabled
                className="w-full p-2 border rounded-lg bg-gray-50"
              />
            </div>

            {/* Payment Method Selection */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Select Payment Method</h3>
              <div className="space-y-3">
                <div
                  className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => setPaymentMethod('online')}
                >
                  <input
                    type="radio"
                    id="online"
                    name="paymentMethod"
                    checked={paymentMethod === 'online'}
                    onChange={() => setPaymentMethod('online')}
                    className="h-4 w-4 text-blue-600"
                  />
                  <label htmlFor="online" className="ml-3 flex items-center cursor-pointer">
                    <CreditCard className="h-5 w-5 text-blue-500 mr-2" />
                    <span>Online Payment (Razorpay)</span>
                  </label>
                </div>

                <div
                  className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => setPaymentMethod('wallet')}
                >
                  <input
                    type="radio"
                    id="wallet"
                    name="paymentMethod"
                    checked={paymentMethod === 'wallet'}
                    onChange={() => setPaymentMethod('wallet')}
                    className="h-4 w-4 text-blue-600"
                  />
                  <label htmlFor="wallet" className="ml-3 flex items-center cursor-pointer">
                    <Wallet className="h-5 w-5 text-blue-500 mr-2" />
                    <span>Wallet Balance (₹{walletBalance})</span>
                  </label>
                  {paymentMethod === 'wallet' && walletBalance < totalAmount && (
                    <div className="ml-2 flex items-center text-red-500">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">Insufficient balance</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Amount Summary */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Rent Amount ({bookingMonths} month{bookingMonths > 1 ? 's' : ''}):</span>
                  <span>₹{totalRentAmount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Deposit Amount:</span>
                  <span>₹{totalDepositAmount}</span>
                </div>
                {selectedFacilities.food && (
                  <div className="flex justify-between text-sm">
                    <span>Food Charges ({bookingMonths} month{bookingMonths > 1 ? 's' : ''}):</span>
                    <span>₹{totalFoodRate}</span>
                  </div>
                )}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total Amount:</span>
                    <span>₹{totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <button
              onClick={handlePaymentSelection}
              disabled={loading || (paymentMethod === 'wallet' && walletBalance < totalAmount)}
              className={`w-full py-3 px-4 rounded-lg flex items-center justify-center space-x-2 
              ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} 
              ${paymentMethod === 'wallet' && walletBalance < totalAmount ? 'bg-gray-400' : ''}
              text-white font-medium transition-colors duration-200`}
            >
              {loading ? (
                <span>Processing...</span>
              ) : (
                <>
                  {paymentMethod === 'wallet' ? (
                    <>
                      <Wallet className="h-5 w-5" />
                      <span>Pay with Wallet</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5" />
                      <span>Pay Online</span>
                    </>
                  )}
                </>
              )}
            </button>

          </div>
        </div>
      </div>
    </>


  );
};

export default BookingForm;