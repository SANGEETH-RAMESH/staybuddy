import React, { useState } from 'react'
import AdminSidebar from '../../components/commonComponents/adminSidebar'
import AdminDashboardBody from '../../components/adminComponent/Dashboard/AdminDashboardBody'
import AdminHeader from '../../components/commonComponents/adminHeader'
import { Menu, X } from 'lucide-react' // Import icons

const AdminDashboardPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#2D394E] flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-50">
        <AdminHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />
      </div>
      <div className="flex flex-1 relative">
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

        <div className="fixed left-0 top-0 h-full pt-16 z-40">
          <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        </div>
        <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
          <AdminDashboardBody />
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardPage