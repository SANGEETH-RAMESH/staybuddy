import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { IChatService } from "../interface/chat/IChatService";

interface MessageData {
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: number;
  chatId: string
  fileData:string;
}

export const initializeSocket = (server: HttpServer, chatService: IChatService) => {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173", "http://localhost:3000"],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const onlineUsers = new Set<string>();
  const onlineHosts = new Set<string>();

  io.on("connection", (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);
    console.log("ONline", onlineUsers)

    socket.on('userLoggedIn', (userId) => {
      onlineUsers.add(userId);
      console.log(`User ${userId} logged in`);
      io.emit("userLoggedIn", userId);
    });

    socket.on('hostLoggedIn', (hostId: string) => {
      onlineHosts.add(hostId);
      console.log(`Host ${hostId} logged in`);
      io.emit("hostLoggedIn", hostId);
    });

    socket.on("getOnlineUsers", () => {
      socket.emit("onlineUsers", Array.from(onlineUsers)); // send list of user IDs
    });

    socket.on("getOnlineHosts",()=>{
      socket.emit("onlineHosts",Array.from(onlineHosts))
    })

    socket.on("userLogout", (userId: string) => {
      if (onlineUsers.has(userId)) {
        onlineUsers.delete(userId);
        console.log(` ${userId} logged out.`);
        io.emit("userLoggedOut", userId);
      } else {
        console.warn(`Tried to remove ${userId} but not found in Set`);
      }
    });

    socket.on("hostLogout",(hostId:string)=>{
      if(onlineHosts.has(hostId)){
        onlineHosts.delete(hostId)
        console.log(` ${hostId} logged out.`)
        io.emit('hostLoggedOut',hostId)
      }else {
        console.warn(`Tried to remove ${hostId} but not found in Set`);
      }
    })

    socket.on("join_room", (roomId: string) => {
      console.log(roomId, 'Roomid')
      if (roomId) {
        socket.join(roomId);
        console.log(`🏠 User joined room: ${roomId}`);
      } else {
        console.error("Error: Invalid userId for joining room");
      }
    });

    socket.on("send_message", async (data: MessageData) => {
      try {
        console.log(`📩 Message received from ${data.senderId} to ${data.receiverId}:`, data);

        if (!data.senderId || !data.receiverId || (!data.message && !data.fileData)) {
          console.error("Error: Missing required fields in message");
          return;
        }

        const savedMessage = await chatService.handleSendMessage(data);
        // console.log(savedMessage, 'SavedMessage')
        socket.to(data.chatId).emit("receiveMessage", savedMessage);
        console.log(`📤 Message sent to room: ${data.receiverId}`);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });

    
    socket.on("old_message", async ({ chatId }) => {
      try {
        if (!chatId) {
          console.error("Error: chatId is required for fetching old messages");
          return;
        }

        const getOldMessage = await chatService.getOldChat(chatId);
        socket.emit("receive_old_messages", { chatId, messages: getOldMessage });
      } catch (error) {
        console.error("Error fetching old messages:", error);
      }
    });

    socket.on("get_all_chats",async(userId:string) => {
      try {
        if(!userId){
          console.error("Error: userId is required to fetch chats")
          return 
        }
        const allChats = await chatService.getUserChats(userId);
        socket.emit('receive_all_chats',allChats)
      } catch (error) {
        console.error("Error fetching old chats:", error);
      }
    })

    socket.on("get_all_hostchats",async(hostId:string) => {
      try {
        if(!hostId){
          console.error("Error: hostId is required to fetch chats")
          return 
        }
        const allChats = await chatService.getHostChat(hostId);
        socket.emit('receive_all_hostchats',allChats)
      } catch (error) {
        console.error("Error fetching old chats:", error);
      }
    })

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io; 
};
