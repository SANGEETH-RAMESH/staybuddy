import HostHeader from '../../components/commonComponents/HostHeader'
import HostEditProfileBody from '../../components/hostComponent/Profile/HostEditProfileBody'

const HostChangePasswordPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <HostHeader />
      <div className="pt-10"> 
        <HostEditProfileBody />
      </div>
    </div>
  );
};

export default HostChangePasswordPage
