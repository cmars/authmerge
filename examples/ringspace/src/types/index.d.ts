import {Context} from '../context';

// Ref: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/8fb0e959c2c7529b5fa4793a44b41b797ae671b9/types/express/index.d.ts#L19
declare module 'express-serve-static-core' {
  interface Request {
    // Patch in our own Request.context property
    context: Context;
  }
}
