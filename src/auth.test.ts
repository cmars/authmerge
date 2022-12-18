/* eslint-disable @typescript-eslint/no-explicit-any */
import * as automerge from '@automerge/automerge';

import {Authorizer, Policy} from './auth';
import {loadPolicyFromSource} from './testutil';

describe('auth', () => {
  let orig: automerge.Doc<any>;
  let policy: Policy;

  beforeAll(async () => {
    try {
      policy = await loadPolicyFromSource(`
package authmerge

import data.authmerge.allow
import future.keywords

import input.action

default allow := false

allow if {
  input.changes[_].actor in data.context.roles["admin"]
}

allow if {
  some changeIndex, opIndex
  op := input.changes[changeIndex].ops[opIndex]
  objPath := data.objectPaths[op.obj]
  input.changes[changeIndex].actor in data.context.objectPermissions[objPath][op.action]
}
    `);
    } catch (err) {
      fail(err);
    }
  });

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
    it('allows access for admin actor', async () => {
      const changed = automerge.change(orig, doc => {
        doc.nestedObject.subObject.someKey = 'otherValue';
      });
      const changes = automerge
        .getChanges(orig, changed)
        .map(change => automerge.decodeChange(change));
      expect(changes).toHaveLength(1);

      const auther = new Authorizer(policy, {
        roles: {
          admin: ['9021'],
        },
      });
      expect(auther.check(orig, changes)).toEqual(true);
    });

    it('allows access for specific sub-document permissions', async () => {
      const changed = automerge.change(orig, doc => {
        doc.nestedObject.subObject.someKey = 'otherValue';
      });
      const changes = automerge
        .getChanges(orig, changed)
        .map(change => automerge.decodeChange(change));
      expect(changes).toHaveLength(1);

      const auther = new Authorizer(policy, {
        roles: {
          admin: ['0000'],
        },
        objectPermissions: {
          'nestedObject.subObject': {
            set: ['9021'],
          },
        },
      });
      expect(auther.check(orig, changes)).toEqual(true);
    });
  });

  describe('deny', () => {
    it('denies access for non-admin actor', async () => {
      const changed = automerge.change(orig, doc => {
        doc.nestedObject.subObject.someKey = 'otherValue';
      });
      const changes = automerge
        .getChanges(orig, changed)
        .map(change => automerge.decodeChange(change));
      expect(changes).toHaveLength(1);

      const auther = new Authorizer(policy, {
        roles: {
          admin: ['0000'],
        },
      });
      expect(auther.check(orig, changes)).toEqual(false);
    });

    it('denies access for specific sub-document permissions when action not allowed', async () => {
      const changed = automerge.change(orig, doc => {
        delete (doc.nestedObject.subObject as any).someKey;
      });
      const changes = automerge
        .getChanges(orig, changed)
        .map(change => automerge.decodeChange(change));
      expect(changes).toHaveLength(1);

      const auther = new Authorizer(policy, {
        roles: {
          admin: ['0000'],
        },
        objectPermissions: {
          'nestedObject.subObject': {
            set: ['9021'],
          },
        },
      });
      expect(auther.check(orig, changes)).toEqual(false);
    });
  });
});
