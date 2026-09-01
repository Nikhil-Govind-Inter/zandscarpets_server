const { body, param } = require('express-validator');

const validationRequestPost = [
    body('title').notEmpty().withMessage('Title is required').isString().withMessage('Title must be a string'),
    body('description').notEmpty().withMessage('Description is required').isString().withMessage('Description must be a string'),
    body('form_title').notEmpty().withMessage('Form title is required').isString().withMessage('Form title must be a string'),
    body('social_media_title').notEmpty().withMessage('Social media title is required').isString().withMessage('Social media title must be a string'),
    body('map_url').notEmpty().withMessage('Map URL is required').isString().withMessage('Map URL must be a string'),
]

const validateId = [
    param('id').isInt({ min: 1 }).withMessage('ID must be an integer'),
];

module.exports = {
    validationRequestPost,
    validateId
};
