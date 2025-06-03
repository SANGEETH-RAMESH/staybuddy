import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../redux/hostAuthSlice';
import { MessageCircle, Building2, User, LogOut, Menu, X } from 'lucide-react';
import hostapiClient from '../../services/hostapiClient';
import { LOCALHOST_URL } from '../../constants/constants';

import { io } from "socket.io-client";
const socket = io("http://localhost:4000");

const HostHeader = () => {
  const [name, setName] = useState('');
  const [hostId, setHostId] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await hostapiClient.get(`${LOCALHOST_URL}/host/getHost`);
        setHostId(response.data.message._id);
        setName(response.data.message.name);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };
    fetchData();
  }, []);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout({ isLoggedIn: false }));
    handleSocket()
    navigate('/host/login');
    setMobileMenuOpen(false);
  };

  const handleSocket = ()=>{
    socket.emit('hostLogout',hostId)
  }

  const handlePropertiesClick = () => {
    navigate('/host/hostel');
    setMobileMenuOpen(false);
  };

  const handleHomeClick = () => {
    navigate('/host/home');
    setMobileMenuOpen(false);
  };

  const handleChatClick = () => {
    navigate(`/host/chat/${hostId}`);
    setMobileMenuOpen(false);
  };

  const handleProfileClick = () => {
    navigate('/host/profile');
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <button
            onClick={handleHomeClick}
            className="text-xl md:text-2xl font-bold text-emerald-600 hover:text-emerald-800 transition-colors"
          >
            StayBuddy Host
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <button
              onClick={handleChatClick}
              className="flex items-center text-gray-600 hover:text-emerald-600 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="ml-2 text-sm">Messages</span>
            </button>

            <button
              onClick={handlePropertiesClick}
              className="flex items-center text-gray-600 hover:text-emerald-600 transition-colors"
            >
              <Building2 className="w-5 h-5" />
              <span className="ml-2 text-sm">Properties</span>
            </button>

            <button
              onClick={handleProfileClick}
              className="flex items-center text-gray-600 hover:text-emerald-600 transition-colors"
            >
              <User className="w-5 h-5" />
              <span className="ml-2 text-sm font-medium text-gray-700">{name || 'Loading...'}</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 text-gray-600 hover:text-emerald-600 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50" onClick={toggleMobileMenu}>
          <div 
            className="fixed top-16 right-0 w-64 h-screen bg-white shadow-lg z-50 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col space-y-4">
              <div className="pt-2 pb-4 border-b border-gray-200">
                <button
                  onClick={handleProfileClick}
                  className="w-full flex items-center py-2 px-4 text-left rounded-md hover:bg-gray-100"
                >
                  <User className="w-5 h-5 text-emerald-600" />
                  <span className="ml-3 font-medium">{name || 'Loading...'}</span>
                </button>
              </div>

              {/* <button
                onClick={handleHomeClick}
                className="flex items-center py-2 px-4 text-left rounded-md hover:bg-gray-100"
              >
                <span className="ml-3">Home</span>
              </button> */}

              <button
                onClick={handleChatClick}
                className="flex items-center py-2 px-4 text-left rounded-md hover:bg-gray-100"
              >
                <MessageCircle className="w-5 h-5 text-emerald-600" />
                <span className="ml-3">Messages</span>
              </button>

              <button
                onClick={handlePropertiesClick}
                className="flex items-center py-2 px-4 text-left rounded-md hover:bg-gray-100"
              >
                <Building2 className="w-5 h-5 text-emerald-600" />
                <span className="ml-3">Properties</span>
              </button>

              <div className="pt-4 mt-auto border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="flex items-center py-2 px-4 text-left rounded-md hover:bg-gray-100 text-red-600"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="ml-3">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HostHeader;