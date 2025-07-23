import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, Search, Plus, Paperclip, Image, X, Clock, Video, ArrowLeft } from 'lucide-react';
import dummy_profile from '../../../assets/dummy profile.png';
import { useLocation } from 'react-router-dom';
import VideoCall from '../../commonComponents/VideoCall'
import { createChat, getAllHosts, getChat } from '../../../services/userServices';
const apiUrl = import.meta.env.VITE_BACKEND_URL;


interface Message {
  chatId: string;
  message: string;
  senderId: string;
  receiverId: string;
  timestamp: string;
  isRead: boolean;
  type?: 'text' | 'image' | 'document';
  fileName?: string;
  fileUrl?: string;
  fileSize?: number;
}

type Messages = {
  senderId: string;
  content: string;
  timestamp: string;
  type?: 'text' | 'image' | 'document';
  fileName?: string;
  fileUrl?: string;
  fileSize?: number;
};

type Chats = {
  _id: string;
  name: string;
  participant1: string;
  type: string;
  participant2: User;
  latestMessage?: string;
  updatedAt?: string;
  unreadCount: number;
  messages: Messages[];
  lastMessageTime: string;
};

type User = {
  _id: string;
  name: string;
  email?: string;
  avatar?: string;
};

interface Chat {
  id: string;
  name: string;
  type: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
  receiverId: string;
}

const socket: Socket = io(`${apiUrl}`);

const ChatApplication: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [receiverId, setReceiverId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [showAddChatModal, setShowAddChatModal] = useState<boolean>(false);
  const [availableUsers, setAvailableHosts] = useState<User[]>([]);
  const [searchUsers, setSearchUsers] = useState<string>('');
  const [showFileOptions, setShowFileOptions] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [onlineHosts, setOnlineHosts] = useState<string[]>([]);
  const [isMobileView, setIsMobileView] = useState<boolean>(false);
  
  const [isCallActive, setIsCallActive] = useState<boolean>(false);
  const [isCallInitiator, setIsCallInitiator] = useState<boolean>(false);
  
  const location = useLocation();
  const hostId = location.state?.hostId || null;
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedChatRef = useRef(selectedChat);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    socket.emit("getOnlineHosts");

    socket.on("onlineHosts", (hosts) => {
      console.log("Online hosts:", hosts);
      setOnlineHosts(hosts);
    });

    socket.on("hostLoggedIn", (hostId: string) => {
      setOnlineHosts((prev) => {
        if (!prev.includes(hostId)) {
          return [...prev, hostId];
        }
        return prev;
      });
    });

    socket.on("hostLoggedOut", (hostId: string) => {
      console.log("Host logged out:", hostId);
      setOnlineHosts((prev) => prev.filter((id: string) => id !== hostId));
    });

    socket.on('incoming_call', ({ callerId, callerName, chatId }) => {
      console.log('Incoming call from:', callerName,callerId);
      if (selectedChat && selectedChat.id === chatId) {
        setIsCallActive(true);
        setIsCallInitiator(false);
      }
    });

    socket.on('counted_read',({chatId,receiverId})=>{
          console.log(chatId,receiverId,"heyyy")
        })

    return () => {
      socket.off("onlineHosts");
      socket.off("hostLoggedIn");
      socket.off("hostLoggedOut");
      socket.off("incoming_call");
      socket.off("counted_read");
    };
  }, [selectedChat]);

  const fetchAvailableHosts = async () => {
    try {
      const res = await getAllHosts();
      console.log(res.data.message, 'ss')
      setAvailableHosts(res.data.message || []);
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("userAccessToken");
    if (token) {
      try {
        const payloadBase64 = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        const id = decodedPayload._id
        setUserId(id)
      } catch (error) {
        console.error("Invalid token format", error);
      }
    }
  }, [])

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const id = hostId?._id;
        const res = await getChat(id);
        const chatData = Array.isArray(res.data.data) ? res.data.data : [res.data.data];
        
        const formattedChats = chatData.map((chat: Chats) => ({
          id: chat._id,
          name: chat.participant2.name,
          lastMessage: chat.latestMessage || "No messages yet",
          receiverId: chat.participant2._id,
          lastMessageTime: chat.updatedAt,
          unreadCount: 0,
          messages: [],
          type: chat.type
        }));

        setChats(formattedChats);
        console.log(chats)
      } catch (error) {
        console.error("Error fetching chats", error);
      }
    };

    fetchChats();
    fetchAvailableHosts();

    return () => {
      socket.off("receive_message");
    };
  }, [hostId]);

  useEffect(() => {
    socket.on('receive_old_messages', ({ chatId, messages }) => {
      console.log("Received old messages:", messages);
      setSelectedChat(prevChat => {
        if (!prevChat || prevChat.id !== chatId) return prevChat;
        return { ...prevChat, messages };
      });

      setTimeout(scrollToBottom, 100);
    });

    socket.on('receiveMessage', (newMessage) => {
      console.log("New message received:", newMessage);
      console.log(chats, 'Before')
      
      setSelectedChat(prevChat => {
        if (!prevChat || prevChat.id !== newMessage.savedMessage.chatId) return prevChat;
        const updatedMessages = [...(prevChat.messages || []), newMessage.savedMessage];
        const updatedChat = { ...prevChat, messages: updatedMessages };
        return updatedChat;
      });
      
      console.log(newMessage, 'heee')
      setChats(prevChats =>
        prevChats.map(chat => {
          const isMatched = chat.id === newMessage.savedMessage?.chatId;
          console.log('Chat ID:', chat.id);
          console.log('Selected Chat ID:', newMessage.savedMessage.chatId);
          console.log('Match Found:', isMatched);

          if (isMatched) {
            console.log('Updating chat with message:', newMessage.savedMessage.message);
            console.log('Timestamp:', newMessage.savedMessage.timestamp);
            return {
              ...chat,
              lastMessage: newMessage.savedMessage.message,
              lastMessageTime: newMessage.savedMessage.timestamp,
              type: newMessage.savedMessage.type,
              unreadCount:newMessage.readCount
            };
          } else {
            return chat;
          }
        })
      );
      
      setTimeout(scrollToBottom, 100);
    });

    return () => {
      socket.off('receive_old_messages');
      socket.off('receiveMessage');
    };
  }, [chats]);

  useEffect(() => {
    console.log("Chats updated:", selectedChat);
  }, [chats, selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages]);

  const handleSelectChat = (chat: Chat, receiverId: string) => {
    console.log('fdlf',selectedFile)
    setSelectedChat(chat);
    setReceiverId(receiverId);
    socket.emit('join_room', chat.id);
    socket.emit("old_message", { chatId: chat.id });
    const chatId = chat.id
    socket.emit('count_read',{chatId,receiverId})
    setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === chatId
            ? {
              ...chat,
              unreadCount:0
            }
            : chat
        )
      );
  };

  const handleBackToChats = () => {
    setSelectedChat(null);
  };

  const handleFileSelect = (type: string) => {
    if (fileInputRef.current) {
      if (type === 'image') {
        fileInputRef.current.accept = 'image/*';
      }
      fileInputRef.current.click();
    }
    setShowFileOptions(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      handleSendFile(file);
    }
  };

  const handleSendFile = (file: File) => {
    if (!selectedChat || !file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const message: Message = {
        chatId: selectedChat.id,
        senderId: userId,
        receiverId: receiverId,
        message: reader.result as string,
        type: file.type.startsWith('image/') ? 'image' : 'document',
        isRead: false,
        timestamp: new Date().toISOString(),
      };

      socket.emit('send_message', message);
      setSelectedChat((prevChat) => {
        if (!prevChat) return null;
        return {
          ...prevChat,
          messages: [...prevChat.messages, message],
        };
      });
      
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === selectedChat.id
            ? {
              ...chat,
              lastMessage: message.message,
              lastMessageTime: message.timestamp,
            }
            : chat
        )
      );
      
      setTimeout(scrollToBottom, 100);
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = () => {
    if (!selectedChat) {
      return null;
    }

    if (newMessage.trim() && selectedChat) {
      const message: Message = {
        chatId: selectedChat.id,
        senderId: userId,
        receiverId: receiverId,
        message: newMessage,
        type: 'text',
        isRead: false,
        timestamp: new Date().toISOString(),
      };

      socket.emit('send_message', message);
      console.log(chats, 'Mumb')
      setSelectedChat((prevChat) => {
        if (!prevChat) return null;
        return {
          ...prevChat,
          messages: [...prevChat.messages, message],
        };
      });
      console.log(chats, 'chats')

      setChats(prevChats => {
        const updatedChats = prevChats.map(chat =>
          chat.id === selectedChat.id
            ? {
              ...chat,
              lastMessage: message.message,
              lastMessageTime: message.timestamp,
            }
            : chat
        );

        const sortedChats = [...updatedChats].sort((a, b) => {
          const timeA = new Date(a.lastMessageTime || 0).getTime();
          const timeB = new Date(b.lastMessageTime || 0).getTime();
          return timeB - timeA;
        });

        return sortedChats;
      });

      setNewMessage('');
      setTimeout(scrollToBottom, 100);
    }
  };

  const initiateVideoCall = () => {
    if (!selectedChat || !onlineHosts.includes(receiverId)) {
      alert('User is not online for video call');
      return;
    }

    console.log('Initiating video call to:', selectedChat.name);
    setIsCallActive(true);
    setIsCallInitiator(true);
  };

  const handleEndCall = () => {
    console.log('Ending call');
    setIsCallActive(false);
    setIsCallInitiator(false);
  };

  const handleAddNewChat = async (selectedUser: User) => {
    try {
      // if(!selectedChat._id)
      const res = await createChat(selectedUser?._id)
      console.log(res.data, "Response")
      if (res.data.chat == 'Chat Created') {
        setShowAddChatModal(false)
        socket.emit('get_all_chats', userId);

        socket.on('receive_all_chats', (chats) => {
          console.log("Received all chats", chats)
          const setChatss = chats.map((chat: Chats) => {
            const formattedTime = chat.updatedAt
            return {
              id: chat._id,
              name: chat.participant2.name,
              lastMessage: chat.latestMessage || "No message yet",
              receiverId: chat.participant2._id,
              lastMessageTime: formattedTime,
              type: chat.type,
            };
          })
          setChats(setChatss)
          console.log(chats, 'Chattt')
        })
      }
    } catch (error) {
      console.error('Error creating new chat:', error);
      alert('Failed to create chat. Please try again.');
    }
  };

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = availableUsers.filter((user) =>
    user.name.toLowerCase().includes(searchUsers.toLowerCase()) &&
    user._id !== userId &&
    !chats.some(chat => chat.receiverId === user._id)
  );

  const renderMessage = (msg: Message, index: number) => {
    const isOwnMessage = msg.senderId === userId;
    
    return (
      <div
        key={index}
        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-3`}
      >
        <div
          className={`max-w-[85%] sm:max-w-[70%] p-2 sm:p-3 rounded-lg ${isOwnMessage
            ? 'bg-white border shadow-sm'
            : 'bg-green-500 text-white'
            }`}
        >
          {msg.type === 'image' && msg.message ? (
            <div>
              <img
                src={msg.message}
                alt={msg.message}
                className="max-w-full h-auto rounded-lg mb-2 cursor-pointer"
                onClick={() => window.open(msg.fileUrl, '_blank')}
              />
            </div>
          ) : (
            <p className="text-xs sm:text-sm break-words">{msg.message}</p>
          )}

          <span className={`text-xs block mt-1 text-right ${isOwnMessage ? 'text-gray-500' : 'text-green-100'
            }`}>
            <span className={`block ${isOwnMessage ? 'text-black' : 'text-white'}`}>
              {new Date(msg.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })}
            </span>
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-[89vh] bg-white border rounded-lg shadow-md overflow-hidden">
      <div className={`${isMobileView && selectedChat ? 'hidden' : 'block'} w-full md:w-1/3 border-r bg-gray-50`}>
        <div className="p-3 sm:p-4 border-b">
          <div className="flex space-x-2">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search chats"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 pl-8 text-sm border rounded-full focus:outline-none focus:ring-2 focus:ring-green-200"
              />
              <Search size={16} className="absolute left-2 top-3 text-gray-400" />
            </div>
            <button
              onClick={() => setShowAddChatModal(true)}
              className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors flex-shrink-0"
              title="Add new chat"
            >
              <Plus size={16} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto h-[calc(100%-80px)] sm:h-[calc(100%-100px)]">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => handleSelectChat(chat, chat.receiverId)}
              className={`flex items-center p-3 sm:p-4 hover:bg-gray-100 cursor-pointer ${selectedChat?.id === chat.id ? 'bg-gray-200' : ''
                }`}
            >
              <img
                src={dummy_profile}
                alt={chat.name}
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full mr-3 sm:mr-4 flex-shrink-0 ${onlineHosts.includes(chat?.receiverId) ? 'border-2 border-green-500' : ''
                  }`}
              />
              <div className="flex-grow min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-sm sm:text-base truncate pr-2">{chat.name}</h3>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {new Date(chat.lastMessageTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </span>
                  {/* <span>{chat.unreadCount}</span> */}
                </div>
                <div className="flex justify-between items-center mt-1">
                  <div className="text-xs sm:text-sm text-gray-600 truncate flex items-center flex-grow min-w-0">
                    {chat?.type === 'image' ? (
                      <>
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="truncate">Photo</span>
                      </>
                    ) : (
                      <p className="truncate">{chat.lastMessage}</p>
                    )}
                  </div>
                  {chat.unreadCount > 0 && (
                    <span className="bg-green-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center flex-shrink-0 ml-2">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedChat && (
        <div className={`flex flex-col ${isMobileView ? 'w-full' : 'w-2/3'}`}>
          <div className="flex items-center justify-between p-3 sm:p-4 bg-white border-b">
            <div className="flex items-center min-w-0 flex-grow">
              {isMobileView && (
                <button
                  onClick={handleBackToChats}
                  className="mr-2 p-1 hover:bg-gray-100 rounded-full flex-shrink-0"
                >
                  <ArrowLeft size={20} className="text-gray-600" />
                </button>
              )}
              <img 
                src={dummy_profile} 
                alt={selectedChat.name} 
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-2 sm:mr-4 flex-shrink-0" 
              />
              <div className="min-w-0 flex-grow">
                <h2 className="font-semibold text-sm sm:text-base truncate">{selectedChat.name}</h2>
                <div className="flex items-center space-x-1 sm:space-x-1.5 mt-0.5">
                  {onlineHosts.includes(selectedChat.receiverId) ? (
                    <>
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium text-green-600">Online</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">Offline</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0">
              <button
                onClick={initiateVideoCall}
                disabled={!onlineHosts.includes(selectedChat.receiverId)}
                className={`p-1.5 sm:p-2 rounded-full transition-colors ${
                  onlineHosts.includes(selectedChat.receiverId)
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                title={onlineHosts.includes(selectedChat.receiverId) ? 'Start video call' : 'User is offline'}
              >
                <Video size={16} className="sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          <div
            ref={messagesContainerRef}
            className="flex-grow overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-3"
          >
            {selectedChat?.messages?.map((msg, index) => renderMessage(msg, index))}
          </div>

          <div className="bg-white p-2 sm:p-4 border-t">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="relative">
                <button
                  onClick={() => setShowFileOptions(!showFileOptions)}
                  className="text-gray-500 hover:text-gray-700 p-1.5 sm:p-2 rounded-full hover:bg-gray-100"
                >
                  <Paperclip size={16} className="sm:w-5 sm:h-5" />
                </button>

                {showFileOptions && (
                  <div className="absolute bottom-full left-0 mb-2 bg-white border rounded-lg shadow-lg p-2 min-w-32 z-10">
                    <button
                      onClick={() => handleFileSelect('image')}
                      className="flex items-center space-x-2 w-full p-2 hover:bg-gray-100 rounded"
                    >
                      <Image size={14} className="text-blue-500" />
                      <span className="text-sm">Photo</span>
                    </button>
                  </div>
                )}
              </div>

              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message"
                className="flex-grow p-2 text-sm border rounded-full focus:outline-none focus:ring-2 focus:ring-green-200"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />

              <button
                onClick={handleSendMessage}
                className="bg-green-500 text-white p-1.5 sm:p-2 rounded-full hover:bg-green-600 flex-shrink-0"
              >
                <Send size={16} className="sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}

      {showAddChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add New Chat</h3>
              <button
                onClick={() => {
                  setShowAddChatModal(false);
                  setSearchUsers('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search hosts"
                value={searchUsers}
                onChange={(e) => setSearchUsers(e.target.value)}
                className="w-full p-2 pl-8 text-sm border rounded-full focus:outline-none focus:ring-2 focus:ring-green-200"
              />
              <Search size={16} className="absolute left-2 top-3 text-gray-400" />
            </div>

            <div className="max-h-60 overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <p className="text-gray-500 text-center py-4 text-sm">No hosts found</p>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => handleAddNewChat(user)}
                    className="flex items-center p-3 hover:bg-gray-100 cursor-pointer rounded"
                  >
                    <img
                      src={user.avatar || dummy_profile}
                      alt={user.name}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-3 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-grow">
                      <h4 className="font-medium text-sm sm:text-base truncate">{user.name}</h4>
                      {user.email && (
                        <p className="text-xs sm:text-sm text-gray-500 truncate">{user.email}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {isCallActive && selectedChat && (
        <VideoCall
          socket={socket}
          isCallActive={isCallActive}
          onEndCall={handleEndCall}
          chatId={selectedChat.id}
          userId={userId}
          receiverId={selectedChat.receiverId}
          receiverName={selectedChat.name}
          isInitiator={isCallInitiator}
        />
      )}
    </div>
  );
};

export default ChatApplication;