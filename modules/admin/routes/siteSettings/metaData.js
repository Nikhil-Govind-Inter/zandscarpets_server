const express = require("express");
const Controller = require("../../http/controllers/SiteSettings/metaDataController");
const authMiddleware = require("../../http/middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware(["admin", "user"]));
router.get("/", Controller.list);
router.get("/:id", Controller.getById);
router.put("/:id", Controller.update);

module.exports = router;
