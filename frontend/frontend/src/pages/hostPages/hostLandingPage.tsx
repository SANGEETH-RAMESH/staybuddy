import HostHeader from '../../components/commonComponents/HostHeader'
import HostLandingBody from '../../components/hostComponent/Landing/HostLandingBody'

const HostLandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <HostHeader />
      <HostLandingBody />
    </div>
  );
};

export default HostLandingPage
