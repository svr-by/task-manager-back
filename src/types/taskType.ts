import { Document, Model, Types } from 'mongoose';
import { IProjectMethods } from './projectType';
import { IUser } from './userType';

export interface ITask extends Document {
  _id: Types.ObjectId;
  title: string;
  projectRef: Types.ObjectId | IProjectMethods;
  columnRef: Types.ObjectId;
  assigneeRef?: Types.ObjectId;
  subscriberRefs: Types.ObjectId[] | IUser[];
  order: number;
  priority?: number;
  description?: string;
}

export interface ITaskMethods {
  checkUserAccess: (userId: string) => Promise<boolean>;
}

export interface ITaskModel extends Model<ITask, {}, ITaskMethods> {}

export type TTaskCreateInput = Pick<ITask, 'title' | 'order' | 'priority' | 'description'> & {
  columnId: string;
  assigneeId?: string;
};

export type TTaskUpdateInput = Partial<Pick<ITask, 'title' | 'priority' | 'description'>> & {
  assigneeId?: string;
};

export type TTaskSetUpdateInput = { id: string; columnId: string; order: number }[];
