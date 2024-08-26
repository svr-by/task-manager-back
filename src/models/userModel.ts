import { Schema, model } from 'mongoose';

import { IUser, IUserModel, IUserMethods, TUserUpdateInput } from '@/types/userType';
import { getAccToken, getRfrToken, decodeRfrToken } from '@/services/tokenService';
import { hashPassword } from '@/services/hashService';
import { COLLECTIONS, MODEL_NAME } from '@/common/enums';

const userScheme = new Schema<IUser, IUserModel, IUserMethods>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false, required: true },
    tokens: { type: [String] },
  },
  {
    collection: COLLECTIONS.USERS,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (doc, conv) => {
        delete conv._id;
        delete conv.password;
        delete conv.tokens;
      },
    },
  }
);

userScheme.virtual('projects', {
  ref: MODEL_NAME.PROJECT,
  localField: '_id',
  foreignField: 'membersRefs',
});

userScheme.virtual('ownProjects', {
  ref: MODEL_NAME.PROJECT,
  localField: '_id',
  foreignField: 'ownerRef',
});

userScheme.virtual('assigneeTasks', {
  ref: MODEL_NAME.TASK,
  localField: '_id',
  foreignField: 'assigneeRef',
});

userScheme.virtual('subscriberTasks', {
  ref: MODEL_NAME.TASK,
  localField: '_id',
  foreignField: 'subscribersRefs',
});

userScheme.pre('save', async function (next) {
  try {
    if (this.isModified('password')) {
      this.password = await hashPassword(this.password);
    }
    next();
  } catch (error) {
    next(error as Error);
  }
});

userScheme.pre(['updateOne', 'findOneAndUpdate'], async function (next) {
  try {
    const update = this.getUpdate() as TUserUpdateInput;
    if (update?.password) {
      const hashedPassword = await hashPassword(update?.password);
      this.setUpdate({ ...update, password: hashedPassword });
    }
    next();
  } catch (error) {
    next(error as Error);
  }
});

userScheme.method('filterTokens', async function (excessToken: string) {
  this.tokens = this.tokens.filter((token) => token !== excessToken && decodeRfrToken(token));
  await this.save();
});

userScheme.method('generateTokens', async function (excessToken?: string) {
  if (excessToken) {
    this.tokens = this.tokens.filter((token) => token !== excessToken && decodeRfrToken(token));
  }
  const accessToken = getAccToken({ uid: this._id.toString() });
  const refreshToken = getRfrToken({ uid: this._id.toString() });
  if (refreshToken) {
    this.tokens.push(refreshToken);
    await this.save();
  }
  return [accessToken, refreshToken];
});

export default model<IUser, IUserModel>(MODEL_NAME.USER, userScheme);
