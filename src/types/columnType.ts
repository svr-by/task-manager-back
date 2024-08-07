import { Document, Model, Types } from 'mongoose';
import { IProjectMethods } from './projectType';

export interface IColumn extends Document {
  _id: Types.ObjectId;
  title: string;
  projectRef: Types.ObjectId | IProjectMethods;
  order: number;
}

export interface IColumnMethods {
  checkUserAccess: (userId: string) => boolean;
}

export interface IColumnModel extends Model<IColumn, {}, IColumnMethods> {}
