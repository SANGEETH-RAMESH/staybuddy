// import React from 'react'
import { Routes,Route } from 'react-router-dom'
import UserLogin from '../pages/userPages/userLoginPage'
import UserSignUp from '../pages/userPages/userSignupPage'
import UserForgotPassword from '../pages/userPages/userForgotPassword'
import OtpUserForgotPasswordPage from '../pages/userPages/otpUserForgotPasswordPage'
import UserLandingPage from '../pages/userPages/userLandingPage'
import OtpSignUpPage from '../pages/userPages/otpSignUpPage'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import UserLoginProtector from '../routeProtector/userLoginProtector'
import UserResetPasswordPage from '../pages/userPages/userResetPasswordPage'
import UserProtectiveCheck from '../routeProtector/userProtectiveCheck'
import UserProfilePage from '../pages/userPages/userProfilePage'
import UserChangePasswordPage from '../pages/userPages/userChangePasswordPage'
import UserEditProfilePage from '../pages/userPages/userEditProfilePage'
import UserWalletPage from '../pages/userPages/userWalletPage'
import UserHostelListingsPage from '../pages/userPages/userHostelListingsPage'
import UserDetailedHostelPage from '../pages/userPages/userDetailedHostelPage'
import UserHostelBookingPage from '../pages/userPages/userHostelBookingPage'
import UserSavedBooking from '../pages/userPages/userSavedBookingsPage'
import UserSavedDetailPage from '../pages/userPages/userSavedDetailHostelPage'
import UserRatingPage from '../pages/userPages/userRatingPage'
import UserChatPage from '../pages/userPages/userChatPage'
import UserWishListPage from '../pages/userPages/userWishlistPage'
import UserWalletTransactionsPage from '../pages/userPages/userWalletTransactionsPage'

const UserRoute = () => {
  return (
    <div>
      <ToastContainer theme='dark'/>
      <Routes>
        <Route path='/login' element={<UserProtectiveCheck element={<UserLogin/>}/>} />
        <Route path='/signup' element={<UserProtectiveCheck element={<UserSignUp/> }/>} />
        <Route path='/forgotpassword' element={<UserProtectiveCheck element={<UserForgotPassword/>}/>} />
        <Route path='/forgotpasswordotp' element={<UserProtectiveCheck element={<OtpUserForgotPasswordPage/>}/>} />
        <Route path='/home' element={<UserLoginProtector element={<UserLandingPage/>}/>} />
        <Route path='/otp' element={<UserProtectiveCheck element={<OtpSignUpPage/>} />}/>
        <Route path='/resetpassword' element={<UserProtectiveCheck element={<UserResetPasswordPage/>}/>} />
        <Route path='/profile'  element={<UserLoginProtector element={<UserProfilePage/>}/>} />
        <Route path='/changepassword' element={<UserLoginProtector element={<UserChangePasswordPage/>} />} />
        <Route path='/editprofile' element={<UserLoginProtector element={<UserEditProfilePage/>} />} />
        <Route path='/wallet' element={<UserLoginProtector element={<UserWalletPage/>} />} />
        <Route path='/hostel' element={<UserLoginProtector element={<UserHostelListingsPage/>} />} />
        <Route path='/singlehostel/:id' element={<UserLoginProtector element={<UserDetailedHostelPage/>} />} />
        <Route path='/booking/:id' element={<UserLoginProtector element={<UserHostelBookingPage/>} />} />
        <Route path='/savedbookings/:id' element={<UserLoginProtector element={<UserSavedBooking/>} />} />
        <Route path='/detailbookings/:id' element={<UserLoginProtector element={<UserSavedDetailPage/>} />} />
        <Route path='/reviews/:id' element={<UserLoginProtector element={<UserRatingPage/>} />} />
        <Route path='/chat/:id' element={<UserLoginProtector element={<UserChatPage/>} />} />
        <Route path='/wishlist/:id' element={<UserLoginProtector element={<UserWishListPage/>} />} />
        <Route path='/wallet/transactions' element={<UserLoginProtector element={<UserWalletTransactionsPage/>} />} />
      </Routes>
    </div>
  )
}

export default UserRoute
