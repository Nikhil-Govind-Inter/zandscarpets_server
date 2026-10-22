const { body, param } = require("express-validator");

const requiredTextFields = ["button_text", "button_text_ar", "button_link"];

const validationRequestPost = [
  body("is_active").optional().isBoolean().withMessage("is_active must be a boolean"),
  body("auto_show_delay_seconds")
    .optional({ checkFalsy: true })
    .isInt({ min: 0 })
    .withMessage("Auto-show delay must be a non-negative number of seconds"),
  ...requiredTextFields.map((field) =>
    body(field).trim().notEmpty().withMessage(`${field} is required`),
  ),
];

const validateId = [param("id").isInt({ min: 1 }).withMessage("ID must be an integer")];

module.exports = { validationRequestPost, validateId };
