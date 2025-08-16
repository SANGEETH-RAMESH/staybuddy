import React, { useEffect, useState } from 'react';
import { Building2, Bed, MapPin, Image, Wifi, ShowerHead, UtensilsCrossed, Users, Info, BadgeDollarSign, Phone } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import { Category } from '../../../interface/Category';
import { editHostel, getAllCategory, getSingleHostel } from '../../../services/hostServices';
import LocationPicker from '../../commonComponents/LocationPicker';

const HostelEditForm = () => {
  const { id } = useParams<{ id: string }>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [photosToDelete, setPhotosToDelete] = useState<string[]>([]);
  const [showLocationPicker, setShowLocationPicker] = useState<boolean>(false);

  const [formData, setFormData] = useState<{
    hostelname: string;
    location: string;
    latitude: number;
    longitude: number;
    phone: string;
    photos: File[];
    facilities: {
      wifi: boolean;
      laundry: boolean;
      food: boolean;
    };
    beds: string;
    policies: string;
    category: string;
    nearbyaccess: string;
    advanceamount: string;
    bedShareRate: string;
    foodRate: string;
    host_id: string;
    cancellationPolicy: string;
    bookingType: string;
  }>({
    hostelname: "",
    location: "",
    latitude: 0,
    longitude: 0,
    phone: "",
    photos: [],
    facilities: {
      wifi: false,
      laundry: false,
      food: false,
    },
    beds: "",
    policies: "",
    category: "",
    nearbyaccess: "",
    advanceamount: "",
    bedShareRate: "",
    foodRate: "",
    host_id: "",
    cancellationPolicy: "",
    bookingType: ""
  });

  const [errors, setErrors] = useState<{
    hostelname: string;
    location: string;
    phone: string;
    photos: string;
    beds: string;
    policies: string;
    category: string;
    nearbyaccess: string;
    advanceamount: string;
    bedShareRate: string;
    foodRate: string;
    facilities: string;
    cancellationPolicy: string;
    bookingType: string;
  }>({
    hostelname: '',
    location: '',
    phone: '',
    photos: '',
    beds: '',
    policies: '',
    category: '',
    nearbyaccess: '',
    advanceamount: '',
    bedShareRate: '',
    foodRate: '',
    facilities: '',
    cancellationPolicy: "",
    bookingType: ""
  });

  type Facilities = {
    wifi: boolean;
    laundry: boolean;
    food: boolean;
  };

  type FormDataType = {
    hostelname: string;
    location: string;
    latitude: number;
    longitude: number;
    phone: string;
    photos: File[];
    facilities: { wifi: boolean; laundry: boolean; food: boolean };
    beds: string;
    policies: string;
    category: string;
    nearbyaccess: string;
    advanceamount: string;
    bedShareRate: string;
    foodRate: string;
    cancellationPolicy: string;
    bookingType: string;
  };

  const facilities = [
    { id: 'wifi', label: 'WiFi', icon: <Wifi className="w-4 h-4" /> },
    { id: 'laundry', label: 'Laundry', icon: <ShowerHead className="w-4 h-4" /> },
    { id: 'food', label: 'Food', icon: <UtensilsCrossed className="w-4 h-4" /> }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        setLoading(true);
        const categoryResponse = await getAllCategory();
        const categoryData = categoryResponse.data.message;
        setCategories(categoryData);
        const hostelResponse = await getSingleHostel(id);
        const hostelData = hostelResponse.data.message;
        console.log(photosToDelete)
        console.log(hostelData, 'sdfdfsdf')

        const facilitiesObj = {
          wifi: !!hostelData.facilities.wifi,
          laundry: !!hostelData.facilities.laundry,
          food: !!hostelData.facilities.food,
        };

        setFormData({
          hostelname: hostelData.hostelname || "",
          location: hostelData.location || "",
          latitude: hostelData.latitude || 0,
          longitude: hostelData.longitude || 0,
          phone: hostelData.phone || "",
          photos: [],
          facilities: facilitiesObj,
          beds: hostelData.beds !== undefined ? hostelData.beds.toString() : "0",
          policies: hostelData.policies || "",
          category: hostelData.category || "",
          nearbyaccess: hostelData.nearbyaccess || "",
          advanceamount: hostelData.advanceamount || "",
          bedShareRate: hostelData.bedShareRoom || "",
          foodRate: hostelData.foodRate || "",
          host_id: hostelData.host_id || "",
          cancellationPolicy: hostelData.cancellationPolicy || "",
          bookingType: hostelData.bookingType
        });

        setExistingPhotos(hostelData.photos || []);

      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (field: keyof FormDataType, value: FormDataType[keyof FormDataType]) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
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

      const updatedFormData = {
        ...prevData,
        facilities: newFacilities,
      };

      if (Object.values(newFacilities).some(value => value)) {
        setErrors(prev => ({
          ...prev,
          facilities: ''
        }));
      }

      return updatedFormData;
    });
  };

  const handleLocationSelect = (location: string, lat: number, lng: number) => {
    setFormData(prevData => ({
      ...prevData,
      location,
      latitude: lat,
      longitude: lng
    }));
    setErrors(prev => ({
      ...prev,
      location: ''
    }));
  };

  const handleRemoveExistingPhoto = (photoUrl: string) => {
    setExistingPhotos(prev => prev.filter(photo => photo !== photoUrl));
    setPhotosToDelete(prev => [...prev, photoUrl]);
  };

  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      if (!id) return;
      const dataToSend = new FormData();

      (Object.keys(formData) as (keyof FormDataType)[]).forEach((key) => {
        const value = formData[key];
        if (key !== 'photos' && key !== 'facilities' && key !== 'foodRate') {
          dataToSend.append(key, value.toString());
        }
      });

      if (formData.facilities.food && formData.foodRate) {
        dataToSend.append('foodRate', formData.foodRate);
      }

      if (formData.facilities) {
        dataToSend.append('facilities', JSON.stringify(formData.facilities));
      }

      const allPhotos: (string | File)[] = [
        ...(existingPhotos || []),
        ...(formData.photos || [])
      ];

      allPhotos.forEach((photo) => {
        dataToSend.append('photos', photo);
      });

      const response = await editHostel(id, dataToSend);

      if (response.data.message === 'Hostel updated successfully') {
        toast.success("Hostel updated successfully");
        navigate('/host/hostel');
      } else {
        toast.error("Failed to update hostel");
      }
    } catch (error) {
      const axiosError = error as any;
        if (axiosError.response) {
          console.log(axiosError.response, "Responseeeee")
          const { message, errors: BackendErrors } = axiosError.response.data;
          console.log(message)
          console.log(BackendErrors)

          if (BackendErrors) {
            setErrors((prev) => ({
              ...prev,
              ...BackendErrors
            }))
          }
        }
    }
  };

  if (loading) {
    return (
      <div className="w-full p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading hostel data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Edit Hostel</h2>
        <p className="text-gray-600">Update your hostel property details</p>
      </div>

      <div className="max-w-full">
        {/* Basic Information Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Property Name */}
            <div className="w-full">
              <div className="flex items-center space-x-2 mb-2">
                <Building2 className="w-4 h-4 text-[#31AFEF]" />
                <label htmlFor="hostelname" className="text-sm font-medium">Property Name</label>
              </div>
              <input
                id="hostelname"
                value={formData.hostelname}
                onChange={(e) => handleChange('hostelname', e.target.value)}
                placeholder="Enter property name"
                className={`w-full px-3 py-2 border ${errors.hostelname ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#31AFEF]`}
              />
              {errors.hostelname && <p className="text-red-500 text-xs mt-1">{errors.hostelname}</p>}
            </div>

            {/* Phone Number */}
            <div className="w-full">
              <div className="flex items-center space-x-2 mb-2">
                <Phone className="w-4 h-4 text-[#31AFEF]" />
                <label htmlFor="phoneNumber" className="text-sm font-medium">Phone Number</label>
              </div>
              <input
                id="phoneNumber"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="Enter phone number"
                className={`w-full px-3 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#31AFEF]`}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
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
                  .map((cat, index) => (
                    <option key={index} value={cat.name}>
                      {cat?.name}
                    </option>
                  ))}
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
            </div>

            {/* Nearby Access */}
            <div className="w-full">
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="w-4 h-4 text-[#31AFEF]" />
                <label htmlFor="nearbyaccess" className="text-sm font-medium">Nearby Access</label>
              </div>
              <input
                id="nearbyaccess"
                value={formData.nearbyaccess}
                onChange={(e) => handleChange('nearbyaccess', e.target.value)}
                placeholder="Enter nearby access details"
                className={`w-full px-3 py-2 border ${errors.nearbyaccess ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#31AFEF]`}
              />
              {errors.nearbyaccess && <p className="text-red-500 text-xs mt-1">{errors.nearbyaccess}</p>}
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
                <option value="" disabled>Select policies</option>
                <option value="bachelors">Only Bachelors</option>
                <option value="students">Only Students</option>
              </select>
              {errors.policies && <p className="text-red-500 text-xs mt-1">{errors.policies}</p>}
            </div>

            {/* Cancellation Policy */}
            <div className='w-full'>
              <div className='flex items-center space-x-2 mb-2'>
                <Info className='w-4 h-4 text-[#31AFEF]' />
                <label htmlFor='cancellationPolicy' className='text-sm font-medium'>Cancellation Policy</label>
              </div>
              <select
                id='cancellationPolicy'
                value={formData.cancellationPolicy}
                onChange={(e) => handleChange('cancellationPolicy', e.target.value)}
                className={`w-full px-3 py-2 border ${errors.cancellationPolicy ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#31AFEF] bg-white`}
              >
                <option value="" disabled>Select cancellation policy</option>
                <option value="freecancellation">Free Cancellation</option>
                <option value="no free cancellation">No Free Cancellation</option>
              </select>
              {errors.cancellationPolicy && <p className='text-red-500 text-xs mt-1'>{errors.cancellationPolicy}</p>}
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Location Details</h3>
          <div className="w-full">
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="w-4 h-4 text-[#31AFEF]" />
              <label htmlFor="location" className="text-sm font-medium">Location</label>
            </div>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="Enter location or click 'Select on Map'"
                  className={`flex-1 px-3 py-2 border ${errors.location ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#31AFEF]`}
                />
                <button
                  type="button"
                  onClick={() => setShowLocationPicker(!showLocationPicker)}
                  className="px-4 py-2 bg-[#31AFEF] text-white rounded-md hover:bg-[#2a9ad8] transition-colors flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  {showLocationPicker ? 'Hide Map' : 'Select on Map'}
                </button>
              </div>

              {showLocationPicker && (
                <div className="border rounded-lg overflow-hidden shadow-sm">
                  <LocationPicker
                    onLocationSelect={handleLocationSelect}
                    selectedLocation={formData.location}
                    initialLatitude={formData.latitude}
                    initialLongitude={formData.longitude}
                  />
                </div>
              )}

              {formData.location && (
                <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                  <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800">Selected Location:</p>
                    <p className="text-xs text-green-700 mt-1 leading-relaxed">{formData.location}</p>
                    {formData.latitude !== 0 && formData.longitude !== 0 && (
                      <p className="text-xs text-green-600 mt-1">
                        Coordinates: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        location: '',
                        latitude: 0,
                        longitude: 0
                      }));
                    }}
                    className="text-green-600 hover:text-green-800 text-sm font-medium"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
            {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
          </div>
        </div>

        {/* Room Configuration Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Room Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Beds per Room */}
            <div className="w-full">
              <div className="flex items-center space-x-2 mb-2">
                <Bed className="w-4 h-4 text-[#31AFEF]" />
                <label htmlFor="beds" className="text-sm font-medium">Beds per Room</label>
              </div>
              <select
                id="beds"
                value={formData.beds}
                onChange={(e) => handleChange('beds', e.target.value)}
                className={`w-full px-3 py-2 border ${errors.beds ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#31AFEF] bg-white`}
              >
                <option value="" disabled>Select beds per room</option>
                {formData.beds === "0" && (
                  <option value="0" disabled>
                    0 Bed (Current)
                  </option>
                )}
                <option value="1">1 Bed</option>
                <option value="2">2 Bed</option>
                <option value="3">3 Bed</option>
                <option value="4">4 Bed</option>
                <option value="5">5 Bed</option>
                <option value="6">6 Bed</option>
              </select>
              {errors.beds && <p className="text-red-500 text-xs mt-1">{errors.beds}</p>}
            </div>

            {/* Booking Type */}
            <div className="w-full">
              <div className="flex items-center space-x-2 mb-2">
                <Bed className="w-4 h-4 text-[#31AFEF]" />
                <label htmlFor="bookingType" className="text-sm font-medium">Booking Type</label>
              </div>
              <select
                id="bookingType"
                value={formData.bookingType}
                onChange={(e) => handleChange('bookingType', e.target.value)}
                className={`w-full px-3 py-2 border ${errors.bookingType ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#31AFEF] bg-white`}
              >
                <option value="" disabled>Select Booking Type</option>
                <option value="one month">For One Month</option>
                <option value="one day">For One Day</option>
              </select>
              {errors.bookingType && <p className="text-red-500 text-xs mt-1">{errors.bookingType}</p>}
            </div>
          </div>
        </div>

        {/* Photos Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Property Photos</h3>

          {/* Existing Photos */}
          {existingPhotos.length > 0 && (
            <div className="w-full mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <Image className="w-4 h-4 text-[#31AFEF]" />
                <label className="text-sm font-medium">Current Photos</label>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {existingPhotos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={photo}
                      alt={`Hostel ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingPhoto(photo)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload New Photos */}
          <div className="w-full">
            <div className="flex items-center space-x-2 mb-2">
              <Image className="w-4 h-4 text-[#31AFEF]" />
              <label htmlFor="photos" className="text-sm font-medium">
                {existingPhotos.length > 0 ? 'Add More Photos (Optional)' : 'Upload New Photos'}
              </label>
            </div>
            <div className={`border-2 border-dashed ${errors.photos ? 'border-red-500' : 'border-gray-300'} rounded-lg p-6 text-center`}>
              <input
                id="photos"
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
              <label htmlFor="photos" className="cursor-pointer w-full">
                <div className="space-y-2">
                  <div className="mx-auto w-12 h-12 rounded-full bg-[#31AFEF]/10 flex items-center justify-center">
                    <Image className="w-6 h-6 text-[#31AFEF]" />
                  </div>
                  <div className="text-sm text-gray-600">Click to upload or drag and drop</div>
                  <div className="text-xs text-gray-400">PNG, JPG up to 10MB each</div>
                  {formData.photos.length > 0 && (
                    <div className="text-sm text-green-600 font-medium">
                      {formData.photos.length} new file(s) selected
                    </div>
                  )}
                </div>
              </label>
            </div>
            {errors.photos && <p className="text-red-500 text-xs mt-1">{errors.photos}</p>}
          </div>
        </div>

        {/* Facilities Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Facilities</h3>
          <div className="flex items-center space-x-2 mb-4">
            <Users className="w-4 h-4 text-[#31AFEF]" />
            <label className="text-sm font-medium">Available Facilities</label>
          </div>
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${errors.facilities ? 'border-red-500 border rounded-lg p-4' : ''}`}>
            {facilities.map(facility => (
              <div
                key={facility.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${formData.facilities[facility.id as keyof Facilities]
                  ? 'border-[#31AFEF] bg-[#31AFEF]/5'
                  : 'border-gray-200 hover:border-gray-300'
                  }`}
                onClick={() => handleFacilityChange(facility.id as keyof Facilities)}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id={facility.id}
                    checked={formData.facilities[facility.id as keyof Facilities]}
                    onChange={() => handleFacilityChange(facility.id as keyof Facilities)}
                    className="w-4 h-4 text-[#31AFEF] border-gray-300 rounded focus:ring-[#31AFEF]"
                  />
                  <div className="flex items-center space-x-2">
                    {facility.icon}
                    <label htmlFor={facility.id} className="cursor-pointer text-sm font-medium">{facility.label}</label>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {errors.facilities && (
            <p className="text-red-500 text-xs mt-1">{errors.facilities}</p>
          )}
        </div>

        {/* Pricing Information Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Pricing Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Advance Amount */}
            <div className="w-full">
              <div className="flex items-center space-x-2 mb-2">
                <BadgeDollarSign className="w-4 h-4 text-[#31AFEF]" />
                <label htmlFor="advanceamount" className="text-sm font-medium">Advance Amount (₹)</label>
              </div>
              <input
                id="advanceamount"
                type="number"
                value={formData.advanceamount}
                onChange={(e) => handleChange('advanceamount', e.target.value)}
                placeholder="Enter advance amount"
                className={`w-full px-3 py-2 border ${errors.advanceamount ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#31AFEF]`}
              />{errors.advanceamount && <p className="text-red-500 text-xs mt-1">{errors.advanceamount}</p>}
            </div>

            {/* Bed Share Rate */}
            <div className="w-full">
              <div className="flex items-center space-x-2 mb-2">
                <BadgeDollarSign className="w-4 h-4 text-[#31AFEF]" />
                <label htmlFor="bedShareRate" className="text-sm font-medium">Bed Share Rate (₹)</label>
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
                <label htmlFor="foodRate" className="text-sm font-medium">
                  Food Rate (₹) {!formData.facilities.food && <span className="text-gray-400">(Optional)</span>}
                </label>
              </div>
              <input
                id="foodRate"
                type="number"
                value={formData.foodRate}
                onChange={(e) => handleChange('foodRate', e.target.value)}
                placeholder="Enter food rate"
                className={`w-full px-3 py-2 border ${errors.foodRate ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-[#31AFEF] ${!formData.facilities.food ? 'bg-gray-50' : ''}`}
                disabled={!formData.facilities.food}
              />
              {errors.foodRate && <p className="text-red-500 text-xs mt-1">{errors.foodRate}</p>}
              {!formData.facilities.food && (
                <p className="text-xs text-gray-500 mt-1">Enable food facility to set food rate</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end mt-8 pt-6 border-t">
        <button
          type="button"
          onClick={handleSubmit}
          className="px-8 py-3 bg-[#31AFEF] text-white rounded-md text-sm font-medium hover:bg-[#2a9ad8] transition-colors flex items-center space-x-2"
        >
          <Building2 className="w-4 h-4" />
          <span>Submit Hostel</span>
        </button>
      </div>
    </div>
  );
};

export default HostelEditForm;