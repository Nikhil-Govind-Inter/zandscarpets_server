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
    const products = await models.Products.findAll({
      attributes: ["slug"],
      include: [{ model: models.Attributes, as: "attributes", attributes: ["title"], through: { attributes: [] } }],
      order: [["slug", "ASC"]],
    });
    const attributeValues = await models.AttributeValues.findAll({
      attributes: ["value"],
      include: [{ model: models.Attributes, as: "attribute", attributes: ["title"] }],
      order: [[{ model: models.Attributes, as: "attribute" }, "title", "ASC"], ["value", "ASC"]],
    });

    return {
      "Existing product slugs": products.map((p) => p.slug),
      "Product -> attributes it uses": products
        .filter((p) => p.attributes.length)
        .map((p) => `${p.slug}: ${p.attributes.map((a) => a.title).join(", ")}`),
      "Valid Attribute=Value refs": attributeValues
        .filter((v) => v.attribute && v.value)
        .map((v) => `${v.attribute.title}=${v.value}`),
    };
  },
});
