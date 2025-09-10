const { body, param } = require("express-validator");

const validationRequestPost = [
  // Short Form
  body("name")
    .isString()
    .withMessage("Short form must be a string")
    .isLength({ max: 50 })
    .withMessage("Short form must not exceed 50 characters"),

  // Title
  body("title")
    .isString()
    .withMessage("Title must be a string")
    .isLength({ max: 255 })
    .withMessage("Title must not exceed 255 characters"),

  // Description
  body("description")
    .isString()
    .withMessage("Description must be text"),

  // Media Path (optional)
  body("media_path")
    .optional()
    .isString()
    .withMessage("Media path must be a string")
    .isLength({ max: 5000 })
    .withMessage("Media path must not exceed 5000 characters"),

  // Media Alt (optional)
  body("media_alt")
    .isString()
    .withMessage("Media alt must be a string")
    .isLength({ max: 500 })
    .withMessage("Media alt must not exceed 500 characters"),

  // Points (array)
  body("points")
    .isString()
    .withMessage("Points must be an array"),

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
