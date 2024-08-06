import express from 'express';
import { validateParamId } from '@/validators/commonValidator';
import { validateUpdateUserParams } from '@/validators/userValidator';
import { getAllUsers, getUser, updateUser, deleteUser } from '@/controllers/userController';

const userRouter = express.Router();

userRouter.get('/', getAllUsers);
userRouter.get('/:id', validateParamId(), getUser);
userRouter.put('/:id', validateUpdateUserParams(), updateUser);
userRouter.delete('/:id', validateParamId(), deleteUser);

export default userRouter;
