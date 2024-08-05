import express from 'express';
import { validateParamId } from '@/validators/commonValidators';
import { validateUpdateUserParams } from '@/validators/userValidators';
import { getAllUsers, getUser, updateUser, deleteUser } from '@/controllers/userControllers';

const userRouter = express.Router();

userRouter.get('/', getAllUsers);
userRouter.get('/:id', validateParamId(), getUser);
userRouter.put('/:id', validateUpdateUserParams(), updateUser);
userRouter.delete('/:id', validateParamId(), deleteUser);

export default userRouter;
