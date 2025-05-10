import React, { useState } from 'react'
import AdminSidebar from '../../components/commonComponents/adminSidebar';
import AdminHeader from '../../components/commonComponents/adminHeader';
import AdminAddCategoryBody from '../../components/adminComponent/Category/AdminAddCategory'


const AdminCategoryPage = () => {
    // const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isSidebarOpen,setIsSidebarOpen] = useState(true)

    return (
      <div className="min-h-screen bg-[#2D394E] flex flex-col">
        {/* Fixed Header */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <AdminHeader 
            onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            isSidebarOpen={isSidebarOpen} 
          />
        </div>
        
        <div className="flex flex-1 relative">
          {/* Overlay for mobile when sidebar is open */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-40"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
          
          {/* Sidebar */}
          <div className="fixed top-0 left-0 h-full z-40 pt-[11vh]">
            <AdminSidebar
              isOpen={isSidebarOpen} 
              onClose={() => setIsSidebarOpen(false)} 
            />
          </div>
          
          {/* Main Content */}
          {/* <div className="flex-1">
            <AdminUserManageBody />
          </div> */}
  
          <div className={`w-full transition-all duration-300 ${
            isSidebarOpen ? 'lg:ml-20' : 'ml-0'
          }`}>
            <div className="w-full">
                <AdminAddCategoryBody/>
            </div>
          </div>
        </div>
      </div>
    );
}

export default AdminCategoryPage

