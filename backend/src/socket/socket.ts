import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { IChatService } from "../interface/chat/IChatService";

interface MessageData {
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: number;
}

export const initializeSocket = (server: HttpServer, chatService: IChatService) => {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173", "http://localhost:3000"], // Allow multiple origins if needed
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    // Handle users joining a room (for private messaging)
    socket.on("joinRoom", (userId: string) => {
      if (userId) {
        socket.join(userId);
        console.log(`🏠 User ${userId} joined room: ${userId}`);
      } else {
        console.error("❌ Error: Invalid userId for joining room");
      }
    });

    // Handle sending messages
    socket.on("send_message", async (data: MessageData) => {
      try {
        console.log(`📩 Message received from ${data.senderId} to ${data.receiverId}:`, data);

        if (!data.senderId || !data.receiverId || !data.message) {
          console.error("❌ Error: Missing required fields in message");
          return;
        }

        const savedMessage = await chatService.handleSendMessage(data);
        io.to(data.receiverId).emit("receiveMessage", savedMessage);
        console.log(`📤 Message sent to room: ${data.receiverId}`);
      } catch (error) {
        console.error("❌ Error sending message:", error);
      }
    });

    // Handle fetching old messages
    socket.on("old_message", async ({ chatId }) => {
      try {
        if (!chatId) {
          console.error("❌ Error: chatId is required for fetching old messages");
          return;
        }

        const getOldMessage = await chatService.getOldChat(chatId);
        socket.emit("receive_old_messages", { chatId, messages: getOldMessage });
      } catch (error) {
        console.error("❌ Error fetching old messages:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.id}`);
    });
  });

  return io;
};
