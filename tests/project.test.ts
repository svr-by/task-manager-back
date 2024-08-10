import mongoose from 'mongoose';
import supertest, { Response } from 'supertest';
import setCookie from 'set-cookie-parser';
import { IncomingMessage } from 'http';
import { expect } from 'chai';

import app from '@/app';
import { ownerUserMock, memberUserMock, anotherUserMock, userMock } from './common/mocks';
import { NON_EXISTING_ID, NOT_VALID_ID } from './common/constants';
import { COMMON_ERR_MES, PROJECT_ERR_MES, USER_ERR_MES } from '@/common/errorMessages';

describe('TESTS: project actions', () => {
  let url: string;
  let response: Response;
  let userId: string;
  let userAccessToken: string;
  let userRefreshToken: string;
  let memberUserId: string;
  let memberUserAccessToken: string;
  let anotherUserAccessToken: string;

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
    anotherUserAccessToken = response.body.token;
    expect(userAccessToken).to.be.a('string');
  });

  afterEach(async () => {
    response = undefined!;
    url = undefined!;
    userId = undefined!;
    userAccessToken = undefined!;
    userRefreshToken = undefined!;
    anotherUserAccessToken = undefined!;

    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany();
    }
  });

  it('should create a new project with validate all params', async () => {
    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        // title: 'Project 1',
        description: 'New project description',
      });
    expect(response.status, url).to.equal(400);
    expect(response.text, url).to.equal(COMMON_ERR_MES.TITLE_STRING);

    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: '',
        description: 'New project description',
      });
    expect(response.status, url).to.equal(400);
    expect(response.text, url).to.equal(COMMON_ERR_MES.TITLE_LENGTH);

    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: '12',
        description: 'New project description',
      });
    expect(response.status, url).to.equal(400);
    expect(response.text, url).to.equal(COMMON_ERR_MES.TITLE_LENGTH);

    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title:
          'ppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppp',
        description: 'New project description',
      });
    expect(response.status, url).to.equal(400);
    expect(response.text, url).to.equal(COMMON_ERR_MES.TITLE_LENGTH);

    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: '+++?/',
        description: 'New project description',
      });
    expect(response.status, url).to.equal(400);
    expect(response.text, url).to.equal(COMMON_ERR_MES.TITLE_CHARS);

    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: null,
        description: 'New project description',
      });
    expect(response.status, url).to.equal(400);
    expect(response.text, url).to.equal(COMMON_ERR_MES.TITLE_STRING);

    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: {},
        description: 'New project description',
      });
    expect(response.status, url).to.equal(400);
    expect(response.text, url).to.equal(COMMON_ERR_MES.TITLE_STRING);

    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: 'Project 1',
        description: null,
      });
    expect(response.status, url).to.equal(400);
    expect(response.text, url).to.equal(COMMON_ERR_MES.DESC_STRING);

    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: 'Project 1',
        description: 1000,
      });
    expect(response.status, url).to.equal(400);
    expect(response.text, url).to.equal(COMMON_ERR_MES.DESC_STRING);

    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: 'Project 1',
        description: {},
      });
    expect(response.status, url).to.equal(400);
    expect(response.text, url).to.equal(COMMON_ERR_MES.DESC_STRING);
  });

  it('should forbidden the creation of a project with a duplicate name', async () => {
    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: 'Project 1',
      });
    expect(response.status, url).to.equal(201);

    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: 'Project 1',
      });
    expect(response.status, url).to.equal(409);
    expect(response.text, url).to.equal(PROJECT_ERR_MES.REPEATED);

    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${anotherUserAccessToken}`)
      .send({
        title: 'Project 1',
      });
    expect(response.status, url).to.equal(409);
    expect(response.text, url).to.equal(PROJECT_ERR_MES.REPEATED);
  });

  it('should assign owner of the project', async () => {
    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: 'Project 1',
      });
    expect(response.status, url).to.equal(201);
    const project = response.body;
    expect(project.title, url).to.equal('Project 1');
    expect(project.ownerRef, url).to.equal(userId);
  });

  it('should create default columns', async () => {
    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: 'Project 1',
      });
    expect(response.status, url).to.equal(201);
    const projectId = response.body.id;

    url = `/projects/${projectId}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(200);
    expect(response.body.columns, url).to.have.lengthOf(3);
    const colTitles = response.body.columns.map((col: { title: string }) => col.title);
    expect(colTitles, url).to.include('Новые');
    expect(colTitles, url).to.include('В процессе');
    expect(colTitles, url).to.include('Готовые');
  });

  it('should return project list of all projects', async () => {
    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: 'Project 1',
      });
    expect(response.status, url).to.equal(201);

    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: 'Project 2',
      });
    expect(response.status, url).to.equal(201);

    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${anotherUserAccessToken}`)
      .send({
        title: 'Another Project 1',
      });
    expect(response.status, url).to.equal(201);

    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${anotherUserAccessToken}`)
      .send({
        title: 'Another Project 2',
      });
    expect(response.status, url).to.equal(201);

    url = `/projects`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(200);
    expect(response.body, url).to.have.lengthOf(4);
  });

  it('should return project by id', async () => {
    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: 'Project 1',
      });
    expect(response.status, url).to.equal(201);
    const projectId = response.body.id;

    url = `/projects/${NOT_VALID_ID}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(400);
    expect(response.text, url).to.equal(COMMON_ERR_MES.ID_INVALID);

    url = `/projects/${NON_EXISTING_ID}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(404);
    expect(response.text, url).to.equal(PROJECT_ERR_MES.NOT_FOUND);

    url = `/projects/${projectId}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(200);
    const project = response.body;
    expect(project.id, url).to.equal(projectId);
    expect(project.title, url).to.equal('Project 1');
    expect(project.ownerRef, url).to.equal(userId);
  });

  it('should return project with associated columns and tasks', async () => {
    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: 'Project 1',
      });
    expect(response.status, url).to.equal(201);
    const projectId = response.body.id;

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
    const columnId = response.body.id;

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
      });
    expect(response.status, url).to.equal(201);

    url = `/projects/${projectId}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(200);
    const project = response.body;
    expect(project.columns, url).to.have.lengthOf(4);
    expect(project.tasks, url).to.have.lengthOf(1);
    expect(project.tasks[0].title, url).to.equal('Task 1');
  });

  it('should forbidden access to project for non-member', async () => {
    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: 'Project 1',
      });
    expect(response.status, url).to.equal(201);
    const projectId = response.body.id;

    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${anotherUserAccessToken}`)
      .send({
        title: 'Another Project 1',
      });
    expect(response.status, url).to.equal(201);
    const anotherProjectId = response.body.id;

    url = `/projects/${projectId}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${anotherUserAccessToken}`);
    expect(response.status, url).to.equal(403);
    expect(response.text, url).to.equal(PROJECT_ERR_MES.NO_ACCESS);

    url = `/projects/${anotherProjectId}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(403);
    expect(response.text, url).to.equal(PROJECT_ERR_MES.NO_ACCESS);
  });

  it('should update the project with validate all params', async () => {
    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: 'Project 1',
        description: 'New project description',
      });
    expect(response.status, url).to.equal(201);
    const projectId = response.body.id;

    url = `/projects/${projectId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: '',
      });
    expect(response.status, url).to.equal(400);
    expect(response.text, url).to.equal(COMMON_ERR_MES.TITLE_LENGTH);

    url = `/projects/${projectId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: '12',
      });
    expect(response.status, url).to.equal(400);
    expect(response.text, url).to.equal(COMMON_ERR_MES.TITLE_LENGTH);

    url = `/projects/${projectId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title:
          'ppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppp',
      });
    expect(response.status, url).to.equal(400);
    expect(response.text, url).to.equal(COMMON_ERR_MES.TITLE_LENGTH);

    url = `/projects/${projectId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: null,
      });
    expect(response.status, url).to.equal(400);
    expect(response.text, url).to.equal(COMMON_ERR_MES.TITLE_STRING);

    url = `/projects/${projectId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: {},
      });
    expect(response.status, url).to.equal(400);
    expect(response.text, url).to.equal(COMMON_ERR_MES.TITLE_STRING);

    url = `/projects/${projectId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        description: null,
      });
    expect(response.status, url).to.equal(400);
    expect(response.text, url).to.equal(COMMON_ERR_MES.DESC_STRING);

    url = `/projects/${projectId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        description: 1000,
      });
    expect(response.status, url).to.equal(400);
    expect(response.text, url).to.equal(COMMON_ERR_MES.DESC_STRING);

    url = `/projects/${projectId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        description: {},
      });
    expect(response.status, url).to.equal(400);
    expect(response.text, url).to.equal(COMMON_ERR_MES.DESC_STRING);
  });

  it('should not update properties other than the title and description', async () => {
    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: 'Project 1',
        description: 'New project description',
      });
    expect(response.status, url).to.equal(201);
    const projectId = response.body.id;

    url = `/projects/${projectId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: 'Updated project 1',
        membersRef: [NON_EXISTING_ID],
        columns: [{ title: 'New column' }],
        newField: 'newField',
      });
    expect(response.status, url).to.equal(200);

    url = `/projects/${projectId}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(200);
    const project = response.body;
    expect(project.title, url).to.equal('Updated project 1');
    expect(project.membersRef, url).to.have.lengthOf(0);
    expect(project.newField, url).to.equal(undefined);
  });

  it('should update the project only by owner', async () => {
    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: 'Project 1',
        description: 'New project description',
      });
    expect(response.status, url).to.equal(201);
    const projectId = response.body.id;

    url = `/projects/${projectId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${memberUserAccessToken}`)
      .send({
        title: 'Updated project 1',
      });
    expect(response.status, url).to.equal(404);
    expect(response.text, url).to.equal(PROJECT_ERR_MES.NOT_FOUND_OR_NO_ACCESS);

    url = `/projects/${projectId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${anotherUserAccessToken}`)
      .send({
        title: 'Updated project 1',
      });
    expect(response.status, url).to.equal(404);
    expect(response.text, url).to.equal(PROJECT_ERR_MES.NOT_FOUND_OR_NO_ACCESS);

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

    url = `/projects/${projectId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${memberUserAccessToken}`)
      .send({
        title: 'Updated project 1',
      });
    expect(response.status, url).to.equal(404);
    expect(response.text, url).to.equal(PROJECT_ERR_MES.NOT_FOUND_OR_NO_ACCESS);
  });

  it('should delete the project only by owner', async () => {
    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: 'Project 1',
      });
    expect(response.status, url).to.equal(201);
    const projectId = response.body.id;

    url = `/projects/${projectId}`;
    response = await supertest(app)
      .delete(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${memberUserAccessToken}`);
    expect(response.status, url).to.equal(404);
    expect(response.text, url).to.equal(PROJECT_ERR_MES.NOT_FOUND_OR_NO_ACCESS);

    url = `/projects/${projectId}`;
    response = await supertest(app)
      .delete(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${anotherUserAccessToken}`);
    expect(response.status, url).to.equal(404);
    expect(response.text, url).to.equal(PROJECT_ERR_MES.NOT_FOUND_OR_NO_ACCESS);

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

    url = `/projects/${projectId}`;
    response = await supertest(app)
      .delete(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${memberUserAccessToken}`);
    expect(response.status, url).to.equal(404);
    expect(response.text, url).to.equal(PROJECT_ERR_MES.NOT_FOUND_OR_NO_ACCESS);

    url = `/projects/${projectId}`;
    response = await supertest(app)
      .delete(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(204);

    url = `/projects/${projectId}`;
    response = await supertest(app)
      .delete(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(404);
    expect(response.text, url).to.equal(PROJECT_ERR_MES.NOT_FOUND_OR_NO_ACCESS);

    url = `/projects/${projectId}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(404);
    expect(response.text, url).to.equal(PROJECT_ERR_MES.NOT_FOUND);
  });

  it('should delete the project along with columns and tasks', async () => {
    //TODO: add test
  });

  it('should invite member with validate email', async () => {
    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: 'Project 1',
      });
    expect(response.status, url).to.equal(201);
    const projectId = response.body.id;

    url = `/projects/${projectId}/member`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({});
    expect(response.status, url).to.equal(400);
    expect(response.text, url).to.equal(USER_ERR_MES.EMAIL_EPMTY);

    url = `/projects/${projectId}/member`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        email: '',
      });
    expect(response.status, url).to.equal(400);
    expect(response.text, url).to.equal(USER_ERR_MES.EMAIL_EPMTY);

    url = `/projects/${projectId}/member`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        email: 'email',
      });
    expect(response.status, url).to.equal(400);
    expect(response.text, url).to.equal(USER_ERR_MES.EMAIL_INVALID);

    url = `/projects/${projectId}/member`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        email: 123,
      });
    expect(response.status, url).to.equal(400);
    expect(response.text, url).to.equal(USER_ERR_MES.EMAIL_INVALID);

    url = `/projects/${projectId}/member`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        email: {},
      });
    expect(response.status, url).to.equal(400);
    expect(response.text, url).to.equal(USER_ERR_MES.EMAIL_INVALID);
  });

  it('should send invitation token when invite member', async () => {
    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: 'Project 1',
      });
    expect(response.status, url).to.equal(201);
    const projectId = response.body.id;

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
  });

  it('should invite member only to verified users', async () => {
    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: 'Project 1',
      });
    expect(response.status, url).to.equal(201);
    const projectId = response.body.id;

    url = `/projects/${projectId}/member`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        email: userMock.email,
      });
    expect(response.status, url).to.equal(404);
    expect(response.text, url).to.equal(USER_ERR_MES.NOT_FOUND_OR_NOT_VERIFIED);

    url = '/auth/signup';
    response = await supertest(app).post(url).set('Accept', 'application/json').send(userMock);
    expect(response.status, url).to.equal(201);

    url = `/projects/${projectId}/member`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        email: userMock.email,
      });
    expect(response.status, url).to.equal(404);
    expect(response.text, url).to.equal(USER_ERR_MES.NOT_FOUND_OR_NOT_VERIFIED);
  });

  it('should invite member only by owner', async () => {
    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
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
        email: memberUserMock.email,
      });
    expect(response.status, url).to.equal(403);
    expect(response.text, url).to.equal(PROJECT_ERR_MES.NOT_FOUND_OR_NO_ACCESS);
  });

  it('should check token when accepting member invitation', async () => {
    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: 'Project 1',
      });
    expect(response.status, url).to.equal(201);
    const projectId = response.body.id;

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

    url = `/projects/${projectId}/member/wrong_token`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${memberUserAccessToken}`);
    expect(response.status, url).to.equal(400);
    expect(response.text, url).to.equal(PROJECT_ERR_MES.INV_TKN_EXPIRED);
  });

  it('should accept member only with relevant id', async () => {
    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: 'Project 1',
      });
    expect(response.status, url).to.equal(201);
    const projectId = response.body.id;

    url = `/projects/${projectId}/member`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        email: memberUserMock.email,
      });
    expect(response.status, url).to.equal(201);
    const memberInvToken = response.body.invToken;
    expect(memberInvToken).to.be.a('string');

    url = `/projects/${projectId}/member`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        email: anotherUserMock.email,
      });
    expect(response.status, url).to.equal(201);
    const anotherInvToken = response.body.invToken;
    expect(anotherInvToken).to.be.a('string');

    url = `/projects/${projectId}/member/${memberInvToken}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${anotherUserAccessToken}`);
    expect(response.status, url).to.equal(403);
    expect(response.text, url).to.equal(PROJECT_ERR_MES.INV_TKN_INCORRECT);

    url = `/projects/${projectId}/member/${anotherInvToken}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${memberUserAccessToken}`);
    expect(response.status, url).to.equal(403);
    expect(response.text, url).to.equal(PROJECT_ERR_MES.INV_TKN_INCORRECT);
  });

  it('should accept new project member', async () => {
    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: 'Project 1',
      });
    expect(response.status, url).to.equal(201);
    const projectId = response.body.id;

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

    url = `/projects/${projectId}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${memberUserAccessToken}`);
    expect(response.status, url).to.equal(200);
    const project = response.body;
    expect(project.membersRef).to.include(memberUserId);
  });

  it('should delete token after accepting member invitation', async () => {
    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: 'Project 1',
      });
    expect(response.status, url).to.equal(201);
    const projectId = response.body.id;

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

    url = `/projects/${projectId}/member/${invToken}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${memberUserAccessToken}`);
    expect(response.status, url).to.equal(403);
    expect(response.text, url).to.equal(PROJECT_ERR_MES.INV_TKN_INCORRECT);
  });

  it('should validate id when remove a member', async () => {
    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: 'Project 1',
      });
    expect(response.status, url).to.equal(201);
    const projectId = response.body.id;

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

    url = `/projects/${NOT_VALID_ID}/member/${memberUserId}`;
    response = await supertest(app)
      .delete(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(400);
    expect(response.text, url).to.equal(COMMON_ERR_MES.ID_INVALID);

    url = `/projects/${projectId}/member/${NOT_VALID_ID}`;
    response = await supertest(app)
      .delete(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(400);
    expect(response.text, url).to.equal(COMMON_ERR_MES.USER_ID_INVALID);

    url = `/projects/${projectId}/member/${NON_EXISTING_ID}`;
    response = await supertest(app)
      .delete(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(404);
    expect(response.text, url).to.equal(PROJECT_ERR_MES.MEMBER_NOT_FOUND);
  });

  it('should remove member only by owner', async () => {
    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: 'Project 1',
      });
    expect(response.status, url).to.equal(201);
    const projectId = response.body.id;

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

    url = `/projects/${projectId}/member/${memberUserId}`;
    response = await supertest(app)
      .delete(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${memberUserAccessToken}`);
    expect(response.status, url).to.equal(403);
    expect(response.text, url).to.equal(PROJECT_ERR_MES.NOT_FOUND_OR_NO_ACCESS);

    url = `/projects/${projectId}/member/${memberUserId}`;
    response = await supertest(app)
      .delete(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(204);

    url = `/projects/${projectId}/member/${memberUserId}`;
    response = await supertest(app)
      .delete(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(404);
    expect(response.text, url).to.equal(PROJECT_ERR_MES.MEMBER_NOT_FOUND);

    url = `/projects/${projectId}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(200);
    const project = response.body;
    expect(project.membersRef).to.not.include(memberUserId);

    url = `/projects/${projectId}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${memberUserAccessToken}`);
    expect(response.status, url).to.equal(403);
    expect(response.text, url).to.equal(PROJECT_ERR_MES.NO_ACCESS);
  });

  it('should invite owner with validate email', async () => {
    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: 'Project 1',
      });
    expect(response.status, url).to.equal(201);
    const projectId = response.body.id;

    url = `/projects/${projectId}/owner`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({});
    expect(response.status, url).to.equal(400);
    expect(response.text, url).to.equal(USER_ERR_MES.EMAIL_EPMTY);

    url = `/projects/${projectId}/owner`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        email: '',
      });
    expect(response.status, url).to.equal(400);
    expect(response.text, url).to.equal(USER_ERR_MES.EMAIL_EPMTY);

    url = `/projects/${projectId}/owner`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        email: 'email',
      });
    expect(response.status, url).to.equal(400);
    expect(response.text, url).to.equal(USER_ERR_MES.EMAIL_INVALID);

    url = `/projects/${projectId}/owner`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        email: 123,
      });
    expect(response.status, url).to.equal(400);
    expect(response.text, url).to.equal(USER_ERR_MES.EMAIL_INVALID);

    url = `/projects/${projectId}/owner`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        email: {},
      });
    expect(response.status, url).to.equal(400);
    expect(response.text, url).to.equal(USER_ERR_MES.EMAIL_INVALID);
  });

  it('should send invitation token when invite owner', async () => {
    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: 'Project 1',
      });
    expect(response.status, url).to.equal(201);
    const projectId = response.body.id;

    url = `/projects/${projectId}/owner`;
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
  });

  it('should invite owner only to verified users', async () => {
    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: 'Project 1',
      });
    expect(response.status, url).to.equal(201);
    const projectId = response.body.id;

    url = `/projects/${projectId}/owner`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        email: userMock.email,
      });
    expect(response.status, url).to.equal(404);
    expect(response.text, url).to.equal(USER_ERR_MES.NOT_FOUND_OR_NOT_VERIFIED);

    url = '/auth/signup';
    response = await supertest(app).post(url).set('Accept', 'application/json').send(userMock);
    expect(response.status, url).to.equal(201);

    url = `/projects/${projectId}/owner`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        email: userMock.email,
      });
    expect(response.status, url).to.equal(404);
    expect(response.text, url).to.equal(USER_ERR_MES.NOT_FOUND_OR_NOT_VERIFIED);
  });

  it('should invite new owner only by owner', async () => {
    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: 'Project 1',
      });
    expect(response.status, url).to.equal(201);
    const projectId = response.body.id;

    url = `/projects/${projectId}/owner`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${anotherUserAccessToken}`)
      .send({
        email: memberUserMock.email,
      });
    expect(response.status, url).to.equal(403);
    expect(response.text, url).to.equal(PROJECT_ERR_MES.NOT_FOUND_OR_NO_ACCESS);
  });

  it('should check token when accepting owner invitation', async () => {
    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: 'Project 1',
      });
    expect(response.status, url).to.equal(201);
    const projectId = response.body.id;

    url = `/projects/${projectId}/owner`;
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

    url = `/projects/${projectId}/owner/wrong_token`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${memberUserAccessToken}`);
    expect(response.status, url).to.equal(400);
    expect(response.text, url).to.equal(PROJECT_ERR_MES.INV_TKN_EXPIRED);
  });

  it('should accept owner only with relevant id', async () => {
    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: 'Project 1',
      });
    expect(response.status, url).to.equal(201);
    const projectId = response.body.id;

    url = `/projects/${projectId}/owner`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        email: memberUserMock.email,
      });
    expect(response.status, url).to.equal(201);
    const memberInvToken = response.body.invToken;
    expect(memberInvToken).to.be.a('string');

    url = `/projects/${projectId}/owner`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        email: anotherUserMock.email,
      });
    expect(response.status, url).to.equal(201);
    const anotherInvToken = response.body.invToken;
    expect(anotherInvToken).to.be.a('string');

    url = `/projects/${projectId}/owner/${memberInvToken}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${anotherUserAccessToken}`);
    expect(response.status, url).to.equal(403);
    expect(response.text, url).to.equal(PROJECT_ERR_MES.INV_TKN_INCORRECT);

    url = `/projects/${projectId}/owner/${anotherInvToken}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${memberUserAccessToken}`);
    expect(response.status, url).to.equal(403);
    expect(response.text, url).to.equal(PROJECT_ERR_MES.INV_TKN_INCORRECT);
  });

  it('should accept owner only with relevant token', async () => {
    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: 'Project 1',
      });
    expect(response.status, url).to.equal(201);
    const projectId = response.body.id;

    url = `/projects/${projectId}/member`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        email: memberUserMock.email,
      });
    expect(response.status, url).to.equal(201);
    const memberInvToken = response.body.invToken;
    expect(memberInvToken).to.be.a('string');

    url = `/projects/${projectId}/owner`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        email: memberUserMock.email,
      });
    expect(response.status, url).to.equal(201);
    const ownerInvToken = response.body.invToken;
    expect(ownerInvToken).to.be.a('string');

    url = `/projects/${projectId}/member/${ownerInvToken}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${memberUserAccessToken}`);
    expect(response.status, url).to.equal(400);
    expect(response.text, url).to.equal(PROJECT_ERR_MES.INV_TKN_EXPIRED);

    url = `/projects/${projectId}/owner/${memberInvToken}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${memberUserAccessToken}`);
    expect(response.status, url).to.equal(400);
    expect(response.text, url).to.equal(PROJECT_ERR_MES.INV_TKN_EXPIRED);
  });

  it('should change owner', async () => {
    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: 'Project 1',
      });
    expect(response.status, url).to.equal(201);
    const projectId = response.body.id;

    url = `/projects/${projectId}/member`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        email: memberUserMock.email,
      });
    expect(response.status, url).to.equal(201);
    const memberInvToken = response.body.invToken;
    expect(memberInvToken).to.be.a('string');

    url = `/projects/${projectId}/owner`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        email: memberUserMock.email,
      });
    expect(response.status, url).to.equal(201);
    const ownerInvToken = response.body.invToken;
    expect(ownerInvToken).to.be.a('string');

    url = `/projects/${projectId}/owner/${ownerInvToken}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${memberUserAccessToken}`);
    expect(response.status, url).to.equal(200);

    url = `/projects/${projectId}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${memberUserAccessToken}`);
    expect(response.status, url).to.equal(200);
    const project = response.body;
    expect(project.ownerRef, url).to.equal(memberUserId);
    expect(project.membersRef, url).to.include(userId);
  });

  it('should delete token after accepting owner invitation', async () => {
    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: 'Project 1',
      });
    expect(response.status, url).to.equal(201);
    const projectId = response.body.id;

    url = `/projects/${projectId}/owner`;
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

    url = `/projects/${projectId}/owner/${invToken}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${memberUserAccessToken}`);
    expect(response.status, url).to.equal(200);

    url = `/projects/${projectId}/owner/${invToken}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${memberUserAccessToken}`);
    expect(response.status, url).to.equal(403);
    expect(response.text, url).to.equal(PROJECT_ERR_MES.INV_TKN_INCORRECT);
  });
});
