const { body, param } = require("express-validator");

const validationRequestPost = [

  // Icon Alt (required)
  body("title")
    .isString()
    .withMessage("Icon alt must be a string")
    .isLength({ max: 255 })
    .withMessage("Icon alt must not exceed 255 characters"),

  // Description (required)
  body("description")
    .isString()
    .withMessage("Description must be text"),

  // Status (required)
  body("status")
    .isBoolean()
    .withMessage("Status must be true or false"),

  // Sort Order (required)
  body("sort_order")
    .isInt({ min: 0 }) // smallint max
    .withMessage("Sort order must be an integer"),
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
