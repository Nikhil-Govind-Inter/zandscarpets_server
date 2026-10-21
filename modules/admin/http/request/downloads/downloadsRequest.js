const { body, param } = require("express-validator");

const validationRequestPost = [
  body("title").notEmpty().withMessage("Title is required").isString(),
  body("title_ar").notEmpty().withMessage("Arabic title is required").isString(),
  body("description").optional({ nullable: true, checkFalsy: true }).isString(),
  body("description_ar").optional({ nullable: true, checkFalsy: true }).isString(),
  body("sort_order").notEmpty().withMessage("Sort order is required").isInt().withMessage("Sort order must be an integer"),
  body("is_active").notEmpty().withMessage("Is active is required").isBoolean().withMessage("Is active must be a boolean"),
];

const validateId = [param("id").isInt({ min: 1 }).withMessage("ID must be an integer")];

module.exports = { validationRequestPost, validateId };
