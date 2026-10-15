const express = require("express");
const router = express.Router();
const ListController = require("../http/modules/projects/ProjectsListController");
const FiltersController = require("../http/modules/projects/ProjectsFiltersController");

router.get("/filters", FiltersController.index);
router.get("/", ListController.index);

module.exports = router;
