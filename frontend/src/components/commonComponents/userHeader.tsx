import React, { useEffect, useState } from 'react';
import { Menu, X, Heart, MessageCircle, User, LogOut } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/userAuthSlice';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import { LOCALHOST_URL } from '../../constants/constants';

import { io } from "socket.io-client";
const socket = io("http://localhost:4000");

export const UserHeader: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout({ isLoggedIn: false }));
    handleSocket()
    navigate('/user/login');
  };

  const handleSocket = ()=>{
    socket.emit('userLogout',userId)
  }

 

  const [name,setName] = useState('');
  const [userId,setUserId] = useState('')

  useEffect(()=>{
    const fetchData = async ()=>{
        try {
            const response = await apiClient.get(`${LOCALHOST_URL}/user/getUserDetails`);
            console.log(response.data,'data')
            setUserId(response?.data.data._id)
            setName(response?.data?.data.name)
        } catch (error) {
            console.error("Error fetching user details:",error)
        }
    }
    fetchData();
},[])


  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <button 
              onClick={() => navigate('/user/home')}
              className="text-xl font-bold bg-gradient-to-r from-[#31AFEF] to-[#2196F3] bg-clip-text text-transparent"
            >
              StayBuddy
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              <button
              onClick={()=> navigate(`/user/wishlist/${userId}`)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200">
                <Heart className="w-6 h-6 text-gray-600" />
              </button>
              
              <button
              onClick={()=>navigate(`/user/chat/${userId}`)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200">
                <MessageCircle className="w-6 h-6 text-gray-600" />
              </button>

              <button 
                onClick={() => navigate('/user/profile')}
                className="flex items-center space-x-3 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <div className="w-8 h-8 rounded-full border-2 border-[#31AFEF] p-0.5">
                  <User className="w-full h-full text-gray-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">{name||'..Loading'}</span>
              </button>

              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-red-100 rounded-full transition-colors duration-200"
              >
                <LogOut className="w-6 h-6 text-red-600" />
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-x-0 top-16 bg-white shadow-lg md:hidden z-40">
          <div className="px-4 py-2 space-y-1">
            <button
            onClick={()=> navigate(`/user/wishlist/${userId}`)}
            className="flex items-center w-full px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200">
              <Heart className="w-5 h-5 mr-3" />
              <span className="text-sm font-medium">Wishlist</span>
            </button>

            <button
            onClick={()=> {
              console.log(userId,'Userid')
              navigate(`/user/chat/${userId}`)}}
            className="flex items-center w-full px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200">
              <MessageCircle className="w-5 h-5 mr-3" />
              <span className="text-sm font-medium">Chat</span>
            </button>

            <button 
              onClick={() => navigate('/user/profile')}
              className="flex items-center w-full px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
            >
              <User className="w-5 h-5 mr-3" />
              <span className="text-sm font-medium">Profile</span>
            </button>

            <button 
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            >
              <LogOut className="w-5 h-5 mr-3" />
              <div className="text-sm font-medium">Logout</div>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default UserHeader;
