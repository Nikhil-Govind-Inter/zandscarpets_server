// Column definition for the Categories sheet. Drives both the validator
// (categoriesValidator.js) and the generated .xlsx template (templates.js),
// so the two can never drift (spec §6).

module.exports = {
  entity: "categories",
  sheetName: "Categories",
  templateVersion: 2, // v2: dropped the manual `slug` column (auto-generated now) and renamed parent_slug -> parent_title
  model: "ProductCategories",
  columns: [
    { key: "title", header: "title", required: true, type: "text", example: "Flooring" },
    { key: "title_ar", header: "title_ar", required: true, type: "text", example: "أرضيات" },
    { key: "industry_slug", header: "industry_slug", required: true, type: "ref", example: "home-interiors" },
    {
      key: "parent_title",
      header: "parent_title",
      required: false,
      type: "ref",
      example: "",
      notes: "The exact title of the parent row (either an existing category or another row above this one in the same file). Blank = root category",
    },
    { key: "description", header: "description", required: false, type: "text", example: "" },
    { key: "description_ar", header: "description_ar", required: false, type: "text", example: "" },
    { key: "material_type", header: "material_type", required: false, type: "text", example: "" },
    { key: "material_type_ar", header: "material_type_ar", required: false, type: "text", example: "" },
    { key: "sort_order", header: "sort_order", required: false, type: "int", min: 1, default: 1, example: "1" },
    { key: "is_active", header: "is_active", required: false, type: "bool", default: true, example: "TRUE" },
    { key: "show_in_navbar", header: "show_in_navbar", required: false, type: "bool", default: false, example: "FALSE" },
  ],
};
