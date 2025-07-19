import React, { useState } from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../../../services/hostServices';

const HostChangePasswordBody = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const validatePassword = (password:string) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*]/.test(password),
    };
    return requirements;
  };

  const handleChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'currentPassword' || name === 'newPassword') {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }

    if (name === 'confirmPassword') {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: value !== formData.newPassword ? 'Passwords do not match' : '',
      }));
    }
  };

  const navigate = useNavigate()

  const handleSubmit = async (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      
      const response = await changePassword(formData)
      console.log(response.data, "Response");
      
      if(response.data.message === 'Password Changed'){
        setSuccess(true);
        toast.success("Password Changed");
        navigate("/host/profile")
        // setFormData({
        //   currentPassword: '',
        //   newPassword: '',
        //   confirmPassword: '',
        // });
      } else if(response.data.message === 'New Password Cannot be Same as Current Password'){
        setErrors(prev => ({
          ...prev,
          newPassword: 'New password cannot be the same as your current password'
        }));
      } else if(response.data.message === 'Current Password does not match'){
        setErrors(prev => ({
          ...prev,
          currentPassword: 'Current password is incorrect'
        }));
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const requirements = validatePassword(formData.newPassword);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
        <div className="text-2xl text-center mb-6 font-bold text-gray-800">Host Account Password</div>
        
        {success ? (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Check className="h-5 w-5" />
              <span className="font-medium">Password changed successfully!</span>
            </div>
            <p className="text-sm">Your host account password has been updated.</p>
          </div>
        ) : null}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Password */}
          <div className="space-y-2">
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPassword.current ? "text" : "password"}
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword((prev) => ({ ...prev, current: !prev.current }))}
              >
                {showPassword.current ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.currentPassword && (
              <div className="mt-2 text-red-600 text-sm">{errors.currentPassword}</div>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword.new ? "text" : "password"}
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword((prev) => ({ ...prev, new: !prev.new }))}
              >
                {showPassword.new ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.newPassword && (
              <span className="mt-2 text-red-600 text-sm block">{errors.newPassword}</span>
            )}
            
            {/* Password Requirements */}
            <div className="space-y-1 mt-3 text-sm bg-gray-50 p-3 rounded-md">
              <p className="font-medium text-gray-700 mb-2">Password requirements:</p>
              {Object.entries(requirements).map(([key, met]) => (
                <div key={key} className="flex items-center gap-2">
                  {met ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-gray-400" />
                  )}
                  <span className={met ? "text-green-700" : "text-gray-600"}>
                    {key === "length"
                      ? "At least 8 characters"
                      : key === "uppercase"
                      ? "One uppercase letter"
                      : key === "lowercase"
                      ? "One lowercase letter"
                      : key === "number"
                      ? "One number"
                      : "One special character (!@#$%^&*)"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showPassword.confirm ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword((prev) => ({ ...prev, confirm: !prev.confirm }))}
              >
                {showPassword.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <div className="mt-2 text-red-600 text-sm">{errors.confirmPassword}</div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
            disabled={
              isSubmitting ||
              !formData.currentPassword ||
              !Object.values(requirements).every(Boolean) ||
              formData.newPassword !== formData.confirmPassword
            }
          >
            {isSubmitting ? "Processing..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default HostChangePasswordBody;