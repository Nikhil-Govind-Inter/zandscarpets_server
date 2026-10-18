const { body, param } = require("express-validator");

const validationRequestPost = [
  body("title").notEmpty().withMessage("Title is required").isString().withMessage("Title must be a string"),
  body("title_ar").optional({ nullable: true }).isString().withMessage("Arabic title must be a string"),
];

const validateId = [param("id").isInt({ min: 1 }).withMessage("ID must be an integer")];

module.exports = { validationRequestPost, validateId };
