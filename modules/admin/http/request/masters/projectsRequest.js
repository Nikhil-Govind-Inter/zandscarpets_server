const { body, param } = require("express-validator");

const validationRequestPost = [
  body("category_id")
    .notEmpty()
    .withMessage("Category is required")
    .isInt({ min: 1 })
    .withMessage("Category must be a valid ID"),
  body("material_id")
    .notEmpty()
    .withMessage("Material is required")
    .isInt({ min: 1 })
    .withMessage("Material must be a valid ID"),
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isString()
    .withMessage("Title must be a string"),
  body("title_ar")
    .notEmpty()
    .withMessage("Title (Arabic) is required")
    .isString()
    .withMessage("Title (Arabic) must be a string"),
  body("location")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Location must be a string"),
  body("location_ar")
    .notEmpty()
    .withMessage("Location (Arabic) is required")
    .isString()
    .withMessage("Location (Arabic) must be a string"),
  body("date_of_completion")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Date of completion must be a valid date"),
  body("material_type")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Material type must be a string"),
  body("material_type_ar")
    .notEmpty()
    .withMessage("Material type (Arabic) is required")
    .isString()
    .withMessage("Material type (Arabic) must be a string"),
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
  body("description_ar")
    .notEmpty()
    .withMessage("Description (Arabic) is required")
    .isString()
    .withMessage("Description (Arabic) must be a string"),
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
