const { body } = require("express-validator");

const validationRequestPost = [
  // Banner Title
  body("banner_title")
    .isString()
    .isLength({ max: 255 })
    .withMessage("banner_title must be at most 255 characters"),

  // Invest Media Path
  body("invest_media_path")
    .optional()
    .isString()
    .isLength({ max: 5000 })
    .withMessage("invest_media_path must be at most 5000 characters"),

  // Invest Media Alt
  body("invest_media_alt")
    .isString()
    .isLength({ max: 255 })
    .withMessage("invest_media_alt must be at most 255 characters"),

  // Invest Description
  body("invest_description")
    .isString()
    .isLength({ max: 5000 })
    .withMessage("invest_description must be at most 5000 characters"),

  // Future Transportation Title
  body("future_transportation_title")
    .isString()
    .isLength({ max: 255 })
    .withMessage("future_transportation_title must be at most 255 characters"),

  // Future Transportation Description
  body("future_transportation_description")
    .isString()
    .isLength({ max: 5000 })
    .withMessage(
      "future_transportation_description must be at most 5000 characters"
    ),

  // Future Transportation Media Path
  body("future_transportation_media_path")
    .optional()
    .isString()
    .isLength({ max: 5000 })
    .withMessage(
      "future_transportation_media_path must be at most 5000 characters"
    ),

  // Future Transportation Media Alt
  body("future_transportation_media_alt")
    .isString()
    .isLength({ max: 255 })
    .withMessage(
      "future_transportation_media_alt must be at most 255 characters"
    ),

  // Business Model Title
  body("business_model_title")
    .isString()
    .isLength({ max: 255 })
    .withMessage("business_model_title must be at most 255 characters"),

  // Why Invest Title
  body("why_invest_title")
    .isString()
    .isLength({ max: 255 })
    .withMessage("why_invest_title must be at most 255 characters"),

  // Why Invest Description
  body("why_invest_description")
    .isString()
    .isLength({ max: 5000 })
    .withMessage("why_invest_description must be at most 5000 characters"),

  // Why Invest Media Path
  body("why_invest_media_path")
    .optional()
    .isString()
    .isLength({ max: 5000 })
    .withMessage("why_invest_media_path must be at most 5000 characters"),

  // Why Invest Media Alt
  body("why_invest_media_alt")
    .isString()
    .isLength({ max: 255 })
    .withMessage("why_invest_media_alt must be at most 255 characters"),

  // Partners Title
  body("partners_title")
    .isString()
    .isLength({ max: 255 })
    .withMessage("partners_title must be at most 255 characters"),

  // Invest In GoEc Title
  body("invest_in_goec_title")
    .isString()
    .isLength({ max: 255 })
    .withMessage("invest_in_goec_title must be at most 255 characters"),

  // Invest In GoEc Media Path
  body("invest_in_goec_media_path")
    .optional()
    .isString()
    .isLength({ max: 5000 })
    .withMessage("invest_in_goec_media_path must be at most 5000 characters"),

  // Invest In GoEc Media Alt
  body("invest_in_goec_media_alt")
    .isString()
    .isLength({ max: 255 })
    .withMessage("invest_in_goec_media_alt must be at most 255 characters"),
];

module.exports = {
  validationRequestPost,
};
