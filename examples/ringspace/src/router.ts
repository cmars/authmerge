import * as express from 'express';

import {Controller} from './controller';
import {
  JsonApiError,
  NotFoundError,
  ServerError,
  UnauthorizedError,
} from './errors';

export const router = (controller: Controller): express.IRouter => {
  const r = express.Router();
  r.use(express.json());
  r.use(
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      req.context = await controller.getContext(req);
      next();
    }
  );

  r.post('/docs', async (req: express.Request, res: express.Response) => {
    const respBody = await controller.createDoc(
      req.body as Components.Schemas.CreateDocRequest
    );
    res.status(201).send(respBody);
  });

  r.use(
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      if (!req.context.actor_id) {
        throw new UnauthorizedError();
      }
      next();
    }
  );

  r.post(
    '/docs/:doc_id/changes',
    async (req: express.Request, res: express.Response) => {
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
      res.status(201).send(respBody);
    }
  );

  r.get('/', (req: express.Request, res: express.Response) => {
    res.send('hello world');
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  r.use((req, res, next) => {
    throw new NotFoundError();
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
