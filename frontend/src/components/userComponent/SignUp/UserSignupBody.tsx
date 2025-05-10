import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import * as Yup from 'yup';

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

    const signupValidationSchema = Yup.object().shape({
        name: Yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
        email: Yup.string().email('Invalid email').required('Email is required'),
        password: Yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
        mobile: Yup.string()
            .matches(/^\d{10}$/, 'Mobile number must be 10 digits')
            .required('Mobile number is required'),
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormValues({ ...formValues, [name]: value });
        setErrors({ ...errors, [name]: '' }); // Clear the error for this field
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            // Validate form values using Yup
            await signupValidationSchema.validate(formValues, { abortEarly: false });

            // Clear errors if validation passes
            setErrors({});

            // Call API
            const res = await axios.post('http://localhost:4000/user/signup', formValues);
            console.log(res,'hello')
            if (res.data.message === 'Otp sent successfully') {
                navigate('/user/otp', {
                    state: { email: formValues.email, name: formValues.name, password: formValues.password, mobile: formValues.mobile },
                });
            } else if (res.data.message === 'User already exists') {
                toast.error('Email already exist', { style: { backgroundColor: '#FFFFFF', color: '#31AFEF' } });
            }
        } catch (err) {
            if (err instanceof Yup.ValidationError) {
                // Handle Yup validation errors
                const newErrors: Partial<SignupValues> = {};
                err.inner.forEach((error) => {
                    if (error.path) newErrors[error.path as keyof SignupValues] = error.message;
                });
                setErrors(newErrors);
            } else {
                // Handle other errors (e.g., API errors)
                toast.error('An error occurred', { style: { backgroundColor: '#FFFFFF', color: '#31AFEF' } });
                console.error(err);
            }
        }
    };

    return (
        <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4">
            <div className="flex flex-col md:flex-row max-w-4xl w-full shadow-xl rounded-xl overflow-hidden">
                {/* Left Panel - Image Space */}
                <div className="w-full md:w-5/12 relative h-48 md:h-auto">
                    <img
                        src="/api/placeholder/600/800"
                        alt="Signup"
                        className="w-full h-full object-cover"
                    />
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
                                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
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
                                        type="email"
                                        name="email"
                                        value={formValues.email}
                                        onChange={handleChange}
                                        placeholder="Enter your email"
                                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
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
                                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
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
                                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
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
