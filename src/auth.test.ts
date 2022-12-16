import * as automerge from '@automerge/automerge';

import {Authorizer} from './auth';

describe('auth', () => {
  it('allows access for actor, action, target match', () => {
    const orig = automerge.from(
      {
        nestedObject: {
          subObject: {
            someKey: 'someValue',
          },
        },
      },
      '9021'
    );
    const changed = automerge.change(orig, doc => {
      doc.nestedObject.subObject.someKey = 'otherValue';
    });
    const changes = automerge.getChanges(orig, changed);
    expect(changes).toHaveLength(1);
    const decodedChange = automerge.decodeChange(changes[0]);

    const auther = new Authorizer(orig, [
      {
        actors: ['9021'],
        actions: ['set'],
        target: 'nestedObject.subObject',
      },
    ]);
    expect(auther.check(decodedChange)).toEqual(true);
  });
  // TODO: actor wildcard
  // TODO: one of many actors match
  // TODO: action wildcard
  // TODO: one of many actions match
  // TODO: target root
  // TODO: actor doesn't match
  // TODO: action doesn't match
  // TODO: target doesn't match
});