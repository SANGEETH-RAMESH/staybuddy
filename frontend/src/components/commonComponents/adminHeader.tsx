import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, Bell, BellRing } from 'lucide-react';
import admin_icon from '../../assets/settings.png';
// import edit_icon from '../../assets/edit.png'
import { jwtDecode } from 'jwt-decode';
import { User } from '../../interface/User'
import { Notification } from '../../interface/Notification';
import logo from '../../assets/logo.png'
import { formatDistanceToNow } from 'date-fns';
import { io } from "socket.io-client";
const apiUrl = import.meta.env.VITE_LOCALHOST_URL;
const socket = io(`${apiUrl}`);

interface AdminHeaderProps {
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuClick, isSidebarOpen }) => {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [notification, setNotifications] = useState<Notification[]>([])
  const [isRead, setIsRead] = useState<boolean>(false)
  const [readCount, setReadCount] = useState<number>(0)
  const notificationRef = useRef<HTMLDivElement>(null);
  const [adminIds, setAdminId] = useState('')

  // Close notification dropdown when clicking outside
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

  const toggleNotifications = () => {
    console.log("notification", adminIds)
    socket.emit('mark_all_notification', ({ receiverId:adminIds }))
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
    setHasUnreadNotifications(notification.some(notif => !notif.isRead && notif._id !== notificationId));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
    setHasUnreadNotifications(false);
  };

  const getNotificationTypeBg = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-red-50';
      case 'warning':
        return 'bg-yellow-50';
      case 'success':
        return 'bg-green-50';
      case 'info':
        return 'bg-blue-100';
      default:
        return 'bg-blue-50';
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('adminAccessToken');
    if (token) {
      const decoded: User = jwtDecode(token);
      const adminId = decoded._id.toString()
      setAdminId(adminId)
      console.log(adminId, 'Admin')
      if (adminId) {
        socket.emit('join_notification_room', adminId);
      }

      const handleNotification = (notificationss: Notification) => {
        console.log(' Notification received:', notificationss);
      

        setNotifications((prev) => {
        const updated: Notification[] = [notificationss, ...prev];
        console.log('Updated notifications:', updated);

        const unreadCount = updated.filter((n) => n.isRead).length;
        console.log(unreadCount, 'unread');

        setIsRead(false);
        setReadCount(unreadCount);

        return updated;
      });
        // // setNotification([notifications])
        // setIsRead(notificationss.isRead)
        // setReadCount((prev) => prev + 1);
      };

      socket.on('receive_notification', handleNotification);

      const handleOldNotifications = (notifications: Notification[]) => {
        console.log(notifications, 'Siuu')
        setNotifications(notifications)
        setIsRead(notifications[0].isRead)
        const unreadCount = notifications.filter(n => n.isRead).length;
        setIsRead(false)
        setReadCount(unreadCount)
      }

      const handleMarkedAllNotification = (receiverId:string) => {
        console.log(receiverId)
        setNotifications([])
      }

      socket.emit('get_old_notifications', adminId);

      socket.on('receive_old_notifications', handleOldNotifications)

      socket.on('marked_all_notifications', handleMarkedAllNotification)

      return () => {
        socket.off('receive_notification', handleNotification);
        socket.off('receive_old_notifications', handleOldNotifications);
        socket.off('')
      };
    }

  }, [adminIds]);

  return (
    <div className="w-full h-[11vh] min-h-[60px] bg-[#212936] text-white flex items-center px-2 sm:px-4 lg:px-6 relative z-50">
      {/* Mobile Menu Button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden text-white p-1.5 sm:p-2 hover:bg-[#45B8F2]/10 rounded-md transition-colors"
        aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isSidebarOpen ? <X size={20} className="sm:w-6 sm:h-6" /> : <Menu size={20} className="sm:w-6 sm:h-6" />}
      </button>

      {/* Logo */}
      <div className="flex items-center gap-x-2 text-lg sm:text-xl md:text-2xl font-bold text-[#45B8F2] ml-2 sm:ml-4 lg:ml-16 truncate">
       <img src={logo} alt="Logo" className="h-16 w-16" />
            <p>StayBuddy</p>
      </div>

      {/* Right Section */}
      <div className="ml-auto flex items-center gap-2 sm:gap-3 md:gap-4">
        {/* Notification Button */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={toggleNotifications}
            className="text-white hover:text-[#45B8F2] transition-colors relative p-1.5 sm:p-2 hover:bg-[#45B8F2]/10 rounded-md"
            aria-label="Notifications"
          >
            {!isRead ? (
              <BellRing size={18} className="sm:w-5 sm:h-5" />
            ) : (
              <Bell size={18} className="sm:w-5 sm:h-5" />
            )}
            {!isRead && readCount > 0 && (
              <span className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
                <span className="text-[8px] sm:text-[10px]">{readCount}</span>
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-60 max-h-[80vh] overflow-hidden">
              {/* Header */}
              <div className="p-3 sm:p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#212936] rounded-t-lg gap-2 sm:gap-0">
                <h3 className="text-base sm:text-lg font-semibold text-white">Admin Notifications</h3>
                {hasUnreadNotifications && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs sm:text-sm text-[#45B8F2] hover:text-blue-300 transition-colors whitespace-nowrap"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {notification.length === 0 ? (
                // Empty state
                <div className="p-6 sm:p-8 text-center">
                  <Bell className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
                  <h4 className="text-gray-600 font-medium mb-2 text-sm sm:text-base">No notifications yet</h4>
                  <p className="text-gray-400 text-xs sm:text-sm">System notifications will appear here</p>
                </div>
              ) : (
                // Scrollable notifications list
                <div className="max-h-80 sm:max-h-96 overflow-y-auto">
                  {notification.map((notifications, index) => (
                    <div
                      key={index}
                      onClick={() => markAsRead(notifications._id!)}
                      className={`p-3 sm:p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${!notifications.isRead ? getNotificationTypeBg(notifications.type) : ''
                        }`}
                    >
                      {/* Notification Header */}
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <h4 className={`text-xs sm:text-sm font-medium flex items-center gap-2 flex-1 ${!notifications.isRead ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                          <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0 ${notifications.type === 'error' ? 'bg-red-500' :
                            notifications.type === 'warning' ? 'bg-yellow-500' :
                              notifications.type === 'success' ? 'bg-green-500' :
                                'bg-blue-500'
                            }`}></span>
                          <span className="truncate">{notifications.title}</span>
                        </h4>
                        {!notifications.isRead && (
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#45B8F2] rounded-full mt-1 flex-shrink-0"></div>
                        )}
                      </div>

                      {/* Notification Message */}
                      <p className="text-xs sm:text-sm text-gray-600 mb-2 ml-3.5 sm:ml-4 leading-relaxed">
                        {notifications.message}
                      </p>

                      {/* Notification Footer */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center ml-3.5 sm:ml-4 gap-1 sm:gap-0">
                        <p className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(notifications.createdAt ?? ''), { addSuffix: true })}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${notifications.type === 'error' ? 'bg-red-100 text-red-700' :
                          notifications.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                            notifications.type === 'success' ? 'bg-green-100 text-green-700' :
                              'bg-blue-100 text-blue-700'
                          }`}>
                          {notifications.type?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Admin Profile Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          <img
            src={admin_icon}
            alt="User"
            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
          />
          <span className="font-bold text-sm sm:text-base hidden xs:inline-block sm:inline truncate max-w-20 sm:max-w-none">
            Admin
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;