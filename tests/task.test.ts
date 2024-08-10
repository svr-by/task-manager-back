import mongoose from 'mongoose';
import supertest, { Response } from 'supertest';
import setCookie from 'set-cookie-parser';
import { IncomingMessage } from 'http';
import { expect } from 'chai';

import app from '@/app';
import config from '@/common/config';
import { ownerUserMock, memberUserMock, anotherUserMock } from './common/mocks';
import { NON_EXISTING_ID, NOT_VALID_ID } from './common/constants';

const { MAX_TASK_NUMBER_PER_PROJECT } = config;

describe('TESTS: task actions', () => {
  let url: string;
  let response: Response;
  let userId: string;
  let userAccessToken: string;
  let userRefreshToken: string;
  let memberUserId: string;
  let memberUserAccessToken: string;
  let anotherUserId: string;
  let anotherUserAccessToken: string;
  let projectId: string;
  let columnId: string;

  beforeEach(async () => {
    url = '/auth/signup';
    response = await supertest(app).post(url).set('Accept', 'application/json').send(ownerUserMock);
    expect(response.status, url).to.equal(201);
    let confToken = response.body.confToken;

    url = `/auth/confirmation/${confToken}`;
    response = await supertest(app).get(url).set('Accept', 'application/json');
    expect(response.status, url).to.equal(200);

    url = '/auth/signin';
    response = await supertest(app).post(url).set('Accept', 'application/json').send({
      email: ownerUserMock.email,
      password: ownerUserMock.password,
    });
    expect(response.status, url).to.equal(200);
    userId = response.body.user.id;
    expect(userId).to.be.a('string');
    userAccessToken = response.body.token;
    expect(userAccessToken).to.be.a('string');
    const cookies = setCookie.parse(response as unknown as IncomingMessage, { map: true });
    userRefreshToken = cookies?.jwt?.value;
    expect(userRefreshToken).to.be.a('string');

    url = '/auth/signup';
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .send(memberUserMock);
    expect(response.status, url).to.equal(201);
    confToken = response.body.confToken;

    url = `/auth/confirmation/${confToken}`;
    response = await supertest(app).get(url).set('Accept', 'application/json');
    expect(response.status, url).to.equal(200);

    url = '/auth/signin';
    response = await supertest(app).post(url).set('Accept', 'application/json').send({
      email: memberUserMock.email,
      password: memberUserMock.password,
    });
    expect(response.status, url).to.equal(200);
    memberUserId = response.body.user.id;
    expect(memberUserId).to.be.a('string');
    memberUserAccessToken = response.body.token;
    expect(memberUserAccessToken).to.be.a('string');

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

    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: 'Project 1',
      });
    expect(response.status, url).to.equal(201);
    projectId = response.body.id;

    url = `/columns`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        projectId,
        title: 'Column 1',
        order: 4,
      });
    expect(response.status, url).to.equal(201);
    columnId = response.body.id;

    url = `/projects/${projectId}/member`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        email: memberUserMock.email,
      });
    expect(response.status, url).to.equal(201);
    const invToken = response.body.invToken;
    expect(invToken).to.be.a('string');

    url = `/projects/${projectId}/member/${invToken}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${memberUserAccessToken}`);
    expect(response.status, url).to.equal(200);
  });

  afterEach(async () => {
    response = undefined!;
    url = undefined!;
    userId = undefined!;
    userAccessToken = undefined!;
    userRefreshToken = undefined!;
    memberUserId = undefined!;
    memberUserAccessToken = undefined!;
    anotherUserAccessToken = undefined!;
    anotherUserId = undefined!;
    projectId = undefined!;
    columnId = undefined!;

    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany();
    }
  });

  it('should create a new task with validate all params', async () => {
    url = `/tasks`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        // columnId,
        title: 'Task 1',
        order: 1,
      });
    expect(response.status, url).to.equal(400);

    url = `/tasks`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        columnId: '',
        title: 'Task 1',
        order: 1,
      });
    expect(response.status, url).to.equal(400);

    url = `/tasks`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        columnId: 'wrongId',
        title: 'Task 1',
        order: 1,
      });
    expect(response.status, url).to.equal(400);

    url = `/tasks`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        columnId: {},
        title: 'Task 1',
        order: 1,
      });
    expect(response.status, url).to.equal(400);

    url = `/tasks`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        columnId,
        // title: 'Task 1',
        order: 1,
      });
    expect(response.status, url).to.equal(400);

    url = `/tasks`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        columnId,
        title: '',
        order: 1,
      });
    expect(response.status, url).to.equal(400);

    url = `/tasks`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        columnId,
        title: 'Ta',
        order: 1,
      });
    expect(response.status, url).to.equal(400);

    url = `/tasks`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        columnId,
        title:
          'ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        order: 1,
      });
    expect(response.status, url).to.equal(400);

    url = `/tasks`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        columnId,
        title: '******',
        order: 1,
      });
    expect(response.status, url).to.equal(400);

    url = `/tasks`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        columnId,
        title: {},
        order: 1,
      });
    expect(response.status, url).to.equal(400);

    url = `/tasks`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        columnId,
        title: 'Task 1',
        // order: 1,
      });
    expect(response.status, url).to.equal(400);

    url = `/tasks`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        columnId,
        title: 'Task 1',
        order: 'order',
      });
    expect(response.status, url).to.equal(400);

    url = `/tasks`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        columnId,
        title: 'Task 1',
        order: null,
      });
    expect(response.status, url).to.equal(400);

    url = `/tasks`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        columnId,
        title: 'Task 1',
        order: {},
      });
    expect(response.status, url).to.equal(400);

    url = `/tasks`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        columnId,
        title: 'Task 1',
        order: -1,
      });
    expect(response.status, url).to.equal(400);

    url = `/tasks`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        columnId,
        title: 'Task 1',
        order: 1,
        assigneeId: 'wrongId',
      });
    expect(response.status, url).to.equal(400);

    url = `/tasks`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        columnId,
        title: 'Task 1',
        order: 1,
        assigneeId: '',
      });
    expect(response.status, url).to.equal(400);

    url = `/tasks`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        columnId,
        title: 'Task 1',
        order: 1,
        assigneeId: {},
      });
    expect(response.status, url).to.equal(400);

    url = `/tasks`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        columnId,
        title: 'Task 1',
        order: 1,
        assigneeId: 12345,
      });
    expect(response.status, url).to.equal(400);

    url = `/tasks`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        columnId,
        title: 'Task 1',
        order: 1,
        priority: 'priority',
      });
    expect(response.status, url).to.equal(400);

    url = `/tasks`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        columnId,
        title: 'Task 1',
        order: 1,
        priority: null,
      });
    expect(response.status, url).to.equal(400);

    url = `/tasks`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        columnId,
        title: 'Task 1',
        order: 1,
        priority: {},
      });
    expect(response.status, url).to.equal(400);

    url = `/tasks`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        columnId,
        title: 'Task 1',
        order: 1,
        priority: -1,
      });
    expect(response.status, url).to.equal(400);

    url = `/tasks`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        columnId,
        title: 'Task 1',
        order: 1,
        description: null,
      });
    expect(response.status, url).to.equal(400);

    url = `/tasks`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        columnId,
        title: 'Task 1',
        order: 1,
        description: {},
      });
    expect(response.status, url).to.equal(400);

    url = `/tasks`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        columnId,
        title: 'Task 1',
        order: 1,
        description: 1000,
      });
    expect(response.status, url).to.equal(400);
  });

  it('should forbidden create a task without access to the project', async () => {
    url = `/tasks`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${anotherUserAccessToken}`)
      .send({
        columnId,
        title: 'Task 1',
        order: 1,
      });
    expect(response.status, url).to.equal(403);
  });

  it('should forbidden create a column when the number of columns is exceeded', async () => {
    for (let i = 1; i <= MAX_TASK_NUMBER_PER_PROJECT; i++) {
      url = `/tasks`;
      response = await supertest(app)
        .post(url)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({
          columnId,
          title: `Task ${i}`,
          order: i,
        });
      expect(response.status, url).to.equal(201);
    }

    url = `/tasks`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        columnId,
        title: 'New task',
        order: MAX_TASK_NUMBER_PER_PROJECT + 1,
      });
    expect(response.status, url).to.equal(403);
  });

  it('should forbidden create a task with a duplicate title or order', async () => {
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
    expect(response.status, url).to.equal(409);

    url = `/tasks`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        columnId,
        title: 'Task 1',
        order: 2,
      });
    expect(response.status, url).to.equal(409);

    url = `/tasks`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        columnId,
        title: 'Task 2',
        order: 1,
      });
    expect(response.status, url).to.equal(409);
  });

  it('should forbidden create a task with for assignee without access to the project', async () => {
    url = `/tasks`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        columnId,
        title: 'Task 1',
        order: 1,
        assigneeId: anotherUserId,
      });
    expect(response.status, url).to.equal(403);
  });

  it('should create task by member', async () => {
    url = `/tasks`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${memberUserAccessToken}`)
      .send({
        columnId,
        title: 'Task 1',
        order: 1,
      });
    expect(response.status, url).to.equal(201);
    const task = response.body;
    expect(task.title, url).to.equal('Task 1');
    expect(task.order, url).to.equal(1);
    expect(task.projectRef, url).to.equal(projectId);
    expect(task.columnRef, url).to.equal(columnId);
  });

  it('should create task by owner', async () => {
    url = `/tasks`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        projectId,
        columnId,
        title: 'Task 1',
        order: 1,
        assigneeId: userId,
        priority: 0,
        description: 'Very important task',
      });
    expect(response.status, url).to.equal(201);
    const task = response.body;
    expect(task.title, url).to.equal('Task 1');
    expect(task.order, url).to.equal(1);
    expect(task.projectRef, url).to.equal(projectId);
    expect(task.assigneeRef, url).to.equal(userId);
    expect(task.priority, url).to.equal(0);
    expect(task.description, url).to.equal('Very important task');
  });

  it('should forbidden return a task without access to the project', async () => {
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
    const taskId = response.body.id;

    url = `/tasks/${taskId}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${anotherUserAccessToken}`);
    expect(response.status, url).to.equal(403);
  });

  it('should return task with information about the assignee', async () => {
    url = `/tasks`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        projectId,
        columnId,
        title: 'Task 1',
        order: 1,
        assigneeId: memberUserId,
        priority: 0,
        description: 'Very important task',
      });
    expect(response.status, url).to.equal(201);
    const taskId = response.body.id;

    url = `/tasks/${taskId}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(200);
    const task = response.body;
    expect(task.assigneeRef.id, url).to.equal(memberUserId);
    expect(task.assigneeRef.name, url).to.equal(memberUserMock.name);
  });

  it('should return task by member', async () => {
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
    const taskId = response.body.id;

    url = `/tasks/${taskId}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${memberUserAccessToken}`);
    expect(response.status, url).to.equal(200);
    const task = response.body;
    expect(task.title, url).to.equal('Task 1');
    expect(task.order, url).to.equal(1);
    expect(task.projectRef, url).to.equal(projectId);
    expect(task.columnRef, url).to.equal(columnId);
  });

  it('should return task by owner', async () => {
    url = `/tasks`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        projectId,
        columnId,
        title: 'Task 1',
        order: 1,
        assigneeId: userId,
        priority: 0,
        description: 'Very important task',
      });
    expect(response.status, url).to.equal(201);
    const taskId = response.body.id;

    url = `/tasks/${NOT_VALID_ID}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(400);

    url = `/tasks/${NON_EXISTING_ID}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(404);

    url = `/tasks/${taskId}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(200);
    const task = response.body;
    expect(task.title, url).to.equal('Task 1');
    expect(task.order, url).to.equal(1);
    expect(task.projectRef, url).to.equal(projectId);
    expect(task.assigneeRef.id, url).to.equal(userId);
    expect(task.priority, url).to.equal(0);
    expect(task.description, url).to.equal('Very important task');
  });

  it('should update a column with validate all params', async () => {
    url = `/tasks`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        columnId,
        title: 'Task 1',
        order: 1,
        assigneeId: userId,
        priority: 0,
        description: 'Very important task',
      });
    expect(response.status, url).to.equal(201);
    const taskId = response.body.id;

    url = `/tasks/${taskId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: '',
      });
    expect(response.status, url).to.equal(400);

    url = `/tasks/${taskId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: 'Ta',
      });
    expect(response.status, url).to.equal(400);

    url = `/tasks/${taskId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title:
          'ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
      });
    expect(response.status, url).to.equal(400);

    url = `/tasks/${taskId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: '******',
      });
    expect(response.status, url).to.equal(400);

    url = `/tasks/${taskId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: {},
      });
    expect(response.status, url).to.equal(400);

    url = `/tasks/${taskId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        assigneeId: 'wrongId',
      });
    expect(response.status, url).to.equal(400);

    url = `/tasks/${taskId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        assigneeId: '',
      });
    expect(response.status, url).to.equal(400);

    url = `/tasks/${taskId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        assigneeId: {},
      });
    expect(response.status, url).to.equal(400);

    url = `/tasks/${taskId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        assigneeId: 12345,
      });
    expect(response.status, url).to.equal(400);

    url = `/tasks/${taskId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        priority: 'priority',
      });
    expect(response.status, url).to.equal(400);

    url = `/tasks/${taskId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        priority: null,
      });
    expect(response.status, url).to.equal(400);

    url = `/tasks/${taskId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        priority: {},
      });
    expect(response.status, url).to.equal(400);

    url = `/tasks/${taskId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        priority: -1,
      });
    expect(response.status, url).to.equal(400);

    url = `/tasks/${taskId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        priority: 0.5,
      });
    expect(response.status, url).to.equal(400);

    url = `/tasks/${taskId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        description: null,
      });
    expect(response.status, url).to.equal(400);

    url = `/tasks/${taskId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        description: {},
      });
    expect(response.status, url).to.equal(400);

    url = `/tasks/${taskId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        description: 1000,
      });
    expect(response.status, url).to.equal(400);
  });

  it('should forbidden update a column without access to the project', async () => {
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
    const taskId = response.body.id;

    url = `/tasks/${taskId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${anotherUserAccessToken}`)
      .send({
        title: 'Updated task 1',
      });
    expect(response.status, url).to.equal(403);
  });

  it('should not update task properties other than the title, assigneeId, priority, description', async () => {
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
    const taskId = response.body.id;

    url = `/tasks/${taskId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: 'Updated task 1',
        projectRef: NON_EXISTING_ID,
        columnRef: NON_EXISTING_ID,
        subscriberRefs: [NON_EXISTING_ID],
        order: 5,
        newField: 'newField',
      });
    expect(response.status, url).to.equal(200);

    url = `/tasks/${taskId}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(200);
    const task = response.body;
    expect(task.title, url).to.equal('Updated task 1');
    expect(task.projectRef, url).to.equal(projectId);
    expect(task.columnRef, url).to.equal(columnId);
    expect(task.subscriberRefs, url).to.have.lengthOf(0);
    expect(task.order, url).to.equal(1);
    expect(task.newField, url).to.equal(undefined);
  });

  it('should not update assignee without access to the project', async () => {
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
    const taskId = response.body.id;

    url = `/tasks/${taskId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        assigneeId: anotherUserId,
      });
    expect(response.status, url).to.equal(403);
  });

  it('should be possible to remove assignee', async () => {
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
    const taskId = response.body.id;

    url = `/tasks/${taskId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        assigneeId: memberUserId,
      });
    expect(response.status, url).to.equal(200);

    url = `/tasks/${taskId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        assigneeId: null,
      });
    expect(response.status, url).to.equal(200);

    url = `/tasks/${taskId}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(200);
    expect(response.body.assigneeRef, url).to.equal(null);
  });

  it('should update a task by member', async () => {
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
    const taskId = response.body.id;

    url = `/tasks/${taskId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${memberUserAccessToken}`)
      .send({
        title: 'Updated task 1',
      });
    expect(response.status, url).to.equal(200);
    expect(response.body.title, url).to.equal('Updated task 1');
  });

  it('should update a task by owner', async () => {
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
    const taskId = response.body.id;

    url = `/tasks/${taskId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: 'Updated task 1',
      });
    expect(response.status, url).to.equal(200);
    expect(response.body.title, url).to.equal('Updated task 1');
  });

  it('should update set of tasks with validate all params', async () => {
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
    const firstTaskId = response.body.id;

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

    url = `/tasks`;
    response = await supertest(app)
      .patch(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(400);

    url = `/tasks`;
    response = await supertest(app)
      .patch(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({});
    expect(response.status, url).to.equal(400);

    url = `/tasks`;
    response = await supertest(app)
      .patch(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send([]);
    expect(response.status, url).to.equal(400);

    url = `/tasks`;
    response = await supertest(app)
      .patch(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send(['title1', 'title2']);
    expect(response.status, url).to.equal(400);

    url = `/tasks`;
    response = await supertest(app)
      .patch(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send([{}]);
    expect(response.status, url).to.equal(400);

    url = `/tasks`;
    response = await supertest(app)
      .patch(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send([
        {
          // id: firstTaskId,
          columnId,
          order: 3,
        },
      ]);
    expect(response.status, url).to.equal(400);

    url = `/tasks`;
    response = await supertest(app)
      .patch(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send([
        {
          id: 'firstTaskId',
          columnId,
          order: 5,
        },
      ]);
    expect(response.status, url).to.equal(400);

    url = `/tasks`;
    response = await supertest(app)
      .patch(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send([
        {
          id: {},
          columnId,
          order: 5,
        },
      ]);
    expect(response.status, url).to.equal(400);

    url = `/tasks`;
    response = await supertest(app)
      .patch(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send([
        {
          id: firstTaskId,
          // columnId,
          order: 3,
        },
      ]);
    expect(response.status, url).to.equal(400);

    url = `/tasks`;
    response = await supertest(app)
      .patch(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send([
        {
          id: firstTaskId,
          columnId: 'columnId',
          order: 5,
        },
      ]);
    expect(response.status, url).to.equal(400);

    url = `/tasks`;
    response = await supertest(app)
      .patch(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send([
        {
          id: firstTaskId,
          columnId: {},
          order: 5,
        },
      ]);
    expect(response.status, url).to.equal(400);

    url = `/tasks`;
    response = await supertest(app)
      .patch(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send([
        {
          id: firstTaskId,
          columnId,
          order: 'string',
        },
      ]);
    expect(response.status, url).to.equal(400);

    url = `/tasks`;
    response = await supertest(app)
      .patch(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send([
        {
          id: firstTaskId,
          columnId,
          order: {},
        },
      ]);
    expect(response.status, url).to.equal(400);

    url = `/tasks`;
    response = await supertest(app)
      .patch(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send([
        {
          id: firstTaskId,
          columnId,
          order: -1,
        },
      ]);
    expect(response.status, url).to.equal(400);
  });

  it('should forbidden update set of tasks without access to the project', async () => {
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
    const firstTaskId = response.body.id;

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
    const secondTaskId = response.body.id;

    url = `/tasks`;
    response = await supertest(app)
      .patch(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${anotherUserAccessToken}`)
      .send([
        { id: firstTaskId, columnId, order: 2 },
        { id: secondTaskId, columnId, order: 1 },
      ]);
    expect(response.status, url).to.equal(403);
  });

  it('should not update set of tasks from different projects', async () => {
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
    const firstTaskId = response.body.id;

    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: 'Project 2',
      });
    expect(response.status, url).to.equal(201);
    const anotherProjectId = response.body.id;

    url = `/columns`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        projectId: anotherProjectId,
        title: 'Another column 1',
        order: 4,
      });
    expect(response.status, url).to.equal(201);
    const anotherColumnId = response.body.id;

    url = `/tasks`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        columnId: anotherColumnId,
        title: 'Another task 1',
        order: 1,
      });
    expect(response.status, url).to.equal(201);
    const anotherTaskId = response.body.id;

    url = `/tasks`;
    response = await supertest(app)
      .patch(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send([
        { id: firstTaskId, columnId, order: 2 },
        { id: anotherTaskId, columnId, order: 1 },
      ]);
    expect(response.status, url).to.equal(400);
  });

  it('should not update set of tasks with repeating params', async () => {
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
    const firstTaskId = response.body.id;

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

    url = `/tasks`;
    response = await supertest(app)
      .patch(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send([
        { id: firstTaskId, columnId, order: 2 },
        { id: firstTaskId, columnId, order: 1 },
      ]);
    expect(response.status, url).to.equal(400);

    url = `/tasks`;
    response = await supertest(app)
      .patch(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send([
        { id: firstTaskId, columnId, order: 3 },
        { id: firstTaskId, columnId, order: 3 },
      ]);
    expect(response.status, url).to.equal(400);
  });

  it('should update set of tasks from different columns', async () => {
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
    const firstTaskId = response.body.id;

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
    const secondTaskId = response.body.id;

    url = `/columns`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        projectId,
        title: 'Column 2',
        order: 5,
      });
    expect(response.status, url).to.equal(201);
    const secondColumnId = response.body.id;

    url = `/tasks`;
    response = await supertest(app)
      .patch(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send([{ id: secondTaskId, columnId: secondColumnId, order: 1 }]);
    expect(response.status, url).to.equal(200);

    url = `/tasks`;
    response = await supertest(app)
      .patch(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send([
        { id: firstTaskId, columnId, order: 2 },
        { id: secondTaskId, columnId, order: 1 },
      ]);
    expect(response.status, url).to.equal(200);

    url = `/tasks`;
    response = await supertest(app)
      .patch(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send([
        { id: firstTaskId, columnId, order: 1 },
        { id: secondTaskId, columnId: secondColumnId, order: 1 },
      ]);
    expect(response.status, url).to.equal(200);

    url = `/tasks/${firstTaskId}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(200);
    expect(response.body.columnRef, url).to.equal(columnId);
    expect(response.body.order, url).to.equal(1);

    url = `/tasks/${secondTaskId}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.body.columnRef, url).to.equal(secondColumnId);
    expect(response.body.order, url).to.equal(1);
  });

  it('should update set of tasks by member', async () => {
    url = `/tasks`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${memberUserAccessToken}`)
      .send({
        columnId,
        title: 'Task 1',
        order: 1,
      });
    expect(response.status, url).to.equal(201);
    const firstTaskId = response.body.id;

    url = `/columns`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${memberUserAccessToken}`)
      .send({
        projectId,
        title: 'Column 2',
        order: 5,
      });
    expect(response.status, url).to.equal(201);
    const secondColumnId = response.body.id;

    url = `/tasks`;
    response = await supertest(app)
      .patch(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${memberUserAccessToken}`)
      .send([{ id: firstTaskId, columnId: secondColumnId, order: 1 }]);
    expect(response.status, url).to.equal(200);
  });

  it('should update set of tasks by owner', async () => {
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
    const firstTaskId = response.body.id;

    url = `/columns`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        projectId,
        title: 'Column 2',
        order: 5,
      });
    expect(response.status, url).to.equal(201);
    const secondColumnId = response.body.id;

    url = `/tasks`;
    response = await supertest(app)
      .patch(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send([{ id: firstTaskId, columnId: secondColumnId, order: 1 }]);
    expect(response.status, url).to.equal(200);
  });

  it('should forbidden delete a task without access to the project', async () => {
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
    const taskId = response.body.id;

    url = `/tasks/${taskId}`;
    response = await supertest(app)
      .delete(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${anotherUserAccessToken}`);
    expect(response.status, url).to.equal(403);
  });

  it('should delete a task by member', async () => {
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
    const taskId = response.body.id;

    url = `/tasks/${taskId}`;
    response = await supertest(app)
      .delete(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${memberUserAccessToken}`);
    expect(response.status, url).to.equal(204);

    url = `/tasks/${taskId}`;
    response = await supertest(app)
      .delete(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${memberUserAccessToken}`);
    expect(response.status, url).to.equal(404);

    url = `/tasks/${taskId}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${memberUserAccessToken}`);
    expect(response.status, url).to.equal(404);
  });

  it('should delete a task by owner', async () => {
    url = `/tasks`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${memberUserAccessToken}`)
      .send({
        columnId,
        title: 'Task 1',
        order: 1,
      });
    expect(response.status, url).to.equal(201);
    const taskId = response.body.id;

    url = `/tasks/${taskId}`;
    response = await supertest(app)
      .delete(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(204);

    url = `/tasks/${taskId}`;
    response = await supertest(app)
      .delete(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(404);

    url = `/tasks/${taskId}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(404);
  });

  it('should forbidden subscribe to task without access to the project', async () => {
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
    const taskId = response.body.id;

    url = `/tasks/${taskId}/subscribe`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${anotherUserAccessToken}`);
    expect(response.status, url).to.equal(403);

    url = `/tasks/${taskId}/subscribe`;
    response = await supertest(app)
      .delete(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${anotherUserAccessToken}`);
    expect(response.status, url).to.equal(403);
  });

  it('should subscribe to task by member', async () => {
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
    const taskId = response.body.id;

    url = `/tasks/${taskId}/subscribe`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${memberUserAccessToken}`);
    expect(response.status, url).to.equal(200);

    url = `/tasks/${taskId}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${memberUserAccessToken}`);
    expect(response.status, url).to.equal(200);
    let subsIds = response.body.subscriberRefs.map((subs: { id: string }) => subs.id);
    expect(subsIds, url).to.include(memberUserId);

    url = `/tasks/${taskId}/subscribe`;
    response = await supertest(app)
      .delete(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${memberUserAccessToken}`);
    expect(response.status, url).to.equal(204);

    url = `/tasks/${taskId}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${memberUserAccessToken}`);
    expect(response.status, url).to.equal(200);
    subsIds = response.body.subscriberRefs.map((subs: { id: string }) => subs.id);
    expect(subsIds, url).to.not.include(userId);
  });

  it('should subscribe to task by owner', async () => {
    url = `/tasks`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${memberUserAccessToken}`)
      .send({
        columnId,
        title: 'Task 1',
        order: 1,
      });
    expect(response.status, url).to.equal(201);
    const taskId = response.body.id;

    url = `/tasks/${taskId}/subscribe`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(200);

    url = `/tasks/${taskId}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(200);
    let subsIds = response.body.subscriberRefs.map((subs: { id: string }) => subs.id);
    expect(subsIds, url).to.include(userId);

    url = `/tasks/${taskId}/subscribe`;
    response = await supertest(app)
      .delete(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(204);

    url = `/tasks/${taskId}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(200);
    subsIds = response.body.subscriberRefs.map((subs: { id: string }) => subs.id);
    expect(subsIds, url).to.not.include(userId);
  });

  // it('test subscribe', async () => {
  //   url = `/tasks`;
  //   response = await supertest(app)
  //     .post(url)
  //     .set('Accept', 'application/json')
  //     .set('Authorization', `Bearer ${userAccessToken}`)
  //     .send({
  //       columnId,
  //       title: 'Task 1',
  //       order: 1,
  //     });
  //   expect(response.status, url).to.equal(201);
  //   const taskId = response.body.id;

  //   url = `/tasks/${taskId}/subscribe`;
  //   response = await supertest(app)
  //     .put(url)
  //     .set('Accept', 'application/json')
  //     .set('Authorization', `Bearer ${memberUserAccessToken}`);
  //   expect(response.status, url).to.equal(200);

  //   url = `/tasks/${taskId}`;
  //   response = await supertest(app)
  //     .put(url)
  //     .set('Accept', 'application/json')
  //     .set('Authorization', `Bearer ${userAccessToken}`)
  //     .send({
  //       title: 'Updated task 1',
  //       priority: 2,
  //     });
  //   expect(response.status, url).to.equal(200);

  //   url = `/tasks/${taskId}`;
  //   response = await supertest(app)
  //     .put(url)
  //     .set('Accept', 'application/json')
  //     .set('Authorization', `Bearer ${userAccessToken}`)
  //     .send({
  //       assigneeId: userId,
  //     });
  //   expect(response.status, url).to.equal(200);

  //   url = `/columns`;
  //   response = await supertest(app)
  //     .post(url)
  //     .set('Accept', 'application/json')
  //     .set('Authorization', `Bearer ${userAccessToken}`)
  //     .send({
  //       projectId,
  //       title: 'Column 2',
  //       order: 5,
  //     });
  //   expect(response.status, url).to.equal(201);
  //   const secondColumnId = response.body.id;

  //   url = `/tasks`;
  //   response = await supertest(app)
  //     .patch(url)
  //     .set('Accept', 'application/json')
  //     .set('Authorization', `Bearer ${userAccessToken}`)
  //     .send([{ id: taskId, columnId: secondColumnId, order: 1 }]);
  //   expect(response.status, url).to.equal(200);

  //   url = `/tasks/${taskId}`;
  //   response = await supertest(app)
  //     .get(url)
  //     .set('Accept', 'application/json')
  //     .set('Authorization', `Bearer ${userAccessToken}`);
  //   expect(response.status, url).to.equal(200);
  //   console.log(response.body);

  //   url = `/tasks/${taskId}`;
  //   response = await supertest(app)
  //     .delete(url)
  //     .set('Accept', 'application/json')
  //     .set('Authorization', `Bearer ${userAccessToken}`);
  //   expect(response.status, url).to.equal(204);

  //   url = `/tasks/${taskId}/subscribe`;
  //   response = await supertest(app)
  //     .delete(url)
  //     .set('Accept', 'application/json')
  //     .set('Authorization', `Bearer ${userAccessToken}`);
  //   expect(response.status, url).to.equal(404);
  // });
});
