import * as automerge from '@automerge/automerge';
import {OpMatcher} from './object_paths';

type Action = 'del' | 'set';

export interface Authorization {
  actors: '*' | string[];
  actions: '*' | Action[];
  target: string;
}

const isActorMatch = (actor: string, auth: Authorization): boolean => {
  return auth.actors === '*' || auth.actors.includes(actor);
};

const isActionMatch = (action: Action, auth: Authorization): boolean => {
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
    // TODO: useful to explain why check failed?
    // TODO: could make this more efficient with smarter indexing
    const results: boolean[] = [];
    for (const op of change.ops) {
      const matchingAuths = this.auths.filter(t =>
        this.matcher.match(op, t.target)
      );
      if (matchingAuths.length === 0) {
        return false;
      }
      const result = matchingAuths.every(
        t =>
          isActorMatch(change.actor, t) && isActionMatch(op.action as Action, t)
      );
      if (!result) {
        return result;
      }
      results.push(result);
    }
    return results.length > 0 ? results.every(result => result) : false;
  }
}
