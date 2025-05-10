import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { User, Phone, Loader2, CheckCircle } from 'lucide-react';
import apiClient from '../../../services/apiClient';
import { LOCALHOST_URL } from '../../../constants/constants';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

interface FormData {
  name: string;
  mobile: string;
}

const UserEditProfileBody: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    mobile: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSuccess(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get(`${LOCALHOST_URL}/user/getUserDetails`);
        setFormData({
          name: response.data.data.name,
          mobile: response.data.data.mobile,
        });
      } catch (error) {
        console.log(error);
        setError('Failed to fetch user details.');
      }
    };

    fetchData();
  }, []);

  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await apiClient.patch(`${LOCALHOST_URL}/user/editprofile`, formData);
      console.log(response.data.message);
      if (response.data.message == "Not updated") {
        toast.error("User details not updated")
      } else if (response.data.message == "User details updated") {
        setSuccess(true)
        toast.success("User details updated")
        navigate("/user/profile")
      }
    } catch (error) {
      console.error(error);
      setError('Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidMobile = formData.mobile.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Edit Profile</h2>
          <p className="text-gray-500">Update your personal information</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded flex items-center">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
              <p className="text-green-600">Profile updated successfully!</p>
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
              Mobile Number
            </label>
            <div className="relative mt-1">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="tel"
                id="mobile"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-2 text-white font-bold rounded-md ${isSubmitting ? 'bg-blue-300 cursor-not-allowed' : 'bg-[#31AFEF] hover:bg-blue-500'}`}
            disabled={!formData.name || !isValidMobile || isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving Changes...
              </span>
            ) : (
              'Save Changes'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserEditProfileBody;
