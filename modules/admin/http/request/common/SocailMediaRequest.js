const { body, param } = require("express-validator");

const validationRequestPost = [
  body('name')
    .optional({ nullable: true })
    .isLength({ max: 1000 }).withMessage('Address cannot exceed 1000 characters'),
  body('icon')
    .optional({ nullable: true })
    .isLength({ max: 1000 }).withMessage('Logo path too long (max 1000 characters)'),

  body('icon_alt')
    .optional({ nullable: true })
    .isLength({ max: 300 }).withMessage('Logo alt text cannot exceed 300 characters'),
    
    body('link')
    .optional({ nullable: true })
    .isLength({ max: 1000 }).withMessage('link alt text cannot exceed 1000 characters'),

];

// Optional ID validator
const validateId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID must be a positive integer")
];

module.exports = {
  validationRequestPost,
  validateId
};
