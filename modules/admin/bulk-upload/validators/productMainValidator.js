// Product Main Upload — one row spans Category (levels) -> Attribute(s) ->
// Attribute Value(s) -> Product -> its SEO meta data, auto-creating
// whichever of those don't already exist. This generalizes the "pending
// parent forces create" technique from categoriesValidator.js: within one
// row, once any category level is new (not yet in the DB), every deeper
// level — and the product itself — must also be new, since nothing could
// already reference something that doesn't exist yet. Internally this uses
// synthetic negative-int placeholder ids, scoped to a single
// validateProductMain() call, purely so later rows/segments in the *same*
// file correctly reuse a chain/attribute/value another row in this file is
// also creating. Those placeholders never leave this function —
// normalizedRows carries only raw fields (category_segments,
// attribute_value_groups), and importer.js re-derives create-vs-reuse for
// real at commit time with its own fresh DB-backed walk, the same
// relationship every other upsert validator/importer pair already has.
//
// Product match key and required fields are identical in spirit to
// productsValidator.js / metaDataController.js — see those files for why
// (meta_title/meta_description/meta_keywords required, _ar variants
// optional, mirroring metaDataRequest.js exactly). No image/sort_order/
// is_active columns on this sheet (v7) — every row gets
// main_media_path/list_media_path: null, sort_order: 0, is_active: true;
// an image is added afterward via the product's edit screen.
//
// v12: unlike the other bulk-upload sheets, this one DOES have _ar columns
// (title_ar/short_description_ar/product_description_ar/meta_title_ar/
// meta_description_ar/meta_keywords_ar) — each optional, defaulting to its
// English counterpart when left blank, same fallback the other sheets
// always apply unconditionally.
//
// Category (v7): 3 plain columns — Category, Sub-Category 1,
// Sub-Category 2 — instead of one ">"-separated category_path column. A
// deeper column filled in while a shallower one is blank is rejected
// (CATEGORY_LEVEL_GAP). The non-blank columns in order become
// categorySegments, feeding the same pending-placeholder "force create"
// logic as before.
//
// Attributes (v7): 2 plain columns, paired by position — "Attributes"
// lists attribute names separated by ";"; "Values for Each Attribute"
// lists one value-group per attribute in the same order, also separated
// by ";", with multiple values for one attribute comma-separated within
// its group, e.g. "Size;Color" / "120cm,140cm;Oak|#8B5A2B,Black|#000000".
// There's no has_attributes/generate_variants gate anymore: whether a
// product gets attributes is simply whether these two columns are filled
// in, and variants are *always* generated (every combination, cartesian
// product) whenever there's attribute data on a create row — a single
// attribute with a single value still produces exactly one variant. A
// brand-new Attribute is created as type "text", unless the FIRST value
// (across the whole group) that introduces it carries a hex suffix, in
// which case it's created as type "color" with that color_code (a
// brand-new attribute is therefore never "icon" — there's no inline way to
// signal that from this sheet). An EXISTING attribute keeps its real type,
// and every type auto-creates a missing value from plain text alone — the
// value text becomes the value's `value`/`value_ar`: for text that's the
// value itself; for color it's the color's name, with color_code set from
// a hex suffix if one was given, left null otherwise; for icon it's a
// name/label, with media_path/media_alt left blank. Any hex/media left
// blank this way is filled in later via the Attribute Values edit screen —
// nothing here requires it up front, unlike the dedicated Attribute Values
// sheet (which still enforces the real missingForType() rules). A stray
// |#RRGGBB on a non-color ref is ignored with a warning. A repeated
// attribute name within one row, or a repeated value within one
// attribute's group, is an error (DUPLICATE_ATTRIBUTE_IN_ROW /
// DUPLICATE_VALUE_IN_GROUP) — not silently de-duped. Total combination
// count over MAX_VARIANT_COMBINATIONS is a non-blocking warning (v11; was
// a hard error) — see importer.js for where variants actually get created
// (validate-time only computes the count).
//
// v11 also added: placeholder text ("if any" etc.) in Sub-Category 1/2 is
// auto-treated as blank (PLACEHOLDER_TEXT_IGNORED warning), and the same
// `title` appearing more than once in the file under different categories
// gets a non-blocking DUPLICATE_TITLE_IN_SHEET warning (the stricter
// same-category case is still the hard DUPLICATE_IN_FILE error below).
//
// Features/Tags/Specifications (v8 added Tags/Specifications, v9 added
// Features): plain comma-separated label names, attached to the shared
// ProductLabels master (CLAUDE.md §2 — features/tags/specifications,
// discriminated by `type`), auto-created if missing, scoped to their own
// type so the same name can independently exist as a feature, a tag, and
// a specification. Applies on create only, like attributes — see
// importer.js for the actual attach step, which (unlike every other join
// here) has no explicit join model to bulkCreate into, so it uses the
// Sequelize association mixin `addLabels()` instead,
// mirroring the real manual controller's own `item.setLabels(...)`.

const { messages } = require("../messages");
const { isBlankRow, isExampleRow, trimOrUndefined, lookupKey } = require("./shared");
const config = require("../config/productMain.config");

const MAX_VARIANT_COMBINATIONS = 100;

// Guards against a copied-forward example row creating a real category
// literally named "if any" — treated as blank, not as real input.
const PLACEHOLDER_CATEGORY_TEXTS = new Set(["if any", "n/a", "na", "none", "-", "nil"]);
const stripPlaceholder = (value) => {
  if (!value) return { value, wasPlaceholder: false };
  if (PLACEHOLDER_CATEGORY_TEXTS.has(value.toLowerCase().trim())) {
    return { value: undefined, wasPlaceholder: true, original: value };
  }
  return { value, wasPlaceholder: false };
};

const err = (rowNumber, column, code, params) => ({
  row: rowNumber,
  column,
  severity: "error",
  code,
  message: messages[code](params || {}),
});

const warn = (rowNumber, column, code, params) => ({
  row: rowNumber,
  column,
  severity: "warning",
  code,
  message: messages[code](params || {}),
});

async function validateProductMain(rows, { models, transaction }) {
  const errors = [];
  const warnings = [];
  const normalizedRows = [];

  const existingCategories = await models.ProductCategories.findAll({
    attributes: ["id", "title", "parent_id"],
    transaction,
  });
  // `(parent_id-or-placeholder, titleKey) -> real id` seeded from the DB;
  // gains placeholder entries (negative ints) as this pass discovers rows
  // that need new categories, shared across every row in this file so a
  // second row referencing the same new chain reuses it.
  const categoryIndex = new Map();
  existingCategories.forEach((c) => {
    categoryIndex.set(`${c.parent_id ?? "null"}:${lookupKey(c.title)}`, c.id);
  });

  const existingAttributes = await models.Attributes.findAll({ attributes: ["id", "title", "type"], transaction });
  const attributeIndex = new Map(); // titleKey -> { id, type }
  existingAttributes.forEach((a) => attributeIndex.set(lookupKey(a.title), { id: a.id, type: a.type }));

  const existingValues = await models.AttributeValues.findAll({ attributes: ["id", "attribute_id", "value"], transaction });
  const attributeTitleById = new Map(existingAttributes.map((a) => [a.id, lookupKey(a.title)]));
  const valueIndex = new Map(); // `${attributeTitleKey}:${valueKey}` -> id
  existingValues.forEach((v) => {
    const attrTitleKey = attributeTitleById.get(v.attribute_id);
    if (!attrTitleKey || !v.value) return;
    valueIndex.set(`${attrTitleKey}:${lookupKey(v.value)}`, v.id);
  });

  const existingLabels = await models.ProductLabels.findAll({ attributes: ["id", "title", "type"], transaction });
  const labelIndex = new Map(); // `${type}:${titleKey}` -> id (real or placeholder)
  existingLabels.forEach((l) => labelIndex.set(`${l.type}:${lookupKey(l.title)}`, l.id));

  const existingProducts = await models.Products.findAll({ attributes: ["id", "title", "product_category_id"], transaction });
  const productIndex = new Map(); // `${category_id}:${titleKey}` -> id
  existingProducts.forEach((p) => productIndex.set(`${p.product_category_id}:${lookupKey(p.title)}`, p.id));

  const liveRows = rows.filter((row) => !isExampleRow(row, config.columns[0].key) && !isBlankRow(row, config.columns));

  let nextPlaceholder = -1;
  const seenProductPathKeys = new Map(); // `${pathString}:${titleKey}` -> rowNumber
  const seenTitleKeysAnyCategory = new Map(); // titleKey -> rowNumber, regardless of category

  liveRows.forEach((row) => {
    const rowNumber = row.__rowNumber;
    const rowErrors = [];
    const rowWarnings = [];

    const title = trimOrUndefined(row.title);
    if (!title) rowErrors.push(err(rowNumber, "title", "REQUIRED_FIELD", { column: "title" }));

    const shortDescription = trimOrUndefined(row.short_description);
    if (!shortDescription) rowErrors.push(err(rowNumber, "short_description", "REQUIRED_FIELD", { column: "short_description" }));

    const productDescription = trimOrUndefined(row.product_description);
    if (!productDescription) rowErrors.push(err(rowNumber, "product_description", "REQUIRED_FIELD", { column: "product_description" }));

    // title_ar/short_description_ar/product_description_ar are optional —
    // a blank one defaults to its English counterpart.
    const titleAr = trimOrUndefined(row.title_ar) || title;
    const shortDescriptionAr = trimOrUndefined(row.short_description_ar) || shortDescription;
    const productDescriptionAr = trimOrUndefined(row.product_description_ar) || productDescription;

    const metaTitle = trimOrUndefined(row.meta_title);
    if (!metaTitle) rowErrors.push(err(rowNumber, "meta_title", "REQUIRED_FIELD", { column: "meta_title" }));

    const metaDescription = trimOrUndefined(row.meta_description);
    if (!metaDescription) rowErrors.push(err(rowNumber, "meta_description", "REQUIRED_FIELD", { column: "meta_description" }));

    const metaKeywords = trimOrUndefined(row.meta_keywords);
    if (!metaKeywords) rowErrors.push(err(rowNumber, "meta_keywords", "REQUIRED_FIELD", { column: "meta_keywords" }));

    // meta_*_ar are optional — a blank one defaults to its English
    // counterpart (MetaData's *_ar columns are nullable, but mirroring is
    // more useful than leaving them blank).
    const metaTitleAr = trimOrUndefined(row.meta_title_ar) || metaTitle || null;
    const metaDescriptionAr = trimOrUndefined(row.meta_description_ar) || metaDescription || null;
    const metaKeywordsAr = trimOrUndefined(row.meta_keywords_ar) || metaKeywords || null;

    // Category: 3 plain columns instead of one ">"-separated path. A
    // deeper column filled in while a shallower one is blank is rejected.
    const category = trimOrUndefined(row.category);
    if (!category) rowErrors.push(err(rowNumber, "category", "REQUIRED_FIELD", { column: "Category" }));

    const subCategory1Raw = stripPlaceholder(trimOrUndefined(row.sub_category_1));
    if (subCategory1Raw.wasPlaceholder) {
      rowWarnings.push(warn(rowNumber, "sub_category_1", "PLACEHOLDER_TEXT_IGNORED", { column: "Sub-Category 1", value: subCategory1Raw.original }));
    }
    const subCategory1 = subCategory1Raw.value;

    const subCategory2Raw = stripPlaceholder(trimOrUndefined(row.sub_category_2));
    if (subCategory2Raw.wasPlaceholder) {
      rowWarnings.push(warn(rowNumber, "sub_category_2", "PLACEHOLDER_TEXT_IGNORED", { column: "Sub-Category 2", value: subCategory2Raw.original }));
    }
    const subCategory2 = subCategory2Raw.value;

    if (subCategory2 && !subCategory1) {
      rowErrors.push(err(rowNumber, "sub_category_2", "CATEGORY_LEVEL_GAP", { column: "Sub-Category 2", previousColumn: "Sub-Category 1" }));
    }

    // Walk the category levels, resolving/creating each in order. Once any
    // level is new, every deeper level — and the product — is forced new
    // too (nothing could already reference a not-yet-existing parent).
    const categorySegments = [];
    let finalCategoryKeyId; // real id, placeholder (negative int), or undefined on error
    if (category) {
      const rawSegments = [category, subCategory1, subCategory2].filter(Boolean);
      let parentId = null; // null = root
      let pending = false;
      rawSegments.forEach((segment) => {
        categorySegments.push(segment);
        const key = `${parentId ?? "null"}:${lookupKey(segment)}`;
        if (!pending && categoryIndex.has(key)) {
          parentId = categoryIndex.get(key); // real id or an earlier row's placeholder
          if (parentId < 0) pending = true; // chain continues on top of another new row's pending category
        } else {
          const placeholder = nextPlaceholder--;
          categoryIndex.set(key, placeholder);
          parentId = placeholder;
          pending = true;
        }
      });
      finalCategoryKeyId = parentId;
    }

    // Product match key — only resolvable once the category chain
    // resolved. A pending (not-yet-real) category forces a create, same
    // logic as Categories'/Products' own pending-parent handling.
    let mode;
    let existingId = null;
    if (finalCategoryKeyId !== undefined && title) {
      const pathKey = `${categorySegments.map(lookupKey).join(">")}:${lookupKey(title)}`;
      if (seenProductPathKeys.has(pathKey)) {
        rowErrors.push(err(rowNumber, "title", "DUPLICATE_IN_FILE", { column: "title", value: title, otherRow: seenProductPathKeys.get(pathKey) }));
      } else {
        seenProductPathKeys.set(pathKey, rowNumber);

        // Same title under a DIFFERENT category — softer than the
        // same-(category,title) case above, which is already a hard
        // error; this is just a heads-up in case it's a mistake.
        const titleKey = lookupKey(title);
        if (seenTitleKeysAnyCategory.has(titleKey)) {
          rowWarnings.push(warn(rowNumber, "title", "DUPLICATE_TITLE_IN_SHEET", { value: title, otherRow: seenTitleKeysAnyCategory.get(titleKey) }));
        } else {
          seenTitleKeysAnyCategory.set(titleKey, rowNumber);
        }

        if (finalCategoryKeyId < 0) {
          mode = "create";
        } else {
          const productKey = `${finalCategoryKeyId}:${lookupKey(title)}`;
          existingId = productIndex.get(productKey) ?? null;
          mode = existingId ? "update" : "create";
        }
      }
    }

    // Attributes: 2 plain columns paired by position, only on create — an
    // update never touches product_attributes, same rule as
    // productsValidator.js (no Product Variant orphaning risk). Whether a
    // product gets attributes is simply whether these columns are filled
    // in; variants are always generated from whatever's listed.
    const attributeNamesInput = trimOrUndefined(row.attribute_names);
    const attributeValuesInput = trimOrUndefined(row.attribute_values);
    const attributeValueGroups = []; // [{ attributeTitle, items: [{ valueText, colorCode }] }]

    if (mode === "update") {
      if (attributeNamesInput || attributeValuesInput) {
        rowWarnings.push(warn(rowNumber, "attribute_names", "ATTRIBUTES_IGNORED_ON_UPDATE"));
      }
    } else if (attributeNamesInput && !attributeValuesInput) {
      rowErrors.push(
        err(rowNumber, "attribute_values", "ATTRIBUTE_COLUMN_ONE_SIDED", {
          filledColumn: "Attributes",
          blankColumn: "Values for Each Attribute",
        }),
      );
    } else if (!attributeNamesInput && attributeValuesInput) {
      rowErrors.push(
        err(rowNumber, "attribute_names", "ATTRIBUTE_COLUMN_ONE_SIDED", {
          filledColumn: "Values for Each Attribute",
          blankColumn: "Attributes",
        }),
      );
    } else if (attributeNamesInput && attributeValuesInput) {
      const nameSegments = attributeNamesInput.split(";").map((s) => s.trim());
      const valueSegments = attributeValuesInput.split(";").map((s) => s.trim());

      if (nameSegments.length !== valueSegments.length) {
        rowErrors.push(
          err(rowNumber, "attribute_values", "ATTRIBUTE_COLUMN_COUNT_MISMATCH", {
            namesCount: nameSegments.length,
            valuesCount: valueSegments.length,
          }),
        );
      } else {
        const seenAttrKeys = new Set();
        nameSegments.forEach((attributeTitle, index) => {
          const rawValueList = valueSegments[index];
          if (!attributeTitle && !rawValueList) return; // tolerate a stray trailing ;
          if (!attributeTitle || !rawValueList) {
            rowErrors.push(
              err(rowNumber, attributeTitle ? "attribute_values" : "attribute_names", "ATTRIBUTE_COLUMN_ONE_SIDED", {
                filledColumn: attributeTitle ? "Attributes" : "Values for Each Attribute",
                blankColumn: attributeTitle ? "Values for Each Attribute" : "Attributes",
              }),
            );
            return;
          }

          const attrKey = lookupKey(attributeTitle);
          if (seenAttrKeys.has(attrKey)) {
            rowErrors.push(err(rowNumber, "attribute_names", "DUPLICATE_ATTRIBUTE_IN_ROW", { attributeTitle }));
            return;
          }
          seenAttrKeys.add(attrKey);

          const rawItems = rawValueList
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

          // Parse every "Value" or "Value|#RRGGBB" item first, so a brand-new
          // attribute's type can be decided from whichever item in the whole
          // group carries the first hex, before any per-item lookups run.
          const parsedItems = [];
          let formatError = false;
          rawItems.forEach((rawItem) => {
            let valueText = rawItem;
            let colorCode = null;
            const pipeIndex = rawItem.indexOf("|");
            if (pipeIndex !== -1) {
              valueText = rawItem.slice(0, pipeIndex).trim();
              colorCode = rawItem.slice(pipeIndex + 1).trim();
              if (!/^#[0-9A-Fa-f]{6}$/.test(colorCode)) {
                rowErrors.push(err(rowNumber, "attribute_values", "INVALID_COLOR_CODE", { value: colorCode }));
                formatError = true;
                return;
              }
            }
            parsedItems.push({ valueText, colorCode });
          });
          if (formatError) return;

          const seenValueKeys = new Set();
          let duplicateValueError = false;
          parsedItems.forEach((item) => {
            const key = lookupKey(item.valueText);
            if (seenValueKeys.has(key)) {
              rowErrors.push(err(rowNumber, "attribute_values", "DUPLICATE_VALUE_IN_GROUP", { attributeTitle, value: item.valueText }));
              duplicateValueError = true;
              return;
            }
            seenValueKeys.add(key);
          });
          if (duplicateValueError) return;
          const dedupedItems = parsedItems;

          let attribute = attributeIndex.get(attrKey);
          if (!attribute) {
            // A brand-new attribute's type is decided by whether ANY item in
            // this group carries a hex: a suffix means "color", none means
            // "text".
            const firstHexItem = dedupedItems.find((item) => item.colorCode);
            attribute = { id: nextPlaceholder--, type: firstHexItem ? "color" : "text" };
            attributeIndex.set(attrKey, attribute);
          }

          // Every type (text/color/icon) auto-creates a missing value from
          // plain text alone here — the value text becomes
          // `value`/`value_ar`. A color value's hex (color_code) and an
          // icon value's media are both optional at this point, filled in
          // later via the Attribute Values edit screen; a stray hex on a
          // non-color ref is ignored with a warning (only color uses
          // color_code).
          dedupedItems.forEach(({ valueText, colorCode }) => {
            if (colorCode && attribute.type !== "color") {
              rowWarnings.push(warn(rowNumber, "attribute_values", "COLOR_CODE_IGNORED", { attributeTitle, attributeType: attribute.type }));
            }

            const valueKey = `${attrKey}:${lookupKey(valueText)}`;
            if (!valueIndex.has(valueKey)) {
              valueIndex.set(valueKey, nextPlaceholder--);
            }
          });

          attributeValueGroups.push({ attributeTitle, items: dedupedItems });
        });

        if (!rowErrors.length && attributeValueGroups.length) {
          const combinationCount = attributeValueGroups.reduce((total, group) => total * group.items.length, 1);
          if (combinationCount > MAX_VARIANT_COMBINATIONS) {
            rowWarnings.push(
              warn(rowNumber, "attribute_values", "TOO_MANY_VARIANT_COMBINATIONS", {
                count: combinationCount,
                max: MAX_VARIANT_COMBINATIONS,
              }),
            );
          }
        }
      }
    }

    // Features/Tags/Specifications: plain comma-separated label names,
    // scoped to their own type (so "New" can exist as a feature, a tag,
    // and a specification independently) — auto-created like every other
    // entity in this sheet, applied on create only (same reasoning as
    // attributes: this sheet never edits an existing product's relations).
    const featuresInput = trimOrUndefined(row.features);
    const tagsInput = trimOrUndefined(row.tags);
    const specificationsInput = trimOrUndefined(row.specifications);
    const labelRefs = []; // [{ title, type }]

    if (mode === "update") {
      if (featuresInput || tagsInput || specificationsInput) rowWarnings.push(warn(rowNumber, "features", "LABELS_IGNORED_ON_UPDATE"));
    } else {
      [
        { input: featuresInput, type: "feature" },
        { input: tagsInput, type: "tag" },
        { input: specificationsInput, type: "specification" },
      ].forEach(({ input, type }) => {
        if (!input) return;
        const names = input
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        const seenTitleKeys = new Set();
        names.forEach((title) => {
          const titleKey = lookupKey(title);
          if (seenTitleKeys.has(titleKey)) return; // same name twice in one cell — first wins
          seenTitleKeys.add(titleKey);

          const labelKey = `${type}:${titleKey}`;
          if (!labelIndex.has(labelKey)) {
            labelIndex.set(labelKey, nextPlaceholder--);
          }
          labelRefs.push({ title, type });
        });
      });
    }

    if (rowErrors.length) {
      errors.push(...rowErrors);
      return;
    }

    warnings.push(...rowWarnings);

    normalizedRows.push({
      rowNumber,
      category_segments: categorySegments,
      attribute_value_groups: attributeValueGroups,
      generate_variants: mode !== "update" && attributeValueGroups.length > 0,
      label_refs: labelRefs,
      mode,
      existingId,
      title,
      title_ar: titleAr,
      short_description: shortDescription,
      short_description_ar: shortDescriptionAr,
      product_description: productDescription,
      product_description_ar: productDescriptionAr,
      main_media_path: null,
      list_media_path: null,
      meta_title: metaTitle,
      meta_title_ar: metaTitleAr,
      meta_description: metaDescription,
      meta_description_ar: metaDescriptionAr,
      meta_keywords: metaKeywords,
      meta_keywords_ar: metaKeywordsAr,
      sort_order: 0,
      is_active: true,
    });
  });

  return { errors, warnings, normalizedRows };
}

module.exports = { validateProductMain };
