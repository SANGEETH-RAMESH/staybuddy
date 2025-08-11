import HostHeader from '../../components/commonComponents/HostHeader'
import HostWalletTransactionPage from '../../components/hostComponent/Wallet/HostWalletTransactionBody'

const hostWalletTransactionsPage = () => {
  return (
    <div>
      <HostHeader/>
      <div className="mt-16">
        <HostWalletTransactionPage />
      </div>
    </div>
  )
}

export default hostWalletTransactionsPage
