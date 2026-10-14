// Column definition for the Categories sheet. Drives both the validator
// (categoriesValidator.js) and the generated .xlsx template (templates.js),
// so the two can never drift (spec §6).

module.exports = {
  entity: "categories",
  sheetName: "Categories",
  templateVersion: 4, // v3: dropped all _ar columns (title_ar/description_ar/material_type_ar) — Arabic fields now default to their English counterpart. v4: dropped industry_slug — categories are no longer tied to an industry.
  model: "ProductCategories",
  columns: [
    { key: "title", header: "title", required: true, type: "text", example: "Flooring" },
    {
      key: "parent_title",
      header: "parent_title",
      required: false,
      type: "ref",
      example: "",
      notes: "The exact title of the parent row (either an existing category or another row above this one in the same file). Blank = root category",
    },
    { key: "description", header: "description", required: false, type: "text", example: "" },
    { key: "material_type", header: "material_type", required: false, type: "text", example: "" },
    { key: "sort_order", header: "sort_order", required: false, type: "int", min: 1, default: 1, example: "1" },
    { key: "is_active", header: "is_active", required: false, type: "bool", default: true, example: "TRUE" },
    { key: "show_in_navbar", header: "show_in_navbar", required: false, type: "bool", default: false, example: "FALSE" },
  ],
};
