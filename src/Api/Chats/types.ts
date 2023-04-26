import { User } from "../../types";


export interface Message {
    sender: User;
    content: {
      text?: string;
      media?: string;
    };
    timestamp: number;
  }

  export interface Chat {
    members: User[];
    messages: Message[];
  }

  