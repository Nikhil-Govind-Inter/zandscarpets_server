const { body, param } = require('express-validator');

const validationRequestPost = [
  body('media_path').optional().isString().withMessage('Media path must be a string'),
  body('media_alt').optional().isString().withMessage('Media alt must be a string'),
  body('quotes').notEmpty().withMessage('Quotes is required').isString().withMessage('Quotes must be a string'),
  body('name').notEmpty().withMessage('Name is required').isString().withMessage('Name must be a string'),
  body('designation').notEmpty().withMessage('Designation is required').isString().withMessage('Designation must be a string'),
  body('Organization').notEmpty().withMessage('Organization is required').isString().withMessage('Organization must be a string'),
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
