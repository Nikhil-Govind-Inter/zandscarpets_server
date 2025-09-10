const { body, param } = require("express-validator");

const validationRequestPost = [
  // Value (optional integer)
  body("value")
    .isInt()
    .withMessage("Value must be an integer"),

  // Prefix (optional string)
  body("prefix")
    .isString()
    .withMessage("Prefix must be a string")
    .isLength({ max: 50 })
    .withMessage("Prefix must not exceed 50 characters"),

  // Subtitle (optional string)
  body("subtitle")
    .isString()
    .withMessage("Subtitle must be a string")
    .isLength({ max: 255 })
    .withMessage("Subtitle must not exceed 255 characters"),

  // Status (boolean, default true)
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
