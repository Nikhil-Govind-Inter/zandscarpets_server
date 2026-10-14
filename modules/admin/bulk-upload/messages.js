// Central error/warning message catalog for the bulk-upload feature. One
// entry per rule so wording stays consistent across every validator and the
// generated instructions sheet (spec §11 "maintainability"). Every builder
// returns a plain string; callers attach { row, column, severity } around it.

const quote = (value) => `"${value}"`;

const messages = {
  REQUIRED_FIELD: ({ column }) => `${column} is required but empty`,

  DUPLICATE_IN_FILE: ({ column, value, otherRow }) =>
    `${column} ${quote(value)} is the same as row ${otherRow} in this file`,

  DUPLICATE_IN_DB: ({ column, value }) =>
    `${column} ${quote(value)} is already in use`,

  INVALID_ENUM: ({ column, value, allowed }) =>
    `Allowed values for ${column}: ${allowed.join(", ")}. You entered ${quote(value)}`,

  INVALID_BOOLEAN: ({ column, value }) =>
    `${column} must be TRUE or FALSE. You entered ${quote(value)}`,

  INVALID_NUMBER: ({ column, value }) =>
    `${column} must be a number. You entered ${quote(value)}`,

  INVALID_SLUG: ({ column, value }) =>
    `${column} must be lowercase with hyphens only, no spaces. You entered ${quote(value)}`,

  INVALID_COLOR_CODE: ({ value }) =>
    `${quote(value)} is not a valid color code. Use the format #RRGGBB, e.g. #A0522D`,

  REF_NOT_FOUND: ({ column, value, suggestion }) =>
    `${column} ${quote(value)} was not found${suggestion ? `. Did you mean ${quote(suggestion)}?` : ""}`,

  PARENT_NOT_ABOVE_CHILD: ({ column, value }) =>
    `${column} ${quote(value)} must appear in a row above this one`,

  PARENT_CYCLE: ({ value }) =>
    `${quote(value)} cannot be its own ancestor — check the parent chain for a loop`,

  MEDIA_NOT_FOUND: ({ column, value }) =>
    `${column}: file not found: ${value}`,

  MEDIA_WRONG_FOLDER: ({ column, value, expectedFolder }) =>
    `${column}: ${quote(value)} must be a path under ${expectedFolder}/`,

  LIST_IMAGE_FALLBACK: () => `list_image is blank, main_image will be used instead`,

  INVALID_CATEGORY_PATH: ({ value }) =>
    `category_path ${quote(value)} has an empty segment — check for a stray ">" or extra spaces`,

  COLOR_CODE_IGNORED: ({ attributeTitle, attributeType }) =>
    `Attribute ${quote(attributeTitle)} is type ${quote(attributeType || "text")} — the |#RRGGBB color code was ignored`,

  HAS_ATTRIBUTES_BUT_NO_REFS: () =>
    `has_attributes is TRUE but attribute_value_refs is empty — fill it in (e.g. Size=120cm) or set has_attributes to FALSE`,

  ATTRIBUTES_FLAG_OFF_REFS_IGNORED: () =>
    `attribute_value_refs has content but has_attributes is FALSE — it was ignored. Set has_attributes to TRUE to apply it`,

  ATTRIBUTES_IGNORED_ON_UPDATE: () =>
    `attribute_titles is ignored when updating an existing product — attributes aren't changed via bulk upload; edit them from the product's screen instead`,

  VARIANTS_IGNORED_ON_UPDATE: () =>
    `generate_variants is ignored when updating an existing product — variants aren't generated via bulk upload on update; use the Product Variants sheet or Manage Variants instead`,

  GENERATE_VARIANTS_NEEDS_ATTRIBUTES: () =>
    `generate_variants is TRUE but has_attributes isn't — variants need attributes to vary over. Set has_attributes to TRUE and fill in attribute_value_refs`,

  MULTIPLE_VALUES_BUT_GENERATE_VARIANTS_OFF: ({ attributeTitle }) =>
    `Attribute ${quote(attributeTitle)} lists more than one value but generate_variants is FALSE — the values were still created/linked, but no variants were generated from them`,

  TOO_MANY_VARIANT_COMBINATIONS: ({ count, max }) =>
    `attribute_value_refs would generate ${count} variant combinations, over the limit of ${max} per row — list fewer values, or split this into multiple uploads`,

  ATTRIBUTE_VALUE_REF_FORMAT: ({ value }) =>
    `${quote(value)} must be in the form Attribute=Value, e.g. Size=120cm`,

  ATTRIBUTE_VALUE_COUNT_MISMATCH: ({ productSlug, expected, got }) =>
    `Product ${quote(productSlug)} uses ${expected.length} attribute(s) (${expected.join(", ")}) but this row has ${got} value(s)`,

  ATTRIBUTE_VALUE_NOT_OWNED: ({ attributeTitle, value }) =>
    `${quote(value)} does not belong to attribute ${quote(attributeTitle)}`,

  ATTRIBUTE_NOT_USED_BY_PRODUCT: ({ productSlug, attributeTitle }) =>
    `Product ${quote(productSlug)} does not use attribute ${quote(attributeTitle)}`,

  VARIANT_COMBINATION_DUPLICATE: ({ productSlug, otherRow }) =>
    `This attribute-value combination for product ${quote(productSlug)} is the same as row ${otherRow}`,

  ATTRIBUTE_VALUE_MISSING_FOR_TYPE: ({ attributeType, missingFields }) =>
    `Attribute type ${quote(attributeType)} requires: ${missingFields.join(", ")}`,

  OUTDATED_TEMPLATE: ({ got, expected }) =>
    `This template is out of date (version ${got}, current is ${expected}). Download a fresh template and re-fill your data`,

  EMPTY_FILE: () => `The uploaded file has no data rows`,

  WRONG_FILE_TYPE: () => `Only .xlsx files are accepted`,

  MISSING_SHEET: ({ sheetName }) => `Expected a sheet named ${quote(sheetName)} but it was not found`,

  MISSING_COLUMN: ({ column }) => `Expected column ${quote(column)} was not found — don't rename, reorder or delete columns`,

  ROW_CAP_EXCEEDED: ({ cap }) =>
    `This file has more rows than the limit of ${cap}. Please split it into parts of up to ${cap} rows`,

  VALIDATION_EXPIRED: () => `This validation has expired. Please re-upload and validate the file again`,

  IMPORT_ALREADY_RUNNING: ({ entity }) =>
    `Another import for ${entity} is already in progress. Please wait for it to finish`,
};

module.exports = { messages };
