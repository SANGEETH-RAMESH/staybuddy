// import React from 'react'
import HostHeader from '../../components/commonComponents/hostHeader'
import HostEditProfileBody from '../../components/hostComponent/Profile/hostEditProfileBody'

const HostChangePasswordPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <HostHeader />
      <div className="pt-10"> {/* Add padding-top to account for the fixed header */}
        <HostEditProfileBody />
      </div>
    </div>
  );
};

export default HostChangePasswordPage
