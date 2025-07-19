import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { IChatService } from "../interface/chat/IChatService";
import { userService } from "../router/userRoute";
import { INotification } from "../model/notificationModel";

interface MessageData {
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: number;
  chatId: string
  fileData: string;
  count:number
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
    // console.log(`User connected: ${socket.id}`);
    // console.log("ONline", onlineUsers)

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
      socket.emit("onlineUsers", Array.from(onlineUsers));
    });

    socket.on("getOnlineHosts", () => {
      socket.emit("onlineHosts", Array.from(onlineHosts))
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

    socket.on("hostLogout", (hostId: string) => {
      if (onlineHosts.has(hostId)) {
        onlineHosts.delete(hostId)
        console.log(` ${hostId} logged out.`)
        io.emit('hostLoggedOut', hostId)
      } else {
        console.warn(`Tried to remove ${hostId} but not found in Set`);
      }
    })

    socket.on("join_room", (roomId: string) => {
      console.log(roomId, 'Roomid')
      if (roomId) {
        socket.join(roomId);
        console.log(`User joined room: ${roomId}`);
      } else {
        console.error("Error: Invalid userId for joining room");
      }
    });

    socket.on("send_message", async (data: MessageData) => {
      try {
        console.log(` Message received from ${data.senderId} to ${data.receiverId}:`, data);

        if (!data.senderId || !data.receiverId || (!data.message && !data.fileData)) {
          console.error("Error: Missing required fields in message");
          return;
        }

        const savedMessage = await chatService.handleSendMessage(data);
        // console.log(savedMessage, 'SavedMessage')
        socket.to(data.chatId).emit("receiveMessage", savedMessage);
        console.log(` Message sent to room: ${data.receiverId}`);
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

    socket.on("get_all_chats", async (userId: string) => {
      try {
        if (!userId) {
          console.error("Error: userId is required to fetch chats")
          return
        }
        const allChats = await chatService.getUserChats(userId);
        socket.emit('receive_all_chats', allChats)
      } catch (error) {
        console.error("Error fetching old chats:", error);
      }
    })

    socket.on("get_all_hostchats", async (hostId: string) => {
      try {
        if (!hostId) {
          console.error("Error: hostId is required to fetch chats")
          return
        }
        const allChats = await chatService.getHostChat(hostId);
        socket.emit('receive_all_hostchats', allChats)
      } catch (error) {
        console.error("Error fetching old chats:", error);
      }
    })

    socket.on("join_notification_room", (userId: string) => {
      if (userId) {
        socket.join(`notif_${userId}`);
        console.log(`User ${userId} joined notification room`);
      }
    });

    socket.on('send_notification', async (notification: INotification) => {
      try {
        const send_notification = await userService.sendNotification(notification);
        console.log("Sending", send_notification)
        const receiverId = notification.receiver?.toString()
        if (receiverId) {
          socket.to(`notif_${receiverId}`).emit('receive_notification', send_notification);
        } else {
          console.warn("Receiver ID missing in notification");
        }
        socket.emit('receive_notification', send_notification)
      } catch (error) {
        console.error("Error fetching old chats:", error);
      }
    })

    socket.on('get_old_notifications', async (userId: string) => {
      try {
        if (!userId) {
          console.log("Error: userId is required");
          return
        }
        const oldNotification = await userService.getOldNotification(userId);
        socket.emit('receive_old_notifications', oldNotification)
      } catch (error) {
        console.error("Error fetching old notifications:", error);
      }
    })

    socket.on('mark_all_notification',async({receiverId})=>{
      const readAll = await userService.markAllRead(receiverId);
      socket.to(receiverId).emit('marked_all_notifications',{receiverId})
    })

    socket.on('initiate_call', ({ callerId, calleeId, callerName, chatId }) => {
      console.log(`Call initiated from ${callerId} to ${calleeId}`);
      console.log(chatId, 'cahtId')

      const room = io.sockets.adapter.rooms.get(chatId);
      console.log(`Sockets in room ${chatId}:`, room ? Array.from(room) : 'No room found');
      console.log(`Total sockets in room: ${room ? room.size : 0}`);
      socket.to(chatId).emit('incoming_call', {
        callerId,
        callerName,
        chatId
      })
    })

    socket.on('accept_call', ({ callerId, calleeId, chatId }) => {
      console.log(`Call accepted by ${calleeId} for caller ${callerId}`);

      socket.to(chatId).emit('call_accepted', {
        calleeId,
        chatId
      })
    })

    socket.on('reject_call', ({ callerId, calleeId, chatId }) => {
      console.log(`Call rejected by ${calleeId}`);

      socket.to(chatId).emit('call_rejected')
    })

    socket.on('end_call', ({ userId, chatId }) => {
      console.log(`Call ended by ${userId} in chat ${chatId}`);

      socket.to(chatId).emit('call_ended')
    })

    socket.on('send_offer', ({ offer, to }) => {
      console.log('send Offer Chatid', to)
      socket.to(to).emit('send_offer', { offer, to });
    });

    socket.on('send_answer', ({ answer, to }) => {
      console.log("Send ChatId", to)
      socket.to(to).emit('send_answer', { answer });
    });

    socket.on('ice_candidate', ({ candidate, to }) => {
      socket.to(to).emit('ice_candidate', { candidate });
    });

    socket.on('cancel_call', ({ calleeId, chatId }) => {
      console.log(`Call cancel ${calleeId}`);
      socket.to(chatId).emit('call_cancelled')
    })

    socket.on('video_call_end',async({chatId,senderId,receiverId,content,messageType,timestamp})=>{
      socket.to(chatId).emit('video_call_ended',{
        chatId,senderId,receiverId,content,messageType,timestamp
      })
    })

    socket.on('count_read',async({chatId,receiverId})=>{
      const countRead = await chatService.setCountRead(chatId);
      socket.to(chatId).emit('counted_read',{receiverId})
    })

    socket.on("disconnect", () => {
      // console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};