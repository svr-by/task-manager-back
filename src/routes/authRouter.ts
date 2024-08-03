import express from 'express';

import { validateSignUpParams, validateSignInParams } from '@/validators/authValidators';
import { signUp, confirmation, signIn } from '@/controllers/authControllers';

const authRouter = express.Router();

authRouter.post('/signup', validateSignUpParams(), signUp);
authRouter.get('/confirmation/:token', confirmation);
authRouter.post('/signin', validateSignInParams(), signIn);

export default authRouter;
