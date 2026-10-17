const express = require("express");
const router = express.Router();
const ListController = require("../http/modules/projects/ProjectsListController");
const PageController = require("../http/modules/projects/ProjectsPageController");
const FiltersController = require("../http/modules/projects/ProjectsFiltersController");

router.get("/page", PageController.index);
router.get("/filters", FiltersController.index);
router.get("/", ListController.index);

module.exports = router;
