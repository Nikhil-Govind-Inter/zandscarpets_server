const { body, param } = require('express-validator');

const validationRequestPost = [
  body('title').notEmpty().withMessage('Title is required').isString().withMessage('Title must be a string'),
  body('description').notEmpty().withMessage('Description is required').isString().withMessage('Description must be a string'),
  body('content').notEmpty().withMessage('Content is required').isString().withMessage('Content must be a string'),
  body('icon_media_path').optional().isString().withMessage('Icon media path must be a string'),
  body('icon_media_alt').optional().isString().withMessage('Icon media alt must be a string'),
];

const validateId = [
  param('id').isInt({ min: 1 }).withMessage('ID must be an integer'),
];

module.exports = {
  validationRequestPost,
  validateId,
};
