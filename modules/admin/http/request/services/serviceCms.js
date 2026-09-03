const { body, param } = require('express-validator');

const validationRequestPost = [
    body('title').notEmpty().withMessage('Title is required').isString().withMessage('Title must be a string'),
    body('description').notEmpty().withMessage('Description is required').isString().withMessage('Description must be a string'),
    body('service_title').notEmpty().withMessage('Service title is required').isString().withMessage('Service title must be a string'),
    body('process_steps_title').notEmpty().withMessage('Process steps title is required').isString().withMessage('Process steps title must be a string'),
]

const validateId = [
    param('id').isInt({ min: 1 }).withMessage('ID must be an integer'),
];

module.exports = {
    validationRequestPost,
    validateId
};
