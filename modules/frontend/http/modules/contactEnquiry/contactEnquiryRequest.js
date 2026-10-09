const { body } = require("express-validator");

const validationRequestPost = [
  body("name").trim().notEmpty().withMessage("Name is required").isString().withMessage("Name must be a string"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("A valid email is required")
    .normalizeEmail(),
  body("phone").trim().notEmpty().withMessage("Phone is required").isString().withMessage("Phone must be a string"),
  body("requirements")
    .trim()
    .notEmpty()
    .withMessage("Requirements are required")
    .isString()
    .withMessage("Requirements must be a string"),
];

module.exports = { validationRequestPost };
