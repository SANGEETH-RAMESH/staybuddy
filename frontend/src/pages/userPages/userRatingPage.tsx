import UserHeader from '../../components/commonComponents/userHeader'
import Review from "../../components/userComponent/Review/Review"

const userRatingPage = () => {
  return (
    <div>
      <UserHeader />
      <div className="mt-16">
        <Review />
      </div>
    </div>
  )
}

export default userRatingPage
