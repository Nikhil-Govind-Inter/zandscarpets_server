const { body, param, query } = require("express-validator");

const MEDIA_KINDS = ["image", "video"];

// Mirrors the frontend's `HTML_TAG_PATTERN` safe-text rule (formUtils.ts) so
// client and server agree on what's rejected, rather than only trusting the
// client-side check.
const HTML_TAG_PATTERN = /<[^>]*>/;
const noHtmlTags = (fieldLabel) => (value) => {
  if (value && HTML_TAG_PATTERN.test(value)) {
    throw new Error(`${fieldLabel} must not contain HTML or script tags`);
  }
  return true;
};

const textMetaValidators = [
  body("alt_text")
    .optional({ nullable: true })
    .isString()
    .withMessage("Alt text must be a string")
    .custom(noHtmlTags("Alt text")),
  body("title")
    .optional({ nullable: true })
    .isString()
    .withMessage("Title must be a string")
    .custom(noHtmlTags("Title")),
  body("description")
    .optional({ nullable: true })
    .isString()
    .withMessage("Description must be a string")
    .custom(noHtmlTags("Description")),
];

const validationRequestPost = [...textMetaValidators];

const validationRequestPatch = [...textMetaValidators];

const listQuery = [
  query("kind").optional({ checkFalsy: true }).isIn(MEDIA_KINDS).withMessage(`Kind must be one of: ${MEDIA_KINDS.join(", ")}`),
];

const validateId = [param("id").isInt({ min: 1 }).withMessage("ID must be an integer")];

module.exports = { MEDIA_KINDS, validationRequestPost, validationRequestPatch, listQuery, validateId };
