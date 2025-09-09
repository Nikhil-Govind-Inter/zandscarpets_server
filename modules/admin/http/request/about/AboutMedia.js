const { body, param } = require("express-validator");

const validationRequestPost = [
  // Thumbnail
  body("thumbnail").isString().withMessage("Thumbnail must be a valid string"),

  body("thumbnail_alt")
    .isString()
    .isLength({ max: 255 })
    .withMessage("Thumbnail alt text must not exceed 255 characters"),

  // Media Type
  body("media_type")
    .isIn(["image", "video"])
    .withMessage("Media type must be either 'image' or 'video'"),

  // Media Paths
  body("media_desktop_path")
    .isString()
    .withMessage("Media desktop path must be a valid string"),

  body("media_mobile_path")
    .isString()
    .withMessage("Media mobile path must be a valid string"),

  body("media_alt")
    .isString()
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
