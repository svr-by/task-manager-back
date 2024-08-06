import { Document, Model, Types } from 'mongoose';

export interface IProject extends Document {
  _id: Types.ObjectId;
  title: string;
  ownerRef: Types.ObjectId;
  membersRef: Types.ObjectId[];
  tokens: string[];
  description?: string;
}

export interface IProjectMethods {
  checkUserAccess: (userId: string, options?: { onlyOwner: boolean }) => boolean;
  generateToken: (userId: string) => Promise<string | undefined>;
  filterTokens: (excessToken: string) => void;
}

export interface IProjectModel extends Model<IProject, {}, IProjectMethods> {}

export type TProjectCreateInput = Pick<IProject, 'title' | 'description'>;

export type TProjectUpdateInput = Partial<Pick<IProject, 'title' | 'description'>>;
