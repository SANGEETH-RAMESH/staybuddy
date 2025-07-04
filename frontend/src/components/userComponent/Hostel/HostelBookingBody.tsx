import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Wallet, CreditCard, AlertCircle, AlertTriangle } from 'lucide-react';

import { toast } from 'react-toastify';
import { Notification } from '../../../interface/Notification';
import { io } from "socket.io-client";
import { getSingleHostel, getUserDetails, getWalletDetails, orderDetails, payment } from '../../../hooks/userHooks';
const socket = io("http://localhost:4000");

declare class Razorpay {
  constructor(options: RazorpayOptions);
  open(): void;
  on(event: string, callback: (response: RazorpayResponse) => void): void;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface ValidationErrors {
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  selectedBeds?: string;
  facilities?: string;
}

const BookingForm = () => {
  const [maxBeds, setMaxBeds] = useState(1);
  const [selectedBeds, setSelectedBeds] = useState(1);
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
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('')
  const [hostelName, setHostelName] = useState('')

  // Validation states
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  // const [facilityError, setFacilityError] = useState<string>('');

  const { id } = useParams();
  const navigate = useNavigate();

  const totalRentAmount = baseRentAmount * selectedBeds;
  const totalDepositAmount = baseDepositAmount * selectedBeds;
  const totalFoodRate = foodRate * selectedBeds;
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
      try {
        if(!id) return ;
        const [hostelResponse, userResponse, walletResponse] = await Promise.all([
          getSingleHostel(id),
          getUserDetails(),
          getWalletDetails()
        ]);

        const hostelData = hostelResponse.data.message;
        const userData = userResponse.data.data;
        const walletData = walletResponse.data.message;
        console.log(walletData, 'hee')
        setWalletBalance(walletData.balance);
        setUserId(userData._id)
        setCustomerEmail(userData.email);
        setCustomerName(userData.name);
        setCustomerPhone(userData.mobile);
        setMaxBeds(parseInt(hostelData.beds));
        setSelectedBeds(1);
        setBaseRentAmount(hostelData.bedShareRoom);
        setBaseDepositAmount(hostelData.advanceamount);
        setCategory(hostelData.category === 'men' ? 'MEN' : hostelData.category === 'women' ? 'WOMEN' : 'N/A');
        setTenantPreferred(hostelData.policies);
        setHost_id(hostelData.host_id._id);
        setFoodRate(hostelData.foodRate);
        setHostelName(hostelData.hostelname)

        const facilitiesArray = hostelData.facilities[0].split(',').map((f: string) => f.trim().toLowerCase());
        setAvailableFacilities(facilitiesArray);
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
    };

    try {
      const response = await orderDetails(bookingDetails);
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
        toast.success('Hostel Booked Successfully');

        navigate('/user/hostel');
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
    if (paymentMethod === 'wallet') {
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
    };

    try {
      const response = await orderDetails(bookingDetails);
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
        toast.success('Hostel Booked Successfully');
        navigate('/user/hostel');
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

  return (
    <div className="max-w-4xl p-6 mx-auto bg-white rounded-lg shadow-lg">
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
            <label className="block text-sm text-blue-600 mb-1">Rent Amount / Month</label>
            <input
              type="text"
              value={totalRentAmount}
              disabled
              className="w-full p-2 border rounded-lg bg-gray-50"
            />
          </div>

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
              value={category}
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
                <span>Rent Amount:</span>
                <span>₹{totalRentAmount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Deposit Amount:</span>
                <span>₹{totalDepositAmount}</span>
              </div>
              {selectedFacilities.food && (
                <div className="flex justify-between text-sm">
                  <span>Food Charges:</span>
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
  );
};

export default BookingForm;