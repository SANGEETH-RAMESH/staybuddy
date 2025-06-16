// import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { loginSuccess } from '../../../redux/hostAuthSlice';
// import { Field, } from 'formik';
// import { signInValidation } from '../../../validations/commonValidations';
import { LoginValues } from '../../../interface/Login';
import { useState } from 'react';

// interface LoginFormValues {
//     email: string;
//     password: string;
// }

const HostLoginBody = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [errors,setErrors] = useState<Partial<LoginValues>>({});
    const [formValues, setFormValues] = useState<LoginValues>({
            email: '',
            password: '',
        });
    


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const { name, value } = e.target;
    
            setFormValues(prev => ({ ...prev, [name]: value }));
            setErrors(prev => {
                const updated = { ...prev };
                delete updated[name as keyof LoginValues];
                return updated;
            });
    
            // setValidFields(prev => ({
            //     ...prev,
            //     [name as keyof LoginValues]: value.trim() !== ""
            // }));
        };

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
         e.preventDefault();
        try {
            const response = await axios.post('http://localhost:4000/host/verifylogin', { ...formValues});
            console.log(response.data.message, 'hello')
            if (response.data.message === 'Invalid password') {
                // toast.error('Invalid password', { style: { backgroundColor: '#FFFFFF', color: "#31AFEF" } });
                setErrors((prev)=>({
                    ...prev,
                    password:"Invalid password"
                }))
            } else if (response.data.message === 'Invalid email') {
                // toast.error('Invalid email', { style: { backgroundColor: '#FFFFFF', color: "#31AFEF" } });
                setErrors((prev)=>({
                    ...prev,
                    email:"Invalid email"
                }))
            } else if (response.data.message === 'Host is blocked') {
                toast.error("You are blocked", { style: { backgroundColor: '#FFFFFF', color: "#31AFEF" } });
            } else {
                dispatch(loginSuccess({
                    accessToken: response.data.accessToken,
                    refreshToken: response.data.refreshToken,
                    isLoggedIn: true
                }));
                toast.success("Login Successful", { position: "top-center", style: { backgroundColor: '#FFFFFF', color: '#31AFEF' } });
                navigate('/host/home');
            }
        } catch (error) {
            const axiosError = error as any;

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
        <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4">
            <div className="flex flex-col md:flex-row max-w-4xl w-full shadow-xl rounded-xl overflow-hidden">
                {/* Left Panel - Image Space */}
                <div className="w-full md:w-5/12 relative h-48 md:h-auto">
                    {/* <img 
                        src="/api/placeholder/600/800" 
                        alt="Login" 
                        className="w-full h-full object-cover"
                    /> */}
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/80 to-emerald-600/80 flex flex-col items-center justify-center p-6 text-white">
                        <h2 className="text-2xl font-bold mb-2">Welcome Host!</h2>
                        <p className="text-sm text-center mb-4 text-white/90">Manage your rooms with ease<br />and grow your business</p>
                        <button
                            onClick={() => navigate('/host/signup')}
                            className="px-6 py-2 border-2 border-white rounded-full text-sm font-semibold hover:bg-white hover:text-emerald-800 transition-all duration-300"
                        >
                            Create Account
                        </button>
                    </div>
                </div>

                {/* Right Panel - Login Form */}
                <div className="w-full md:w-7/12 bg-white p-6 flex flex-col justify-center">
                    <div className="max-w-sm mx-auto w-full">
                        <h1 className="text-2xl font-bold text-gray-800 mb-6">Host Sign In</h1>

                       
                           
                                <form className="space-y-4" onSubmit={handleLogin}>
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
                                                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                            />
                                        </div>
                                        {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
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
                                                placeholder="Enter your password"
                                                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                            />
                                        </div>
                                        {errors.password && <div className="text-red-500 text-xs mt-1">{errors.password}</div>}
                                    </div>

                                    <div className="flex justify-end">
                                        <a href="/host/forgotpassword" className="text-xs text-emerald-600 hover:text-emerald-800 font-medium">
                                            Forgot Password?
                                        </a>
                                    </div>

                                    {/* Login Button */}
                                    <button
                                        type="submit"
                                        className="w-full bg-emerald-600 text-white py-2 rounded-lg font-semibold hover:text-emerald-800 transition-colors flex items-center justify-center gap-2 group text-sm"
                                    >
                                        Sign In
                                        <ArrowRight className="group-hover:translate-x-1 transition-transform" size={16} />
                                    </button>

                                    {/* Divider */}
                                    <div className="relative my-6">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-200"></div>
                                        </div>
                                        <div className="relative flex justify-center">
                                            <span className="bg-white px-4 text-xs text-gray-500">Or continue with</span>
                                        </div>
                                    </div>

                                    {/* Google Sign In */}
                                    <a
                                        href="http://localhost:4000/host/auth/google"
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                                            <path
                                                fill="#4285F4"
                                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            />
                                            <path
                                                fill="#34A853"
                                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            />
                                            <path
                                                fill="#FBBC05"
                                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            />
                                            <path
                                                fill="#EA4335"
                                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            />
                                        </svg>
                                        <span className="text-gray-600 text-sm font-medium">Sign in with Google</span>
                                    </a>
                                </form>
                           
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HostLoginBody;
