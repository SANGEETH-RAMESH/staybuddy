import React, { useState } from "react";
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
          `${apiUrl}/user/resetPassword`,
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
    <div>
  <div className="h-[580px] w-[1360px] relative">
    <div className="h-[250px] bg-[#31AFEF]"></div>
    <div className="h-[380px] bg-[#EEEEEE]"></div>
  </div>

  <div className="absolute top-[50px] left-[100px] text-[35px] font-bold text-white">
    StayBuddy
  </div>

  <div className="absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[400px] bg-white shadow-lg rounded-lg p-6">
    <div className="text-center mb-6">
      <h2 className="text-xl font-bold mb-2">Reset Password</h2>
      <p className="text-gray-500">Enter your new password below</p>
    </div>

    <div className="relative mb-4">
      <img
        src={lock_icon}
        alt="Lock Icon"
        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
      />
      <input
        type="password"
        placeholder="New Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border border-gray-300 rounded-lg pl-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#31AFEF]"
        required
      />
    </div>

    <div className="relative mb-6">
      <img
        src={lock_icon}
        alt="Lock Icon"
        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
      />
      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="w-full border border-gray-300 rounded-lg pl-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#31AFEF]"
        required
      />
    </div>

    <button
      onClick={handleSubmit}
      className="w-full bg-[#31AFEF] text-white py-2 rounded-lg font-semibold hover:bg-[#2499ce] transition"
      disabled={loading}
    >
      {loading ? "Resetting..." : "RESET PASSWORD"}
    </button>
  </div>
</div>

  );
};

export default ResetPasswordBody;
