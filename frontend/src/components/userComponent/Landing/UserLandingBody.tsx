import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../../redux/userAuthSlice';
import { ArrowRight, Shield, Zap, Users } from 'lucide-react';
import landing_1 from '../../../assets/landing_1.jpg'

const UserLandingBody = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const accessToken = queryParams?.get('accessToken');
  const refreshToken = queryParams?.get('refreshToken');

  if (accessToken && refreshToken) {
    dispatch(
      loginSuccess({
        accessToken: accessToken,
        refreshToken: refreshToken,
        isLoggedIn: true,
      })
    );
  }

  return (
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
          onClick={()=>navigate('/user/hostel')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold flex items-center gap-2 transition-colors">
            Get Started <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Why Choose Us
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-md">
              <Shield className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Secure Platform</h3>
              <p className="text-gray-600">
                Your security is our top priority. We ensure your data is protected at all times.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-md">
              <Zap className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Lightning Fast</h3>
              <p className="text-gray-600">
                Experience lightning-fast performance with our optimized platform.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-md">
              <Users className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Community Driven</h3>
              <p className="text-gray-600">
                Join our thriving community of users and grow together.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLandingBody;