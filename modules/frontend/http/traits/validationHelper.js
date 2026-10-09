const { validationResult } = require("express-validator");
const { ApiResponse } = require("./response");

// Unlike admin's validationHelper (which never checks its own return value —
// callers just `await` it and fall through into the try block regardless),
// this returns `true` once it has already sent a response, so the caller can
// stop instead of continuing to hit the DB after a validation failure.
const createValidationCheck = async (req, res, validationRequestPost) => {
  await Promise.all(validationRequestPost.map((validation) => validation.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    ApiResponse.validationError(
      res,
      errors.array().map((err) => ({ field: err.path, message: err.msg })),
    );
    return true;
  }
  return false;
};

module.exports = { createValidationCheck };
