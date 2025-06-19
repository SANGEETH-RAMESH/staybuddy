// import React from 'react'
import HostHeader from '../../components/commonComponents/hostHeader'
import HostChatBody from '../../components/hostComponent/Chat/HostChatBody'

const HostChatPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <HostHeader />
      <div className="mt-16">
        <HostChatBody />
      </div>
    </div>
  );
};

export default HostChatPage
