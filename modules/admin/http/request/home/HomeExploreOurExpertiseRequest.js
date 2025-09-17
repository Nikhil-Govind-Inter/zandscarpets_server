const { body, param } = require("express-validator");

const validationRequestPost = [
  // Title
  body("title")
    .isString()
    .withMessage("Title must be a valid string")
    .isLength({ max: 255 })
    .withMessage("Title must not exceed 255 characters"),

  // Description
  body("description")
    .isString()
    .withMessage("Description must be a valid string")
    .isLength({ max: 10000 })
    .withMessage("Description must not exceed 10,000 characters"),

  // Button 1
  body("button_text")
    .isString()
    .withMessage("Button text must be a valid string")
    .isLength({ max: 255 })
    .withMessage("Button text must not exceed 255 characters"),

  body("button_text_link")
    .isString()
    .withMessage("Button link must be a valid string")
    .isLength({ max: 255 })
    .withMessage("Button link must not exceed 255 characters"),

  // Media
  body("media_path").optional().isLength({ max: 255 }),
  body("media_alt")
    .isString()
    .withMessage("Media alt text must be a valid string")
    .isLength({ max: 255 })
    .withMessage("Media alt text must not exceed 255 characters"),

  // Status
  body("status").isBoolean().withMessage("Status must be true or false"),

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
