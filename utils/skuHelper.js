const { generateSlug, findDuplicate } = require("./slugHelper");

// {PRODUCT_SLUG}-{VALUE_SLUG}-{VALUE_SLUG}..., e.g. "STANDING-DESK-PRO-120CM-OAK".
// `values` are plain objects carrying a `slug` (or `value` as fallback), in
// the product's attribute order, same inputs as the variant label.
const buildSkuBase = (product, values) => {
  const productPart = generateSlug(product?.slug || product?.title, { maxLength: 30 });
  const valueParts = (values || [])
    .map((v) => generateSlug(v?.slug || v?.value, { maxLength: 20 }))
    .filter(Boolean);
  return [productPart, ...valueParts].filter(Boolean).join("-").toUpperCase();
};

// Appends "-2", "-3", ... on collision, same retry shape as generateUniqueSlug.
const generateUniqueSku = async (
  Model,
  base,
  { excludeId, transaction, maxTries = 50 } = {},
) => {
  if (!base) return null;

  let candidate = base;
  let suffix = 1;
  while (suffix <= maxTries) {
    const exists = await findDuplicate(Model, {
      field: "sku",
      value: candidate,
      excludeId,
      transaction,
    });
    if (!exists) return candidate;
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
  return `${base}-${Date.now()}`;
};

module.exports = { buildSkuBase, generateUniqueSku };
