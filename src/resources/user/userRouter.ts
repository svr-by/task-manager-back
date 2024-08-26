import express from 'express';
import { validateParamId } from '@/common/commonValidator';
import { validateUpdateUserParams } from './userValidator';
import { getAllUsers, getUser, updateUser, deleteUser } from './userController';

const userRouter = express.Router();

userRouter.get('/', getAllUsers);
userRouter.get('/:id', validateParamId(), getUser);
userRouter.put('/:id', validateUpdateUserParams(), updateUser);
userRouter.delete('/:id', validateParamId(), deleteUser);

export default userRouter;
