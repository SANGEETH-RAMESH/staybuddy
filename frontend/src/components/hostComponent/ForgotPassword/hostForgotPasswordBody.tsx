import React, { useState } from 'react';
import exclamation_mark from '../../../assets/danger.png';
import email from '../../../assets/email.png';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const HostForgotPasswordBody = () => {
    const [emailInput, setEmailInput] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (emailInput.trim() === '') {
            alert('Please enter an email address.');
            return;
        }

        sendPasswordResetLink(emailInput);
    };

    const sendPasswordResetLink = async (email: string) => {
        try {
            const response = await axios.post('http://localhost:4000/host/forgotpassword', { email });
            if (response.data.message === 'Host found') {
                navigate('/host/forgotpasswordotp', { state: { email } });
            } else if (response.data.message === 'Host not found') {
                toast.error('Incorrect email');
            }
        } catch (error) {
            toast.error('An error occurred. Please try again.');
            console.log(error)
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
                        <img
                            src={exclamation_mark}
                            alt="Exclamation Mark"
                            className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3"
                        />
                        <h2 className="text-xl font-bold mb-2">Forgot Password</h2>
                        <p className="text-gray-500 text-sm md:text-base">
                            Enter your email and we'll send you a link to reset your password
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
                                type="email"
                                placeholder="host@example.com"
                                value={emailInput}
                                onChange={(e) => setEmailInput(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg pl-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-emerald-500 text-white py-2 rounded-lg font-semibold hover:bg-emerald-600 transition"
                        >
                            SUBMIT
                        </button>
                    </form>

                    <div className="text-center mt-4">
                        <a href="/host/login" className="text-[#ACABAB] hover:underline text-sm md:text-base">
                            Back to Login
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HostForgotPasswordBody;