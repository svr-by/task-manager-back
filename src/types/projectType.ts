import { Document, Model, Types } from 'mongoose';
import { IColumn } from '@/types/columnType';
import { ITask } from '@/types/taskType';
import { IUser } from '@/types/userType';

export interface IProject extends Document {
  _id: Types.ObjectId;
  title: string;
  ownerRef: Types.ObjectId | IUser;
  membersRefs: Types.ObjectId[] | IUser[];
  columns?: IColumn[];
  tasks?: ITask[];
  tokens: string[];
  description?: string;
}

export interface IProjectMethods {
  checkUserAccess: (userId: string, options?: { onlyOwner: boolean }) => boolean;
  generateMemberToken: (userId: string) => Promise<string | undefined>;
  generateOwnerToken: (userId: string) => Promise<string | undefined>;
  filterTokens: (excessToken: string) => void;
}

export interface IProjectModel extends Model<IProject, {}, IProjectMethods> {}

export type TProjectCreateInput = Pick<IProject, 'title' | 'description'>;

export type TProjectUpdateInput = Partial<Pick<IProject, 'title' | 'description'>>;

export type TProjectInviteUserInput = { email: string };
