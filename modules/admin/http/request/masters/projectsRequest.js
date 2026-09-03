const { body, param } = require("express-validator");

const validationRequestPost = [
  body("category_id")
    .notEmpty()
    .withMessage("Category is required")
    .isInt({ min: 1 })
    .withMessage("Category must be a valid ID"),
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isString()
    .withMessage("Title must be a string"),
  body("location")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Location must be a string"),
  body("date_of_completion")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Date of completion must be a valid date"),
  body("material_type")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Material type must be a string"),
  body("thumbnail")
    .notEmpty()
    .withMessage("Thumbnail is required")
    .isString()
    .withMessage("Thumbnail must be a string"),
  body("media_path")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Media path must be a string"),
  body("description")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Description must be a string"),
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
  body("is_show_in_home")
    .optional()
    .isBoolean()
    .withMessage("Is show in home must be a boolean"),
];

const validateId = [
  param("id").isInt({ min: 1 }).withMessage("ID must be an integer"),
];

module.exports = {
  validationRequestPost,
  validateId,
};
