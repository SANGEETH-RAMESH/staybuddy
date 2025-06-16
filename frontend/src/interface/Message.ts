


export interface Message {
  chatId: string;
  message: string;
  senderId: string;
  receiverId: string;
  timestamp: string;
  isRead: boolean;
  type?: 'text' | 'image' | 'document';
  fileName?: string;
  fileSize?: number;
  fileUrl?: string;
  messageType?:string
}