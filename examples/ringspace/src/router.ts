import * as express from 'express';

import {Controller} from './controller';
import {
  BadRequestError,
  JsonApiError,
  NotFoundError,
  ServerError,
  UnauthorizedError,
} from './errors';

const reqContext = (controller: Controller) => {
  return async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      req.context = await controller.getContext(req);
      next();
    } catch (err) {
      next(err);
    }
  };
};

const requireAuth = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (!req.context.actor_id) {
    next(new UnauthorizedError());
  } else {
    next();
  }
};

export const router = (controller: Controller): express.IRouter => {
  const r = express.Router();
  r.use(express.json());

  r.post('/docs/:doc_id/changes', [
    reqContext(controller),
    requireAuth,
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        if (!req.context?.actor_id) {
          throw new UnauthorizedError();
        }
        const respBody = await controller.appendChanges(
          {
            ...req.context,
            actor_id: req.context.actor_id!,
          },
          req.body as Components.Schemas.AppendDocChangesRequest
        );
        res.status(200).send(respBody);
      } catch (err) {
        next(err);
      }
    },
  ]);

  r.get('/docs/:doc_id/changes', [
    reqContext(controller),
    requireAuth,
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        if (!req.context?.actor_id) {
          throw new UnauthorizedError();
        }
        if (!req.query.offset) {
          throw new BadRequestError();
        }
        const offset = parseInt(req.query.offset.toString());
        const respBody = await controller.getChanges(
          {
            ...req.context,
            actor_id: req.context.actor_id!,
          },
          offset
        );
        res.status(200).send(respBody);
      } catch (err) {
        next(err);
      }
    },
  ]);

  r.post('/docs/:doc_id/invites', [
    reqContext(controller),
    requireAuth,
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        if (!req.context?.actor_id) {
          throw new UnauthorizedError();
        }
        const respBody = await controller.createInvite(
          {
            ...req.context,
            actor_id: req.context.actor_id!,
          },
          req.body as Components.Schemas.CreateInviteRequest
        );
        res.status(201).send(respBody);
      } catch (err) {
        next(err);
      }
    },
  ]);

  r.delete('/docs/:doc_id/invites/:invite_id', [
    reqContext(controller),
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        const respBody = await controller.consumeInvite(
          req.context,
          req.params.invite_id,
          req.query['actor_id']?.toString()
        );
        res.status(200).send(respBody);
      } catch (err) {
        next(err);
      }
    },
  ]);

  r.post('/docs', [
    reqContext(controller),
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        const respBody = await controller.createDoc(
          req.body as Components.Schemas.CreateDocRequest
        );
        res.status(201).send(respBody);
      } catch (err) {
        next(err);
      }
    },
  ]);

  r.use((req, res, next) => {
    next(new NotFoundError());
  });

  r.use(
    (
      err: Error,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      if (err instanceof JsonApiError) {
        res.status(err.statusCode).send({
          errors: [err],
        });
      } else {
        console.log(err.stack);
        const srvErr = new ServerError();
        res.status(srvErr.statusCode).send({
          errors: [srvErr],
        });
      }
      next(err);
    }
  );
  return r;
};
