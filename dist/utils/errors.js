export class UnauthorizedError extends Error {
    constructor(message = "Invalid credentials") {
        super(message);
        this.name = "UnauthorizedError";
    }
}
export class HttpError extends Error {
    statusCode;
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.name = "HttpError";
    }
}
//# sourceMappingURL=errors.js.map