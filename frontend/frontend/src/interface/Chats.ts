
import {Message} from './Message'
import {User} from './User'

export interface  Chats  {
  _id: string;
  name: string;
  participant1: User;
  participant2: string;
  receiverId: string;
  latestMessage?: string;
  updatedAt?: string;
  unreadCount: number;
  messages: Message[];
  latestMessageTime: string;
  type: string;
};