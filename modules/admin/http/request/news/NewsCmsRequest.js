const { body } = require("express-validator");

const validationRequestPost = [
  // Milestone
  body("milestone_description")
    .optional()
    .isString()
    .isLength({ max: 5000 })
    .withMessage("milestone_description must be at most 5000 characters"),

  // Make a Ride
  body("make_ride_title")
    .optional()
    .isString()
    .isLength({ max: 255 })
    .withMessage("make_ride_title must be at most 255 characters"),

  body("make_ride_description")
    .optional()
    .isString()
    .isLength({ max: 5000 })
    .withMessage("make_ride_description must be at most 5000 characters"),

  body("make_ride_media_type")
    .optional()
    .isIn(["image", "video"])
    .withMessage("make_ride_media_type must be either 'image' or 'video'"),

  body("make_ride_desktop_media")
    .optional()
    .isString()
    .isLength({ max: 5000 }),

  body("make_ride_mobile_media")
    .optional()
    .isString()
    .isLength({ max: 5000 }),

  body("make_ride_media_alt")
    .optional()
    .isString()
    .isLength({ max: 255 }),

  // Explore
  body("explore_title")
    .optional()
    .isString()
    .isLength({ max: 255 }),

  body("explore_description")
    .optional()
    .isString()
    .isLength({ max: 5000 }),

  // App Feature
  body("app_feature_title")
    .optional()
    .isString()
    .isLength({ max: 255 }),

  body("app_feature_description")
    .optional()
    .isString()
    .isLength({ max: 5000 }),

  body("app_feature_sub_title")
    .optional()
    .isString()
    .isLength({ max: 255 }),

  body("app_feature_media_type")
    .optional()
    .isIn(["image", "video"])
    .withMessage("app_feature_media_type must be either 'image' or 'video'"),

  body("app_feature_desktop_media")
    .optional()
    .isString()
    .isLength({ max: 5000 }),

  body("app_feature_mobile_media")
    .optional()
    .isString()
    .isLength({ max: 5000 }),

  body("app_feature_media_alt")
    .optional()
    .isString()
    .isLength({ max: 255 }),

  // Investment
  body("investment_title")
    .optional()
    .isString()
    .isLength({ max: 255 }),

  body("investment_media_type")
    .optional()
    .isIn(["image", "video"])
    .withMessage("investment_media_type must be either 'image' or 'video'"),

  body("investment_desktop_media")
    .optional()
    .isString()
    .isLength({ max: 5000 }),

  body("investment_mobile_media")
    .optional()
    .isString()
    .isLength({ max: 5000 }),

  body("investment_media_alt")
    .optional()
    .isString()
    .isLength({ max: 255 }),

  // Partners
  body("partners_title")
    .optional()
    .isString()
    .isLength({ max: 255 }),

  // News
  body("news_title")
    .optional()
    .isString()
    .isLength({ max: 255 }),

  // Blog
  body("blog_title")
    .optional()
    .isString()
    .isLength({ max: 255 }),
];

module.exports = {
  validationRequestPost,
};
