import * as express from 'express';
import {Context} from './context';
import {Storage} from './storage';
import {ForbiddenError, BadRequestError, ServerError} from './errors';

export const bearerTokenRegex = /^Bearer\s+(.+)/;

export class Controller {
  private storage: Storage;

  constructor(storage: Storage) {
    this.storage = storage;
  }

  public async getContext(req: express.Request): Promise<Context> {
    const result: Context = {
      doc_id: req.params['doc_id'],
      invite_id: req.params['invite_id'],
    };
    // Extract the auth token and match an actor
    const authHeader: string | undefined = req.headers['authorization'];
    if (!authHeader) {
      return result;
    }
    const match = authHeader.match(bearerTokenRegex);
    if (!match) {
      return result;
    }
    const authToken = match[1];
    try {
      const actorId = await this.storage.getActorIdForToken(authToken);
      if (actorId) {
        result.actor_id = actorId;
      } else {
        throw new ForbiddenError();
      }
    } catch (err) {
      if (err instanceof ForbiddenError) {
        throw err;
      }
      console.log(err);
      throw new ServerError();
    }
    return result;
  }

  public async createDoc(
    body: Components.Schemas.CreateDocRequest
  ): Promise<Components.Schemas.CreateDocResponse> {
    if (body.data.type !== 'docs') {
      throw new BadRequestError(`invalid resource type '${body.data.type}'`);
    }
    const {doc_id, token, actor_id} = await this.storage.createDoc({
      actor_id: body.data.attributes.actor_id,
      changes: body.data.attributes.changes.map(ch =>
        Buffer.from(ch, 'base64')
      ),
    });
    return {
      data: {
        id: doc_id,
        type: 'docs',
        attributes: {
          token: token,
          actor_id: actor_id,
        },
      },
      links: {
        self: `/docs/${doc_id}`,
      },
    };
  }

  public async appendChanges(
    ctx: Omit<Context, 'actor_id'> & {actor_id: string},
    body: Components.Schemas.AppendDocChangesRequest
  ): Promise<Components.Schemas.AppendDocChangesResponse> {
    const changesAdded = body.data.attributes.changes.length;
    await this.storage.appendChanges(
      ctx.doc_id,
      ctx.actor_id,
      body.data.attributes.changes.map(ch => Buffer.from(ch, 'base64'))
    );
    return {
      meta: {
        changes_added: changesAdded,
      },
    };
  }
}
