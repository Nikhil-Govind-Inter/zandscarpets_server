const { body, param } = require("express-validator");

const validationRequestPost = [
  body("title").trim().notEmpty().withMessage("Title is required").isString().withMessage("Title must be a string"),
  body("title_ar").trim().notEmpty().withMessage("Arabic title is required").isString().withMessage("Arabic title must be a string"),
  body("related_title").optional({ nullable: true }).isString().withMessage("Related title must be a string"),
  body("related_title_ar").optional({ nullable: true }).isString().withMessage("Arabic related title must be a string"),
];

const validateId = [param("id").isInt({ min: 1 }).withMessage("ID must be an integer")];

module.exports = { validationRequestPost, validateId };
