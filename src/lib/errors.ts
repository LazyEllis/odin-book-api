class HTTPError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export class UnauthorizedError extends HTTPError {
  constructor(message: string) {
    super(message, 401);
  }
}

export class ForbiddenError extends HTTPError {
  constructor(message: string) {
    super(message, 403);
  }
}

export class NotFoundError extends HTTPError {
  constructor(message: string) {
    super(message, 404);
  }
}

export class ConflictError extends HTTPError {
  constructor(message: string) {
    super(message, 409);
  }
}
