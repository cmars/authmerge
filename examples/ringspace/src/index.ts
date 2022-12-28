import * as path from 'path';

import * as express from 'express';
import {knex, Knex} from 'knex';

const app = express();
const port = 3000;

const initdb = async (db: Knex) => {
  if (!(await db.schema.hasTable('actor_changes'))) {
    await db.schema.createTable('actor_changes', table => {
      table.primary(['actor_id', 'offset']);
      table.increments('offset');
      table.uuid('actor_id');
      table.timestamp('created_at', {useTz: true}).defaultTo(db.fn.now());
      table.binary('change');
    });
  }
  if (!(await db.schema.hasTable('actors'))) {
    await db.schema.createTable('actors', table => {
      table.primary(['pool_id', 'actor_id']);
      table.uuid('pool_id');
      table.uuid('actor_id');
      table.json('roles');
    });
  }
  if (!(await db.schema.hasTable('pools'))) {
    await db.schema.createTable('pools', table => {
      table.primary(['pool_id']);
      table.uuid('pool_id');
      // What do we want to say about a pool?
    });
  }
};

interface CreatePoolRequest {
  actor_id: string;
  changes: string[];
  invite_requests: CreateInviteRequest[];
}

interface CreateInviteRequest {
  nickname: string;
  roles: string[];
}

interface CreateInviteResponse {
  roles: string[];
  token: string;
}

interface CreatePoolResponse {
  pool_id: string;
  invite_responses: CreateInviteResponse[];
}

interface CreateActorRequest {
  actor_id: string;
  nickname: string;
  invite_token: string;
}

interface CreateActorResponse {
  pool_id: string;
  changes: string[];
}

const main = async () => {
  const db: Knex = knex({
    client: 'sqlite3',
    connection: {
      filename: path.join(__dirname, '..', 'ringspace.db'),
    },
  });
  await initdb(db);

  app.post('/pools', (req: express.Request, res: express.Response) => {
    res.send('hello world');
  });

  app.get('/', (req: express.Request, res: express.Response) => {
    res.send('hello world');
  });

  const server = app.listen(port, () => {
    console.log(`listening on port ${port}`);
  });
};

main();
