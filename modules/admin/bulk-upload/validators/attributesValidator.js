// Attributes sheet — create-or-update (upsert), same pattern as Categories.
// Title uniqueness is GLOBAL, not scoped — confirmed in
// modules/admin/http/controllers/products/attributeController.js (unlike
// AttributeValues, which is scoped per attribute). Title is therefore the
// whole match key: a row whose title matches an existing attribute updates
// it; otherwise it's created. As with Categories, changing a row's title
// creates a new attribute rather than renaming the old one — rename via
// the normal admin screen.

const { messages } = require("../messages");
const {
  isBlankRow,
  isExampleRow,
  trimOrUndefined,
  parseBoolean,
  parseInteger,
  lookupKey,
} = require("./shared");
const config = require("../config/attributes.config");

const ALLOWED_TYPES = ["text", "icon", "color"];

const err = (rowNumber, column, code, params) => ({
  row: rowNumber,
  column,
  severity: "error",
  code,
  message: messages[code](params || {}),
});

async function validateAttributes(rows, { models, transaction }) {
  const errors = [];
  const warnings = [];
  const normalizedRows = [];

  const existing = await models.Attributes.findAll({ attributes: ["id", "title"], transaction });
  const existingByTitleKey = new Map(existing.map((a) => [lookupKey(a.title), a.id]));

  const liveRows = rows.filter(
    (row) => !isExampleRow(row, config.columns[0].key) && !isBlankRow(row, config.columns),
  );

  const seenTitleKeys = new Map(); // title key -> rowNumber (duplicate-in-file guard)

  liveRows.forEach((row) => {
    const rowNumber = row.__rowNumber;
    const rowErrors = [];

    const title = trimOrUndefined(row.title);
    let mode;
    let existingId = null;
    if (!title) {
      rowErrors.push(err(rowNumber, "title", "REQUIRED_FIELD", { column: "title" }));
    } else {
      const key = lookupKey(title);
      if (seenTitleKeys.has(key)) {
        rowErrors.push(
          err(rowNumber, "title", "DUPLICATE_IN_FILE", {
            column: "title",
            value: title,
            otherRow: seenTitleKeys.get(key),
          }),
        );
      } else {
        seenTitleKeys.set(key, rowNumber);
        existingId = existingByTitleKey.get(key) ?? null;
        mode = existingId ? "update" : "create";
      }
    }

    const type = trimOrUndefined(row.type);
    if (!type) {
      rowErrors.push(err(rowNumber, "type", "REQUIRED_FIELD", { column: "type" }));
    } else if (!ALLOWED_TYPES.includes(type.toLowerCase())) {
      rowErrors.push(err(rowNumber, "type", "INVALID_ENUM", { column: "type", value: type, allowed: ALLOWED_TYPES }));
    }

    const sortOrderResult = parseInteger(row.sort_order, { defaultValue: 1, min: 1 });
    if (!sortOrderResult.ok) rowErrors.push(err(rowNumber, "sort_order", "INVALID_NUMBER", { column: "sort_order", value: row.sort_order }));

    const isActiveResult = parseBoolean(row.is_active, true);
    if (!isActiveResult.ok) rowErrors.push(err(rowNumber, "is_active", "INVALID_BOOLEAN", { column: "is_active", value: row.is_active }));

    if (rowErrors.length) {
      errors.push(...rowErrors);
      return;
    }

    normalizedRows.push({
      rowNumber,
      mode,
      existingId,
      title,
      title_ar: title, // no title_ar column in this sheet — defaults to title
      type: type.toLowerCase(),
      sort_order: sortOrderResult.value,
      is_active: isActiveResult.value,
    });
  });

  return { errors, warnings, normalizedRows };
}

module.exports = { validateAttributes };
