import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Mail, Lock, ArrowRight, EyeOff, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { loginSuccess } from '../../../redux/hostAuthSlice';
import { LoginValues } from '../../../interface/Login';
import { useState } from 'react';
import { googleLogin, loginUrl } from '../../../services/hostServices';
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google"

const HostLoginBody = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [errors, setErrors] = useState<Partial<LoginValues>>({});
    const [formValues, setFormValues] = useState<LoginValues>({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);



    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormValues(prev => ({ ...prev, [name]: value }));
        setErrors(prev => {
            const updated = { ...prev };
            delete updated[name as keyof LoginValues];
            return updated;
        });


    };

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await loginUrl({ ...formValues })
            console.log(response.data, 'hello')
            if (response.data.message === 'Invalid password') {
                setErrors((prev) => ({
                    ...prev,
                    password: "Invalid password"
                }))
            } else if (response.data.message === 'Invalid email') {
                setErrors((prev) => ({
                    ...prev,
                    email: "Invalid email"
                }))
            } else if (response.data.message === 'Host is blocked') {
                toast.error("You are blocked", { style: { backgroundColor: '#FFFFFF', color: "#31AFEF" } });
            } else {
                console.log('dfhdsfjdfl')
                dispatch(loginSuccess({
                    accessToken: response.data.accessToken,
                    refreshToken: response.data.refreshToken,
                    role: response.data.role,
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

    const handleGoogleLogin = async (credentialResponse: any) => {
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

    return (
        <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4">
            <div className="flex flex-col md:flex-row max-w-4xl w-full shadow-xl rounded-xl overflow-hidden">
                {/* Left Panel - Image Space */}
                <div className="w-full md:w-5/12 relative h-48 md:h-auto">

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
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formValues.password}
                                        onChange={handleChange}
                                        placeholder="Enter your password"
                                        className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                    />
                                    <div
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </div>
                                </div>
                                {errors.password && (
                                    <div className="text-red-500 text-xs mt-1">{errors.password}</div>
                                )}
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
                            <div className="flex justify-center">
                                <GoogleOAuthProvider clientId={import.meta.env.VITE_HOST_GOOGLE_CLIENT_ID as string}>
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

export default HostLoginBody;
