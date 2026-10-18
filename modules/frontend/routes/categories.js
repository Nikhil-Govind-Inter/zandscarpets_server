const express = require("express");
const router = express.Router();
const Controller = require("../http/modules/categories/CategoriesController");

router.get("/page", Controller.page);
router.get("/", Controller.list);

module.exports = router;
