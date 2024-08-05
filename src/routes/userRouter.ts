import express from 'express';
import { getAllUsers } from '@/controllers/userControllers';

const userRouter = express.Router();

userRouter.get('/', getAllUsers);

export default userRouter;
