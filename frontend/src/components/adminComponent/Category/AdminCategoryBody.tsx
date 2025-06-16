import React, { useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
// import axios from 'axios';
// import { toast } from 'react-toastify';
import { ObjectId } from 'bson';
import { Pencil, Trash2, Search, RefreshCw, PlusCircle, PackageX, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LOCALHOST_URL } from '../../../constants/constants';
import { Category } from '../../../interface/Category';
import adminApiClient from '../../../services/adminApiClient';
// import CategoryEditModal from './CategoryEditModal';

// interface Category {
//   _id: ObjectId | string;
//   name: string;
//   description: string;
//   image: string;
//   isActive: boolean;
//   createdAt: string;
// }

const AdminCategoryBody = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  // const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState<boolean>(true);
  // const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  // const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  // const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const [pages, setPages] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCategories, setTotalCategories] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const categoriesPerPage = 3;

  const navigate = useNavigate()

  // For edit modal
  //   const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  //   const [currentCategory, setCurrentCategory] = useState<Category | null>(null);

  // Handle delete category
  const handleDeleteCategory = async (categoryId: ObjectId | string) => {
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
        console.log(categoryId, 'heedsf')
        const response = await adminApiClient.delete('http://localhost:4000/admin/category', {
          data: { categoryId },
        });

        console.log(response, 'respons')
        if (response.data.message == 'Category Deleted') {
          // Refresh the current page data after deletion
          fetchCategories(currentPage);
          Swal.fire('Deleted!', 'The category has been deleted.', 'success');

          const newTotal = totalCategories - 1;
          const newTotalPages = Math.ceil(newTotal / categoriesPerPage);

          let newPage = currentPage;

          // If current page becomes empty after deletion, move to previous page
          if (categories.length === 1 && currentPage > 1) {
            newPage = currentPage - 1;
          }

          // Update states properly
          setTotalCategories(newTotal);
          setTotalPages(newTotalPages);
          setCurrentPage(newPage);

          // Fetch updated data
          fetchCategories(newPage);
        } else {
          Swal.fire('Failed!', 'There was an issue deleting the category.', 'error');
        }
      } catch (error) {
        console.error(error);
        Swal.fire('Failed!', 'There was an error with the server.', 'error');
      }
    }
  };

  // Open edit modal with category data
  const handleEditCategory = (category: Category) => {
    // setCurrentCategory(category);
    console.log("hiiiiii")
    console.log(category._id, "CAtegory")
    navigate(`/admin/editcategory/${category._id}`)
    // setIsEditModalOpen(true);
  };

  // Close edit modal
  //   const handleCloseEditModal = () => {
  //     setIsEditModalOpen(false);
  //     setCurrentCategory(null);
  //   };

  // Handle successful edit
  //   const handleCategoryUpdated = (updatedCategory: Category) => {
  //     setCategories(prevCategories =>
  //       prevCategories.map(category =>
  //         category._id === updatedCategory._id ? updatedCategory : category
  //       )
  //     );
  //     updateFilteredCategories();
  //     setIsEditModalOpen(false);
  //     toast.success('Category updated successfully');
  //   };

  // Fetch categories function with pagination
  const fetchCategories = async (page: number = 1) => {
    setLoading(true);
    try {
      // const skip = (page - 1) * categoriesPerPage;
      // const params = new URLSearchParams({
      //   page: page.toString(),
      //   limit: categoriesPerPage.toString(),
      //   skip: skip.toString(),
      //   ...(search && { search }),
      //   ...(status !== 'all' && { status })
      // });
      const skip = (page - 1) * categoriesPerPage;
      const limit = categoriesPerPage;
      console.log(limit, skip, 'hee')


      const response = await adminApiClient.get(`${LOCALHOST_URL}/admin/getAllCategory`, {
        params: {
          skip,
          limit
        }
      });
      console.log(response.data.message, 'response')
      const data = response.data.message.getCategories;

      if (data) {
        setCategories(data || []);
        setAllCategories(data || [])
        const totalCount = response.data.message.totalCount || 0;
        setTotalCategories(totalCount);

        // Fix 3: Calculate total pages correctly
        const totalPages = Math.ceil(totalCount / limit);
        console.log(totalPages, 'hee')
        setTotalPages(totalPages);
      }
    } catch (error) {
      console.log(error);
      setCategories([]);
      setTotalCategories(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  // Update filtered categories based on search and filters
  // const updateFilteredCategories = (categoryList = categories) => {
  //   const filtered = categoryList;


  //   // Apply status filter (if not already applied on backend)
  //   // if (filterStatus === 'active') {
  //   //   filtered = filtered.filter(category => category.isActive);
  //   // } else if (filterStatus === 'inactive') {
  //   //   filtered = filtered.filter(category => !category.isActive);
  //   // }

  //   // Apply search filter (if not already applied on backend)
  //   // if (searchTerm) {
  //   //   const lowercaseSearch = searchTerm.toLowerCase();
  //   //   filtered = filtered.filter(
  //   //     category =>
  //   //       category.name.toLowerCase().includes(lowercaseSearch) ||
  //   //       category.description?.toLowerCase().includes(lowercaseSearch)
  //   //   );
  //   // }

  //   setFilteredCategories(filtered);
  // };

  // Handle search input change
  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    console.log(searchTimeout.current, 'Tpal')
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(async () => {


      if (newSearchTerm.trim() === '') {
        setCategories(allCategories);
        console.log(pages, 'heeeeee')
        setTotalPages(pages)
        return;
      }

      try {
        const response = await adminApiClient.get(`${LOCALHOST_URL}/admin/search?name=${newSearchTerm}`);
        console.log(response.data.message, 'Search Results');
        if (response.data.message.length > 0) {
          setCategories(response.data.message);
          setPages(totalPages)
          setTotalPages(1)
        }else if(response.data.message.length==0){
          setCategories([])
        }
        console.log(response.data.message.length)

      } catch (error) {
        console.error('Search API error:', error);
      }
    }, 500);
    // console.log(newSearchTerm, 'Search')
    // setSearchTerm(newSearchTerm);
    // console.log(categories, 'Categoires')
    // const filteredCategories = allCategories.filter(category =>
    //   category.name.toLowerCase().includes(newSearchTerm.toLowerCase())
    // );

    // setCategories(filteredCategories)
    // setCurrentPage(1); // Reset to first page when searching

    // // Debounce search to avoid too many API calls
    // const timeoutId = setTimeout(() => {
    //   fetchCategories(1, newSearchTerm, filterStatus);
    // }, 500);

    // return () => clearTimeout(timeoutId);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      fetchCategories(page);
    }
  };

  // Handle filter change
  // const handleFilterChange = (status: 'all' | 'active' | 'inactive') => {
  //   setFilterStatus(status);
  //   setCurrentPage(1); // Reset to first page when filtering
  //   fetchCategories(1, searchTerm, status);
  // };

  // Apply filters whenever dependencies change
  // useEffect(() => {
  //   updateFilteredCategories();
  // }, [categories]);


  // Fetch categories on mount
  useEffect(() => {
    fetchCategories(currentPage);
  }, []);

  // Format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleAddCategory = () => {
    navigate('/admin/addcategory')
  }

  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) pages.push('...');

      if (currentPage > 2 && currentPage < totalPages - 1) {
        pages.push(currentPage - 1, currentPage, currentPage + 1);
      } else if (currentPage <= 3) {
        pages.push(2, 3, 4);
      } else {
        pages.push(totalPages - 3, totalPages - 2, totalPages - 1);
      }

      if (currentPage < totalPages - 2) pages.push('...');

      pages.push(totalPages);
    }

    return pages;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] mt-[11vh] lg:ml-64 pt-24">
        <div className="bg-[#212936] p-6 rounded-lg shadow-lg flex flex-col items-center">
          <RefreshCw className="w-12 h-12 text-[#45B8F2] animate-spin mb-4" />
          <p className="text-white text-lg">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 pt-24 mt-[11vh] lg:ml-64">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="flex items-center mb-4 sm:mb-0">
          <Package className="text-[#45B8F2] mr-2 h-6 w-6" />
          <h1 className="text-2xl md:text-3xl text-white font-semibold">Category Management</h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="bg-[#1A202C] text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:border-[#45B8F2] focus:outline-none w-full sm:w-64"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
          </div>

          {/* <div className="flex gap-2">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-3 py-1.5 rounded-md transition-colors ${filterStatus === 'all'
                ? 'bg-[#45B8F2] text-white'
                : 'bg-[#1A202C] text-gray-300 hover:bg-[#2D394E]'
                }`}
            >
              All
            </button>
            <button
              onClick={() => handleFilterChange('active')}
              className={`px-3 py-1.5 rounded-md transition-colors ${filterStatus === 'active'
                ? 'bg-green-600 text-white'
                : 'bg-[#1A202C] text-gray-300 hover:bg-[#2D394E]'
                }`}
            >
              Active
            </button>
            <button
              onClick={() => handleFilterChange('inactive')}
              className={`px-3 py-1.5 rounded-md transition-colors ${filterStatus === 'inactive'
                ? 'bg-red-600 text-white'
                : 'bg-[#1A202C] text-gray-300 hover:bg-[#2D394E]'
                }`}
            >
              Inactive
            </button>
          </div> */}
        </div>
      </div>

      {/* Add Category Button */}
      <div className="mb-6">
        <button
          onClick={handleAddCategory}
          className="flex items-center bg-[#45B8F2] hover:bg-[#3ca1d8] text-white px-4 py-2 rounded-md transition-colors"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Add New Category
        </button>
      </div>

      {/* Empty state */}
      {categories?.length === 0 && !loading && (
        <div className="bg-[#212936] rounded-lg shadow-lg p-8 flex flex-col items-center justify-center">
          <PackageX className="w-16 h-16 text-gray-500 mb-4" />
          <h3 className="text-xl text-white mb-2">No categories found</h3>
          {/* <p className="text-gray-400 text-center mb-6">
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your search or filters'
              : 'There are no categories to display'}
          </p>
          {(searchTerm || filterStatus !== 'all') && (
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setCurrentPage(1);
                  fetchCategories(1, '', 'all');
                }}
                className="bg-[#45B8F2] text-white px-4 py-2 rounded-md hover:bg-[#3ca1d8] transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )} */}
        </div>
      )}

      {/* Desktop Table View */}
      {categories.length > 0 && (
        <div className="hidden sm:block overflow-x-auto rounded-lg shadow-lg">
          <table className="min-w-full bg-[#212936] text-white">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-4 px-6 text-left">ID</th>
                <th className="py-4 px-6 text-left">Image</th>
                <th className="py-4 px-6 text-left">Name</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-left">Created</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category, index) => (
                <tr
                  key={category._id.toString()}
                  className="border-b border-gray-700 hover:bg-[#2D394E] transition-colors"
                >
                  <td className="py-4 px-6 font-mono text-sm">
                    {(currentPage - 1) * categoriesPerPage + index + 1}
                  </td>
                  <td className="py-4 px-6">
                    <div className="h-12 w-12 rounded-md overflow-hidden bg-gray-700">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package className="text-gray-400 h-6 w-6" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 font-medium">{category.name}</td>
                  <td className="py-4 px-6 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${category.isActive
                        ? 'bg-green-900/50 text-green-200'
                        : 'bg-red-900/50 text-red-200'
                        }`}
                    >
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-300">
                    {formatDate(category.createdAt)}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex justify-end space-x-3">
                      <button
                        className="p-2 rounded-lg hover:bg-gray-700 transition-colors group tooltip-container"
                        onClick={() => handleEditCategory(category)}
                        aria-label="Edit category"
                      >
                        <Pencil className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
                        <span className="tooltip">Edit Category</span>
                      </button>
                      <button
                        className="p-2 rounded-lg hover:bg-red-900/50 transition-colors group tooltip-container"
                        onClick={() => handleDeleteCategory(category._id)}
                        aria-label="Delete category"
                      >
                        <Trash2 className="w-5 h-5 text-red-400 group-hover:text-red-300" />
                        <span className="tooltip">Delete Category</span>
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
      {categories.length > 0 && (
        <div className="sm:hidden space-y-4">
          {categories.map((category) => (
            <div
              key={category._id.toString()}
              className="bg-[#212936] rounded-lg p-4 space-y-3 shadow-md"
            >
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-md overflow-hidden bg-gray-700 mr-3">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Package className="text-gray-400 h-6 w-6" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-white">{category.name}</h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${category.isActive
                      ? 'bg-green-900/50 text-green-200'
                      : 'bg-red-900/50 text-red-200'
                      }`}
                  >
                    {category.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-white">
                <div className="flex flex-col">
                  <span className="text-gray-400 text-sm">Created</span>
                  <span className="text-sm">{formatDate(category.createdAt)}</span>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2 border-t border-gray-700">
                <button
                  className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors flex items-center"
                  onClick={() => handleEditCategory(category)}
                >
                  <Pencil className="w-4 h-4 text-blue-400 mr-1" />
                  <span className="text-sm text-blue-400">Edit</span>
                </button>
                <button
                  className="p-2 rounded-lg bg-red-900/30 hover:bg-red-900/50 transition-colors flex items-center"
                  onClick={() => handleDeleteCategory(category._id)}
                >
                  <Trash2 className="w-4 h-4 text-red-400 mr-1" />
                  <span className="text-sm text-red-400">Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-400">
            Showing {categories.length} of {totalCategories} categories
          </div>

          <div className="flex items-center gap-2">
            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg transition-colors ${currentPage === 1
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-[#1A202C] text-white hover:bg-[#2D394E]'
                }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page Numbers */}
            {generatePageNumbers().map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="px-3 py-2 text-gray-400">...</span>
                ) : (
                  <button
                    onClick={() => handlePageChange(page as number)}
                    className={`px-3 py-2 rounded-lg transition-colors ${currentPage === page
                      ? 'bg-[#45B8F2] text-white'
                      : 'bg-[#1A202C] text-white hover:bg-[#2D394E]'
                      }`}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg transition-colors ${currentPage === totalPages
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-[#1A202C] text-white hover:bg-[#2D394E]'
                }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

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

export default AdminCategoryBody;