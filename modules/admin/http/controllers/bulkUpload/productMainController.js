const { models } = require("../../../../../database/models");
const { buildBulkUploadController } = require("../../../bulk-upload/controllerFactory");
const config = require("../../../bulk-upload/config/productMain.config");
const { validateProductMain } = require("../../../bulk-upload/validators/productMainValidator");
const { importProductMain } = require("../../../bulk-upload/importer");

module.exports = buildBulkUploadController({
  entity: "product-main",
  config,
  validateFn: validateProductMain,
  importFn: importProductMain,
  buildReferenceData: async () => {
    const industries = await models.Industry.findAll({ attributes: ["slug"], where: { is_active: true }, order: [["slug", "ASC"]] });
    const categories = await models.ProductCategories.findAll({ attributes: ["title"], order: [["title", "ASC"]] });
    const attributes = await models.Attributes.findAll({ attributes: ["title", "type"], order: [["title", "ASC"]] });
    return {
      "Existing industry slugs": industries.map((i) => i.slug),
      "Existing category titles": categories.map((c) => c.title),
      "Existing attribute titles (type)": attributes.map((a) => `${a.title} (${a.type})`),
    };
  },
});
