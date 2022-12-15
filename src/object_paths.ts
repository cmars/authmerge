import * as automerge from '@automerge/automerge';
import {Op} from '@automerge/automerge-wasm';

type ObjectIDToPathMap = {[objectID: string]: string};

export class OpMatcher<T> {
  private pathMap: ObjectIDToPathMap;

  constructor(doc: automerge.Doc<T>) {
    this.pathMap = objectIDsToPaths(doc);
  }

  public match(op: Op, expr: string): boolean {
    const objPath = this.pathMap[op.obj];
    const targetPath = (objPath ? objPath.split('.') : []).concat([op.key]);
    return expr.split('.').every((item, i) => item === targetPath[i]);
  }
}

export const objectIDsToPaths = <T>(
  doc: automerge.Doc<T>
): ObjectIDToPathMap => {
  const result: ObjectIDToPathMap = {};
  const pendingPaths: string[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pendingObjects: any[] = [];
  pendingObjects.push(doc);
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
