import HostHeader from '../../components/commonComponents/HostHeader'
import HostChatBody from '../../components/hostComponent/Chat/HostChatBody'

const HostChatPage = () => {
  return (
    <div>
      <HostHeader />
      <div className="mt-16">
        <HostChatBody />
      </div>
    </div>
  );
};

export default HostChatPage
