import HostHeader from '../../components/commonComponents/HostHeader'
import HostProfileBody from '../../components/hostComponent/Profile/HostProfileBody'

const HostProfilePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <HostHeader />
      <HostProfileBody />
    </div>
  );
};

export default HostProfilePage
