const {body, param} = require("express-validator");


const validationRequestPost = [
  // required fields
    body("meta_title").notEmpty().withMessage("Meta title is required").isString().withMessage("Meta title must be a string"),
    body("meta_title_ar").optional().isString().withMessage("Arabic meta title must be a string"),
    body("meta_description").notEmpty().withMessage("Meta description is required").isString().withMessage("Meta description must be a string"),
    body("meta_description_ar").optional().isString().withMessage("Arabic meta description must be a string"),
    body("meta_keywords").notEmpty().withMessage("Meta keywords is required").isString().withMessage("Meta keywords must be a string"),
    body("meta_keywords_ar").optional().isString().withMessage("Arabic meta keywords must be a string"),
    // body("canonical_url").notEmpty().withMessage("Canonical url is required").isString().withMessage("Canonical url must be a string"),
];

const validateId = [
  param("id").isInt({ min: 1 }).withMessage("ID must be an integer"),
];

module.exports = {
  validationRequestPost,
  validateId,
};  