const { body, param } = require('express-validator');

const validationRequestPost = [
    body('about_title').notEmpty().withMessage('About title is required').isString().withMessage('About title must be a string'),
    body('about_description').notEmpty().withMessage('About description is required').isString().withMessage('About description must be a string'),
    body('media_path').optional().isString().withMessage('Media path must be a string'),
    body('media_alt').optional().isString().withMessage('Media alt must be a string'),
    body('trust_title').notEmpty().withMessage('Trust title is required').isString().withMessage('Trust title must be a string'),
    body('trust_description').notEmpty().withMessage('Trust description is required').isString().withMessage('Trust description must be a string'),
    body('mission_title').notEmpty().withMessage('Mission title is required').isString().withMessage('Mission title must be a string'),
    body('vision_title').notEmpty().withMessage('Vision title is required').isString().withMessage('Vision title must be a string'),
    body('mission_description').notEmpty().withMessage('Mission description is required').isString().withMessage('Mission description must be a string'),
    body('vision_description').notEmpty().withMessage('Vision description is required').isString().withMessage('Vision description must be a string'),
    body('history_title').notEmpty().withMessage('History title is required').isString().withMessage('History title must be a string'),
    body('message_title').notEmpty().withMessage('Message title is required').isString().withMessage('Message title must be a string'),
    body('message_subtitle').notEmpty().withMessage('Message subtitle is required').isString().withMessage('Message subtitle must be a string'),
    body('work_title').notEmpty().withMessage('Work title is required').isString().withMessage('Work title must be a string'),
    body('about_core_title').notEmpty().withMessage('About core title is required').isString().withMessage('About core title must be a string'),
    body('about_code_media_path').optional().isString().withMessage('About code media path must be a string'),
    body('about_code_media_alt').optional().isString().withMessage('About code media alt must be a string'),
    body('features_title').notEmpty().withMessage('Features title is required').isString().withMessage('Features title must be a string'),
    body('features_sub_title').notEmpty().withMessage('Features sub title is required').isString().withMessage('Features sub title must be a string'),
    body('features_description').notEmpty().withMessage('Features description is required').isString().withMessage('Features description must be a string'),
    body('industry_title').notEmpty().withMessage('Industry title is required').isString().withMessage('Industry title must be a string'),
    body('industry_description').notEmpty().withMessage('Industry description is required').isString().withMessage('Industry description must be a string'),
    body('industry_media_path').optional().isString().withMessage('Industry media path must be a string'),
    body('industry_media_alt').optional().isString().withMessage('Industry media alt must be a string'),
]

const validateId = [
    param('id').isInt({ min: 1 }).withMessage('ID must be an integer'),
];

module.exports = {
    validationRequestPost,
    validateId
};
