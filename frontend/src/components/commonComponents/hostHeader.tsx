import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../redux/hostAuthSlice';
import { MessageCircle, Building2, User, LogOut } from 'lucide-react';
import hostapiClient from '../../services/hostapiClient';
import { LOCALHOST_URL } from '../../constants/constants';

const HostHeader = () => {

  const [name,setName] = useState('')

  useEffect(()=>{
    const fetchData = async ()=>{
        try {
            const response = await hostapiClient.get(`${LOCALHOST_URL}/host/getHost`);
            console.log(response.data.message.name,'data')
            setName(response.data.message.name)
        } catch (error) {
            console.error("Error fetching user details:",error)
        }
    }
    fetchData();
},[])

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout({ isLoggedIn: false }));
    navigate('/host/login');
  };

  const handlePropertiesClick = () =>{
    navigate('/host/hostel')
  }

  const handleHomeClick = () =>{
    navigate('/host/home')
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <button
          onClick={handleHomeClick}
          className="text-xl md:text-2xl font-bold text-emerald-600 hover:text-emerald-800 transition-colors"
        >
          StayBuddy Host
        </button>

        <nav className="flex items-center space-x-6">
          <button className="hidden md:flex items-center text-gray-600 hover:text-emerald-600 transition-colors">
            <MessageCircle className="w-5 h-5" />
            <span className="ml-2 text-sm">Messages</span>
          </button>

          <button
            onClick={handlePropertiesClick}
            className="hidden md:flex items-center text-gray-600 hover:text-emerald-600 transition-colors"
          >
            <Building2 className="w-5 h-5" />
            <span className="ml-2 text-sm">Properties</span>
          </button>

          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <User className="w-8 h-8 text-gray-600" />
              <span className="hidden md:inline ml-2 font-medium">{name||"HostName"}</span>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};



export default HostHeader;
