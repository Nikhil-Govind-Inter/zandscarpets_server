const { body, param } = require("express-validator");

const validationRequestPost = [
  body("page").notEmpty().withMessage("Page is required").isString().withMessage("Page must be a string"),
  body("page_slug").notEmpty().withMessage("Page slug is required").isString().withMessage("Page slug must be a string"),
  body("is_active").notEmpty().withMessage("Is active is required").isBoolean().withMessage("Is active must be a boolean"),
];

const validateId = [
  param("id").isInt({ min: 1 }).withMessage("ID must be an integer"),
];

module.exports = {
  validationRequestPost,
  validateId,
};
