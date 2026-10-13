const { buildBulkUploadRouter } = require("../../bulk-upload/routerFactory");
const Controller = require("../../http/controllers/bulkUpload/attributesController");

module.exports = buildBulkUploadRouter(Controller);
