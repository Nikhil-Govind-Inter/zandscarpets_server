const { body, param } = require("express-validator");

const validationRequestPost = [
  body("product_id")
    .notEmpty()
    .withMessage("Product is required")
    .isInt({ min: 1 })
    .withMessage("Product must be a valid ID"),
  body("question")
    .notEmpty()
    .withMessage("Question is required")
    .isString()
    .withMessage("Question must be a string"),
  body("question_ar")
    .notEmpty()
    .withMessage("Question (Arabic) is required")
    .isString()
    .withMessage("Question (Arabic) must be a string"),
  body("answer")
    .notEmpty()
    .withMessage("Answer is required")
    .isString()
    .withMessage("Answer must be a string"),
  body("answer_ar")
    .notEmpty()
    .withMessage("Answer (Arabic) is required")
    .isString()
    .withMessage("Answer (Arabic) must be a string"),
  body("sort_order")
    .notEmpty()
    .withMessage("Sort order is required")
    .isInt({ min: 0 })
    .withMessage("Sort order must be an integer"),
  body("is_active")
    .notEmpty()
    .withMessage("Is active is required")
    .isBoolean()
    .withMessage("Is active must be a boolean"),
];

const validateId = [
  param("id").isInt({ min: 1 }).withMessage("ID must be an integer"),
];

module.exports = { validationRequestPost, validateId };