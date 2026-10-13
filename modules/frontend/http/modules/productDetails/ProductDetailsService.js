const { models } = require("../../../../../database/models");
const { BASE_URL } = require("../../../../../constants");
const { resolveVariantDetails, resolveProductDetails } = require("../../../../../services/detailsResolverService");

const backendUrl = `${BASE_URL}/`;
const absoluteUrl = (relativePath) => (relativePath ? `${backendUrl}${relativePath}` : null);

const mediaShape = (item) => {
  if (!item.media) return null;
  return {
    kind: item.media.kind,
    url: absoluteUrl(item.media.location),
    thumbnail_url: absoluteUrl(item.media.thumbnail_location),
    alt_text: item.media.alt_text,
    mime_type: item.media.mime_type,
  };
};

const itemShape = (item) => ({
  id: item.id,
  sort_order: item.sort_order,
  text_content: item.text_content,
  media: mediaShape(item),
});

// Trims the resolver's richer admin-facing shape down to the public
// contract: hidden/empty fields are omitted (the admin needs to see and act
// on those; the public API never should). Kept out of the shared resolver
// itself so one resolver function still serves both callers.
const toPublicFields = (resolvedEntries) =>
  resolvedEntries
    .filter((entry) => entry.items.length > 0)
    .map((entry) => ({
      slug: entry.field.slug,
      name: entry.field.name,
      type: entry.field.type,
      source: entry.source,
      items: entry.items.map(itemShape),
    }));

class ProductDetailsService {
  // Resolves for a variant, or for a bare product if it has no variants /
  // no variant_id was given.
  static async forVariant({ productId, variantId }) {
    const product = await models.Products.findByPk(productId, {
      attributes: ["id"],
      include: [{ model: models.ProductVariants, as: "variants", attributes: ["id"] }],
    });
    if (!product) return null;

    if (variantId) {
      const variant = product.variants.find((v) => v.id === Number(variantId));
      if (!variant) return null;
      const resolved = await resolveVariantDetails({ productId: product.id, variantId: variant.id });
      return toPublicFields(resolved);
    }

    // Either the product has no variants, or none was requested — either
    // way, resolve its own product-level mappings with no variant layer.
    const resolved = await resolveProductDetails({ productId: product.id });
    return toPublicFields(resolved);
  }
}

module.exports = ProductDetailsService;
