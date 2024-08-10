import { Document, Model, Types } from 'mongoose';
import { IProject } from './projectType';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  isVerified: boolean;
  projects?: IProject[];
  ownProjects?: IProject[];
  tokens: string[];
}

export interface IUserMethods {
  filterTokens: (excessToken: string) => Promise<void>;
  generateTokens: (excessToken?: string) => Promise<(string | undefined)[]>;
}

export interface IUserModel extends Model<IUser, {}, IUserMethods> {}

export type TTknPayload = { uid: string };

export type TUserSignupInput = Pick<IUser, 'name' | 'email' | 'password'>;

export type TUserSigninInput = Pick<IUser, 'email' | 'password'>;

export type TUserUpdateInput = Partial<Pick<IUser, 'name' | 'password'>>;
