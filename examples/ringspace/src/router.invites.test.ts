/* eslint-disable @typescript-eslint/no-explicit-any */
import * as http from 'http';

/* eslint-disable node/no-unpublished-import */
import * as express from 'express';
import * as supertest from 'supertest';
import {v4} from 'uuid';

import * as automerge from '@automerge/automerge';

import {Controller} from './controller';
import {router} from './router';
import {SqliteStorage} from './storage';
import {toAutomerge} from './actors';

describe('create invites', () => {
  let app: express.Application;
  let server: http.Server;
  let storage: SqliteStorage;
  let adminActorId: string;
  let doc: automerge.Doc<any>;
  let doc_id: string;
  let adminToken: string;

  beforeEach(async () => {
    app = express();
    storage = new SqliteStorage(':memory:');
    await storage.init();
    const controller = new Controller(storage);
    const r = router(controller);
    app.use(r);
    server = app.listen(0);

    adminActorId = v4();
    doc = automerge.from(
      {
        nestedObject: {
          subObject: {
            someKey: 'someValue',
            someOtherKey: 42,
          },
        },
      },
      toAutomerge(adminActorId)
    );

    const changes = automerge
      .getAllChanges(doc)
      .map(arr => Buffer.of(...arr).toString('base64'));

    const createDocResp = await supertest(app)
      .post('/docs')
      .send({
        data: {
          type: 'docs',
          attributes: {
            actor_id: adminActorId,
            changes: changes,
          },
        },
      })
      .expect(201);
    const createDocAttrs = createDocResp.body?.data?.attributes;
    expect(createDocAttrs).toBeTruthy();
    expect(createDocResp.body.data.id).toBeTruthy();
    expect(createDocAttrs.token).toBeTruthy();
    doc_id = createDocResp.body.data.id;
    adminToken = createDocAttrs.token;
  });

  afterEach(async () => {
    server.close();
    await storage.close();
  });

  it('can create an invite to collaborate on a doc', async () => {
    const inviteResp: supertest.Response = await supertest(app)
      .post(`/docs/${doc_id}/invites`)
      .set({authorization: `Bearer ${adminToken}`})
      .send({
        data: {
          type: 'invites',
          attributes: {
            note: 'join the party',
            roles: ['writer'],
          },
        },
      })
      .expect(201);
    const invite_id = inviteResp.body.data?.id;
    expect(invite_id).toBeTruthy();
    expect(inviteResp.body).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          id: invite_id,
          type: 'invites',
          attributes: expect.objectContaining({
            note: 'join the party',
            roles: ['writer'],
          }),
        }),
        links: {
          consume: `/docs/${doc_id}/invites/${invite_id}`,
        },
      })
    );
  });

  it('can accept an invite to collaborate on a doc', async () => {
    const inviteResp: supertest.Response = await supertest(app)
      .post(`/docs/${doc_id}/invites`)
      .set({authorization: `Bearer ${adminToken}`})
      .send({
        data: {
          type: 'invites',
          attributes: {
            note: 'join the party',
            roles: ['writer'],
          },
        },
      })
      .expect(201);
    const inviteLink = inviteResp.body.links?.consume;
    expect(inviteLink).toBeTruthy();

    // Consume invite, get a token
    const consumeActorId = v4();
    const consumeResp: supertest.Response = await supertest(app)
      .delete(`${inviteLink}?actor_id=${consumeActorId}`)
      .expect(200);
    const {token, uses_remaining} = consumeResp.body.data?.attributes;
    expect(token).toBeTruthy();
    expect(uses_remaining).toEqual(0);
    const changesLink = consumeResp.body.links?.changes;
    expect(changesLink).toBeTruthy();

    // Invite has been consumed
    await supertest(app)
      .delete(`${inviteLink}?actor_id=${consumeActorId}`)
      .expect(404);
  });

  it('responds 401 when missing authorization', async () => {
    await supertest(app)
      .post(`/docs/${doc_id}/invites`)
      .send({
        data: {
          type: 'invites',
          attributes: {
            note: 'join the party',
            roles: ['writer'],
          },
        },
      })
      .expect(401);
  });

  it('responds 403 when authorization invalid', async () => {
    await supertest(app)
      .post(`/docs/${doc_id}/invites`)
      .set({authorization: 'Bearer nope'})
      .send({
        data: {
          type: 'invites',
          attributes: {
            note: 'join the party',
            roles: ['writer'],
          },
        },
      })
      .expect(403);
  });
});
