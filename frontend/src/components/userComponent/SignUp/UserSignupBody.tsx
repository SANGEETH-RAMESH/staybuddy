import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
const apiUrl = import.meta.env.VITE_LOCALHOST_URL;

interface SignupValues {
    name: string;
    email: string;
    password: string;
    mobile: string;
}



const UserSignUpBody = () => {
    const [formValues, setFormValues] = useState<SignupValues>({
        name: '',
        email: '',
        password: '',
        mobile: '',
    });

    const [errors, setErrors] = useState<Partial<SignupValues>>({});

    const navigate = useNavigate();


     const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const { name, value } = e.target;
    
            setFormValues(prev => ({ ...prev, [name]: value }));
    
            setErrors(prev => {
                const updated = { ...prev };
                delete updated[name as keyof SignupValues];
                return updated;
            });

        };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
           
            const res = await axios.post(`${apiUrl}/user/signup`, formValues);
            console.log(res, 'hello');
            const {message} = res.data;

            if (message === 'Otp sent successfully') {
                navigate('/user/otp', {
                    state: {
                        email: formValues.email,
                        name: formValues.name,
                        password: formValues.password,
                        mobile: formValues.mobile
                    },
                });
            } else if (message === 'User already exists') {
                toast.error('Email already exist', {
                    style: { backgroundColor: '#FFFFFF', color: '#31AFEF' }
                });
            }
        } catch (error:unknown) {
           const axiosError = error as any;

            if (axiosError.response) {
                const { message, errors } = axiosError.response.data;
                console.log('catch',message,errors)
                if (errors) {
                    setErrors(errors); 
                    return;
                }

                toast.error(message || "Sigup failed", {
                    style: { backgroundColor: '#FFFFFF', color: "#31AFEF" }
                });
            } else {
                toast.error("An unexpected error occurred", {
                    style: { backgroundColor: '#FFFFFF', color: "#31AFEF" }
                });
            }

            console.error("Sigup error:", error);
        }
    };

    return (
        <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4">
            <div className="flex flex-col md:flex-row max-w-4xl w-full shadow-xl rounded-xl overflow-hidden">
                <div className="w-full md:w-5/12 relative h-48 md:h-auto">
                    {/* <img
                        src="/api/placeholder/600/800"
                        alt="Signup"
                        className="w-full h-full object-cover"
                    /> */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/80 to-blue-600/80 flex flex-col items-center justify-center p-6 text-white">
                        <h2 className="text-2xl font-bold mb-2">Welcome to StayBuddy!</h2>
                        <p className="text-sm text-center mb-4 text-white/90">Already have an account?</p>
                        <button
                            onClick={() => navigate('/user/login')}
                            className="px-6 py-2 border-2 border-white rounded-full text-sm font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300"
                        >
                            Sign In
                        </button>
                    </div>
                </div>

                {/* Right Panel - Signup Form */}
                <div className="w-full md:w-7/12 bg-white p-6 flex flex-col justify-center">
                    <div className="max-w-sm mx-auto w-full">
                        <h1 className="text-2xl font-bold text-gray-800 mb-6">Create Account</h1>

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            {/* Name Input */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formValues.name}
                                        onChange={handleChange}
                                        placeholder="Enter your full name"
                                        className='w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all text-sm'
                                    />
                                </div>
                                {errors.name && <div className="text-red-500 text-xs">{errors.name}</div>}
                            </div>

                            {/* Email Input */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        name="email"
                                        value={formValues.email}
                                        onChange={handleChange}
                                        placeholder="Enter your email"
                                        className='w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all text-sm'
                                    />
                                </div>
                                {errors.email && <div className="text-red-500 text-xs">{errors.email}</div>}
                            </div>

                            {/* Password Input */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="password"
                                        name="password"
                                        value={formValues.password}
                                        onChange={handleChange}
                                        placeholder="Create a password"
                                        className='w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all text-sm'
                                    />
                                </div>
                                {errors.password && <div className="text-red-500 text-xs">{errors.password}</div>}
                            </div>

                            {/* Mobile Input */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Mobile Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="tel"
                                        name="mobile"
                                        value={formValues.mobile}
                                        onChange={handleChange}
                                        placeholder="Enter your mobile number"
                                        className='w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all text-sm'
                                    />
                                </div>
                                {errors.mobile && <div className="text-red-500 text-xs">{errors.mobile}</div>}
                            </div>

                            {/* Signup Button */}
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 group text-sm"
                            >
                                Create Account
                                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={16} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserSignUpBody;