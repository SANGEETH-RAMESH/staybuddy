import { useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { ObjectId } from 'bson';
import { Unlock, Lock, Trash2, RefreshCw, UserX, Users, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { User } from '../../../interface/User';
import { PaginationInfo } from '../../../interface/PaginationInfo';
import { blockUser, deleteUser, fetchUser, searchUser, unblockUser } from '../../../services/adminServices';


const AdminUserManageBody = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  const [error, setError] = useState<string | null>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [filterStatus] = useState<'all' | 'active' | 'blocked'>('all');

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(4);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    hasNext: false,
    hasPrev: false
  });

  // Handle block user
  const handleBlockUser = async (userId: ObjectId | string) => {
    try {
      const response = await blockUser(userId);
      if (response.data.message === 'User blocked') {
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('accessToken');
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user._id === userId ? { ...user, isBlock: true } : user
          )
        );
        updateFilteredUsers();
        toast.success('User blocked successfully');
      }
    } catch (error) {
      toast.error('Failed to block user');
      console.error(error);
    }
  };

  // Handle unblock user
  const handleUnblockUser = async (userId: ObjectId | string) => {
    try {
      const response = await unblockUser(userId);
      if (response.data.message.message === 'unblocked') {
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user._id === userId ? { ...user, isBlock: false } : user
          )
        );
        updateFilteredUsers();
        toast.success('User unblocked successfully');
      }
    } catch (error) {
      toast.error('Failed to unblock user');
      console.error(error);
    }
  };

  // Handle delete user
  const handleDeleteUser = async (userId: ObjectId | string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        const response = await deleteUser(userId);

        if (response.data.success) {
          // Refresh the current page after deletion
          console.log(itemsPerPage,'Items')
          await fetchUsers(currentPage, itemsPerPage);
          Swal.fire('Deleted!', 'The user has been deleted.', 'success');
        } else {
          Swal.fire('Failed!', 'There was an issue deleting the user.', 'error');
        }
      } catch (error) {
        console.error(error);
        Swal.fire('Failed!', 'There was an error with the server.', 'error');
      }
    }
  };

  // Fetch users function with pagination - Updated default limit to 4
  const fetchUsers = async (page: number = 1, limit: number = 4) => {
    setIsRefreshing(true);
    try {
      const response = await fetchUser(page,limit);
      if (response.data.success) {
        const { totalCount, users: fetchedUsers } = response.data.message;

        const totalPages = Math.ceil(totalCount / limit);
        setUsers(fetchedUsers);

        setPaginationInfo({
          currentPage: page,
          totalPages,
          totalUsers: totalCount,
          hasNext: page < totalPages,
          hasPrev: page > 1
        });

        setCurrentPage(page);
        updateFilteredUsers(fetchedUsers);
      } else {
        setError('Failed to fetch users');
      }
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const updateFilteredUsers = (userList = users) => {
    let filtered = userList;

    if (filterStatus === 'active') {
      filtered = filtered.filter(user => !user.isBlock);
    } else if (filterStatus === 'blocked') {
      filtered = filtered.filter(user => user.isBlock);
    }

    setFilteredUsers(filtered);
  };

  useEffect(() => {
    updateFilteredUsers();
  }, [searchTerm, filterStatus, users]);

  // Fetch users on mount
  useEffect(() => {
    fetchUsers(currentPage, itemsPerPage);
  }, []);

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= paginationInfo.totalPages) {
      fetchUsers(page, itemsPerPage);
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
        fetchUsers(1, itemsPerPage); 
        return;
      }

      try {
        const response = await searchUser(newSearchTerm,itemsPerPage)
        console.log("Response", response.data.message);
        const searchResults = response.data.message;
        setUsers(searchResults);
        // Reset pagination info for search results
        setPaginationInfo({
          currentPage: 1,
          totalPages: 1,
          totalUsers: searchResults.length,
          hasNext: false,
          hasPrev: false
        });
        setCurrentPage(1);
      } catch (error) {
        console.log("Search error", error);
      }
    }, 500);
  };

  const getPageNumbers = () => {
  const pages: (number | string)[] = [];
  const { currentPage, totalPages } = paginationInfo;

  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);

    if (currentPage > 3) {
      pages.push('...'); 
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('...'); 
    }

    pages.push(totalPages);
  }

  return pages;
};

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] mt-[11vh] lg:ml-64 pt-24">
        <div className="bg-[#212936] p-6 rounded-lg shadow-lg flex flex-col items-center">
          <UserX className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-white text-lg mb-4">{error}</p>
          <button
            className="bg-[#45B8F2] py-2 px-4 rounded-md hover:bg-[#3ca1d8] transition-colors"
            onClick={() => fetchUsers(currentPage, itemsPerPage)}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 pt-24 mt-[11vh] lg:ml-64">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="flex items-center mb-4 sm:mb-0">
          <Users className="text-[#45B8F2] mr-2 h-6 w-6" />
          <h1 className="text-2xl md:text-3xl text-white font-semibold">User Management</h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="bg-[#1A202C] text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:border-[#45B8F2] focus:outline-none w-full sm:w-64"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
          </div>

          
        </div>
      </div>

      {/* Pagination Info */}
      {!isRefreshing && filteredUsers.length > 0 && (
        <div className="mb-4 text-white text-sm">
          Showing {((paginationInfo.currentPage - 1) * itemsPerPage) + 1} to{' '}
          {Math.min(paginationInfo.currentPage * itemsPerPage, paginationInfo.totalUsers ?? 0 )} of{' '}
          {paginationInfo.totalUsers} users
        </div>
      )}

      {/* Loading State */}
      {isRefreshing && (
        <div className="flex justify-center items-center min-h-[40vh]">
          <div className="bg-[#212936] p-6 rounded-lg shadow-lg flex flex-col items-center">
            <RefreshCw className="w-12 h-12 text-[#45B8F2] animate-spin mb-4" />
            <p className="text-white text-lg">Loading users...</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isRefreshing && filteredUsers.length === 0 && (
        <div className="bg-[#212936] rounded-lg shadow-lg p-8 flex flex-col items-center justify-center">
          <UserX className="w-16 h-16 text-gray-500 mb-4" />
          <h3 className="text-xl text-white mb-2">No users found</h3>
         
        </div>
      )}

      {/* Desktop Table View */}
      {!isRefreshing && filteredUsers.length > 0 && (
        <div className="hidden sm:block overflow-x-auto rounded-lg shadow-lg">
          <table className="min-w-full bg-[#212936] text-white">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-4 px-6 text-left">ID</th>
                <th className="py-4 px-6 text-left">Name</th>
                <th className="py-4 px-6 text-left">Email</th>
                <th className="py-4 px-6 text-left">Location</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr
                  key={user._id.toString()}
                  className="border-b border-gray-700 hover:bg-[#2D394E] transition-colors"
                >
                  <td className="py-4 px-6 font-mono text-sm">
                    {((paginationInfo.currentPage - 1) * itemsPerPage) + index + 1}
                  </td>
                  <td className="py-4 px-6 font-medium">{user.name}</td>
                  <td className="py-4 px-6 text-gray-300 truncate max-w-xs">{user.email}</td>
                  <td className="py-4 px-6">{user.location || 'Not specified'}</td>
                  <td className="py-4 px-6 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${user.isBlock
                        ? 'bg-red-900/50 text-red-200'
                        : 'bg-green-900/50 text-green-200'
                        }`}
                    >
                      {user.isBlock ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex justify-end space-x-3">
                      <button
                        className="relative p-2 rounded-lg hover:bg-gray-700 transition-colors group"
                        onClick={() =>
                          user.isBlock ? handleUnblockUser(user._id) : handleBlockUser(user._id)
                        }
                        aria-label={user.isBlock ? 'Unblock user' : 'Block user'}
                      >
                        {user.isBlock ? (
                          <Unlock className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
                        ) : (
                          <Lock className="w-5 h-5 text-yellow-400 group-hover:text-yellow-300" />
                        )}
                        <span className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white text-center py-1 px-2 rounded text-xs whitespace-nowrap mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {user.isBlock ? 'Unblock User' : 'Block User'}
                        </span>
                      </button>
                      <button
                        className="relative p-2 rounded-lg hover:bg-red-900/50 transition-colors group"
                        onClick={() => handleDeleteUser(user._id)}
                        aria-label="Delete user"
                      >
                        <Trash2 className="w-5 h-5 text-red-400 group-hover:text-red-300" />
                        <span className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white text-center py-1 px-2 rounded text-xs whitespace-nowrap mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          Delete User
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile View */}
      {!isRefreshing && filteredUsers.length > 0 && (
        <div className="sm:hidden space-y-4">
          {filteredUsers.map((user, index) => (
            <div
              key={user._id.toString()}
              className="bg-[#212936] rounded-lg p-4 space-y-3 shadow-md"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="bg-[#45B8F2]/20 text-[#45B8F2] rounded-full w-8 h-8 flex items-center justify-center mr-2">
                    {((paginationInfo.currentPage - 1) * itemsPerPage) + index + 1}
                  </span>
                  <span className="font-medium text-white">{user.name}</span>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs ${user.isBlock
                    ? 'bg-red-900/50 text-red-200'
                    : 'bg-green-900/50 text-green-200'
                    }`}
                >
                  {user.isBlock ? 'Blocked' : 'Active'}
                </span>
              </div>

              <div className="space-y-2 text-white">
                <div className="flex flex-col">
                  <span className="text-gray-400 text-sm">Email</span>
                  <span className="truncate text-sm">{user.email}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-sm">Location</span>
                  <span className="text-sm">{user.location || 'Not specified'}</span>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2 border-t border-gray-700">
                <button
                  className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors flex items-center"
                  onClick={() => (user.isBlock ? handleUnblockUser(user._id) : handleBlockUser(user._id))}
                >
                  {user.isBlock ? (
                    <>
                      <Unlock className="w-4 h-4 text-blue-400 mr-1" />
                      <span className="text-sm text-blue-400">Unblock</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="text-sm text-yellow-400">Block</span>
                    </>
                  )}
                </button>
                <button
                  className="p-2 rounded-lg bg-red-900/30 hover:bg-red-900/50 transition-colors flex items-center"
                  onClick={() => handleDeleteUser(user._id)}
                >
                  <Trash2 className="w-4 h-4 text-red-400 mr-1" />
                  <span className="text-sm text-red-400">Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!isRefreshing && paginationInfo.totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-white text-sm">
            Page {paginationInfo.currentPage} of {paginationInfo.totalPages}
          </div>

          <div className="flex items-center gap-2">
            {/* Previous Page */}
            <button
              onClick={() => handlePageChange(paginationInfo.currentPage - 1)}
              disabled={!paginationInfo.hasPrev}
              className={`p-2 rounded-lg transition-colors ${!paginationInfo.hasPrev
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-[#212936] text-white hover:bg-[#2D394E]'
                }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page Numbers */}
            {getPageNumbers().map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page as number)}
                className={`px-3 py-2 rounded-lg transition-colors ${page === paginationInfo.currentPage
                    ? 'bg-[#45B8F2] text-white'
                    : 'bg-[#212936] text-white hover:bg-[#2D394E]'
                  }`}
              >
                {page}
              </button>
            ))}

            {/* Next Page */}
            <button
              onClick={() => handlePageChange(paginationInfo.currentPage + 1)}
              disabled={!paginationInfo.hasNext}
              className={`p-2 rounded-lg transition-colors ${!paginationInfo.hasNext
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-[#212936] text-white hover:bg-[#2D394E]'
                }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManageBody;