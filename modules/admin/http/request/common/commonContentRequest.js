const { body, param } = require("express-validator");

const required = (field, label) =>
    body(field).notEmpty().withMessage(`${label} is required`).isString().withMessage(`${label} must be a string`);

const validationRequestPost = [
    required("why_choose_title", "Why choose title"),
    required("why_choose_title_ar", "Why choose title (Arabic)"),
    required("side_section_title", "Side section title"),
    required("side_section_title_ar", "Side section title (Arabic)"),
    required("side_section_description", "Side section description"),
    required("side_section_description_ar", "Side section description (Arabic)"),
    required("button_text", "Button text"),
    required("button_text_ar", "Button text (Arabic)"),
    required("button_link", "Button link"),
    required("how_section_title", "How section title"),
    required("how_section_title_ar", "How section title (Arabic)"),
]

const validateId = [
    param("id").isInt({ min: 1 }).withMessage("ID must be an integer"),
]

module.exports = {
    validationRequestPost,
    validateId
}
