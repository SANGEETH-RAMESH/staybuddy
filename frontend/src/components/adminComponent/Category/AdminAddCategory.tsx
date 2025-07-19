import  { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Package, Upload, ArrowLeft, Save, Loader2, ToggleLeft, ToggleRight } from 'lucide-react';
import AdminHeader from '../../commonComponents/adminHeader';
import AdminSidebar from '../../commonComponents/adminSidebar';
import { addCategory } from '../../../services/categoryServices';


const AdminAddCategoryPage = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  
  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    image: ''
  });

 
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setErrors({
      ...errors,
      image: ''
    });

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();


    setIsSubmitting(true);

    try {
      const formData = new FormData();
      console.log(name,imageFile)
      formData.append('name', name);
      formData.append('isActive', String(isActive));
       
      if (imageFile) {
        formData.append('photos', imageFile);
      }
      console.log(formData,'formData')
      const response = await addCategory(formData);
      console.log(response,"Reponse")
      if (response.data.message == 'Added') {
        toast.success('Category added successfully');

        navigate('/admin/category');
      }else if(response.data.message == 'Category Already Exist'){
        toast.error("Category Already Exist")
      } else {
        toast.error(response.data.message || 'Failed to add category');
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
    <div className="min-h-screen bg-[#2D394E] flex flex-col">
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
        <div className={`w-full transition-all duration-300 ${
          isSidebarOpen ? 'lg:ml-64' : 'ml-0'
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
              <Package className="text-[#45B8F2] mr-2 h-6 w-6" />
              <h1 className="text-2xl md:text-3xl text-white font-semibold">Add New Category</h1>
            </div>
          </div>
          
          {/* Form Card */}
          <div className="bg-[#212936] rounded-lg shadow-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category Image */}
              <div className="flex flex-col items-center">
                <div className="h-40 w-40 rounded-lg overflow-hidden bg-gray-700 mb-3 relative">
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Category preview" 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Upload className="text-gray-400 h-10 w-10" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center">
                  <label 
                    htmlFor="image-upload" 
                    className="bg-[#2D394E] hover:bg-[#354459] text-[#45B8F2] rounded-md px-4 py-2 cursor-pointer transition-colors text-sm"
                  >
                    Choose Image
                  </label>
                  <input 
                    id="image-upload" 
                    type="file" 
                    accept="image/jpeg, image/png, image/webp" 
                    onChange={handleImageChange}
                    className="hidden" 
                  />
                  {errors.image && <p className="text-red-400 text-xs mt-1">{errors.image}</p>}
                  <p className="text-gray-400 text-xs mt-2">Max size: 2MB (JPG, PNG, WEBP)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                    Category Name*
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full bg-[#1A202C] text-white rounded-md border ${
                      errors.name ? 'border-red-500' : 'border-gray-600'
                    } p-2 focus:outline-none focus:border-[#45B8F2]`}
                    placeholder="Enter category name"
                  />
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                </div>

                {/* Category Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Status
                  </label>
                  <div className="flex items-center mt-2">
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

              {/* Category Description
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className={`w-full bg-[#1A202C] text-white rounded-md border ${
                    errors.description ? 'border-red-500' : 'border-gray-600'
                  } p-2 focus:outline-none focus:border-[#45B8F2] resize-none`}
                  placeholder="Enter category description (optional)"
                />
                {errors.description && (
                  <p className="text-red-400 text-xs mt-1">{errors.description}</p>
                )}
                <p className="text-gray-400 text-xs mt-1">
                  {description.length}/500 characters
                </p>
              </div> */}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/admin/category')}
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center px-4 py-2 bg-[#45B8F2] text-white rounded-md hover:bg-[#3ca1d8] transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5 mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      Save Category
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAddCategoryPage;