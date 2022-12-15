import * as automerge from '@automerge/automerge';

import {OpMatcher} from '.';

describe('object path mapping', () => {
  it('can identify a nested object set target', () => {
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

    const matcher = new OpMatcher(orig);

    const changed = automerge.change(orig, doc => {
      doc.nestedObject.subObject.someKey = 'otherValue';
    });
    const changes = automerge.getChanges(orig, changed);
    expect(changes).toHaveLength(1);
    const decodedChange = automerge.decodeChange(changes[0]);
    expect(decodedChange.ops).toHaveLength(1);
    expect(decodedChange.ops[0].action).toEqual('set');
    expect(matcher.match(decodedChange.ops[0], 'nestedObject')).toEqual(true);
    expect(
      matcher.match(decodedChange.ops[0], 'nestedObject.subObject')
    ).toEqual(true);
    expect(matcher.match(decodedChange.ops[0], '')).toEqual(false);
    expect(matcher.match(decodedChange.ops[0], 'nested')).toEqual(false);
    expect(matcher.match(decodedChange.ops[0], 'nestedObject.sub')).toEqual(
      false
    );
    expect(
      matcher.match(decodedChange.ops[0], 'nestedObject.subObject.nope')
    ).toEqual(false);
    expect(matcher.match(decodedChange.ops[0], 'somethingElse')).toEqual(false);
  });

  it('can identify a top-level set target', () => {
    const orig = automerge.from(
      {
        someNumber: 42,
      },
      '9021'
    );

    const matcher = new OpMatcher(orig);

    const changed = automerge.change(orig, doc => {
      doc.someNumber += 1;
    });
    const changes = automerge.getChanges(orig, changed);
    expect(changes).toHaveLength(1);
    const decodedChange = automerge.decodeChange(changes[0]);
    expect(decodedChange.ops).toHaveLength(1);
    expect(decodedChange.ops[0].action).toEqual('set');
    expect(matcher.match(decodedChange.ops[0], 'someNumber')).toEqual(true);
  });

  it('can identify a top-level delete target', () => {
    const orig = automerge.from(
      {
        someThing: 'thing',
      },
      '9021'
    );

    const matcher = new OpMatcher(orig);

    const changed = automerge.change(orig, doc => {
      delete (doc as any).someThing;
    });
    const changes = automerge.getChanges(orig, changed);
    expect(changes).toHaveLength(1);
    const decodedChange = automerge.decodeChange(changes[0]);
    expect(decodedChange.ops).toHaveLength(1);
    expect(decodedChange.ops[0].action).toEqual('del');
    expect(matcher.match(decodedChange.ops[0], 'someThing')).toEqual(true);
  });
});
