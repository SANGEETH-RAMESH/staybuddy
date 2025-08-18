import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { loginSuccess } from '../../../redux/userAuthSlice';
import { LoginValues } from '../../../interface/Login';
import { googleLogin, loginUrl } from '../../../services/userServices';
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google"

const UserLoginBody = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [formValues, setFormValues] = useState<LoginValues>({
        email: '',
        password: '',
    });

    const [showPassword, setShowPassword] = useState(false);

    const [errors, setErrors] = useState<Partial<LoginValues>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormValues(prev => ({ ...prev, [name]: value }));

        setErrors(prev => {
            const updated = { ...prev };
            delete updated[name as keyof LoginValues];
            return updated;
        });
    };

    const handleGoogleLogin = async (credentialResponse: any) => {
        // console.log("hety",credentialResponse.credential)
        try {
            const response = await googleLogin(credentialResponse.credential);
            console.log(response.data, 'Response')
            const { message, accessToken, refreshToken, role } = response.data
            if (message === 'User Already Exist' || message === 'User Created') {
                dispatch(loginSuccess({
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                    role: role,
                    isLoggedIn: true
                }));
                navigate('/')
                toast.success("Login Successful", { style: { backgroundColor: '#FFFFFF', color: '#31AFEF' } });
            } else {
                toast.error("Unexpected response from server");
            }
        } catch (error: any) {
            console.error("Google login error:", error);
            toast.error("Login failed. Please try again later.");
        }



    }

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            console.log(import.meta.env.VITE_GOOGLE_CLIENT_ID);
            const response = await loginUrl({ ...formValues })
            console.log(response.data.message, 'response');

            const { message, accessToken, refreshToken, role } = response.data.message;
            console.log(message, "MEssage")

            if (response.data?.message?.message === 'Invalid password') {

                setErrors((prev) => ({
                    ...prev,
                    password: 'Invalid password'
                }))
            } else if (response.data?.message?.message === 'Invalid email') {

                setErrors((prev) => ({
                    ...prev,
                    email: 'Invalid email'
                }))
            } else if (response.data?.message?.message === 'User is blocked') {
                toast.error("User is blocked", { style: { backgroundColor: '#FFFFFF', color: "#31AFEF" } });
            } else if (response.data?.message?.message == undefined) {
                toast.error("Invalid credentials", { style: { backgroundColor: '#FFFFFF', color: "#31AFEF" } });
            } else if (accessToken && refreshToken) {
                dispatch(loginSuccess({
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                    role: role,
                    isLoggedIn: true
                }));
                toast.success("Login Successful", { style: { backgroundColor: '#FFFFFF', color: '#31AFEF' } });
                navigate('/');
            } else {
                toast.error("Unexpected error occurred", { style: { backgroundColor: '#FFFFFF', color: "#31AFEF" } });
            }
        } catch (error: unknown) {
            const axiosError = error as any;
            console.log(axiosError.response.data, "Heyyy")
            if (axiosError.response) {
                const { message, errors } = axiosError.response.data;
                console.log(message.message, "heyyyy")
                if (message.message == 'Invalid password') {
                    console.log('sangee')
                    setErrors((prev) => ({
                        ...prev,
                        password: 'Invalid password'
                    }))
                    return;
                } else if (message.message == "Invalid email") {
                    setErrors((prev) => ({
                        ...prev,
                        email: 'Invalid email'
                    }));
                    return;
                }
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
                <div className="w-full md:w-5/12 relative h-48 md:h-auto">
                    {/* <img
                        src="/api/placeholder/600/800"
                        alt="Login"
                        className="w-full h-full object-cover"
                    /> */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/80 to-blue-600/80 flex flex-col items-center justify-center p-6 text-white">
                        <h2 className="text-2xl font-bold mb-2">Welcome Back!</h2>
                        <p className="text-sm text-center mb-4 text-white/90">Find your perfect stay with StayBuddy</p>
                        <button
                            onClick={() => navigate('/signup')}
                            className="px-6 py-2 border-2 border-white rounded-full text-sm font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300"
                        >
                            Create Account
                        </button>
                    </div>
                </div>

                {/* Right Panel - Login Form */}
                <div className="w-full md:w-7/12 bg-white p-6 flex flex-col justify-center">
                    <div className="max-w-sm mx-auto w-full">
                        <h1 className="text-2xl font-bold text-gray-800 mb-6">Sign In</h1>

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
                                        className="w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all text-sm"
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
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formValues.password}
                                        onChange={handleChange}
                                        placeholder="Enter your password"
                                        className="w-full pl-9 pr-10 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all text-sm"
                                    />
                                    <div
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </div>
                                </div>
                                {errors.password && (
                                    <div className="text-red-500 text-xs mt-1">{errors.password}</div>
                                )}
                            </div>

                            <div className="flex justify-end">
                                <a href="/forgotpassword" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                                    Forgot Password?
                                </a>
                            </div>

                            {/* Login Button */}
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 group text-sm"
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

                            {/* Google Sign In
                            <a
                                href={`${apiUrl}/user/auth/google`}
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
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 1.54 14.97 0 12 0 7.7 0 3.99 2.47 2.18 5.77l2.85 2.2c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                <span className="text-sm font-medium text-gray-800">Sign in with Google</span>
                            </a> */}
                            <div className="flex justify-center">
                                <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID as string}>
                                    <div className="w-full max-w-sm">
                                        <GoogleLogin
                                            onSuccess={handleGoogleLogin}
                                            onError={() => toast.error("Login failed")}
                                            useOneTap
                                            type="standard"
                                            theme="outline"
                                            size="large"
                                            text="continue_with"
                                            shape="rectangular"
                                            width="100%"
                                        />
                                    </div>
                                </GoogleOAuthProvider>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserLoginBody;