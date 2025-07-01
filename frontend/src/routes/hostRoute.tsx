import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import HostSignupPage from '../pages/hostPages/hostSignupPage'
import HostSignUpOtpPage from '../pages/hostPages/hostSignUpOtpPage'
import HostLoginPage from '../pages/hostPages/hostLoginPage'
import HostForgotPasswordPage from '../pages/hostPages/hostForgotPasswordPage'
import HostOtpForgotPasswordPage from '../pages/hostPages/hostOtpForgotPasswordPage'
import HostResetPasswordPage from '../pages/hostPages/hostResetPasswordPage'
import HostLandingPage from '../pages/hostPages/hostLandingPage'
import HostLoginProtector from '../routeProtector/hostLoginProtectort'
import HostProtectiveCheck from '../routeProtector/hostProtectiveCheck'
import HostAddHostPage from '../pages/hostPages/hostAddHostPage'
import HostHostelListingsPage from '../pages/hostPages/hostHostelListingsPage'
import HostApprovalPage from '../pages/hostPages/hostApprovalPage'
import HostHostelDetailsPage from '../pages/hostPages/hostHostelDetailsPage'
import HostProfilePage from '../pages/hostPages/hostProfilePage'
import HostShowBookingsPage from '../pages/hostPages/hostShowBookingsPage'
import HostChatPage from '../pages/hostPages/hostChatPage'
import HostChangePasswordPage from '../pages/hostPages/hostChangePasswordPage'
import HostEditProfilePage from '../pages/hostPages/hostEditProfilePage'
import HostWalletPage from '../pages/hostPages/hostWalletPage'
import HostWalletTransactionPage from '../pages/hostPages/hostWalletTransactionPage'
import HostEditHostelPage from '../pages/hostPages/hostEditHostelPage'


const hostRoute = () => {
  return (
    <div>
      <ToastContainer theme='dark'/>
      <Routes>
        <Route path='/signup' element={<HostProtectiveCheck element={<HostSignupPage/>}/>}/>
        <Route path='/otp' element={<HostProtectiveCheck element={<HostSignUpOtpPage/>} />}/>
        <Route path='/login' element={<HostProtectiveCheck element={<HostLoginPage/>}/>} />
        <Route path='/forgotpassword' element={<HostProtectiveCheck element={<HostForgotPasswordPage/>}/>} />
        <Route path='/forgotpasswordotp' element={<HostProtectiveCheck element={<HostOtpForgotPasswordPage/>}/>} />
        <Route path='/resetpassword' element={<HostProtectiveCheck element={<HostResetPasswordPage/>}/>} />
        <Route path='/home' element={<HostLoginProtector element={<HostLandingPage/>} />} />
        <Route path='/addhostel' element={ <HostLoginProtector element={ <HostAddHostPage/>} />} />
        <Route path='/hostel' element={<HostLoginProtector element={<HostHostelListingsPage/>}/>}  />
        <Route path='/approval' element={<HostLoginProtector element={<HostApprovalPage/>} />} />
        <Route path='/detailhostel' element={<HostLoginProtector element={<HostHostelDetailsPage/>}/>}  />
        <Route path='/profile' element={<HostLoginProtector element={<HostProfilePage/>}/>}  />
        <Route path='/showbookings/:id' element={<HostLoginProtector element={<HostShowBookingsPage/>}/>}  />
        <Route path='/chat/:id' element={<HostLoginProtector element={<HostChatPage/>}/>}  />
        <Route path='/changepassword' element={<HostLoginProtector element={<HostChangePasswordPage/>}/>}  />
        <Route path='/editprofile' element={<HostLoginProtector element={<HostEditProfilePage/>}/>}  />
        <Route path='/wallet' element={<HostLoginProtector element={<HostWalletPage/>}/>}  />
        <Route path='/wallet/transactions' element={<HostLoginProtector element={<HostWalletTransactionPage/>}/>}  />
        <Route path='/edit-hostel/:id' element={<HostLoginProtector element={<HostEditHostelPage/>}/>}  />
      </Routes>
    </div>
  )
}

export default hostRoute
