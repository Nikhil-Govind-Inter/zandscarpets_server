const { buildBulkUploadRouter } = require("../../bulk-upload/routerFactory");
const Controller = require("../../http/controllers/bulkUpload/productsController");

module.exports = buildBulkUploadRouter(Controller);
