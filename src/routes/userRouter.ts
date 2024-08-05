import express from 'express';
import { getAllUsers, getUser } from '@/controllers/userControllers';
import { validateParamId } from '@/validators/commonValidators';

const userRouter = express.Router();

userRouter.get('/', getAllUsers);
userRouter.get('/:id', validateParamId(), getUser);

export default userRouter;
