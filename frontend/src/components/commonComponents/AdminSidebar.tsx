import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/adminAuthSlice';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Navigation functions for each path
  const navigateToDashboard = () => {
    navigate('/admin/dashboard');
    onClose();
  };

  const navigateToUsers = async () => {
    navigate('/admin/user');
    onClose();
  };

  const navigateToCategories = () => {
    navigate('/admin/category');
    onClose();
  };

  const navigateToHost = () => {
    navigate('/admin/host');
    onClose();
  };

  // const navigateToPayment = () => {
  //   navigate('/admin/payment');
  //   onClose();
  // };

  const navigateToHostel = () => {
    navigate('/admin/hostel');
    onClose();
  };

  const handleLogout = () => {
    console.log('Logging out');
    dispatch(logout({ isLogged: false }));
    navigate('/admin/login');
  };

  return (
    <div
      className={cn(
        'fixed lg:relative bg-[#212936] text-white h-[89vh] transition-all duration-300',
        'w-48 sm:w-56 md:w-60 lg:w-64',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        'overflow-hidden z-50'
      )}
    >
      <div className="flex flex-col items-center gap-2 sm:gap-3 md:gap-4 py-4 sm:py-6 md:py-8 px-2 sm:px-3 md:px-4">
        <button
          onClick={navigateToDashboard}
          className={cn(
            'w-full py-2 sm:py-2.5 md:py-3 px-2 sm:px-3 md:px-4',
            'text-sm sm:text-base rounded-md transition-colors',
            'truncate',
            location.pathname === '/admin/dashboard'
              ? 'bg-[#45B8F2]'
              : 'bg-[#212936] hover:bg-[#45B8F2]/10'
          )}
        >
          Dashboard
        </button>
        <button
          onClick={navigateToUsers}
          className={cn(
            'w-full py-2 sm:py-2.5 md:py-3 px-2 sm:px-3 md:px-4',
            'text-sm sm:text-base rounded-md transition-colors',
            'truncate',
            location.pathname === '/admin/user'
              ? 'bg-[#45B8F2]'
              : 'bg-[#212936] hover:bg-[#45B8F2]/10'
          )}
        >
          Users
        </button>
        <button
          onClick={navigateToCategories}
          className={cn(
            'w-full py-2 sm:py-2.5 md:py-3 px-2 sm:px-3 md:px-4',
            'text-sm sm:text-base rounded-md transition-colors',
            'truncate',
            location.pathname === '/admin/category'
              ? 'bg-[#45B8F2]'
              : 'bg-[#212936] hover:bg-[#45B8F2]/10'
          )}
        >
          Categories
        </button>
        <button
          onClick={navigateToHost}
          className={cn(
            'w-full py-2 sm:py-2.5 md:py-3 px-2 sm:px-3 md:px-4',
            'text-sm sm:text-base rounded-md transition-colors',
            'truncate',
            location.pathname === '/admin/host'
              ? 'bg-[#45B8F2]'
              : 'bg-[#212936] hover:bg-[#45B8F2]/10'
          )}
        >
          Host
        </button>
        {/* <button
          onClick={navigateToPayment}
          className={cn(
            'w-full py-2 sm:py-2.5 md:py-3 px-2 sm:px-3 md:px-4',
            'text-sm sm:text-base rounded-md transition-colors',
            'truncate',
            location.pathname === '/admin/payment'
              ? 'bg-[#45B8F2]'
              : 'bg-[#212936] hover:bg-[#45B8F2]/10'
          )}
        >
          Payment
        </button> */}
        <button
          onClick={navigateToHostel}
          className={cn(
            'w-full py-2 sm:py-2.5 md:py-3 px-2 sm:px-3 md:px-4',
            'text-sm sm:text-base rounded-md transition-colors',
            'truncate',
            location.pathname === '/admin/hostel'
              ? 'bg-[#45B8F2]'
              : 'bg-[#212936] hover:bg-[#45B8F2]/10'
          )}
        >
          Hostel
        </button>
        <button
          onClick={handleLogout}
          className="w-full py-2 sm:py-2.5 md:py-3 px-2 sm:px-3 md:px-4 text-sm sm:text-base rounded-md bg-red-600 hover:bg-red-700 transition-colors mt-auto truncate"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;