const { body, param } = require("express-validator");

const validationRequestPost = [
  // Title & Description
  body("banner_title")
    .optional()
    .isString()
    .isLength({ max: 5000 })
    .withMessage("Title must be a string with max 5000 characters"),


];

// ID parameter validation
const validateId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID must be a positive integer"),
];

module.exports = {
  validationRequestPost,
  validateId,
};
