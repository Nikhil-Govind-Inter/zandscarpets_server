const { body, param } = require("express-validator");

const validationRequestPost = [
  body("title").notEmpty().withMessage("Title is required").isString().withMessage("Title must be a string"),
  body("slug").notEmpty().withMessage("Slug is required").isString().withMessage("Slug must be a string"),
  body("description").notEmpty().withMessage("Description is required").isString().withMessage("Description must be a string"),
  body("link").optional().isString().withMessage("Link must be a string"),
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
