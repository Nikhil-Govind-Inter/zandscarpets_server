const { body, param } = require("express-validator");

const validationRequestPost = [
  body("title").notEmpty().withMessage("Title is required").isString().withMessage("Title must be a string"),
  body("title_ar").optional().isString().withMessage("Arabic title must be a string"),
  body("short_description").notEmpty().withMessage("Short description is required").isString().withMessage("Short description must be a string"),
  body("short_description_ar").optional().isString().withMessage("Arabic short description must be a string"),
  body("sort_order").notEmpty().withMessage("Sort order is required").isInt().withMessage("Sort order must be an integer"),
  body("is_active").notEmpty().withMessage("Is active is required").isBoolean().withMessage("Is active must be a boolean"),
];

const validateId = [
  param("id").isInt({ min: 1 }).withMessage("ID must be an integer"),
];

module.exports = {
  validationRequestPost,
  validateId,
};
