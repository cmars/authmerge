import * as automerge from '@automerge/automerge';

import {Authorizer} from './auth';

describe('auth', () => {
  let orig: automerge.Doc<any>;

  beforeEach(() => {
    orig = automerge.from(
      {
        nestedObject: {
          subObject: {
            someKey: 'someValue',
            someOtherKey: 42,
          },
        },
      },
      '9021'
    );
  });

  describe('allow', () => {
    it('allows access for actor, action, target match', () => {
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

    it('allows access for actor wildcard, action, target match', () => {
      const changed = automerge.change(orig, doc => {
        doc.nestedObject.subObject.someKey = 'otherValue';
      });
      const changes = automerge.getChanges(orig, changed);
      expect(changes).toHaveLength(1);
      const decodedChange = automerge.decodeChange(changes[0]);

      const auther = new Authorizer(orig, [
        {
          actors: '*',
          actions: ['set'],
          target: 'nestedObject.subObject',
        },
      ]);
      expect(auther.check(decodedChange)).toEqual(true);
    });

    it('allows access for actor match, action wildcard, target match', () => {
      const changed = automerge.change(orig, doc => {
        doc.nestedObject.subObject.someKey = 'otherValue';
      });
      const changes = automerge.getChanges(orig, changed);
      expect(changes).toHaveLength(1);
      const decodedChange = automerge.decodeChange(changes[0]);

      const auther = new Authorizer(orig, [
        {
          actors: ['9021'],
          actions: '*',
          target: 'nestedObject.subObject',
        },
      ]);
      expect(auther.check(decodedChange)).toEqual(true);
    });

    it('allows access for actor match among many, action, target match', () => {
      const changed = automerge.change(orig, doc => {
        doc.nestedObject.subObject.someKey = 'otherValue';
      });
      const changes = automerge.getChanges(orig, changed);
      expect(changes).toHaveLength(1);
      const decodedChange = automerge.decodeChange(changes[0]);

      const auther = new Authorizer(orig, [
        {
          actors: ['9020', '9021', '9022'],
          actions: '*',
          target: 'nestedObject.subObject',
        },
      ]);
      expect(auther.check(decodedChange)).toEqual(true);
    });

    it('allows access for actor, actions among many, target match', () => {
      const changed = automerge.change(orig, doc => {
        doc.nestedObject.subObject.someKey = 'otherValue';
        delete (doc.nestedObject.subObject as any).someOtherKey;
      });
      const changes = automerge.getChanges(orig, changed);
      expect(changes).toHaveLength(1);
      const decodedChange = automerge.decodeChange(changes[0]);

      const auther = new Authorizer(orig, [
        {
          actors: ['9021'],
          actions: ['del', 'set'],
          target: 'nestedObject.subObject',
        },
      ]);
      expect(auther.check(decodedChange)).toEqual(true);
    });

    it('allows actor full access to root', () => {
      const changed = automerge.change(orig, doc => {
        doc.nestedObject.subObject.someKey = 'otherValue';
        delete (doc as any).nestedObject;
      });
      const changes = automerge.getChanges(orig, changed);
      expect(changes).toHaveLength(1);
      const decodedChange = automerge.decodeChange(changes[0]);

      const auther = new Authorizer(orig, [
        {
          actors: ['9021'],
          actions: '*',
          target: '',
        },
      ]);
      expect(auther.check(decodedChange)).toEqual(true);
    });
  });

  describe('deny', () => {
    it('denies access for other actor', () => {
      const changed = automerge.change(orig, doc => {
        doc.nestedObject.subObject.someKey = 'otherValue';
      });
      const changes = automerge.getChanges(orig, changed);
      expect(changes).toHaveLength(1);
      const decodedChange = automerge.decodeChange(changes[0]);

      const auther = new Authorizer(orig, [
        {
          actors: ['9022'],
          actions: ['set'],
          target: 'nestedObject.subObject',
        },
      ]);
      expect(auther.check(decodedChange)).toEqual(false);
    });

    it('denies access for other action', () => {
      const changed = automerge.change(orig, doc => {
        doc.nestedObject.subObject.someKey = 'otherValue';
      });
      const changes = automerge.getChanges(orig, changed);
      expect(changes).toHaveLength(1);
      const decodedChange = automerge.decodeChange(changes[0]);

      const auther = new Authorizer(orig, [
        {
          actors: ['9021'],
          actions: ['del'],
          target: 'nestedObject.subObject',
        },
      ]);
      expect(auther.check(decodedChange)).toEqual(false);
    });

    it('denies access for unmatched target, fail open', () => {
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
          target: 'foo.bar',
        },
      ]);
      expect(auther.check(decodedChange)).toEqual(false);
    });
  });
});
