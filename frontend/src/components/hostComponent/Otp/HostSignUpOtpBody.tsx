import { useState, useEffect } from "react";
import OTPInput from "react-otp-input";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { OtpValues } from "../../../interface/Otp";
const apiUrl = import.meta.env.VITE_BACKEND_URL;

const HostSignUpOtpBody = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(59);
  const [canResend, setCanResend] = useState(false);
  const [errors,setErrors]  = useState<Partial<OtpValues>>({});
  const navigate = useNavigate();

  const location = useLocation();
  const email = location.state.email;
  const name = location.state.name;
  const mobile = location.state.mobile;
  const password = location.state.password

//   useEffect(() => {
//     const queryParams = new URLSearchParams(window.location.search);
//     const emailFromUrl = queryParams.get("email");
//     if (emailFromUrl) {
//       setEmail(emailFromUrl);
//     }
//   }, []);

  // Timer countdown for resending OTP
  useEffect(() => {
    let countdown: ReturnType<typeof setTimeout>;
    if (timer > 0) {
      countdown = setTimeout(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(countdown);
  }, [timer]);

  // Resend OTP
  const handleResendOtp = async () => {
    setCanResend(false);
    setTimer(59);
    try {
      const response = await axios.post(`${apiUrl}/host/resendotp`, {
        email,
        name,
        password,
        mobile
      });
      console.log(response.data.message, "response");
      toast.success("OTP resent successfully!");
    } catch (error) {
      console.error("Error resending OTP:", error);
      toast.error("Failed to resend OTP. Please try again.");
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      const numericOtp = Number(otp);
      const response = await axios.post("http://localhost:4000/host/verifyotp", {
        email,
        otp: numericOtp,
      });
      console.log(response.data.message, "response");
      if (response.data.message === "success") {
        navigate("/host/login");
      } else if (response.data.message === "Invalid otp") {
        setErrors((prev)=>({
          ...prev,
          otp:"Invalid OTP"
        }))
      } else if (response.data.message === "otp expired") {
        setErrors((prev)=>({
          ...prev,
          otp:"otp expired"
        }))
        
      }
    } catch (error) {
      const axiosError = error as any;

      if (axiosError.response) {
        const { message, errors } = axiosError.response.data;
        console.log('catch', message, errors)
        if (errors) {
          setErrors(errors);

          return;
        }

        toast.error(message || "Otp failed", {
          style: { backgroundColor: '#FFFFFF', color: "#31AFEF" }
        });
      } else {
        toast.error("An unexpected error occurred", {
          style: { backgroundColor: '#FFFFFF', color: "#31AFEF" }
        });
      }

      console.error("Otp error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="h-[580px] w-[1360px] relative">
        <div className="h-[250px] bg-emerald-500"></div>
        <div className="h-[380px] bg-[#EEEEEE]"></div>
      </div>

      <div className="absolute top-[50px] left-[100px] text-[35px] font-bold text-white">
        StayBuddy Host
      </div>

      <div className="absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[400px] bg-white shadow-lg rounded-lg p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold mb-2">Host Signup Verification</h2>
          <p className="text-gray-500">
            Enter the 4-digit verification code sent to your email to complete
            your signup process as a host.
          </p>
        </div>

        {/* OTP Input */}
        <div className="mb-6">
          <OTPInput
            value={otp}
            onChange={setOtp}
            numInputs={4}
            renderSeparator={<span className="text-lg font-bold mx-2">-</span>}
            renderInput={(props) => (
              <input
                {...props}
                className="w-[70px] h-[50px] border border-gray-400 rounded-lg text-center text-2xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#D9D9D9]"
                style={{ width: "70px", height: "70px" }}
              />
            )}
          />
          {errors.otp && <div className="text-red-500 text-xs mt-1">{errors.otp}</div>}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleVerifyOtp}
          className="w-full bg-emerald-500 text-white py-2 rounded-lg font-semibold hover:bg-emerald-600 transition"
          disabled={loading}
        >
          {loading ? "Verifying..." : "VERIFY"}
        </button>

        {/* Timer or Resend OTP */}
        <div className="text-center mt-4">
          {canResend ? (
            <button
              onClick={handleResendOtp}
              className="text-blue-800 hover:underline ml-1"
            >
              Resend OTP
            </button>
          ) : (
            <p className="text-[#ACABAB]">
              Resend OTP in <span className="font-bold">{timer}s</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HostSignUpOtpBody;
