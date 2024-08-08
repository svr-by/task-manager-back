import { Schema, model } from 'mongoose';

import { IColumn, IColumnModel, IColumnMethods } from '@/types/columnType';
import { COLLECTIONS, MODEL_NAME } from '@/common/enums';
import { IProjectMethods } from '@/types/projectType';

const columnScheme = new Schema<IColumn, IColumnModel, IColumnMethods>(
  {
    title: { type: String, required: true, index: true },
    projectRef: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: MODEL_NAME.PROJECT,
      index: true,
    },
    order: { type: Number },
  },
  {
    collection: COLLECTIONS.COLUMNS,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (doc, conv) => {
        delete conv._id;
      },
    },
  }
);

columnScheme.method('checkUserAccess', async function (userId) {
  await this.populate('projectRef');
  const hasAccess = !!(this.projectRef as IProjectMethods)?.checkUserAccess(userId);
  this.depopulate('projectRef');
  return hasAccess;
});

export default model<IColumn, IColumnModel>(MODEL_NAME.COLUMN, columnScheme);
