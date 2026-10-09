const { body, param } = require('express-validator');

const validationRequestPost = [
  body('title').notEmpty().withMessage('Title is required').isString().withMessage('Title must be a string'),
  body('title_ar').notEmpty().withMessage('Arabic title is required').isString().withMessage('Arabic title must be a string'),
  
  body('description').optional().isString().withMessage('Description must be a string'),
  body('description_ar').optional().isString().withMessage('Arabic description must be a string'),
  
  body('content').notEmpty().withMessage('Content is required').isString().withMessage('Content must be a string'),
  body('content_ar').optional().isString().withMessage('Arabic content must be a string'),
  
  body('icon_media_path').optional().isString().withMessage('Icon media path must be a string'),
  
  body('icon_media_alt').optional().isString().withMessage('Icon media alt must be a string'),
  body('icon_media_alt_ar').optional().isString().withMessage('Arabic icon media alt must be a string'),
  
  body('sort_order').notEmpty().withMessage('Sort order is required').isInt({ min: 0 }).withMessage('Sort order must be an integer'),
  body('is_active').notEmpty().withMessage('Is active is required').isBoolean().withMessage('Is active must be a boolean'),
];

const validateId = [
  param('id').isInt({ min: 1 }).withMessage('ID must be an integer'),
];

module.exports = {
  validationRequestPost,
  validateId,
};
