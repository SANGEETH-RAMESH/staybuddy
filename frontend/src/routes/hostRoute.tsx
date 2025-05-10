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
      </Routes>
    </div>
  )
}

export default hostRoute
