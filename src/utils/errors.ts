export class UnauthorizedError extends Error {
  constructor(message = "Invalid credentials") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}
