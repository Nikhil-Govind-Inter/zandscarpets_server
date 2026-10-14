const { buildBulkUploadRouter } = require("../../bulk-upload/routerFactory");
const Controller = require("../../http/controllers/bulkUpload/productMainController");

module.exports = buildBulkUploadRouter(Controller);
