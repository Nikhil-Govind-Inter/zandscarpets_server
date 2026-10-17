const { body, param } = require("express-validator");

const validationRequestPost = [
  body("page").notEmpty().withMessage("Page is required").isString().withMessage("Page must be a string"),
  body("page_slug").notEmpty().withMessage("Page slug is required").isString().withMessage("Page slug must be a string"),
  body("is_active").notEmpty().withMessage("Is active is required").isBoolean().withMessage("Is active must be a boolean"),
  body("page_ar").optional({ nullable: true }).isString().withMessage("Page (Arabic) must be a string"),
  body("link").optional({ nullable: true }).isString().withMessage("Link must be a string"),
  body("show_in_nav").optional().isBoolean().withMessage("Show in nav must be a boolean"),
  body("show_in_footer").optional().isBoolean().withMessage("Show in footer must be a boolean"),
  body("sort_order").optional().isInt({ min: 0 }).withMessage("Sort order must be a non-negative integer"),
];

const validateId = [
  param("id").isInt({ min: 1 }).withMessage("ID must be an integer"),
];

module.exports = {
  validationRequestPost,
  validateId,
};
