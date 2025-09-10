const { body, param } = require("express-validator");

const validationRequestPost = [
  // year
  body("year")
    .isInt()
    .withMessage("Year must be a valid integer")
    .matches(/^\d{4}$/)
    .withMessage("Year must be a 4-digit number"),

  // Title
  body("title")
    .isString()
    .withMessage("Title must be a valid string")
    .isLength({ max: 255 })
    .withMessage("Title must not exceed 255 characters"),

  // Media
  body("media_path")
    .optional()
    .isString()
    .withMessage("Media path must be a valid string")
    .isLength({ max: 255 })
    .withMessage("Media path must not exceed 255 characters"),

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
