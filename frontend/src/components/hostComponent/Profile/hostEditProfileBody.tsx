import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { User, Phone, Loader2, CheckCircle } from 'lucide-react';
// import apiClient from '../../../services/apiClient';
import { LOCALHOST_URL } from '../../../constants/constants';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import hostapiClient from '../../../services/hostapiClient';

interface FormData {
  name: string;
  mobile: string;
}

const HostEditProfileBody: React.FC = () => {
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
        const response = await hostapiClient.get(`${LOCALHOST_URL}/host/getHost`);
        console.log(response.data.message,'REsponse')
        setFormData({
          name: response.data.message.name,
          mobile: response.data.message.mobile,
        });
      } catch (error) {
        console.log(error);
        setError('Failed to fetch host details.');
      }
    };

    fetchData();
  }, []);

  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await hostapiClient.patch(`${LOCALHOST_URL}/host/editprofile`, formData);
      if (response.data.message === "Not updated") {
        toast.error("Host details not updated")
      } else if (response.data.message === "Host details updated") {
        setSuccess(true)
        toast.success("Host details updated")
        navigate("/host/profile")
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
          <h2 className="text-2xl font-bold">Edit Host Profile</h2>
          <p className="text-gray-500">Update your host information</p>
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
              Host Name
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
                placeholder="Business or Host Name"
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

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/host/profile')}
              className="py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring focus:ring-indigo-200"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className={`py-2 px-6 text-white font-bold rounded-md ${
                isSubmitting || !formData.name || !isValidMobile
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-600'
              }`}
              disabled={isSubmitting || !formData.name || !isValidMobile}
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
          </div>
        </form>
      </div>
    </div>
  );
};

export default HostEditProfileBody;