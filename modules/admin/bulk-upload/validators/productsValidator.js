// Products sheet. Slug uniqueness is GLOBAL (confirmed: no scope in
// productsController.js's style, mirroring productCategoryController.js /
// attributeController.js's unscoped pattern applied to Products). No
// label_slugs column at all — labels/tags/badges are explicitly out of
// scope for bulk upload.

const { generateSlug } = require("../../../../utils/slugHelper");
const { resolveMediaPath } = require("../resolvers");
const { messages } = require("../messages");
const {
  isBlankRow,
  isExampleRow,
  trimOrUndefined,
  parseBoolean,
  parseInteger,
  parseDecimal,
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

  const existingProducts = await models.Products.findAll({ attributes: ["id", "slug"], transaction });
  const existingSlugKeys = new Set(existingProducts.map((p) => lookupKey(p.slug)));

  const liveRows = rows.filter(
    (row) => !isExampleRow(row, config.columns[0].key) && !isBlankRow(row, config.columns),
  );

  const seenSlugKeys = new Map(); // slugKey -> rowNumber

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

    // Slug: an explicit slug must be globally unique (error if taken,
    // matching the manual admin screen). A blank slug is auto-generated
    // from the title with an auto "-2"/"-3" suffix if the base is taken —
    // mirroring generateUniqueSlug()'s behavior, just resolved in-memory
    // against the DB snapshot + rows already claimed earlier in this file,
    // since no writes happen until commit.
    const slugInput = trimOrUndefined(row.slug);
    let slug;
    const isTaken = (key) => seenSlugKeys.has(key) || existingSlugKeys.has(key);
    if (slugInput) {
      slug = generateSlug(slugInput);
      const key = lookupKey(slug);
      if (seenSlugKeys.has(key)) {
        rowErrors.push(err(rowNumber, "slug", "DUPLICATE_IN_FILE", { column: "slug", value: slug, otherRow: seenSlugKeys.get(key) }));
      } else if (existingSlugKeys.has(key)) {
        rowErrors.push(err(rowNumber, "slug", "DUPLICATE_IN_DB", { column: "slug", value: slug }));
      }
    } else if (title) {
      const base = generateSlug(title);
      slug = base;
      let suffix = 1;
      while (isTaken(lookupKey(slug))) {
        suffix += 1;
        slug = `${base}-${suffix}`;
      }
    }

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

    const priceResult = parseDecimal(row.price, { defaultValue: null, min: 0, maxDecimals: 2 });
    if (!priceResult.ok) rowErrors.push(err(rowNumber, "price", "INVALID_NUMBER", { column: "price", value: row.price }));

    // attribute_titles: comma-separated, each must resolve to a known
    // attribute. Order here fixes which attributes the product uses (for
    // product_attributes rows); it has no positional meaning for Variants,
    // which use explicit Attribute=Value pairs instead.
    const attributeTitlesInput = trimOrUndefined(row.attribute_titles);
    const attributeIds = [];
    if (attributeTitlesInput) {
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

    if (rowErrors.length) {
      errors.push(...rowErrors);
      return;
    }

    if (slug) seenSlugKeys.set(lookupKey(slug), rowNumber);
    warnings.push(...rowWarnings);

    normalizedRows.push({
      rowNumber,
      title,
      title_ar: titleAr,
      slug,
      product_category_id: categoryId,
      short_description: shortDescription,
      short_description_ar: shortDescriptionAr,
      product_description: productDescription,
      product_description_ar: productDescriptionAr,
      price: priceResult.value,
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
