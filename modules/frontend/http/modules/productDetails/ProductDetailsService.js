const { models } = require("../../../../../database/models");
const { BASE_URL } = require("../../../../../constants");
const { resolveVariantDetails, resolveProductDetails } = require("../../../../../services/detailsResolverService");

const { toPublicFields } = require("../../traits/detailFieldsPublic");

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
