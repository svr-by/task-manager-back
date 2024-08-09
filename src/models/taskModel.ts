import { COLLECTIONS, MODEL_NAME } from '@/common/enums';
import { IProjectMethods } from '@/types/projectType';
import { ITask, ITaskModel, ITaskMethods } from '@/types/taskType';
import { Schema, model } from 'mongoose';

const taskScheme = new Schema<ITask, ITaskModel, ITaskMethods>(
  {
    projectRef: {
      type: Schema.Types.ObjectId,
      ref: MODEL_NAME.PROJECT,
      required: true,
      index: true,
    },
    columnRef: { type: Schema.Types.ObjectId, required: true, ref: MODEL_NAME.COLUMN, index: true },
    title: { type: String, required: true },
    assigneeRef: { type: Schema.Types.ObjectId, ref: MODEL_NAME.USER },
    subscriberRefs: { type: [Schema.Types.ObjectId], ref: MODEL_NAME.USER },
    priority: { type: Number },
    order: { type: Number },
    description: { type: String },
  },
  {
    collection: COLLECTIONS.TASKS,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (doc, conv) => {
        delete conv._id;
      },
    },
  }
);

taskScheme.method('checkUserAccess', async function (userId) {
  await this.populate('projectRef');
  const hasAccess = !!(this.projectRef as IProjectMethods)?.checkUserAccess(userId);
  this.depopulate('projectRef');
  return hasAccess;
});

export default model<ITask, ITaskModel>(MODEL_NAME.TASK, taskScheme);
