import React, { useEffect, useState } from 'react';
import { Building2, Bed, MapPin, Image, Wifi, ShowerHead, UtensilsCrossed, Users, Info, BadgeDollarSign, Phone } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { LOCALHOST_URL } from '../../../constants/constants';
import hostapiClient from '../../../services/hostapiClient';
import { useNavigate } from 'react-router-dom';


interface Category {
  name: string;
  isActive: boolean;
}


const HostelForm = () => {
  const [step, setStep] = useState<number>(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<{
    name: string;
    location: string;
    phoneNumber: string;
    photos: File[];
    facilities: {
      wifi: boolean;
      laundry: boolean;
      food: boolean;
    };
    bedsPerRoom: string;
    policies: string;
    category: string;
    nearbyAccess: string;
    advance: string;
    bedShareRate: string;
    foodRate: string;
    host_id: string;
  }>({
    name: "",
    location: "",
    phoneNumber: "",
    photos: [],
    facilities: {
      wifi: false,
      laundry: false,
      food: false,
    },
    bedsPerRoom: "",
    policies: "",
    category: "",
    nearbyAccess: "",
    advance: "",
    bedShareRate: "",
    foodRate: "",
    host_id: "",
  });

  const [errors, setErrors] = useState<{
    name: string;
    location: string;
    phoneNumber: string;
    photos: string;
    bedsPerRoom: string;
    policies: string;
    category: string;
    nearbyAccess: string;
    advance: string;
    bedShareRate: string;
    foodRate: string;
    facilities: string;
  }>({
    name: '',
    location: '',
    phoneNumber: '',
    photos: '',
    bedsPerRoom: '',
    policies: '',
    category: '',
    nearbyAccess: '',
    advance: '',
    bedShareRate: '',
    foodRate: '',
    facilities: ''
  });

  type Facilities = {
    wifi: boolean;
    laundry: boolean;
    food: boolean;
  };

  type FormDataType = {
    name: string;
    location: string;
    phoneNumber: string;
    photos: File[];
    facilities: { wifi: boolean; laundry: boolean; food: boolean };
    bedsPerRoom: string;
    policies: string;
    category: string;
    nearbyAccess: string;
    advance: string;
    bedShareRate: string;
    foodRate: string;
  };

  const facilities = [
    { id: 'wifi', label: 'WiFi', icon: <Wifi className="w-4 h-4" /> },
    { id: 'laundry', label: 'Laundry', icon: <ShowerHead className="w-4 h-4" /> },
    { id: 'food', label: 'Food', icon: <UtensilsCrossed className="w-4 h-4" /> }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await hostapiClient.get(`${LOCALHOST_URL}/host/getHost`);
        const categorySet = await hostapiClient.get(`${LOCALHOST_URL}/host/getAllCategory`)
        const categorydata = categorySet.data.message
        setCategories(categorydata)
        console.log("Category",categorySet)
        const hostId = response.data.message._id;
        console.log(hostId)
        setFormData((prevData) => ({
          ...prevData,
          host_id: hostId,
        }));
      } catch (error) {
        console.error("Error fetching host ID:", error);
        toast.error("Failed to fetch host ID");
      }
    };
    fetchData();
  }, []);

  const validateStep1 = (): boolean => {
    let isValid = true;
    const newErrors = { ...errors };

    // Property name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Property name is required';
      isValid = false;
    } else if (formData.name.length < 3) {
      newErrors.name = 'Property name must be at least 3 characters';
      isValid = false;
    }

    // Location validation
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
      isValid = false;
    }

    // Phone number validation
    const phoneRegex = /^\d{10}$/;
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
      isValid = false;
    } else if (!phoneRegex.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
      isValid = false;
    }

    // Nearby access validation
    if (!formData.nearbyAccess.trim()) {
      newErrors.nearbyAccess = 'Nearby access details are required';
      isValid = false;
    }

    // Beds per room validation
    if (!formData.bedsPerRoom) {
      newErrors.bedsPerRoom = 'Please select number of beds per room';
      isValid = false;
    }

    // Policies validation
    if (!formData.policies) {
      newErrors.policies = 'Please select a policy';
      isValid = false;
    }

    // Category validation
    if (!formData.category) {
      newErrors.category = 'Please select a category';
      isValid = false;
    }

    // Advance amount validation
    if (!formData.advance) {
      newErrors.advance = 'Advance amount is required';
      isValid = false;
    } else if (parseInt(formData.advance) <= 0) {
      newErrors.advance = 'Advance amount must be greater than 0';
      isValid = false;
    }

    // Photos validation
    if (formData.photos.length === 0) {
      newErrors.photos = 'Please upload at least one photo';
      isValid = false;
    }

    const selectedFacilities = Object.values(formData.facilities).filter(value => value).length;
    if (selectedFacilities === 0) {
      newErrors.facilities = 'Please select at least one facility';
      isValid = false;
    } else {
      newErrors.facilities = '';
    }



    setErrors(newErrors);
    return isValid;
  };

  const validateStep2 = (): boolean => {
    let isValid = true;
    const newErrors = { ...errors };

    // Bed share rate validation
    if (!formData.bedShareRate) {
      newErrors.bedShareRate = 'Bed share rate is required';
      isValid = false;
    } else if (parseInt(formData.bedShareRate) <= 0) {
      newErrors.bedShareRate = 'Bed share rate must be greater than 0';
      isValid = false;
    }

    // Food rate validation (only if food facility is selected)
    if (formData.facilities.food) {
      if (!formData.foodRate) {
        newErrors.foodRate = 'Food rate is required when food facility is selected';
        isValid = false;
      } else if (parseInt(formData.foodRate) <= 0) {
        newErrors.foodRate = 'Food rate must be greater than 0';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (field: keyof FormDataType, value: FormDataType[keyof FormDataType]) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
    // Clear error when user starts typing
    setErrors(prev => ({
      ...prev,
      [field]: ''
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setFormData((prevData) => ({
        ...prevData,
        photos: Array.from(files),
      }));
      setErrors(prev => ({
        ...prev,
        photos: ''
      }));
    }
  };

  const handleFacilityChange = (facilityId: keyof Facilities) => {
    setFormData(prevData => {
      const newFacilities = {
        ...prevData.facilities,
        [facilityId]: !prevData.facilities[facilityId],
      };

      // Clear facilities error if at least one facility is selected
      if (Object.values(newFacilities).some(value => value)) {
        setErrors(prev => ({
          ...prev,
          facilities: ''
        }));
      }

      return {
        ...prevData,
        facilities: newFacilities,
      };
    });
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
      } else {
        toast.error("Please fill in all required fields correctly");
      }
    } else {
      if (validateStep2()) {
        handleSubmit();
      } else {
        toast.error("Please fill in all required fields correctly");
      }
    }
  };

  const navigate = useNavigate()
  const handleSubmit = async () => {

    try {

      if (!validateStep1() || !validateStep2()) {
        toast.error("Please fill in all required fields correctly");
        return;
      }

      const dataToSend = new FormData();

      (Object.keys(formData) as (keyof FormDataType)[]).forEach((key) => {
        if (key !== 'photos' && key !== 'facilities') {
          dataToSend.append(key, formData[key] as string);
        }
      });

      if (formData.facilities) {
        const facilitiesArray = Object.keys(formData.facilities).filter(
          (key) => formData.facilities[key as keyof typeof formData.facilities]
        );
        dataToSend.append('facilities', facilitiesArray.join(','));
      }

      if (formData.photos && formData.photos.length > 0) {
        formData.photos.forEach((photo) => {
          dataToSend.append('photos', photo);
        });
      }
      console.log(formData, 'hello')
      const response = await axios.post(`${LOCALHOST_URL}/host/addhostel`, dataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(response, 'sfhsdf')

      if (response.data.message === 'Hostel added') {
        toast.success("Hostel added successfully");
        navigate('/host/home')
      } else {
        toast.error("Failed to add hostel");
      }
    } catch (error) {
      console.error('Error sending data:', error);
      toast.error("Failed to add hostel");
    }
  };

  const renderStep1 = () => (
    <div className="max-w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="w-full">
          <div className="flex items-center space-x-2 mb-2">
            <Building2 className="w-4 h-4 text-[#31AFEF]" />
            <label htmlFor="name" className="text-sm font-medium">Property Name</label>
          </div>
          <input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Enter property name"
            className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#31AFEF]`}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        <div className="w-full">
          <div className="flex items-center space-x-2 mb-2">
            <MapPin className="w-4 h-4 text-[#31AFEF]" />
            <label htmlFor="location" className="text-sm font-medium">Location</label>
          </div>
          <input
            id="location"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder="Enter location"
            className={`w-full px-3 py-2 border ${errors.location ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#31AFEF]`}
          />
          {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
        </div>

        <div className="w-full">
          <div className="flex items-center space-x-2 mb-2">
            <Phone className="w-4 h-4 text-[#31AFEF]" />
            <label htmlFor="phoneNumber" className="text-sm font-medium">Phone Number</label>
          </div>
          <input
            id="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => handleChange('phoneNumber', e.target.value)}
            placeholder="Enter phone number"
            className={`w-full px-3 py-2 border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#31AFEF]`}
          />
          {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
        </div>

        <div className="w-full">
          <div className="flex items-center space-x-2 mb-2">
            <MapPin className="w-4 h-4 text-[#31AFEF]" />
            <label htmlFor="nearbyAccess" className="text-sm font-medium">Nearby Access</label>
          </div>
          <input
            id="nearbyAccess"
            value={formData.nearbyAccess}
            onChange={(e) => handleChange('nearbyAccess', e.target.value)}
            placeholder="Enter nearby access details"
            className={`w-full px-3 py-2 border ${errors.nearbyAccess ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#31AFEF]`}
          />
          {errors.nearbyAccess && <p className="text-red-500 text-xs mt-1">{errors.nearbyAccess}</p>}
        </div>

        <div className="w-full">
          <div className="flex items-center space-x-2 mb-2">
            <Bed className="w-4 h-4 text-[#31AFEF]" />
            <label htmlFor="bedsPerRoom" className="text-sm font-medium">Beds per Room</label>
          </div>
          <select
            id="bedsPerRoom"
            value={formData.bedsPerRoom}
            onChange={(e) => handleChange('bedsPerRoom', e.target.value)}
            className={`w-full px-3 py-2 border ${errors.bedsPerRoom ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#31AFEF] bg-white`}
          >
            <option value="">Select beds per room</option>
            <option value="2">2 Bed</option>
            <option value="4">4 Bed</option>
            <option value="6">6 Bed</option>
          </select>
          {errors.bedsPerRoom && <p className="text-red-500 text-xs mt-1">{errors.bedsPerRoom}</p>}
        </div>

        {/* Policies */}
        <div className="w-full">
          <div className="flex items-center space-x-2 mb-2">
            <Info className="w-4 h-4 text-[#31AFEF]" />
            <label htmlFor="policies" className="text-sm font-medium">Policies</label>
          </div>
          <select
            id="policies"
            value={formData.policies}
            onChange={(e) => handleChange('policies', e.target.value)}
            className={`w-full px-3 py-2 border ${errors.policies ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#31AFEF] bg-white`}
          >
            <option value="">Select policies</option>
            <option value="bachelors">Only Bachelors</option>
            <option value="students">Only Students</option>
          </select>
          {errors.policies && <p className="text-red-500 text-xs mt-1">{errors.policies}</p>}
        </div>

        {/* Category */}
        <div className="w-full">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="w-4 h-4 text-[#31AFEF]" />
            <label htmlFor="category" className="text-sm font-medium">Category</label>
          </div>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className={`w-full px-3 py-2 border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#31AFEF] bg-white`}
          >
            <option value="" disabled>Select category</option>
            {categories
            .filter((cat) => cat.isActive)
            .map((cat,index) => (
              <option key={index} value={cat.name}>
                {cat?.name}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
        </div>

        {/* Advance Amount */}
        <div className="w-full">
          <div className="flex items-center space-x-2 mb-2">
            <BadgeDollarSign className="w-4 h-4 text-[#31AFEF]" />
            <label htmlFor="advance" className="text-sm font-medium">Advance Amount</label>
          </div>
          <input
            id="advance"
            type="number"
            value={formData.advance}
            onChange={(e) => handleChange('advance', e.target.value)}
            placeholder="Enter advance amount"
            className={`w-full px-3 py-2 border ${errors.advance ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#31AFEF]`}
          />
          {errors.advance && <p className="text-red-500 text-xs mt-1">{errors.advance}</p>}
        </div>
      </div>

      {/* Photos Upload Section */}
      <div className="w-full mb-8">
        <div className="flex items-center space-x-2 mb-2">
          <Image className="w-4 h-4 text-[#31AFEF]" />
          <label htmlFor="photos" className="text-sm font-medium">Add Photos</label>
        </div>
        <div className={`border-2 border-dashed ${errors.photos ? 'border-red-500' : 'border-gray-300'} rounded-lg p-4 text-center w-[420px]`}>
          <input
            id="photos"
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
          <label htmlFor="photos" className="cursor-pointer w-full">
            <div className="space-y-1">
              <div className="mx-auto w-8 h-8 rounded-full bg-[#31AFEF]/10 flex items-center justify-center">
                <Image className="w-4 h-4 text-[#31AFEF]" />
              </div>
              <div className="text-sm text-gray-600">Click to upload or drag and drop</div>
              <div className="text-xs text-gray-400">PNG, JPG up to 10MB</div>
            </div>
          </label>
        </div>
        {errors.photos && <p className="text-red-500 text-xs mt-1">{errors.photos}</p>}
      </div>

      {/* Facilities Section */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="w-4 h-4 text-[#31AFEF]" />
          <label className="text-sm font-medium">Facilities</label>
        </div>
        <div className={`grid grid-cols-3 gap-4 ${errors.facilities ? 'border-red-500 border rounded-lg p-4' : ''}`}>
          {facilities.map(facility => (
            <div
              key={facility.id}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${formData.facilities[facility.id as keyof Facilities]
                ? 'border-[#31AFEF] bg-[#31AFEF]/5'
                : 'border-gray-200 hover:border-gray-300'
                }`}
              onClick={() => handleFacilityChange(facility.id as keyof Facilities)}
            >
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={facility.id}
                  checked={formData.facilities[facility.id as keyof Facilities]}
                  onChange={() => handleFacilityChange(facility.id as keyof Facilities)}
                  className="w-4 h-4 text-[#31AFEF] border-gray-300 rounded focus:ring-[#31AFEF]"
                />
                <div className="flex items-center space-x-2">
                  {facility.icon}
                  <label htmlFor={facility.id} className="cursor-pointer text-sm">{facility.label}</label>
                </div>
              </div>
            </div>
          ))}
        </div>
        {errors.facilities && (
          <p className="text-red-500 text-xs mt-1">{errors.facilities}</p>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Bed Share Rate */}
      <div className="w-full">
        <div className="flex items-center space-x-2 mb-2">
          <BadgeDollarSign className="w-4 h-4 text-[#31AFEF]" />
          <label htmlFor="bedShareRate" className="text-sm font-medium">Bed Share Rate</label>
        </div>
        <input
          id="bedShareRate"
          type="number"
          value={formData.bedShareRate}
          onChange={(e) => handleChange('bedShareRate', e.target.value)}
          placeholder="Enter bed share rate"
          className={`w-full px-3 py-2 border ${errors.bedShareRate ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#31AFEF]`}
        />
        {errors.bedShareRate && <p className="text-red-500 text-xs mt-1">{errors.bedShareRate}</p>}
      </div>

      {/* Food Rate */}
      <div className="w-full">
        <div className="flex items-center space-x-2 mb-2">
          <BadgeDollarSign className="w-4 h-4 text-[#31AFEF]" />
          <label htmlFor="foodRate" className="text-sm font-medium">Food Rate</label>
        </div>
        <input
          id="foodRate"
          type="number"
          value={formData.foodRate}
          onChange={(e) => handleChange('foodRate', e.target.value)}
          placeholder="Enter food rate"
          className={`w-full px-3 py-2 border ${errors.foodRate ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#31AFEF]`}
          disabled={!formData.facilities.food}
        />
        {errors.foodRate && <p className="text-red-500 text-xs mt-1">{errors.foodRate}</p>}
      </div>
    </div>
  );

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-md">
      {/* Progress Bar and Steps */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className={`text-sm ${step === 1 ? 'text-[#31AFEF] font-medium' : 'text-gray-500'}`}>
            Property Details
          </span>
          <span className={`text-sm ${step === 2 ? 'text-[#31AFEF] font-medium' : 'text-gray-500'}`}>
            Additional Information
          </span>
        </div>
        <div className="w-full bg-gray-200 h-2 rounded-full">
          <div
            className="bg-[#31AFEF] h-2 rounded-full transition-all duration-300"
            style={{ width: step === 1 ? '50%' : '100%' }}
          />
        </div>
      </div>

      {/* Form Steps */}
      {step === 1 ? renderStep1() : renderStep2()}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={() => setStep((prev) => prev - 1)}
          disabled={step === 1}
          className="px-4 py-2 bg-gray-300 rounded-md text-sm disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={handleNextStep}
          className="px-4 py-2 bg-[#31AFEF] text-white rounded-md text-sm"
        >
          {step === 2 ? 'Submit' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default HostelForm;