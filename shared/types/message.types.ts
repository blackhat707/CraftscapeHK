export interface ChatMessage {
  id: string;
  sender: 'customer' | 'artisan';
  originalText: string;
  translatedText?: string;
  language: 'en' | 'zh';
  timestamp: string;
}

export interface MessageThread {
  id: string;
  customerName: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  avatar: string;
  productId: number;
  messages?: ChatMessage[];
}

