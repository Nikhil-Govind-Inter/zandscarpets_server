const {body, param} = require('express-validator');

const validationRequestPost = [
    
    body('header_logo_media_path').optional().isString().withMessage('Header logo media path must be a string'),
    body('footer_logo_media_path').optional().isString().withMessage('Footer logo media path must be a string'),
    
    //  required fields
    body('address').notEmpty().withMessage('Address is required').isString().withMessage('Address must be a string'),
    body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format'),
    body('phone_number').notEmpty().withMessage('Phone number is required').isString().withMessage('Phone number must be a string'),
    body('whatsapp_number').notEmpty().withMessage('WhatsApp number is required').isString().withMessage('WhatsApp number must be a string'),
    body('admin_email').notEmpty().isEmail().withMessage('Invalid email format'),
]


const validateId = [
    param('id').isInt({min: 1}).withMessage('ID must be an integer'),
];

module.exports = {
    validationRequestPost,
    validateId
};