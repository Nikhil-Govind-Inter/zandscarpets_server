const {body, param} = require("express-validator");


const validationRequestPost = [
  // required fields
    body("title").notEmpty().withMessage("Title is required").isString().withMessage("Title must be a string"),
    body("description").notEmpty().withMessage("Description is required").isString().withMessage("Description must be a string"),
    body("media_path").notEmpty().withMessage("Media path is required").isString().withMessage("Media path must be a string"),
    body("media_alt").notEmpty().withMessage("Media alt is required").isString().withMessage("Media alt must be a string"),
    body("sort_order").notEmpty().withMessage("Sort order is required").isInt({ min: 1 }).withMessage("Sort order must be an integer"),
    body("is_active").notEmpty().withMessage("Is active is required").isBoolean().withMessage("Is active must be a boolean"),

];

const validateId = [
  param("id").isInt({ min: 1 }).withMessage("ID must be an integer"),
];

module.exports = {
  validationRequestPost,
  validateId,
};  