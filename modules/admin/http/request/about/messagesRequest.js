const { body, param } = require('express-validator');

const validationRequestPost = [
  body('media_path').optional().isString().withMessage('Media path must be a string'),
  body('media_alt').optional().isString().withMessage('Media alt must be a string'),
  body('media_alt_ar').optional().isString().withMessage('Arabic media alt must be a string'),
  body('quotes').notEmpty().withMessage('Quotes is required').isString().withMessage('Quotes must be a string'),
  body('quotes_ar').notEmpty().withMessage('Arabic quotes is required').isString().withMessage('Arabic quotes must be a string'),
  body('name').notEmpty().withMessage('Name is required').isString().withMessage('Name must be a string'),
  body('name_ar').notEmpty().withMessage('Arabic name is required').isString().withMessage('Arabic name must be a string'),
  body('designation').notEmpty().withMessage('Designation is required').isString().withMessage('Designation must be a string'),
  body('designation_ar').notEmpty().withMessage('Arabic designation is required').isString().withMessage('Arabic designation must be a string'),
  body('Organization').notEmpty().withMessage('Organization is required').isString().withMessage('Organization must be a string'),
  body('organization_ar').notEmpty().withMessage('Arabic organization is required').isString().withMessage('Arabic organization must be a string'),
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
