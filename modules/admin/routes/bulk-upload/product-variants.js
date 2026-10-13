const { buildBulkUploadRouter } = require("../../bulk-upload/routerFactory");
const Controller = require("../../http/controllers/bulkUpload/productVariantsController");

module.exports = buildBulkUploadRouter(Controller);
