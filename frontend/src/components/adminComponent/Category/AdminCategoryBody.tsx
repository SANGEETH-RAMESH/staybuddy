import React, { useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import { ObjectId } from 'bson';
import { Pencil, Trash2, Search, RefreshCw, PlusCircle, PackageX, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Category } from '../../../interface/Category';
import { deleteCategory, getAllCategory, searchCategory } from '../../../services/categoryServices';

const AdminCategoryBody = () => {
  const [categories, setCategories] = useState<Category[]>([]);


  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const [pages, setPages] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCategories, setTotalCategories] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const categoriesPerPage = 3;

  const navigate = useNavigate()

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
        if (!categoryId) return
        console.log(categoryId, 'heedsf')

        const id = categoryId.toString()
        const response = await deleteCategory(id);

        console.log(response, 'respons')
        if (response.data.message == 'Category Deleted') {

          fetchCategories(currentPage);
          Swal.fire('Deleted!', 'The category has been deleted.', 'success');

          const newTotal = totalCategories - 1;
          const newTotalPages = Math.ceil(newTotal / categoriesPerPage);

          let newPage = currentPage;


          if (categories.length === 1 && currentPage > 1) {
            newPage = currentPage - 1;
          }


          setTotalCategories(newTotal);
          setTotalPages(newTotalPages);
          setCurrentPage(newPage);


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


  const handleEditCategory = (category: Category) => {
    console.log("hiiiiii")
    console.log(category._id, "CAtegory")
    navigate(`/admin/editcategory/${category._id}`)

  };


  const fetchCategories = async (page: number = 1) => {
    setLoading(true);
    try {

      const skip = (page - 1) * categoriesPerPage;
      const limit = categoriesPerPage;
      const response = await getAllCategory(skip,limit)
      const data = response.data.message.getCategories;
      if (data) {
        setCategories(data || []);
        setAllCategories(data || [])
        const totalCount = response.data.message.totalCount || 0;
        setTotalCategories(totalCount);
        const totalPages = Math.ceil(totalCount / limit);
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
        const response = await searchCategory(newSearchTerm);
        console.log(response.data.message, 'Search Results');
        if (response.data.message.length > 0) {
          setCategories(response.data.message);
          setPages(totalPages)
          setTotalPages(1)
        } else if (response.data.message.length == 0) {
          setCategories([])
        }
        console.log(response.data.message.length)

      } catch (error) {
        console.error('Search API error:', error);
      }
    }, 500);
  };


  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      fetchCategories(page);
    }
  };

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
        </div>
      </div>

      <div className="mb-6">
        <button
          onClick={handleAddCategory}
          className="flex items-center bg-[#45B8F2] hover:bg-[#3ca1d8] text-white px-4 py-2 rounded-md transition-colors"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Add New Category
        </button>
      </div>


      {categories?.length === 0 && !loading && (
        <div className="bg-[#212936] rounded-lg shadow-lg p-8 flex flex-col items-center justify-center">
          <PackageX className="w-16 h-16 text-gray-500 mb-4" />
          <h3 className="text-xl text-white mb-2">No categories found</h3>

        </div>
      )}


      {categories.length > 0 && (
        <div className="overflow-x-auto rounded-lg shadow-lg">
          <table className="min-w-full bg-[#212936] text-white table-auto sm:table-fixed">
            <thead className="hidden sm:table-header-group">
              <tr className="border-b border-gray-700">
                <th className="py-3 px-2 sm:py-4 sm:px-6 text-left text-xs sm:text-sm">ID</th>
                <th className="py-3 px-2 sm:py-4 sm:px-6 text-left text-xs sm:text-sm">Image</th>
                <th className="py-3 px-2 sm:py-4 sm:px-6 text-left text-xs sm:text-sm">Name</th>
                <th className="py-3 px-2 sm:py-4 sm:px-6 text-center text-xs sm:text-sm">Status</th>
                <th className="py-3 px-2 sm:py-4 sm:px-6 text-left text-xs sm:text-sm hidden md:table-cell">Created</th>
                <th className="py-3 px-2 sm:py-4 sm:px-6 text-right text-xs sm:text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category, index) => (
                <tr
                  key={category._id.toString()}
                  className="border-b border-gray-700 hover:bg-[#2D394E] transition-colors block sm:table-row bg-[#212936] mb-4 sm:mb-0 rounded-lg sm:rounded-none p-4 sm:p-0"
                >
                  {/* Mobile: Card Layout, Desktop: Table Row */}
                  <td className="py-2 px-2 sm:py-4 sm:px-6 font-mono text-xs sm:text-sm block sm:table-cell">
                    <span className="inline-block sm:hidden font-semibold text-gray-400 text-xs mb-1">ID: </span>
                    {(currentPage - 1) * categoriesPerPage + index + 1}
                  </td>

                  <td className="py-2 px-2 sm:py-4 sm:px-6 block sm:table-cell">
                    <div className="flex items-center sm:block">
                      <span className="inline-block sm:hidden font-semibold text-gray-400 text-xs mr-3 min-w-[60px]">Image:</span>
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-md overflow-hidden bg-gray-700">
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Package className="text-gray-400 h-4 w-4 sm:h-6 sm:w-6" />
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-2 px-2 sm:py-4 sm:px-6 font-medium block sm:table-cell">
                    <span className="inline-block sm:hidden font-semibold text-gray-400 text-xs mb-1">Name: </span>
                    <span className="text-sm sm:text-base">{category.name}</span>
                  </td>

                  <td className="py-2 px-2 sm:py-4 sm:px-6 block sm:table-cell sm:text-center">
                    <div className="flex items-center sm:justify-center">
                      <span className="inline-block sm:hidden font-semibold text-gray-400 text-xs mr-3 min-w-[60px]">Status:</span>
                      <span
                        className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm ${category.isActive
                          ? 'bg-green-900/50 text-green-200'
                          : 'bg-red-900/50 text-red-200'
                          }`}
                      >
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>

                  <td className="py-2 px-2 sm:py-4 sm:px-6 text-xs sm:text-sm text-gray-300 block sm:table-cell md:table-cell hidden sm:block">
                    <span className="inline-block sm:hidden font-semibold text-gray-400 text-xs mb-1">Created: </span>
                    {formatDate(category.createdAt)}
                  </td>

                  <td className="py-2 px-2 sm:py-4 sm:px-6 block sm:table-cell">
                    <div className="flex items-center justify-start sm:justify-end space-x-2 sm:space-x-3 mt-3 sm:mt-0 pt-3 sm:pt-0 border-t border-gray-700 sm:border-t-0">
                      <span className="inline-block sm:hidden font-semibold text-gray-400 text-xs mr-2">Actions:</span>
                      <button
                        className="relative p-1.5 sm:p-2 rounded-lg hover:bg-gray-700 transition-colors group flex items-center sm:block bg-gray-700/50 sm:bg-transparent"
                        onClick={() => handleEditCategory(category)}
                        aria-label="Edit category"
                      >
                        <Pencil className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 group-hover:text-blue-300" />
                        <span className="text-xs sm:hidden text-blue-400 ml-1">Edit</span>
                        <span className="invisible absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white text-center py-1 px-2 rounded text-xs whitespace-nowrap mb-1 opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-200 hidden sm:block">
                          Edit Category
                        </span>
                      </button>
                      <button
                        className="relative p-1.5 sm:p-2 rounded-lg hover:bg-red-900/50 transition-colors group flex items-center sm:block bg-red-900/30 sm:bg-transparent"
                        onClick={() => handleDeleteCategory(category._id)}
                        aria-label="Delete category"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 group-hover:text-red-300" />
                        <span className="text-xs sm:hidden text-red-400 ml-1">Delete</span>
                        <span className="invisible absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white text-center py-1 px-2 rounded text-xs whitespace-nowrap mb-1 opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-200 hidden sm:block">
                          Delete Category
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
    </div>
  );
};

export default AdminCategoryBody;