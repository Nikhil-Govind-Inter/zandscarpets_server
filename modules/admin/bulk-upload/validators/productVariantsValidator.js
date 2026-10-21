// Product Variants sheet — most complex validator. attribute_value_refs
// uses explicit "Attribute=Value;..." pairs (confirmed decision — not
// positional), matched against the product's own attributes (order-
// independent) and each value checked against that attribute's values.
// combination_key uses the exact same algorithm as
// buildCombinationKey() in variantsController.js so bulk-created variants
// are indistinguishable from manually-created ones.
//
// Each entity validates/commits independently in this synchronous design
// (no combined multi-sheet transaction), so product_slug only needs to
// resolve against already-committed DB products, never an in-file row.

const { resolveMediaPath, buildCombinationKey } = require("../resolvers");
const { messages } = require("../messages");
const {
  isBlankRow,
  isExampleRow,
  trimOrUndefined,
  parseBoolean,
  parseInteger,
  lookupKey,
} = require("./shared");
const config = require("../config/productVariants.config");

const err = (rowNumber, column, code, params) => ({
  row: rowNumber,
  column,
  severity: "error",
  code,
  message: messages[code](params || {}),
});

async function validateProductVariants(rows, { models, transaction }) {
  const errors = [];
  const warnings = [];
  const normalizedRows = [];

  const products = await models.Products.findAll({
    attributes: ["id", "slug"],
    include: [{ model: models.Attributes, as: "attributes", attributes: ["id", "title"], through: { attributes: [] } }],
    transaction,
  });
  const productBySlugKey = new Map(
    products.map((p) => [
      lookupKey(p.slug),
      {
        id: p.id,
        slug: p.slug,
        attributeByTitleKey: new Map(p.attributes.map((a) => [lookupKey(a.title), a])),
        attributeTitles: p.attributes.map((a) => a.title),
      },
    ]),
  );

  const attributeValues = await models.AttributeValues.findAll({ attributes: ["id", "attribute_id", "value", "value_ar", "slug"], transaction });
  const valuesByAttributeId = new Map();
  attributeValues.forEach((v) => {
    const map = valuesByAttributeId.get(v.attribute_id) || new Map();
    map.set(lookupKey(v.value), { id: v.id, value: v.value, value_ar: v.value_ar, slug: v.slug });
    valuesByAttributeId.set(v.attribute_id, map);
  });

  const existingVariants = await models.ProductVariants.findAll({ attributes: ["id", "product_id", "combination_key", "sku"], transaction });
  const existingCombinationKeys = new Map(); // product_id -> Set(combination_key)
  const existingSkuKeys = new Set();
  existingVariants.forEach((v) => {
    const set = existingCombinationKeys.get(v.product_id) || new Set();
    set.add(v.combination_key);
    existingCombinationKeys.set(v.product_id, set);
    if (v.sku) existingSkuKeys.add(lookupKey(v.sku));
  });

  const liveRows = rows.filter(
    (row) => !isExampleRow(row, config.columns[0].key) && !isBlankRow(row, config.columns),
  );

  const seenCombinationKeysInFile = new Map(); // `${product_id}:${combination_key}` -> rowNumber
  const seenSkuKeysInFile = new Map();

  liveRows.forEach((row) => {
    const rowNumber = row.__rowNumber;
    const rowErrors = [];

    const productSlugInput = trimOrUndefined(row.product_slug);
    let product;
    if (!productSlugInput) {
      rowErrors.push(err(rowNumber, "product_slug", "REQUIRED_FIELD", { column: "product_slug" }));
    } else {
      product = productBySlugKey.get(lookupKey(productSlugInput));
      if (!product) {
        rowErrors.push(err(rowNumber, "product_slug", "REF_NOT_FOUND", { column: "product_slug", value: productSlugInput }));
      }
    }

    const refsInput = trimOrUndefined(row.attribute_value_refs);
    const resolvedValues = []; // [{ attributeId, attributeTitle, valueId, valueText }]
    if (!refsInput) {
      rowErrors.push(err(rowNumber, "attribute_value_refs", "REQUIRED_FIELD", { column: "attribute_value_refs" }));
    } else if (product) {
      const seenAttributeIds = new Set();
      const segments = refsInput.split(";").map((s) => s.trim()).filter(Boolean);
      segments.forEach((segment) => {
        const eqIndex = segment.indexOf("=");
        if (eqIndex <= 0 || eqIndex === segment.length - 1) {
          rowErrors.push(err(rowNumber, "attribute_value_refs", "ATTRIBUTE_VALUE_REF_FORMAT", { value: segment }));
          return;
        }
        const attrTitle = segment.slice(0, eqIndex).trim();
        const valueText = segment.slice(eqIndex + 1).trim();

        const attribute = product.attributeByTitleKey.get(lookupKey(attrTitle));
        if (!attribute) {
          rowErrors.push(
            err(rowNumber, "attribute_value_refs", "ATTRIBUTE_NOT_USED_BY_PRODUCT", {
              productSlug: product.slug,
              attributeTitle: attrTitle,
            }),
          );
          return;
        }
        if (seenAttributeIds.has(attribute.id)) return; // duplicate attribute in the ref string — count check below will flag it
        seenAttributeIds.add(attribute.id);

        const value = valuesByAttributeId.get(attribute.id)?.get(lookupKey(valueText));
        if (!value) {
          rowErrors.push(
            err(rowNumber, "attribute_value_refs", "ATTRIBUTE_VALUE_NOT_OWNED", {
              attributeTitle: attrTitle,
              value: valueText,
            }),
          );
          return;
        }

        resolvedValues.push({
          attributeId: attribute.id,
          attributeTitle: attrTitle,
          valueId: value.id,
          valueText: value.value,
          valueTextAr: value.value_ar,
          valueSlug: value.slug,
        });
      });

      if (!rowErrors.length && resolvedValues.length !== product.attributeTitles.length) {
        rowErrors.push(
          err(rowNumber, "attribute_value_refs", "ATTRIBUTE_VALUE_COUNT_MISMATCH", {
            productSlug: product.slug,
            expected: product.attributeTitles,
            got: resolvedValues.length,
          }),
        );
      }
    }

    const skuInput = trimOrUndefined(row.sku);
    if (skuInput) {
      const key = lookupKey(skuInput);
      if (seenSkuKeysInFile.has(key)) {
        rowErrors.push(err(rowNumber, "sku", "DUPLICATE_IN_FILE", { column: "sku", value: skuInput, otherRow: seenSkuKeysInFile.get(key) }));
      } else if (existingSkuKeys.has(key)) {
        rowErrors.push(err(rowNumber, "sku", "DUPLICATE_IN_DB", { column: "sku", value: skuInput }));
      }
    }

    const mediaPath = trimOrUndefined(row.media_path);
    if (mediaPath) {
      const resolved = resolveMediaPath(mediaPath, "product-variants");
      if (!resolved.ok) rowErrors.push(err(rowNumber, "media_path", "MEDIA_NOT_FOUND", { column: "media_path", value: mediaPath }));
    }

    const sortOrderResult = parseInteger(row.sort_order, { defaultValue: 0, min: 0 });
    if (!sortOrderResult.ok) rowErrors.push(err(rowNumber, "sort_order", "INVALID_NUMBER", { column: "sort_order", value: row.sort_order }));

    const isActiveResult = parseBoolean(row.is_active, true);
    if (!isActiveResult.ok) rowErrors.push(err(rowNumber, "is_active", "INVALID_BOOLEAN", { column: "is_active", value: row.is_active }));

    let combinationKey;
    if (product && resolvedValues.length === product.attributeTitles.length && !rowErrors.length) {
      combinationKey = buildCombinationKey(resolvedValues.map((v) => v.valueId));
      const fileKey = `${product.id}:${combinationKey}`;
      if (seenCombinationKeysInFile.has(fileKey)) {
        rowErrors.push(
          err(rowNumber, "attribute_value_refs", "VARIANT_COMBINATION_DUPLICATE", {
            productSlug: product.slug,
            otherRow: seenCombinationKeysInFile.get(fileKey),
          }),
        );
      } else if (existingCombinationKeys.get(product.id)?.has(combinationKey)) {
        rowErrors.push(
          err(rowNumber, "attribute_value_refs", "VARIANT_COMBINATION_DUPLICATE", {
            productSlug: product.slug,
            otherRow: "an existing variant",
          }),
        );
      }
    }

    if (rowErrors.length) {
      errors.push(...rowErrors);
      return;
    }

    if (skuInput) seenSkuKeysInFile.set(lookupKey(skuInput), rowNumber);
    seenCombinationKeysInFile.set(`${product.id}:${combinationKey}`, rowNumber);

    // Matches buildLabel() in variantsController.js exactly — same filter
    // (drop blank/missing values) and the same " / " join — so a
    // bulk-created variant's auto-label looks identical to a manually
    // created one.
    const buildLabel = (field) =>
      resolvedValues
        .map((v) => v[field])
        .filter((v) => v && String(v).trim())
        .join(" / ");
    const label = trimOrUndefined(row.label) || buildLabel("valueText");
    const labelAr = trimOrUndefined(row.label_ar) || buildLabel("valueTextAr");

    normalizedRows.push({
      rowNumber,
      product_id: product.id,
      product_slug: product.slug,
      attribute_value_pairs: resolvedValues.map((v) => ({ attribute_id: v.attributeId, attribute_value_id: v.valueId })),
      attribute_value_slugs: resolvedValues.map((v) => v.valueSlug),
      combination_key: combinationKey,
      label,
      label_ar: labelAr,
      sku: skuInput || null,
      media_path: mediaPath || null,
      sort_order: sortOrderResult.value,
      is_active: isActiveResult.value,
    });
  });

  return { errors, warnings, normalizedRows };
}

module.exports = { validateProductVariants };
