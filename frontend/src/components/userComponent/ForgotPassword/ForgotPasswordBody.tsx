import React from 'react';
import exclamation_mark from '../../../assets/danger.png';
import email from '../../../assets/email.png';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const ForgotPasswordBody = () => {
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            email: '',
        },
        validationSchema: Yup.object({
            email: Yup.string()
                .email('Invalid email address')
                .required('Email is required'),
        }),
        onSubmit: (values) => {
            sendPasswordResetLink(values.email);
        },
    });

    const sendPasswordResetLink = async (email: string) => {
        console.log(`Password reset link sent to: ${email}`);

        try {
            const response = await axios.post('http://localhost:4000/user/forgotpassword', { email });
            console.log(response.data.message)
            if (response.data.message === 'User found') {
                navigate('/user/forgotpasswordotp', { state: { email } });
            } else if (response.data.message === 'Not success') {
                toast.error('Incorrect email');
            }
        } catch (error) {
            console.error('Error sending password reset link:', error);
            toast.error('Something went wrong. Please try again later.');
        }
    };

    return (
        <div className="h-screen w-full relative">
            <div className="h-[50%] bg-[#31AFEF]"></div>

            <div className="h-[50%] bg-[#EEEEEE]"></div>

            <div className="absolute top-[50px] left-[100px] text-[35px] font-bold text-white">
                StayBuddy
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
                        Enter an email and we'll send you a link to reset your password
                    </p>
                </div>

                <form onSubmit={formik.handleSubmit}>
                    <div className="relative mb-4">
                        <img
                            src={email}
                            alt="Email Icon"
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="abc@gmail.com"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="w-full border border-gray-300 rounded-lg pl-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#31AFEF]"
                        />
                    </div>

                    {formik.touched.email && formik.errors.email ? (
                        <div className="text-red-500 text-sm mt-1 ml-2">{formik.errors.email}</div>
                    ) : null}

                    <button
                        type="submit"
                        className="w-full bg-[#31AFEF] text-white py-2 rounded-lg font-semibold hover:bg-[#2499ce] transition"
                        disabled={formik.isSubmitting}
                    >
                        SUBMIT
                    </button>
                </form>

                <div className="text-center mt-4">
                    <a href="/user/login" className="text-[#ACABAB] hover:underline">
                        Back to Login
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordBody;
