import mongoose from 'mongoose';
import supertest, { Response } from 'supertest';
import setCookie from 'set-cookie-parser';
import { IncomingMessage } from 'http';
import { expect } from 'chai';

import app from '@/app';
import config from '@/common/config';
import { ownerUserMock, memberUserMock, anotherUserMock } from './common/mocks';
import { NON_EXISTING_ID, NOT_VALID_ID } from './common/constants';

const { MAX_COLUMN_NUMBER_PER_PROJECT } = config;

describe('TESTS: column actions', () => {
  let url: string;
  let response: Response;
  let userId: string;
  let userAccessToken: string;
  let userRefreshToken: string;
  let memberUserId: string;
  let memberUserAccessToken: string;
  let anotherUserAccessToken: string;
  let projectId: string;

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
    projectId = undefined!;

    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany();
    }
  });

  it('should create a new column with validate all params', async () => {
    url = `/columns`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        // projectId,
        title: 'Column 1',
        order: 4,
      });
    expect(response.status, url).to.equal(400);

    url = `/columns`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        projectId: '',
        title: 'Column 1',
        order: 4,
      });
    expect(response.status, url).to.equal(400);

    url = `/columns`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        projectId: 'wrongId',
        title: 'Column 1',
        order: 4,
      });
    expect(response.status, url).to.equal(400);

    url = `/columns`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        projectId: {},
        title: 'Column 1',
        order: 4,
      });
    expect(response.status, url).to.equal(400);

    url = `/columns`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        projectId,
        // title: 'Column 1',
        order: 4,
      });
    expect(response.status, url).to.equal(400);

    url = `/columns`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        projectId,
        title: '',
        order: 4,
      });
    expect(response.status, url).to.equal(400);

    url = `/columns`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        projectId,
        title: 'Co',
        order: 4,
      });
    expect(response.status, url).to.equal(400);

    url = `/columns`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        projectId,
        title:
          'ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        order: 4,
      });
    expect(response.status, url).to.equal(400);

    url = `/columns`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        projectId,
        title: '******',
        order: 4,
      });
    expect(response.status, url).to.equal(400);

    url = `/columns`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        projectId,
        title: {},
        order: 4,
      });
    expect(response.status, url).to.equal(400);

    url = `/columns`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        projectId,
        title: 'Column 1',
        // order: 4,
      });
    expect(response.status, url).to.equal(400);

    url = `/columns`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        projectId,
        title: 'Column 1',
        order: 'order',
      });
    expect(response.status, url).to.equal(400);

    url = `/columns`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        projectId,
        title: 'Column 1',
        order: null,
      });
    expect(response.status, url).to.equal(400);

    url = `/columns`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        projectId,
        title: 'Column 1',
        order: {},
      });
    expect(response.status, url).to.equal(400);

    url = `/columns`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        projectId,
        title: 'Column 1',
        order: -1,
      });
    expect(response.status, url).to.equal(400);
  });

  it('should forbidden create a column without access to the project', async () => {
    url = `/columns`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${anotherUserAccessToken}`)
      .send({
        projectId,
        title: 'Column 1',
        order: 4,
      });
    expect(response.status, url).to.equal(403);
  });

  it('should not create a column when the number of columns is exceeded', async () => {
    for (let i = 1; i <= MAX_COLUMN_NUMBER_PER_PROJECT; i++) {
      url = `/columns`;
      response = await supertest(app)
        .post(url)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send({
          projectId,
          title: `Column ${i}`,
          order: i,
        });
      expect(response.status, url).to.equal(201);
    }

    url = `/columns`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        projectId,
        title: 'New column',
        order: MAX_COLUMN_NUMBER_PER_PROJECT + 1,
      });
    expect(response.status, url).to.equal(403);
  });

  it('should forbidden create a column with a duplicate title or order', async () => {
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
    expect(response.status, url).to.equal(409);

    url = `/columns`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        projectId,
        title: 'Column 1',
        order: 5,
      });
    expect(response.status, url).to.equal(409);

    url = `/columns`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        projectId,
        title: 'Column 2',
        order: 4,
      });
    expect(response.status, url).to.equal(409);
  });

  it('should forbidden return a column without access to the project', async () => {
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

    url = `/columns/${columnId}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${memberUserAccessToken}`);
    expect(response.status, url).to.equal(200);

    url = `/columns/${columnId}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${anotherUserAccessToken}`);
    expect(response.status, url).to.equal(403);
  });

  it('should return a column by member', async () => {
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

    url = `/columns/${columnId}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${memberUserAccessToken}`);
    expect(response.status, url).to.equal(200);
    const column = response.body;
    expect(column.title, url).to.equal('Column 1');
    expect(column.order, url).to.equal(4);
    expect(column.projectRef, url).to.equal(projectId);
  });

  it('should return a column by owner', async () => {
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

    url = `/columns/${NOT_VALID_ID}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(400);

    url = `/columns/${NON_EXISTING_ID}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(404);

    url = `/columns/${columnId}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(200);
    const column = response.body;
    expect(column.title, url).to.equal('Column 1');
    expect(column.order, url).to.equal(4);
    expect(column.projectRef, url).to.equal(projectId);
  });

  it('should update a column with validate all params', async () => {
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

    url = `/columns/${NON_EXISTING_ID}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: 'New title',
      });
    expect(response.status, url).to.equal(404);

    url = `/columns/${NOT_VALID_ID}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: 'New title',
      });
    expect(response.status, url).to.equal(400);

    url = `/columns/${columnId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({});
    expect(response.status, url).to.equal(400);

    url = `/columns/${columnId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: '',
      });
    expect(response.status, url).to.equal(400);

    url = `/columns/${columnId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: 'Co',
      });
    expect(response.status, url).to.equal(400);

    url = `/columns/${columnId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title:
          'ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
      });
    expect(response.status, url).to.equal(400);

    url = `/columns/${columnId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: '******',
      });
    expect(response.status, url).to.equal(400);

    url = `/columns/${columnId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: {},
      });
    expect(response.status, url).to.equal(400);
  });

  it('should forbidden update a column without access to the project', async () => {
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

    url = `/columns/${columnId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${anotherUserAccessToken}`)
      .send({
        title: 'Updated column 1',
      });
    expect(response.status, url).to.equal(403);
  });

  it('should not column properties other than the title', async () => {
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

    url = `/columns/${columnId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: 'Updated column 1',
        projectRef: NON_EXISTING_ID,
        order: 5,
        newField: 'newField',
      });
    expect(response.status, url).to.equal(200);

    url = `/columns/${columnId}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(200);
    const column = response.body;
    expect(column.title, url).to.equal('Updated column 1');
    expect(column.projectRef, url).to.equal(projectId);
    expect(column.order, url).to.equal(4);
    expect(column.newField, url).to.equal(undefined);
  });

  it('should update a column by member', async () => {
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

    url = `/columns/${columnId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${memberUserAccessToken}`)
      .send({
        title: 'Updated column 1',
      });
    expect(response.status, url).to.equal(200);
    expect(response.body.title, url).to.equal('Updated column 1');
  });

  it('should update a column by owner', async () => {
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

    url = `/columns/${columnId}`;
    response = await supertest(app)
      .put(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: 'Updated column 1',
      });
    expect(response.status, url).to.equal(200);
    expect(response.body.title, url).to.equal('Updated column 1');
  });

  it('should update set of column with validate all params', async () => {
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
    const firstColumnId = response.body.id;

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

    url = `/columns`;
    response = await supertest(app)
      .patch(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(400);

    url = `/columns`;
    response = await supertest(app)
      .patch(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({});
    expect(response.status, url).to.equal(400);

    url = `/columns`;
    response = await supertest(app)
      .patch(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send([]);
    expect(response.status, url).to.equal(400);

    url = `/columns`;
    response = await supertest(app)
      .patch(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send(['title1', 'title2']);
    expect(response.status, url).to.equal(400);

    url = `/columns`;
    response = await supertest(app)
      .patch(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send([{}]);
    expect(response.status, url).to.equal(400);

    url = `/columns`;
    response = await supertest(app)
      .patch(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send([
        {
          // id: firstColumnId,
          order: 5,
        },
      ]);
    expect(response.status, url).to.equal(400);

    url = `/columns`;
    response = await supertest(app)
      .patch(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send([
        {
          id: 'firstColumnId',
          order: 5,
        },
      ]);
    expect(response.status, url).to.equal(400);

    url = `/columns`;
    response = await supertest(app)
      .patch(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send([
        {
          id: {},
          order: 5,
        },
      ]);
    expect(response.status, url).to.equal(400);

    url = `/columns`;
    response = await supertest(app)
      .patch(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send([
        {
          id: firstColumnId,
          order: 'string',
        },
      ]);
    expect(response.status, url).to.equal(400);

    url = `/columns`;
    response = await supertest(app)
      .patch(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send([
        {
          id: firstColumnId,
          order: {},
        },
      ]);
    expect(response.status, url).to.equal(400);

    url = `/columns`;
    response = await supertest(app)
      .patch(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send([
        {
          id: firstColumnId,
          order: -1,
        },
      ]);
    expect(response.status, url).to.equal(400);
  });

  it('should forbidden update set of column without access to the project', async () => {
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
    const firstColumnId = response.body.id;

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

    url = `/columns`;
    response = await supertest(app)
      .patch(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${anotherUserAccessToken}`)
      .send([
        { id: firstColumnId, order: 5 },
        { id: secondColumnId, order: 4 },
      ]);
    expect(response.status, url).to.equal(403);
  });

  it('should not update set of column from different projects', async () => {
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
    const firstColumnId = response.body.id;

    url = `/projects`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        title: 'Project 2',
      });
    expect(response.status, url).to.equal(201);
    const secondProjectId = response.body.id;

    url = `/columns`;
    response = await supertest(app)
      .post(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send({
        projectId: secondProjectId,
        title: 'Column 2',
        order: 5,
      });
    expect(response.status, url).to.equal(201);
    const secondColumnId = response.body.id;

    url = `/columns`;
    response = await supertest(app)
      .patch(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send([
        { id: firstColumnId, order: 5 },
        { id: secondColumnId, order: 4 },
      ]);
    expect(response.status, url).to.equal(400);
  });

  it('should not update set of column with repeating params', async () => {
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
    const firstColumnId = response.body.id;

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

    url = `/columns`;
    response = await supertest(app)
      .patch(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send([
        { id: firstColumnId, order: 5 },
        { id: firstColumnId, order: 4 },
      ]);
    expect(response.status, url).to.equal(400);

    url = `/columns`;
    response = await supertest(app)
      .patch(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send([
        { id: firstColumnId, order: 5 },
        { id: secondColumnId, order: 5 },
      ]);
    expect(response.status, url).to.equal(400);
  });

  it('should update set of column', async () => {
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
    const firstColumnId = response.body.id;

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

    url = `/columns`;
    response = await supertest(app)
      .patch(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`)
      .send([
        { id: firstColumnId, order: 5 },
        { id: secondColumnId, order: 4 },
      ]);
    expect(response.status, url).to.equal(200);

    url = `/columns/${firstColumnId}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(200);
    expect(response.body.order, url).to.equal(5);

    url = `/columns/${secondColumnId}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(200);
    expect(response.body.order, url).to.equal(4);
  });

  it('should forbidden delete a column without access to the project', async () => {
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

    url = `/columns/${columnId}`;
    response = await supertest(app)
      .delete(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${anotherUserAccessToken}`);
    expect(response.status, url).to.equal(403);
  });

  it('should delete a column by member', async () => {
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

    url = `/columns/${columnId}`;
    response = await supertest(app)
      .delete(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${memberUserAccessToken}`);
    expect(response.status, url).to.equal(204);

    url = `/columns/${columnId}`;
    response = await supertest(app)
      .delete(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(404);

    url = `/columns/${columnId}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(404);
  });

  it('should delete a column by owner', async () => {
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

    url = `/columns/${columnId}`;
    response = await supertest(app)
      .delete(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(204);

    url = `/columns/${columnId}`;
    response = await supertest(app)
      .delete(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(404);

    url = `/columns/${columnId}`;
    response = await supertest(app)
      .get(url)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${userAccessToken}`);
    expect(response.status, url).to.equal(404);
  });

  it('should delete a column with associated tasks', async () => {
    //TODO: add test
  });
});
