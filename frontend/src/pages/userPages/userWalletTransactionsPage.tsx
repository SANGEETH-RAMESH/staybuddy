import UserHeader from '../../components/commonComponents/UserHeader'
import UserWalletTransactionsBody from '../../components/userComponent/Wallet/UserWalletTransactionsBody'

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
