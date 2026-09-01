const { body, param } = require("express-validator");

const validationRequestPost = [
  body("year").notEmpty().withMessage("Year is required").isString().withMessage("Year must be a string"),
  body("title").notEmpty().withMessage("Title is required").isString().withMessage("Title must be a string"),
  body("description").notEmpty().withMessage("Description is required").isString().withMessage("Description must be a string"),
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
