import { Model, Document } from "mongoose";
import {User} from "../../types"
interface Message {
    sender: User;
    content: {
      text?: string;
      media?: string;
    };
    timestamp: number;
  }
  
 interface Chat {
    members: User[];
    messages: Message[];
  }



  export interface chatDoc extends Chat,Document{}

  export interface chatModel extends Model<chatDoc>{

  }
  