const { body, param } = require('express-validator');

const validationRequestPost = [
    body('discover_title').notEmpty().withMessage('Discover title is required').isString().withMessage('Discover title must be a string'),
    body('discover_title_ar').notEmpty().withMessage('Discover title (Arabic) is required').isString().withMessage('Discover title (Arabic) must be a string'),
    body('residential_title').notEmpty().withMessage('Residential title is required').isString().withMessage('Residential title must be a string'),
    body('residential_title_ar').notEmpty().withMessage('Residential title (Arabic) is required').isString().withMessage('Residential title (Arabic) must be a string'),
    body('project_title').notEmpty().withMessage('Project title is required').isString().withMessage('Project title must be a string'),
    body('project_title_ar').notEmpty().withMessage('Project title (Arabic) is required').isString().withMessage('Project title (Arabic) must be a string'),
    body('testimonial_title').notEmpty().withMessage('Testimonial title is required').isString().withMessage('Testimonial title must be a string'),
    body('testimonial_title_ar').notEmpty().withMessage('Testimonial title (Arabic) is required').isString().withMessage('Testimonial title (Arabic) must be a string'),
    body('brand_title').notEmpty().withMessage('Brand title is required').isString().withMessage('Brand title must be a string'),
    body('brand_title_ar').notEmpty().withMessage('Brand title (Arabic) is required').isString().withMessage('Brand title (Arabic) must be a string'),
    body('cta_title').notEmpty().withMessage('CTA title is required').isString().withMessage('CTA title must be a string'),
    body('cta_title_ar').notEmpty().withMessage('CTA title (Arabic) is required').isString().withMessage('CTA title (Arabic) must be a string'),
    body('cta_description').notEmpty().withMessage('CTA description is required').isString().withMessage('CTA description must be a string'),
    body('cta_description_ar').notEmpty().withMessage('CTA description (Arabic) is required').isString().withMessage('CTA description (Arabic) must be a string'),
    body('faq_title').notEmpty().withMessage('FAQ title is required').isString().withMessage('FAQ title must be a string'),
    body('faq_title_ar').notEmpty().withMessage('FAQ title (Arabic) is required').isString().withMessage('FAQ title (Arabic) must be a string'),
    body('space_section_title').notEmpty().withMessage('Space section title is required').isString().withMessage('Space section title must be a string'),
    body('space_section_title_ar').notEmpty().withMessage('Space section title (Arabic) is required').isString().withMessage('Space section title (Arabic) must be a string'),
    body('space_button_text').optional({ checkFalsy: true }).isString().withMessage('Space button text must be a string'),
    body('space_button_text_ar').optional({ checkFalsy: true }).isString().withMessage('Space button text (Arabic) must be a string'),
    body('space_button_link').optional({ checkFalsy: true }).isString().withMessage('Space button link must be a string'),
    body('premium_title').notEmpty().withMessage('Premium title is required').isString().withMessage('Premium title must be a string'),
    body('premium_title_ar').notEmpty().withMessage('Premium title (Arabic) is required').isString().withMessage('Premium title (Arabic) must be a string'),
    body('premium_description').notEmpty().withMessage('Premium description is required').isString().withMessage('Premium description must be a string'),
    body('premium_description_ar').notEmpty().withMessage('Premium description (Arabic) is required').isString().withMessage('Premium description (Arabic) must be a string'),
]

const validateId = [
    param('id').isInt({ min: 1 }).withMessage('ID must be an integer'),
];

module.exports = {
    validationRequestPost,
    validateId
};
