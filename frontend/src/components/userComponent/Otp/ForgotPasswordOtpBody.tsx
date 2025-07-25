import  { useState, useEffect } from "react";
import OTPInput from "react-otp-input";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { forgotPasswordOtp, resendOtp } from "../../../services/userServices";

const ForgotPasswordOtpBody = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(59);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    let countdown:  ReturnType<typeof setTimeout>;
    if (timer > 0) {
      countdown = setTimeout(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(countdown);
  }, [timer]);

  const handleSubmit = async () => {
    const numericOtp = Number(otp);
    
    setError("");
    
    if (otp.length === 4) {
      setLoading(true);
      try {
        const response = await forgotPasswordOtp({
          email,
          otp:numericOtp
        });
        console.log(response.data.message, "sd");
        if (response.data.message === "success") {
          toast.success("OTP verified successfully!");
          navigate('/resetpassword', { state: { email } });
        } else if (response.data.message == 'Invalid OTP') {
          toast.error("Invalid OTP. Please try again!");
        } else {
          toast.error("Not verified");
        }
      } catch (error) {
        console.error("Error verifying OTP:", error);
        toast.error("An error occurred while verifying OTP.");
      } finally {
        setLoading(false);
      }
    } else {
      setError("Please enter a valid 4-digit OTP.");
    }
  };

  const handleResendOtp = async () => {
    setCanResend(false);
    setTimer(59);

    try {
      const response = await resendOtp({email})
      console.log(response.data.message, "response");
      toast.success("OTP resent successfully!");
    } catch (error) {
      console.error("Error resending OTP:", error);
      toast.error("Failed to resend OTP. Please try again.");
    }
  };

  const handleOtpChange = (value: string) => {
    setOtp(value);
    if (error) {
      setError("");
    }
  };

  return (
    <div>
      <div className="h-screen w-full relative">
        <div className="h-[50%] bg-[#31AFEF]"></div>
        <div className="h-[50%] bg-[#EEEEEE]"></div>
      </div>

      <div className="absolute top-[50px] left-[100px] text-[35px] font-bold text-white">
        StayBuddy
      </div>

      <div className="absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[400px] bg-white shadow-lg rounded-lg p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold mb-2">Forgot Password Verification</h2>
          <p className="text-gray-500">
            Enter the 4-digit verification code sent to your email
          </p>
        </div>

        <div className="mb-6">
          <OTPInput
            value={otp}
            onChange={handleOtpChange}
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
          
          {/* Error message display */}
          {error && (
            <div className="mt-3 text-red-500 text-sm text-center">
              {error}
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-[#31AFEF] text-white py-2 rounded-lg font-semibold hover:bg-[#2499ce] transition"
          disabled={loading}
        >
          {loading ? "Verifying..." : "SUBMIT"}
        </button>

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

export default ForgotPasswordOtpBody;