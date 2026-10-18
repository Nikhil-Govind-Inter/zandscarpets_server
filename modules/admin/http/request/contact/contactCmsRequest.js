const { body, param } = require('express-validator');
const { extractMapEmbedUrl } = require('../../../../../utils/googleMapsEmbed');

const validationRequestPost = [
    body('title').notEmpty().withMessage('Title is required').isString().withMessage('Title must be a string'),
    body('title_ar').notEmpty().withMessage('Arabic title is required').isString().withMessage('Arabic title must be a string'),
    body('description').notEmpty().withMessage('Description is required').isString().withMessage('Description must be a string'),
    body('description_ar').notEmpty().withMessage('Arabic description is required').isString().withMessage('Arabic description must be a string'),
    body('form_title').notEmpty().withMessage('Form title is required').isString().withMessage('Form title must be a string'),
    body('form_title_ar').notEmpty().withMessage('Arabic form title is required').isString().withMessage('Arabic form title must be a string'),
    body('social_media_title').notEmpty().withMessage('Social media title is required').isString().withMessage('Social media title must be a string'),
    body('social_media_title_ar').notEmpty().withMessage('Arabic social media title is required').isString().withMessage('Arabic social media title must be a string'),
    body('map_url')
        .notEmpty().withMessage('Map URL is required')
        .isString().withMessage('Map URL must be a string')
        .custom((value) => !!extractMapEmbedUrl(value))
        .withMessage('Paste the embed code from Google Maps (Share > Embed a map)'),
]

// phone / email / office detail cards: all optional (icon files arrive as uploads, not body fields)
const detailFields = [];
for (const key of ['phone', 'email', 'office']) {
    for (const field of ['title', 'title_ar', 'description', 'description_ar', 'value', 'icon_media_alt', 'icon_media_alt_ar']) {
        detailFields.push(`${key}_${field}`);
    }
}
detailFields.push('office_value_ar');
validationRequestPost.push(
    ...detailFields.map((field) => body(field).optional({ nullable: true }).isString().withMessage(`${field} must be a string`)),
);

const validateId = [
    param('id').isInt({ min: 1 }).withMessage('ID must be an integer'),
];

module.exports = {
    validationRequestPost,
    validateId
};
