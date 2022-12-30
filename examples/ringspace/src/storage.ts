import * as path from 'path';

import {knex, Knex} from 'knex';
import {v4} from 'uuid';

export interface Storage {
  getActorIdForToken(authToken: string): Promise<string | null>;

  appendChanges(
    doc_id: string,
    actor_id: string,
    changes: Buffer[]
  ): Promise<void>;

  createDoc(params: {
    actor_id: string;
    changes: Buffer[];
  }): Promise<{doc_id: string; actor_id: string; token: string}>;
}

export class SqliteStorage implements Storage {
  db: Knex;

  // TODO: use env var for dbfile
  constructor(dbfile = path.join(__dirname, '..', 'ringspace.db')) {
    const db = knex({
      client: 'sqlite3',
      connection: {
        filename: dbfile,
      },
    });
    this.db = db;
  }

  public async getActorIdForToken(authToken: string): Promise<string | null> {
    const actor = await this.db<{actor_id: string; token: string}>('actors')
      .select('actor_id')
      .where({token: authToken})
      .first();
    if (!actor) {
      return null;
    }
    return actor.actor_id;
  }

  public async appendChanges(
    doc_id: string,
    actor_id: string,
    changes: Buffer[]
  ): Promise<void> {
    await this.db.transaction(async tx => {
      await tx('changes').insert(
        changes.map(change => {
          return {
            doc_id,
            actor_id,
            change,
          };
        })
      );
    });
  }

  public async createDoc(params: {
    actor_id: string;
    changes: Buffer[];
  }): Promise<{doc_id: string; actor_id: string; token: string}> {
    const docRow = {
      doc_id: v4(),
    };
    const actorRow = {
      doc_id: docRow.doc_id,
      actor_id: params.actor_id,
      roles: JSON.stringify(['admin']),
      token: v4(),
    };
    const changeRows = params.changes.map((buf: Buffer) => {
      return {
        doc_id: docRow.doc_id,
        actor_id: actorRow.actor_id,
        change: buf,
      };
    });
    await this.db.transaction(async tx => {
      await tx('docs').insert(docRow);
      await tx('actors').insert(actorRow);
      await tx('changes').insert(changeRows);
    });
    return {
      doc_id: docRow.doc_id,
      actor_id: actorRow.actor_id,
      token: actorRow.token,
    };
  }

  public async init(): Promise<void> {
    if (!(await this.db.schema.hasTable('changes'))) {
      await this.db.schema.createTable('changes', table => {
        table.primary(['doc_id', 'actor_id', 'offset']);
        table.increments('offset');
        table.uuid('doc_id');
        table.uuid('actor_id');
        table
          .timestamp('created_at', {useTz: true})
          .defaultTo(this.db.fn.now());
        table.binary('change');
      });
    }
    if (!(await this.db.schema.hasTable('actors'))) {
      await this.db.schema.createTable('actors', table => {
        table.primary(['doc_id', 'actor_id']);
        table.uuid('doc_id');
        table.uuid('actor_id');
        table.string('token');
        table.json('roles');
      });
    }
    if (!(await this.db.schema.hasTable('docs'))) {
      await this.db.schema.createTable('docs', table => {
        table.primary(['doc_id']);
        table.uuid('doc_id');
        // What do we want to say about a doc?
      });
    }
  }

  public async close(): Promise<void> {
    await this.db.destroy();
  }
}
