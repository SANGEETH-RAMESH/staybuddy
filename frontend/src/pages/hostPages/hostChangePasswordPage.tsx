import HostHeader from '../../components/commonComponents/hostHeader'
import HostChangePasswordBody from '../../components/hostComponent/Password/hostChangePasswordBody'

const HostChangePasswordPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <HostHeader />
      <div className="pt-10"> 
        <HostChangePasswordBody />
      </div>
    </div>
  );
};

export default HostChangePasswordPage
