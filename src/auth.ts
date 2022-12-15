import * as automerge from '@automerge/automerge';
import {OpMatcher} from './object_paths';

export interface Authorization {
  actors: '*' | string[];
  actions: '*' | string[];
  target: string;
}

const isActorMatch = (actor: string, auth: Authorization): boolean => {
  return auth.actors === '*' || auth.actors.includes(actor);
};

const isActionMatch = (action: string, auth: Authorization): boolean => {
  return auth.actions === '*' || auth.actions.includes(action);
};

export class Authorizer<T> {
  private matcher: OpMatcher<T>;
  private auths: Authorization[];

  public constructor(doc: automerge.Doc<T>, auths: Authorization[]) {
    this.matcher = new OpMatcher(doc);
    this.auths = auths;
  }

  public check(change: automerge.DecodedChange): boolean {
    for (const op of change.ops) {
      if (
        !this.auths
          .filter(t => this.matcher.match(op, t.target))
          .every(
            t => isActorMatch(change.actor, t) && isActionMatch(op.action, t)
          )
      ) {
        return false;
      }
    }
    return true;
  }
}
