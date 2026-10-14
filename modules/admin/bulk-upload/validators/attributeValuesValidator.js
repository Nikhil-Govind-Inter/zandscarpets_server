// Attribute Values sheet — create-or-update (upsert), same pattern as
// Categories/Attributes. Required-fields-by-attribute-type is reused
// directly from AttributeValueController.missingForType (exported for this
// purpose) rather than re-derived from the spec's looser generic table.
// No slug column — slug is always server-generated at creation/update time
// (see importer.js), the same "common logic" the manual admin screen uses
// for a blank slug.
//
// Match key is `value` scoped per attribute, mirroring
// assertNoDuplicate(dataModel, {field:"value", scope:{attribute_id}}) in
// the manual controller — including that a blank value (icon-type rows)
// is never matched/duplicate-checked, same as there, so icon-type rows are
// always created, never updated. As with Categories/Attributes, changing a
// row's `value` (or its `attribute_title`) creates a new value rather than
// renaming the old one — rename via the normal admin screen.

const AttributeValueController = require("../../http/controllers/products/attributeValueController");
const { resolveMediaPath } = require("../resolvers");
const { messages } = require("../messages");
const {
  isBlankRow,
  isExampleRow,
  trimOrUndefined,
  parseBoolean,
  parseInteger,
  lookupKey,
} = require("./shared");
const config = require("../config/attributeValues.config");

const FIELD_TO_COLUMN = {
  value: "value",
  value_ar: "value_ar",
  media_path: "media_path",
  media_alt: "media_alt",
  media_alt_ar: "media_alt_ar",
  color_code: "color_code",
};

const err = (rowNumber, column, code, params) => ({
  row: rowNumber,
  column,
  severity: "error",
  code,
  message: messages[code](params || {}),
});

async function validateAttributeValues(rows, { models, transaction }) {
  const errors = [];
  const warnings = [];
  const normalizedRows = [];

  const attributes = await models.Attributes.findAll({ attributes: ["id", "title", "type"], transaction });
  const attributeByTitleKey = new Map(attributes.map((a) => [lookupKey(a.title), a]));

  const existingValues = await models.AttributeValues.findAll({ attributes: ["id", "attribute_id", "value"], transaction });
  const existingByKey = new Map(); // `${attribute_id}:${valueKey}` -> id
  existingValues.forEach((v) => {
    if (!v.value) return; // blank values are never matched/duplicate-checked (matches findDuplicate's behavior)
    existingByKey.set(`${v.attribute_id}:${lookupKey(v.value)}`, v.id);
  });

  const liveRows = rows.filter(
    (row) => !isExampleRow(row, config.columns[0].key) && !isBlankRow(row, config.columns),
  );

  const seenInFile = new Map(); // `${attribute_id}:${slugKey}` -> rowNumber

  liveRows.forEach((row) => {
    const rowNumber = row.__rowNumber;
    const rowErrors = [];

    const attributeTitle = trimOrUndefined(row.attribute_title);
    let attribute;
    if (!attributeTitle) {
      rowErrors.push(err(rowNumber, "attribute_title", "REQUIRED_FIELD", { column: "attribute_title" }));
    } else {
      attribute = attributeByTitleKey.get(lookupKey(attributeTitle));
      if (!attribute) {
        rowErrors.push(err(rowNumber, "attribute_title", "REF_NOT_FOUND", { column: "attribute_title", value: attributeTitle }));
      }
    }

    const value = trimOrUndefined(row.value);
    const mediaPath = trimOrUndefined(row.media_path);
    const mediaAlt = trimOrUndefined(row.media_alt);
    const colorCode = trimOrUndefined(row.color_code);
    // No value_ar/media_alt_ar columns in this sheet — each defaults to its
    // English counterpart, supplied before missingForType's required-field
    // check so that check never fires for these two.
    const valueAr = value || null;
    const mediaAltAr = mediaAlt || null;

    if (attribute) {
      const bodyForType = { value, value_ar: valueAr, media_path: mediaPath, media_alt: mediaAlt, media_alt_ar: mediaAltAr, color_code: colorCode };
      const missing = AttributeValueController.missingForType(attribute, bodyForType);
      missing.forEach((m) => {
        const column = FIELD_TO_COLUMN[m.path] || m.path;
        rowErrors.push(err(rowNumber, column, "REQUIRED_FIELD", { column }));
      });

      if (colorCode && !/^#[0-9A-Fa-f]{6}$/.test(colorCode)) {
        rowErrors.push(err(rowNumber, "color_code", "INVALID_COLOR_CODE", { value: colorCode }));
      }

      if (mediaPath) {
        const resolved = resolveMediaPath(mediaPath, "attribute-values");
        if (!resolved.ok) {
          rowErrors.push(err(rowNumber, "media_path", "MEDIA_NOT_FOUND", { column: "media_path", value: mediaPath }));
        }
      }
    }

    const sortOrderResult = parseInteger(row.sort_order, { defaultValue: 1, min: 1 });
    if (!sortOrderResult.ok) rowErrors.push(err(rowNumber, "sort_order", "INVALID_NUMBER", { column: "sort_order", value: row.sort_order }));

    const isActiveResult = parseBoolean(row.is_active, true);
    if (!isActiveResult.ok) rowErrors.push(err(rowNumber, "is_active", "INVALID_BOOLEAN", { column: "is_active", value: row.is_active }));

    // Match key is `value` scoped per attribute — only resolvable once the
    // attribute itself resolved, and only when a value was actually given
    // (blank values, e.g. icon-type rows, are never matched, so those rows
    // are always created).
    let mode;
    let existingId = null;
    if (attribute && value) {
      const key = `${attribute.id}:${lookupKey(value)}`;
      if (seenInFile.has(key)) {
        rowErrors.push(
          err(rowNumber, "value", "DUPLICATE_IN_FILE", { column: "value", value, otherRow: seenInFile.get(key) }),
        );
      } else {
        seenInFile.set(key, rowNumber);
        existingId = existingByKey.get(key) ?? null;
        mode = existingId ? "update" : "create";
      }
    } else if (attribute) {
      mode = "create"; // blank value (icon-type) — never matched, always created
    }

    if (rowErrors.length) {
      errors.push(...rowErrors);
      return;
    }

    normalizedRows.push({
      rowNumber,
      mode,
      existingId,
      attribute_id: attribute.id,
      value: value || null,
      value_ar: valueAr || null,
      media_path: mediaPath || null,
      media_alt: mediaAlt || null,
      media_alt_ar: mediaAltAr || null,
      color_code: colorCode || null,
      sort_order: sortOrderResult.value,
      is_active: isActiveResult.value,
    });
  });

  return { errors, warnings, normalizedRows };
}

module.exports = { validateAttributeValues };
