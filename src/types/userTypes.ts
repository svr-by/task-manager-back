import { Model, Types } from 'mongoose';

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  isVerified: boolean;
  tokens: string[];
  notes?: string;
}

export interface IUserMethods {
  filterTokens: (excessToken: string) => Promise<void>;
  generateAccessToken: () => Promise<string | undefined>;
  generateRefreshToken: (expiredToken?: string) => Promise<string | undefined>;
}

export interface IUserModel extends Model<IUser, {}, IUserMethods> {}

export type TTknPayload = { uid: string };
