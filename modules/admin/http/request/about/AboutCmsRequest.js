const { body } = require("express-validator");

const validationRequestPost = [
  // Banner
  body("banner_title")
    .optional()
    .isString()
    .isLength({ max: 255 })
    .withMessage("banner_title must be a string with max 255 characters"),

  body("banner_logo")
    .optional()
    .isString()
    .isLength({ max: 5000 })
    .withMessage("banner_logo must be a string with max 5000 characters"),

  body("banner_logo_alt")
    .optional()
    .isString()
    .isLength({ max: 5000 })
    .withMessage("banner_logo_alt must be a string with max 5000 characters"),

  // About
  body("about_description")
    .optional()
    .isString()
    .isLength({ max: 5000 })
    .withMessage("about_description must be at most 5000 characters"),

  body("about_media_type")
    .optional()
    .isIn(["image", "video"])
    .withMessage("about_media_type must be either 'image' or 'video'"),

  body("about_media_desktop_path")
    .optional()
    .isString()
    .isLength({ max: 5000 })
    .withMessage("about_media_desktop_path must be at most 5000 characters"),

  body("about_media_mobile_path")
    .optional()
    .isString()
    .isLength({ max: 5000 })
    .withMessage("about_media_mobile_path must be at most 5000 characters"),

  body("about_media_alt")
    .optional()
    .isString()
    .isLength({ max: 5000 })
    .withMessage("about_media_alt must be at most 5000 characters"),

  // Learn More
  body("learn_more_title")
    .optional()
    .isString()
    .isLength({ max: 255 })
    .withMessage("learn_more_title must be at most 255 characters"),

  body("learn_more_description")
    .optional()
    .isString()
    .isLength({ max: 5000 })
    .withMessage("learn_more_description must be at most 5000 characters"),

  body("learn_more_media_path")
    .optional()
    .isString()
    .isLength({ max: 5000 })
    .withMessage("learn_more_media_path must be at most 5000 characters"),

  body("learn_more_media_alt")
    .optional()
    .isString()
    .isLength({ max: 5000 })
    .withMessage("learn_more_media_alt must be at most 5000 characters"),

  // Mission & Vision
  body("our_mission_title")
    .optional()
    .isString()
    .isLength({ max: 255 })
    .withMessage("our_mission_title must be at most 255 characters"),

  body("our_mission_description")
    .optional()
    .isString()
    .isLength({ max: 5000 })
    .withMessage("our_mission_description must be at most 5000 characters"),

  body("our_vision_title")
    .optional()
    .isString()
    .isLength({ max: 255 })
    .withMessage("our_vision_title must be at most 255 characters"),

  body("our_vision_description")
    .optional()
    .isString()
    .isLength({ max: 5000 })
    .withMessage("our_vision_description must be at most 5000 characters"),

  // Leading Game
  body("leading_game_title")
    .optional()
    .isString()
    .isLength({ max: 255 })
    .withMessage("leading_game_title must be at most 255 characters"),

  // Charging Stations
  body("charging_station_count")
    .optional()
    .isInt()
    .withMessage("charging_station_count must be an integer"),

  body("charging_station_subtitle")
    .optional()
    .isString()
    .isLength({ max: 255 })
    .withMessage("charging_station_subtitle must be at most 255 characters"),

  // Our Values
  body("our_values_title")
    .optional()
    .isString()
    .isLength({ max: 255 })
    .withMessage("our_values_title must be at most 255 characters"),

  body("our_values_description")
    .optional()
    .isString()
    .isLength({ max: 5000 })
    .withMessage("our_values_description must be at most 5000 characters"),

  // Our Journey
  body("our_journey_title")
    .optional()
    .isString()
    .isLength({ max: 255 })
    .withMessage("our_journey_title must be at most 255 characters"),

  body("our_journey_description")
    .optional()
    .isString()
    .isLength({ max: 5000 })
    .withMessage("our_journey_description must be at most 5000 characters"),

  // Meet the Team
  body("meet_team_title")
    .optional()
    .isString()
    .isLength({ max: 255 })
    .withMessage("meet_team_title must be at most 255 characters"),

  body("meet_team_description")
    .optional()
    .isString()
    .isLength({ max: 5000 })
    .withMessage("meet_team_description must be at most 5000 characters"),

  body("meet_team_media_path")
    .optional()
    .isString()
    .isLength({ max: 5000 })
    .withMessage("meet_team_media_path must be at most 5000 characters"),

  body("meet_team_media_alt")
    .optional()
    .isString()
    .isLength({ max: 255 })
    .withMessage("meet_team_media_alt must be at most 255 characters"),

  // Associates
  body("our_associate_title")
    .optional()
    .isString()
    .isLength({ max: 255 })
    .withMessage("our_associate_title must be at most 255 characters"),

  body("our_associate_description")
    .optional()
    .isString()
    .isLength({ max: 5000 })
    .withMessage("our_associate_description must be at most 5000 characters"),

  // Media
  body("media_title")
    .optional()
    .isString()
    .isLength({ max: 255 })
    .withMessage("media_title must be at most 255 characters"),

  body("media_description")
    .optional()
    .isString()
    .isLength({ max: 5000 })
    .withMessage("media_description must be at most 5000 characters"),

  // Contact Us
  body("contact_us_super_title")
    .optional()
    .isString()
    .isLength({ max: 255 })
    .withMessage("contact_us_super_title must be at most 255 characters"),

  body("contact_us_title")
    .optional()
    .isString()
    .isLength({ max: 255 })
    .withMessage("contact_us_title must be at most 255 characters"),
];

module.exports = {
  validationRequestPost,
};
