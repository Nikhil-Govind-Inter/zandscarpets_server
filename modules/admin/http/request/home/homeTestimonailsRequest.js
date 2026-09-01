const { body, param } = require('express-validator');

const validationRequestPost = [
  body('profile_media_path').optional().isString().withMessage('Profile media path must be a string'),
  body('name').notEmpty().withMessage('Name is required').isString().withMessage('Name must be a string'),
  body('designation').optional().isString().withMessage('Designation must be a string'),
  body('message').notEmpty().withMessage('Message is required').isString().withMessage('Message must be a string'),
  body('sort_order').optional().isInt().withMessage('Sort order must be an integer'),
  body('is_active').optional().isBoolean().withMessage('is_active must be boolean'),
];

const validateId = [
  param('id').isInt({ min: 1 }).withMessage('ID must be an integer'),
];

module.exports = {
  validationRequestPost,
  validateId,
};
