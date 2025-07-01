
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { loginSuccess } from '../../../redux/adminAuthSlice';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { LoginValues } from '../../../interface/Login';
import { useState } from 'react';
const apiUrl = import.meta.env.VITE_LOCALHOST_URL;

const AdminLoginBody = () => {


  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [errors, setErrors] = useState<Partial<LoginValues>>({});
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
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      console.log(formValues.email,formValues.password,'email')
      const res = await axios.post(`${apiUrl}/admin/login`, {
        email: formValues.email,
        password: formValues.password
      });
      console.log(res, 'responseeeee');

      if (res.data.data === 'Invalid Password') {
        setErrors((prev) => ({
          ...prev,
          password: "Invalid Password"
        }))
      } else if (res.data.data === 'Invalid Email') {
        setErrors((prev) => ({
          ...prev,
          email: 'Invalid Email'
        }))
      } else {
        dispatch(loginSuccess({
          accessToken: res.data.data.accessToken,
          refreshToken: res.data.data.refreshToken,
          isLoggedIn: true
        }));
        toast.success('Login Successful', { style: { backgroundColor: '#FFFFFF', color: '#31AFEF' } });
        navigate('/admin/dashboard');
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
    <div className="relative flex justify-center items-center h-screen bg-[#273142]">
      <div className="absolute top-[30px] left-[100px] text-4xl font-semibold text-[#45B8F2]">
        StayBuddy
      </div>
      <div className="flex flex-col items-center justify-center space-y-6 p-8 border-2 rounded-lg shadow-lg w-full max-w-md border-[#45B8F2]">
        <h1 className="text-3xl font-semibold text-[#45B8F2]">Admin Login</h1>

        {/* Formik Form */}
        {/* <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={signInValidation}
          onSubmit={handleLogin}
        > */}
        {/* {() => ( */}
        <form className="w-full" onSubmit={handleLogin}>
          <div className="w-full mb-4">
            <label htmlFor="email" className="block text-[17px] font-medium text-[#45B8F2] mb-2">Email</label>
            <input
              name="email"
              type="text"
              onChange={handleChange}
              className="border-[1px] border-[#45B8F2] p-2 rounded-lg w-full focus:outline-none bg-[#273142] focus:bg-[#273142] text-white"
              placeholder="Enter your email"
            />
            {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
          </div>

          <div className="w-full mb-4">
            <label htmlFor="password" className="block text-[17px] font-medium text-[#45B8F2] mb-2">Password</label>
            <input
              name="password"
              type="password"
              onChange={handleChange}
              className="border-[1px] border-[#45B8F2] p-2 rounded-lg w-full text-white focus:outline-none bg-[#273142]"
              placeholder="Enter your password"
            />
            {errors.password && <div className="text-red-500 text-xs mt-1">{errors.password}</div>}
          </div>

          <button type="submit" className="bg-blue-500 text-white p-[9px] mt-[30px] rounded-lg w-full hover:bg-blue-600">
            Login
          </button>
        </form>
        {/* )} */}
        {/* </Formik> */}
      </div>
    </div>
  );
};

export default AdminLoginBody;
