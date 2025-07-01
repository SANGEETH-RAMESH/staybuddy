import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Package, ArrowLeft, Save, Loader2, ToggleLeft, ToggleRight, Info, AlertCircle } from 'lucide-react';
import AdminHeader from '../../commonComponents/adminHeader';
import AdminSidebar from '../../commonComponents/adminSidebar';
import adminApiClient from '../../../services/adminApiClient';
const apiUrl = import.meta.env.VITE_LOCALHOST_URL;

const AdminEditCategoryPage = () => {
    const navigate = useNavigate();
    const { id } = useParams(); 
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Form state
    const [name, setName] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [errors, setErrors] = useState({
        name: ''
    });

    
    useEffect(() => {
        const fetchCategoryData = async () => {
            try {
                setIsLoading(true);
                const response = await adminApiClient.get(`${apiUrl}/admin/getCategory/${id}`);
                console.log(response.data.message)
                const categoryData = response.data.message;

                if (categoryData) {
                    setName(categoryData.name);
                    setIsActive(categoryData.isActive);
                } else {
                    toast.error('Category not found');
                    navigate('/admin/category');
                }
            } catch (error) {
                toast.error('Failed to fetch category data');
                console.error('Error fetching category:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchCategoryData();
        }
    }, [id, navigate]);

    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setIsSubmitting(true);

        try {
            const response = await adminApiClient.put(
                `http://localhost:4000/admin/updateCategory/${id}`,
                {
                    name,
                    isActive
                }
            );
            console.log(response.data.message)
            if (response.data.message === 'Category Updated') {
                toast.success('Category updated successfully');
                navigate('/admin/category');
            } else if (response.data.message === 'Category Already Exists') {
                toast.error("Category name already exists");
            } else {
                toast.error(response.data.message || 'Failed to update category');
            }
        } catch (error) {
            const axiosError = error as any;
            console.log(axiosError.response.data, 'hee')
            if (axiosError.response) {
                const { message, errors } = axiosError.response.data;

                if (errors) {
                    setErrors(errors);
                    return;
                }

                toast.error(message || "Login failed", {
                    style: { backgroundColor: '#FFFFFF', color: "#31AFEF" }
                });
            } else {
                toast.error("An unexpected error occurred", {
                    style: { backgroundColor: '#FFFFFF', color: "#31AFEF" }
                });
            }

            console.error("Login error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };



    return (
        <div className="min-h-screen bg-gradient-to-b from-[#2D394E] to-[#1F2937] flex flex-col">
            {/* Fixed Header */}
            <div className="fixed top-0 left-0 right-0 z-50">
                <AdminHeader
                    onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    isSidebarOpen={isSidebarOpen}
                />
            </div>

            <div className="flex flex-1 relative">
                {/* Overlay for mobile when sidebar is open */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-40"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <div className="fixed top-0 left-0 h-full z-40 pt-[11vh]">
                    <AdminSidebar
                        isOpen={isSidebarOpen}
                        onClose={() => setIsSidebarOpen(false)}
                    />
                </div>

                {/* Main Content */}
                <div className={`w-full transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'ml-0'
                    } p-4 md:p-6 lg:p-8 pt-24 mt-[11vh]`}>

                    {/* Page Header with Back Button */}
                    <div className="flex items-center mb-6">
                        <button
                            onClick={() => navigate('/admin/category')}
                            className="flex items-center text-gray-300 hover:text-white mr-4 transition-colors"
                            aria-label="Go back"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div className="flex items-center">
                            <div className="bg-[#45B8F2] bg-opacity-20 p-2 rounded-lg mr-3">
                                <Package className="text-[#45B8F2] h-6 w-6" />
                            </div>
                            <h1 className="text-2xl md:text-3xl text-white font-semibold">Edit Category</h1>
                        </div>
                    </div>

                    {/* Breadcrumb Navigation */}
                    <div className="flex items-center text-sm text-gray-400 mb-6">
                        <span className="hover:text-[#45B8F2] cursor-pointer" onClick={() => navigate('/admin/dashboard')}>Dashboard</span>
                        <span className="mx-2">/</span>
                        <span className="hover:text-[#45B8F2] cursor-pointer" onClick={() => navigate('/admin/category')}>Categories</span>
                        <span className="mx-2">/</span>
                        <span className="text-[#45B8F2]">Edit</span>
                    </div>

                    {/* Form Card */}
                    {isLoading ? (
                        <div className="bg-[#212936] rounded-lg shadow-xl p-6 flex justify-center items-center h-64 border border-gray-700">
                            <div className="flex flex-col items-center">
                                <Loader2 className="animate-spin h-10 w-10 text-[#45B8F2] mb-4" />
                                <p className="text-gray-300">Loading category data...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-[#212936] rounded-lg shadow-xl p-6 border border-gray-700">
                            <div className="mb-6 pb-4 border-b border-gray-700">
                                <h2 className="text-xl text-white font-medium">Category Details</h2>
                                <p className="text-gray-400 text-sm mt-1">Update your category information below</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    {/* Category Name */}
                                    <div className="col-span-1">
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                                            Category Name*
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="name"
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className={`w-full bg-[#1A202C] text-white rounded-md border ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-[#45B8F2]'
                                                    } p-3 focus:outline-none transition-colors shadow-sm`}
                                                placeholder="Enter category name"
                                            />
                                            {errors.name && (
                                                <div className="absolute right-3 top-3 text-red-500">
                                                    <AlertCircle className="h-5 w-5" />
                                                </div>
                                            )}
                                        </div>
                                        {errors.name && (
                                            <p className="text-red-400 text-xs mt-2 flex items-center">
                                                <AlertCircle className="h-3 w-3 mr-1" />
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    {/* Category Status */}
                                    <div className="col-span-1">
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Status
                                        </label>
                                        <div className="flex items-center mt-5">
                                            <button
                                                type="button"
                                                onClick={() => setIsActive(!isActive)}
                                                className="flex items-center focus:outline-none"
                                            >
                                                {isActive ? (
                                                    <>
                                                        <ToggleRight className="h-6 w-6 text-green-500 mr-2" />
                                                        <span className="text-green-400 text-sm">Active</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <ToggleLeft className="h-6 w-6 text-gray-500 mr-2" />
                                                        <span className="text-gray-400 text-sm">Inactive</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Information Card */}
                                <div className="bg-[#1A202C] border border-blue-500 border-opacity-30 rounded-md p-4 flex items-start space-x-3 mt-4">
                                    <div className="bg-blue-500 bg-opacity-20 p-1 rounded-full">
                                        <Info className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-gray-300 text-sm">
                                            Updating the category name will affect all associated products. Make sure the new name is clear and descriptive.
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/admin/category')}
                                        className="px-5 py-2.5 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex items-center px-5 py-2.5 bg-[#45B8F2] text-white rounded-md hover:bg-[#3ca1d8] transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                                <span>Updating...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-5 w-5 mr-2" />
                                                <span>Update Category</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminEditCategoryPage;