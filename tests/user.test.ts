import mongoose from 'mongoose';
import supertest, { Response } from 'supertest';
import { expect } from 'chai';

import app from '@/app';
import { COMMON_ERR_MES, USER_ERR_MES } from '@/common/errorMessages';
import { userMock, anotherUserMock } from './common/mocks';
import { NON_EXISTING_ID, NOT_VALID_ID } from './common/constants';

describe('TESTS: user actions', () => {
  let url: string;
  let response: Response;
  let userId: string;
  let userAccessToken: string;
  let anotherUserId: string;
  let anotherUserAccessToken: string;

  beforeEach(async () => {
    url = '/auth/signup';
    response = await supertest(app).post(url).set('Accept', 'application/json').send(userMock);
    expect(response.status, url).to.equal(201);
    let confToken = response.body.confToken;

    url = `/auth/confirmation/${confToken}`;
    response = await supertest(app).get(url).set('Accept', 'application/json');
    expect(response.status, url).to.equal(200);

    url = '/auth/signin';
    response = await supertest(app).post(url).set('Accept', 'application/json').send({
      email: userMock.email,
      password: userMock.password,
    });
    expect(response.status, url).to.equal(200);
    userId = response.body.user.id;
    expect(userId).to.be.a('string');
    userAccessToken = response.body.token;
    expect(userAccessToken).to.be.a('string');

    url = '/auth/signup';
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .send(anotherUserMock);
    expect(response.status, url).to.equal(201);
    confToken = response.body.confToken;

    url = `/auth/confirmation/${confToken}`;
    response = await supertest(app).get(url).set('Accept', 'application/json');
    expect(response.status, url).to.equal(200);

    url = '/auth/signin';
    response = await supertest(app).post(url).set('Accept', 'application/json').send({
      email: anotherUserMock.email,
      password: anotherUserMock.password,
    });
    expect(response.status, url).to.equal(200);
    anotherUserId = response.body.user.id;
    expect(userId).to.be.a('string');
    anotherUserAccessToken = response.body.token;
    expect(userAccessToken).to.be.a('string');
  });

  afterEach(async () => {
    url = undefined!;
    response = undefined!;
    userId = undefined!;
    userAccessToken = undefined!;

    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany();
    }
  });

  it('should return all users', async () => {
    url = `/users`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(200);
    expect(response.body, url).to.have.lengthOf(1);
    expect(response.body[0].id, url).to.equal(anotherUserId);

    url = `/users`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${anotherUserAccessToken}`);
    expect(response.status, url).to.equal(200);
    expect(response.body, url).to.have.lengthOf(1);
    expect(response.body[0].id, url).to.equal(userId);
  });

  it('should return user by id', async () => {
    url = `/users/${NOT_VALID_ID}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(400);
    expect(response.text, url).to.equal(COMMON_ERR_MES.DB_ID_INVALID);

    url = `/users/${NON_EXISTING_ID}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(404);
    expect(response.text, url).to.equal(USER_ERR_MES.NOT_FOUND);

    url = `/users/${userId}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(200);
    let user = response.body;
    expect(user.id, url).to.equal(userId);
    expect(user.name, url).to.equal(userMock.name);
    expect(user.email, url).to.equal(userMock.email);
    expect(user.password, url).to.equal(undefined);

    url = `/users/${anotherUserId}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(200);
    user = response.body;
    expect(user.id, url).to.equal(anotherUserId);
    expect(user.name, url).to.equal(anotherUserMock.name);
    expect(user.email, url).to.equal(anotherUserMock.email);
    expect(user.password, url).to.equal(undefined);
  });

  it('should update user with validate all params', async () => {
    url = `/users/${userId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        name: 'N',
      });
    expect(response.status, url).to.equal(400);

    url = `/users/${userId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        name: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      });
    expect(response.status, url).to.equal(400);

    url = `/users/${userId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        name: null,
      });
    expect(response.status, url).to.equal(400);

    url = `/users/${userId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        name: {},
      });
    expect(response.status, url).to.equal(400);

    url = `/users/${userId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        name: 12345,
      });
    expect(response.status, url).to.equal(400);

    url = `/users/${userId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        password: '',
      });
    expect(response.status, url).to.equal(400);

    url = `/users/${userId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        password: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      });
    expect(response.status, url).to.equal(400);

    url = `/users/${userId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        password: {},
      });
    expect(response.status, url).to.equal(400);

    url = `/users/${userId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        password: null,
      });
    expect(response.status, url).to.equal(400);
  });

  it('should not update another user', async () => {
    url = `/users/${userId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${anotherUserAccessToken}`)
      .send({
        name: 'New Name',
      });
    expect(response.status, url).to.equal(403);
    expect(response.text, url).to.equal(USER_ERR_MES.ACCESS_DENIED);

    url = `/users/${anotherUserId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        name: 'New Name',
      });
    expect(response.status, url).to.equal(403);
    expect(response.text, url).to.equal(USER_ERR_MES.ACCESS_DENIED);
  });

  it('should update user', async () => {
    url = `/users/${userId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        name: 'New Name',
      });
    expect(response.status, url).to.equal(200);

    url = `/users/${userId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        password: 'new_password',
      });
    expect(response.status, url).to.equal(200);

    url = '/auth/signout';
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(205);

    url = '/auth/signin';
    response = await supertest(app).post(url).set('Accept', 'application/json').send({
      email: userMock.email,
      password: userMock.password,
    });
    expect(response.status, url).to.equal(401);

    url = '/auth/signin';
    response = await supertest(app).post(url).set('Accept', 'application/json').send({
      email: userMock.email,
      password: 'new_password',
    });
    expect(response.status, url).to.equal(200);
    userAccessToken = response.body.token;
    expect(userAccessToken).to.be.a('string');

    url = `/users/${userId}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(200);
    const user = response.body;
    expect(user.id, url).to.equal(userId);
    expect(user.name, url).to.equal('New Name');
    expect(user.email, url).to.equal(userMock.email);
    expect(user.password, url).to.equal(undefined);
  });

  it('should not delete another user', async () => {
    url = `/users/${userId}`;
    response = await supertest(app)
      .delete(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${anotherUserAccessToken}`);
    expect(response.status, url).to.equal(403);
    expect(response.text, url).to.equal(USER_ERR_MES.ACCESS_DENIED);

    url = `/users/${anotherUserId}`;
    response = await supertest(app)
      .delete(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(403);
    expect(response.text, url).to.equal(USER_ERR_MES.ACCESS_DENIED);
  });

  it('should delete user', async () => {
    url = `/users/${userId}`;
    response = await supertest(app)
      .delete(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(200);

    url = `/users/${userId}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(404);
    expect(response.text, url).to.equal(USER_ERR_MES.NOT_FOUND);
  });
});
