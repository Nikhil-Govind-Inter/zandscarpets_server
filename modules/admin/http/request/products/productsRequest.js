const { body, param } = require("express-validator");

// FormData sends arrays as JSON strings, so accept either form.
const isJsonArray = (value) => {
  if (Array.isArray(value)) return true;
  if (typeof value !== "string") return false;
  try {
    return Array.isArray(JSON.parse(value));
  } catch (_) {
    return false;
  }
};

const optionalString = (field, label) =>
  body(field)
    .optional({ checkFalsy: true })
    .isString()
    .withMessage(`${label} must be a string`);

const requiredString = (field, label) =>
  body(field)
    .notEmpty()
    .withMessage(`${label} is required`)
    .isString()
    .withMessage(`${label} must be a string`);

const optionalJsonArray = (field, label) =>
  body(field)
    .optional({ checkFalsy: true })
    .custom(isJsonArray)
    .withMessage(`${label} must be a JSON array`);

const validationRequestPost = [
  body("product_category_id")
    .notEmpty()
    .withMessage("Category is required")
    .isInt({ min: 1 })
    .withMessage("Category must be a valid ID"),
  body("tag_id")
    .optional({ checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage("Tag must be a valid ID"),

  requiredString("title", "Title"),
  requiredString("title_ar", "Title (Arabic)"),
  requiredString("slug", "Slug"),
  requiredString("short_description", "Short description"),
  requiredString("short_description_ar", "Short description (Arabic)"),
  requiredString("product_description", "Product description"),
  requiredString("product_description_ar", "Product description (Arabic)"),

  body("specification")
    .optional({ checkFalsy: true })
    .custom(isJsonArray)
    .withMessage("Specification must be a JSON array"),
  body("specification_ar")
    .optional({ checkFalsy: true })
    .custom(isJsonArray)
    .withMessage("Specification (Arabic) must be a JSON array"),

  requiredString("data_sheet", "Data sheet"),
  requiredString("test_reports_description", "Test reports description"),
  requiredString(
    "test_reports_description_ar",
    "Test reports description (Arabic)",
  ),
  requiredString("installation_instruction", "Installation instruction"),
  requiredString(
    "installation_instruction_ar",
    "Installation instruction (Arabic)",
  ),
  requiredString("maintenance", "Maintenance"),
  requiredString("maintenance_ar", "Maintenance (Arabic)"),
  requiredString("packing_and_shipping", "Packing and shipping"),
  requiredString("packing_and_shipping_ar", "Packing and shipping (Arabic)"),
  requiredString("media_path", "Media path"),
  requiredString("media_alt", "Media alt"),
  requiredString("media_alt_ar", "Media alt (Arabic)"),
  requiredString("related_accessories", "Related accessories"),

  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("Price must be a number with up to 2 decimals")
    .custom((v) => Number(v) >= 0)
    .withMessage("Price cannot be negative"),

  optionalJsonArray("color_ids", "Color ids"),
  optionalJsonArray("size_ids", "Size ids"),
  optionalJsonArray("hash_tag_ids", "Hash tag ids"),
  optionalJsonArray("related_product_ids", "Related product ids"),

  body("sort_order")
    .notEmpty()
    .withMessage("Sort order is required")
    .isInt({ min: 0 })
    .withMessage("Sort order must be an integer"),
  body("is_active")
    .notEmpty()
    .withMessage("Is active is required")
    .isBoolean()
    .withMessage("Is active must be a boolean"),
];

const validateId = [
  param("id").isInt({ min: 1 }).withMessage("ID must be an integer"),
];

module.exports = { validationRequestPost, validateId };
