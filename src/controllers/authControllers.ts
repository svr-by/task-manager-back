import { Response, Request } from 'express';
import { StatusCodes } from 'http-status-codes';

import { TUserSignupInput } from '@/types/userTypes';
import { asyncErrorHandler, validationErrorHandler } from '@/services/errorService';
import { getConfToken, decodeConfToken } from '@/services/tokenService';
import { sendConfEmail } from '@/services/emailService';
import { EntityExistsError, BadRequestError, NotFoundError } from '@/common/appError';
import { USER_ERR_MES } from '@/common/errorMessages';
import config from '@/common/config';
import User from '@/models/userModel';

const { NODE_ENV } = config;

export const signUp = asyncErrorHandler(
  async (req: Request<{}, {}, TUserSignupInput>, res: Response) => {
    validationErrorHandler(req);
    const { name, email, password } = req.body;
    const duplicateUser = await User.findOne({ email });
    if (duplicateUser) {
      throw new EntityExistsError(USER_ERR_MES.EMAIL_EXIST);
    }
    const newUser = await User.create({ name, email, password });
    const confToken = getConfToken({ uid: newUser._id.toString() });

    const responceObj: { isEmailSent?: boolean; confToken?: string } = {};
    if (NODE_ENV !== 'test') {
      const confUrl = `http://${req.headers.host}/auth/confirmation/${confToken}`;
      const emailResult = await sendConfEmail({ email, confUrl });
      responceObj.isEmailSent = !!emailResult;
    } else {
      responceObj.confToken = confToken;
    }
    res.status(StatusCodes.CREATED).json(responceObj);
  }
);

export const confirmation = asyncErrorHandler(async (req, res) => {
  const confToken = req.params.token;
  const decodedConfTkn = decodeConfToken(confToken);
  if (!decodedConfTkn) {
    throw new BadRequestError(USER_ERR_MES.CONF_TKN_INVALID);
  }
  const user = await User.findById(decodedConfTkn.uid);
  if (!user) {
    throw new NotFoundError(USER_ERR_MES.CONF_USER_NOT_FOUND);
  }
  user.isVerified = true;
  await user.save();
  res.send('Email confirmation completed');
});
