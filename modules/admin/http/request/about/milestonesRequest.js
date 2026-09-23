const { body, param } = require("express-validator");

const validationRequestPost = [
  body("label").notEmpty().withMessage("Label is required").isString().withMessage("Label must be a string"),
  body("label_ar").notEmpty().withMessage("Arabic label is required").isString().withMessage("Arabic label must be a string"),
  body("value").notEmpty().withMessage("Value is required").isString().withMessage("Value must be a string"),
  body("value_ar").notEmpty().withMessage("Arabic value is required").isString().withMessage("Arabic value must be a string"),
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
