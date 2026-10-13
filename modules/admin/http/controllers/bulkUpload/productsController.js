const { models } = require("../../../../../database/models");
const { buildBulkUploadController } = require("../../../bulk-upload/controllerFactory");
const config = require("../../../bulk-upload/config/products.config");
const { validateProducts } = require("../../../bulk-upload/validators/productsValidator");
const { importProducts } = require("../../../bulk-upload/importer");

module.exports = buildBulkUploadController({
  entity: "products",
  config,
  validateFn: validateProducts,
  importFn: importProducts,
  buildReferenceData: async () => {
    const categories = await models.ProductCategories.findAll({ attributes: ["slug"], order: [["slug", "ASC"]] });
    const attributes = await models.Attributes.findAll({ attributes: ["title"], order: [["title", "ASC"]] });
    return {
      "Existing category slugs": categories.map((c) => c.slug),
      "Existing attribute titles": attributes.map((a) => a.title),
    };
  },
});
