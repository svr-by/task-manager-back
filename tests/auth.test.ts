import mongoose from 'mongoose';
import supertest, { Response } from 'supertest';
import setCookie from 'set-cookie-parser';
import { IncomingMessage } from 'http';
import { expect } from 'chai';

import app from '@/app';
import { USER_ERR_MES } from '@/common/errorMessages';

describe('TESTS: authorization actions', () => {
  let url: string;
  let response: Response;

  afterEach(async () => {
    url = undefined!;
    response = undefined!;

    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany();
    }
  });

  it('should sign up user with validate all params', async () => {
    url = '/auth/signup';
    response = await supertest(app).post(url).set('Accept', 'application/json').send({
      // name: 'Name',
      email: 'email@gmail.com',
      password: 'password',
    });
    expect(response.status, url).to.equal(400);

    url = '/auth/signup';
    response = await supertest(app).post(url).set('Accept', 'application/json').send({
      name: 'N',
      email: 'email@gmail.com',
      password: 'password',
    });
    expect(response.status, url).to.equal(400);

    url = '/auth/signup';
    response = await supertest(app).post(url).set('Accept', 'application/json').send({
      name: 'Nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn',
      email: 'email@gmail.com',
      password: 'password',
    });
    expect(response.status, url).to.equal(400);

    url = '/auth/signup';
    response = await supertest(app).post(url).set('Accept', 'application/json').send({
      name: null,
      email: 'email@gmail.com',
      password: 'password',
    });
    expect(response.status, url).to.equal(400);

    url = '/auth/signup';
    response = await supertest(app).post(url).set('Accept', 'application/json').send({
      name: {},
      email: 'email@gmail.com',
      password: 'password',
    });
    expect(response.status, url).to.equal(400);

    url = '/auth/signup';
    response = await supertest(app).post(url).set('Accept', 'application/json').send({
      name: 'Name',
      // email: 'email@gmail.com',
      password: 'password',
    });
    expect(response.status, url).to.equal(400);

    url = '/auth/signup';
    response = await supertest(app).post(url).set('Accept', 'application/json').send({
      name: 'Name',
      email: 'email',
      password: 'password',
    });
    expect(response.status, url).to.equal(400);

    url = '/auth/signup';
    response = await supertest(app).post(url).set('Accept', 'application/json').send({
      name: 'Name',
      email: 'email@gmail',
      password: 'password',
    });
    expect(response.status, url).to.equal(400);

    url = '/auth/signup';
    response = await supertest(app).post(url).set('Accept', 'application/json').send({
      name: 'Name',
      email: null,
      password: 'password',
    });
    expect(response.status, url).to.equal(400);

    url = '/auth/signup';
    response = await supertest(app).post(url).set('Accept', 'application/json').send({
      name: 'Name',
      email: {},
      password: 'password',
    });
    expect(response.status, url).to.equal(400);

    url = '/auth/signup';
    response = await supertest(app).post(url).set('Accept', 'application/json').send({
      name: 'Name',
      email: 'email@gmail.com',
      // password: 'password',
    });
    expect(response.status, url).to.equal(400);

    url = '/auth/signup';
    response = await supertest(app).post(url).set('Accept', 'application/json').send({
      name: 'Name',
      email: 'email@gmail.com',
      password: '',
    });
    expect(response.status, url).to.equal(400);

    url = '/auth/signup';
    response = await supertest(app).post(url).set('Accept', 'application/json').send({
      name: 'Name',
      email: 'email@gmail.com',
      password:
        'ppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppp',
    });
    expect(response.status, url).to.equal(400);

    url = '/auth/signup';
    response = await supertest(app).post(url).set('Accept', 'application/json').send({
      name: 'Name',
      email: 'email@gmail.com',
      password: {},
    });
    expect(response.status, url).to.equal(400);

    url = '/auth/signup';
    response = await supertest(app).post(url).set('Accept', 'application/json').send({
      name: 'Name',
      email: 'email@gmail.com',
      password: null,
    });
    expect(response.status, url).to.equal(400);

    url = '/auth/signup';
    response = await supertest(app).post(url).set('Accept', 'application/json').send({
      name: 'Name',
      email: 'email@gmail.com',
      password: 'password',
    });
    expect(response.status, url).to.equal(201);
  });

  it('should not create a user with an existing email', async () => {
    url = '/auth/signup';
    response = await supertest(app).post(url).set('Accept', 'application/json').send({
      name: 'User 1',
      email: 'email@gmail.com',
      password: 'password1',
    });
    expect(response.status, url).to.equal(201);

    url = '/auth/signup';
    response = await supertest(app).post(url).set('Accept', 'application/json').send({
      name: 'User 2',
      email: 'email@gmail.com',
      password: 'password2',
    });
    expect(response.status, url).to.equal(409);
    expect(response.text, url).to.equal(USER_ERR_MES.EMAIL_EXIST);
  });

  it('should send confirmation token when sign up a new user', async () => {
    url = '/auth/signup';
    response = await supertest(app).post(url).set('Accept', 'application/json').send({
      name: 'User',
      email: 'email@gmail.com',
      password: 'password',
    });
    expect(response.status, url).to.equal(201);
    const confToken = response.body.confToken;

    url = `/auth/confirmation/${confToken}`;
    response = await supertest(app).get(url).set('Accept', 'application/json');
    expect(response.status, url).to.equal(200);
  });

  it('should authorization error for unconfirmed user', async () => {
    url = '/auth/signup';
    response = await supertest(app).post(url).set('Accept', 'application/json').send({
      name: 'User',
      email: 'email@gmail.com',
      password: 'password',
    });
    expect(response.status, url).to.equal(201);

    url = '/auth/signin';
    response = await supertest(app).post(url).set('Accept', 'application/json').send({
      email: 'email@gmail.com',
      password: 'password',
    });
    expect(response.status, url).to.equal(401);
    expect(response.text, url).to.equal(USER_ERR_MES.NOT_CONFIRMED);
  });

  it('should sign in user with validate all params', async () => {
    url = '/auth/signin';
    response = await supertest(app).post(url).set('Accept', 'application/json').send({
      // email: 'email@gmail.com',
      password: 'password',
    });
    expect(response.status, url).to.equal(400);

    url = '/auth/signin';
    response = await supertest(app).post(url).set('Accept', 'application/json').send({
      email: 'email',
      password: 'password',
    });
    expect(response.status, url).to.equal(400);

    url = '/auth/signin';
    response = await supertest(app).post(url).set('Accept', 'application/json').send({
      email: 'email@gmail',
      password: 'password',
    });
    expect(response.status, url).to.equal(400);

    url = '/auth/signin';
    response = await supertest(app).post(url).set('Accept', 'application/json').send({
      email: null,
      password: 'password',
    });
    expect(response.status, url).to.equal(400);

    url = '/auth/signin';
    response = await supertest(app).post(url).set('Accept', 'application/json').send({
      email: {},
      password: 'password',
    });
    expect(response.status, url).to.equal(400);

    url = '/auth/signin';
    response = await supertest(app).post(url).set('Accept', 'application/json').send({
      email: 'email@gmail.com',
      // password: 'password',
    });
    expect(response.status, url).to.equal(400);

    url = '/auth/signin';
    response = await supertest(app).post(url).set('Accept', 'application/json').send({
      email: 'email@gmail.com',
      password: '',
    });
    expect(response.status, url).to.equal(400);

    url = '/auth/signin';
    response = await supertest(app).post(url).set('Accept', 'application/json').send({
      email: 'email@gmail.com',
      password:
        'ppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppp',
    });
    expect(response.status, url).to.equal(400);

    url = '/auth/signin';
    response = await supertest(app).post(url).set('Accept', 'application/json').send({
      email: 'email@gmail.com',
      password: {},
    });
    expect(response.status, url).to.equal(400);

    url = '/auth/signin';
    response = await supertest(app).post(url).set('Accept', 'application/json').send({
      email: 'email@gmail.com',
      password: null,
    });
    expect(response.status, url).to.equal(400);
  });

  it('should return not found error for not registered user', async () => {
    url = '/auth/signin';
    response = await supertest(app).post(url).set('Accept', 'application/json').send({
      email: 'email@gmail.com',
      password: 'password',
    });
    expect(response.status, url).to.equal(404);
    expect(response.text, url).to.equal(USER_ERR_MES.EMAIL_NOT_FOUND);
  });

  it('should return bad request error for user with wrong password', async () => {
    url = '/auth/signup';
    response = await supertest(app).post(url).set('Accept', 'application/json').send({
      name: 'User',
      email: 'email@gmail.com',
      password: 'password',
    });
    expect(response.status, url).to.equal(201);
    const confToken = response.body.confToken;

    url = `/auth/confirmation/${confToken}`;
    response = await supertest(app).get(url).set('Accept', 'application/json');
    expect(response.status, url).to.equal(200);

    url = '/auth/signin';
    response = await supertest(app).post(url).set('Accept', 'application/json').send({
      email: 'email@gmail.com',
      password: 'wrong_password',
    });
    expect(response.status, url).to.equal(401);
    expect(response.text, url).to.equal(USER_ERR_MES.PWD_INCORRECT);
  });

  it('should return tokens when sign in user', async () => {
    url = '/auth/signup';
    response = await supertest(app).post(url).set('Accept', 'application/json').send({
      name: 'User',
      email: 'email@gmail.com',
      password: 'password',
    });
    expect(response.status, url).to.equal(201);
    const confToken = response.body.confToken;

    url = `/auth/confirmation/${confToken}`;
    response = await supertest(app).get(url).set('Accept', 'application/json');
    expect(response.status, url).to.equal(200);

    url = '/auth/signin';
    response = await supertest(app).post(url).set('Accept', 'application/json').send({
      email: 'email@gmail.com',
      password: 'password',
    });
    expect(response.status, url).to.equal(200);
    const userId = response.body.user.id;
    expect(userId).to.be.a('string');
    const userAccessToken = response.body.token;
    expect(userAccessToken).to.be.a('string');
    const cookies = setCookie.parse(response as unknown as IncomingMessage, { map: true });
    const userRefreshToken = cookies?.jwt?.value;
    expect(userRefreshToken).to.be.a('string');
  });

  it('should not update tokens for unauthorized user', async () => {
    url = '/auth/signup';
    response = await supertest(app).post(url).set('Accept', 'application/json').send({
      name: 'User',
      email: 'email@gmail.com',
      password: 'password',
    });
    expect(response.status, url).to.equal(201);
    const confToken = response.body.confToken;

    url = `/auth/confirmation/${confToken}`;
    response = await supertest(app).get(url).set('Accept', 'application/json');
    expect(response.status, url).to.equal(200);

    url = '/auth/signin';
    response = await supertest(app).post(url).set('Accept', 'application/json').send({
      email: 'email@gmail.com',
      password: 'password',
    });
    expect(response.status, url).to.equal(200);
    const cookies = setCookie.parse(response as unknown as IncomingMessage, { map: true });
    const userRefreshToken = cookies?.jwt?.value;
    expect(userRefreshToken).to.be.a('string');

    url = '/auth/refresh';
    response = await supertest(app).get(url).set('Cookie', `jwt=${userRefreshToken}`);
    expect(response.status, url).to.equal(204);
  });

  it('should refresh tokens', async () => {
    url = '/auth/signup';
    response = await supertest(app).post(url).set('Accept', 'application/json').send({
      name: 'User',
      email: 'email@gmail.com',
      password: 'password',
    });
    expect(response.status, url).to.equal(201);
    const confToken = response.body.confToken;

    url = `/auth/confirmation/${confToken}`;
    response = await supertest(app).get(url).set('Accept', 'application/json');
    expect(response.status, url).to.equal(200);

    url = '/auth/signin';
    response = await supertest(app).post(url).set('Accept', 'application/json').send({
      email: 'email@gmail.com',
      password: 'password',
    });
    expect(response.status, url).to.equal(200);
    const userId = response.body.user.id;
    const userAccessToken = response.body.token;
    expect(userAccessToken).to.be.a('string');
    let cookies = setCookie.parse(response as unknown as IncomingMessage, { map: true });
    const userRefreshToken = cookies?.jwt?.value;
    expect(userRefreshToken).to.be.a('string');

    await new Promise((resolve) => setTimeout(resolve, 1000));

    url = '/auth/refresh';
    response = await supertest(app)
      .get(url)
      .set('Cookie', `jwt=${userRefreshToken}`)
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(201);
    expect(response.body.user.id, url).to.equal(userId);
    const userNewAccessToken = response.body.token;
    expect(userNewAccessToken).to.be.a('string');
    expect(userNewAccessToken, url).to.not.equal(userAccessToken);
    cookies = setCookie.parse(response as unknown as IncomingMessage, { map: true });
    const userNewRefreshToken = cookies?.jwt?.value;
    expect(userNewRefreshToken).to.be.a('string');
    expect(userNewRefreshToken, url).to.not.equal(userRefreshToken);
  });

  it('should remove refresh token when sign out', async () => {
    url = '/auth/signup';
    response = await supertest(app).post(url).set('Accept', 'application/json').send({
      name: 'User',
      email: 'email@gmail.com',
      password: 'password',
    });
    expect(response.status, url).to.equal(201);
    const confToken = response.body.confToken;

    url = `/auth/confirmation/${confToken}`;
    response = await supertest(app).get(url).set('Accept', 'application/json');
    expect(response.status, url).to.equal(200);

    url = '/auth/signin';
    response = await supertest(app).post(url).set('Accept', 'application/json').send({
      email: 'email@gmail.com',
      password: 'password',
    });
    expect(response.status, url).to.equal(200);
    const userAccessToken = response.body.token;
    expect(userAccessToken).to.be.a('string');
    let cookies = setCookie.parse(response as unknown as IncomingMessage, { map: true });
    const userRefreshToken = cookies?.jwt?.value;
    expect(userRefreshToken).to.be.a('string');

    url = '/auth/signout';
    response = await supertest(app)
      .get(url)
      .set('Cookie', `jwt=${userRefreshToken}`)
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status).to.equal(205);
    cookies = setCookie.parse(response as unknown as IncomingMessage, { map: true });
    const userNewRefreshToken = cookies?.jwt?.value;
    expect(userNewRefreshToken).to.equal('');

    url = '/auth/refresh';
    response = await supertest(app)
      .get(url)
      .set('Cookie', `jwt=${userRefreshToken}`)
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(401);

    url = '/auth/refresh';
    response = await supertest(app)
      .get(url)
      .set('Cookie', `jwt=${userNewRefreshToken}`)
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(204);
  });
});
