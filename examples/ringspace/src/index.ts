import * as express from 'express';
import helmet from 'helmet';

import {Controller} from './controller';
import {router} from './router';
import {SqliteStorage} from './storage';

const app = express();
const port = 3000;

app.use(helmet());
app.disable('x-powered-by');

const main = async () => {
  const storage = new SqliteStorage();
  await storage.init();
  const controller = new Controller(storage);
  const r = router(controller);
  app.use(r);

  app.listen(port, () => {
    console.log(`listening on port ${port}`);
  });
};

main();
