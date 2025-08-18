import React, { useState } from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../../../services/userServices';

const ChangePasswordBody = () => {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'currentPassword' || name === 'newPassword') {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }

    if (name === 'newPassword') {
      validatePassword(value);
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
    if (formData.newPassword === formData.confirmPassword) {
      try {
        const response = await changePassword(formData)
        console.log("Response",response.data.message)
        if (response.data.message === 'Current Password does not match') {
          setErrors((prev) => ({ ...prev, currentPassword: 'Current password does not match' }));
        } else if (response.data.message === 'New Password Cannot be Same as Current Password') {
          setErrors((prev) => ({ ...prev, newPassword: 'New Password cannot be same as current password' }));
        } else if (response.data.message === 'Password changed successfully') {
          toast.success("Password changed")
          navigate('/profile')
          console.log('Password changed successfully!');
        }
      } catch (error) {
        console.error('Error changing password:', error);
      }
    }
  };

  const requirements = validatePassword(formData.newPassword);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6 mt-16">
        <div className="text-2xl text-center mb-6 font-bold">Change Password</div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Password */}
          <div className="space-y-2">
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
            <div className="relative">
              <input
                type={showPassword.current ? "text" : "password"}
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                className="absolute right-2 top-2"
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
      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <button
      type="button"
      className="absolute right-2 top-2"
      onClick={() => setShowPassword((prev) => ({ ...prev, new: !prev.new }))}
    >
      {showPassword.new ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  </div>
  {/* Error message for "New Password" */}
  {errors.newPassword && (
    <span className="mt-2 text-red-600 text-sm">{errors.newPassword}</span>
  )}
  {/* Password Requirements */}
  <div className="space-y-2 mt-4 text-sm">
    {Object.entries(requirements).map(([key, met]) => (
      <div key={key} className="flex items-center gap-2">
        {met ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <X className="h-4 w-4 text-red-500" />
        )}
        <span className={met ? "text-green-700" : "text-red-700"}>
          {key === "length"
            ? "At least 8 characters"
            : key === "uppercase"
            ? "One uppercase letter"
            : key === "lowercase"
            ? "One lowercase letter"
            : key === "number"
            ? "One number"
            : "One special character"}
        </span>
      </div>
    ))}
  </div>
</div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <div className="relative">
              <input
                type={showPassword.confirm ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                className="absolute right-2 top-2"
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
            className="w-full py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700"
            disabled={
              !formData.currentPassword ||
              !Object.values(requirements).every(Boolean) ||
              formData.newPassword !== formData.confirmPassword
            }
          >
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordBody;
