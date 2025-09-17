const { body, param } = require("express-validator");

const validationRequestPost = [
  // Title & Description
  body("title")
    .optional()
    .isString()
    .isLength({ max: 5000 })
    .withMessage("Title must be a string with max 5000 characters"),

  body("description")
    .optional()
    .isString()
    .isLength({ max: 10000 })
    .withMessage("Description must be a string with max 10000 characters"),

  // Button 1
  body("button_text_one")
    .optional()
    .isString()
    .isLength({ max: 255 })
    .withMessage("Button text one must be at most 255 characters"),

  body("button_text_one_link")
    .optional()
    .isString()
    .isLength({ max: 5000 })
    .withMessage("Button one link must be a valid string"),

  // Button 2
  body("button_text_two")
    .optional()
    .isString()
    .isLength({ max: 255 })
    .withMessage("Button text two must be at most 255 characters"),

  body("button_text_two_link")
    .optional()
    .isString()
    .isLength({ max: 5000 })
    .withMessage("Button two link must be a valid string"),

  // Media
  body("media_type")
    .optional()
    .isIn(["image", "video"])
    .withMessage("Media type must be either 'image' or 'video'"),

  body("media_desktop_path")
    .optional()
    .isString()
    .isLength({ max: 5000 }),

  body("media_mobile_path")
    .optional()
    .isString()
    .isLength({ max: 5000 }),

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
