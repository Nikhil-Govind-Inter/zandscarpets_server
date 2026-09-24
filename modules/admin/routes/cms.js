const express = require("express");
const Controller = require("../http/controllers/common/CmsOrderStatusController");
const authMiddleware = require("../http/middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware(["admin", "user"]));
router.patch("/:resource/:id/status", Controller.updateStatus);
router.patch("/:resource/:id/sort-order", Controller.updateSortOrder);

module.exports = router;
