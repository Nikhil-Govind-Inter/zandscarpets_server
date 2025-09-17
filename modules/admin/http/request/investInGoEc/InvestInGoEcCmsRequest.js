const { body } = require("express-validator");

const validationRequestPost = [
  // Banner
  body("banner_title")
    .optional()
    .isString()
    .withMessage("banner_title must be a string"),

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
    .withMessage("banner_media_alt must be a string"),

  // About Section
  body("about_description")
    .optional()
    .isString()
    .withMessage("about_description must be a string"),

  body("about_media_type")
    .optional()
    .isIn(["image", "video"])
    .withMessage("about_media_type must be either 'image' or 'video'"),

  body("about_media_desktop_path")
    .optional()
    .isString()
    .withMessage("about_media_desktop_path must be a string"),

  body("about_media_mobile_path")
    .optional()
    .isString()
    .withMessage("about_media_mobile_path must be a string"),

  body("about_media_alt")
    .optional()
    .isString()
    .withMessage("about_media_alt must be a string"),

  // Growth Section
  body("growth_title")
    .optional()
    .isString()
    .withMessage("growth_title must be a string"),

  body("growth_description")
    .optional()
    .isString()
    .withMessage("growth_description must be a string"),

  body("growth_media_desktop_path")
    .optional()
    .isString()
    .withMessage("growth_media_desktop_path must be a string"),

  body("growth_media_mobile_path")
    .optional()
    .isString()
    .withMessage("growth_media_mobile_path must be a string"),

  body("growth_media_alt")
    .optional()
    .isString()
    .withMessage("growth_media_alt must be a string"),

  // Explore Section
  body("explore_title")
    .optional()
    .isString()
    .withMessage("explore_title must be a string"),

  // Why Invest Section
  body("why_invest_title")
    .optional()
    .isString()
    .withMessage("why_invest_title must be a string"),

  body("why_invest_description")
    .optional()
    .isString()
    .withMessage("why_invest_description must be a string"),

  body("why_invest_media_desktop_path")
    .optional()
    .isString()
    .withMessage("why_invest_media_desktop_path must be a string"),

  body("why_invest_media_mobile_path")
    .optional()
    .isString()
    .withMessage("why_invest_media_mobile_path must be a string"),

  body("why_invest_media_alt")
    .optional()
    .isString()
    .withMessage("why_invest_media_alt must be a string"),

  // Partners
  body("partners_title")
    .optional()
    .isString()
    .withMessage("partners_title must be a string"),

  // Invest in GoEc Section
  body("invest_in_goec_title")
    .optional()
    .isString()
    .withMessage("invest_in_goec_title must be a string"),

  body("invest_in_goec_media_path")
    .optional()
    .isString()
    .withMessage("invest_in_goec_media_path must be a string"),

  body("invest_in_goec_media_alt")
    .optional()
    .isString()
    .withMessage("invest_in_goec_media_alt must be a string"),
];

module.exports = {
  validationRequestPost,
};
