import { Model, Document, ObjectId } from "mongoose";

interface User {
  name: string;
  email: string;
  avatar?: string;
  refreshToken: string;
  role:string,
  Premium:Boolean,
  premiumPoints:number,
  interestedIn:[string],
  followers:[string],
  following:[string],
  eventReqs:[string],
  reportPoints:number
}

export interface UserDoc extends User, Document {}

export interface UsersModel extends Model<UserDoc> {
  checkCredentials(email: string, password: string): Promise<UserDoc | null>;
}