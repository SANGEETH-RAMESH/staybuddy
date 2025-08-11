import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Wifi,
  UtensilsCrossed,
  Shirt,
  MapPin,
  Users,
  Phone,
  IndianRupee,
  User,
  Train,
  Shield,
  ChevronLeft,
  ChevronRight,
  Star,
  Power,
  X
} from 'lucide-react';
import { Hostel } from '../../../interface/Hostel';
import { getSingleHostel, status } from '../../../services/hostServices';
import toast from 'react-hot-toast';
import LocationDisplay from '../../commonComponents/locationDisplay';

const InactiveReasonModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  loading 
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  loading: boolean;
}) => {
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      onConfirm(reason);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Inactive Hostel
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for deactivation *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Please provide a reason for deactivating this hostel..."
              required
              disabled={loading}
            />
          </div>
          
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              disabled={loading || !reason.trim()}
            >
              {loading ? 'Inactivating...' : 'Inactive'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ImageGallery = ({ photos }: { photos: string[] }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const defaultImage = "/api/placeholder/800/400";
  const totalImages = photos?.length || 3;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % totalImages);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      <div className="relative">
        {/* Desktop Layout */}
        <div className="hidden md:grid grid-cols-3 gap-4 p-4">
          <div className="relative h-[480px] col-span-2 rounded-lg overflow-hidden">
            <img
              src={photos[currentImageIndex] || defaultImage}
              alt="Main hostel view"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-rows-3 gap-4">
            {[1, 2, 3].map((offset) => (
              <div key={offset} className="relative rounded-lg overflow-hidden">
                <img
                  src={photos[(currentImageIndex + offset) % totalImages] || defaultImage}
                  alt={`Hostel view ${offset + 1}`}
                  className="w-full h-[152px] object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden relative h-[400px]">
          <img
            src={photos[currentImageIndex] || defaultImage}
            alt={`Hostel view ${currentImageIndex + 1}`}
            className="w-full h-full object-cover"
          />
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {Array.from({ length: totalImages }).map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${currentImageIndex === index ? 'bg-white w-4' : 'bg-white/60'
                  }`}
                onClick={() => setCurrentImageIndex(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const HostelDetailPage = () => {
  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toggleLoading, setToggleLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const id = queryParams.get('id');

  useEffect(() => {
    const fetchHostelData = async () => {
      try {
        if(!id) return;
        const response = await getSingleHostel(id);
        setHostel(response.data.message);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch hostel details');
        setLoading(false);
        console.error('Error fetching hostel details:', error);
      }
    };

    fetchHostelData();
  }, [id]);

  // Function to handle status toggle
  const handleStatusToggle = async (inactiveReason?: string) => {
    if (!hostel || !id) return;

    setToggleLoading(true);
    
    try {
      const payload = {
        id: id,
        isActive: !hostel.isActive,
        ...(inactiveReason && { inactiveReason })
      };

      console.log('Sending to backend:', payload);
      
      const response = await status(payload);
      console.log("response",response)
      if(response.data.message == 'Status Updated'){
        toast.success('Status Updated')
      }
      
      setHostel(prev => prev ? { ...prev, isActive: !prev.isActive } : null);
      setShowModal(false);
      
    } catch (error) {
      console.error('Error updating hostel status:', error);
    } finally {
      setToggleLoading(false);
    }
  };

  const handleToggleClick = () => {
    if (!hostel) return;
    
    if (hostel.isActive) {
      setShowModal(true);
    } else {
      handleStatusToggle();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="animate-pulse text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error || !hostel) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-xl text-red-600">{error || 'Hostel not found'}</div>
      </div>
    );
  }

  const facilities: string[] = Array.isArray(hostel.facilities)
  ? hostel.facilities
  : typeof hostel.facilities === 'string'
    ? (hostel.facilities as string).split(',').map((f: string) => f.trim())
    : [];

  return (
    <div className="bg-gray-50 min-h-screen pt-20 pb-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-800">
                  {hostel.hostelname}
                </h1>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  hostel.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {hostel.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center text-gray-600">
                  <MapPin className="mr-1" size={18} />
                  <span>{hostel.location}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="mr-1" size={18} />
                  <span>{hostel.beds} Beds/Room</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className="text-2xl font-bold text-blue-600">
                ₹{hostel.bedShareRoom}/month
              </div>
              {hostel.foodRate && (
                <div className="text-sm text-gray-500">
                  + ₹{hostel.foodRate} for food
                </div>
              )}
              
              {/* Status Toggle Button */}
              <button
                onClick={handleToggleClick}
                disabled={toggleLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                  hostel.isActive
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                <Power size={16} />
                {toggleLoading 
                  ? 'Updating...' 
                  : hostel.isActive 
                    ? 'Inactivate' 
                    : 'Activate'
                }
              </button>
            </div>
          </div>
        </div>

        <ImageGallery photos={[hostel.photos]} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info Column */}
          <div className="md:col-span-2 space-y-6">
            {/* Facilities */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Star className="text-blue-500" size={20} />
                Facilities
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {facilities.map((facility, index) => (
                  <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    {facility.toLowerCase().includes('wifi') && <Wifi className="mr-2 text-blue-500" />}
                    {facility.toLowerCase().includes('food') && <UtensilsCrossed className="mr-2 text-green-500" />}
                    {facility.toLowerCase().includes('laundry') && <Shirt className="mr-2 text-purple-500" />}
                    <span className="capitalize text-sm">{facility}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location & Access */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Location & Accessibility</h2>
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <Train className="mr-3 text-blue-500 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Nearby Access</p>
                  <p className="font-medium">{hostel.nearbyaccess}</p>
                </div>
              </div>
              {hostel.latitude && hostel.longitude && (
                            <LocationDisplay
                                latitude={hostel.latitude}
                                longitude={hostel.longitude}
                                locationName={hostel.location}
                                hostelName={hostel.hostelname}
                            />
                        )}
            </div>

            {/* Policies */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Hostel Policies</h2>
              <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                <Shield className="mr-3 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Eligibility & Rules</p>
                  <p className="font-medium mt-1">{hostel.policies}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Host Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Host Information</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <User className="mr-3 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{hostel.host_id?.name}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="mr-3 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500">Contact</p>
                    <p className="font-medium">{hostel.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Pricing Details</h2>
              <div className="space-y-4">
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <IndianRupee className="mr-3 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500">Monthly Rent</p>
                    <p className="font-medium">₹{hostel.bedShareRoom?.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <IndianRupee className="mr-3 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Advance Amount</p>
                    <p className="font-medium">₹{hostel.advanceamount?.toLocaleString()}</p>
                  </div>
                </div>
                {hostel.foodRate && (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <UtensilsCrossed className="mr-3 text-orange-500" />
                    <div>
                      <p className="text-sm text-gray-500">Food Rate (Monthly)</p>
                      <p className="font-medium">₹{hostel.foodRate?.toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inactive Reason Modal */}
      <InactiveReasonModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleStatusToggle}
        loading={toggleLoading}
      />
    </div>
  );
};

export default HostelDetailPage;