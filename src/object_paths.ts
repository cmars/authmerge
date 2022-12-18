import * as automerge from '@automerge/automerge';
import {Op} from '@automerge/automerge-wasm';

/**
 * ObjectIDToPathMap is a mapping from automerge's internal ObjID to the logical
 * location of said object in an automerge.Doc object model.
 */
type ObjectIDToPathMap = {[objectID: string]: string};

/**
 * Root represents the object path to the document root, an empty string.
 */
export const Root = '';

/**
 * OpMatcher tests automerge change operations against object path expressions.
 */
export class OpMatcher<T> {
  private pathMap: ObjectIDToPathMap;

  /**
   * Create a new OpMatcher.
   *
   * @param doc automerge.Doc document to be indexed.
   */
  constructor(doc: automerge.Doc<T>) {
    this.pathMap = objectIDsToPaths(doc);
  }

  /**
   * match tests whether an object path expression matches the object of a
   * automerge change operation object or its parentage.
   *
   * @param op automerge change operation
   * @param expr Object path expression, using a JMESPath-like dotted notation.
   * @returns Whether the expression matches the object of the change operation.
   */
  public match(op: Op, expr: string): boolean {
    if (expr === Root) {
      return true;
    }
    const objPath = this.pathMap[op.obj];
    const targetPath = (objPath ? objPath.split('.') : []).concat([op.key]);
    return expr.split('.').every((item, i) => item === targetPath[i]);
  }
}

/**
 * objectIDsToPaths indexes the object IDs contained within an automerge
 * document.
 *
 * @param doc automerge.Doc to index
 * @returns ObjectIDToPathMap for the document.
 */
export const objectIDsToPaths = <T>(
  doc: automerge.Doc<T>
): ObjectIDToPathMap => {
  const result: ObjectIDToPathMap = {};
  const pendingPaths: string[] = [Root];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pendingObjects: any[] = [doc];
  while (pendingObjects.length > 0) {
    const currentObj = pendingObjects.shift();
    const currentPath = pendingPaths.shift();
    const objId = currentObj[Symbol.for('_am_objectId')];
    if (!objId) {
      continue;
    }
    if (currentPath) {
      result[objId] = currentPath;
    }
    Object.keys(currentObj).forEach(key => {
      pendingPaths.push((currentPath ? [currentPath, key] : [key]).join('.'));
      pendingObjects.push(currentObj[key]);
    });
  }
  return result;
};
