// "Product Main Upload" — one row spans Category (levels) -> Attribute(s) ->
// Attribute Value(s) -> Product -> its SEO meta data, auto-creating
// whichever of those don't already exist. No price column. See
// productMainValidator.js for exactly how attribute/value auto-creation
// handles the three attribute types (text/color/icon), and for how the
// Category/Sub-Category columns and the Attributes/Values columns pair up.
//
// v7: redesigned for a non-technical client — category_path's ">" syntax
// became 3 plain columns, attribute_value_refs's "Attribute=Value" syntax
// became 2 plain columns, has_attributes/generate_variants were dropped
// (inferred from whether the attribute columns are filled in; variants are
// now always generated whenever attribute data is present), and
// main_image/list_image/sort_order/is_active were removed (hardcoded
// defaults — image is added later via the product's edit screen).
//
// v8: added Tags/Specifications (v9: Features too) — comma-separated label
// names (the shared ProductLabels master table, discriminated by type),
// auto-created if missing, attached on create only. See
// productMainValidator.js/importer.js.

module.exports = {
  entity: "product-main",
  sheetName: "Product Main",
  templateVersion: 9,
  model: "Products",
  columns: [
    { key: "industry_slug", header: "industry_slug", required: true, type: "ref", example: "home-interiors" },
    {
      key: "category",
      header: "Category",
      required: true,
      type: "text",
      example: "Flooring",
      notes: "The main category this product belongs to. Created automatically if it doesn't exist yet",
    },
    {
      key: "sub_category_1",
      header: "Sub-Category 1",
      required: false,
      type: "text",
      example: "Vinyl Flooring",
      notes: "Leave blank if this product has no sub-category. Created automatically under Category if it doesn't exist yet",
    },
    {
      key: "sub_category_2",
      header: "Sub-Category 2",
      required: false,
      type: "text",
      example: "",
      notes: "Leave blank if not needed. Only fill this in if Sub-Category 1 is also filled in",
    },
    {
      key: "attribute_names",
      header: "Attributes (e.g. Size, Color)",
      required: false,
      type: "text",
      example: "Size;Color",
      notes: "List each attribute/option this product has, separated by ; . Leave this and the next column blank if this product has no options",
    },
    {
      key: "attribute_values",
      header: "Values for Each Attribute",
      required: false,
      type: "text",
      example: "120cm,140cm;Oak|#8B5A2B,Black|#000000",
      notes:
        "One value-group per attribute listed in the previous column, in the same order, separated by ; . If an attribute has more than one value, separate them with , — a variant is created for every combination (e.g. 2 sizes x 2 colors = 4 variants). To set a brand-new color's hex code, add |#RRGGBB after its value (e.g. Oak|#8B5A2B)",
    },
    {
      key: "features",
      header: "Features",
      required: false,
      type: "text",
      example: "Scratch-Resistant,Easy to Clean",
      notes: "Comma-separated feature names. Created automatically if they don't exist yet. Leave blank for none",
    },
    {
      key: "tags",
      header: "Tags",
      required: false,
      type: "text",
      example: "Bestseller,New Arrival",
      notes: "Comma-separated tag names. Created automatically if they don't exist yet. Leave blank for none",
    },
    {
      key: "specifications",
      header: "Specifications",
      required: false,
      type: "text",
      example: "Waterproof,Eco-Friendly",
      notes: "Comma-separated specification names. Created automatically if they don't exist yet. Leave blank for none",
    },
    { key: "title", header: "title", required: true, type: "text", example: "Standing Desk Pro" },
    { key: "short_description", header: "short_description", required: true, type: "text", example: "" },
    { key: "product_description", header: "product_description", required: true, type: "text", example: "" },
    { key: "meta_title", header: "meta_title", required: true, type: "text", example: "" },
    { key: "meta_description", header: "meta_description", required: true, type: "text", example: "" },
    { key: "meta_keywords", header: "meta_keywords", required: true, type: "text", example: "", notes: "Comma-separated keywords" },
  ],
};
