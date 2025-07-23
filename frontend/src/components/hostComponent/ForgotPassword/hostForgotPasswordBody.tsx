import React, { useState } from 'react';
import exclamation_mark from '../../../assets/danger.png';
import emailIcon from '../../../assets/email.png';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { forgotPasswordValues } from '../../../interface/forgotPassword';
const apiUrl = import.meta.env.VITE_BACKEND_URL;

const HostForgotPasswordBody = () => {
    const [emailInput, setEmailInput] = useState('');
    const navigate = useNavigate();
    const [errors, setErrors] = useState<Partial<forgotPasswordValues>>({});

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response = await axios.post(`${apiUrl}/host/forgotpassword`, { email: emailInput });
            console.log("Res",response.data.message)
            if (response.data.message === 'Host found') {
                navigate('/host/forgotpasswordotp', { state: { email:emailInput } });
            } else if (response.data.message === 'Host not found') {
                toast.error('Incorrect email');
            }
        } catch (error) {
            const axiosError = error as any;
            console.log(axiosError.response.data, 'hee')
            if (axiosError.response) {
                const { message, errors } = axiosError.response.data;

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
        }
    };

    return (
        <div className="min-h-screen flex flex-col w-full">
            {/* Header - Enhanced responsive design */}
            <div className="bg-emerald-600 py-2 sm:py-3 md:py-4 px-3 sm:px-4 md:px-6">
                <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-white">
                    StayBuddy - Host
                </div>
            </div>

            {/* Main Content - Improved responsive layout */}
            <div className="flex-grow bg-[#EEEEEE] flex items-center justify-center px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg bg-white shadow-lg rounded-lg p-4 sm:p-5 md:p-6 lg:p-8">
                    {/* Header Section - Responsive spacing and sizing */}
                    <div className="text-center mb-4 sm:mb-5 md:mb-6">
                        <img
                            src={exclamation_mark}
                            alt="Exclamation Mark"
                            className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 mx-auto mb-2 sm:mb-3"
                        />
                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2 text-gray-800">
                            Forgot Password
                        </h2>
                        <p className="text-gray-500 text-xs sm:text-sm md:text-base lg:text-lg px-2 sm:px-0">
                            Enter your email and we'll send you a link to reset your password
                        </p>
                    </div>

                    {/* Form - Enhanced responsive form design */}
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                        <div className="relative mb-6">
                            <img
                                src={emailIcon}
                                alt="Email Icon"
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 z-10"
                            />
                            <input
                                type="text"
                                placeholder="host@example.com"
                                value={emailInput}
                                onChange={(e) => setEmailInput(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg pl-9 sm:pl-10 pr-3 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                            />
                            {errors.email && (
                                <div className="absolute left-0 top-full mt-1 text-red-500 text-xs sm:text-sm px-1">
                                    {errors.email}
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-emerald-500 text-white py-2 sm:py-2.5 md:py-3 rounded-lg font-semibold text-sm sm:text-base md:text-lg hover:bg-emerald-600 active:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            SUBMIT
                        </button>
                    </form>

                    {/* Back to Login Link - Responsive text sizing */}
                    <div className="text-center mt-4 sm:mt-5 md:mt-6">
                        <a 
                            href="/host/login" 
                            className="text-[#ACABAB] hover:text-gray-600 hover:underline text-xs sm:text-sm md:text-base transition-colors duration-200 inline-block py-1"
                        >
                            Back to Login
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HostForgotPasswordBody;