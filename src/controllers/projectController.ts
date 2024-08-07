import { Response, Request } from 'express';
import { StatusCodes } from 'http-status-codes';

import { asyncErrorHandler, validationErrorHandler } from '@/services/errorService';
import {
  TProjectCreateInput,
  TProjectInviteUserInput,
  TProjectUpdateInput,
} from '@/types/projectType';
import { sendInvMemberEmail, sendInvOwnerEmail } from '@/services/emailService';
import { decodeInvMemberToken, decodeInvOwnerToken } from '@/services/tokenService';
import { PROJECT_ERR_MES, USER_ERR_MES } from '@/common/errorMessages';
import {
  EntityExistsError,
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from '@/common/appError';
import config from '@/common/config';
import Project from '@/models/projectModel';
import User from '@/models/userModel';
import { createDbId } from '@/services/databaseService';

const { NODE_ENV } = config;

export const createProject = asyncErrorHandler(
  async (req: Request<{}, {}, TProjectCreateInput>, res: Response) => {
    validationErrorHandler(req);
    const { title, description } = req.body;
    const duplicateProject = await Project.findOne({ title }).exec();
    if (duplicateProject) {
      throw new EntityExistsError(PROJECT_ERR_MES.TITLE_EXIST);
    }
    const userId = req.userId;
    const newProject = await Project.create({ title, ownerRef: userId, description });
    //TODO: add default columns
    res.status(StatusCodes.CREATED).json(newProject);
  }
);

export const getAllProjects = asyncErrorHandler(async (req: Request, res: Response) => {
  const projects = await Project.find({}, 'title');
  res.json(projects);
});

export const getProject = asyncErrorHandler(async (req: Request, res: Response) => {
  validationErrorHandler(req);
  const projectId = req.params.id;
  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError(PROJECT_ERR_MES.NOT_FOUND);
  }
  const userId = req.userId;
  const hasAccess = project.checkUserAccess(userId);
  if (!hasAccess) {
    throw new ForbiddenError(PROJECT_ERR_MES.NO_ACCESS);
  }
  res.json(project);
});

export const updateProject = asyncErrorHandler(
  async (req: Request<Record<string, string>, {}, TProjectUpdateInput>, res: Response) => {
    validationErrorHandler(req);
    const projectId = req.params.id;
    const userId = req.userId;
    const { title, description } = req.body;
    const updatedProject = await Project.findOneAndUpdate(
      { _id: projectId, ownerRef: userId },
      { title, description },
      { new: true }
    );
    if (!updatedProject) {
      throw new NotFoundError(PROJECT_ERR_MES.NOT_FOUND_OR_NO_ACCESS);
    }
    res.json(updatedProject);
  }
);

export const deleteProject = asyncErrorHandler(async (req: Request, res: Response) => {
  validationErrorHandler(req);
  const projectId = req.params.id;
  const userId = req.userId;
  const deletedProject = await Project.findOneAndDelete({ _id: projectId, ownerRef: userId });
  if (!deletedProject) {
    throw new NotFoundError(PROJECT_ERR_MES.NOT_FOUND_OR_NO_ACCESS);
  }
  //TODO: delete columns and tasks of the project
  res.sendStatus(StatusCodes.NO_CONTENT);
});

export const inviteMember = asyncErrorHandler(
  async (req: Request<Record<string, string>, {}, TProjectInviteUserInput>, res: Response) => {
    validationErrorHandler(req);
    const projectId = req.params.id;
    const ownerId = req.userId;
    const email = req.body.email;
    const [project, invitedUser] = await Promise.all([
      Project.findOne({ _id: projectId, ownerRef: ownerId }),
      User.findOne({ email }),
    ]);
    if (!project) {
      throw new NotFoundError(PROJECT_ERR_MES.NOT_FOUND_OR_NO_ACCESS);
    }
    if (!invitedUser || !invitedUser.isVerified) {
      throw new NotFoundError(USER_ERR_MES.NOT_FOUND_OR_NOT_VERIFIED);
    }
    const invToken = await project.generateMemberToken(invitedUser._id.toString());
    const responceObj: { isEmailSent?: boolean; invToken?: string } = {};
    if (NODE_ENV !== 'test') {
      const invUrl = `http://${req.headers.host}/projects/${projectId}/member/${invToken}`;
      const emailResult = await sendInvMemberEmail({ email, invUrl, title: project.title });
      responceObj.isEmailSent = !!emailResult;
    } else {
      responceObj.invToken = invToken;
    }
    res.status(StatusCodes.CREATED).json(responceObj);
  }
);

export const becomeMember = asyncErrorHandler(async (req: Request, res: Response) => {
  validationErrorHandler(req);
  const userId = req.userId;
  const projectId = req.params.id;
  const invToken = req.params.token;
  const decodedInvTkn = decodeInvMemberToken(invToken);
  if (!decodedInvTkn) {
    throw new BadRequestError(PROJECT_ERR_MES.INV_TKN_EXPIRED);
  }
  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError(PROJECT_ERR_MES.NOT_FOUND);
  }
  if (!project.tokens?.includes(invToken) || decodedInvTkn.uid !== userId) {
    throw new ForbiddenError(PROJECT_ERR_MES.INV_TKN_INCORRECT);
  }
  project.filterTokens(invToken);
  project.membersRef.push(createDbId(userId));
  await project.save();
  res.send('Project member has been added');
});

export const deleteMember = asyncErrorHandler(async (req: Request, res: Response) => {
  validationErrorHandler(req);
  const ownerId = req.userId;
  const projectId = req.params.id;
  const memberId = req.params.userId;
  const project = await Project.findOne({ _id: projectId, ownerRef: ownerId });
  if (!project) {
    throw new NotFoundError(PROJECT_ERR_MES.NOT_FOUND_OR_NO_ACCESS);
  }
  const memberIndex = project.membersRef.findIndex((member) => member.toString() === memberId);
  if (memberIndex === -1) {
    throw new NotFoundError(PROJECT_ERR_MES.MEMBER_NOT_FOUND);
  }
  project.membersRef.splice(memberIndex, 1);
  await project.save();
  res.json(project);
});

export const inviteOwner = asyncErrorHandler(
  async (req: Request<Record<string, string>, {}, TProjectInviteUserInput>, res: Response) => {
    validationErrorHandler(req);
    const ownerId = req.userId;
    const projectId = req.params.id;
    const email = req.body.email;
    const [project, invitedUser] = await Promise.all([
      Project.findOne({ _id: projectId, ownerRef: ownerId }),
      User.findOne({ email }),
    ]);
    if (!project) {
      throw new NotFoundError(PROJECT_ERR_MES.NOT_FOUND_OR_NO_ACCESS);
    }
    if (!invitedUser || !invitedUser?.isVerified) {
      throw new NotFoundError(USER_ERR_MES.NOT_FOUND_OR_NOT_VERIFIED);
    }
    const invToken = await project.generateOwnerToken(invitedUser._id.toString());
    const responceObj: { isEmailSent?: boolean; invToken?: string } = {};
    if (NODE_ENV !== 'test') {
      const invUrl = `http://${req.headers.host}/projects/${projectId}/owner/${invToken}`;
      const emailResult = await sendInvOwnerEmail({ email, invUrl, title: project.title });
      responceObj.isEmailSent = !!emailResult;
    } else {
      responceObj.invToken = invToken;
    }
    res.status(StatusCodes.CREATED).json(responceObj);
  }
);

export const becomeOwner = asyncErrorHandler(async (req: Request, res: Response) => {
  validationErrorHandler(req);
  const userId = req.userId;
  const projectId = req.params.id;
  const invToken = req.params.token;
  const decodedInvTkn = decodeInvOwnerToken(invToken);
  if (!decodedInvTkn) {
    throw new BadRequestError(PROJECT_ERR_MES.INV_TKN_EXPIRED);
  }
  const project = await Project.findById(projectId);
  if (!project) {
    throw new NotFoundError(PROJECT_ERR_MES.NOT_FOUND);
  }
  if (!project.tokens?.includes(invToken) || decodedInvTkn.uid !== userId) {
    throw new ForbiddenError(PROJECT_ERR_MES.INV_TKN_INCORRECT);
  }
  project.filterTokens(invToken);
  project.membersRef.push(project.ownerRef);
  project.ownerRef = createDbId(userId);
  await project.save();
  res.send('Project owner has been changed');
});
