const { body, param } = require('express-validator');

const validationRequestPost = [
    body('title').notEmpty().withMessage('Title is required').isString().withMessage('Title must be a string'),
    body('title_ar').notEmpty().withMessage('Arabic title is required').isString().withMessage('Arabic title must be a string'),
    body('content').notEmpty().withMessage('Content is required').isString().withMessage('Content must be a string'),
    body('content_ar').notEmpty().withMessage('Arabic content is required').isString().withMessage('Arabic content must be a string'),
]

const validateId = [
    param('id').isInt({ min: 1 }).withMessage('ID must be an integer'),
];

module.exports = {
    validationRequestPost,
    validateId
};
