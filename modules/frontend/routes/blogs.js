const express = require("express");
const router = express.Router();
const Controller = require("../http/modules/blogs/BlogsController");

router.get("/page", Controller.page);
router.get("/", Controller.list);
router.get("/:slug/related", Controller.related);
router.get("/:slug", Controller.detail);

module.exports = router;
