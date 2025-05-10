import { useState, useEffect } from 'react'
import AdminHeader from '../../components/commonComponents/adminHeader'
import AdminSidebar from '../../components/commonComponents/adminSidebar';
import { Menu, X } from 'lucide-react';
import HostelListings from '../../components/adminComponent/Hostel/HostelListingBody'

const AdminHostelListingsPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(80); // Default sidebar width in pixels

  // Get actual sidebar width after component mounts
  useEffect(() => {
    const sidebarElement = document.getElementById('admin-sidebar');
    if (sidebarElement && isSidebarOpen) {
      const width = sidebarElement.getBoundingClientRect().width;
      setSidebarWidth(width);
    }
  }, [isSidebarOpen]);

  return (
    <div className="min-h-screen bg-[#2D394E] flex flex-col">
      {/* Fixed header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <AdminHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />
      </div>
      
      <div className="flex flex-1">
        {/* Overlay for mobile when sidebar is open */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Toggle button for mobile */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="fixed bottom-4 right-4 z-50 lg:hidden bg-[#45B8F2] p-3 rounded-full shadow-lg"
        >
          {isSidebarOpen ? <X size={24} color="white" /> : <Menu size={24} color="white" />}
        </button>

        {/* Fixed sidebar with ID for measuring */}
        <div id="admin-sidebar" className="fixed left-0 top-0 h-full pt-16 z-40">
          <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        </div>
        
        {/* Main content area with dynamic margin */}
        <div 
          className="flex-1 pt-16 transition-all duration-300"
          style={{ 
            marginLeft: isSidebarOpen ? `${sidebarWidth}px` : '0'
          }}
        >
          <HostelListings />
        </div>
      </div>
    </div>
  )
}

export default AdminHostelListingsPage