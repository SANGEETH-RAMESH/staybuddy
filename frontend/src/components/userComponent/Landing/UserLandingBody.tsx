import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../../redux/userAuthSlice';
import { ArrowRight, Shield, Zap, Users, MapPin } from 'lucide-react';
import landing_1 from '../../../assets/landing_1.jpg'
import { jwtDecode } from 'jwt-decode';
import { socket } from '../../../utils/socket';
import {Hostel} from '../../../interface/Hostel'
import { getAllHostel } from '../../../services/userServices';



interface CustomJwtPayload {
  _id: string;
}

// interface Room {
//   _id: string;
//   bedShareRoom: string;
//   hostelname: string;
//   location: string;
//   photos: string[]
// }

const UserLandingBody = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hostel, setHostel] = useState<Hostel[]>([]);

  const accessToken = queryParams?.get('accessToken');
  const refreshToken = queryParams?.get('refreshToken');
  console.log()
  if (accessToken && refreshToken) {
    dispatch(
      loginSuccess({
        accessToken: accessToken,
        refreshToken: refreshToken,
        isLoggedIn: true,
      })
    );
  }

  useEffect(() => {
    const accessToken = localStorage.getItem('userAccessToken');
    if (accessToken) {
      const decoded = jwtDecode<CustomJwtPayload>(accessToken);
      const userId = decoded?._id
      if (userId) {
        socket.emit('userLoggedIn', userId);
      }
    }

  }, [])

  useEffect(() => {
    const fetchHostel = async () => {
      try {
        const response = await getAllHostel();
        const hostelData = (response.data.response.hostels).slice(0, 3);
        setHostel(
          hostelData.map((hostel:Hostel) => ({
            _id: hostel._id,
            hostelname: hostel.hostelname,
            location: hostel.location,
            photos: hostel.photos,
            bedShareRoom: hostel.bedShareRoom,
          }))
        );

      } catch (error) {
        console.log(error)
      }
    }
    fetchHostel()
  }, [])

  useEffect(() => {
    if (landing_1) {
      setLoading(false);
    }
  }, []);

  // Featured rooms data


  return (
    <>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="relative w-16 h-16">
            {/* Outer circle */}
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            {/* Spinning arc */}
            <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-gray-50">
          {/* Hero Section */}
          <div className="relative h-screen">
            <div className="absolute inset-0">
              <img
                src={landing_1}
                alt="Landing"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50" />
            </div>

            <div className="relative flex flex-col items-center justify-center h-full text-white px-4">
              <h1 className="text-5xl md:text-6xl font-bold text-center mb-6">
                Welcome to Our Platform
              </h1>
              <p className="text-xl md:text-2xl text-center mb-8 max-w-2xl">
                Discover amazing experiences and connect with people around the world
              </p>
              <button
                onClick={() => navigate('/hostel')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold flex items-center gap-2 transition-colors"
              >
                Get Started <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Room Rental Section */}
          <div className="py-16 px-4 max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Find Your Perfect Room</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Browse through our extensive collection of rooms, apartments, and hostels to find your ideal accommodation at unbeatable prices.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center text-center">
                <div className="bg-blue-100 p-3 rounded-full mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Secure Booking</h3>
                <p className="text-gray-600">Guaranteed safety and security with our trusted booking system and verification process.</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center text-center">
                <div className="bg-green-100 p-3 rounded-full mb-4">
                  <Zap className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Instant Confirmation</h3>
                <p className="text-gray-600">Book your room and receive instant confirmation for a hassle-free experience.</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center text-center">
                <div className="bg-purple-100 p-3 rounded-full mb-4">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Community Reviewed</h3>
                <p className="text-gray-600">Read authentic reviews from our community to make the best choice for your stay.</p>
              </div>
            </div>

            {/* Featured Rooms */}
            <div className="mb-16">
              <h3 className="text-2xl font-bold mb-8 text-center">Featured Rooms</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {hostel.map((room) => (
                  <div key={room._id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                    <img src={room.photos[0]} alt={room.hostelname} className="w-full h-48 object-cover" />
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-xl font-bold">{room.hostelname}</h4>
                        {/* <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="ml-1 text-gray-700">{room.rating}</span>
                        </div> */}
                      </div>
                      <div className="flex items-center text-gray-600 mb-4">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{room.location}</span>
                      </div>
                      <div className="flex items-center text-gray-800 font-semibold mb-4">
                        <span className="mr-1">₹</span>
                        <span>{room.bedShareRoom} per night</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {/* {room.amenities.map((amenity, index) => (
                          <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-sm">
                            {amenity}
                          </span>
                        ))} */}
                      </div>
                      <button
                        onClick={() => navigate(`/singlehostel/${room._id}`)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        View Details <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 text-center">
                <button
                  onClick={() => navigate('/hostel')}
                  className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
                >
                  Browse All Rooms <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 md:p-12 text-white text-center">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready to Find Your Perfect Room?</h3>
              <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
                Join thousands of satisfied customers who have found their ideal accommodations through our platform.
              </p>
              <button
                onClick={() => navigate('/hostel')}
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg text-lg font-semibold transition-colors inline-flex items-center gap-2"
              >
                Explore Now <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserLandingBody;