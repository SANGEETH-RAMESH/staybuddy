import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { ObjectId } from 'bson';
import Swal from 'sweetalert2';
import { Trash2, Lock, Unlock, Check, X, Loader, Info, Search, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import adminApiClient from '../../../services/adminApiClient';
import { LOCALHOST_URL } from '../../../constants/constants';
import { PaginationInfo} from '../../../interface/PaginationInfo'
import { Host } from '../../../interface/Host';

// interface Host {
//   _id: ObjectId;
//   name: string;
//   email: string;
//   propertyCount: number;
//   isBlock: boolean;
//   approvalRequest: string;
//   isApproved: boolean;
//   count?: string;
//   photo: string
// }

// interface PaginationInfo {
//   currentPage: number;
//   totalPages: number;
//   totalHosts: number;
//   hasNext: boolean;
//   hasPrev: boolean;
// }

const AdminHostManageBody = () => {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalHosts: 0,
    hasNext: false,
    hasPrev: false
  });
  const itemsPerPage = 4;

  const navigate = useNavigate();

  const handleApprove = async (hostId: ObjectId) => {
    try {
      const response = await adminApiClient.patch('http://localhost:4000/admin/approvehost', { hostId });
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(async () => {
      if (newSearchTerm.trim() === '') {
        fetchHosts(1, itemsPerPage); // Reset to first page when clearing search
        return;
      }

      try {
        const response = await adminApiClient.get(
          `${LOCALHOST_URL}/admin/searchhost?name=${newSearchTerm}`
        );
        console.log("Response", response.data.message);
        const searchResults = response.data.message;
        setHosts(searchResults);
        // Reset pagination info for search results
        setPaginationInfo({
          currentPage: 1,
          totalPages: 1,
          totalHosts: searchResults.length,
          hasNext: false,
          hasPrev: false
        });
        setCurrentPage(1);
      } catch (error) {
        console.log("Search error", error);
      }
    }, 500);
  }

  const handleReject = async (hostId: ObjectId) => {
    try {
      const response = await adminApiClient.patch('http://localhost:4000/admin/rejecthost', { hostId });
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
      const response = await adminApiClient.patch('http://localhost:4000/admin/hostblock', { hostId });
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
      const response = await adminApiClient.patch('http://localhost:4000/admin/hostunblock', { hostId });
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
          const response = await adminApiClient.delete<{ success: boolean }>(
            `http://localhost:4000/admin/deletehost/${hostId}`
          );
          if (response.data.success) {
            setHosts((prevHosts) => prevHosts.filter((host) => host._id !== hostId));
            // Refresh current page after deletion
            fetchHosts(currentPage, itemsPerPage);
            Swal.fire('Deleted!', 'The host has been deleted.', 'success');
          }
        } catch (error) {
          Swal.fire('Error!', 'Failed to delete the host.', 'error');
          console.log(error)
        }
      }
    });
  };

  const handleViewDetails = async (hostId: ObjectId) => {
    try {
      setDetailsLoading(true);
      navigate(`/admin/hostdetailed/${hostId}`)
    } catch (error) {
      toast.error("Failed to fetch host details");
      console.log(error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const fetchHosts = async (page: number, limit: number) => {
    try {
      setLoading(true);
      const skip = (page - 1) * limit;
      const response = await adminApiClient.get(
        `http://localhost:4000/admin/getHosts?skip=${skip}&limit=${limit}`
      );
      console.log(response.data.message, 'message');

      if (response.data.success) {
        const { hosts, hostIdCounts, totalCount } = response.data.message;

        const updatedHosts = hosts.map((host: Host) => {
          const hostId = host._id.toString();
          return {
            ...host,
            count: hostIdCounts[hostId] || 0,
          };
        });

        setHosts(updatedHosts);

        // Update pagination info
        setPaginationInfo({
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalHosts: totalCount,
          hasNext: page < Math.ceil(totalCount / limit),
          hasPrev: page > 1
        });

        console.log(updatedHosts, 'updatedHosts');
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch hosts');
      console.log(err);
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchHosts(newPage, itemsPerPage);
  };

  useEffect(() => {
    fetchHosts(currentPage, itemsPerPage);
  }, []);

  if (error) return <div className="p-8 text-white">{error}</div>;

  // Empty State Component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-gray-800 rounded-full p-8 mb-6">
        <Users className="w-16 h-16 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">No Hosts Found</h3>
      <p className="text-gray-400 text-center max-w-md">
        {searchTerm
          ? `No hosts match your search for "${searchTerm}". Try adjusting your search terms.`
          : "There are currently no hosts in the system. New hosts will appear here once they register."
        }
      </p>
      {searchTerm && (
        <button
          onClick={() => {
            setSearchTerm('');
            fetchHosts(1, itemsPerPage);
          }}
          className="mt-4 px-4 py-2 bg-[#45B8F2] text-white rounded-lg hover:bg-[#45B8F2]/80 transition-colors"
        >
          Clear Search
        </button>
      )}
    </div>
  );

  // Pagination Component
  const Pagination = () => {
    if (paginationInfo.totalPages <= 1) return null;

    const getPageNumbers = () => {
  const pages: (number | string)[] = [];
  const current = paginationInfo.currentPage;
  const total = paginationInfo.totalPages;

  if (total <= 5) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    if (current <= 3) {
      pages.push(1, 2, 3, 4, '...', total);
    } else if (current >= total - 2) {
      pages.push(1, '...', total - 3, total - 2, total - 1, total);
    } else {
      pages.push(1, '...', current - 1, current, current + 1, '...', total);
    }
  }

  return pages;
};

    return (
      <div className="flex items-center justify-between mt-6 px-4">
        <div className="text-sm text-gray-400">
          Showing {((paginationInfo.currentPage - 1) * itemsPerPage) + 1} - {Math.min(paginationInfo.currentPage * itemsPerPage, paginationInfo.totalHosts??0)} of {paginationInfo.totalHosts} hosts
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(paginationInfo.currentPage - 1)}
            disabled={!paginationInfo.hasPrev}
            className="p-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' ? handlePageChange(page) : undefined}
              disabled={page === '...'}
              className={`px-3 py-2 rounded-lg transition-colors ${page === paginationInfo.currentPage
                  ? 'bg-[#45B8F2] text-white'
                  : page === '...'
                    ? 'text-gray-400 cursor-default'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(paginationInfo.currentPage + 1)}
            disabled={!paginationInfo.hasNext}
            className="p-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  const renderHostRow = (host: Host, index: number) => (
    <div key={host._id.toString()} className="grid grid-cols-[1fr,2fr,2fr,1.5fr,1.5fr,2fr,2fr] text-gray-200 border-b border-gray-700 p-4 items-center hover:bg-gray-800/50 transition-colors">
      <div className="text-center font-mono text-sm">{((currentPage - 1) * itemsPerPage) + index + 1}</div>
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
        {!host.photo &&  host.approvalRequest == '1'  && (
          <div className="text-gray-400 font-medium">Not Approved</div>
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
        <span className="text-white font-medium">#{((currentPage - 1) * itemsPerPage) + index + 1}</span>
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
      {/* Header and Search Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl md:text-3xl text-white">Hosts</h1>
        <div className="relative mt-4 sm:mt-0">
          <input
            type="text"
            placeholder="Search hosts..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="bg-[#1A202C] text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:border-[#45B8F2] focus:outline-none w-full sm:w-64"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
        </div>
      </div>

      {/* Loader */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="w-12 h-12 text-[#45B8F2] animate-spin" />
        </div>
      ) : hosts.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Desktop View */}
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

          {/* Mobile View */}
          <div className="sm:hidden space-y-4">
            {hosts.map((host, index) => renderMobileHostCard(host, index))}
          </div>

          {/* Pagination */}
          <Pagination />
        </>
      )}
    </div>
  );
};

export default AdminHostManageBody;