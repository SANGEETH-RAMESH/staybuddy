import React, { useState } from 'react';
import exclamation_mark from '../../../assets/danger.png';
import email from '../../../assets/email.png';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const HostForgotPasswordBody = () => {
    const [emailInput, setEmailInput] = useState('');

    const navigate = useNavigate();

    const handleSubmit = (e:any) => {
        e.preventDefault();
        if (emailInput.trim() === '') {
            alert('Please enter an email address.');
            return;
        }

        sendPasswordResetLink(emailInput);
    };

    const sendPasswordResetLink = async (email:string) => {
        try {
            const response = await axios.post('http://localhost:4000/host/forgotpassword', { email });
            if (response.data.message === 'Host found') {
                navigate('/host/forgotpasswordotp', { state: { email } });
            } else if (response.data.message === 'Host not found') {
                toast.error('Incorrect email');
            }
        } catch (error) {
            toast.error('An error occurred. Please try again.');
        }
    };

    return (
        <div className="h-[580px] w-[1360px] relative">
            <div className="h-[250px] bg-[#31AFEF]"></div>

            <div className="h-[380px] bg-[#EEEEEE]"></div>

            <div className="absolute top-[50px] left-[100px] text-[35px] font-bold text-white">
                StayBuddy - Host
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
                        Enter your email and we'll send you a link to reset your password
                    </p>
                </div>

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
                        className="w-full border border-gray-300 rounded-lg pl-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#31AFEF]"
                    />
                </div>

                <button
                    onClick={handleSubmit}
                    className="w-full bg-[#31AFEF] text-white py-2 rounded-lg font-semibold hover:bg-[#2499ce] transition"
                >
                    SUBMIT
                </button>

                <div className="text-center mt-4">
                    <a href="/host/login" className="text-[#ACABAB] hover:underline">
                        Back to Login
                    </a>
                </div>
            </div>
        </div>
    );
};

export default HostForgotPasswordBody;
