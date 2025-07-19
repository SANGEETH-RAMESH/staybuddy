import UserHeader from '../../components/commonComponents/userHeader'
import DetailedHostelBody from '../../components/userComponent/Hostel/DetailedHostelBody'



const userDetailedHostelPage = () => {
  return (
    <div>
      <UserHeader/>
      <div className="mt-16">
        <DetailedHostelBody/>
      </div>
    </div>
  )
}

export default userDetailedHostelPage
