const { body, param } = require("express-validator");

const validationRequestPost = [
  // Title
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isString()
    .withMessage("Title must be a valid string")
    .isLength({ max: 255 })
    .withMessage("Title must not exceed 255 characters"),

  // Slug
  body("slug")
    .optional()
    .isString()
    .withMessage("Slug must be a valid string")
    .isLength({ max: 255 })
    .withMessage("Slug must not exceed 255 characters"),

  // Description
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),

  // Thumbnail
  body("thumbnail")
    .optional()
    .isString()
    .withMessage("Thumbnail must be a string"),

  body("thumbnail_alt")
    .optional()
    .isString()
    .withMessage("Thumbnail alt must be a string")
    .isLength({ max: 255 })
    .withMessage("Thumbnail alt must not exceed 255 characters"),

  // Published On
  body("published_on")
    .optional()
    .isLength({ max: 255 })
    .withMessage("published_on alt must not exceed 255 characters"),

  // Reading Time
  body("reading_time")
    .optional()
    .isLength({ max: 255 })
    .withMessage("reading_time alt must not exceed 255 characters"),

  // Banner Media
  body("banner_media_desktop_path")
    .optional()
    .isString()
    .withMessage("Banner media desktop path must be a string"),

  body("banner_media_mobile_path")
    .optional()
    .isString()
    .withMessage("Banner media mobile path must be a string"),

  body("banner_media_alt")
    .optional()
    .isString()
    .withMessage("Banner media alt must be a string")
    .isLength({ max: 255 })
    .withMessage("Banner media alt must not exceed 255 characters"),

  // Sub Description
  body("sub_description")
    .optional()
    .isString()
    .withMessage("Sub description must be a string"),

  // Featured Active
  body("is_featured_active")
    .optional()
    .isBoolean()
    .withMessage("Featured active must be true or false"),

  // Sort Order
  body("sort_order")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Sort order must be an integer greater than or equal to 0"),

  // Status
  body("status")
    .optional()
    .isBoolean()
    .withMessage("Status must be true or false"),
];

// ID parameter validation (for update/delete routes)
const validateId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID must be an integer greater than 0"),
];

module.exports = {
  validationRequestPost,
  validateId,
};
