export interface Context {
  url: string;
  doc_id: string;
  invite_id?: string;
  actor_id?: string;
}

export type AuthenticatedContext = Omit<Context, 'actor_id'> & {
  actor_id: string;
};
