import express from 'express';

import { validateSignUpParams, validateSignInParams } from '@/validators/authValidator';
import { signUp, confirmation, signIn, refresh, signOut } from '@/controllers/authController';

const authRouter = express.Router();

authRouter.post('/signup', validateSignUpParams(), signUp);
authRouter.get('/confirmation/:token', confirmation);
authRouter.post('/signin', validateSignInParams(), signIn);
authRouter.get('/refresh', refresh);
authRouter.post('/signout', signOut);

export default authRouter;
