import React, { useEffect, useState } from 'react';
import { Menu, X, Heart, MessageCircle, Bell, User, LogOut } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/userAuthSlice';
import { useNavigate } from 'react-router-dom';
import createApiClient from '../../services/apiClient';
const apiUrl = import.meta.env.VITE_LOCALHOST_URL;
import { Notification } from '../../interface/Notification';
import { formatDistanceToNow } from 'date-fns';
import { io } from "socket.io-client";
const socket = io("http://localhost:4000");
const userApiClient = createApiClient('user');

export const UserHeader: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notification, setNotification] = useState<Notification[]>([])
  const [isRead, setIsRead] = useState<boolean>(false)
  const [readCount, setReadCount] = useState<number>(0)

  const handleLogout = () => {
    dispatch(logout({ isLoggedIn: false }));
    handleSocket()
    navigate('/user/login');
  };

  const handleSocket = () => {
    socket.emit('userLogout', userId)
  }

  const [name, setName] = useState('');
  const [userId, setUserId] = useState('')

  useEffect(() => {
    if (userId) {
      socket.emit('join_notification_room', userId);
    }

    const handleNotification = (notification: Notification) => {
      console.log(' Notification received:', notification);
      setNotification((prev) => [notification,...prev]);
      setIsRead(notification.isRead)
      setReadCount((prev) => prev + 1);
    };
      
    socket.on('receive_notification', handleNotification);

    const handleOldNotifications = (notifications: Notification[]) => {
      console.log(notifications, 'Siuu')
      setNotification(notifications)
      setIsRead(notifications[0].isRead)
      const unreadCount = notifications.filter(n => !n.isRead).length;

      setReadCount(unreadCount)
    }

    socket.emit('get_old_notifications', userId);

    socket.on('receive_old_notifications', handleOldNotifications)



    return () => {
      socket.off('receive_notification', handleNotification);
      socket.off('receive_old_notifications', handleOldNotifications)
    };
  }, [userId]);

  const handleOpenNotifications = async () => {
    console.log(userId,'hey')
    if (userId) {
      try {
        console.log('heee')
        const response = await userApiClient.put(`${apiUrl}/user/mark-all-read`);
        console.log(response,'Mm')
        if (response.data.message == 'Updated') {
          setNotification((prev) =>
            prev.map((notif) => ({
              ...notif,
              isRead: true,
            }))
          );
          setIsRead(false);
          setReadCount(0)
        }
      } catch (error) {
        console.log(error)
      }
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'message':
        return '💬';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await userApiClient.get(`${apiUrl}/user/getUserDetails`);
        console.log(response.data, 'data')
        setUserId(response?.data.data._id)
        setName(response?.data?.data.name)
      } catch (error) {
        console.error("Error fetching user details:", error)
      }
    }
    fetchData();
  }, [])

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.notification-container')) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <button
              onClick={() => navigate('/user/home')}
              className="text-xl font-bold bg-gradient-to-r from-[#31AFEF] to-[#2196F3] bg-clip-text text-transparent"
            >
              StayBuddy
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              {/* Notification Button with Dropdown */}
              <div className="relative notification-container">
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="relative p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <Bell
                    onClick={handleOpenNotifications}
                    className="w-6 h-6 text-gray-600" />
                  {isRead && (
                    <>
                      <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 animate-ping" />
                      <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500" />
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                        {readCount}
                      </span>
                    </>
                  )}
                </button>

                {/* Notification Dropdown */}
                {isNotificationOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                        {readCount > 0 && (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                            {readCount} new
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Scrollable Notification List */}
                    <div className="max-h-96 overflow-y-auto">
                      {notification && notification.length > 0 ? (
                        notification.map((notif) => (
                          <div
                            key={notif._id}
                            className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${!notif.isRead ? 'bg-blue-50' : ''
                              }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 text-lg">
                                {getNotificationIcon(notif.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {notif.title}
                                  </p>
                                  {!notif.isRead && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2"></div>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {notif.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {formatDistanceToNow(new Date(notif.createdAt ?? ''), { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center">
                          <div className="text-gray-400 mb-2">
                            <Bell className="w-12 h-12 mx-auto opacity-50" />
                          </div>
                          <p className="text-sm text-gray-500 font-medium">No notifications</p>
                          <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    {notification && notification.length > 0 && (
                      <div className="px-4 py-3 border-t border-gray-200">
                        <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium">
                          View All Notifications
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={() => navigate(`/user/wishlist/${userId}`)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200">
                <Heart className="w-6 h-6 text-gray-600" />
              </button>

              <button
                onClick={() => navigate(`/user/chat/${userId}`)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200">
                <MessageCircle className="w-6 h-6 text-gray-600" />
              </button>

              <button
                onClick={() => navigate('/user/profile')}
                className="flex items-center space-x-3 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <div className="w-8 h-8 rounded-full border-2 border-[#31AFEF] p-0.5">
                  <User className="w-full h-full text-gray-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">{name || '..Loading'}</span>
              </button>

              <button
                onClick={handleLogout}
                className="p-2 hover:bg-red-100 rounded-full transition-colors duration-200"
              >
                <LogOut className="w-6 h-6 text-red-600" />
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-x-0 top-16 bg-white shadow-lg md:hidden z-40">
          <div className="px-4 py-2 space-y-1">
            {/* Mobile Notifications */}
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="flex items-center justify-between w-full px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200">
              <div className="flex items-center">
                <Bell
                  onClick={handleOpenNotifications}
                  className="w-5 h-5 mr-3" />
                <span className="text-sm font-medium">Notifications</span>
              </div>
              {isRead && (
                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {readCount}
                </span>
              )}
            </button>

            <button
              onClick={() => navigate(`/user/wishlist/${userId}`)}
              className="flex items-center w-full px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200">
              <Heart className="w-5 h-5 mr-3" />
              <span className="text-sm font-medium">Wishlist</span>
            </button>

            <button
              onClick={() => {
                console.log(userId, 'Userid')
                navigate(`/user/chat/${userId}`)
              }}
              className="flex items-center w-full px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200">
              <MessageCircle className="w-5 h-5 mr-3" />
              <span className="text-sm font-medium">Chat</span>
            </button>

            <button
              onClick={() => navigate('/user/profile')}
              className="flex items-center w-full px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
            >
              <User className="w-5 h-5 mr-3" />
              <span className="text-sm font-medium">Profile</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            >
              <LogOut className="w-5 h-5 mr-3" />
              <div className="text-sm font-medium">Logout</div>
            </button>
          </div>

          {/* Mobile Notification Dropdown */}
          {isNotificationOpen && (
            <div className="mx-4 mb-4 bg-gray-50 rounded-lg shadow-inner">
              <div className="max-h-64 overflow-y-auto">
                {notification && notification.length > 0 ? (
                  notification.slice(0, 5).map((notif) => (
                    <div
                      key={notif._id}
                      className={`px-3 py-2 border-b border-gray-200 last:border-b-0 ${!notif.isRead ? 'bg-blue-50' : ''
                        }`}
                    >
                      <div className="flex items-start space-x-2">
                        <div className="text-sm">{getNotificationIcon(notif.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate">
                            {notif.title}
                          </p>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {notif.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDistanceToNow(new Date(notif.createdAt ?? ''), { addSuffix: true })}
                          </p>
                        </div>
                        {!notif.isRead && (
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-6 text-center">
                    <div className="text-gray-400 mb-2">
                      <Bell className="w-8 h-8 mx-auto opacity-50" />
                    </div>
                    <p className="text-xs text-gray-500 font-medium">No notifications</p>
                    <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
                  </div>
                )}
              </div>
              {notification && notification.length > 0 && (
                <div className="px-3 py-2 text-center border-t border-gray-200">
                  <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                    View All
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default UserHeader;