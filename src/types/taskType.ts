import { Document, Model, Types } from 'mongoose';
import { IProjectMethods } from './projectType';

export interface ITask extends Document {
  _id: Types.ObjectId;
  title: string;
  projectRef: Types.ObjectId | IProjectMethods;
  columnRef: Types.ObjectId;
  assigneeRef: Types.ObjectId;
  subscriberRefs: Types.ObjectId[];
  priority: number;
  order: number;
  description: string;
}

export interface ITaskMethods {
  checkUserAccess: (userId: string) => Promise<boolean>;
}

export interface ITaskModel extends Model<ITask, {}, ITaskMethods> {}
