// Pure validator for the Categories sheet. No slug column — slug is always
// server-generated (via utils/slugHelper.js's generateUniqueSlug, called
// from the importer at creation/update time), the same "common logic" the
// manual ProductCategories admin screen uses for a blank slug.
//
// This sheet is create-OR-UPDATE (upsert), evaluated here on Categories
// only: a row identifies an existing category by the pair
// (parent_id, title) — not slug, which doesn't exist until creation, and
// not title alone, since title isn't unique in this schema.
// Matching is order-dependent because parent_title can point at another
// row in the same file: whether a row is a create or an update can depend
// on whether its parent (resolved earlier in this same pass) was itself a
// create or an update. A row whose parent is a pending CREATE can never
// match an existing category (nothing could already reference a parent
// that doesn't exist yet), so it's forced to "create" without even
// checking the identity key.
//
// Renaming is an accepted limitation: changing a row's title changes its
// identity key, so it creates a new category rather than updating the old
// one. Bulk upload is a population tool, not a bulk-editing tool — rename
// via the normal admin screen.

const { messages } = require("../messages");
const { isBlankRow, isExampleRow, trimOrUndefined, parseBoolean, parseInteger, lookupKey } = require("./shared");
const config = require("../config/categories.config");

const err = (rowNumber, column, code, params) => ({
  row: rowNumber,
  column,
  severity: "error",
  code,
  message: messages[code](params || {}),
});

const identityKey = (parentId, title) => `${parentId ?? "null"}:${lookupKey(title)}`;

// Every id below `rootId` in the EXISTING DB tree (children, grandchildren,
// ...), used to block a bulk-update from re-parenting a category under its
// own descendant. Same tree-walk as getDescendantIds() in
// productCategoryController.js, just synchronous since the whole
// (id, parent_id) set is already loaded.
const descendantsOf = (rootId, byParentId) => {
  const result = new Set();
  const stack = [rootId];
  while (stack.length) {
    const current = stack.pop();
    (byParentId.get(current) || []).forEach((childId) => {
      if (!result.has(childId)) {
        result.add(childId);
        stack.push(childId);
      }
    });
  }
  return result;
};

async function validateCategories(rows, { models, transaction }) {
  const errors = [];
  const warnings = [];
  const normalizedRows = [];

  const existingCategories = await models.ProductCategories.findAll({
    attributes: ["id", "title", "parent_id"],
    transaction,
  });

  // For resolving "what does this parent_title refer to" — unchanged from
  // before: a title ambiguous across existing categories can't be used as
  // a parent reference at all.
  const existingByTitleKey = new Map(); // title key -> { count, id }
  // For resolving "does this row already exist" (the upsert match key).
  const existingByIdentityKey = new Map(); // identityKey -> id
  // For the re-parenting cycle check.
  const existingByParentId = new Map(); // parent_id -> [child id, ...]

  existingCategories.forEach((c) => {
    const titleKeyEntry = existingByTitleKey.get(lookupKey(c.title)) || { count: 0, id: null };
    titleKeyEntry.count += 1;
    titleKeyEntry.id = titleKeyEntry.id ?? c.id;
    existingByTitleKey.set(lookupKey(c.title), titleKeyEntry);

    existingByIdentityKey.set(identityKey(c.parent_id, c.title), c.id);

    if (c.parent_id != null) {
      const list = existingByParentId.get(c.parent_id) || [];
      list.push(c.id);
      existingByParentId.set(c.parent_id, list);
    }
  });

  const liveRows = rows.filter((row) => !isExampleRow(row, config.columns[0].key) && !isBlankRow(row, config.columns));

  // Pass 1: per-field parsing/required checks + collect in-file titles, so
  // pass 2 can resolve parent_title against rows anywhere in the file.
  const byTitleKey = new Map(); // title key -> record (ambiguous if seen twice)
  const ambiguousTitleKeys = new Set();
  const parsed = [];

  liveRows.forEach((row) => {
    const rowNumber = row.__rowNumber;
    const rowErrors = [];

    const title = trimOrUndefined(row.title);
    if (!title) rowErrors.push(err(rowNumber, "title", "REQUIRED_FIELD", { column: "title" }));

    const parentTitleInput = trimOrUndefined(row.parent_title);

    const sortOrderResult = parseInteger(row.sort_order, { defaultValue: config.columns.find((c) => c.key === "sort_order").default, min: 1 });
    if (!sortOrderResult.ok) rowErrors.push(err(rowNumber, "sort_order", "INVALID_NUMBER", { column: "sort_order", value: row.sort_order }));

    const isActiveResult = parseBoolean(row.is_active, true);
    if (!isActiveResult.ok) rowErrors.push(err(rowNumber, "is_active", "INVALID_BOOLEAN", { column: "is_active", value: row.is_active }));

    const showInNavbarResult = parseBoolean(row.show_in_navbar, false);
    if (!showInNavbarResult.ok)
      rowErrors.push(err(rowNumber, "show_in_navbar", "INVALID_BOOLEAN", { column: "show_in_navbar", value: row.show_in_navbar }));

    // No _ar columns in this sheet — each Arabic field defaults to its
    // English counterpart (blank optional fields default to null either way,
    // matching no Arabic text).
    const description = trimOrUndefined(row.description) || null;
    const materialType = trimOrUndefined(row.material_type) || null;

    const record = {
      rowNumber,
      rowErrors,
      title,
      title_ar: title,
      parent_title_input: parentTitleInput,
      parent_title_key: parentTitleInput ? lookupKey(parentTitleInput) : null,
      description,
      description_ar: description,
      material_type: materialType,
      material_type_ar: materialType,
      sort_order: sortOrderResult.value,
      is_active: isActiveResult.value,
      show_in_navbar: showInNavbarResult.value,
    };

    if (title) {
      const key = lookupKey(title);
      if (byTitleKey.has(key)) ambiguousTitleKeys.add(key);
      else byTitleKey.set(key, record);
    }
    parsed.push(record);
  });

  // Pass 2: resolve parent_title (in-file row seen earlier, or existing DB
  // category), detect cycles, then — now that the real/pending parent is
  // known — decide create vs. update for this row itself.
  const seenTitleKeys = new Set();
  const seenIdentityKeys = new Map(); // identityKey -> rowNumber (duplicate-in-file guard)

  parsed.forEach((record) => {
    let resolvedParentId = null; // null = root
    let parentPending = false;

    if (record.parent_title_input) {
      const key = record.parent_title_key;
      if (ambiguousTitleKeys.has(key)) {
        record.rowErrors.push(
          err(record.rowNumber, "parent_title", "REF_NOT_FOUND", {
            column: "parent_title",
            value: `${record.parent_title_input} (matches more than one row in this file — titles must be unique to be used as a parent reference)`,
          }),
        );
      } else if (byTitleKey.has(key)) {
        const parentRecord = byTitleKey.get(key);
        if (parentRecord === record) {
          record.rowErrors.push(err(record.rowNumber, "parent_title", "PARENT_CYCLE", { value: record.parent_title_input }));
        } else if (!seenTitleKeys.has(key)) {
          // Parent is in this file but hasn't appeared yet — wrong order.
          record.rowErrors.push(
            err(record.rowNumber, "parent_title", "PARENT_NOT_ABOVE_CHILD", {
              column: "parent_title",
              value: record.parent_title_input,
            }),
          );
        } else if (parentRecord.mode === undefined) {
          // The referenced row itself failed validation (and so never got
          // a mode) — it can't be used as a parent reference.
          record.rowErrors.push(
            err(record.rowNumber, "parent_title", "REF_NOT_FOUND", {
              column: "parent_title",
              value: `${record.parent_title_input} (that row has its own errors — fix it first)`,
            }),
          );
        } else {
          record.parent_title_source = "file";
          if (parentRecord.mode === "create") {
            parentPending = true;
          } else {
            resolvedParentId = parentRecord.existingId;
          }
        }
      } else {
        const existingEntry = existingByTitleKey.get(key);
        if (!existingEntry) {
          record.rowErrors.push(
            err(record.rowNumber, "parent_title", "REF_NOT_FOUND", { column: "parent_title", value: record.parent_title_input }),
          );
        } else if (existingEntry.count > 1) {
          record.rowErrors.push(
            err(record.rowNumber, "parent_title", "REF_NOT_FOUND", {
              column: "parent_title",
              value: `${record.parent_title_input} (matches more than one existing category — titles aren't unique)`,
            }),
          );
        } else {
          record.parent_title_source = "db";
          resolvedParentId = existingEntry.id;
        }
      }
    }

    if (record.title) seenTitleKeys.add(lookupKey(record.title));

    if (!record.rowErrors.length) {
      if (parentPending) {
        // Parent doesn't exist yet in the DB, so this row can't possibly
        // match an existing category — it must be a create.
        record.mode = "create";
        record.existingId = null;
        record.resolved_parent_id = null; // filled in for real by the importer once the parent is actually created
      } else {
        const key = identityKey(resolvedParentId, record.title);
        if (seenIdentityKeys.has(key)) {
          record.rowErrors.push(
            err(record.rowNumber, "title", "DUPLICATE_IN_FILE", {
              column: "title",
              value: record.title,
              otherRow: seenIdentityKeys.get(key),
            }),
          );
        } else {
          seenIdentityKeys.set(key, record.rowNumber);
          const existingId = existingByIdentityKey.get(key) ?? null;
          record.mode = existingId ? "update" : "create";
          record.existingId = existingId;
          record.resolved_parent_id = resolvedParentId;

          if (existingId && resolvedParentId != null) {
            // Re-parenting: block moving a category under its own
            // descendant (or itself).
            if (resolvedParentId === existingId || descendantsOf(existingId, existingByParentId).has(resolvedParentId)) {
              record.rowErrors.push(
                err(record.rowNumber, "parent_title", "PARENT_CYCLE", { value: record.parent_title_input }),
              );
            }
          }
        }
      }
    }

    if (record.rowErrors.length) {
      errors.push(...record.rowErrors);
    } else {
      normalizedRows.push(record);
    }
  });

  return { errors, warnings, normalizedRows };
}

module.exports = { validateCategories };
