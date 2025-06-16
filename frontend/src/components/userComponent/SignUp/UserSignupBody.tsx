import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

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
    const [validFields, setValidFields] = useState<Partial<Record<keyof SignupValues, boolean>>>({});
    const navigate = useNavigate();

    // const validateName = (name: string): string | null => {
    //     const trimmed = name.trim();

    //     if (!trimmed) {
    //         return 'Name is required';
    //     }
    //     if (trimmed.length < 2) {
    //         return 'Name must be at least 2 characters';
    //     }
    //     // Regex: Only letters and single spaces between words
    //     // ^[A-Za-z]+( [A-Za-z]+)*$ means:
    //     // Starts with letters, then zero or more groups of (single space + letters)
    //     const validNameRegex = /^[A-Za-z]+( [A-Za-z]+)*$/;

    //     if (!validNameRegex.test(trimmed)) {
    //         return 'Name can only contain letters and single spaces between words';
    //     }
    //     return null;
    // };
    // const validateEmail = (email: string): string | null => {
    //     if (!email.trim()) {
    //         return 'Email is required';
    //     }
    //     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    //     if (!emailRegex.test(email)) {
    //         return 'Invalid email';
    //     }
    //     return null;
    // };

    // const validatePassword = (password: string): string | null => {
    //     if (!password) {
    //         return 'Password is required';
    //     }
    //     if (password.length < 6) {
    //         return 'Password must be at least 6 characters';
    //     }
    //     return null;
    // };

    // const validateMobile = (mobile: string): string | null => {
    //     if (!mobile.trim()) {
    //         return 'Mobile number is required';
    //     }

    //     // Check if mobile number is exactly 10 digits
    //     const mobileRegex = /^\d{10}$/;
    //     if (!mobileRegex.test(mobile)) {
    //         return 'Mobile number must be exactly 10 digits';
    //     }

    //     // Check if first digit is greater than 5
    //     const firstDigit = parseInt(mobile[0], 10);
    //     if (firstDigit <= 5) {
    //         return 'First digit must be greater than 5';
    //     }

    //     // Check if mobile number has at most five 0s
    //     const zeroCount = (mobile.match(/0/g) || []).length;
    //     if (zeroCount > 5) {
    //         return 'Mobile number can have at most five 0s';
    //     }

    //     return null;
    // };

    // const validateForm = (values: SignupValues): Partial<SignupValues> => {
    //     const validationErrors: Partial<SignupValues> = {};

    //     const nameError = validateName(values.name);
    //     if (nameError) validationErrors.name = nameError;

    //     const emailError = validateEmail(values.email);
    //     if (emailError) validationErrors.email = emailError;

    //     const passwordError = validatePassword(values.password);
    //     if (passwordError) validationErrors.password = passwordError;

    //     const mobileError = validateMobile(values.mobile);
    //     if (mobileError) validationErrors.mobile = mobileError;

    //     return validationErrors;
    // };

    // Helper function to get input className based on validation state
    // const getInputClassName = (fieldName: keyof SignupValues) => {
    //     const baseClass = "w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all text-sm";

    //     if (errors[fieldName]) {
    //         return `${baseClass} border-red-300 focus:ring-red-500 bg-red-50`;
    //     } else if (validFields[fieldName]) {
    //         return `${baseClass} border-green-300 focus:ring-green-500 bg-green-50`;
    //     } else {
    //         return `${baseClass} border-gray-300 focus:ring-blue-500`;
    //     }
    // };

     const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const { name, value } = e.target;
    
            setFormValues(prev => ({ ...prev, [name]: value }));
    
            setErrors(prev => {
                const updated = { ...prev };
                delete updated[name as keyof SignupValues];
                return updated;
            });
    
            // setValidFields(prev => ({
            //     ...prev,
            //     [name as keyof SignupValues]: value.trim() !== ""
            // }));
        };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            // // Validate form values using JavaScript validation
            // const validationErrors = validateForm(formValues);

            // if (Object.keys(validationErrors).length > 0) {
            //     setErrors(validationErrors);
            //     return;
            // }

            // // Clear errors if validation passes
            // setErrors({});

            // Call API
            const res = await axios.post('http://localhost:4000/user/signup', formValues);
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