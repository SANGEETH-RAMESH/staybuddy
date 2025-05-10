import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { ObjectId } from 'bson';
import Swal from 'sweetalert2';
import { Trash2, Lock, Unlock, Check, X, Loader, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Host {
  _id: ObjectId;
  name: string;
  email: string;
  propertyCount: number;
  isBlock: boolean;
  approvalRequest: string;
  isApproved: boolean;
  count?: string;
  photo:string
}

interface HostDetails {
  _id: ObjectId;
  name: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  createdAt?: string;
  properties?: number;
  totalBookings?: number;
  revenue?: number;
}

const AdminHostManageBody = () => {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHost, setSelectedHost] = useState<HostDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const handleApprove = async (hostId: ObjectId) => {
    try {
      const response = await axios.patch('http://localhost:4000/admin/approvehost', { hostId });
      if (response.data.success) {
        setHosts(prevHosts =>
          prevHosts.map(host =>
            host._id === hostId ? { ...host, approvalRequest: "3", isApproved: true } : host
          )
        );
        toast.success("Host approved");
      }
    } catch (error) {
      toast.error("Failed to approve host");
      console.log(error)
    }
  };

  const handleReject = async (hostId: ObjectId) => {
    try {
      const response = await axios.patch('http://localhost:4000/admin/rejecthost', { hostId });
      if (response.data.success) {
        setHosts(prevHosts =>
          prevHosts.map(host =>
            host._id === hostId ? { ...host, approvalRequest: "1", isApproved: false } : host
          )
        );
        toast.success("Host rejected");
      }
    } catch (error) {
      toast.error("Failed to reject host");
      console.log(error)
    }
  };

  const handleBlockHost = async (hostId: ObjectId) => {
    try {
      const response = await axios.patch('http://localhost:4000/admin/hostblock', { hostId });
      if (response.data.success) {
        localStorage.removeItem('hostRefreshToken');
        localStorage.removeItem('hostAccessToken')
        setHosts(prevHosts =>
          prevHosts.map(host =>
            host._id === hostId ? { ...host, isBlock: true } : host
          )
        );
        toast.success("Host blocked");
      }
    } catch (error) {
      toast.error("Failed to block host");
      console.log(error)
    }
  };

  const handleUnblockHost = async (hostId: ObjectId) => {
    try {
      console.log(hostId)
      const response = await axios.patch('http://localhost:4000/admin/hostunblock', { hostId });
      if (response.data.success) {
        setHosts(prevHosts =>
          prevHosts.map(host =>
            host._id === hostId ? { ...host, isBlock: false } : host
          )
        );
        toast.success("Host unblocked");
      }
    } catch (error) {
      toast.error("Failed to unblock host");
      console.log(error)
    }
  };

  const handleDeleteHost = async (hostId: ObjectId): Promise<void> => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to undo this action!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete<{ success: boolean }>(
            `http://localhost:4000/admin/deletehost/${hostId}`
          );
          if (response.data.success) {
            setHosts((prevHosts) => prevHosts.filter((host) => host._id !== hostId));
            Swal.fire('Deleted!', 'The host has been deleted.', 'success');
          }
        } catch (error) {
          Swal.fire('Error!', 'Failed to delete the host.', 'error');
          console.log(error)
        }
      }
    });
  };

  const navigate = useNavigate()

  const handleViewDetails = async (hostId: ObjectId) => {
    try {
      setDetailsLoading(true);
      // Replace with your actual endpoint
      navigate(`/admin/hostdetailed/${hostId}`)
      // // const response = await axios.get(`http://localhost:4000/admin/host/${hostId}`);
      // // if (response.data.success) {
      // //   setSelectedHost(response.data.host);
      // //   Swal.fire({
      // //     title: 'Host Details',
      // //     html: `
      // //       <div class="text-left">
      // //         <p><strong>Name:</strong> ${response.data.host.name}</p>
      // //         <p><strong>Email:</strong> ${response.data.host.email}</p>
      // //         <p><strong>Phone:</strong> ${response.data.host.phoneNumber || 'N/A'}</p>
      // //         <p><strong>Address:</strong> ${response.data.host.address || 'N/A'}</p>
      // //         <p><strong>Joined:</strong> ${new Date(response.data.host.createdAt).toLocaleDateString() || 'N/A'}</p>
      // //         <p><strong>Properties:</strong> ${response.data.host.properties || '0'}</p>
      // //         <p><strong>Total Bookings:</strong> ${response.data.host.totalBookings || '0'}</p>
      // //         <p><strong>Revenue:</strong> $${response.data.host.revenue?.toFixed(2) || '0.00'}</p>
      // //       </div>
      // //     `,
      // //     confirmButtonText: 'Close',
      // //     confirmButtonColor: '#3085d6',
      // //     width: '500px'
      // //   });
      // }
    } catch (error) {
      toast.error("Failed to fetch host details");
      console.log(error);
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    const fetchHosts = async () => {
      try {
        const response = await axios.get('http://localhost:4000/admin/getHosts');
        console.log(response.data.message, 'message');

        if (response.data.success) {
          const { hosts, hostIdCounts } = response.data.message;

          // Map over hosts and add the count field
          const updatedHosts = hosts.map((host: Host) => {
            // Convert ObjectId to string before accessing hostIdCounts
            const hostId = host._id.toString();
            return {
              ...host,
              count: hostIdCounts[hostId] || 0, // Default to 0 if no count is found
            };
          });

          setHosts(updatedHosts);
          console.log(updatedHosts, 'updatedHosts');
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch hosts');
        console.log(err);
        setLoading(false);
      }
    };

    fetchHosts();
  }, []);

  if (error) return <div className="p-8 text-white">{error}</div>;

  const renderHostRow = (host: Host, index: number) => (
    <div key={host._id.toString()} className="grid grid-cols-[1fr,2fr,2fr,1.5fr,1.5fr,2fr,2fr] text-gray-200 border-b border-gray-700 p-4 items-center hover:bg-gray-800/50 transition-colors">
      <div className="text-center font-mono text-sm">{index + 1}</div>
      <div className="text-left font-medium">{host.name}</div>
      <div className="text-left truncate text-gray-400">{host.email}</div>
      <div className="text-center">
        <span className="bg-gray-800 px-3 py-1 rounded-full text-sm">
          {host.count || 0}
        </span>
      </div>
      <div className="text-center">
        <span className={`px-3 py-1 rounded-full text-sm ${host.isBlock
          ? 'bg-red-900/50 text-red-200'
          : 'bg-green-900/50 text-green-200'
          }`}>
          {host.isBlock ? "Blocked" : "Active"}
        </span>
      </div>
      <div className="flex justify-center space-x-2">
        {host.photo && (
          <>
            {host.approvalRequest === '1' && (
              <div className="text-red-500 font-medium">Rejected</div>
            )}
            {host.approvalRequest === '2' && (
              <div className="text-yellow-500 font-medium">Pending</div>
            )}
            {host.approvalRequest === '3' && (
              <div className="text-green-500 font-medium">Approved</div>
            )}
          </>
        )}

      </div>
      <div className="flex justify-end space-x-3">
        <button
          className="p-2 rounded-lg hover:bg-blue-900/50 transition-colors group"
          onClick={() => handleViewDetails(host._id)}
          aria-label="View host details"
          disabled={detailsLoading}
        >
          <Info className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
        </button>
        <button
          className="p-2 rounded-lg hover:bg-gray-700 transition-colors group"
          onClick={() => (host.isBlock ? handleUnblockHost(host._id) : handleBlockHost(host._id))}
          aria-label={host.isBlock ? "Unblock host" : "Block host"}
        >
          {host.isBlock ? (
            <Unlock className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
          ) : (
            <Lock className="w-5 h-5 text-yellow-400 group-hover:text-yellow-300" />
          )}
        </button>
        <button
          className="p-2 rounded-lg hover:bg-red-900/50 transition-colors group"
          onClick={() => handleDeleteHost(host._id)}
          aria-label="Delete host"
        >
          <Trash2 className="w-5 h-5 text-red-400 group-hover:text-red-300" />
        </button>
      </div>
    </div>
  );

  const renderMobileHostCard = (host: Host, index: number) => (
    <div key={host._id.toString()} className="bg-[#212936] rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-white font-medium">#{index + 1}</span>
        <div className="flex space-x-2">
          {host.approvalRequest == "2" && (
            <>
              <button
                onClick={() => handleApprove(host._id)}
                className="bg-green-600 p-2 rounded-full hover:bg-green-700 transition-colors"
              >
                <Check className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={() => handleReject(host._id)}
                className="bg-red-600 p-2 rounded-full hover:bg-red-700 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </>
          )}
          <button
            className="bg-blue-800 p-2 rounded-full hover:bg-blue-700 transition-colors"
            onClick={() => handleViewDetails(host._id)}
            disabled={detailsLoading}
          >
            <Info className="w-5 h-5 text-white" />
          </button>
          <button
            className="bg-[#2D394E] p-2 rounded-full hover:bg-[#45B8F2]/10 transition-colors"
            onClick={() => host.isBlock ? handleUnblockHost(host._id) : handleBlockHost(host._id)}
          >
            {host.isBlock ? (
              <Unlock className="w-5 h-5 text-blue-400" />
            ) : (
              <Lock className="w-5 h-5 text-yellow-400" />
            )}
          </button>
          <button
            className="bg-red-600 p-2 rounded-full hover:bg-red-700 transition-colors"
            onClick={() => handleDeleteHost(host._id)}
          >
            <Trash2 className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <div className="space-y-2 text-white">
        <div className="flex justify-between">
          <span className="text-gray-400">Name:</span>
          <span>{host.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Email:</span>
          <span className="truncate max-w-[200px]">{host.email}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Properties:</span>
          <span>{host.count || 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Status:</span>
          <span className={host.isBlock ? "text-red-400" : "text-green-400"}>
            {host.isBlock ? "Blocked" : "Active"}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="pt-6 pb-8 px-4 md:px-6 lg:px-8">
      <h1 className="text-2xl md:text-3xl text-white mb-6">Hosts</h1>

      {/* Desktop View */}
      {
        loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="w-12 h-12 text-[#45B8F2] animate-spin" />
          </div>
        ) : (
          <div className="hidden sm:block overflow-x-auto">
            <div className="bg-gray-900 rounded-lg shadow-lg min-w-[800px] w-full">
              <div className="grid grid-cols-[1fr,2fr,2fr,1.5fr,1.5fr,2fr,2fr] text-gray-200 border-b border-gray-700 p-4 font-medium bg-gray-800/50">
                <div className="text-center">Id</div>
                <div className="text-left">Name</div>
                <div className="text-left">Email</div>
                <div className="text-center">Properties</div>
                <div className="text-center">Status</div>
                <div className="text-center">Approval</div>
                <div className="text-right">Action</div>
              </div>
              {hosts.map((host, index) => renderHostRow(host, index))}
            </div>
          </div>
        )
      }

      {/* Mobile View */}
      <div className="sm:hidden space-y-4">
        {hosts.map((host, index) => renderMobileHostCard(host, index))}
      </div>
    </div>
  );
};

export default AdminHostManageBody;