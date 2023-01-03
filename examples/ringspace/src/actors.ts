export const toAutomerge = (actorIdUuid: string): string => {
  return actorIdUuid.replace(/-/g, '');
};

export const fromAutomerge = (actorIdAutomerge: string): string => {
  return actorIdAutomerge.replace(
    /([a-f\d]{8})([a-f\d]{4})([a-f\d]{4})([a-f\d]{4})([a-f\d]{12})/,
    '$1-$2-$3-$4-$5'
  );
};
