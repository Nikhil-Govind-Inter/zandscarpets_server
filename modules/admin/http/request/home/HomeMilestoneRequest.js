const { body, param } = require("express-validator");

const validationRequestPost = [
  // Title
  body("title")
    .isString()
    .withMessage("Title must be a valid string")
    .isLength({ max: 255 })
    .withMessage("Title must not exceed 255 characters"),

  // Value
  body("value")
    .isFloat({ min: 1 }) // allows decimals, use .isInt if only integers
    .withMessage("Value must be a number greater than 0"),

  // Status
  body("status")
    .isBoolean()
    .withMessage("Status must be true or false"),

  // Sort Order
  body("sort_order")
    .isInt({ min: 0 })
    .withMessage("Sort order must be an integer greater than or equal to 0"),
];

// ID parameter validation
const validateId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID must be an integer greater than 0"),
];

module.exports = {
  validationRequestPost,
  validateId,
};
