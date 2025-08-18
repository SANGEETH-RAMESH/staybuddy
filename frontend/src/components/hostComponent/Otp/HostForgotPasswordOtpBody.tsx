import { useState, useEffect } from "react";
import OTPInput from "react-otp-input";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { OtpValues } from "../../../interface/Otp";
import { resendOtp, verifyForgotPasswordOtp } from "../../../services/hostServices";

const HostForgotPasswordOtpBody = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(59);
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Partial<OtpValues>>({});

  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");

  useEffect(() => {
    let countdown = null;
    if (timer > 0) {
      countdown = setTimeout(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => {
      if (countdown) clearTimeout(countdown);
    };
  }, [timer]);

  const handleSubmit = async () => {
    const numericOtp = Number(otp);
    setEmail(email)
      setLoading(true);
      try {
        const response = await verifyForgotPasswordOtp({email,otp:numericOtp})
        if (response.data.message === "success") {
          toast.success("OTP verified successfully!");
          navigate("/host/resetpassword", { state: { email } });
        } else if (response.data.message == 'Invalid otp') {
          setErrors((prev) => ({
            ...prev,
            otp: "Invalid otp"
          }))
        } else if (response.data.message == 'otp expired') {
          setErrors((prev) => ({
            ...prev,
            otp: "otp expired"
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

  const handleResendOtp = async () => {
    setCanResend(false);
    setTimer(59);

    try {
      const response = await resendOtp({email})
      console.log(response)
      toast.success("OTP resent successfully!");
    } catch (error) {
      console.error("Error resending OTP:", error);
      toast.error("Failed to resend OTP. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col w-full">
      {/* Header section */}
      <div className="bg-emerald-600 py-3 md:py-4 px-4 md:px-6">
        <div className="text-sm sm:text-lg lg:text-xl font-semibold text-white">
          StayBuddy - Host
        </div>
      </div>

      {/* Main content */}
      <div className="flex-grow bg-[#EEEEEE] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold mb-2">Forgot Password Verification</h2>
            <p className="text-gray-500 text-sm md:text-base">
              Enter the 4-digit verification code sent to your email
            </p>
          </div>

          <div className="mb-6">
            <OTPInput
              value={otp}
              onChange={setOtp}
              numInputs={4}
              renderSeparator={<span className="text-lg font-bold mx-2">-</span>}
              renderInput={(props) => (
                <input
                  {...props}
                  className="w-[70px] h-[50px] border border-gray-400 rounded-lg text-center text-2xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-[#D9D9D9]"
                  style={{ width: "70px", height: "70px" }}
                />
              )}
            />
            {errors.otp && <div className="text-red-500 text-xs mt-1">{errors.otp}</div>}
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-emerald-500 text-white py-2 rounded-lg font-semibold hover:bg-emerald-600 transition"
            disabled={loading}
          >
            {loading ? "Verifying..." : "SUBMIT"}
          </button>

          <div className="text-center mt-4">
            {canResend ? (
              <button
                onClick={handleResendOtp}
                className="text-blue-800 hover:underline ml-1 text-sm md:text-base"
              >
                Resend OTP
              </button>
            ) : (
              <p className="text-[#ACABAB] text-sm md:text-base">
                Resend OTP in <span className="font-bold">{timer}s</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostForgotPasswordOtpBody;