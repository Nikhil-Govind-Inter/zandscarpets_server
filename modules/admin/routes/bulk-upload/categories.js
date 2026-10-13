const { buildBulkUploadRouter } = require("../../bulk-upload/routerFactory");
const Controller = require("../../http/controllers/bulkUpload/categoriesController");

module.exports = buildBulkUploadRouter(Controller);
