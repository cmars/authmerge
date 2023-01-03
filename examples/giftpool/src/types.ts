export interface GiftPlan {
  wishlist: Wish[];
  messages: Message[];
}

export interface Wish {
  title: string;
  description: string;
}

export interface Message {
  parent?: Message;
  content: string;
}
