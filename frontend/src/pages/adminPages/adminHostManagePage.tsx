import React, { useState } from 'react';
import AdminSidebar from '../../components/commonComponents/adminSidebar';
import AdminHeader from '../../components/commonComponents/adminHeader';
import { Menu, X } from 'lucide-react';
import AdminHostManageBody from '../../components/adminComponent/HostManage/AdminHostManageBody';

const AdminHostManagePage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#2D394E] flex flex-col">
      {/* Header - Fixed at the top */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <AdminHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />
      </div>
      
      {/* Main content area with proper spacing */}
      <div className="flex flex-1 pt-16"> {/* Push content below fixed header */}
        {/* Sidebar - Fixed on the left */}
        <div className="fixed left-0 top-16 bottom-0 z-40">
          <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        </div>
        
        {/* Overlay for mobile when sidebar is open */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 top-16 bg-black bg-opacity-50 lg:hidden z-30"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Main content with proper margin to avoid sidebar overlap */}
        <div className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? 'lg:ml-64 pl-2 md:pl-4' : 'ml-0'
        }`}>
          <AdminHostManageBody />
        </div>
      </div>
      
      {/* Toggle button for mobile */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed bottom-4 right-4 z-50 lg:hidden bg-[#45B8F2] p-3 rounded-full shadow-lg"
      >
        {isSidebarOpen ? <X size={24} color="white" /> : <Menu size={24} color="white" />}
      </button>
    </div>
  );
};

export default AdminHostManagePage;