import express from 'express';

import { validateSignUpParams } from '@/validators/authValidators';
import { signUp } from '@/controllers/authControllers';

const authRouter = express.Router();

authRouter.post('/signup', validateSignUpParams(), signUp);

export default authRouter;
