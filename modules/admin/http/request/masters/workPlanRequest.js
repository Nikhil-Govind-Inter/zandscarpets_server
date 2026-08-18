const { body, param } = require("express-validator");

const validationRequestPost = [
  body("title").notEmpty().withMessage("Title is required").isString().withMessage("Title must be a string"),
  body("short_description").notEmpty().withMessage("Short description is required").isString().withMessage("Short description must be a string"),
  body("media_type").notEmpty().withMessage("Media type is required").isString().withMessage("Media type must be a string"),
  body("media_path").optional().isString().withMessage("Media path must be a string"),
  body("media_alt").optional().isString().withMessage("Media alt must be a string"),
  body("sort_order").optional().isInt().withMessage("Sort order must be an integer"),
  body("is_active").optional().isBoolean().withMessage("Is active must be a boolean"),
];

const validateId = [
  param("id").isInt({ min: 1 }).withMessage("ID must be an integer"),
];

module.exports = {
  validationRequestPost,
  validateId,
};
