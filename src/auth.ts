import * as automerge from '@automerge/automerge';

import {objectIDsToPaths} from './object_paths';

/**
 * Policy represents an executable OPA policy.
 */
export interface Policy {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  evaluate(input: any, entrypoint?: string | number | undefined): any;
  setData(data: object | ArrayBuffer): void;
}

/**
 * Authorizer checks whether automerge.Doc changes should be allowed.
 */
export class Authorizer {
  private policy: Policy;
  private context: object;

  /**
   * Create a new Authorizer.
   *
   * @param policy Policy instance
   * @param context Contextual data to expose to the policy, as `data.context`.
   */
  public constructor(policy: Policy, context?: object) {
    this.policy = policy;
    this.context = context ?? {};
  }

  /**
   * check returns whether the automerge document changes should be allowed.
   *
   * data.context will contain external facts, such as actor role assignments,
   * specified in the constructor.
   *
   * data.objectPaths contains an object path mapping for each automerge.Doc
   * ObjID reference. This allows fine-grained permissions to target different
   * parts of the document. See `objectIDsToPaths` and `ObjectIDToPathMap` for
   * details.
   *
   * @param doc automerge.Doc under change
   * @param changes Decoded automerge changes
   */
  public check<T>(
    doc: automerge.Doc<T>,
    changes: automerge.DecodedChange[]
  ): boolean {
    const objectPaths = objectIDsToPaths(doc);
    this.policy.setData({
      context: this.context,
      objectPaths,
    });
    const results: {result: boolean}[] = this.policy.evaluate({
      changes,
    });
    console.log(results);
    return results.length > 0 && results.every(result => result.result);
  }
}
