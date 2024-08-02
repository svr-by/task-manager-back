import { Schema, model } from 'mongoose';

import { IUser } from '@/types/userTypes';
import { COLLECTIONS, MODEL_NAME } from '@/common/enums';
import { getAccToken, getRfrToken, decodeRfrToken } from '@/services/tokenService';
import { hashPassword } from '@/services/hashService';

const userScheme = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false, required: true },
    tokens: { type: [String] },
    notes: { type: String },
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

userScheme.method('filterTokens', async function (excessToken) {
  this.tokens = this.tokens.filter((token) => token !== excessToken && decodeRfrToken(token));
  await this.save();
});

userScheme.method('generateAccessToken', async function () {
  return getAccToken({ uid: this._id.toString() });
});

userScheme.method('generateRefreshToken', async function (expiredToken) {
  this.tokens = this.tokens.filter((token) => token !== expiredToken && decodeRfrToken(token));
  const refreshToken = getRfrToken({ uid: this._id.toString() });
  if (refreshToken) {
    this.tokens.push(refreshToken);
    await this.save();
  }
  return refreshToken;
});

export default model<IUser>(MODEL_NAME.USER, userScheme);
