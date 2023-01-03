interface ErrorOptions {
  detail: string;
  source?: {
    pointer?: string;
    parameter?: string;
  };
}

export class JsonApiError extends Error implements Components.Schemas.Error {
  constructor(
    title = 'Internal server error',
    status = '500',
    options?: ErrorOptions
  ) {
    super(title);
    this.title = title;
    this.status = status;
    this.detail = options?.detail;
    this.source = options?.source;
  }
  status: string;
  title: string;
  detail?: string;
  source?:
    | {pointer?: string | undefined; parameter?: string | undefined}
    | undefined;

  public get statusCode(): number {
    const code = parseInt(this.status);
    return isNaN(code) ? 500 : code;
  }
}

export class BadRequestError extends JsonApiError {
  constructor(title = 'Bad request', options?: ErrorOptions) {
    super(title, '400', options);
  }
}
export class UnauthorizedError extends JsonApiError {
  constructor(title = 'Unauthorized', options?: ErrorOptions) {
    super(title, '401', options);
  }
}

export class ForbiddenError extends JsonApiError {
  constructor(title = 'Forbidden', options?: ErrorOptions) {
    super(title, '403', options);
  }
}

export class NotFoundError extends JsonApiError {
  constructor(title = 'Not found', options?: ErrorOptions) {
    super(title, '404', options);
  }
}

export class ServerError extends JsonApiError {
  constructor(title = 'Internal server error', options?: ErrorOptions) {
    super(title, '500', options);
  }
}
