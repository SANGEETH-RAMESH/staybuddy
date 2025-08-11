
import UserHeader from '../../components/commonComponents/UserHeader'
import UserChatBody from '../../components/userComponent/Chat/UserChatBody'

const userChatPage = () => {
    return (
        <div>
            <UserHeader />
            <div className="mt-16">
                <UserChatBody />
            </div>

        </div>
    )
}

export default userChatPage
