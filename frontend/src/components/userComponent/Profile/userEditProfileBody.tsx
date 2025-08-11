import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { User, Phone, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { editProfile, getUserDetails } from '../../../services/userServices';

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
  const [nameError, setNameError] = useState<string | null>(null);
  const [mobileError, setMobileError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // if (name === 'name') {
    //   const nameRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;;
    //   if (!nameRegex.test(value)) {
    //     setNameError('Name should only contain alphabets without spaces or special characters');
    //   } else {
    //     setNameError(null);
    //   }
    // }

    // if (name === 'mobile') {
    //   const digitOnly = /^[0-9]*$/;
    //   const zeroCount = (value.match(/0/g) || []).length;
    //   const startsWith = value[0];

    //   if (!digitOnly.test(value)) {
    //     setMobileError('Mobile number should contain only digits');
    //   } else if (value.length > 10) {
    //     setMobileError('Mobile number must be exactly 10 digits');
    //   } else if (value.length === 10 && +startsWith <= 5) {
    //     setMobileError('First digit must be greater than 5');
    //   } else if (zeroCount > 5) {
    //     setMobileError('Mobile number should not contain more than 5 zeros');
    //   } else if (value.length !== 10) {
    //     setMobileError('Mobile number must be 10 digits');
    //   } else {
    //     setMobileError(null);
    //   }
    // }

    setFormData((prev) => ({ ...prev, [name]: value }));
    setSuccess(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getUserDetails();
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await editProfile(formData);
      console.log(response.data.message, "Response");
      if (response.data.message == "Not updated") {
        toast.error("User details not updated")
      } else if (response.data.message == "User details updated" && response.status == 200) {
        setSuccess(true)
        toast.success("User details updated")
        navigate("/profile")
      }
    } catch (error) {
      const axiosError = error as any;
      console.log("Duii",axiosError.response)
      if (axiosError.response) {
        const { message, errors } = axiosError.response.data;
        console.log(message,"message",errors)
        console.log(errors?.name)
        if(errors.name == "Invalid name format" || errors.name == 'Name cannot be more than 15 characters'){
          console.log('keritund')
          setNameError(errors.name)
        }else{
          setMobileError(errors.mobile)
        }
        // if (errors) {
        //   setError(errors || 'Failed to update profile');

        //   return;
        // }

        toast.error(message || "Login failed", {
          style: { backgroundColor: '#FFFFFF', color: "#31AFEF" }
        });
      } else {
        toast.error("An unexpected error occurred", {
          style: { backgroundColor: '#FFFFFF', color: "#31AFEF" }
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
        {/* Back Button */}
        <div className="mb-4">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
        </div>

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
            {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
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
                placeholder="Enter you mobile"
              />
            </div>
            {mobileError && <p className="text-red-500 text-sm mt-1">{mobileError}</p>}
          </div>

          <button
            type="submit"
            className={`w-full py-2 text-white font-bold rounded-md ${isSubmitting ? 'bg-blue-300 cursor-not-allowed' : 'bg-[#31AFEF] hover:bg-blue-500'}`}
            
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