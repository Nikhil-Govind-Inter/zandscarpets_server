const { param } = require("express-validator");

const validateProductId = [
  param("productId").isInt({ min: 1 }).withMessage("Product ID must be an integer"),
];

module.exports = { validateProductId };
