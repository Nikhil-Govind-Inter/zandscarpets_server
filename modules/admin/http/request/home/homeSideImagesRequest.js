const { body, param } = require("express-validator");

const validationRequestPost = [
  body("before_media_path").notEmpty().withMessage("Before media path is required").isString().withMessage("Before media path must be a string"),
  body("after_media_path").notEmpty().withMessage("After media path is required").isString().withMessage("After media path must be a string"),
  body("before_media_alt").notEmpty().withMessage("Before media alt is required").isString().withMessage("Before media alt must be a string"),
  body("before_media_alt_ar").notEmpty().withMessage("Before media alt (Arabic) is required").isString().withMessage("Before media alt (Arabic) must be a string"),
  body("after_media_alt").notEmpty().withMessage("After media alt is required").isString().withMessage("After media alt must be a string"),
  body("after_media_alt_ar").notEmpty().withMessage("After media alt (Arabic) is required").isString().withMessage("After media alt (Arabic) must be a string"),
  body("sort_order").notEmpty().withMessage("Sort order is required").isInt().withMessage("Sort order must be an integer"),
  body("is_active").notEmpty().withMessage("Is active is required").isBoolean().withMessage("Is active must be a boolean"),
];

const validateId = [param("id").isInt({ min: 1 }).withMessage("ID must be an integer")];

module.exports = {
  validationRequestPost,
  validateId,
};
