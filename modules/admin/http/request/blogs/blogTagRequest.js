const { body, param } = require("express-validator");

const validationRequestPost = [
  body("title").trim().notEmpty().withMessage("Title is required").isString().withMessage("Title must be a string"),
  body("title_ar").trim().notEmpty().withMessage("Arabic title is required").isString().withMessage("Arabic title must be a string"),
  body("sort_order").notEmpty().withMessage("Sort order is required").isInt({ min: 0 }).withMessage("Sort order must be an integer"),
  body("is_active").notEmpty().withMessage("Is active is required").isBoolean().withMessage("Is active must be a boolean"),
];

const validateId = [param("id").isInt({ min: 1 }).withMessage("ID must be an integer")];

module.exports = { validationRequestPost, validateId };
