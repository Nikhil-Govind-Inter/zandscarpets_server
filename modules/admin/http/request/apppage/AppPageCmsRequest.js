const { body } = require("express-validator");

const validationRequestPost = [
  body("banner_title")
    .optional()
    .isString()
    .isLength({ max: 5000 })
    .withMessage("banner_title must be at most 5000 characters"),

  body("banner_media_desktop_path")
    .optional()
    .isString()
    .withMessage("banner_media_desktop_path must be a string"),

  body("banner_media_mobile_path")
    .optional()
    .isString()
    .withMessage("banner_media_mobile_path must be a string"),

  body("banner_media_alt")
    .optional()
    .isString()
    .isLength({ max: 5000 })
    .withMessage("banner_media_alt must be at most 5000 characters"),

  body("about_description")
    .optional()
    .isString()
    .isLength({ max: 10000 })
    .withMessage("about_description must be at most 10000 characters"),

  body("feature_title")
    .optional()
    .isString()
    .isLength({ max: 5000 })
    .withMessage("feature_title must be at most 5000 characters"),

  body("charge_ur_ev_title")
    .optional()
    .isString()
    .isLength({ max: 5000 })
    .withMessage("charge_ur_ev_title must be at most 5000 characters"),

  body("start_ur_journey_title")
    .optional()
    .isString()
    .isLength({ max: 5000 })
    .withMessage("start_ur_journey_title must be at most 5000 characters"),

  body("start_ur_journey_media_path")
    .optional()
    .isString()
    .withMessage("start_ur_journey_media_path must be a string"),

  body("start_ur_journey_media_alt")
    .optional()
    .isString()
    .isLength({ max: 5000 })
    .withMessage("start_ur_journey_media_alt must be at most 5000 characters"),
];

module.exports = {
  validationRequestPost,
};
