const { buildBulkUploadRouter } = require("../../bulk-upload/routerFactory");
const Controller = require("../../http/controllers/bulkUpload/attributeValuesController");

module.exports = buildBulkUploadRouter(Controller);
