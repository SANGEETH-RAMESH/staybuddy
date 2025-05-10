import React, { useState, useEffect } from 'react';
import { Home, CreditCard, Users, TrendingUp, ChevronUp } from 'lucide-react';

const AdminDashboardBody = () => {
  // Sample data - replace with actual API calls
  const [dashboardStats, setDashboardStats] = useState({
    roomsBooked: 124,
    revenue: 45680,
    activeUsers: 89
  });

  // Sample sales data for the graph - replace with actual API data
  const [salesData, setSalesData] = useState([
    { name: 'Jan', sales: 4000 },
    { name: 'Feb', sales: 3000 },
    { name: 'Mar', sales: 5000 },
    { name: 'Apr', sales: 2780 },
    { name: 'May', sales: 1890 },
    { name: 'Jun', sales: 2390 },
    { name: 'Jul', sales: 3490 },
    { name: 'Aug', sales: 4000 },
    { name: 'Sep', sales: 4500 },
    { name: 'Oct', sales: 3800 },
    { name: 'Nov', sales: 4300 },
    { name: 'Dec', sales: 5200 }
  ]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Find the max value for scaling the graph
  const maxSales = Math.max(...salesData.map(item => item.sales));
  
  return (
    <div className="p-4 md:p-6 text-white mt-16">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        {/* <p className="text-gray-300 mt-2">Welcome to your hostel management dashboard</p> */}
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Rooms Booked Card */}
        <div className="bg-[#2F394B] rounded-lg p-6 shadow-lg border border-[#3D4D65] relative overflow-hidden">
          <div className="absolute top-0 right-0 mt-4 mr-4 bg-[#45B8F2] bg-opacity-20 p-3 rounded-full">
            <Home size={24} className="text-[#45B8F2]" />
          </div>
          <h2 className="text-gray-400 mb-1">Rooms Booked</h2>
          <div className="flex items-end">
            <span className="text-4xl font-bold mr-2">{dashboardStats.roomsBooked}</span>
            <div className="flex items-center text-green-400 text-sm pb-1">
              <ChevronUp size={16} />
              <span>12% from last month</span>
            </div>
          </div>
        </div>

        {/* Revenue Card */}
        <div className="bg-[#2F394B] rounded-lg p-6 shadow-lg border border-[#3D4D65] relative overflow-hidden">
          <div className="absolute top-0 right-0 mt-4 mr-4 bg-[#45B8F2] bg-opacity-20 p-3 rounded-full">
            <CreditCard size={24} className="text-[#45B8F2]" />
          </div>
          <h2 className="text-gray-400 mb-1">Total Revenue</h2>
          <div className="flex items-end">
            <span className="text-4xl font-bold mr-2">{formatCurrency(dashboardStats.revenue)}</span>
            <div className="flex items-center text-green-400 text-sm pb-1">
              <ChevronUp size={16} />
              <span>8% from last month</span>
            </div>
          </div>
        </div>

        {/* Active Users Card */}
        <div className="bg-[#2F394B] rounded-lg p-6 shadow-lg border border-[#3D4D65] relative overflow-hidden">
          <div className="absolute top-0 right-0 mt-4 mr-4 bg-[#45B8F2] bg-opacity-20 p-3 rounded-full">
            <Users size={24} className="text-[#45B8F2]" />
          </div>
          <h2 className="text-gray-400 mb-1">Active Bookings</h2>
          <div className="flex items-end">
            <span className="text-4xl font-bold mr-2">{dashboardStats.activeUsers}</span>
            <div className="flex items-center text-green-400 text-sm pb-1">
              <ChevronUp size={16} />
              <span>5% from last month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Graph */}
      <div className="bg-[#2F394B] rounded-lg p-6 shadow-lg border border-[#3D4D65]">
        <div className="flex items-center mb-4">
          <TrendingUp size={24} className="text-[#45B8F2] mr-2" />
          <h2 className="text-xl font-bold">Monthly Sales</h2>
        </div>
        
        {/* Custom graph visualization using divs and Lucide icons */}
        <div className="mt-8 relative h-64">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400 pr-2">
            <div>${Math.round(maxSales)}</div>
            <div>${Math.round(maxSales * 0.75)}</div>
            <div>${Math.round(maxSales * 0.5)}</div>
            <div>${Math.round(maxSales * 0.25)}</div>
            <div>$0</div>
          </div>
          
          {/* Graph grid lines */}
          <div className="ml-8 h-full flex flex-col justify-between">
            {[0, 1, 2, 3, 4].map((_, index) => (
              <div key={index} className="border-t border-[#3D4D65] w-full h-0"></div>
            ))}
          </div>
          
          {/* Bars */}
          <div className="absolute inset-0 ml-8 flex items-end pt-4">
            <div className="w-full flex justify-between items-end h-full">
              {salesData.map((data, index) => {
                const height = (data.sales / maxSales) * 100;
                return (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div 
                      className="w-4/5 bg-[#45B8F2] bg-opacity-20 rounded-t-sm relative group"
                      style={{ height: `${height}%` }}
                    >
                      <div 
                        className="absolute bottom-0 left-0 right-0 bg-[#45B8F2]" 
                        style={{ height: '3px' }}
                      ></div>
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[#1E293B] text-white text-xs p-2 rounded shadow-lg pointer-events-none">
                        {data.name}: ${data.sales}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 mt-2">{data.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardBody;