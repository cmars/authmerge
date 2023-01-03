import * as express from 'express';
import {AuthenticatedContext, Context} from './context';
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
      url: req.url,
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
      const authActor = await this.storage.getActorIdForToken(authToken);
      if (authActor?.actor_id && authActor.doc_id === result.doc_id) {
        result.actor_id = authActor.actor_id;
      } else {
        throw new ForbiddenError();
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err instanceof ForbiddenError) {
        throw err;
      }
      if (err?.trace) {
        console.log(err.trace);
      }
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
    const {doc_id, token, actor_id, nextOffset} = await this.storage.createDoc({
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
          next_offset: nextOffset,
        },
      },
      links: {
        self: `/docs/${doc_id}`,
      },
    };
  }

  public async appendChanges(
    ctx: AuthenticatedContext,
    body: Components.Schemas.AppendDocChangesRequest
  ): Promise<Components.Schemas.AppendDocChangesResponse> {
    const changesAdded = body.data.attributes.changes.length;
    const {nextOffset} = await this.storage.appendChanges(
      ctx.doc_id,
      ctx.actor_id,
      body.data.attributes.changes.map(ch => Buffer.from(ch, 'base64'))
    );
    return {
      meta: {
        changes_added: changesAdded,
        next_offset: nextOffset,
      },
    };
  }

  public async getChanges(
    ctx: AuthenticatedContext,
    offset: number
  ): Promise<Components.Schemas.GetDocChangesResponse> {
    const {changes, nextOffset} = await this.storage.getChanges(
      ctx.doc_id,
      offset
    );
    return {
      data: {
        type: 'changes',
        attributes: {
          changes: changes.map(ch => Buffer.of(...ch).toString('base64')),
          next_offset: nextOffset,
        },
      },
      links: {
        self: `/docs/${ctx.doc_id}/changes?offset=${offset}`,
      },
    };
  }

  public async createInvite(
    ctx: AuthenticatedContext,
    body: Components.Schemas.CreateInviteRequest
  ): Promise<Components.Schemas.CreateInviteResponse> {
    const invite = await this.storage.createInvite(
      ctx.doc_id,
      ctx.actor_id,
      body.data.attributes.roles,
      body.data.attributes.note
    );
    return {
      data: {
        id: invite.id,
        type: 'invites',
        attributes: {
          note: invite.note,
          roles: invite.roles,
          uses_remaining: invite.uses_remaining,
        },
      },
      links: {
        consume: `${ctx.url}/${invite.id}`,
      },
    };
  }

  public async consumeInvite(
    ctx: Context,
    invite_id: string,
    new_actor_id: string | undefined
  ): Promise<Components.Schemas.ConsumeInviteResponse> {
    if (!new_actor_id) {
      throw new BadRequestError();
    }
    const {token, uses_remaining} = await this.storage.consumeInvite(
      ctx.doc_id,
      invite_id,
      new_actor_id
    );
    return {
      data: {
        id: invite_id,
        type: 'invites',
        attributes: {
          token,
          uses_remaining,
        },
      },
      links: {
        changes: `/docs/${ctx.doc_id}/changes`,
      },
    };
  }
}
