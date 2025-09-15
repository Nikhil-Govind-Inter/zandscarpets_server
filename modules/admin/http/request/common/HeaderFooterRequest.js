const { body } = require("express-validator");

const MAX_STRING_LENGTH = 255;
const MAX_TEXT_LENGTH = 1000;

const validationRequestPost = [
//   body("banner_title")
//     .isString()
//     .isLength({ max: MAX_TEXT_LENGTH })
//     .withMessage(
//       "banner_title must be a string with a maximum of 1000 characters"
//     ),

];

module.exports = {
  validationRequestPost,
};
