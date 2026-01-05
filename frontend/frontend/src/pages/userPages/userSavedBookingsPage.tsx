import UserHeader from '../../components/commonComponents/UserHeader'
import SavedBookings from '../../components/userComponent/Hostel/SavedBookings'

const userSavedBookings = () => {
  return (
    <div>
      <UserHeader />
      <div className="mt-16">
        <SavedBookings />
      </div>
    </div>
  )
}

export default userSavedBookings
