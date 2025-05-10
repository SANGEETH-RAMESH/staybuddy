import React from 'react';
import { Menu,X } from 'lucide-react';
import admin_icon from '../../assets/settings.png';
import edit_icon from '../../assets/edit.png'

interface AdminHeaderProps {
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuClick, isSidebarOpen }) => {
  return (
    <div className="w-full h-[11vh] bg-[#212936] text-white flex items-center px-4 relative z-50">
      <button 
        onClick={onMenuClick}
        className="lg:hidden text-white p-2 hover:bg-[#45B8F2]/10 rounded-md"
        aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      
      <div className="text-2xl font-bold text-[#45B8F2] ml-4 lg:ml-16">
        StayBuddy
      </div>

      <div className="ml-auto flex items-center gap-3">
        <img
          src={admin_icon}
          alt="User"
          className="w-8 h-8 rounded-full"
        />
        <span className="font-bold hidden sm:inline">
          Admin
        </span>
        <button className="bg-transparent border-none cursor-pointer">
          <img
            src={edit_icon}
            alt="Edit"
            className="w-5 h-5"
          />
        </button>
      </div>
    </div>
  );
};

export default AdminHeader;