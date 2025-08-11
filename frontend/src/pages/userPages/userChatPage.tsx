
import UserHeader from '../../components/commonComponents/userHeader'
import UserChatBody from '../../components/userComponent/Chat/userChatBody'

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
