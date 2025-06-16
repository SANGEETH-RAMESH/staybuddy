import React, { useState, useEffect } from 'react';
import { Home, CreditCard, Users, TrendingUp, ChevronUp } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import adminApiClient from '../../../services/adminApiClient';
import { LOCALHOST_URL } from '../../../constants/constants';
import { Order } from '../../../interface/Order';
import { User } from '../../../interface/User';

const AdminDashboardBody = () => {
  // Sample data - replace with actual API calls
  const [dashboardStats, setDashboardStats] = useState({
    roomsBooked: 124,
    revenue: 45680,
    activeUsers: 89
  });

  // // Sample sales data for the graph - replace with actual API data
  // const [salesData, setSalesData] = useState([
  //   { name: 'Jan', sales: 4000 },
  //   { name: 'Feb', sales: 3000 },
  //   { name: 'Mar', sales: 5000 },
  //   { name: 'Apr', sales: 2780 },
  //   { name: 'May', sales: 1890 },
  //   { name: 'Jun', sales: 2390 },
  //   { name: 'Jul', sales: 3490 },
  //   { name: 'Aug', sales: 4000 },
  //   { name: 'Sep', sales: 4500 },
  //   { name: 'Oct', sales: 3800 },
  //   { name: 'Nov', sales: 4300 },
  //   { name: 'Dec', sales: 5200 }
  // ]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const [salesData, setSalesData] = useState(
    monthNames.map(name => ({ name, sales: 0 }))
  );


  const hostelSet = new Set();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  useEffect(() => {
    const fetchSales = async () => {
      const response = await adminApiClient.get(`${LOCALHOST_URL}/admin/sales`)
      const fetchUsers = await adminApiClient.get(`${LOCALHOST_URL}/admin/getUser`)

      console.log(fetchUsers.data.message)
      const bookings = response.data.message;
      const users = fetchUsers.data.message.users;
      const monthlySales = Array(12).fill(0);
      let totalRevenue = 0;
      bookings.forEach((booking: Order) => {
        const date = new Date(booking.createdAt);
        const monthIndex = date.getMonth();
        const rent = Number(booking.totalRentAmount) || 0;
        monthlySales[monthIndex] += rent;
        totalRevenue += rent;

        if (booking.hostel_id?.id) {
          hostelSet.add(booking.hostel_id.id);
        }
      });


      const totalHostelBookings = hostelSet.size;
      const formattedSales = monthlySales.map((sales, index) => ({
        name: monthNames[index],
        sales
      }));
      const userss = users.filter((user:User)=>!user.isBlock && !user.isAdmin).length
      setSalesData(formattedSales);
      setDashboardStats((prevStats) => ({
        ...prevStats,
        revenue: totalRevenue,
        roomsBooked: totalHostelBookings,
        activeUsers:userss
      }))
    }
    fetchSales();
  }, [])

  return (
    <div className="p-4 md:p-6 text-white mt-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        {/* <p className="text-gray-300 mt-2">Welcome to your hostel management dashboard</p> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#2F394B] rounded-lg p-6 shadow-lg border border-[#3D4D65] relative overflow-hidden">
          <div className="absolute top-0 right-0 mt-4 mr-4 bg-[#45B8F2] bg-opacity-20 p-3 rounded-full">
            <Home size={24} className="text-[#45B8F2]" />
          </div>
          <h2 className="text-gray-400 mb-1">Rooms Booked</h2>
          <div className="flex items-end">
            <span className="text-4xl font-bold mr-2">{dashboardStats.roomsBooked}</span>
            
          </div>
        </div>

        <div className="bg-[#2F394B] rounded-lg p-6 shadow-lg border border-[#3D4D65] relative overflow-hidden">
          <div className="absolute top-0 right-0 mt-4 mr-4 bg-[#45B8F2] bg-opacity-20 p-3 rounded-full">
            <CreditCard size={24} className="text-[#45B8F2]" />
          </div>
          <h2 className="text-gray-400 mb-1">Total Revenue</h2>
          <div className="flex items-end">
            <span className="text-4xl font-bold mr-2">{formatCurrency(dashboardStats.revenue)}</span>
            <div className="flex items-center text-green-400 text-sm pb-1">
            </div>
          </div>
        </div>

        <div className="bg-[#2F394B] rounded-lg p-6 shadow-lg border border-[#3D4D65] relative overflow-hidden">
          <div className="absolute top-0 right-0 mt-4 mr-4 bg-[#45B8F2] bg-opacity-20 p-3 rounded-full">
            <Users size={24} className="text-[#45B8F2]" />
          </div>
          <h2 className="text-gray-400 mb-1">Active Bookings</h2>
          <div className="flex items-end">
            <span className="text-4xl font-bold mr-2">{dashboardStats.activeUsers}</span>
            
          </div>
        </div>
      </div>

      <div className="bg-[#2F394B] rounded-lg p-6 shadow-lg border border-[#3D4D65] mt-8">
        <div className="flex items-center mb-4">
          <TrendingUp size={24} className="text-[#45B8F2] mr-2" />
          <h2 className="text-xl font-bold">Monthly Sales</h2>
        </div>

        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesData}>
              <CartesianGrid stroke="#3D4D65" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#CBD5E1" />
              <YAxis stroke="#CBD5E1" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E293B',
                  borderColor: '#45B8F2',
                  color: 'white',
                }}
              />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#45B8F2"
                strokeWidth={2}
                dot={{ r: 4, fill: '#45B8F2' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboardBody;