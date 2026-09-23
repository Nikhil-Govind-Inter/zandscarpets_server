const { body, param } = require("express-validator");

const requiredTextFields = [
  "about_title", "about_title_ar", "about_description", "about_description_ar",
  "trust_title", "trust_title_ar", "trust_description", "trust_description_ar",
  "mission_title", "mission_title_ar", "vision_title", "vision_title_ar",
  "mission_description", "mission_description_ar", "vision_description", "vision_description_ar",
  "history_title", "history_title_ar", "message_title", "message_title_ar",
  "message_subtitle", "message_subtitle_ar", "work_title", "work_title_ar",
  "about_core_title", "about_core_title_ar", "features_title", "features_title_ar",
  "features_sub_title", "features_sub_title_ar", "features_description", "features_description_ar",
  "industry_title", "industry_title_ar", "industry_description", "industry_description_ar",
];

const optionalTextFields = [
  "media_path", "media_alt", "media_alt_ar", "about_code_media_path",
  "about_code_media_alt", "about_code_media_alt_ar", "industry_media_path",
  "industry_media_alt", "industry_media_alt_ar", "work_media_path",
  "work_media_alt", "work_media_alt_ar",
];

const validationRequestPost = [
  ...requiredTextFields.map((field) =>
    body(field).notEmpty().withMessage(`${field} is required`).isString().withMessage(`${field} must be a string`),
  ),
  ...optionalTextFields.map((field) =>
    body(field).optional().isString().withMessage(`${field} must be a string`),
  ),
];

const validateId = [param("id").isInt({ min: 1 }).withMessage("ID must be an integer")];

module.exports = { validationRequestPost, validateId };
