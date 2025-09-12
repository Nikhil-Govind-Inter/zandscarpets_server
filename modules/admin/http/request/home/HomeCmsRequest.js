const { body } = require("express-validator");

const MAX_STRING_LENGTH = 255;
const MAX_TEXT_LENGTH = 1000;

const validationRequestPost = [
  body("banner_title")
    .isString()
    .isLength({ max: MAX_TEXT_LENGTH })
    .withMessage(
      "banner_title must be a string with a maximum of 1000 characters"
    ),

  body("banner_media_path")
    .optional()
    .isString()
    .isLength({ max: MAX_TEXT_LENGTH })
    .withMessage(
      "banner_media_path must be a string with a maximum of 1000 characters"
    ),

  body("banner_media_alt")
    .isString()
    .isLength({ max: MAX_TEXT_LENGTH })
    .withMessage(
      "banner_media_alt must be a string with a maximum of 1000 characters"
    ),

  body("smart_card_description")
    .isString()
    .isLength({ max: MAX_TEXT_LENGTH })
    .withMessage(
      "smart_card_description must be a string with a maximum of 1000 characters"
    ),

  body("key_benefits_title")
    .isString()
    .isLength({ max: MAX_STRING_LENGTH })
    .withMessage(
      "key_benefits_title must be a string with a maximum of 255 characters"
    ),

  body("card_apply_steps_title")
    .isString()
    .isLength({ max: MAX_STRING_LENGTH })
    .withMessage(
      "card_apply_steps_title must be a string with a maximum of 255 characters"
    ),

  body("card_apply_steps_description")
    .isString()
    .isLength({ max: MAX_TEXT_LENGTH })
    .withMessage(
      "card_apply_steps_description must be a string with a maximum of 1000 characters"
    ),

  body("get_your_ev_title")
    .isString()
    .isLength({ max: MAX_TEXT_LENGTH })
    .withMessage(
      "get_your_ev_title must be a string with a maximum of 1000 characters"
    ),
];

module.exports = {
  validationRequestPost,
};
