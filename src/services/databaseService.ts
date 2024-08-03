import { Types } from 'mongoose';
import { BadRequestError } from '@/common/appError';

const ObjectId = Types.ObjectId;

export const isValidDbId = (id: string) => {
  if (ObjectId.isValid(id)) {
    return String(new ObjectId(id)) === id;
  }
  return false;
};

export const createDbId = (id: string) => {
  if (isValidDbId(id)) {
    return new ObjectId(id);
  } else {
    throw new BadRequestError(`Invalid database document ID: ${id}`);
  }
};
