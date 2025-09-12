const { body, param } = require("express-validator");

const validationRequestPost = [
  // Profile Media Path (optional)
  body("profile_media_path")
    .optional()
    .notEmpty()
    .withMessage("Profile media is required")
    .isLength({ max: 255 })
    .withMessage("Profile media path must not exceed 255 characters"),

  // Profile Media Alt (required)
  body("profile_media_alt")
    .notEmpty()
    .withMessage("Profile media alt must be a string")
    .isLength({ max: 255 })
    .withMessage("Profile media alt must not exceed 255 characters"),

  // Name (required)
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ max: 255 })
    .withMessage("Name must not exceed 255 characters"),

  // Designation (required)
  body("designation")
    .notEmpty()
    .withMessage("Designation is required")
    .isLength({ max: 255 })
    .withMessage("Designation must not exceed 255 characters"),

  // Description (required)
  body("description")
    .notEmpty()
    .withMessage("Description is required"),

  // Status (required)
  body("status").isBoolean().withMessage("Status must be true or false"),

  // Sort Order (required, smallint range)
  body("sort_order")
    .isInt({ min: 0 })
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
