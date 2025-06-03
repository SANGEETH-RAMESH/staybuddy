import{ useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { ObjectId } from 'bson';
import { Unlock, Lock, Trash2, RefreshCw, UserX, Users } from 'lucide-react';
import adminApiClient from '../../../services/adminApiClient';

interface User {
  _id: ObjectId | string;
  name: string;
  email: string;
  location: string | null;
  isBlock: boolean;
}

const AdminUserManageBody = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'blocked'>('all');

  // Handle block user
  const handleBlockUser = async (userId: ObjectId | string) => {
    try {
      const response = await adminApiClient.patch('http://localhost:4000/admin/userblock', { userId });
      if (response.data.message === 'User blocked') {
        localStorage.removeItem('userRefreshToken');
        localStorage.removeItem('userAccessToken');
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
      const response = await adminApiClient.patch('http://localhost:4000/admin/userunblock', { userId });
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
        const response = await adminApiClient.delete('http://localhost:4000/admin/deleteuser', {
          data: { userId },
        });
        
        if (response.data.success) {
          setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
          updateFilteredUsers();
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

  // Fetch users function
  const fetchUsers = async () => {
    setIsRefreshing(true);
    try {
      const response = await adminApiClient.get('http://localhost:4000/admin/getUser');
      if (response.data.success) {
        setUsers(response.data.message);
        updateFilteredUsers(response.data.message);
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch users');
      setLoading(false);
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Update filtered users based on search and filters
  const updateFilteredUsers = (userList = users) => {
    let filtered = userList;
    
    // Apply status filter
    if (filterStatus === 'active') {
      filtered = filtered.filter(user => !user.isBlock);
    } else if (filterStatus === 'blocked') {
      filtered = filtered.filter(user => user.isBlock);
    }
    
    // Apply search filter
    if (searchTerm) {
      const lowercaseSearch = searchTerm.toLowerCase();
      console.log(lowercaseSearch,"LOwer")
      filtered = filtered.filter(
        user => 
          user.name.toLowerCase().includes(lowercaseSearch) || 
          user.email.toLowerCase().includes(lowercaseSearch) ||
          (user.location && user.location.toLowerCase().includes(lowercaseSearch))
      );
    }
    
    setFilteredUsers(filtered);
  };

  

  // Apply filters whenever dependencies change
  useEffect(() => {
    updateFilteredUsers();
  }, [searchTerm, filterStatus, users]);

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] mt-[11vh] lg:ml-64 pt-24">
        <div className="bg-[#212936] p-6 rounded-lg shadow-lg flex flex-col items-center">
          <RefreshCw className="w-12 h-12 text-[#45B8F2] animate-spin mb-4" />
          <p className="text-white text-lg">Loading users...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] mt-[11vh] lg:ml-64 pt-24">
        <div className="bg-[#212936] p-6 rounded-lg shadow-lg flex flex-col items-center">
          <UserX className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-white text-lg mb-4">{error}</p>
          <button 
            className="bg-[#45B8F2] py-2 px-4 rounded-md hover:bg-[#3ca1d8] transition-colors"
            onClick={fetchUsers}
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
        
        {/* <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
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
          
          <div className="flex gap-2">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                filterStatus === 'all' 
                  ? 'bg-[#45B8F2] text-white' 
                  : 'bg-[#1A202C] text-gray-300 hover:bg-[#2D394E]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleFilterChange('active')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                filterStatus === 'active' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-[#1A202C] text-gray-300 hover:bg-[#2D394E]'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => handleFilterChange('blocked')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                filterStatus === 'blocked' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-[#1A202C] text-gray-300 hover:bg-[#2D394E]'
              }`}
            >
              Blocked
            </button>
            <button
              onClick={fetchUsers}
              disabled={isRefreshing}
              className="bg-[#1A202C] text-gray-300 hover:bg-[#2D394E] px-3 py-1.5 rounded-md transition-colors"
              aria-label="Refresh users"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-[#45B8F2]' : ''}`} />
            </button>
          </div>
        </div>*/}
      </div> 

      {/* Empty state */}
      {filteredUsers.length === 0 && (
        <div className="bg-[#212936] rounded-lg shadow-lg p-8 flex flex-col items-center justify-center">
          <UserX className="w-16 h-16 text-gray-500 mb-4" />
          <h3 className="text-xl text-white mb-2">No users found</h3>
          <p className="text-gray-400 text-center mb-6">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'There are no users to display'}
          </p>
          {(searchTerm || filterStatus !== 'all') && (
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                }}
                className="bg-[#45B8F2] text-white px-4 py-2 rounded-md hover:bg-[#3ca1d8] transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Desktop Table View */}
      {filteredUsers.length > 0 && (
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
                  <td className="py-4 px-6 font-mono text-sm">{index + 1}</td>
                  <td className="py-4 px-6 font-medium">{user.name}</td>
                  <td className="py-4 px-6 text-gray-300 truncate max-w-xs">{user.email}</td>
                  <td className="py-4 px-6">{user.location || 'Not specified'}</td>
                  <td className="py-4 px-6 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        user.isBlock
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
                        className="p-2 rounded-lg hover:bg-gray-700 transition-colors group tooltip-container"
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
                        <span className="tooltip">
                          {user.isBlock ? 'Unblock User' : 'Block User'}
                        </span>
                      </button>
                      <button
                        className="p-2 rounded-lg hover:bg-red-900/50 transition-colors group tooltip-container"
                        onClick={() => handleDeleteUser(user._id)}
                        aria-label="Delete user"
                      >
                        <Trash2 className="w-5 h-5 text-red-400 group-hover:text-red-300" />
                        <span className="tooltip">Delete User</span>
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
      {filteredUsers.length > 0 && (
        <div className="sm:hidden space-y-4">
          {filteredUsers.map((user, index) => (
            <div 
              key={user._id.toString()} 
              className="bg-[#212936] rounded-lg p-4 space-y-3 shadow-md"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="bg-[#45B8F2]/20 text-[#45B8F2] rounded-full w-8 h-8 flex items-center justify-center mr-2">
                    {index + 1}
                  </span>
                  <span className="font-medium text-white">{user.name}</span>
                </div>
                
                <span
                  className={`px-3 py-1 rounded-full text-xs ${
                    user.isBlock
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

      {/* Pagination could be added here in the future */}
      
      <style jsx>{`
        .tooltip-container {
          position: relative;
        }
        
        .tooltip {
          visibility: hidden;
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background-color: rgba(0, 0, 0, 0.8);
          color: white;
          text-align: center;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          white-space: nowrap;
          margin-bottom: 5px;
          opacity: 0;
          transition: opacity 0.2s;
        }
        
        .tooltip-container:hover .tooltip {
          visibility: visible;
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default AdminUserManageBody; 