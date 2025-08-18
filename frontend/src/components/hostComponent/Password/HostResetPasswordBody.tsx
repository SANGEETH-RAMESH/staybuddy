import  { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { changePasswordValues } from "../../../interface/ChangePassword";
import { resetPassword } from "../../../services/hostServices";
const imageUrl = import.meta.env.VITE_CLOUDINARY_BASE_URL;
const lock_icon = `${imageUrl}/v1755417527/lock_prz3ad.png`

const HostResetPasswordBody = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const [errors, setErrors] = useState<Partial<changePasswordValues>>({});
  
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const timer = setTimeout(() => {
        setErrors({});
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [errors]);

  const handleSubmit = async () => {
      setLoading(true);
      try {
        const response = await resetPassword(email,password,confirmPassword)
        if (response.data.message === "Same password") {
          setErrors((prev)=>({
            ...prev,
            newPassword:"Cannot use existing password"
          }))
        } else if (response.data.message === "Password Changed") {
          toast.success("Password changed successfully");
          navigate("/host/login");
        }
      } catch (error) {
        const axiosError = error as any;
        console.log(axiosError.response.data, 'hee')
        if (axiosError.response) {
          const { message, errors } = axiosError.response.data;
          console.log(errors,'erros')
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
        setLoading(false);
      }
    
  };

  return (
    <div>
      <div className="bg-emerald-600 py-3 md:py-4 px-4 md:px-6">
        <div className="text-sm sm:text-lg lg:text-xl font-semibold text-white">
          StayBuddy - Host
        </div>
      </div>

      <div className="absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[400px] bg-white shadow-lg rounded-lg p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold mb-2">Reset Password</h2>
          <p className="text-gray-500">Enter your new password below</p>
        </div>

        {/* Fixed height container for password input */}
        <div className="mb-4 h-[60px]">
          <div className="relative">
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
          {/* Fixed height for error message */}
          <div className="h-5 mt-1">
            {errors.newPassword && (
              <div className="text-red-500 text-xs">{errors.newPassword}</div>
            )}
          </div>
        </div>

        {/* Fixed height container for confirm password input */}
        <div className="mb-6 h-[60px]">
          <div className="relative">
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
          {/* Fixed height for error message */}
          <div className="h-5 mt-1">
            {errors.confirmPassword && (
              <div className="text-red-500 text-xs">{errors.confirmPassword}</div>
            )}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-emerald-500 text-white py-2 rounded-lg font-semibold hover:bg-emerald-600 transition"
          disabled={loading}
        >
          {loading ? "Resetting..." : "RESET PASSWORD"}
        </button>
      </div>
    </div>
  );
};

export default HostResetPasswordBody;