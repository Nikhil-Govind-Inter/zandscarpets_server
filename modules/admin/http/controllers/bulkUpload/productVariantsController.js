const { models } = require("../../../../../database/models");
const { buildBulkUploadController } = require("../../../bulk-upload/controllerFactory");
const config = require("../../../bulk-upload/config/productVariants.config");
const { validateProductVariants } = require("../../../bulk-upload/validators/productVariantsValidator");
const { importProductVariants } = require("../../../bulk-upload/importer");

module.exports = buildBulkUploadController({
  entity: "product-variants",
  config,
  validateFn: validateProductVariants,
  importFn: importProductVariants,
  buildReferenceData: async () => {
    const products = await models.Products.findAll({ attributes: ["slug"], order: [["slug", "ASC"]] });
    return { "Existing product slugs": products.map((p) => p.slug) };
  },
});
