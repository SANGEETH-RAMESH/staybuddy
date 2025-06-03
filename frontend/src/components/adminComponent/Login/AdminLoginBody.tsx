// import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { loginSuccess } from '../../../redux/adminAuthSlice';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import { signInValidation } from '../../../validations/commonValidations'; // Import validation schema

const AdminLoginBody = () => {
  // const [email, setEmail] = useState('');
  // const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (values: { email: string, password: string }) => {
    try {
      const res = await axios.post('http://localhost:4000/admin/login', {
        admin_email: values.email,
        admin_password: values.password
      });
      console.log(res, 'responseeeee');

      if (res.data.data === 'Invalid Password') {
        toast.error('Invalid password', { style: { backgroundColor: '#FFFFFF', color: '#31AFEF' } });
      } else if (res.data.data === 'Invalid Email') {
        toast.error('Invalid email', { style: { backgroundColor: '#FFFFFF', color: '#31AFEF' } });
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
      toast.error('An error occurred', { style: { backgroundColor: '#FFFFFF', color: '#31AFEF' } });
      console.log(error);
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
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={signInValidation}
          onSubmit={handleLogin}
        >
          {() => (
            <Form className="w-full">
              <div className="w-full mb-4">
                <label htmlFor="email" className="block text-[17px] font-medium text-[#45B8F2] mb-2">Email</label>
                <Field
                  name="email"
                  type="text"
                  className="border-[1px] border-[#45B8F2] p-2 rounded-lg w-full focus:outline-none bg-[#273142] focus:bg-[#273142] text-white"
                  placeholder="Enter your email"
                />
                <ErrorMessage name="email" component="div" className="text-red-500 text-xs mt-1" />
              </div>

              <div className="w-full mb-4">
                <label htmlFor="password" className="block text-[17px] font-medium text-[#45B8F2] mb-2">Password</label>
                <Field
                  name="password"
                  type="password"
                  className="border-[1px] border-[#45B8F2] p-2 rounded-lg w-full focus:outline-none bg-[#273142]"
                  placeholder="Enter your password"
                />
                <ErrorMessage name="password" component="div" className="text-red-500 text-xs mt-1" />
              </div>

              <button type="submit" className="bg-blue-500 text-white p-[9px] mt-[30px] rounded-lg w-full hover:bg-blue-600">
                Login
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default AdminLoginBody;
