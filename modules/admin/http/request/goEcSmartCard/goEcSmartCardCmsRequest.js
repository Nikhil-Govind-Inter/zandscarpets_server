const { body } = require("express-validator");

const validationRequestPost = [
  // Banner
  body("banner_title")
    .isString()
    .isLength({ max: 255 })
    .withMessage("banner_title must be a string with max 255 characters"),

  body("banner_media_path").optional().isString().isLength({ max: 255 }),

  body("banner_media_alt").isString().isLength({ max: 255 }),

  // About
  body("smart_card_description")
    .isString()
    .isLength({ max: 255 })
    .withMessage("about_description must be at most 255 characters"),

  body("smart_card_description")
    .isString()
    .isLength({ max: 255 })
    .withMessage("learn_more_description must be at most 255 characters"),

  body("key_benefits_title")
    .isLength({ max: 255 })
    .withMessage("key_benefits_title must be at most 255 characters"),

  body("card_apply_steps_title")
    .isString()
    .isLength({ max: 255 })
    .withMessage("card_apply_steps_title must be at most 255 characters"),

  // Mission & Vision
  body("card_apply_steps_description")
    .isString()
    .isLength({ max: 255 })
    .withMessage("card_apply_steps_description must be at most 255 characters"),

  body("get_your_ev_title")
    .isString()
    .isLength({ max: 255 })
    .withMessage("get_your_ev_title must be at most 255 characters"),
];

module.exports = {
  validationRequestPost,
};
