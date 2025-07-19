import  { useState, useEffect } from 'react';
import { Home, CreditCard, Users, TrendingUp, Building, MapPin, Phone, Mail } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
// import createApiClient from '../../../services/apiClient';
// const AdminApiClient = createApiClient('admin');
// const apiUrl = import.meta.env.VITE_LOCALHOST_URL;
import { Order } from '../../../interface/Order';
import { User } from '../../../interface/User';
import { getSales, getUser } from '../../../services/adminServices';
import { HostelStat } from '../../../interface/HostelStat';
import { UserStat } from '../../../interface/UserStat';

const AdminDashboardBody = () => {
  // Sample data - replace with actual API calls
  const [dashboardStats, setDashboardStats] = useState({
    roomsBooked: 124,
    revenue: 45680,
    activeUsers: 89
  });

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const [salesData, setSalesData] = useState(
    monthNames.map(name => ({ name, sales: 0 }))
  );

  const [topHostels, setTopHostels] = useState<HostelStat[]>([]);
  const [topUsers, setTopUsers] = useState<UserStat[]>([]);

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
      const response = await getSales();
      const fetchUsers = await getUser();

      console.log(fetchUsers.data.message)
      const bookings = response.data.message;
      console.log(response.data.message, 'response')
      const users = fetchUsers.data.message.users;
      const monthlySales = Array(12).fill(0);
      let totalRevenue = 0;

      const hostelStats: { [key: string]: any } = {};
      const userBookingStats: { [key: string]: any } = {};

      bookings.forEach((booking: Order) => {
        if(!booking.createdAt) return;
        const date = new Date(booking.createdAt);
        const monthIndex = date.getMonth();
        const rent = Number(booking.totalRentAmount) || 0;
        monthlySales[monthIndex] += rent;
        totalRevenue += rent;

        if (booking.hostel_id) {
          hostelSet.add(booking.hostel_id);
          const hostelIdStr = booking.hostel_id.toString();

          if (!hostelStats[hostelIdStr]) {
            hostelStats[hostelIdStr] = {
              hostel_id: booking.hostel_id,
              name: booking.name,
              location: booking.location,
              host_mobile: booking.host_mobile,
              photos: booking.photos,
              totalBookings: 0,
              totalRevenue: 0,
              policies: booking.policies,
              nearbyaccess: booking.nearbyaccess
            };
          }
          hostelStats[hostelIdStr].totalBookings += 1;
          hostelStats[hostelIdStr].totalRevenue += rent;
        }

        if (booking.userId) {
          const userId = booking.userId.toString()
          if (!userBookingStats[userId]) {
            userBookingStats[userId] = {
              userId: booking.userId,
              customerName: booking.customerName,
              customerEmail: booking.customerEmail,
              customerPhone: booking.customerPhone,
              totalBookings: 0,
              totalSpent: 0
            };
          }
          userBookingStats[userId].totalBookings += 1;
          userBookingStats[userId].totalSpent += rent;
        }
      });

      const sortedHostels = Object.values(hostelStats)
        .sort((a, b) => b.totalBookings - a.totalBookings)
        .slice(0, 2);

      const sortedUsers = Object.values(userBookingStats)
        .sort((a, b) => b.totalBookings - a.totalBookings)
        .slice(0, 2);

      const totalHostelBookings = hostelSet.size;
      const formattedSales = monthlySales.map((sales, index) => ({
        name: monthNames[index],
        sales
      }));
      console.log(users, 'heyy')
      const userss = users.filter((user: User) => !user.isBlock && !user.isAdmin).length

      setSalesData(formattedSales);
      setTopHostels(sortedHostels);
      setTopUsers(sortedUsers);
      setDashboardStats((prevStats) => ({
        ...prevStats,
        revenue: totalRevenue,
        roomsBooked: totalHostelBookings,
        activeUsers: userss
      }))
    }
    fetchSales();
  }, [])

  return (
    <div className="p-4 md:p-6 text-white mt-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
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
          <h2 className="text-gray-400 mb-1">Active Users</h2>
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

      {/* Top Hostels Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-[#2F394B] rounded-lg p-6 shadow-lg border border-[#3D4D65]">
          <div className="flex items-center mb-6">
            <Building size={24} className="text-[#45B8F2] mr-2" />
            <h2 className="text-xl font-bold">Top Performing Hostels</h2>
          </div>

          <div className="space-y-4">
            {topHostels.map((hostel, index) => (
              <div key={index} className="bg-[#1E293B] rounded-lg p-4 border border-[#3D4D65]">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className="relative mr-3">
                      {hostel.photos && hostel.photos.length > 0 ? (
                        <img
                          src={hostel.photos[0]}
                          alt={hostel.name}
                          className="w-12 h-12 rounded-lg object-cover border-2 border-[#45B8F2]"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-[#45B8F2] bg-opacity-20 rounded-lg flex items-center justify-center">
                          <Building size={20} className="text-[#45B8F2]" />
                        </div>
                      )}
                      {/* <div className="absolute -top-1 -right-1 bg-[#45B8F2] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {index + 1}
                      </div> */}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{hostel.name}</h3>
                      <div className="flex items-center text-gray-400 text-sm mt-1">
                        <MapPin size={14} className="mr-1" />
                        {hostel.location}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="text-center bg-[#2F394B] rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-400">{hostel.totalBookings}</div>
                    <div className="text-xs text-gray-400">Total Bookings</div>
                  </div>
                  <div className="text-center bg-[#2F394B] rounded-lg p-3">
                    <div className="text-lg font-bold text-yellow-400">{formatCurrency(hostel.totalRevenue)}</div>
                    <div className="text-xs text-gray-400">Total Revenue</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center">
                    <Phone size={14} className="mr-1" />
                    {hostel.host_mobile}
                  </div>
                  <div className="bg-[#45B8F2] bg-opacity-20 px-2 py-1 rounded text-[#45B8F2] text-xs">
                    {hostel.policies}
                  </div>
                </div>
              </div>
            ))}
          </div>
      </div>

      {/* Top Users Section */}
      <div className="bg-[#2F394B] rounded-lg p-6 shadow-lg border border-[#3D4D65]">
        <div className="flex items-center mb-6">
          <Users size={24} className="text-[#45B8F2] mr-2" />
          <h2 className="text-xl font-bold">Top Booking Users</h2>
        </div>

        <div className="space-y-4">
          {topUsers.map((user, index) => (
            <div key={index} className="bg-[#1E293B] rounded-lg p-4 border border-[#3D4D65]">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className="bg-[#45B8F2] bg-opacity-20 p-2 rounded-full mr-3">
                    <Users size={16} className="text-[#45B8F2]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{user.customerName}</h3>
                    <div className="flex items-center text-gray-400 text-sm mt-1">
                      <Mail size={14} className="mr-1" />
                      {user.customerEmail}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#45B8F2]">#{index + 1}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="text-center bg-[#2F394B] rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-400">{user.totalBookings}</div>
                  <div className="text-xs text-gray-400">Total Bookings</div>
                </div>
                <div className="text-center bg-[#2F394B] rounded-lg p-3">
                  <div className="text-lg font-bold text-yellow-400">{formatCurrency(user.totalSpent)}</div>
                  <div className="text-xs text-gray-400">Total Spent</div>
                </div>
              </div>

              <div className="flex items-center text-sm text-gray-400">
                <Phone size={14} className="mr-1" />
                {user.customerPhone}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </div >
  );
};

export default AdminDashboardBody;