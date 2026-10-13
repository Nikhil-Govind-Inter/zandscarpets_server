const { body, param, query } = require("express-validator");

const MEDIA_KINDS = ["image", "video"];

const validationRequestPost = [
  body("alt_text").optional({ nullable: true }).isString().withMessage("Alt text must be a string"),
];

const validationRequestPatch = [
  body("alt_text").optional({ nullable: true }).isString().withMessage("Alt text must be a string"),
];

const listQuery = [
  query("kind").optional({ checkFalsy: true }).isIn(MEDIA_KINDS).withMessage(`Kind must be one of: ${MEDIA_KINDS.join(", ")}`),
];

const validateId = [param("id").isInt({ min: 1 }).withMessage("ID must be an integer")];

module.exports = { MEDIA_KINDS, validationRequestPost, validationRequestPatch, listQuery, validateId };
