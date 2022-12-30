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

describe('append changes', () => {
  let app: express.Application;
  let server: http.Server;
  let storage: SqliteStorage;
  let actor_id: string;
  let doc: automerge.Doc<any>;
  let doc_id: string;
  let token: string;

  beforeEach(async () => {
    app = express();
    storage = new SqliteStorage(':memory:');
    await storage.init();
    const controller = new Controller(storage);
    const r = router(controller);
    app.use(r);
    server = app.listen(0);

    actor_id = v4();
    doc = automerge.from(
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
      .getAllChanges(doc)
      .map(arr => Buffer.of(...arr).toString('base64'));

    const createDocResp = await supertest(app)
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
    const createDocAttrs = createDocResp.body?.data?.attributes;
    expect(createDocAttrs).toBeTruthy();
    expect(createDocResp.body.data.id).toBeTruthy();
    expect(createDocAttrs.token).toBeTruthy();
    doc_id = createDocResp.body.data.id;
    token = createDocAttrs.token;
  });

  afterEach(async () => {
    server.close();
    await storage.close();
  });

  it('can append changes to a doc', async () => {
    const newDoc = automerge.change(doc, (modifyDoc: any) => {
      modifyDoc.hello = 'world';
    });
    const changes = automerge.getChanges(doc, newDoc);
    const appendResp: supertest.Response = await supertest(app)
      .post(`/docs/${doc_id}/changes`)
      .set({authorization: `Bearer ${token}`})
      .send({
        data: {
          type: 'changes',
          attributes: {
            changes: changes.map(ch => Buffer.of(...ch).toString('base64')),
          },
        },
      })
      .expect(200);
    expect(appendResp.body.meta?.changes_added).toEqual(1);
  });
});
