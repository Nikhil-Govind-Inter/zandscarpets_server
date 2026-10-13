const { models } = require("../../../../../database/models");
const { buildBulkUploadController } = require("../../../bulk-upload/controllerFactory");
const config = require("../../../bulk-upload/config/categories.config");
const { validateCategories } = require("../../../bulk-upload/validators/categoriesValidator");
const { importCategories } = require("../../../bulk-upload/importer");

module.exports = buildBulkUploadController({
  entity: "categories",
  config,
  validateFn: validateCategories,
  importFn: importCategories,
  buildReferenceData: async () => {
    const industries = await models.Industry.findAll({ attributes: ["slug"], where: { is_active: true }, order: [["slug", "ASC"]] });
    const categories = await models.ProductCategories.findAll({ attributes: ["title"], order: [["title", "ASC"]] });
    return {
      "Existing industry slugs": industries.map((i) => i.slug),
      "Existing category titles (for parent_title)": categories.map((c) => c.title),
    };
  },
});
