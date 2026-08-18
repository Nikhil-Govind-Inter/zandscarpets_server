const { body, param } = require("express-validator");

const validationRequestPost = [
  body("desktop_media_path").optional().isString().withMessage("Desktop media path must be a string"),
  body("mobile_media_path").optional().isString().withMessage("Mobile media path must be a string"),
  body("page_id").notEmpty().withMessage("Page is required").isInt({ min: 1 }).withMessage("Page ID must be an integer"),
  body("media_alt").notEmpty().withMessage("Media alt is required").isString().withMessage("Media alt must be a string"),
  body("title").notEmpty().withMessage("Title is required").isString().withMessage("Title must be a string"),
  body("sub_title").notEmpty().withMessage("Sub title is required").isString().withMessage("Sub title must be a string"),
];

const validateId = [
  param("id").isInt({ min: 1 }).withMessage("ID must be an integer"),
];

module.exports = {
  validationRequestPost,
  validateId,
};
