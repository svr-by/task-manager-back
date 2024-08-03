import express from 'express';

import { validateSignUpParams } from '@/validators/authValidators';
import { signUp, confirmation } from '@/controllers/authControllers';

const authRouter = express.Router();

authRouter.post('/signup', validateSignUpParams(), signUp);
authRouter.get('/confirmation/:token', confirmation);

export default authRouter;
