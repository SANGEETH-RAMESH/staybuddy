import React, { useState } from 'react';
import exclamation_mark from '../../../assets/danger.png';
import email from '../../../assets/email.png';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { forgotPasswordValues } from '../../../interface/forgotPassword';
const apiUrl = import.meta.env.VITE_BACKEND_URL;



const ForgotPasswordBody = () => {
    const navigate = useNavigate();
    const [emailValue, setEmailValue] = useState('');
    const [errors, setErrors] = useState<Partial<forgotPasswordValues>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);


    const handleSubmit = async (e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // setErrors('');
        setIsSubmitting(true);

        try {
            // Validate email using Yup
            // await validationSchema.validate({ email: emailValue });

            // Send API request
            const response = await axios.post(`${apiUrl}/user/auth/forgot-password`, {
                email: emailValue,
            });

            if (response.data.message === 'User found') {
                navigate('/user/forgotpasswordotp', {
                    state: { email: emailValue },
                });
            } else if (response.data.message === 'User not found') {
                setErrors((prev)=>({
                    ...prev,
                    email:'Incorrect email'}));
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
            setIsSubmitting(false);
        }
    };

    return (
        <div className="h-screen w-full relative">
            <div className="h-[50%] bg-[#31AFEF]"></div>
            <div className="h-[50%] bg-[#EEEEEE]"></div>

            <div className="absolute top-[50px] left-[100px] text-[35px] font-bold text-white">
                StayBuddy
            </div>

            <div className="absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[400px] bg-white shadow-lg rounded-lg p-6">
                <div className="text-center mb-6">
                    <img
                        src={exclamation_mark}
                        alt="Exclamation Mark"
                        className="w-20 h-20 mx-auto mb-3"
                    />
                    <h2 className="text-xl font-bold mb-2">Forgot Password</h2>
                    <p className="text-gray-500">
                        Enter an email and we'll send you a link to reset your password
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="relative mb-4">
                        <img
                            src={email}
                            alt="Email Icon"
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                        />
                        <input
                            type="text"
                            name="email"
                            placeholder="abc@gmail.com"
                            value={emailValue}
                            onChange={(e) => setEmailValue(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg pl-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#31AFEF]"
                        />
                    </div>

                    {errors.email && (
                        <div className="text-red-500 text-sm mt-1 ml-2">{errors.email}</div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-[#31AFEF] text-white py-2 rounded-lg font-semibold hover:bg-[#2499ce] transition"
                        disabled={isSubmitting}
                    >
                        SUBMIT
                    </button>
                </form>

                <div className="text-center mt-4">
                    <a href="/user/login" className="text-[#ACABAB] hover:underline">
                        Back to Login
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordBody;
