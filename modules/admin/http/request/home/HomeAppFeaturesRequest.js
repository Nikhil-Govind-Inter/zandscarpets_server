const { body, param } = require("express-validator");

const validationRequestPost = [
  // Title & Description
  body("title")
    .optional()
    .isString()
    .isLength({ max: 255 })
    .withMessage("Title must be a string with max 255 characters"),

  // Media
  body("icon")
    .optional()
    .isString()
    .isLength({ max: 255 }),

  body("icon_alt")
    .optional()
    .isString()
    .isLength({ max: 255 }),

  // Status & Sort Order
  body("status")
    .optional()
    .isBoolean()
    .withMessage("Status must be a boolean value"),

  body("sort_order")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Sort order must be a non-negative integer"),
];

// ID parameter validation
const validateId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID must be a positive integer"),
];

module.exports = {
  validationRequestPost,
  validateId,
};
