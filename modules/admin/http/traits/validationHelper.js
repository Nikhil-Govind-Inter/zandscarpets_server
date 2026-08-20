const { validationResult } = require("express-validator");
const { sendValidationError } = require("./responseHandler");

const idValidationCheck = async (req, res, validateId) => {
  await Promise.all(validateId.map((validation) => validation.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendValidationError(res, errors.array());
};

const updateValidationCheck = async (
  req,
  res,
  validationRequestPost,
  validateId,
) => {
  await Promise.all(
    [...validateId, ...validationRequestPost].map((v) => v.run(req)),
  );
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendValidationError(res, errors.array());
};

const createValidationCheck = async (req, res, validationRequestPost) => {

  console.log(validationRequestPost)

  await Promise.all(validationRequestPost.map((v) => v.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendValidationError(res, errors);
};

module.exports = {
  idValidationCheck,
  updateValidationCheck,
  createValidationCheck,
};
