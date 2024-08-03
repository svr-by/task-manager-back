import { Request, Response, NextFunction } from 'express';
import { AuthorizationError } from '@/common/appError';
import { USER_ERR_MES } from '@/common/errorMessages';
import { decodeAccToken } from '@/services/tokenService';
import { isValidDbId } from '@/services/databaseService';

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthorizationError();
  }
  const accessToken = authHeader.split(' ')[1];
  const decodedAcTkn = decodeAccToken(accessToken);
  if (!decodedAcTkn) {
    throw new AuthorizationError(USER_ERR_MES.ACC_TKN_EXPIRED);
  }
  const { uid } = decodedAcTkn;
  const isValidToken = isValidDbId(uid);
  if (!isValidToken) {
    throw new AuthorizationError(USER_ERR_MES.ACC_TKN_INVALID);
  }
  req.userId = uid;
  return next();
};

export default verifyToken;
