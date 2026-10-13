const { buildBulkUploadController } = require("../../../bulk-upload/controllerFactory");
const config = require("../../../bulk-upload/config/attributes.config");
const { validateAttributes } = require("../../../bulk-upload/validators/attributesValidator");
const { importAttributes } = require("../../../bulk-upload/importer");

module.exports = buildBulkUploadController({
  entity: "attributes",
  config,
  validateFn: validateAttributes,
  importFn: importAttributes,
});
