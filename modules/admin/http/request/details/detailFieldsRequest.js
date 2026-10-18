const { body, param } = require("express-validator");

const FIELD_TYPES = ["rich_text", "image", "video"];

const validationRequestPost = [
  body("name").notEmpty().withMessage("Name is required").isString().withMessage("Name must be a string"),
  body("name_ar").optional({ nullable: true, checkFalsy: true }).isString().withMessage("Arabic name must be a string"),
  body("slug").optional({ checkFalsy: true }).isString().withMessage("Slug must be a string"),
  body("type")
    .notEmpty()
    .withMessage("Type is required")
    .isIn(FIELD_TYPES)
    .withMessage(`Type must be one of: ${FIELD_TYPES.join(", ")}`),
  body("allows_multiple")
    .optional({ checkFalsy: false })
    .isBoolean()
    .withMessage("Allows multiple must be a boolean"),
  body("sort_order").optional({ checkFalsy: true }).isInt({ min: 0 }).withMessage("Sort order must be an integer"),
  body("is_active").optional({ checkFalsy: false }).isBoolean().withMessage("Is active must be a boolean"),
];

const validateId = [param("id").isInt({ min: 1 }).withMessage("ID must be an integer")];

module.exports = { FIELD_TYPES, validationRequestPost, validateId };
