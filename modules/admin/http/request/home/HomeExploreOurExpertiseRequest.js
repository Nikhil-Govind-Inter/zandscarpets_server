const { body, param } = require("express-validator");

const validationRequestPost = [
  // Title & Description
  body("title")
    .optional()
    .isString()
    .isLength({ max: 255 })
    .withMessage("Title must be a string with max 255 characters"),

  body("description")
    .optional()
    .isString()
    .isLength({ max: 10000 })
    .withMessage("Description must be a string with max 10000 characters"),

  // Button 1
  body("button_text")
    .optional()
    .isString()
    .isLength({ max: 255 })
    .withMessage("Button text must be at most 255 characters"),

  body("button_text_link")
    .optional()
    .isString()
    .isLength({ max: 255 })
    .withMessage("Button link must be a valid string"),

  // Media
  body("media_path")
    .optional()
    .isString()
    .isLength({ max: 255 }),


  body("media_alt")
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
