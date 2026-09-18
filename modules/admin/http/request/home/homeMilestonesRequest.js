const {body, param} = require("express-validator");

const validationRequestPost = [
    body("media_path").notEmpty().withMessage("Media path is required").isString().withMessage("Media path must be a string"),
    body("media_alt").notEmpty().withMessage("Media alt is required").isString().withMessage("Media alt must be a string"),
    body("media_alt_ar").notEmpty().withMessage("Media alt (Arabic) is required").isString().withMessage("Media alt (Arabic) must be a string"),
    body("value").notEmpty().withMessage("Value is required").isString().withMessage("Value must be a string"),
    body("value_ar").notEmpty().withMessage("Value (Arabic) is required").isString().withMessage("Value (Arabic) must be a string"),
    body("label").notEmpty().withMessage("Label is required").isString().withMessage("Label must be a string"),
    body("label_ar").notEmpty().withMessage("Label (Arabic) is required").isString().withMessage("Label (Arabic) must be a string"),
    body("sort_order").notEmpty().withMessage("Sort order is required").isInt().withMessage("Sort order must be an integer"),
    body("is_active").notEmpty().withMessage("Is active is required").isBoolean().withMessage("Is active must be a boolean"),
]

const validateId = [
    param("id").isInt({ min: 1 }).withMessage("ID must be an integer"),
]


module.exports = {
    validationRequestPost,
    validateId
}