import  { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import lock_icon from '../../../assets/lock.png'
const apiUrl = import.meta.env.VITE_LOCALHOST_URL;

const ResetPasswordBody = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  
  const handleSubmit = async () => {
    if (password === confirmPassword) {
      setLoading(true);
      try {
        const response = await axios.post(
          `${apiUrl}/user/auth/reset-password`,
          { email,password }
        );
        if (response.data.message === "Same password") {
          toast.error("Cannot use existing password")
        } else if (response.data.message === "Password Changed") {
          toast.success("Password changed successfully");
          navigate('/user/login')
        }
      } catch (error) {
        console.error("Error resetting password:", error);
        toast.error("An error occurred while resetting the password.");
      } finally {
        setLoading(false);
      }
    } else {
      toast.error("Passwords do not match. Please try again!");
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Background sections */}
      <div className="h-screen w-full relative">
        <div className="h-1/2 sm:h-64 md:h-72 lg:h-80 bg-[#31AFEF]"></div>
        <div className="h-1/2 sm:h-screen bg-[#EEEEEE]"></div>
      </div>

      {/* Logo */}
      <div className="absolute top-4 sm:top-6 md:top-8 lg:top-12 left-4 sm:left-6 md:left-8 lg:left-24 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white">
        StayBuddy
      </div>

      {/* Reset Password Form */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-11/12 sm:w-96 md:w-[400px] max-w-md bg-white shadow-lg rounded-lg p-4 sm:p-6 mx-4">
        <div className="text-center mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold mb-2">Reset Password</h2>
          <p className="text-sm sm:text-base text-gray-500">Enter your new password below</p>
        </div>

        <div className="relative mb-4">
          <img
            src={lock_icon}
            alt="Lock Icon"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
          />
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg pl-8 sm:pl-10 py-2 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#31AFEF]"
            required
          />
        </div>

        <div className="relative mb-4 sm:mb-6">
          <img
            src={lock_icon}
            alt="Lock Icon"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg pl-8 sm:pl-10 py-2 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#31AFEF]"
            required
          />
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-[#31AFEF] text-white py-2 sm:py-3 rounded-lg font-semibold hover:bg-[#2499ce] transition text-sm sm:text-base"
          disabled={loading}
        >
          {loading ? "Resetting..." : "RESET PASSWORD"}
        </button>
      </div>
    </div>
  );
};

export default ResetPasswordBody;