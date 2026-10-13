// Products sheet — create-or-update (upsert), same pattern as
// Categories/Attributes/Attribute Values.
//
// Match key is (category_id, title) — title alone isn't unique for
// Products (only slug is, and slug isn't part of the identity here),
// mirroring Categories' need for a composite key. As elsewhere, changing a
// row's title (or category_slug) creates a new product rather than
// updating the old one.
//
// No slug column, no price column. Slug is always server-generated via
// generateUniqueSlug (see importer.js) — the manual Products admin form
// was updated to do the same (it used to require an explicit slug; now it
// doesn't have a slug field at all), so bulk upload now matches it exactly,
// the same way Categories/Attributes/Attribute Values already did. Price
// was dropped from the sheet entirely at the user's request.
//
// attribute_titles: confirmed against productsController.js's syncLinks()
// that the manual flow already treats this exactly this way — attribute
// links are only touched when the field is explicitly sent; otherwise
// existing links are left alone, with no variant-safety check either way.
// Bulk upload mirrors this directly: attribute_titles is applied on
// create only. An update never touches product_attributes (and, by
// extension, never risks orphaning existing Product Variants that
// reference those attributes) — a non-blank attribute_titles on an update
// row is flagged as an ignored warning, not applied.

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
const config = require("../config/products.config");

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

async function validateProducts(rows, { models, transaction }) {
  const errors = [];
  const warnings = [];
  const normalizedRows = [];

  const categories = await models.ProductCategories.findAll({ attributes: ["id", "slug"], transaction });
  const categoryBySlugKey = new Map(categories.map((c) => [lookupKey(c.slug), c.id]));

  const attributes = await models.Attributes.findAll({ attributes: ["id", "title"], transaction });
  const attributeByTitleKey = new Map(attributes.map((a) => [lookupKey(a.title), a]));

  const existingProducts = await models.Products.findAll({ attributes: ["id", "title", "product_category_id"], transaction });
  const existingByIdentityKey = new Map(); // `${category_id}:${titleKey}` -> id
  existingProducts.forEach((p) => {
    existingByIdentityKey.set(`${p.product_category_id}:${lookupKey(p.title)}`, p.id);
  });

  const liveRows = rows.filter(
    (row) => !isExampleRow(row, config.columns[0].key) && !isBlankRow(row, config.columns),
  );

  const seenIdentityKeys = new Map(); // identityKey -> rowNumber

  liveRows.forEach((row) => {
    const rowNumber = row.__rowNumber;
    const rowErrors = [];
    const rowWarnings = [];

    const title = trimOrUndefined(row.title);
    if (!title) rowErrors.push(err(rowNumber, "title", "REQUIRED_FIELD", { column: "title" }));

    const titleAr = trimOrUndefined(row.title_ar);
    if (!titleAr) rowErrors.push(err(rowNumber, "title_ar", "REQUIRED_FIELD", { column: "title_ar" }));

    const shortDescription = trimOrUndefined(row.short_description);
    if (!shortDescription) rowErrors.push(err(rowNumber, "short_description", "REQUIRED_FIELD", { column: "short_description" }));

    const shortDescriptionAr = trimOrUndefined(row.short_description_ar);
    if (!shortDescriptionAr) rowErrors.push(err(rowNumber, "short_description_ar", "REQUIRED_FIELD", { column: "short_description_ar" }));

    const productDescription = trimOrUndefined(row.product_description);
    if (!productDescription) rowErrors.push(err(rowNumber, "product_description", "REQUIRED_FIELD", { column: "product_description" }));

    const productDescriptionAr = trimOrUndefined(row.product_description_ar);
    if (!productDescriptionAr) rowErrors.push(err(rowNumber, "product_description_ar", "REQUIRED_FIELD", { column: "product_description_ar" }));

    const categorySlugInput = trimOrUndefined(row.category_slug);
    let categoryId;
    if (!categorySlugInput) {
      rowErrors.push(err(rowNumber, "category_slug", "REQUIRED_FIELD", { column: "category_slug" }));
    } else {
      categoryId = categoryBySlugKey.get(lookupKey(categorySlugInput));
      if (!categoryId) {
        rowErrors.push(err(rowNumber, "category_slug", "REF_NOT_FOUND", { column: "category_slug", value: categorySlugInput }));
      }
    }

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

    const sortOrderResult = parseInteger(row.sort_order, { defaultValue: 0, min: 0 });
    if (!sortOrderResult.ok) rowErrors.push(err(rowNumber, "sort_order", "INVALID_NUMBER", { column: "sort_order", value: row.sort_order }));

    const isActiveResult = parseBoolean(row.is_active, true);
    if (!isActiveResult.ok) rowErrors.push(err(rowNumber, "is_active", "INVALID_BOOLEAN", { column: "is_active", value: row.is_active }));

    // Match key: (category_id, title). Only resolvable once category and
    // title themselves resolved.
    let mode;
    let existingId = null;
    if (categoryId !== undefined && title) {
      const key = `${categoryId}:${lookupKey(title)}`;
      if (seenIdentityKeys.has(key)) {
        rowErrors.push(
          err(rowNumber, "title", "DUPLICATE_IN_FILE", { column: "title", value: title, otherRow: seenIdentityKeys.get(key) }),
        );
      } else {
        seenIdentityKeys.set(key, rowNumber);
        existingId = existingByIdentityKey.get(key) ?? null;
        mode = existingId ? "update" : "create";
      }
    }

    // attribute_titles only applies on create (mirrors the manual
    // controller's syncLinks(): links are only touched when explicitly
    // processed, and an update here never processes them at all, so
    // existing Product Variants that depend on them are never at risk).
    const attributeTitlesInput = trimOrUndefined(row.attribute_titles);
    const attributeIds = [];
    if (mode === "update") {
      if (attributeTitlesInput) {
        rowWarnings.push(warn(rowNumber, "attribute_titles", "ATTRIBUTES_IGNORED_ON_UPDATE"));
      }
    } else if (attributeTitlesInput) {
      attributeTitlesInput.split(",").forEach((rawTitle) => {
        const t = rawTitle.trim();
        if (!t) return;
        const attribute = attributeByTitleKey.get(lookupKey(t));
        if (!attribute) {
          rowErrors.push(err(rowNumber, "attribute_titles", "REF_NOT_FOUND", { column: "attribute_titles", value: t }));
        } else {
          attributeIds.push(attribute.id);
        }
      });
    }

    if (rowErrors.length) {
      errors.push(...rowErrors);
      return;
    }

    warnings.push(...rowWarnings);

    normalizedRows.push({
      rowNumber,
      mode,
      existingId,
      title,
      title_ar: titleAr,
      product_category_id: categoryId,
      short_description: shortDescription,
      short_description_ar: shortDescriptionAr,
      product_description: productDescription,
      product_description_ar: productDescriptionAr,
      attribute_ids: attributeIds,
      main_media_path: mainImage,
      list_media_path: listImage || mainImage,
      sort_order: sortOrderResult.value,
      is_active: isActiveResult.value,
    });
  });

  return { errors, warnings, normalizedRows };
}

module.exports = { validateProducts };
