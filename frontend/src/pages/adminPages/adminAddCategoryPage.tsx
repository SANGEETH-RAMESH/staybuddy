import  { useState } from 'react'
import AdminSidebar from '../../components/commonComponents/adminSidebar';
import AdminHeader from '../../components/commonComponents/adminHeader';
import AdminAddCategoryBody from '../../components/adminComponent/Category/adminAddCategory'
import {X,Menu} from 'lucide-react'

const AdminCategoryPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Start closed on mobile

  return (
    <div className="min-h-screen bg-[#2D394E] flex flex-col">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <AdminHeader 
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          isSidebarOpen={isSidebarOpen} 
        />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 relative pt-[11vh] min-h-screen">
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 lg:hidden z-40 top-[11vh]"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar Container */}
        <div className={`
          fixed left-0 z-40 h-[89vh] top-[11vh]
          transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:fixed lg:top-[11vh] lg:h-[89vh]
        `}>
          <AdminSidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)} 
          />
        </div>

        {/* Main Content */}
        <div className={`
          flex-1 transition-all duration-300 ease-in-out
          w-full lg:ml-64
          ${isSidebarOpen ? '' : ''}
        `}>
          <AdminAddCategoryBody />
        </div>

        {/* Floating Toggle Button for Mobile */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`
            fixed bottom-4 right-4 z-50 lg:hidden
            bg-[#45B8F2] hover:bg-[#3AA3E0] active:bg-[#2E8BC7]
            p-3 rounded-full shadow-lg shadow-black/20
            transition-all duration-200 ease-in-out
            transform hover:scale-105 active:scale-95
          `}
          aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
        >
          {isSidebarOpen ? 
            <X size={20} className="text-white" /> : 
            <Menu size={20} className="text-white" />
          }
        </button>
      </div>
    </div>
  )
}

export default AdminCategoryPage