const { body, param } = require("express-validator");

const validationRequestPost = [
  body("media_path").notEmpty().withMessage("Media path is required").withMessage("Media path must be a string"),
  body("media_alt").notEmpty().withMessage("Media alt is required").withMessage("Media alt must be a string"),
  body("media_alt_ar").notEmpty().withMessage("Arabic media alt is required").withMessage("Arabic media alt must be a string"),
  body("link").optional({ nullable: true, checkFalsy: true }).isString().withMessage("Link must be a string").isLength({ max: 255 }).withMessage("Link must be at most 255 characters"),
  body("button_text").optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 60 }).withMessage("Button text must be at most 60 characters"),
  body("button_text_ar").optional({ nullable: true, checkFalsy: true }).isString().isLength({ max: 60 }).withMessage("Arabic button text must be at most 60 characters"),
  body("link_new_tab").optional({ nullable: true }).isBoolean().withMessage("Open in new tab must be a boolean"),
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
