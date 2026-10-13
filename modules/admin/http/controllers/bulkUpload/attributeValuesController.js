const { models } = require("../../../../../database/models");
const { buildBulkUploadController } = require("../../../bulk-upload/controllerFactory");
const config = require("../../../bulk-upload/config/attributeValues.config");
const { validateAttributeValues } = require("../../../bulk-upload/validators/attributeValuesValidator");
const { importAttributeValues } = require("../../../bulk-upload/importer");

module.exports = buildBulkUploadController({
  entity: "attribute-values",
  config,
  validateFn: validateAttributeValues,
  importFn: importAttributeValues,
  buildReferenceData: async () => {
    const attributes = await models.Attributes.findAll({ attributes: ["title"], order: [["title", "ASC"]] });
    return { "Existing attribute titles": attributes.map((a) => a.title) };
  },
});
