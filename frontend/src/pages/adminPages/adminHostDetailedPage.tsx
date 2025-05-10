import React, { useState } from 'react';
import AdminSidebar from '../../components/commonComponents/adminSidebar';
import AdminHeader from '../../components/commonComponents/adminHeader';
import AdminHostDetailedPage from '../../components/adminComponent/HostManage/AdminHostDetailedBody';

const AdminhostDetailedPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="bg-[#2D394E] min-h-screen">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <AdminHeader
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
      </div>

      <div className="flex pt-[11vh]">
        {/* Sidebar */}
        <div className="fixed top-[11vh] left-0 z-40 h-[calc(100vh-11vh)]">
          <AdminSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        </div>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main content area */}
        <div
          className={`transition-all duration-300 flex-1 w-full ${
            isSidebarOpen ? 'lg:ml-64' : 'ml-0'
          }`}
        >
          <div className="p-4">
            <AdminHostDetailedPage />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminhostDetailedPage;