import UserHeader from '../../components/commonComponents/userHeader'
import UserWalletTransactionsBody from '../../components/userComponent/Wallet/userWalletTransactionsBody'

const userWalletTransactionsPage = () => {
  return (
    <div>
      <UserHeader/>
      <div className="mt-16">
        <UserWalletTransactionsBody />
      </div>
    </div>
  )
}

export default userWalletTransactionsPage
