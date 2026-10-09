// Frontend-local operational error — lets middleware/service code signal a
// known HTTP status without reaching into admin's CustomError class.
// ErrorHandler.handleControllerError already knows how to translate any
// error with `isOperational: true` into an ApiResponse.error(...) call.
class HttpError extends Error {
  constructor(message, statusCode = 400, errorCode = "BAD_REQUEST") {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
  }
}

module.exports = { HttpError };
