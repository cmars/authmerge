import * as actors from './actors';

describe('actor helper functions', () => {
  it('can strip dashes from an actor id', () => {
    const asUuid = 'aeee1863-14c3-49b3-95c1-6c6c332a3740';
    expect(actors.toAutomerge(asUuid)).toEqual(
      'aeee186314c349b395c16c6c332a3740'
    );
  });

  it('can restore dashes to an actor id', () => {
    const asAm = 'aeee186314c349b395c16c6c332a3740';
    expect(actors.fromAutomerge(asAm)).toEqual(
      'aeee1863-14c3-49b3-95c1-6c6c332a3740'
    );
  });
});
