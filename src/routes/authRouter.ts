import express from 'express';

import { validateSignUpParams, validateSignInParams } from '@/validators/authValidators';
import { signUp, confirmation, signIn, refresh } from '@/controllers/authControllers';

const authRouter = express.Router();

authRouter.post('/signup', validateSignUpParams(), signUp);
authRouter.get('/confirmation/:token', confirmation);
authRouter.post('/signin', validateSignInParams(), signIn);
authRouter.get('/refresh', refresh);

export default authRouter;
