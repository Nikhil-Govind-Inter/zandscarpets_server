const { body } = require("express-validator");

const validationRequestPost = [
  // milestone
  body("milestone_description")
    .optional()
    .isString()
    .withMessage("Milestone description must be a string"),

  // make ride
  body("make_ride_title")
    .optional()
    .isString()
    .withMessage("Make ride title must be a string"),
  body("make_ride_highlight_title")
    .optional()
    .isString()
    .withMessage("Make ride highlight title must be a string"),
  body("make_ride_description")
    .optional()
    .isString()
    .withMessage("Make ride description must be a string"),
  body("make_ride_media_type")
    .optional()
    .isIn(["image", "video"])
    .withMessage("Make ride media type must be either 'image' or 'video'"),
  body("make_ride_media_desktop_path")
    .optional()
    .isString()
    .withMessage("Make ride desktop path must be a string"),
  body("make_ride_media_mobile_path")
    .optional()
    .isString()
    .withMessage("Make ride mobile path must be a string"),
  body("make_ride_media_alt")
    .optional()
    .isString()
    .withMessage("Make ride media alt text must be a string"),

  // explore
  body("explore_title")
    .optional()
    .isString()
    .withMessage("Explore title must be a string"),
  body("explore_description")
    .optional()
    .isString()
    .withMessage("Explore description must be a string"),

  // app feature
  body("app_feature_title")
    .optional()
    .isString()
    .withMessage("App feature title must be a string"),
  body("app_feature_description")
    .optional()
    .isString()
    .withMessage("App feature description must be a string"),
  body("app_feature_sub_title")
    .optional()
    .isString()
    .withMessage("App feature subtitle must be a string"),
  // body("app_feature_media_type")
  //   .optional()
  //   .isIn(["image", "video"])
  //   .withMessage("App feature media type must be either 'image' or 'video'"),
  body("app_feature_hand_image")
    .optional()
    .isString()
    .withMessage("App feature hand image must be a string"),
  body("app_feature_hand_image_alt")
    .optional()
    .isString()
    .withMessage("App feature hand image alt must be a string"),

  body("app_feature_hand_video")
    .optional()
    .isString()
    .withMessage("App feature hand video must be a string"),
  body("app_feature_hand_video_alt")
    .optional()
    .isString()
    .withMessage("App feature hand video alt must be a string"),

  // investment
  body("investment_title")
    .optional()
    .isString()
    .withMessage("Investment title must be a string"),
  body("investment_media_type")
    .optional()
    .isIn(["image", "video"])
    .withMessage("Investment media type must be either 'image' or 'video'"),
  body("investment_media_desktop_path")
    .optional()
    .isString()
    .withMessage("Investment desktop path must be a string"),
  body("investment_media_mobile_path")
    .optional()
    .isString()
    .withMessage("Investment mobile path must be a string"),
  body("investment_media_alt")
    .optional()
    .isString()
    .withMessage("Investment media alt must be a string"),

  // other simple fields
  body("partners_title")
    .optional()
    .isString()
    .withMessage("Partners title must be a string"),
  body("news_title")
    .optional()
    .isString()
    .withMessage("News title must be a string"),
  body("blog_title")
    .optional()
    .isString()
    .withMessage("Blog title must be a string"),
];

module.exports = {
  validationRequestPost,
};
