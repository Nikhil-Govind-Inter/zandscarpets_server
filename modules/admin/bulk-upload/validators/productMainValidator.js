// Product Main Upload — one row spans Category (path) -> Attribute(s) ->
// Attribute Value(s) -> Product -> its SEO meta data, auto-creating
// whichever of those don't already exist. This generalizes the "pending
// parent forces create" technique from categoriesValidator.js: within one
// row, once any step in the category_path is new (not yet in the DB),
// every deeper step — and the product itself — must also be new, since
// nothing could already reference something that doesn't exist yet.
// Internally this uses synthetic negative-int placeholder ids, scoped to a
// single validateProductMain() call, purely so later rows/segments in the
// *same* file correctly reuse a chain/attribute/value another row in this
// file is also creating. Those placeholders never leave this function —
// normalizedRows carries only raw fields (category_segments,
// attribute_value_pairs), and importer.js re-derives create-vs-reuse for
// real at commit time with its own fresh DB-backed walk, the same
// relationship every other upsert validator/importer pair already has.
//
// Product match key, required fields, image handling and SEO meta are
// identical in spirit to productsValidator.js / metaDataController.js —
// see those files for why (meta_title/meta_description/meta_keywords
// required, _ar variants optional, mirroring metaDataRequest.js exactly).
//
// attribute_value_refs: "Attribute=Value" pairs, one or more comma-
// separated values per attribute (e.g. "Size=120cm,140cm"), optionally
// "Value|#RRGGBB" per value for a color value. A brand-new Attribute is
// created as type "text", unless the FIRST value (across the whole group)
// that introduces it carries a hex suffix, in which case it's created as
// type "color" with that color_code (a brand-new attribute is therefore
// never "icon" — there's no inline way to signal that from this sheet).
//
// An EXISTING attribute keeps its real type, and every type auto-creates a
// missing value from plain text alone — the ref text becomes the value's
// `value`/`value_ar`: for text that's the value itself; for color it's the
// color's name, with color_code set from a hex suffix if one was given,
// left null otherwise; for icon it's a name/label, with media_path/
// media_alt left blank. Any hex/media left blank this way is filled in
// later via the Attribute Values edit screen — nothing here requires it
// up front, unlike the dedicated Attribute Values sheet (which still
// enforces the real missingForType() rules). A stray |#RRGGBB on a
// non-color ref is ignored with a warning.
//
// generate_variants (TRUE/FALSE, default FALSE): when TRUE, every
// combination across all attributes' value-lists (cartesian product) is
// generated as a real variant for the new product — see importer.js for
// where that actually happens (validate-time only computes the count, to
// enforce MAX_VARIANT_COMBINATIONS, and never creates anything).

const { resolveMediaPath } = require("../resolvers");
const { messages } = require("../messages");
const { isBlankRow, isExampleRow, trimOrUndefined, parseBoolean, parseInteger, lookupKey } = require("./shared");
const config = require("../config/productMain.config");

const MAX_VARIANT_COMBINATIONS = 200;

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

  const industries = await models.Industry.findAll({ attributes: ["id", "slug"], transaction });
  const industryBySlugKey = new Map(industries.map((i) => [lookupKey(i.slug), i.id]));

  const existingCategories = await models.ProductCategories.findAll({
    attributes: ["id", "title", "industry_id", "parent_id"],
    transaction,
  });
  // `(industry_id, parent_id-or-placeholder, titleKey) -> real id` seeded
  // from the DB; gains placeholder entries (negative ints) as this pass
  // discovers rows that need new categories, shared across every row in
  // this file so a second row referencing the same new chain reuses it.
  const categoryIndex = new Map();
  existingCategories.forEach((c) => {
    categoryIndex.set(`${c.industry_id}:${c.parent_id ?? "null"}:${lookupKey(c.title)}`, c.id);
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

  const existingProducts = await models.Products.findAll({ attributes: ["id", "title", "product_category_id"], transaction });
  const productIndex = new Map(); // `${category_id}:${titleKey}` -> id
  existingProducts.forEach((p) => productIndex.set(`${p.product_category_id}:${lookupKey(p.title)}`, p.id));

  const liveRows = rows.filter((row) => !isExampleRow(row, config.columns[0].key) && !isBlankRow(row, config.columns));

  let nextPlaceholder = -1;
  const seenProductPathKeys = new Map(); // `${industry}:${pathString}:${titleKey}` -> rowNumber

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

    // No _ar columns in this sheet — each Arabic field defaults to its
    // English counterpart.
    const titleAr = title;
    const shortDescriptionAr = shortDescription;
    const productDescriptionAr = productDescription;

    const mainImage = trimOrUndefined(row.main_image);
    if (!mainImage) {
      rowErrors.push(err(rowNumber, "main_image", "REQUIRED_FIELD", { column: "main_image" }));
    } else {
      const resolved = resolveMediaPath(mainImage, "products");
      if (!resolved.ok) rowErrors.push(err(rowNumber, "main_image", "MEDIA_NOT_FOUND", { column: "main_image", value: mainImage }));
    }

    const listImage = trimOrUndefined(row.list_image);
    if (!listImage) {
      rowWarnings.push(warn(rowNumber, "list_image", "LIST_IMAGE_FALLBACK"));
    } else {
      const resolved = resolveMediaPath(listImage, "products");
      if (!resolved.ok) rowErrors.push(err(rowNumber, "list_image", "MEDIA_NOT_FOUND", { column: "list_image", value: listImage }));
    }

    const metaTitle = trimOrUndefined(row.meta_title);
    if (!metaTitle) rowErrors.push(err(rowNumber, "meta_title", "REQUIRED_FIELD", { column: "meta_title" }));

    const metaDescription = trimOrUndefined(row.meta_description);
    if (!metaDescription) rowErrors.push(err(rowNumber, "meta_description", "REQUIRED_FIELD", { column: "meta_description" }));

    const metaKeywords = trimOrUndefined(row.meta_keywords);
    if (!metaKeywords) rowErrors.push(err(rowNumber, "meta_keywords", "REQUIRED_FIELD", { column: "meta_keywords" }));

    // No meta_*_ar columns in this sheet — each defaults to its English
    // counterpart (MetaData's *_ar columns are nullable, but mirroring is
    // more useful than leaving them blank).
    const metaTitleAr = metaTitle || null;
    const metaDescriptionAr = metaDescription || null;
    const metaKeywordsAr = metaKeywords || null;

    const sortOrderResult = parseInteger(row.sort_order, { defaultValue: 0, min: 0 });
    if (!sortOrderResult.ok) rowErrors.push(err(rowNumber, "sort_order", "INVALID_NUMBER", { column: "sort_order", value: row.sort_order }));

    const isActiveResult = parseBoolean(row.is_active, true);
    if (!isActiveResult.ok) rowErrors.push(err(rowNumber, "is_active", "INVALID_BOOLEAN", { column: "is_active", value: row.is_active }));

    const hasAttributesResult = parseBoolean(row.has_attributes, false);
    if (!hasAttributesResult.ok)
      rowErrors.push(err(rowNumber, "has_attributes", "INVALID_BOOLEAN", { column: "has_attributes", value: row.has_attributes }));

    const industrySlugInput = trimOrUndefined(row.industry_slug);
    let industryId;
    if (!industrySlugInput) {
      rowErrors.push(err(rowNumber, "industry_slug", "REQUIRED_FIELD", { column: "industry_slug" }));
    } else {
      industryId = industryBySlugKey.get(lookupKey(industrySlugInput));
      if (!industryId) {
        rowErrors.push(err(rowNumber, "industry_slug", "REF_NOT_FOUND", { column: "industry_slug", value: industrySlugInput }));
      }
    }

    // Walk the category path, resolving/creating each level in order. Once
    // any level is new, every deeper level — and the product — is forced
    // new too (nothing could already reference a not-yet-existing parent).
    const pathInput = trimOrUndefined(row.category_path);
    const categorySegments = [];
    let finalCategoryKeyId; // real id, placeholder (negative int), or undefined on error
    if (!pathInput) {
      rowErrors.push(err(rowNumber, "category_path", "REQUIRED_FIELD", { column: "category_path" }));
    } else {
      const rawSegments = pathInput.split(">").map((s) => s.trim());
      if (rawSegments.some((s) => !s)) {
        rowErrors.push(err(rowNumber, "category_path", "INVALID_CATEGORY_PATH", { value: pathInput }));
      } else if (industryId !== undefined) {
        let parentId = null; // null = root
        let pending = false;
        rawSegments.forEach((segment) => {
          categorySegments.push(segment);
          const key = `${industryId}:${parentId ?? "null"}:${lookupKey(segment)}`;
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
    }

    // Product match key — only resolvable once the category chain
    // resolved. A pending (not-yet-real) category forces a create, same
    // logic as Categories'/Products' own pending-parent handling.
    let mode;
    let existingId = null;
    if (finalCategoryKeyId !== undefined && title) {
      const pathKey = `${industryId}:${categorySegments.map(lookupKey).join(">")}:${lookupKey(title)}`;
      if (seenProductPathKeys.has(pathKey)) {
        rowErrors.push(err(rowNumber, "title", "DUPLICATE_IN_FILE", { column: "title", value: title, otherRow: seenProductPathKeys.get(pathKey) }));
      } else {
        seenProductPathKeys.set(pathKey, rowNumber);
        if (finalCategoryKeyId < 0) {
          mode = "create";
        } else {
          const productKey = `${finalCategoryKeyId}:${lookupKey(title)}`;
          existingId = productIndex.get(productKey) ?? null;
          mode = existingId ? "update" : "create";
        }
      }
    }

    // attribute_value_refs is only processed when has_attributes is TRUE,
    // and only on create — an update never touches product_attributes,
    // same rule as productsValidator.js (no Product Variant orphaning
    // risk). The flag/content mismatches are each caught explicitly rather
    // than silently inferred from blank-ness.
    const refsInput = trimOrUndefined(row.attribute_value_refs);
    const hasAttributes = hasAttributesResult.value;
    const generateVariantsResult = parseBoolean(row.generate_variants, false);
    if (!generateVariantsResult.ok) {
      rowErrors.push(err(rowNumber, "generate_variants", "INVALID_BOOLEAN", { column: "generate_variants", value: row.generate_variants }));
    }
    const generateVariants = generateVariantsResult.value;
    if (generateVariants && !hasAttributes && mode !== "update") {
      rowErrors.push(err(rowNumber, "generate_variants", "GENERATE_VARIANTS_NEEDS_ATTRIBUTES"));
    }

    // attributeValueGroups: [{ attributeTitle, items: [{ valueText, colorCode }] }]
    const attributeValueGroups = [];
    if (mode === "update") {
      if (refsInput || hasAttributes || generateVariants) rowWarnings.push(warn(rowNumber, "attribute_value_refs", "ATTRIBUTES_IGNORED_ON_UPDATE"));
    } else if (hasAttributes && !refsInput) {
      rowErrors.push(err(rowNumber, "has_attributes", "HAS_ATTRIBUTES_BUT_NO_REFS"));
    } else if (!hasAttributes && refsInput) {
      rowWarnings.push(warn(rowNumber, "attribute_value_refs", "ATTRIBUTES_FLAG_OFF_REFS_IGNORED"));
    } else if (hasAttributes && refsInput) {
      const segments = refsInput
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean);
      const seenAttrKeys = new Set();
      segments.forEach((segment) => {
        const eqIndex = segment.indexOf("=");
        if (eqIndex <= 0 || eqIndex === segment.length - 1) {
          rowErrors.push(err(rowNumber, "attribute_value_refs", "ATTRIBUTE_VALUE_REF_FORMAT", { value: segment }));
          return;
        }
        const attributeTitle = segment.slice(0, eqIndex).trim();
        const rawValueList = segment.slice(eqIndex + 1).trim();
        const attrKey = lookupKey(attributeTitle);
        if (seenAttrKeys.has(attrKey)) return; // same attribute named twice in one row — first wins
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
              rowErrors.push(err(rowNumber, "attribute_value_refs", "INVALID_COLOR_CODE", { value: colorCode }));
              formatError = true;
              return;
            }
          }
          parsedItems.push({ valueText, colorCode });
        });
        if (formatError) return;

        const seenValueKeys = new Set();
        const dedupedItems = parsedItems.filter((item) => {
          const key = lookupKey(item.valueText);
          if (seenValueKeys.has(key)) return false; // same value named twice — first wins
          seenValueKeys.add(key);
          return true;
        });

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
        // plain text alone here — the ref text becomes `value`/`value_ar`.
        // A color value's hex (color_code) and an icon value's media are
        // both optional at this point, filled in later via the Attribute
        // Values edit screen; a stray hex on a non-color ref is ignored
        // with a warning (only color uses color_code).
        dedupedItems.forEach(({ valueText, colorCode }) => {
          if (colorCode && attribute.type !== "color") {
            rowWarnings.push(warn(rowNumber, "attribute_value_refs", "COLOR_CODE_IGNORED", { attributeTitle, attributeType: attribute.type }));
          }

          const valueKey = `${attrKey}:${lookupKey(valueText)}`;
          if (!valueIndex.has(valueKey)) {
            valueIndex.set(valueKey, nextPlaceholder--);
          }
        });

        if (dedupedItems.length > 1 && !generateVariants) {
          rowWarnings.push(warn(rowNumber, "attribute_value_refs", "MULTIPLE_VALUES_BUT_GENERATE_VARIANTS_OFF", { attributeTitle }));
        }

        attributeValueGroups.push({ attributeTitle, items: dedupedItems });
      });

      if (!rowErrors.length && generateVariants && attributeValueGroups.length) {
        const combinationCount = attributeValueGroups.reduce((total, group) => total * group.items.length, 1);
        if (combinationCount > MAX_VARIANT_COMBINATIONS) {
          rowErrors.push(
            err(rowNumber, "attribute_value_refs", "TOO_MANY_VARIANT_COMBINATIONS", {
              count: combinationCount,
              max: MAX_VARIANT_COMBINATIONS,
            }),
          );
        }
      }
    }

    if (generateVariants && mode === "update") {
      rowWarnings.push(warn(rowNumber, "generate_variants", "VARIANTS_IGNORED_ON_UPDATE"));
    }

    if (rowErrors.length) {
      errors.push(...rowErrors);
      return;
    }

    warnings.push(...rowWarnings);

    normalizedRows.push({
      rowNumber,
      industry_id: industryId,
      category_segments: categorySegments,
      attribute_value_groups: attributeValueGroups,
      generate_variants: generateVariants && mode !== "update" && attributeValueGroups.length > 0,
      mode,
      existingId,
      title,
      title_ar: titleAr,
      short_description: shortDescription,
      short_description_ar: shortDescriptionAr,
      product_description: productDescription,
      product_description_ar: productDescriptionAr,
      main_media_path: mainImage,
      list_media_path: listImage || mainImage,
      meta_title: metaTitle,
      meta_title_ar: metaTitleAr,
      meta_description: metaDescription,
      meta_description_ar: metaDescriptionAr,
      meta_keywords: metaKeywords,
      meta_keywords_ar: metaKeywordsAr,
      sort_order: sortOrderResult.value,
      is_active: isActiveResult.value,
    });
  });

  return { errors, warnings, normalizedRows };
}

module.exports = { validateProductMain };
