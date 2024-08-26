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
    expect(response.text, url).to.equal(COMMON_ERR_MES.ID_INVALID);

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

  it('should return user with associated projects', async () => {
    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${anotherUserAccessToken}`)
      .send({
        title: 'Project 1',
      });
    expect(response.status, url).to.equal(201);
    const projectId = response.body.id;

    url = `/projects/${projectId}/member`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${anotherUserAccessToken}`)
      .send({
        email: userMock.email,
      });
    expect(response.status, url).to.equal(201);
    const invToken = response.body.invToken;
    expect(invToken).to.be.a('string');

    url = `/projects/${projectId}/member/${invToken}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(200);

    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: 'Project 2',
      });
    expect(response.status, url).to.equal(201);

    url = `/users/${userId}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(200);
    const user = response.body;
    expect(user.id, url).to.equal(userId);
    expect(user.name, url).to.equal(userMock.name);
    expect(user.email, url).to.equal(userMock.email);
    expect(user.projects, url).to.have.lengthOf(1);
    expect(user.ownProjects, url).to.have.lengthOf(1);
    expect(user.projects[0].title, url).to.equal('Project 1');
    expect(user.ownProjects[0].title, url).to.equal('Project 2');
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
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(204);

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
    expect(response.status, url).to.equal(204);

    url = `/users/${userId}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(404);
    expect(response.text, url).to.equal(USER_ERR_MES.NOT_FOUND);
  });

  it('should delete user from associated docs', async () => {
    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${anotherUserAccessToken}`)
      .send({
        title: 'Project 1',
      });
    expect(response.status, url).to.equal(201);
    const memberProjectId = response.body.id;

    url = `/projects/${memberProjectId}/member`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${anotherUserAccessToken}`)
      .send({
        email: userMock.email,
      });
    expect(response.status, url).to.equal(201);
    const invToken = response.body.invToken;
    expect(invToken).to.be.a('string');

    url = `/projects/${memberProjectId}/member/${invToken}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(200);

    url = `/columns`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        projectId: memberProjectId,
        title: 'Column 1',
        order: 4,
      });
    expect(response.status, url).to.equal(201);
    const columnId = response.body.id;

    url = `/tasks`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        columnId,
        title: 'Task 1',
        order: 1,
      });
    expect(response.status, url).to.equal(201);
    const assigneeTaskId = response.body.id;

    url = `/tasks/${assigneeTaskId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        assigneeId: userId,
      });
    expect(response.status, url).to.equal(200);

    url = `/tasks`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        columnId,
        title: 'Task 2',
        order: 2,
      });
    expect(response.status, url).to.equal(201);
    const subscribeTaskId = response.body.id;

    url = `/tasks/${subscribeTaskId}/subscribe`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(200);

    url = `/users/${userId}`;
    response = await supertest(app)
      .delete(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(204);

    url = `/projects/${memberProjectId}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${anotherUserAccessToken}`);
    expect(response.status, url).to.equal(200);
    expect(response.body.membersRefs, url).to.have.lengthOf(0);

    url = `/tasks/${assigneeTaskId}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${anotherUserAccessToken}`);
    expect(response.status, url).to.equal(200);
    expect(response.body.assigneeRef, url).to.equal(undefined);

    url = `/tasks/${subscribeTaskId}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${anotherUserAccessToken}`);
    expect(response.status, url).to.equal(200);
    expect(response.body.subscribersRefs, url).to.have.lengthOf(0);
  });
});
