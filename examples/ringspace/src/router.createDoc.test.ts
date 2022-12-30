import * as http from 'http';

import * as express from 'express';
/* eslint-disable node/no-unpublished-import */
import * as supertest from 'supertest';
import {v4} from 'uuid';

import * as automerge from '@automerge/automerge';

import {Controller} from './controller';
import {router} from './router';
import {SqliteStorage} from './storage';
import {toAutomerge} from './actors';

describe('create doc collaboration', () => {
  let app: express.Application;
  let server: http.Server;
  let storage: SqliteStorage;

  beforeEach(async () => {
    app = express();
    storage = new SqliteStorage(':memory:');
    await storage.init();
    const controller = new Controller(storage);
    const r = router(controller);
    app.use(r);
    server = app.listen(0);
  });

  afterEach(async () => {
    server.close();
    await storage.close();
  });

  it('can create a doc collaboration', async () => {
    const actor_id = v4();
    const newDoc: automerge.Doc<any> = automerge.from(
      {
        nestedObject: {
          subObject: {
            someKey: 'someValue',
            someOtherKey: 42,
          },
        },
      },
      toAutomerge(actor_id)
    );
    const changes = automerge
      .getAllChanges(newDoc)
      .map(arr => Buffer.of(...arr).toString('base64'));

    const resp = await supertest(app)
      .post('/docs')
      .send({
        data: {
          type: 'docs',
          attributes: {
            actor_id: actor_id,
            changes: changes,
          },
        },
      })
      .expect(201);

    expect(resp.body.data?.id).toBeTruthy();
    expect(resp.body.data?.attributes?.token).toBeTruthy();
    expect(resp.body).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          type: 'docs',
          attributes: expect.objectContaining({
            actor_id,
          }),
        }),
      })
    );

    expect(await storage.db('docs').count()).toEqual([{'count(*)': 1}]);
  });

  it('responds bad request for wrong resource type', async () => {
    await supertest(app)
      .post('/docs')
      .send({
        data: {
          type: 'scod',
          attributes: {
            actor_id: v4(),
            changes: [],
          },
        },
      })
      .expect(400);
  });

  it('responds not found for unsupported route', async () => {
    await supertest(app)
      .post('/scod')
      .send({
        data: {
          type: 'scod',
          attributes: {
            actor_id: v4(),
            changes: [],
          },
        },
      })
      .expect(404);
  });
});
