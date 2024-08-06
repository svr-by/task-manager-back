import { Schema, model } from 'mongoose';

import { IProject, IProjectModel, IProjectMethods } from '@/types/projectType';
import { getInvToken, decodeInvToken } from '@/services/tokenService';
import { COLLECTIONS, MODEL_NAME } from '@/common/enums';

const projectScheme = new Schema<IProject, IProjectModel, IProjectMethods>(
  {
    title: { type: String, required: true, index: true },
    ownerRef: { type: Schema.Types.ObjectId, required: true, ref: MODEL_NAME.USER, index: true },
    membersRef: { type: [Schema.Types.ObjectId], ref: MODEL_NAME.USER },
    tokens: { type: [String] },
    description: { type: String },
  },
  {
    collection: COLLECTIONS.PROJECTS,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (doc, conv) => {
        delete conv._id;
        delete conv.tokens;
      },
    },
  }
);

projectScheme.method('checkUserAccess', function (userId: string, options: { onlyOwner: boolean }) {
  const isOwner = this.ownerRef.toString() === userId;
  const isMember = options?.onlyOwner
    ? false
    : this.membersRef.map((memberRef) => memberRef.toString()).includes(userId);
  return isOwner || isMember;
});

projectScheme.method('generateToken', async function (userId: string) {
  const invToken = getInvToken({ uid: userId });
  if (invToken) {
    this.tokens.push(invToken);
    await this.save();
  }
  return invToken;
});

projectScheme.method('filterTokens', function (excessToken: string) {
  this.tokens = this.tokens.filter((token) => token !== excessToken && decodeInvToken(token));
});

export default model<IProject, IProjectModel>(MODEL_NAME.PROJECT, projectScheme);
