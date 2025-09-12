const { body, param } = require("express-validator");

const validationRequestPost = [
  // Icon (optional)
  body("icon_path")
    .optional()
    .isString()
    .withMessage("Icon must be a string")
    .isLength({ max: 5000 })
    .withMessage("Icon must not exceed 5000 characters"),

  // Icon Alt (required)
  body("icon_alt")
    .isString()
    .withMessage("Icon alt must be a string")
    .isLength({ max: 50 })
    .withMessage("Icon alt must not exceed 50 characters"),

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
    .isInt({ min: 0, max: 32767 }) // smallint max
    .withMessage("Sort order must be an integer between 0 and 32767"),
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
