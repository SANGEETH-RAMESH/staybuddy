import React, { useState, useEffect, useRef } from 'react';
import { Send, Search, UserPlus, Loader2, Clock, Paperclip, Image, X,  Video } from 'lucide-react';
import dummy_profile from '../../../assets/dummy profile.png'
const apiUrl = import.meta.env.VITE_LOCALHOST_URL;
import { io, Socket } from 'socket.io-client';
import VideoCall from '../../commonComponents/VideoCall'
import { Message } from '../../../interface/Message';
import { User } from '../../../interface/User';
import { Chats } from '../../../interface/Chats';
import createApiClient from '../../../services/apiClient';
const hostApiClient = createApiClient('host');

const socket: Socket = io('http://localhost:4000')

const HostChatBody = () => {
  const [chats, setChats] = useState<Chats[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chats | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [hostId, setHostId] = useState<string>('')
  const [receiverId, setReceiverId] = useState<string>('')
  const [searchUsers, setSearchUsers] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [onlineUser, setOnlineUsers] = useState<string[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [showAddChatModal, setShowAddChatModal] = useState<boolean>(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [isCallActive, setIsCallActive] = useState<boolean>(false);
  const [isCallInitiator, setIsCallInitiator] = useState<boolean>(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredUsers = availableUsers.filter((user) =>
    user.name.toLowerCase().includes(searchUsers.toLowerCase()) &&
    !chats.some(chat => chat.receiverId === user._id)
  );

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFilePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
      setShowFileMenu(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  

  


  useEffect(() => {
    socket.emit("getOnlineUsers");

    socket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    socket.on("userLoggedIn", (userId: string) => {
      setOnlineUsers((prev) => {
        if (!prev.includes(userId)) {
          return [...prev, userId];
        }
        return prev;
      });
    });

    socket.on("userLoggedOut", (userId: string) => {
      setOnlineUsers(prev => prev.filter((id: string) => id !== userId));
    });

    socket.on('incoming_call', ({ callerId, callerName, chatId }) => {
      console.log('Incoming call from:', callerName);
      console.log(selectedChat,selectedChat?._id,chatId)
     
        setIsCallActive(true);
        setIsCallInitiator(false);
      
    });

    return () => {
      socket.off("onlineUsers");
      socket.off("userLoggedOut");
      socket.off("userLoggedIn");
      socket.off("incoming_call")
    };
  }, []);


  useEffect(() => {
    const token = localStorage.getItem("hostAccessToken");
    if (token) {
      try {
        const payloadBase64 = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        console.log(decodedPayload, "Decoded Payload");
        const id = decodedPayload._id
        setHostId(id)
      } catch (error) {
        console.error("Invalid token format", error);
      }
    }
  }, [])

  const initiateVideoCall = () => {
    console.log(selectedChat,'chhatttt')
    if (!selectedChat || !onlineUser.includes(receiverId)) {
      console.log(selectedChat, !onlineUser.includes(receiverId))
      alert('User is not online for video call');
      return;
    }

    console.log('Initiating video call to:', selectedChat.name);
    setIsCallActive(true);
    setIsCallInitiator(true);
  };

  const handleEndCall = () => {
    console.log(' Ending call');
    setIsCallActive(false);
    setIsCallInitiator(false);
  };

  const handleAddNewChat = async (selectedUser: User) => {
    try {
      // Create new chat with selected user
      console.log(selectedUser, 'Userr')
      const res = await hostApiClient.post(`${apiUrl}/chat/hostChat`, {
        userId: selectedUser._id
      }, {
        headers: { Authorization: `Bearer` }
      });
      console.log(res.data, "Response")
      if (res.data.message == 'Chat Created') {
        setShowAddChatModal(false)
        const id = hostId
        console.log('Id', id)
        socket.emit('get_all_hostchats', id);

        socket.on('receive_all_hostchats', (chats) => {
          console.log("Received all chats", chats)
          const setChatss = chats.map((chat: Chats) => {

            const formattedTime = chat.updatedAt
            return {
              id: chat._id,
              name: chat.participant1.name,
              lastMessage: chat.latestMessage || "No message yet",
              receiverId: chat.participant1._id,
              lastMessageTime: formattedTime,
              type: chat.type,
            };
          })
          setChats(setChatss)

          console.log(chats, 'Chattt')
          // setChats(chats)
        })
       
      }
    } catch (error) {
      console.error('Error creating new chat:', error);
      alert('Failed to create chat. Please try again.');
    }
  };

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await hostApiClient.get(`${apiUrl}/chat/getHostChat`)
        const chatData = Array.isArray(response.data.data) ? response.data.data : [response.data.data]
        const chatss = chatData.map((chat: Chats) => {
          return {
            _id: chat._id,
            name: chat.participant1.name,
            latestMessage: chat.latestMessage,
            receiverId: chat.participant1._id,
            messages: [],
            latestMessageTime: chat.updatedAt,
            type: chat.type
          };
        });
        // console.log(chatData, 'cahtttt')
        setReceiverId(chatData[0]?.participant1?._id)
        // setHostId(chatData[0]?.participant2)
        // console.log(hostId, 'hist')
        setChats(chatss)
        setIsLoading(false)
        // console.log(chatss, 'Chatss')
      } catch (error) {
        console.log(error)
      }
    }
    fetchChats()
    fetchAvailableUsers()
  }, [])

  const fetchAvailableUsers = async () => {
    try {
      const response = await hostApiClient.get(`${apiUrl}/host/allUsers`);
      const users = response.data.message
      setAvailableUsers(users)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    socket.on('receive_old_messages', ({ chatId, messages }) => {
      setSelectedChat(prevChat => {
        if (!prevChat || prevChat._id !== chatId) return prevChat;
        const updatedChat = { ...prevChat, messages };
        setMessages(messages)
        return updatedChat;
      });
      setTimeout(scrollToBottom, 100);
    });

    socket.on('receiveMessage', (newMessage) => {
      console.log("New message received:", newMessage);

      setSelectedChat(prevChat => {
        if (!prevChat || prevChat._id !== newMessage.chatId) return prevChat;
        // console.log(prevChat.messages)
        const updatedMessages = [...(prevChat.messages || []), newMessage];
        const updatedChat = { ...prevChat, messages: updatedMessages };
        setMessages(updatedMessages);
        return updatedChat;
      });
      console.log(chats, 'chatsss')
      setChats(prevChats => {
        const updatedChats = prevChats.map(chat => {
          console.log("Matched:", chat._id, selectedChat?._id);
          if (chat._id === newMessage?.chatId) {
            console.log("Matched Chat:", chat._id, selectedChat?._id);
            return {
              ...chat,
              latestMessage: newMessage.message,
              latestMessageTime: newMessage.timestamp,
              type: newMessage.type
            };
          } else {
            console.log("Unchanged Chat:", chat);
            return chat;
          }
        });

        console.log("All Updated Chats:", updatedChats);
        return updatedChats;
      });

      console.log(chats, 'After')

      setTimeout(scrollToBottom, 100);
    });

    return () => {
      socket.off('receive_old_messages');
      socket.off('receiveMessage');
    };
  }, [chats, selectedChat?._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSelectChat = (chat: Chats, receiverId: string) => {
    // console.log(chat, 'dsfdsf')

    setSelectedChat(chat);
    setMessages(chat.messages || [])
    setReceiverId(receiverId)
    // console.log("receiver", receiverId)
    socket.emit('join_room', chat._id);
    socket.emit("old_message", { chatId: chat._id });
  };

  const handleSendMessage = async () => {
    if (!selectedChat) {
      return "selected Chat is null"
    }

    try {
      setIsUploading(true);

      let fileData = '';
      let messageType: 'text' | 'image' | 'document' = 'text';
      // let fileName = '';
      // let fileSize = 0;

      if (selectedFile) {
        fileData = await convertFileToBase64(selectedFile);
        messageType = selectedFile.type.startsWith('image/') ? 'image' : 'document';
        // fileName = selectedFile.name;
        // fileSize = selectedFile.size;
      }

      if (!newMessage.trim() && !selectedFile) {
        setIsUploading(false);
        return;
      }
      console.log("Type", messageType)
      console.log(newMessage, 'heeel')
      console.log("Selected", selectedFile)
      console.log("FileData", fileData)
      const message: Message = {
        chatId: selectedChat._id,
        senderId: hostId,
        receiverId: receiverId,
        message: messageType == 'image' ? fileData : newMessage,
        timestamp: new Date().toISOString(),
        isRead: false,
        type: messageType,
      };
      socket.emit('send_message', message);
      setSelectedChat((prevChat) => {
        if (!prevChat) return null;

        return {
          ...prevChat,
          messages: [...prevChat.messages, message],
        } as Chats;
      });
      setChats(prevChats => {
        const updatedChats = prevChats.map(chat =>
          chat._id === selectedChat._id
            ? {
              ...chat,
              lastMessage: message.message,
              latestMessageTime: message.timestamp,
            }
            : chat
        );
        const sortedChats = [...updatedChats].sort((a, b) => {
          const timeA = new Date(a.latestMessageTime || 0).getTime();
          const timeB = new Date(b.latestMessageTime || 0).getTime();
          return timeB - timeA;
        });

        return sortedChats;
      });
      setNewMessage('');
      handleRemoveFile();
      setIsUploading(false);

      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsUploading(false);
    }
  };
  const renderMessage = (msg: Message, index: number) => {
    const isOwn = msg.senderId === hostId;
    return (
      <div
        key={index}
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}
      >
        <div
          className={`max-w-[70%] p-3 rounded-lg ${isOwn
            ? 'bg-white border shadow-sm'
            : 'bg-green-500 text-white'
            }`}
        >
          {msg.messageType === 'image' && msg.fileUrl ? (
            <div className="mb-2">
              <div className="relative group">
                <img
                  src={msg.fileUrl}
                  alt="Shared image"
                  className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-95 transition-opacity max-h-64 object-contain"
                  onClick={() => {
                    const newWindow = window.open('', '_blank');
                    if (newWindow) {
                      newWindow.document.write(`
                        <html>
                          <head><title>Image Preview</title></head>
                          <body style="margin:0;padding:20px;background:#000;display:flex;justify-content:center;align-items:center;min-height:100vh;">
                            <img src="${msg.fileUrl}" style="max-width:100%;max-height:100vh;object-fit:contain;" />
                          </body>
                        </html>
                      `);
                    }
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-30 rounded-lg">
                  <div className="text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">Click to view full size</div>
                </div>
              </div>
              {msg.fileName && (
                <p className="text-xs mt-1 opacity-75">{msg.fileName}</p>
              )}
            </div>
          ) : null}

          {msg.message && (
            msg.type === 'image' ? (
              <img src={msg.message} alt="Message image" className="max-w-full h-auto" />
            ) : (
              <p className="text-sm">{msg.message}</p>
            )
          )}

          <span className={`text-xs block mt-1 text-right ${isOwn ? 'text-gray-500' : 'text-green-100'
            }`}>
            {new Date(msg.timestamp).toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })}
          </span>
        </div>
      </div>
    );
  };
  return (
    <div className="flex h-screen max-h-[600px] bg-white border rounded-lg shadow-lg overflow-hidden">
      <div className="w-1/3 border-r flex flex-col">
        {/* <div className="bg-green-600 text-white p-4 flex justify-between items-center">
          <h2 className="font-bold text-lg">Host Messages</h2>
          <div className="flex space-x-2">
            <Bell size={20} className="cursor-pointer" />
            <Settings size={20} className="cursor-pointer" />
          </div>
        </div> */}
        <div className="p-4 border-b">
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 pl-8 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <Search size={18} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {chats?.length > 0 ? (
            chats.map((chat: Chats) => {
              console.log(chat);
              return (
                <div
                  key={chat._id}
                  onClick={() => handleSelectChat(chat, chat.receiverId)}
                  className={`flex items-center p-4 border-b hover:bg-gray-50 cursor-pointer ${selectedChat?._id === chat._id ? 'bg-green-50' : ''}`}
                >
                  <div className="relative">
                    {dummy_profile ? (
                      <img
                        src={dummy_profile}
                        alt={chat.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-bold text-lg">
                        {chat.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="ml-3 flex-grow">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{chat.name}</h3>
                      <span className="text-xs text-gray-500">
                        {chat.latestMessageTime ? new Date(chat.latestMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <div className="text-sm text-gray-600 truncate flex items-center">
                        {chat.type === 'image' ? (
                          <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Photo</span>
                          </>
                        ) : (
                          <p>{chat.latestMessage}</p>
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
              );
            })
          ) : (
            <div className="p-4 text-center text-gray-500">No conversations found</div>
          )}
        </div>
        <div className="p-4 border-t">
          <button
            onClick={() => setShowAddChatModal(true)}
            className="w-full bg-green-600 text-white py-2 rounded-lg flex items-center justify-center hover:bg-green-700">
            <UserPlus size={18} className="mr-2" />
            New Message
          </button>
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* <div className="flex items-center p-4 bg-white border-b">
              <div>
                <h2 className="font-semibold">{selectedChat.name}</h2>
              </div>
            </div> */}
            <div className="p-4 border-b flex justify-between items-center bg-white">
              <div className="flex items-center">
                <img src={dummy_profile} alt={selectedChat.name} className="w-10 h-10 rounded-full mr-4" />
                <div className="ml-3">
                  <h2 className="font-medium">{selectedChat.name}</h2>

                  {/* Enhanced status display */}
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    {onlineUser.includes(selectedChat.receiverId) ? (
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
              <div className="flex items-center space-x-2">
                <button
                  onClick={initiateVideoCall}
                  disabled={!onlineUser.includes(selectedChat.receiverId)}
                  className={`p-2 rounded-full transition-colors ${onlineUser.includes(selectedChat.receiverId)
                      ? 'bg-blue-500 hover:bg-blue-600 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  title={onlineUser.includes(selectedChat.receiverId) ? 'Start video call' : 'User is offline'}
                >
                  <Video size={20} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 size={30} className="animate-spin text-green-500" />
                </div>
              ) : selectedChat.messages?.length > 0 ? (
                <div className="space-y-3">
                  {selectedChat.messages?.map((msg, index) => renderMessage(msg, index))}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="flex justify-center items-center h-full text-gray-500">
                  No messages yet
                </div>
              )}
            </div>
            <div className="p-4 border-t bg-white">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <button
                    onClick={() => setShowFileMenu(!showFileMenu)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Paperclip size={20} />
                  </button>

                  {showFileMenu && (
                    <div className="absolute bottom-full mb-2 left-0 bg-white border rounded-lg shadow-lg p-2 min-w-[120px]">
                      <button
                        onClick={() => {
                          imageInputRef.current?.click();
                          setShowFileMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center space-x-2"
                      >
                        <Image size={16} />
                        <span>Image</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Message input */}
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  onKeyPress={(e) => e.key === 'Enter' && !isUploading && handleSendMessage()}
                  disabled={isUploading}
                />

                {/* Send button */}
                <button
                  onClick={handleSendMessage}
                  disabled={isUploading}
                  className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Send size={20} />
                  )}
                </button>
              </div>
            </div>

            
            <input
              ref={imageInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*"
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-500">
            <div className="w-16 h-16 mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <Send size={24} className="text-green-500" />
            </div>
            <h3 className="text-xl font-medium mb-2">Your Messages</h3>
            <p className="text-center max-w-sm">
              Select a conversation or start a new one to begin messaging
            </p>
          </div>
        )}
      </div>


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
                placeholder="Search users"
                value={searchUsers}
                onChange={(e) => setSearchUsers(e.target.value)}
                className="w-full p-2 pl-8 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-200"
              />
              <Search size={16} className="absolute left-2 top-3 text-gray-400" />
            </div>

            {/* Users List */}
            <div className="max-h-60 overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No Users found</p>
              ) : (
                filteredUsers.map((user,index) => (
                  <div
                    key={index}
                    onClick={() => handleAddNewChat(user)}
                    className="flex items-center p-3 hover:bg-gray-100 cursor-pointer rounded"
                  >
                    <img
                      src={dummy_profile}
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
      {/* Video Call Component */}
      {isCallActive && selectedChat && (
        <VideoCall
          socket={socket}
          isCallActive={isCallActive}
          onEndCall={handleEndCall}
          chatId={selectedChat._id}
          userId={hostId}
          receiverId={selectedChat.receiverId}
          receiverName={selectedChat.name}
          isInitiator={isCallInitiator}
        />
      )}
    </div>
  );
};

export default HostChatBody;