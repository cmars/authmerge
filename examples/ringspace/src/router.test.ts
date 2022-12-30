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
    server = app.listen(6666);
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

    await supertest(app)
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

    expect(await storage.db('docs').count()).toEqual([{'count(*)': 1}]);
  });
});
