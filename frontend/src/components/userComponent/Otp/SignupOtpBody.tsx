import { useState, useEffect } from "react";
import OTPInput from "react-otp-input";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { OtpValues } from "../../../interface/Otp";

const SignupOtpBody = () => {
  const [otp, setOtp] = useState("");
  // const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(59); 
  const [canResend, setCanResend] = useState(false); 

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state.email;
  const name = location.state.name;
  const mobile = location.state.mobile;
  const password = location.state.password

  // useEffect(() => {
  //   const queryParams = new URLSearchParams(window.location.search);
  //   const emailFromUrl = queryParams.get("email");
  //   if (emailFromUrl) {
  //     setEmail(emailFromUrl);
  //   }
  // }, []);

  const [errors, setErrors] = useState<Partial<OtpValues>>({});

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


  const handleResendOtp = async () => {
    setCanResend(false);
    setTimer(59);
    try {
      const response = await axios.post("http://localhost:4000/user/resendotp", {
        email,
        password,
        mobile,
        name
      });
      console.log(response.data.message, 'response');
      toast.success("OTP resent successfully!");
    } catch (error) {
      console.error("Error resending OTP:", error);
      toast.error("Failed to resend OTP. Please try again.");
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      const numericOtp = Number(otp);
      console.log(email, otp, "Sdfdsfs");
      const response = await axios.post("http://localhost:4000/user/verifyotp", {
        email,
        otp: numericOtp,
      });
      console.log(response.data, "response");
      if (response.data.message === "success") {
        navigate("/user/login");
      } else if (response.data.message === "Invalid OTP") {
        setErrors((prev)=>({
          ...prev,
          otp:"Invalid OTP"
        }))
        // toast.error("Invalid OTP. Please try again!");
      } else if (response.data.message === "otp expired") {
        setErrors((prev)=>({
          ...prev,
          otp:'Otp expired'
        }))
        // toast.error("Otp expired", {
        //   style: { backgroundColor: "white", color: "blue" },
        //   icon: (
        //     <i
        //       className="fas fa-exclamation-circle"
        //       style={{ color: "blue" }}
        //     />
        //   ),
        //   progressStyle: { backgroundColor: "blue" },
        // });
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
      <div className="h-screen w-full relative">
        <div className="h-[50%] bg-[#31AFEF]"></div>
        <div className="h-[50%] bg-[#EEEEEE]"></div>
      </div>

      <div className="absolute top-[50px] left-[100px] text-[35px] font-bold text-white">
        StayBuddy
      </div>

      <div className="absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[400px] bg-white shadow-lg rounded-lg p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold mb-2">Signup Verification</h2>
          <p className="text-gray-500">
            Enter the 4-digit verification code sent to your email to complete
            your signup process.
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
                className="w-[70px] h-[50px] border border-gray-400 rounded-lg text-center text-2xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#D9D9D9]"
                style={{ width: "70px", height: "70px" }}
              />
            )}
          />
          {errors.otp && <div className="text-red-500 text-xs mt-1">{errors.otp}</div>}
        </div>

        <button
          onClick={handleVerifyOtp}
          className="w-full bg-[#31AFEF] text-white py-2 rounded-lg font-semibold hover:bg-[#2499ce] transition"
          disabled={loading}
        >
          {loading ? "Verifying..." : "VERIFY"}
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

export default SignupOtpBody;
