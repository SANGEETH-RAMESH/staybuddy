import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, Search, Plus, Paperclip, Image, FileText, X, Clock } from 'lucide-react';
import dummy_profile from '../../../assets/dummy profile.png';
import apiClient from '../../../services/apiClient';
import { LOCALHOST_URL } from '../../../constants/constants';
import { useLocation } from 'react-router-dom';

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
  // lastMessageTime: string;
}

const socket: Socket = io('http://localhost:4000');

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
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    socket.emit("getOnlineHosts");

    socket.on("onlineHosts", (hosts) => {
      console.log("✅ Online hosts:", hosts);
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
      console.log("🚪 Host logged out:", hostId);
      setOnlineHosts((prev) => prev.filter((id: string) => id !== hostId));
    });

    return () => {
      socket.off("onlineHosts");
      socket.off("hostLoggedIn");
      socket.off("hostLoggedOut");
    };
  }, []);

  const fetchAvailableHosts = async () => {
    try {
      const res = await apiClient.get(`${LOCALHOST_URL}/user/allHosts`, {
        headers: { Authorization: `Bearer` },
      });
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
        // console.log(decodedPayload, "Decoded Payload");
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
        console.log(hostId?._id, 'Hello');
        const id = hostId?._id;
        const res = await apiClient.get(`${LOCALHOST_URL}/chat/getChat`, {
          params: { id },
          headers: { Authorization: `Bearer` },
        });
        console.log(res.data.data)
        const chatData = Array.isArray(res.data.data) ? res.data.data : [res.data.data];
        // console.log(chatData,'dfsdfd')
        // setUserId(chatData[0]?.participant1);
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
      // const currentSelectedChat = selectedChatRef.current;
      setSelectedChat(prevChat => {
        if (!prevChat || prevChat.id !== newMessage.chatId) return prevChat;
        const updatedMessages = [...(prevChat.messages || []), newMessage];
        const updatedChat = { ...prevChat, messages: updatedMessages };
        return updatedChat;
      });
      console.log(newMessage, 'heee')
      setChats(prevChats =>
        prevChats.map(chat => {
          const isMatched = chat.id === newMessage?.chatId;
          console.log('Chat ID:', chat.id);
          console.log('Selected Chat ID:', newMessage.chatId);
          console.log('Match Found:', isMatched);

          if (isMatched) {
            console.log('Updating chat with message:', newMessage.message);
            console.log('Timestamp:', newMessage.timestamp);
            return {
              ...chat,
              lastMessage: newMessage.message,
              lastMessageTime: newMessage.timestamp,
              type: newMessage.type
            };
          } else {
            return chat;
          }
        })
      );
      // console.log(chats, 'Changu')
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
    // console.log(chat, 'chatIddfdf')
    setSelectedChat(chat);
    console.log(chat, 'sett')
    setReceiverId(receiverId);
    socket.emit('join_room', chat.id);
    socket.emit("old_message", { chatId: chat.id });
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
        // fileName: file.name,
        // fileUrl: reader.result as string,
        // fileSize: file.size,
        isRead: false,
        timestamp: new Date().toISOString(),
      };

      // console.log(selectedChat, 'Before')
      socket.emit('send_message', message);
      setSelectedChat((prevChat) => {
        if (!prevChat) return null;
        return {
          ...prevChat,
          messages: [...prevChat.messages, message],
        };
      });
      // console.log(selectedChat, 'Selected')
      // console.log(chats, 'chats')
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
      // console.log(chats, 'Kazhinjitt')
      setTimeout(scrollToBottom, 100);
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = () => {
    if (!selectedChat) {
      return null;
    }




    // const now = new Date();
    // const formattedTime = now.toLocaleTimeString([], {
    //   hour: '2-digit',
    //   minute: '2-digit',
    //   hour12: false,
    // });

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
        // First, update the specific chat
        const updatedChats = prevChats.map(chat =>
          chat.id === selectedChat.id
            ? {
              ...chat,
              lastMessage: message.message,
              lastMessageTime:message.timestamp,
            }
            : chat
        );

        // Then sort by latest lastMessageTime (newest first)
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

  const handleAddNewChat = async (selectedUser: User) => {
    try {
      // Create new chat with selected user
      console.log(selectedUser, 'Userr')
      const res = await apiClient.post(`${LOCALHOST_URL}/chat/createchat`, {
        ownerId: selectedUser._id
      }, {
        headers: { Authorization: `Bearer` }
      });
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
          // setChats(chats)
        })
        // const newChat: Chat = {
        //   id: res.data.data._id,
        //   name: selectedUser.name,
        //   lastMessage: "No messages yet",
        //   receiverId: selectedUser._id,
        //   lastMessageTime: "",
        //   unreadCount: 0,
        //   messages: [],
        // };
        // setChats(prev => [...prev, newChat]);
        // setSelectedChat(newChat);
        // setReceiverId(selectedUser._id);
        // setShowAddChatModal(false);
        // setSearchUsers('');

        // socket.emit('join_room', newChat.id);
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

  // const formatFileSize = (bytes: number) => {
  //   if (bytes === 0) return '0 Bytes';
  //   const k = 1024;
  //   const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  //   const i = Math.floor(Math.log(bytes) / Math.log(k));
  //   return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  // };

  const renderMessage = (msg: Message, index: number) => {
    const isOwnMessage = msg.senderId === userId;
    // console.log(msg, "Message")
    return (
      <div
        key={index}
        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-3`}
      >
        <div
          className={`max-w-[70%] p-3 rounded-lg ${isOwnMessage
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
              {/* <p className="text-sm">{msg.fileName}</p> */}
            </div>
          ) : (
            <p className="text-sm">{msg.message}</p>
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
    <div className="flex h-[89svh] bg-white border rounded-lg shadow-md overflow-hidden">
      {/* Chat List Sidebar */}
      <div className="w-1/3 border-r bg-gray-50">
        {/* Search Bar with Add Button */}
        <div className="p-4 border-b">
          <div className="flex space-x-2">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search chats"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 pl-8 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-200"
              />
              <Search size={20} className="absolute left-2 top-3 text-gray-400" />
            </div>
            <button
              onClick={() => setShowAddChatModal(true)}
              className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors"
              title="Add new chat"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Chat List */}
        <div className="overflow-y-auto h-[calc(100%-100px)]">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => handleSelectChat(chat, chat.receiverId)}
              className={`flex items-center p-4 hover:bg-gray-100 cursor-pointer ${selectedChat?.id === chat.id ? 'bg-gray-200' : ''
                }`}
            >
              <img
                src={dummy_profile}
                alt={chat.name}
                className={`w-12 h-12 rounded-full mr-4 ${onlineHosts.includes(chat?.receiverId) ? 'border-2 border-green-500' : ''
                  }`}
              />
              <div className="flex-grow">
                <div className="flex justify-between">
                  <h3 className="font-semibold">{chat.name}</h3>
                  <span className="text-xs text-gray-500">
                    {/* {chat.lastMessageTime} */}
                    {new Date(chat.lastMessageTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <div className="text-sm text-gray-600 truncate flex items-center">
                    {chat?.type === 'image' ? (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Photo</span>
                      </>
                    ) : (
                      <p>{chat.lastMessage}</p>
                    )}
                  </div>
                  {chat.unreadCount > 0 && (
                    <span className="bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Individual Chat Area */}
      {selectedChat && (
        <div className="flex flex-col w-2/3">
          {/* Chat Header */}
          <div className="flex items-center p-4 bg-white border-b">
            <img src={dummy_profile} alt={selectedChat.name} className="w-10 h-10 rounded-full mr-4" />
            <div>
              <h2 className="font-semibold">{selectedChat.name}</h2>
              <div className="flex items-center space-x-1.5 mt-0.5">
                {onlineHosts.includes(selectedChat.receiverId) ? (
                  <>
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-green-600">Online</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">Offline</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Messages Container */}
          <div
            ref={messagesContainerRef}
            className="flex-grow overflow-y-auto p-4 space-y-3"
          >
            {selectedChat?.messages?.map((msg, index) => renderMessage(msg, index))}
          </div>

          {/* Message Input Area */}
          <div className="bg-white p-4 border-t">
            <div className="flex items-center space-x-2">
              {/* Attachment Button */}
              <div className="relative">
                <button
                  onClick={() => setShowFileOptions(!showFileOptions)}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
                >
                  <Paperclip size={20} />
                </button>

                {showFileOptions && (
                  <div className="absolute bottom-full left-0 mb-2 bg-white border rounded-lg shadow-lg p-2 min-w-32">
                    <button
                      onClick={() => handleFileSelect('image')}
                      className="flex items-center space-x-2 w-full p-2 hover:bg-gray-100 rounded"
                    >
                      <Image size={16} className="text-blue-500" />
                      <span className="text-sm">Photo</span>
                    </button>
                    {/* <button
                      onClick={() => handleFileSelect('document')}
                      className="flex items-center space-x-2 w-full p-2 hover:bg-gray-100 rounded"
                    >
                      <FileText size={16} className="text-green-500" />
                      <span className="text-sm">Document</span>
                    </button> */}
                  </div>
                )}
              </div>

              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message"
                className="flex-grow p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-200"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />

              <button
                onClick={handleSendMessage}
                className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600"
              >
                <Send size={20} />
              </button>
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}

      {/* Add Chat Modal */}
      {showAddChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-96">
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

            {/* Search Hosts */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search hosts"
                value={searchUsers}
                onChange={(e) => setSearchUsers(e.target.value)}
                className="w-full p-2 pl-8 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-200"
              />
              <Search size={16} className="absolute left-2 top-3 text-gray-400" />
            </div>

            {/* Users List */}
            <div className="max-h-60 overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hosts found</p>
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
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                      <h4 className="font-medium">{user.name}</h4>
                      {user.email && (
                        <p className="text-sm text-gray-500">{user.email}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatApplication;