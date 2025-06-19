import React, { useEffect, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../redux/hostAuthSlice';
import { MessageCircle, Building2, User, LogOut, Menu, X, Bell, BellRing } from 'lucide-react';
import hostapiClient from '../../services/hostapiClient';
import { formatDistanceToNow } from 'date-fns';
import { LOCALHOST_URL } from '../../constants/constants';
// import { Notification } from '../../interface/Notification';
import { Notification } from '../../interface/Notification';

import { io } from "socket.io-client";
const socket = io("http://localhost:4000");

const HostHeader = () => {
  const [name, setName] = useState('');
  const [hostId, setHostId] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [isRead, setIsRead] = useState<boolean>(false);
  const [readCount, setReadCount] = useState<number>(0)
  const notificationRef = useRef<HTMLDivElement | null>(null);

  // Dummy notifications data
  // const dummyNotifications = [
  //   {
  //     id: 1,
  //     title: "New Booking Request",
  //     message: "You have received a new booking request for Room A101",
  //     time: "2 minutes ago",
  //     isRead: false,
  //   },
  //   {
  //     id: 2,
  //     title: "Payment Received",
  //     message: "Payment of ₹5000 has been received from John Doe",
  //     time: "1 hour ago",
  //     isRead: false,
  //   },
  //   {
  //     id: 3,
  //     title: "Property Approved",
  //     message: "Your property 'Green View Hostel' has been approved and is now live",
  //     time: "3 hours ago",
  //     isRead: true,
  //   },
  //   {
  //     id: 4,
  //     title: "Guest Check-in",
  //     message: "Guest Sarah Wilson has checked into Room B205",
  //     time: "5 hours ago",
  //     isRead: true,
  //   },
  //   {
  //     id: 5,
  //     title: "Maintenance Request",
  //     message: "Room C301 has a maintenance request for AC repair",
  //     time: "1 day ago",
  //     isRead: false,
  //   },
  //   {
  //     id: 6,
  //     title: "Review Received",
  //     message: "You received a 5-star review from Michael Brown",
  //     time: "2 days ago",
  //     isRead: true,
  //   },
  //   {
  //     id: 7,
  //     title: "Booking Cancelled",
  //     message: "Booking for Room A102 has been cancelled by the guest",
  //     time: "3 days ago",
  //     isRead: true,
  //   }
  // ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await hostapiClient.get(`${LOCALHOST_URL}/host/getHost`);
        setHostId(response.data.message._id);
        setName(response.data.message.name);

        // // Load dummy notifications (replace with actual API call)
        // setNotifications(dummyNotifications);
        // setHasUnreadNotifications(dummyNotifications.some(notif => !notif.isRead));
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };
    fetchData();
  }, []);

  // useEffect(() => {
  //   if (hostId) {
  //     socket.emit('join_notification_room', hostId);
  //   }

  //   const handleNotification = (notification: Notification) => {
  //     console.log(' Notification received:', notification);
  //     setNotifications((prev) => [...prev, notification]);
  //     setIsRead(notification.isRead)
  //     setReadCount((prev: number) => prev + 1);
  //   };

  //   socket.on('receive_notification', handleNotification);

  //   const handleOldNotifications = (notifications: Notification[]) => {
  //     console.log(notifications, 'Siuu')
  //     setNotifications(notifications)
  //     setIsRead(notifications[0].isRead)
  //     const unreadCount = notifications.filter(n => !n.isRead).length;

  //     setReadCount(unreadCount)
  //   }

  //   socket.emit('get_old_notifications', hostId);

  //   socket.on('receive_old_notifications', handleOldNotifications)



  //   return () => {
  //     socket.off('receive_notification', handleNotification);
  //     socket.off('receive_old_notifications', handleOldNotifications)
  //   };
  // }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  useEffect(() => {
    if (hostId) {
      socket.emit('join_notification_room', hostId);
    }

    const handleNotification = (notification: Notification) => {
      console.log('Notification received:', notification);
      setNotifications((prev) => {
        const updated = [notification,...prev];
        console.log('Updated notifications:', updated);
        return updated;
      });
      setIsRead(notification.isRead)
      setReadCount((prev) => prev + 1);
    };

    socket.on('receive_notification', handleNotification);

    const handleOldNotifications = (notifications: Notification[]) => {
      console.log(notifications, 'Siuu')
      setNotifications(notifications)
      setIsRead(notifications[0]?.isRead)
      const unreadCount = notifications.filter(n => !n.isRead).length;

      setReadCount(unreadCount)
    }

    socket.emit('get_old_notifications', hostId);

    socket.on('receive_old_notifications', handleOldNotifications)



    return () => {
      socket.off('receive_notification', handleNotification);
      socket.off('receive_old_notifications', handleOldNotifications)
    };
  }, [hostId]);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout({ isLoggedIn: false }));
    handleSocket()
    navigate('/host/login');
    setMobileMenuOpen(false);
  };

  const handleSocket = () => {
    socket.emit('hostLogout', hostId)
  }

  const handlePropertiesClick = () => {
    navigate('/host/hostel');
    setMobileMenuOpen(false);
  };

  const handleHomeClick = () => {
    navigate('/host/home');
    setMobileMenuOpen(false);
  };

  const handleChatClick = () => {
    navigate(`/host/chat/${hostId}`);
    setMobileMenuOpen(false);
  };

  const handleProfileClick = () => {
    navigate('/host/profile');
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleNotifications = () => {
    setNotificationOpen(!notificationOpen);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif._id === notificationId
          ? { ...notif, isRead: true }
          : notif
      )
    );
    setHasUnreadNotifications(notifications.some(notif => !notif.isRead && notif._id !== notificationId));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
    setHasUnreadNotifications(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <button
            onClick={handleHomeClick}
            className="text-xl md:text-2xl font-bold text-emerald-600 hover:text-emerald-800 transition-colors"
          >
            StayBuddy Host
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {/* Notification Button */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={toggleNotifications}
                className="flex items-center text-gray-600 hover:text-emerald-600 transition-colors relative"
              >
                {!isRead ? (
                  <BellRing className="w-5 h-5" />
                ) : (
                  <Bell className="w-5 h-5" />
                )}
                <span className="ml-2 text-sm">Notification</span>
                {!isRead && readCount>0  && (
                  <span className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
                    <span className="text-[8px] sm:text-[10px]">{readCount>0?readCount:''}</span>
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-60">
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                    {hasUnreadNotifications && (
                      <button
                        onClick={markAllAsRead}
                        className="text-sm text-emerald-600 hover:text-emerald-800"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    // Empty state
                    <div className="p-8 text-center">
                      <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h4 className="text-gray-600 font-medium mb-2">No notifications yet</h4>
                      <p className="text-gray-400 text-sm">When you get notifications, they'll show up here</p>
                    </div>
                  ) : (
                    // Scrollable notifications list
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification,index) => (
                        <div
                          key={index}
                          onClick={() => markAsRead(notification._id!)}
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.isRead ? 'bg-blue-50' : ''
                            }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h4 className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                              {notification.title}
                            </h4>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                          <p className="text-xs text-gray-400">
                            {formatDistanceToNow(new Date(notification.createdAt ?? ''), { addSuffix: true })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handleChatClick}
              className="flex items-center text-gray-600 hover:text-emerald-600 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="ml-2 text-sm">Messages</span>
            </button>

            <button
              onClick={handlePropertiesClick}
              className="flex items-center text-gray-600 hover:text-emerald-600 transition-colors"
            >
              <Building2 className="w-5 h-5" />
              <span className="ml-2 text-sm">Properties</span>
            </button>

            <button
              onClick={handleProfileClick}
              className="flex items-center text-gray-600 hover:text-emerald-600 transition-colors"
            >
              <User className="w-5 h-5" />
              <span className="ml-2 text-sm font-medium text-gray-700">{name || 'Loading...'}</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 text-gray-600 hover:text-emerald-600 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50" onClick={toggleMobileMenu}>
          <div
            className="fixed top-16 right-0 w-64 h-screen bg-white shadow-lg z-50 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col space-y-4">
              <div className="pt-2 pb-4 border-b border-gray-200">
                <button
                  onClick={handleProfileClick}
                  className="w-full flex items-center py-2 px-4 text-left rounded-md hover:bg-gray-100"
                >
                  <User className="w-5 h-5 text-emerald-600" />
                  <span className="ml-3 font-medium">{name || 'Loading...'}</span>
                </button>
              </div>

              <button
                onClick={toggleNotifications}
                className="flex items-center py-2 px-4 text-left rounded-md hover:bg-gray-100 relative"
              >
                <Bell className="w-5 h-5 text-emerald-600" />
                <span className="ml-3">Notifications</span>
                {isRead && (
                  <span className="ml-auto w-2 h-2 bg-red-500 rounded-full">{readCount}</span>
                )}
              </button>

              <button
                onClick={handleChatClick}
                className="flex items-center py-2 px-4 text-left rounded-md hover:bg-gray-100"
              >
                <MessageCircle className="w-5 h-5 text-emerald-600" />
                <span className="ml-3">Messages</span>
              </button>

              <button
                onClick={handlePropertiesClick}
                className="flex items-center py-2 px-4 text-left rounded-md hover:bg-gray-100"
              >
                <Building2 className="w-5 h-5 text-emerald-600" />
                <span className="ml-3">Properties</span>
              </button>

              <div className="pt-4 mt-auto border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="flex items-center py-2 px-4 text-left rounded-md hover:bg-gray-100 text-red-600"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="ml-3">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HostHeader;