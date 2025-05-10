import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, Search } from 'lucide-react';
import dummy_profile from '../../../assets/dummy profile.png';
import apiClient from '../../../services/apiClient';
import { LOCALHOST_URL } from '../../../constants/constants';
import { useLocation } from 'react-router-dom';

interface Message {
  // id: number;
  chatId: string;
  message: string;
  senderId: string;
  receiverId: string
  timestamp: string;
  isRead: boolean;
}

type Messages = {
  senderId: string;
  content: string;
  timestamp: string;
};

type Chats = {
  _id: string;
  name: string;
  participant1: string;
  participant2: User;
  latestMessage?: string;
  updatedAt?: string;
  unreadCount: number;
  messages: Messages[];
};

type User = {
  _id: string;
  name: string;
};


interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
  receiverId: string;
}

const socket: Socket = io('http://localhost:4000'); // Update with your backend URL

const ChatApplication: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [receiverId, setReceiverId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const location = useLocation();
  const hostId = location.state?.hostId || null;

  useEffect(() => {
    const fetchChats = async () => {
      try {
        console.log(hostId?._id, 'Hello');
        const id = hostId?._id;
        const res = await apiClient.get(`${LOCALHOST_URL}/chat/getChat`, {
          params: { id },
          headers: { Authorization: `Bearer` },
        });


        console.log(res.data.data, 'heelo')
        const chatData = Array.isArray(res.data.data) ? res.data.data : [res.data.data];
        console.log(id, chatData, "hellosds")
        console.log(chatData[0].participant1, "Sagneeth")
        setUserId(chatData[0].participant1)
        const formattedChats = chatData.map((chat: Chats) => ({
          id: chat._id,
          name: chat.participant2.name,
          lastMessage: chat.latestMessage || "No messages yet",
          receiverId: chat.participant2._id,
          lastMessageTime: chat.updatedAt ? new Date(chat.updatedAt).toLocaleTimeString() : "",
          unreadCount: 0,
          messages: [],
        }));

        setChats(formattedChats);
        console.log(chats, 'Chatsss')
      } catch (error) {
        console.error("Error fetching chats", error);
      }
    };

    fetchChats();

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
    });

    return () => {
      socket.off('receive_old_messages');
    };
  });


  const handleSelectChat = (chat: Chat, receiverId: string) => {
    setSelectedChat(chat);
    setReceiverId(receiverId)
    socket.emit('join_room', chat.id);

    socket.emit("old_message", { chatId: chat.id });
  };

  const handleSendMessage = () => {

    if (!selectedChat) {
      return null
    }
    console.log("User Id", userId)
    console.log("host Id", receiverId)
    console.log('chat id', selectedChat.id)
    console.log(newMessage, 'message')
    if (newMessage.trim() && selectedChat) {


      const message: Message = {
        // id: crypto.randomUUID(), 
        chatId: selectedChat.id,
        senderId: userId,
        receiverId: receiverId,
        message: newMessage,
        isRead: false,
        timestamp: new Date().toISOString(),
      };

      // Emit message to the server via socket.io
      socket.emit('send_message', message);

      // Update UI optimistically
      setSelectedChat((prevChat) => {
        if (!prevChat) return null;
        return {
          ...prevChat,
          messages: [...prevChat.messages, message], // Ensure all items are of type `Message`
        };
      });

      setNewMessage('');
    }
  };


  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-[535px] bg-white border rounded-lg shadow-md overflow-hidden">
      {/* Chat List Sidebar */}
      <div className="w-1/3 border-r bg-gray-50">
        {/* Search Bar */}
        <div className="p-4 border-b">
          <div className="relative">
            <input
              type="text"
              placeholder="Search chats"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 pl-8 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-200"
            />
            <Search size={20} className="absolute left-2 top-3 text-gray-400" />
          </div>
        </div>

        {/* Chat List */}
        <div className="overflow-y-auto h-[calc(100%-100px)]">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => handleSelectChat(chat, chat.receiverId)}
              className={`flex items-center p-4 hover:bg-gray-100 cursor-pointer ${selectedChat?.id === chat.id ? 'bg-gray-200' : ''}`}
            >
              <img src={dummy_profile} alt={chat.name} className="w-12 h-12 rounded-full mr-4" />
              <div className="flex-grow">
                <div className="flex justify-between">
                  <h3 className="font-semibold">{chat.name}</h3>
                  <span className="text-xs text-gray-500">{chat.lastMessageTime}</span>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
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
              <p className="text-sm text-gray-500">last seen today 10:30am</p>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-grow overflow-y-auto p-4 space-y-3">
            {selectedChat.messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.senderId === hostId ? 'justify-start' : 'justify-end'}`}>
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${msg.senderId === hostId ? 'bg-white text-left' : 'bg-green-100 text-right'}`}
                >
                  <p className="text-sm">{msg.message}</p>
                  <span className="text-xs text-gray-500 block mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input Area */}
          <div className="bg-white p-4 border-t flex items-center space-x-2">
            {/* <button className="text-gray-500 hover:text-gray-700">
              <Paperclip size={24} />
            </button>
            <button className="text-gray-500 hover:text-gray-700">
              <Smile size={24} />
            </button> */}

            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message"
              className="flex-grow p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-200"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />

            <button onClick={handleSendMessage} className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600">
              <Send size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatApplication;
